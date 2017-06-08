/***************************************************************************

 Front-end buildline for how-are-you widget

 Provides automation for:
 - svg icons to css background conversion
 - SCSS-scripted stylesheet to standard css translation
 - css merge and optimization

****************************************************************************
 Buildline configuration */

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    svgmin = require('gulp-svgmin'),
    svgToSss = require('gulp-svg-to-css'),
    cleanCSS = require('gulp-clean-css'),
    concatCss = require('gulp-concat-css'),
    browser = require('browser-sync'),
    concat = require('gulp-concat');

var paths = {
  src: {
    svg: 'src/svg/**/*.svg',
    scss: 'src/scss/**/*.scss',
    js: 'src/js/*.js' },
  temp: {
    css: 'temp/css' },
  dist: {
    root: 'dist',
    css: 'how-are-you.min.css',
    static: 'dist/static' },
  bower: [
    'bower_components/angular/angular.min.js',
    'bower_components/jquery/dist/jquery.min.js'
  ]
};


// converts all .svg files in svg-src to css/svg-images.css
function svg(){
  return gulp.src(paths.src.svg)
    .pipe(svgmin({
        plugins: [{
          removeEditorsNSData: {
            additionalNamespaces: ['http://www.evolus.vn/Namespace/Pencil']
        }}]}))
    .pipe(svgToSss('svg-images.css'))
    .pipe(gulp.dest(paths.temp.css));
}


// compiles all .scss files to css
function sass_to_css() {
  return gulp.src(paths.src.scss)
    .pipe(sass())
    .pipe(gulp.dest(paths.temp.css));
}


// builds the widget stylesheet (how-are-you.min.css)
function compile_css(){
  return gulp.src(paths.temp.css + '/*.css')
  .pipe(cleanCSS({compatibility: 'ie9'}))
  .pipe(concatCss(paths.dist.css))
  .pipe(gulp.dest(paths.dist.static));
}

// copy external libraries (from bower)
function copy_external_libs(){
  return gulp.src(paths.bower)
    .pipe(gulp.dest(paths.dist.static));
}

// compiles application scripts
function compile_js(){
  return gulp.src(['src/js/dialog_logic.js', 'src/js/monolith.js'])
    .pipe(concat('how-are-you.js'))
    .pipe(gulp.dest(paths.dist.static));
}

gulp.task('build',
  gulp.series(
    gulp.parallel(svg, sass_to_css, copy_external_libs),
    gulp.parallel(compile_css, compile_js)));

/***************************************************************************
 Live development setup */

function watch(){
  gulp.watch(paths.src.scss).on('all', gulp.series('build', browser.reload));
  gulp.watch(paths.src.svg).on('all', gulp.series('build', browser.reload));
  gulp.watch(paths.src.js).on('all', gulp.series(compile_js, browser.reload));
}

function watch_nb(){
  gulp.watch(paths.src.scss).on('all', gulp.series('build'));
  gulp.watch(paths.src.svg).on('all', gulp.series('build'));
  gulp.watch(paths.src.js).on('all', gulp.series(compile_js));
}

function server(done) {
  browser.init({server: paths.dist.root, port: 8000});
  done();
}

gulp.task('debug', gulp.series('build', server, watch));
gulp.task('deflask', gulp.series('build', watch_nb));
