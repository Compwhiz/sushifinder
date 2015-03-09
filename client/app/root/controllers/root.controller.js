(function(window) {
  'use strict';

  angular.module('app.core').controller('rootController', rootController);

  rootController.$inject = [];

  function rootController() {
    var vm = this;

    vm.showDebugInfo = false;
    vm.debugInfo = [];

    init();

    // init
    function init(){
      // screen width
      vm.debugInfo.push({
        key: 'screen width',
        value: window.screen.width
      });

      // screen height
      vm.debugInfo.push({
        key:'screen height',
        value:window.screen.height
      });
    }
  }
})(window);
