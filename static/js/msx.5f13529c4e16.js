//Helper polyfill untill we upgrade to jscookie 3.X
var cookies = {
    get: function(name){
        return Cookies.get(name);
    },
    set: function(name, value){
        return Cookies.set(name, value, COOKIE_OPTIONS);
    },
    remove : function(name){
        return Cookies.remove(name, COOKIE_OPTIONS);
    }
}

var BOOTCAMP_PROGRAMS = {   
    "Careers in Technology"         : ["Coding","Cybersecurity","Data Analytics","FinTech","Tech Project Management"], 
    "Careers in Product Design"     : ["Product Management","UX/UI"],
    "Careers in Product Management" : ["Product Management","UX/UI"],
    "Careers in Marketing"          : ["Digital Marketing"]
};

/*
//Note: CB_PROGRAM_CATEGORIES determines what Boot_Camp_Selection and Career_Path_Selection are available.
    "Data" => "Data Analytics"
    "Tech Project Mgmt" => "Tech Project Management"
*/

var EMBARGO_COUNTRIES   = ['CU','IR','KP','SD','SY'];
var PREFERRED_COUNTRIES = ['US','CA','MX']; // List of country to move to top of dropdown
var GDPR_COUNTRIES      = [
    "AT", // Austria
    "BE", // Belgium
    "BG", // Bulgaria
    "HR", // Croatia
    "CY", // Cyprus
    "CZ", // Czech Republic
    "DK", // Denmark
    "EE", // Estonia
    "FI", // Finland
    "FR", // France
    "DE", // Germany
    "GR", // Greece
    "HU", // Hungary
    "IE", // Ireland
    "IT", // Italy
    "LV", // Latvia
    "LT", // Lithuania
    "LU", // Luxembourg
    "MT", // Malta
    "NL", // The Netherlands
    "PL", // Poland
    "PT", // Portugal
    "RO", // Romania
    "SK", // Slovakia
    "SI", // Slovenia
    "ES", // Spain
    "SE", // Sweden
    "GB", // United Kingdom
    "IS", // Iceland
    "LI", // Lichtenstein
    "NO", // Norway
    "BR", // Brazil
    "CO", // Colombia
    "SG", // Singapore
    "TH", // Thailand
    "AU", // Australia
    "HK", // Hong Kong
    "CN", // China
    "JP", // Japan
    "EG", // Egypt
    "IL", // Israel
    "KE", // Kenya
    "SA", // Saudi Arabia
    "ZA", // South Africa
    "TR", // Turkey
    "AE", // UAE - Federal
    "IN"  // India
];

// 
if(CB_REGION == 'EU'){
    PREFERRED_COUNTRIES=['GB','DE'];
}
else if(CB_REGION == 'AUS'){
    PREFERRED_COUNTRIES=['AU'];
    if( CB_CONSENT_STEP_VERSION == 'NonGDPR' ){
		var index = GDPR_COUNTRIES.indexOf('AU');
		if (index > -1) {
            GDPR_COUNTRIES.splice(index, 1);
            console.info('Removed AU from GDPR Countries');
        }
	}
}
else if(CB_REGION == 'CA'){
    PREFERRED_COUNTRIES=['CA','US'];
}
else if(CB_REGION == 'MX'){
    PREFERRED_COUNTRIES=['MX','US'];
}

