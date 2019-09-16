
class ParseException extends Error

    constructor: (message, parsedLine, snippet) ->
        super message
        @message = message
        @parsedLine = parsedLine
        @snippet = snippet

    toString: ->
        if @parsedLine? and @snippet?
            return '<ParseException> ' + @message + ' (line ' + @parsedLine + ': \'' + @snippet + '\')'
        else
            return '<ParseException> ' + @message

module.exports = ParseException
