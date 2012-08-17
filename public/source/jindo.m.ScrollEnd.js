jindo.m.ScrollEnd = jindo.$Class({
	$init : function(el,htUserOption) {
		this._initVar();
		this._setWrapperElement(el);
		this._attachEvent();
	},	
	_initVar : function() {
		if(jindo.m.getDeviceInfo().android) {
            if(parseInt(jindo.m.getDeviceInfo().version,10) >= 3) {
                this._nType = 2;    
                this._nScrollTimer = -1;
            } else {
                this._nType = 1;
            }
		} else {
		  this._nType = 0;
		}
		this._isTouched = false;
		this._isMoved = false;
		this._nObserver = null;
		this._nScrollEndTimer = null;
		this._nPreLeft = null;
		this._nPreTop = null;
		this._isTop = false;
	},
	_setWrapperElement : function(el) {
		this._htElement = {};
		this._htElement["body"] = document.body;
	},
	_attachEvent : function() {
		this._htEvent = {};
		this._htEvent["event_scroll"] = {
			ref : jindo.$Fn(this._onScroll, this).attach(window, "scroll"),
			el : window
		};
		if(this._nType == 1) {
			this._htEvent["event_touchstart"] = {
				ref : jindo.$Fn(this._onStartForAndroid, this).attach(this._htElement["body"], "touchstart"),
				el : this._htElement["body"]
			};
			this._htEvent["event_touchmove"] = {
				ref : jindo.$Fn(this._onMoveForAndroid, this).attach(this._htElement["body"], "touchmove"),
				el : this._htElement["body"]
			};
			this._htEvent["event_touchend"] = {
				ref : jindo.$Fn(this._onEndForAndroid, this).attach(this._htElement["body"], "touchend"),
				el : this._htElement["body"]
			};
		}
	},
	_detachEvent : function() {
		for(var p in this._htEvent) {
			var ht = this._htEvent[p];
			ht.ref.detach(ht.el, p.substring(p.lastIndexOf("_")));
		}
	},
	_startObserver : function() {
		var self = this;
		this._stopObserver();
		this._nObserver = setInterval(function() {
			self._observe();
		},100); 
	},
	_observe : function() {
		if(this._isTouched || (this._nPreTop !== window.pageYOffset || this._nPreLeft !== window.pageXOffset) ) {
			this._nPreTop = window.pageYOffset;	
			this._nPreLeft = window.pageXOffset;	
		} else {
			this._stopObserver();
			this._fireEventScrollEnd();
		}
	},
	_stopObserver : function() {
		clearInterval(this._nObserver);
		this._nObserver = null;	
	},
	_onScroll : function(we) {
		switch(this._nType) {
		    case 0 : this._fireEventScrollEnd(); break;
		    case 1 : this._startObserver(); break;
		    case 2 : var self = this;
                  clearTimeout(this._nScrollTimer);
                  this._nScrollTimer = setTimeout(function() {
                      self._fireEventScrollEnd();
                  },350);
                  break;
		}
	},
	_onStartForAndroid : function(we) {
		this._stopObserver();
		this._isTouched = true;
		this._isMoved = false;
		this._nPreTop = null;
		this._nPreLeft = null;
		if(window.pageYOffset === 0) {
			this._isTop = true;	
		} else {
			this._isTop = false;
		}
	},
	_onMoveForAndroid : function(we) {
		this._isMoved = true;
	},
	_onEndForAndroid : function(we) {
		this._isTouched = false;
		if(this._isTop && this._isMoved) {
			this._startObserver();
		}
	},
	_fireEventScrollEnd : function() {
		this.fireEvent("scrollEnd", {
			nTop : window.pageYOffset,
			nLeft : window.pageXOffset
		});
	},
	_fireEventScrollEndForAndroid : function() {
		var self = this;
		clearTimeout(this._nScrollEndTimer);
		this._nScrollEndTimer = setTimeout(function() {
			self._fireEventScrollEnd();			
		},500);
	},
	destroy: function() {
	 	this._detachEvent();
	 	this._nType = -1;
		this._isTouched = null;
		this._isMoved = null;
		this._nObserver = null;
		this._nPreLeft = null;
		this._nPreTop = null;
	}	
}).extend(jindo.Component);
