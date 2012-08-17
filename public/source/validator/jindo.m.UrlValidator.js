jindo.m.UrlValidator = jindo.$Class({
	rx : /(^(http:\/\/)|^(https:\/\/)|(^[A-Za-z0-9\.\-]+))+([A-Za-z0-9\.\-])*(\.[A-Za-z]{2,}(\/([A-Za-z0-9\.\-])*)*)$/,
	_isValid : function(sValue, sFormat) {
		if(this.rx.test(sValue)) {
			return true;
		} else {
			return false;
		}
	},	
	_getCorrectedValue : function(sValue){
		return sValue.replace(/[^A-Za-z0-9-\?&\.\:\/]/g,"").replace(/\.{2,}/g,"").replace(/\?{2,}/g,"").replace(/&{2,}/g,"").replace(/\:{3,}/g,"");
	}	
}).extend(jindo.m.Validator);
