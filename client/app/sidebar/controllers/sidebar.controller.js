(function() {
  angular.module('app.sidebar').controller('sidebarController', sidebarController);

  sidebarController.$inject = ['yelp'];

  function sidebarController(yelp) {
    var vm = this;

    vm.term = 'sushi';
    vm.yelp = yelp;

    init();

    // init
    function init() {

    }
  }

})();
