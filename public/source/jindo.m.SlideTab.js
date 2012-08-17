jindo.m.SlideTab = jindo.$Class({
	$init : function(el,htUserOption) {
		this.option({
			 nSlideDuration : 200,
			 sTimingFunction : "ease-in-out",
			 nCountPerVeiw : 3
		});
		this.option(htUserOption || {});
		this._initData();
		if(this.option("bActivateOnload")) {
			this.resize();
			this.activate();			
		}		
		this.select(this.option("nDefaultIndex"));
	},
	_initVar: function() {
		this.$super._initVar();
		this._nCurrentPage = 1;
		this._nTotalPage = 1;
		this._nPageWidth = 0;		
		this._aDummyTab = [];
		this._oEffect = null;
		this._isNext = null;
	},
	_setWrapperElement: function(el) {
		var sPrefix = this._sPrefix;
		this.$super._setWrapperElement(el);
		this._htWElement["tab_view"] = jindo.$Element(this._htWElement["baseElement"].query('.' + sPrefix + 'tabview'));
		this._htWElement["tab_container"] = jindo.$Element(this._htWElement["baseElement"].query('.' + sPrefix + 'tab-cont'));
		this._htWElement["prev"] = jindo.$Element(this._htWElement["baseElement"].query('.' + sPrefix + 'prev'));
		this._htWElement["next"] = jindo.$Element(this._htWElement["baseElement"].query('.' + sPrefix + 'next'));
		this._htWElement["baseElement"].css("position","relative");
		this._htWElement["tab_view"].css("overflow","hidden");
	},
	_initData : function() {
		this.$super._initData();
		var nCountPreView = this.option("nCountPerVeiw"),
			el = null,	
			nRemainPage;
		this._nTotalPage = parseInt(this._aTab.length / nCountPreView, 10);	
		nRemainPage = this._aTab.length % nCountPreView;
		if(nRemainPage > 0 ) { 
			this._nTotalPage++;
		}
		for(var j=0, nLength=nCountPreView - nRemainPage; j< nLength; j++) {
			el = jindo.$("<li></li>");
			this._aDummyTab.push(jindo.$Element(el));
			this._htWElement["tab_container"].append(el);
		}
		this._oEffect = new jindo.m.LayerEffect(this._htWElement["tab_container"].$value());
	},
	getCurrentPage : function() {
		return this._nCurrentPage;
	},
	getTotalPage : function() {
		return this._nTotalPage;
	},
	resize : function() {
		var nTabWidth, nPrePageWidth = this._nPageWidth;
		this._nPageWidth = this._htWElement["tab_view"].width() - this._htWElement["prev"].width() - this._htWElement["next"].width();
		nTabWidth = this._nPageWidth / this.option("nCountPerVeiw");
		if(nPrePageWidth > this._nPageWidth) {	
			this._setTabWidth(nTabWidth);
			this._htWElement["tab_container"].width(this._nPageWidth * this._nTotalPage);
		} else {		
			this._htWElement["tab_container"].width(this._nPageWidth * this._nTotalPage);
			this._setTabWidth(nTabWidth);
		}
		this._htWElement["tab_container"].css("left", (this._nCurrentPage-1) * -this._nPageWidth );
	},
	_setTabWidth : function(nTabWidth) {
		for(var i in this._aTab) {
			this._aTab[i].width(nTabWidth);
		}
		for(i in this._aDummyTab) {
			this._aDummyTab[i].width(nTabWidth);
		}
	},
	_fireEventBeforePrev : function() {
		return this.fireEvent("beforePrev", {
		 	nPage : this._nCurrentPage,
			nIndex : this._nCurrentIndex,
		 	nTotalPage : this._nTotalPage 
		});
	},
	_fireEventPrev : function() {
		this.fireEvent("prev", {
		 	nPage : this._nCurrentPage,
			nIndex : this._nCurrentIndex,
			nTotalPage : this._nTotalPage			
		});
	},
	_fireEventBeforeNext : function() {
		return this.fireEvent("beforeNext", {
			nPage : this._nCurrentPage,
			nIndex : this._nCurrentIndex,
			nTotalPage : this._nTotalPage 
		});
	},
	_fireEventNext : function() {
		this.fireEvent("next", {
		 	nPage : this._nCurrentPage,
			nIndex : this._nCurrentIndex,
		 	nTotalPage : this._nTotalPage				
		});
	},	
	_onAfterSelect : function(welElement) {
		this.select(this._getIdx(welElement));	
	},
	_beforeSelect : function(nIdx) {
	},
	_attachEvent : function() {
		this.$super._attachEvent();
		this._htEvent["prev_click"] = {
			ref: jindo.$Fn(this._onPrev, this).attach(this._htWElement["prev"], "click"),
			el: this._htWElement["prev"]
		};
		this._htEvent["next_click"] = {
			ref : jindo.$Fn(this._onNext, this).attach( this._htWElement["next"], "click"),
			el : this._htWElement["next"]
		};
		this._oEffect.attach("afterEffect", jindo.$Fn(this._onAfterEffect, this).bind());
	},
	_detachEvent : function() {
		this._oEffect.detachAll();
		this.$super._detachEvent();
	},
	_onAfterEffect : function() {
		if(this._isNext) {
			this._nCurrentPage++;
			this._fireEventNext();
		} else {
			this._nCurrentPage--;
			this._fireEventPrev();
		}
		this._isNext = null;
		this.select((this._nCurrentPage-1) * this.option("nCountPerVeiw"));
	},
	_onPrev : function(we) {
		if(this._oPanelEffect && this._oPanelEffect.isPlaying() ) {
			we.stop(jindo.$Event.CANCEL_ALL);
			return false;
		}
		if ((this._nCurrentPage > 1) && !this._oEffect.isPlaying()) {
			if (this._fireEventBeforePrev()) {
				this._oEffect.slide({
					sDirection: "right",
					nDuration: this.option("nSlideDuration"),
					sTransitionTimingFunction : this.option("sTimingFunction"),
					nSize: this._nPageWidth
				});
				this._isNext = false;
			}
		}		
	},
	_onNext : function(we) {
		if(this._oPanelEffect && this._oPanelEffect.isPlaying() ) {
			we.stop(jindo.$Event.CANCEL_ALL);
			return false;
		}
		if ((this._nCurrentPage < this._nTotalPage) && !this._oEffect.isPlaying()) {
			if (this._fireEventBeforeNext()) {
				this._oEffect.slide({
					sDirection: "left",
					nDuration: this.option("nSlideDuration"),
					sTransitionTimingFunction : this.option("sTimingFunction"),
					nSize: this._nPageWidth
				});
				this._isNext = true;
			}
		}		
	},
	destroy: function() {
		this.deactivate();
		for(var p in this._aDummyTab) {
			this._aDummyTab[p] = null;
		}
		this._aDummyTab = null;
		this._initVar();
		if(this._oEffect) {
			this._oEffect.destroy();
			this._oEffect = null;
		}		
		this.$super.destroy();
	}
}).extend(jindo.m.CoreTab);
