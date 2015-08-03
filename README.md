# Ionic Quickstarter
A starter project for Ionic, sporting an improved build process (gulp file) and a better project structure (targeted at
bigger apps).

For background, read the [blog post](http://codepen.io/write/ionic-quickstarter-a-starter-app-with-an-improved-build-process-and-a-modular-app-structure/).

Ionic Quickstarter is based on the "tabs starter" project from Ionic, but has the following extras:

* Improved project structure (a modular app structure suitable for bigger apps)
* Better gulp file (including a build process optimized for production)
* Unit test support using Karma and Jasmine
* Signup and login flow implemented using Parse (with the flexibility to plug in other implementations)
* Support for the two main Ionic UI patterns: side menus and tabs
* Includes some commonly used features, for instance form validation using ng-messages
* Provides workarounds for some well-known issues in Ionic apps

The first two topics (Project structure and Gulp file) will be explained below.

To keep this README readable (pun intended), I'm putting all of the other information in this repository's Wiki.

My intention is to keep this starter app up to date with newer Ionic features and library/tool versions, and to add
additional features and improvements where useful - see "To do's and Roadmap" below.

Suggestions, contributions, pull requests (please discuss them in advance) are welcome.

First off, I will explain how to install and use the starter app.

## Installation and usage

To install the starter app, open a terminal, cd into the root directory where you want to install your app, and execute
these commands:

(note: in the commands below the app is called 'myapp', please replace this by the name you want to use for your app)

<pre>
git clone https://github.com/leob/ionic-quickstarter
mv ionic-quickstarter myapp
cd myapp
</pre>

Now if you want to put your app under source control and you use Git as your VCS, type the command:

<pre>
git init
</pre>

Next, edit the following two files using a text editor:

<pre>
ionic.project
config.xml
</pre>

In these files, replace the name "app" with your app's name as follows:

* in ionic.project: at line 2 ("name": "app"), replace "app" with your app name
* in config.xml: at line 2, replace 'com.ionicframework.app' with your package name (e.g. 'com.mycompany.myapp'), and
at line 3 replace "app" with your app name

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

If you click the menu item 'logout' then you will be presented with the login page. This is (by default, in development
mode) a 'fake' login page.

To log in, simply type an arbitrary email address (can be fake too), and for the password type the text "password".

### Some notes on usage

I've set up the gulp file and the starter app in such a way that there are essentially 3 distinct 'modes':

* 'development' mode which is what you use when running "ionic serve" (running in the browser)
* 'test' mode: used when you run 'gulp test' or 'karma start'
* 'production' mode which is what you use when doing a "gulp build" followed by "ionic run" (running on a device)

As I've currently set it up, these modes are quite different.

#### Development mode

In 'development' mode, the gulp build process is simple and lightweight: it doesn't do minification/concatenation,
template caching, annotations and so on. It only does a SASS compile (if you want).

Also, in development mode, by default, the various (signup, login etc) use a "mock" implementation using 'fake' data
(note however that you can easily override this through configuration parameters).

All of this makes the development process fast and lightweight.

#### Production mode

Things are different in 'production' mode: the gulp build process does a complete build including minification,
concatenation, template caching and so on, and the app runs with 'real' services.

(e.g. the Parse service for signup/login, although you can replace this with an implementation of your own)

Production mode is used to run on a real device.

#### Test mode

Third mode is the test mode (gulp test/karma). This also uses the 'lightweight' build process and 'mock' service
implementations.

For more details on configuring and using 'development', 'test' and 'production' mode, see the Wiki.

## Improved project structure

To support building bigger apps, I've structured the app in a different way than the basic 'tabs starter app' does.

The 'tabs starter' app lumps all the route definitions and controllers together in one Javascript file, the services
(if any) in another file, and all the html templates are put in a separate directory.

Instead, I'm organize the files on a Module basis, where the controllers and templates that belong to one Module are
placed together in the same directory.

Services that can be re-used across modules are put in a separate directory.

This makes it much easier to keep a large app organized and maintainable.

As an example, here is the default structure (slightly simplified) after you've installed the starter app:

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

The structure shown above is slightly simplified, but the idea is as follows:

The app's sources (Javascript, HTML, CSS) sit under ```src``` instead of under the default location ```www```.

This is because of how the build process works: during a production build ("gulp build"), the sources (under ```src```)
are minified and concatenated and so on and the products (build artifacts, the minified/concatenated files) are then
placed in the ```www``` directory where Cordova (through the "ionic run" or "ionic build" process) will pick them up.

This arrangement keeps the sources (under ```src```) cleanly separated from the build artifacts (under ```www```).

The Javacript AND the html files sit under ```src/js```, so we don't use a separate 'templates' directory.

Right under ```src/js``` sits the index,html file, and under ```src/js/app``` sits app.js (the main app startup file).

### Modules


### Services and mocks


## Better gulp file
* ```gulp default```: 
* ```gulp watch```: 
* ```gulp jshint```: 
* ```gulp test```: 
* ```gulp build```: Concatenate and uglify app into one JS file. A sourcemap can be included to enable easy debugging.

## Unit test support
* Add karma to enable unit testing the angular app
* Run unit tests using ```npm test```.
* Easy CI with travis. Simply add .travis.yml

## Signup and login flow

## The two main Ionic UI patterns: menus and tabs

## Some useful features

## Workarounds for some well-known issues

# To do's and Roadmap

