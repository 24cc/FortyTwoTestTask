// Karma configuration
// Generated on Sun Jul 26 2015 19:48:10 GMT+0300 (EEST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'static/js/angular.min.js',
      'static/js/angular-pusher.min.js',
      'https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js',
      'http://js.pusher.com/2.2/pusher.min.js',
      'http://cdn.jsdelivr.net/angular.pusher/latest/pusher-angular.min.js',
      'static/js/angular-cookies.min.js',
      'static/js/angular-resource.min.js',
      'static/js/sortable.js',
      'static/html/*.html',
      'static/js/angular-mocks.js',
      'apps/taskmng/static/js/tasks.js',
      'apps/taskmng/static/js/*Spec.js'
    ],


    // list of files to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'static/html/*.html': ['ng-html2js']
    },

    ngHtml2JsPreprocessor: {
      // If your build process changes the path to your templates,
      // use stripPrefix and prependPrefix to adjust it.
      //stripPrefix: "static/html/.*/",
      prependPrefix: "/",

      // the name of the Angular module to create
      moduleName: "my.templates",
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  })
};
