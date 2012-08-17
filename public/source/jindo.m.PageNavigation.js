jindo.m.PageNavigation = jindo.$Class({
	$init : function(el, htUserOption) {
		this.option({
			sClassPrefix : 'page_',
			nItem : 10, 
			nItemPerPage : 10,
			nPage : 1,
			bActivateOnload : true,
			sInfoTemplate : '{=PAGE} / {=TOTALPAGE}',
			htAjax : {}
		});
		this.option(htUserOption || {});
		this._initVar();
		this._setWrapperElement(el);
		if(this.option("bActivateOnload")) {
			this.activate();
			this._nCurrentPage = this.option('nPage');
		}
	},
	_initVar: function() {
		var _htDefalutAjax = {
			sApi : null,
			htAjaxOption : {
				type: 'xhr'
			},
			htQuery : {},
			sPage : 'page',
			sDisplay : 'display'
		};		
		var htAjax = this.option('htAjax');
		if(!htAjax){
			this.option('htAjax', _htDefalutAjax);
			return;
		}
		for(var p in _htDefalutAjax){
			if(typeof htAjax[p] == 'undefined'){
				htAjax[p] = _htDefalutAjax[p];
			}
		}
		for( p in _htDefalutAjax.htAjaxOption){
			if(typeof htAjax.htAjaxOption[p] == 'undefined'){
				htAjax.htAjaxOption[p] = _htDefalutAjax.htAjaxOption[p];
			}
		}
		for( p in _htDefalutAjax.htQuery){
			if(typeof htAjax.htQuery[p]== 'undefined'){
				htAjax.htQuery[p] = _htDefalutAjax.htQuery[p];
			}
		}
		if(!!htAjax.sApi){	
			this.oAjax = new jindo.$Ajax(htAjax.sApi, htAjax.htAjaxOption);
		}		
	},
	_setWrapperElement: function(el) {
		this._htWElement = {};
		el = jindo.$(el);
		var sClass = '.'+this.option('sClassPrefix');	
		this._htWElement.elBase = jindo.$Element(el);
		this._htWElement.elPrev = jindo.$Element(jindo.$$.getSingle(sClass+'prev', el));
		this._htWElement.elNext = jindo.$Element(jindo.$$.getSingle(sClass+'next', el));
		this._htWElement.elPrevOff = jindo.$Element(jindo.$$.getSingle(sClass+'prev-off', el));
		this._htWElement.elNextOff = jindo.$Element(jindo.$$.getSingle(sClass+'next-off', el));
		this._htWElement.elInfo = jindo.$Element(jindo.$$.getSingle(sClass+'info', el));	
	},
	_onClickPrev : function(oEvent){
		oEvent.stop();
		if(!this.hasPreviousPage()) {return;}
		var nPage = this.getCurrentPage();
		this.movePageTo(nPage-1);
	},
	_onClickNext : function(oEvent){
		oEvent.stop();
		if(!this.hasNextPage()) {return;}
		var nPage = this.getCurrentPage();
		this.movePageTo(nPage+1);
	},
	movePageTo : function(n, bFireEvent){
		if(typeof bFireEvent == 'undefined'){
			bFireEvent = true;
		}
		if(bFireEvent){
			if(!this._fireEventBefore(n)){ return;}
		}
		if(!!this.option('htAjax').sApi){
			this._callAjax(n, bFireEvent);
		}else{
			this._move(n);
			if(bFireEvent){
				this._fireEventEnd();
			}
			this.updateInfo();
			this.updateNavigation();
		}
	},
	_move : function(n){		
		var nPage = this._convertToAvailPage(n);
		if(nPage != this._nCurrentPage){
			this._nCurrentPage = nPage;
		}
	},
	_callAjax : function(nPage, bFireEvent){
		var self = this;
		this.oAjax.option('onload', null);
		this.oAjax.option('onload', function(res){
			self._onAjaxResponse(res, nPage ,bFireEvent);
		});
		this.oAjax.request(this._getQueryString(nPage));		
	},
	_fireEventBefore : function(nPage){
		return this.fireEvent('beforeMove', {
			nPage : nPage,
			nCurrentPage: this.getCurrentPage()
		});
	},
	_fireEventEnd : function(oResponse){
		if(typeof oResponse == 'undefined'){
			oResponse = null;
		}
		var nPage = this.getCurrentPage();
		var htIndex = this.getPageItemIndex(nPage);
		return this.fireEvent('move',{
			nPage : this.getCurrentPage(),
			nStartIndex : htIndex.nStart,
			nEndIndex : htIndex.nEnd,
			oResponse : oResponse
		});
	},
	_onAjaxResponse : function(oResponse, nPage, bFireEvent){
		this._move(nPage);
		if(bFireEvent){
			this._fireEventEnd(oResponse);
		}
		this.updateInfo();
		this.updateNavigation();
	},	
	_getQueryString : function(n){
		var htQuery = this.option('htAjax').htQuery || {};	
		var htIndex = this.getPageItemIndex(n);
		htQuery[this.option('htAjax').sPage] = n;
		htQuery[this.option('htAjax').sDisplay] = Math.min(this.getItemPerPage(), (this.getItemCount() - htIndex.nStart));
		return htQuery;
	},
	updateInfo : function(){
		if(!this._htWElement.elInfo){ return;}
		var nPage = this.getCurrentPage();
		var htIndex = this.getPageItemIndex(nPage);
		var sText = this.option('sInfoTemplate').replace(/\{=PAGE\}/,nPage).replace(/\{=TOTALPAGE\}/, this.getTotalPages())
		.replace(/\{=ITEMCOUT\}/, this.option('nItem')).replace(/\{=STARTINDEX\}/,htIndex.nStart+1).replace(/\{=ENDINDEX\}/,htIndex.nEnd+1);
		this._htWElement.elInfo.html(sText);		
	},
	updateNavigation : function(){
		var nPage = this.getCurrentPage();
		if(!!this._htWElement.elPrev) {this._htWElement.elPrev.hide();}
		if(!!this._htWElement.elNext) {this._htWElement.elNext.hide();}
		if(this._htWElement.elPrevOff) {this._htWElement.elPrevOff.hide();}
		if(this._htWElement.elNextOff) {this._htWElement.elNextOff.hide();}
		if(this.getTotalPages() == 1){
			return;
		}
		if(nPage == 1){
			if(!!this._htWElement.elPrevOff) {this._htWElement.elPrevOff.show('inline-block');}
			if(!!this._htWElement.elNext){this._htWElement.elNext.show('inline-block');}
		}else if (nPage == this.getTotalPages()){
			if(!!this._htWElement.elNextOff){this._htWElement.elNextOff.show('inline-block');}
			if(!!this._htWElement.elPrev){this._htWElement.elPrev.show('inline-block');}
		}else{
			if(!!this._htWElement.elPrev){this._htWElement.elPrev.show('inline-block');}
			if(!!this._htWElement.elNext){this._htWElement.elNext.show('inline-block');}
		}
	},
	reset : function(nItem){
		if (typeof nItem == "undefined") {
			nItem = this.option('nItem');
		}
		this.setItemCount(nItem);
		this.movePageTo(1, false);
	},
	_onActivate : function() {
		this._attachEvent();
	},
	_onDeactivate : function() {
		this._detachEvent();
	},
	_attachEvent : function() {
		this._htEvent = {};
		if(!!this._htWElement.elNext){
			this._htEvent["click_Next"] = {
				ref : jindo.$Fn(this._onClickNext, this).attach(this._htWElement.elNext, 'click'), 
				el : this._htWElement.elNext.$value()
			};		
		}		
		if(!!this._htWElement.elPrev){
			this._htEvent["click_Prev"] = {
				ref : jindo.$Fn(this._onClickPrev, this).attach(this._htWElement.elPrev, 'click'), 
				el : this._htWElement.elPrev.$value()
			};
		}
	},
	_detachEvent : function() {
		for(var p in this._htEvent) {
			var htTargetEvent = this._htEvent[p];
			htTargetEvent.ref.detach(htTargetEvent.el, p.substring(0, p.indexOf("_")));
		}
		this._htEvent = null;
	},
	destroy: function() {
		this.deactivate();
		for(var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		this._htWElement = null;
	}
}).extend(jindo.m.CorePagination);
