(function() {
  'use strict';

  angular.module('app.core', [
      // Custom modules
      'app.home',
      'app.auth',
      'app.geolocation',
      'app.google',
      'app.yelp',
      'app.sidebar',
      // Third party
      'ui.router',
      'ngMaterial'
    ])
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$mdThemingProvider', function($stateProvider, $urlRouterProvider, $locationProvider, $mdThemingProvider) {
      // $locationProvider.html5Mode(true);

      $urlRouterProvider.otherwise('/');

      $stateProvider.state('home', {
        url: '/',
        controller: 'homeController',
        controllerAs: 'homeCtrl',
        templateUrl: 'app/home/views/home.html'
        // templateProvider: function($templateCache) {
        //   return $templateCache.get('app/home/views/home.html');
        // }
      });

      // Theme setup
      $mdThemingProvider.theme('default')
        .primaryPalette('indigo')
        .accentPalette('deep-orange');
    }]);
})();
