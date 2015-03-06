var args = require('yargs').argv;
var browserSync = require('browser-sync');
var gulp = require('gulp');
var config = require('./gulp.config')();
var path = require('path');
var del = require('del');
var glob = require('glob');
var sass = require('gulp-sass');
var _ = require('lodash');
var $ = require('gulp-load-plugins')({
  lazy: true
});

var port = process.env.PORT || config.defaultPort;

gulp.task('help', $.taskListing);
gulp.task('default', ['help']);

///
// Build everything
// This is separate so we can run tests on
// optimize before handling images or fonts
///
gulp.task('build', ['optimize', 'images', 'fonts'], function() {
  log('Builing everything.');

  var msg = {
    title: 'gulp build',
    subtitle: 'Deployed to the build folder',
    message: 'Running `gulp serve-build`'
  };
  del(config.temp);
  log(msg);
  notify(msg);
});

///
// Optimize all files, move to a build folder
// and inject them into the new index.html
///
gulp.task('optimize', ['inject'], function() {
  log('Optimize the js, css and html');

  var assets = $.useref.assets({
    searchPath: [config.root, config.bower.directory]
  });

  var cssFilter = $.filter('**/*.css');
  var jsAppFilter = $.filter('**/' + config.optimized.app);
  var jsLibFilter = $.filter('**/' + config.optimized.lib);

  var templateCache = config.temp + config.templateCache.file;

  return gulp
    .src(config.index)
    .pipe($.plumber())
    .pipe(inject(templateCache, 'templates'))
    .pipe(assets) // Gather all assets from the html with useref
    // Get the css
    .pipe(cssFilter)
    .pipe($.csso()) // Minify css
    .pipe(cssFilter.restore())
    // Get the custom javascript
    .pipe(jsAppFilter)
    .pipe($.ngAnnotate({
      add: true
    }))
    .pipe($.uglify())
    .pipe(getHeader())
    .pipe(jsAppFilter.restore())
    // Get the vendor javascript
    .pipe(jsLibFilter)
    .pipe($.uglify()) // another option is to override wiredep to use min files
    .pipe(jsLibFilter.restore())
    // Take inventory of the file names for future rev numbers
    .pipe($.rev())
    // Apply the concat and file replacement with useref
    .pipe(assets.restore())
    .pipe($.useref())
    // Replace the file names in the html with rev numbers
    .pipe($.revReplace())
    .pipe(gulp.dest(config.build));
});

///
// Vet the code and create coverage report
///
gulp.task('vet', function() {
  log('Analyzing source with JSHint and JSCS');

  return gulp
    .src(config.alljs)
    .pipe($.if(args.verbose, $.print()))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish', {
      verbose: true
    }))
    .pipe($.jshint.reporter('fail'));
  // .pipe($.jscs());
});

///
// Wire-up the bower dependencies
///
gulp.task('wiredep', function() {
  log('Wiring the bower dependencies into the html');

  var wiredep = require('wiredep').stream;
  var options = config.getWiredepDefaultOptions();

  var js = args.stubs ? [].concat(config.js, config.stubsjs) : config.js;
  return gulp
    .src(config.index)
    .pipe(wiredep(options))
    .pipe(inject(js, '', config.jsOrder))
    .pipe(gulp.dest(config.client));
});

///
// Wire up css into html
///
gulp.task('inject', ['wiredep', 'styles', 'templatecache'], function() {
  log('Wire up css into the html, after the files are ready.');

  return gulp
    .src(config.index)
    .pipe(inject(config.css))
    .pipe(gulp.dest(config.client));
});

///
// Watch Sass files for changes
///
gulp.task('scss-watcher', function() {
  gulp.watch([config.scss], ['styles']);
});

///
// Create $templateCache from html templates
///
gulp.task('templatecache', ['clean-code'], function() {
  log('Creating an AngularJS $templateCache');

  return gulp
    .src(config.htmltemplates)
    .pipe($.if(args.verbose, $.bytediff.start()))
    .pipe($.minifyHtml({
      empty: true
    }))
    .pipe($.if(args.verbose, $.bytediff.stop(bytediffFormatter)))
    .pipe($.angularTemplatecache(
      config.templateCache.file,
      config.templateCache.options
    ))
    .pipe(gulp.dest(config.temp));
});

