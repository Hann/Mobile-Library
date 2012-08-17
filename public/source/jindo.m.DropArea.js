jindo.m.DropArea = jindo.$Class({	
	$init : function(el, htUserOption) {		
		this.option({
			sClassPrefix : 'drop-', 
			oDragInstance : null,
			bActivateOnload : true,
			bUseTouchPoint : false
		});
		this.option(htUserOption || {});
		this._initVar();
		this._setWrapperElement(el);
		if(this.option("bActivateOnload")) {
			this.activate();
		}
	},
	_initVar: function() {
		this._waOveredDroppableElement = jindo.$A([]);
		this._sEvent = 'ontouchstart' in window? 'touchmove' : 'mousemove';
		this._sDropClassName = '.' + this.option('sClassPrefix')+"area";
		this._aItem = null;
		this._aItemRect = null;
		this._elHandle = null;
		this._elDragging = null;
	},
	_setWrapperElement: function(el) {
		this._htWElement = {};
		el = jindo.$(el);
		this._htWElement["base"] = jindo.$Element(el);
	},
	_getRectInfo : function(el){
		var htOffset = jindo.$Element(el).offset();
		return {
			nLeft : htOffset.left,
			nTop : htOffset.top,
			nRight : htOffset.left + el.offsetWidth,
			nBottom : htOffset.top + el.offsetHeight
		};
	},
	_reCalculate : function() {
		var elBase = this._htWElement["base"].$value();
		var aItem = jindo.$$(this._sDropClassName , elBase);
		if (elBase.tagName && jindo.$$.test(elBase, this._sDropClassName )) {
			aItem.push(elBase);
		}
		this._aItem = aItem;
		this._aItemRect = [];
		for (var i = 0, el; (el = aItem[i]); i++) {
			this._aItemRect.push(this._getRectInfo(el));
		}
	},
	_findDroppableElement : function(el) {
		var elDroppable = jindo.$$.test(el, this._sDropClassName ) ? el : jindo.m.getClosest(this._sDropClassName , el);
		if (!this._isChildOfDropArea(el)) { 
			elDroppable = null;
		}
		return elDroppable;
	},
	_isChildOfDropArea : function(el) {
		if (this._el === document || this._el === el){
			return true;
		} 
		return this._htWElement["base"].isParentOf(el);
	},
	_isDropMove : function(nLeft, nTop, nRight, nBottom){
		var aItem = this._aItem;
		var aItemRect = this._aItemRect, i, htRect, el;
		if(!this.option('bUseTouchPoint')){		
			for (i = 0; ((htRect = aItemRect[i]) && (el = aItem[i])); i++) {
				var bHOver = this._checkOverArea({nMin: htRect.nLeft, nMax : htRect.nRight}, {nMin : nLeft, nMax : nRight});
				var bVOver = this._checkOverArea({nMin: htRect.nTop, nMax : htRect.nBottom}, {nMin : nTop, nMax : nBottom});
				if(bHOver && bVOver){
					this._addOveredDroppableElement(el);
					this._fireMoveEvent(el, htRect, {nX : nLeft,nY: nTop});
				}else{
					this._removeOveredDroppableElement(el);
				}	
			}
		}else{
			for (i = 0; ((htRect = aItemRect[i]) && (el = aItem[i])); i++) {
				if ( htRect.nLeft <= nLeft && nLeft <= htRect.nRight && htRect.nTop <= nTop && nTop <= htRect.nBottom ) {
					this._addOveredDroppableElement(el);
					this._fireMoveEvent(el, htRect, {nX : nLeft,nY: nTop});
				} else {
					this._removeOveredDroppableElement(el);
				}
			}
		}		
	},
	_checkOverArea : function(htBase, htCheck){
		if(htCheck.nMin < htBase.nMin){
			if(htCheck.nMax > htBase.nMin){
				return true;
			}
		}else{
			if(htCheck.nMin < htBase.nMax){
				return true;
			}
		}		
		return false;
	},
	_fireMoveEvent : function(elDrop, htRect, htTouchInfo){
		var nRatioX = (htTouchInfo.nX - htRect.nLeft) / (htRect.nRight - htRect.nLeft);
		var nRatioY = (htTouchInfo.nY - htRect.nTop) / (htRect.nBottom - htRect.nTop);
		this.fireEvent('move',{
			elHandle : this._elHandle,
			elDrag : this._elDragging, 
			elDrop : elDrop,
			nRatioX : nRatioX,
			nRatioY : nRatioY
		});
	},
	_addOveredDroppableElement : function(elDroppable) {
		if (this._waOveredDroppableElement.indexOf(elDroppable) == -1) {
			this._waOveredDroppableElement.push(elDroppable);
			this.fireEvent('over', { 
				elHandle : this._elHandle,
				elDrag : this._elDragging, 
				elDrop : elDroppable  
			});
		}
	},
	_removeOveredDroppableElement : function(elDroppable) {
		var nIndex = this._waOveredDroppableElement.indexOf(elDroppable);
		if (nIndex != -1) {
			this._waOveredDroppableElement.splice(nIndex, 1);
			this.fireEvent('out', { 
				elHandle : this._elHandle,
				elDrag : this._elDragging, 
				elDrop : elDroppable  
			});
		}
	},
	_clearOveredDroppableElement : function(){
		for (var elDroppable; (elDroppable = this._waOveredDroppableElement.$value()[0]); ) {			
			this._waOveredDroppableElement.splice(0, 1);
			this.fireEvent('drop', {
				elHandle : this._elHandle,
				elDrag : this._elDragging, 
				elDrop : elDroppable 
			});
		}
	},
	getOveredLists : function() {
		return this._waOveredDroppableElement ? this._waOveredDroppableElement.$value() : [];
	},
	_onActivate : function() {
		this._attachEvent();
		if(this.option('oDragInstance')){
			var oDrag = this.option('oDragInstance');
			var self = this;
			oDrag.attach({
				'handleDown' : function(oCustomEvent){
					self._elHandle = oCustomEvent.elHandle;
					self._elDragging = oCustomEvent.elDrag;
					self._waOveredDroppableElement.empty();
					self.fireEvent(oCustomEvent.sType, oCustomEvent);
				},				
				'dragStart' : function(oCustomEvent){
					if(!self.fireEvent(oCustomEvent.sType, oCustomEvent)){
						oCustomEvent.stop();
					}else{
						self._reCalculate();
					}
				},
				'beforeDrag' : function(oCustomEvent){
					self.fireEvent(oCustomEvent.sType, oCustomEvent);
				},
				'drag' : function(oCustomEvent){
					self._elDragging = oCustomEvent.elDrag;
					var wel = jindo.$Element(oCustomEvent.elDrag);
					var nTop =self.option('bUseTouchPoint')?  oCustomEvent.nTouchY	: oCustomEvent.nY;
					var nLeft = self.option('bUseTouchPoint')? oCustomEvent.nTouchX: oCustomEvent.nX;
					var nRight = nLeft+wel.width();
					var nBottom = nTop +wel.height();
					self._isDropMove(nLeft, nTop, nRight, nBottom );
					self.fireEvent(oCustomEvent.sType, oCustomEvent);
				},
				'dragEnd': function(oCustomEvent){
					var oParam = {};
					oParam.aElDrop = self.getOveredLists().concat(); 
					for(var p in oCustomEvent){
						oParam[p] = oCustomEvent[p];
					}
					self._clearOveredDroppableElement();
					self.fireEvent(oCustomEvent.sType, oParam);
				},
				'handleUp' : function(oCustomEvent){
					self.fireEvent('handleUp',{
						elHandle : self._elHandle,
						elDrag : self._elDragging
					});
					self._elHandle = null;
					self._elDragging = null;
				}
			});
		}
	},
	_onDeactivate : function() {		
		this._detachEvent();
		if(this.option('oDragInstance')){
			var oDrag = this.option('oDragInstance');
			oDrag.detachAll();
		}
	},
	_attachEvent : function() {
		this._htEvent = {};
	},
	_detachEvent : function() {
		this._htEvent = null;
	},
	destroy: function() {
		this.deactivate();
		for(var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		this._htWElement = null;
	}
}).extend(jindo.UIComponent);
