var $ = jQuery;
var isSSL = document.location.href.indexOf('https') === 0;
var GEO_RESTRICTION;

var COOKIE_OPTIONS = { path: '/', expires: 365, secure:isSSL };
if(typeof EU_BASED_SCHOOL == 'undefined') {
    var EU_BASED_SCHOOL = false;
}
if(EU_BASED_SCHOOL){
	COOKIE_OPTIONS.expires = 90;
}

//https://support.google.com/webmasters/answer/1061943?hl=en
var USER_AGENT_BOT = false;
var UserAgentValue = navigator.userAgent.toLowerCase();
var BotRegExp = new RegExp("(adsbot|googlebot)", 'i');
if(BotRegExp.test(UserAgentValue)){
	USER_AGENT_BOT = true;
}

// moving to https://github.com/js-cookie/js-cookie
if(typeof jQuery.cookie === 'undefined' && typeof Cookies !== 'undefined'){

	jQuery.cookie = function(cName, cValue, cOptions){
		if(typeof cValue === 'undefined'){
			return Cookies.get(cName);
		}else{
			return Cookies.set(cName, cValue, cOptions);
		}
	} 

	jQuery.removeCookie = function(cName, cOptions){
		return Cookies.remove(cName, cOptions);
	} 
}

if(getUrlParameter('clear_cookies') == 1){
	clearAllCookies();
}

function clearAllCookies(){
	var root_domain = location.hostname.split('.').reverse().splice(0,2).reverse().join('.');
	Object.keys(Cookies.get()).forEach(function(cookieName){//Clear all local cookies we can
		Cookies.remove(cookieName, COOKIE_OPTIONS);
		Cookies.remove(cookieName,{domain:root_domain,path:'/'});
	});
	if(typeof SalesforceInteractions == "object"){ //Clear Evergage Cookie
	    document.dispatchEvent(new CustomEvent(SalesforceInteractions.CustomEvents.OnClearCookie), { detail: {options: {domain: location.hostname} } });
	}
	console.info('Cleared All Cookies');
}

jQuery(window).on('load',function(){
	setBrowserSupport();
});

