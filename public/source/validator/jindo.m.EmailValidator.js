jindo.m.EmailValidator = jindo.$Class({
	rx : /^(([\w\-]+\.)+[\w\-]+|([a-zA-Z]{1}|[\w\-]{2,}))@((([0-1]?[0-9]{1,2}|25[0-5]|2[0-4][0-9])\.([0-1]?[0-9]{1,2}|25[0-5]|2[0-4][0-9])\.([0-1]?[0-9]{1,2}|25[0-5]|2[0-4][0-9])\.([0-1]?[0-9]{1,2}|25[0-5]|2[0-4][0-9])){1}|([a-zA-Z]+[\w\-]+\.)+[a-zA-Z]{2,4})$/,
	_isValid : function(sValue) {
		if(this.rx.test(sValue)) {
			return true;
		} else {
			return false;
		}
	},	
	_getCorrectedValue : function(sValue){
		sValue = sValue.replace(/[^\w\.\@]/g,"").replace(/\.{2,}/g,".");
		var aEmail = sValue.split("@");
		if(aEmail.length > 2) {
			sValue = aEmail.shift() + "@" + aEmail.join("");
		}
		return sValue;
	}	
}).extend(jindo.m.Validator);
