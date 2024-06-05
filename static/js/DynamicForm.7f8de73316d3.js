var duplicate_submit_msg = "Please note, you have already submitted this form within the last 30 minutes. We appreciate your patience and will contact you as soon as possible.";
var LEAD_STATUS_SENT = 100;
var formSubmitDataLayerObject;
var FORM_START_EVENT_TRIGGERED = false;

jQuery(function($){

	if(typeof CB_PROGRAMS != "undefined" ) {
		//console.log(CB_PROGRAMS);
		/* Sort by program namne */
		CB_PROGRAMS.sort(function (a, b) {
			if (a.program_name < b.program_name) {return -1;}
			if (a.program_name > b.program_name) { return 1;}
			return 0;
		});
		//console.log(CB_PROGRAMS);
		CB_PROGRAM_CATEGORIES = [];
		CB_PROGRAMS.forEach(function(p){ 
			CB_PROGRAM_CATEGORIES[p.program_id] = p.program_category;
		});

		CB_COHORTS = CB_COHORTS.map(function(c){
			c.program_category = CB_PROGRAM_CATEGORIES[c.program_id];
			return c;
		});
	}

	$('form [name="program"]').on('change', df_program_change);
	$('form.v2a [name="cohort_id"]').on('change', df_cohort_change);

	if( getUrlParameter('round_robin') == 1 || $('body').hasClass('cohort-round-robin') ){
		roundRobinCohorts();
	}
	if( getUrlParameter('round_robin') == 1 || $('body').hasClass('round-robin-program_type') ){
		roundRobinProgramType();
	}

	if(typeof initIntlPhone == 'function'){ 
		initIntlPhone('form input.phone-international');
	}

	function roundRobinProgramType(){
		console.log('Round Robin on Program Type');
		//For each program, see what the program types are
		for(var i=0;i<CB_PROGRAMS.length;i++){
			var prog = CB_PROGRAMS[i].program;
			var types = CB_COHORTS.filter(function(c){ return c.program == prog; }).map(function(c){ return c.program_type; });
			types = $.unique(types);
			//Now filter program type if multiple available for a program
			if(types.length > 1){
				//Choose a random number, and remove one type
				var randomType = types[Math.floor(Math.random()*types.length)];
				CB_COHORTS = CB_COHORTS.filter(function(c){ 
					return !(c.program_type == randomType && c.program == prog);
				});
				console.log('Removed '+prog+' '+randomType);
			}
		}

		//Do we have both Online Blended (a0V3f000000HDUjEAO) and Online (a0V41000006d12bEAA)?
		//If so, remove one of them
		var OB = CB_COHORTS.find(function(c){ return c.program_id == 'a0V3f000000HDUjEAO'; });
		var O  = CB_COHORTS.find(function(c){ return c.program_id == 'a0V41000006d12bEAA'; });
		if(O && OB){
			var flip = (Math.floor(Math.random() * 2) == 0);//Flip coin to decide which to remove
			var removeMe = flip ? O:OB; //Which one to remove.
			console.log('Online/Blended : Removing '+removeMe.program);
			CB_COHORTS = CB_COHORTS.filter(function(c){ return !(c.cohort_id != removeMe.cohort_id); });
			CB_PROGRAMS = CB_PROGRAMS.filter(function(p){ return !(p.program_id != removeMe.program_id); });
		}
		
	}

	function roundRobinCohorts(){
		
		//console.log('Before Filtering');
		//console.log(CB_COHORTS);
		var program_dms = [];
		//Loop over cohorts to get Delivery Models
		for(var i=0; i<CB_COHORTS.length; i++){
			var dm = CB_COHORTS[i].delivery_model;
			var p  = CB_PROGRAM_CATEGORIES[CB_COHORTS[i].program_id];
			//Create array if doesn't exist
			program_dms[p] = program_dms[p] ? program_dms[p] : [];
			if( -1 == program_dms[p].indexOf(dm) ){
				program_dms[p].push(dm);
			}
		}
		
		var dmPercentageInPerson = (typeof(TRILOGY_ROUND_ROBIN_PERCENTAGE) !== 'undefined') ? TRILOGY_ROUND_ROBIN_PERCENTAGE : 50;
		//If we have both DM's for a program, filter based on the random number
		var dmToKeep = (Math.floor(Math.random()*100) <= dmPercentageInPerson) ? 'In Person' : 'Online';
		//Log which we are removing
		console.log('Percentage In Person:'+dmPercentageInPerson+'% Keeping DM: '+dmToKeep);
		
		for(var p_cat in program_dms){
			if(program_dms[p_cat].length > 1){ //Only remove if more than one DM available
				CB_COHORTS = CB_COHORTS.filter(function(c){
					if(p_cat != c.program_category){
						return true;
					}
					if(c.delivery_model != dmToKeep){
						console.log('Removing Program:'+c.program);
						//Remove that program  
						var prg_index = TRILOGY_PROGRAM_CATEGORIES[c.program_category].indexOf(c.program_id);
						TRILOGY_PROGRAM_CATEGORIES[c.program_category].splice(prg_index,1);

						return false;
					} 
					return true;
				});
			}
		}
		//console.log('After Filtering');
		//console.log(CB_COHORTS);
		
		//Filter Available Delivery Models based on filtered cohorts
		var new_delivery_models = [];
		var cohort_count = CB_COHORTS.length;
		for(var i=0; i<cohort_count; i++){
			var c = CB_COHORTS[i];
			if( -1 == new_delivery_models.indexOf(c.delivery_model) ){
				new_delivery_models.push(c.delivery_model);
			}
		}	
		CB_DELIVERY_MODELS = new_delivery_models;
	}

	function isSingleStepForm(){
		return $('form.single-field-per-step').length > 0;
	}

	function filter_cohorts(options){
		var cohorts = CB_COHORTS;
		cohorts = cohorts.filter(function(c){
			if(options.delivery_model && c.delivery_model != options.delivery_model)
				return false;
			if(options.program_id && c.program_id != options.program_id)
				return false;
			if(options.campus_id && c.campus_id != options.campus_id)
				return false;	
			if(options.program_type && c.program_type != options.program_type)
				return false;
			return true;
		});
		
		return cohorts;
	}

	function program_change(){ //Set Value of others to same, populate campus
		var v			= $(this).val();
		var current_dm  = $(this).closest('form').find('select.delivery_modal').val();
		var cohorts 	= filter_cohorts({delivery_model:current_dm}); //If current_dm is empty, nothing gets filtered
		
		var html = '';
		var found = [];
		for(var i=0;i<cohorts.length;i++){
			var ch = cohorts[i];						
			var already_found = (-1 != $.inArray(ch.campus_id, found));
			if(ch.program_id == v && !already_found){				
				var selected = (ch.campus_id == CB_DEFAULT_CAMPUS) ? 'SELECTED':''
				html += '<option '+selected+' value="'+ch.campus_id+'">'+ch.campus+'</option>';
				found.push(ch.campus_id);
			}
		}
		
		if( !html.length ){
			found.push(CB_DEFAULT_CAMPUS);
			html += '<option  value="'+CB_DEFAULT_CAMPUS+'" selected>'+CB_DEFAULT_CAMPUS+'</option>';
			console.log('Cohorts not found for DM, Using Default Campus');
		}
		
		var $form = $(this).closest('form');
		if( $form.hasClass('single-field-per-step') ){

			$('form.single-field-per-step select.program').val( v ).selectpicker('refresh'); //Match Value on any other forms

			if(found.length > 1){
				html  = html;
			}
			$('form.single-field-per-step .campus_options select').html(html).val('').selectpicker('refresh');
			$('form.single-field-per-step .campus_options select').first().change();
		}
		else{
			//Populate Regular form
			$('form.trilogy-form-regular .program:input').val( v );	//Set others to same value
			$('form.trilogy-form-regular .campus_options select').html(html).change();
			//If only one Campus and Selected, hide dropdown
			if(found.length == 1 && $('form.trilogy-form-regular .campus_options select').val().length){
				$('form.trilogy-form-regular .campus_options').hide();

                $campusOptionParentEL = $('form.trilogy-form-regular.contact .campus_options').parent('div');
                //OPTION A: hide select
                $campusOptionParentEL.find('label').first().hide();
                //OPTION B: hide column
                $campusOptionParentEL.hide();
                $('.contact-form-cohorts .col-md-4').addClass('col-md-6').removeClass('col-md-4');
			}
			else{
				$('form.trilogy-form-regular .campus_options').show();

                $campusOptionParentEL = $('form.trilogy-form-regular.contact .campus_options').parent('div');
                //OPTION A: hide select
                $campusOptionParentEL.find('label').first().show();
                //OPTION B: hide column
                $campusOptionParentEL.show();
                $('.contact-form-cohorts .col-md-6').addClass('col-md-4').removeClass('col-md-6');
			}
		}
	}
	
	function campus_change(){ //Set Value of others to same, populate Program Type
		var $form = $(this).closest('form');
		var v = $(this).val();
		$('form.trilogy-lead-form select.campus').val( v ); //Set Value of others to same, populate Program Types
		
		var program_id = $form.find('select.program').val();
		var html = '';
		var found = [];
		
		//trilogyLog('------------');
		//Populate Program Types		
		for(var i=0;i<CB_COHORTS.length;i++){
			var ch = CB_COHORTS[i];
			var already_found = (-1 != $.inArray(ch.program_type, found));
			if( !already_found ){ 				
				//console.log(ch.program_type);
				//console.log('Campus: '+v);
				if(ch.program_id == program_id && ch.campus_id == v){					
					var selected = (ch.program_type == CB_DEFAULT_PROGRAM_TYPE) ? 'SELECTED':'';
					html += '<option value="'+ch.program_type+'" '+selected+'>'+ch.program_type+'</option>';
					found.push(ch.program_type);
				}
				else{
					//trilogyLog('Skipping '+ch.program_type);
				}
			}
		}

		if( !html.length ){			
			html += '<option value="'+CB_DEFAULT_PROGRAM_TYPE+'" SELECTED>'+CB_DEFAULT_PROGRAM_TYPE+'</option>';
		}
		
		//trilogyLog(program_id);
		//trilogyLog(html);
		if( isSingleStepForm() ){
			$('form.single-field-per-step').find('select.program_type').html(html).val('').selectpicker('refresh').change();
		}
		else{
			$('form.trilogy-form-regular select.program_type').html(html).change();
		}
		
		//Hide Program Types if only 1 option is possible for all cohorts
		if(CB_PROGRAM_TYPES.length == 1 && $('form.trilogy-lead-form select.program_type').val() ){
			$('form.trilogy-lead-form .program_type_options').hide();
		}
	}

	function program_type_change(){ //Set Values of Others to the same
		$('form.trilogy-lead-form .program_type:input').val( $(this).val() );
		if( $('body').hasClass('cohort-choose-date') || getUrlParameter('choose_cohort_date') ){
			var $form = $(this).closest('form');
			//Populate cohort date options based on start dates
			var program_id 		= $form.find('.program:input').val(); 	
			var program_type 	= $form.find('.program_type:input').val(); 
			var campus_id		= $form.find('.campus:input').val();
			var filtered_cohorts = filter_cohorts({program_id:program_id,program_type:program_type,campus_id:campus_id});
			var date_options = '';
			for(var i=0;i<filtered_cohorts.length;i++){
				var c = filtered_cohorts[i];
				var date = new Date(c.date_start+'T00:00:00');
				date_options += '<option value="'+c.date_start+'">'+(date.getMonth()+1)+'/'+date.getDate()+'/'+date.getFullYear()+'</option>';
			}
			$('select.cohort_date').attr('disabled', false).attr('required',true).html(date_options).val('').selectpicker('refresh');
		}
		else{
			//Disable the cohort start date field
			$('select.cohort_date').html('').attr('disabled', true);
			populate_cohort_id.call(this);

		}
	}

	function cohort_date_change(){
		//Sync any other forms
		$('form.trilogy-lead-form .cohort_date:input').val( $(this).val() );
		//populate_cohort_id();
		var pop_cohort = populate_cohort_id.bind(this);
		pop_cohort();
	}

	function populate_cohort_id(){ 
		var $form = $(this).closest('form');
		if( $form.hasClass('v2a') ){
			return;
		}
		var program_id 		= $form.find('.program:input').val(); 	
		var program_type 	= $form.find('.program_type:input').val(); 
		var campus_id		= $form.find('.campus:input').val();
		var cohort_date 	= $form.find('.cohort_date:input').val();
		var cohort_id 		= '';
		var bootcamp_name = $('.tcpa .bootcamp_name').html();
		var cohort = false;
		for(var i=0;i<CB_COHORTS.length;i++){
			var ch = CB_COHORTS[i];
			if(	
				program_id == ch.program_id
				&& 
				program_type == ch.program_type
				&&
				campus_id == ch.campus_id
				&& (!cohort_date || !cohort_date.length || cohort_date == ch.date_start)
			   ){
				cohort = ch;
				cohort_id = ch.cohort_id;
				bootcamp_name = ch.university_program_name_friendly || bootcamp_name;
				break;
			}		
		}
		$('.tcpa .bootcamp_name').html(bootcamp_name);
		
		$('.cohort_id:input').not('.locally-controlled').val(cohort_id).attr('disabled', (0 == cohort_id.length));
		
		if(cohort){
			var program_category = cohort.program_category.replace('Data', 'Data Analytics').replace('Tech Project Mgmt','Tech Project Management');
			var bootcamp = 'Careers in Technology';
			switch(program_category){
				case 'Digital Marketing': 	bootcamp = 'Careers in Marketing'; break;
				case 'UX/UI': 				bootcamp = 'Careers in Product Design';break;
				case 'Product Management': 	bootcamp = 'Careers in Product Design';break;
				default: bootcamp = 'Careers in Technology';
			}
			$('input.bootcamp_hidden').val(program_category);
			$('input.career_path_hidden').val(bootcamp);
		}
	}
	
	function before_form_submit(){
		console.log('> In before_form_submit');
		var email 		= encodeURIComponent( $(this).find('.email').val() );		
		var program_id = $(this).find('[name=program]').val();
		
		var thank_you_page = window.location.protocol+'//'+window.location.hostname+'/thank-you/';		
		var base_url = location.protocol+'//'+document.location.host;
		
		Cookies.set('last_cohort', $(this).find('[name=cohort_id]').val());

		var custom_thank_you = $('[name=custom_thank_you_url]', this).val();			
		if( custom_thank_you ){
			thank_you_page = custom_thank_you;
			if(thank_you_page.charAt(0) == '/'){
				thank_you_page = base_url+thank_you_page;
			}
		}
		else if( $(this).hasClass('multi-program') ){
			//todo: delete this, check contact us comment text
			//if( $(this).find('[name=lead_source_notes]').length ){
				//thank_you_page = base_url+'/thank-you/';
			//}
			//else {
				for (var i = 0; i < CB_PROGRAMS.length; i++) {
					var p = CB_PROGRAMS[i];
					if(p.program_id == program_id) {
						thank_you_page = base_url + p.thank_you_url;
					}
				}
			//}
		}

		$('form .return_url').val(thank_you_page).trigger('change');
		populate_cohort_id.call(this);

	
		//Custom params to be added to thank-you for Red Venture tracking 
		//Example : https://bootcamp.uncc.edu/cybersecurity/landing-full/?utm_source=mkt-partnership&utm_campaign=tes_aff_rvcplsite&utm_content=test
		if ( getUrlParameter('utm_source') === "mkt-partnership" 
			&& getUrlParameter('utm_campaign').includes("tes_aff_rvcplsite") 
			&& getUrlParameter('utm_content') !=='') { 	
			thank_you_page = thank_you_page.trim() +"?utm_source="+ getUrlParameter('utm_source') + "&utm_campaign=" + getUrlParameter('utm_campaign') + "&utm_content=" + getUrlParameter('utm_content');
			$('form .return_url').val(thank_you_page).trigger('change');
		}	



		return true;
	}
	
	function populate_program_categories(){
		var html = '';		
		
		var cats = Object.keys(TRILOGY_PROGRAM_CATEGORIES);

		/* Order by program name */
		var ordered = {};
		Object.keys(TRILOGY_PROGRAM_CATEGORIES).sort().forEach(function(key) {
			ordered[key] = TRILOGY_PROGRAM_CATEGORIES[key];
		});
		TRILOGY_PROGRAM_CATEGORIES = ordered;

		var selected = cats.length == 1 ? 'SELECTED=SELECTED':'';
		var selected_val = selected;
		var selected_by_param = false;

		var fs_program = getUrlParameter('fs_program');
		var accepted_regex = /[^\w]/gi;

		for(var cat in TRILOGY_PROGRAM_CATEGORIES){

			selected_val = selected;
			if(typeof fs_program != "undefined" && fs_program &&
				fs_program.toLocaleLowerCase().replace(accepted_regex, '') == cat.toLocaleLowerCase().replace(accepted_regex, '')){
				selected_val = 'selected=selected';
				selected_by_param = true;
			}

			html += '<option value="'+cat+'" '+selected_val+'>'+cat+'</option>';
		}
		
		$('select.program_category').html(html).selectpicker('refresh');
		
		if(cats.length > 1 && selected_by_param === false){
			$('select.program_category').selectpicker('val','');	
		}

	}
	
	function populate_delivery_models(){
		//Populate Delivery Models
		var DM_OPTIONS = '';
		var hasOnlineFirst = $('.delivery_model_options select').hasClass('delivery_model_order_e1');
		if (hasOnlineFirst) {
			CB_DELIVERY_MODELS.sort().reverse(); //reverse the order
		}
		for(var i=0; i<CB_DELIVERY_MODELS.length; i++){
			DM_OPTIONS += '<option value="'+CB_DELIVERY_MODELS[i]+'">'+CB_DELIVERY_MODELS[i]+'</option>';
		}
		
		if(CB_DELIVERY_MODELS.length == 1){
			var DM = CB_DELIVERY_MODELS[0];
		}
		else{
			var DM = 'In Person'; //Default to In Person
		}
		if( isSingleStepForm() ){ 
			if( CB_DELIVERY_MODELS.length > 1){
				DM_OPTIONS = DM_OPTIONS;
				DM = '';
			}
			else{
				DM_OPTIONS = '<option value="'+DM+'">'+DM+'</option>';
			}
		}
		
		$('.delivery_model_options select').html(DM_OPTIONS).val(DM);
		if( isSingleStepForm() ){
			$('.delivery_model_options select').selectpicker('refresh');
		}
	}

	function filter_delivery_models(){
		var $form = $(this).closest('form');
		var program_cat = $form.find('select.program_category').val();
		
		//Set other forms to same 
		$('select.program_category').val(program_cat).selectpicker('refresh');
		
		if( program_cat ){
			var options = [];			
			var programs = TRILOGY_PROGRAM_CATEGORIES[ program_cat ];
			for(var i=0;i<CB_PROGRAMS.length;i++){
				var p = CB_PROGRAMS[i];		
				if(
					-1 != $.inArray(p.program_id, programs) 	//Programs in cat has DM
					&&
					-1 == $.inArray(p.delivery_model, options) 	//Not already in array
				){
					options.push(p.delivery_model);
				}
			}
			var hasOnlineFirst = $('.delivery_model_options select').hasClass('delivery_model_order_e1');
			if (hasOnlineFirst) {
				options.sort().reverse(); //reverse the order
			}
			var html = options.map(function(v){ return '<option value="'+v+'">'+v+'</option>'; }).join('');
			
			$('.delivery_model_options select').html(html).val('').selectpicker('refresh');
		}
	}
	
	function determine_program($form){
		var program_cat = $form.find('select.program_category').val();
		var dm = $form.find('select.delivery_modal').val();		
		if(program_cat && dm.length){
			var programs = TRILOGY_PROGRAM_CATEGORIES[ program_cat ];
			var the_program = CB_PROGRAMS.filter(function(p){
				if( 
					p.delivery_model == dm
					&&
					-1 != $.inArray(p.program_id, programs) 
				){
					return true;
				}
				else{
					return false;
				}
			});
			if( the_program.length  < 1){
				//Not an error yet
				//throw("No Programs!");
			}
			else{
				if(the_program.length > 1){
					return the_program.map(function(r){ return r.program_id; })
				}
				else{
					return the_program[0].program_id; //Should there be only one?
				}
			}
		}
	}
	
	function populate_programs(){
		var current_dm = $(this).val();
		//console.log( $(this).closest('form').find('.program_category').get(0) );
		var current_program_category = $(this).closest('form').find('select.program_category').val();
		//console.log('DM:'+current_dm+' program cat:'+current_program_category);

		var programs_filtered = CB_PROGRAMS.filter(function(p){
			var isOnline = -1 !== p.program.indexOf('Online');

			if(current_program_category != p.program_category){
				return false;
			}
			//Program Category?
			if(current_dm == 'Online'){				
				return isOnline;//Filter out Non-Online
			}
			else{				
				return !isOnline;//Filter out Online
			}
		});
		
		var program_options = jQuery.map(programs_filtered, function(r){
			var name = isSingleStepForm() ? r.program : r.program_name;
			return '<option value="'+r.program_id+'">'+name+'</option>';			
		});

		//Regular Form
		$('form.trilogy-form-regular select.program').html( program_options.join("\r\n") );

		if( isSingleStepForm() ){ //This should always be the case
			
			$('.single-field-per-step .delivery_modal').not(this).val(current_dm); //Set other DM field
			var $form_single_field = $(this).closest('form');
			var program_id = determine_program($form_single_field);
			var $program_selects = $('.single-field-per-step select.program');
			//console.log('program_id',program_id);
			if(program_id){
				if(Array.isArray(program_id) && program_id.length > 1){
					//console.log('Multiple Programs for Category/DM!');
					//console.log(programs_filtered);
					//UGLY TEMPORARY SOLUTION
					//ToDo: Here we can see if only differ by program type. We already know they have same cat and DM. Create new program_options and change
					if(program_id.length == 2){
						//console.table(program_id);
						var p1 = CB_COHORTS.filter(function(c){ return c.program_id == program_id[0];})[0];
						var p2 = CB_COHORTS.filter(function(c){ return c.program_id == program_id[1];})[0];
						
						//TODO: Bug Here, both may be undefined //May not have cohorts for both programs, handle that edge case
						if(!p1 && !p2){
							console.log('Missing Program');
							program_options = [];
						}
						else if(typeof p1 === 'undefined'){
							program_options = ['<option value="'+p2.program_id+'">'+p2.program_type+'</option>'];
						}
						else if(typeof p2 === 'undefined'){
							program_options = ['<option value="'+p1.program_id+'">'+p1.program_type+'</option>'];
						}
						else if(p1.program_type != p2.program_type){
							program_options = [
								'<option value="'+p1.program_id+'">'+p1.program_type+'</option>',
								'<option value="'+p2.program_id+'">'+p2.program_type+'</option>',
							];
							$program_selects.selectpicker({title:'Choose Program Type'});
						}	
						$program_selects.html(program_options.join("\r\n") ).val('').selectpicker('refresh');
					}
					else{
						$program_selects.html(program_options.join("\r\n") ).val('').selectpicker('refresh');
					}
				}
				else{
					//Filter out anything that isnt
					$program_selects.html( '<option value="'+program_id+'">'+program_id+'</option>' )
						.val(program_id)
						.selectpicker('refresh');
				}
			}
			else{ //program_id should be empty here right?
				$program_selects.html( program_options.join("\r\n") )
					.val(program_id)
					.selectpicker('refresh');
			}
			
		}
		else{
			if( program_options.length == 1 ){				
				$('form.trilogy-form-regular .program_options').hide();
				var firstVal = $form_single_field.find('.program_options option:first-child').val();
				$form_single_field.find('.program_options').val(firstVal);
			}
			else{
				$('form.trilogy-form-regular .program_options').show();
			}
		}
		
		$('form.dynamic .program').first().change();
	}

	function capitalizeNameFields(e){
        trilogyLog('> In Form Submit Capitalize Name');
        //Capitalize first letter
        var fname = $(this).find('[name=name_first],[name=first_name]');
        var lname = $(this).find('[name=name_last],[name=last_name]');

        if(typeof fname != 'undefined' && fname != ''){
            var fname_val = fname.val().trim();
            fname.val(fname_val.substr(0,1).toUpperCase()+fname_val.substr(1).toLowerCase());
        }

        if(typeof lname != 'undefined' && lname != ''){
            var lname_val = lname.val().trim();
            lname.val(lname_val.substr(0,1).toUpperCase()+lname_val.substr(1).toLowerCase());
		}
		return true;
	}

	if($('form.dynamic').length < 1){
		console.log('No Dynamic Forms');
		return;
	}else{
		 /* Accessibility on focus for WCAG */
		 $('.get-program-info input, .get-program-info select, .get-program-info button, .form-get-info input, .form-get-info select').focus(function() {
			 //TODO: will have to work with designers if they are ok with transparent/white or a distinct color for each form
			$(this).css("outline", "transparent");
		}).focusout(function() {
		$(this).css("outline", "none");
	  });
	}

	$('form.trilogy-lead-form input:radio.age_18_plus').change(function () {
		//sync age_18_plus
		$('form.trilogy-lead-form input:radio[value="'+$(this).val()+'"].age_18_plus').prop("checked", true);
	});

	$('form.trilogy-lead-form select.highest_level_of_education').change(function () {
		//sync highest_level_of_education
		$('form.trilogy-lead-form select.highest_level_of_education').not(this).val($(this).val()).selectpicker('refresh');
	});


    $('form').submit(capitalizeNameFields);
	$('form.dynamic').not('.contact').submit(before_form_submit);
	$('form.dynamic').not('.contact').submit(submit_trilogy_record);
	
	//FOR DEBUG	
	$('.single-field-per-step .progress, form .steps, .log-form-values').click(function(){
		var $form = $(this).closest('form');
		console.log('----------------[Form Values]-------------');
		console.log('University ID: '+$form.find('[name=university_id]').val() );
		if( !$form.hasClass('v2a') ){
			console.log('Program Category: '+$form.find('select.program_category').val() );		
			console.log('Delivery Model: '+$form.find('select.delivery_modal').val() );		
		}
		console.log('Program: '+$form.find('[name=program]').val() );
		console.log('Campus: '+$form.find('[name=campus]').val() );
		console.log('Program Type: '+$form.find('[name=program_type]').val() );
		console.log('CohortID: '+$form.find('.cohort_id:input').val() );		
		if( $form.find('[name=cohort_date]').length ){
			console.log('Start Date: '+$form.find('[name=cohort_date]').val() );
		}
		console.log('Name First: '+$form.find('input[name=name_first]').val() );		
		console.log('Name Last: '+$form.find('input[name=name_last]').val() );		
		console.log('Phone: '+$form.find('input[name=phone]').val() );		

	});
	
	if(CB_COHORTS.length < 1){
		var ALLOW_NO_COHORTS = $('body').hasClass('allow-no-cohorts');
		if( !ALLOW_NO_COHORTS ){
			console.log('*********** ');
			console.log('%c No Cohorts! ', 'background: #222; color: red; font-size: 48px;');
			console.log('***********');
		}												

		/*
		if(typeof Rollbar != "undefined" && !ALLOW_NO_COHORTS){
            //Rollbar do not trigger in dev env.
            var domain_segments = window.location.hostname.split('.');
            var domain_tld = domain_segments[domain_segments.length-1];
            var domain_name = domain_segments[domain_segments.length-2];

			if(domain_name !== 'harvard' && domain_name !== 'bootcampsearch'){

				if(domain_tld == 'test' || domain_segments[0] == 'localhost' || (domain_tld == 'com' && domain_name == 'trilogyed')) {
					//dev
					Rollbar.info("Staging Critical: No Cohort on page. " + window.location.href, window.location.href);
				}else{
					//production
					if($('body').hasClass('post-status-draft') || $('body').hasClass('post-status-pending') || $('body').hasClass('post-status-private')){
						Rollbar.warn("Page is Drafted - Critical: No Cohort on page. " + window.location.href, window.location.href);
					}else{
						Rollbar.critical("Critical: No Cohort on page. " + window.location.href, window.location.href);
					}
				}

			}
		}
		*/

		$('.delivery_model_options').remove(); //No Delivery Model Options
		$('.step .program_category').remove(); //No Program Categories

		//Set all to use defaults
		trilogyLog('Using Default Campus/Program');
		var $pn 	= $('form.dynamic .program.primary');
		var $pn2 	= $('form.dynamic .program.duplicate');
		var $pt 	= $('form.dynamic .program_type'); 
		var $cn 	= $('form.dynamic .campus'); 
		
		var program_name 	= $pn.attr('name');
		var campus_name		= $cn.attr('name');
		var program_type	= $pt.attr('name');
		var program_dup		= $pn2.attr('name');
		
		$pn.replaceWith('<input type=hidden name="'+program_name+'" value="'+CHOSEN_PROGRAM+'">');
		$pn2.replaceWith('<input type=hidden name="'+program_dup+'" value="'+CHOSEN_PROGRAM+'">');
		$cn.replaceWith('<input type=hidden name="'+campus_name+'" value="'+CB_DEFAULT_CAMPUS+'">');
		$pt.replaceWith('<input type=hidden name="'+program_type+'" value="'+CB_DEFAULT_PROGRAM_TYPE+'">');
		
		$('.program_options, .campus_options,.program_type_options, .contact-form-cohorts').hide();
		
	}
	else{

		CB_PROGRAM_TYPES = jQuery.unique( jQuery.map(CB_COHORTS,function(e){ return e.program_type; }) );

		if( isSingleStepForm() ){
			populate_program_categories();
			populate_delivery_models();		
			$('form.dynamic select.program_category').change(filter_delivery_models);
			$('.delivery_model_options select').change(populate_programs).first().change();			
		}
		else{
			var fs_program = getUrlParameter('fs_program');
			var accepted_regex = /[^\w]/gi;

			var program_options = jQuery.map(CB_PROGRAMS, function(r){
				var selected_val = '';

				if(typeof fs_program != "undefined" && fs_program &&
					fs_program.toLocaleLowerCase().replace(accepted_regex, '') == r.program_name.toLocaleLowerCase().replace(accepted_regex, '')){
					selected_val = 'selected=selected';
				}

				return '<option value="'+r.program_id+'" '+selected_val+'>'+r.program_name+'</option>';
			});
			
			$('select.program').html( program_options.join("\r\n") );
			if( program_options.length == 1 ){
				$('.lead_form .program_options').hide();
			}
		}
		
		$('form.dynamic select.campus').change(campus_change);
		$('form.dynamic select.program_type').change(program_type_change);	
		$('form.dynamic select.program').change(program_change).first().change();//This should fire the other 2 above change
		
		$('form.dynamic select.cohort_date').change(cohort_date_change);

		if( CB_COHORTS.length == 1){
			trilogyLog('One Cohort: Hiding Program,Campus on Forms, and Cohorts on Contact Form');
			$('form.trilogy-form-regular').find('.campus_options, .program_type_options, .contact-form-cohorts').hide();
		}
		
	}
	

	if( isSingleStepForm() ){
		populateOptionalQuestions();
		populateHighSchoolProgramsQuestions();
		//Keep Name fields in sync with each other
		$('form.single-field-per-step').find('.first-name, .last-name, .email, .phone-number').change(function(){
			var v = $(this).val();
			var n = $(this).attr('name');
			$('form.single-field-per-step [name='+n+']').val(v);
		});
	} 
	
	populateFormTrackingType(); 

	//-------------LeadForm.js
	$('form.trilogy-lead-form').each(function(){
        $(this).validate({
            ignore: ['.ignoreValidation'],
			errorPlacement: function(err, element){
                //console.log('in error placement');
				var container = $(element).closest('form').find('.trilogy_error_container');
                container.append(err);
				//err.insertAfter(element); //Default Code
				//err.insertAfter(container)				
			},
			onfocusout: false,
			showErrors: validationShowErrors
		});
	});
    
	$('form.trilogy.contact').submit( before_form_submit );
	$('form.trilogy.contact').submit( submit_trilogy_record );
	$('form.trilogy.contact').validate({
		ignore: ['.ignoreValidation'],
		onfocusout: false,
    });
	
	$('.lead_form select.lead_persona').change(function(){
		//Sync Other Forms
		var v = $(this).val();
		console.log('Persona Switched to: '+v);
		$('.lead_form select.lead_persona').not(this).val( v ).selectpicker('refresh');
	});

    if( $('form.single-field-per-step').length){
        $('.single-field-per-step').on('click','button.button', submit_single_field_form);
		$('.trilogy-form-regular button.button').click(submit_lead_form);
		$('form.single-field-per-step select:not(.no-selectpicker)').selectpicker({ });
		$('form.single-field-per-step select').not('.bs-multiple,.no-submit').change(function(){
			if( $(this).is(':visible') ){                
				submit_single_field_form.call(this); 
                sfps_button_event.call(this);
			}
		});

		$('form.single-field-per-step').on('click','.back', single_field_form_back);
        
		/*
		//Disable equal step height per request 6/19/2018
        var ssHeight = $('form.single-field-per-step .step').height();
		$('form.single-field-per-step .step').each(function(){
			var h = $(this).height();
			if( h  > ssHeight ){
				ssHeight = h;
			}
		});
		$('.step, .step-container', this).css('min-height', ssHeight);
        */
		
		//Auto Step through any 1 entry populated steps
        $('form.single-field-per-step').first().each(sfps_find_first_step);
		$('form.single-field-per-step').on('click','button.button',sfps_button_event);   

		// Answer # quick questions about yourself. It takes less than a minute!
		var $form_sfps_v2a = $('#form_v2a_1 form.single-field-per-step.v2a');
		df_count_form_questions($form_sfps_v2a);
    }
    else{

        //---Google Events
		$('.lead_form .step button').click(drip_button_event);
		
        $('.lead_form button.button').click(submit_lead_form);
    }

    $('form.trilogy.contact button.button').click(function (e) {
		trilogyLog('in contact button.button');
        var $form = jQuery(this).closest('form');
		if(!$form.valid()){ return false; }
		$form.trigger('trilogy_form_submit');
		//Check for Duplicate here
		return true; //preventDuplicateSubmit($form);
    });
	
	//Set aria-attributes (attribute Target element, attribute target element value )
	setAria("role", "combobox");
	setAria("role", "listbox");

	//remove aria-attributes (attribute Target element, attribute target element value )
	//radio field set should have aria-required before form submission. (<fieldset aria-required="true">)
	removeAria("role", "radio");
	
	//Capture Enter key on SSF, and regular form
	$("form.single-field-per-step input, form.trilogy-form-regular input").bind("keypress", function (event) {
		if (event.keyCode == 13) {
			event.preventDefault();
			var nextButton =  $(event.target).closest('.step').find('button.button');
			nextButton.click();
		}
	});

	//Sync Country Selection to Other Forms
	$('form.trilogy-lead-form').on('change','select.country_select',function(){
		var v = $(this).val();
		var $s = $('form.trilogy-lead-form select.country_select').not(this);
		if( $s.data('selectpicker') ){
			$s.selectpicker('val',v);
		}
		else{
			$s.val(v);
		}
	});
	//Sync State Selection to Other Forms
	$('form.trilogy-lead-form').on('change','select.state_province',function(){
		var v = $(this).val();
		var $s = $('form.trilogy-lead-form select.state_province').not(this);
		if( $s.data('selectpicker') ){
			$s.selectpicker('val',v);
		}
		else{
			$s.val(v);
		}
	});

	//Sync select question
	$('form.trilogy-lead-form').on('change','select.select-sync-question',function(){
		var v = $(this).val();
		var name = $(this).attr('name');
		var $s = $('form.trilogy-lead-form select[name="'+name+'"]').not(this);
		if( $s.data('selectpicker') ){
			$s.selectpicker('val',v);
		}
		else{
			$s.val(v);
		}
	});
	
	$('form.v2a [name="program"]').trigger('change');
    
});

