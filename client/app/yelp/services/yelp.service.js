(function() {
  angular.module('app.yelp').factory('yelp', yelp);

  yelp.$inject = ['$http', '$q'];

  function yelp($http, $q) {
    var service = {
      search: search,
      searchByPosition: searchByPosition,
      getBusiness: getBusiness,
      searchResults: [],
      term:'',
      radius: 10,
      radiusMin: 0,
      radiusMax: 25,
      dealsOnly: false,
      sort: 0,
      sortOptions: [{
        text: 'Best match',
        value: 0
      }, {
        text: 'Distance',
        value: 1
      }, {
        text: 'Highest Rated',
        value: 2
      }]
    };

    return service;

    // search
    function search(location) {
      if (!location || location === '')
        return $q.when();

      var criteria = {
        location: location
      };
      angular.extend(criteria,  getSearchOptions());

      var data = {
        term: service.term || 'sushi',
        criteria: criteria
      };

      return yelpSearch(data);
    }

    // searchByPosition
    /// search by geolocation position
    function searchByPosition(coords) {
      if (!coords)
        return $q.when();

      var ll = [];
      ll.push(coords.latitude);
      ll.push(coords.longitude);

      var criteria = {
        ll: ll.join()
      };
      angular.extend(criteria, getSearchOptions());

      var data = {
        term: service.term || 'sushi',
        criteria: criteria
      };

      return yelpSearch(data);
    }

    // yelpSearch
    function yelpSearch(data) {
      var defer = $q.defer();

      $http.post('/api/yelp/search', data).then(function(response) {
        service.searchResults = response.data.businesses;
        defer.resolve(service.searchResults);
      }, function(error) {
        defer.reject(error);
      });

      return defer.promise;
    }

    // getBusiness
    function getBusiness(id) {
      return $http.get('api/yelp/business/' + id);
    }

    // getSearchOptions
    function getSearchOptions() {
      var options = {
        sort: service.sort,
        // radius_filter: getSearchRadius(),
        deals_filter: service.dealsOnly,
      };
      return options;
    }

    // getSearchRadius
    function getSearchRadius() {
      return service.radius * 1609;
    }
  }
})();
