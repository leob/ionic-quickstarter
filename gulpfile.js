//
// BEGIN - gulp.js
//

//
// === DEPENDENCIES ===
//

var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var del = require('del');
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var sourcemap = require('gulp-sourcemaps');
var vinylPaths = require('vinyl-paths');
var rename = require('gulp-rename');
var ngAnnotate = require('gulp-ng-annotate');
var uglify = require("gulp-uglify");
var imagemin = require('gulp-imagemin');
var htmlreplace = require('gulp-html-replace');
var replace = require('gulp-replace');
var sh = require('shelljs');
var karma = require('karma').server;
var ngConstant = require('gulp-ng-constant');
var extend = require('gulp-extend');
var gulpif = require('gulp-if');
var minifyHtml    = require('gulp-minify-html');
var templateCache = require('gulp-angular-templatecache');
var inject = require('gulp-inject');

//
// === PATHS ===
//

// Files
//
// Note: change the 'ionicbundle' entry below from 'ionic.bundle.min.js' to 'ionic.bundle.js' to debug "moduleErr"
// errors in a production build ("gulp build") - see explanation:
//
// http://www.chrisgmyr.com/2014/08/debugging-uncaught-error-injectormodulerr-in-angularjs/
//
// (the unminified ionic.bundle.js needs to have the extra console.log statement as explained in the article)
//
var files = {
  jsbundle: 'app.bundle.min.js',
  appcss: 'app.css',
  ionicappmincss: 'ionic.app.min.css',
  ionicbundle: 'ionic.bundle.min.js'    // change to 'ionic.bundle.js' for debugging moduleErr errors
};
// Paths
var paths = {
  sass: ['./scss/**/*.scss'],
  css: ['./src/css/**/*.css'],
  scripts: [
    './src/js/**/*.js',
    '!./src/js/lib/ng-img-crop-customized/ng-img-crop.js',   /* exclude ng-img-crop.js: handled separately */
    '!./src/js/lib/ng-img-crop-customized/ng-img-crop.min.js',   /* exclude ng-img-crop.min.js: handled separately */
    '!./src/js/lib/logentries/le.min.js',
    '!./src/js/config/config.js'   /* exclude config.js: handled separately */
  ],
  injectedScripts: [
    './src/js/app/**/*.js',
    '!./src/js/app/app.js',                   /* exclude the root module ('app' module) files */
    '!./src/js/app/application.ctrl.js',      /* exclude the root module ('app' module) files */
    '!./src/js/app/application.service.js'    /* exclude the root module ('app' module) files */
  ],
  images: ['./src/img/**/*'],
  templates: ['./src/js/**/*.html'],
  indexTemplate: ['./src/index-template.html'],
  index: ['./src/index.html'],
  locales: [
    './src/js/locales/*.json'
  ],
  ionicfonts: ['./src/lib/ionic/fonts/*'],
  lib: [
    './src/lib/ionic/js/' + files.ionicbundle,
    './src/lib/angular-resource/angular-resource.min.js',
    './src/lib/angular-messages/angular-messages.min.js',
    './src/lib/angular-elastic/elastic.js',
    './src/lib/ngCordova/dist/ng-cordova.min.js',
    './src/lib/ionic-content-banner/dist/ionic.content.banner.min.js',
    './src/lib/angular-translate/angular-translate.min.js',
    './src/lib/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js',
    './src/lib/fus-messages/dist/fus-messages.js',
    './src/lib/firebase/firebase.js',
    './src/lib/angularfire/dist/angularfire.min.js',
    './src/lib/jsSHA/src/sha1.js',
    './src/js/lib/ng-img-crop-customized/ng-img-crop.min.js',
    './src/js/lib/logentries/le.min.js'
    ],
  dist: ['./www']
};

//
// === TOP LEVEL TASKS (invoke with "gulp <task-name>") ===
//

// default task for DEV

gulp.task('default', ['dev-config', 'dev-sass', 'inject-index']);

// watch task for DEV
//
// NOTE: inject-index does not run automatically within the "watch" task - so, if you add or remove Javascript files
// and you want to inject them into index.html, then you just need to restart "ionic serve" so that the "default" task
// can re-run 'inject-index'.

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['dev-sass']);
});

// karma tasks for TEST

var runtest = function (single) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: single,
    autoWatch: !single
  });
};

gulp.task('test', function (done) {
  runtest(false), done;
});

gulp.task('test-single', function (done) {
  runtest(true), done;
});

// build task for PROD

// Note: use before 'ionic build' or 'ionic run'.
// See: https://github.com/driftyco/ionic-cli/issues/345#issuecomment-88659079
gulp.task('build', ['clean', 'sass', 'scripts', 'prod-config', 'imagemin', 'templates',
                    'inject-index', 'index', 'copy']);

// utility tasks for DEV/PROD/TEST (whichever)