function df_count_form_questions($form){
	if($form.length > 0){
		var question_selectors = [
			".step-container .step:not(.no-inputs) .input.ico input[required]", 
			".step-container .step:not(.no-inputs) .input.select select[required]", 
			".step-container .step:not(.no-inputs) [role=\"radiogroup\"] input[type=\"radio\"][required]:first",
		];
		var $formQuestions = $form.find(question_selectors.join(","));
		$formQuestions = $formQuestions.filter(function(i, el) {
			return $formQuestions.filter("#" + el.id).index(el) === 0;
		});
		var formQuestionsCount = $formQuestions.length;
		trilogyLog('2A form Questions Count: ', formQuestionsCount,  $formQuestions);
		$('.trilogy-lead-form .question_count').html(formQuestionsCount);
		if ( $('.trilogy-lead-form.single-field-per-step .step_count').length > 0 ) {
			setProgress($form);
		}
	}
}

function df_cohort_change(){
	var $t = $(this);
	var cohort_id = $t.val();
	var $form = $t.closest('form');

	console.log("***** COHORT CHANGED To val("+cohort_id+")");

	var $o = $('option:selected',this);
	if( $form.hasClass('v2a') ){
		$form.find('input[name="program_category"]').val( $o.data('program_category') );
	}
}

function df_program_change(){
	var $t = $(this);
	var program_id = $t.val();
	var $form = $t.closest('form');

	console.log("***** PROGRAM CHANGED To val("+program_id+")");
	
	df_toggle_form_questions($form, program_id);
	
}

