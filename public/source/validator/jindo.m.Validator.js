jindo.m.Validator = jindo.$Class({
	validate : function(sValue, sFormat) {
		var sCorrectedValue = this._getCorrectedValue(sValue, sFormat),
			htResult = {
				bValid : this._isValid(sCorrectedValue, sFormat),
				sCorrectedValue : null
			};
		if(sCorrectedValue !== sValue) {
			htResult.sCorrectedValue = sCorrectedValue;
		} 
		return htResult;
	}
});
