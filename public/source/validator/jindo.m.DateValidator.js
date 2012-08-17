jindo.m.DateValidator = jindo.$Class({
	_isValid : function(sValue, sFormat) {
		sFormat = sFormat || "yyyy-mm-dd";
		sValue = sValue.replace(/[\.\-]/g,"");
		var sFormatData = sFormat.replace(/[\d\.\-]/g,""),
			nYear = sValue.substr(sFormatData.indexOf("yyyy"),4) * 1, 
			nMonth = sValue.substr(sFormatData.indexOf("mm"),2) * 1,
			nDay = sValue.substr(sFormatData.indexOf("dd"),2) * 1;
		if((nMonth >= 1 && nMonth <= 12) && (nDay >= 1 && nDay <= 31) && (nYear >= 1000)) {
			return true;
		}
		return false;
	},
	_getCorrectedValue : function(sValue, sFormat) {
		sFormat = sFormat || "yyyy-mm-dd";
		var sFormatData = sFormat.replace(/[\d\.\-]/g,"");
		sValue = sValue.replace(/[^\d]/g,"").substr(0,sFormatData.length);
		if(sValue.length >= (sFormatData.length-1) ) {
			sValue = this._getFormatted(sValue, sFormat);
		}
		return sValue;
	},
	_getFormatted : function(sDateStr, sFormat){
		var sFormatData = sFormat.replace(/[\.\-]/g,""),
			sYear = sDateStr.substr(sFormatData.indexOf("yyyy"),4),
			sMonth = sDateStr.substr(sFormatData.indexOf("mm"),2),
			sDay = sDateStr.substr(sFormatData.indexOf("dd"),2);
		return sFormat.replace(/(yyyy|mm|dd)/gi,
	        function($1){
	            switch ($1){
	                case 'yyyy': return sYear;
	                case 'mm': return sMonth;
	                case 'dd':   return sDay;
	            }
	        } 
	    );
	}
}).extend(jindo.m.Validator);
