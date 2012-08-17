jindo.m.IndexScroll = jindo.$Class({
	$init : function(el,htUserOption) {},
	_initVar: function() {
		this.$super._initVar();
		this._aIndexInfo = null;
		if( (jindo.m.getDeviceInfo().iphone || jindo.m.getDeviceInfo().ipad) && (parseInt(jindo.m.getDeviceInfo().version,10) < 5) ) {
			this._sEvent = "click";
		} else {
			this._sEvent = "touchstart";
		}
	},
	_setWrapperElement: function(el) {
		this.$super._setWrapperElement(el);
		this._createFixedIndex();
		this._createIndexView();
	},
	_refreshIndexInfo : function() {
		var aIndexElement = this._oCore._htWElement["scroller"].queryAll("." + this.option("sClassPrefix") + "index"),
			aIndexInfo = [],
			nWrapperMarginTop = this._htWElement["wrapper"].offset().top;
		for(var i=0, nLength = aIndexElement.length; i < nLength; i++) {
			aIndexInfo.push(this._getIndexInfo(jindo.$Element(aIndexElement[i]), nWrapperMarginTop));
		}
		for(i=0, nLength = aIndexInfo.length-1; i < nLength; i++) {
			aIndexInfo[i].nNextTop = aIndexInfo[i+1].nTop;
			aIndexInfo[i].nLast = aIndexInfo[i+1].nTop - aIndexInfo[i].nHeight;
		}
		this._aIndexInfo = aIndexInfo;
		if(this.option("bUseIndexView")) {
			this._refreshIndexView();
		}
	},
	_createIndexView : function() {
		var nId = this.option("sClassPrefix") + "_indexview__";
		this._htWElement["indexview"] = jindo.$Element(nId);
		if(!this._htWElement["indexview"]) {
			this._htWElement["indexview"] = jindo.$Element("<ul id='" + nId + "' class='" + this.option("sClassPrefix") + "indexview' style='position:absolute;z-index:2;-" + jindo.m.getCssPrefix() + "-tap-highlight-color:rgba(0,0,0,0);'>");
			document.body.appendChild(this._htWElement["indexview"].$value());
		}
	},
	_refreshIndexView : function() {
		var htOffset = this._htWElement["wrapper"].offset(),
			sName,wel,nTop,nLeft,
			sHTML = "";
		for(var i=0, nLength = this._aIndexInfo.length; i<nLength; i++ ) {
			wel = this._aIndexInfo[i].wel;
			sName = wel.attr("data-text") ? wel.attr("data-text") : wel.text();
			sHTML += "<li class='" + this.option("sClassPrefix") + "indexview_item' data-index='"+ i + "'>" + sName + "</li>";
		}
		this._htWElement["indexview"].html(sHTML);
		nTop = htOffset.top + this._htWElement["wrapper"].height()/2;
		nLeft = htOffset.left + this._htWElement["wrapper"].width();
		this._htWElement["indexview"].css({
			top : (nTop - this._htWElement["indexview"].height()/2) + "px",
			left : (nLeft - this._htWElement["indexview"].width() - 10) + "px"
		});
	},
	_attachEvent : function() {
		this.$super._attachEvent();
		if(this.option("bUseIndexView")) {
			this._htEvent["indexview"] = jindo.$Fn(this._onIndexView, this).attach(this._htWElement["indexview"], this._sEvent);
		}
	},
	_detachEvent : function() {
		if(this.option("bUseIndexView")) {
			this._htEvent["indexview"].detach(this._htWElement["indexview"], this._sEvent);
		}
	},
	_onIndexView : function(we) {
		if(we.element.tagName == "LI") {
			var wel = jindo.$Element(we.element),
				nIdx = wel.attr("data-index");
			this.scrollTo(0,this._aIndexInfo[nIdx].nTop);
		}
	},
	_onPosition : function(we) {
		this._setPosFixedIndex(-we.nTop);
		this.$super._onPosition(we);
	},
	_getIndexInfo : function(welIndex, nWrapperMarginTop) {
		var htInfo = {};
		htInfo.wel = welIndex;
		htInfo.nTop = welIndex.offset().top - nWrapperMarginTop;
		htInfo.nHeight = welIndex.height();
		htInfo.nBottom = htInfo.nTop + htInfo.nHeight;
		return htInfo;
	},
	_setPosFixedIndex : function(nTop) {
		var nIdx = this._getCurrentIdx(nTop),
			htIndexInfo = this._aIndexInfo[nIdx],
			nMoveTop;
		if(nIdx == -1) {
			this._htWElement["index_top"].hide();
			this._htWElement["index_bottom"].hide();
		} else {
			if(htIndexInfo.nLast && (htIndexInfo.nLast <= nTop && nTop < htIndexInfo.nNextTop) ) {
				nMoveTop = htIndexInfo.nLast - nTop;
				this._htWElement["index_top"].html(htIndexInfo.wel.outerHTML())
					.css("top", nMoveTop + "px");
				this._htWElement["index_bottom"].html(this._aIndexInfo[nIdx+1].wel.outerHTML())
					.css("top" , (nMoveTop + htIndexInfo.nHeight) + "px").show();
			} else {
				this._htWElement["index_top"].html(htIndexInfo.wel.outerHTML())
					.css("top", "0px").show();
				this._htWElement["index_bottom"].hide();
			}
		}
	},
	_getCurrentIdx : function(nPos) {
		for(var i=0, nLength = this._aIndexInfo.length; i < nLength; i++) {
			if(this._aIndexInfo[i].nTop > nPos) {
				break;
			}
		}
		return i-1;
	},
	_createFixedIndex : function() {
        var sStyle = 'position:absolute;width:100%;top:0;z-index:1; display:none';
		this._htWElement["index_top"] = jindo.$Element(this._htWElement["wrapper"].query("._scroller_index_scroll_top_"));
		if(!this._htWElement["index_top"]) {
			 this._htWElement["index_top"] = jindo.$Element("<div style='" + sStyle +"' class='_scroller_index_scroll_top_'></div>");
			 this._htWElement["wrapper"].append( this._htWElement["index_top"]);
		}
		this._htWElement["index_bottom"] = jindo.$Element(this._htWElement["wrapper"].query("._scroller_index_scroll_bottom_"));
		if(!this._htWElement["index_bottom"]) {
			 this._htWElement["index_bottom"] = jindo.$Element("<div style='" + sStyle +"' class='_scroller_index_scroll_bottom_'></div>");
			 this._htWElement["wrapper"].append( this._htWElement["index_bottom"]);
		}
	},
	refresh : function() {
		if(this.option("bUsePullDown")) {
			this.option("bUsePullDown",false);
		}
		if(this.option("bUsePullUp")) {
			this.option("bUsePullUp",false);
		}
		if(this.option("bUseHScroll")) {
			this.option("bUseHScroll",false);
		}
		this.option("bUseCss3d",false);
		this.$super.refresh();
		this._refreshIndexInfo();
	}
}).extend(jindo.m.Scroll);
