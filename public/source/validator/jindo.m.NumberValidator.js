jindo.m.NumberValidator = jindo.$Class({
	rx :  /^[+\-]?(\d{1,3},)?(\d{3},)*(\d)+(\.\d+)?$/,
	_isValid : function(sValue, sFormat) {
		return this.rx.test(sValue); 
	},
	_getCorrectedValue : function(sValue, sFormat) {
		sValue = this._filterNumber(sValue);
		if(sFormat) {	
			sValue = this._applyComma(sValue);
		}
		return sValue;
	},
	_applyComma : function(sValue) {
		var sResult = "",
			nIdx = 0,
			ch = null,
			chCode = null,
			nDotIdx = sValue.indexOf("."),
			sIntValue = ( nDotIdx !== -1  ? sValue.substring(0,nDotIdx) : sValue ),
			sPointValue = ( nDotIdx !== -1 ? sValue.substr(nDotIdx) : "");
		if(sIntValue.length > 3) {
			for(var i=sIntValue.length-1; i>=0; i--, nIdx++) {
				ch = sIntValue.charAt(i); 
				chCode = sIntValue.charCodeAt (i); 
				sResult = (nIdx !==0 && nIdx %3 === 0 && (chCode > 47 && chCode < 58) ? ch + "," + sResult : ch + sResult); 
			}
			return (sPointValue !== "" ? sResult + sPointValue : sResult);
		} else {
			return sValue;
		}
	},
	_filterNumber : function(sValue) {
		var cFirst, aValue, sIntValue, sPointValue;
		sValue = sValue.replace(/[^\d\.\-]/g,"");
		//.replace(/\.{2,}/g,"").replace(/-{2,}/g,"");
		cFirst = sValue.charAt(0);
		sValue = sValue.replace(/-/g,"");
		sValue = ( cFirst === "-" ? cFirst + sValue : sValue );
		if( sValue.length <= 0 || sValue === "-") {
			return sValue;
		}
		aValue = sValue.split('.');
		if(aValue.length > 1) {
			sIntValue = aValue.shift();
			cFirst = sIntValue.charAt(0);
			sIntValue = (sIntValue === "" ? 0 : parseInt(sIntValue,10));
			if(cFirst === "-" && sIntValue === 0) {
				sIntValue = "-" + sIntValue;
			}
			sPointValue = aValue.join("");
			sValue = sIntValue + "." + sPointValue;	
		} else {
			sValue = String(parseFloat(aValue.join(""),10));
		}
		return sValue;
	}
}).extend(jindo.m.Validator);
