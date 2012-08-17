jindo.m.Dialog = jindo.$Class({
	$init : function(htUserOption) {
		var htDefaultOption = {
			bActivateOnload : true,
			sClassPrefix : "dialog-",
			sPosition : "center",
			bUseEffect : true,
			bAutoClose : false,
			bAutoReposition : true,
			sFoggyColor : "gray",
			nFoggyOpacity : 0.5,
			sEffectType : "pop",
			nEffectDuration : 500
		};
		this.option(htDefaultOption);
		this.option(htUserOption || {});
		this._setWrapperElement();
		this._initVar();
		this._setDeviceSize();
		this._initElement();
		if(this.option("bActivateOnload")) {
			this.activate();
		}
	},
	_setWrapperElement : function() {
		this._htWElement = {};
		this._htWElement["dialog_container"] =  jindo.$Element('<div class="' + this.option("sClassPrefix") + 'container"></div>');
		this._htWElement["dialog_foggy"] =  jindo.$Element('<div class="' + this.option("sClassPrefix") + 'fog"></div>');
		this._htWElement["dialog_layer"] =  jindo.$Element('<div class="' + this.option("sClassPrefix") + 'layer"></div>');
		this._htWElement["dialog_clone"] =  jindo.$Element('<div class="' + this.option("sClassPrefix") + 'clone"></div>');
	},
	_initVar : function() {
		this._htDialogSize = {
			width : 0,
			height : 0
		};
		this._sTemplate = null;
		this._bIsShown = false;
		this._bProcessingShow = false;
		this._bProcessingHide = false;
		this._htDeviceInfo = jindo.m.getDeviceInfo();
		this._bIOS = (this._htDeviceInfo.iphone || this._htDeviceInfo.ipad) ? true : false;
		this._bAndroid = this._htDeviceInfo.android ? true : false;
	},
	_setDeviceSize : function() {
		if (this._bIOS || (this._bAndroid) || !jindo.$Agent().navigator().mobile) {
			this._htDeviceSize = jindo.$Document().clientSize();
		} else {
			this._htDeviceSize = {
				width : window.screen.width,
				height : window.screen.height
			};
		}	
	},
	_initContainerTop : function() {
		var nTop = 0;
		var bUseEffect = this.option("bUseEffect");
		var sEffectType = this.option("sEffectType");
		if(bUseEffect && (sEffectType == "slide-up" || sEffectType == "slide-down")) {
			nTop = this._htDeviceSize.height * ((sEffectType == "slide-up") ? 1 : -1);
		} 
		nTop += window.pageYOffset;
		this._htWElement["dialog_container"].css("top", nTop + "px");
	},
	_initElement : function() {		
		this._htWElement["dialog_foggy"].css({
			position : "absolute",
			padding : "0px",
			margin : "0px", 
			border : "0px", 
			backgroundColor : this.option("sFoggyColor"),
			opacity : this.option("nFoggyOpacity"),
			width : this._htDeviceSize.width + "px",
			height : this._htDeviceSize.height + "px",
			left : "0px",
			top : "0px"	
		});
		this._htWElement["dialog_foggy"].appendTo(this._getContainer());
		this._htWElement["dialog_layer"].css({
			position : "relative",
			backgroundColor : "white"
		});
		this._htWElement["dialog_layer"].appendTo(this._getContainer());
		this._htWElement["dialog_container"].css({
			position : "absolute",
			overflow : "hidden",
			width : this._htDeviceSize.width + "px",
			height : this._htDeviceSize.height + "px",
			left : "0px",
			zIndex : 100
		});
		this._initContainerTop();
		this._htWElement["dialog_container"].hide();
		this._htWElement["dialog_container"].appendTo(document.body);
		if(this.option("bUseEffect")) {
			this._oLayerEffect = new jindo.m.LayerEffect(this._getContainer());
		}
		this._htWElement["dialog_clone"].css({
			position : "absolute",
			left : "-1000px",
			top : "-1000px"
		});
		this._htWElement["dialog_clone"].appendTo(document.body);
		this._htWElement["dialog_clone"].hide();
	},
	_onActivate : function() {
		this._attachEvent();
	},
	_onDeactivate : function() {
		this._detachEventAll();
	},
	_attachEvent : function() {
		this._htEvent = {};
		this._htEvent["click"] = {
			ref : jindo.$Fn(this._onClick, this).attach(this.getDialog(), "click"),
			el	: this.getDialog()
		};
		this._htEvent["touchend"] = {
			ref : jindo.$Fn(this._onClick, this).attach(this._getFoggy(), "touchend"),
			el	: this._getFoggy()
		};
		this._htEvent["touchmove"] = {
			ref : jindo.$Fn(this._onTouchMove, this).attach(this._getContainer(), "touchmove"),
			el	: this._getContainer()
		};
		if (this.option("bAutoReposition")) {
			this._htEvent["rotate"] = jindo.$Fn(this._onResize, this).bind();
			jindo.m.bindRotate(this._htEvent["rotate"]);
		}
	},
	_detachEvent : function(sEventKey) {
		if(sEventKey) {
			var htTargetEvent = this._htEvent[sEventKey];
			if (htTargetEvent.ref) {
				htTargetEvent.ref.detach(htTargetEvent.el, sEventKey);
			}
		}
	},
	_detachEventAll : function() {
		for(var p in this._htEvent) {
			this._detachEvent(p);
		}
		jindo.m.unbindRotate(this._htEvent["rotate"]);
		this._htEvent = null;
	},
	_onClick : function(we) {
		var sClassPrefix = this.option("sClassPrefix");
		var elClosestClose, elClosestConfirm, elClosestCancel, elClosestLayer, elClosestAnchor;
		if ((elClosestClose = jindo.m.getClosest(("." + sClassPrefix + "close"), we.element))) {
			if(this.fireEvent("close", {
				sType : "close",
				elLayer : this.getDialog()
			})) {
				this.hide();
			} 
		} else if ((elClosestConfirm = jindo.m.getClosest(("." + sClassPrefix + "confirm"), we.element))) {
			if(this.fireEvent("confirm", {
				sType : "confirm",
				elLayer : this.getDialog()
			})) {
				this.hide();
			}
		} else if ((elClosestCancel = jindo.m.getClosest(("." + sClassPrefix + "cancel"), we.element))) {
			if (this.fireEvent("cancel", {
				sType : "cancel",
				elLayer : this.getDialog()
			})) {
				this.hide();
			}
		} else if ((elClosestLayer = jindo.m.getClosest(("." + sClassPrefix + "layer"), we.element))) {
			if ((elClosestAnchor = jindo.m.getClosest(("a"), we.element))) {
				return false;
			}
		} else {
			if(this.option("bAutoClose")) { this.hide(); }
		}
		we.stop();
		return false;
	},
	_onTouchStart : function(we) {
		var sClassPrefix = this.option("sClassPrefix");
		var elClosestLayer;
		if (!(elClosestLayer = jindo.m.getClosest(("." + sClassPrefix + "layer"), we.element))) {
			we.stop(jindo.$Event.CANCEL_ALL);
			return false;
		}
	},
	_onTouchMove : function(we) {
		we.stop(jindo.$Event.CANCEL_ALL);
		return false;
	},
	_onResize : function(we) {
		if(this._bProcessingShow || this._bProcessingHide) {
			if(this.option("bUseEffect")) { 
				this._getLayerEffect().stop();
			} else {
				if(this._bProcessingShow) {
					this._endShowEffect();
				} else {
					this._endHideEffect();
				}
			}
		}
		if(this._oTimeout) {
			clearTimeout(this._oTimeout);
			this._oTimeout = null;
		}
		if (this.isShown() && this._bIOS) {
			this._htWElement["dialog_container"].hide();
		}
		this._oTimeout = setTimeout(jindo.$Fn(function() {
			this._resizeDocument();
			if (this.isShown() && this._bIOS) {
				this._htWElement["dialog_container"].show();
			}
		}, this).bind(), 300);
	},
	_resizeDocument : function() {
		this._setDeviceSize();
		this._htWElement["dialog_container"].css({
			width : this._htDeviceSize.width + "px",
			height : this._htDeviceSize.height + "px"
		});
		this._htWElement["dialog_foggy"].css({
			width : this._htDeviceSize.width + "px",
			height : this._htDeviceSize.height + "px"
		});
		this._resizeDialog(true);
		if(this.option("bUseEffect")) { this._getLayerEffect().setSize(); }
	},
	_resizeDialog : function(bForced) {
		if(this._setDialogSize() || bForced) {
			this._repositionDialog();
		}
	},
	_getLayerEffect : function() {
		return this._oLayerEffect;
	},
	_getContainer : function() {
		return this._htWElement["dialog_container"].$value();
	},
	_getFoggy : function() {
		return this._htWElement["dialog_foggy"].$value();
	},
	getDialog : function() {
		return this._htWElement["dialog_layer"].$value();
	},
	setTemplate : function(sTemplate) {
		this._sTemplate = sTemplate;
		this._oTemplate = jindo.$Template(this._sTemplate);
		this._htWElement["dialog_clone"].html(sTemplate);
		this._resizeDialog();
	},
	getTemplate : function() {
		return this._sTemplate;
	},
	_setDialogSize : function() {
		var nLayerWidth;
		var nLayerHeight;
		if(this.option("sPosition") == "all") {
			nLayerWidth = this._htDeviceSize.width;
			nLayerHeight = this._htDeviceSize.height;
		} else {
			this._htWElement["dialog_clone"].show();
			nLayerWidth = Math.min(this._htWElement["dialog_clone"].width(), this._htDeviceSize.width);
			nLayerHeight = Math.min(this._htWElement["dialog_clone"].height(), this._htDeviceSize.height);
			this._htWElement["dialog_clone"].hide();
		}
		if(this._htDialogSize.width == nLayerWidth && this._htDialogSize.height == nLayerHeight) {
			return false;
		}
		this._htDialogSize = {
			width : nLayerWidth,
			height : nLayerHeight
		};
		this._htWElement["dialog_layer"].css({
			width : nLayerWidth + "px",
			height : nLayerHeight + "px" 
		});
		return this._htDialogSize;
	},
	_getDialogSize : function() {
		return this._htDialogSize;
	},
	_repositionDialog : function() {
		var htLayerPosition = this._getDialogPosition();
		this._htWElement["dialog_layer"].css({
			top : htLayerPosition.top + "px",
			left : htLayerPosition.left + "px"
		});
		this._htWElement["dialog_container"].css({
			top : window.pageYOffset + "px",
			left : window.pageXOffset + "px"
		});
		if(!this.isShown()) {
			var sEffectType = this.option("sEffectType");
			if(sEffectType == "slide-up" || sEffectType == "slide-down") {
				this._initContainerTop();
			}
		}
	},
	_getDialogPosition : function() {
		var nWidth = this._htDeviceSize.width;
		var nHeight = this._htDeviceSize.height;
		var nLayerWidth = this._getDialogSize().width;
		var nLayerHeight = this._getDialogSize().height;
		var htLayerPosition = {};
		switch(this.option("sPosition")) {
		case "top":
			htLayerPosition.top = 0;
			htLayerPosition.left = parseInt((nWidth - nLayerWidth) / 2, 10);
			break;
		case "center":
			htLayerPosition.top = parseInt((nHeight - nLayerHeight) / 2, 10);
			htLayerPosition.left = parseInt((nWidth - nLayerWidth) / 2, 10);
			break;
		case "bottom":
			htLayerPosition.top = parseInt(nHeight - nLayerHeight,10);
			htLayerPosition.left = parseInt((nWidth - nLayerWidth) / 2, 10);
			break;
		case "all" :
			htLayerPosition.top = 0;
			htLayerPosition.left = 0;
			break;
		}
		return htLayerPosition;
	},
	setPosition : function(sPosition) {
		if(sPosition == "top" || sPosition == "center" || sPosition == "bottom" || sPosition == "all") {
			this.option("sPosition", sPosition);
		}
		this._resizeDialog();
	},
	useEffect : function() {
		if(this.option("bUseEffect")) { return false; }
		this.option("bUseEffect", true);
		this._initContainerTop();
	},
	unuseEffect : function() {
		if(!this.option("bUseEffect")) { return false; }
		this.option("bUseEffect", false);
		this._initContainerTop();
	},
	setEffectType : function(sEffectType) {
		this.useEffect();
		if(sEffectType == "pop" || sEffectType == "slide-up" || sEffectType == "slide-down" || sEffectType == "flip") {
			this.option("sEffectType", sEffectType);
			this._initContainerTop();
		} 
	},
	setEffectDuration : function(nEffectDuration) {
		this.useEffect();
		if(nEffectDuration && nEffectDuration > 99) {
			this.option("nEffectDuration", nEffectDuration);
		}
	},
	setEffect : function(htEffectOption) {
		this.useEffect();
		if(htEffectOption.type) {
			this.setEffectType(htEffectOption.type);
		}
		if(htEffectOption.duration) {
			this.setEffectDuration(htEffectOption.duration);
		}
	},
	isShown : function() {
		return this._bIsShown;
	},
	show : function(htTemplate, htEventHandler) {
		if(this.isShown()) { return false; }
		this._bProcessingShow = true;
		this._htEvent["touchstart"] = {
			ref : jindo.$Fn(this._onTouchStart, this).attach(document, "touchstart"),
			el	: document
		};
		if(htEventHandler) {
			this._showAttachedEvent = htEventHandler;
			this.attach(htEventHandler); 
		}
		this._resizeDocument();
		if(typeof htTemplate == "undefined") { 
			htTemplate = {};
		} else {
			this._htWElement["dialog_clone"].html(this._oTemplate.process(htTemplate));
			this._resizeDialog();
		}
		this._htWElement["dialog_layer"].html(this._oTemplate.process(htTemplate));
		if(!this.fireEvent("beforeShow", {
			sType : "beforeShow",
			elLayer : this.getDialog()
		})) { return; }
		this._showDialogLayer();
	},
	_showDialogLayer : function() {
		if(this.option("bUseEffect")) {
			this._getLayerEffect().attach("afterEffect", jindo.$Fn(this._endShowEffect, this).bind());
			this._startShowEffect();			
		} else {
			this._htWElement["dialog_container"].show();
			this._endShowEffect();
		}
	},
	_startShowEffect : function() {
		var sEffectType = this.option("sEffectType");
		var nEffectDuration = this.option("nEffectDuration");
		switch(sEffectType) {
		case "slide-up":
			this._htWElement["dialog_container"].show();
			this._getLayerEffect().setSize();
			this._getLayerEffect().slide({
				sDirection : "up",
				nDuration : nEffectDuration
			});
			break;
		case "slide-down":
			this._htWElement["dialog_container"].show();
			this._getLayerEffect().setSize();
			this._getLayerEffect().slide({
				sDirection : "down",
				nDuration : nEffectDuration
			});
			break;
		case "pop":
			this._getLayerEffect().pop({
				sDirection : "in",
				nDuration : nEffectDuration,
				htFrom : {opacity : 1}
			});
			break;
		case "flip":
			this._htWElement["dialog_container"].show();
			this._getLayerEffect().flip({
				nDuration : nEffectDuration,
				elFlipFrom : this._getContainer(),
				elFlipTo : this._getContainer(),
				htFrom : {opacity : 0},
				htTo : {opacity : 1}
			});
			break;
		}
	},
	_endShowEffect : function() {
		if(this.option("bUseEffect")) { this._getLayerEffect().detachAll("afterEffect"); }
		this.fireEvent("show", {
			sType : "show",
			elLayer : this.getDialog()
		});
		this._bIsShown = true;
		this._bProcessingShow = false;
	},
	hide : function() {
		if(!this.isShown()) { return false; }
		this._bProcessingHide = true;
		if(!this.fireEvent("beforeHide", {
			sType : "beforeHide",
			elLayer : this.getDialog()
		})) { return; }
		this._hideDialogLayer();
	},
	_hideDialogLayer : function() {
		if(this.option("bUseEffect")) {
			this._getLayerEffect().attach("afterEffect", jindo.$Fn(this._endHideEffect, this).bind());		
			this._startHideEffect();			
		} else {
			this._htWElement["dialog_container"].hide();
			this._endHideEffect();
		}
	},
	_startHideEffect : function() {
		var sEffectType = this.option("sEffectType");
		var nEffectDuration = this.option("nEffectDuration");
		switch(sEffectType) {
		case "slide-up":
			this._getLayerEffect().slide({
				sDirection : "down",
				nDuration : nEffectDuration
			});
			break;
		case "slide-down":
			this._getLayerEffect().slide({
				sDirection : "up",
				nDuration : nEffectDuration
			});
			break;
		case "pop":
			this._getLayerEffect().pop({
				sDirection : "out",
				nDuration : nEffectDuration,
				htTo : {opacity : 0}
			});
			break;
		case "flip":
			this._getLayerEffect().flip({
				nDuration : nEffectDuration,
				elFlipFrom : this._getContainer(),
				elFlipTo : this._getContainer(),
				htTo : {opacity : 0}
			});
			break;
		}
	},
	_endHideEffect : function() {
		if(this.option("bUseEffect")) { this._getLayerEffect().detachAll("afterEffect"); }
		this.fireEvent("hide", {
			sType : "hide",
			elLayer : this.getDialog()
		});	
		if(this._showAttachedEvent) {
			for(var evt in this._showAttachedEvent) {
				this.detachAll(evt);	
			}
			this._showAttachedEvent = null;			
		}
		this._detachEvent("touchstart");
		this._htWElement["dialog_container"].hide();		
		this._htWElement["dialog_container"].css("opacity", 1);
		if(window.pageYOffset || window.pageXOffset) {
			this._htWElement["dialog_container"].css({
				top : "0px",
				left : "0px"
			});
		}
		this._bIsShown = false;
		this._bProcessingHide = false;
	},
	destroy : function() {
		this._detachEventAll();
		if(this.option("bUseEffect")) {
			this._getLayerEffect().destroy();
			this._oLayerEffect = null;
		}
		this._htWElement["dialog_container"].leave();
		this._htWElement["dialog_clone"].leave();
		this._htWElement = null;
		this._htDeviceSize = null;
		this._htDialogSize = null;
		this._sTemplate = null;
		this._oTemplate = null;
		this._bIsShown = null;
		this._bProcessingShow = null;
		this._bProcessingHide = null;
		this._oTimeout = null;
		this._htDeviceInfo = null;
		this._bIOS = null;
		this._bAndroid = null;
	}
}).extend(jindo.UIComponent);
