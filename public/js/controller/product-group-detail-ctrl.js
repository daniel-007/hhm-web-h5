/**
 * @author qianqing
 * @create by 16-2-18
 * @description product group detail
 */
require.config({
  baseUrl: '../js',
  paths: {
    'Vue': './lib/vue.min'
  },
  shim: {
    'Vue': {
      exports: 'Vue'
    }
  }
});

require(['Vue'],
  function (Vue) {
    'use strict';
    Vue.config.delimiters = ['${', '}'];
    Vue.config.unsafeDelimiters = ['{!!', '!!}'];

    $(document).on("pageInit", "#product-group-detail", function(e, id, page) {
      var vm = new Vue({
        el: '#product-group-detail',
        data: {
          isLike: false,
          cartNum: 3
        },
        computed: {
          liked: function () {
            return this.isLike ? '已收藏':'收藏';
          }
        }
      });

      $(page).on('click','.icon-like', function () {
        $(this).toggleClass('icon-likeactive');
        vm.isLike = !vm.isLike;
      });

      $(page).on('click','.my-back-top', function () {
        $('.content').scrollTop(0);
      });

      $(page).on('click','#addIntoCart', function () {
        vm.cartNum++;
      });

      $(function () {
        $(".swiper-container").swiper({
          spaceBetween: 30,
          continuous: true,
          autoplay: 2500,
          autoplayDisableOnInteraction: false
        });
      });

    });

    $.init();
  }
);