function df_toggle_form_questions($form, program_id){
	const AI_PROGRAMS = ['AI MicroBootCamp','Artificial Intelligence'];
	var PROGRAM = CB_PROGRAMS.filter(function(p){ return p.program_id == program_id })[0]
	if( typeof PROGRAM != "undefined" && AI_PROGRAMS.includes(PROGRAM.program_category) ){
		console.log('AI Program Chosen');
		addPythonQuestion($form);
	}
	else{
		//Remove the question
		$('form.form-1a, form.v2a, form.msx-form, form.contact').find('.step-python, .python_exp_question').remove();
	}
	if( $form.hasClass('v2a') ){
		df_count_form_questions($form);
	}
}

function addPythonQuestion($form){

	//If Form already has question, skip
	if( $form.find('.python_exp_question').length ){
		console.log('Form Already has Python Question');
		return false;
	}

	var id = 'coding_skill_level_python_'+Math.floor(Math.random() * 100);

	var html = '';
	if( $form.hasClass('msx-form') ){
		html += `<div class="input python_exp_question">`;
	}else{
		html += `<div class="input select python_exp_question">`;
		html += `<label class=sr-only for="${id}">Python experience level?</label>`;
	}
	html += `<select title="Python experience level?" 
				name=coding_skill_level_python 
				required 
				class="python_exp no-submit select-sync-question" 
				aria-label="Python Experience"
				id=${id}
			>
			<option value="None">None</option>
			<option value="Beginner">Beginner</option>
			<option value="Intermediate">Intermediate</option>
			<option value="Expert">Expert</option>
		</select>`;
	if( $form.hasClass('msx-form') ){
		html += `<label for="${id}">Python experience level? <sup>*</sup></label>`
	}
	html += `</div>`;
	
	
	if( $form.hasClass('v2a') ){
		$form.find('.step-location .inner').prepend(html);
	}
	else if( $form.hasClass('form-1a') ){
		$(`<div data-step="step-python" class="step step-python python_exp_question">
			<div class=inner>${html}
				<div class="actions"><button type="button" class="button" title="Continue" style="outline: none;">Next</button><a class="back" href="#"><span>Back</span></a></div>
		</div>`).insertBefore($('form.form-1a').find('.step-location') );
	}
	else if( $form.hasClass('msx-form') ){
		$(`<div class="col-xs-12 col-md-6 float-label python_exp_question">${html}</div>`).insertBefore($('form.msx-form').find('.step2 .buttons-container'));
	}
	else if( $form.hasClass('contact') ){
		$form.find('.contact-form-cohorts').append(`<div class="col-md-6 python_exp_question"><label>Python experience level?</label>${html}</div>`)
	}
	var selectpicker = $('form.form-1a, form.v2a, form.msx-form').find('.python_exp').selectpicker('refresh'); // contact form does not use selectpicker
	if( $form.hasClass('msx-form') ){
		selectpicker.on('changed.bs.select',function(e, clickedIndex, newValue, previousValue){
			if(newValue || this.value.length){ //filled if it has an initial value as well, so as long as this.value.length not empty
				$(this).closest('.bootstrap-select').addClass('filled').removeClass('has-error');
				$(this).closest('.bootstrap-select').children().last().closest('.error').hide();
			}
		});
	}
}

