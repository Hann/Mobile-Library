jindo.m.FadeEffect = jindo.$Class({
	sEffectName : "fade",
	getCommand : function(el, htOption){
		var sDirection = htOption.sDirection? htOption.sDirection :'in';
		var htStyle = htOption.htTo || {};
		var nOpacity = (sDirection == 'in')? 1 : 0;
		htStyle["opacity"] = (typeof htStyle.opacity !== 'undefined')? htStyle.opacity : nOpacity;
		var htCallback = {};
		if(sDirection == 'out'){
			htCallback.htStyle ={}; 
			htCallback.htStyle["display"]  = "none";
			htCallback.htStyle["opacity"] = this._htLayerInfo['nOpacity'];
		}
		return {
			sTaskName : this.sEffectName + "-"+sDirection,
			htStyle : htStyle,
			htTransform : {},
			fCallback : htCallback
		};
	},
	getBeforeCommand : function(el, htOption){
		var sDirection = htOption.sDirection? htOption.sDirection :'in';
		var htBeforeStyle = htOption.htFrom || {};
		var nOpacity  = (sDirection == 'in')? 0 : 1;
		htBeforeStyle["display"] = this._htLayerInfo['sDisplay'];
		htBeforeStyle["opacity"] = (typeof htBeforeStyle.opacity == 'undefined')? nOpacity : htBeforeStyle.opacity;
		return {
			htStyle : htBeforeStyle ,
			htTransform : {}
		};
	}
}).extend(jindo.m.Effect);
