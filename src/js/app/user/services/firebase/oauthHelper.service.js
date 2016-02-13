;(function() {
"use strict";

//
// A utility service with Cordova Oauth helper funtions (currently only used for Twitter Oauth flows).
//
// This code was copied and amended from src/lib/ngCordova/dist/ng-cordovajs ("oauth.providers" module, "$cordovaOauth"
// service).
//

angular.module('app.oauthUtil', ["oauth.utils"])

  .factory("oauthHelper", ["$q", '$http', "$cordovaOauthUtility", function($q, $http, $cordovaOauthUtility) {

    return {

      /*
       * Initialize an auth against the Twitter service, but do not complete it (use a hidden InAppBrowser winndow, and
       * close the window after a few seconds and do not complete the request).
       *
       * The goal is to mimick a "logout" call (which the Twitter API does not officially support) by passing the URL
       * params "force_login=true" and "screen_name=" (empty Twitter user name).
       *
       * Note that this service requires jsSHA for generating HMAC-SHA1 Oauth 1.0 signatures
       *
       * @param    string clientId
       * @param    string clientSecret
       * @return   promise
       */
      twitter: function (clientId, clientSecret, options) {
        var deferred = $q.defer();

        if (window.cordova) {
          var cordovaMetadata = cordova.require("cordova/plugin_list").metadata;

          if ($cordovaOauthUtility.isInAppBrowserInstalled(cordovaMetadata) === true) {
            var redirect_uri = "http://localhost/callback";
            if (options !== undefined) {
              if (options.hasOwnProperty("redirect_uri")) {
                redirect_uri = options.redirect_uri;
              }
            }

            if (typeof jsSHA !== "undefined") {
              var oauthObject = {
                oauth_consumer_key: clientId,
                oauth_nonce: $cordovaOauthUtility.createNonce(10),
                oauth_signature_method: "HMAC-SHA1",
                oauth_timestamp: Math.round((new Date()).getTime() / 1000.0),
                oauth_version: "1.0"
              };
              var signatureObj = $cordovaOauthUtility.createSignature("POST", "https://api.twitter.com/oauth/request_token", oauthObject, {oauth_callback: redirect_uri}, clientSecret);
              $http({
                method: "post",
                url: "https://api.twitter.com/oauth/request_token",
                headers: {
                  "Authorization": signatureObj.authorization_header,
                  "Content-Type": "application/x-www-form-urlencoded"
                },
                data: "oauth_callback=" + encodeURIComponent(redirect_uri)
              })
              .then(function (response) {
                var requestTokenResult = response.data;
                var requestTokenParameters = (requestTokenResult).split("&");
                var parameterMap = {};
                for (var i = 0; i < requestTokenParameters.length; i++) {
                  parameterMap[requestTokenParameters[i].split("=")[0]] = requestTokenParameters[i].split("=")[1];
                }
                if (parameterMap.hasOwnProperty("oauth_token") === false) {
                  deferred.reject("Oauth request token was not received");
                }

                // Pass the URL params "screen_name=" and "force_login=true" to force re-authentication, but don't
                // complete the auth flow (the Twitter login form is displayed in a hidden Inappbrowser window), thus
                // in effect performing a "logout"
                var url = 'https://api.twitter.com/oauth/authenticate?screen_name=&force_login=true&oauth_token=' + parameterMap.oauth_token;

                // set "hidden=yes" because we don't want to show the login form to the user (we're not interested in
                // performing an actual login)
                var browserRef = window.open(url, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes,hidden=yes');

                // close the login popup after a second (again, we're not interested in performing an actual login)
                setTimeout(function () {
                  browserRef.close();
                }, 1000);
                deferred.resolve("The sign in flow was canceled on purpose");
              })
              .catch(function (response) {
                deferred.reject(response);
              })
            } else {
              deferred.reject("Missing jsSHA JavaScript library");
            }
          } else {
            deferred.reject("Could not find InAppBrowser plugin");
          }
        } else {
          deferred.reject("Cannot authenticate via a web browser");
        }
        return deferred.promise;
      }

    }

  }]);

}());