function populateFormTrackingType(){
	var $form = $('form.trilogy-lead-form');
	if( !$form.length ){
		return false;
	} 
	var $ft = $('form.trilogy-lead-form .form_type');
	var fcat = $ft.val(); //Get form type
	//Populate extra info for optional form questions
	if( $form.find('.step-container .step-contact-method').length ){ fcat += ' cm'; }
	if( $form.find('.step-container .step-persona').length ){ fcat += ' PSNA'; }
	if( $form.find('.step-container .step-buyer-readiness').length ){ fcat += ' rdy'; }
	if( $form.find('.step-container .step-highest-level-of-education').length ){ fcat += ' edu'; }
	if( $form.find('.step-container .step-zip').length ){ fcat += ' zip'; }

	if( $form.find('.step-container .hs-steps').length ){ fcat += ' HS'; }
	if( $form.find('.step-container .step-age-18-plus').length ){ fcat += ' 18-plus'; }
	if( $('body').hasClass('cohort-choose-date') ){ fcat += ' date';}
	$ft.val(fcat);
}

function validationShowErrors(errMap, errList){
    if( this.numberOfInvalids() > 0 ){
        $(this.currentForm).addClass('invalid');
    }
    else{
        $(this.currentForm).removeClass('invalid');
    }
    this.defaultShowErrors();    
}

