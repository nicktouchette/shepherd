var del         = require('del');
var gulp        = require('gulp');
var babel       = require('gulp-babel');
var bump        = require('gulp-bump');
var coffee      = require('gulp-coffee');
var header      = require('gulp-header');
var prefixer    = require('gulp-autoprefixer');
var rename      = require('gulp-rename');
var uglify      = require('gulp-uglify');
var sass        = require('gulp-sass');
var umd         = require('gulp-wrap-umd');

// Variables
var distDir = './dist';
var pkg = require('./package.json');
var banner = ['/*!', pkg.name, pkg.version, '*/\n'].join(' ');
var umdOptions = {
  exports: 'Shepherd',
  namespace: 'Shepherd',
  deps: [{
    name: 'Popper',
    globalName: 'Popper',
    paramName: 'Popper',
    amdName: 'popper',
    cjsName: 'popper'
  }]
};


// Clean
gulp.task('clean', function() {
  del.sync([distDir]);
});


// Javascript
gulp.task('js', function() {
  gulp.src('./src/js/**/*.js')
    .pipe(babel())
    .pipe(umd(umdOptions))
    .pipe(header(banner))

    // Original
    .pipe(gulp.dest(distDir + '/js'))

    // Minified
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(distDir + '/js'));
});

// CSS
gulp.task('css', function() {
  gulp.src('./src/css/**/*.sass')
    .pipe(sass({
      includePaths: ['./bower_components']
    }))
    .pipe(prefixer())
    .pipe(gulp.dest(distDir + '/css'));
});

gulp.task('css:docs', function() {
  gulp.src('./docs/welcome/sass/*.sass')
    .pipe(sass())
    .pipe(prefixer())
    .pipe(gulp.dest('./docs/welcome/css'));
});

// Make a copy of popper available to those not using bundling
gulp.task('copy-popper', function() {
  gulp.src('./node_modules/popper.js/dist/umd/popper.js')
      .pipe(gulp.dest(distDir + '/js'));
  gulp.src('./node_modules/popper.js/dist/umd/popper.min.js')
    .pipe(gulp.dest(distDir + '/js'));
});

// Eager
gulp.task('eager', function() {
  gulp.src('./src/eager/**/*.coffee')
    .pipe(coffee())
    .pipe(gulp.dest(distDir + '/eager'));
});


// Version bump
var VERSIONS = ['patch', 'minor', 'major'];
for (var i = 0; i < VERSIONS.length; ++i){
  (function(version) {
    gulp.task('version:' + version, function() {
      gulp.src(['package.json', 'bower.json'])
        .pipe(bump({type: version}))
        .pipe(gulp.dest('.'));
    });
  })(VERSIONS[i]);
}


// Watch
gulp.task('watch', ['js', 'css', 'eager'], function() {
  gulp.watch('./src/js/**/*', ['js']);
  gulp.watch('./src/css/**/*', ['css']);
  gulp.watch('./src/eager/**/*', ['eager']);
});


// Defaults
gulp.task('build', ['js', 'css', 'eager', 'copy-popper']);
gulp.task('default', ['build']);

