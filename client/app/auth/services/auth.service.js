(function(){
  angular.module('app.auth').service('auth', auth);

  auth.$inject = ['$http','$q'];

  function auth($http, $q){
    var service = {
      getGoogleAuth:getGoogleAuth
    };

    return service;

    function getGoogleAuth(){
      return $http.get('/auth/google');
    }
  }
})();
