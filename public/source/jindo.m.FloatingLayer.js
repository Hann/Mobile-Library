jindo.m.FloatingLayer = jindo.$Class({ 
	$init : function(el,htUserOption) {
		this.option({
			 bActivateOnload : true,
			 sPosition : "bottom",
			 sDirection : "up",
			 nSlideDuration : 500,
			 sSlideTimingFunction : "ease-in-out",
			 nFadeInDuration : 0,
			 sFadeInTimingFunction : "ease-in-out", 
			 nFadeOutDuration : 0,
			 sFadeOutTimingFunction : "ease-in-out",
			 nTimeout : -1
		});
		this.option(htUserOption || {});
		this._initVar();
		this._setWrapperElement(el);
		if(this.option("bActivateOnload")) {
			this.activate();
		}
	},
	_initVar: function() {
		this._oFloatingEffect = null;
		this._oFadeinEffect = null;
		this._oLayerPosition = null;
		this._oScrollEnd = null;
		this._nTimeoutTimer = -1;
		this._isFixed = false;
		this._isLayerOn = false;
		this._isMoving = false;	
	},
	_setWrapperElement: function(el) {
		this._htWElement = {};
		this._htWElement["element"] = jindo.$Element(el);
		this._htWElement["viewElement"] = jindo.$Element(this._createView());	
		if(jindo.m.getDeviceInfo().android && parseInt(jindo.m.getDeviceInfo().version,10) >= 3) {
			this._htWElement["targetElement"] = this._htWElement["viewElement"];
		} else {
			this._htWElement["targetElement"] = this._htWElement["element"];
		}
	},
	_initComponent : function() {
		var self = this,
			el = this._htWElement["element"].$value();
		this._oLayerPosition = new jindo.m.LayerPosition(this._htWElement["viewElement"].$value(), {
			sPosition : this.option("sPosition"),
			bActivateOnload : false,
			bAutoReposition : true
		});
		this._oFloatingEffect = new jindo.m.LayerEffect(el);
		if(this.option("nFadeInDuration") !== 0) {
			this._oFadeinEffect = new jindo.m.LayerEffect(this._htWElement["targetElement"].$value(), {
					nDuration: this.option("nFadeInDuration")			
				}).attach("afterEffect",function() {
					self._startHideTimer();
				});		
		}		
		this._isFixed = this._oLayerPosition._isSupportFixed();
		this._oScrollEnd = new jindo.m.ScrollEnd();
	},
	getLayer : function() {
		return this._htWElement["element"].$value();
	},
	_createView : function () {
		var bVisible = this._htWElement["element"].visible(),
			welView = this._htWElement["element"].query("._floatingLayer_view_divtag_");
		if(!welView) {
			welView = jindo.$Element("<div class='_floatingLayer_view_divtag_'>");
		} else {
			welView = jindo.$Element(welView);
		}
		if (!bVisible) {
			this._htWElement["element"].css({
				left : "-9999px"
			}).show();
		}
 		welView.css({
 			width : this._htWElement["element"].width() + "px",
 			height : this._htWElement["element"].height() + "px",
 			zIndex : 1000
 		});
		if (!bVisible) {
			this._htWElement["element"].hide();
		}
		return welView;
	},
	resize : function(nWidth, nHeight) {
		this._htWElement["viewElement"].css({
			width : nWidth + "px",
			height : nHeight + "px"
		});
		this._oLayerPosition.setPosition();
	},
	show : function() { 
		if (this._fireEvent("beforeShow")) {
			if(!this._oLayerPosition.isActivating()) {
				this._oLayerPosition.activate();
			}
			this._setFloatingEffect(true);
			this._htWElement["element"].show();
			this._oFloatingEffect.slide({
				sDirection: this.option("sDirection"),
				nDuration: this.option("nSlideDuration"),
				sTransitionTimingFunction : this.option("sSlideTimingFunction"),
				elBaseLayer: this._htWElement["viewElement"].$value()
			});
		}
	},
	hide : function() {
		if (this._fireEvent("beforeHide")) {
			this._stopHideTimer();
			if(this._oLayerPosition.isActivating()) {
				this._oLayerPosition.deactivate();
			}
			this._detachFloatingEvent();
			this._setFloatingEffect(false);
			if(this.option("nFadeOutDuration") !== 0) {
				this._oFloatingEffect.fade({
					sDirection: "out",
					nDuration: this.option("nFadeOutDuration"),
					sTransitionTimingFunction : this.option("sFadeOutTimingFunction")
				});	
			} else {
				this._htWElement["element"].hide();
				this._fireEvent("hide");
			}
		}
	},
	_fireEvent : function(sType) {
		return this.fireEvent(sType, {
			welLayer : this._htWElement["element"]
		});		
	},
	_startHideTimer : function() {
		if (this.option("nTimeout") > -1) {
			var self = this;
			this._stopHideTimer();
			this._nTimeoutTimer = setTimeout(function(){
				self.hide();
			}, this.option("nTimeout"));
		}
	},
	_stopHideTimer : function() {
		clearTimeout(this._nTimeoutTimer);
		this._nTimeoutTimer = -1;
	},
	_onTouchStart : function(we) {
		this._initFloatingData();
		if (this._isLayer(we.element)) {
			this._isLayerOn = true;
			this._htWElement["targetElement"].show();
		} else {
			this._htWElement["targetElement"].hide();
		}
	},
	_onScrollEnd : function(we) {
		if(!this._isFixed) {
			this._runFadeIn();
		} else {
			this._startHideTimer();	
		}
	},
	_onTouchMove : function(we) {
		this._isMoving = true;
	},
	_onTouchEnd : function(we) {
		if(this._isLayerOn) {
			this._oLayerPosition.setPosition();
			return;
		} else if (!this._isMoving) {
			this._runFadeIn();
		}
	},		
	_runFadeIn : function() {
		if (this._isLayerOn) {
			this._startHideTimer();	
		} else {
			this._fadeIn();
		}		
	},
	_fadeIn : function() {
			this._oLayerPosition.setPosition();
			if(this._oFadeinEffect) {
				this._oFadeinEffect.clearEffect(true);
				this._oFadeinEffect.fade({
					sDirection: "in",
					sTransitionTimingFunction : this.option("sFadeInTimingFunction")					
				});			
			} else {
				this._htWElement["targetElement"].show();
				this._startHideTimer();
			}
	},
	_isLayer : function(el) {
		if(el && (el === this._htWElement["element"].$value() || this._htWElement["element"].isParentOf(el)) ) {
			return true;			
		} else {
			return false;
		}
	},
	_initFloatingData : function() {
		this._stopHideTimer();
		if(this._oFloatingEffect && this.option("nFadeOutDuration") !== 0) {
			this._oFloatingEffect.clearEffect(true);
		}
		if(this._oFadeinEffect){
			this._oFadeinEffect.clearEffect(true);
		}
		this._isMoving = false;
		this._isLayerOn = false;
	},
	_onActivate : function() {
		this._initComponent();
	},	
	_onDeactivate : function() {
		this._detachEvent();
		if(this._oFadeinEffect) {
			this._oFadeinEffect.detachAll("afterEffect");
			this._oFadeinEffect.destroy();
		}
		this._oFloatingEffect.destroy();
		this._oScrollEnd.destroy();
		this._oLayerPosition.destroy();
		document.body.appendChild(this._htWElement["element"].$value());
		this._htWElement["viewElement"].leave();
	},
	_attachFloatingEvent : function() {
		this._htEvent = {};
		if(!this._isFixed) {
			this._htEvent["event_touchstart"] = {
				el : document,
				ref : jindo.$Fn(this._onTouchStart, this).attach(document, "touchstart")
			};
			this._htEvent["event_touchmove"] = {
				el : document,
				ref : jindo.$Fn(this._onTouchMove, this).attach(document, "touchmove")
			};
			this._htEvent["event_touchend"] = {
				el : document,
				ref : jindo.$Fn(this._onTouchEnd, this).attach(document, "touchend")
			};
		}
		this._oScrollEnd.attach("scrollEnd", jindo.$Fn(this._onScrollEnd,this).bind());
	},
	_detachEvent : function() {
		this._detachFloatingEvent();
	},
	_setFloatingEffect : function(isShow) {
		var self=this;
		this._oFloatingEffect.detachAll("afterEffect");
		this._oFloatingEffect.clearEffect(true);
		if(this._oFadeinEffect){
			this._oFadeinEffect.clearEffect(true);
		}
		if(isShow) {
			this._oFloatingEffect.attach("afterEffect", function(){
				self._attachFloatingEvent();
				self._startHideTimer();
				self._fireEvent("show");
			});					
		} else {
			if(this.option("nFadeOutDuration") !== 0) {				
				this._oFloatingEffect.attach("afterEffect", function() {
					self._fireEvent("hide");
				});	
			}
		}
	},
	_detachFloatingEvent : function() {
		for(var p in this._htEvent) {			
			var ht = this._htEvent[p];			
			if (ht.ref) {
				ht.ref.detach(ht.el, p.substring(p.lastIndexOf("_")+1));
			}
		}
		this._oScrollEnd.detachAll("scrollEnd");
		this._htEvent = null;	
	},
	destroy: function() {
		this.deactivate();
		for(var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		delete this._htWElement;
		this._initFloatingData();
	}
}).extend(jindo.UIComponent);
