var gulp = require('gulp'),
    gp_concat = require('gulp-concat'),
    gp_rename = require('gulp-rename'),
    gp_uglify = require('gulp-uglify'),
    sass = require('gulp-sass');

var stylesGlob = 'src/css/*.scss',
    scriptsGlob = 'src/js/*.js';

gulp.task('js', function(){
    return gulp.src(scriptsGlob)
        .pipe(gp_concat('multiselect.js'))
        .pipe(gulp.dest('dist'))
        .pipe(gp_rename('multiselect.min.js'))
        .pipe(gp_uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('sass', function(){
    return gulp.src(stylesGlob)
               .pipe(sass()) // Using gulp-sass
               .pipe(gulp.dest('dist'));
});

gulp.task('default', ['js', 'sass'], function(){});
gulp.task('watch', function() {
  gulp.watch(stylesGlob, ['sass']);
  gulp.watch(scriptsGlob, ['js']);
})
