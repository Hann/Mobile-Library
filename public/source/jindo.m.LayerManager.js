jindo.m.LayerManager = jindo.$Class({
	$init : function(el,htUserOption) {
		var oDeviceInfo = jindo.m.getDeviceInfo();
		this.option({
			bActivateOnload : true
		}); 
		this.option(htUserOption || {});
		this._initVar();
		this._setWrapperElement(el);
		if(this.option("bActivateOnload")) {
			this.activate();
		}
	},
	_initVar: function() {
		this._aLink = [];
		this._oTouch = null;
	},
	_setWrapperElement: function(el) {
		this._htWElement = {};
		this.setLayer(el);
	},
	_onActivate : function() {
		this._attachEvent();
	},
	_onDeactivate : function() {
		this._detachEvent();
	},
	setLayer : function(el) {
		el = (typeof el == "string" ? jindo.$(el) : el); 
		this._htWElement["element"] = jindo.$Element(el);
		this._htWElement["element"].css("position", "absolute");
		return this;
	},
	getVisible: function(){
		return this._htWElement["element"].visible();
	},
	getLayer : function() {
		return this._htWElement["element"].$value();
	},
	getLinks : function() {
		return this._aLink;
	},
	link: function(vElement){
		if (arguments.length > 1) {
			for (var i = 0, len = arguments.length; i < len; i++) {
				this.link(arguments[i]);
			}
			return this;
		}
		if (this._find(vElement) != -1) {
			return this;
		} 
		this._aLink.push(vElement);
		return this;
	},
	unlink: function(vElement){
		if (arguments.length > 1) {
			for (var i = 0, len = arguments.length; i < len; i++) {
				this.unlink(arguments[i]);
			}
			return this;
		}
		var nIndex = this._find(vElement);
		if (nIndex > -1) {
			this._aLink.splice(nIndex, 1);
		}
		return this;
	},
	_check: function(el){
		var wel = jindo.$Element(el);
		for (var i = 0, elLink, welLink; (elLink = this._aLink[i]); i++) {
			welLink = jindo.$Element(elLink);
			if (welLink) {
				elLink = welLink.$value();
				if (elLink && (el == elLink || wel.isChildOf(elLink))) {
					return true;
				}
			}
		}
		return false;
	},
	_find: function(el){
		for (var i = 0, elLink; (elLink = this._aLink[i]); i++) {
			if (elLink == el) {
				return i;
			} 
		}
		return -1;
	},			
	_fireEventBeforeShow : function() {
		return this.fireEvent("beforeShow", {
			elLayer : this.getLayer(),
			aLinkedElement : this.getLinks()
		});
	},
	_fireEventShow : function() {
		this.fireEvent("show", {
			elLayer : this.getLayer(),
			aLinkedElement : this.getLinks()
		});
	},
	_fireEventBeforeHide : function(el) {
		return this.fireEvent("beforeHide", {
			elTarget : el,
			elLayer : this.getLayer(),
			aLinkedElement : this.getLinks()
		});
	},
	_fireEventHide : function(el) {
		this.fireEvent("hide", {
			elTarget : el,
			elLayer : this.getLayer(),
			aLinkedElement : this.getLinks()
		});
	},
	show : function() {
		if (!this.getVisible()) {
			if (this._fireEventBeforeShow()) {
				this._htWElement["element"].show();
				this._fireEventShow();
			}
		}
		return this;
	},
	hide : function(el) {
		if (this.getVisible()) {
			if (this._fireEventBeforeHide(el)) {
				this._htWElement["element"].hide();
				this._fireEventHide(el);
			}			
		}
		return this;
	},	
	toggle: function(){
		if (this.getVisible()) {
			this.hide();
		} else {
			this.show();
		}
		return this;
	},
	_onEvent : function(we){
		var el = we.element;
		if (this.getVisible()) {
			if (this._check(el)) { 
				this.fireEvent("ignore", {
					elTarget : el
				});
			} else { 
				this.hide(el);
				return true;
			}
			we.stop();
		}
	},
	_attachEvent : function() {
		var self = this;
		this._oTouch = new jindo.m.Touch(document).attach("touchEnd", function(we) {
			if(we.sMoveType === jindo.m.MOVETYPE[3]) {
				self._onEvent(we);	
			}
		});
	},
	_detachEvent : function() {
		if(this._oTouch) {
			this._oTouch.detachAll("touchEnd");
		}
	},
	destroy: function() {
		this.deactivate();
		for(var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		this._htWElement = null;
		delete this._aLink;
		delete this._oTouch;
	}
}).extend(jindo.UIComponent);
