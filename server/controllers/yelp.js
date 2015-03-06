var OAuth = require('oauth').OAuth;
var oauth_config = require('../config/secrets').yelp;
var querystring = require('querystring');

var Client = function Client(){
  this.oauthToken = oauth_config.token;
  this.oauthTokenSecret = oauth_config.token_secret;

  this.oauth = new OAuth(
    null,
    null,
    oauth_config.consumer_key,
    oauth_config.consumer_secret,
    oauth_config.version || "1.0",
    null,
    'HMAC-SHA1'
  );

  return this;
};

Client.prototype.get = function(resource, params, callback){
  params = querystring.stringify(params);

  console.log(params);

  var url = oauth_config.api_host + resource + '?' + params;

  console.log(url);

  return this.oauth.get(
    url,
    this.oauthToken,
    this.oauthTokenSecret,
    function(error, data, response){
      if(!error)
        data = JSON.parse(data);
      callback(error, data, response);
    }
  )
}

/*
Exampe:
yelp.search({term: "food", location: "Montreal"}, function(error, data) {});
*/
Client.prototype.search = function(params, callback){
  return this.get('search', params, callback);
}

/*
Example:
yelp.business("yelp-san-francisco", function(error, data) {});
*/
Client.prototype.business = function(id, callback){
  return this.get('business/' + id, null, callback);
}

// @see http://www.yelp.com/developers/documentation/v2/authentication

module.exports = function(app){
  var yelp = new Client();

  app.post('/api/yelp/search', function(req, res) {
    var term = req.body.term;
    var criteria = req.body.criteria;

    if (!term || term === '' || !criteria)
      return;
    criteria.term = term;

    yelp.search(criteria, function(error, data) {
      if (error)
        res.json(error);
      else
        res.json(data);
    });
  });

  app.get('/api/yelp/business/:id', function(req, res) {
    var id = req.params.id;

    if (!id || id === '')
      return;

    yelp.business(id, function(error, data) {
      if (error)
        res.json(error);
      else
        res.json(data);
    });
  });
};
