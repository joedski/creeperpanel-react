var gulp = require( 'gulp' );
// var gulpIf = require( 'gulp-if' );
var sass = require( 'gulp-sass' );
var babel = require( 'gulp-babel' );
var sourcemaps = require( 'gulp-sourcemaps' );

gulp.task( 'default', [ 'build' ]);



gulp.task( 'build', [ 'build-scripts', 'build-styles', 'build-assets' ]);

gulp.task( 'build-scripts', () => {
	return gulp.src([ 'source/**/*.{js,jsx,_js,_jsx}' ], { base: 'source' })
		.pipe( sourcemaps.init() )
		.pipe( babel({
			presets: [ 'es2015', 'react' ],
			// plugins: [
			// 	[ 'streamline', { runtime: 'fibers' }]
			// ]
		}))
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
