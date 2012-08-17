jindo.m.CircularFlicking = jindo.$Class({
	$init : function(sId, htUserOption) {
		this.option({
			bHorizontal : true,
			sClassPrefix : 'flick-',
			nFlickThreshold : 40,
			nDuration : 100,
			nTotalContents : 3,
			nBounceDuration : 100,
			bActivateOnload : true,
			bUseCss3d : jindo.m._getDefaultUseCss3d()
		});
		this.option(htUserOption || {});		
		this._initVar();	
		this._setWrapperElement(sId);
		this._setElementSize();
		this._updatePanelPosition();		
		this._initTouch();
		this._focusFixedBug();
		if(this.option("bActivateOnload")) {
			this.activate();
		}
	},
	_initVar: function() {
		this._oTouch = null;
		this._bFlickLeft = null;
		this._elTransition = null;
		this._htIndexInfo = {
			nPanelIndex : 0,
			nContentIndex : 0,
			nNextPanelIndex :0,
			nNextContentIndex : 0
		};
		this._aCurrentPosition = [0,0,0];
		var htInfo = jindo.m.getDeviceInfo();
		var nVersion = parseInt(htInfo.version.substring(0,1),10);
		this.sTransformStart = "translate(";
		this.sTransformEnd = ")";
		this._isAndroid = htInfo.android;		
		this._isAndroid4 = htInfo.android &&  ( (htInfo.version.length>0)&&  (nVersion >= 4)) && (!htInfo.bChrome);
		this._isIos = (htInfo.iphone || htInfo.ipad);
		this._bUseCss3 = this.option('bUseCss3d');
		if(this._bUseCss3){
			this.sTransformStart = "translate3d(";
			this.sTransformEnd = ",0px)";
		}
		this._sCssPrefix = jindo.m.getCssPrefix();
		this._wfTransitionEnd = jindo.$Fn(this._onTransitionEnd, this).bind();
		this._aAnchor = null;
		this._fnDummyFnc = function(){return false;};
		this._bBlocked = false;
		this._isFlicking = false;
		this._bTouchStart = false;
		this._initAnimationStep();
	},
	_initAnimationStep : function(){
		this._htAnimationStep = {
				nPosPerTime : 0,
				nAnimateTime : 0,
				nBeforeTime : 0,
				nPos :0
		};
	},
	_initTouch : function(){
		this._oTouch = new jindo.m.Touch(this._htWElement.container.$value(),{
			nSlopeThreshold : 4,
			nMoveThreshold : 0,
			bActivateOnload : false
		});		
	},
	_setWrapperElement: function(el) {
		this._htWElement = {};
		el = jindo.$(el);
		var sClass = '.'+ this.option('sClassPrefix');
		this._htWElement.base = jindo.$Element(el);
		this._htWElement.container = jindo.$Element(jindo.$$.getSingle(sClass+'container',el));
		this._htWElement.container.css('overflow', 'hidden');
		var aPanel = jindo.$$(sClass+"panel", el);
		this._htWElement.aPanel = jindo.$A(aPanel).forEach(function(value,index, array){
			var wel = jindo.$Element(value);
			array[index] = wel;
			wel.css('position', 'absolute').css('width','100%').css('height','100%');		
		}).$value();			
		if(this._isAndroid) {
			this._htWElement.aDummyTag = [];
			for(var i=0,nLen = this._htWElement.aPanel.length;i<nLen;i++){
				var wel =this._htWElement.aPanel[i];
				var elDummyTag = jindo.$$.getSingle("._cflick_dummy_atag_", wel.$value());
				if(!elDummyTag){
					elDummyTag = jindo.$("<a href='javascript:void(0);' class='_cflick_dummy_atag_'></a>");
					elDummyTag.style.position = "absolute";
					elDummyTag.style.left = "-1000px";
					elDummyTag.style.top = "-1000px";
					elDummyTag.style.width = 0;
					elDummyTag.style.height = 0;
					wel.append(elDummyTag);	
				}
				this._htWElement.aDummyTag.push(elDummyTag);
			}	
		}			
	},
	_prepareTransition : function(){
		if(this._bUseCss3){		
			for(var i=0,nLen = this._htWElement.aPanel.length; i<nLen; i++){
				this._htWElement.aPanel[i].css(this._sCssPrefix + 'Transform', this.sTransformStart +"0px,0px" + this.sTransformEnd);	
			}
		}
	},
	_setElementSize : function(){
		if(this.option('bHorizontal')){
			this._htWElement.container.width(this._htWElement.base.width() * 3).height(this._htWElement.base.height());
		}else{
			this._htWElement.container.width(this._htWElement.base.width()).height(this._htWElement.base.height());
		}		
	},	
	_setAnchorElement : function(el){
		//ios에서만 처리되도록 수정.
		if(this._isIos ){
			this._aAnchor = jindo.$$("A", this._htWElement.container.$value());
		}
	},
	_updatePanelPosition : function(){
		this._aCtPosition = [];
		var el = this._htWElement.base.$value();
		var nW = this.option('bHorizontal')? el.clientWidth : el.clientHeight;
		this._htPositionInfo = {
			left : nW*-1,
			center : 0,
			right : nW*1
		};
	},
	_onResize : function(){
		this.refresh(this.getPanelIndex(), true);
	},
	getPanelIndex : function(){
		return this._htIndexInfo.nPanelIndex;
	},
	getPanelElement : function(){
		return this._htWElement.aPanel[this.getPanelIndex()];
	},
	getRightPanelIndex : function(){
		var n = this.getPanelIndex() +1;		
		n = (n > 2 )? 0 : n;
		return n;
	},
	getRightPanelElement : function(){		
		return this._htWElement.aPanel[this.getRightPanelIndex()];
	},
	getLeftPanelIndex : function(){
		var n = this.getPanelIndex() -1;		
		n = (n <0 )? 2 : n;
		return n;
	},	
	getLeftPanelElement : function(){
		return this._htWElement.aPanel[this.getLeftPanelIndex()];
	},	
	setContentIndex : function(n, bRefresh){
		if(!this.isActivating()){
			return;
		}
		if(typeof bRefresh === 'undefined'){
			bRefresh = true;
		}
		n = parseInt(n,10);
		if(n < 0 || n > (this.option('nTotalContents')-1)){
			return;
		}
		if(bRefresh){
			if(!this._fireCustomEvent('beforeMove',{
				nPanelIndex : this.getPanelIndex(), 
				nContentIndex : this.getContentIndex(),
				nNextPanelIndex : n%3,
				nNextContentIndex: n
			})){
				return;
			}
		}
		this._htIndexInfo.nContentIndex = n;
		this._htIndexInfo.nPanelIndex = n % 3;
		this._htIndexInfo.nNextContentIndex = n;
		this._htIndexInfo.nNextPanelIndex = n % 3;
		if(bRefresh){
			this.refresh(this._htIndexInfo.nPanelIndex, false, true);
		}
	},
	getContentIndex : function(){
		return this._htIndexInfo.nContentIndex;
	},
	getRightContentIndex : function(){
		var n = this.getContentIndex()+1;
		n = ((n+1) > this.option('nTotalContents'))? 0 : n;
		return n;
	},	
	getLeftContentIndex : function(){
		var n = this.getContentIndex()-1;		
		n =  (n <0)? (this.option('nTotalContents')-1): n;
		return n;
	},
	_attachTouchEvt : function(){
		this._oTouch.attach({
			touchMove : this._htEvent["touchMove"],
			touchEnd :  this._htEvent["touchEnd"],
			longTap :  this._htEvent["longTap"]
		});		
	},
	_detachTouchEvt : function(){
		this._oTouch.detach({
			touchMove: this._htEvent["touchMove"],
			touchEnd: this._htEvent["touchEnd"],
			longTap: this._htEvent["longTap"]
		});
	},
	_onStart : function(oCustomEvt){
		this._detachTouchEvt();	
		if (this._isFlicking) {
			return;
		}
		if(!this.fireEvent('touchStart', oCustomEvt)){
			return;
		}
		this._bTouchStart = true;
		this._clearAnchor();		
		this._attachTouchEvt();
	},
	_onMove : function(oCustomEvt){		
		var bH = this.option('bHorizontal');
		var weParent = oCustomEvt.oEvent;
		if(oCustomEvt.sMoveType === jindo.m.MOVETYPE[0]) {	
			if(bH) {
				weParent.stop(jindo.$Event.CANCEL_ALL);
			}else{
				return;
			}
		} else if(oCustomEvt.sMoveType === jindo.m.MOVETYPE[1]) {	
			if(!bH) {
				weParent.stop(jindo.$Event.CANCEL_ALL);
			}else{
				return;
			} 
		}else if(oCustomEvt.sMoveType === jindo.m.MOVETYPE[2]) { 
			weParent.stop(jindo.$Event.CANCEL_ALL);
		}
		if(this._isFlicking){
			return;
		}
		if(!this._bTouchStart){ return;}
		this.fireEvent('touchMove', oCustomEvt);
		var nDis = bH? oCustomEvt.nVectorX : oCustomEvt.nVectorY;
		this._movePanels(nDis);
	},
	_onEnd : function(oCustomEvt, nTime){	
		this._detachTouchEvt();
		if (this._isFlicking) {
			return;
		}
		if(!this._bTouchStart){ return;}
		this._isFlicking = true;
		var htInfo = this._getSnap(oCustomEvt.nDistanceX, oCustomEvt.nDistanceY, nTime);
		if (oCustomEvt.sMoveType === jindo.m.MOVETYPE[0] || oCustomEvt.sMoveType === jindo.m.MOVETYPE[1] || oCustomEvt.sMoveType === jindo.m.MOVETYPE[2]) {			
			oCustomEvt.oEvent.stop(jindo.$Event.CANCEL_ALL);
		}
		if (oCustomEvt.sMoveType === jindo.m.MOVETYPE[3] || oCustomEvt.sMoveType === jindo.m.MOVETYPE[4]) {
			this._restoreAnchor();
		}
		var nPanelIndex = this.getPanelIndex();
		var nDis = this.option('bHorizontal')? htInfo.nX: htInfo.nY;
		if(nPanelIndex == htInfo.nPanelIndex){
			if(nDis === 0){
				this._onTransitionEnd();
			}else{
				this._movePanels(nDis, this.option('nBounceDuration'), false);
			}
			return;
		}
		var htParam = {
				nPanelIndex : nPanelIndex, 
				nContentIndex : this.getContentIndex(),
				nNextPanelIndex : htInfo.nPanelIndex,
				nNextContentIndex: htInfo.nContentIndex
		};
		if(this._bFlickLeft !== null){
			if(this.option('bHorizontal')){
				htParam.bLeft = this._bFlickLeft;
			}else{
				htParam.bTop = this._bFlickLeft;
			}
		}
		if(!this._fireCustomEvent('beforeFlicking',htParam)){
			return;
		}	
		this._htIndexInfo.nNextPanelIndex = htInfo.nPanelIndex;
		this._htIndexInfo.nNextContentIndex = htInfo.nContentIndex;		
		this._movePanels(nDis, htInfo.nTime, false);
		this.fireEvent('touchEnd', oCustomEvt);		
	},
	_movePanels : function(nPos, nTime, bMove){
		if(typeof nTime === 'undefined'){
			nTime = 0;
		}
		if(typeof bMove === 'undefined'){
			bMove = true;
		}
		var aPanel = this._htWElement.aPanel;
		if(this._bUseCss3 || (nTime === 0)){
			for(var i=0,nLen = aPanel.length; i<nLen;i++){
				var nNewPos = (bMove)? this._aCurrentPosition[i]+ nPos : nPos;
				this._setPosition(aPanel[i], nNewPos, nTime);
				this._aCurrentPosition[i] =  nNewPos;
			}
		}else{
			var nPosPerTime = (nPos - this._aCurrentPosition[1])/nTime;
			this._htAnimationStep.nPosPerTime = nPosPerTime;
			this._htAnimationStep.nAnimateTime = nTime;
			var startTime = Date.now();
			this._htAnimationStep.nBeforeTime = startTime;
			this._htAnimationStep.nPos = nPos;
			var self = this;
			(function animate(){
				var now = Date.now(), i, nLen;
				if(now >= (startTime + self._htAnimationStep.nAnimateTime)){
					for(i=0,nLen =  self._htWElement.aPanel.length; i<nLen;i++){		
						self._setPosition( self._htWElement.aPanel[i], self._htAnimationStep.nPos, 0);						
					}
					clearTimeout(self._nTimerAnimate);
					delete self._nTimerAnimate;
					self._initAnimationStep();
					self._onTransitionEnd();
					return;
				}
				var nGap = (now - self._htAnimationStep.nBeforeTime);
				self._htAnimationStep.nBeforeTime = now;
				var nPos = self._htAnimationStep.nPosPerTime * nGap;
				var aPanel = self._htWElement.aPanel;
				for(i=0,nLen = aPanel.length; i<nLen;i++){
					var nNewPos =self._aCurrentPosition[i]+ nPos;			
					self._setPosition(aPanel[i], nNewPos, 0);
					self._aCurrentPosition[i] =  nNewPos;
				}
				self._nTimerAnimate = setTimeout(animate, 1);	
			})();
		}
	},
	_focusFixedBug : function(){	
		if(typeof this._htWElement.aDummyTag === 'undefined'){
			return;
		}
		for(var i=0,nLen= this._htWElement.aDummyTag.length;i<nLen;i++){
			this._htWElement.aDummyTag[i].focus();
		}
	},
	_getSnap : function(nDistanceX, nDistanceY, nDuration){
		var nFinalDis = this.option('bHorizontal')? nDistanceX : nDistanceY;
		var nNewPos = this._htPositionInfo.center;
		var nTime = (typeof nDuration != 'undefined')? nDuration : this.option('nDuration');
		var nPanelIndex = this.getPanelIndex();
		var nContentIndex = this.getContentIndex();
		if(Math.abs(nFinalDis) > this.option('nFlickThreshold') ){
			if(nFinalDis < 0 ){ 
				nNewPos = this._htPositionInfo.left;
				nPanelIndex = this.getRightPanelIndex();
				nContentIndex =  this.getRightContentIndex();
				this._bFlickLeft = true; 
			}else{ 
				nNewPos = this._htPositionInfo.right;
				nPanelIndex = this.getLeftPanelIndex();
				nContentIndex = this.getLeftContentIndex();
				this._bFlickLeft = false;
			}		
		}
		return {
			nX : nNewPos,
			nY : nNewPos,
			nTime : nTime,
			nPanelIndex : nPanelIndex,
			nContentIndex : nContentIndex
		};		
	},
	_setPosition : function(wel, nPos, nTime){
		if(typeof nTime == 'undefined'){
			nTime = 0;
		}	
		var nX = this.option('bHorizontal')? nPos : 0;
		var nY = this.option('bHorizontal')? 0 : nPos;
		if(nTime > 0){
			this._attachTransitionEnd(wel.$value());
		}
		if(nTime !== 0){
			nTime +="ms";
		}
		var htCss = {};
		htCss[this._sCssPrefix+'TransitionProperty'] = "-webkit-transform";
		htCss[this._sCssPrefix+'TransitionDuration'] = nTime;
		htCss[this._sCssPrefix+'Transform'] = this.sTransformStart + nX +"px,"+nY+"px" +this.sTransformEnd;
		wel.css(htCss);
	},
	_clearAnchor : function() {
		if(this._aAnchor && !this._bBlocked) {
			var aClickAddEvent = null;
			for(var i=0, nILength=this._aAnchor.length; i<nILength; i++) {
				if (this._fnDummyFnc !== this._aAnchor[i].onclick) {
					this._aAnchor[i]._onclick = this._aAnchor[i].onclick;
				}
				this._aAnchor[i].onclick = this._fnDummyFnc;
				aClickAddEvent = this._aAnchor[i].___listeners___ || [];
				for(var j=0, nJLength = aClickAddEvent.length; j<nJLength; j++) {
					___Old__removeEventListener___.call(this._aAnchor[i], "click", aClickAddEvent[j].listener, aClickAddEvent[j].useCapture);
				}
			}
			this._bBlocked = true;		
		}
	},
	_restoreAnchor : function() {
		if(this._aAnchor && this._bBlocked) {
			var aClickAddEvent = null;
			for(var i=0, nILength=this._aAnchor.length; i<nILength; i++) {
				if(this._fnDummyFnc !== this._aAnchor[i]._onclick) {
					this._aAnchor[i].onclick = this._aAnchor[i]._onclick;	
				} else {
					this._aAnchor[i].onclick = null;
				}
				aClickAddEvent = this._aAnchor[i].___listeners___ || [];
				for(var j=0, nJLength = aClickAddEvent.length; j<nJLength; j++) {
					___Old__addEventListener___.call(this._aAnchor[i], "click", aClickAddEvent[j].listener, aClickAddEvent[j].useCapture);	
				}				
			}
			this._bBlocked = false;	
		}
	},
	moveNext : function(nDuration){
		if(!this.isActivating()){
			return;
		}
		this._bTouchStart = true;
		var n = this.option('nFlickThreshold')*-1;
		this._onEnd({
			nDistanceX : n-10,
			nDistanceY : n-10
		}, nDuration);		
	},
	movePrev : function(nDuration){
		if(!this.isActivating()){
			return;
		}
		var n = this.option('nFlickThreshold');	
		this._bTouchStart = true;
		this._onEnd({
			nDistanceX : n+10,
			nDistanceY : n+10
		}, nDuration);
	},
	refresh : function(n, bResize, bFireEvent){
		if(!this.isActivating()){
			return;
		}
		if(typeof bResize === 'undefined'){
			bResize = false;
		}
		if(typeof bFireEvent === 'undefined'){
			bFireEvent = false;
		}
		if(bResize){
			this._setElementSize();
			this._updatePanelPosition();
		}
		if(typeof n === 'undefined'){
			n = this.getPanelIndex();
		}
		if(this._htIndexInfo.nPanelIndex != n){
			this._htIndexInfo.nPanelIndex = n;
		}
		var nCenter = this.getPanelIndex();
		var nLeft = this.getLeftPanelIndex();
		var nRight = this.getRightPanelIndex();
		var sPosition = this.option('bHorizontal')? 'left':'top';
		if(this._isAndroid4 && !this.option('bHorizontal')){
			var self = this;
			setTimeout(function(){
				self._htWElement.aPanel[nCenter].css(sPosition, self._htPositionInfo.center).css('zIndex',10);
				self._htWElement.aPanel[nLeft].css(sPosition, self._htPositionInfo.left).css('zIndex',1);
				self._htWElement.aPanel[nRight].css(sPosition, self._htPositionInfo.right).css('zIndex',1);
			},0);
		}else{
			this._htWElement.aPanel[nCenter].css(sPosition, this._htPositionInfo.center).css('zIndex',10);
			this._htWElement.aPanel[nLeft].css(sPosition, this._htPositionInfo.left).css('zIndex',1);
			this._htWElement.aPanel[nRight].css(sPosition, this._htPositionInfo.right).css('zIndex',1);
		}
		//ios 업데이트
		this._restoreAnchor();		
		this._setAnchorElement();		
		if(bFireEvent){
			this._fireCustomEvent('move');
		}		
	},
	_onTransitionEnd : function(evt){
		this._detachTransitionEnd();
		var bFireEvent = false;
		if(this._htIndexInfo.nPanelIndex != this._htIndexInfo.nNextPanelIndex){
			bFireEvent = true; 
		}
		jindo.$A(this._htWElement.aPanel).forEach(function(value, i, array){
			value.$value().style[this._sCssPrefix +'TransitionDuration'] = null;
			if(this._bUseCss3){
				value.$value().style[this._sCssPrefix + 'Transform'] = this.sTransformStart + "0px,0px" + this.sTransformEnd;
			}else{
				value.$value().style[this._sCssPrefix +'Transform'] = '';
			}			
		},this);
		this._htIndexInfo.nContentIndex = this._htIndexInfo.nNextContentIndex;				
		this.refresh(this._htIndexInfo.nNextPanelIndex);
		this._focusFixedBug();
		if(bFireEvent){
			this._fireCustomEvent('afterFlicking');
		}
		this._bFlickLeft = null;
		this._aCurrentPosition = [0,0,0];	
		this._isFlicking = false;
		this._bTouchStart = false;
	},	
	_fireCustomEvent : function(sEventName, htParam){
		if(typeof htParam === 'undefined'){
			htParam =  {
				nPanelIndex : this.getPanelIndex(), 
				nContentIndex : this.getContentIndex(),
				nContentLeftIndex : this.getLeftContentIndex(),
				nContentRightIndex : this.getRightContentIndex(),
				nPanelLeftIndex : this.getLeftPanelIndex(),
				nPanelRightIndex : this.getRightPanelIndex()
			};
			if(this.option('bHorizontal')){
				htParam.bLeft = this._bFlickLeft;
			}else{
				htParam.bTop = this._bFlickLeft;
			}
		}		
		return this.fireEvent(sEventName,htParam);		
	},
	_attachTransitionEnd : function(el){
		if(el === this._htWElement.aPanel[this.getPanelIndex()].$value()){
			this._elTransition = el;
			jindo.m.attachTransitionEnd(this._elTransition, this._wfTransitionEnd);
		}
	},
	_detachTransitionEnd : function(){
		if(this._elTransition){
			jindo.m.detachTransitionEnd(this._elTransition, this._wfTransitionEnd);
		}
	},	
	_onActivate : function() {
		this._attachEvent();
		this._oTouch.activate();
		this._prepareTransition();
		this.refresh();
	},
	_onDeactivate : function() {
		this._detachEvent();
		this._oTouch.deactivate();
	},
	_attachEvent : function() {
		this._htEvent = {};		
		this._htEvent["rotate"] = jindo.$Fn(this._onResize, this).bind();
		jindo.m.bindRotate(this._htEvent["rotate"]);
		this._htEvent["touchMove"] = jindo.$Fn(this._onMove, this).bind();		
		this._htEvent["touchEnd"] = jindo.$Fn(this._onEnd, this).bind();
		this._htEvent["touchStart"] = jindo.$Fn(this._onStart, this).bind();
		this._oTouch.attach("touchStart", this._htEvent["touchStart"]);
		this._htEvent["pageshow"] = jindo.$Fn(this._onPageShow, this).bind();
		jindo.m.bindPageshow(this._htEvent["pageshow"]);		
	},
	_onPageShow : function(){
		this._onResize();
	},
	_detachEvent : function() {		
		jindo.m.unbindRotate(this._htEvent["rotate"]);
		jindo.m.unbindPageshow(this._htEvent["pageshow"]);
		this._oTouch.detachAll();
		this._htEvent = null;
	},
	destroy: function() {
		this.deactivate();
		for(var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		for(p in this._htIndexInfo){
			this._htIndexInfo[p] = null;
		}
		this._oTouch.destroy();
		this._elTransition = null;
		this._oTouch = null;
		this._bFlickLeft = null;
		this._isAndroid  = null;
		this._isAndroid4 = null;
		this._aCurrentPosition = null;
		this.sTransformStart = null;
		this.sTransformEnd  = null;
		this._isIos = null;
		this._bUseCss3 = null;
		this._aAnchor = null;
		this._fnDummyFnc = null;
		this._sCssPrefix = null;
		this._bBlocked = null;
		this._isFlicking  = null;
		this._bTouchStart = null;
		for(p in this._htAnimationStep){
			this._htAnimationStep[p] = null;
		}
		this._htAnimationStep  = null;
	}
}).extend(jindo.UIComponent);