function sfps_button_event(){
	var $step = $(this).closest('.step');
	var hasErrors = $step.find(':input.error').length;
	var $form = $(this).closest('form');
	var eCat = $form.find('.form_type').val();//Event Category
	
	//grab next step   
	var $nextStep = $step.next('.step');
    if(!hasErrors && window.ga && ga.create){
		var step = $step.data('step').replace('step-','');

		//form_start_event($form);
	
		if($nextStep.length >= 1){
			//if no errors go to next step and focus next input field
			$nextStep.find('input:not([type=hidden])').first().focus();
		}

		trilogyTrackingEvent(eCat, step, document.location.pathname);

		//if form has errors put focus on same input field
    }else if(hasErrors){
		$step.find('input:not([type=hidden])').first().focus();
	}
}

function form_start_event($form){
	var form_name 	= $form.find('.form_name').val();
	var eCat 		= $form.find('.form_type').val();
	if( !FORM_START_EVENT_TRIGGERED ){
		var formStartDataLayerObject = {
			event: 'form_start', //trigger event
			form_type: eCat, // 1a / 2a / iframe / contact 
			form_location: form_name,  //widget" / "header" / "footer" / "content-body"
			geo_restriction: GEO_RESTRICTION, //"gdpr" or "nongdpr"
			form_destination: 'imq', //GA Native Param  - (IMQ)
		};
		pushToDataLayer(formStartDataLayerObject);
		FORM_START_EVENT_TRIGGERED = true;
	}
}

function drip_button_event(){
    if (window.ga && ga.create) {
		var step = $(this).closest('.step').data('step');
		trilogyTrackingEvent('Drip Form', 'Drip Step '+step, location.pathname);
	}
}

function sfps_step_has_options($step){
    var hasInputs = $step.find('input:not([type=hidden])').length > 0;
    var hasSelect = $step.find('select option:not([value=""])').length > 1; //1 options would aleady be selected
    return hasInputs || hasSelect;
}

function sfps_find_first_step(){
    var $active = $('.step.active', this);
    if( !sfps_step_has_options($active) ){      //if active step does not have options
        //Mark as no-inputs, so progress set properly
        //$active.addClass('no-inputs'); 
        var stepClass = $active.data('step');
        $('.single-field-per-step .step.'+stepClass).addClass('no-inputs');
        /*
        var $prev = $active;
        var $next = $active.next('.step');
        var backOk = false;        
        //$('.'+$next.data('step')).find('.back').hide();		
		while( $next.length && !backOk ){
			if( sfps_step_has_options($next) ){
                $('.'+$next.data('step')).find('.back').hide();
                backOk = true;
            }
            //console.log('Removing Back on: '+$prev.data('step'));
            //$('.'+$prev.data('step')).find('.back').hide();
			$prev.find('.back').hide();
			$prev = $next;
			$next = $next.next('.step');
		}
        */
		submit_single_field_form.call( $active.find('button.button').get(0) );
    }
}