var allowed_bootcamp_programs;
jQuery(function($){
    $('form select[name="Country"], form select[name="country"]').change(function(){
        if( $('option:selected',this).hasClass('gdpr') ){
            console.log('GDPR Country Selected');
            $(this).addClass('gdpr-country-selected');
            dynamicConsentSetGDPR();
        }else{
            if( $(this).hasClass('gdpr-country-selected')  ){
                $(this).removeClass('gdpr-country-selected');
                trilogyTrackingEvent('Form-Country', 'changed', "FromGDPRToNonGDPR");
            }
        }
    });
    
    $.validator.addMethod("consentByTelephone", function(value, element){
        // trilogyLog('consentByTelephone',value,element);
        var $element = $(element);
        var $f = $element.closest('form');

        var $phone = $f.find('input[name="phone"]').first();
        var phone_val =  $phone.val();
        var is_phone_required = $phone.attr('required');

        trilogyLog('consentByTelephone',phone_val,is_phone_required);

        if(phone_val.length || is_phone_required){
            $element.val(1);
        }else{
            $element.val(0);
        }

        return true; // Always valid, just set value to 1 or 0 based on phone value
    }, "Consent by Telephone is accepted if phone is provided");


    $.validator.addMethod("phoneMSX", function(phone, element){
        if(phone.length == 0){
            return true; //Allow empty phone, GDPR requirement
        }
        phone = phone.replace(/\s+/g, ''); // remove spaces
        phone = phone.replace(/-/g, ''); // remove dashes
        phone = phone.replace(/_/g, ''); // remove underscores
        phone = phone.replace(/\(/g, ''); // remove open parentheses
        phone = phone.replace(/\)/g, ''); // remove close parentheses

        trilogyLog('Validator phoneMSX val:'+phone+' Length '+phone.length);
        var repeated = phone.charAt(0).repeat(phone.length);
        if(repeated == phone){
            trilogyLog('Phone Repeated Digit');
            return false;
        }

        var iti = intlTelInputGlobals.instances[ $(element).data('intlTelInputId') ];
        var country = iti.getSelectedCountryData();
        
        if(country.iso2 == 'us'){
            var areacode = phone.slice(0, 3);
            if( -1 !== $.inArray(areacode, ['555','200','911']) ){
                trilogyLog('Phone Starts Bad Area Code '+areacode);
                return false;
            }
            //USA  Starting with 1
            if( phone[0] == '1' || phone[0] == '0'){
                trilogyLog('Phone Starts with 1 or 0');
                return false;
            }
            //Length of USA should be 8 Digits
            if(phone.length != 10){
                trilogyLog('Phone Invalid USA Length');
                return false;
            }
        }

        return true;
    }, "Please specify a valid phone number");

    if( USER_AGENT_BOT ){
        return;
    }
    if( window.intlTelInputGlobals ){
        var ALL_COUNTRIES = window.intlTelInputGlobals.getCountryData();
        var countries = ALL_COUNTRIES.map(function(c){
            var iso2 = c.iso2.toUpperCase();
            if (typeof STANDARD_COUNTRY_MAPPING_ISO2_INDEX != 'undefined'){
                if(STANDARD_COUNTRY_MAPPING_ISO2_INDEX[iso2]) {
                    var val = STANDARD_COUNTRY_MAPPING_ISO2_INDEX[iso2];
                    return {iso2:iso2,name:c.name,value:val}
                } else { 
                    trilogyLog('Removing country as not standard: ' + c.iso2 + ' ' + c.name)
                    return false;
                }
            }else{
                var val = c.name.replace(/\s*\(.*?\)\s*/g, '').trim();
                return {iso2: iso2, name:c.name, value: val}
            }
        }).filter(function(c){
            return c != false && EMBARGO_COUNTRIES.indexOf(c.iso2) == -1;
        });

        countries = countries.sort(function(a, b){
            return PREFERRED_COUNTRIES.indexOf(a.iso2) != -1 ? -1 : 0; //Sort the preferred first
        });

        //country_options should have an empty option?
        var country_options = countries.map(function(c){ 
            var option_attributes = '';
            if( GDPR_COUNTRIES.indexOf(c.iso2) != -1 ){ 
                option_attributes += ` class="gdpr" `; // always add gdpr class
                if ( typeof CB_GDPR_REGION_RESTRICTED != 'undefined' && CB_GDPR_REGION_RESTRICTED == true ) {
                    // TODO: Discuss with ROBERT.
                    option_attributes += ` title="Disabled due to GDPR" disabled `;      
                }
            }
            return `<option ${option_attributes} value="${c.value}">${c.name}</option>`;  
        });
        
        var $country_select = $('select.country_select');
        
        if( $('form.trilogy.contact').length ){
            $('select.state_province').prepend('<option value="" selected>State</option>');
            country_options.unshift('<option selected value="">Country</option>');
            $country_select.html(country_options.join("\r\n"));
            $country_select.change(countryChange).change();
        }
        else{
            $country_select.html(country_options.join("\r\n"));
            $country_select.selectpicker('refresh').on('changed.bs.select', countryChange);
            $country_select.first().trigger('change');
        }
        //console.log(country_options);

        $('input.phone-international').on('keydown',function(e){
            // Allow: backspace, delete, tab, escape, enter, +
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 32, 189]) !== -1 ||
                // Allow: Ctrl+A, Command+A
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: home, end, left, right, down, up
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                // let it happen, don't do anything
                return;
            }
            // if not a number, stop the keypress
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        });
    }
    else{
        console.warn('Missing intlTel');
    }
    //Should move everything above this line so we can remove msx.js and just use DynamicForm.js
    // TODO: Discuss with ROBERT.

    if( !$('form.msx-form').length ){
        console.log('No MSX or Iframe Forms');
        return;
    }
    
    console.log('Has MSX or Iframe Forms');

    if(typeof populateHighSchoolProgramsQuestions == 'function' ){
        populateHighSchoolProgramsQuestions();
    }

    if(CB_COHORTS.length < 1){
        $('form.msx-accel').addClass('backup-only');
        $('form.msx-accel .col_field_interest').hide();
        console.log('No Cohort, backup only');
        if(typeof Rollbar != "undefined"){
            Rollbar.warn('MSX - No Cohort');
        }
    }
    
    msxFormInit();
    acceleratorInit();

    $('.msx-form .msx-heading,.msx-form .form-progress,.msx-header').click(formLog);

    $('.msx-form').one('click keypress',function(){
		if( !$('body').hasClass('form-populated') ){
            console.log('MSX Populating IP');
			populateLeadSource();
			populateTimezoneOffset();
			populateIP();
			$('body').addClass('form-populated');
		}
		return true;
	});

    //Accesibility roles/labels inserted
    setAria("role", "combobox");
	setAria("role", "listbox");
    setAria("role", "option");


});

