# Ionic Quickstarter
A starter project for Ionic, sporting an improved build process (gulp file) and project structure (targeted at bigger
apps).

My intention is to keep this starter app up to date with newer Ionic features and library/tool versions, and to add
additional features and improvements where useful.

For more information, read the [blog post](http://codepen.io/write/ionic-quickstarter-a-starter-app-with-an-improved-build-process-and-a-modular-app-structure/).

Based on the "tabs starter" project from Ionic, but has the following extras: 

* Improved project structure (a modular app structure suitable for bigger apps)
* Better gulp file (including a build process optimized for production).
* Unit test support using Karma and Jasmine
* Signup and login flow implemented using Parse (with the flexibility to plug in other implementations)
* Support for the two main Ionic UI patterns: side menus and tabs
* Includes some commonly used features, for instance form validation using ng-messages
* Provides workarounds for some well-known issues in Ionic apps

These topics will be explained in detail below. First I will explain how to install and use the starter app.

## Installation

To install the starter app, execute the following commands.
In the commands below the new app is called 'myapp', please replace this by the name you want to use for your app.

Open a terminal, cd into the root directory where you want to install your app, and execute these commands:

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

Now finish the installation by entering the following commands:

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

## Improved project structure
More organised angular app structure using a single controller/service/... per file

For example, here's the default app:

```
src
├── js
│   ├── app.js
│   ├── controllers
│   │   ├── account.ctrl.js
│   │   ├── chatdetail.ctrl.js
│   │   ├── chats.ctrl.js
│   │   └── dash.ctrl.js
│   └── services
│       └── chats.service.js
├── scss
│   └── ionic.app.scss
└── templates
    ├── chat-detail.html
    ├── tab-account.html
    ├── tab-chats.html
    ├── tab-dash.html
    └── tabs.html
```
## Better gulp file
* ```gulp build```: Concatenate and uglify app into one JS file. A sourcemap is included to enable easy debugging.
* ```gulp templates```: Concatenate templates into a single file that's included in the app (no requests during runtime). 
* ```gulp bump```: Better app version changing using [gulp-bump](https://github.com/stevelacy/gulp-bump)

## Unit test support
* Add karma to enable unit testing the angular app
* Run unit tests using ```npm test```.
* Easy CI with travis. Simply add .travis.yml

## Signup and login flow

## The two main Ionic UI patterns: menus and tabs

## Some useful features

## Workarounds for some well-known issues

# To do's and future improvements

