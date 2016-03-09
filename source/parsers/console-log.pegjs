
Log
	= LogEntry*

LogEntry
	= logFirstLine:LogLineFirst logLines:(EOL LogLineContinuation)* EOL? {
		return {
			time: logFirstLine.time,
			source: logFirstLine.sourceSeverity.source,
			severity: logFirstLine.sourceSeverity.severity || '',
			lines: [ logFirstLine.text ]
				.concat(
					logLines
						.map( function( item ) { return item[ 1 ].text; } )
				)
				.filter( function( text ) { return !! text; } )
		};
	}

LogLineFirst
	= time:Timestamp _ sourceSeverity:SourceSeverity _ text:LogLineText {
		return {
			time: time,
			sourceSeverity: sourceSeverity,
			text: text
		};
	}

LogLineContinuation
	= !( LogLineFirst ) text:LogLineText {
		return { type: 'LogLineContinuation', text: text };
	}

LogLineText
	= text:[^\r\n]* {
		return text.join( '' );
	}

Timestamp
	= '[' h:(Digit Digit) ':' m:(Digit Digit) ':' s:(Digit Digit) ']' {
		return {
			hour: Number( h.join( '' ) ),
			minute: Number( m.join( '' ) ),
			second: Number( s.join( '' ) )
		};
	}

SourceSeverity
	= '[' sourceSeverity:[^\[\]]+ ']:' {
		var matches = /^(.*)\/([^\/]+?)$/.exec( sourceSeverity.join( '' ) );

		if( matches ) {
			return {
				source: matches[ 1 ],
				severity: matches[ 2 ]
			};
		}
		else {
			return {
				source: sourceSeverity
			};
		}
	}

// optional whitespace run
_
	= space:[ \t]* { return space.join( '' ); }

EOL
	= eol:[\r\n] {
		return { type: 'EOL' };
	}

Digit
	= [0-9]