function initIntlPhone(selector){
    if(typeof window.intlTelInput == 'undefined'){
        console.log('intlTelInput not defined');
        return;
    }
    if( typeof selector == 'undefined' ){
        selector = "form input.phone";
    }
    //console.log('Init IntlTelInput on ',selector);
    var tel_inputs = document.querySelectorAll(selector); //TODO: Can limit this to inputs under form

    for( input of tel_inputs){
        //console.log('Init IntlTelInput for input:', input );
        
        var $input = $(input);
        if($input.data('intlTelInputId')){
            //console.log('Already Initialized');
            continue;
        }

        var intlTelInputOptions = { 
            // formatOnDisplay     : true,
            utilsScript: "/wp-content/themes/CodingBootcamp/media/js/intl-tel-input-18.2.1/build/js/utils.js",
            customEnableGeoIpLook: false,
            separateDialCode: true, // NOT WORKING IN SOME FORM VERSION
            excludeCountries    : EMBARGO_COUNTRIES.map(word => word.toLowerCase()),
            preferredCountries  : PREFERRED_COUNTRIES.map(word => word.toLowerCase()), // PREFERRED_COUNTRIES updates with GEO IP / OneTrust 
            // hiddenInput         : "phone",
        };

        // OPTIONS SET IN SERVER SIDE CODE PER SITE
        if (typeof TrilogyCustomIntlTelInputOptions != 'undefined') {
            
            Object.assign(intlTelInputOptions, TrilogyCustomIntlTelInputOptions);
            //console.log('School IntlTelInput Options', intlTelInputOptions);
            if(typeof intlTelInputGlobals.getCountryData != 'undefined'){
            
                var defaultCountry = intlTelInputOptions.initialCountry;
    
                if( intlTelInputOptions.initialCountry == "auto"){
    
                    if(typeof intlTelInputOptions.autoCountry != 'undefined'){
                        defaultCountry = intlTelInputOptions.autoCountry;
                    }
                    
                }
    
                if(typeof intlTelInputOptions.geoIpLookup == 'undefined'){
                    intlTelInputOptions.initialCountry = defaultCountry;
                }
                
                //trilogyLog('Intl Tel - defaultCountry', defaultCountry);
                
                countryList = intlTelInputGlobals.getCountryData();
                for (var i = 0; i < countryList.length; i++) {
                    if (countryList[i].iso2 === defaultCountry) {
                        defaultCountryData = countryList[i];
                        break;
                    }
                }
    
                if(typeof intlTelInputOptions.onlyCountries != 'undefined' && intlTelInputOptions.onlyCountries.length == 1 ){
                    if(intlTelInputOptions.initialCountry == intlTelInputOptions.onlyCountries[0]){
                        intlTelInputOptions.allowDropdown = false;
                    }
                }
                //trilogyLog('Intl Tel - defaultCountryData', defaultCountryData);
                selectedPhoneData = defaultCountryData;
            }
        }
        //console.info('IntlTelInput Options', intlTelInputOptions);

        $input.removeAttr('placeholder');
        var iti = window.intlTelInput(input, intlTelInputOptions); 
 
        setPhoneMask($(input), '', '');
        // event listeners
        $('.iti__flag-container').on('click', function(){
            var $phoneEl = $(this).closest('.iti').find('input.phone-international').first();
            //console.log('Clicked Flag', $phoneEl.attr('id'));
            $phoneEl.unmask();
        });


        input.addEventListener("countrychange",intlPhoneInputChangedCountry);
        input.addEventListener("countrychange",intlPhoneInputChange);
        input.addEventListener('keyup', intlPhoneInputChange);
        input.addEventListener('change', intlPhoneInputChange);
    }
}

