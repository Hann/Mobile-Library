jindo.m.RequireValidator = jindo.$Class({
	validate : function(sValue) {
		sValue = jindo.$S(sValue).trim();
		var htResult = {
			bValid : false,
			sCorrectedValue : null
		};
		htResult.bValid = sValue != "" ? true : false;
		return htResult;
	}
}).extend(jindo.m.Validator);
