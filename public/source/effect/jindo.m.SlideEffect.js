jindo.m.SlideEffect = jindo.$Class({
	sEffectName : "slide",
	getCommand : function(el, htOption){
		var sDirection = htOption.sDirection? htOption.sDirection :'left';		
		var htCurOffset = jindo.m.getCssOffset(el);
		var toX = htCurOffset.left;
		var toY = htCurOffset.top;
		var nW,nH,wel;
		nW = (typeof htOption.nSize != 'undefined')? htOption.nSize : this._htLayerInfo['nWidth'];
		nH =  (typeof htOption.nSize != 'undefined')? htOption.nSize : this._htLayerInfo['nHeight'];
		if(sDirection == 'up' || sDirection == 'down'){
			toY  += ((sDirection == 'up')? nH*-1 : nH); 
		}
		if(sDirection == 'left' || sDirection == 'right'){
			toX += ((sDirection == 'left')? nW*-1 : nW);
		}
		var htTransform = {};
		if(typeof htOption.elBaseLayer != 'undefined'){
			toX = 0;
			toY = 0;
			var welBaseLayer = jindo.$Element(htOption.elBaseLayer);
			wel = jindo.$Element(el);
			nH = (typeof htOption.nSize != 'undefined')? htOption.nSize : welBaseLayer.height();
			nW = (typeof htOption.nSize != 'undefined')? htOption.nSize : welBaseLayer.width();
			if(sDirection == 'up' || sDirection == 'down'){
				toY = (sDirection == 'down')?  nH * -1 : nH;
			}
			if(sDirection == 'left' || sDirection == 'right'){
				toX = (sDirection == 'left')? nW: nW*-1;
			}
			toX = toX*-1;
			toY = toY*-1;
		}
		htTransform["transform"] = this.sTranOpen + toX + 'px, ' + toY + 'px'+ this.sTranEnd;
		var sPosition = this._htLayerInfo["sPosition"];
		var bAndroid = this.bAndroid;
		var bAndroid3Up = this.bAndroid3Up;
		var sClassHighligting = this._htLayerInfo['sClassHighligting'];
		var bAndroid2_1 = this.bAndroid2_1;
		wel = jindo.$Element(el);
		return {
			sTaskName : this.sEffectName+"-"+ sDirection,
			htStyle : htOption.htTo || {},
			htTransform : htTransform,
			fCallback : function(){
				var htCurOffset = jindo.m.getCssOffset(el);	
				var top = wel.css('top').replace('px','')*1;
				var left = wel.css('left').replace('px','')*1;
				top = isNaN(top)? 0 : top;
				left = isNaN(left)? 0 : left;
				if(sPosition == "relative"){
					wel.css("position", 'relative');
				}else{
					wel.css("position","absolute");
				}				
				var sPrefix = jindo.m.getCssPrefix();
				wel.css(sPrefix+'Transform','');
				if(bAndroid3Up){
					wel.offset();
				}				
				wel.$value().style.top = parseInt((top+htCurOffset.top),10)+"px";
				wel.$value().style.left = parseInt((htCurOffset.left+ left),10)+"px";	
				if(bAndroid && !bAndroid3Up){
				//if(bAndroid){
					var elFocus = jindo.$$.getSingle('.'+ sClassHighligting, wel.$value());
					if(elFocus){	
						if(bAndroid2_1){
							setTimeout(function(){
								elFocus.focus();							
							},5);		
						}else{
							elFocus.focus();
						}
					}
				}
			}
		};
	},
	getBeforeCommand : function(el, htOption){
		var sDirection = htOption.sDirection? htOption.sDirection :'left';
		var htBeforeStyle = htOption.htFrom || {};
		var htTransform = {};
		var wel = jindo.$Element(el);
		if(typeof htOption.elBaseLayer != 'undefined'){
			var welBaseLayer = jindo.$Element(htOption.elBaseLayer);
			if(!welBaseLayer.isParentOf(wel)){
				welBaseLayer.append(wel);
				var sPosition = wel.css('position');
				if(!(sPosition == 'relative' || sPosition == 'absolute') ){
					wel.css('position', 'absolute');
				}
				wel.css('opacity',0);
			}
			var fromX = 0, fromY = 0;
			var nH = welBaseLayer.height();
			var nW = welBaseLayer.width();
			if(sDirection == 'up' || sDirection == 'down'){
				fromY = (sDirection == 'down')?  nH * -1 : nH;
			}
			if(sDirection == 'left' || sDirection == 'right'){
				fromX = (sDirection == 'left')? nW: nW*-1;
			}
			welBaseLayer.css('overflow','hidden');
			htBeforeStyle["left"] = fromX+"px";
			htBeforeStyle["top"] = fromY +"px";
			htBeforeStyle["opacity"] = this._htLayerInfo['nOpacity'];
		}
		return {
			htStyle : htBeforeStyle ,
			htTransform : htTransform
		};
	}
}).extend(jindo.m.Effect);