function single_field_form_back(){
    var $step = jQuery(this).closest('.step');    
    var $prev = $step.prev('.step');
    var stepFound = false;        
    do{            
        if( 
			$prev.find('input:not([type=hidden])').length 				//Input, but not hidden
			|| 
			$prev.find('select option:not([value=""])').length > 1 		//Select, that isn't blank
			
		){
			stepFound=true;
			
        }
        else{
            $prev = $prev.prev('.step');
        }
    }while( !stepFound && $prev.length );

    if( $prev && stepFound){
        var prevStepClass = $prev.data('step');
        $('form.single-field-per-step .step').removeClass('active');
        $('form.single-field-per-step .step.'+prevStepClass).addClass('active');
		//$prev.addClass('active');    

		//focus input field that is on current step from hitting "back"
		$prev.find('input:not([type=hidden])').focus();
		        
    }
    else{
        console.log('Nothing to go back to');
    }
    
    var $form = $step.closest('form');
    $('form.single-field-per-step').removeClass('invalid');
    
    setProgress( $form );

    return false;
}

function submit_single_field_form(){
	trilogyLog('> In submit_single_field_form');
	var $form = jQuery(this).closest('form');
    var $step = jQuery(this).closest('.step');
    var currentForm = this.form;
    
    //Check the inputs on the current step
    if( !$(':input', $step).valid() ){
        scroll_to_form_error_container(currentForm);
        return false;
    }

    //Is this the last step?
    var stepCount = $form.find('.step').length;
    var currentStep = $form.find('.step').index( $step )+1;
    
	if( currentStep == stepCount ){ //On Last Step
        if( $form.valid() ){
			//Manually Calling form_do_submit
			//form_do_submit($form);
            $form.trigger('trilogy_form_submit');

			return true; //Allow normal form submit process
        }
        else{
            scroll_to_form_error_container(currentForm);
            return false;
        }
    }
    else{
        //Go to Next Step with an input or selectable options
        var $next = $step.next('.step');
        var stepFound = false;
        
        do{
            var nextClass = '.single-field-per-step .step.'+$next.data('step');
            if( sfps_step_has_options($next) ){
                stepFound=true;
                $(nextClass).removeClass('no-inputs');
            }
            else{                
                var $select = $next.find('select');                
                var theValue = $select.find('option:not([value=""])').val();
                $select.val( theValue ).change(); //Auto Step foreward if only 1 choice
                
                $(nextClass).addClass('no-inputs');
                $next = $next.next('.step');
            }
        }while( !stepFound && $next.length );
       
        var stepClass = $next.data('step');        
        
        $('.single-field-per-step .step').removeClass('active');//Change active step on all forms        
        $('.single-field-per-step .step.'+stepClass).addClass('active');  //Set Active Step on all Forms      

    }

    //Set Progress
    setProgress($form);

    return false;
}

function setProgress($form){
	try{
		var $steps      = $form.find('.step:not(.no-inputs)');
		var activeStep  = $steps.index( $form.find('.step.active') );
		
		$('form input.current_step').val($form.find('.step.active').data('step'));

		var stepCount   = $steps.length;
		
		var progress = Math.round( ( (activeStep+1) / stepCount) * 100 );
		var $p = $('.single-field-per-step .progress');
        
		$('.trilogy-lead-form  .step_count').html(stepCount);
		$('.trilogy-lead-form  .current_step_number').html(activeStep+1);

		if( $form.hasClass('v2a') || $form.find('.form-indicator .progress-percent').length ){
			if(activeStep == 0){
				progress = 5;
			}
			else{
				progress = Math.max(5, progress);
			}
			
			if( (activeStep+1) == stepCount){
				progress = 95;
			}
			$p.find('progress').val(Math.min(95,progress));
			
		}
		else{
			progress = Math.min(progress,95);
        	$p.find('progress').val(progress);
        	$p.find('.percentage').html( progress+'%');
		}
        
	}catch(err){
		console.log(err);
	}
}

function submit_lead_form() {
    console.log('> In submit_lead_form');
	var $step = jQuery(this).closest('.step');
    var $form = jQuery(this).closest('form');
    
    var current_step = $step.data('step');
	var currentForm = this.form;
    //If we are on step 3, then submit the form.
    trilogyLog('Current Step: '+current_step);
	
    if (current_step == 1) {
        //Check if first name and last name are valid
        var fname_valid = $('[name=name_first],[name=first_name]', $form).valid();
        var lname_valid = $('[name=name_last],[name=last_name]', $form).valid();
        if (!fname_valid || !lname_valid) {
            scroll_to_form_error_container(currentForm);
			return false;
        }
    } else if (current_step == 2) {
        //Check if email valid
        if (!$('.email', $form).valid()) {
            scroll_to_form_error_container(currentForm);
			return false;
        }

    } else if (current_step == 3 && $form.valid()) {
        trilogyLog('Step 3: Submitting Form');
		
		$form.trigger('trilogy_form_submit');
		
        //Add US/Canada Country code if phone input has class
        $tel = $('input[type=tel]', $form);
        if ($form.hasClass('addDefaultCountryCode')) {
            trilogyLog('Adding Country Code');
            var phone = $tel.val();
            $tel.val('+1 ' + phone);
            //Add Mexico country code
        }

        return true;
    } else {
        trilogyLog('Form Invalid');
        scroll_to_form_error_container(currentForm);
        return false;
    }

	$('.steps',$form).html('Step '+(current_step+1)+' of 3');
	
    //If we are here, then we are on step 1 or 2, and the data is valid
    var $next = $step.next('.step');
    $next.addClass('active');
    $step.removeClass('active');
    
	//Step focus on the first element, unless IE
	if( -1 == navigator.userAgent.indexOf('Trident') ){		
		$next.find('input').first().focus();
	}
	
    return true;
}

function formSubmitCookieName(email) {
    var name = 'last_form_submit_';
    try {
        var salt = 'vzPck3unPWtLEJ8'; //Adds some additional security, reused but better than nothing.
        var inStr = email.toLowerCase().replace(/[^a-z0-9]/ig, '_');//Lowercase and remove non-alphanumeric
        name += sha256( salt + inStr );
    } catch (err) {

    }
    return name;
}

function submit_trilogy_record(event){
	console.log('> In submit_trilogy_record');
	var $form = $(event.target);
	var eCat = $form.find('.form_type').val();

	trilogyTrackingEvent(eCat, 'submit', document.location.pathname);
  
	//Add class indicating form is being submit
	var thank_you_page = $('.return_url', $form).val();
	var ok_to_send = true;
	if( $form.find('button:visible').hasClass('submitting') ){
		console.log('Form Already Submitting');
		return false;
	}
	else{ //Make sure not already submitting, prevent dup submits
		
		if( !preventDuplicateSubmit($form) ){
			return false;
		}

		form_submit_datalayer_event($form);

		var FB_COOKIE_OPTIONS = { path: '/', expires: 365 };
		if(typeof COOKIE_OPTIONS != 'undefined'){
			FB_COOKIE_OPTIONS = COOKIE_OPTIONS;
		}

		var $ft = $form.find('input[name="form_type"]');
		if( $ft.val() && $ft.val().indexOf('IMQ') == -1 ){
			$ft.val( $ft.val() + ' IMQ' );
		}

		var $phone = $form.find('input[name="phone"]');
		var $phone_visible = $form.find('input[name="phone_visible"]');
		if( $phone.val() != $phone_visible.val() ){
			console.warn('Phone Number actual', $phone.val(), 'does not match visible', $phone_visible.val());
			if($phone.val().length == 0){
				console.warn('Phone Number actual is empty, use phone visible value.');
				$phone.val( $phone_visible.val() );
			}
		}

		Cookies.set('FB_LEAD_EVENT_ID', $('input.fb_lead_event_id').val(), FB_COOKIE_OPTIONS);
		$form.find('button:visible').addClass('submitting').attr('disabled',true);

		var  lead_form_url = '/wp-json/trilogy/v1/lead_form';

		if( getUrlParameter('sandbox') == 'uat' ){
			$form.append('<input type="hidden" name="sandbox" value="uat">'); // as form is serialized 
			if(lead_form_url.indexOf('?') > -1){
				lead_form_url = lead_form_url + '&';
			} else {
				lead_form_url = lead_form_url + '?';
			}
			lead_form_url = lead_form_url + 'sandbox=uat'; // or append to url
		}
		

		$.ajax({
	        url		: lead_form_url,
	        async	: false,
	        method	: 'POST',
	        dataType : "json",
	        data	: $form.serialize(),
	        success: function(resp) {
				//check server response
	            if(typeof resp.data != "undefined" && typeof resp.data.lead_status != "undefined" && resp.data.lead_status != LEAD_STATUS_SENT){
					ok_to_send = false;
	                trilogyLog('Block Sending');
					return false;
	            }else {
					setDupCheckCookie($form);
					if(resp.data.app_link){
						console.log('PEP Apply Now - Change Thank You Page');
						thank_you_page = resp.data.app_link; 
						if(thank_you_page.indexOf('http') == -1){
							if (thank_you_page.indexOf('/') !== 0) {
								thank_you_page = '/' + thank_you_page;
							}
							thank_you_page = window.location.origin + thank_you_page;
						}
						$form.find('input[name=return_URL]').val(thank_you_page);
					}
					return true;
	            }
	        },
	        error: function(error) {
				$form.find('button:visible').removeClass('submitting').attr('disabled',false);
	            console.warn('Error occurred:', error);
	            if(typeof Rollbar != "undefined"){
	            	Rollbar.error("HIGH: submit trilogy record failed.", error);
	        	}
	        }
		});
		
		var thank_you_url = new URL('/thank-you/?fallback=1', window.location.origin);
		try{
			thank_you_url = new URL(thank_you_page);
		}
		catch(err){
			console.log('Invalid Thank You Page, using fallback');
			if(typeof Rollbar != "undefined"){
				Rollbar.error("Invalid Thank You Page, Used Fallback", err);
			}
		}

		if( !ok_to_send ){
			event.stopPropagation();
			event.preventDefault();
			thank_you_url.searchParams.append('status', 11); //Indicate we skipped
			window.location.href = thank_you_url;//Go Directly to thank you page
			return false;
		}
		else{ //Submit Via IMQ path
			submitIMQ( $form.get(0) );
			event.stopPropagation();
			event.preventDefault();
			return false;
		}
	}
}

