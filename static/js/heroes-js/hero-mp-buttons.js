jQuery(document).ready(function ($) {
    var isMobile = false;
    var appendedVideo = false;
    checkWidth();
    $(window).resize(checkWidth);
    function checkWidth() {
        var screensize = $(window).width();
        if (screensize > 640) {
            isMobile = false;
            if (appendedVideo == false) {
                var v_poster = $(".video-container").data('poster');
                var v_src = $(".video-container").data('src');
                var v_autoplay = $(".video-container").data('autoplay');
                var v_loop = $(".video-container").data('loop');
                var v_width = $(".video-container").data('width');
                var v_height = $(".video-container").data('height');
                var v_muted = $(".video-container").data('muted');
                $(".video-container").append('<video width="'+v_width+'" height="'+v_height+'" autoplay="'+v_autoplay+'" loop="'+v_loop+'" muted="'+v_muted+'" poster="'+v_poster+'"><source src="'+v_src+'" /></video>');            }
            appendedVideo = true;
        } else {
            //mobile
            isMobile = true;
        }
    }
    /////////////////////////////////
    var mobileHeroImages, desktopHeroImages;

    checkWidth();
    $(window).resize(checkWidth);

    function checkWidth() {
        var screensize = $(window).width();
        if (screensize < 640) {
            $(".front-page-hero").addClass("mobile-hero-coding");
        } else {
            $(".front-page-hero").addClass("desktop-hero-coding");
        }
    }

    var el = $(".program-box");
    var xtime = 7000;
    var elLenght = el.length;
    var eli = 0;

    mobile_rotate = function() {

        var heroTitle, heroSubtitle, $heroProgramName;
        el.removeClass("active");

        var currentEl = el.get(eli);
        $(currentEl).addClass("active");

        $heroProgramName = $(currentEl).find(".program-name").first().clone();
        heroTitle = $(currentEl).find(".title").first().html();
        heroSubtitle = $(currentEl).find(".content").first().html();

        $(".hero-program-name").first().remove();
        $heroProgramName.addClass('hero-program-name');

        var screensize = $(window).width();
        if (screensize <= 767) {
            image = $(currentEl).data('bgmobile');
        }else{
            image = $(currentEl).data('bgdesktop');
        }

        $(".front-page-hero").css({"background-image":'url('+image+')'});
        $(".hero-sub-title").html(heroSubtitle);
        $(".hero-title").html(heroTitle);
        $($heroProgramName.removeClass('hide')).insertBefore(".hero-title");

        if (eli == (elLenght - 1)){  eli = 0; }
        else{++eli;}
    };
    mobile_rotate();
    var rotateInterval = setInterval( mobile_rotate, xtime);

    $(".program-box").mouseleave(function () {
        var screensize = $(window).width();
        if (screensize <= 640) {
            var el = $(".program-box");
            eli = el.index($(this))+1;
            if (eli > (elLenght - 1)){  eli = 0; }
            rotateInterval = setInterval( mobile_rotate, xtime);
        }
    }).mouseenter(function () {
        //click for mobile only
        var screensize = $(window).width();
        clearInterval(rotateInterval);
        var image = $(this).data('bgmobile');
        if (screensize >= 768) {
            image = $(this).data('bgdesktop');
        }
        var heroTitle, heroSubtitle, $heroProgramName;
        var el = $(".program-box");

        $heroProgramName = $(this).find(".program-name").first().clone();
        heroTitle = $(this).find(".title").first().html();
        heroSubtitle = $(this).find(".content").first().html();

        $(".hero-program-name").first().remove();
        $heroProgramName.addClass('hero-program-name');

        el.removeClass("active");
        $(this).addClass("active");


        $(".front-page-hero").css({"background-image":'url('+image+')'});
        $(".hero-sub-title").html(heroSubtitle);
        $(".hero-title").html(heroTitle);
        $($heroProgramName.removeClass('hide')).insertBefore(".hero-title");


        if($(this).index() === 0){
            $(".hero-title").replaceWith('<h1 class="hero-title">'+$('.hero-title').html()+'</h1>');
        }else{
            $(".hero-title").replaceWith('<div class="hero-title">'+$('.hero-title').html()+'</div>');
        }
    });

    $(".next-step-box").mouseenter(function () {
        //click for mobile only
        var screensize = $(window).width();
        if (screensize <= 640) {
            $(".next-step-box").removeClass("active");
            $(this).addClass("active");
        }
    }).hover(function () {
        var screensize = $(window).width();
        if (screensize > 640) {
            $(".next-step-box").removeClass("active");
            $(this).addClass("active");
        }
    });


});