jQuery(function($){

	
	$.validator.messages.required = 'Please fill in the required field.';
	$.validator.addMethod('emailtld', function(val, elem){
		var filter = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		if(!filter.test(val)) {
			return false;
		} else {
			return true;
		}
	}, 'Please enter a valid email address.');
	
    $.validator.addMethod("noSpace", function(value, elem){ 
      return value == '' || value.trim().length != 0;  
    }, "Please enter a valid value.");
	
	$.validator.addMethod("phoneUS", function(phone_number, element) {
		phone_number = phone_number.replace(/\s+/g, "");		
		phone_number = phone_number.replace('+1 ', "");
        phone_number = phone_number.replace('+52', "");
		return this.optional(element) || phone_number.length > 9 &&
			phone_number.match(/^(\+?1-?)?(\([2-9]\d{2}\)|[2-9]\d{2})-?[2-9]\d{2}-?\d{4}$/)
			&& !phone_number.match(/^\(555\)/)
			&& !phone_number.match(/^\(911\)/)
			&& !phone_number.match(/^(\([0-1]|\(200)/);
	}, "Please specify a valid phone number");
	
	$('form.validate').each(function(){
		$(this).validate({ });
	});
	
	var coAllSites = COOKIE_OPTIONS;
	coAllSites.sameSite = 'None';
	if( !Cookies.get('original_referrer') ){ 	Cookies.set('original_referrer', document.referrer, coAllSites); }
	if(	!Cookies.get('original_url') ){ 		Cookies.set('original_url', document.location.href, coAllSites); }
	
	try{
		var original_referrer = Cookies.get('original_referrer') || document.referrer;
		if(typeof original_referrer != 'undefined'){
			$('.original_referrer').val( original_referrer.substring(0,499) );
		}		
		
		var original_url = Cookies.get('original_url') || document.location.href; //Fallback to current URL if no cookie
		if(typeof original_url != 'undefined'){
			$('.original_url').val( original_url.substring(0,499) );
		}		
	}catch(err){ console.log(err); }
	
	//Send current page as Referrer for form
	$('.referrer').val( document.location.href.substring(0,1000) ); 
	$('.user_agent').val(navigator.userAgent);
	
	setTimeout(function(){
		setGCLID();
		setSource();
		setKeyword();
		setRefID();
		populateFormTracking();
		parseOriginalURL();
		setFinalURL();
		//setBrowserSupport();
		recordPath();
	},50);

	$('form.trilogy-lead-form,form.trilogy,form.form-2u').one('click keypress',function(){
		if( !$('body').hasClass('form-populated') ){
			setTimeout(function(){
				populateLeadSource();
				populateTimezoneOffset();
				populateIP();
				$('body').addClass('form-populated');
			}, 10);
		}
		return true;
	});
	
	if( typeof campus != 'undefined' ){
		//$('form input[name=inf_custom_Campus]').val(campus);	
	}
	
	$('#show_extra').click(function(){
		$('#extra').show();
		$('#show_extra').hide();
	});
	
	var phone_mask = $('body').data('phone-format') || "(999) 999-9999";
	if(typeof $.mask !== 'undefined'){
		$('input[type="tel"]').not('.intl').mask(phone_mask);
		$('input.masked-input[data-mask]').each(function(){
			try{
				var mask = $(this).data('mask').toString();
				var placeholder = $(this).data('placeholder') || '';
				$(this).mask(mask,{placeholder:placeholder});
			}catch(e){
				console.log(e);
			}
		});
	}

	$('body').on('click','.button-phone,a.modal-phone',function(){
		var label = isMobile() ? 'mobile':'desktop';
		trilogyTrackingEvent('phone', 'click-to-call', label);
		return true;
	});

	$('[data-cta]').click(function(){
		var cta = $(this).data('cta');
		$('form input.cta').val(cta);	
		return true;
	});



    //Assume Desktop Events
		$('a[href^=tel]').click(function(){
                if ($(this).hasClass('phone')) {
                    var text = $(this).text();
                } else if ($(this).hasClass('phone-call-now')) {
                    var text = $(this).attr("title");
                } else {
                    var text = $('span.phone').first().text();
                }

                //var text	= $('span.phone').first().text();
                var link = $(this).attr('href'),
                    admission_type = $('meta[name=admission-type]'),
                    rep = admission_type.length > 0 ? admission_type.attr("content") : 'advisor';
                swal({
                    title: "Speak to an " + rep + ":",
                    text: "<a class=modal-phone href='" + link + "'>" + text + "</a>",
                    html: true,
                    confirmButtonColor: $('.form-get-info .button').css('background-color')
                });
				var deviceType = isMobile() ? 'mobile':'desktop';
				trilogyTrackingEvent('phone', 'open-modal', deviceType);
			return false;
		});


		$('ul.nav li.dropdown').hover(function() {
            if(window.innerWidth >= 992) {  //Assume Desktop
                $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeIn();
            }
		}, function() {
            if(window.innerWidth >= 992) {  //Assume Desktop
                $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeOut();
            }
		});
		$('ul .dropdown > a').click(function(){
            if(window.innerWidth >= 992) {  //Assume Desktop
                location.href = $(this).attr('href');
            }
		});

    //ends Desktop Events
	
	// FAQ toggle
	$('.faq-list dt').click(function() {
		if($(this).hasClass('active')) {
			$('.faq-list dt').removeClass('active');
		} else {
			$('.faq-list dt').removeClass('active');
			$(this).addClass('active');
		}
	});
	
	$('[name=inf_field_Phone1]').keydown(function(){
		if(event.keyCode == 13) {
		  event.preventDefault();
		  return false;
		}
	});
	
	$('input.form_location').val(document.location.pathname);
	
	$('input.Trilogy_UUID').val( getUUID() );

	$(".main-content a[href^='http']")
		.not(':empty')
		.not('a[href*="'+document.location.host+'"]')
        .not('.atop-link')
		.attr('target','_blank');
	
	if( getUrlParameter('tes_lc') == 1){
		waitForChatButton('.embeddedServiceHelpButton .helpButtonLabel', 250);
	}

	$('[data-track]').click(function(){
		var data 		= $(this).data('track');
		var parts 		= data.split(', ');
		var category 	= parts[0];
		var action 		= parts[1] || 'Click';
		var label 		= parts[2] || null;
		trilogyTrackingEvent(category.trim(), action.trim(), label);
		return true;
	});
	$('[data-track-category]').click(function(){
		var category 	= $(this).data('track-category');
		var action 		= $(this).data('track-action') || 'Click';
		var label 		= $(this).data('track-label')  || null;
		trilogyTrackingEvent(category.trim(), action.trim(), label);
		return true;
	});

	//ParamErrors
    if( getUrlParameter('errors') == 'true') {
        if(typeof Rollbar != "undefined") {
            Rollbar.warn("Page has errors param, set to true" + window.location.href, window.location.href);
            if (getUrlParameter('errorMessage')) {
                Rollbar.critical("Critical: Error return in param: " + window.location.href + " --errorMessage: " + getUrlParameter('errorMessage'), window.location.href );
            }
        }
	}
	
	//lazy loading for images via source set on VC components
	var lazyImages =[].slice.call( document.querySelectorAll(".lazy > source") );
	if( lazyImages.length ){
		console.log('adding IntersectionObserver for lazy images');
		if ("IntersectionObserver" in window && 'IntersectionObserverEntry' in window) {
			var lazyImageObserver = 
			new IntersectionObserver(function(entries, observer) {
				entries.forEach(function(entry) {
				if (entry.isIntersecting) {      
					var lazyImage = entry.target;
					lazyImage.srcset = lazyImage.dataset.srcset;
					lazyImage.nextElementSibling.srcset = lazyImage.dataset.srcset;
					lazyImage.parentElement.classList.remove("lazy");
					lazyImageObserver.unobserve(lazyImage);
				}
				});
			});

			lazyImages.forEach(function(lazyImage) {
			lazyImageObserver.observe(lazyImage);
			});
		}
	}

    // lazy load background image
    var initLazyLoadBackgroundImage = function(){
        var currentScroll = document.scrollingElement.scrollTop;
        var elements = document.querySelectorAll('.lazy-load-bg');
    
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            if ((currentScroll > element.getBoundingClientRect().top - 200)) {
                element.classList.remove("lazy-load-bg");
            }
        }
    };
        
    var lazyLoadBG_els = document.querySelectorAll('.lazy-load-bg');
    if (lazyLoadBG_els !== null && lazyLoadBG_els.length !== 0){
        initLazyLoadBackgroundImage();

        window.addEventListener('scroll', function (e) {
            initLazyLoadBackgroundImage();
        }, false);
    }

	$('noscript').css({display: 'none'}); //Accessbility fix for nojs form to not be scanned on site improve

	var $body = $('body');
	if( $body.hasClass('blog-v2') ){
		var label = 'other';
		if( $body.hasClass('single') ){
			label = 'single-post';
		}
		else if( $body.hasClass('archive') ){
			label = 'archive';
		}
		else{
			label = 'home';
		}
		trilogyTrackingEvent('blog-v2', 'view', label);
	}
	
	$('html').removeClass('no-js').addClass('js');
});

function pushToDataLayer(obj) {
    try {
        const validEvents = ['GA4_requestinfo_form_submit', 'form_submit', 'form_start'];
		let requiredKeys = [];

        if (!obj || typeof obj !== 'object') {
			Rollbar.error("Invalid Data Layer: Object expected");
            throw new Error("Invalid Data Layer: Object expected");
        }

        if (!obj.event || !validEvents.includes(obj.event)) {
			Rollbar.error("Invalid Data Layer: event type");
            throw new Error("Invalid event type");
        }

        switch (obj.event) {
            case 'GA4_requestinfo_form_submit':
                requiredKeys = ['form_type','form_location','geo_restriction', 'program_type', 'program', 'form_submit_text' ];
                break;
            case 'form_submit':
                requiredKeys = ['form_type','form_location','geo_restriction','form_submit_text' ];
                break;
            case 'form_start':
				requiredKeys = ['form_type','form_location','geo_restriction','form_destination' ];
                break;
            default:
				Rollbar.error("Invalid Data Layer: Not a valid event name");
                throw new Error("Not a valid event name");
        }

        for (const key of requiredKeys) {
            if (!(key in obj)) {
                throw new Error(`Missing key: ${key}`);
            }
        }
		window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(obj);
		
    } catch (error) {
        console.error("Error processing data:", error.message);
		if(typeof Rollbar != "undefined"){
			Rollbar.error("Error processing data:", error.message);
		}
    }
}


function waitForChatButton(selector, time) {  
	if( document.querySelector(selector) != null ){
		setTimeout(function(){ $('.embeddedServiceHelpButton .helpButtonLabel').click(); },500);
	}
	else{
		setTimeout(function(){ waitForChatButton(selector, time); }, time);
	}
}

function populateFormTracking(){
	var hp = getUrlParameter('hp');
	if(hp != ''){
		Cookies.set('hp', hp, {path:'/'}); //Set Session Cookie		
	}
	else{
		hp = Cookies.get('hp');		
	}
	
	if( hp ){
		$('input.high_priority').val('1');
	}

	var d 		= new Date();
	var dateStr = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();

	var tcpa_copy = $('form.trilogy-lead-form,form.trilogy-form-regular,form.msx-form').first().find('.edx-broad-tcpa,.tcpa_copy,.consent_copy').text().replace(/\s+/g,' ').trim();
	$('input.tcpa_content').val( tcpa_copy );
	
	$('input.tcpa_accepted_date').val(dateStr);

	$('.trilogy-lead-form input.fbc').val( Cookies.get('_fbc') );
	$('.trilogy-lead-form input.fbp').val( Cookies.get('_fbp') );
	
	var FB_LEAD_EVENT_ID = 'LEAD_'+Math.random().toString(36).substring(2, 10)+'_'+Date.now();//To Send with Form
	//Clear the lead cookie here, as it would have already been used by the facebook event.
	Cookies.remove('FB_LEAD_EVENT_ID');

	$('input.fb_lead_event_id').val(FB_LEAD_EVENT_ID);
	$('form input.ga_client_id').val( Cookies.get('_ga') );
}

function setBrowserSupport(){
	jQuery('input.browser_support').val('JS');
	//GA Loads Later
	setTimeout(populateBrowserSupport, 1000);
}
function populateBrowserSupport(){
	var browser_support = ['JS'];
	console.log('populateBrowserSupport');
	/*
	Pardot:		pi.tracker
	CrazyEgg:	CE2.SURVEY_VERSION
	*/
	
	if( !(window.ga && ga.create) )  {
		//browser_support.push('AdBlocker');
	} 

	if( typeof Cookies.get('original_url') == 'undefined'){
		browser_support.push('noCookies');
	}

	if( typeof fbq == 'undefined' || typeof fbq.version != 'string' ){
		browser_support.push("noFB");
	}

	if(window.ga && window.ga.getAll){
		try{
			if( !window.ga.getAll()[0].get('trackingId') ){
				browser_support.push('noGA');
			}
		}catch(err){
			browser_support.push('noGA');
		}
	}
	else{
		browser_support.push('noGA');
	}
	if('undefined' == typeof OneTrust){
		browser_support.push('noOneTrust');
	}
	if('undefined' == typeof Five9ChatPlugin){
		browser_support.push('noChat');
	}
	if('undefined' == typeof google_tag_manager){
		browser_support.push('noGTM');
	}

	if('undefined' == typeof Rollbar){
		browser_support.push('noRollbar');
	}
	
	jQuery('input.browser_support').val(browser_support.join(', '));
}

function geoRestrictEmbargoCountries(country_code){
	if (typeof EMBARGO_COUNTRIES == 'undefined') {
		var EMBARGO_COUNTRIES = ['CU','IR','KP','SD','SY'];
	}
	if(-1 != $.inArray(country_code, EMBARGO_COUNTRIES)){
		var embargo_message = '<div class=embargo_text style="padding:10px;text-align:left;line-height:1.2em;"><label class=tcpa>As a U.S. company, Trilogy Education Services, LLC (“Trilogy”) is subject to U.S. export control and economic sanctions laws and regulations, including, but not limited to, the regulations administered by the Office of Foreign Assets Control of the U.S. Department of the Treasury, the U.S. Export Administration Regulations, and other similar laws and regulations.  Under such laws and regulations, Trilogy is prohibited from engaging in business, transactions, or dealings, directly or indirectly, with certain countries and territories and certain individuals and entities designated by the U.S. Government.  As such, Trilogy does not provide services to, or engage in business or dealings with, persons located in any countries or territories subject to a U.S. Government embargo, including Cuba, Iran, North Korea, Syria, and the Crimea Region of the Ukraine.</label></div>';
		$('.form-get-info,form.contact,form.msx-form').html(embargo_message);
		$('body').html(blocked_html);
		trilogyTrackingEvent('Embargo IP Block', 'Block', ip_address);
	}
}

function geoApplyGDPRActions(country_code){
	trilogyLog('GEO is ', country_code);
	if (typeof GDPR_COUNTRIES == 'undefined') {
		var GDPR_COUNTRIES = ["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE","GB","IS","LI","NO","BR","CO","SG","TH","AU","HK","CN","JP","EG","IL","KE","SA","ZA","TR","AE","IN"]
	}

	var geo_in_gdpr_region = GDPR_COUNTRIES.includes(country_code);
	if ( !geo_in_gdpr_region ){
		// NOT IN GDPR REGION
		GEO_RESTRICTION = "non-gdpr";
		console.log('GEO Not in GDPR Region');
		return;
	}

	console.log('GEO is in GDPR Region');
	GEO_RESTRICTION = "gdpr";
	
	var gdpr_bypass = getUrlParameter('gdpr_bypass');// Ex: /?eu_bypass=true 
	if( gdpr_bypass == "true" ){
		console.log('GDPR Bypass Enabled');
		return;
	}

	if (typeof CB_GDPR_REGION_RESTRICTED != "undefined" && CB_GDPR_REGION_RESTRICTED === true) {
		var disabled_message = 'Unfortunately, Due to GDPR we can temporarily not support users from the '+country_code+' as of the 23rd of May 2018'; 
		//swal('Forms Disabled', disabled_message, 'info');
				
		$('form.trilogy-lead-form, form.contact.trilogy').replaceWith('<div style="padding:15px;text-align:center;" class="gdpr-message">'+disabled_message+'</div>');
		
		//Clear All Cookies
		Object.keys(Cookies.get()).forEach(function(c) {
			Cookies.remove(c, COOKIE_OPTIONS);
		});		
		
		if (typeof ga == 'function') {
			trilogyTrackingEvent('EU Block', 'Block', ip_address)
		}
		return;
	}

    
	dynamicConsentSetGDPR(); // CHANGE CONSENT STEP TO GDPR
			
}


function geoBasedActions(country_code){ 
	// This function is called by OneTrust Geo and IP Geo parsing

	geoRestrictEmbargoCountries(country_code);
	
	geoApplyGDPRActions(country_code); 
	
}

function parseGeo(geo_info){
	if(USER_AGENT_BOT){
		return null;
	}
	var ip_address  = geo_info.ip;
	var country_code = geo_info.code;

	geoBasedActions(country_code);
	
	$('input.ip_address').val(ip_address);
	$('input.ipZipcode').val( ( geo_info.zip || "").substring(0,10) );	
	$('input.ipCity').val( 		( geo_info.city   || "").substring(0,254) );
	$('input.ipRegion').val( 	( geo_info.region || "").substring(0,254) );
	$('input.ipCountry').val( ( geo_info.country || "").substring(0,254) );
}

function populateLeadSource(){
	if(USER_AGENT_BOT){
		return null;
	}
	var s = getUrlParameter('utm_source', Cookies.get('original_url'));
	if( !s ){
		s = getUrlParameter('utm_source', Cookies.get('original_referrer'));
	}
	if( !s ){
		s = getUrlParameter('utm_source');	
	}
	
	if( !Cookies.get('lead_source') && s ){
		$.ajax({
			url: '/wp-json/trilogy/v1/source-mapping',
			method: 'POST',
			data: {utm_source: s},
			success:function(r){
				if(r.data.lead_source){
					Cookies.set('lead_source', r.data.lead_source, COOKIE_OPTIONS);
					$('form .lead_source').val(r.data.lead_source);
				}
				else{
					$('form .lead_source').val( "Organic/Direct" );
				}
			}
		});		
	}
	else{		
		$('form .lead_source').val( Cookies.get('lead_source') || "Organic/Direct" );
	}
}

function getTimezoneOffset(){
	var offset  = new Date().getTimezoneOffset();
	var hours   = parseInt( offset/60 );
	var min 	= Math.abs( offset - (hours*60) );
	var h = (-1*hours);
	if(Math.abs(h) < 10){
		// padd leading leading zero 
		h = ((h < 0) ? '-0': '0') +Math.abs(h);
	}

	if( parseInt(h)!= 0){
		h = (h>0) ? '+'+h: h;
	}
	
	if(min < 10){
		min = '0'+min;
	}
	return h+':'+min;
}

function populateTimezoneOffset(){
	try {
		if(Intl.DateTimeFormat().resolvedOptions().timeZone != "UTC"){
			$("input.timezone").val(getTimezoneOffset());
		}
	}catch(e){
		console.log("ERROR:", e); 
	} 
}

function populateIP(){
	if(USER_AGENT_BOT){
		return null;
	}
	var geo_cookie = Cookies.get('geo_info');
	
	populateIPv6();

	if( typeof geo_cookie == 'undefined' ){
		$.ajax({
			url: 'https://api.bootcampsearch.com/ip-info/',
			method: 'GET',
			success:function(geo){
				Cookies.set('geo_info', JSON.stringify(geo), COOKIE_OPTIONS);
				parseGeo(geo);
			},
			error:function(xhr, textStatus, thrownError){
				if( typeof Rollbar != "undefined" ){
					Rollbar.critical("IP GEO Error", {thrownError:thrownError, status:textStatus});
				}
			}
		});
	}
	else{
		try{		
			parseGeo( JSON.parse( geo_cookie ) );
		}
		catch(err){
			console.log('Error with GeoLocation');
			return false;
		}
	}	
	
}

function populateIPv6(){
	var ipv6;
	var cookie_name = 'ip_address_v6';
	if(ipv6 = Cookies.get(cookie_name) ){
		$('form input.ip_v6_address').val(ipv6);
	}
	else{
		$.getJSON("https://api64.ipify.org/?format=json",function(data){
			var ipv6 = data.ip;
			if(ipv6){
				$('form input.ip_v6_address').val(ipv6);
				Cookies.set(cookie_name, ipv6, COOKIE_OPTIONS);
			}
		});
	}
}

function setFinalURL(){ //AKA last touch
	if( getUrlParameter('utm_source') || getUrlParameter('s') ){
		Cookies.set('final_url', document.location.href, COOKIE_OPTIONS);
	}
	var final_url = Cookies.get('final_url') || document.location.href;
	$('input.final_url').val( final_url.substring(0,499) );
}

function setSource(){
	var s = getUrlParameter('s');
	
	if(s == ''){ //Check if passed using utm_source= parameter
		s = getUrlParameter('utm_source');		
	}
	if(s == ''){ //Check if passed using source= parameter
		s = getUrlParameter('source');
	}
	if(s == ''){ //Check if passed using s= parameter
		var c = Cookies.get('source');
		if(typeof c != 'undefined'){
			s = c;
		}
	}
	
	if(s != ''){ //if source is set, set the cookie
		Cookies.set('source', s, COOKIE_OPTIONS);
	}
	else{ //Still no source? check the cookie
		s = Cookies.get('source');
	}
	
	if(s == ''){ //Automatic based on the page
		var path = document.location.pathname;
		if( path == '/facebook/' ){
			s = 'FB';			
		}
	}
	//Automatic determine from referrer, when s parameter is not provided
	if(s == ''){
		if (document.referrer.search('https?://(.*)google.([^/?]*)') === 0){			s = 'Google'; } 
		else if (document.referrer.search('https?://(.*)bing.([^/?]*)') === 0){			s = 'Bing'; } 
		else if (document.referrer.search('https?://(.*)yahoo.([^/?]*)') === 0){		s = 'Yahoo'; }
		else if (document.referrer.search('https?://(.*)facebook.([^/?]*)') === 0) { 	s = 'Facebook'; }
		else if (document.referrer.search('https?://(.*)twitter.([^/?]*)') === 0) { 	s = 'Twitter'; }
		//else { return 'Other'; } 
	}
	$('input[name=inf_custom_source],input.source').val(s);
	
	//console.log('Source: '+s);
}
function setRefID(){
	var refID = Cookies.get('refID');	
	
	if( !refID && getUrlParameter('refID') ){
		refID = getUrlParameter('refID');
		Cookies.set('refID', refID, COOKIE_OPTIONS);
	}

	if(typeof refID == 'string'){
		$('form input.referrer_id').val( refID.substring(0, 50) );
	}
}
function setKeyword(){
	var k = getUrlParameter('k'); 
	if(k == ''){
		k = getUrlParameter('utm_keyword');
	}
	
	if(k != ''){
		Cookies.set('keyword', k, COOKIE_OPTIONS);
	}
	else{
		k = Cookies.get('keyword');
	}
	
	$('form input[name=k]').val(k);		
	$('input[name=inf_custom_keywords],input.keywords').val(k);
	
	//console.log('Keyword: '+k);
}
function setGCLID(){
	//Last encountered GCLID
	var current_gclid = getUrlParameter('gclid');
	if( current_gclid ){
		Cookies.set('gclid', current_gclid, COOKIE_OPTIONS);
	}
	var gclid = Cookies.get('gclid');
	$('.gclid').val( gclid );
}

function cookieSetIfNotEmpty(name, value, options){
	if(value != ''){
		Cookies.set(name, value, options);
	}
}

function parseOriginalURL(){ 
	try{
		var url 		= Cookies.get('original_url') || document.location.href;
	
		var utm_cost		= getUrlParameter('utm_cost', url);
		cookieSetIfNotEmpty('utm_cost', utm_cost, COOKIE_OPTIONS);
		utm_cost = parseInt( utm_cost );
		if( !isNaN(utm_cost) && isFinite(utm_cost) ){
			$('.utm_cost').val( utm_cost );
		}
		
		var fbclid 		= getUrlParameter('fbclid', url);
		var trkid 		= getUrlParameter('trkid', url);
		$('input.fbclid').val(fbclid);
		$('input.mkwid').val( trkid );	
		
		var utms = [
			'utm_medium', 
			'utm_content', 
			'utm_term', 
			'utm_source', 
			'utm_campaign', 
			'utm_campaignname', 
			'utm_campaignid', 
			'utm_adsetname', 
			'utm_adsetid', 
			'utm_adid',  
			'utm_adgroupid', 
			'utm_matchtype', 
			'utm_network', 
			'utm_device', 
			'utm_creative', 
			'utm_placement', 
			'utm_locationphysicalms', 
		];

		for(var i=0; i<utms.length; i++){
			var name = utms[i];
			var value = getUrlParameter(name, url);
			cookieSetIfNotEmpty(name, value, COOKIE_OPTIONS);
			$('input.'+name).val(value);
		}
		
	}catch(err){
		console.log('Error Parsing Parameters');
	}	
}
function recordPath(){
	try{ 
		var path = document.location.pathname;
		var currentPath = Cookies.get('PathVisited');
		if(typeof currentPath == 'undefined'){
			currentPath = path;
		}
		else{
			var parts = currentPath.split(',').slice(0, 15); //First 15 Pages
			parts.push(path);
			currentPath = parts.join(',');
		}
		$('.pathvisited').val(currentPath);
		Cookies.set('PathVisited', currentPath, COOKIE_OPTIONS);
	}catch(err){
		console.log('Error Setting Pathvisited');
	}
}

function getUrlParameter(sParam, url){
	try{
		if( typeof url !== 'undefined'){
			var parser 	= document.createElement('a');
			parser.href = url;
			var sPageURL = decodeURIComponent(parser.search.substring(1));
		}
		else{
			var sPageURL = decodeURIComponent(window.location.search.substring(1));
		}
	}catch(e){
		console.log('Malformed URI');
		return '';
	}
    var sURLVariables = sPageURL.split('&');
	var sParameterName;
    var i;

    for(i = 0; i < sURLVariables.length; i++){
        sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === sParam) {
			return sParameterName[1] === undefined ? '' : sParameterName[1];
        }
    }
	return '';
};
function getPageName(){
	return document.location.pathname.replace(/\//g,' ').trim();
}

function getUUID(){
	var uuid = Cookies.get('Trilogy_UUID');	
	if( uuid ){
		return uuid;		
	}
	else{
		try{
			uuid =  uuidv4();
		}catch(err){
			uuid = uuid_fallback();
		}
		Cookies.set('Trilogy_UUID', uuid, COOKIE_OPTIONS);
	}
	return uuid;
}
function uuid_fallback(){
  var uuid = "", i, random;
  for(i = 0; i < 32; i++){
    random = Math.random() * 16 | 0;
    if (i == 8 || i == 12 || i == 16 || i == 20) {
      uuid += "-"
    }
    uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
  }
  return uuid;
}
function uuidv4(){
	return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, function(c){
		return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
	});
}

