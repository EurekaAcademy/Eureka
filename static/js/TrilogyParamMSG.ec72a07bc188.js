
jQuery(function($) {
    trilogyLog('TrilogyParamMSG Script 6'); // todo: Remove all the console logs.

    if(typeof USER_AGENT_BOT != 'undefined' && USER_AGENT_BOT){
        return null;
    }

    if(typeof getUrlParameter != 'function') {
        // TODO: throw Rollbar error 
        return null;
    }

// * GLOBAL VARIABLES * //    

    var pn_scta = "msg_cv_scta";
    var pn_fcta = "msg_cv_fcta";
    var pn_stbn = "msg_cv_stbn";

    var banner_url_params = {
        "msg_cv_scta": getUrlParameter(pn_scta), //landing cta
        "msg_cv_fcta": getUrlParameter(pn_fcta), //form cta
        "msg_cv_stbn": getUrlParameter(pn_stbn), //top bar notification
        "utm_source": getUrlParameter("utm_source")
    };

    var tracking_form_name = '';

    if(typeof banner_url_params["utm_source"] == 'string'){
        banner_url_params["utm_source"] = banner_url_params["utm_source"].toLowerCase();
    }

    // STBN
    if (typeof TrilogyBanners_STBN_options == 'undefined') { 
        var TrilogyBanners_STBN_options = window.TrilogyBanners_STBN_options;
    }

    // FCTA
    if (typeof TrilogyBanners_FCTA_options == 'undefined') { 
        var TrilogyBanners_FCTA_options = window.TrilogyBanners_FCTA_options;
    }

    // SCTA
    if (typeof TrilogyBanners_SCTA_options == 'undefined') { 
        var TrilogyBanners_SCTA_options = window.TrilogyBanners_SCTA_options;
    }

// * INIT : PROCESS MSG VALUES * //
    showLandingCTA(false); 
    showFormCTA(false); 
    showTopBarNotification(false); 
    addFormNameTracking(tracking_form_name);

    
// * CORE FUNCTIONS * //

    function showLandingCTA(data) {
        if((typeof data == 'undefined' || !data || !data.msg)){
            data = {};
            data = proccess_utm(TrilogyBanners_SCTA_options);
            if(data.msg_id){
                set_tracking_form_name(pn_scta, data.msg_id);
            }

            var msg = param_get_default_list_message(pn_scta, TrilogyBanners_SCTA_options);
            if(msg){
                data.msg = msg;
            }
        }
        if(data && data.msg){
            var html = '<div class="landing-scta" style="'+(data.style?data.style:'margin-top: 15px;')+'">'+data.msg+'</div>';
            var $ctaSection = $('section.cta');
            if($ctaSection.data('wpttc') === 1){
                $ctaSection.find('.container .row .call').append(html);
            } else if ($ctaSection.data('cmp') === 'cta-logos_side'){
                $ctaSection.after(html);
                $('.landing-scta').addClass('text-center').css({'background':"#222", "color": "#FFF", "padding": "15px 15px", "margin-top": 0});
            }
        }
    }

    function showFormCTA(data) {
        if((typeof data == 'undefined' || !data || !data.msg)){
            data = {};
            data = proccess_utm(TrilogyBanners_FCTA_options);
            if(data.msg_id){
                set_tracking_form_name(pn_fcta, data.msg_id);
            }
            
            
            var msg = param_get_default_list_message(pn_fcta, TrilogyBanners_FCTA_options);
            if(msg){
                data.msg = msg;
            }
            
            if(!data.style){
                var style = "text-align:center;background:#000;color:#FFF";
                var default_value = param_get_default(TrilogyBanners_FCTA_options);
                if(default_value && typeof default_value.style != "undefined"){
                    style = default_value.style;
                }
                data.style = style;
            }
        }
        trilogyLog("showFormCTA DATA", data)
        if(data && data.msg){
            var html = '<div class="form-fcta" style="'+data.style+'">'+data.msg+'</div>';
            $('.lead-form-container > .title').parent().prepend(html);
            $('.lead-form-container > .form-get-info-title').parent().prepend(html);
            $('.get-info-form > .title').parent().prepend(html);
            $('.form-get-info-title.title:visible').parent().prepend(html);
        }
    }

    function showTopBarNotification(data) {
        //console.log("showTopBarNotification1", data);
        var tbn_cookie_name = 't_top_bar_notification';
        $('#close-trilogyTBN').click(function () {
            Cookies.set(tbn_cookie_name, true, {path: '/', expires: 15});
            $('.TrilogyTBN').each(function () {
                $(this).hide().remove();
            });
        });

        if((typeof data == 'undefined' || !data || !data.msg)){
            data = {};
            data = proccess_utm(TrilogyBanners_STBN_options);
            if(data.msg_id){
                set_tracking_form_name(pn_stbn, data.msg_id)
            }

            var theme = "dark";
            var default_msg = "";
            var msg = false;
            
            var default_value = param_get_default(TrilogyBanners_STBN_options);
            if(default_value){
                if(typeof default_value.msg != "undefined"){
                    default_msg = default_value.msg;
                }
                if(default_value.theme != "undefined"){
                    theme = default_value.theme;
                }
            }

            if(banner_url_params[pn_stbn]){
                var param_msg = param_get_default_list_message(pn_stbn, TrilogyBanners_STBN_options);
                if(param_msg){
                    if(default_msg != param_msg){
                        msg = param_msg;
                        data.link = 1;
                    }
                }else{
                    var template_msg = stbnParamTemplateMessage(banner_url_params[pn_stbn]);
                    if(template_msg){
                        msg = template_msg;
                        data.link = 1;
                    }
                }
            }

            if(msg){
                data.msg = msg;
            }
            
            var param_default_list = param_get_default_list(TrilogyBanners_STBN_options);
            if(typeof param_default_list.link !== 'undefined' &&  typeof param_default_list.link[data.link] !== 'undefined'){
                data.link = param_default_list.link[data.link];
            }

            if(theme){
                data.theme = theme;
            }
        }
        
        //console.log("showTopBarNotification2", data);
        if(data && data.msg && !Cookies.get(tbn_cookie_name)){
            var default_list = param_get_default_list(TrilogyBanners_STBN_options);
            var TBNThemes = default_list && typeof default_list.theme != "undefined" ? default_list.theme : {};

            var TBNThemeDefined = (typeof data.theme != 'undefined' && typeof TBNThemes[data.theme] != 'undefined');
            var TBNTheme = TBNThemeDefined ? TBNThemes[data.theme] : TBNThemes.light;

            $('#close-trilogyTBN').hover(function () {
                $(this).css({
                    "background-color": TBNTheme["close-TrilogyTBN"]["bgColorHover"],
                    "color": TBNTheme["close-TrilogyTBN"]["colorHover"],
                    "text-decoration": "underline"
                });
            },function () {
                $(this).css({
                    "background-color": TBNTheme["close-TrilogyTBN"]["bgColor"],
                    "color": TBNTheme["close-TrilogyTBN"]["color"],
                    "text-decoration": "none"
                });
            });

            
            //look for livechatbtn
            if(typeof initializeLiveChatBtn != 'function'){
                if (!$("#lpChatButton-default").length) {
                    trilogyLog('append')
                    var $chatDiv = $('<div id="lpChatButton-default" style="display:none" ></div>')
                    $("body").append($chatDiv);
                }
                var systemLiveChatBtns = [
                    {btnId: "lpChatButton-default", clicker: "chatButtonClickDiv"},
                ];
                var livechatBtnMonitor;
                var systemLiveChatBtnClicker;
                function clickMainLiveChatBtn(e) {
                    var btnClicker = document.getElementById(systemLiveChatBtnClicker);
                    if (btnClicker) {
                        trilogyTrackingEvent('live-chat', 'click', 'live-chat-btn-clicked');
                        btnClicker.click();
                    }
                }
                function monitorPageLiveChatBtns() {
                    var systemClicker = document.getElementById(systemLiveChatBtnClicker);
                    var displayChatBtns = (systemClicker) ? true : false;
                    if (displayChatBtns) {
                        var pageChatBtns = document.getElementsByClassName("livechatBtnClicker");
                        for (var i = 0; i < pageChatBtns.length; i++) {
                            var btnElement = pageChatBtns[i];
                            if (btnElement) {
                                btnElement.style.display = "unset";
                                btnElement.onclick = clickMainLiveChatBtn;
                            }
                        }
                        clearInterval(livechatBtnMonitor);
                    }
                }
                function systemLiveChatBtnContainerExists() {
                    var tf = false;
                    for (var i = 0; i < systemLiveChatBtns.length; i++) {
                        var btnElement = document.getElementById(systemLiveChatBtns[i].btnId);
                        if (btnElement) {
                            systemLiveChatBtnClicker = systemLiveChatBtns[i].clicker;
                            tf = true;
                            break;
                        }
                    }
                    return tf;
                }
                function initializeLiveChatBtn() {
                    if (systemLiveChatBtnContainerExists() == true) {
                        livechatBtnMonitor = setInterval(monitorPageLiveChatBtns, 500);
                    }
                }
                initializeLiveChatBtn();
                var timer = setInterval(function () {
                    var myControl = document.querySelector(".livechatBtnClicker");

                    if (myControl) {
                        var chatShow = myControl.style.display === "block";
                        if (chatShow) {
                            var v5BodyChatBtn = document.getElementsByClassName("chat-entry")[0];
                            if (v5BodyChatBtn) {
                                v5BodyChatBtn.style.display = "unset";
                            }
                            clearInterval(timer);
                        }
                    }
                }, 1000);
            }

            if(data.msg && data.link){
                data.msg = data.msg + data.link;
            }

            var $TrilogyTBN_el = $("#TrilogyTBN");
            if ($TrilogyTBN_el.length) {
                trilogyLog("STBN html exist");
                var $TrilogyTBN_text_el = $TrilogyTBN_el.find(".TrilogyTBNText").first();
                $TrilogyTBN_text_el.html(data.msg);
                //theme
                $TrilogyTBN_el.css({"background-color" : TBNTheme["TrilogyTBN"]["bgColor"]});
                $TrilogyTBN_text_el.css({"background-color" : TBNTheme["alert-TrilogyTBN"]["color"]});
                $TrilogyTBN_text_el.css({"background-color" : TBNTheme["close-TrilogyTBN"]["bgColor"],  "color": TBNTheme["close-TrilogyTBN"]["color"]});
                $TrilogyTBN_el.css({"display": "block"});

                $TrilogyTBN_text_el.find('a').css({"color":TBNTheme["link-TrilogyTBN"]}); 
                
            } else {
                trilogyLog('else');
                $TrilogyTBNel = $(
                    '<div id="TrilogyTBN" class="TrilogyTBN" style="background-color: ' + TBNTheme["TrilogyTBN"]["bgColor"] + '">' +
                    '<div class="alert alert-dismissible alert-TrilogyTBN" role="alert" aria-atomic="true" style="margin: 0; color: ' + TBNTheme["alert-TrilogyTBN"]["color"] + '; font-size: 14px; line-height: 40px; padding: 2px 15px 2px 15px; vertical-align: middle; ">' +
                    '<div class="container" style="width: 100%; max-width: 100%; padding: 0;">' +
                    '<div class="col-xs-12" style="padding: 0; position: relative; display: flex">' +
                    '<div class="TrilogyTBNText"  style="font-size: 14px; line-height: 16px; float: left; padding: 10px 0;  flex-grow: 1; align-items: center; ">' +
                    data.msg +
                    '</div> ' +
                    '<button id="close-trilogyTBN" type="button" class="close" data-dismiss="alert" aria-label="Close" style="right: -15px; opacity: 1; padding: 10px 14px;  background-color: ' + TBNTheme["close-TrilogyTBN"]["bgColor"] + '; color: ' + TBNTheme["close-TrilogyTBN"]["color"] + '">' +
                    '<span aria-hidden="true">X</span>' +
                    '</button>' +
                    '</div>' +
                    '</div> ' +
                    '</div> ' +
                    '</div>'
                );
                $('body').prepend($TrilogyTBNel);
            }
        }
    }

    function addFormNameTracking(data) {            
        if(data){
            var formFormNameField = $('form input.form_name');
            formFormNameField.each(function () {
                var form_name_val = $(this).val();
                if(form_name_val.indexOf(data) === -1){
                    $(this).val(form_name_val + " " + data);
                }
            });
        }
    }
    
// * HELPERS FUNCTIONS * //

    /**
     * @description - Uses the url param value to fill in the template message. 
     * @param {string} stbnParam - Example: mktptr--ver1ABM--disc500--Vouch4Vets
     * @returns {string} - the message text. Example Apply below & mention Vouch4Vets to admissions for $500 off select boot camps (new apps only, offer can't be combined).
     */
    function stbnParamTemplateMessage(stbnParam) {

        var theParamValueTeam = 'mktptr'; // default team

        if (stbnParam.indexOf('mktptr--') !== -1){
            theParamValueTeam = 'mktptr'; // affiliates efforts
        } else if (stbnParam.indexOf('stratpr--') !== -1){
            theParamValueTeam = 'stratpr'; // strategic partnerships team
        }

        if(stbnParam.indexOf(theParamValueTeam + '--') !== -1) {
            var stbn_default_options = param_get_default_list(TrilogyBanners_STBN_options);
            if (!stbn_default_options) {
                return false;                    
            }

            var stbn_templates = stbn_default_options.template;
            if (!stbn_templates) {
                return false;
            }

            var msg = '';
            var allowed_tmplt_ids =  Object.keys(stbn_templates);
            var tmplt = '1ABM';

            if(stbnParam.indexOf(theParamValueTeam + '--ver') !== -1) {
                var tmplt_tmp = stbnParam.replace(theParamValueTeam + '--ver', '');
                tmplt_tmp = tmplt_tmp.substr(0, tmplt_tmp.indexOf("--"));
                if(allowed_tmplt_ids.includes(tmplt_tmp)){
                    tmplt = tmplt_tmp;
                }
                stbnParam = stbnParam.replace('--ver' + tmplt_tmp,'');
            }

            var partner_discount = 500;
            if(stbnParam.indexOf(theParamValueTeam + '--disc') !== -1){
                var disc_tmp = stbnParam.replace(theParamValueTeam + '--disc', '');
                disc_tmp = disc_tmp.substr(0, disc_tmp.indexOf("--"));
                if(disc_tmp !== ''){
                    partner_discount = disc_tmp;
                }
                stbnParam = stbnParam.replace('disc' + disc_tmp + '--','');
            }

            var partner_name = stbnParam.replace(theParamValueTeam + '--', '');
            partner_name = partner_name.replace(';amp;', '&');
            partner_name = stripcslashes(partner_name);

            var theTemplate = stbn_templates[tmplt];
            if(!theTemplate){
                theTemplate = stbn_templates['1ABM'];
            }

            if(theTemplate){
                theTemplate = theTemplate.replace("{__partner_name__}",partner_name);
                if(partner_discount){
                    theTemplate = theTemplate.replace("{__partner_discount__}",partner_discount);
                }
            }

            msg = theTemplate;

            return msg;
        }
        return false;
    }


    /**
     * @description - Get the default list of options for the banner.
     * @param {object} list - TrilogyBanners_SCTA_options, TrilogyBanners_FCTA_options, TrilogyBanners_STBN_options
     * @returns {object} - The UTM list of options or empty object.
     */
    function proccess_utm(list) {
        var utm_is = is_allowed_utm();
        var utm_list = param_get_utm_default(list);
        if(utm_list && utm_is && typeof utm_list[utm_is] != "undefined"){
            return utm_list[utm_is];
        }
        return {};
    }

    /**
     * @description - If value of URL param utm_source is allowed, return the value.
     * @returns {string|bool} - the allowed value or false
     */
    function is_allowed_utm() {
        var allowed_utms = ["facebook","campusphilly","linkedin"];
        if (allowed_utms.includes(banner_url_params.utm_source)) {
            return banner_url_params.utm_source;
        }
        return false;
    }

    /**
     * @description - Set the tracking_form_name global variable
     */
    function set_tracking_form_name(type, value){
        if(type && value){
            type = type.replace('msg_cv_', '');
            if(tracking_form_name == ""){
                tracking_form_name = "?";
            }else{
                tracking_form_name = tracking_form_name + "&";
            }
            tracking_form_name = tracking_form_name + type+"="+value;
        }
    }
    

// * UTILITY FUNCTIONS * //

    /**
      * @param {string} type - msg_cv_scta, msg_cv_fcta, msg_cv_stbn
      * @param {Object} list - TrilogyBanners_SCTA_options, TrilogyBanners_FCTA_options, TrilogyBanners_STBN_options
     */
    function param_get_default_list_message(type, list){
        trilogyLog("get_the_param_message type:", type , banner_url_params[type]);
        var default_list = param_get_default_list(list);
        if(banner_url_params[type] && default_list && typeof default_list.message != "undefined" && default_list.message[banner_url_params[type]]){
                trilogyLog("get_the_param_message return", default_list.message[banner_url_params[type]]);
                return default_list.message[banner_url_params[type]];
        }
        return false;
    }

    /**
     * @param {Object} list 
     * @returns {any|bool} - returns list.default_list value or false
     */
    function param_get_default_list(list){
        if( typeof list.default_list != "undefined" ){
            return list.default_list;
        }
        return false;
    }

    /**
     * @param {Object} list
     * @returns {any|bool} - returns list.default value or false
     */
    function param_get_default(list){
        if( typeof list.default != "undefined" ){
            return list.default;
        }
        return false;
    }

    /**
     * @param {Object} list
     * @returns {any|bool} - returns list.utm_default value or false
     */
    function param_get_utm_default(list){
        if( typeof list.utm_default != "undefined" ){
            return list.utm_default;
        }
        return false;
    }

    function stripcslashes(rawString) {
        return rawString;
    }

});
