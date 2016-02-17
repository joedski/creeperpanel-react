var gulp = require( 'gulp' );
var jshint = require( 'gulp-jshint' );
// var gulpIf = require( 'gulp-if' );
var sass = require( 'gulp-sass' );
var babel = require( 'gulp-babel' );
var sourcemaps = require( 'gulp-sourcemaps' );



gulp.task( 'default', [ 'build' ]);



gulp.task( 'hint', () => {
	return bableSources()
		.pipe( jshint() )
		.pipe( jshint.reporter( 'jshint-stylish' ) )
		;
})

gulp.task( 'build', [ 'build-scripts', 'build-styles', 'build-assets' ]);

function bableSources() {
	return gulp.src([ 'source/**/*.{js,jsx,_js,_jsx}' ], { base: 'source' })
		.pipe( sourcemaps.init() )
		.pipe( babel({
			// 'stage-0' must go last.  or maybe last-array-position actually means first.  I dunno.
			// Placing it last in the array results makes it not break, though.
			presets: [ 'es2015', 'react', 'stage-0' ],
			// plugins: [
			// 	[ 'streamline', { runtime: 'fibers' }]
			// ]
		}))
		;
}

gulp.task( 'build-scripts', () => {
	return bableSources()
		.pipe( sourcemaps.write( './' ) )
		.pipe( gulp.dest( 'app' ) )
		;
});

gulp.task( 'build-styles', () => {
	return gulp.src( 'source/**/*.{scss,sass}', { base: 'source' })
		.pipe( sourcemaps.init() )
		.pipe( sass({
			includePaths: [ 'node_modules/bootstrap/scss' ],
			// outputStyle: production ? 'compressed' : 'nested',
			// For Bootstrap, I think.
			precision: 8
		}).on( 'error', sass.logError ) )
		.pipe( sourcemaps.write( './' ) )
		.pipe( gulp.dest( 'app' ) )
		;
});

gulp.task( 'build-assets', () => {
	return gulp.src([ 'source/**/*', '!**/*.{js,jsx,_js,_jsx,scss,sass}' ], { base: 'source' })
		.pipe( gulp.dest( 'app' ) )
		;
});