///
// Compile Sass to css
///
gulp.task('styles', ['clean-styles'], function() {
  log('Compiling SASS --> CSS');

  return gulp
    .src(config.scss)
    .pipe($.plumber())
    .pipe(sass())
    .pipe(gulp.dest(config.temp));
});

///
// Copy fonts
///
gulp.task('fonts', ['clean-fonts'], function() {
  log('Copying fonts.');

  return gulp
    .src(config.fonts)
    .pipe(gulp.dest(config.build + 'fonts'));
});

///
// Compress images
///
gulp.task('images', ['clean-images'], function() {
  log('Compressing and copying images.');
  return gulp
    .src(config.images)
    .pipe($.imagemin({
      optimizationLevel: 4
    }))
    .pipe(gulp.dest(config.build + 'images'));
});

///////////////////////////////////////////////////////////////
// CLEAN UP
///////////////////////////////////////////////////////////////

///
// Remove all files from the build, temp and reports folders
///
gulp.task('clean', function(done) {
  var delconfig = [].concat(config.build, config.temp, config.report);
  log('Cleaning: ' + $.util.colors.yellow(delconfig));
  del(delconfig, done);
});

///
// Remove all js and html from the build and temp folders
///
gulp.task('clean-code', function(done) {
  var files = [].concat(
    config.temp + '**/*.js',
    config.build + 'js/**/*.js',
    config.build + '**/*.html'
  );
  clean(files, done);
});

///
// Remove all styles from the build and temp folders
///
gulp.task('clean-styles', function(done) {
  var files = [].concat(
    config.temp + '**/*.css',
    config.build + 'styles/**/*.css'
  );
  clean(files, done);
});

///
// Remove all fonts from the build folder
///
gulp.task('clean-fonts', function(done) {
  clean(config.build + 'fonts/**/*.*', done);
});

///
// Remove all images from the build folder
///
gulp.task('clean-images', function(done) {
  clean(config.build + 'images/**/*.*', done);
});

///////////////////////////////////////////////////////////////
// TESTING
///////////////////////////////////////////////////////////////

///
// Run specs once and exit
///
gulp.task('test', ['vet', 'templateCache'], function() {

});

///
// Serve the dev environment
///
gulp.task('serve-dev', ['inject'], function() {
  serve(true);
});

///
// Serve the build environment
///
gulp.task('serve-build', ['build'], function() {
  serve(false);
});

///
// Bump the version
///
gulp.task('bump', function() {
  var msg = 'Bumping version';
  var type = args.type;
  var version = args.ver;
  var options = {};
  if (version) {
    options.version = version;
    msg += ' to ' + version;
  } else {
    options.type = type;
    msg += ' for a ' + type;
  }
  log(msg);

  return gulp
    .src(config.packages)
    .pipe($.print())
    .pipe($.bump(options))
    .pipe(gulp.dest(config.root));
});

///
// Create a visualizer reoirt
///
gulp.task('plato', function(done) {
  log('Analyze source with Plato');
  log('Browse to /report/plato/index.html to see Plato results');

  startPlatoVisualizer(done);
});

//////////////////////////////////////////////
// Util functions
//////////////////////////////////////////////
function serve(isDev, specRunner) {
  var debug = args.debug || args.debugBrk;
  var debugMode = args.debug ? '--debug' : args.debugBrk ? '--debug-brk' : '';
  var nodeOptions = getNodeOptions(isDev);

  if (debug) {
    runNodeInspector();
    nodeOptions.nodeArgs = [debugMode + '=5858'];
  }

  if (args.verbose) {
    log(nodeOptions);
  }

  return $.nodemon(nodeOptions)
    .on('restart', ['vet'], function(ev) {
      log('*** nodemon restarted');
      log('files changed::\n' + ev);
      setTimeout(function() {
        browserSync.notify('reloading now ...');
        browserSync.reload({
          stream: false
        });
      }, config.browserReloadDelay);
    })
    .on('start', function() {
      log('*** nodemon started');
      startBrowserSync(isDev, specRunner);
    })
    .on('crash', function() {
      log('*** nodemon crashed: script crashed for some reason.');
    })
    .on('exit', function() {
      log('*** nodemon exited cleanly.');
    });
}

