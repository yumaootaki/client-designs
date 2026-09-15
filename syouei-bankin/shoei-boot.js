(function () {
  var T = 'https://shoeibankin.com/wp-content/themes/stinger8/';
  function load(src) {
    return new Promise(function (r) {
      var s = document.createElement('script');
      s.src = src; s.onload = r; s.onerror = r;
      document.head.appendChild(s);
    });
  }
  function applyBodyClass() {
    if (document.body && window.SHOEI_BODY_CLASS) {
      document.body.className = window.SHOEI_BODY_CLASS;
    }
  }
  applyBodyClass();
  document.addEventListener('DOMContentLoaded', applyBodyClass);
  function boot() {
    load('https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js')
      .then(function () { return load(T + 'js/base.js'); })
      .then(function () { return load(T + 'js/scroll.js'); })
      .then(function () { return load(T + 'js/script.js'); })
      .then(function () { return load(T + 'js/jquery.fatNav.min.js'); })
      .then(init);
  }
  function init() {
    var $ = window.jQuery;
    if (!$) return;
    applyBodyClass();

    $('#loadingbk').hide();
    $('#st-ami').css({ display: 'block', opacity: 1 });
    $('#pcontent').addClass('topcont');

    // accordion (sp menu) + submenu hover
    $('.menu ul li').hover(function () {
      $('ul:not(:animated)', this).slideDown();
    }, function () {
      $('ul.child', this).slideUp();
    });
    $('#s-navi dt.trigger').off('click').on('click', function () {
      $(this).next('.acordion_tree').slideToggle();
    });

    // transparent header behaviour
    if ($(window).width() > 960) {
      var nav = $('#st-menubox-transparent');
      var offset = nav.offset() || { top: 0 };
      var trigger = $('#pcontent');
      $(window).on('scroll', function () {
        var st = $(window).scrollTop();
        if (st > offset.top + 60) { nav.addClass('navfixed'); } else { nav.removeClass('navfixed'); }
        if (trigger.length) {
          var p = trigger.offset().top - $(window).height();
          if (st > p + 750) { nav.addClass('transparentbg'); } else { nav.removeClass('transparentbg'); }
        }
      });
    }

    // fade-up on scroll
    var $fade = $('.homeli, .prli, .prli2, .prmenu2, .aboutmenu2, .appealadd2');
    $fade.css('visibility', 'visible');
    function fadecheck() {
      var wh = $(window).height(), tw = $(window).scrollTop();
      $fade.each(function () {
        if (tw > $(this).offset().top - wh) { $(this).addClass('fadeup'); }
      });
    }
    $(window).on('scroll', fadecheck); fadecheck();

    // page top / right fixed menu
    var topBtn = $('#fixed-menu');
    $(window).on('scroll', function () {
      if ($(this).scrollTop() > 300) {
        topBtn.stop().animate({ right: '0px' }, 200, 'linear');
        $('#page-top').fadeIn();
      } else {
        topBtn.stop().animate({ right: '-200px' }, 200, 'linear');
        $('#page-top').fadeOut();
      }
    });

    // news ticker
    $('.ticker').each(function () {
      var $obj = $(this), $ul = $obj.children('ul'), $li = $obj.find('li');
      if (!$li.length) return;
      var ulWidth = $ul.width(), listHeight = $li.height();
      $obj.css({ height: listHeight });
      $li.css({ top: 0, left: 0, position: 'absolute', display: 'none', opacity: 0 });
      var $first = $obj.find('li:first');
      $first.css({ left: ulWidth, display: 'block', opacity: 0, zIndex: 98 })
        .stop().animate({ left: 0, opacity: 1 }, 1000, 'swing').addClass('showlist');
      if ($li.length > 1) {
        setInterval(function () {
          var $a = $obj.find('.showlist');
          $a.animate({ left: -ulWidth, opacity: 0 }, 1000, 'swing')
            .next().css({ left: ulWidth, display: 'block', opacity: 0, zIndex: 99 })
            .animate({ left: 0, opacity: 1 }, 1000, 'swing').addClass('showlist')
            .end().appendTo($ul).css({ zIndex: 98 }).removeClass('showlist');
        }, 6000);
      }
    });
  }
  boot();
})();
