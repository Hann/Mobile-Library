if(typeof jindo.m.TimingFunction === 'undefined'){
	 jindo.m.TimingFunction ={};
}
jindo.m.TimingFunction._cubicBezier = function(x1, y1, x2, y2){
	return function(t){
		var cx = 3.0 * x1, 
	    	bx = 3.0 * (x2 - x1) - cx, 
	    	ax = 1.0 - cx - bx, 
	    	cy = 3.0 * y1, 
	    	by = 3.0 * (y2 - y1) - cy, 
	    	ay = 1.0 - cy - by;
	    function sampleCurveX(t) {
	    	return ((ax * t + bx) * t + cx) * t;
	    }
	    function sampleCurveY(t) {
	    	return ((ay * t + by) * t + cy) * t;
	    }
	    function sampleCurveDerivativeX(t) {
	    	return (3.0 * ax * t + 2.0 * bx) * t + cx;
	    }
	    function solveCurveX(x,epsilon) {
	    	var t0, t1, t2, x2, d2, i;
	    	for (t2 = x, i = 0; i<8; i++) {
	    		x2 = sampleCurveX(t2) - x; 
	    		if (Math.abs(x2) < epsilon) {
	    			return t2;
	    		} 
	    		d2 = sampleCurveDerivativeX(t2); 
	    		if(Math.abs(d2) < 1e-6) {
	    			break;
	    		} 
	    		t2 = t2 - x2 / d2;
	    	}
		    t0 = 0.0; 
		    t1 = 1.0; 
		    t2 = x; 
		    if (t2 < t0) {
		    	return t0;
		    } 
		    if (t2 > t1) {
		    	return t1;
		    }
		    while (t0 < t1) {
		    	x2 = sampleCurveX(t2); 
		    	if (Math.abs(x2 - x) < epsilon) {
		    		return t2;
		    	} 
		    	if (x > x2) {
		    		t0 = t2;
		    	} else {
		    		t1 = t2;
		    	} 
		    	t2 = (t1 - t0) * 0.5 + t0;
		    }
	    	return t2; 
	    }
	    return sampleCurveY(solveCurveX(t, 1 / 200));
	};
};
jindo.m.TimingFunction.linear =  jindo.m.TimingFunction._cubicBezier(0.0,0.0,1.0,1.0);
jindo.m.TimingFunction.ease_out =  jindo.m.TimingFunction._cubicBezier(0.0,0.0,0.58,1.0);
jindo.m.TimingFunction.ease_in =  jindo.m.TimingFunction._cubicBezier(0.42,0.0,1.0,1.0);
jindo.m.TimingFunction.ease_in_out =  jindo.m.TimingFunction._cubicBezier(0.42,0.0,0.58,1.0);
jindo.m.TimingFunction.ease_out_in =  jindo.m.TimingFunction._cubicBezier(0.00,0.42,1.0,0.58);
jindo.m.TimingFunction.cubicBezier =  function(x1, y1, x2, y2){
	return  jindo.m.TimingFunction._cubicBezier(x1, y1, x2, y2);
};
jindo.m.Transition = jindo.$Class({
	_aTaskQueue : null,
	$init : function(htUserOption) {
		this.option({
			sTransitionTimingFunction : 'ease-in-out',
			bUseCss3d : jindo.m._getDefaultUseCss3d()
		});
		this.option(htUserOption || {});
		this._initVar();
		this._attachEvent();
	},
	_initVar: function() {
		this._aTaskQueue = [];
		this._bIsPlaying = false;
		this._sCssPrefix = jindo.m.getCssPrefix();
		this._aBeforeStatus = []; 
		if(this._sCssPrefix.length > 0){
			this._sCssPrefix = '-' + this._sCssPrefix.toLowerCase()+'-';
		}	
		this._bNoUseCss3d = !this.option('bUseCss3d');
		this._nTimerAnimate = null;		
		this._htCurrentTask = null;
	},
	start : function(){
		if((!this.isPlaying()) && this.isExistTask()){
			this._prepareTask();	
		}
	},
	isPlaying : function(){
		return this._bIsPlaying;
	},
	isExistTask : function(){
		if(!this._aTaskQueue){
			return false;
		}
		var nLen = this._aTaskQueue.length;		
		bValue = (nLen > 0)? true : false;
		return bValue;
	},
	queue : function(elTarget, nDuration, aCommand){		
		var htTask = {
			sType : 'style',
			sTaskName : '',
			elTarget : elTarget,
			nDuration : nDuration 
		};
		htTask.htDefault = {};
		htTask.htStyle = aCommand.htStyle || {}; 
		htTask.htTransform = aCommand.htTransform || {};
		htTask.sTaskName = aCommand.sTaskName || null;
		htTask.fCallback =  aCommand.fCallback;	 
		htTask.htDefault['transition-timing-function'] = (typeof htTask.htTransform['transition-timing-function'] === 'undefined')? this._getDefaultTransition().sTransitionTimingFunction : htTask.htTransform['transition-timing-function']; 
		htTask.htDefault['transition-property'] = (typeof htTask.htTransform['transition-property'] === 'undefined')? "all" : htTask.htTransform['transition-property']; 
		htTask.htDefault['transition-duration']  = nDuration+"ms";
		this._pushTask(htTask);
		return this;
	},
	stop : function(bAfter){
		if(!this.isPlaying()){
			return;
		}
		if(typeof bAfter === 'undefined'){
			bAfter = true;
		}
		if(!this._fireCustomEvent('stop', {
			element : this._htCurrentTask.elTarget,
			sTaskName : this._htCurrentTask.sTaskName,
			nDuration : this._htCurrentTask.nDuration
		})){
			return;
		}
		this._stopTransition(bAfter);		
	},
	clear : function(bStopAfter){
		this.stop(bStopAfter);
		this._aTaskQueue = [];
	},	
	_resume : function(){
		if(this._htCurrentTask){
			this._doTask();
		}
	},
	_stopTransition : function(bAfter){	
		this._detachTransitionEnd();
		this._elCurrent.style[this._sCssPrefix+'transition-property'] = 'none';
		this._initTransition();
		if(!bAfter){
			var nIndex = this._getBeforeStatusElement(this._elCurrent);
			if(nIndex > -1){				
				jindo.$Element(this._elCurrent).attr('style', this._aBeforeStatus[nIndex].style);
			}
		}
		this._htCurrentTask = null;
		this._bIsPlaying = false;		
	},
	_prepareTask : function(){
		var htTask = this._popTask();
		if(htTask === null || !htTask){
			this._bIsPlaying = false;
			return; 
		}
		this._htCurrentTask = htTask;
		this._resume();
	},
	_pushTask : function(htTask){
		this._aTaskQueue.push(htTask);		
	},
	_popTask : function(){
		if(!this.isExistTask()){
			return null;
		}
		var htTask = this._aTaskQueue.shift();
		if(htTask){
			return htTask;			
		}else{
			return null;
		}
	},
	_doTask : function(){
		//console.log('//// doTask ' +this._htCurrentTask.sTaskName);
		if(this._htCurrentTask){
			this._bIsPlaying = true;
			if(!this._fireCustomEvent('start', {
				element : this._htCurrentTask.elTarget,
				sTaskName : this._htCurrentTask.sTaskName,
				nDuration : this._htCurrentTask.nDuration
			})){
				return;
			}
			var el = this._htCurrentTask.elTarget;
			var wel = jindo.$Element(el);
			this._elCurrent = el;
			this._setBeforeStatus(wel);
			var nDuration = this._htCurrentTask.nDuration;
			var bAttachEvt = this._bAttachTransitionEvt();
			if(bAttachEvt){
				this._attachTransitionEnd(el);
			}
			this._setDefaultTransition(wel,bAttachEvt);
			var bDiff = false;
			bDiff = this._setTransform(wel);
			bDiff = this._setStyle(wel, this._htCurrentTask.htStyle) || bDiff;
			if(nDuration === 0){
				this._onTransitionEnd();
			}else {
				if(!bDiff){
					var self = this;
					setTimeout(function(){
						self._onTransitionEnd();
					}, nDuration);
				}
			}			
		}
	},
	_setDefaultTransition : function(wel, bAttachEvt){
		for(var p in this._htCurrentTask.htDefault){			
			var sValue = this._htCurrentTask.htDefault[p];
			if(!(p.indexOf('duration') > -1 && !bAttachEvt)){
				wel.$value().style[this._sCssPrefix+p] = sValue;
			}
		}
	},
	_setStyle : function(wel, htOption){
		var bDiff = false;
		for(var p in htOption){
			var sCurrent = wel.css(p);
			if(sCurrent != htOption[p]){
				bDiff = true;
			}
			wel.css(p, htOption[p]);
		}	
		return bDiff;
	},
	_setStyleForAndroid : function(){
	},	
	_setTransform : function(wel){
		var bDiff = false;
		if(this._bNoUseCss3d){ 
			bDiff = this._setTransformForAnrdoid(wel);
		}else{
			bDiff = this._setTransformForIos(wel);
		}
		return bDiff;
	},
	_setTransformForIos : function(wel){
		var bDiff = false;
		for (var p in this._htCurrentTask.htTransform){
			var sValue = this._htCurrentTask.htTransform[p];	
			wel.$value().style[this._sCssPrefix+p] = sValue;
			bDiff = true;
		}
		return bDiff;
	},
	_setTransformForAnrdoid : function(wel){
		var bDiff = false;
		var el = wel.$value();
		//console.log('//', this._htCurrentTask.htTransform);
		for (var p in this._htCurrentTask.htTransform){
			var sValue = this._htCurrentTask.htTransform[p];
			if(sValue.indexOf('translate') > -1){				
				var nDuration = this._htCurrentTask.nDuration;
				console.log(123);
				var reg = new RegExp(/(translate.*)\((.*)\)/);
				var aMatch = sValue.match(reg);
				var sPreValue = aMatch[1];
				var aTemp = aMatch[2].replace(/px/g,'').split(',');
				var sTransfrom = "transform";
				var htBeforeOffset = jindo.m.getCssOffset(el);
				var startTime = Date.now();
				var self = this;
				(function translate(){
					var now = Date.now();
					if(now >= (startTime + nDuration) ){
						clearTimeout(self._nTimerAnimate);
						el.style[self._sCssPrefix+sTransfrom] = sValue;
						self._onTransitionEnd();
						return;
					}						
					var nGap = (now - startTime);
					var nX = ((sPreValue.indexOf('X')> -1) || (aTemp.length >1))? aTemp[0] : null;
					var nY = null;
					if(sPreValue.indexOf('Y')> -1){
						nY = aTemp[0];
					}else if(aTemp.length > 1){
						nY = aTemp[1];
					}
					var nZ = null;
					if(sPreValue.indexOf('Z')> -1){
						nZ = aTemp[0];
					}else if(aTemp.length > 2){
						nZ = aTemp[2];
					}
					var aText =[];
					var sX = (nX !== null)? self._getcubicBeziserPosition(htBeforeOffset.left, nX, nDuration, nGap)+"px" : null;
					var sY = (nY !== null)? self._getcubicBeziserPosition(htBeforeOffset.top, nY, nDuration, nGap)+"px" : null;
					var sZ = (nZ !== null)? nZ+"px" : null;
					if(sX !== null) {aText.push(sX);}
					if(sY !== null) {aText.push(sY);}
					if(sZ !== null) {aText.push(sZ);}
					el.style[self._sCssPrefix+sTransfrom] = sPreValue+"("+aText.join(",")+")";
					self._nTimerAnimate = setTimeout(translate, 1);	
				})();		
			}else{
				wel.$value().style[this._sCssPrefix+p] = sValue;
			}
			bDiff = true;
		}
		return bDiff;
	},
	_bAttachTransitionEvt : function(){
		var bValue = true;
		if(this._htCurrentTask.nDuration === 0) {
			bValue = false;
		}else{
			if(this._bNoUseCss3d){
				for (var p in this._htCurrentTask.htTransform){
					var sValue = this._htCurrentTask.htTransform[p];
					if(sValue.indexOf('translate') > -1){
						bValue = false;
					}
				}
			}			
		}
		return bValue;
	},
	_setBeforeStatus : function(wel){		
		var nIndex = this._getBeforeStatusElement(wel.$value());
		if(nIndex > -1){
			this._aBeforeStatus[nIndex].style = wel.attr('style');			
		}else{
			this._aBeforeStatus.push({
				el : wel.$value(),
				style : wel.attr('style')
			});
		}
	},
	_getBeforeStatusElement : function(el){
		var nIndex = -1;
		for(var i=0,nLen = this._aBeforeStatus.length; i<nLen; i++){
			if(this._aBeforeStatus[i].el === el){
				nIndex = i;
				break;
			}
		}
		return nIndex;
	},
	_getDefaultTransition : function(){
		return {
			sTransitionTimingFunction : this.option('sTransitionTimingFunction'),
			TransitionProperty : 'all'
		};
	},
	_fireCustomEvent : function(sName, htParam){
		return this.fireEvent(sName,htParam);
	},
	_onTransitionEnd : function(){
		this._detachTransitionEnd();
		this._initTransition();
		var self = this;
		if(this._htCurrentTask){
			var sCallbackType = typeof this._htCurrentTask.fCallback;
			if(sCallbackType == 'function'){				
				if(this._bNoUseCss3d){
					setTimeout(function(){
						self._htCurrentTask.fCallback();
					},5);
				}else{
					self._htCurrentTask.fCallback();
				}
			}else if(sCallbackType == 'object'){
				var wel = jindo.$Element(this._htCurrentTask.elTarget), p;
				for (p in this._htCurrentTask.fCallback.htTransform){
					var sValue = this._htCurrentTask.fCallback.htTransform[p];
					if(p == 'transform'){
						var sPrefix = this._sCssPrefix+p;
						var sText = wel.$value().style[sPrefix];					
						if(sText.length > 0){							
							sValue = sValue;							
						}				
					}				
					wel.$value().style[this._sCssPrefix+p] = sValue;
			    }
				for (p in this._htCurrentTask.fCallback.htStyle) {
					wel.css(p, this._htCurrentTask.fCallback.htStyle[p]);
			    }
			}
		}
		if(this._htCurrentTask){
			this._fireCustomEvent('end',{
				element : this._htCurrentTask.elTarget,
				sTaskName : this._htCurrentTask.sTaskName,
				nDuration : this._htCurrentTask.nDuration
			});
		}
		setTimeout(function(){
			self._prepareTask();
		},10);
	},
	_initTransition : function(el){
		if(typeof el === 'undefined'){
			el = this._elCurrent;
		}
		el.style[this._sCssPrefix +'transition-duration'] = null;
		el.style[this._sCssPrefix +'transition-timing-function'] = null;
		el.style[this._sCssPrefix + 'perspective'] = null;
		el.style[this._sCssPrefix + 'transform-style']  = null;
		el.style[this._sCssPrefix +'transition-property'] = null;
	},
	_getcubicBeziserPosition : function(nStart, nEnd, nDuration, nCurrentTime){
		nStart = nStart*1;
		nEnd = nEnd*1;
		var sFunction = this.option('sTransitionTimingFunction').replace(/-/g,'_');
		var f  = jindo.m.TimingFunction[sFunction];
		var t = nCurrentTime/nDuration;
		t = (t>1)? 1: t;
		var nCurrent = f(t);
		var nValue = nStart+ ((nEnd-nStart)* nCurrent.toFixed(2));
		return 	nValue;
	},
	_attachTransitionEnd : function(el){
		this._elTransition = el;
		jindo.m.attachTransitionEnd(this._elTransition, this._htEvent['transitionEnd']);		
	}, 
	_detachTransitionEnd : function(){
		if(this._elTransition){
			jindo.m.detachTransitionEnd(this._elTransition, this._htEvent['transitionEnd']);
			this._elTransition = null;
		}
	},
	_attachEvent : function() {
		this._htEvent = {};
		this._htEvent['transitionEnd'] = jindo.$Fn(this._onTransitionEnd, this).bind();	
	},
	_detachEvent : function() {
		this._detachTransitionEnd();
		this._htEvent = null;
	},
	destroy: function() {
		this._detachEvent();
		for(var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		this._htWElement = null;
		this._aTaskQueue = null;
		this._bIsPlaying = null;
		this._sCssPrefix = null;		
		this._aBeforeStatus = null;
		this._bNoUseCss3d = null;
		this._nTimerAnimate = null;
		this._htCurrentTask = null;
	}
}).extend(jindo.Component);
