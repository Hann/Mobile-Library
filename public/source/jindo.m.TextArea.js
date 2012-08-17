jindo.m.TextArea = jindo.$Class({
	$init : function(el, htUserOption) {
		this.option({
			sClassPrefix	: "fta-",			
			bActivateOnload : true,
			bUseRadius 		: false,
			sRadiusSize		: "0.5em",
			nExpandHeight	: 30,
			nMaxHeight		: -1
		});
		this.option(htUserOption || {});
		this._initVar();
		this._setWrapperElement(el);
		if(this.option("bUseRadius")){
			this._applyRadiusStyle(this.option("sRadiusSize"));
		}
		if(this.option("bActivateOnload")) {
			this.activate();
		}
	},
	_initVar : function() {
		this._nTimer = -1;		
		this._bTouchTextArea = false;
		this._touchMoved = false;
		this._sBeforeValue = "";
	},
	_setWrapperElement : function(el) {
		this._htWElement = {};
		var sPrefix = this.option('sClassPrefix');
		el = (typeof el == "string" ? jindo.$(el) : el);		
		this._htWElement["textarea"] = jindo.$Element(el);		 
	},
	_applyRadiusStyle : function(sRadius){
		var sCssName = jindo.m.getCssPrefix() + "BorderRadius";
		var oCssProperty = {
			sCssName : sRadius,
			"borderRadius" : sRadius
		};			
		this._htWElement["textarea"].css(oCssProperty);
		oCssFirstProperty = null;
	},
	_onActivate : function() {
		this._attachEvent();
	},
	_onDeactivate : function() {		
		this._detachEvent();
		clearInterval(this._nTimer);
		this._nTimer = -1;
	},
	_attachEvent : function() {
		this._htEvent = {};
		var elTextArea = this._htWElement["textarea"].$value();
		this._htEvent["textarea_focus"] = {
			el  : elTextArea,
			ref : jindo.$Fn(this._onFocus, this).attach( elTextArea, "focus")
		};		
		this._htEvent["textarea_blur"] = {
			el  : elTextArea,
			ref : jindo.$Fn(this._onBlur, this).attach( elTextArea, "blur")
		};
	},
	_detachEvent : function() {
		for(var p in this._htEvent) {			
			var ht = this._htEvent[p];			
			ht.ref.detach(ht.el, p.substring(p.lastIndexOf("_")+1));
		}
		this._htEvent = null;
	},
	_onFocus : function(we){		
		if(this._nTimer > -1){
			return;
		}
		this._htWElement["textarea"].addClass(this.option('sClassPrefix') + "textarea-focus");		
		this._nTimer = setInterval(jindo.$Fn(this._checkHeightAndExpand, this).bind(), 10);
		this.fireEvent("focus",{
			elTextArea : this._htWElement["textarea"].$value()
		});		
	},
	_onBlur : function(we){
		if (this._nTimer == -1) {
			return;
		}
		clearInterval(this._nTimer);
		this._nTimer = -1;
		this._htWElement["textarea"].removeClass(this.option('sClassPrefix') + "textarea-focus");
		this.fireEvent("blur",{
			elTextArea : this._htWElement["textarea"].$value()
		});		
	},	
	_checkHeightAndExpand : function() {		
		var el = this._htWElement["textarea"].$value(),
			sValue = el.value;
		if (this._hasEnoughHeight() === false) {
			this._expandHeight();
		}
		if(sValue != this._sBeforeValue) {
			this._sBeforeValue = sValue;
			this.fireEvent("change",{
				elTextArea : this._htWElement["textarea"].$value()
			});
		}
	},
	_hasEnoughHeight : function() {
		var elTextArea = this._htWElement["textarea"].$value();
		if (elTextArea.scrollHeight > elTextArea.clientHeight) {
			return false;
		}
		return true;
	},
	_expandHeight : function() {
		var elTextArea = this._htWElement["textarea"].$value();
		var nMaxHeight = this.option("nMaxHeight");
		var nExpandHeight = this.option("nExpandHeight");
		var nNewHeight = elTextArea.scrollHeight + nExpandHeight;
		if (nMaxHeight > 0 && nNewHeight >= nMaxHeight){
			elTextArea.style.height = nMaxHeight + "px";
		} else {			
			elTextArea.style.height = elTextArea.scrollHeight + nExpandHeight + "px";
			this.fireEvent("expand",{
				elTextArea : this._htWElement["textarea"].$value()
			});
		}
	},	
	getValue : function(){
		return this._htWElement["textarea"].$value().value;
	},
	setValue : function(sValue){
		this._htWElement["textarea"].$value().value = sValue;
		this._checkHeightAndExpand();
	},
	deleteValue : function(){
		this._htWElement["textarea"].$value().value = "";	
	},
	enable : function(){
		var elTextArea = this._htWElement["textarea"].$value();
		elTextArea.disabled = false;
		this._htWElement["textarea"].removeClass(this.option("sClassPrefix") + "textarea-disable");
		this.fireEvent("enable",{
			elTextArea : elTextArea
		});
	},
	disable : function(){
		var elTextArea = this._htWElement["textarea"].$value();
		elTextArea.disabled = true;
		this._htWElement["textarea"].addClass(this.option("sClassPrefix") + "textarea-disable");
		this.fireEvent("disable",{
			elTextArea : elTextArea
		});
	},
	setExpandHeight : function(nExpandHeight){		
		this.option("nExpandHeight", nExpandHeight);		
	},
	getExpandHeight : function(){
		return this.option("nExpandHeight");
	},
	setMaxHeight : function(nMaxHeight){		
		this.option("nMaxHeight", nMaxHeight);
		var elTextArea = this._htWElement["textarea"].$value();
		if (nMaxHeight > 0 && elTextArea.scrollHeight >= nMaxHeight){
			elTextArea.style.height = nMaxHeight + "px";
		} else if (nMaxHeight > 0 && elTextArea.scrollHeight < nMaxHeight){
			elTextArea.style.height = elTextArea.scrollHeight + "px";
		}
	},
	getMaxHeight : function(){
		return this.option("nMaxHeight");
	},
	destroy : function() {
		this.deactivate();
		if (this._oTimer) {
			clearInterval(this._oTimer);
			this._oTimer = null;
		}
		for ( var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		this._htWElement = null;
		this._bTouchTextArea = null;
		this._touchMoved = null;
	}
}).extend(jindo.UIComponent);
