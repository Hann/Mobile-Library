jindo.m.CheckBox = jindo.$Class({
	$init : function(el, htUserOption) {		
		this.option({
			sClassPrefix	: "fcb-",
			sType			: "v",
			bActivateOnload : true,
			sUncheckBgColor : "transparent"
		});
		this.option(htUserOption || {});		
		this._initVar();		
		this._setWrapperElement(el, this.option("sClassPrefix"));		
		this._initCheckLoad();		
		if(this.option("bActivateOnload")) {
			this.activate();
		}
	},
	_initVar : function() {
		this.$super._initVar("checkbox", "checkbox");
	},	
	_initCheckLoad : function(){		
		var aCheckUnit = this._htWElement["container"].queryAll('.' + this._sUnitClass);
		var welUnit, elCheckbox;		
		for ( var i = 0; i < aCheckUnit.length; i++) {
			welUnit = jindo.$Element(aCheckUnit[i]);
			elCheckbox = jindo.$$.getSingle("input[type=checkbox]", welUnit.$value());
			this._setChecked(elCheckbox.checked, elCheckbox, welUnit);			
		}
		welUnit = elCheckbox = null;
	},	
	_afterCheck : function(welElement, bClickOverForm){
		var elCheckbox = jindo.$$.getSingle("." + this._sFormClass, welElement.$value());
		var sChecked = welElement.attr("data-cb-checked");
		var bChecked = (sChecked && sChecked == "on") ? false : true;
			elCheckbox.checked = bChecked;
		this._setChecked(bChecked, elCheckbox, welElement);
	},
	_setChecked : function(bChecked, elCheckbox, welUnit){
		var sEvent = "unchecked";
		var sBgColor = this.option("sCheckBgColor");
		if(!bChecked){
			sBgColor = (sBgColor) ? this.option("sUncheckBgColor") : null;
			welUnit.removeClass(this._sOnClass);
			welUnit.attr("data-cb-checked", "off");
		} else {
			welUnit.addClass(this._sOnClass);
			welUnit.attr("data-cb-checked", "on");
			sEvent = "checked";
		}		
		(sBgColor) ? welUnit.css("backgroundColor", sBgColor + " !important") : null;		
		this.fireEvent(sEvent, {
			elCheckBoxUnit : welUnit.$value(),
			elCheckBox : elCheckbox
		});
	},	
	getCheckedValue : function(){
		var aValue = [];
		var aCheckBoxList = this._aWElFormList;
		var elTempCheck = null;
		for ( var i = 0; i < aCheckBoxList.length; i++) {
			elTempCheck = aCheckBoxList[i].$value(); 
			if(!elTempCheck.disabled && elTempCheck.checked){
				aValue.push(elTempCheck.value);
			}
		}
		return aValue;
	},
	setCheckedBox : function(bChecked, vElement){
		var aIdx = this._getFormIdx(vElement);	
		var elInput = null;
		for ( var i = 0; i < aIdx.length; i++) {
			elInput = this._aWElFormList[aIdx[i]].$value();
			if(!elInput.disabled){
				elInput.checked = bChecked;
				this._setChecked(bChecked, elInput, this._aWElUnitList[aIdx[i]]);
			}
		}
	},
	enable : function(vElement){
		var htElForm = this._useSettingForm(vElement, true);
		this.fireEvent("enable", {
			aCheckBoxList: htElForm.aFormList,
			aCheckBoxUnitList: htElForm.aUnitList
		});
	},
	disable : function(vElement){
		var htElForm = this._useSettingForm(vElement, false);
		this.fireEvent("disable", {
			aCheckBoxList: htElForm.aFormList,
			aCheckBoxUnitList: htElForm.aUnitList
		});
	},
	geElementtByIndex : function(nIdx){
		return {
			elCheckBox: this._aWElFormList[nIdx].$value(),
			elCheckBoxUnit: this._aWElUnitList[nIdx].$value()
		};
	},	
	destroy : function() {
		this.$super.destroy();
	}
}).extend(jindo.m.CheckRadioCore);
