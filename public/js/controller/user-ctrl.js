/**
 * @author qianqing
 * @create by 16-2-22
 * @description user controller
 */
(function() {
  require.config({
    baseUrl: '../js',
    paths: {
      'Vue': './lib/vue.min',
      'Utils': './lib/utils'
    },
    shim: {
      'Vue': {
        exports: 'Vue'
      },
      'Utils': {
        exports: 'Utils'
      }
    }
  });

  function ajaxPost(url, data, cb) {
    $.ajax({
      type: 'POST',
      url: url,
      data: data,
      timeout: 15000,
      success: function (data, status, xhr) {
        if (data.status) {
          cb(null, data);
        } else {
          cb(data.msg, null);
        }
      },
      error: function (xhr, errorType, error) {
        console.error(url + ' error: ' + errorType + '##' + error);
        cb('服务异常', null);
      }
    });
  }

  function getStoreName(cb) {
    ajaxPost('/users/getStoreName', {}, function (err, data) {
      cb(err, data.storeName);
    });
  }

  function FavItems(url, number) {
    var o = {};
    o.url = url;
    o.pageSize = number;
    o.pageId = 0;
    o.addItems = function (cb) {
      var self = this;
      ajaxPost(this.url, {
        pageId: this.pageId,
        pageSize: this.pageSize
      }, function (err, data) {
        if (err) {
          cb(err, null);
        } else {
          self.pageId++;
          cb(null, data);
        }
      });
    };
    return o;
  }

  require(['Vue', 'Utils'],
    function (Vue, Utils) {
      'use strict';
      Vue.config.delimiters = ['${', '}'];
      Vue.config.unsafeDelimiters = ['{!!', '!!}'];

      $(document).on("pageInit", "#page-my", function (e, id, page) {
        var vm = new Vue({
          el: '#page-my',
          data: {
            storeName: ''
          }
        });

        getStoreName(function (err, storeName) {
          if (err) {
            $.toast(err, 1000);
          } else {
            vm.storeName = storeName;
          }
        });

      });

      $(document).on("pageInit", "#page-my-account", function (e, id, page) {
        var vm = new Vue({
          el: '#page-my-account',
          data: {
            storeName: ''
          }
        });

        getStoreName(function (err, storeName) {
          if (err) {
            $.toast(err, 1000);
          } else {
            vm.storeName = storeName;
          }
        });

        $(page).on('click', '#linkName', function () {
          location.href = '/users/change-shop-name';
        });

        $(page).on('click', '#linkAddress', function () {
          location.href = '/users/my-address';
        });

        $(page).on('click', '#linkPassword', function () {
          location.href = '/users/change-password';
        });
      });

      $(document).on("pageInit", "#page-change-shop-name", function (e, id, page) {
        var vm = new Vue({
          el: '#page-change-shop-name',
          data: {
            storeName: ''
          },
          methods: {
            setStoreName: setStoreName
          }
        });

        getStoreName(function (err, storeName) {
          if (err) {
            $.toast(err, 1000);
          } else {
            vm.storeName = storeName;
          }
        });

        function setStoreName(event) {
          ajaxPost('/users/setStoreName', {storeName: vm.storeName}, function (err, data) {
            $.hidePreloader();
            if (err) {
              $.toast(err, 1000);
            } else {
              location.href = '/users/account';
            }
          });

          $.showPreloader('保存中');
        }

      });

      /*$(document).on("pageInit", "#page-change-shop-style", function (e, id, page) {
       var vm = new Vue({
       el: '#page-change-shop-style',
       data: {}
       });

       $(page).on('click', 'li a', function () {
       $('li a').removeClass('my-shop-active');
       $(this).addClass('my-shop-active');
       location.href = '/users/account';
       });

       });*/

      $(document).on("pageInit", "#page-change-password", function (e, id, page) {
        var vm = new Vue({
          el: '#page-change-password',
          data: {
            oldPW: '',
            newPW: '',
            rePW: ''
          },
          computed: {
            isDisable: function () {
              return this.oldPW.length === 0 || this.newPW.length === 0 || this.rePW.length === 0;
            }
          },
          method: {
            changePW: changePW
          }
        });

        function changePW(event) {
          if (vm.isDisable) {
            return;
          }

          if (vm.newPW != vm.rePW) {
            $.toast("密码输入不一致");
            return;
          }

          ajaxPost('/users/change-password', {password: vm.newPW}, function (err, data) {
            $.hidePreloader();
            if (err) {
              $.toast(err, 1000);
            } else {
              $.toast("新密码设置成功！", 1000);
              location.href = '/users/account';
            }
          });

          $.showPreloader('保存中');
        }
      });

      $(document).on("pageInit", "#page-my-buy-report", function (e, id, page) {
        var dateTime = Utils.dateFormat(new Date(), 'yyyy-MM-dd');
        var vm = new Vue({
          el: '#page-my-buy-report',
          data: {
            start: dateTime,
            end: dateTime
          }
        });

        $(page).on('click', '.button', function () {
          $.router.load('/users/buy-report-result');
        });

        $("#my-start-time").calendar({
          value: [vm.start]
        });
        $("#my-end-time").calendar({
          value: [vm.end]
        });

      });

      $(document).on("pageInit", "#page-my-buy-report-result", function (e, id, page) {
        var vm = new Vue({
          el: '#page-my-buy-report-result',
          data: {}
        });

      });

      $(document).on("pageInit", "#page-my-fav", function (e, id, page) {
        var vm = new Vue({
          el: '#page-my-fav',
          data: {
            search: '',
            cartNum: 30,
            favList: [],
            count: 0
          }
        });

        var loading = false;
        var favItems = new FavItems('/users/my-fav', 10);
        favItems.addItems(function (err, data) {
          if (err) {
            $.toast(err, 1000);
          } else {
            vm.count = data.count;
            vm.favList = vm.favList.concat(data.favorite);
          }
        });

        $(page).on('infinite', '.infinite-scroll-bottom', function () {

          // 如果正在加载，则退出
          if (loading) return;
          // 设置flag
          loading = true;

          // 模拟1s的加载过程
          setTimeout(function () {
            // 重置加载flag
            loading = false;

            if (vm.favList.length >= vm.count) {
              // 加载完毕，则注销无限加载事件，以防不必要的加载
              $.detachInfiniteScroll($('.infinite-scroll'));
              // 删除加载提示符
              $('.infinite-scroll-preloader').remove();
              return;
            }

            // 添加新条目
            favItems.addItems(function (err, data) {
              if (err) {
                $.toast(err, 1000);
              } else {
                vm.count = data.count;
                vm.favList = vm.favList.concat(data.favorite);
              }
            });
            //容器发生改变,如果是js滚动，需要刷新滚动
            $.refreshScroller();
          }, 1000);
        });


        $(page).on('click', '.icon-clear', function () {
          vm.search = '';
        });

        $(page).on('click', '.like', function () {
          $(this).toggleClass('icon-like');
          $(this).toggleClass('icon-likeactive');
          if ($(this).hasClass("icon-like")) {
            $(this).children('span').text('收藏');
          } else {
            $(this).children('span').text('已收藏');
          }
        });

        $(page).on('click', '.icon-clear', function () {
          vm.search = '';
        });

        $(page).on('click', '.button', function () {
          $.popup('.popup-cart');
        });

        var cartVm = new Vue({
          el: '#popup-cart',
          data: {
            addCartNum: 1
          }
        });

        cartVm.$watch('addCartNum', function (newVal, oldVal) {
          if (newVal === '') {
            return;
          }

          if (!Utils.isPositiveNum(newVal)) {
            $.toast('请输入正确的购买数量', 500);
            Vue.nextTick(function () {
              cartVm.addCartNum = oldVal;
            });
          }
        });

        $(document).on('click', '.my-a-cart.close-popup', function () {
          if (cartVm.addCartNum === '') {
            cartVm.addCartNum = 1;
            $.toast('请输入正确的购买数量', 1000);
            e.preventDefault();
            return;
          }
          vm.cartNum += parseInt(cartVm.addCartNum);
          cartVm.addCartNum = 1;
        });

        $(document).on('click', '.icon-close.close-popup', function () {
          cartVm.addCartNum = 1;
        });

        $(document).on('click', '.em-op-d', function () {
          if (cartVm.addCartNum > 1) {
            cartVm.addCartNum--;
          }
        });

        $(document).on('click', '.em-op-a', function () {
          cartVm.addCartNum++;
        });

        $(document).on('click', '.my-ul-spec li', function () {
          $('.my-ul-spec li').removeClass('my-spec-on');
          $(this).addClass('my-spec-on');
        });

      });

      $(document).on("pageInit", "#page-my-message", function (e, id, page) {
        var vm = new Vue({
          el: '#page-my-message',
          data: {}
        });

        $(page).on('click', '.open-message-modal', function () {
          $.modal({
            title: '消息标题消息标题消息标题消息标题消息标题消息标题消息标题<span class="my-message-time">今天 09:45</span>',
            text: '<p>又到了周四大特卖！还在等什么呢！手快有，手慢无，赶紧抢货咯！又到了周四大特卖！还在等什么呢！手快有，手慢无，赶紧抢货咯！又到了周四大特卖！还在等什么呢！手快有，手慢无，赶紧抢货咯！<p>',
            extraClass: 'my-dialog',
            buttons: [
              {text: '<a href="#" class="icon icon-close my-black-text"></a>'}
            ]
          })
        });

      });

      $(document).on("pageInit", "#page-my-address", function (e, id, page) {
        var vm = new Vue({
          el: '#page-my-address',
          data: {
            receivers: [],
            defaultIdx: null
          },
          methods: {
            deleteAdr: deleteAdr
          }
        });

        ajaxPost('/address/get-all-receiver', {}, function (err, data) {
          if (err) {
            $.toast(err, 1000);
          } else {
            var receivers = data.receiver;
            var len = receivers.length;
            for (var i = 0; i < len; i ++) {
              var obj = {};
              obj.receiverId = receivers[i].SysNo;
              obj.phone = receivers[i].ReceiverPhone;
              obj.receiver = receivers[i].ReceiverName;
              obj.pcdDes = receivers[i].Province + ' ' + receivers[i].City + ' ' + receivers[i].District;
              obj.address = receivers[i].Address;
              obj.isDefault = receivers[i].IsDefault;
              vm.receivers.push(obj);
            }
          }
        });

        function deleteAdr(index, event) {
          $.confirm('确定删除该地址吗?',
            function () {
              ajaxPost('/address/del-receiver', {receiverId: vm.receivers[index].receiverId}, function (err, data) {
                if (err) {
                  $.toast(err, 1000);
                } else {
                  vm.receivers.splice(index, 1);
                }
              });
            },
            function () {

            }
          );
        }

        $(page).on('change', '[name="single-radio"]', function () {
          ajaxPost('/address/set-default-receiver', {receiverId: vm.receivers[vm.defaultIdx].receiverId}, function (err, data) {
            if (err) {
              $.toast(err, 1000);
            } else {
              var len = vm.receivers.length;
              for (var i = 0; i < len; i++) {
                if (i === vm.defaultIdx) {
                  vm.receivers[i].isDefault = true;
                } else {
                  vm.receivers[i].isDefault = false;
                }
              }
              $.hidePreloader();
            }
          });
          $.showPreloader('保存中');
        });
      });

      $.init();
    }
  );
}());
