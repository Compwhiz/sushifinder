(function() {
  'use strict';

  angular.module('app.home').controller('homeController', homeController);

  homeController.$inject = ['auth', 'yelp', 'geolocation'];

  function homeController(auth, yelp, geolocation) {
    var vm = this;

    vm.yelpSearch = yelpSearch;
    vm.location = '';
    vm.searching = false;
    vm.searched = false;
    vm.position = {};
    vm.geocode = {};

    init();

    function init() {
      geolocation.getCurrentPosition().then(function(position) {
        vm.position = position;
        geolocation.getGeocode(position.coords).then(function(geocode) {
          vm.geocode = geocode;
          getLocalityAndState(geocode);
        }, function(error) {
          console.debug(error);
        });
      }, function(error) {
        console.debug(error);
      });

      if (yelp.searchResults)
        vm.results = yelp.searchResults;
    }

    // yelpSearch
    function yelpSearch() {
      vm.searching = true;
      vm.searched = true;

      if (vm.position) {
        yelp.searchByPosition(vm.position.coords).then(function(results) {
          vm.results = results;
          vm.searching = false;
        }, function(error) {
          console.debug(error);
          vm.searching = false;
        });
      } else {
        yelp.search(vm.location).then(function(results) {
          vm.results = results;
          vm.searching = false;
        }, function(error) {
          console.debug(error);
          vm.searching = false;
        });
      }
    }

    // getLocalityAndState
    function getLocalityAndState(address) {
      if (!address)
        return;

      var locality = getAddressComponent(address, 'locality');

      if (locality)
        vm.locality = locality.long_name;

      var state = getAddressComponent(address, 'administrative_area_level_1');

      if (state)
        vm.state = state.short_name;

      var postalCode = getAddressComponent(address, 'postal_code');

      if (postalCode)
        vm.postalCode = postalCode.long_name;
    }

    // getAddressComponent
    function getAddressComponent(address, type) {
      return _.find(address.address_components, function(component) {
        return component.types.indexOf(type) >= 0;
      });
    }
  }
})();
