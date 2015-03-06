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

      // if (!coords || !service.currentPosition)
      //   return;
      //
      // var radlat1 = Math.PI * coords.latitude / 180;
      // var radlat2 = Math.PI * service.currentPosition.coords.latitude / 180;
      // var radlon1 = Math.PI * coords.longitude / 180;
      // var radlon2 = Math.PI * service.currentPosition.coords.longitude / 180;
      // var theta = coords.longitude - service.currentPosition.coords.longitude;
      // var radtheta = Math.PI * theta / 180;
      // var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      // dist = Math.acos(dist);
      // dist = dist * 180 / Math.PI;
      // dist = dist * 60 * 1.1515;
      // if (unit.toUpperCase() === 'K')
      //   dist = dist * 1.609344;
      // if (unit.toUpperCase() === 'N')
      //   dist = dist * 0.8684;
      //
      // return dist;
    }

    // getGeocode
    function getGeocode(coords) {
      if (!coords)
        return $q.when();

      var url = "http://maps.googleapis.com/maps/api/geocode/json?sensor=false&latlng=";
      var latlng = [].concat(coords.latitude, coords.longitude);
      url += latlng.join();

      var defer = $q.defer();

      console.log(url);

      $http.get(url).then(function(response) {
        console.debug(response);
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
