jindo.m.Datepicker = jindo.$Class({
    $init : function(el, htUserOption) {        
        this.option({
            sClassPrefix : "calendar-",         
            sFormat : "yyyy-mm-dd",
            sTitleFormat : "yyyy.mm", 
            aMonthTitle : ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"], 
            bUseEffect :false, 
            nEffectDuration : 200,          
            bActivateOnload : true,
            bAutoHide : false
        });     
        this.option(htUserOption || {});
        this._initVar();
        this._setWrapperElement(el);
        this._initCalendar();
        if(this.option("bActivateOnload")) {
            this.activate();
        }
    },
    $static : {
        INDEX_ATTR : "data-datepickerid"
    },
    _initVar : function() {
        var htDeviceInfo = jindo.m.getDeviceInfo();
        this._oCalendar = null;
        this._htDatePickerSet = {};
        this._htSelectedDatePickerSet = null;
        this._bActivate = false; 
        this._bMove = false;
        this._bCalendarVisible = false;
        this._sClickEvent = (htDeviceInfo.iphone || htDeviceInfo.ipad || htDeviceInfo.android) && !htDeviceInfo.bChrome ? "touchend" : "click";
        this._aDayInfo = [];
    },  
    _setWrapperElement : function(el) {     
        var sClassPrefix = this.option("sClassPrefix"),
            aTh, elCloseBtn;
        if(!el){
            this._welCalendarBase = this._insertCalendarTemplate();
        } else {
            el = (typeof el == "string" ? jindo.$(el) : el);            
            this._welCalendarBase = jindo.$Element(el);
        }       
        aTh = this._welCalendarBase.queryAll("th");
        for(var i=0, nLength=aTh.length; i<nLength; i++) {
          this._aDayInfo.push(jindo.$Element(aTh[i]).text());
        }
        this._welCalendarBase.css("position","absolute");
        this._welCalendarBase.hide();
        elCloseBtn = this._welCalendarBase.query("."+ sClassPrefix + "btn-close");
        this._welCloseBtn = (elCloseBtn) ? jindo.$Element(elCloseBtn) : null;
    },
    _insertCalendarTemplate : function(){
        var aHtml = [],
          sClassPrefix = this.option("sClassPrefix");
        aHtml.push('<div>');
        aHtml.push('<a href="javascript:void(0)" class="' + sClassPrefix + 'btn ' + sClassPrefix + 'btn-prev-year">&lt;&lt;</a>');
        aHtml.push('<a href="javascript:void(0)" class="' + sClassPrefix + 'btn ' + sClassPrefix + 'btn-prev-mon">&lt;</a>');
        aHtml.push('<strong class="' + sClassPrefix + 'title"></strong>');
        aHtml.push('<a href="javascript:void(0)" class="' + sClassPrefix + 'btn ' + sClassPrefix + 'btn-next-mon">&gt;</a>');
        aHtml.push('<a href="javascript:void(0)" class="' + sClassPrefix + 'btn ' + sClassPrefix + 'btn-next-year">&gt;&gt;</a>');
        aHtml.push('</div><table cellspacing="0" cellpadding="0" style="');
        aHtml.push('-' + jindo.m.getCssPrefix() + '-tap-highlight-color:rgba(0,0,0,0);"><thead><tr>');
        aHtml.push('<th class="' + sClassPrefix + 'sun">일</th><th>월</th><th>화</th><th>수</th><th>목</th><th>금</th><th class="sat">토</th>');
        aHtml.push('</tr></thead><tbody>');
        aHtml.push('<tr class="' + sClassPrefix + 'week">');
        aHtml.push('<td><a href="javascript:void(0)" class="' + sClassPrefix + 'date"></a></td>');
        aHtml.push('<td><a href="javascript:void(0)" class="' + sClassPrefix + 'date"></a></td>');
        aHtml.push('<td><a href="javascript:void(0)" class="' + sClassPrefix + 'date"></a></td>');
        aHtml.push('<td><a href="javascript:void(0)" class="' + sClassPrefix + 'date"></a></td>');
        aHtml.push('<td><a href="javascript:void(0)" class="' + sClassPrefix + 'date"></a></td>');
        aHtml.push('<td><a href="javascript:void(0)" class="' + sClassPrefix + 'date"></a></td>');
        aHtml.push('<td><a href="javascript:void(0)" class="' + sClassPrefix + 'date"></a></td>');
        aHtml.push('</tr></tbody></table>');
        aHtml.push('<div class="' + sClassPrefix + 'bottom"><a href="javascript:void(0)" class="' + sClassPrefix + 'btn ' + sClassPrefix + 'btn-close">닫기</a></div>');
        document.body.appendChild(jindo.$('<div id="jmc_calt" class="' + sClassPrefix + 'base" style="position:absolute"></div>'));
        var welCalendar = jindo.$Element("jmc_calt").hide();        
        welCalendar.html(aHtml.join(""));
        return welCalendar;
    },
    _initCalendar : function(){
        var self = this,
            oDate = new Date(),
            htToday = {nYear:oDate.getFullYear() , nMonth:oDate.getMonth() + 1 , nDate: oDate.getDate()},
            htCalendarOption = {
                sClassPrefix : this.option("sClassPrefix"),
                nYear : htToday.nYear,
                nMonth : htToday.nMonth,
                nDate : htToday.nDate,          
                sTitleFormat : this.option("sTitleFormat"), 
                aMonthTitle : this.option("aMonthTitle")                
            };
        this._oCalendar = new jindo.Calendar(this._welCalendarBase.$value(), htCalendarOption).attach({
            beforeDraw : function(oCustomEvent) {               
                var oMoveDate, oOldDate = this.getShownDate();
                oOldDate = {nYear : oOldDate.nYear, nMonth : oOldDate.nMonth};
                oMoveDate = {nYear : oCustomEvent.nYear, nMonth : oCustomEvent.nMonth};
                this._htOldDate = oOldDate;
                this._htMoveDate = oMoveDate;
                oCustomEvent.oOldDate = oOldDate;
                oCustomEvent.oMoveDate = oMoveDate;
                if(!self.fireEvent("beforeDraw", oCustomEvent)) {
                    oCustomEvent.stop();
                }
                if((oOldDate.nYear != oMoveDate.nYear || 
                        oOldDate.nMonth != oMoveDate.nMonth)){
                    if(!self.fireEvent("beforeMoveDate", oCustomEvent)) {
                        oCustomEvent.stop();
                    }
                }
            },
            draw : function(oCustomEvent) {
                if(!self.fireEvent("draw", oCustomEvent)) {
                    oCustomEvent.stop();
                }
            },
            afterDraw : function(oCustomEvent) {
                self._drawCalendarSelectDate(oCustomEvent.nYear, oCustomEvent.nMonth);
                if(self._bCalendarVisible){
                    self._fPosition();
                }
                oCustomEvent.oOldDate = this._htOldDate;
                oCustomEvent.oMoveDate = this._htMoveDate;
                self.fireEvent("afterDraw", oCustomEvent);
                if((this._htOldDate.nYear != this._htMoveDate.nYear || 
                        this._htOldDate.nMonth != this._htMoveDate.nMonth)){
                    if(!self.fireEvent("moveDate", oCustomEvent)) {
                        oCustomEvent.stop();
                    }
                }
            }
        });     
    },
   _drawCalendarSelectDate : function(nYear, nMonth){
        if(!this._oCalendar) {
            return;
        }
        var sClassPrefix = this.option("sClassPrefix"),
            aCells = this._welCalendarBase.queryAll("."+ sClassPrefix + "date"),
            htToday = this._oCalendar.getToday(),
            elDateCell;
        if(htToday.nYear != nYear || htToday.nMonth != nMonth) {
            var elToday = this._welCalendarBase.query("."+ sClassPrefix + "today");
            if(elToday) {
                jindo.$Element(elToday).removeClass(sClassPrefix + "today");    
            }
        }
        for (var i = 0, nLength = aCells.length; i<nLength; i++) {
            elDateCell = this._getDateCellElement(aCells[i]);
            if(!elDateCell) {
                continue;
            }
            htDate = this._oCalendar.getDateOfElement(elDateCell);
            if( (nYear === htDate.nYear && nMonth === htDate.nMonth) &&
                jindo.Calendar.isSameDate(htDate, this._htSelectedDatePickerSet)) {
                jindo.$Element(elDateCell)
                    .removeClass(sClassPrefix + "today")
                    .addClass(sClassPrefix + "selected");
            }
        }
    },  
    _isSelectable : function(htDatePickerOption, htDate) {      
        var bIsSelected =  jindo.Calendar.isBetween(htDate, htDatePickerOption["htSelectableDateFrom"], htDatePickerOption["htSelectableDateTo"]);
        return bIsSelected;
    },
    addDatePickerSet : function(elInput, htOption) {
         if (typeof elInput == "undefined") {
            return this;
        }       
        var sDatePikerSetId = "DATEPICKER_" + (new Date()).getTime() +"_" + Math.floor((Math.random() * 100)),
            welInput,
            htCalendarOption = this._oCalendar.option(),
                htDefaultOption = {
                    nYear : htCalendarOption.nYear,
                    nMonth : htCalendarOption.nMonth,
                    nDate : htCalendarOption.nDate,
                    htSelectableDateFrom : { 
                        nYear : 1900,
                        nMonth : 1,
                        nDate : 1               
                    },
                    htSelectableDateTo : { 
                        nYear : 2100,
                        nMonth : 12,
                        nDate : 31
                    },
                    sPosition: "bottomLeft",
                    zIndex: 50
                };
        if (typeof htOption != "undefined") {
            for (var value in htOption) {
                if (typeof htDefaultOption[value] != "undefined") {
                    htDefaultOption[value] = htOption[value]; 
                }
            }
        }   
        htOption = htDefaultOption;
        welInput = jindo.$Element(elInput);
        welInput.replace("<span style='position:relative;display:inline-block;'>" + welInput.toString() + "</span>");
        welInput = jindo.$Element(elInput);
        welInput.attr("readOnly",true)
            .attr(jindo.m.Datepicker.INDEX_ATTR, sDatePikerSetId);
        htOption.wfFocusFunc = jindo.$Fn(this._onFocus,this).attach(elInput,"focus");
        htOption.elInput = welInput.$value();
        this._htDatePickerSet[sDatePikerSetId] = htOption;
        return this;    
    },
    removeDatePickerSet : function(elInput) {
        var welInput = jindo.$Element(elInput),
            sDatePikerSetId = welInput.attr(jindo.m.Datepicker.INDEX_ATTR),
            htDatePickerSet = this._htDatePickerSet[sDatePikerSetId];
        htDatePickerSet.wfFocusFunc.detach(welInput.$value(),"focus");
        if (htDatePickerSet == this._htSelectedDatePickerSet) {
            this._htSelectedDatePickerSet = null;
        }       
        delete this._htDatePickerSet[sDatePikerSetId];      
        return this;
    },
    _onActivate : function() {
        this._attachEvent();
        this._bActivate = true;
    },
    _onDeactivate : function() {
        if(this._bCalendarVisible){
            this.hide();
        }
        this._detachEvent();        
        this._bActivate = false;        
    },
    _attachEvent : function() {
        this._htEvent = {}; 
        this._htEvent["document_" + this._sClickEvent] = {
                el  : document,
                ref : jindo.$Fn(this._onDocumentClick, this).attach( document, this._sClickEvent)
        };      
        this._htEvent["document_touchmove"] = {
                el  : document,
                ref : jindo.$Fn(this._onDocumentScroll, this).attach( document, "touchmove")
        };      
        this._htEvent["date_click"] = {
                el  : this._welCalendarBase.$value(),
                ref : jindo.$Fn(this._onClickDate, this).attach( this._welCalendarBase.$value(), this._sClickEvent)
        };
        if(this._welCloseBtn){
            this._htEvent["close_click"] = {
                    el  : this._welCloseBtn.$value(),
                    ref : jindo.$Fn(this._onClickCloseCalendar, this).attach( this._welCloseBtn.$value(), "click")
            };
        }
    },
    _detachEvent : function(){      
        for(var p in this._htEvent) {           
            var ht = this._htEvent[p];          
            ht.ref.detach(ht.el, p.substring(p.lastIndexOf("_")+1));
        }
        this._htEvent = null;
    },
    _onFocus : function(we){
        if(!this._bActivate){
            return false;
        }
        var elInput = we.element;       
        this.show(elInput);
    },
    _onDocumentClick : function(we){        
        var elElment = we.element;
        var welElment = jindo.$Element(elElment);
        var oCalendar = jindo.m.Datepicker.oCalendarInstance;
        var sDatepickerId = this._welCalendarBase.attr(jindo.m.Datepicker.INDEX_ATTR);
        var elInput = (sDatepickerId) ? this._htDatePickerSet[sDatepickerId].elInput : null;
        if(this._bMove){
            this._bMove = false;
            return;
        }
        if(this.option("bAutoHide") && this._bCalendarVisible &&
            this._welCalendarBase.$value() != elElment &&
            !this._welCalendarBase.isParentOf(welElment) &&
            elInput != elElment){
            this.hide();
            elInput.blur();
        } 
        this._bMove = false;
        return true;
    },
    _onDocumentScroll : function(we){
        this._bMove = true;     
    },
    _onClickDate : function(we){
        we.stopDefault();
        if(this._bMove){
            return false;
        }
        var sClassPrefix =  this.option("sClassPrefix");
        var elTargetElement = jindo.m.getNodeElement(we.element);
        var sDatepickerId = this._welCalendarBase.attr(jindo.m.Datepicker.INDEX_ATTR);
        var elInput = this._htDatePickerSet[sDatepickerId].elInput;             
        var elDate = this._getDateCellElement(elTargetElement); 
        if(elDate){
            var welDate = jindo.$Element(elDate);
            if(welDate.hasClass(sClassPrefix + "next-mon") ||
                welDate.hasClass(sClassPrefix + "prev-mon")){
                return false;
            }
            var htDate = this._oCalendar.getDateOfElement(elDate);              
            if (this._isSelectable(this._htSelectedDatePickerSet, htDate)) {
                this.setDate(elInput, htDate);
                elInput.blur();
                this.fireEvent("selectDate", {
                    oSelectDate : htDate,
                    oCalendar : this._oCalendar
                });
                this.hide();
            }
        }       
        return false;
    },
    _getDateCellElement : function(elElement){
        var welElement = jindo.$Element(elElement),
            sClassPrefix =  this.option("sClassPrefix"),
            elDateCell, welWeek, 
            welDate = (welElement.hasClass(sClassPrefix + "date")) ? welElement : jindo.$$.getSingle("."+ sClassPrefix + "date", welElement.$value());
        if (welDate) {  
            welDate = jindo.$Element(welDate);
            welWeek = jindo.m.getClosest(sClassPrefix + "week", welDate);          
            if (welWeek) {  
                welWeek = jindo.$Element(welWeek);
                elDateCell = welDate.$value();
                while(!jindo.$Element(elDateCell.parentNode).hasClass(sClassPrefix + "week")) {
                    elDateCell = elDateCell.parentNode;
                }
                if (jindo.$Element(elDateCell).hasClass(sClassPrefix + "unselectable")) {
                    elDateCell = null;
                }
            }
        }
        return elDateCell;
    },  
    _onClickCloseCalendar : function(we){
        we.stop(jindo.$Event.CANCEL_ALL);
        this.hide();
        return false;
    },  
    _displayEffect : function(sType, wfPosition){       
        this._sEffectDirection = sType;     
        var elBase = this._welCalendarBase.$value();
        var sCssFix = jindo.m.getCssPrefix();
        var sEvent =  (sCssFix == "webkit") ? "webkitTransitionEnd" : "transitionend";
        var sDuration = this.option("nEffectDuration")+"ms";
        this._welCalendarBase.show();
        elBase.style.opacity = (sType == "fade-in") ? 0 : 1;
        if(wfPosition){ wfPosition();}
        this._fnTransitionEnd = jindo.$Fn(this._TransitionEnd, this).bind();
        elBase.addEventListener(sEvent, this._fnTransitionEnd, false);
        setTimeout(function(){
            elBase.style.webkitTransitionDuration = sDuration;
            elBase.style.webkitTransitionProperty = "all";
            elBase.style.webkitTransitionTimingFunction = "ease-in-out";            
            if(sType == "fade-in"){
                elBase.style.opacity = 1;
            } else if(sType == "fade-out"){
                elBase.style.opacity = 0;
            }
        },10);
    },
    _TransitionEnd : function(evt){     
        var elBase = evt.currentTarget;
        var sCssFix = jindo.m.getCssPrefix();
        var sEvent =  (sCssFix == "webkit") ? "webkitTransitionEnd" : "transitionend";
        var htDatePickerSet = this._htSelectedDatePickerSet;
        elBase.style.webkitTransitionDuration = null;
        elBase.style.webkitTransitionProperty = null;
        elBase.style.webkitTransitionTimingFunction = null;
        elBase.removeEventListener(sEvent, this._fnTransitionEnd, false);
        this._fnTransitionEnd = null;
        if(this._sEffectDirection == "fade-in"){
            this._bCalendarVisible = true;          
            this.fireEvent("showCalendar",{
                oDrawDate  : {"nYear" : htDatePickerSet.nYear, 
                    "nMonth" : htDatePickerSet.nMonth, 
                    "nDate" : htDatePickerSet.nDate},
                oCalendar : this._oCalendar
            }); 
        } else if(this._sEffectDirection == "fade-out"){
            this._bCalendarVisible = false;
            elBase.style.zIndex = 0;
            elBase.style.display = "none";          
            var bHide = this.fireEvent("hideCalendar", {
                oSelectDate  : {"nYear" : htDatePickerSet.nYear, 
                    "nMonth" : htDatePickerSet.nMonth, 
                    "nDate" : htDatePickerSet.nDate},
                oCalendar : this._oCalendar
            });         
        }        
    },
    _formatDate : function(htDate){
        var oDate = new Date(htDate.nYear, htDate.nMonth-1, htDate.nDate),
           sDay = this._aDayInfo[oDate.getDay()],
          sDateStr = this.option("sFormat").replace(/(yyyy|yy|mm|dd|day)/gi,
            function($1){
                switch ($1){
                    case 'yyyy': return oDate.getFullYear();
                    case 'yy': return oDate.getFullYear().toString().substr(2);
                    case 'mm':   
                        var sMonth = (oDate.getMonth()+1) + "";
                        sMonth = sMonth.length === 1 ? '0' + sMonth : sMonth;
                        return sMonth;
                    case 'dd':   
                        var sDate = oDate.getDate() + "";
                        sDate = sDate.length === 1 ? '0' + sDate : sDate;
                        return sDate;
                    case 'day' : return sDay; 
                }
            } 
        );
        return sDateStr;
    },
    setPosition : function(elInput, sPosition){     
        var sDatepickerId = elInput.getAttribute(jindo.m.Datepicker.INDEX_ATTR);
        this._htDatePickerSet[sDatepickerId].sPosition = sPosition;
        if(this._isCurrentDatePicker(elInput) && this._bCalendarVisible){
            this._fPosition = jindo.$Fn(function(){             
                this._setCalendarPosition(elInput, sPosition);
            },this).bind();
            this._setCalendarPosition(elInput, sPosition);
        }
    },  
    _setCalendarPosition : function(elInput, sPosition){
        var welInput = jindo.$Element(elInput);
        var welCalendarBase = this._welCalendarBase;
        var nCalendarHeight = welCalendarBase.height();
        var nCalendarWidth = welCalendarBase.width();
        var nInputHeight = welInput.height();
        var nInputWidth = welInput.width();     
        var htCss = {};
        var elCalendarBase = welCalendarBase.$value();
        elCalendarBase.style.left = null;
        elCalendarBase.style.right = null;
        elCalendarBase.style.top = null;
        switch (sPosition) {
        case "leftTop":
            htCss.top = "0px";
            htCss.left = "-" + nCalendarWidth + "px";           
            break;
        case "leftBottom":
            htCss.top = "-" + (nCalendarHeight - nInputHeight) + "px";
            htCss.left = "-" + nCalendarWidth + "px";
            break;
        case "rightTop":
            htCss.top = "0px";
            htCss.left = nInputWidth + "px";
            break;
        case "rightBottom":
            htCss.top = "-" + (nCalendarHeight - nInputHeight) + "px";
            htCss.left = nInputWidth + "px";
            break;
        case "bottomLeft":
            htCss.top = nInputHeight + "px";
            htCss.left = "0px";
            break;
        case "bottomRight":
            htCss.top = nInputHeight + "px";
            htCss.right = "0px";
            break;
        case "topLeft":
            htCss.top = "-" + nCalendarHeight + "px";
            htCss.left = "0px";
            break;
        case "topRight":
            htCss.top = "-" + nCalendarHeight + "px";
            htCss.right = "0px";
            break;
        }
        welCalendarBase.css(htCss);
    },  
    setDate : function(elInput, htDate){
        var sDatepickerId = (elInput) ? elInput.getAttribute(jindo.m.Datepicker.INDEX_ATTR) : null;
        var htDatePickerSet = this._htDatePickerSet[sDatepickerId];
        if(!sDatepickerId || !this._bActivate || !this._isSelectable(htDatePickerSet, htDate)){
            return false;
        }       
        elInput.value = this._formatDate(htDate);     
        htDatePickerSet.nYear = htDate.nYear;
        htDatePickerSet.nMonth = htDate.nMonth;
        htDatePickerSet.nDate = htDate.nDate;
        this._htDatePickerSet[sDatepickerId] = htDatePickerSet;
        if(this._isCurrentDatePicker(elInput) && this._bCalendarVisible){
            this._oCalendar.draw(htDate.nYear, htDate.nMonth);
        }
    },
    deleteDate : function(elInput){
        if(!elInput){ return;}
        var welInput = jindo.$Element(elInput);
        var htDatePickerSet = this._htDatePickerSet;        
        var sDatepickerId = welInput.attr(jindo.m.Datepicker.INDEX_ATTR);
        var oDate = new Date();
        var htToday = {nYear:oDate.getFullYear() , nMonth:oDate.getMonth() + 1 , nDay: oDate.getDate()};
        welInput.$value().value = "";
        htDatePickerSet[sDatepickerId].nYear = oDate.getFullYear();
        htDatePickerSet[sDatepickerId].nMonth = oDate.getMonth() + 1;
        htDatePickerSet[sDatepickerId].nDate = oDate.getDate();
        if(this._isCurrentDatePicker(welInput.$value()) && this._bCalendarVisible){
            this.hide();
        }
        this.fireEvent("clear",{            
            oCalendar : this._oCalendar
        }); 
    },  
    _isCurrentDatePicker : function(elInput){
        var sDatepickerId = (elInput) ? elInput.getAttribute(jindo.m.Datepicker.INDEX_ATTR) : null;
        var sSelectDatepickerId = this._welCalendarBase.attr(jindo.m.Datepicker.INDEX_ATTR);
        var bIsCurrentDatePicker = (sDatepickerId == sSelectDatepickerId);
        return bIsCurrentDatePicker;
    },
    enable : function(elInput){
        var htDatePickerSet = this._htDatePickerSet;
        if(elInput){
            var welInput = jindo.$Element(elInput);                     
            welInput.$value().disabled = false;         
        } else {
            for ( var sKey in htDatePickerSet) {
                htDatePickerSet[sKey].elInput.disabled = false;
            }
            this.activate();
        }
        this.fireEvent("enable",{           
            oCalendar : this._oCalendar
        }); 
    },
    disable : function(elInput){        
        var htDatePickerSet = this._htDatePickerSet;
        var bHideCalendar = false;
        if(elInput){
            var welInput = jindo.$Element(elInput);                     
            welInput.$value().disabled = true;          
            bHideCalendar = (this._bCalendarVisible && this._isCurrentDatePicker(welInput.$value()));
        } else {
            for ( var sKey in htDatePickerSet) {
                htDatePickerSet[sKey].elInput.disabled = true;
            }
            this.deactivate();
            bHideCalendar = true;
        }
        if(bHideCalendar && this._bCalendarVisible){
            this.hide();
        }
        this.fireEvent("disable",{          
            oCalendar : this._oCalendar
        }); 
    },  
    show : function(elInput){
        var welInput = jindo.$Element(elInput),
            welBaseUnit = welInput.parent(), 
            sDatepickerId = welInput.attr(jindo.m.Datepicker.INDEX_ATTR),
            htDatePickerSet = this._htDatePickerSet[sDatepickerId];
        if(!this.fireEvent("beforeShowCalendar",{
                oDrawDate  : {"nYear" : htDatePickerSet.nYear, "nMonth" : htDatePickerSet.nMonth, "nDate" : htDatePickerSet.nDate},
                oCalendar : this._oCalendar
            })) {
            return false;
        }      
        this._htSelectedDatePickerSet = htDatePickerSet;
        this._welCalendarBase.attr(jindo.m.Datepicker.INDEX_ATTR, sDatepickerId);
        //if(!jindo.Calendar.isSameDate(this._oCalendar.getShownDate(), htDatePickerSet)) {
            this._oCalendar.draw(htDatePickerSet.nYear, htDatePickerSet.nMonth);
        welBaseUnit.append(this._welCalendarBase.$value()); 
        if(this._isCurrentDatePicker(elInput) && this._bCalendarVisible){
            return;
        }       
        this._fPosition = jindo.$Fn(function(){
            this._setCalendarPosition(elInput, htDatePickerSet.sPosition);
        },this).bind();
        if(htDatePickerSet.zIndex != "none"){
            this._welCalendarBase.css("zIndex", htDatePickerSet.zIndex);
        }
        if(this.option("bUseEffect")){
            this._displayEffect("fade-in", this._fPosition);            
        } else {            
            this._welCalendarBase.show();       
            this._fPosition();          
            this._bCalendarVisible = true;
            this.fireEvent("showCalendar",{
                oDrawDate  : {"nYear" : htDatePickerSet.nYear, "nMonth" : htDatePickerSet.nMonth, "nDate" : htDatePickerSet.nDate},
                oCalendar : this._oCalendar
            }); 
        }
    },
    hide : function(){
        var htDatePickerSet = this._htSelectedDatePickerSet;
        var bHide = this.fireEvent("beforeHideCalendar", {
            oSelectDate  : {"nYear" : htDatePickerSet.nYear, 
                "nMonth" : htDatePickerSet.nMonth, 
                "nDate" : htDatePickerSet.nDate},
            oCalendar : this._oCalendar
        });
        if(!bHide){return false;}
        if(this.option("bUseEffect")){
            this._displayEffect("fade-out");
        } else {            
            this._welCalendarBase.hide();           
            this._bCalendarVisible = false;
            this.fireEvent("hideCalendar", {
                oSelectDate  : {"nYear" : htDatePickerSet.nYear, 
                    "nMonth" : htDatePickerSet.nMonth, 
                    "nDate" : htDatePickerSet.nDate},
                oCalendar : this._oCalendar
            });
        }
    },  
    destroy : function() {
        this.deactivate();
        this._oCalendar = null;
        this._htDatePickerSet = null;
        this._htSelectedDatePickerSet = null;
        this._bActivate = false; 
        this._bMove = false;
        this._bCalendarVisible = false;
        this._sClickEvent = null;
        this._aDayInfo = null;
    }
}).extend(jindo.UIComponent);
