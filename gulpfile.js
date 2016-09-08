var gulp = require('gulp'),
    gp_concat = require('gulp-concat'),
    gp_rename = require('gulp-rename'),
    gp_uglify = require('gulp-uglify');

gulp.task('js-fef', function(){
    return gulp.src('src/js/*.js')
        .pipe(gp_concat('multiselect.js'))
        .pipe(gulp.dest('dist'))
        .pipe(gp_rename('multiselect.min.js'))
        .pipe(gp_uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['js-fef'], function(){});
