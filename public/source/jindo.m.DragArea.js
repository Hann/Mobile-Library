jindo.m.DragArea = jindo.$Class({
	$init : function(el, htUserOption) {
		this.option({
			sClassPrefix : 'drag-',
			bFlowOut : false, 
			nThreshold : 10,
			nMoveThreshold : 3,
			bActivateOnload : true
		});
		this.option(htUserOption || {});
		this._initVar();		
		this._setWrapperElement(el);
		this._initTouch();
		this._setAnchorElement();
		if(this.option("bActivateOnload")) {
			this.activate();
		}
	},
	_initVar: function() {
		this._oTouch = null;
		this._sDragClass = '.'+ this.option('sClassPrefix')+"dragging";
		this._sHandleClass = '.'+this.option('sClassPrefix')+"handle";
		this._htInfo = {
			elDrag : null,
			elHandle : null,
			nStartX : null,
			nStartY : null,
			nX : null,
			nY : null,
			bDragStart : false, 
			nCount : 0, 
			bPrepared : false 
		};
		this._sCssUserSelect = "-"+jindo.m.getCssPrefix()+"-user-select";
		this._sCssUserSelectValue = document.body.style[this._sCssUserSelect];
		var htInfo = jindo.m.getDeviceInfo();
		this._isIos = (htInfo.iphone || htInfo.ipad);
		this._aAnchor = null;
		this._fnDummyFnc = function(){return false;};
		this._bBlocked = false;
		var nVersion = parseFloat(htInfo.version,10);
		this._bTouchStop = false;
		this._bTouchStop = htInfo.android && ((nVersion == 2.1) || (nVersion >= 3 ));
		if(!this._bTouchStop){
			this._bTouchStop = htInfo.iphone && (nVersion >= 3 && nVersion <4 );
		}
	},
	_setWrapperElement: function(el) {
		this._htWElement = {};
		el = jindo.$(el);
		this._htWElement.base = jindo.$Element(el);
	},
	_initTouch : function(){
		if(!this._oTouch){
			this._oTouch = new jindo.m.Touch(this._htWElement.base.$value(),{
				nSlopeThreshold : 1,
				nMoveThreshold : this.option('nMoveThreshold'),
				bActivateOnload : false
			});
			this._oTouch.setSlope(-1,-1);
		}
	},
	_getDragElement : function(el, sClass){		
		if (jindo.$$.test(el, "input[type=text], textarea, select")){
			return null;
		} 
		var self = this;
		var isChildOfDragArea = function(baseElement, el) {
			if (!el) {
				return false;
			}
			if (baseElement === document ||baseElement === el) {
				return true;
			} 
			return jindo.$Element(baseElement).isParentOf(el);
		};
		var elReturn = jindo.$$.test(el, this._sDragClass) ? el : jindo.m.getClosest(this._sDragClass, el);
		if (!isChildOfDragArea(this._htWElement.base, elReturn)) {
			elReturn = null;
		}		
		var elHandle =null;
		if(elReturn){
			try{
				elHandle = jindo.$$.getSingle(this._sHandleClass, elReturn);
			}catch(e){
			}
			if(elHandle){
				if (!isChildOfDragArea(elHandle, el)) {
					elReturn = null;
				}	
			}
		}		
		return {
			elDrag : elReturn,
			elHandle : elHandle
		};
	},
	_onStart : function(oCustomEvt){
		if(!this.isActivating()){
			return;
		}
		this._initInfo();
		var htElement = this._getDragElement(oCustomEvt.element, this._sHandleClass );
		if(!htElement.elDrag){return;}
		var htParam = {
			elHandle :	 htElement.elHandle,
			elDrag : htElement.elDrag,
			oEvent : oCustomEvt.oEvent	
		};
		if(!this.fireEvent('handleDown',htParam)){
			return;
		}
		if(this._bTouchStop){
			oCustomEvt.oEvent.stop();
		}
		this._htInfo.bPrepared = true;
		//ios일 경우 A태그에 대한 클릭을 방지 코드
		this._clearAnchor();
		this._htInfo.welDrag = jindo.$Element(htParam.elDrag);
		this._htInfo.elHandle = htParam.elHandle;
		var htOffset = this._htInfo.welDrag.offset();
		this._htInfo.nStartX = htOffset.left;
		this._htInfo.nStartY = htOffset.top;	
		document.body.style[this._sCssUserSelect] = "none";
		this._oTouch.attach({
			touchMove : this._htEvent["touchMove"],
			touchEnd :  this._htEvent["touchEnd"]
		});
	},
	_onMove : function(oCustomEvt){
		if(!this._htInfo.bPrepared){
			return;
		}
		var nDisX = oCustomEvt.nDistanceX,
			nDisY = oCustomEvt.nDistanceY;
		if((Math.abs(nDisX)+Math.abs(nDisY)) < this.option('nThreshold')){
			return;
		}		
		oCustomEvt.oEvent.stop();
		var htOffset = {
			nX : this._htInfo.nStartX+ nDisX,
			nY : this._htInfo.nStartY+ nDisY
		};
		if(!this.option('bFlowOut')){
			var htNewOffset = this._onReCalculateOffset(this._htInfo.welDrag.$value(), htOffset.nX, htOffset.nY);
			htOffset.nX = htNewOffset.nX;
			htOffset.nY = htNewOffset.nY;
		}
		var htParam = {
			nX : htOffset.nX,
			nY : htOffset.nY,
			elDrag : this._htInfo.welDrag.$value(),
			elHandle : this._htInfo.elHandle,
			nGapX : nDisX,
			nGapY :	nDisY,
			nDragCount : this._htInfo.nCount,
			nTouchX : oCustomEvt.nX,
			nTouchY : oCustomEvt.nY
		};
		if(!this._htInfo.bDragStart){
			if(!this.fireEvent('dragStart', htParam)){
				this._htInfo.bPrepared = false;
				return;
			}
		}
		this._htInfo.bDragStart = true;
		if(!this.fireEvent('beforeDrag',htParam)){
			return;
		}
		this._htInfo.welDrag.css('position','absolute');		
		this._htInfo.welDrag.offset(htParam.nY,htParam.nX);
		this._htInfo.nX = htParam.nX;
		this._htInfo.nY = htParam.nY;
		this._htInfo.nCount++;
		this.fireEvent('drag', htParam);
	},
	_onReCalculateOffset : function(elDrag, nX, nY){
		elParent = this._htWElement.base;
		var htOffset = elParent.offset();
		var htParent = {
			nX :  elParent.$value().offsetLeft,
			nY :  elParent.$value().offsetTop,
			nWidth : elParent.$value().offsetWidth,
			nHeight : elParent.$value().offsetHeight
		};
		var htDrag = {
			nWidth : elDrag.offsetWidth,
			nHeight : elDrag.offsetHeight
		};
		var newX = Math.max(nX, htParent.nX);
		newX = Math.min(newX, htParent.nX+htParent.nWidth - htDrag.nWidth);
		var newY = Math.max(nY, htParent.nY);
		newY = Math.min(newY, htParent.nY+htParent.nHeight - htDrag.nHeight);
		return {
			nX : newX,
			nY : newY
		};		
	},
	_onEnd : function(oCustomEvt){	
		if(!this._htInfo.bPrepared){
			return;
		}
		this._stopDrag(false);
		if (oCustomEvt.sMoveType === jindo.m.MOVETYPE[3] || oCustomEvt.sMoveType === jindo.m.MOVETYPE[4]) {
			this._restoreAnchor();
		}
		if(this._htInfo.welDrag){
			var htParam = {
				elDrag : this._htInfo.welDrag.$value(),
				elHandle : this._htInfo.elHandle	
			};
			this.fireEvent('handleUp', htParam);
		}
		this._initInfo();		
	},
	isDragging : function(){
		return this._htInfo.bDragStart;
	},
	stopDragging : function(){
		this._stopDrag(true);
	},
	_stopDrag : function(bInterupted){
		if (typeof bInterupted === 'undefined'){
			bInterupted = false;
		}
		this._oTouch.detach({
			touchMove : this._htEvent["touchMove"],
			touchEnd :  this._htEvent["touchEnd"]
		});
		document.body.style[this._sCssUserSelect] = this._sCssUserSelectValue? this._sCssUserSelectValue : "";
		if(this.isDragging()){			
			var htParam = {
				nX : parseInt(this._htInfo.welDrag.css("left"), 10) || 0,
				nY : parseInt(this._htInfo.welDrag.css("top"), 10) || 0,
				elDrag : this._htInfo.welDrag.$value(),
				elHandle : this._htInfo.elHandle,
				bInterupted : bInterupted
			};
			this.fireEvent('dragEnd', htParam);
			this._htInfo.bDragStart = false;			
		}
	},
	_setAnchorElement : function(){
		//ios에서만 처리되도록 수정.
		if(this._isIos ){
			this._aAnchor = jindo.$$("A", this._htWElement.base.$value());
		}
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
	_initInfo : function(){
		this._htInfo.welDrag = null;
		this._htInfo.elHandle = null;
		this._htInfo.nStartX = null;
		this._htInfo.nStartY = null;	
		this._htInfo.nX = null;
		this._htInfo.nY = null;
		this._htInfo.bDragStart = false;
		this._htInfo.nCount = 0;
	},
	_onActivate : function() {
		this._attachEvent();
		this._oTouch.activate();
	},
	_onDeactivate : function() {
		this._detachEvent();
		this._oTouch.deactivate();
	},
	_attachEvent : function() {
		this._htEvent = {};
		this._htEvent["touchMove"] = jindo.$Fn(this._onMove, this).bind();		
		this._htEvent["touchEnd"] = jindo.$Fn(this._onEnd, this).bind();
		this._htEvent["touchStart"] = jindo.$Fn(this._onStart, this).bind();
		this._oTouch.attach("touchStart", this._htEvent["touchStart"]);
	},
	_detachEvent : function() {	
		this._oTouch.detachAll();
		for(var p in this._htEvent){
			this._htEvent[p] = null;
		}
		this._htEvent = null;
	},
	destroy: function() {
		this.deactivate();
		for(var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		for(p in this._htInfo) {
			this._htInfo[p] = null;
		}
		this._htWElement = null;
		this._htInfo = null;
		this._isIos = null;		
		this._aAnchor = null;
		this._fnDummyFnc = null;
		this._bBlocked = null;
		this._bTouchStop = null;
	}
}).extend(jindo.UIComponent);
