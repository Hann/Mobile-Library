jindo.m.Scroll = jindo.$Class({
	$init : function(el,htUserOption) {
		this.option({
			bActivateOnload : true,
			bUseScrollbar : true,
			bUseFixedScrollbar : false,
			bUsePullDown : false,
			bUsePullUp : false,
			sClassPrefix : "scroll_",
			bUseVScroll : true,
			bUseHScroll : false,
			bUseBounce : true,
			fnPullDownIdle : null,
			fnPullDownBeforeUpdate : null, 
			fnPullDownUpdating : null,
			fnPullUpIdle : null,
			fnPullUpBeforeUpdate : null,
			fnPullUpUpdating : null,
			bAutoResize : false,
 			nOffsetTop : 0,
			nOffsetBottom : 0
		});
		this.option(htUserOption || {});
		this._initVar();
		this._setWrapperElement(el);
		this._InitPullUpdateFunc();
		if(this.option("bActivateOnload")) {
			this.activate();
		}
	},
	_initVar: function() {
		this._oCore = null;
		this._isPullDown = false; 
		this._isPullUp = false;
		this._isUpdating = false;
		this._nOrgMaxScrollTop = null;
		this._nPropHScroll = 0;
		this._nPropVScroll = 0;
		this._htWElement = {};
	},
	_setWrapperElement: function(el) {
		this._htWElement["wrapper"] = jindo.$Element(el);
		this._htWElement["pullDown"] = jindo.$Element(this._htWElement["wrapper"].query("." + this.option("sClassPrefix") + "pullDown"));
		this._htWElement["pullUp"] = jindo.$Element(this._htWElement["wrapper"].query("." + this.option("sClassPrefix") + "pullUp"));
	},
	_InitPullUpdateFunc : function() {
		if(this.option("bUsePullDown") === true) {
			if(!this.option("fnPullDownIdle")) {
				this.option("fnPullDownIdle", function(wel) {
					wel.html("업데이트하시려면 아래로 내려주세요");
				});
			} 
			if(!this.option("fnPullDownBeforeUpdate")) {
				this.option("fnPullDownBeforeUpdate", function(wel) {
					wel.html("업데이트 합니다");
				});
			} 
			if(!this.option("fnPullDownUpdating")) {
				this.option("fnPullDownUpdating", function(wel) {
					wel.html("업데이트 중입니다...");
				});
			} 
		}
		if(this.option("bUsePullUp") === true) {
			if(!this.option("fnPullUpIdle")) {
				this.option("fnPullUpIdle", function(wel) {
					wel.html("더 보시려면 위로 올려주세요");
				});
			} 
			if(!this.option("fnPullUpBeforeUpdate")) {
				this.option("fnPullUpBeforeUpdate", function(wel) {
					wel.html("로드 합니다");
				});
			} 
			if(!this.option("fnPullUpUpdating")) {
				this.option("fnPullUpUpdating", function(wel) {
					wel.html("로드 중...");
				});
			} 
		}
	},
	_onActivate : function() {
		if(this._oCore) {
			this._oCore.activate();
		}
		this.refresh();
		this._attachEvent();
	},
	setUsePullDown : function(bUse) {
		this.option("bUsePullDown", bUse);
		this._refreshPullStatus();
	},
	setUsePullUp : function(bUse) {
		this.option("bUsePullUp", bUse);
		this._refreshPullStatus();
	},
	width : function(nValue) {
		if(nValue) { 
			this.option("nWidth", nValue);
			this.refresh();
		} else {
			if(this.option("nWidth")) {
				return parseInt(this.option("nWidth"),10);	
			} else {
				return this._htWElement["wrapper"].width();				
			}
		}	
	},
	height : function(nValue) {
		if(nValue) { 
			this.option("nHeight", nValue);
			this.refresh();
		} else {
			if(this.option("nHeight")) {
				return parseInt(this.option("nHeight"),10);	
			} else {
				return this._htWElement["wrapper"].height();				
			}			
		}			
	},
	_refreshPullStatus : function() {
		this._isUpdating = false;
		this._nOrgMaxScrollTop = null;
		this._isPullDown = this.option("bUsePullDown") && this.option("bUseVScroll") && !this.option("bUseHScroll") && this.option("bUseBounce") && (this._htWElement["pullDown"] !== null); 
		this._isPullUp = this.option("bUsePullUp") && this.option("bUseVScroll") && !this.option("bUseHScroll") && this.option("bUseBounce") && (this._htWElement["pullUp"] !== null);
		if (this._isPullDown && this.option("fnPullDownIdle")) {
			this._htWElement["pullDown"]._isReady_ = false;
			this._htWElement["pullDown"].show();
			this.option("fnPullDownIdle")(this._htWElement["pullDown"]);
		}
		if (this._isPullUp && this.option("fnPullUpIdle")) {
			this._htWElement["pullUp"]._isReady_ = false;
			this._htWElement["pullUp"].show();
			this.option("fnPullUpIdle")(this._htWElement["pullUp"]);
		}	
	},
	refresh : function() {
		if(!this.isActivating()) {
			return;
		}
		this._refreshPullStatus();
		if (this._oCore) {
			this._oCore.option({
				nOffsetTop : (this._isPullDown ? this._htWElement["pullDown"].height() : 0) - this.option("nOffsetTop"),
				nOffsetBottom : (this._isPullUp ? this._htWElement["pullUp"].height() : 0) - this.option("nOffsetBottom"),
				nWidth : this.option("nWidth"),
				nHeight : this.option("nHeight")
			});
			this._oCore.refresh();
		} else {
			var htOption = this.option();
			var htCloneOption = {};
			for(var p in htOption) {
				htCloneOption[p] = htOption[p];
			}
			htCloneOption.bActivateOnload = true;
			htCloneOption.nOffsetTop =  (this._isPullDown ? this._htWElement["pullDown"].height() : 0) - this.option("nOffsetTop");
			htCloneOption.nOffsetBottom = (this._isPullUp ? this._htWElement["pullUp"].height() : 0) - this.option("nOffsetBottom");
			this._oCore = new jindo.m.CoreScroll(this._htWElement["wrapper"], htCloneOption);
		}
		if(this.option("bUseScrollbar")) {
			this._refreshScroll("V");
			this._refreshScroll("H");
		}	
		if(!this.hasVScroll()) {
			if(this._htWElement["pullDown"] !== null) {
				this._htWElement["pullDown"].hide();
			}
			if(this._htWElement["pullUp"] !== null) {
				this._htWElement["pullUp"].hide();
			}
		}
	},
	scrollTo : function(nLeft, nTop, nDuration) {
		nDuration = nDuration || 0;
		nLeft = -Math.abs(nLeft);
		nTop = -Math.abs(nTop);
		nTop += this.getTop();
		this._oCore.scrollTo( (nLeft >= this.getLeft() ? this.getLeft() : (nLeft <= this.getRight() ? this.getRight() : nLeft) ), 
			(nTop >= this.getTop() ? this.getTop() : (nTop <= this.getBottom() ? this.getBottom() : nTop) ), 
			nDuration);
	},
	getRight : function() {
		return this._oCore.nMaxScrollLeft;
	},
	getLeft : function() {
		return 0;
	},
	getBottom : function() {
		return this._oCore.nMaxScrollTop;
	},
	getTop : function() {
		return this._oCore.nMinScrollTop;
	},
	getCurrentPos : function() {
		return this._oCore.getCurrentPos();
	},
	hasHScroll : function() {
		return this._oCore.bUseHScroll;
	},
	hasVScroll : function() {
		return this._oCore.bUseVScroll;
	},
	_onDeactivate : function() {
		this._detachEvent();
		this._oCore.deactivate();
	},
	_attachEvent : function() {
		this._htEvent = {};
		this._oCore.attach({
			beforeTouchStart : jindo.$Fn(this._onBeforeTouchStart, this).bind(),
			touchStart : jindo.$Fn(this._onTouchStart, this).bind(),
			beforeTouchMove : jindo.$Fn(this._onBeforeTouchMove, this).bind(),
			touchMove: jindo.$Fn(this._onTouchMove, this).bind(),
			beforeTouchEnd : jindo.$Fn(this._onBeforeTouchEnd, this).bind(),
			touchEnd: jindo.$Fn(this._onTouchEnd, this).bind(),
			beforePosition : jindo.$Fn(this._onBeforePosition, this).bind(),
			position: jindo.$Fn(this._onPosition, this).bind(),
			setDuration : jindo.$Fn(this._onSetDuration, this).bind(),
			afterScroll : jindo.$Fn(this._onAfterScroll, this).bind()
		});
		if(this.option("bAutoResize")) {
			this._htEvent["rotate"] = jindo.$Fn(this._onRotate, this).bind();
			jindo.m.bindRotate(this._htEvent["rotate"]);
		}
	},
	_fixedBugForAndroid : function(wel) {
		if(this._oCore.isAndroid) {
			var ele = wel.$value();
			var htOffset = jindo.m.getCssOffset(ele);
			var htIndicatorOffset=wel.offset();
			ele.style[this._oCore.sCssPrefix + "TransitionDuration"] = null;
            ele.style[this._oCore.sCssPrefix + "Transform"] = null;
			wel.offset(htOffset.top + htIndicatorOffset.top, htOffset.left + htIndicatorOffset.left);	
		}
	},
	_onRotate : function(we) {
		this.refresh();
	},
	_onSetDuration : function(we) {
		if (this.option("bUseScrollbar")) {
			if (we.bUseHScroll && this._htWElement["HscrollbarIndicator"]) {
				this._htWElement["HscrollbarIndicator"].css(this._oCore.sCssPrefix + "TransitionDuration", we.nDuration);
			}
			if (we.bUseVScroll && this._htWElement["VscrollbarIndicator"]) {
				this._htWElement["VscrollbarIndicator"].css(this._oCore.sCssPrefix + "TransitionDuration", we.nDuration);
			}
		}
	},
	_onBeforeTouchStart : function(we) {
		return this.fireEvent("beforeTouchStart",we);
	},
	_onTouchStart : function(we) {
		this.fireEvent("touchStart",we);
	},
	_onBeforeTouchMove : function(we) {
		return this.fireEvent("beforeTouchMove",we);
	},
	_onTouchMove : function(we) {
		if (this._isPullDown || this._isPullUp) {
			this._touchMoveForUpdate(we);
		}
		this.fireEvent("touchMove",we);
	},
	_onBeforeTouchEnd : function(we) {
		return this.fireEvent("beforeTouchEnd",we);
	},
	_onTouchEnd : function(we) {
		if(this._isPullDown && this._htWElement["pullDown"]._isReady_) {
			this._pullUploading(this._htWElement["pullDown"], false);
		}
		if(this._isPullUp && this._htWElement["pullUp"]._isReady_) {
			this._pullUploading(this._htWElement["pullUp"], true);
		}
		this.fireEvent("touchEnd",we);
	},
	_onBeforePosition : function(we) {
		return this.fireEvent("beforePosition",we);
	},
	_onPosition : function(we) {
		if(this.option("bUseScrollbar")) {
			this._setScrollBarPos("V", we.nTop);
			this._setScrollBarPos("H", we.nLeft);	
		}
		this.fireEvent("position",we);
	},	
	_onAfterScroll : function(we) {
		if (this.option("bUseScrollbar") && !this.option("bUseFixedScrollbar") ) {
			this._hideScrollBar("H");
			this._hideScrollBar("V");
		}
		this.fireEvent("afterScroll",we);
	},
	_hideScrollBar : function(sDirection) {
		var wel = this._htWElement[sDirection + "scrollbar"],
			bUseScroll = (sDirection === "H" ? this._oCore.bUseHScroll : this._oCore.bUseVScroll);  
		if(bUseScroll && wel) {
			if(this._oCore.isAndroid) {
				this._fixedBugForAndroid(this._htWElement[sDirection + "scrollbarIndicator"]);
				wel.opacity(0);
			} else {
				wel.css(this._oCore.sCssPrefix + "TransitionDuration", "300ms").opacity(0);
			}			
		}
	},
	_fireEventPullDown : function() {
		if(!this._htWElement) {
			return;
		}
		this.fireEvent("pullDown", {
			welElement : this._htWElement["pullDown"],
			oScroll : this			
		});
	},
	_fireEventPullUp : function() {
		if(!this._htWElement) {
			return;
		}
		this.fireEvent("pullUp", {
			welElement : this._htWElement["pullUp"],
			oScroll : this
		});
	},
	_pullUploading : function(wel, isUp) {
		var fn = isUp ? this.option("fnPullUpUpdating") : this.option("fnPullDownUpdating");
		var self = this;
		this._isUpdating = true;
		wel._isReady_ = false;
		if (fn) {
			setTimeout(function(){
				fn(wel);
				if (isUp) {
					self._fireEventPullUp();
				} else {
					self._fireEventPullDown();
				}
			}, 0);
		}
	},
	_touchMoveForUpdate : function(we) {
		if (this._isUpdating) {
			return;
		}
		var nTopMargin = this._oCore.option("nOffsetTop");
		var nBottomMargin = this._oCore.option("nOffsetBottom");
		we.nMaxScrollTop = this._nOrgMaxScrollTop ? this._nOrgMaxScrollTop : we.nMaxScrollTop;
		if (this._isPullDown) {
			if (this._htWElement["pullDown"]._isReady_) {
				if (nTopMargin > we.nTop) {
					this._htWElement["pullDown"]._isReady_ = false;
					if (this.option("fnPullDownIdle")) {
						this.option("fnPullDownIdle")(this._htWElement["pullDown"]);
						this._oCore.nMinScrollTop=-nTopMargin;
					}
				}
			} else {
				if (we.nTop > nTopMargin) {
					this._htWElement["pullDown"]._isReady_ = true;
					if (this.option("fnPullDownBeforeUpdate")) {
						this.option("fnPullDownBeforeUpdate")(this._htWElement["pullDown"]);
						this._oCore.nMinScrollTop=0;
					}
				}
			}
		}
		if (this._isPullUp) {
			if (this._htWElement["pullUp"]._isReady_) {
				if (we.nTop >= (we.nMaxScrollTop - nBottomMargin)) {
					this._htWElement["pullUp"]._isReady_ = false;
					if (this.option("fnPullUpIdle")) {
						this.option("fnPullUpIdle")(this._htWElement["pullUp"]);
						this._oCore.nMaxScrollTop=we.nMaxScrollTop;
					}
				}
			} else {
				if (we.nTop < (we.nMaxScrollTop - nBottomMargin)) {
					this._htWElement["pullUp"]._isReady_ = true;
					if (this.option("fnPullUpBeforeUpdate")) {
						this.option("fnPullUpBeforeUpdate")(this._htWElement["pullUp"]);
						this._nOrgMaxScrollTop = we.nMaxScrollTop;
						this._oCore.nMaxScrollTop=we.nMaxScrollTop - nBottomMargin;
					}
				}
			}
		}
	},
	isMoving : function() {
		return this._oCore.isMoving();
	},
	_detachEvent : function() {
		this._oCore.detachAll();
		if(this.option("bAutoResize")) {
			jindo.m.unbindRotate(this._htEvent["rotate"]);
		}
		this._htEvent = null;
	},
	_createScroll : function(sDirection) {
		if( !(sDirection === "H" ? this._oCore.bUseHScroll : this._oCore.bUseVScroll) ) {
			return;
		}
		var welScrollbar = this._htWElement[sDirection + "scrollbar"],
			welScrollbarIndicator = this._htWElement[sDirection + "scrollbarIndicator"],
			welWrapper = this._htWElement["wrapper"];	
		if(welScrollbar) {
			welWrapper.remove(welScrollbar);
			this._htWElement[sDirection + "scrollbar"] = this._htWElement[sDirection + "scrollbarIndicator"] = null;
		}
		welScrollbar = this._createScrollbar(sDirection);
		welScrollbarIndicator = this._createScrollbarIndicator(sDirection);	
		this._htWElement[sDirection + "scrollbar"]= welScrollbar;
		this._htWElement[sDirection + "scrollbarIndicator"] = welScrollbarIndicator;
		welScrollbar.append(welScrollbarIndicator);
		welWrapper.append(welScrollbar);
		this._refreshScroll(sDirection);
	},
	_refreshScroll : function(sDirection) {
		if( !(sDirection === "H" ? this._oCore.bUseHScroll : this._oCore.bUseVScroll) ) {
			return;
		}
		if(!this._htWElement[sDirection + "scrollbar"]) {
			this._createScroll(sDirection);
		}
		var welScrollbar = this._htWElement[sDirection + "scrollbar"],
			welScrollbarIndicator = this._htWElement[sDirection + "scrollbarIndicator"],
			nSize = 0;
		if(sDirection === "H" ) {
			welScrollbar.width(this._oCore.nWrapperW);
			nSize = Math.max(Math.round(Math.pow(this._oCore.nWrapperW,2) / this._oCore.nScrollW), 8);
			this._nPropHScroll = (welScrollbar.width() - nSize) / this._oCore.nMaxScrollLeft; 
			welScrollbarIndicator.width(nSize);
		} else {
			welScrollbar.height(this._oCore.nWrapperH);
			nSize = Math.max(Math.round(Math.pow(this._oCore.nWrapperH,2) / this._oCore.nScrollH), 8);
			this._nPropVScroll = (welScrollbar.height() - nSize) / this._oCore.nMaxScrollTop;
			welScrollbarIndicator.height(nSize);
		}
	},
	_createScrollbar : function(sDirection) {
	 	var welScrollbar = jindo.$Element("<div>");
		welScrollbar.css({
			"position" : "absolute",
			"zIndex" : 100,
			"bottom" : (sDirection === "H" ? "1px" : (this._oCore.bUseHScroll ? '7' : '2') + "px"),
			"right" : (sDirection === "H" ? (this._oCore.bUseVScroll ? '7' : '2') + "px" : "1px"),
			"pointerEvents" : "none",
			"overflow" : "hidden"});
		if(!this.option("bUseFixedScrollbar")) {
			welScrollbar.css(this._oCore.sCssPrefix + "TransitionProperty", "opacity")
				.css(this._oCore.sCssPrefix + "TransitionDuration", "0")
				.opacity(0);
		}
		if (sDirection === "H") {
			welScrollbar.css({
				height: "7px",
				left: "2px"
			});
		} else {
			welScrollbar.css({
				width: "7px",
				top: "2px"
			});
		}
		return welScrollbar;
	}, 
	_createScrollbarIndicator : function(sDirection) {
		var welScrollbarIndicator = jindo.$Element("<div>");
		welScrollbarIndicator.css({
			"position" : "absolute",
			"zIndex" : 100,
			"border": "1px solid rgba(255,255,255,0.9)",
			"borderRadius" : "3px",
			"pointerEvents" : "none",
			"left" : 0,
			"top" : 0,
			"background-color" :"rgba(0,0,0,0.5)"})
			.css(this._oCore.sCssPrefix + "BackgroundClip", "padding-box")
			.css(this._oCore.sCssPrefix + "BoxSizing", "border-box")
			.css(this._oCore.sCssPrefix + "BorderRadius", "3px")
			.css(this._oCore.sCssPrefix + "TransitionProperty", "-webkit-transform")
			.css(this._oCore.sCssPrefix + "Transform", "translate" + this._oCore.sTransOpen + "0,0" + this._oCore.sTransEnd);
		if(this._oCore.option("bUseCss3d")) {
			welScrollbarIndicator.css(this._oCore.sCssPrefix + "TransitionTimingFunction", "cubic-bezier(0.33,0.66,0.66,1)");
		}
		if(sDirection === "H") {
			welScrollbarIndicator.css("height" , "100%");
		} else {
			welScrollbarIndicator.css("width", "100%");
		} 
		return 	welScrollbarIndicator;			
	},
	_setScrollBarPos: function (sDirection, nPos) {
		var bUseScroll = (sDirection === "H" ? this._oCore.bUseHScroll : this._oCore.bUseVScroll);
		if(!bUseScroll) {
			return;
		}
		var welIndicator = this._htWElement[sDirection + "scrollbarIndicator"],
			welScrollbar = this._htWElement[sDirection + "scrollbar"];
		nPos = this["_nProp" + sDirection + 'Scroll'] * nPos;
		if (welIndicator) {
			if (this._oCore.isAndroid) {
				var nBufferPos = parseInt( ( sDirection === "H" ? welIndicator.css("left") : welIndicator.css("top") ), 10);
				nPos -= isNaN(nBufferPos) ? 0 : nBufferPos;
			}
			welIndicator.css(this._oCore.sCssPrefix + "Transform", "translate" + this._oCore.sTranOpen + (sDirection === "H" ? nPos + "px,0" : "0," + nPos + "px") + this._oCore.sTranEnd);
		}
		if (!this.option("bUseFixedScrollbar") && welScrollbar) {
			welScrollbar.css(this._oCore.sCssPrefix + "TransitionDuration", 0).opacity(1);
		}
	},		
	destroy: function() {
		this.deactivate();
		for(var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		this._oCore.destroy();
		delete this._oCore; 
		this._htWElement = null;
	}
}).extend(jindo.UIComponent);
