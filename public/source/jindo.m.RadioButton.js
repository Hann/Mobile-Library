jindo.m.RadioButton = jindo.$Class({
	$init : function(el, htUserOption) {
		this.option({
			sClassPrefix	: "frb-",
			sType			: "v",
			bActivateOnload : true,
			sUncheckBgColor : "transparent"
		});
		this.option(htUserOption || {});
		this._initVar();
		this._setWrapperElement(el, this.option("sClassPrefix"));
		this._initRadioLoad();
		if(this.option("bActivateOnload")) {
			this.activate();
		}		
	},
	_initVar : function() {
		this.$super._initVar("radio", "radiobtn");
		this._nPreSelectIdx = -1;
	},	
	_initRadioLoad : function(){
		var aRadioBtnList = this._aWElFormList;
		for ( var i = 0; i < aRadioBtnList.length; i++) {
			if(aRadioBtnList[i].$value().checked){
				this._setChecked(i);
				break;
			}			
		}
	},
	_afterCheck : function(welElement, bClickOverForm){
		var nIdx = -1;	
		nIdx = this._htWElement["container"].indexOf(welElement);
		this._setChecked(nIdx);
	},	
	_onFormClick : function(we){		
		var sClassName = this._sUnitClass;
		var welElement = jindo.$Element(we.element);
		welElement = welElement.parent(function(v){
			return v.hasClass(sClassName);
		})[0];
		var sChecked = welElement.attr("data-cb-checked");		
		we.element.checked = (sChecked && sChecked == "on") ? true : false;
		nIdx = this._htWElement["container"].indexOf(welElement);
		if(we.element.checked){			
			if(this._nPreSelectIdx != nIdx){
				this._onCheck(we);
			}
		}
	},
	_setChecked : function(nIdx){
		var elCurrentRadioBtn = this._aWElFormList[nIdx].$value();
		var welCurrentRadioUnit = this._aWElUnitList[nIdx];
		if(elCurrentRadioBtn.disabled){
			return false;
		}
		var sBgColor = this.option("sCheckBgColor");
		var elPreRadioUnit = null;
		var elPreRadioBtn = null;
		if(this._nPreSelectIdx > -1){
			sBgColor = (sBgColor) ? this.option("sUncheckBgColor") : null;
			elPreRadioUnit = this._aWElUnitList[this._nPreSelectIdx].$value();
			elPreRadioBtn = this._aWElFormList[this._nPreSelectIdx].$value();
			this._aWElUnitList[this._nPreSelectIdx].removeClass(this._sOnClass);
			elPreRadioBtn.checked = false;
			if(sBgColor){
				this._aWElUnitList[this._nPreSelectIdx].css("backgroundColor", sBgColor + " !important");
			}
		}
		welCurrentRadioUnit.addClass(this._sOnClass);
		welCurrentRadioUnit.attr("data-cb-checked","on");
		elCurrentRadioBtn.checked = true;
		sBgColor = this.option("sCheckBgColor");
		if(sBgColor){
			welCurrentRadioUnit.css("backgroundColor", sBgColor + " !important");
		}
		this._nPreSelectIdx = nIdx;
		this.fireEvent("checked", {
			elPreRadioButtonUnit : elPreRadioUnit,
			elPreRadioButton : elPreRadioBtn,
			elRadioButtonUnit : welCurrentRadioUnit.$value(),
			elRadioButton : elCurrentRadioBtn
		});
	},	
	getCheckedValue : function(){
		var sValue = "";
		if(this._nPreSelectIdx > -1){
			if(!this._aWElFormList[this._nPreSelectIdx].$value().disabled){
				sValue = this._aWElFormList[this._nPreSelectIdx].$value().value;
			}
		}
		return sValue;
	},
	setCheckedButton : function(vElement){
		var aIdx = this._getFormIdx(vElement);
		if(aIdx.length > 0)	{this._setChecked(aIdx[0]);}
	},	 
	enable : function(vElement){
		var htElForm = this._useSettingForm(vElement, true);
		this.fireEvent("enable", {
			aRadioButtonList: htElForm.aFormList,
			aRadioButtonUnitList: htElForm.aUnitList
		});
	},
	disable : function(vElement){
		var htElForm = this._useSettingForm(vElement, false);
		this.fireEvent("disable", {
			aRadioButtonList: htElForm.aFormList,
			aRadioButtonUnitList: htElForm.aUnitList
		});
	},
	getElementByIndex : function(nIdx){
		return {
			elRadioButton: this._aWElFormList[nIdx].$value(),
			elRadioButtonUnit: this._aWElUnitList[nIdx].$value()
		};
	},
	destroy : function() {
		this.$super.destroy();
	}
}).extend(jindo.m.CheckRadioCore);