function form_submit_datalayer_event($form){
	var eCat = $form.find('.form_type').val();
	var form_name = $form.find('.form_name').val();
	var program_type = $form.find('[name=program_type]').val();
	var program = $form.find('select.program_category').val();
	var form_submit_text = $form.find('button[type="submit"]').html();
	
	if (window.location.pathname.includes("enroll")) {
		//Quick overide on submission to check if this form is being submitted through PEP
		eCat = "WP_BC_PEP_Form_Submit";
	} 
	
	formSubmitDataLayerObject = {
		event: 'form_submit', //trigger event
		form_type: eCat, // 1a / 2a / iframe / contact 
		form_location: form_name,  //widget" / "header" / "footer" / "content-body"
		geo_restriction: GEO_RESTRICTION, //"gdpr" or "nongdpr"
		form_submit_text: form_submit_text  //GA Native Param
	};
	pushToDataLayer(formSubmitDataLayerObject);

	//GA4_requestinfo_form_submit Event
	var GA4_formSubmitDataLayerObject = Object.assign({}, formSubmitDataLayerObject);
		GA4_formSubmitDataLayerObject.event = 'GA4_requestinfo_form_submit';
		GA4_formSubmitDataLayerObject.program_type = program_type;
		GA4_formSubmitDataLayerObject.program = program;
	pushToDataLayer(GA4_formSubmitDataLayerObject);
}

function scroll_to_form_error_container(currentForm){
    //scroll to current forms error container
    $('html, body').animate({
        scrollTop: ($(currentForm.parentElement.parentElement).offset().top)
   }, 250);
}

function setDupCheckCookie($form){
	var email = $form.find('.email').val();
	trilogyLog('Setting DupCheck Cookie for '+email);
	var submitCookieName = formSubmitCookieName( email );
	Cookies.set(submitCookieName, 1, {path:'/', expires:1/48}); //Expires in 30 minutes 1/24 = 1 hour 
	Cookies.set('exit_intent', 1, {path:'/', expires:365}); //Set Cookie to prevent Exit Intent
}

//cookie is set in the submit_trilogy_record function
function preventDuplicateSubmit($form){
	console.log('> preventDuplicateSubmit');
	var email = $form.find('.email').val();
	var submit_cookie_name = formSubmitCookieName(email);
	if( Cookies.get(submit_cookie_name) ){
		swal('Duplicate Form Submission', duplicate_submit_msg, 'warning');
		var form_type = $form.find('input.form_type').val();
		trilogyTrackingEvent(form_type,'duplicate-submit', document.location.pathname);
		return false; // Dont Submit, duplicate
	}
	else if( $form.find('button:visible').hasClass('submitting') ){
		trilogyLog('Form is already being submit!');
		return false;
	}
	return true;
}

function combineUserInfoFields(){
	$('form.single-field-per-step .step-container').each(function(){
		var $t = $(this);
		var $lname = $t.find('.inner > .lname').detach();
		var $email = $t.find('.inner > .eml').detach();
		
		$t.find('.inner > .fname').after($lname, $email); //Order Important
	});
}

function cro_ab_test1(){ //Combined with Location Step
	$('.lead_form.sfps').first().each(function(){
		var $t 		= $(this);
		var $loe 	= $t.find('.optional-steps .highest_level_of_education_options').first().detach(); //There are two, one msx one non
		var $ready 	= $t.find('.optional-steps .buyer-readiness-options').first().detach();	
		
		$('.lead_form.sfps .input.country_group').before($ready, $loe);

		$('.highest_level_of_education_options select, .buyer-readiness-options select').selectpicker(); //This will not be required later when we move these a/b calls earlier
	});
}

function cro_ab_test2(){ //Own Step
	$('.lead_form.sfps').first().each(function(){
		var $t = $(this);
		var $step_loe = $t.find('.step-highest-level-of-education').detach();
		var $ready = $t.find('.optional-steps .buyer-readiness-options').first().detach();
		//$ready.find('select').selectpicker();
		$step_loe.find('.highest_level_of_education_options').after($ready);
		//$step_loe.find('select').selectpicker();
		$('.lead_form.sfps .step-location').before($step_loe);
		$('.highest_level_of_education_options select, .buyer-readiness-options select').selectpicker(); //This will not be required later when we move these a/b calls earlier
	});
}

function populateOptionalQuestions(){
	console.log('Populating Optional Questions');

	var msx_q_enabled = $('body').hasClass('msx-questions-enabled') || getUrlParameter('msxq').length;
	var form_param_options = getUrlParameter('f_opt');

	var BCFO = (typeof window.BCFO === 'undefined') ? [] : window.BCFO;

	if( form_param_options.length ){
		console.log('FP Options:'+form_param_options);
	}
	else if(BCFO.length){
		trilogyLog('BCFO Options');

		if( BCFO.indexOf('combine_user_fields') ){
			combineUserInfoFields();
		}

		if( BCFO.indexOf('cro_ab_test1') ){
			cro_ab_test1();
		}
		else if( BCFO.indexOf('cro_ab_test2') ){
			cro_ab_test2();
		}

		return;
	}
	try{
		if( msx_q_enabled ){
			console.log('MSX Questions Enabled');
			var $step_location 	= $('.optional-steps .step-location').first().detach();
			var $step_msx 		= $('.optional-steps .step-msx').first().detach();

			if($('body').hasClass('hs-programs-pg') ){
				$step_msx = '';//Only Location question on HS 
			}
			/*
			var $step_psna 		= $('.optional-steps .step-persona').first().detach();
			var $step_exp 		= $('.optional-steps .step-experience').first().detach();
			var $step_ready 	= $('.optional-steps .step-buyer-readiness').first().detach();
			var $step_loe 		= $('.optional-steps .step-highest-level-of-education').first().detach();
			*/
			$('.step-user, .form-fb .step-first-name, .single-field-per-step')
				.after($step_location)
				.after($step_msx);
			var ft = $('input.form_type').val();
			$('input.form_type').val(ft+' MSXQ');
		}
		else{
			
			
			//Still need location step:
			var $step_location 	= $('.optional-steps .step-location').first().detach();
			$('.step-email, .step-user, .form-fb .step-first-name').after($step_location);			
			
			//TECH TRACKS LOGIC
			if(getUrlParameter('contact_id')){
			$('form input[name="contact_id"]').val(getUrlParameter('contact_id'));
			}
			var showTechTrackQuestion = false;

			if($('body').hasClass('techtrack')){
				showTechTrackQuestion = true;
			}

			var q_tech_tracks = getUrlParameter('q_tech_tracks');
			if(q_tech_tracks){
				var valueArray = q_tech_tracks.replace(/(^-)|(-$)/g, "").split('-');
				for(var i in valueArray){
					$('.lead_tech_tracks option.spec-coding--'+valueArray[i]).removeClass('hidden');
					showTechTrackQuestion = true;
				}
			}

			if(showTechTrackQuestion){
			//Default position to be visible after email. Can be moved upon request
			$('.lead_form.sfps').each(function(){
				var $tech_tracks = $('.optional-steps .step-tech-tracks',this).first().detach();
				$('.step-email',this).after($tech_tracks);
				
			});
			//END TECH TRACKS LOGIC
			//set min-height for dropwdown to auto for correct padding on single choice 
			$('.lead_form.sfps').click(function(){
				$('.dropdown-menu').css("min-height", "auto");
			});
			}
		}

	}catch(e){
		console.log('Error with populateOptionalQuestions');
		console.log(e);
	}
}
function populateHighSchoolProgramsQuestions(){
	try{
		var $form_has_high_school_program = $('.lead_form.sfps.high-school-form, .msx-form.high-school-form');
		if( $form_has_high_school_program.length > 0){
			$form_has_high_school_program.each(function(){
				trilogyLog('Is High School Programs Form');

				var $sfps_this = $(this).find('form.single-field-per-step').first();
                

				$(this).find('.ico.fname, .ico.lname, .ico.eml, .ico.phone, .col_name_first, .col_name_last, .col_email, .col_phone').each(function () {
				    // add parent prefix to input placeholders/labels
					var parent_prefix_txt = 'Parent/Guardian';
					var $label = $(this).find('label').first();
					var label_html = $label.html();
					$label.html(parent_prefix_txt + ' ' + label_html);

					var $input = $(this).find('input[type="text"],input[type="tel"]').first();
					var placeholder_html = $input.attr('placeholder');
					$input.attr('placeholder', parent_prefix_txt + ' ' +  placeholder_html);
				});

				var $hs_questions = $(this).find('.optional-steps .hs-steps');
				$hs_questions.each(function () {
					var $hs_q = $(this).first().detach();
					if($hs_q) {
						if($sfps_this.find('.step-location')){ //if location (country/state) step exists
							$sfps_this.find('.step-location').before( $hs_q );
						}else{
							$sfps_this.find('.step-phone-tcpa').before( $hs_q );
						}
						//todo: change to last step
						//var $last_step = $sfps_this.find('.step').last();
						// var $last_step_btn = $last_step.find('button[type="submit"]');
						// $last_step_btn.attr('type', 'button').attr('title', "next").html('Next');
						//$last_step.after($hs_q);
					}
				});
				var $new_last_step = $sfps_this.find('.step').last();
				var $new_last_step_btn = $new_last_step.find('button[type="button"]');
				$new_last_step_btn.attr('type', 'submit').attr('title', "submit").html('Submit');

				$sfps_this.find('.inner label.sr-only, .inner .input label').removeClass('sr-only').addClass('toggle-label-focus').css({
					"margin-bottom": "2px",
					"transform-origin" : "0 0",
					scale			 : ".8",
                    opacity          : 0,
                    WebkitTransition : 'opacity 0.5s ease-in-out',
                    MozTransition    : 'opacity 0.5s ease-in-out',
                    MsTransition     : 'opacity 0.5s ease-in-out',
                    OTransition      : 'opacity 0.5s ease-in-out',
                    transition       : 'opacity 0.5s ease-in-out'
                });
                $sfps_this.find('.inner .ico, .inner .input').focusin(function () {
                    $(this).find('label.toggle-label-focus').css('opacity', 1);
                });
                $sfps_this.find('.inner .ico, .inner .input').focusout(function () {
                    var $elLabel = $(this).find('label.toggle-label-focus');
					var $el = $('#'+$elLabel.attr('for'));
					if( $el.val() == ""){ $elLabel.css('opacity', 0); }
                });

			});
		}
	}catch(e){
		console.log('Error with populateHighSchoolProgramsQuestions');
	}
}

