$A.TextArea = Ext.extend($A.Field,{
	constructor: function(config) {
        $A.TextArea.superclass.constructor.call(this, config);        
    },
    initComponent : function(config){
    	$A.TextArea.superclass.initComponent.call(this, config); 		
    },
    initEvents : function(){
    	$A.TextArea.superclass.initEvents.call(this);    	
    },
    initElements : function(){
    	this.el= this.wrap;
    },
    setRawValue : function(v){
        this.el.update(v === null || v === undefined ? '' : v);
    },
    getRawValue : function(){
        var v = this.el.dom.innerHTML;
        if(v === this.emptytext || v === undefined){
            v = '';
        }
        return v;
    }
})