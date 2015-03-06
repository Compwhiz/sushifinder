(function() {
  'use strict';

  angular.module('app.home').controller('homeController', homeController);

  homeController.$inject = ['$mdSidenav', 'auth', 'yelp', 'geolocation'];

  function homeController($mdSidenav, auth, yelp, geolocation) {
    var vm = this;

    vm.yelpSearch = yelpSearch;
    vm.location = '';
    vm.searching = false;
    vm.searched = false;
    vm.position = null;
    vm.geocode = null;
    vm.showSideNav = showSideNav;

    init();

    // init()
    function init() {
      geolocation.getCurrentPosition().then(function(position) {
          vm.position = position;
          getGeocodeByPosition();
        },
        function(error) {
          console.debug(error);
        });

      if (yelp.searchResults)
        vm.results = yelp.searchResults;
    }

    // yelpSearch
    function yelpSearch() {
      vm.searching = true;
      vm.searched = true;

      if (!vm.location && vm.position) {
        getGeocodeByPosition();
        yelp.searchByPosition(vm.position.coords).then(function(results) {
          vm.results = results;
          vm.searching = false;
        }, function(error) {
          console.debug(error);
          vm.searching = false;
        });
      } else if (vm.location) {
        geolocation.getGeocodeByLocation(vm.location).then(function(geocode) {
          console.debug(geocode);
          getLocalityAndState(geocode);
        }, function(error) {
          console.debug(error);
        })

        yelp.search(vm.location).then(function(results) {
          vm.results = results;
          vm.searching = false;
        }, function(error) {
          console.debug(error);
          vm.searching = false;
        });
      }
    }

    // getGeocodeByPosition
    function getGeocodeByPosition() {
      if (vm.position) {
        geolocation.getGeocodeByCoords(vm.position.coords).then(function(geocode) {
          vm.geocode = geocode;
          getLocalityAndState(geocode);
        }, function(error) {
          console.debug(error);
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

    // showSideNAv
    function showSideNav() {
      $mdSidenav('sideNavSearchOptions').open();
    }
  }
})();
