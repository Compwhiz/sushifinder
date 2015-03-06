(function(){
  angular.module('app.google').factory('googleMaps', googleMaps);

  googleMaps.$inject = [];

  function googleMaps() {
    var service = {};

    service.LatLng = google.maps.LatLng;
    service.computeDistance = computeDistance;

    return service;

    function computeDistance(from, to, unit){
      var meters = google.maps.geometry.spherical.computeDistanceBetween(from, to);

      // TODO: do some unit conversion here

      return (meters * 0.000621371).toFixed(2);
    }
  }
})();
