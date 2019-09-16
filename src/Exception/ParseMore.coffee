
class ParseMore extends Error

    constructor: (message, parsedLine, snippet) ->
        super message
        @message = message
        @parsedLine = parsedLine
        @snippet = snippet

    toString: ->
        if @parsedLine? and @snippet?
            return '<ParseMore> ' + @message + ' (line ' + @parsedLine + ': \'' + @snippet + '\')'
        else
            return '<ParseMore> ' + @message

module.exports = ParseMore
