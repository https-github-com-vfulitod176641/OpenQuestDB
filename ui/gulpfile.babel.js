/*******************************************************************************
 *    ___                  _   ____  ____
 *   / _ \ _   _  ___  ___| |_|  _ \| __ )
 *  | | | | | | |/ _ \/ __| __| | | |  _ \
 *  | |_| | |_| |  __/\__ \ |_| |_| | |_) |
 *   \__\_\\__,_|\___||___/\__|____/|____/
 *
 * Copyright (C) 2014-2019 Appsicle
 *
 * This program is free software: you can redistribute it and/or  modify
 * it under the terms of the GNU Affero General Public License, version 3,
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 ******************************************************************************/
// generated on 2016-03-23 using generator-webapp 2.0.0
import gulp from "gulp";
import gulpLoadPlugins from "gulp-load-plugins";
import browserSync from "browser-sync";
import del from "del";
import path from "path";
import fileinclude from "gulp-file-include";

const $ = gulpLoadPlugins();
const reload = browserSync.reload;
const dist = '../core/src/main/resources/site/public';

gulp.task('styles', () => {
    return gulp.src('app/styles/*.scss')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.sass.sync({
            outputStyle: 'expanded',
            precision: 10,
            includePaths: ['.']
        }).on('error', $.sass.logError))
        .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest('.tmp/styles'))
        .pipe(reload({stream: true}));
});

gulp.task('scripts', () => {
    return gulp.src(['app/scripts/**/*.js', 'app/thirdparty/**/*.js'])
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.babel())
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('.tmp/scripts'))
        .pipe(reload({stream: true}));
});

function lint(files, options) {
    return () => {
        return gulp.src(files)
            .pipe(reload({stream: true, once: true}))
            .pipe($.eslint(options))
            .pipe($.eslint.format())
            .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
    };
}

gulp.task('lint', lint('app/scripts/**/*.js'));

gulp.task('html', ['styles', 'scripts'], () => {
    return gulp.src('app/*.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
        .pipe($.if('/\.js$/', $.uglify({compress: {drop_console: true}})))
        .pipe($.if('/\.css$/b', $.cssnano({safe: true, autoprefixer: false})))
        .pipe($.if('/\.html$/', $.htmlmin({
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: {compress: {drop_console: true}},
            processConditionalComments: true,
            removeComments: true,
            removeEmptyAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true
        })))
        .pipe(gulp.dest(dist));
});

gulp.task('css_patterns', () => {
    return gulp.src('app/styles/patterns/**/*')
        .pipe(gulp.dest(path.join(dist, 'styles/patterns')));
});

gulp.task('images', ['css_patterns'], () => {
    return gulp.src('app/images/**/*')
        .pipe($.cache($.imagemin({
            progressive: true,
            interlaced: true,
            // don't remove IDs from SVGs, they are often used
            // as hooks for embedding and styling
            svgoPlugins: [{cleanupIDs: false}]
        })))
        .pipe(gulp.dest(path.join(dist, 'images')));
});

gulp.task('fonts', () => {
    return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) {
    })
        .concat('app/fonts/**/*'))
        .pipe(gulp.dest(path.join(dist, 'fonts')));
});

gulp.task('extras', () => {
    return gulp.src([
        'app/*.*',
        '!app/*.html'
    ], {
        dot: true
    }).pipe(gulp.dest(dist));
});

gulp.task('clean', del.bind(null, ['.tmp', dist], {force: true}));

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras'], () => {
    return gulp.src(path.join(dist, '**/*')).pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], () => {
    gulp.start('build');
});
