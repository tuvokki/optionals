var underscore  = require('underscore'),
    fs          = require('fs'),
    gulp        = require('gulp'),
    sass        = require('gulp-sass'),
    minifyHTML  = require('gulp-minify-html'),
    concat      = require('gulp-concat'),
    uglify      = require('gulp-uglify'),
    jshint      = require('gulp-jshint'),
    stylish     = require('jshint-stylish'),
    browserSync = require('browser-sync'),
    del         = require('del'),
    plumber     = require('gulp-plumber');

gulp.task('sass', function () {
  gulp.src('src/scss/styles.scss')
    .pipe(plumber())
    .pipe(sass({includePaths: ['scss']}))
    .pipe(gulp.dest('dist/static/css'));
});

/**
 * gulp-minify-html
 * All options are false by default.
 * 
 * empty        - do not remove empty attributes
 * cdata        - do not strip CDATA from scripts
 * comments     - do not remove comments
 * conditionals - do not remove conditional internet explorer comments
 * spare        - do not remove redundant attributes
 * quotes       - do not remove arbitrary quotes
 * 
 * so setting empty:true is the same as telling minifyHTML "do not remove empty attributes."
 */
gulp.task('minify-html', function() {
  var opts = {empty:true,spare:true};

  gulp.src('src/*.html')
    .pipe(plumber())
    .pipe(minifyHTML(opts))
    .pipe(gulp.dest('dist'))
});

gulp.task('minify-partials', function() {
  var opts = {empty:true,spare:true};

  gulp.src('src/partials/*.html')
    .pipe(plumber())
    .pipe(minifyHTML(opts))
    .pipe(gulp.dest('dist/partials'))
});

gulp.task('vendor', function() {
  var bowerFile = require('./bower.json');
  var bowerDir = './client/lib';
  var bowerPackages = [];

  // assume that all bower deps have to be included in the order they are listed in bower.json
  underscore.each(bowerFile.dependencies, function(version, name){
    var file = bowerDir + '/' + name + '/' + name;
    if (fs.existsSync(file + '.min.js')) {
      // use min version
      bowerPackages.push(file + '.min.js');
    } else {
      // unminified
      bowerPackages.push(file + '.js');
    }
  });

  gulp.src(bowerPackages)
    .pipe(plumber())
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('dist/static/js'))
});

gulp.task('scripts', function() {
  gulp.src(['src/javascript/app.js', 'src/javascript/directives/*.js', 'src/javascript/services/*.js', 'src/javascript/controllers/*.js'])
    .pipe(plumber())
    // .pipe(uglify())
    .pipe(concat('app.js'))
    .pipe(gulp.dest('dist/static/js'))
});

gulp.task('browser-sync', function() {
  browserSync.init(["dist/static/css/*.css", "dist/static/js/*.js", "dist/index.html", "dist/partials/*.html"], {
    server: {
      baseDir: "./dist/"
    }
  });
});

gulp.task('lint', function() {
  gulp.src(['src/javascript/controllers/*.js', 'src/javascript/services/*.js', 'src/javascript/*.js'])
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

/**
 * Cleanup task. Removes the dist folder.
 */
gulp.task('clean', function () {
  del([
    // here we use a globbing pattern to match everything inside the dist folder
    'dist/**'
  ]);
});

gulp.task('default', ['vendor', 'scripts', 'minify-html', 'minify-partials', 'sass', 'browser-sync'], function () {
  gulp.watch("src/scss/*.scss", ['sass']);
  gulp.watch("src/javascript/**/*.js", ['scripts', 'lint']);
  gulp.watch("src/index.html", ['minify-html']);
  gulp.watch("src/partials/*.html", ['minify-partials']);
});
