// Use this variable to maintain a list of registered modules (see 'module' function below)
var modules = {};

//
// This function is a simple wrapper around "angular.module(...)".
//
// It can replace both angular,module(..., []) AND angular.module(...) (the variants with and without a list of
// dependencies), so it can be used both to register/create a module AND to use a module;
//
// it will figure out automatically if the module was already registered and call the right 'angular.module()'
// variant (with or without a dependency array).
//
// This circumvents the problem where a module is defined in 2 separate Javascript source files, and the module is
// created in 1 file and used in the others. You then have to load the Javascript files in the right order, or it
// won't work. Using the 'module' function circumvents this.
//
// NOTE: practically speaking this is only useful if you don't have to declare dependencies for the module.
//
var appModule = function(moduleName, deps) {
  var mod = modules[moduleName];

  if (!mod) {
    mod = angular.module(moduleName, deps || []);
    modules[moduleName] = mod;
  }

  return mod;
};
