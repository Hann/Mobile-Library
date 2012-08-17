jindo.m.MoreContentButton = jindo.$Class({
	$init : function(el, htUserOption) {
		this.option({
			sClassPrefix : 'more_',
			nTotalItem : 10, 
			nShowMaxItem : 10, 
			nItemPerPage : 10,
			nPage : 1,
			bActivateOnload : true,
			htAjax : {}	
		});
		this.option(htUserOption || {});		
		this.option('nItem', this.option('nShowMaxItem'));
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
			sStart : 'start',
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
		var sClass = '.'+ this.option('sClassPrefix');		
		this._htWElement.elBase = jindo.$Element(el);
		this._htWElement.elMoreButton = jindo.$Element(jindo.$$.getSingle(sClass+'button',el));
		this._htWElement.elTop = jindo.$Element(jindo.$$.getSingle(sClass+'top',el));
		this._htWElement.elLoading = jindo.$Element(jindo.$$.getSingle(sClass+'loading',el));
		this._htWElement.elMoreCnt = jindo.$Element(jindo.$$.getSingle(sClass+'moreCnt', el)); 
		this._htWElement.elTotal = jindo.$Element(jindo.$$.getSingle(sClass+'total',el));
		this._htWElement.elCurrent = jindo.$Element(jindo.$$.getSingle(sClass+'current', el));
		this._htWElement.elLast = jindo.$Element(jindo.$$.getSingle(sClass+'last', el));
		if(!!this._htWElement.elLast){
			this._htWElement.elLastTotal = jindo.$Element(jindo.$$.getSingle(sClass+'total', this._htWElement.elLast.$value()));
			this._htWElement.elLastCurrent = jindo.$Element(jindo.$$.getSingle(sClass+'current', this._htWElement.elLast.$value()));
		}
	},
	_onClickMore : function(oEvent){
		oEvent.stop(jindo.$Event.CANCEL_DEFAULT);
		if(this.hasNextPage()){
			this.more();		
		}
	},
	_onClickTop : function(oEvent){
		oEvent.stop(jindo.$Event.CANCEL_DEFAULT);
		this.fireEvent('goTop',{
			element : oEvent.element
		});
	},
	more : function(bFireEvent){
		if (typeof bFireEvent == "undefined") {
			bFireEvent = true;
		}
		var nPage = this._nCurrentPage +1; 
		var nBeforePage = this.getCurrentPage();		
		if(bFireEvent){
			if(!this.fireEvent('beforeMore',{
				nPage : nPage, 
				nCurrentPage : nBeforePage
			})){
				return;
			}
		}
		this.showLoadingImg();
		if(!!this.option('htAjax').sApi){
			this._callAjax(nPage,true, bFireEvent);
		}else{
			this._move(nPage);		
			var htIndex = this.getPageItemIndex(nPage);
			if(bFireEvent){
				this.fireEvent('more',{
					nPage : nPage,
					nStartIndex : htIndex.nStart,
					nEndIndex : htIndex.nEnd
				});
			}
			this.updateInfo();			
		}
	},
	movePageTo : function(nPage, bFireEvent){
		if (typeof bFireEvent == "undefined") {
			bFireEvent = true;
		}
		var nBeforePage = this.getCurrentPage();		
		if(bFireEvent){
			if(!this.fireEvent('beforeMovePage',{
				nPage : nPage, 
				nCurrentPage : nBeforePage
			})){
				return;
			}
		}
		this.showLoadingImg();
		if(!!this.option('htAjax').sApi){
			this._callAjax(nPage, false ,bFireEvent);
		}else{
			this._move(nPage);		
			var htIndex = this.getPageItemIndex(nPage);
			if(bFireEvent){
				this.fireEvent('movePage',{
					nPage : nPage,
					nBeforePage : nBeforePage,
					nStartIndex : 0,
					nEndIndex : htIndex.nEnd
				});
			}			
			this.updateInfo();			
		}	
	},
	_move : function(nPage){				
		var n = this._convertToAvailPage(nPage);
		if(n != this._nCurrentPage){
			this._nCurrentPage = n;
		}
	},
	updateInfo : function(){
		var nPage = this.getCurrentPage();
		var htIndex = this.getPageItemIndex(nPage);		
		this.hideLoadingImg();
		if(nPage >= this.getTotalPages() ){
			if(this._htWElement.elBase){
				this._htWElement.elBase.addClass('u_pg_end');
			}
			if(this._htWElement.elMoreButton){
				this._htWElement.elMoreButton.hide();
			}
			if(this._htWElement.elLast){
				this._htWElement.elLast.show('block');
			}
		}else{
			if(this._htWElement.elBase){
				this._htWElement.elBase.removeClass('u_pg_end');
			}
			if(this._htWElement.elMoreButton){
				this._htWElement.elMoreButton.show('block');
			}
			if(this._htWElement.elLast){
				this._htWElement.elLast.hide();
			}
		}
		if(!!this._htWElement.elCurrent){
			var sText = htIndex.nEnd+1;
			this._htWElement.elCurrent.text(this._setNumberFormat(sText));
		}	
		if(typeof this._htWElement.elLastCurrent != 'undefined'){
			this._htWElement.elLastCurrent.text(this._setNumberFormat(htIndex.nEnd+1));
		}
		if(!!this._htWElement.elTotal){
			this._htWElement.elTotal.text(this._setNumberFormat(this.option('nTotalItem')));
		}
		if(typeof this._htWElement.elLastTotal != 'undefined'){
			this._htWElement.elLastTotal.text(this._setNumberFormat(this.option('nTotalItem')));
		}
		if(!!this._htWElement.elMoreCnt){
			var nCnt = Math.min(this.getItemPerPage(), this.getItemCount() - htIndex.nEnd-1);			
			this._htWElement.elMoreCnt.text(this._setNumberFormat(nCnt));
		}
	},
	_callAjax : function(nPage, bMore ,bFireEvent){
		var self = this;
		this.oAjax.option('onload', null);
		this.oAjax.option('onload', function(res){
			self._onAjaxResponse(res, nPage, bMore, bFireEvent);
		});
		this.oAjax.request(this._getQueryString(nPage, bMore));		
	},
	_onAjaxResponse : function(oResponse, nPage, bMore, bFireEvent){
		if(bFireEvent){
			this._move(nPage);
			var sEvent = bMore? 'more' : 'movePage';
			var htIndex = this.getPageItemIndex(nPage);			
			this.fireEvent(sEvent,{
				oResponse : oResponse,
				nPage : nPage,
				nStartIndex : bMore? htIndex.nStart : 0,
				nEndIndex : htIndex.nEnd
			});			
		}
		this.updateInfo();		
	},	
	_getQueryString : function(nPage, bMore){
		if(typeof bMore === 'undefined'){
			bMore = true;
		}
		var htQuery = this.option('htAjax').htQuery || {};
		var htIndex = this.getPageItemIndex(nPage);
		htQuery[this.option('htAjax').sStart] = bMore? htIndex.nStart : 0;
		htQuery[this.option('htAjax').sDisplay] = Math.min(this.getItemPerPage(), (this.getShowMaxItem() - htIndex.nStart));
		return htQuery;
	},
	_setNumberFormat: function(sText) {
		sText = sText.toString();
		var sReturn = "";
		var nDot = 0;
		var nLastPosition = sText.length;
		for (var i = nLastPosition; i >= 0; i--) {
			var sChar = sText.charAt(i);
			if (i > nLastPosition) {
				sReturn = sChar + sReturn;
				continue;
			}
			if (/[0-9]/.test(sChar)) {
				if (nDot >= 3) {
					sReturn = ',' + sReturn;
					nDot = 0;
				}
				nDot++;
				sReturn = sChar + sReturn;
			}
		}
		return sReturn;
	},
	showLoadingImg : function(){
		if(!!this._htWElement.elLoading){
			this._htWElement.elLoading.show();
		}
	},
	hideLoadingImg : function(){
		if(!!this._htWElement.elLoading){
			this._htWElement.elLoading.hide();
		}
	},
	reset : function(nShowMaxItem){
		if (typeof nShowMaxItem == "undefined") {
			nShowMaxItem = this.option('nShowMaxItem');
		}
		this.setShowMaxItem(nShowMaxItem);
		this.movePageTo(1, false);
	},
	getTotalItem : function(){
		return this.option('nTotalItem');
	},
	setTotalItem : function(n){
		this.option('nTotalItem', n);
	},
	getShowMaxItem : function(){
		return this.option('nShowMaxItem');
	},
	setShowMaxItem : function(n){
		this.option('nShowMaxItem', n);
		this.option('nItem', n);
	},
	_onActivate : function() {
		this._attachEvent();
	},
	_onDeactivate : function() {
		this._detachEvent();
	},
	_attachEvent : function() {
		this._htEvent = {};
		if(!!this._htWElement.elMoreButton){
			this._htEvent["click_More"] = {
				ref : jindo.$Fn(this._onClickMore, this).attach(this._htWElement.elMoreButton, 'click'), 
				el : this._htWElement.elMoreButton.$value()
			};				
		}		
		if(!!this._htWElement.elTop){
			this._htEvent["click_Top"] = {
				ref : jindo.$Fn(this._onClickTop, this).attach(this._htWElement.elTop, 'click'), 
				el : this._htWElement.elTop.$value()
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
	header : function(vName, vValue) {
		if(this.oAjax) {
			return this.oAjax.header(vName, vValue);
		}
	},
	destroy: function() {
		this._detachEvent();
		for(var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		this._htWElement = null;
	}
}).extend(jindo.m.CorePagination);
