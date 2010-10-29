$A.WindowManager = function(){
    return {
        put : function(win){
        	if(!this.cache) this.cache = [];
        	this.cache.add(win)
        },
        getAll : function(){
        	return this.cache;
        },
        remove : function(win){
        	this.cache.remove(win);
        },
        get : function(id){
        	if(!this.cache) return null;
        	var win = null;
        	for(var i = 0;i<this.cache.length;i++){
    			if(this.cache[i].id == id) {
	        		win = this.cache[i];
    				break;      			
        		}
        	}
        	return win;
        },
        getZindex: function(){
        	var zindex = 40;
        	var all = this.getAll();
        	for(var i = 0;i<all.length;i++){
        		var win = all[i];
        		var zd = win.wrap.getStyle('z-index');
        		if(zd =='auto') zd = 0;
        		if(zd > zindex) zindex = zd;       		
        	}
        	return zindex;
        }
    };
}();

$A.Window = Ext.extend($A.Component,{
	constructor: function(config) { 
		if($A.WindowManager.get(config.id))return;
        this.draggable = true;
        this.closeable = true;
        this.modal = config.modal||true;
        this.cmps = {};
        $A.Window.superclass.constructor.call(this,config);
    },
    initComponent : function(config){
    	$A.Window.superclass.initComponent.call(this, config);
    	var sf = this; 
    	$A.WindowManager.put(sf);
    	var windowTpl = new Ext.Template(sf.getTemplate());
    	var shadowTpl = new Ext.Template(sf.getShadowTemplate());
    	sf.width = 1*(sf.width||350);
    	sf.height= 1*(sf.height||400);
        sf.wrap = windowTpl.append(document.body, {title:sf.title,width:sf.width,bodywidth:sf.width-2,height:sf.height,display:Ext.isIE6 ? '' : 'none'}, true);
        sf.shadow = shadowTpl.append(document.body, {display:Ext.isIE6 ? '' : 'none'}, true);
        sf.focusEl = sf.wrap.child('a[atype=win.focus]')
    	sf.title = sf.wrap.child('div[atype=window.title]');
    	sf.head = sf.wrap.child('td[atype=window.head]');
    	sf.body = sf.wrap.child('div[atype=window.body]');
        sf.closeBtn = sf.wrap.child('div[atype=window.close]');
        if(sf.draggable) sf.initDraggable();
        if(!sf.closeable)sf.closeBtn.hide();
        sf.center();
        if(sf.url){
        	sf.showLoading();       
        	sf.load(sf.url,sf.params)
        }
    },
    processListener: function(ou){
    	$A.Window.superclass.processListener.call(this,ou);
    	if(this.closeable) {
    	   this.closeBtn[ou]("click", this.onCloseClick,  this); 
    	   this.closeBtn[ou]("mouseover", this.onCloseOver,  this);
    	   this.closeBtn[ou]("mouseout", this.onCloseOut,  this);
    	   this.closeBtn[ou]("mousedown", this.onCloseDown,  this);
    	}
    	this.wrap[ou]("click", this.toFront, this);
    	this.focusEl[ou]("keydown", this.handleKeyDown,  this);
    	if(this.draggable)this.head[ou]('mousedown', this.onMouseDown,this);
    },
    initEvents : function(){
    	$A.Window.superclass.initEvents.call(this);
    	this.addEvents('close','load');    	
    },
    handleKeyDown : function(e){
		e.stopEvent();
		var key = e.getKey();
		if(key == 27){
			this.close();
		}
    },
    initDraggable: function(){
    	this.head.addClass('item-draggable');
    },
    focus: function(){
		this.focusEl.focus();
	},
    center: function(){
    	var screenWidth = $A.getViewportWidth();
    	var screenHeight = $A.getViewportHeight();
    	var x = Math.max((screenWidth - this.width)/2,0);
    	var y = Math.max((screenHeight - this.height-23)/2,0);
        this.wrap.moveTo(x,y);
        this.wrap.show();
        this.shadow.setWidth(this.wrap.getWidth())
        this.shadow.setHeight(this.wrap.getHeight())
        this.shadow.moveTo(x+3,y+3)
        this.shadow.show();
        this.toFront();
        var sf = this;
        setTimeout(function(){
        	sf.focusEl.focus();
        },10)
    },
    getShadowTemplate: function(){
    	return ['<DIV class="item-shadow" style="display:{display};"></DIV>']
    },
    getTemplate : function() {
        return [
            '<TABLE class="win-wrap" style="width:{width}px;display:{display};" cellSpacing="0" cellPadding="0" border="0">',
			'<TBODY>',
			'<TR style="height:23px;" >',
				'<TD class="win-caption">',
					'<TABLE cellSpacing="0" unselectable="on"  onselectstart="return false;" style="height:23px;-moz-user-select:none;"  cellPadding="0" width="100%" border="0" unselectable="on">',
						'<TBODY>',
						'<TR>',
							'<TD unselectable="on" class="win-caption-label" atype="window.head" width="99%">',
								'<A atype="win.focus" href="#" class="win-fs" tabIndex="-1">&#160;</A><DIV unselectable="on" atype="window.title" unselectable="on">{title}</DIV>',
							'</TD>',
							'<TD unselectable="on" class="win-caption-button" noWrap>',
								'<DIV class="win-close" atype="window.close" unselectable="on"></DIV>',
							'</TD>',
							'<TD><DIV style="width:5px;"/></TD>',
						'</TR>',
						'</TBODY>',
					'</TABLE>',
				'</TD>',
			'</TR>',
			'<TR style="height:{height}px">',
				'<TD class="win-body" vAlign="top" unselectable="on">',
					'<DIV class="win-content" atype="window.body" style="position:relatvie;width:{bodywidth}px;height:{height}px;" unselectable="on"></DIV>',
				'</TD>',
			'</TR>',
			'</TBODY>',
		'</TABLE>'
        ];
    },
    toFront : function(){ 
    	var myzindex = this.wrap.getStyle('z-index');
    	var zindex = $A.WindowManager.getZindex();
    	if(myzindex =='auto') myzindex = 0;
    	if(myzindex < zindex) {
	    	this.wrap.setStyle('z-index', zindex+5);
	    	this.shadow.setStyle('z-index', zindex+4);
	    	if(this.modal) $A.Cover.cover(this.wrap);
    	}
    	$A.focusWindow = this;
    },
    onMouseDown : function(e){
    	var sf = this; 
    	//e.stopEvent();
    	sf.toFront();
    	var xy = sf.wrap.getXY();
    	sf.relativeX=xy[0]-e.getPageX();
		sf.relativeY=xy[1]-e.getPageY();
		sf.screenWidth = $A.getViewportWidth();
        sf.screenHeight = $A.getViewportHeight();
        if(!this.proxy) this.initProxy();
        this.proxy.show();
    	Ext.get(document.documentElement).on("mousemove", sf.onMouseMove, sf);
    	Ext.get(document.documentElement).on("mouseup", sf.onMouseUp, sf);
    },
    onMouseUp : function(e){
    	var sf = this; 
    	Ext.get(document.documentElement).un("mousemove", sf.onMouseMove, sf);
    	Ext.get(document.documentElement).un("mouseup", sf.onMouseUp, sf);
    	if(sf.proxy){
    		sf.wrap.moveTo(sf.proxy.getX(),sf.proxy.getY());
    		sf.shadow.moveTo(sf.proxy.getX()+3,sf.proxy.getY()+3);
	    	sf.proxy.hide();
    	}
    },
    onMouseMove : function(e){
    	e.stopEvent();
    	var sw = this.screenWidth;
    	var sh = this.screenHeight;
    	var tx = e.getPageX()+this.relativeX;
    	var ty = e.getPageY()+this.relativeY;
    	if(tx<=0) tx =0;
    	if((tx+this.width)>= (sw-3)) tx = sw - this.width - 3;
    	if(ty<=0) ty =0;
    	if((ty+this.height)>= (sh-30)) ty = sh - this.height - 30;
    	this.proxy.moveTo(tx,ty);
    },
    showLoading : function(){
    	this.body.update('正在加载...');
    	this.body.setStyle('text-align','center');
    	this.body.setStyle('line-height',5);
    },
    clearLoading : function(){
    	this.body.update('');
    	this.body.setStyle('text-align','');
    	this.body.setStyle('line-height','');
    },
    initProxy : function(){
    	var sf = this; 
    	var p = '<DIV style="display:none;border:1px dashed black;Z-INDEX: 10000; LEFT: 0px; WIDTH: 100%; CURSOR: default; POSITION: absolute; TOP: 0px; HEIGHT: 621px;" unselectable="on"></DIV>'
    	sf.proxy = Ext.get(Ext.DomHelper.append(Ext.getBody(),p));
//    	sf.proxy.hide();
    	var xy = sf.wrap.getXY();
    	sf.proxy.setWidth(sf.wrap.getWidth());
    	sf.proxy.setHeight(sf.wrap.getHeight());
    	sf.proxy.setLocation(xy[0], xy[1]);
    },
    onCloseClick : function(e){
        e.stopEvent();
    	this.close(); 	
    },
    onCloseOver : function(e){
        this.closeBtn.addClass("win-btn-over");
    },
    onCloseOut : function(e){
    	this.closeBtn.removeClass("win-btn-over");
    },
    onCloseDown : function(e){
    	this.closeBtn.removeClass("win-btn-over");
    	this.closeBtn.addClass("win-btn-down");
        Ext.get(document.documentElement).on("mouseup", this.onCloseUp, this);
    },
    onCloseUp : function(e){
    	this.closeBtn.removeClass("win-btn-down");
    	Ext.get(document.documentElement).un("mouseup", this.onCloseUp, this);
    },
    close : function(){
    	$A.WindowManager.remove(this);
    	this.destroy(); 
    	this.fireEvent('close', this)
    },
    destroy : function(){
    	$A.focusWindow = null;
    	var wrap = this.wrap;
    	if(!wrap)return;
    	if(this.proxy) this.proxy.remove();
    	if(this.modal) $A.Cover.uncover(this.wrap);
    	$A.Window.superclass.destroy.call(this);
    	delete this.title;
    	delete this.head;
    	delete this.body;
        delete this.closeBtn;
        delete this.proxy;
        wrap.remove();
        this.shadow.remove();
        var sf = this;
        setTimeout(function(){
        	for(var key in sf.cmps){
        		var cmp = sf.cmps[key];
        		if(cmp.destroy){
        			try{
        				cmp.destroy();
        			}catch(e){
        				alert('销毁window出错: ' + e)
        			}
        		}
        	}
        },10)
    },
    load : function(url,params){
//    	var cmps = $A.CmpManager.getAll();
//    	for(var key in cmps){
//    		this.oldcmps[key] = cmps[key];
//    	}
    	Ext.Ajax.request({
			url: url,
			params:params||{},
		   	success: this.onLoad.createDelegate(this)
		});		
    },
    setChildzindex : function(z){
    	for(var key in this.cmps){
    		var c = this.cmps[key];
    		c.setZindex(z)
    	}
    },
    onLoad : function(response, options){
    	if(!this.body) return;
    	this.clearLoading();
    	var html = response.responseText;
    	var sf = this
    	this.body.update(html,true,function(){
//	    	var cmps = $A.CmpManager.getAll();
//	    	for(var key in cmps){
//	    		if(sf.oldcmps[key]==null){	    			
//	    			sf.cmps[key] = cmps[key];
//	    		}
//	    	}
	    	sf.fireEvent('load',sf)
    	});
    }
});
$A.showMessage = function(title, msg,callback,width,height){
	return $A.showTypeMessage(title, msg, width||300, height||100,'win-info',callback);
}
$A.showWarningMessage = function(title, msg,callback,width,height){
	return $A.showTypeMessage(title, msg, width||300, height||100,'win-warning',callback);
}
$A.showInfoMessage = function(title, msg,callback,width,height){
	return $A.showTypeMessage(title, msg, width||300, height||100,'win-info',callback);
}
$A.showErrorMessage = function(title,msg,callback,width,height){
	return $A.showTypeMessage(title, msg, width||300, height||100,'win-error',callback);
}
$A.showTypeMessage = function(title, msg,width,height,css,callback){
	var msg = '<div class="win-icon '+css+'"><div class="win-type" style="width:'+(width-60)+'px;height:'+(height-58)+'px;">'+msg+'</div></div>';
	return $A.showOkWindow(title, msg, width, height,callback);	
} 
$A.showComfirm = function(title, msg, okfun,cancelfun, width, height){
	width = width||300;
	height = height||100;
    var msg = '<div class="win-icon win-question"><div class="win-type" style="width:'+(width-60)+'px;height:'+(height-58)+'px;">'+msg+'</div></div>';
    return $A.showOkCancelWindow(title, msg, okfun,cancelfun, width, height);  	
}
//$A.hideWindow = function(){
//	var cmp = $A.CmpManager.get('aurora-msg')
//	if(cmp) cmp.close();
//}
//$A.showWindow = function(title, msg, width, height, cls){
//	cls = cls ||'';
//	var cmp = $A.CmpManager.get('aurora-msg')
//	if(cmp == null) {
//		cmp = new $A.Window({id:'aurora-msg',title:title, height:height,width:width});
//		if(msg){
//			cmp.body.update('<div class="'+cls+'" style="height:'+(height-68)+'px;">'+msg+'</div>');
//		}
//	}
//	return cmp;
//}

