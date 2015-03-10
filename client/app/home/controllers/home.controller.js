(function() {
  'use strict';

  angular.module('app.home').controller('homeController', homeController);

  homeController.$inject = ['$mdSidenav', '$mdToast', 'auth', 'yelp', 'geolocation'];

  function homeController($mdSidenav, $mdToast, auth, yelp, geolocation) {
    var vm = this;

    vm.yelpSearch = yelpSearch;
    vm.location = '';
    vm.searching = false;
    vm.searched = false;
    vm.position = null;
    vm.findingPosition = false;
    vm.geocode = null;
    vm.showSideNav = showSideNav;

    init();

    // init()
    function init() {
      getCurrentPosition();

      if (yelp.searchResults)
        vm.results = yelp.searchResults;
    }

    // getCurrentPosition
    function getCurrentPosition() {
      vm.findingPosition = true;
      geolocation.getCurrentPosition().then(function(position) {
          vm.position = position;
          getGeocodeByPosition();
          vm.findingPosition = false;
        },
        function(error) {
          console.debug(error);
          vm.findingPosition = false;
        });
    }

    // yelpSearch
    function yelpSearch(evt) {
      // evt.preventDefault();

      if (!vm.position && !vm.location) {
        $mdToast.show($mdToast.simple()
          .content('Please enter a location or enable GPS location.')
          .position('right'));
        return;
      }

      vm.searching = true;
      vm.searched = true;
      geolocation.searchPosition = null;

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
        getGeocodeByLocation();

        yelp.search(vm.location).then(function(results) {
          vm.results = results;
          vm.searching = false;
        }, function(error) {
          console.debug(error);
          vm.searching = false;
        });
      }
    }

    // getGeocodeByLocation
    function getGeocodeByLocation() {
      if (vm.location) {
        vm.geocode = null;
        geolocation.getGeocodeByLocation(vm.location).then(function(geocode) {
          if (geocode.status !== 'ZERO_RESULTS') {
            vm.geocode = geocode;
            geolocation.searchPosition = geocode.geometry.location;
            getLocalityAndState(geocode);
          }
        }, function(error) {
          console.debug(error);
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
