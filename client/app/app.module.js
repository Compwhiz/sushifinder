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
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.otherwise('/');

      $stateProvider.state('home', {
        url: '/',
        controller: 'homeController',
        controllerAs: 'homeCtrl',
        templateUrl: 'client/app/home/views/home.html'
      });
    }]);
})();
