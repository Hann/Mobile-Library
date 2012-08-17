/**
* @(#)common.js 2011. 10.04
*
* Copyright NHN Corp. All rights Reserved.
* NHN PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
*/
/**
* @author oyang2, icebelle
* @since 2011. 10. 04.
* @description 
*/

var welConsole;
window.__message_index_value__ = 1;

/* AddLog 처리 */
window.addConsole = function(s){
	welConsole = jindo.$Element('txtConsole');
	var sText = welConsole.text();
	sText = sText + "\n" + "[" + window.__message_index_value__++ + "] " + s;
	
	welConsole.text(sText);
	welConsole.$value().scrollTop = welConsole.$value().scrollHeight;
}

window.onload = function(){
	/* 데스크탑 브라우저 설정*/
	var oAgent = jindo.$Agent().navigator();
	if(!oAgent.webkit){
		//view sorce의 아이콘의 top 수정하기
		jindo.$('browser_notice').style.display ='block';
		var el = jindo.$$.getSingle('.h_lft', jindo.$('ct'));
		var welH = jindo.$Element(el);
		
		var elViewBtn = jindo.$$.getSingle('._view_status', jindo.$('view_source'));	
		var elViewCt = jindo.$$.getSingle('.sc', jindo.$('view_source'));	
		if(elViewBtn){			
			elViewBtn.style.top = welH.offset().top+"px";
			elViewCt.style.top = (welH.offset().top + welH.height())+"px";
		}
		
	}else{
		jindo.$('browser_notice').style.display ='none';
	}
	
	/* DeleteLog 처리 */
	var welConDel = jindo.$Element('delConsole');
	welConsole = jindo.$Element('txtConsole');
	if(welConsole) {
		welConsole.attr("disabled", true);
	}
	if(welConDel){
		jindo.$Fn(function(evt){
			evt.stop();
			welConsole.text('');
			window.__message_index_value__ = 1;
		}).attach(welConDel.$value(),'click');
	}
	
	/* 이전 버튼에 대한 처리 */
	var elGoBack = jindo.$$.getSingle('#hd a._prev');
	if(elGoBack){
		jindo.$Fn(function(evt){
			evt.stop();
			history.back();
		}).attach(elGoBack, 'click');
	}	
	
	/* QR 코드 처리 */
	var welQrBtn = jindo.$Element('qr_btn');
	var welQuLayer = jindo.$Element('qr_layer');
	var welQrView = jindo.$Element('QRView');
	
	jindo.$Fn(function(evt){
		evt.stop();
		if(welQuLayer.visible()){
		}else{
			oQRCode.makeCode(document.URL);
		}
		welQuLayer.toggle();
	}, this).attach(welQrBtn.$value(), 'click');

	var oQRCode = new jindo.QRCode(welQrView.$value(), {
		nWidth : 110,
		nHeight : 110,
		nCorrectLevel : jindo.QRCode.CorrectLevel.L
	});	
	
	/* ViewSource 처리 */
	var elCode = jindo.$('view_source');
	var welCode = jindo.$Element(jindo.$$.getSingle('._view_code', elCode));
	var welStatus = jindo.$Element(jindo.$$.getSingle('._view_status', elCode));
	if(elCode){
		jindo.$Fn(function(evt){
			evt.stop();		
			welCode.toggle();
			welStatus.toggleClass("vs_on", "vs");
		},this).attach(elCode,'click');
	}
}