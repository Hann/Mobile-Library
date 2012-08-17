jindo.m.Tab = jindo.$Class({
	$init : function(el, htUserOption) {
		this.option({
			sMoreText : "더보기",
			nCountOnList : 0 	
		});
		this.option(htUserOption || {});
		this._initData();
		if(this.option("bActivateOnload")) {
			this.activate();			
		}		
		this.select(this.option("nDefaultIndex"));
	},
	_initVar : function() {	
		this.$super._initVar();
		this._isMore = false;
		this._nCurrentMoreTab = -1;
	},
	_initData : function() {
		this.$super._initData();
		var nCountOnList = this.option("nCountOnList");
		if(nCountOnList > 0 && this._aTab.length > nCountOnList) {
			this._makeMoreContainer(nCountOnList);
		}
	},
	_makeMoreContainer: function(nCountOnList) {
		this._htWElement["more_tab"] = jindo.$Element('<li class="'+ this._sPrefix + 'more-tab"><a style="display: block; height: 100%">' + this.option("sMoreText") +  ' <span class="' + this._sPrefix + 'arrow-down"></span></a></li>');
		this._htWElement["more_container_wrap"] = jindo.$Element('<div style="position:relative; width:100%;z-index:10">');
		this._htWElement["more_container"] = jindo.$Element('<ul class="' + this._sPrefix + 'more-cont" style="display:none; position: absolute">');
		for(var i=nCountOnList, nLength = this._aTab.length; i<nLength; i++) {
			this._tab2more(i);
		}
		this._htWElement["more_container_wrap"].append(this._htWElement["more_container"]);
		this._htWElement["more_tab"].append(this._htWElement["more_container_wrap"]);
		this._htWElement["tab_container"].append(this._htWElement["more_tab"]);
		this._htWElement["more_arrow"] = jindo.$Element(this._htWElement["more_tab"].query("span"));
		this._nCurrentMoreTab = nCountOnList-1;
		this._isMore = true;
	},
	_attachMoreContainerEvent : function() {
		this._htEvent["more_click"] = {
			el  : this._htWElement["more_container"],
			ref : jindo.$Fn(this._onClickMore, this).attach(this._htWElement["more_container"], "click")
		};
	},
	_onClickMore: function(we) {
		if(this._isMore) {
			var welElement = jindo.$Element(we.element);
			var sClassName = this._sPrefix + "more-li";
			if(!welElement.hasClass(sClassName)) {
	 			welElement = welElement.parent(function(v){
					return v.hasClass(sClassName);
				},1)[0];
	 		}
			this.select(this._getIdx(welElement));
			we.stop(jindo.$Event.CANCEL_BUBBLE);
		}
	},
	_tab2more : function(nIdx) {
		var wel = this._htWElement["more_container"].first(),
			isMoved = false,
			nTargetIdx;
		this._aTab[nIdx].className(this._sPrefix + "more-li");
		this._aTab[nIdx].first().className(this._sPrefix + "more-lia");
		while(wel) {
			nTargetIdx = this._getIdx(wel);
			if(nTargetIdx > nIdx) {
				wel.before(this._aTab[nIdx]);
				isMoved = true;
				break;
			}	
			wel = wel.next();
		}
		if(!isMoved) {
			this._htWElement["more_container"].append(this._aTab[nIdx]);
		}
	},
	_more2tab : function(nIdx) {
		this._aTab[nIdx].className(this._sPrefix + "tab");
		this._aTab[nIdx].first().className(this._sPrefix + "taba");
		this._htWElement["more_tab"].before(this._aTab[nIdx]);
		this._nCurrentMoreTab = nIdx;
	},
	_onAfterSelect : function(welElement) {
		if(welElement.hasClass(this._sPrefix + "more-tab")) {
			var isHide = this._htWElement["more_container"].visible();
			if( this._fireEventBefore( isHide ? "beforeHide" : "beforeShow") ) {
				this._htWElement["more_container"].toggle();
				this._htWElement["more_tab"].toggleClass(this._sPrefix + "more-on");
				this._htWElement["more_arrow"].toggleClass(this._sPrefix + "arrow-down", this._sPrefix + "arrow-up");
				this._fireEventBefore( isHide ? "hide" : "show");
			}
		} else {
			this._hideMoreList();
			this.select(this._getIdx(welElement));	
		}
	},
	_hideMoreList : function() {
		if(this._isMore) {
			if( this._fireEventBefore("beforeHide") ) {
				this._htWElement["more_container"].hide();
				this._htWElement["more_tab"].removeClass(this._sPrefix + "more-on");
				this._htWElement["more_arrow"].className(this._sPrefix + "arrow-up");
				this._fireEventBefore("hide");
			}
		}
	},
	_beforeSelect : function(nIdx) {
		if(this._isMore) {
			if( (nIdx >= this.option("nCountOnList")-1) && (this._nCurrentMoreTab != nIdx) ) {
				this._hideMoreList();
				this._tab2more(this._nCurrentMoreTab);
				this._more2tab(nIdx);
			}
		}
	},
	_attachEvent : function() {
		this.$super._attachEvent();
		if(this._isMore) {
			this._attachMoreContainerEvent();
		}
	},
	_detachEvent : function() {
		this.$super._detachEvent();
	},	
	destroy : function() {
		this.deactivate();
		this.$super.destroy();
	}
}).extend(jindo.m.CoreTab);
