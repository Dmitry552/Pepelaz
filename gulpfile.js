var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cssnano = require('gulp-cssnano');
var plumber = require('gulp-plumber');
var concat = require('gulp-concat');
var uglify = require('gulp-uglifyjs');


//css
gulp.task('sass', () => {
  gulp.src('dev/sass/**/*.scss')
  .pipe(plumber())
  .pipe(sass())
  .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
    cascade: true
  }))
  .pipe(cssnano())
  .pipe(gulp.dest('public/stylesheets'));
});

//js
gulp.task('script', () => {
  gulp.src([
    'dev/js/auth.js',
    'dev/js/post.js',
    'dev/js/comment.js'
    //
  ])
  .pipe(concat('scripts.js'))
  //.pipe(uglify())
  .pipe(gulp.dest('public/javascripts'))
});

gulp.task('default',  ['sass', 'script'], () => {
  gulp.watch('dev/sass/**/*.scss', ['sass']);
  gulp.watch('dev/js/**/*.js', ['script']);
});