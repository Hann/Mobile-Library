jindo.m.ToggleSlider = jindo.$Class({
	$init : function(sId, htUserOption) {
		this.option({
			sClassPrefix : 'tslider-',
			bUseDrag : true,
			bActivateOnload : true,
			nOnPosition : 50,
			nOffPosition: 0,
			bStatus : true,
			nDuration : 100
		});
		this.option(htUserOption || {});
		this._setWrapperElement(sId);
		this._initVar();
		if(this.option("bActivateOnload")) {
			this.activate();
			if(this.option('bStatus')){
				this.bStatusOn = false;
				this._move(true, false);
			}else{
				this.bStatusOn = true;
				this._move(false, false);
			}
		}
	},
	_initVar: function() {
		if(this._htWElement.track){
			this._oTouch = new jindo.m.Touch(this._htWElement.track.$value(),{
				nSlopeThreshold : 1,
				nMoveGap: 2,
				bActivateOnload: false
			});		
			this._oTouch.attach({
				'touchMove' : jindo.$Fn(this._onMove, this).bind(),
				'touchEnd' : jindo.$Fn(this._onEnd, this).bind(),
				'touchStart' : jindo.$Fn(this._onStart, this).bind()
			});
		}else{
			this._oTouch = null;
		}
		this.bMove = false;
		this.bStatusOn = this.option('bStatus');
		this.htInfo = {
			nMax : Math.max(this.option('nOnPosition'), this.option('nOffPosition')),
			nMin : Math.min(this.option('nOnPosition'), this.option('nOffPosition')),
			nGap  : Math.round(Math.abs((this.option('nOnPosition')-this.option('nOffPosition'))/2))
		};
		this._wfTransitionEnd = jindo.$Fn(this._onTransitionEnd, this).bind();
		this._bFireChange = false;
	},
	_setWrapperElement: function(el) {
		this._htWElement = {};		
		el = jindo.$(el);
		var sClass = '.' + this.option('sClassPrefix');
		this._htWElement.base = jindo.$Element(el);
		var aRadio = el? jindo.$$('[name='+this.option('sClassPrefix')+'radio]', el): null;		
		this._htWElement.aRadio = jindo.$A(aRadio).forEach(function(value, index,array){
			array[index] = jindo.$Element(value);
		}).$value();
		this._htWElement.track = el? jindo.$Element(jindo.$$.getSingle(sClass+'track', el)) : null;
		this._htWElement.thumb = el? jindo.$Element(jindo.$$.getSingle(sClass+'thumb', el)) : null;
	},
	_onStart : function(oCustomEvt){
		oCustomEvt.oEvent.stop(jindo.$Event.CANCEL_DEFAULT);
	},
	_onMove : function(oCustomEvt){		
		if(!this.option('bUseDrag')){ return;}
		oCustomEvt.oEvent.stop(jindo.$Event.CANCEL_DEFAULT);
		this.bMove = true;		
		var nDis = oCustomEvt.nDistanceX;
		var n = this._getAdjustedPos(nDis);		
		this._moveThumb(n);
	},	
	_onEnd : function(oCustomEvt){
		if(oCustomEvt.sMoveType == 'tap'){
			this.toggle();
		}else{
			if(this.bMove){
				var nCurrent = this.isOn()? this.option('nOnPosition') : this.option('nOffPosition');
				var nPos = this._getPosition();
				if( Math.abs(nCurrent- nPos) > this.htInfo.nGap ){
					this.toggle();
				}else{
					this._move(this.isOn(), false);
				}
			}else{
				this.toggle();
			}			
		}
		this.bMove = false;		
	},
	_move : function(bOn ,bFireEvent){
		if(typeof bFireEvent == 'undefined'){
			bFireEvent = true;
		}
		var nDis = this.option('nOffPosition');
		if(bFireEvent){
			if(!this.fireEvent('beforeChange',{
				bOn : this.isOn()
			})){
				return false;
			}
		}
		if(bOn) {nDis = this.option('nOnPosition');}
		this._bFireChange = bFireEvent;
		this.bStatusOn = bOn;
		this._moveThumb(nDis, this.option('nDuration'));		
		this._updateForm();
	},	
	toggle : function(){
		if(this.isOn()){
			this.off();
		}else{
			this.on();
		}		
	},
	on : function(){
		if(!this.isOn()){
			this._move(true);
		}
	},
	off : function(){
		if(this.isOn()){
			this._move(false);
		}
	},
	isOn : function(){
		return this.bStatusOn;		
	},
	_updateForm : function(){
		if(!this._htWElement.aRadio){ return;}		
		var value = this.isOn()? 'on' : 'off';
		for(var i=0,nLen = this._htWElement.aRadio.length;i<nLen; i++){
			var wel = this._htWElement.aRadio[i];
			if(wel.$value().value == value){
				wel.$value().checked = true;
			}else{
				wel.$value().checked = false;
			}
		}		
	},
	_moveThumb : function(n, nTime){
		if(n > this.htInfo.nMax || n < this.htInfo.nMin ){ return;}		
		if(typeof nTime == 'undefined'){
			nTime = 0;
		}
		var nCurrent = parseInt(this._htWElement.thumb.css('left'),10);
		if((nTime > 0) && (nCurrent !== n) ){
			this._attachTransitionEnd();
		}
		if(this._htWElement.thumb){
			this._htWElement.thumb.css('webkitTransitionDuration', nTime+'ms');	
			this._htWElement.thumb.css('webkitTransitionProperty','left');
			this._htWElement.thumb.css('left' ,n+"%");
		}
		if(nTime === 0 || (nCurrent === n)){			
			this._onTransitionEnd();
		}
	},
	_onTransitionEnd : function(){
		this._detachTransitionEnd();
		if(this._bFireChange){
			this.fireEvent('change',{
				bOn : this.isOn()
			});
		}
		this._bFireChange = false;
	},
	_attachTransitionEnd : function(){
		jindo.m.attachTransitionEnd(this._htWElement.thumb.$value(), this._wfTransitionEnd);
	},
	_detachTransitionEnd : function(){	
		jindo.m.detachTransitionEnd(this._htWElement.thumb.$value(), this._wfTransitionEnd);		
	},	
	_getAdjustedPos : function(nDis){
		var nPecent = Math.round((nDis * 100) / this._htWElement.track.width());
		nPecent = nPecent + (this.isOn()? this.option('nOnPosition') : this.option('nOffPosition'));
		nPecent = Math.max(this.htInfo.nMin, nPecent);
		nPecent = Math.min(this.htInfo.nMax, nPecent);
		return nPecent;
	},
	_getPosition : function(){
		var sPos = this._htWElement.thumb.css('left');
		return (sPos == "auto") ? 0 : parseInt(sPos, 10);
	},
	_onClick : function(evt){
		evt.stop(jindo.$Event.CANCEL_DEFAULT);
	},
	_attachEvent : function() {
		this._htEvent = {};		
		this._htEvent["click"] = {
			ref : jindo.$Fn(this._onClick, this).attach(this._htWElement.thumb, "click"),
			el	: this._htWElement.thumb
		};
	},
	_detachEvent : function(sEventKey) {
		if(sEventKey) {
			var htTargetEvent = this._htEvent[sEventKey];
			htTargetEvent.ref.detach(htTargetEvent.el, sEventKey);
		}
	},
	_onActivate : function() {
		this._attachEvent();
		if(this._oTouch){
			this._oTouch.activate();
		}
	},
	_onDeactivate : function() {
		this._detachEvent();
		if(this._oTouch){
			this._oTouch.deactivate();
		}
	},
	destroy: function() {
		this.deactivate();
		for(var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		this._htWElement = null;
		this._oTouch.detachAll();
		this._oTouch = null;
		this.bMove = null;
		this.bStatusOn = null;
		this._wfTransitionEnd = null;
		this._bFireChange = null;
	}
}).extend(jindo.UIComponent);
