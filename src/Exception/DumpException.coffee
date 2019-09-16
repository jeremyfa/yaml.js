
class DumpException extends Error

    constructor: (message, parsedLine, snippet) ->
        super message
        @message = message
        @parsedLine = parsedLine
        @snippet = snippet

    toString: ->
        if @parsedLine? and @snippet?
            return '<DumpException> ' + @message + ' (line ' + @parsedLine + ': \'' + @snippet + '\')'
        else
            return '<DumpException> ' + @message

module.exports = DumpException
