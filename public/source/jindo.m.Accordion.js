jindo.m.Accordion = jindo.$Class({
	$init : function(el,htUserOption) {
		var htDefaultOption = {
			bActivateOnload : true,
			sClassPrefix : 'accordion-',
			sDirection : 'vertical',
			nDefalutIndex :  -1,
			bUseToggle : false,
			sTransitionTimingFunction : "ease",
			nDuration : 500
		};
		this.option(htDefaultOption);
		this.option(htUserOption || {});
		this._initVar(el);
		this._setWrapperElement();
		if(this.option("bActivateOnload")) {
			this.activate();
		}
		this._setSize();
		this._setDefaultExpand();
	},
	_initVar : function(el) {
		this._elContainer = (typeof el == "string") ? jindo.$(el) : el;
		this._aAccordionBlock = jindo.$$("." + this.option("sClassPrefix") + "block", this._elContainer);
		var htInfo = jindo.m.getDeviceInfo();
		var nVersion = parseFloat(htInfo.version,10);
		if(htInfo.android && (nVersion <3) ){
			var elDummyTag = jindo.$$.getSingle("._accordion_dummy_atag_", this._elContainer);
			if(!elDummyTag){
				elDummyTag = jindo.$("<a href='javascript:void(0);' class='_accordion_dummy_atag_'></a>");
				elDummyTag.style.position = "absolute";
				elDummyTag.style.left = "-1000px";
				elDummyTag.style.top = "-1000px";
				elDummyTag.style.width = 0;
				elDummyTag.style.height = 0;
				jindo.$Element(this._elContainer).append(elDummyTag);
			}
		}
		this._nExpand = -1;
		this._wfTransitionEnd = jindo.$Fn(this._onTransitionEnd, this).bind();
	},
	_setWrapperElement : function() {
	},
	_onActivate : function() {
		this._attachEvent();
	},
	_onDeactivate : function() {
		this._detachEvent();
	},
	_attachEvent : function() {
		this._htEvent = {};
		jindo.$A(this._aAccordionBlock).forEach(function(el, index, array){
			this._htEvent["click_" + index] = {
				ref : jindo.$Fn(this._onClick, this).attach(this.getHandler(index), "click"),
				el	: this.getHandler(index)
			};			
		}, this);
	},
	_detachEvent : function(sEventKey) {
		if(sEventKey) {
			var htTargetEvent = this._htEvent[sEventKey];
			htTargetEvent.ref.detach(htTargetEvent.el, sEventKey.substring(0, sEventKey.indexOf("_")));
		} 
	},
	_detachEventAll : function() {
		for(var p in this._htEvent) {
			this._detachEvent(p);
		}
		this._htEvent = null;
	},
	_onClick : function(we){
		we.stop();
		var elBlock = this._getBlock(we.element);
		var nIndex = (elBlock) ? jindo.$A(this._aAccordionBlock).indexOf(elBlock) : null;
		var nCurrentIndex = this.getExpandIndex(); 
		var bUseToggle = this.option("bUseToggle");
		if(typeof nIndex == 'number'){
			if(nIndex == nCurrentIndex) {
				if(bUseToggle) {
					this.collapse(nCurrentIndex);
					this._nExpand = -1;
				}
			} else {
				this.expand(nIndex);
				if(nCurrentIndex > -1) {
					this.collapse(nCurrentIndex);
				}
			}
		}
	},
	_setSize : function() {
		this._htBlockSize = {};
		var nHeaderSize, nBodySize;
		jindo.$A(this._aAccordionBlock).forEach(function(el, index, array){
			nHeaderSize = this._getHeaderSize(index);
			nBodySize = this._getBodySize(index);
			this._htBlockSize[index] = {
				nHeaderSize : nHeaderSize,
				nBodySize : nBodySize
			};
			if(this.option("sDirection") == "vertical") {
				jindo.$Element(el).height(nHeaderSize);
			} else {
				jindo.$Element(el).width(nHeaderSize);
			}
		}, this);
	},
	_getHeaderSize : function(nIndex) {
		var welHead = jindo.$Element(this.getHead(nIndex));
		var nHeaderSize = (this.option("sDirection") == "vertical") ? welHead.height() : welHead.width();
		return nHeaderSize;
	},
	_getBodySize : function(nIndex) {
		var welBody = jindo.$Element(this.getBody(nIndex));
		var nBodySize = (this.option("sDirection") == "vertical") ? welBody.height() : welBody.width();
		return nBodySize;
	},
	_getSize : function(nIndex) {
		if(!this._htBlockSize || !this._htBlockSize[nIndex]) {
			this._setSize();
		} 
		var nSize = this._htBlockSize[nIndex]["nHeaderSize"] + this._htBlockSize[nIndex]["nBodySize"];
		return nSize;
	},
	_setDefaultExpand : function() {
		var nDefaultIndex = this.option("nDefalutIndex");
		if(nDefaultIndex > -1) {
			setTimeout(jindo.$Fn(function() {
				this.expand(nDefaultIndex);
			}, this).bind(),100);	
		}
	},
	getHead : function(nIndex){
		return jindo.$$.getSingle('dt', this._aAccordionBlock[nIndex]);
	},
	getBody : function(nIndex){
		return jindo.$$.getSingle('dd', this._aAccordionBlock[nIndex]);
	},
	_getBlock : function(el){
		var sClassPrefix = this.option("sClassPrefix") +"block";
		var elBlock = jindo.m.getClosest(sClassPrefix, el);
		return elBlock;
	},
	getHandler : function(nIndex){
		var elHead = this.getHead(nIndex);		
		return jindo.$$.getSingle('.'+this.option('sClassPrefix')+'handler', elHead) || elHead;		
	},
	getExpandIndex : function(){
		return this._nExpand;
	},
	expand : function(nIndex){
		this._elBlock = this._aAccordionBlock[nIndex];
		if(typeof this._elBlock == 'undefined'){ return;}
		if(!this.fireEvent("beforeExpand", {
			sType : "beforeExpand",
			elBlock : this._elBlock,
			nBeforeIndex : this._nExpand, 
			nIndex : nIndex
		})){ return; }
		this._setTransition(this._elBlock, this._getSize(nIndex));
		this._nExpand = nIndex;
		this.fireEvent("expand", {
			sType : "expand",
			elBlock : this._elBlock,
			nIndex : nIndex
		});
	},
	collapse : function(nIndex){
		this._elBlock = this._aAccordionBlock[nIndex];
		if(typeof this._elBlock == 'undefined'){ return;}
		if(!this.fireEvent("beforeCollapse", {
			sType : "beforeCollapse",
			elBlock : this._elBlock,
			nIndex : nIndex
		})){ return; }
		this._setTransition(this._elBlock, this._getHeaderSize(nIndex));		
		if(this._nExpand == nIndex) { this._nExpand = -1; }
		this.fireEvent("collapse", {
			sType : "collapse",
			elBlock : this._elBlock,
			nIndex : nIndex
		});
	},
	collapseAll  : function(){
		var nIndex = this.getExpandIndex();
		if(nIndex > -1){
			this.collapse(nIndex);
		}
		this._nExpand = -1;
	},
	setEffect : function(htEffect) {
		if(htEffect.sTransitionTimingFunction && (htEffect.sTransitionTimingFunction == "ease" || htEffect.sTransitionTimingFunction == "linear" || htEffect.sTransitionTimingFunction == "ease-in" || htEffect.sTransitionTimingFunction == "ease-out" || htEffect.sTransitionTimingFunction == "ease-in-out")) {
			this.option("sTransitionTimingFunction", htEffect.sTransitionTimingFunction); 
		}
		if(htEffect.nDuration && htEffect.nDuration > 0) {
			this.option("nDuration", htEffect.nDuration); 
		}
	},
	_setTransition : function(elBlock, nBlockSize, sTransitionTimingFunction, nDuration){
		sTransitionTimingFunction = sTransitionTimingFunction || this.option("sTransitionTimingFunction"); 
		nDuration = nDuration || this.option("nDuration");
		if(nDuration > 0){
			this._attachTransitionEnd(elBlock);
		}
		var sTransition = "";
		var sDirection = this.option("sDirection");
		elBlock.style.webkitTransition = "";
		elBlock.style.mozTransition = "";
		if(sDirection === "vertical") {
			sTransition  = "height " + nDuration + "ms " + sTransitionTimingFunction;
			elBlock.style.webkitTransition = sTransition;
			elBlock.style.mozTransition = sTransition;
			elBlock.style.height = nBlockSize + "px";			
		} else if(sDirection === "horizontal") {
			sTransition  = "width " + nDuration + "ms " + sTransitionTimingFunction;
			elBlock.style.webkitTransition = sTransition;
			elBlock.style.mozTransition = sTransition;
			elBlock.style.width = nBlockSize + "px";
		}
		if(nDuration === 0) {
			this._onTransitionEnd({srcElement: elBlock});
		}
	},
	_attachTransitionEnd : function(elBlock){
		this._elTransition = elBlock;
		this._elTransition.addEventListener('webkitTransitionEnd', this._wfTransitionEnd, false);
	},
	_detachTransitionEnd : function(el){
		el.removeEventListener('webkitTransitionEnd', this._wfTransitionEnd, false);
		this._elTransition = null;
	},
	_onTransitionEnd : function(evt){
		var elDummyTag = jindo.$$.getSingle("._accordion_dummy_atag_", this._elContainer);
		if(elDummyTag){
			elDummyTag.focus();
		}
		this._detachTransitionEnd(evt.srcElement);
	},
	destroy : function() {
		this._detachEventAll();
		this._elContainer = null;
		this._aAccordionBlock = null;
		this._elBlock = null;
		this._htBlockSize = null;
		this._nExpand = null;
	}
}).extend(jindo.UIComponent);
