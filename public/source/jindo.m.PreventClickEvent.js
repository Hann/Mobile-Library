jindo.m.PreventClickEvent = jindo.$Class({
	$init : function(el, htUserOption) {
		this.option({
			 bActivateOnload : true,
			 sClassPrefix : "evt-" 
		});
		this.option(htUserOption || {});
		this._setWrapperElement(el);
		if(this.option("bActivateOnload")) {
			this.activate();
		}
	},
	_setWrapperElement: function(el) {
		this._htWElement = {};
		this._htWElement["target"] = jindo.$Element(el);
	},
	_onDeactivate : function(){
		this._detachEvents();
	},
	_onActivate : function(){
		this._attachEvents();
	},
	_attachEvents : function(){
		this._htEvent ={};
		this._htEvent["prevent"] = jindo.$Fn(this._onPrevent, this).attach(this._htWElement["target"], "touchstart");
	},
	_detachEvents : function(){
		this._htEvent["prevent"].detach(this._htWElement["target"], "touchstart");
		this._htEvent["prevent"] = null;
	},	
	_onPrevent : function(we) {
		var wel = jindo.$Element(jindo.m.getNodeElement(we.element));
		if(!wel.hasClass(this.option("sClassPrefix") + "except")) {
			we.stop(jindo.$Event.CANCEL_ALL); 
			this.fireEvent("prevent", {
				wel : wel
			});
			return false;
		} else {
			this.fireEvent("pass", {
				wel : wel
			});
		}
	},
	destroy: function() {
		this.deactivate();
		for(var p in this._htWElement) {
			console.log(p);
			this._htWElement[p] = null;
		}
		this._htWElement = null;
		this._htEvent = null;
	}	
}).extend(jindo.UIComponent);
