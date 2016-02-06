;(function() {
  "use strict";

//
// Utility methods for Firebase. Taken from:
//
// https://github.com/firebase/angularfire-seed/blob/master/app/components/firebase.utils/firebase.utils.js
//

  appModule('app.firebase')

    .factory('fbutil', function ($q, $window, FirebaseConfiguration) {

      function pathRef(args) {
        for (var i = 0; i < args.length; i++) {
          if (angular.isArray(args[i])) {
            args[i] = pathRef(args[i]);
          } else if( typeof args[i] !== 'string' ) {
            throw new Error('Argument '+i+' to firebaseRef is not a string: '+args[i]);
          }
        }
        return args.join('/');
      }

      /**
       * Example:
       * <code>
       *    function(firebaseRef) {
         *       var ref = firebaseRef('path/to/data');
         *    }
       * </code>
       *
       * @function
       * @name firebaseRef
       * @param {String|Array...} path relative path to the root folder in Firebase instance
       * @return a Firebase instance
       */
      function ref(path) {
        var fbRef = new $window.Firebase(FirebaseConfiguration.url);
        var args = Array.prototype.slice.call(arguments);
        if( args.length ) {
          fbRef = fbRef.child(pathRef(args));
        }
        return fbRef;
      }

      // Convert a Node.js or Firebase style callback to an Angular style future/promise
      var handler = function(fn, context) {
        return defer(function(def) {
          fn.call(context, function(err, result) {
            if( err !== null ) {
              def.reject(err);
            } else {
              def.resolve(result);
            }
          });

        });
      };

      // Convert an alternatve style future/promise, used for some Firebase APIs
      var handlerForResult = function(fn, context) {
        return defer(function(def) {
          fn.call(context, function(result) {
            def.resolve(result);
          }, function(err) {
            def.reject(err);
          });

        });
      };

      // Abstract the process of creating a future/promise
      var defer = function(fn, context) {
        var def = $q.defer();
        fn.call(context, def);
        return def.promise;
      };

      return {
        ref: ref,
        defer: defer,
        handler: handler,
        handlerForResult: handlerForResult
      };
    })
  ;
}());
