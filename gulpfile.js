var gulp = require( 'gulp' );
var jshint = require( 'gulp-jshint' );
var gulpIf = require( 'gulp-if' );
var sass = require( 'gulp-sass' );
var babel = require( 'gulp-babel' );
var sourcemaps = require( 'gulp-sourcemaps' );
var gutil = require( 'gulp-util' );
var PluginError = gutil.PluginError;
var through = require( 'through2' );
var PEG = require( 'pegjs' );



gulp.task( 'default', [ 'build' ]);



gulp.task( 'hint', () => {
	return bableSources()
		.pipe( jshint() )
		.pipe( jshint.reporter( 'jshint-stylish' ) )
		;
})

gulp.task( 'build', [ 'build-scripts', 'build-styles', 'build-assets' ]);

function bableSources() {
	// Note: At the moment, somewhere in here doesn't overwrite or replace or whatever the pegjs file(s),
	// resulting in them appearing in the output dir.
	return gulp.src([ 'source/**/*.{js,jsx,_js,_jsx}', 'source/**/*.pegjs' ], { base: 'source' })
		.pipe( gulpIf( /\.pegjs$/, pegjsTransform() ) )
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



////////

const PEGJS_PLUGIN_NAME = 'gulp-pegjs-transform'

function pegjsTransform( options ) {
	options = Object.assign({}, {
		output: 'source',
		optimize: 'speed'
	}, options );

	return through.obj( function( file, encoding, cb ) {
		// var newFile;

		if( file.isNull() ) {
			return cb( null, file );
		}

		if( file.isBuffer() ) {
			file.extname = '.js';
			file.contents = buildParser( file.contents, options );

			return cb( null, file );
		}

		if( file.isStream() ) {
			return cb( new PluginError( PEGJS_PLUGIN_NAME, "does not support streaming" ) );
		}

		return cb( new PluginError( PEGJS_PLUGIN_NAME, "does not unexpected file contents type" ) );
	});
}

function buildParser( buffer, options ) {
	var pegSource = buffer.toString();
	var jsSource = PEG.buildParser( pegSource, options );
	return new Buffer( `module.exports = ${ jsSource }` );
}
