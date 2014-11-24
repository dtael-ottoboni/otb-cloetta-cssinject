var gulp = require('gulp');
var es = require('event-stream');
var gutil = require('gulp-util');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var clean = require('gulp-clean');
var fileinclude = require('gulp-file-include');
var plumber = require('gulp-plumber');
var sass = require('gulp-ruby-sass');
var compass = require('gulp-compass'),
    path = require('path');
var minifycss = require('gulp-minify-css');
var size = require('gulp-size');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var imagemin = require('gulp-imagemin');
var gulpif = require("gulp-if");
var watch = require('gulp-watch');
var browsersync = require('browser-sync');
var reload = browsersync.reload;
var runsequence = require('run-sequence');
var sftp = require('gulp-sftp');
var streamify = require('gulp-streamify');
var packer = require('gulp-packer');
var minifyHTML = require('gulp-minify-html');

var projectname = "otb-cloetta-cssinject";

var basepaths = {
    src: 'src/',
    dest: 'dist/'
};
var paths = {
    images: {
        src: basepaths.src + 'images/',
        dest: basepaths.dest + 'images'
    },
    styles: {
        src: basepaths.src + 'sass/',
        dest: basepaths.dest + 'css/'
    },
    html: {
        src: basepaths.src + '*.html',
        dest: basepaths.dest
    },
    partials: {
        src: basepaths.src + 'partials/'
    }
};

gulp.task('sftp', function () {
    return gulp.src('src/**/*')
        .pipe(sftp({
            host: 'otblnx04.ottoboni.se',
            user: 'tael',
            pass: 'S4pp4r0t',
            remotePath: '/home/tael/public_html/' + projectname
        }));
});

gulp.task('browser-sync', function() {
    return browsersync.init(null, {
        open: false,
        server: {
            baseDir: paths.html.dest
        },
        watchOptions: {
            debounceDelay: 1000
        }
    });
});
gulp.task('watch', function() {
    gulp.watch(paths.styles.src + '**/*.scss', ['styles']);
    gulp.watch(paths.partials.src + '**/*.html', ['html']);
    gulp.watch(paths.html.src, ['html']);
    return gulp.watch('dist/**/**', function(file) {
        if (file.type === "changed") {
            return browsersync.reload(file.path);
        }
    });
});
gulp.task('clean', function() {
    return gulp.src([basepaths.dest], {
        read: false
    }).pipe(clean());
});
gulp.task('html', function() {
    return gulp.src(paths.html.src)
        .pipe(fileinclude())
        //.pipe(minifyHTML({comments:true,spare:true}))
        .pipe(gulp.dest(paths.html.dest))
        .pipe(reload({
        stream: true
        })
    );
});
gulp.task('styles', function() {
    //return gulp.src(paths.styles.src + '**/**').pipe(sass()).pipe(gulp.dest(paths.styles.dest));
    return gulp.src(paths.styles.src + '**/**')
        .pipe(compass({
            project: path.join(__dirname, '/'),
            css: 'dist/css',
            sass: 'src/sass'
        }))
        //.pipe(autoprefixer())
        .pipe(autoprefixer('last 3 version', 'safari 5', 'ie 7', 'ie 8', 'ie 9', 'Firefox >= 10', 'opera 12.1', 'ios 6', 'android 4'))
        //.pipe(autoprefixer('last 3 version', 'safari 5', 'ie 7', 'ie 8', 'ie 9', 'Firefox >= 10', 'opera 12.1', 'ios 6', 'android 4'))
        //.pipe(gulp.dest(paths.styles.dest))
        .pipe(rename({ suffix: '.min' }))
        .pipe(minifycss())
        .pipe(gulp.dest(paths.styles.dest));
});
gulp.task('images', function() {
    return gulp.src(paths.images.src + '**/**.*')
        .pipe(plumber())
        .pipe(imagemin())
        //.pipe(gulp.dest(paths.images.src))
        .pipe(gulp.dest(paths.images.dest));
});
gulp.task('build', function() {
    return runsequence('clean', ['images','styles','html']);
});

gulp.task('default', ['build', 'browser-sync', 'watch']);