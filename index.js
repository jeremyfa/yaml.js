
var Yaml = require('./lib/Yaml');

// Compatibility layer with previous version of yaml.js
// That was exposing the YAML library as global object in the browser
if (typeof(window) != 'undefined') {
    window.YAML = {
        parse: function(input, exceptionOnInvalidType, objectDecoder) {
            return Yaml.parse(input, exceptionOnInvalidType, objectDecoder);
        },

        stringify: function(array, inline, indent, exceptionOnInvalidType, objectEncoder) {
            return Yaml.dump(array, inline, indent, exceptionOnInvalidType, objectEncoder);
        }
    };
}

module.exports = {
    Yaml:       require('./lib/Yaml'),
    Parser:     require('./lib/Parser'),
    Dumper:     require('./lib/Dumper')
};
