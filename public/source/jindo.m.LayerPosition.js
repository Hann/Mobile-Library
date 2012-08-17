jindo.m.LayerPosition = jindo.$Class({ 
	$init : function(el,htUserOption) {
		this.option({
			 bActivateOnload : true,
			 bAutoReposition : true,
			 sPosition : "center",
			 nLeftMargin : 0,
			 nRightMargin : 0,
			 nTopMargin : 0,
			 nBottomMargin : 0
		});
		this.option(htUserOption || {});
		this._initVar();
		this._setWrapperElement(el);
		if(this.option("bActivateOnload")) {
			this.activate();
		}
	},
	_isSupportFixed : function() {
		var htInfo = jindo.m.getDeviceInfo();
		var isFixed = false;
		if(htInfo.android) {
			if(parseInt(htInfo.version,10) >= 3) {
				isFixed = true;
			} else {
				isFixed = false;
			}
		} else if(htInfo.ipad || htInfo.iphone) {
			if(parseInt(htInfo.version,10) >= 5) {
				isFixed = true;
			} else {
				isFixed = false;
			}
		}
		return isFixed;
	},
	_onActivate : function() {
		this._isVertical = jindo.m.isVertical();	
		if (this.option("bAutoReposition")) {
			this._attachEvent();	
		}
		this.setPosition();
	},
	_onDeactivate : function() {
		if (this.option("bAutoReposition")) {
			this._detachEvent();
		}
	},
	_initVar: function() {
		var nLeft = this.option("nLeftMargin"),
			nTop = this.option("nTopMargin");
		this._htMargin = {
			nLeft: nLeft,
			nRight: this.option("nRightMargin"),
			nTop: nTop,
			nBottom: this.option("nBottomMargin")
		};
		this._sPosition = this.option("sPosition");
		this._htOldPosition = {
			nTop : null,
			nLeft : null,
			nBottom : null
		};
		this._htPosition = {
			nTop : null,
			nLeft : null,
			nBottom : null
		};
		this._bUseFixedProperty = this.option("bAutoReposition") && this._isSupportFixed();
		this._isVertical = null;	
		this._hasOrientationChange = jindo.m.getDeviceInfo().ipad || jindo.m.getDeviceInfo().iphone || (jindo.m.getDeviceInfo().android && jindo.m.getDeviceInfo().bChrome);
		this._nPreWidth = -1;
	},
	getPosition : function() {
		return this._sPosition;
	},
	getMargin : function() {
		return this._htMargin;
	},
	getLayer : function() {
		return this._htWElement["element"].$value();	
	},
	getCurrentPosition : function() {
		return this._htPosition;
	},
	_setWrapperElement: function(el) {
		this._htWElement = {};
		this.setLayer(el);
	},
	setLayer : function(el) {
		el = (typeof el == "string" ? jindo.$(el) : el); 
		this._htWElement["element"] = jindo.$Element(el);
		if(this._bUseFixedProperty) {
			this._htWElement["element"].css("position", "fixed");			
		} else {
			this._htWElement["element"].css("position", "absolute");
		}
		if (el.parentNode != document.body) {
			document.body.appendChild(el);
		}
		return this;
	},
	top : function(htMargin) {
		this.setPosition("top", htMargin);
	},
	bottom : function(htMargin) {
		this.setPosition("bottom", htMargin);
	},
	center : function(htMargin) {
		this.setPosition("center", htMargin);
	}, 
	all : function(htMargin) {
		this.setPosition("all", htMargin);
	}, 
	_fixedLayerSize : function(nWidth, nHeight) {
		var nLeft = parseInt(this._htMargin.nLeft,10),
			nTop = parseInt(this._htMargin.nTop,10),
			htPadding = {
				"padding-top" : parseInt(this._htWElement["element"].css("padding-top"),10),
				"padding-bottom" : parseInt(this._htWElement["element"].css("padding-bottom"),10), 
				"padding-left" : parseInt(this._htWElement["element"].css("padding-left"),10),
				"padding-right" :	parseInt(this._htWElement["element"].css("padding-right"),10)
			}, htBorder = {
				"border-top-width" : parseInt(this._htWElement["element"].css("border-top-width"),10),
				"border-bottom-width" : parseInt(this._htWElement["element"].css("border-bottom-width"),10),
				"border-left-width" : parseInt(this._htWElement["element"].css("border-left-width"),10),
				"border-right-width" : parseInt(this._htWElement["element"].css("border-right-width"),10)
			}; 
		nWidth -= htPadding["padding-left"] + htPadding["padding-right"] + htBorder["border-left-width"] + htBorder["border-right-width"] + nLeft + parseInt(this._htMargin.nRight,10);
		nHeight -= htPadding["padding-top"] + htPadding["padding-bottom"] + htBorder["border-top-width"] + htBorder["border-bottom-width"] + nTop + parseInt(this._htMargin.nBottom,10);
		this._htWElement["element"].css({
			width : nWidth + "px",
			height: nHeight + "px"
		});
		return {
			nTop : nTop,
			nLeft : nLeft
		};
	},
	_getPosition : function() {
		var nLayerWidth = this._htWElement["element"].width(),
			nLayerHeight = this._htWElement["element"].height(),
			htElementPosition = {},
			oClientSize = jindo.$Document().clientSize(),
			nWidth = oClientSize.width,
			nHeight = oClientSize.height;
		nLayerWidth += parseInt(this._htWElement["element"].css('marginLeft'), 10) + parseInt(this._htWElement["element"].css('marginRight'), 10) || 0;
		nLayerHeight += parseInt(this._htWElement["element"].css('marginTop'), 10) + parseInt(this._htWElement["element"].css('marginBottom'), 10) || 0;
		if(this._sPosition === "all") {
			htElementPosition = this._fixedLayerSize(nWidth, nHeight);
		} else {
			htElementPosition.nLeft = parseInt((nWidth - nLayerWidth) / 2,10) + parseInt(this._htMargin.nLeft,10);
			switch (this._sPosition) {
				case "top":
					htElementPosition.nTop = parseInt(this._htMargin.nTop,10);
					break;
				case "center":
					htElementPosition.nTop = parseInt((nHeight - nLayerHeight) / 2,10) + parseInt(this._htMargin.nTop,10);
					break;
				case "bottom":
					if(this._bUseFixedProperty) {
						htElementPosition.nBottom = parseInt(this._htMargin.nBottom,10);
					} else {
						htElementPosition.nTop = parseInt(nHeight - nLayerHeight,10) - parseInt(this._htMargin.nBottom,10);
					}
					break;
			}	
			if(!this._bUseFixedProperty) {
				htElementPosition = this._adjustScrollPosition(htElementPosition);
			}	
		}
		return htElementPosition;		
	},
    _adjustScrollPosition : function(htPosition) {
        var htScrollPosition = jindo.$Document().scrollPosition();
        htPosition.nTop += htScrollPosition.top; 
        htPosition.nLeft += htScrollPosition.left;
        return htPosition;
    },
	setPosition : function(sPosition, htMargin) {
		if(!this.isActivating()) {
			return;	
		}
		this._htMargin = htMargin || this._htMargin;
		this._sPosition = sPosition || this._sPosition;
		if(this._fireEvent("beforePosition")) {
			var bVisible = this._htWElement["element"].visible(); 
			if (!bVisible) {
				this._htWElement["element"].css({
					left : "-9999px"
				}).show();
			}
			this._htOldPosition = this._htPosition;
			this._htPosition = this._getPosition();
			if (!bVisible) {
				this._htWElement["element"].hide();
			}
			if (!bVisible || this._htOldPosition.nLeft !== this._htPosition.nLeft || this._htOldPosition.nTop !== this._htPosition.nTop || this._htOldPosition.nBottom !== this._htPosition.nBottom) {
				if(typeof this._htPosition.nTop === "undefined" ) {
					this._htWElement["element"].$value().style.top = null;
				} else if(typeof this._htPosition.nBottom === "undefined" ) {
					this._htWElement["element"].$value().style.bottom = null;
				}
				this._htWElement["element"].css({
					left : this._htPosition.nLeft + "px",
					top : this._htPosition.nTop + "px",
					bottom : this._htPosition.nBottom + "px"
				});
			}
			this._fireEvent("position");
		} 
	},
	_attachEvent : function() {
		this._htEvent = {};
		this._htEvent["actionEvent"] = jindo.$Fn(this._onEvent, this);
		this._htEvent["pageShow"] = jindo.$Fn(this._onPageShow, this).bind();
		if(this._bUseFixedProperty) {
			this._htEvent["actionEvent"].attach(window, "resize");
		} else {
			this._htEvent["actionEvent"].attach(window, "scroll").attach(window, "resize");
		}
		jindo.m.bindPageshow(this._htEvent["pageShow"]);
		if(this._hasOrientationChange) {
			this._htEvent["rotate"] = jindo.$Fn(this._onOrientationChange, this).attach(window, "orientationchange");
		}
	},
	_detachEvent : function() {
		this._htEvent["actionEvent"].detach(window, "scroll")
					.detach(window, "resize");	
		jindo.m.unbindPageshow(this._htEvent["pageShow"]);
		if(this._hasOrientationChange) {
			this._htEvent["rotate"].detach(window, "orientationchange");
		}		
		this._htEvent = null;
	},
	_onEvent : function(we) {
		if(this._isSupportFixed() && jindo.m.getDeviceInfo().android) {
			this._htWElement["element"].css("left",this._htWElement["element"].css("left"));
		}
		if (this._htWElement["element"].visible()){
			this.setPosition();
		}	
	},
	_onOrientationChange : function() {
		if (this._htWElement["element"].visible()){
			var self = this;
			if(window.innerWidth < this._htWElement["element"].width() ) {
				this._nPreWidth = this._htWElement["element"].width();
				this._htWElement["element"].width(window.innerWidth);
			} else {
				if(this._nPreWidth !== -1) {
					 this._htWElement["element"].width(this._nPreWidth);
				}
			}
			this._htWElement["element"].hide();
			this.setPosition();
			setTimeout(function() {
				self._htWElement["element"].show();	
			},0);
		}
	},
	_onPageShow : function() {
		if(this.isActivating()) {
			this.deactivate();
			this.activate();
		}
	},
	_fireEvent : function(sType) {
		return this.fireEvent(sType, {
			elLayer : this.getLayer(),
			htMargin : this.getMargin(),
			htPosition : this.getCurrentPosition()					
		});
	},
	destroy: function() {
		this.deactivate();
		for(var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		delete this._htWElement;
		delete this._htMargin;
		delete this._sPosition;
		delete this._htPosition;
		delete this._htOldPosition;
		delete this._bUseFixedProperty;
	}
}).extend(jindo.UIComponent);
