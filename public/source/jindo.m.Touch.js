jindo.m.Touch = jindo.$Class({
	$init : function(sId, htUserOption){
		this._el = jindo.$(sId);
		var htDefaultOption = {
			nMomentumDuration :350,
			nMoveThreshold : 7,
			nSlopeThreshold : 25,
			nLongTapDuration : 1000,
			nDoubleTapDuration : 400,
			nTapThreshold : 6,
			nPinchThreshold : 0.1,
			nRotateThreshold : 5,
			bActivateOnload : true	
		};
		this.option(htDefaultOption);
		this.option(htUserOption || {});
		this._initVariable();		
		this._setSlope();
		if(this.option("bActivateOnload")) {
			this.activate(); 
		}
	},
	_initVariable : function(){
		this._hasTouchEvent = 'ontouchstart' in window;
		this._radianToDegree  =  180/Math.PI;
		this._htMoveInfo={
			nStartX : 0,
			nStartY :0,
			nBeforeX : 0,
			nBeforeY : 0,
			nStartTime :0,
			nBeforeTime : 0,
			nStartDistance : 0,
			nBeforeDistance :0,
			nStartAngle : 0,
			nLastAngle : 0
		};
		this.bStart = false;
		this.bMove = false;
		this.nMoveType = -1;		
		this.htEndInfo ={};
		this._nVSlope = 0;
		this._nHSlope = 0;
		this.bSetSlope = false;
	},
	_attachEvents : function(){
		this._htEvent = {};
		var bTouch = this._hasTouchEvent;
		this._htEvent[bTouch? 'touchstart':'mousedown'] = {
			ref: jindo.$Fn(this._onStart, this).attach(this._el, (bTouch? 'touchstart':'mousedown')),
			el : this._el
		};
		this._htEvent[bTouch? 'touchmove':'mousemove'] = {
			ref: jindo.$Fn(this._onMove, this).attach(this._el, (bTouch? 'touchmove':'mousemove')),
			el : this._el
		};
		this._htEvent[bTouch? 'touchend':'mouseup'] = {
			ref: jindo.$Fn(this._onEnd, this).attach(this._el, (bTouch? 'touchend':'mouseup')),
			el : this._el
		};
		this._htEvent["rotate"] = jindo.$Fn(this._onResize, this).bind();
		jindo.m.bindRotate(this._htEvent["rotate"]);	
		if(bTouch){
			this._htEvent['touchcancel'] = {
				ref: jindo.$Fn(this._onCancel, this).attach(this._el, 'touchcancel'),
				el : this._el
			};
		}
	},
	_detachEvents : function(){		
		for(var p in this._htEvent){
			var htTargetEvent = this._htEvent[p];
			if (htTargetEvent.ref) {
				htTargetEvent.ref.detach(htTargetEvent.el, p);
			}
		}
		jindo.m.unbindRotate(this._htEvent["rotate"]);
		this._htEvent = null;
	},
	_onCancel : function(oEvent){
		this._onEnd(oEvent);		
	},
	_onStart : function(oEvent){		
		this._resetTouchInfo();
		var htInfo = this._getTouchInfo(oEvent);
		var htParam ={
			element : htInfo[0].el,
			nX : htInfo[0].nX,
			nY : htInfo[0].nY,
			oEvent : oEvent	
		};
		if(!this._fireCustomEvent('touchStart', htParam)){
			return;
		}
		this.bStart = true;
		//move info update
		this._htMoveInfo.nStartX = htInfo[0].nX;
		this._htMoveInfo.nBeforeX = htInfo[0].nX;
		this._htMoveInfo.nStartY = htInfo[0].nY;
		this._htMoveInfo.nBeforeY = htInfo[0].nY;
		this._htMoveInfo.nStartTime = htInfo[0].nTime;
		this._htMoveInfo.aStartInfo = htInfo;
		this._startLongTapTimer(htInfo, oEvent);
	},
	_onMove : function(oEvent){		
		if(!this.bStart){
			return;	
		}
		this.bMove = true;
		var htInfo = this._getTouchInfo(oEvent);
		var htParam = this._getCustomEventParam(htInfo, false);
		if(htInfo.length === 1){			
			if(this.nMoveType < 0 || this.nMoveType == 3 || this.nMoveType == 4){
				this.nMoveType = this._getMoveType(htInfo);
			}			
		}else{ 
			if(this.nMoveType !== 8){
				this.nMoveType = this._getMoveType(htInfo);
			}
		}
		htParam = this._getCustomEventParam(htInfo, false);
		if((typeof this._nLongTapTimer != 'undefined') && this.nMoveType != 3){
			this._deleteLongTapTimer();
		}
		htParam.oEvent = oEvent;
		var nDis = 0;
		if(this.nMoveType == 0){ 
			nDis = Math.abs(htParam.nVectorX);
		}else if(this.nMoveType == 1){ 
			nDis = Math.abs(htParam.nVectorY);
		}else{ 
			nDis = Math.abs(htParam.nVectorX) + Math.abs(htParam.nVectorY);
		}		
		//move간격이 옵션 설정 값 보다 작을 경우에는 커스텀이벤트를 발생하지 않는다
		if(nDis < this.option('nMoveThreshold')){
			return; 
		}
		if(!this.fireEvent('touchMove', htParam)){
			this.bStart = false;
			return;
		}
		this._htMoveInfo.nBeforeX = htInfo[0].nX;
		this._htMoveInfo.nBeforeY = htInfo[0].nY;
		this._htMoveInfo.nBeforeTime = htInfo[0].nTime;
	},
	_onEnd : function(oEvent){
		if(!this.bStart){
			return;
		}		
		this._deleteLongTapTimer();
		if(!this.bMove && (this.nMoveType != 4)){
			this.nMoveType = 3;
		}
		if(this.nMoveType < 0){
			return;
		}
		var htInfo = this._getTouchInfo(oEvent);
		if(this._isDblTap(htInfo[0].nX, htInfo[0].nY, htInfo[0].nTime)){			
			clearTimeout(this._nTapTimer);
			delete this._nTapTimer;
			this.nMoveType = 5; 
		}
		var htParam = this._getCustomEventParam(htInfo, true);
		htParam.oEvent = oEvent;
		var sMoveType = htParam.sMoveType;
		if( (typeof this._htEventHandler[jindo.m.MOVETYPE[5]] != 'undefined' && (this._htEventHandler[jindo.m.MOVETYPE[5]].length > 0))&& (this.nMoveType == 3) ){
			var self = this;			
			this._nTapTimer = setTimeout(function(){
				self.fireEvent('touchEnd', htParam);
				self._fireCustomEvent(sMoveType, htParam);				
				delete self._nTapTimer;
			}, this.option('nDoubleTapDuration'));	
		}else{
			this.fireEvent('touchEnd', htParam);
			if(this.nMoveType != 4){
				if(this.nMoveType === 8){
					htParam.sMoveType = jindo.m.MOVETYPE[6];
					this._fireCustomEvent(jindo.m.MOVETYPE[6], htParam);
					htParam.sMoveType = jindo.m.MOVETYPE[7];
					this._fireCustomEvent(jindo.m.MOVETYPE[7], htParam);
				}else{
					this._fireCustomEvent(sMoveType, htParam);
				}
			}
		}		
		this._updateTouchEndInfo(htInfo);		
		this._resetTouchInfo();
	},
	_fireCustomEvent :  function(sEvent, htOption){
		return this.fireEvent(sEvent, htOption);		
	},
	_getCustomEventParam : function(htTouchInfo, bTouchEnd){
		var sMoveType = jindo.m.MOVETYPE[this.nMoveType];
		var nDuration = htTouchInfo[0].nTime - this._htMoveInfo.nStartTime;		
		var nVectorX = nVectorY = nMomentumX = nMomentumY = nSpeedX= nSpeedY = nDisX= nDisY= 0;
		nDisX = (this.nMoveType === 1)? 0 : htTouchInfo[0].nX - this._htMoveInfo.nStartX; 
		nDisY = (this.nMoveType === 0)? 0 : htTouchInfo[0].nY -this._htMoveInfo.nStartY ; 
		nVectorX = htTouchInfo[0].nX - this._htMoveInfo.nBeforeX;
		nVectorY = htTouchInfo[0].nY - this._htMoveInfo.nBeforeY;
		if(bTouchEnd && (this.nMoveType == 0 || this.nMoveType == 1 || this.nMoveType == 2 )){
			if(nDuration <= this.option('nMomentumDuration')){
				nSpeedX = Math.abs(nDisX)/nDuration ;
				nMomentumX = (nSpeedX*nSpeedX) / 2;
				nSpeedY = Math.abs(nDisY)/nDuration ;
				nMomentumY =  (nSpeedY*nSpeedY) / 2;
			}
		}
		var htParam  = {
			element : htTouchInfo[0].el,
			nX : htTouchInfo[0].nX,
			nY : htTouchInfo[0].nY,
			nVectorX : nVectorX,
			nVectorY : nVectorY,
			nDistanceX : nDisX,
			nDistanceY : nDisY,
			sMoveType : sMoveType,
			nStartX : this._htMoveInfo.nStartX,
			nStartY : this._htMoveInfo.nStartY,
			nStartTimeStamp : this._htMoveInfo.nStartTime
		};
		if((htTouchInfo.length) > 1 || (this.nMoveType >= 6)){
			htParam.nScale = this._getScale(htTouchInfo);			
			htParam.nRotation = this._getRotation(htTouchInfo);			
			if(htParam.nScale === null){
				htParam.nScale = this._htMoveInfo.nBeforeScale;				
			}
			if(htParam.nRotation === null){
				htParam.nRotation = this._htMoveInfo.nBeforeRotation;
			}
		}
		if(htTouchInfo.length >= 1){
			var aX = [];
			var aY =[];
			var aElement = [];
			for(var i=0,nLen= htTouchInfo.length; i<nLen; i++){
				aX.push(htTouchInfo[i].nX);
				aY.push(htTouchInfo[i].nY);
				aElement.push(htTouchInfo[i].el);
			}
			htParam.aX = aX;
			htParam.aY = aY;
			htParam.aElement = aElement;
		}
		if(bTouchEnd){
			htParam.nMomentumX = nMomentumX;
			htParam.nMomentumY = nMomentumY;
			htParam.nSpeedX = nSpeedX;
			htParam.nSpeedY = nSpeedY;
			htParam.nDuration = nDuration;
		}		
		return htParam;	
	},
	_updateTouchEndInfo : function(htInfo){
		this.htEndInfo = {
			element: htInfo[0].el,
			time : htInfo[0].nTime,
			movetype : this.nMoveType,
			nX : htInfo[0].nX,
			nY : htInfo[0].nY
		};
	},
	_deleteLongTapTimer : function(){		
		if(typeof this._nLongTapTimer != 'undefined'){
			clearTimeout(this._nLongTapTimer);
			delete this._nLongTapTimer;
		}
	},	
	_startLongTapTimer : function(htInfo, oEvent){
		var self = this;
		if((typeof this._htEventHandler[jindo.m.MOVETYPE[4]] != 'undefined') && (this._htEventHandler[jindo.m.MOVETYPE[4]].length > 0)){
			self._nLongTapTimer = setTimeout(function(){
				self.fireEvent('longTap',{
					element :  htInfo[0].el,
					oEvent : oEvent,
					nX : htInfo[0].nX,
					nY : htInfo[0].nY
				});				
				delete self._nLongTapTimer;
				self.nMoveType = 4;
			}, self.option('nLongTapDuration'));
		}
	},
	_onResize : function(){
		this._setSlope();
	},
	_isDblTap : function(nX, nY, nTime){
		if((typeof this._nTapTimer != 'undefined') && this.nMoveType == 3){
			var nGap = this.option('nTapThreshold');
			if( (Math.abs(this.htEndInfo.nX - nX) <= nGap) && (Math.abs(this.htEndInfo.nY-nY) <= nGap) ){
				return true;
			}
		}		
		return false;
	},
	_setSlope : function(){
		if(!this.bSetSlope){
			this._nHSlope = ((window.innerHeight/2) / window.innerWidth).toFixed(2)*1;
			this._nVSlope = (window.innerHeight / (window.innerWidth/2)).toFixed(2)*1;
		}
	},
	setSlope : function(nVSlope, nHSlope){
		this._nHSlope = nHSlope;
		this._nVSlope = nVSlope;
		this.bSetSlope = true;
	},
	getSlope : function(){
		return{
			nVSlope :  this._nVSlope,
			nHSlope : this._nHSlope
		}
	},
	_resetTouchInfo : function(){		
		for(var x in this._htMoveInfo){
			this._htMoveInfo[x] = 0;
		}
		this._deleteLongTapTimer();
		this.bStart = false;
		this.bMove = false;
		this.nMoveType = -1;		
	},
	_getMoveTypeBySingle: function(x, y){
		var nType = this.nMoveType;
		var nX = Math.abs(this._htMoveInfo.nStartX - x);
		var nY = Math.abs(this._htMoveInfo.nStartY - y);		
		var nDis = nX + nY;
		var nGap = this.option('nTapThreshold');
		if((nX <= nGap) && (nY <= nGap)){
			nType = 3;
		}else{
			nType = -1;
		}
		if(this.option('nSlopeThreshold') <= nDis){
			var nSlope = parseFloat((nY/nX).toFixed(2),10);
			if((this._nHSlope === -1) && (this._nVSlope === -1)){
				nType = 2;
			}else{
				if(nSlope <= this._nHSlope){
					nType = 0;
				}else if(nSlope >= this._nVSlope){
					nType = 1;
				}else {
					nType = 2;
				}
			}
		}
		return nType;		
	},
	_getMoveTypeByMulti : function(aPos){
		var nType = -1;
		if((this.nMoveType === 6) ||  Math.abs(1- this._htMoveInfo.nBeforeScale) >= this.option('nPinchThreshold')){
			nType = 6;
		}
		if((this.nMoveType === 7) ||  Math.abs(0- this._htMoveInfo.nBeforeRotation) >= this.option('nRotateThreshold')){			
			if(nType === 6){
				nType = 8;
			}else{
				nType = 7;
			}
		}
		if(nType === -1){
			return this.nMoveType;
		}
		return nType;
	},
	_getScale : function(aPos){
		var nScale = -1;
		var nDistance = this._getDistance(aPos);
		if(nDistance <= 0){
			return null;
		}
		if(this._htMoveInfo.nStartDistance === 0){
			nScale = 1;
			this._htMoveInfo.nStartDistance = nDistance;
		}else{
			nScale = nDistance/this._htMoveInfo.nStartDistance;
		}
		this._htMoveInfo.nBeforeScale = nScale;
		return nScale;		
	},
	_getRotation : function(aPos){
		var nRotation = -1;
		var nAngle = this._getAngle(aPos);
		if(nAngle === null){
			return null;
		}
		if(this._htMoveInfo.nStartAngle === 0){
			this._htMoveInfo.nStartAngle = nAngle;
			nRotation = 0;
		}else{
			nRotation = nAngle- this._htMoveInfo.nStartAngle;
		}
		this._htMoveInfo.nLastAngle = nAngle;
		this._htMoveInfo.nBeforeRotation = nRotation;
		return nRotation;
	},
	_getMoveType : function(aPos){
		var nType = this.nMoveType;
		if(aPos.length === 1){
			nType = this._getMoveTypeBySingle(aPos[0].nX, aPos[0].nY);
		}else if(aPos.length === 2){ 
			nType = this._getMoveTypeByMulti(aPos);
		}		
		return nType;
	},
	_getDistance : function(aPos){
		if(aPos.length === 1){
			return -1;
		}
		 return Math.sqrt(
		       Math.pow(Math.abs(aPos[0].nX - aPos[1].nX), 2) +
		       Math.pow(Math.abs(aPos[0].nY - aPos[1].nY), 2)
		  );        
	},
	 _getAngle: function(aPos) {
		 if(aPos.length === 1){
			return null;
		 }
	      var deltaX = aPos[0].nX - aPos[1].nX,
	          deltaY = aPos[0].nY - aPos[1].nY;
		 var nAngle =  Math.atan2(deltaY, deltaX) * this._radianToDegree;
		 if(this._htMoveInfo.nLastAngle !== null){
			 var nDiff = Math.abs(this._htMoveInfo.nLastAngle - nAngle);
			 var nNext = nAngle + 360;
			 var nPrev = nAngle - 360;
			 if(Math.abs(nNext - this._htMoveInfo.nLastAngle) < nDiff){
				 nAngle = nNext;
			 }else if(Math.abs(nPrev - this._htMoveInfo.nLastAngle) < nDiff){
				 nAngle = nPrev;
			 }			 
		 }
		 return nAngle;
	 },
	_getTouchInfo : function(oEvent){
		var aReturn = [];
		var nTime = oEvent.$value().timeStamp;
		if(this._hasTouchEvent){
			var oTouch = oEvent.$value().changedTouches;
			for(var i=0, nLen = oTouch.length; i<nLen; i++){
				aReturn.push({
					el : jindo.m.getNodeElement(oTouch[i].target),
					nX : oTouch[i].pageX,
					nY : oTouch[i].pageY,
					nTime : nTime
				});
			}			
		}else{
			aReturn.push({
				el : oEvent.element,
				nX : oEvent.pos().pageX,
				nY : oEvent.pos().pageY,
				nTime : nTime
			});
		}		
		return aReturn;
	},
	getBaseElement : function(el){
		return this._el;
	},
	_onDeactivate : function(){
		this._detachEvents();
	},
	_onActivate : function(){
		this._attachEvents();
	},
	destroy: function() {
		this.deactivate();
		this._el = null;
		for(var p in this._htMoveInfo){
			this._htMoveInfo[p] = null;
		}
		this._htMoveInfo = null;
		for(var p in this.htEndInfo){
			this.htEndInfo[p] = null;
		}
		this.htEndInfo = null;
		this.bStart = null;
		this.bMove = null;
		this.nMoveType = null;		
		this._nVSlope = null;
		this._nHSlope = null;
		this.bSetSlope = null;
	}	
}).extend(jindo.UIComponent);