function setPhoneMask($phoneEl, iso2, dialCode){
    //console.log('setPhoneMask', $phoneEl, iso2 );
    if(typeof $.mask !== 'undefined'){

        if (iso2 != null && iso2.length == 0) {
            var iti = intlTelInputGlobals.instances[ $phoneEl.data('intlTelInputId') ];
            var countryData = iti.getSelectedCountryData();
            iso2 = countryData.iso2;
        }

        if (iso2 == null || iso2.length == 0) {
            console.warn('setPhoneMask - No Country Data');
            return;
        }

        iso2 = iso2.toLowerCase();
        var phoneMasks = {
            "us": "(999) 999-9999",
            "ca": "(999) 999-9999",
            "mx": "999-999-9999",
        };

        if(typeof phoneMasks[iso2] == 'undefined' && dialCode == '1'){
            phoneMasks[iso2] = "(999) 999-9999";  // barbados, British isle, ect use 1 dial codes format
        }
        
        $phoneEl.unmask();
        $phoneEl.removeClass('masked-input');
        if(typeof phoneMasks[iso2] !== 'undefined'){   
            //console.log('Setting Mask', phoneMasks[iso2]);
            $phoneEl.mask(phoneMasks[iso2],{ dataName: $phoneEl.attr('id'), autoclear: false });
            $phoneEl.addClass('masked-input');
        }else {
            var phone = $phoneEl.val().replace(/\D/g, '');
            //console.log('No-Mask Setting Value', phone);
            $phoneEl.val(phone);
            
        }
        
    }
}

function intlPhoneInputChangedCountry(e){
    // console.log('intlPhoneInputChangedCountry', e, this.value, this);

    var currentItiId = $(this).data('intlTelInputId');
    var iti = intlTelInputGlobals.instances[ currentItiId ];
    var countryData = iti.getSelectedCountryData();

    if(typeof countryData.iso2 == 'undefined'){
        console.warn('intlPhoneInputChangedCountry - No Country Data');
        return;
    }

    // Set Mask Per Country selected 
    setPhoneMask($(this), countryData.iso2, countryData.dialCode);
    

    // SYNC COUNTRY SELECTIONS
    for (var itiID in intlTelInputGlobals.instances) { 
        if(currentItiId !== itiID){
            var otherItiOnpage = intlTelInputGlobals.instances[itiID];
            var otherCountryData = otherItiOnpage.getSelectedCountryData();
            if(otherCountryData.iso2 != countryData.iso2){
                otherItiOnpage.setCountry(countryData.iso2);
            }
        }
    }
}

function intlPhoneInputChange(){
    var itiID = $(this).data('intlTelInputId');
    var iti = intlTelInputGlobals.instances[ itiID ];

    var countryData = iti.getSelectedCountryData();
    var dialCode = countryData.dialCode;
    
    var phone = this.value;
    // remove all non-digits
    phone = phone.replace(/\D/g, '');
    if(phone != '' && dialCode && dialCode != 1){
        phone = '+'+dialCode+phone;
    }
    $(this).parents('.input.phone').find('input.actual_phone').val(phone);
    $(this).closest('.float-label').toggleClass('filled', phone!='');

}

