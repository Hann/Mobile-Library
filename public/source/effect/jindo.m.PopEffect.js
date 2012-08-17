jindo.m.PopEffect = jindo.$Class({
	sEffectName : "pop",
	getCommand : function(el, htOption){
		var sDirection = htOption.sDirection? htOption.sDirection :'in';
		var htStyle = htOption.htTo || {};
		if(typeof htStyle["opacity"] === 'undefined'){
			htStyle["opacity"] = (sDirection == 'in')? 1 : 0.1;
		}
		var nScale = (sDirection == 'in')? 1 : ((this.bIos3 || this.bAndroid3Up)? 0.1: 0);		
		var htCallback = {};
		if(sDirection == 'out'){
			htCallback.htStyle ={}; 
			htCallback.htStyle["display"]  = "none";
			htCallback.htStyle["opacity"]  = this._htLayerInfo['nOpacity'];
			htCallback.htTransform = {};
			htCallback.htTransform["transform"] = "scale(1)";
		}
		var sTransform = 'scale('+nScale+')';
		if(this.bAndroid3Up){
			sTransform += ' scaleZ(1.0)';
		}
		return {
			sTaskName : this.sEffectName + "-" +sDirection,
			htStyle : htStyle,
			htTransform : {
				'transform' : sTransform,
				'transform-origin' : '50% 50%'
			},
			fCallback : htCallback
		};
	},
	getBeforeCommand : function(el, htOption){
		var sDirection = htOption.sDirection? htOption.sDirection :'in';
		var htBeforeStyle = htOption.htFrom || {};
		if(typeof htBeforeStyle["opacity"] === 'undefined'){
			htBeforeStyle["opacity"] = (sDirection == 'in')? 0.1 : 1;
		}
		htBeforeStyle["display"] = this._htLayerInfo['sDisplay'];
		var nScale = (sDirection == 'in')? ((this.bIos3||this.bAndroid3Up)? 0.1: 0) : 1;
		var sTransform = 'scale('+nScale+')';
		if(this.bAndroid3Up){
			sTransform += ' scaleZ(1.0)';
		}
		return {
			htStyle : htBeforeStyle ,
			htTransform : {
				'transform' : sTransform,
				'transform-origin' : '50% 50%'
			}
		};
	}
}).extend(jindo.m.Effect);
