
import fs from 'fs';
import path from 'path';
import { app } from 'electron';

function filePath( fileName ) {
	return path.join( app.getPath( 'userData' ), fileName );
}

function read( fileName, successHandler, next ) {
	fs.readFile( filePath( fileName ), 'utf8', ( error, fileContents ) => {
		if( error ) {
			if( error.code ) {
				console.log( `No ${ fileName } present, returning empty contents.` );
				successHandler( '' );
				return next( null );
			}

			return next( error );
		}

		successHandler( fileContents );

		return next( null );
	});
}

function write( fileName, contents, next ) {
	fs.writeFile( filePath( fileName ), contents, next );
}

export default { filePath, read, write };
