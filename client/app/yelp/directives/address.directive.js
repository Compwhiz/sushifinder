(function(){
  angular.module('app.yelp').directive('address', address);

  address.$inject = ['geolocation'];

  function address(geolocation){
    var directive = {
      restrict:'A',
      templateUrl:'client/app/yelp/views/address.html',
      scope:{
        address:'='
      },
      link:link
    };

    return directive;

    function link(scope, element, attrs){
      scope.address.distance = geolocation.calculateDistance(scope.address.coordinate);
    }
  }
})();
