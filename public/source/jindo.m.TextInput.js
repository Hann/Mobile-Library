jindo.m.TextInput = jindo.$Class({
	$init : function(el, htUserOption) {
		this.option({
			sClassPrefix	: "fit-",
			bUseValidate : false,
			bActivateOnload : true			
		});
		this.option(htUserOption || {});		
		this._initVar();
		this._setWrapperElement(el);
		this._init();
		if(this.option("bActivateOnload")) {
			this.activate();			
		}
	},
	$static : {
		INDEX_ATTR : "data-index",
		VALIDATE_ATTR : "data-validate"
	},
	_initVar : function() {		
		this._aTextInput = [];
		this._sPreValue = null;
		this._nWatcher = null;
		this._sClickEvent = (jindo.m.getDeviceInfo().iphone || jindo.m.getDeviceInfo().ipad || jindo.m.getDeviceInfo().android) ? "touchstart" : "mousedown";
		this._nFocusTimer = null;
		this._nBlurTimer = null;
	},
	_setWrapperElement : function(el) {		
		this._htWElement = {};		
		this._htWElement["baseElement"] = jindo.$Element(el);
	},
	_init : function() {
		var welUnit, welInput, welDel, sValidate, aBaseList, aValidate = [];
		aBaseList = this._htWElement["baseElement"].queryAll("." + this.option("sClassPrefix") + "textinput-unit");
		for(var i=0, nLength=aBaseList.length; i<nLength; i++) {
			 welUnit = jindo.$Element(aBaseList[i]);
			 welUnit.attr(jindo.m.TextInput.INDEX_ATTR, i).css("position" , "relative");
			 welInput = jindo.$Element(welUnit.query("input"));
			 welInput.attr(jindo.m.TextInput.INDEX_ATTR, i);
			 welDel = welUnit.query("." + this.option("sClassPrefix") + "clear-btn");
			 if(welDel) {
			 	welDel = jindo.$Element(welDel);
			 	welDel.attr(jindo.m.TextInput.INDEX_ATTR, i).css({
			 		"position" : "absolute",
			 		"zIndex" : 100,
			 		"cursor" : "pointer"	,
			 		"right" : "0px",
			 		"top" : "0px"
			 	}).hide();
			 }
			 this._aTextInput.push({
			 	welUnit : welUnit,
			 	welInput : welInput,
			 	welDel : welDel
			 });
		}
	},		
	_attachEvent : function() {		
		this._htEvent = {};		
		this._htEvent["focus"] = jindo.$Fn(this._onFocus, this);
		this._htEvent["blur"] = jindo.$Fn(this._onBlur, this);
		this._htEvent["clear"] = jindo.$Fn(this._onClear, this);
		for(var i=0, nLength=this._aTextInput.length; i<nLength; i++) {
			this._attachUnitEvent(this._aTextInput[i]);
		}				
	},
	_attachUnitEvent : function(htUnit) {
		this._htEvent["focus"].attach(htUnit.welInput, "focus");
		this._htEvent["blur"].attach(htUnit.welInput, "blur");
		if(htUnit.welDel) {
			this._htEvent["clear"].attach(htUnit.welDel, this._sClickEvent);
		}
	},
	_detachEvent : function() {
		for(var i=0, nLength=this._aTextInput.length; i<nLength; i++) {
			this._detachUnitEvent(this._aTextInput[i]);
		}	
		for(var p in this._htEvent ) {
			this._htEvent[p] = null;
		}
		this._htEvent = null;
	},
	_detachUnitEvent : function(htUnit) {
		this._htEvent["focus"].detach(htUnit.welInput, "focus");
		this._htEvent["blur"].detach(htUnit.welInput, "blur");
		if(htUnit.welDel) {
			this._htEvent["clear"].detach(htUnit.welDel, this._sClickEvent);
		}
	},
	_displayClearBtn : function(welInput){
		var nIdx = this.getIndex(welInput),
			welClearBtn = this._aTextInput[nIdx].welDel;
		if(!welClearBtn) {
			return;
		}
		if(jindo.$S(welInput.$value().value).trim() != "") {
			if(!welClearBtn.visible() && this.fireEvent("beforeShowClearBtn", { 
					nIndex : nIdx,
					welClearBtn : welClearBtn 
				})) {				
				welClearBtn.show();
				this.fireEvent("showClearBtn", { 
					nIndex : nIdx,
					welClearBtn : welClearBtn 
				});
			}
		} else {
			if(welClearBtn.visible() && this.fireEvent("beforeHideClearBtn", { 
					nIndex : nIdx,
					welClearBtn : welClearBtn 
				})) {				
				welClearBtn.hide();
				this.fireEvent("hideClearBtn", { 
					nIndex : nIdx,
					welClearBtn : welClearBtn 
				});
			}
		}
	},	
	_validate : function(welInput) {
		var sValidate = welInput.attr(jindo.m.TextInput.VALIDATE_ATTR);
		if(!sValidate) {
			return;
		}
		var sValue = welInput.$value().value,
			htResult = jindo.m.Validation.validate(sValidate, sValue),
			nIdx=this.getIndex(welInput);
		if(htResult) {
			if(typeof htResult.sCorrectedValue !== "undefined" && htResult.sCorrectedValue !== null) {
					welInput.$value().value =  this._sPreValue = htResult.sCorrectedValue;	
			}
			this.fireEvent( (htResult.bValid ? "valid" : "invalid"), {
				htValidate : htResult,
				htTextInput : this._aTextInput[nIdx],
				nIndex : nIdx
			});
		}
	},
	_onFocus : function(we){
		var nIdx = this.getIndex(we.element);
		var self=this;
		if(jindo.m.getDeviceInfo().android) {
			clearTimeout(this._nFocusTimer);
			this._nFocusTimer = setTimeout(function() {
				self._processFocus(nIdx);
			},100);
		} else {
			self._processFocus(nIdx);
		}	
	},
	_processFocus : function(nIdx) {
		var htTextInput = this._aTextInput[nIdx]; 
		var welTextInputUnit = htTextInput.welUnit;
		var sCssName = this.option("sClassPrefix") + "focus";
		if(!welTextInputUnit.hasClass(sCssName)) {
			welTextInputUnit.addClass(sCssName);
		}
		this._runWatcher(htTextInput.welInput);		
		this.fireEvent("focus", {			
			nIndex : nIdx,
			htTextInput : htTextInput
		});
	},
	_onBlur : function(we){
		var nIdx = this.getIndex(we.element);
		var self=this;
		if(jindo.m.getDeviceInfo().android) {
			clearTimeout(this._nBlurTimer);
			this._nBlurTimer = setTimeout(function() {
				self._processBlur(nIdx);
			},100);
		} else {
			self._processBlur(nIdx);
		}
	},
	_processBlur : function(nIdx) {
		this._aTextInput[nIdx].welUnit.removeClass(this.option("sClassPrefix") + "focus");
		this._stopWatcher();
		if(this.option("bUseValidate")) {
			var welInput = this._aTextInput[nIdx].welInput;
			this._validate(welInput);
			this._displayClearBtn(welInput);
		}		
		this.fireEvent("blur", {			
			nIndex : nIdx,
			htTextInput : this._aTextInput[nIdx]
		});
	},
	_onClear : function(we){
		var welBtn = jindo.$Element(we.element)
			nIndex = this.getIndex(welBtn),
			welInput = this._aTextInput[nIndex].welInput,
			htInfo = jindo.m.getDeviceInfo(),
			nVersion = parseInt(htInfo.version,10);
		welInput.$value().value = "";
		if(htInfo.android && nVersion === 3) {
			this._detachUnitEvent(this._aTextInput[nIndex]);
			welInput.$value().blur();
			welInput.$value().focus();
			this._attachUnitEvent(this._aTextInput[nIndex]);
		} else {
			if(!htInfo.android && nVersion > 4) {
				welInput.$value().blur();
				welInput.$value().focus();	
			}
		}
		this._displayClearBtn(welInput);
		this.fireEvent("clear", {
			nIndex : nIndex,
			htTextInput : this._aTextInput[nIndex]
		});
		we.stop(jindo.$Event.CANCEL_ALL);
		return false;
	},	
	_runWatcher : function(welInput) {
		var self = this,
			sValue = null;
		this._stopWatcher();
		this._nWatcher = setInterval( function() {
			self._onChange(welInput);
		}, 100);
	},
	_stopWatcher : function() {
		clearInterval(this._nWatcher);
		this._nWatcher = null;
		this._sPreValue = null;
	},
	_onChange : function(welInput){
		var sValue = welInput.$value().value;
		if(this._sPreValue != sValue) {
			this._sPreValue = sValue;		
			this.fireEvent("change", {
				sPreValue : sValue,
				welInput : welInput,
				nIndex : this.getIndex(welInput)
			});
			this._displayClearBtn(welInput);
		} else {
			this._displayClearBtn(welInput);
		}
	},
	_getTextInputList : function(vElement){
		var aTextInputUnit = [];
		if(vElement) {
			if(vElement instanceof Array) {
				for(var i=0, nLength = vElement.length; i<nLength; i++) {
					aTextInputUnit.push(jindo.$Element(vElement[i]));
				}
			} else {
				aTextInputUnit.push(jindo.$Element(vElement));
			}
		} else {
			for(var i=0, nLength = this._aTextInput.length; i<nLength; i++) {
				aTextInputUnit.push(this._aTextInput[i].welUnit);
			}
		}
		return aTextInputUnit;
	},
	 _useSettingUnit : function(vElement, bUse){
		var self = this;
		this._stopWatcher();
		var aTextInputUnit = this._getTextInputList(vElement);
		if(jindo.m.getDeviceInfo().android) {
			setTimeout(function() {
				self._useSettingUnitCore(aTextInputUnit, bUse);
			},100);	
		} else {
			self._useSettingUnitCore(aTextInputUnit, bUse);
		}
	},	
	_useSettingUnitCore : function(aTextInputUnit, bUse){
		for (var i = 0, nLength = aTextInputUnit.length ; i < nLength ; i++) {
			if(bUse) {
				this._enableElement(aTextInputUnit[i]);
			} else {
				this._disableElement(aTextInputUnit[i]);
			}
		}
		this.fireEvent( (bUse ? "enable" : "disable"),{
			aTextInputUnit: aTextInputUnit
		});
	},
	_enableElement : function(welUnit){
		var nIdx = this.getIndex(welUnit),
			welInput = this._aTextInput[nIdx].welInput;
		this._detachUnitEvent(this._aTextInput[nIdx]);
		this._attachUnitEvent(this._aTextInput[nIdx]);
		welUnit.removeClass(this.option("sClassPrefix") + "disable");
		welInput.$value().disabled = false;
		this._displayClearBtn(welInput);
	},
	_disableElement : function(welUnit){
		var nIdx = this.getIndex(welUnit),
			welInput = this._aTextInput[nIdx].welInput,
			welDel = this._aTextInput[nIdx].welDel;
		this._detachUnitEvent(this._aTextInput[nIdx]);
		welUnit.addClass(this.option("sClassPrefix") + "disable");
		welInput.$value().disabled = true;
		if(welDel){
			welDel.hide();
		}
	},	
	enable : function(vElement){
		if(this.isActivating()) {
			this._useSettingUnit(vElement, true);
		}
	},
	disable : function(vElement){
		if(this.isActivating()) {
			this._useSettingUnit(vElement, false);
		}
	},
	getElement : function(nIdx){
		if(nIdx < this._aTextInput.length && nIdx >= 0) {
			return this._aTextInput[nIdx].welUnit;
		}
	},	
	getInputElement : function(nIdx) {
		if(nIdx < this._aTextInput.length && nIdx >= 0) {
			return this._aTextInput[nIdx].welInput;
		}
	}, 
	getDelElement : function(nIdx) {
		if(nIdx < this._aTextInput.length && nIdx >= 0) {
			return this._aTextInput[nIdx].welDel;
		}
	}, 
	getIndex : function(ele) {
		return parseInt(jindo.$Element(ele).attr(jindo.m.TextInput.INDEX_ATTR),10);
	},
	getLength : function() {
		return this._aTextInput.length;
	},
	_onActivate : function() {		
		this._attachEvent();
	},
	_onDeactivate : function() {		
		this._detachEvent();
		this._stopWatcher();
	},
	destroy : function() {	
		this.deactivate();
		for ( var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		this._htWElement = null;
	}
}).extend(jindo.UIComponent);
