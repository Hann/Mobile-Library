jindo.m.TelValidator = jindo.$Class({
	rx : /^(\d{2,3})(\d{3,4})(\d{4})$/,
	_isValid : function(sValue) {
		sValue = sValue.replace(/[^\d]/g, "");
		if(this.rx.test(sValue)) {
			var nLength = sValue.length,
				bResult = false;
			if(sValue.charAt(0) === "0") {
				if( (nLength === 9 && sValue.substring(0,2) === "02") || nLength === 10 || nLength === 11 ) {
					bResult = true;			
				}	
			}
			return bResult;
		} else {
			return false;
		}
	},
	_getCorrectedValue : function(sValue,sFormat){
		sValue = sValue.replace(/[^\d]/g, "");
		sValue = (sValue.length > 11 ? sValue.substr(0,11) : sValue);
		return this._applyFormat(sValue, sFormat);
	},
	_applyFormat : function(sValue, sFormat) {
		sFormat = sFormat || "-";
		var nLength = sValue.length;
		if(sValue.charAt(0) === "0") {
			if(nLength === 9 && sValue.substring(0,2) === "02") {
				sValue = sValue.substr(0,2) + sFormat + sValue.substr(2,3) +  sFormat + sValue.substr(5,4);
			} else if(nLength === 10) {
				if(sValue.substr(0,2) === "02") {
					sValue = sValue.substr(0,2) + sFormat + sValue.substr(2,4) +  sFormat + sValue.substr(6,4);		
				} else {
					sValue = sValue.substr(0,3) + sFormat + sValue.substr(3,3) +  sFormat + sValue.substr(6,4);			
				}
			} else if(nLength === 11) {
				if(sValue.substr(0,4) === "0505") {
					sValue = sValue.substr(0,4) + sFormat + sValue.substr(4,3) +  sFormat + sValue.substr(7,4);
				} else {
					sValue = sValue.substr(0,3) + sFormat + sValue.substr(3,4) +  sFormat + sValue.substr(7,4);
				}
			}	
		}		
		return sValue;
	}	
}).extend(jindo.m.Validator);
