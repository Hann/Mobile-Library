jindo.m.Flicking = jindo.$Class({
	$init : function(sId,htUserOption) {
		this.option({
			bHorizontal : true,
			sClassPrefix : 'flick-',
			bActivateOnload : true,
			nDefaultIndex: 0,
			bAutoResize : true,
			bAutoSize : true,
			nFlickThreshold : 40,
			nDuration : 200,
			nFlickDistanceOffset : null,
			bUseCss3d : jindo.m._getDefaultUseCss3d()
		});
		this.option(htUserOption || {});		
		this._setWrapperElement(sId);		
		this._initVar();
		this._setSize();
		this._initScroll();
		this._updateSizeInfo();		
		if(this.option("bActivateOnload")) {
			this.activate();
			this.moveTo(this.option('nDefaultIndex'), 0);
		}
	},
	_initScroll : function(){
		this._oCore = new jindo.m.CoreScroll(this._htWElement.base.$value(),{
			 bUseHScroll : this.option('bHorizontal'),
			 bUseVScroll : !this.option('bHorizontal'),
			 bUseMomentum : false,
			 bUseCss3d : this.option('bUseCss3d'),
			 bActivateOnload : false
		});
		this._oCore.attach({
			'beforeScroll' : jindo.$Fn(this._onBeforeScrollEnd, this).bind(),
			'afterScroll' : jindo.$Fn(this._onScrollEnd, this).bind(),
			'beforeTouchStart' : jindo.$Fn(this._onBeforeTouchStart, this).bind(),
			'beforeTouchMove' : jindo.$Fn(this._onBeforeTouchMove, this).bind(),
			'beforeTouchEnd' : jindo.$Fn(this._onBeforeTouchMove, this).bind()
		});
	},
	_initVar: function() {
		this.bHorizontal = (this.option('bHorizontal'))? true : false;	
		this.nCurrentIndex = this.option('nDefaultIndex');
		this.nNextIndex = this.nCurrentIndex;
		this.bResizeing = false;
	},
	_setWrapperElement: function(el) {
		this._htWElement = {};
		el = jindo.$(el);
		var sClass = '.'+ this.option('sClassPrefix');
		this._htWElement.base = jindo.$Element(el);
		this._htWElement.wrapper = jindo.$Element(jindo.$$.getSingle(sClass+'container',el));
		var aContents = jindo.$$(sClass+"ct", el);
		this._htWElement.aContent = jindo.$A(aContents).forEach(function(value,index, array){
			array[index] = jindo.$Element(value);
		}).$value();		
	},
	_setSize : function(){
		if(!this.option('bAutoSize')) return;
		var nLen = this._htWElement.aContent.length;
		if(this.bHorizontal){
			var nW = this._htWElement.base.width();
			this._htWElement.wrapper.width(nW *nLen);
			jindo.$A(this._htWElement.aContent).forEach(function(value){
				value.width(nW);
			});
		}else{
			var nH = this._htWElement.aContent[0].height();
			this._htWElement.wrapper.height(nH*nLen);			
		}
	},
	_updateSizeInfo : function(){
		var sLen = this.bHorizontal? 'width' : 'height';
		var sOff = this.bHorizontal? 'left' : 'top';
		this._htPosition = [];
		var nPos = 0;
		var nBeforePos = 0;
		for(var i=0,nLen = this._htWElement.aContent.length; i<nLen;i++){
			if(i != 0){
				if(this.option('nFlickDistanceOffset') === null){
					nPos += this._htWElement.aContent[i-1][sLen]()*-1;
				}else{
					var nW = this._htWElement.aContent[i-1][sLen]()*-1;
					nPos = nBeforePos + nW + (this.option('nFlickDistanceOffset')*-1);
					nBeforePos +=nW;					
				}
			}			
			this._htPosition.push(nPos);			
		}
	},
	_onBeforeTouchStart : function(oCustomEvt){
		if(!this.fireEvent('touchStart',{
			element : oCustomEvt.oEvent.element,
			nX : oCustomEvt.oEvent.nX,
			nY : oCustomEvt.oEvent.nY,
			oEvent : oCustomEvt.oEvent.oEvent
		})){
			oCustomEvt.stop();
		}
	},
	_onBeforeTouchMove : function(oCustomEvt){
		var sType = (oCustomEvt.sType.indexOf('End')> -1)? "touchEnd" : "touchMove";
		var htParam  = {};
		for(var p in oCustomEvt.oEvent){
			if(typeof oCustomEvt.oEvent[p] !== 'object' && typeof oCustomEvt.oEvent[p] !== 'function'){
				htParam[p] = oCustomEvt.oEvent[p];
			}
		}
		htParam['sType'] = sType;
		this.fireEvent(sType,htParam);		
	},
	_onBeforeScrollEnd :function(oCustomEvt){
		var nOrignalTime = oCustomEvt.nTime;
		var htPos = this._getSnap(oCustomEvt.nLeft, oCustomEvt.nTop, oCustomEvt.nDistanceX, oCustomEvt.nDistanceY,oCustomEvt.nMomentumX,oCustomEvt.nMomentumY);
		oCustomEvt.nNextLeft = htPos.nX;
		oCustomEvt.nNextTop = htPos.nY;
		oCustomEvt.nTime = htPos.nTime;
		if(!this.fireEvent('beforeFlicking',{
			nContentsIndex : this.getContentIndex(),
			nContentsNextIndex : htPos.nIndex
		})){
			oCustomEvt.stop();
			return;
		}
		this.nNextIndex = htPos.nIndex;
	},
	_onScrollEnd : function(){
		if(!this.bResizeing && (this.nNextIndex != this.nCurrentIndex)){
			this._setContentIndex(this.nNextIndex);
			this.fireEvent('afterFlicking',{
				nContentsIndex : this.getContentIndex()
			});
		}
		if(this.bResizeing){
			this.bResizeing = false;
		}
	},
	_getSnap : function(nX, nY, nDisX, nDisY, nMomX, nMomY){
		var nPosX = nPosY = nNewPos = 0;
		var nIndex = this._htWElement.aContent.length-1;
		var nCurrent = this.bHorizontal? nX : nY;
		var nDis = this.bHorizontal? nDisX : nDisY;
		var nMom = this.bHorizontal? nMomX : nMomY;
		for(var i=0,nLen = this._htPosition.length; i<nLen; i++){				
			if(nCurrent >= (this._htPosition[i])){
				nIndex = i;
				break;
			}				
		}
		if (nIndex == this.nCurrentIndex && nIndex > 0 && nDis > 0) nIndex--;
		if((Math.abs(nDis) <=  this.option('nFlickThreshold')) ){
			if(!(!jindo.m.getDeviceInfo().android && nMom != 0)){
				nIndex = this.nCurrentIndex;
			}
		}
		nNewPos = this._htPosition[nIndex];
		var nSize = Math.abs(this._htPosition[nIndex] -  this._htPosition[this.nCurrentIndex]); 	
		var nGap = nSize? Math.abs((nNewPos - nCurrent)/nSize) : 0;
		var nTime = ( !jindo.m.getDeviceInfo().android && (nMom != 0))? Math.round(this.option('nDuration')*nGap*0.5) : this.option('nDuration');		
		nTime = Math.min(nTime, this.option('nDuration'));
		return {
			nX : this.bHorizontal? nNewPos : nPosX,
			nY : this.bHorizontal? nPosY : nNewPos,
			nTime : Math.round(nTime),
			nIndex : nIndex
		}
	},
	_getPosition :function(nIndex){
		var nPosX = nPosY = 0;
		if(typeof nIndex == 'undefined'){
			nIndex = this.nCurrentIndex;
		}
		nIndex = Math.max(0,nIndex);
		nIndex = Math.min(this._htPosition.length-1, nIndex);
		return {
			nX : this.bHorizontal? this._htPosition[nIndex]: nPosX,
			nY : this.bHorizontal? nPosY : this._htPosition[nIndex]
		}		
	},
	_setContentIndex : function(nIndex){
		this.nCurrentIndex = nIndex;
	},
	getContentIndex : function(){
		return this.nCurrentIndex;
	},
	getContentElement: function(){
		return this._htWElement.aContent[this.getContentIndex()];
	},
	getTotalContents : function(){
		return this._htWElement.aContent.length;
	},
	getPrevIndex : function(){
		return Math.max(this.nCurrentIndex-1,0);
	},
	getPrevElement : function(){
		if(this.nCurrentIndex-1 < 0){
			return null;
		}else{
			return this._htWElement.aContent[this.nCurrentIndex-1];
		}
	},
	getNextIndex : function(){
		return Math.min(this.nCurrentIndex+1, this._htWElement.aContent.length-1);
	},
	getNextElement : function(){
		if(this.nCurrentIndex+1 > this._htWElement.aContent.length-1){
			return null;
		}else{
			return this._htWElement.aContent[this.nCurrentIndex+1];
		}
	},
	moveTo : function(nIndex, nTime){
		if(nIndex < 0 || nIndex > this._htWElement.aContent.length-1){
			return;
		}
		if(typeof nTime == 'undefined'){
			nTime = this.option('nDuration');
		}
		var htPos = this._getPosition(nIndex);
		this.nNextIndex = nIndex;
		var htCurPos = this._oCore.getCurrentPos();
		if((htPos.nY !== htCurPos.nTop) || (htPos.nX !== htCurPos.nLeft)){		
			this._oCore.scrollTo(htPos.nX, htPos.nY, nTime);
		}else{
			this._onScrollEnd();
		}
	},
	movePrev : function(nTime){
		this.moveTo(this.getPrevIndex(), nTime);
	},
	moveNext : function(nTime){
		this.moveTo(this.getNextIndex(), nTime);		
	},
	isAnimating : function(){
		return this._oCore.isMoving();
	},
	_onResize : function(evt){
		if(!this.option('bAutoResize')) return;
		this.refresh();	
	},
	refresh : function(nIndex, bResize){
		if(typeof bResize === 'undefined'){
			bResize = true;
		}
		if(typeof nIndex === 'undefined'){
			nIndex = this.nCurrentIndex;
		}
		if(bResize){
			this._setSize();
			this._updateSizeInfo();
			this._oCore.refresh(true);	
			this.bResizeing = true;
		}
		this.moveTo(nIndex, 0);			
	},
	_onActivate : function() {
		this._oCore.activate();
		this._attachEvent();
	},
	_onDeactivate : function() {
		this._oCore.deactivate();
		this._detachEvent();
	},
	_attachEvent : function() {
		this._htEvent = {};		
		this._htEvent["rotate"] = jindo.$Fn(this._onResize, this).bind();
		jindo.m.bindRotate(this._htEvent["rotate"]);
	},
	_detachEvent : function() {
		for(p in this._htEvent) {
			var htTargetEvent = this._htEvent[p];
			if (htTargetEvent.ref) {
				htTargetEvent.ref.detach(htTargetEvent.el, p);
			}
		}
		jindo.m.unbindRotate(this._htEvent["rotate"]);
		this._htEvent = null;
	},
	destroy: function() {
		this.deactivate();
		this._oCore.destroy();
		delete this._oCore;
		for(var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		this._htWElement = null;
		this.bHorizontal = null;
		this.nCurrentIndex = null;	
		this._htPosition = null;
	}
}).extend(jindo.UIComponent);
