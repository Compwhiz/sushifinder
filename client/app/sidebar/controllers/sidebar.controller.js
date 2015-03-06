(function() {
  angular.module('app.sidebar').controller('sidebarController', sidebarController);

  sidebarController.$inject = ['$mdSidenav','yelp'];

  function sidebarController($mdSidenav, yelp) {
    var vm = this;

    vm.term = 'sushi';
    vm.yelp = yelp;
vm.closeSideNav = closeSideNav;

    init();

    // init
    function init() {

    }

    // closeSideNav
    function closeSideNav(){
      $mdSidenav('sideNavSearchOptions').close();
    }
  }

})();
