jindo.m.FlipEffect = jindo.$Class({
	sEffectName : "flip",
	getCommand : function(el, htOption){
		var sDirection = htOption.sDirection? htOption.sDirection :"left";
		var sCoord = 'Y';
		if(sDirection == 'up' || sDirection == 'down'){
			sCoord = 'X';
		}
		var htStyle = htOption.htTo || {};
		var welFrom = htOption.elFlipFrom? jindo.$Element(htOption.elFlipFrom) : jindo.$Element(el);
		var welTo =   htOption.elFlipTo? jindo.$Element(htOption.elFlipTo) : null;
		var htTo = this._getCssRotate(this._getCssTransfrom(welFrom));
		htTo[sCoord] = htTo[sCoord]+ ((sDirection == 'left' || sDirection == 'down')?180*-1 : 180);
		var sTransfrom = 'rotateX('+ htTo.X+'deg) rotateY('+htTo.Y+'deg)';
		if(welTo){
			welTo.$value().style[this._sCssPrefix +"Transform"] = 'rotate'+sCoord+'(0deg)';
			sTransfrom = 'rotate'+sCoord+'(0deg)';
		}
		return {
			sTaskName : this.sEffectName + "-" + sDirection,
			htStyle : htStyle,
			htTransform : {
				"transform-style" : "preserve-3d",
				"transform" : sTransfrom
			}
		};
	},
	getBeforeCommand : function(el, htOption){
		var sDirection = htOption.sDirection? htOption.sDirection :"left";
		var htBeforeStyle = htOption.htFrom || {};
		var sCoord = "Y", 
			nFrom = 0;
		if(sDirection == 'up' || sDirection == 'down'){
			sCoord = "X";
		}
		var welFrom = htOption.elFlipFrom? jindo.$Element(htOption.elFlipFrom) : jindo.$Element(el);
		var welTo =   htOption.elFlipTo? jindo.$Element(htOption.elFlipTo) : null;
		var elParent = welFrom.$value().parentNode;
		elParent.style.webkitPerspective = '1200';
		var htFrom = this._getCssRotate(this._getCssTransfrom(welFrom));
		var sTransfrom = 'rotateX('+ htFrom.X+'deg) rotateY('+htFrom.Y+'deg)';
		if(welTo){
			welTo.$value().style[this._sCssPrefix +"Transform"] = 'rotate'+sCoord+'(-180deg)';
			sTransfrom = 'rotate'+sCoord+'(-180deg)';
		}
		return {
			htStyle : htBeforeStyle ,
			htTransform : {
				"perspective" : "1200",
				"transform-style" : "preserve-3d",
				"transform" : sTransfrom
			}
		};
	},
	_getCssRotate : function(str){
		var sRotate = str;
		var htReturn ={
			X : 0,
			Y : 0
		};
		if(!sRotate){
			return htReturn;
		}
		var aTemp = sRotate.match(/rotateX\((\-?\d*)deg/);	
		if(aTemp && aTemp.length >1){
			htReturn['X'] =aTemp[1]*1;
			if(htReturn['X']%360 == 0){
				htReturn['X'] = 0;
			}
		}
		aTemp = sRotate.match(/rotateY\((\-?\d*)deg/);
		if(aTemp && aTemp.length >1){
			htReturn['Y'] =aTemp[1]*1;
			if(htReturn['Y']%360 == 0){
				htReturn['Y'] = 0;
			}
		}
		return htReturn;		
	},
	_getCssTransfrom : function(wel){
		return wel.css(this._sCssPrefix +"Transform") || "";		
	}
}).extend(jindo.m.Effect);
