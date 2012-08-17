jindo.m.AjaxHistory = jindo.$Class({
	bHashEvent : false,
	bPushState : false,
	_nIntervalId : 0,
	_htLastState : {},	
	$init : function(htUserOption) {
		this.option({
			nCheckInterval : 100,
			bUseHash : false 
		});
		this.option(htUserOption || {});
	},
	initialize : function(){
		this._initVar();
		this._attachEvent();
		var sHash = this._getHash();
		if(sHash){
			this._htLastState = this._getDecodedData(sHash);
			this.fireEvent("change", {
				htHistoryData : this._htLastState
			});
		}else{
			this.fireEvent('load');
		}
		return this;
	},	
	_initVar: function() {
		var htInfo = jindo.m.getDeviceInfo();
		this.bHashEvent = 'onhashchange' in window;
		this.bPushState = (typeof window.history !== 'undefined')&& (typeof window.history.pushState !== 'undefined') && (typeof window.history.replaceState !== 'undefined') && !((htInfo.iphone || htInfo.ipad)&& (parseFloat(htInfo.version,10) < 4.3));
		this._nIntervalId = 0;
		this._oAgent = jindo.$Agent().navigator();
		this._bAndroid =  htInfo.android;
		if(this.option('bUseHash')){
			this.bPushState = false;
		}
	},	
	_attachEvent : function() {
		this._htEvent = {};
		if(this.bPushState){
			this._htEvent['popstate'] ={
				ref : jindo.$Fn(this._onPopState, this).attach(window,'popstate'),
				el : window
			};
		}else if(this.bHashEvent){
			this._htEvent["hashchange"] = {
				ref : jindo.$Fn(this._onHashChange, this).attach(window, "hashchange"),
				el	: window
			};			
		}else{
			//ios3.x bug fix
			clearInterval(this._nIntervalId);
			this._nIntervalId = setInterval(jindo.$Fn(this._onHashChange, this).bind(), this.option("nCheckInterval"));
		}		
	},
	_onPopState : function(event){
		var state = event.$value().state;
		if(state){
			var htData = this._cloneObject(state);
			if(!this._compareData(htData, this._htLastState)){
				this._htLastState = htData;
				this._onChange();
			}
		}
	},
	_onHashChange : function(){
		var htData = this._getDecodedData(this._getHash());
		if(!this._compareData(htData, this._htLastState)){
			this._htLastState = htData;
			this._onChange();
		}		
	},
	_onChange : function(){
		this.fireEvent("change", {
			htHistoryData : this._htLastState
		});
	},
	addHistory : function(htData, bLoad){
		if(typeof bLoad === 'undefined'){
			bLoad = false;
		}
		if(htData && typeof(htData) == "object" && jindo.$H(htData).length() > 0){
			var sNewHash = this._cloneObject(htData);
			if(this._compareData(sNewHash, this._htLastState)){
				return;
			}			
			this._htLastState = sNewHash;
			var sHash = this._getEncodedData(this._htLastState);			
			if(this.bPushState){
				if(bLoad){
					this._replaceState(this._htLastState);
				}else{
					this._pushState(this._htLastState);
				}
			}else{
				var self = this;
				if(this._bAndroid ){
					setTimeout(function(){
						self._setHash(sHash);
					},0);
				}else{
					this._setHash(sHash);
				}
			}			
		}		
	},	
	_replaceState : function(htData){
		history.replaceState( htData, document.title, location.href );
	},
	_pushState : function(htData){
		history.pushState(htData, document.title, location.href);
	},
	_setHash : function(sHash){
		location.hash = sHash;
	},
	_compareData : function(htBase, htComparison){
		if(htBase && htComparison){
			if(jindo.$H(htBase).length() == jindo.$H(htComparison).length()){
				for(var x in htBase){
					if(typeof(htBase[x]) == "object"){
						if(!arguments.callee(htBase[x], htComparison[x])){							
							return false;
						}
					}else{
						if(htBase[x] != htComparison[x]){
							return false;
						}
					}
				}
				return true;
			}else{
				return false;
			}
		}else{
			return false;
		}
	},
	_getEncodedData : function(htHistoryData){
		if(htHistoryData){
			if(typeof(JSON) == "object" && typeof(JSON.stringify) == "function"){
				return encodeURIComponent(JSON.stringify(htHistoryData));
			}else{
				return encodeURIComponent(jindo.$Json(htHistoryData).toString());
			}
		}else{
			return "";
		}
	},
	_getDecodedData : function(sEncodedHash){
		try {
			if(sEncodedHash){
				var sHashString = decodeURIComponent(sEncodedHash);
				if(typeof(JSON) == "object" && typeof(JSON.parse) == "function"){
					return JSON.parse(sHashString);
				}else{
					return jindo.$Json(sHashString).toObject();
				}
			}
		} catch (e) {}
		return {};
	},
	_cloneObject : function(htObj){
		var hash, newHash;
		if(htObj){
			hash = jindo.$Json(htObj).toString();
			newHash = jindo.$Json(hash).toObject();
		}else{
			newHash = {};
		}		
		return newHash;		
	},
	_getHash : function(){
		return this._oAgent.firefox ? encodeURIComponent(location.hash.substring(1)) : location.hash.substring(1);		
	},
	_detachEvent : function() {
		for(var p in this._htEvent) {
			var htTargetEvent = this._htEvent[p];
			htTargetEvent.ref.detach(htTargetEvent.el, p);
		}
		this._htEvent = null;
	},	
	destroy: function() {
		this._detachEvent();
		clearInterval(this._nIntervalId);
		this._nIntervalId = null;		
	}	
}).extend(jindo.Component);