async function submitIMQ(form){
	console.log('> In submitIMQ');
    var host 	 = 'https://imq.2u.com'; 
	var host_stg = 'https://imq.stg.2u.com';
    var path = '/v2/interest-create'; 
    var url  = host+path;

    var formData        = new FormData( form );
    let formDataObject  = Object.fromEntries(formData.entries());
    
    //Perform Remapping
    formDataObject.first_name  = formDataObject.name_first;
    formDataObject.last_name   = formDataObject.name_last;

	if( getUrlParameter('sandbox') == 'imq-stg' || getUrlParameter('sandbox') == 'uat'){
		console.log('IMQ Staging Endpoint');
		formDataObject.sandbox = "uat";
		url = host_stg+path;
	}

	var params = {};
	if( formDataObject.cohort_id ){ //Make sure there is a cohort
		let payload      = JSON.stringify(formDataObject);
    	let fetchOptions = {
    	    method: "POST",
    	    headers: {"Content-Type": "application/json",Accept: "application/json"},
    	    body: payload
    	};
	
    	let result 	= await fetch(url, fetchOptions);
		let text 	= await result.text();

		formDataObject.imq_status_code 	= result.status;
		formDataObject.imq_text			= text;
		
		params.status 		= result.status;

		if( result.status == 200 ){
			console.log('IMQ Success');
    	}
    	else{
			console.error('IMQ Submit Error Code:'+result.status);
    	}	
	}
	else{
		//NoCohort, Held
		console.log('No Cohort');
		params.held = 10;
	}
	
	$('body').removeClass('form-submitting');
	return thankYouPost(formDataObject, params);
}

function thankYouPost(formData, params){
	var tyForm = document.createElement("form");
	
	var base = document.location.protocol+'//'+document.location.host;
	var thank_you_url = new URL('/thank-you/?status=tyfb', base);
    try{
		var thank_you = formData.return_URL;
		thank_you_url = new URL(thank_you, base);
		var is_enroll_magic = thank_you.indexOf('/enroll') != -1;
		if(is_enroll_magic){
			document.location.href = thank_you_url;
			return;
		}
		if(params){
			for (const [key, value] of Object.entries(params)){
				thank_you_url.searchParams.set(key,value);
			}
		}
		if(formData.coding_skill_level_python && formData.coding_skill_level_python == 'None'){
			if(formData.program_category == 'AI MicroBootCamp'){
				thank_you_url.searchParams.set('coding_skill_level_python','none');
			}
		}
    }catch(err){
        console.log('Error Constructing Thank You URL');
    }

	tyForm.action = thank_you_url ? thank_you_url : formData.return_URL;
	tyForm.method = is_enroll_magic ? "GET" : "POST";
	tyForm.enctype = "multipart/form-data";
	tyForm.target  = '_top'; //If used in Iframe

	for(var key in formData){
		if( formData.hasOwnProperty(key) ){
            var hiddenField = document.createElement('input');
            hiddenField.setAttribute('type', 'hidden');
            hiddenField.setAttribute('name', key);
            hiddenField.setAttribute('value', formData[key]);
            tyForm.appendChild(hiddenField);
        }
	}
	document.body.appendChild(tyForm);
    tyForm.submit();
}

var DYNAMIC_CONSENT_GDPR_SWAPPED = false;
function dynamicConsentSetGDPR(){	
	if(typeof CB_DYNAMIC_CONSENT_ENABLED != "undefined" && CB_DYNAMIC_CONSENT_ENABLED === false ){
		console.log('Dynamic Consent - Disabled');
		return;
	}

	if( DYNAMIC_CONSENT_GDPR_SWAPPED ){
		console.log('GDPR Consent Step - Already Swapped');
		return;
	}	
	
	trilogyLog('In GDPR Consent Step Swap');

	// This section only exist if DynamicConsentStep is Enabled 
	var $dynamic_consent_step_options = $('.dynamic-options-for-consent-step.for--gdpr');
	if( !$dynamic_consent_step_options.length ){
		console.info('No Dynamic Consent Step Options');
		DYNAMIC_CONSENT_GDPR_SWAPPED = true;
		return;
	}

	$dynamic_consent_step_options.each(function(){
		console.log('Looping over each instance', this);
		
		var $form = $(this).parent().find('form'); //Order Important, get nearest form first
		if( !$form.length ){
			return;
		}

		var $consent_step = $form.find('.the-consent-step')

		// SWAP eBMC
		var $ebmc_long = $(this).find('.ebmc-long').first().detach();
		var $ebmc_short = $consent_step.find('.ebmc-short').first();
		if( $ebmc_long.length && $ebmc_short.length ){
			$ebmc_short.after($ebmc_long); // Move long into content-step
			$ebmc_short = $ebmc_short.detach();
			$(this).append($ebmc_short); // Move short into dynamic options
			$consent_step.attr('data-ebmc-version', 'ebmc-long');
		}

		// Change phone options - no need to set as it is not swapped
		var $phone_iti = $form.find('input.phone-international').first();
		if( $phone_iti.length ){
			$phone_iti.removeAttr('required data-rule-required'); // Phone not required
			$phone_iti.rules('add' , {required: false} ); // TODO: jQuery Validate version needs to be updated
			$form.find('input.consent_by_telephone').first().val(0); // consent_by_telephone = 0
						
			$consent_step.attr('data-phone-version', 'phone-not-required');

			var $phone_label = $("label[for='" + $phone_iti.attr('id') + "'].phone-label").first();
			console.log('Phone Label: ', $phone_label, $phone_iti.attr('id'));
			if ($phone_label.length ) {
				
				var $phone_label_text = $phone_label.attr('data-phone-label-text-gdpr');
				console.log('Phone Label Text: '+$phone_label_text);
				if ($phone_label_text.length) {
					$phone_label.html($phone_label_text).removeClass('sr-only').addClass('show-label'); // Show GDPR consent phone label
					$consent_step.attr('data-phone-label-version', 'gdpr-consent');
				}
			}
		}
		
		$consent_step.attr('data-consent-step-version', 'GDPR');

		
		DYNAMIC_CONSENT_GDPR_SWAPPED = true; // In multiple form instances, this is set the first time it is true.
	});
	
}
