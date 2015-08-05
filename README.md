# Ionic Quickstarter

A starter project with an improved build process and a better project structure, suitable for bigger apps.

I intend to keep this starter app up to date with the newest versions of Ionic etc, and to add features/improvements.
See [Todo and Roadmap](https://github.com/leob/ionic-quickstarter/wiki/Todo-and-roadmap) on the Wiki, and feel free to
[contribute](https://github.com/leob/ionic-quickstarter/wiki/Contributing).

For background, read my
<a href="http://codepen.io/leob6/blog/ionic-quickstarter-a-starter-app-to-kickstart-your-app-development" target="_blank">
blog post</a>.

## Table of contents

[Introduction](#introduction)<br>
[Installation and usage](#installation-and-usage)<br>
[Gulp file](#gulp-file)<br>
[Project structure](#project-structure)<br>
[Contribute](#contributing)

## Introduction

Ionic Quickstarter is based on the "tabs starter" project from Ionic, but has the following extras:

* Improved gulp file (including a build process optimized for production)
* Improved project structure (a modular app structure suitable for bigger apps)
* Unit test support using Karma and Jasmine
* Signup and login flow implemented using Parse (with the flexibility to plug in other implementations)
* Basic integration with Ionic Analytics (this can be switched off easily if you don't use it)
* Support for the two main Ionic UI patterns: side menus and tabs, and an Intro screen with a Slider
* Includes some commonly used features, for instance form validation using ng-messages
* Provides workarounds for a number of well-known issues in Ionic apps
* Incorporates a number of 'best practices' for AngularJS and Ionic

The first two topics (Project structure and Gulp file) will be explained below.

To keep this README short (it's already too long), I'm putting the rest of the information on the
[Wiki](https://github.com/leob/ionic-quickstarter/wiki).

## Installation and usage

To install the starter app, open a terminal and cd into the directory where you want to install your app.

Run the following commands (note: below the app is named ```myapp```, replace this by your app's name):

<pre>
git clone https://github.com/leob/ionic-quickstarter
mv ionic-quickstarter myapp
cd myapp
</pre>

If you want to put your app under source control and you use Git, type the command:

<pre>
git init
</pre>

Next, edit the following two files using a text editor:

<pre>
ionic.project
config.xml
</pre>

In these files, replace the name ```app``` with your app's name as follows:

* in ```ionic.project```: at line 2 ("name": "app"), replace ```app``` with your app name
* in ```config.xml```: at line 2, replace ```com.ionicframework.app``` with your package name (e.g.
```com.mycompany.myapp```), and at line 3 replace ```app``` with your app name

Finish the installation by entering the following commands:

<pre>
npm install
bower install
ionic state restore --plugins
</pre>

Finally, if you want to add Android and iOS as a runtime platform, type:

<pre>
ionic platform add android
ionic platform add ios
</pre>

The project is now ready to run. To run it in a browser ("ionic serve"), type:

<pre>
ionic serve
</pre>

or any other variation, e.g. (using the "labs" feature, logging to the console, and defaulting to Chrome):

<pre>
ionic serve -l -c --browser google-chrome
</pre>

Click through the app: try the tabs, menus and so on.

If you click the menu item ```log out``` then you will be presented with the login page. In
development mode this is a 'fake' login page. To log in, simply type an arbitrary email address (can be fake too), and
for the password type the text ```password```.

### Some notes on usage

I've set up the gulp file and the starter app in such a way that there are essentially 3 distinct 'modes':

* 'development' mode which is what you use when running "ionic serve" (running in the browser)
* 'test' mode: used when you run 'gulp test' or 'karma start'
* 'production' mode which is what you use with "gulp build" and "ionic run" (running on a device)

As I've currently set it up, these modes are quite different.

#### Development mode

In development mode, the gulp build process is simple: no minification, concatenation etc.

By default, in development mode, the various services (signup, login etc) use a "mock" implementation with fake data
(but you can easily override this through configuration parameters).

#### Production mode

In production mode (used on a real device), the gulp build process does a complete build including minification,
concatenation etc, and the app runs with 'real' services.

(e.g. the Parse service for signup/login, but you can replace this with an implementation of your own)

#### Test mode

Test mode (karma/jasmine) also uses the 'lightweight' build process and 'mock' services.

For more details on configuring and using development, test and production mode, see the
[Wiki](https://github.com/leob/ionic-quickstarter/wiki).

## Gulp file

The gulp.js file supports the following commands:

* ```gulp default``` and ```gulp watch```
* ```gulp jshint```
* ```gulp test``` and ```gulp test-single```
* ```gulp build```

Here is how you use these commands.

### Gulp default and gulp watch

Normally you don't run these commands manually. They will be executed automatically when you run ```ionic serve```. This is done
through a configuration section in the ```ionic.project``` file:

```
 "gulpStartupTasks": [
    "default",
    "watch"
 ]
```

### Gulp jshint

You can run this to hint/lint your Javascript code. Just execute:

```
gulp jshint
```

### Gulp test and gulp test-single

Use these commands to run your tests via the Karma test runner.

```gulp test``` runs the tests and then keeps watching (and re-running) them until you abort the command, while
```gulp test-single``` runs the tests only once and then exits. 

### Gulp build

You use this command to generate a production build to run on a real device. Invoke it like this:

```
gulp build
ionic run
```

Replace ```ionic run``` by ```ionic build``` if you want to perform a build instead of a run.

## Project structure

To support bigger apps, the starter app is structured differently than the basic 'tabs starter app'.

The tabs starter app lumps all the route definitions and controllers in one Javascript file, and puts the html
templates in a separate directory.

Instead, we've chosen to organize the files on a Module basis: each Module is in its own directory containing the
Javascript (controllers etc) and the HTML (templates) for that Module. This makes it easier to keep a large app
organized and maintainable.

As an example, here is the default structure (slightly simplified) after installing the starter app:

```
/
├── scss
│   └── ionic.app.scss
│
├── src
│   ├── css
│   │      
│   ├── img
│   │      
│   ├── js
│   │   ├── app
│   │   │   │
│   │   │   ├── forgotPassword
│   │   │   │   ├── forgotPassword.html
│   │   │   │   └── ForgotPassword.js
│   │   │   │
│   │   │   ├── login
│   │   │   │   ├── loggedout.html
│   │   │   │   ├── login.html
│   │   │   │   ├── LoginCtrl.js
│   │   │   │   ├── LoginRouter.js
│   │   │   │   └── LogoutCtrl.js
│   │   │   │
│   │   │   ├── models
│   │   │   │   └── user.js
│   │   │   │
│   │   │   ├── services
│   │   │   │   ├── application.js
│   │   │   │   ├── userService.js
│   │   │   │   ├── mock
│   │   │   │   │   └── userServiceMockImpl.js
│   │   │   │   └── parse
│   │   │   │       └── userServiceParseImpl.js
│   │   │   app.js
│   │   │   
│   │   └── config
│   │       └── config.js
│   │      
│   ├─── lib
│   │    ├── angular
│   │    ├── ionic
│   │    ├── ngCordova
│   │    └── parse
│   │      
│   └ index.html
│         
└── www
```

The structure shown above is slightly simplified, but the idea is as follows.

### Separate "src" and "www" directories

The app's sources (Javascript, HTML, CSS) sit under ```src``` instead of under the default location ```www```.

This is different than a 'standard' Ionic app, the reason is because of how the build process works.

During a production build (```gulp build```), the sources (under ```src```) are minified and concatenated and so on and
the products (build artifacts, the minified/concatenated files) are then placed in the ```www``` directory, where
Cordova (through the ```ionic run``` or ```ionic build``` process) will pick them up.

This setup keeps the sources under ```src``` cleanly separated from the build artifacts under ```www```.

### Modules

In the structure shown above you can see two Modules: 'forgotPassword' and 'login'.

Each module is an AngularJS module ('angular.module(...')), and each module is in its own directory containing all of
the Javasript and HTML making up that module.

In the example of the 'forgotPassword' module, you see that the directory contains 2 files: a template file
(forgotPassword.html) and a Javascript file (ForgotPassword.js). The Javascript file contains the route definition
(UI-router $stateProvider) and the controller definition.

In the example of the 'login' module you see that the directory contains 5 files: 2 template files (login.html and
loggedOut.html) and 3 Javascript files. In this case you see that we've put the route definitions into a separate file
(LoginRouter.js) and each of the two controllers also in separate files.

Whether or not to put the route definitions and controllers in one Javascript file or in separate files is up to you
and will probably depend on the complexity of the code ('forgotPassword' is simple enough for all the Javascript code
to be put into one file).

Note that during the production build process all of the separate files (Javascript and HTML) will be minified and
concatenated into one file for efficiency reasons.

### Services and mocks

Services which can be reused across modules are in a separate directory ```services```.

A service (for instance the UserService) can have multiple implementations, for instance a "mock" implementation and a
"Parse" implementation. To illustrate, here is the code for userService.js:

```
angular.module('app.user')
  .factory('UserService', function ($injector, APP) {
    if (  APP.testMode) {
      return $injector.get('UserServiceMockImpl');
    } else {
      return $injector.get('UserServiceParseImpl');
    }
  });
```

Depending on "flags" set in the config.js (in this case, APP.testMode), the factory instantiates either a Mock
implementation or a Parse implementation of the user service. These implementations are in subdirectories below the
```service``` directory.

Using this approach, service implementations can easily be changed or swapped out without the client code (controllers
or other services) noticing anything.

The ability to run with 'mock' implementations makes it easy to develop quickly without having to do a complicated
production setup.

In test mode, running with mocked implementations makes running your unit tests a lot faster of course.

## Contributing

Contributions are welcome. For details, see the [Contributing](https://github.com/leob/ionic-quickstarter/wiki/Contributing) section on the Wiki.