function setStepProgress($form){
    var $steps = $form.find('.step');
    var totalSteps = $steps.length;
    var step = $steps.index( $steps.filter('.active') ) + 1;
    $('.progress_indicator div', $form).html(`Step ${step} of ${totalSteps}`);
    $('.progress_indicator progress', $form).val( Math.min(90,(step/totalSteps)*100) );
}

function acceleratorInit(){
    console.log('Accelerator Init');
    $('.msx-form .choose_cohort').selectpicker('refresh');//Required?

    $('.msx-form').each(function(){
        var $form = $(this);
        setStepProgress($form);
    });
    
    $('.msx-form button.next').click(function(){
        //console.log('Clicked Next');
        var $step = $(this).closest('.step');
        var $form = $(this).closest('form');
        if( stepValid($step) ){
            $step.removeClass('active').next().addClass('active');
            setStepProgress($form);
            //trilogyTrackingEvent('MSX', 'Next','Step'+$step.data('step'));
            trilogyTrackingEvent('MSX', 'Next Step - '+$step.data('step'), document.location.pathname);
        }
        else{
            //trilogyTrackingEvent('MSX', 'Next','Failed Step'+$step.data('step'));
            console.log('Current Step is Invalid');
            trilogyTrackingEvent('MSX', 'Step Invalid - '+$step.data('step'), document.location.pathname);
        }
        return false;
    });
    $('.msx-form button.prev').click(function(){
        //Dont need to validate if going backwards
        var $step = $(this).closest('.step');
        var $form = $(this).closest('form');
        $step.removeClass('active').prev().addClass('active');
        setStepProgress($form);
        trilogyTrackingEvent('MSX', 'Prev Step - '+$step.data('step'), document.location.pathname);
        return false;
    });

    function stepValid($step){
        return $step.find('input,select').valid();
    }
}

//----------------------

function msxFormInit(){
    console.log('msx Form Init');
    if( $('form.msx-accel').length ){
        console.log('Accelerator Form Page');
        $('form.msx-accel').each(function(){
            $(this).validate({
                submitHandler: msxSubmit,
                highlight : function(element, errClass){ $(element).parent().addClass('has-error'); },
                unhighlight: function(element, errClass){ $(element).parent().removeClass('has-error'); }
            });
        })
    }
    
    $('.msx-submit').click(msxSubmit);

    $('.msx-form select').selectpicker().on('changed.bs.select',function(e, clickedIndex, newValue, previousValue){
        if(newValue || this.value.length){ //filled if it has an initial value as well, so as long as this.value.length not empty
            $(this).closest('.bootstrap-select').addClass('filled').removeClass('has-error');
            $(this).closest('.bootstrap-select').children().last().closest('.error').hide();
        }
    });
    
    //Populate field of interest with all available
    var program_cats = CB_PROGRAMS.map(function(v){ 
        return v.program_category.replace('Tech Project Mgmt','Tech Project Management').replace('Data','Data Analytics'); 
    });
    
    //Filter out Duplicates
    program_cats = program_cats.filter(function(v,i){ return program_cats.indexOf(v) == i;  });
    var options = program_cats.map(function(v){ return `<option value="${v}">${v}</option>`; });
    if(options.length == 1){
        options[0] = options[0].replace('<option ','<option selected '); //Preselect the only option
        $('.msx-form .col_field_interest').addClass('single-field').hide();//Hide Field of interest since only one
    }
    else if(options.length < 1){
        if(typeof Rollbar != "undefined"){
            Rollbar.warn("No Program Options");
        }
    }
    options = '<option class="bs-title-option" value="">Which field most interests you?</option>'+options.join("\r\n");
    
    $('select.field_interest').html(options).selectpicker('refresh'); //Todo, narrow to current form?
    $('select.field_interest').on('changed.bs.select',function(e, clickedIndex, isSelected, previousValue){
        var v = $(this).val();
        //Set the hidden field based on this value.
        for(var p in BOOTCAMP_PROGRAMS){
            if(BOOTCAMP_PROGRAMS[p].indexOf(v) !== -1){
                $('input.career_path').val(p);
                break;
            }
        }
    }).trigger('change');    
    
    $('.msx-form select.field_interest').on('changed.bs.select', field_interest_changed).trigger('change');

    $('.msx-form select.cohort_id').change(cohortChanged).trigger('change');//Cohort is always outside prefill    

    formMoveQuestions();
}

