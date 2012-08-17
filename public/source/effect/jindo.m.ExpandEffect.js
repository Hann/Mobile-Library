jindo.m.ExpandEffect = jindo.$Class({
	sEffectName : "expand",
	getCommand : function(el, htOption){
		var sDirection = htOption.sDirection? htOption.sDirection :'down';
		var sProperty = 'width';
		var nSize = this._htLayerInfo["nWidth"];
		if(sDirection == 'up' || sDirection == 'down'){
			sProperty = 'height';
			nSize = this._htLayerInfo["nHeight"];
		}
		var htStyle = htOption.htTo || {};
		htStyle[sProperty] = nSize+"px";
		if(sDirection == 'left'){
			htStyle["margin-left"] = this._htLayerInfo["nMarginLeft"]+"px";
		}
		if(sDirection == 'up'){
			htStyle["margin-top"] = this._htLayerInfo["nMarginTop"]+"px";
		}
		return {
			sTaskName : this.sEffectName+"-"+sDirection , 
			htStyle : htStyle,
			htTransform : {}
		};
	},
	getBeforeCommand : function(el, htOption){
		var sDirection = htOption.sDirection? htOption.sDirection :'down';
		var sProperty = 'width';
		if(sDirection == 'up' || sDirection == 'down'){
			sProperty = 'height';
		}
		var htBeforeStyle = htOption.htFrom || {};	
		htBeforeStyle[sProperty] = "0";
		htBeforeStyle["overflow"] = "hidden";
		if(sDirection == 'left'){			
			htBeforeStyle["margin-left"] = (this._htLayerInfo["nWidth"] + this._htLayerInfo["nMarginLeft"])+"px";
		}
		if(sDirection == 'up'){
			htBeforeStyle["margin-top"] = (this._htLayerInfo["nHeight"] +this._htLayerInfo["nMarginTop"]) +"px";
		}	
		return {
			htStyle : htBeforeStyle ,
			htTransform : {}
		};
	}
}).extend(jindo.m.Effect);
