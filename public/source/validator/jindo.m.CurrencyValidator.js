jindo.m.CurrencyValidator = jindo.$Class({
	rx :  /^[+\-]?[^\s\t\v\d]+(\d{1,3},)?(\d{3},)*(\d)+(\.\d+)?$/,
	_getCorrectedValue : function(sValue, sFormat) {
		sValue = this._applyComma(this._filterNumber(sValue));
		sFormat = sFormat || "\\";
		sValue = ( sValue.charAt(0) === "-" ?  "-" + sFormat + sValue.substring(1) : sFormat + sValue ); 
		return sValue;
	}
}).extend(jindo.m.NumberValidator);