function countryChange(e, clickedIndex, isSelected, previousValue){
    var v = $(this).val();
    var $f = $(this).closest('form');
    
    if( $f.hasClass('trilogy-lead-form') ){
        $f = $('form.trilogy-lead-form'); //Sync to All forms unless MSX
    }

    $state_prov = $f.find('select.state_province');
    if(v == 'United States'){
        $state_prov.val('');
        //$f.find('.state_prov_group').show();
        $state_prov.find('option.ca').hide();
        $state_prov.find('option.usa').show();
        $f.find('.state_prov_group .state_province').attr('required',true).attr('disabled',false).trigger('refresh');
    }
    else if(v == 'Canada'){
        $state_prov.val('');
        $state_prov.find('option.usa').hide();
        $state_prov.find('option.ca').show();
        //$f.find('.state_prov_group').show();
        $f.find('.state_prov_group .state_province').attr('required',true).attr('disabled',false).trigger('refresh');
    }
    else{
        $state_prov.val('');
        //$f.find('.state_prov_group').hide();
        $f.find('.state_prov_group .state_province').attr('required',false).attr('disabled',true).trigger('refresh');
    }
    
    if(typeof v != 'undefined' && $state_prov.data('selectpicker') ){ //Only Refresh selectpicker if already initialized
        $state_prov.selectpicker('refresh');
    }
}

function career_path_changed(){
    var v = $(this).val();
    
    var $form = (this).closest('form');
    var note_class = $('option:selected',this).data('note_class');

    //console.log('Changed career_path to '+v+' Note Class '+note_class);
    
    //Show Tooptip underneath
    $('.career_notes > div, .career_notes > span').hide();
    $('.career_notes .'+note_class).show();

    //Change bootcamps based on career interest
    var options = '<option disabled value="">Select a Career Interest First</option>';
    var allowed_program_cats = CB_PROGRAMS.map(function(v){ 
        return v.program_category.replace('Tech Project Mgmt','Tech Project Management').replace('Data','Data Analytics'); 
    });
    if( typeof BOOTCAMP_PROGRAMS[v] !== 'undefined' ){ 
        //Should also restrict based on available?
        //Should also preselect if only 1
        //console.log('Testing Output',BOOTCAMP_PROGRAMS[v]);
        options = BOOTCAMP_PROGRAMS[v].map(function(v){ 
            return  allowed_program_cats.includes(v) ? `<option value="${v}">${v}</option>` : ''; //Needs lots of verification
        }).filter(function(v){ return v; });
        
        if(options.length == 1){
            //Preselect the only option
            options[0] = options[0].replace('<option ','<option selected ');
        }
        else if(options.length < 1){
            if(typeof Rollbar != "undefined") {
                Rollbar.warn("MSX career_path_changed no options");
            }
        }
        options = options.join("\r\n");
        //console.log('Field Interst Options: ',options);
        //if only one option, should preselect
    }
    $('select.field_interest').html(options).selectpicker('refresh').trigger('change'); //Todo, narrow to current form?
}

function field_interest_changed(e, clickedIndex, newValue, previousValue){
    var $f = $(this).closest('form');
    popCohorts($f);
}



function formMoveQuestions(){
    console.info('Move Questions');

    $('.msx-form').addClass('accelerator');
    $('.msx-form input.form_type').val('MSX');
    $('.msx-form input.form_name').val('MSX - Accelerator');
    $('.msx-form input.last_form').val('Accelerator');

    $('.msx-form input.email_opt_in').change(function(){
        //Linked state to hidden tcpa field
        var checked = $('.msx-form input.email_opt_in').is(':checked');
        $('.msx-form input.tcpa_hidden').val(checked ? 1 : 0);
    });

    $('select.cohort_id').trigger('change'); //Fire the cohort change in case there is only one.

    $('.form-2').remove('d-none');

}

