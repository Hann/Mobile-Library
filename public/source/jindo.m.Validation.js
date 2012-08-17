jindo.m.Validation = jindo.$Class({
	$init : function() {},
	$static : {
		_htValidator : {},
		_htValidatorType : {
			"email" : "jindo.m.EmailValidator",
			"url" : "jindo.m.UrlValidator",
			"tel" : "jindo.m.TelValidator",
			"date" : "jindo.m.DateValidator",
			"number" : "jindo.m.NumberValidator",
			"currency" : "jindo.m.CurrencyValidator",
			"require" : "jindo.m.RequireValidator"
		},
		_createValidator : function(sType) {
			if(jindo.m.Validation._htValidatorType[sType] && !jindo.m.Validation._htValidator[sType]) {
				jindo.m.Validation._htValidator[sType] = eval("new " + jindo.m.Validation._htValidatorType[sType] + "()");
			}
		},	
		add : function(sType, sClassName) {
			jindo.m.Validation._htValidatorType[sType] = sClassName; 
		},	
		remove : function(sType) {
			delete jindo.m.Validation._htValidatorType[sType];
		},
		_parse : function(sValidate) {
			var aValidate = sValidate.split(";");
			var sType, sValue, htValidateData = {};
			for(var i=0, nLength = aValidate.length; i<nLength; i++) {
				var aTemp = aValidate[i].split(":");
				if(aTemp) {
					sType = aTemp[0];
					sValue = aTemp.length >1 ? aTemp[1] : null;
					htValidateData[sType] = htValidateData[sType] || sValue;
					jindo.m.Validation._createValidator(sType);					
				}
			}
			return htValidateData;
		},
		validate : function(sValidate, sValue) {
			var htResult, htValidateData = jindo.m.Validation._parse(sValidate);
			if("require" in htValidateData) {
				htResult = jindo.m.Validation._htValidator["require"].validate(sValue);
				if(!htResult.bValid) {
					return {
						bValid : false,
						sType : "require",
						sPreValue : sValue
					};
				} else {
					delete htValidateData["require"];	
				}
			}
			if(jindo.$S(sValue).trim() == "") {
				return null;
			}
			for(var sType in htValidateData) {
				htResult = jindo.m.Validation._htValidator[sType].validate(sValue, htValidateData[sType]);	
				if(!htResult.bValid) {
					htResult.sType = sType;
					htResult.sPreValue = sValue;
					return htResult;
				}
			}
			htResult.bValid = true;
			htResult.sPreValue = sValue;
			return htResult;
		}					
	}
});
