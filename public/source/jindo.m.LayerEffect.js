jindo.m.LayerEffect = jindo.$Class({
	$init : function(el, htUserOption) {
		this.option({		
			nDuration : 250,
			bActivateOnload : true
		});		
		this.option(htUserOption || {});
		this._initVar();
		this.setLayer(el);
		this._initTransition();
		if(this.option("bActivateOnload")) {
			this.activate();
		}
	},
	_htEffect :{
		'expand' : "jindo.m.ExpandEffect",
		'contract' : "jindo.m.ContractEffect",
		"fade" : "jindo.m.FadeEffect",
		"pop" : "jindo.m.PopEffect",
		"slide" : "jindo.m.SlideEffect",
		"flip" : "jindo.m.FlipEffect"		
	},	
	_initVar: function() {
		this._htEffectInstance  = {};
		this._htLayerInfo = {};
		this._htWElement = {}; 
		this.bAndroid = jindo.m.getDeviceInfo().android;
		this.sClassHighligting = '_effct_hide_highlighting_tmp';
	},
	_initTransition : function(){
		this._oTransition = new jindo.m.Transition();
	},
	_createEffect : function(sType){
		if(this._htEffect[sType] && !this._htEffectInstance[sType]) {
			try{
				this._htEffectInstance[sType] = eval("new " + this._htEffect[sType] + "()");
			}catch(e){
			}
			this._htEffectInstance[sType].setLayerInfo(this._htLayerInfo);
		}
	},
	expand : function(htOption){
		var sType = 'expand';		
		this._run(sType, htOption);
	},
	contract : function(htOption){
		var sType = 'contract';		
		this._run(sType, htOption);
	},	
	fade : function(htOption){
		var sType = "fade";
		this._run(sType, htOption);
	},
	pop : function(htOption){
		var sType = "pop";
		this._run(sType, htOption);
	},
	slide : function(htOption){
		var sType = "slide";
		this._run(sType, htOption);
	},
	flip: function(htOption){
		var sType = "flip";
		this._run(sType, htOption);
	},
	isPlaying : function(){
		return this._oTransition.isPlaying();
	},
	_fireCustomEvent : function(sType, htOption){
		return this.fireEvent(sType, htOption);
	},
	_run : function(sType, htOption){
		if(!this._isAvailableEffect()){
			return;
		}
		this._createEffect(sType);
		if(typeof htOption === 'undefined'){
			htOption = {};
		}	
		var oEffect = this._htEffectInstance[sType];
		var el = this.getLayer();
		var nDuration = (typeof htOption.nDuration  === 'undefined')? this.option('nDuration') : parseInt(htOption.nDuration,10);
		var htBefore = oEffect.getBeforeCommand(el, htOption);
		var htCommand = oEffect.getCommand(el, htOption);
		if(!this._fireCustomEvent("beforeEffect", {
			elLayer : el,
			sEffect :htCommand.sTaskName,
			nDuration :nDuration
		})){
			return;
		}
		if(htBefore){
			this._oTransition.queue(this.getLayer(), 0, htBefore);
		}				
		this._oTransition.queue(this.getLayer(), nDuration , htCommand);
		this._oTransition.start();	
	},
	setLayer : function(el){
		this._htWElement["el"] = jindo.$(el);
		this._htWElement["wel"] = jindo.$Element(this._htWElement["el"]);
		var elFocus;
		if(!!this.bAndroid){
			elFocus = jindo.$$.getSingle('.'+this.sClassHighligting, this._htWElement['el']);		
			if(!elFocus){			
				var sTpl = '<a href="javascript:void(0)" style="position:absolute" class="'+this.sClassHighligting+'"></a>';
				elFocus = jindo.$(sTpl);
				this._htWElement['wel'].append(elFocus);
				elFocus.style.opacity = '0';
				elFocus.style.width= 0;
				elFocus.style.height= 0;
				elFocus.style.left = "-1000px";
				elFocus.style.top = "-1000px";				
			}
		}		
		this.setSize();
	},
	stop : function(bAfter){
		if(typeof bAfter === 'undefined'){
			bAfter = true;
		}
		if(this._oTransition){
			this._oTransition.stop(bAfter);
		}
	},
	clearEffect : function(bAfter){
		if(this._oTransition){
			this._oTransition.clear(bAfter);
		}
	},
	getLayer : function(){
		return this._htWElement["el"]; 
	},	
	setSize : function(){
		var elToMeasure = this._htWElement['el'].cloneNode(true);
		var welToMeasure = jindo.$Element(elToMeasure);
		welToMeasure.opacity(0);
		this._htWElement['wel'].after(welToMeasure);
		welToMeasure.show();
		this._htLayerInfo["nWidth"] = this._htWElement["wel"].width();
		this._htLayerInfo["nHeight"] = this._htWElement["wel"].height();
		welToMeasure.css({
			position : "absolute",
			top : "0px",
			left : "0px"
		});
		this._htLayerInfo['nMarginLeft'] = parseInt(welToMeasure.css('marginLeft'),10);
		this._htLayerInfo['nMarginTop'] = parseInt(welToMeasure.css('marginTop'),10);
		this._htLayerInfo['nOpacity'] = this._htWElement["wel"].opacity();		
		this._htLayerInfo['sPosition'] = this._htWElement["wel"].css('position');		
		var sDisplay = this._htWElement['wel'].css('display');		
		sDisplay = ((sDisplay === 'none') || (sDisplay.length === 0))? 'block' : sDisplay;		
		this._htLayerInfo['sDisplay'] = sDisplay;
		this._htLayerInfo['sClassHighligting'] = this.sClassHighligting;
		welToMeasure.leave();
		this._setEffectLayerInfo();
		//console.log('/////setSize', this._htLayerInfo);
	},
	_setEffectLayerInfo : function(){
		for(var p in this._htEffectInstance){
			this._htEffectInstance[p].setLayerInfo(this._htLayerInfo);
		}
	},
	_onTransitionEnd : function(oCustomEvent){
		if(oCustomEvent.sTaskName){
			this._fireCustomEvent("afterEffect", {
				elLayer : oCustomEvent.element,
				sEffect : oCustomEvent.sTaskName,
				nDuration : oCustomEvent.nDuration
			});
		}
	},
	_onTransitionStop : function(oCustomEvent){
		if(oCustomEvent.sTaskName){
			this._fireCustomEvent("stop", {
				elLayer : oCustomEvent.element,
				sEffect : oCustomEvent.sTaskName,
				nDuration : oCustomEvent.nDuration
			});
		}
	},
	_isAvailableEffect : function(){
		return this.isActivating(); 
	},
	_onActivate : function() {
		this._attachEvent();
	},
	_onDeactivate : function() {
		this._detachEvent();
	},
	_attachEvent : function() {
		this._htEvent = {};
		this._htEvent["end"] = jindo.$Fn(this._onTransitionEnd, this).bind();
		this._htEvent["stop"] = jindo.$Fn(this._onTransitionStop, this).bind();
		if(this._oTransition){
			this._oTransition.attach({
				"end" : this._htEvent["end"],
				"stop" : this._htEvent["stop"]
			});
		}
	},
	_detachEvent : function() {
		this._htEvent = null;
		if(this._oTransition){
			this._oTransition.detachAll();
		}
	},
	destroy: function() {
		this.deactivate();
		for(var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		this._htWElement = null;
	}
}).extend(jindo.UIComponent);
