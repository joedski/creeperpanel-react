Parsing server log lines
========================

Presented in SortaKindaMaybeNotBNF.

```
Whitespace := \s
WhitespaceRun := { Whitespace }
EndOfLine := <EOL>
Digit := [0-9]
Timestamp := `[`, Digit, Digit, `:`, Digit, Digit, `:`, Digit, Digit, `]`
Source := `[`, { [^\[\]] }, `]`

LogLineText := { <Not EndOfLine> }, EndOfLine
LogLine := LogLineFirst, [{ LogLineContinuation }]
LogLineFirst := Timestamp, WhitespaceRun, Source, LogLineText
LogLineContinuation := LogLineText

RawLine -> try in order...
	LogLineFirst
	LogLineContinuation

Collect as LogLines.
```
