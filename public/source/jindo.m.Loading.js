jindo.m.Loading = jindo.$Class({
	$init : function(el, htUserOption) {
		this.option({
			 bActivateOnload : true,
			 nWidth : 31,
			 nHeight : 31,
			 sDefaultForeground : "black", 
			 sDefaultBackground : "transparent", 
			 sLoadingText : "로딩중입니다",
			 bUseFoggy : el ? false : true,
			 sFoggyColor : "gray",
			 nFoggyOpacity : 0.3
		});
		this.option(htUserOption || {});
		this._setWrapperElement(el);
		if(this.option("bActivateOnload")) {
			this.activate();
		}
	},
	$static : {
		DELAY : ["0","-.9167s","-.833s","-.75s","-.667s","-.5833s","-.5s","-.41667s","-.333s","-.25s","-.1667s","-.0833s"],
		ANIMATION_STYLE : "_loading_animation_sytle_",
		CONTAINER_CLASS : "_loading_container_class_"
	},
	_setWrapperElement: function(el) {
		this._htWElement = {};
		this._htWElement["base"] = jindo.$Element(jindo.$(el) ? jindo.$(el) : document.body);
		this._createLoading();
	},
	_createLoading : function() {
		this._createLoadingStyle();
		this._htWElement["container"] = jindo.$Element("<div style='zIndex: 1000'>")
				.addClass(jindo.m.Loading.CONTAINER_CLASS);
		if(this.option("bUseFoggy")) {
			this._createFoggy().appendTo(this._htWElement["container"]);
		}
		this._createLoadingElement();
		this._htWElement["loadingbox"] = jindo.$Element("<div>").css({
				"zIndex" : 1000,
				"position" : "absolute"
			}).append(this._htWElement["loading"]);
		if(this.option("sLoadingText")) {
			this._createLoadingText().appendTo(this._htWElement["loadingbox"]);
		}
		this._htWElement["loadingbox"].appendTo(this._htWElement["container"]);	
	},
	_createFoggy : function() {
		return this._htWElement["foggy"] = jindo.$Element("<div>").css({
				position : "absolute",
				padding : "0px",
				margin : "0px", 
				border : "0px", 
				backgroundColor : this.option("sFoggyColor"),
				opacity : this.option("nFoggyOpacity"),
				width : "100%",
				height : "100%",
				left : "0px",
				top : "0px",
				zIndex : 1000 
		});
	},
	_setPosition : function() {
		var nWidth = this._htWElement["loadingbox"].width(),
			nHeight = this._htWElement["loadingbox"].height(),
			htScrollPosition;
		if(this._isBody()) {
			htScrollPosition = jindo.$Document().scrollPosition();
			this._htWElement["container"].css({
				"left" : htScrollPosition.left + "px",
				"top" : htScrollPosition.top + "px"
			});
			this._htWElement["container"].css({
				width : window.innerWidth + "px",
				height : window.innerHeight + "px"
			});
		} else {
			if(this._htWElement["container"].width() < nWidth) {
				this._htWElement["container"].width(nWidth);
			}
			if(this._htWElement["container"].height() < nHeight) {
				this._htWElement["container"].height(nHeight);
			}			
		}
       this._htWElement["loadingbox"].css({
				"top" : "50%",
				"left" : "50%",
				"margin-left" : -parseInt(nWidth/2,10) + "px", 
				"margin-top" : -parseInt(nHeight/2,10) + "px"
		});
	},
	_isBody : function() {
		return this._htWElement["base"].$value() === document.body;
	},
	show : function() {
		if(this.fireEvent("beforeShow")) {
			var aSpan = this._htWElement["loading"].queryAll("span"),
				sCssPrefix = jindo.m.getCssPrefix();
			for(var i=0; i<aSpan.length; i++) {
				jindo.$Element(aSpan[i]).css(sCssPrefix + "Animation", "loadingfade 1s linear " + jindo.m.Loading.DELAY[i] + " infinite");
			}
			this._attachEvent();
			this._htWElement["container"].show();
			this._setPosition();
			this.fireEvent("show");
		}
	},
	hide : function() {
		if(this.fireEvent("beforeHide")) {
			var aSpan = this._htWElement["loading"].queryAll("span"),
				sCssPrefix = jindo.m.getCssPrefix();
			for(var i=0; i<aSpan.length; i++) {
				jindo.$Element(aSpan[i]).css(sCssPrefix + "Animation", "");
			}
			this._detachEvent();
			this._htWElement["container"].hide();
			this.fireEvent("hide");
		}
	},
	_onPrevent : function(we) {
		we.stop(jindo.$Event.CANCEL_ALL);
		return false;
	},
	_onRotate : function(we) {
		if(this._htWElement["container"].visible()) {
			if(jindo.m.getDeviceInfo().andorid) {
				this._setPosition();
			} else {
				this._htWElement["container"].hide();
				var self=this;
				setTimeout(function(){
					self._htWElement["container"].show();
					self._setPosition();
				},0);	
			}
		}	
	},
	_attachEvent : function() {
		this._htEvent["rotate"] = jindo.$Fn(this._onRotate, this).bind();
		this._htEvent["prevent"] = jindo.$Fn(this._onPrevent, this)
			.attach(this._htWElement["container"],"touchstart")
			.attach(this._htWElement["container"],"touchmove");
		if(this._isBody()) {
			this._htEvent["prevent"].attach(document.body,"touchstart");
		}
		jindo.m.bindRotate(this._htEvent["rotate"]);
	},
	_detachEvent : function() {
		if(this._htEvent["prevent"]) {
			this._htEvent["prevent"].detach(this._htWElement["container"], "touchmove")
				.detach(this._htWElement["container"],"touchstart");
			if(this._isBody()) {
				this._htEvent["prevent"].detach(document.body, "touchstart");
			}
		}
		jindo.m.unbindRotate(this._htEvent["rotate"]);
	},
	_createLoadingStyle : function() {
		if(!jindo.$(jindo.m.Loading.ANIMATION_STYLE)) {
			var elStyle = jindo.$("<style id='" + jindo.m.Loading.ANIMATION_STYLE + "' type='text/css'></style>");
			document.getElementsByTagName("head")[0].appendChild(elStyle);
			elStyle.sheet.insertRule("@-webkit-keyframes loadingfade{from{opacity:1}to{opacity:0}}",0);
		}
	},
	_createLoadingElement : function() {
			var sCssPrefix = jindo.m.getCssPrefix(),
				aHtml = [];
			for(var i=0; i<12; i++) {
				aHtml.push("<span style='display:block;position:absolute;top:40%;left:48%;width:11%;height:24%;border-radius:6px;background:");
				aHtml.push(this.option("sDefaultForeground"));
				aHtml.push("; opacity:0; -");
				aHtml.push(sCssPrefix);
				aHtml.push("-transform:rotate(");
				aHtml.push(i * 30);
				aHtml.push("deg) translate(0,-140%);'></span>");
			}
			this._htWElement["loading"] = jindo.$Element("<div>").css({
				"position" : "relative",
				"margin" : "0 auto"
			}).html(aHtml.join(""));
	},
	refresh : function() {
		this._htWElement["loading"].css({
			"width" : this.option("nWidth") + "px",
			"height" : this.option("nHeight") + "px",
			"background" : this.option("sDefaultBackground")
		});
		if(this._htWElement["text"]) {
			this._htWElement["text"].html(this.option("sLoadingText"));
		}
	},
	_createLoadingText : function() {
		return this._htWElement["text"] = jindo.$Element("<div>").css({
			"margin" : "2px 0 0 0",
			"bottom" : 0,
			"width" : "100%",
			"text-align" : "center"
		});
	},
	_onActivate : function() {
		this._htEvent = {};
		this._htWElement["container"].appendTo(this._htWElement["base"]);
		if(this._isBody()) {
			this._htWElement["container"].css({
				"position" : "absolute",
				"top" : 0,
				"left" : 0,
				"width" : "100%",
				"height" : "100%"
			}).hide();
		} else {
			this._htWElement["container"].css({
				"position" : "relative"
			}).hide();
		}
		this.refresh();
	},
	_onDeactivate : function() {
		this._detachEvent();
		this._htWElement["container"].leave();
	},
	destroy: function() {
		this.deactivate();
		for(var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		this._htWElement = null;
	}	
}).extend(jindo.UIComponent);
