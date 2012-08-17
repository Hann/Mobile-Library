window.requestAnimationFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || function(callback) { return setTimeout(callback, 1); };
})();
window.cancelRequestAnimationFrame = (function () {
    return window.cancelRequestAnimationFrame || window.webkitCancelRequestAnimationFrame || clearTimeout;
})();	
jindo.m.CoreScroll = jindo.$Class({
	$init : function(el,htUserOption) {
		this.option({
			 bActivateOnload : true,
			 bUseHScroll : false,
			 bUseVScroll : true,
			 bUseMomentum : (jindo.m.getDeviceInfo().android ? false : true),
			 nDeceleration : 0.0006,
			 nOffsetTop : 0,
			 nOffsetBottom : 0,
			 nHeight : 0, 
			 nWidth : 0,
		 	 bUseBounce : true,		
			 bUseHighlight : true,
			 sClassPrefix : "scroll_",
		 	 bUseCss3d : jindo.m._getDefaultUseCss3d()
		});
		if( typeof htUserOption.bUseTransition != "undefined"  ) {
			this.option("bUseCss3d", htUserOption.bUseTransition);
		}
		this.option(htUserOption || {});
		this._initVar();
		this._setWrapperElement(el);
		if(this.option("bActivateOnload")) {
			this.activate();
		}
	},
	_initVar: function() {
		this.isAndroid = jindo.m.getDeviceInfo().android; 
		this.nVersion = parseInt(jindo.m.getDeviceInfo().version,10);
		this.sCssPrefix = jindo.m.getCssPrefix();
		this.sTranOpen = null;
		this.sTranEnd = null;
		this.nWrapperW = null;
		this.nWrapperH = null;
		this.nScrollW = null;
		this.nScrollH = null;
		this.nMaxScrollLeft = null;
		this.nMaxScrollTop = null;
		this.nMinScrollTop = null;
		this.bUseHScroll = null;
		this.bUseVScroll = null;
		this._oTouch = null;
		this._nLeft = 0;
		this._nTop = 0;
		this._bUseHighlight = this.option("bUseHighlight");
		this._aAni = [];
		this._nAniTimer = null;
		this._nFixedBugTimer = null;
		this._isAnimating = false;		
		this._isControling = false;		
		this._isStop = false;
		this._setTrans();
		if(this._bUseHighlight) {
			if(this.isAndroid) {
				this._elDummyTag = null;
			} else {
				this._aAnchor = null;
				this._fnDummyFnc = function(){return false;};
				this._bBlocked = false;
			}
		}
	},
	_setTrans : function() {
		if(this.option("bUseCss3d")) {
		    this.sTranOpen = "3d(";
			this.sTranEnd = ",0)";			
		} else {
    		this.sTranOpen = "(";
    		this.sTranEnd = ")";
		}
	},
	getCurrentPos : function() {
		return {
			nTop : this._nTop,
			nLeft : this._nLeft
		};
	},
	setLayer : function(el) {
		el = (typeof el == "string" ? jindo.$(el) : el); 
		this._htWElement["wrapper"] = jindo.$Element(el);
		this._htWElement["wrapper"].css({
			"position" : "relative",
			"overflow" : "hidden"
		});
		this.setScroller();	
	},
	setScroller : function() {
		this._htWElement["scroller"] = this._htWElement["wrapper"].first();			
		this._htWElement["scroller"].css({
				"position" : "absolute",
				"zIndex" : 1,
				"left" : 0,
				"top" : 0})
			.css(this.sCssPrefix + "TransitionProperty", "-webkit-transform")
			.css(this.sCssPrefix + "TransitionDuration", 0)
			.css(this.sCssPrefix + "Transform", "translate" + this.sTranOpen + "0,0" + this.sTranEnd);
		if(this.option("bUseCss3d")) {
			this._htWElement["scroller"]
			.css(this.sCssPrefix + "TransitionTimingFunction", "cubic-bezier(0.33,0.66,0.66,1)");
		}
		if(this._bUseHighlight && this.isAndroid && this.nVersion < 3) {
			this._elDummyTag = this._htWElement["scroller"].query("._scroller_dummy_atag_");
			if(!this._elDummyTag) {
				this._elDummyTag = jindo.$("<a href='javascript:void(0);' class='_scroller_dummy_atag_'></a>");
				this._elDummyTag.style.position = "absolute";
				this._elDummyTag.style.height = "0px";
				this._elDummyTag.style.width = "0px";
				this._htWElement["scroller"].append(this._elDummyTag);	
			}
		} 
	},
	_setWrapperElement: function(el) {
		this._htWElement = {};
		this.setLayer(el);
	},
	refresh : function(bNoRepos) {
		if(!this.isActivating()) {
			return;
		}
		if(this.option("nWidth")) {
			this._htWElement["wrapper"].width(parseInt(this.option("nWidth"),10));	
		}
		if(this.option("nHeight")) {
			this._htWElement["wrapper"].height(parseInt(this.option("nHeight"),10));
		}
		this.nWrapperW = this._htWElement["wrapper"].width(); 
		this.nWrapperH = this._htWElement["wrapper"].height();
		this.nScrollW = this._htWElement["scroller"].width();
		this.nScrollH = this._htWElement["scroller"].height() - this.option("nOffsetBottom");
		this.nMaxScrollLeft = this.nWrapperW - this.nScrollW;
		this.nMaxScrollTop = this.nWrapperH - this.nScrollH;
		this.nMinScrollTop = -this.option("nOffsetTop");
		if(this._bUseHighlight && !this.isAndroid) {
			this._aAnchor = jindo.$$("A", this._htWElement["scroller"].$value());
		}
		this.bUseHScroll = this.option("bUseHScroll") && (this.nWrapperW < this.nScrollW); 
		this.bUseVScroll = this.option("bUseVScroll") && (this.nWrapperH < this.nScrollH);
		if(this.bUseHScroll && !this.bUseVScroll) {	
			this._htWElement["scroller"].$value().style["height"] = "100%";
		} 
		if(!this.bUseHScroll && this.bUseVScroll) {	
			this._htWElement["scroller"].$value().style["width"] = "100%"; 
		}
		if(!this.bUseHScroll && !this.bUseVScroll) { 
			this._fixedBugForAndroid();	
		}
		if(!bNoRepos) {
			this.restorePos(0);
		}
	},
	_setPos : function(nLeft,nTop) {
		nLeft = this.bUseHScroll ? nLeft : 0;
		nTop = this.bUseVScroll ? nTop : 0;
		if (this._fireEvent("beforePosition")) {
			this._isControling = true;
			this._nLeft = nLeft;
			this._nTop = nTop;
			if (this._bUseHighlight && this.isAndroid) {
				var htStyleOffset = this.getStyleOffset(this._htWElement["scroller"]);
				nLeft -= htStyleOffset.left;
				nTop -= htStyleOffset.top;
			}
			this._htWElement["scroller"].css(this.sCssPrefix + "Transform", "translate" + this.sTranOpen + nLeft + "px, " + nTop + "px" + this.sTranEnd);
			this._fireEvent("position");
		}
	},
	restorePos : function(nDuration) {
		if(!this.bUseHScroll && !this.bUseVScroll) {
			return;
		}
		var nNewLeft = this.getPosLeft(this._nLeft),
			nNewTop = this.getPosTop(this._nTop); 
		if (nNewLeft === this._nLeft && nNewTop === this._nTop) {
			this._isControling = false;
			this._fireEvent("afterScroll");
			this._fixedBugForAndroid();
			return;
		} else {
			this.scrollTo(nNewLeft, nNewTop , nDuration);
		}
	},
	_getMomentum: function (nDistance, nSpeed, nMomentum, nSize, nMaxDistUpper, nMaxDistLower) {
		var nDeceleration = this.option("nDeceleration"),
			nNewDist = nMomentum / nDeceleration,
			nNewTime = 0,
			nOutsideDist = 0;
		if (nDistance < 0 && nNewDist > nMaxDistUpper) {
			nOutsideDist = nSize / (6 / (nNewDist / nSpeed * nDeceleration));
			nMaxDistUpper = nMaxDistUpper + nOutsideDist;
			nSpeed = nSpeed * nMaxDistUpper / nNewDist;
			nNewDist = nMaxDistUpper;
		} else if (nDistance > 0 && nNewDist > nMaxDistLower) {
			nOutsideDist = nSize / (6 / (nNewDist / nSpeed * nDeceleration));
			nMaxDistLower = nMaxDistLower + nOutsideDist;
			nSpeed = nSpeed * nMaxDistLower / nNewDist;
			nNewDist = nMaxDistLower;
		}
		nNewDist = nNewDist * (nDistance > 0 ? -1 : 1);
		nNewTime = nSpeed / nDeceleration;
		return { 
			nDist: nNewDist, 
			nTime: Math.round(nNewTime) 
		};
	},
	_stop : function() {
		if(this.option("bUseCss3d") ) {
			jindo.m.detachTransitionEnd(this._htWElement["scroller"].$value(), this._htEvent["TransitionEnd"]);
		} else {
			cancelRequestAnimationFrame(this._nAniTimer);
		}	
		this._aAni = [];
		this._isAnimating = false;
	},
	scrollTo: function (nLeft, nTop , nDuration) {
		this._stop();
		nLeft = this.bUseHScroll ? nLeft : 0;
		nTop = this.bUseVScroll ? nTop : 0;
		this._aAni.push({ 
			nLeft: nLeft, 
			nTop: nTop, 
			nDuration: nDuration || 0
		});
		this._animate();
	},
	isMoving : function() {
		return this._isControling;
	},
	_animate : function() {
		var self = this,
			oStep;
		if (this._isAnimating) {
			return;
		}
		if(!this._aAni.length) {
			this.restorePos(300);
			return;
		}
		do {
			oStep = this._aAni.shift();
			if(!oStep) {
				return;
			}
		} while( oStep.nLeft == this._nLeft && oStep.nTop == this._nTop ); 
		this._isAnimating = true;
		if (this.option("bUseCss3d")) {
			this._transitionTime(oStep.nDuration);
			this._setPos(oStep.nLeft, oStep.nTop);
			this._isAnimating = false;
			if (oStep.nDuration) {
				jindo.m.attachTransitionEnd(this._htWElement["scroller"].$value(), this._htEvent["TransitionEnd"]);
			} else {
				this.restorePos(0);
			}
		} else {	
			var startTime = Date.now(),
				nStartLeft = this._nLeft, nStartTop = this._nTop;
			(function animate () {
				var now = Date.now(),nEaseOut;
				if (now >= startTime + oStep.nDuration) {
					self._setPos(oStep.nLeft, oStep.nTop);
					self._isAnimating = false;
					self._animate();
					return;
				}
				now = (now - startTime) / oStep.nDuration - 1;
				nEaseOut = Math.sqrt(1 - Math.pow(now,2));
				self._setPos((oStep.nLeft - nStartLeft) * nEaseOut + nStartLeft, (oStep.nTop - nStartTop) * nEaseOut + nStartTop);
				if (self._isAnimating) {
					self._nAniTimer = requestAnimationFrame(animate);
				}
			})();
		}
	},
	_transitionTime: function (nDuration) {
		nDuration += 'ms';
		this._htWElement["scroller"].css(this.sCssPrefix + "TransitionDuration", nDuration);
		this._fireEventSetDuration(nDuration);
	},
	_clearAnchorForIos : function() {
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
	_restoreAnchorForIos : function() {
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
	_stopScroll : function() {
		var htCssOffset = jindo.m.getCssOffset(this._htWElement["scroller"].$value()),
			htStyleOffset ={left : 0, top : 0}, nTop, nLeft;
		if(this._bUseHighlight && this.isAndroid) {
			htStyleOffset = this.getStyleOffset(this._htWElement["scroller"]);
		}
		nLeft = htCssOffset.left + htStyleOffset.left;
		nTop = htCssOffset.top + htStyleOffset.top;
		if(nLeft !== this._nLeft || nTop !== this._nTop) {
			this._stop();
			this._isStop = true;
			this._setPos(this.getPosLeft(nLeft), this.getPosTop(nTop));
			this._isControling = false;
			this._fireEvent("afterScroll");
			this._fixedBugForAndroid();	
		}	
	},	
	getStyleOffset : function(wel) {
		var nLeft = parseInt(wel.css("left"),10),
			  nTop = parseInt(wel.css("top"),10);
		nLeft = isNaN(nLeft) ? 0 : nLeft;
		nTop = isNaN(nTop) ? 0 : nTop;
		return {
			left : nLeft,
			top : nTop
		};
	},
	getPosLeft : function(nPos) {
		return (nPos >= 0 ? 0 : (nPos <= this.nMaxScrollLeft ? this.nMaxScrollLeft : nPos) );
	},
	getPosTop : function(nPos) {
		return (nPos >= this.nMinScrollTop ? this.nMinScrollTop : (nPos <= this.nMaxScrollTop ? this.nMaxScrollTop : nPos) );
	},
	_fireEventSetDuration : function(nDuration) {
		this.fireEvent("setDuration", {
			nDuration: nDuration,
			bUseHScroll : this.bUseHScroll,
			bUseVScroll : this.bUseVScroll
		});  
	},		
	_fireEventbeforeScroll : function(htParam) {
		return this.fireEvent("beforeScroll", htParam);  
	},
	_fireEventScroll : function(htParam) { 
		this.fireEvent("scroll", htParam);
	},
	_fireEvent : function(sType) {
		return this.fireEvent(sType, {
			nLeft : this._nLeft,
			nTop : this._nTop,
			nMaxScrollLeft : this.nMaxScrollLeft,
			nMaxScrollTop : this.nMaxScrollTop
		});
	},
	_fireTouchEvent : function(sType, we) {
		return this.fireEvent(sType, {
			nLeft : this._nLeft,
			nTop : this._nTop,
			nMaxScrollLeft : this.nMaxScrollLeft,
			nMaxScrollTop : this.nMaxScrollTop,
			oEvent : we
		});
	},
	_onStart : function(we) {
		if(!this.option("bUseHighlight")) {
			we.oEvent.stop(jindo.$Event.DEFAULT_ALL);
		}
		this._clearFixedBug();	
		if (this._fireTouchEvent("beforeTouchStart",we)) {
			this._clearAnchorForIos();
			this._isAnimating = false;
			this._isControling = true;
			this._isStop = false;
			if (this.option("bUseCss3d")) {
				this._transitionTime(0);
			}
			this._stopScroll();
			this._oTouch.attach({
				touchMove : this._htEvent["touchMove"],
				touchEnd :  this._htEvent["touchEnd"]
			});	
			this._fireTouchEvent("touchStart",we);		 		
		}			
	},
	_onMove : function(we) {
		var weParent = we.oEvent;
		if(we.sMoveType === jindo.m.MOVETYPE[0]) {	
			if(this.bUseHScroll) {
				weParent.stop(jindo.$Event.CANCEL_ALL);
			} else {
				return true;
			}
		} else if(we.sMoveType === jindo.m.MOVETYPE[1]) {	
			if(this.bUseVScroll) {
				weParent.stop(jindo.$Event.CANCEL_ALL);
			} else {
				return true;
			}
		} else if(we.sMoveType === jindo.m.MOVETYPE[2]) {	
			weParent.stop(jindo.$Event.CANCEL_ALL);				
		} else {	
			weParent.stop(jindo.$Event.CANCEL_ALL);
			return true;
		}
		if (this._fireTouchEvent("beforeTouchMove",we)) {
			var nNewLeft, nNewTop;
			this._clearFixedBug();
			if(this.option("bUseBounce")) {
				nNewLeft = this._nLeft + (this._nLeft >=0 || this._nLeft <= this.nMaxScrollLeft ? we.nVectorX/2 : we.nVectorX);
				nNewTop = this._nTop + (this._nTop >= this.nMinScrollTop || this._nTop <= this.nMaxScrollTop ? we.nVectorY/2 : we.nVectorY);
			} else {
				nNewLeft = this.getPosLeft(this._nLeft + we.nVectorX);
				nNewTop = this.getPosTop(this._nTop + we.nVectorY);
			}
			this._setPos(nNewLeft, nNewTop);
			this._fireTouchEvent("touchMove",we);
		}
	},
	_onEnd : function(we) {
		if (!this._fireTouchEvent("beforeTouchEnd",we)) {
			return;
		}
		this._clearFixedBug();
		this._oTouch.detach({
			touchMove : this._htEvent["touchMove"],
			touchEnd :  this._htEvent["touchEnd"]
		});
		if (we.sMoveType === jindo.m.MOVETYPE[0] || we.sMoveType === jindo.m.MOVETYPE[1] || we.sMoveType === jindo.m.MOVETYPE[2]) {
			this._endForScroll(we);
			we.oEvent.stop(jindo.$Event.CANCEL_DEFAULT);
		} else {	
			this._isControling = false;
			if (!this._isStop) {
				if(!this._bUseHighlight) {
					var sTagName = we.element.tagName;
					if (sTagName != 'SELECT' && sTagName != 'INPUT' && sTagName != 'TEXTAREA') {
						jindo.$Element(we.element).fireEvent("click");
					}
				} else {
					this._restoreAnchorForIos();
				}
			} 
		}
		this._fireTouchEvent("touchEnd",we);
	},
	_endForScroll : function(we) {
		var htMomentumX = { nDist:0, nTime:0 },
			htMomentumY = { nDist:0, nTime:0 },
			htParam = {
				nMomentumX : we.nMomentumX,
				nMomentumY : we.nMomentumY,
				nDistanceX : we.nDistanceX,
				nDistanceY : we.nDistanceY,
				nLeft : this._nLeft,
				nTop : this._nTop
			};
		if (this.option("bUseMomentum") && (we.nMomentumX || we.nMomentumY) ) {
			if (this.bUseHScroll) {
				htMomentumX = this._getMomentum(-we.nDistanceX, we.nSpeedX, we.nMomentumX, this.nWrapperW, -this._nLeft, -this.nMaxScrollLeft + this._nLeft);
			}
			if (this.bUseVScroll) {
				htMomentumY = this._getMomentum(-we.nDistanceY, we.nSpeedY, we.nMomentumY, this.nWrapperH, -this._nTop, -this.nMaxScrollTop + this._nTop);
			}
			htParam.nNextLeft = this._nLeft + htMomentumX.nDist;
			htParam.nNextTop = this._nTop + htMomentumY.nDist;
			htParam.nTime = Math.max(Math.max(htMomentumX.nTime, htMomentumY.nTime),10);
			if (this._fireEventbeforeScroll(htParam)) {
				if(this.option("bUseBounce")) {
					this.scrollTo(htParam.nNextLeft, htParam.nNextTop, htParam.nTime);	
				} else {
					this.scrollTo(this.getPosLeft(htParam.nNextLeft), this.getPosTop(htParam.nNextTop), htParam.nTime);
				}					
				this._fireEventScroll(htParam);
			}
		} else {
			htParam.nNextLeft = this._nLeft;
			htParam.nNextTop = this._nTop;
			htParam.nTime = 0;
			if (this._fireEventbeforeScroll(htParam)) {
				if( this._nLeft !== htParam.nNextLeft || this._nTop !== htParam.nNextTop ) {
					this.scrollTo(htParam.nNextLeft, htParam.nNextTop, htParam.nTime);
				} else {
					this.restorePos(300);	
				} 
				this._fireEventScroll(htParam);					
			}	
		}
	},
	_onTransitionEnd : function(we) {
		jindo.m.detachTransitionEnd(this._htWElement["scroller"].$value(), this._htEvent["TransitionEnd"]);
		this._animate();
	},	
	_onDocumentStart : function(we) {
			if(this._htWElement["wrapper"].visible()) {
				if(this._htWElement["wrapper"].isChildOf(we.element)) {
					return true;
				} else {
					this._stopScroll();				
				}
			}
		},
	_onActivate : function() {
		if(!this._oTouch) {
			this._oTouch = new jindo.m.Touch(this._htWElement["wrapper"].$value(), {
				nMoveThreshold : 0,
				nMomentumDuration : (jindo.m.getDeviceInfo().android ? 500 : 200),
				nLongTapDuration : 400,
				nTapThreshold : 1,
				nSlopeThreshold : 5
			});
		} else {
			this._oTouch.activate();
		}
		this._attachEvent();
		this.refresh();
	},
	_onDeactivate : function() {
		this._detachEvent();
		this._oTouch.deactivate();
	},
	_attachEvent : function() {
		this._htEvent = {};
		this._htEvent["touchStart"] = jindo.$Fn(this._onStart, this).bind();
		this._htEvent["touchMove"] = jindo.$Fn(this._onMove, this).bind();
		this._htEvent["touchEnd"] = jindo.$Fn(this._onEnd, this).bind();
		this._htEvent["TransitionEnd"] = jindo.$Fn(this._onTransitionEnd, this).bind();
		this._htEvent["document"] = jindo.$Fn(this._onDocumentStart, this).attach(document, "touchstart");
		this._oTouch.attach("touchStart", this._htEvent["touchStart"]);
	},
	_fixedBugForAndroid : function() {
		if(this._bUseHighlight && this.isAndroid) {
			var self = this;
			this._clearFixedBug();
			this._nFixedBugTimer = setTimeout(function(){				
				if(self._htWElement && self._htWElement["scroller"]) {
					var ele = self._htWElement["scroller"].$value();
					var htCssOffset = jindo.m.getCssOffset(ele);
					var htScrollOffset = self._htWElement["scroller"].offset();
	                ele.style[self.sCssPrefix + "TransitionDuration"] = null;
	                ele.style[self.sCssPrefix + "Transform"] = null;
					self._htWElement["scroller"].offset(htCssOffset.top + htScrollOffset.top, htCssOffset.left + htScrollOffset.left);
					if(self.nVersion < 3) {
						self._elDummyTag.focus();
					}
				}
			}, 200);
		}
	},
	_clearFixedBug : function() {
		if(this._bUseHighlight && this.isAndroid) {
			clearTimeout(this._nFixedBugTimer);
			this._nFixedBugTimer = -1;
		}
	},
	_detachEvent : function() {
		jindo.m.detachTransitionEnd(this._htWElement["scroller"].$value(), this._htEvent["TransitionEnd"]);
		this._htEvent["document"].detach(document,"touchstart");
		this._oTouch.detachAll();
		if (this._elDummyTag) {
			this._htWElement["scroller"].remove(this._elDummyTag);
		}
	},
	destroy: function() {
		this.deactivate();
		for(var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		this._htWElement = null;
		this._oTouch.destroy();
		delete this._oTouch; 
	}
}).extend(jindo.UIComponent);