function formLog(){
    var $form = $(this).closest('form');
    //Get the form version
    var form_type = $form.find('input.last_form').val();
    console.log(`----------------[${form_type} Form Values]-------------`);
    console.log("University ID:\t"+$form.find('[name=university_id]').val() );
    
    console.log("Program:\t"+$form.find('[name=program]').val() );
    console.log("Campus:\t"+$form.find('[name=campus]').val() );
    console.log("Program Type\t: "+$form.find('[name=program_type]').val() );
    console.log("CohortID:\t"+$form.find('.cohort_id:input').val() );		
    
    console.log("Name First:\t"+ ($form.find('input[name=name_first]').val() || '')  );
    console.log("Name Last:\t"+  ($form.find('input[name=name_last]').val() || '') );	
    console.log("Phone:\t"+$form.find('input[name=phone]').val() );	
}

function leadBackup($f,isAsync){
    console.log('MSX leadBackup');
    $.ajax({
        url     : 'https://nest.edxbootcamps.com/api/record-lead/',
        method  : 'POST',
        async   : isAsync,
        data    : $f.serialize(),
        success : function(){
            var dupeCookieName = getDupeCookieName();
            var in30Minutes = 1/48;
            Cookies.set(dupeCookieName, 1, {path:'/', expires:in30Minutes});
        },
        error   : function(err){
            if(typeof Rollbar != "undefined") {
                Rollbar.critical("MSX Backup Failed", err);
            }
        }
    });
}

function getDupeCookieName(){
    return 'SUB_'+sha256(getUUID() + LAST_FORM_INFO.email);
}

function msxSubmit(){
    if(typeof populateBrowserSupport == 'function'){
        populateBrowserSupport();
    }
    var $f = $(this).closest('form');
    //Populate tcpa_content
    var tcpa_content = $f.find('.consent_copy').text().replace(/\s+/g,' ').trim();
    $('.msx-form input.tcpa_content').val(tcpa_content);
    var $tcpaInput = $f.find('input[name=tcpa]');
    var tcpaValue = tcpa_content.substring(0, 248);
    if($tcpaInput.length == 0){
        $tcpaInput = $('<input type="hidden" name="tcpa" value="'+tcpaValue+'" />');
        $form.append($tcpaInput);
    }else{
        $tcpaInput.val(tcpaValue);
    }


    console.log('msxSubmit');
	//Fire GOOGLE EVENT
    if( $f.valid() ){
        var cohort_id = $f.find('[name=cohort_id]').val();
        
        Cookies.set('last_cohort', cohort_id);
        
        LAST_FORM_INFO = {  //Global Object, used for Interaction Studio
            name_first  :   $f.find('[name=name_first]').val(),
            email       :   $f.find('[name=email]').val(),
            form_name   :   $f.find('[name=form_name]').val(),
            program_id  :   $f.find('[name=program]').val(),
            cohort_id   :   cohort_id
        }; 
        msxBeforeSubmit.call(this);

        var dupeCookieName = getDupeCookieName();
        if( $f.hasClass('accelerator') && cookies.get(dupeCookieName) == 1){ //If Accelerator, and has already submit for that cohort
            var form_type = $f.find('input.form_type').val();
            if(typeof swal == 'function'){
                swal('Duplicate Form Submission', duplicate_submit_msg, 'warning');
            }
            else{
                alert(duplicate_submit_msg);
            }
		    
		    trilogyTrackingEvent(form_type,'duplicate-submit', document.location.pathname);
		    return false; // Dont Submit, duplicate
        }
        
        $f.addClass('submitting');

        var $phone = $f.find('input[name="phone"]');
		var $phone_visible = $f.find('input[name="phone_visible"]');
		if( $phone.val() != $phone_visible.val() ){
			console.warn('Phone Number actual', $phone.val(), 'does not match visible', $phone_visible.val());
			if($phone.val().length == 0){
				console.warn('Phone Number actual is empty, use phone visible value.');
				$phone.val( $phone_visible.val() );
			}
		}

        // fix for consentByTelephone validation not working
        if($phone.val().length !== 0){ 
            $f.find('input[name="consent_by_telephone"]').val(1);
        }else {
            $f.find('input[name="consent_by_telephone"]').val(0);
        }

        var cohort_id = $f.find(':input[name="cohort_id"]').val();
		
        var $ft = $f.find('input[name="form_type"]');
        if( $ft.val() && $ft.val().indexOf('IMQ') == -1 ){
		    $ft.val( $ft.val() + ' IMQ' );
        }
		
		leadBackup($f, false);
		submitIMQ($f.get(0));
		return false;
    }
    else{
        trilogyTrackingEvent('MSX', 'Form Invalid', 	document.location.pathname);
        console.log('Form Invalid');
        return false;
    }
}

