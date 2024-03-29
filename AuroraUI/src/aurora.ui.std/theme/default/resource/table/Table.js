(function(A){
var	DOC_EL = document.documentElement,
	EACH = Ext.each,
    IS_EMPTY = Ext.isEmpty,
    FALSE = false,
    TRUE = true,
    NULL = null,
    _ = '_',
	__ = '__',
	___ = '-',
	_O = '.',
	_S = ' ',
	_N = '',
	_K = ']',
	C = '-c',
	U = '-u',
	TD = 'td',
	TR = 'tr',
    NONE = 'none',
	LEFT = 'left',
	DISPLAY = 'display',
	OUTLINE = 'outline',
	OUTLINE_V = '1px dotted blue',
	RECORD_ID = 'recordid',
	ROW_SELECT = 'row-selected',
	REQUIRED = 'required',
	DATA_INDEX = 'dataindex',
    ITEM_NOT_BLANK='item-notBlank',
    ITEM_INVALID = 'item-invalid',
    ROW_ALT = 'table-row-alt',
    TABLE_ROWBOX = 'table-rowbox',
    $TABLE_ROWBOX = _O + TABLE_ROWBOX,//'.table-rowbox'
    TABLE$ROWCHECK = 'table.rowcheck',
    TABLE$ROWRADIO = 'table.rowradio',
    TABLE_CKB = 'table-ckb ',
    TABLE_SELECT_ALL = 'table-select-all',
    MULTIPLE = 'multiple',
    CHECKED_VALUE = 'checkedvalue',
	READONLY = '-readonly',
	DESC = 'desc',
	ASC = 'asc',
	TABLE_DESC = 'table-desc',
    TABLE_ASC = 'table-asc',
    ITEM_CKB = 'item-ckb',
    ITEM_CKB_SELF = ITEM_CKB + '-self',//'item-ckb-self'
    $ITEM_CKB_SELF = _O + ITEM_CKB_SELF,//'.item-ckb-self'
    ITEM_CKB_U = ITEM_CKB + U,//'item-ckb-u'
    ITEM_CKB_C = ITEM_CKB + C,//'item-ckb-c'
    ITEM_CKB_READONLY_U = ITEM_CKB + READONLY + U,//'item-ckb-readonly-u'
    ITEM_CKB_READONLY_C	= ITEM_CKB + READONLY + C,//'item-ckb-readonly-c'
    ITEM_RADIO_IMG = 'item-radio-img',
    ITEM_RADIO_IMG_C = ITEM_RADIO_IMG + C,//'item-radio-img-c'
    ITEM_RADIO_IMG_U = ITEM_RADIO_IMG + U,//'item-radio-img-u'
    ITEM_RADIO_IMG_READONLY_C = ITEM_RADIO_IMG + READONLY + C,//'item-radio-img-readonly-c'
    ITEM_RADIO_IMG_READONLY_U = ITEM_RADIO_IMG + READONLY + U,//'item-radio-img-readonly-c'
    $ITEM_CKB_SELF_S$ITEM_CKB_C = $ITEM_CKB_SELF+ _S + _O +ITEM_CKB_C,//'.item-ckb-self .item-ckb-c'
    TABLE_CELL = 'table-cell',
    TABLE_CELL_EDITOR=TABLE_CELL+'-editor',//'table-cell-editor'
    CELL_CHECK = 'cellcheck',
    ROW_CHECK = 'rowcheck',
    EVT_CLICK = 'click',
    EVT_CELL_CLICK = 'cellclick',
    EVT_RENDER = 'render',
    EVT_ROW_CLICK = 'rowclick',
    EVT_EDITOR_SHOW = 'editorshow',
    EVT_NEXT_EDITOR_SHOW = 'nexteditorshow',
    EVT_KEY_DOWN = 'keydown',
    EVT_SELECT = 'select',
    EVT_MOUSE_DOWN = 'mousedown',
    EVT_RESIZE = 'resize',
    NOT_FOUND = '未找到',
    METHOD = '方法!',
    SELECT_TR_CLASS='tr[class!=grid-hl]',
    SELECT_DIV_ATYPE = 'div[atype=table.headcheck]',
    SELECT_TD_DATAINDEX = 'td[dataindex=',
    sortByGroup = function(datas,colnames,value,_colname){
    	if(colnames.length){
	    	var ret = [],
	    		groups = [],
	    		colname = colnames.shift();
	    	if(Ext.isDefined(value)){
	    		ret.value = value;
	    		ret.colname = _colname;
	    	}
	    	EACH(datas,function(r){
				var v = r.get(colname);
//				if(IS_EMPTY(v)){
//					groups.push(r);
//				}else{
					var	g = findGroup(groups,v);
					if(!g){
						groups.push(g=[]);
						if(IS_EMPTY(v)){
							g.value = namedEmptyGroup(r,colname);
						}else{
							g.value = v;
						}
						g.colname = colname;
					}
					g.push(r);
//				}
			});
			EACH(groups,function(group,index){
				ret.push(sortByGroup(group,[].concat(colnames),group.value,group.colname));
			});
			return ret;
    	}else{
    		return datas;
    	}
    },
    concatGroups = function(groups){
    	var ret = [];
    	EACH(groups,function(group){
    		if(Ext.isArray(group)){
    			ret = ret.concat(concatGroups(group));
    		}else{
    			ret.push(group);
    		}
    	});
    	return ret;
    },
    findGroup = function(groups,value){
    	var group = null;
    	EACH(groups,function(g){
    		if(g.value == value){
    			group = g;
    			return FALSE;
    		}
    	});
    	return group;
    },
    searchGroup = function(groups,value){
    	var group = null;
    	EACH(groups,function(g){
    		if(g.value == value||g.value && (g = searchGroup(g,value))){
    			group = g;
    			return FALSE;
    		}
    	});
    	return group;
    },
    searchRootGroupByRecord = function(groups,record){
		var group = null;
    	EACH(groups,function(g){
    		if(g.value?searchRootGroupByRecord(g,record):g === record){
    			group = g;
    			return FALSE;
    		}
    	});
    	return group;
    },
    removeFromGroup = function(groups,record,owner){
    	EACH(groups,function(g){
    		if(Ext.isArray(g)){
    			removeFromGroup(g,record,groups)
    		}else{
    			groups.remove(record);
    			return FALSE;
    		}
    	});
    	if(groups && !groups.length && owner){
			owner.remove(groups);
		}
    },
    addIntoGroup = function(){
    	function _find(groups,record,_colnames){
    		var find = FALSE,
    		name = _colnames.shift(),
    		value;
    		if(!name){
	    		return record;
	    	}
    		value = record.get(name);
    		if(IS_EMPTY(value)){
    			value = namedEmptyGroup(record,name);
    		}else{
	    		EACH(groups,function(g){
		    		if(Ext.isArray(g)){
		    			if(value == g.value){
			    			find = g;
			    			return FALSE;
			    		}
		    		}
		    	});
    		}
	    	if(!find && name){
	    		find = [];
	    		find.colname = name;
	    		find.value = value;
	    	}
			find.add(_find(find,record,_colnames));	    	
	    	return find;
    	}
	    return function(groups,record,cols){
	    	var _colnames=[];
	    	Ext.each(cols,function(c){
	    		if(c.group){
	    			_colnames.push(c.name);
	    		}
	    	});
	    	groups.add(_find(groups,record,_colnames));
	    	EACH(concatGroups(searchRootGroupByRecord(groups,record)),function(r){
	    		if(r!==record){
	    			var ds = r.ds;
	    			ds[r.isSelected?'select':'unSelect'](record);
	    			return FALSE;
	    		}
	    	});
	    }
    }(),
    namedEmptyGroup = function(r,colname){
    	return '____empty__group__'+r.id+'__'+colname+'___';
    };
	
/**
 * @class Aurora.Table
 * @extends Aurora.Component
 * <p>Table 数据表格布局.
 * @author huazhen.wu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
A.Table = Ext.extend(A.Component,{
    initComponent:function(config){
		A.Table.superclass.initComponent.call(this,config);
		var sf = this,wrap=sf.wrap;
		sf.th = wrap.child('thead tr.table-head');
		sf.tbody=wrap.child('tbody');
		sf.fb=wrap.child('tfoot');
		sf.initTemplate();
	},
	processListener:function(ou){
		var sf = this;
		A.Table.superclass.processListener.call(sf,ou);
		sf.tbody[ou](EVT_CLICK,sf.onClick, sf);
		sf.wrap[ou]("focus",sf.onFocus,sf)
			[ou]("blur",sf.onBlur,sf)
			[ou](Ext.isOpera ? "keypress" : EVT_KEY_DOWN, sf.handleKeyUp,  sf)
            [ou]("keyup", sf.handleKeyUp,  sf)
            [ou](EVT_MOUSE_DOWN, sf.onMouseDown, sf);
		if(sf.canwheel){
			sf.tbody[ou]('mousewheel',sf.onMouseWheel,sf);
		}
		if(sf.th)sf.th[ou](EVT_CLICK,sf.onHeadClick,sf);
		sf[ou](EVT_CELL_CLICK,sf.onCellClick,sf);
	},
	processDataSetLiestener: function(ou){
        var sf = this,ds = sf.dataset;
        if(ds){
	       	ds[ou]('ajaxfailed', sf.onAjaxFailed, sf);
            ds[ou]('metachange', sf.onLoad, sf);
            ds[ou]('update', sf.onUpdate, sf);
            ds[ou]('reject', sf.onUpdate, sf);
            ds[ou]('add', sf.onAdd, sf);
            ds[ou]('submit', sf.onBeforSubmit, sf);
            ds[ou]('submitfailed', sf.onAfterSuccess, sf);
            ds[ou]('submitsuccess', sf.onAfterSuccess, sf);
            ds[ou]('query', sf.onBeforeLoad, sf);
			ds[ou]('load', sf.onLoad, sf);
			ds[ou]('loadfailed', sf.onAjaxFailed, sf);
            ds[ou]('valid', sf.onValid, sf);
            ds[ou]('beforeremove', sf.onBeforeRemove, sf); 
            ds[ou]('remove', sf.onRemove, sf);
            ds[ou]('clear', sf.onLoad, sf);
            ds[ou]('refresh',sf.onLoad,sf);
            ds[ou]('fieldchange', sf.onFieldChange, sf);
            ds[ou]('indexchange', sf.onIndexChange, sf);
            ds[ou]('select', sf.onSelect, sf);
            ds[ou]('unselect', sf.onUnSelect, sf);
            ds[ou]('selectall', sf.onSelectAll, sf);
            ds[ou]('unselectall', sf.onUnSelectAll, sf);
        }
    },
    initEvents:function(){
        A.Table.superclass.initEvents.call(this);
        this.addEvents(
        /**
         * @event render
         * table渲染出数据后触发该事件
         * @param {Aurora.Table} table 当前Table组件.
         */
        EVT_RENDER,
        /**
         * @event cellclick
         * 单元格点击事件.
         * @param {Aurora.Table} table 当前Table组件.
         * @param {Number} row 行号.
         * @param {String} 当前name.
         * @param {Aurora.Record} record 鼠标点击所在单元格的Record对象.
         */
        EVT_CELL_CLICK,
        /**
         * @event rowclick
         * 行点击事件.
         * @param {Aurora.Table} table 当前Table组件.
         * @param {Number} row 行号.
         * @param {Aurora.Record} record 鼠标点击所在行的Record对象.
         */
        EVT_ROW_CLICK,
        /**
         * @event editorShow
         * 编辑器显示后触发的事件.
         * @param {Aurora.Table} table 当前Table组件.
         * @param {Editor} grid 当前Editor组件.
         * @param {Number} row 行号.
         * @param {String} 当前name.
         * @param {Aurora.Record} record 鼠标点击所在行的Record对象.
         */
        EVT_EDITOR_SHOW,
        /**
         * @event nexteditorshow
         * 切换下一个编辑器的事件.
         * @param {Aurora.Table} table 当前table组件.
         * @param {Number} row 行号.
         * @param {String} 当前name.
         */
        EVT_NEXT_EDITOR_SHOW);
    },
	bind:function(ds){
		if(Ext.isString(ds)){
            ds = $(ds);
            if(!ds) return;
        }
        this.dataset = ds;
        this.processDataSetLiestener('on');
        this.onLoad();
	},
	handleKeyUp : function(e){
        if(e.getKey() == 9){
            this.showEditorByRecord();
        }
    },
	initTemplate : function(){
        this.cellTpl = new Ext.Template(['<div style="width:{width}" class="',TABLE_CELL,' {cellcls}" id="',this.id,'_{name}_{',RECORD_ID,'}">{text}</div>']);        
    	this.cbTpl = new Ext.Template(['<center><div class="{cellcls}" id="',this.id,'_{name}_{',RECORD_ID,'}"></div></center>']);
    },
	createRow:function(record,index,isInsert,rowspans,first){
		var sf = this;
		if(Ext.isArray(record)){
    		EACH(record,function(d,i,colname){
    			if(colname = d.colname){
    				rowspans = rowspans||{};
    				rowspans[colname] = concatGroups(d).length;
					rowspans[colname+'_count'] = TRUE;
    			}
    			return sf.createRow(d,index,isInsert,rowspans,!i);
    		});
    	}else{
			var	tr=sf.tbody.dom.insertRow(-1),rowSpan = NULL,found = FALSE,
				css=sf.parseCss(sf.renderRow(record,index));
			tr.id=sf.id+___+record.id;
			tr.style.cssText=css.style;
			Ext.fly(tr).addClass((index%2==1?ROW_ALT+_S:_N)+css.cls)
				.set({_row:record.id});
			EACH(sf.columns,function(col){
				if(col.hidden && col.visiable == FALSE) return;
				var colname,xtype = col.type;
				if(xtype == ROW_CHECK||xtype == 'rowradio'){
					colname = '__rowbox__';
				}else
					colname = col.name;
				rowSpan = rowspans && rowspans[colname];
	            
	            if(!rowSpan||rowspans[colname+'_count'])
					sf.createCell(tr,col,record,rowSpan);
        		if(rowspans && rowspans[colname+'_count'])rowspans[colname+'_count']=FALSE;
			});
			if(isInsert){
				var trs = sf.wrap.query('tbody tr');
		        	for(var i=index+1,l = trs.length;i<l;i++){
						Ext.fly(trs[i]).toggleClass(ROW_ALT)
							.select($TABLE_ROWBOX).each(function(td){
								sf.setSelectStatus(sf.dataset.findById(td.getAttributeNS(_N,RECORD_ID)));
							});
		        	}
			}
    	}
	},
	createEmptyRow:function(){
		var sf = this;
		sf.emptyRow=sf.tbody.dom.insertRow(-1);
		EACH(sf.columns,function(col){
			Ext.fly(sf.emptyRow.insertCell(-1))
				.set({atype:TABLE_CELL,dataindex:col.name})
				.setStyle({'text-align':col.align||LEFT,display:col.hidden?NONE:_N})
				.update('&#160;');
		});
	},
	removeEmptyRow:function(){
		var sf = this;
		if(sf.emptyRow){
			sf.tbody.dom.removeChild(sf.emptyRow);
			sf.emptyRow=NULL;
		}
	},
	getCheckBoxStatus: function(record, name ,readonly) {
        var field = this.dataset.getField(name),
        	cv = field.getPropertity(CHECKED_VALUE),
        	value = record.data[name];
        return ITEM_CKB+(readonly?READONLY:_N)+((value && value == cv) ? C : U);
    },
	createCell:function(tr,col,record,rowspan){
		var sf = this,
			editor = sf.getEditor(col,record),
			xtype = col.type,
			xname = col.name,
			readonly,cls=_N,td;
		if(tr.tagName.toLowerCase()=='tr')td=tr.insertCell(-1);
		else td=Ext.fly(tr).parent(TD).dom
		if(editor!=_N){
        	var edi = A.CmpManager.get(editor);
            if(edi && (edi instanceof A.CheckBox)){
                xtype = CELL_CHECK;
            }else{
                cls = TABLE_CELL_EDITOR;
            }
        }else if(xname && Ext.isDefined(record.getField(xname).get(CHECKED_VALUE))){
    		xtype = CELL_CHECK;
    		readonly=TRUE;
        }
		if(xtype == ROW_CHECK||xtype == 'rowradio'){
			readonly = sf.dataset.execSelectFunction(record)?_N:READONLY;
	    	Ext.fly(td).set({atype:xtype == ROW_CHECK?TABLE$ROWCHECK:TABLE$ROWRADIO,recordid:record.id})
	    		.addClass(TABLE_ROWBOX);
	        td.innerHTML=sf.cbTpl.applyTemplate({cellcls:xtype == ROW_CHECK?TABLE_CKB+ITEM_CKB+readonly+U:'table-radio '+ITEM_RADIO_IMG+readonly+U,name:xname,recordid:record.id});
	    }else{
			Ext.fly(td).set({atype:TABLE_CELL,recordid:record.id,dataindex:xname})
				.setStyle({'text-align':col.align||LEFT,display:col.hidden?NONE:_N});
			if(xtype == CELL_CHECK){
				td.innerHTML=sf.cbTpl.applyTemplate({cellcls:TABLE_CKB + sf.getCheckBoxStatus(record, xname ,readonly),name:xname,recordid:record.id});
			}else{
				var field = record.getMeta().getField(xname);
		        if(field && IS_EMPTY(record.data[xname]) && record.isNew == TRUE && field.get(REQUIRED) == TRUE){
		            cls = cls + _S + ITEM_NOT_BLANK
		        }
				td.innerHTML=sf.cellTpl.applyTemplate({text:sf.renderText(record,col,record.data[xname]),cellcls:cls,name:xname,recordid:record.id,width:col.width+'px'});
			}
		}
		if(rowspan)td.rowSpan = rowspan;
	},
    onSelect : function(ds,record,isSelectAll){
        if(!record||isSelectAll)return;
        var sf = this,
        	cb = Ext.get(sf.id+__+record.id);
        if(cb){
	        cb.parent($TABLE_ROWBOX).addClass(ITEM_CKB_SELF);
	        if(sf.selectionmodel==MULTIPLE) {
	            sf.setCheckBoxStatus(cb, TRUE);
	        }else{
	            sf.setRadioStatus(cb,TRUE);
	            ds.locate((ds.currentPage-1)*ds.pagesize + ds.indexOf(record) + 1)
	        }
            sf.setSelectStatus(record);
        }
        sf.groupselect && EACH(!isSelectAll && concatGroups(searchRootGroupByRecord(sf.groups,record)),function(r){
        	if(r!==record){
    			ds.select(r);
    		}
        });
    },
    onUnSelect : function(ds,record,isSelectAll){
        if(!record||isSelectAll)return;
        var sf = this,
        	cb = Ext.get(sf.id+__+record.id);
        if(cb){
	        cb.parent($TABLE_ROWBOX).addClass(ITEM_CKB_SELF);
	        if(sf.selectionmodel==MULTIPLE) {
	            sf.setCheckBoxStatus(cb, FALSE);
	        }else{
	            sf.setRadioStatus(cb,FALSE);
	        }
            sf.setSelectStatus(record);
        }
        
        sf.groupselect && EACH(!isSelectAll && concatGroups(searchRootGroupByRecord(sf.groups,record)),function(r){
        	if(r!==record){
    			ds.unSelect(r);
    		}
        });
    },
    onSelectAll : function(){
    	var sf = this;
    	sf.clearChecked();
    	sf.isSelectAll = TRUE;
    	sf.isUnSelectAll = FALSE;
    	sf.wrap.addClass(TABLE_SELECT_ALL);
    },
    onUnSelectAll : function(){
    	var sf = this;
    	sf.clearChecked();
    	sf.isSelectAll = FALSE;
    	sf.isUnSelectAll = TRUE;
    	sf.wrap.removeClass(TABLE_SELECT_ALL);
    },
    clearChecked : function(){
    	var w = this.wrap;
		w.select($ITEM_CKB_SELF_S$ITEM_CKB_C).replaceClass(ITEM_CKB_C,ITEM_CKB_U);
		w.select($ITEM_CKB_SELF).removeClass(ITEM_CKB_SELF);
    },
    setRadioStatus: function(el, checked){
        if(!checked){
            el.removeClass(ITEM_RADIO_IMG_C).addClass(ITEM_RADIO_IMG_U);
        }else{
            el.addClass(ITEM_RADIO_IMG_C).removeClass(ITEM_RADIO_IMG_U);
        }
    },
    setCheckBoxStatus: function(el, checked){
        if(!checked){
            el.removeClass(ITEM_CKB_C).addClass(ITEM_CKB_U);
        }else{
            el.addClass(ITEM_CKB_C).removeClass(ITEM_CKB_U);
        }
    },
    setSelectDisable:function(el,record){
    	var flag = this.dataset.selected.indexOf(record) == -1;
    	if(this.selectionmodel==MULTIPLE){
    		el.removeClass([ITEM_CKB_C,ITEM_CKB_U])
    			.addClass(flag?ITEM_CKB_READONLY_U:ITEM_CKB_READONLY_C);
    	}else{
    		el.removeClass([ITEM_RADIO_IMG_C,ITEM_RADIO_IMG_U,ITEM_RADIO_IMG_READONLY_C,ITEM_RADIO_IMG_READONLY_U])
            	.addClass(flag?ITEM_RADIO_IMG_READONLY_U:ITEM_RADIO_IMG_READONLY_C);
    	}
    },
    setSelectEnable:function(el,record){
    	var flag = this.dataset.selected.indexOf(record) == -1;
    	if(this.selectionmodel==MULTIPLE){
    		el.removeClass([ITEM_CKB_READONLY_U,ITEM_CKB_READONLY_C])
    			.addClass(flag?ITEM_CKB_U:ITEM_CKB_C);
    	}else{
            el.removeClass([ITEM_RADIO_IMG_U,ITEM_RADIO_IMG_C,ITEM_RADIO_IMG_READONLY_U,ITEM_RADIO_IMG_READONLY_C])
    			.addClass(flag?ITEM_RADIO_IMG_U:ITEM_RADIO_IMG_C);
    	}	
    },
    setSelectStatus:function(record){
    	var sf = this,ds = sf.dataset;
    	if(ds.selectfunction){
	    	var cb = Ext.get(sf.id+__+record.id);
	    	if(!ds.execSelectFunction(record)){
	    		 sf.setSelectDisable(cb,record)
	    	}else{
	    		 sf.setSelectEnable(cb,record);
	    	}
    	}
    },
    onHeadClick : function(e,t){
    	var sf = this,
    		ds = sf.dataset;
    	t = Ext.get(t);
    	if(t.is(SELECT_DIV_ATYPE)){
	        var checked = t.hasClass(ITEM_CKB_C);
	        sf.setCheckBoxStatus(t,!checked);
	        if(!checked){
	            ds.selectAll();
	        }else{
	            ds.unSelectAll();
	        }
    	}else if(t.is('.table-hc')){
    		var index = t.getAttributeNS(_N,DATA_INDEX),
                col = sf.findColByName(index);
            if(col && col.sortable === TRUE){
                if(ds.isModified()){
                    A.showInfoMessage('提示', '有未保存数据!');
                    return;
                }
                var ot = _N;
                if(sf.currentSortTarget){
                    sf.currentSortTarget.removeClass([TABLE_ASC,TABLE_DESC]);
                }
                sf.currentSortTarget = t;
                if(IS_EMPTY(col.sorttype)) {
                    col.sorttype = DESC
                    t.removeClass(TABLE_ASC).addClass(TABLE_DESC);
                    ot = DESC;
                } else if(col.sorttype == DESC){
                    col.sorttype = ASC;
                    t.removeClass(TABLE_DESC).addClass(TABLE_ASC);
                    ot = ASC;
                }else {
                    col.sorttype = _N;
                    t.removeClass([TABLE_DESC,TABLE_ASC]);
                }
                ds.sort(index,ot);
            }
    	}
    },
	/**
     * 设置当前行的编辑器.
     * 
     * @param {String} name 列的name.
     * @param {String} editor 编辑器的id. ''空表示没有编辑器.
     */
    setEditor: function(name,editor){
        var sf = this,col = sf.findColByName(name),
        	div = Ext.get([sf.id,name,sf.selectedId].join(_));
        col.editor = editor;
        if(div){
        	sf.focusdiv = div;
        	if(editor == _N){
            	div.removeClass(TABLE_CELL_EDITOR)
            }else if(!$(editor) instanceof A.CheckBox){
            	div.addClass(TABLE_CELL_EDITOR)
            }
        }
    },
	getEditor : function(col,record){
        var ed = col.editor||_N;
        if(col.editorfunction) {
            var ef = window[col.editorfunction];
            if(ef==NULL) {
                alert(NOT_FOUND+col.editorfunction+METHOD) ;
                return NULL;
            }
            ed = ef.call(window,record,col.name)||_N;
        }
        return ed;
    },
     /**
     * 显示编辑器.
     * @param {Number} row 行号
     * @param {String} name 当前列的name.
     */
    showEditor : function(row, name,callback){   
        if(row == -1)return;
        var sf = this,col = sf.findColByName(name);
        if(!col)return;
        var ds = sf.dataset,record = ds.getAt(row);
        if(!record)return;
        if(record.id != sf.selectedId) sf.selectRow(row);
        var editor = sf.getEditor(col,record);
        sf.setEditor(name, editor);
        if(editor!=_N){
        	var ed = $(editor);
            (function(){
            	var v = record.get(name),
                	dom = Ext.get([sf.id,name,record.id].join(_)),
                	xy = dom.getXY(),ced;
                ed.bind(ds, name);
                ed.render(record);
//                if(Ext.isIE)ed.processListener('un');
        		ed.el.on(EVT_KEY_DOWN, sf.onEditorKeyDown,sf);
//        		if(Ext.isIE)ed.processListener('on');
                Ext.fly(DOC_EL).on(EVT_MOUSE_DOWN, sf.onEditorBlur, sf);
                ced = sf.currentEditor = {
                    record:record,
                    ov:v,
                    name:name,
                    editor:ed
                };
       			sf.positionEditor();
                if(ed instanceof A.CheckBox){
//	        		ed.move(xy[0],xy[1]-4);
                	var _begin = sf._begin;
                	if(_begin){
                		var _begin_index = ds.indexOf(_begin),_end_index = ds.indexOf(record);
                		if(_begin_index > _end_index){
                			var t = _end_index;
                			_end_index = _begin_index;
                			_begin_index = t;
                		}
            			_end_index++
                		for(;_begin_index<_end_index;_begin_index++){
                			ds.getAt(_begin_index).set(name,_begin.get(name));
                		}
                		delete sf._begin;
                	}else{
			        	if(callback)
			        		ed.focus()
			        	else
			        		ed.onClick();
                	}
//		        	ced.focusCheckBox = dom;
//	        		dom.setStyle(OUTLINE,OUTLINE_V);
	       		}else{
	       			if(ed instanceof A.Field && !ed instanceof A.TextArea){
                        ed.el.setStyle('text-align',col.align||LEFT)
                    }else if(ed instanceof A.Lov){
                    	ed.on('fetching',sf.onFetching,sf);
                    }
                    ed.isEditor = TRUE;
                    ed.isFireEvent = TRUE;
                    ed.isHidden = FALSE;
                    ed.focus();
                    if(ed.wrap && !ed.wrap.hasClass('grid-editor')) ed.wrap.addClass('grid-editor');
                    ed.on(EVT_SELECT,sf.onEditorSelect,sf);
                    if(Ext.isFunction(callback))callback(ed);
	                sf.fireEvent(EVT_EDITOR_SHOW, sf, ed, row, name, record);
       			}
   				sf.editing = TRUE;
                Ext.fly(window).on(EVT_RESIZE, sf.positionEditor, sf);
            }).defer(10);
        }           
    },
    showEditorByRecord : function(record){
    	var sf = this,
    		ds = sf.dataset,
    		row = record?ds.indexOf(record):0;
    	record = record||ds.getAt(0);
    	EACH(sf.columns,function(col){
    		if(col.hidden !=TRUE && sf.getEditor(col,record)!=_N){
    			sf.fireEvent(EVT_CELL_CLICK, sf, row, col.name, record,function(){});
        		sf.fireEvent(EVT_ROW_CLICK, sf, row, record);
                return FALSE;
            }
        });
    },
    onEditorSelect : function(){
		(function(){this.hideEditor()}).defer(1,this);
    },
    onEditorKeyDown : function(e,editor){
        var sf = this,
        	keyCode = e.keyCode
        	ced = sf.currentEditor;
        //esc
        if(keyCode == 27) {
            if(ced){
                var ed = ced.editor;
                if(ed){
	                ed.clearInvalid();
	                ed.render(ed.binder.ds.getCurrentRecord());
                }
            }
            sf.hideEditor();
        }else
        //enter
        if(keyCode == 13) {
        	if(!(ced && ced.editor && ced.editor instanceof A.TextArea)){
	            sf.showEditorBy(39);
        	}
        }else
        //tab
        if(keyCode == 9){
            e.stopEvent();
            sf.showEditorBy(e.shiftKey?37:39);
        }else
        //37-->left 38-->up 39-->right 40-->down
        if(e.ctrlKey && (keyCode == 37||keyCode == 38 || keyCode == 39 || keyCode == 40)){
            sf.showEditorBy(keyCode);
            e.stopEvent();
        }
    },
    findEditorBy : function(dir){
        var sf = this,ced,ed;
        if((ced = sf.currentEditor) && (ed = ced.editor)){
            var cls = sf.columns,
                find = FALSE,
                ds = sf.dataset,
                fname = ed.binder.name,r = ed.record,
                row = ds.data.indexOf(r),
                name=NULL,hasAutoAppend = FALSE,
                forward = TRUE,updown = FALSE,col;
            if(row!=-1){
                if(dir == 37 || dir == 38){
                    cls = [].concat(cls).reverse();
                    forward = FALSE;
                }
                if(dir == 38 || dir == 40){
                    updown = TRUE;
                    col = sf.findColByName(fname);
                }
                while(r){
                    if(!updown){
                        EACH(cls,function(col){
                            if(find){
                                if(col.hidden !=TRUE && sf.getEditor(col,r)!=_N){
                                    name = col.name;
                                    return FALSE;
                                }
                            }else{
                                if(col.name == fname){
                                    find = TRUE
                                }
                            }
                        });
                    }
                    if(name){
                        return {
                            row : row,
                            name : name,
                            record : r
                        }   
                    }
                    r = ds.getAt(forward?++row:--row);
                    if(forward && !r && !hasAutoAppend && sf.autoappend !== FALSE){
                        sf.hideEditor();
                        ds.create();
                        r = ds.getAt(row);
                        hasAutoAppend = TRUE;
                    }
                    if(updown && r && sf.getEditor(col,r)!=_N){
                        name = fname;
                    }
                }
            }
        }
        return NULL;
    },
    showEditorBy : function(dir){
        var sf = this,
            callback = TRUE,
//            function(e){
//                  if(e instanceof A.Lov){
//                      e.showLovWindow();
//                  }
//            },
            ed = sf.findEditorBy(dir);
        if(ed){
            sf.hideEditor();
            var row = ed.row,record = ed.record;
            sf.fireEvent(EVT_CELL_CLICK, sf, row, ed.name, record ,callback);   
            sf.fireEvent(EVT_ROW_CLICK, sf, row, record);
        }
    },
    positionEditor:function(){
    	var sf = this,
    		ed=sf.currentEditor.editor,dom=sf.focusdiv,xy = dom.getXY();
		if(ed instanceof A.CheckBox){
    		ed.move(xy[0],xy[1]-3);
		}else{
	        ed.setHeight(dom.getHeight()-2);
	        ed.setWidth(dom.getWidth()-5<22?22:(dom.getWidth()-5));
	        ed.move(xy[0],xy[1]);
		}
        if(ed.isExpanded&&ed.isExpanded()){
        	if(Ext.isIE){
        		if(sf.t)clearTimeout(sf.t);
	        	sf.t=(function(){
	        		ed.syncPopup();
	        	}).defer(1);
        	}else{
        		ed.syncPopup();	
        	}
        }
    },
    /**
     * 隐藏当前编辑器
     */
    hideEditor : function(){
    	var sf = this,ced = sf.currentEditor;
        if(ced){
            var ed = ced.editor;
            if(ed){
	            if(!ed.canHide || ed.canHide()) {
	                ed.el.un(EVT_KEY_DOWN, sf.onEditorKeyDown,sf);
	                ed.un(EVT_SELECT,sf.onEditorSelect,sf);
	                Ext.fly(DOC_EL).un(EVT_MOUSE_DOWN, sf.onEditorBlur, sf);
	                Ext.fly(window).un(EVT_RESIZE, sf.positionEditor, sf);
	                ed.move(-10000,-10000);
	                var view = ed.autocompleteview;
                    if(view)view.hide();
                    ed.blur();
                    ed.onBlur();
	                ed.isFireEvent = FALSE;
	                ed.isHidden = TRUE;
	                sf.editing = FALSE;
	                if(ed.collapse)ed.collapse();
	            }
            }
        }
    },
        /**
     * 选中高亮某行.
     * @param {Number} row 行号
     */
    selectRow : function(row, locate){
        var sf = this,
        	ds = sf.dataset,record = ds.getAt(row),
        	r = (ds.currentPage-1)*ds.pagesize + row+1,
            records = concatGroups(searchRootGroupByRecord(sf.groups,record));
        sf.selectedId = record.id;
        if(sf.selectTr)sf.selectTr.removeClass(ROW_SELECT);
        sf.selectTr = sf.tbody.select(records.map(function(r){return '#'+sf.id+___+r.id}).join(','))//Ext.get(sf.id+___+record.id);
        if(sf.selectTr)sf.selectTr.addClass(ROW_SELECT);
        //sf.focusRow(row);
        if(locate!==FALSE && r != NULL) {
//          sf.dataset.locate(r);
            ds.locate.defer(5, ds,[r,FALSE]);
        }
    },
     drawFootBar : function(objs){
     	var sf = this;
    	if(!sf.fb) return;
    	EACH([].concat((objs) ? objs : sf.columns), function(obj) {
    		var col = Ext.isString(obj) ? sf.findColByName(obj) : obj;
            if(col&&col.footerrenderer){
                var fder = A.getRenderer(col.footerrenderer);
                if(fder == NULL){
                    alert(NOT_FOUND+col.footerrenderer+METHOD)
                    return;
                }
                var name = col.name,
                	v = fder.call(window,sf.dataset.data, name);
                if(!IS_EMPTY(v)){
	                sf.fb.child(SELECT_TD_DATAINDEX+name+_K).update(v)
                }
            }
    	});
    },
    showColumn : function(name){
        var col = this.findColByName(name);
        if(col){
            if(col.hidden === TRUE){
                delete col.hidden;
                this.wrap.select(SELECT_TD_DATAINDEX+name+_K).setStyle(DISPLAY,_N);
            }
        }   
    },
    /**
     * 隐藏某列.
     * 
     * @param {String} name 列的name;
     */
    hideColumn : function(name){
        var col = this.findColByName(name);
        if(col){
            if(col.hidden !== TRUE){
            	this.wrap.select(SELECT_TD_DATAINDEX+name+_K).setStyle(DISPLAY,NONE);
                col.hidden = TRUE;
            }
        }       
    },
    /**
     * 根据列的name获取列配置.
     * 
     * @param {String} name 列的name
     * @return {Object} col 列配置对象.
     */
    findColByName : function(name){
    	var r;
    	if(name){
    		EACH(this.columns,function(c){
    			if(c.name && c.name.toLowerCase() === name.toLowerCase()){
	                r = c;
	                return FALSE;
	            }
    		});
    	}
        return r;
    }, 
    parseCss:function(css){
    	var style=_N,cls=_N;
    	if(Ext.isArray(css)){
    		for(var i=0;i<css.length;i++){
    			var _css=this.parseCss(css[i]);
    			style+=';'+_css.style;
    			cls+=_S+_css.cls;
    		}
    	}else if(Ext.isString(css)){
    		var isStyle=!!css.match(/^([^,:;]+:[^:;]+;)*[^,:;]+:[^:;]+;*$/);
    		cls=isStyle?_N:css;
			style=isStyle?css:_N;
    	}
    	return {style:style,cls:cls}
    	
    },
	renderText : function(record,col,value){
        var renderer = col.renderer;
        if(renderer){//&&!IS_EMPTY(value)  去掉对value是否为空的判断
            var rder = A.getRenderer(renderer);
            if(rder == NULL){
                alert(NOT_FOUND+renderer+METHOD)
                return value;
            }
            value = rder.call(window,value,record, col.name);
        }
        return IS_EMPTY(value)? '&#160;' : value;
    },
    renderRow : function(record,rowIndex){
    	var renderer = this.rowrenderer,css=NULL;
        if(renderer){
            var rder = A.getRenderer(renderer);
            if(rder == NULL){
                alert(NOT_FOUND+renderer+METHOD)
                return css;
            }
            css = rder.call(window,record, rowIndex);
            return !css? _N : css;
        }
        return css ;
    },
    renderEditor : function(div,record,c,editor){
    	this.createCell(div.dom,c,record);
    	//div.parent().update(cell);
    },
    onClick : function(e,t) {
        var sf = this,
        	isTd = (t=Ext.fly(t)).dom.tagName.toLowerCase() == TD ,
        	target = isTd?t:t.parent(TD);
        if(target){
            var atype = target.getAttributeNS(_N,'atype'),
            	rid = target.getAttributeNS(_N,RECORD_ID),
            	ds = sf.dataset;
            if(atype==TABLE_CELL){
                var record = ds.findById(rid),
                	row = ds.indexOf(record),
                	name = target.getAttributeNS(_N,DATA_INDEX);
                sf.fireEvent(EVT_CELL_CLICK, sf, row, name, record,!t.hasClass('table-ckb'));
//                sf.showEditor(row,name);
                sf.fireEvent(EVT_ROW_CLICK, sf, row, record);
            }else if(atype==TABLE$ROWCHECK){               
                var cb = Ext.get(sf.id+__+rid);
                if(cb.hasClass(ITEM_CKB_READONLY_U)||cb.hasClass(ITEM_CKB_READONLY_C))return;
                if(sf.isSelectAll && !cb.parent($ITEM_CKB_SELF)){
                	cb.replaceClass(ITEM_CKB_U,ITEM_CKB_C);	
                }else if(sf.isUnselectAll && !cb.parent($ITEM_CKB_SELF)){
            		cb.replaceClass(ITEM_CKB_C,ITEM_CKB_U);	
                }
                cb.hasClass(ITEM_CKB_C) ? ds.unSelect(rid) : ds.select(rid);
            }else if(atype==TABLE$ROWRADIO){
            	var cb = Ext.get(sf.id+__+rid);
                if(cb.hasClass(ITEM_RADIO_IMG_READONLY_U)||cb.hasClass(ITEM_RADIO_IMG_READONLY_C))return;
                ds.select(rid);
            }
        }
    },
    onCellClick : function(grid,row,name,record,callback){
    	this.showEditor(row,name,callback);
    },
    onUpdate : function(ds,record, name, value , oldvalue){
    	var sf = this,
    		c = sf.findColByName(name),
        	div,ediv;
    	if(c && c.group){
        	record.data[name] = oldvalue;
        	var index = sf.tbody.query(SELECT_TR_CLASS).indexOf(sf.tbody.child('tr[_row='+record.id+']').dom);
        	sf.onRemove(ds,record);
        	record.data[name] = value;
        	sf.onAdd(ds,record,index,FALSE);
        	!IS_EMPTY(oldvalue) && EACH(concatGroups(searchGroup(sf.groups,oldvalue)),function(r){
        		if(r!==record){
        			r.set(name,value);
        		}
        	});
        	sf.selectRow(sf.dataset.indexOf(record));
        }
        if(div=Ext.get([sf.id,name,record.id].join(_))){
            var c = sf.findColByName(name),
            	editor = sf.getEditor(c,record);            
            if(editor!=_N && ($(editor) instanceof A.CheckBox)){
            	sf.renderEditor(div,record,c,editor);
            }else{
            	//考虑当其他field的值发生变化的时候,动态执行其他带有renderer的
                div.update(sf.renderText(record,c, value));
            }
        }
        EACH(sf.columns,function(c){
        	if(c.name != name && (ediv= Ext.get([sf.id,c.name,record.id].join(_)))) {
        		if(c.editorfunction){
                    sf.renderEditor(ediv,record, c, sf.getEditor(c,record));
        		}
                if(c.renderer){
                    ediv.update(sf.renderText(record,c, record.get(c.name)));
                }
            }
        });
        sf.setSelectStatus(record);
        sf.drawFootBar(name);
    },
    onLoad:function(){
    	var sf = this,
    		wrap = sf.wrap,
    		data = sf.dataset.data,
        	cb = wrap.removeClass(TABLE_SELECT_ALL).child(SELECT_DIV_ATYPE);
    	sf.clearBody();
        sf.processGroups();
        if(cb && sf.selectable && sf.selectionmodel==MULTIPLE)sf.setCheckBoxStatus(cb,FALSE);
    	var l=data.length;
    	if(l==0)sf.createEmptyRow();
		else sf.renderArea();
        sf.drawFootBar();
        A.Masker.unmask(wrap);
        sf.fireEvent(EVT_RENDER,sf)
	},
    processGroups : function(){
    	var sf = this,
    		ds = sf.dataset,
    		colnames=[];
		sf.groups = [].concat(ds.getAll());
    	Ext.each(sf.columns,function(col){
			col.group && colnames.push(col.name);
		});
		if(colnames.length){
			//ds.data = 
				concatGroups(sf.groups = sortByGroup(sf.groups,colnames));
		}
    },
    renderArea : function(){
    	var sf = this;
    	EACH(sf.groups,function(d,i){
        	var rowspans;
        	if(d.colname){
				rowspans = {};
				rowspans[d.colname] = concatGroups(d).length;
				rowspans[d.colname+'_count'] = TRUE;
				if(sf.groupselect){
					rowspans['__rowbox__'] = rowspans[d.colname];
					rowspans['__rowbox___count'] = rowspans[d.colname+'_count'];
				}
			}
            sf.createRow(d, i, false,rowspans,!i);
        },sf);
//		for(var i=0;i<l;i++){
//            sf.createRow(data[i],i);
//        }
    },
	onValid : function(ds, record, name, valid){
        var c = this.findColByName(name);
        if(c){
            var div = Ext.get([this.id,name,record.id].join(_));
            if(div) {
                if(valid == FALSE){
                    div.addClass(ITEM_INVALID);
                }else{
                    div.removeClass([ITEM_NOT_BLANK,ITEM_INVALID]);
                }
            }
        }
    },
    onAdd : function(ds,record,row){
    	var sf = this,
    		__row = row,
        	columns = sf.columns,
            groups = sf.groups,
        	glength = groups.length,
        	dlength = ds.data.length,
            css = sf.parseCss(sf.renderRow(record,row)),
            cls = ((glength == dlength?row:glength) % 2==0 ? _N : ROW_ALT);
    	addIntoGroup(groups,record,columns);
    	sf.removeEmptyRow();
    	var utr = Ext.get(document.createElement(TR)),
    		tbody = sf.tbody;
        utr.set({
        	id:sf.id+___+record.id,
        	style:css.style,
        	_row:record.id
    	});
        EACH(columns,function(col){
            if(col.hidden && col.visiable == FALSE) return TRUE;
            var colname = col.name,
            	find = FALSE;
            if(col.group){
            	var allRow = 0;
            	tbody.select(SELECT_TD_DATAINDEX+colname+_K).each(function(td,tds){
            		var _r = sf.dataset.findById(td.parent(TR).getAttributeNS(_N,'_row')),
            			value = record.get(colname);
        			if(_r && !IS_EMPTY(value) && _r.get(colname) == value){
        				var _groups = searchGroup(groups,value),
        					rowspan = concatGroups(_groups).length;
        				allRow+=rowspan;
        				td.dom.rowSpan = rowspan;//Fixed for IE7
        				find = TRUE;
        				row = allRow-1;
        				cls = td.parent(TR).hasClass(ROW_ALT)?ROW_ALT:_N;
        				if(groups.indexOf(_groups)!=-1 && columns[0].type){
        					tbody.query('td[recordid='+_r.id+']:first')[0].rowSpan = rowspan;
        					if(record!==_r){
        						utr.select('td[recordid='+record.id+']:first').remove();
        					}
        				}
        				return FALSE;
        			}else{
        				allRow+=td.dom.rowSpan;
        			}
            	});
            	if(!find){
            		row = __row;
            	}
            }
            if(find) return;
            sf.createCell(utr.dom,col,record);
        })
        utr.addClass(cls+_S+css.cls);
        if(row === dlength-1){
            tbody.appendChild(utr);
        }else{
        	var filter = function(el,i){
	            	if(i<row)return FALSE;
	            },
                trs = tbody.select(SELECT_TR_CLASS).filter(filter),
            	tr = trs.item(0),
            	needToggleClass = (tr && cls == (tr.hasClass(ROW_ALT)?ROW_ALT:_N)),
            	root = searchRootGroupByRecord(record);
        	utr.insertBefore(tr);
            needToggleClass && setTimeout(function(){
            	filter = function(tr){
                	if(searchRootGroupByRecord(ds.findById(tr.getAttributeNS(_N,'_row'))) === root)
                		return FALSE;
                };
            	trs.filter(filter).toggleClass(ROW_ALT);
            },1);//Fixed for IE9
        }
        //sf.createRow(record,index,index !== ds.data.length-1);
        sf.selectRow(ds.indexOf(record));
        sf.setSelectStatus(record);
    },
    onRemove : function(ds,record,index){
        var sf = this,row = Ext.get(sf.id+___+record.id);
        if(row)row.remove();
        removeFromGroup(sf.groups,record);
        EACH(sf.columns,function(col){
        	var colname = col.name;
            if(col.group){
            	sf.tbody.select(SELECT_TD_DATAINDEX+colname+_K).each(function(td){
            		var _r = sf.dataset.findById(td.parent(TR).getAttributeNS(_N,'_row')),
            			rowspan;
        			if(_r && _r.get(colname) == record.get(colname)){
        				if((rowspan = td.getAttribute('rowspan')) && (rowspan-= 1)>1)
        					td.dom.rowSpan = rowspan;
        				return FALSE;
        			}
            	});
            }
        });
        sf.selectTr=NULL;
        A.Masker.unmask(sf.wrap);
        sf.drawFootBar();
    },
    onMouseDown : function(e,t){
		t = (t = Ext.fly(t)).is(TD)?t:t.parent(TD);
		var sf = this,
			atype = t.getAttribute('atype'),
			ced;
		if((ced = sf.currentEditor)
			&& ced.editor instanceof A.CheckBox 
			&& atype == TABLE_CELL && t.getAttribute(DATA_INDEX) == ced.name){
	    	if(e.shiftKey){
    			sf._begin = ced.record;
    			e.stopEvent();
	    	}else if((t = t.child('.table-ckb')) && t.dom.className.search(/readonly/) == -1){
	    		e.stopEvent();
	    		ced.editor.focus.defer(Ext.isIE?1:0,ced.editor);
	    	}
		}
    },
    focus: function(){      
        this.wrap.focus();
    },
    onFocus : function(){
        this.hasFocus = TRUE;
    },
    blur : function(){
        this.wrap.blur();
    },
    onBlur : function(){
        this.hasFocus = FALSE;
    },
	clearBody:function(){
		var dom = this.tbody.dom
		while(dom.childNodes.length){
			dom.removeChild(dom.firstChild);
		}
		this.emptyRow = NULL;
	},
	getDataIndex : function(rid){
        for(var i=0,data = this.dataset.data,l=data.length;i<l;i++){
            if(data[i].id == rid){
                return i;
            }
        }
        return -1;
    },
    onEditorBlur : function(e,t){
    	var sf = this,ced = sf.currentEditor;
        if(ced && !ced.editor.isEventFromComponent(t)) {  
            sf.hideEditor.defer(Ext.isIE9?10:0,sf);
        }
    },
    onMouseWheel : function(e){
        e.stopEvent();
        if(this.editing == TRUE) return;
    	var delta = e.getWheelDelta(),
    		ds = this.dataset;
        if(delta > 0){
            ds.pre();
        } else if(delta < 0){
            ds.next();
        }
    },
    onIndexChange:function(ds, r){
        var index = this.getDataIndex(r.id);
        if(index == -1)return;
        this.selectRow(index, FALSE);
    },
    onFieldChange : function(ds, record, field, type, value){
        if(type == REQUIRED){
           var div = Ext.get([this.id,field.name,record.id].join(_));
           if(div) {
               div[value==TRUE?'addClass':'removeClass'](ITEM_NOT_BLANK);
           }
        }
    },
    onBeforeRemove : function(){
        A.Masker.mask(this.wrap,_lang['grid.mask.remove']);
    },
    onBeforeLoad : function(){
        A.Masker.mask(this.wrap,_lang['grid.mask.loading']);
    },
    onAfterSuccess : function(){
        A.Masker.unmask(this.wrap);
    },
    onBeforSubmit : function(ds){
    	A.Masker.mask(this.wrap,_lang['grid.mask.submit']);
    },
    onFetching : function(ed){
    	var sf = this;
    	sf.isFetching = true;
    	A.Masker.mask(sf.wrap,_lang['grid.mask.fetching']);
		ed.on('fetched',sf.onFetched,sf);
    },
    onFetched : function(ed){
    	var sf = this;
    	sf.isFetching = false;
    	A.Masker.unmask(sf.wrap);
    	ed.un('fetched',sf.onFetched,sf);
    	ed.un('fetching',sf.onFetching,sf);
    },
    onAjaxFailed : function(res,opt){
        A.Masker.unmask(this.wrap);
    },
    destroy: function(){
        A.Table.superclass.destroy.call(this);
        this.processDataSetLiestener('un');
    }
})
A.Table.revision='$Rev$';
})($A);