;(function() {
"use strict";

appModule('app.util')

  //
  // A simple Stopwatch service.
  //
  // Inspired by: https://medium.com/opinionated-angularjs/angular-model-objects-with-javascript-classes-2e6a067c73bc
  //

  .factory('Stopwatch', function () {

    /**
     * Constructor, with class name
     */
    function Stopwatch(context) {
      this.context = context;
      this.startAt = 0;	// Time of last start / resume. (0 if not running)
      this.lapTime = 0;	// Time on the clock when last stopped in milliseconds
    }

    // Helper functions

    function now() {
      return (new Date()).getTime();
    }

    function pad(num, size) {
      var s = "0000" + num;
      return s.substr(s.length - size);
    }

    function formatTime(time) {
      var h, m, s;  //, ms = 0;
      h = m = s = 0;

      h = Math.floor( time / (60 * 60 * 1000) );
      time = time % (60 * 60 * 1000);
      m = Math.floor( time / (60 * 1000) );
      time = time % (60 * 1000);
      s = Math.floor( time / 1000 );
      //ms = time % 1000;

      return pad(h, 2) + ':' + pad(m, 2) + ':' + pad(s, 2); // + ':' + pad(ms, 3);
    }

    // Public methods

    // Start or resume
    Stopwatch.prototype.start = function() {
      this.startAt = this.startAt || now();
    };

    // Stop or pause
    Stopwatch.prototype.stop = function() {
      // If running, update elapsed time otherwise keep it
      this.lapTime	= this.startAt ? this.lapTime + now() - this.startAt : this.lapTime;
      this.startAt	= 0; // Paused
    };

    // Reset
    Stopwatch.prototype.reset = function() {
      this.lapTime = this.startAt = 0;
    };

    // Duration
    Stopwatch.prototype.time = function() {
      return this.lapTime + (this.startAt ? now() - this.startAt : 0);
    };

    // Duration, formattted
    Stopwatch.prototype.fmtTime = function() {
      return formatTime(this.time());
    };

    /**
     * Return the constructor function ('class')
     */
    return Stopwatch;
  })

;
}());