function getNodeOptions(isDev) {
  return {
    script: config.nodeServer,
    delayTime: 1,
    env: {
      'PORT': port,
      'NODE_ENV': isDev ? 'dev' : 'build'
    },
    watch: [config.server]
  }
}

function runNodeInspector() {
  log('Running node-inspector');
  log('Browse to http://localhost:8080/debug?port=5858');
  var exec = require('child_process').exec;
  exec('node-inspector');
}

function startBrowserSync(isDev, specRunner) {
  if (args.nosync || browserSync.active) {
    return;
  }

  log('Starting BrowserSync on port ' + port);

  // If build: watches the files, builds and restarts browser-sync
  // If dev: watches scss, compiles it to css, browser sync handles reload
  if (isDev) {
    gulp.watch([config.scss], ['styles'])
      .on('change', changeEvent);
  } else {
    gulp.watch([config.scss, config.js, config.html], ['optimize', browserSync.reload])
      .on('change', changeEvent);
  }

  var options = {
    proxy: 'localhost:' + port,
    port: 8080,
    files: isDev ? [
      config.client + '**/*.*',
      '!' + config.scss,
      config.temp + '**/*.css'
    ] : [],
    ghostMode: { //these are the default t,f,t,t
      clicks: true,
      location: false,
      forms: true,
      scroll: true
    },
    injectChanges: true,
    logFileChanges: true,
    logLevel: 'debug',
    logPrefix: 'gulp-patterns',
    notify: true,
    reloadDelay: 0
  };
  if (specRunner) {
    options.startPath = config.specRunnerFiles;
  }

  browserSync(options);
}

function changeEvent(event) {
  var srcPattern = new RexExp('/.*(?=/' + config.source + ')/');
  log('File ' + event.path.replace(srcPattern, '') + ' ' + event.type);
}

function clean(path, done) {
  log('Cleaning: ' + $.util.colors.yellow(path));
  del(path, done);
}

function inject(src, label, order) {
  var options = {
    read: false
  };
  if (label) {
    options.name = 'inject:' + label;
  }

  return $.inject(orderSrc(src, order), options);
}

function orderSrc(src, order) {
  return gulp
    .src(src)
    .pipe($.if(order, $.order(order)));
}

function log(msg) {
  if (typeof(msg) === 'object') {
    for (var item in msg) {
      if (msg.hasOwnProperty(item)) {
        $.util.log($.util.colors.yellow(msg[item]));
      }
    }
  } else {
    $.util.log($.util.colors.yellow(msg));
  }
}

function getHeader() {
  var pkg = require('./package.json');
  var template = ['/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @authors <%= pkg.authors %>',
    ' * @version v<%= pkg.version %>',
    ' * @link <%= pkg.homepage %>',
    ' * @license <%= pkg.license %>',
    ' */',
    ''
  ].join('\n');
  return $.header(template, {
    pkg: pkg
  });
}

function bytediffFormatter(data) {
  var difference = (data.savings > 0) ? 'smaller.' : 'larger.';
  return data.fileName + ' went from ' +
    (data.startSize / 1000).toFixed(2) + ' kB to ' +
    (data.endSize / 1000).toFixed(2) + ' kB and is ' +
    formatPercent(1 - data.percent, 2) + '%' + difference;
}

function formatPercent(num, precision) {
  return (num * 100).toFixed(precision);
}

function notify(options) {
  var notifier = require('node-notifier');
  var notifyOptions = {
    sound: 'Bottle',
    contentImage: path.join(__dirname, 'gulp.png'),
    icon: path.join(__dirname, 'gulp.png')
  };
  _.assign(notifyOptions, options);
  notifier.notify(notifyOptions);
}

function startPlatoVisualizer(done) {
  log('Running Plato');

  var files = glob.sync(config.plato.js);
  var excludeFiles = /.*\.spec\.js/;
  var plato = require('plato');

  var options = {
    title: 'Plato Inspection Report',
    exclude: excludeFiles
  };
  var outputDir = config.report + '/plato';

  plato.inspect(files, outputDir, options, platoCompleted);

  function platoCompleted(report) {
    var overview = plato.getOverviewReport(report);
    if (args.verbose) {
      log(overview.summary);
    }
    if (done) {
      done();
    }
  }
}

module.exports = gulp;
