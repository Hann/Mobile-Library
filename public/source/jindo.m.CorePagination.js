jindo.m.CorePagination = jindo.$Class({
	_nCurrentPage : 1,
	$init : function(htUserOption) {
		this.option({
			nItem : 10,
			nItemPerPage : 10,
			nPage : 1,
			bActivateOnload : true
		});
		this.option(htUserOption || {});
		this._nCurrentPage = this.option('nPage');
	},
	getItemCount : function(){
		return this.option('nItem');
	},
	getItemPerPage : function(){
		return this.option('nItemPerPage');
	},
	getCurrentPage : function(){
		return this._nCurrentPage;
	},
	setItemCount : function(n){
		this.option('nItem', n);
	},
	setItemPerPage : function(n){
		this.option('nItemPerPage',n);
	},
	movePageTo : function(n){
		var nBefore = this._nCurrentPage;
		var nPage = this._convertToAvailPage(n);
		if(nPage != this._nCurrentPage){
			this._nCurrentPage = nPage;
		}		
	},
	nextPageTo : function(){
		var nPage = this._nCurrentPage +1;
		this.movePageTo(nPage);		
	},
	previousPageTo : function(){
		var nPage = this._nCurrentPage-1;
		this.movePageTo(nPage);
	},
	hasNextPage : function(){
		var nPage =this.getCurrentPage(),
			totalPage = this.getTotalPages();
		return nPage&& (nPage < totalPage);				
	},	
	hasPreviousPage : function(){
		return (this.getCurrentPage() > 1);
	},
	getTotalPages : function(){
		var nTotal = this.option('nItem'),
			nCount = this.option('nItemPerPage');
		if(!nCount){
			return null;
		}
		return Math.ceil(nTotal/nCount);		
	},
	getPageItemIndex : function(nPage){
		nPage = this._convertToAvailPage(nPage);
		var nTotal = this.option('nItem'),
			nCount = this.option('nItemPerPage'),
			start, end;
		if(!nPage || !nCount){
			return null;
		}
		start = (nPage-1) * nCount;
		end = Math.min(start+ nCount, nTotal)-1; 
		return {
			nStart :  start,
			nEnd : end
		};		
	},
	getPageOfItem : function(n){
		return Math.ceil(n / this.getItemPerPage());	
	},
	_convertToAvailPage : function(nPage){
		var nLastPage = this.getTotalPages();
		nPage = Math.max(nPage, 1);
		nPage = Math.min(nPage, nLastPage);
		return nPage;		
	}
}).extend(jindo.UIComponent);
