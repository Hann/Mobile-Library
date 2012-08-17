if(typeof jindo.m == "undefined" && typeof Node != "undefined") {
    var ___Old__addEventListener___ = Node.prototype.addEventListener;
    Node.prototype.addEventListener = function(type, listener, useCapture){ 
            var callee = arguments.callee;
            if(callee && type === "click" && this.tagName === "A"){
                (this.___listeners___ || (this.___listeners___=[]) ).push({
                    listener : listener,
                    useCapture : useCapture
                });
            }   
            return ___Old__addEventListener___.apply(this, arguments);  
    };
    var ___Old__removeEventListener___ = Node.prototype.removeEventListener;
    Node.prototype.removeEventListener = function(type, listener, useCapture){ 
            var callee = arguments.callee;
            if(callee && type === "click" && this.tagName === "A"){
                if(this.___listeners___) {
                    this.___listeners___.pop();
                }
            }   
            return ___Old__removeEventListener___.apply(this, arguments);   
    };
}
jindo.m = (function() {
    var __M__ = jindo.$Class({
        $init : function() {
            this._initVar();
            this._initDeviceInfo();
            this._attachEvent();
        },
        _initVar : function() {
        	 this.MOVETYPE = {
                     0 : 'hScroll',
                     1 : 'vScroll',
                     2 : 'dScroll',
                     3 : 'tap',
                     4 : 'longTap',
                     5 : 'doubleTap',
                     6 : 'pinch',
                     7 : 'rotate',
                     8 : 'pinch-rotate'
              };
            this._isVertical = null;
            this._nPreWidth = -1;
            this._nRotateTimer = null;
            this._htHandler = {};
            this._htDeviceInfo = {};
        },
        _getOrientationChangeEvt : function(){
            var bEvtName = 'onorientationchange' in window ? 'orientationchange' : 'resize';    
            var htInfo = this.getDeviceInfo();
            if( (htInfo.android && htInfo.version === "2.1") || htInfo.galaxyTab2) {
                bEvtName = 'resize';
            }
            return bEvtName;
        },
        _getVertical : function() {
            var bVertical = null, 
                sEventType = this._getOrientationChangeEvt();
            if(sEventType === "resize") {
                var screenWidth = document.documentElement.clientWidth;
                if (screenWidth < this._nPreWidth) {
                    bVertical = true;
                } else if (screenWidth == this._nPreWidth) {
                    bVertical = this._isVertical;
                } else {
                    bVertical = false;
                }
                this._nPreWidth = screenWidth;
            } else {
                var windowOrientation = window.orientation;
                if (windowOrientation === 0 || windowOrientation == 180) {
                    bVertical = true;
                } else if (windowOrientation == 90 || windowOrientation == -90) {
                    bVertical = false;
                }
            }
            return bVertical;
        },
        _attachEvent : function() {
            this._rotateEvent = jindo.$Fn(this._onOrientationChange, this).attach(window, this._getOrientationChangeEvt()).attach(window, "load");      
            this._pageShowEvent = jindo.$Fn(this._onPageshow, this).attach(window, "pageshow");     
        },
        _initDeviceInfo : function() {
            var sName = navigator.userAgent;
            var ar = null;
            function f(s,h) {
                return ((h||"").indexOf(s) > -1); 
            }
            this._htDeviceInfo.iphone = f('iPhone', sName);
            this._htDeviceInfo.ipad = f('iPad', sName);
            this._htDeviceInfo.android = f('Android', sName);
            this._htDeviceInfo.galaxyTab = f('SHW-M180S', sName) || f('SHW-M180K', sName) || f('SHW-M180L', sName);
            this._htDeviceInfo.galaxyTab2 = f('SHW-M380S', sName) || f('SHW-M380K', sName);
            this._htDeviceInfo.galaxyK = f('SHW-M130K',sName);
            this._htDeviceInfo.galaxyU = f('SHW-M130L',sName);          
            this._htDeviceInfo.galaxyS = f('SHW-M110S',sName) ||  f('SHW-M110K',sName) ||  f('SHW-M110L',sName);
            this._htDeviceInfo.galaxyS2 = f('SHW-M250S',sName) || f('SHW-M250K',sName) || f('SHW-M250L',sName);
            this._htDeviceInfo.version = '';
            this._htDeviceInfo.bChrome = this._htDeviceInfo.android && (f('CrMo',sName) || f('Chrome', sName));
            this._htDeviceInfo.bInapp = false;
            if(this._htDeviceInfo.iphone || this._htDeviceInfo.ipad){
                ar = sName.match(/OS\s([\d|\_]+\s)/i);              
                if(ar !== null&& ar.length > 1){
                    this._htDeviceInfo.version = ar[1];         
                }       
            } else if(this._htDeviceInfo.android){
                ar = sName.match(/Android\s(\d\.\d)/i);
                if(ar !== null&& ar.length > 1){
                    this._htDeviceInfo.version = ar[1];
                }   
            }
            this._htDeviceInfo.version = this._htDeviceInfo.version.replace(/\_/g,'.');
            for(var x in this._htDeviceInfo){
                if (typeof this._htDeviceInfo[x] == "boolean" && this._htDeviceInfo[x] && this._htDeviceInfo.hasOwnProperty(x)) {
                    this._htDeviceInfo.name = x;
                }
            }
          //inapp여부 추가.true 일경우는 확실한 inapp이며,false - 웹브라우저 혹은 알수없는 경우    
        	if(this._htDeviceInfo.iphone || this._htDeviceInfo.ipad){        		
        		 if(!f('Safari', sName)){
        			 this._htDeviceInfo.bInapp = true;
        		 }
        	}else if(this._htDeviceInfo.android){
        		sName =sName.toLowerCase();
        		if( f('inapp', sName) || f('app', sName.replace('applewebkit',''))){
        			this._htDeviceInfo.bInapp = true;
        		}
        	}        
        },
        _onOrientationChange : function(we) {
            var self = this;
            if(we.type === "load") {
            	this._nPreWidth = document.documentElement.clientWidth;
                if(!this._htDeviceInfo.bInapp && ( this._htDeviceInfo.iphone || this._htDeviceInfo.ipad )) {    
                    this._isVertical = this._getVertical();
                } else {
                    if(this._nPreWidth > document.documentElement.clientHeight) {
                        this._isVertical = false;
                    } else {
                        this._isVertical = true;
                    }
                }
				return;
            }
            if (this._getOrientationChangeEvt() === "resize") { 
                setTimeout(function(){
                    self._orientationChange(we);
                }, 0);
            } else {    
                var nTime = 200;
                if(this.getDeviceInfo().android) {  
                    nTime = 500;                            
                }
                clearTimeout(this._nRotateTimer);
                    this._nRotateTimer = setTimeout(function() {
                        self._orientationChange(we);                        
                },nTime);
            }
        },
        _orientationChange : function(we) {
            var nPreVertical = this._isVertical;
            this._isVertical = this._getVertical();
            if (jindo.$Agent().navigator().mobile || jindo.$Agent().os().ipad) {
                if (nPreVertical !== this._isVertical) {
                    this.fireEvent("mobilerotate", {
                        isVertical: this._isVertical
                    });
                }
            } else {    
                this.fireEvent("mobilerotate", {
                    isVertical: this._isVertical
                });
            }
        },
        bindRotate : function(fHandlerToBind) {
            var aHandler = this._htHandler["mobilerotate"];
            if (typeof aHandler == 'undefined'){
                aHandler = this._htHandler["mobilerotate"] = [];
            }
            aHandler.push(fHandlerToBind);
            this.attach("mobilerotate", fHandlerToBind);
        },
        unbindRotate : function(fHandlerToUnbind) {
            var aHandler = this._htHandler["mobilerotate"];
            if (aHandler) {
                for (var i = 0, fHandler; (fHandler = aHandler[i]); i++) {
                    if (fHandler === fHandlerToUnbind) {
                        aHandler.splice(i, 1);
                        this.detach("mobilerotate", fHandlerToUnbind);
                        break;
                    }
                }
            }           
        },
        _onPageshow : function(we) {
            var self = this;
            setTimeout(function() {
                self.fireEvent("mobilePageshow", {
                }); 
            },300);
        },
        bindPageshow : function(fHandlerToBind) {
            var aHandler = this._htHandler["mobilePageshow"];
            if (typeof aHandler == 'undefined'){
                aHandler = this._htHandler["mobilePageshow"] = [];
            }
            aHandler.push(fHandlerToBind);
            this.attach("mobilePageshow", fHandlerToBind);
        },
        unbindPageshow : function(fHandlerToUnbind) {
            var aHandler = this._htHandler["mobilePageshow"];
            if (aHandler) {
                for (var i = 0, fHandler; (fHandler = aHandler[i]); i++) {
                    if (fHandler === fHandlerToUnbind) {
                        aHandler.splice(i, 1);
                        this.detach("mobilePageshow", fHandlerToUnbind);
                        break;
                    }
                }
            }           
        },      
        getDeviceInfo : function(){
            return this._htDeviceInfo;
        }, 
        isVertical : function() {
            return this._isVertical;
        },
        getNodeElement : function(el){
            while(el.nodeType != 1){
                el = el.parentNode;
            }
            return el;
        },
        getCssOffset : function(element){
            var htOffset;
           if(jindo.m.getDeviceInfo().android && parseInt(jindo.m.getDeviceInfo().version,10) === 3) {
               htOffset = jindo.m._getCssOffsetFromStyle(element);
           } else {
               if('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix()){
                  htOffset = jindo.m._getCssOffsetFromCSSMatrix(element);
               } else {
                  htOffset = jindo.m._getCssOffsetFromStyle(element); 
               } 
           }
           return htOffset;
        },
        _getCssOffsetFromStyle : function(element) {
            var nTop = nLeft = 0, 
            s = element.style[jindo.m.getCssPrefix() + "Transform"];
            if(!!s && s.length >0){
                aTemp = s.match(/translate.{0,2}\((.*)\)/);
                if(!!aTemp && aTemp.length >1){
                    var a = aTemp[1].split(',');
                    if(!!a && a.length >1){
                        nTop = parseInt(a[1],10);
                        nLeft = parseInt(a[0],10);
                    }
                }
            }
            return {
                top : nTop,
                left : nLeft
            };
        },
        _getCssOffsetFromCSSMatrix : function(element) {
            var curTransform  = new WebKitCSSMatrix(window.getComputedStyle(element).webkitTransform);
            return {
                top : curTransform.m42,
                left : curTransform.m41
             };
        },
        attachTransitionEnd : function(element,fHandlerToBind) {
            var nVersion = + jindo.$Jindo().version.replace(/[a-z.]/gi,"");
            if(nVersion >= 151) {   
                element._jindo_fn_ = jindo.$Fn(fHandlerToBind,this).attach(element, "transitionend");
            } else {
                element.addEventListener('webkitTransitionEnd', fHandlerToBind, false); 
            }
        },
        detachTransitionEnd : function(element, fHandlerToUnbind) {
            var nVersion = + jindo.$Jindo().version.replace(/[a-z.]/gi,"");
            if(nVersion >= 151) {   
                if(element._jindo_fn_) {
                    element._jindo_fn_.detach(element, "transitionend");
                    delete element._jindo_fn_;
                }
            } else {
                element.removeEventListener('webkitTransitionEnd', fHandlerToUnbind, false);    
            }
        },
        getCssPrefix : function() {
            var sCssPrefix = "";
            if(typeof document.body.style.MozTransition !== "undefined") {
                sCssPrefix = "Moz";
            } else if(typeof document.body.style.webkitTransition !== "undefined") {
                sCssPrefix = "webkit";
            } else if(typeof document.body.style.OTransition !== "undefined") {
                sCssPrefix = "O";
            }
            return sCssPrefix;
        },
	    getClosest : function(sSelector, elBaseElement) {
	        var elClosest;
	        var welBaseElement = jindo.$Element(elBaseElement);
	        var reg = /<\/?(?:h[1-5]|[a-z]+(?:\:[a-z]+)?)[^>]*>/ig;
	        if (reg.test(sSelector)) {
	             if("<" + elBaseElement.tagName.toUpperCase() + ">" == sSelector.toUpperCase()) {
	                 elClosest = elBaseElement;
	             } else {
	                 elClosest = welBaseElement.parent(function(v){
	                     if("<" + v.$value().tagName.toUpperCase() + ">" == sSelector.toUpperCase()) {
	                        return v;
	                    }
	                });
	                elClosest = elClosest.length ? elClosest[0].$value() : false; 
	             }
	        } else { 
	        	 if(sSelector.indexOf('.') == 0){sSelector = sSelector.substring(1,sSelector.length)}
	             if(welBaseElement.hasClass(sSelector)) {
	                elClosest = elBaseElement;
	             } else {
	                elClosest = welBaseElement.parent(function(v){
	                    if(v.hasClass(sSelector)) {
	                        return v;
	                    }
	                });
	                elClosest = elClosest.length ? elClosest[0].$value() : false; 
	            }
	        }
	        return elClosest;
	    },
        _getDefaultUseCss3d : function() {
            if(this._htDeviceInfo.iphone || this._htDeviceInfo.ipad || (this._htDeviceInfo.android && this._htDeviceInfo.bChrome) ) {
                return true;
            } else {
                return false;
            }
            return fasle;
        }
    }).extend(jindo.Component);
    return new __M__();
})();