gulp.task('jshint', function() {
  gulp.src(paths.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

//
// === CHILD TASKS ===
//

// use 'del' instead of 'clean', see: https://github.com/gulpjs/gulp/blob/master/docs/recipes/delete-files-folder.md
gulp.task('clean', function (cb) {
  del([
    paths.dist + '/**/*'
  ], cb);
});

var dosass = function(minify, sourcemaps, done) {
  gulp.src('./scss/ionic.app.scss')
  .pipe(sass({includePaths: [ 'src/lib/ionic/scss/' ]}))
  // this keeps the gulp build from crashing when there are errors in your SASS file
  .on("error", function(err) {
    console.log(err.toString());
    this.emit("end");
  })
  .pipe(gulp.dest(paths.dist + '/css/'))
  .pipe(gulpif(sourcemaps, sourcemap.init()))
  .pipe(gulpif(minify, minifyCss({
    keepSpecialComments: 0
  })))
  // delete the source file, see: https://github.com/gulpjs/gulp/blob/master/docs/recipes/delete-files-folder.md#delete-files-in-a-pipeline
  .pipe(vinylPaths(del))
  .pipe(gulpif(sourcemaps, sourcemap.write()))
  .pipe(gulpif(minify, rename({ extname: '.min.css' })))
  .pipe(gulp.dest('./src/css/'))
  .on('end', done);
};

gulp.task('sass', ['clean'], function(done) {
  dosass(
    true,
    false,  // set to TRUE to get source maps
    done
  );
});

gulp.task('dev-sass', function(done) {
  dosass(
    false,
    false,
    done
  );
});

// scripts - clean dist dir then annotate, uglify, concat
gulp.task('scripts', ['clean'], function() {
  gulp.src(paths.scripts)
    .pipe(ngAnnotate({
      remove: true,
      add: true,
      single_quotes: true,
      regexp: "appModule(.*)$"  /* NOTE: this makes ngAnnotate work right even when defining modules with "appModule(...)" instead of "angular.module()" */
    }))
    .pipe(uglify())
    .pipe(concat(files.jsbundle))
    .pipe(gulp.dest(paths.dist + '/js'));
});

var config = function(src, dest) {
  gulp.src(['src/js/config/config-base.json', src])
    .pipe(extend('config.json', true))
    .pipe(ngConstant({
      deps: false
    }))
    .pipe(rename(function(path) {
      path.basename = 'config';
      path.extname = '.js';
    }))
    .pipe(gulp.dest(dest));
};

gulp.task('prod-config', ['clean'], function() {
  config('src/js/config/config-prod.json', paths.dist + '/js/config')
});

gulp.task('dev-config', function() {
  config('src/js/config/config-dev.json', 'src/js/config')
});

// imagemin images and output them in dist
gulp.task('imagemin', ['clean'], function() {
  gulp.src(paths.images)
    .pipe(imagemin())
    .pipe(gulp.dest(paths.dist + '/img'));
});

// inspired by: http://forum.ionicframework.com/t/could-i-set-up-ionic-in-such-a-way-that-it-downloads-an-entire-spa-upfront/7565/5
gulp.task('templates', ['clean', 'scripts'], function() {
  gulp.src(paths.templates)
    .pipe(minifyHtml({empty: true}))
    .pipe(templateCache({
      standalone: true,
      root: 'js'
    }))
    .pipe(gulp.dest(paths.dist + '/js'));
});

// inject javascript paths into index-template.html, producing index.html
gulp.task('inject-index', function() {
  gulp.src(paths.indexTemplate)
    .pipe(inject(
      gulp.src(paths.injectedScripts,
        {read: false}), {relative: true}))
    .pipe(rename(function(path) {
      path.basename = 'index';
      path.extname = '.html';
    }))
    .pipe(gulp.dest('./src/'));
});

// prepare index.html for dist - i.e. using minimized files
gulp.task('index', ['clean', 'inject-index'], function() {
  gulp.src(paths.index)
    .pipe(htmlreplace({
      'sass': 'css/ionic.app.min.css',
      'css': 'css/app.min.css',
      'js': 'js/app.bundle.min.js',
      'ionic': 'lib/ionic/js/' + files.ionicbundle
    }))
    // https://www.airpair.com/ionic-framework/posts/production-ready-apps-with-ionic-framework
    .pipe(replace(/<body /, '<body ng-strict-di '))
    .pipe(gulp.dest(paths.dist + '/.'));
});

// copy all other files to dist directly
gulp.task('copy', ['clean', 'sass'], function() {

  gulp.src(paths.ionicfonts)
    .pipe(gulp.dest(paths.dist + '/lib/ionic/fonts'));

  // 'base' option, see: http://www.levihackwith.com/how-to-make-gulp-copy-a-directory-and-its-contents/
  gulp.src(paths.lib, {base: './src/lib'})
    .pipe(gulp.dest(paths.dist + '/lib'));

  gulp.src('./src/css/' + files.ionicappmincss)
    .pipe(gulp.dest(paths.dist + '/css'));

  gulp.src(paths.locales, {base: './src'})
    .pipe(gulp.dest(paths.dist + '/.')
  );
});

//
// === OTHER TASKS (used by Ionic CLI ?) ===
//

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

//
// END
//