$A.showOkCancelWindow = function(title, msg, okfun,cancelfun,width, height){
    var cmp = $A.CmpManager.get('aurora-msg-ok-cancel')
    if(cmp == null) {
        var okbtnhtml = $A.Button.getTemplate('aurora-msg-ok','确定');
        var cancelbtnhtml = $A.Button.getTemplate('aurora-msg-cancel','取消');
        cmp = new $A.Window({id:'aurora-msg-ok-cancel',title:title, height:height||100,width:width||300});
        if(msg){
            cmp.body.update(msg+ '<center><table cellspacing="5"><tr><td>'+okbtnhtml+'</td><td>'+cancelbtnhtml+'</td><tr></table></center>',true,function(){
                var okbtn = $("aurora-msg-ok");
                var cancelbtn = $("aurora-msg-cancel");
                cmp.cmps['aurora-msg-ok'] = okbtn;
                cmp.cmps['aurora-msg-cancel'] = cancelbtn;
                okbtn.on('click',function(){
                	if(okfun)okfun.call(this,cmp);
                });
                cancelbtn.on('click',function(){
                    cmp.close()
                	if(cancelfun)cancelfun.call(this,cmp)
                });
            });
        }
    }
    return cmp;
}
$A.showOkWindow = function(title, msg, width, height,callback){
	var cmp = $A.CmpManager.get('aurora-msg-ok');
	if(cmp == null) {
		var btnhtml = $A.Button.getTemplate('aurora-msg-yes','确定');
		cmp = new $A.Window({id:'aurora-msg-ok',title:title, height:height,width:width});
		if(msg){
			cmp.body.update(msg+ '<center>'+btnhtml+'</center>',true,function(){
    			var btn = $("aurora-msg-yes");
                cmp.cmps['aurora-msg-yes'] = btn;
                btn.on('click',function(){
                if(callback)callback.call(this,cmp)
                cmp.close()});
                btn.focus();
			});
		}
	}
	return cmp;
}