(function() {
  angular.module('app.yelp').directive('address', address);

  address.$inject = ['$templateCache', 'geolocation'];

  function address($templateCache, geolocation) {
    var directive = {
      restrict: 'A',
      // template: $templateCache.get('app/yelp/views/address.html'),
      templateUrl:'app/yelp/views/address.html',
      scope: {
        address: '='
      },
      link: link
    };

    return directive;

    function link(scope, element, attrs) {
      scope.address.distance = geolocation.calculateDistance(scope.address.coordinate);
    }
  }
})();