function isMobile() {
	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
		return true;
	}
	else{
		return false;
	}	
}
function rgb2hex(rgb){
	if(!rgb){
		return '#fff';
	}
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function trilogyTrackingEvent(category, action, label, type = 'event'){
	try{
		if(typeof type === 'undefined'){type = 'event';}
		if(type === null){type = 'event';}
		
		if(typeof ga == 'function' && typeof ga.getAll == 'function'){
			ga.getAll().forEach(function(t){
				t.send(type, category, action, label);
			});
		}
		
		trilogyLog('GA Tracking '+type.toLocaleUpperCase()+': C:'+category+' A:'+action+' L:'+label);
	}catch(e){
		console.error('trilogyTrackingEvent Error:', e);
	}
}


function trilogyLog() {
    var domain_segments = window.location.hostname.split('.');
    var tld = domain_segments[domain_segments.length-1];
    var domain = domain_segments[domain_segments.length-2];

    if( tld == 'test' ||  (tld == 'com' && domain == 'trilogyed') || (window.location.hostname.indexOf('.dev.') != -1) ){
        if(typeof(console) !== 'undefined') {
            var debug_param = getUrlParameter('debug');
            if(debug_param) {
                var e = new Error();
                if (!e.stack) {
                    try {
                        throw e;
                    } catch (e) {
                        if (!e.stack) {
                        }
                    }
                }
                var tracer = e.stack.split('\n');
                for (var i = 0; i < tracer.length; ++i) {
                    tracer[i] = tracer[i].replace(/\s+/g, ' ');
                }
                var trace_details = tracer[1].split('@');
                var trace_line = '';

                if (trace_details.length == 1) {
                    trace_details = tracer[2].split('(');
                    if (trace_details.length > 1) {
                        trace_line = trace_details[1].split(':');
                        trace_line = trace_line[2];
                    } else {
                        trace_details[0] = trace_details[0].replace('at ', '');
                        trace_details = trace_details[0].split(':');
                        trace_line = trace_details[2];
                    }
                }
                [].push.call(arguments, {line: trace_line, trace: trace_details, tracestack: tracer});
            }
            console.log.apply(console, arguments);
        }
	}
}

function setAria(attr, attrValue){
	try{ 
		 
		$("[" + attr + "=" + "'" + attrValue + "'" + "]").each(function(index) {

			//set aria-label attribute name and value
			setAriaLabel($(this), attrValue);
		
			if(attrValue == "combobox"){
				setAriaExpanded($(this), false);

				var selectTagID = $(this).next().attr("id");
				$(this).attr('aria-controls', selectTagID);

			
			}else if(attrValue == "option"){
				setAriaSelected($(this), false);
			}


		});

	}catch(e){
		console.log('setAriaLabelByAttribute Error');
	}
}

// SET ARIA-LABEL 
function setAriaLabel(element, value ){
 	element.attr("aria-label", value);
}

// SET ARIA-EXPANDED
function setAriaExpanded(element, value){
 	element.attr("aria-expanded", value);
}

//SET ARIA-STATE (default false)
function setAriaSelected(element, value){
	element.attr("aria-selected", value);
}


//TODO: refactor if needed to remove additional attirbutes in future cases. 
function removeAria(attr, attrValue){
	try{ 
		$("[" + attr + "=" + "'" + attrValue + "'" + "]").each(function(index) {
			 $(this).removeAttr("aria-required");
		});
	}catch(e){
		console.log('removeAria Error:' + e);
	}
}
