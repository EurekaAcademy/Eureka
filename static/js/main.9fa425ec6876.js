jQuery(document).ready(function ($) {

	//Check if target section is in view
	$.fn.isInViewport = function () {
		var win = $(window);
		var viewport = {
			top : win.scrollTop(),
			left : win.scrollLeft()
		};
		viewport.right = viewport.left + (win.innerWidth() || win.width());
		viewport.bottom = viewport.top + (win.innerHeight() || win.height());
		var bounds = this.offset();
		
		bounds.right = bounds.left + this.outerWidth();
		bounds.bottom = bounds.top + this.outerHeight();
		return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
	};

	// Main toggle
	$('.toggle.main-toggle').click(function () {
		var elem = $(this).find('.btn-main-toggle');
		if (elem.hasClass('active')) {
			$('.btn-main-toggle, .main-toggle, .btn-sub-toggle, .sub-toggle').removeClass('active');
			//omit
			elem.closest('.toggle').find('.btn-main-toggle, .main-toggle, .btn-sub-toggle, .sub-toggle').removeClass('active');
		} else {
			//omit
			$('.btn-main-toggle, .main-toggle, .btn-sub-toggle, .sub-toggle').removeClass('active');
			elem.addClass('active').parents('.main-toggle').addClass('active');
		}
		return false;
	});

	// Subtoggle (inside of main)
	$('.btn-sub-toggle').click(function () {
		var elem = $(this);
		if (elem.hasClass('active')) {
			$('.btn-sub-toggle, .sub-toggle').removeClass('active');
		} else {
			//$('.btn-sub-toggle, .sub-toggle').removeClass('active');
			elem.addClass('active').parents('.sub-toggle').addClass('active');
		}
		return false;
	});

	if ($('.get-program-info:visible').length == 0) {
		$('.get-info-btn-container').remove();
	} else {
		header_height 		= $('#header').height();
		$mobile_info_btn 	= $('.get-info-btn-container');
		$mobile_info_btn.removeClass('visible-xs visible-sm').addClass("hidden");//also should be inline init
		$(window).scroll(function(e){
			if( $(window).scrollTop() > header_height && $('.get-program-info form').last().isInViewport() !== true ){
				$mobile_info_btn.removeClass('hidden').addClass("visible-xs visible-sm ");
				$mobile_info_btn.css("position","fixed");//if not set through css
			} else{
				$mobile_info_btn.removeClass('visible-xs visible-sm').addClass("hidden");
			}
		});
		$('.get-info-btn-container .btn').click(function () {
			var offset = $('.get-program-info:visible').last().offset();
			if (offset) {
				$('html, body').animate({
					scrollTop: offset.top - 90 + 'px'
				}, 500);
			}
		});
	}

	//review read more
	$('.review .btn-read-more').click(function () {
		$(this).closest('.review').toggleClass('open');
	});

	//Testimonails tile
	$('.testimonial .title').click(function () {
		var inner =  this.nextElementSibling;
		var content = inner.lastElementChild;
		var review = content.lastElementChild;
		review.className == "review" ? review.className = 'review open' : review.className = 'review';
	});

	//Menu btn show menu
	$('button.navbar-toggle').click(function(){
		$('#bs-example-navbar-collapse-1').fadeToggle( "fast", "linear" );
	});
});