function popCohorts($form){
    //console.log('Called popCohorts');
    var tcpa_content = $form.find('.consent_copy').text().replace(/\s+/g,' ').trim();
    $('.msx-form input.tcpa_content').val(tcpa_content);
    var $tcpaInput = $form.find('input[name=tcpa]');
    var tcpaValue = tcpa_content.substring(0, 248);
    if($tcpaInput.length == 0){
        $tcpaInput = $('<input type="hidden" name="tcpa" value="'+tcpaValue+'" />');
        $form.append($tcpaInput);
    }else{
        $tcpaInput.val(tcpaValue);
    }

    var field_interest = $form.find('select.field_interest').val() || '';
    field_interest = field_interest.replace('Data Analytics','Data').replace('Tech Project Management','Tech Project Mgmt');
    //console.log(`Called popCohorts ${field_interest}`);
    var cohorts = field_interest ? CB_COHORTS.filter(function(c){ return c.program_category == field_interest }) : CB_COHORTS;

    var allowStartDates = $('body').hasClass('choose-start-date');
    if(!allowStartDates){
        //Program category already the same here
        var filter_cohorts = [];
        for(var i=1; i<cohorts.length; i++){
            var c1 = cohorts[i-1];
            var c2 = cohorts[i];
            if(c1.delivery_model == c2.delivery_model && c1.program_type == c2.program_type ){
                //Must be different by start date, prevent
                filter_cohorts.push(c2.cohort_id);
            }
        }
        if(filter_cohorts.length > 0){
            cohorts = cohorts.filter(function(c){ return filter_cohorts.indexOf(c.cohort_id) === -1; })
        }
    }
    //console.log(cohorts);
    /** Todo: Find the difference when multiple cohorts
     *  Scenario 1: Different Program Type
     *  Scenario 2: Different Dates
     */
    //Todo: Map this to our Program Cats as it isn't 1-to-1
    var cohort_html = '';
    for(var c of cohorts){
        var selected = cohorts.length == 1;
        cohort_html += `<option data-content="<span class=text>
							<span class=top><span class=prg>${c.program_category}</span> <span class=date>${c.date_start}</span></span>
						  	<div class=bottom><span class=prg_type>${c.program_type}</span>  <span class=dm>${c.delivery_model}</div>
						</span>"
				data-program="${c.program_id}"
            	data-program_type="${c.program_type}"
            	data-campus="${c.campus_id}"
            	data-program_category="${c.program_category}"
            	data-uni-program="${c.university_program_name_friendly}"
                ${selected ? 'SELECTED':''}
                value="${c.cohort_id}"
                >${c.program_category}</option>`;
    }
    //console.log( $form.find('select.cohorts').get(0) );
    $form.find('select.cohorts').html(cohort_html).selectpicker('refresh').trigger('change');
    //console.log('called popCohorts',cohorts);
    var showCohortCol = !(cohorts.length <= 1);
    if(!showCohortCol){
        //console.log('Would hide cohorts selection, 1 or less');
    }
    
    if( $form.find('select.field_interest').val() == '' ){
        showCohortCol = false; //Hide if we have no field of interest selected
    }

    $form.find('.cohort_col').toggle(showCohortCol);
}


function oneTrustGeoCheck(){
    if( typeof OneTrust == 'object' ){
        try{
            var geo = OneTrust.getGeolocationData();
            trilogyLog('oneTrustGeoCheck '+geo.country);
            geoBasedActions(geo.country);
        }catch(err){
            console.log(err);
        }
    }
}

