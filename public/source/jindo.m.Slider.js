jindo.m.Slider = jindo.$Class({
	$init : function(sId, htUserOption) {
		this.option({
			 sClassPrefix : 'slider-',
			 bVertical : false,
			 nMinValue : 0, 
			 nMaxValue : 100,
			 nDefaultValue : 0,
			 bActivateOnload : true			 
		});
		this.option(htUserOption || {});
		this._setWrapperElement(sId);
		this._initVar();
		if(this.option("bActivateOnload")) {
			this.activate();
			this.setValue(this.option('nDefaultValue'));
		}
	},
	_initVar: function() {
		var nMove = this.option('bVertical')? 0: 6;
		this._oTouch = new jindo.m.Touch(this._htWElement.track.$value(),{
			nMoveGap: nMove,
			bActivateOnload: false
		});		
		this._oTouch.attach({
			'touchMove' : jindo.$Fn(this._onMove, this).bind(),
			'touchEnd' : jindo.$Fn(this._onMove, this).bind(),
			'touchStart' : jindo.$Fn(this._onStart, this).bind()
		});
		this._htSwap ={
			left : this.option('bVertical')? 'top' : 'left',
			width :  this.option('bVertical')? 'height' : 'width',
			nX :  this.option('bVertical')? 'nY' : 'nX'
		};
		var nSize = this._htWElement.thumb[this._htSwap.width]()/2;
		this._htWElement.thumb.css('margin-'+this._htSwap.left, nSize*-1);		
	},
	_setWrapperElement: function(el) {
		this._htWElement = {};
		el = jindo.$(el);
		var sClass = '.' + this.option('sClassPrefix');
		this._htWElement.track = jindo.$Element(el);
		var elThumb = jindo.$$.getSingle(sClass+'thumb', el);		
		this._htWElement.thumb = elThumb? jindo.$Element(elThumb) : null;
		var elRang = jindo.$$.getSingle(sClass+'range', el);
		this._htWElement.range = elRang? jindo.$Element(elRang) : null;		
	},
	_onStart : function(oCustomEvt){
		oCustomEvt.oEvent.stop(jindo.$Event.CANCEL_DEFAULT);	
	},
	_onMove : function(oCustomEvt){		
		if(oCustomEvt.sType == 'touchMove'){
			oCustomEvt.oEvent.stop(jindo.$Event.CANCEL_DEFAULT);
		}
		var nCurrent = oCustomEvt[this._htSwap.nX] - this._htWElement.track.offset()[this._htSwap.left] - (this._htWElement.thumb[this._htSwap.width]()/2);
		var nPos = this._getAdjustedPos(nCurrent);	
		this._move(nPos);		
	},
	_move : function(nPos, bFireEvent){
		if(typeof bFireEvent == 'undefined'){
			bFireEvent = true;
		}
		var nValue = this.getValue(nPos);		
		var nAdjustPos = Math.round(nPos);
		var nAdjustValue = this.getValue(nAdjustPos);	
		var htOption = {
			nValue : nValue,
			nPosition : nPos,
			nAdjustValue : nAdjustValue,
			nAdjustPosition : nAdjustPos
		};
		if(bFireEvent && !this._fireBeforeEvent(htOption)){
			return;
		}
		if(htOption.nAdjustValue != nAdjustValue){
			htOption.nAdjustPosition = this._getPositionFromValue(htOption.nAdjustValue);
		}
		this._moveThumb(htOption.nAdjustPosition);		
		if(bFireEvent){
			this._fireChangeEvent(htOption);
		}
		if(this._htWElement.range){
			this._htWElement.range.css(this._htSwap.width, htOption.nAdjustPosition+'%');
		}
	},
	_fireBeforeEvent : function(htOption){		
		return this.fireEvent('beforeChange',htOption);		
	},	
	_fireChangeEvent : function(htOption){
		this.fireEvent('change', htOption);
	},
	_moveThumb : function(n){
		if(n > 100 || n < 0){ return;}		
		this._htWElement.thumb.css('webkitTransitionDuration', '0ms');	
		this._htWElement.thumb.css('webkitTransitionProperty',this._htSwap.left);
		this._htWElement.thumb.css(this._htSwap.left ,n+"%");
	},
	_getTrackInfo : function(){
		var nTrackSize = this.option('bVertical')? this._htWElement.track.height() : this._htWElement.track.width();
		var nThumbSize = this.option('bVertical')? this._htWElement.thumb.height() : this._htWElement.thumb.width();
		var nMaxPos =  nTrackSize-(nThumbSize/2);
		return {
			maxPos : nMaxPos,
			max :  this.option('nMaxValue')*1,
			min :  this.option('nMinValue')*1
		};
	},
	getValue : function(nPos) {
		if(typeof nPos == 'undefined'){
			nPos = this.getPosition();
		}
		var oInfo = this._getTrackInfo();
		var nValue = oInfo.min + ((oInfo.max- oInfo.min)* (nPos/100));
		return nValue;
	},
	setValue : function(nValue, bFireEvent){
		nValue = nValue *1;
		var nPos = this._getPositionFromValue(nValue);
		if(typeof bFireEvent == 'undefined'){
			bFireEvent = true;
		}
		this._move(nPos, bFireEvent);
	},
	_getAdjustedPos : function(nDistance){		
		var htInfo = this._getTrackInfo();		
		var nPecent = (nDistance* 100)/htInfo.maxPos;
		nPecent = Math.max(0, nPecent);
		nPecent = Math.min(nPecent,100);
		return nPecent;
	},	
	getPosition : function() {
		var sPos = this._htWElement.thumb.css(this._htSwap.left);
		return (sPos == "auto") ? 0 : parseInt(sPos, 10);
	},
	setPosition : function(nPos, bFireEvent){
		if(typeof bFireEvent == 'undefined'){
			bFireEvent = true;
		}
		this._move(nPos, bFireEvent);
	},
	_getPositionFromValue : function(nValue){
		var htInfo = this._getTrackInfo();
		var nPecent = ((nValue- htInfo.min)* 100) /(htInfo.max-htInfo.min);
		nPecent = isNaN(nPecent)? 100 : nPecent;		
		nPecent = Math.max(0, nPecent);
		nPecent = Math.min(100, nPecent);
		return nPecent;		
	},
	_onClick : function(evt){
		evt.stop();
	},
	_attachEvent : function() {
		this._htEvent = {};		
	},
	_detachEvent : function(sEventKey) {
		if(sEventKey) {
			var htTargetEvent = this._htEvent[sEventKey];
			htTargetEvent.ref.detach(htTargetEvent.el, sEventKey);
		}
	},
	_onActivate : function() {
		this._attachEvent();
		this._oTouch.activate();
	},
	_onDeactivate : function() {
		this._detachEvent();
		this._oTouch.deactivate();
	},		
	destroy: function() {
		this.deactivate();
		for(var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		this._htWElement = null;
		for(p in this._htSwap) {
			this._htSwap[p] = null;
		}
		this._htSwap = null;		
		this._oTouch.detachAll();
	}
}).extend(jindo.UIComponent);
