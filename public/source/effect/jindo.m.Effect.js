jindo.m.Effect = jindo.$Class({	
	$init : function(){
		this._sCssPrefix = jindo.m.getCssPrefix();
		var htDInfo = jindo.m.getDeviceInfo();		
		this.bIos = (htDInfo.iphone || htDInfo.ipad);
		this.bIos3 = htDInfo.iphone && (htDInfo.version.length > 0) && (htDInfo.version.substring(0,1)== '3');
		this.bAndroid = htDInfo.android;
		this.bAndroid3Up  = htDInfo.android && (htDInfo.version.length > 0) && (htDInfo.version.substring(0,1)>= '3');	
		this.bAndroid2_1  = htDInfo.android && (htDInfo.version.length > 0) && (htDInfo.version === '2.1');	
		this.sTranOpen =  (this.bIos )?'translate3d(' : 'translate(';
		this.sTranEnd =  (this.bIos)?',0px)' : ')';
		this._initVar();
	},
	_initVar : function(){
		this._htLayerInfo = {};
	},
	setLayerInfo : function(htInfo){
		this._htLayerInfo = {};
		for(var p in htInfo){
			this._htLayerInfo[p] = htInfo[p];
		}
	},	
	getTransitionTask : function(){
		return null;
	},
	getBeforeCommand : function(){
		return null;
	}
});
