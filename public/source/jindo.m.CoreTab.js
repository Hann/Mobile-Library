jindo.m.CoreTab = jindo.$Class({
	$init : function(el, htUserOption) {
		this.option({
			sClassPrefix 		: "tc-",
			nDefaultIndex		: 0,
			nPanelDuration		: 0,
			nHeight				: 0,
			nWidth 				: 0,
			bActivateOnload 	: true
		});
		this.option(htUserOption || {});
		this._initVar();
		this._setWrapperElement(el);
	},
	_initVar : function() {	
		this._sPrefix = this.option('sClassPrefix');
		this._nCurrentIndex = -1;
		this._aTab = [];
		this._aPanel = [];	
		this._oPanelEffect = null;
	},
	_setWrapperElement : function(el) {
		this._htWElement = {};
		el = (typeof el == "string" ? jindo.$(el) : el);
		if(!el) {
			return;
		}
		this._htWElement["baseElement"] = jindo.$Element(el);
		this._htWElement["tab_container"] = jindo.$Element(this._htWElement["baseElement"].query('.' + this._sPrefix + 'tab-cont'));
		this._htWElement["panel_container"] = jindo.$Element(this._htWElement["baseElement"].query('.' + this._sPrefix + 'panel-cont'));
		if(this._htWElement["tab_container"]) {
			this._htWElement["tab_container"].css('-' + jindo.m.getCssPrefix() + '-tap-highlight-color', 'rgba(0,0,0,0)');
		}
	},
	_initData : function() {
		var isPanelEffect = this.option("nPanelDuration"),
			nWidth,nHeight;
		this._aTab = this._htWElement["tab_container"].queryAll('.' + this._sPrefix + 'tab');
		this._aPanel = this._htWElement["panel_container"].queryAll('.' + this._sPrefix + 'panel');
		if(isPanelEffect) {
			nWidth = (this.option("nWidth") == 0 ? this._htWElement["panel_container"].width() - parseInt(this._aPanel[0].css("paddingLeft"),10) - parseInt(this._aPanel[0].css("paddingRight"),10) : this.option("nWidth")) + "px";
			nHeight = this.option("nHeight") + "px";
		}
		for(var i=0, nLength=this._aTab.length; i < nLength; i++) {			
			this._aTab[i] = jindo.$Element(this._aTab[i]).attr("data-index", i);
			this._aPanel[i] = jindo.$Element(this._aPanel[i]);
			if(isPanelEffect) {
				this._aPanel[i].css({
					width : nWidth,
					height : nHeight,
					position : "absolute"
				});
			}
		}
		if(isPanelEffect) {	
			this._oPanelEffect = new jindo.m.LayerEffect(this._aPanel[0].$value());
			this._htWElement["panel_container"].css({
				position : "relative",
				height : nHeight
			});
		}
	},
	_getIdx : function(welElement) {
		return parseInt(welElement.attr("data-index"),10);
	},
	_getTabElement : function(welElement) {
		var sTabClassName = this._sPrefix + "tab",
			sMoreTabClassName = this._sPrefix + "more-tab";
		if(welElement.hasClass(sTabClassName) || welElement.hasClass(sMoreTabClassName)) {
			return welElement;
		} else if(this._htWElement["tab_container"].isParentOf(welElement) && (!welElement.hasClass(sTabClassName) || !welElement.hasClass(sMoreTabClassName))) {
			return welElement.parent(function(v){
				return v.hasClass(sTabClassName) || v.hasClass(sMoreTabClassName);
			},2)[0];
		}
		return welElement;
	},
	_onActivate : function() {		
		this._attachEvent();
	},
	_onDeactivate : function() {		
		this._detachEvent();
	},
	_attachEvent : function() {
		this._htEvent = {};		
		this._htEvent["tab_click"] = {
			el  : this._htWElement["tab_container"],
			ref : jindo.$Fn(this._onSelect, this).attach( this._htWElement["tab_container"], "click")
		};
	},
	_detachEvent : function() {
		for(var p in this._htEvent) {			
			var ht = this._htEvent[p];			
			ht.ref.detach(ht.el, p.substring(p.lastIndexOf("_")+1));
		}
		this._htEvent = null;
		if(this._oPanelEffect) {
			this._oPanelEffect.detachAll();
		}
	},	
	getCurrentIndex : function() {
		return this._nCurrentIndex;	
	},	
	getTab : function(nIdx) {
		if(nIdx !== null && this._aTab.length > nIdx) {
			return this._aTab[nIdx];
		} else {
			return this._aTab;
		}
	},
	getPanel : function(nIdx) {
		if(nIdx !== null && this._aPanel.length > nIdx) {
			return this._aPanel[nIdx];
		} else {
			return this._aPanel;
		}
	},
	_onSelect : function(we) {
		if(we.element) {
			if(this._oPanelEffect && this._oPanelEffect.isPlaying() ) {
				we.stop(jindo.$Event.CANCEL_ALL);
				return false;
			}
			var welElement = this._getTabElement(jindo.$Element(we.element));
			this._onAfterSelect(welElement);
		}
	},
	select : function(nIdx) {
		if(nIdx !== null && this._aTab.length > nIdx && (this._nCurrentIndex != nIdx)) {
			if (this._fireEventBefore("beforeSelect")) {
				var sSelect = this._sPrefix + "selected";
				this._beforeSelect(nIdx);
				this._aTab[nIdx].addClass(sSelect);
				this._aPanel[nIdx].addClass(sSelect);
				this._aPanel[nIdx].show();
				if(this._nCurrentIndex > -1){
					this._aTab[this._nCurrentIndex].removeClass(sSelect);
					if(this._oPanelEffect) {
						this._slide(this._nCurrentIndex, nIdx);
					} else {
						this._aPanel[this._nCurrentIndex].removeClass(sSelect);	
						this._aPanel[this._nCurrentIndex].hide();
					}
				}
				this._nCurrentIndex = nIdx;
				this._fireEvent("select");
			}
		}
	},
	_slide : function(nBeforeIdx, nIdx) {
		var self=this,
			isLeft = nBeforeIdx < nIdx,
			nWidth = this._aPanel[nIdx].width();
		if (this._fireEventBefore("beforeSlide")) {
			this._oPanelEffect.setLayer(this._aPanel[nIdx].$value());
			this._oPanelEffect.attach("afterEffect", function() {
				self._onPannelAfterEffct(nBeforeIdx, nIdx);
			});
			this._aPanel[nIdx].css({
				"left" : isLeft ? nWidth : -nWidth,
				"zIndex" : 9
			});	
			this._oPanelEffect.slide({
				sDirection : isLeft ? 'left' : "right",
			    nDuration : this.option("nPanelDuration"), 
			    nSize : nWidth
			});
		}
	},
	_onPannelAfterEffct : function(nBeforeIdx, nIdx) {
		this._aPanel[nBeforeIdx].removeClass(this._sPrefix + "selected");
		this._aPanel[nBeforeIdx].hide();
		this._aPanel[nBeforeIdx].css("zIndex",1);
		this._aPanel[nIdx].css("zIndex" , 2);
		this._oPanelEffect.detachAll("afterEffect");
		this._fireEvent("slide");
	},
	_fireEventBefore : function(sType) {
		return this.fireEvent(sType, {
		 	nIndex : this._nCurrentIndex,
			elTab : this._aTab[this._nCurrentIndex],
		 	elPanel : this._aPanel[this._nCurrentIndex] 
		});
	},
	_fireEvent : function(sType) {
		this.fireEvent(sType, {
		 	nIndex : this._nCurrentIndex,
			elTab : this._aTab[this._nCurrentIndex],
		 	elPanel : this._aPanel[this._nCurrentIndex]			
		});
	},	
	destroy : function() {
		for(var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		this._htWElement = null;
		for(p in this._aTab) {
			this._aTab[p] = null;
		}
		this._aTab = null;
		for(p in this._aPanel) {
			this._aPanel[p] = null;
		}		
		this._aPanel = null;
		if(this._oPanelEffect) {
			this._oPanelEffect.destroy();
			this._oPanelEffect = null;
		}
	}
}).extend(jindo.UIComponent);
