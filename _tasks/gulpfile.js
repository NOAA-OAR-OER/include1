/*
* * * * * ==============================
* * * * * ==============================
* * * * * ==============================
* * * * * ==============================
========================================
========================================
========================================
----------------------------------------
OER Includes gulpfile - combine JS/CSS
files using includes - John Chase 04/20
----------------------------------------
*/

//check: https://github.com/gulpjs/plugins/blob/master/src/blackList.json
const DEBUG = false //set to false to remove debug output to terminal
const gulp = require('gulp')
const useref = require('gulp-useref')
const gulpif = require('gulp-if')
const uglifyJs = require('gulp-uglify')
const minifyCss = require('gulp-clean-css')
const eol = require('gulp-eol') //for useref to work properly, encode LF replacing CRLF
const mergeStream = require('merge-stream')
const rename = require('gulp-rename')
const debug = require('gulp-debug')
const del = require('del')

/* Minify files in CSS/JS folders */
gulp.task('minifySync', (done) => {   
    return mergeStream(
        gulp.src('../js/**/!(*min*)*.js', {base: "./"})
            .pipe(debug({title: 'js:'}))
            //uglify-js file1.js file2.js -o output.js --source-map output.map.js
            .pipe(uglifyJs())
            .pipe(rename({extname: '.min.js'}))
            .pipe(debug({title: 'remamed to:'}))
            .pipe(gulp.dest('.')),
        gulp.src('../css/**/!(*min*)*.css', {base: "./"})
            .pipe(debug({title: 'css:'}))
            .pipe(minifyCss())
            .pipe(rename({extname: '.min.css'}))
            .pipe(debug({title: 'remamed to:'}))
            .pipe(gulp.dest('.')),       
    )
    done()
})

/* Combine JS/CSS based on build templates in inc files - must be run if any JS or CSS files are changed */
gulp.task('buildComb', (done) => {      
    return gulp.src('../*.*')
        .pipe(debug({title: 'ugly/minify:'}))
        .pipe(eol('\r\n'))
        .pipe(useref())
        .pipe(gulpif('*.js', uglifyJs()))
        .pipe(gulpif('*.js', rename({extname: '.js'})))
        .pipe(gulpif('*.css', minifyCss())) 
        .pipe(gulpif('*.css', rename({extname: '.css'})))
        .pipe(gulp.dest('../'))
    done()
})
    
/* copy inc templates (from build) to the current folder */
gulp.task('copyInc', () => {
    return gulp.src('../_build-no-min/*')
        .pipe(debug({title: 'template copy:'}))
        .pipe(gulp.dest('../'))
})

/* remove converted inc templates */
gulp.task('delInc', () => {
    return del('../*.inc', {force: true})
})

/* remove combined files */
gulp.task('delComb', () => {
    return del('../*.combined*.*s', {force: true})
})

/* pull templates down from build, create assets, then remove converted templates */
gulp.task('default',
    gulp.series('minifySync', 'copyInc',
        gulp.parallel('buildComb'),
        gulp.series('delInc')
    , 'copyInc')
)