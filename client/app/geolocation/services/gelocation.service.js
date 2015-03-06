(function() {
  angular.module('app.geolocation').factory('geolocation', geolocation);

  geolocation.$inject = ['$http', '$q', 'googleMaps'];

  function geolocation($http, $q, googleMaps) {
    var service = {
      getCurrentPosition: getCurrentPosition,
      calculateDistance: calculateDistance,
      getGeocode: getGeocode,
      currentPosition: {}
    };

    return service;

    // getCurrentPosition
    function getCurrentPosition() {
      var defer = $q.defer();

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          service.currentPosition = position;
          defer.resolve(position);
        });
      } else {
        service.currentPosition = {};
        defer.resolve(null);
      }

      return defer.promise;
    }

    // calculateDistance
    /// 'M' is statute miles (default)
    /// 'K' is kilometers
    /// 'N' is nautical miles
    function calculateDistance(coords, unit) {
      var latLng1 = new googleMaps.LatLng(coords.latitude, coords.longitude);
      var latLng2 = new googleMaps.LatLng(service.currentPosition.coords.latitude, service.currentPosition.coords.longitude);
      return googleMaps.computeDistance(latLng1, latLng2);
    }

    // getGeocode
    function getGeocode(coords) {
      if (!coords)
        return $q.when();

      var url = "https://maps.googleapis.com/maps/api/geocode/json?sensor=false&latlng=";
      var latlng = [].concat(coords.latitude, coords.longitude);
      url += latlng.join();

      var defer = $q.defer();

      $http.get(url).then(function(response) {
        if (response.data.results.length > 0)
          defer.resolve(response.data.results[0]);
        else
          defer.resolve(response.data);
      }, function(error) {
        defer.reject(error);
      });

      return defer.promise;
    }
  }
})();
