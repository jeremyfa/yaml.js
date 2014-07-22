(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Dumper, Inline, Utils;

Utils = require('./Utils');

Inline = require('./Inline');

Dumper = (function() {
  function Dumper() {}

  Dumper.indentation = 4;

  Dumper.prototype.dump = function(input, inline, indent, exceptionOnInvalidType, objectEncoder) {
    var isAHash, key, output, prefix, value, willBeInlined;
    if (inline == null) {
      inline = 0;
    }
    if (indent == null) {
      indent = 0;
    }
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectEncoder == null) {
      objectEncoder = null;
    }
    output = '';
    prefix = (indent ? Utils.strRepeat(' ', indent) : '');
    if (inline <= 0 || typeof input !== 'object' || Utils.isEmpty(input)) {
      output += prefix + Inline.dump(input, exceptionOnInvalidType, objectEncoder);
    } else {
      isAHash = !(input instanceof Array);
      for (key in input) {
        value = input[key];
        willBeInlined = inline - 1 <= 0 || typeof value !== 'object' || Utils.isEmpty(value);
        output += prefix + (isAHash ? Inline.dump(key, exceptionOnInvalidType, objectEncoder) + ':' : '-') + (willBeInlined ? ' ' : "\n") + this.dump(value, inline - 1, (willBeInlined ? 0 : indent + this.indentation), exceptionOnInvalidType, objectEncoder) + (willBeInlined ? "\n" : '');
      }
    }
    return output;
  };

  return Dumper;

})();

module.exports = Dumper;



},{"./Inline":5,"./Utils":9}],2:[function(require,module,exports){
var Escaper, Pattern;

Pattern = require('./Pattern');

Escaper = (function() {
  var ch;

  function Escaper() {}

  Escaper.LIST_ESCAPEES = ['\\\\', '\\"', '"', "\x00", "\x01", "\x02", "\x03", "\x04", "\x05", "\x06", "\x07", "\x08", "\x09", "\x0a", "\x0b", "\x0c", "\x0d", "\x0e", "\x0f", "\x10", "\x11", "\x12", "\x13", "\x14", "\x15", "\x16", "\x17", "\x18", "\x19", "\x1a", "\x1b", "\x1c", "\x1d", "\x1e", "\x1f", (ch = String.fromCharCode)(0x0085), ch(0x00A0), ch(0x2028), ch(0x2029)];

  Escaper.LIST_ESCAPED = ['\\"', '\\\\', '\\"', "\\0", "\\x01", "\\x02", "\\x03", "\\x04", "\\x05", "\\x06", "\\a", "\\b", "\\t", "\\n", "\\v", "\\f", "\\r", "\\x0e", "\\x0f", "\\x10", "\\x11", "\\x12", "\\x13", "\\x14", "\\x15", "\\x16", "\\x17", "\\x18", "\\x19", "\\x1a", "\\e", "\\x1c", "\\x1d", "\\x1e", "\\x1f", "\\N", "\\_", "\\L", "\\P"];

  Escaper.MAPPING_ESCAPEES_TO_ESCAPED = (function() {
    var i, mapping, _i, _ref;
    mapping = {};
    for (i = _i = 0, _ref = Escaper.LIST_ESCAPEES.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      mapping[Escaper.LIST_ESCAPEES[i]] = Escaper.LIST_ESCAPED[i];
    }
    return mapping;
  })();

  Escaper.PATTERN_CHARACTERS_TO_ESCAPE = new Pattern('[\\x00-\\x1f]|\xc2\x85|\xc2\xa0|\xe2\x80\xa8|\xe2\x80\xa9');

  Escaper.PATTERN_MAPPING_ESCAPEES = new Pattern(Escaper.LIST_ESCAPEES.join('|'));

  Escaper.PATTERN_SINGLE_QUOTING = new Pattern('[\\s\'":{}[\\],&*#?]|^[-?|<>=!%@`]');

  Escaper.requiresDoubleQuoting = function(value) {
    return this.PATTERN_CHARACTERS_TO_ESCAPE.test(value);
  };

  Escaper.escapeWithDoubleQuotes = function(value) {
    return this.PATTERN_MAPPING_ESCAPEES.replace(value, (function(_this) {
      return function(str) {
        return _this.MAPPING_ESCAPEES_TO_ESCAPED[str];
      };
    })(this));
  };

  Escaper.requiresSingleQuoting = function(value) {
    return this.PATTERN_SINGLE_QUOTING.test(value);
  };

  Escaper.escapeWithSingleQuotes = function(value) {
    return "'" + value.replace('\'', '\'\'') + "'";
  };

  return Escaper;

})();

module.exports = Escaper;



},{"./Pattern":7}],3:[function(require,module,exports){
var DumpException,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

DumpException = (function(_super) {
  __extends(DumpException, _super);

  function DumpException(message, parsedLine, snippet) {
    this.message = message;
    this.parsedLine = parsedLine;
    this.snippet = snippet;
  }

  DumpException.prototype.toString = function() {
    if ((this.parsedLine != null) && (this.snippet != null)) {
      return '<DumpException> ' + this.message + ' (line ' + this.parsedLine + ': \'' + this.snippet + '\')';
    } else {
      return '<DumpException> ' + this.message;
    }
  };

  return DumpException;

})(Error);

module.exports = DumpException;



},{}],4:[function(require,module,exports){
var ParseException,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ParseException = (function(_super) {
  __extends(ParseException, _super);

  function ParseException(message, parsedLine, snippet) {
    this.message = message;
    this.parsedLine = parsedLine;
    this.snippet = snippet;
  }

  ParseException.prototype.toString = function() {
    if ((this.parsedLine != null) && (this.snippet != null)) {
      return '<ParseException> ' + this.message + ' (line ' + this.parsedLine + ': \'' + this.snippet + '\')';
    } else {
      return '<ParseException> ' + this.message;
    }
  };

  return ParseException;

})(Error);

module.exports = ParseException;



},{}],5:[function(require,module,exports){
var DumpException, Escaper, Inline, ParseException, Pattern, Unescaper, Utils,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Pattern = require('./Pattern');

Unescaper = require('./Unescaper');

Escaper = require('./Escaper');

Utils = require('./Utils');

ParseException = require('./Exception/ParseException');

DumpException = require('./Exception/DumpException');

Inline = (function() {
  function Inline() {}

  Inline.REGEX_QUOTED_STRING = '(?:"(?:[^"\\\\]*(?:\\\\.[^"\\\\]*)*)"|\'(?:[^\']*(?:\'\'[^\']*)*)\')';

  Inline.PATTERN_TRAILING_COMMENTS = new Pattern('^\\s*#.*$');

  Inline.PATTERN_QUOTED_SCALAR = new Pattern('^' + Inline.REGEX_QUOTED_STRING);

  Inline.PATTERN_THOUSAND_NUMERIC_SCALAR = new Pattern('^(-|\\+)?[0-9,]+(\\.[0-9]+)?$');

  Inline.PATTERN_SCALAR_BY_DELIMITERS = {};

  Inline.settings = {};

  Inline.configure = function(exceptionOnInvalidType, objectDecoder) {
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = null;
    }
    if (objectDecoder == null) {
      objectDecoder = null;
    }
    this.settings.exceptionOnInvalidType = exceptionOnInvalidType;
    this.settings.objectDecoder = objectDecoder;
  };

  Inline.parse = function(value, exceptionOnInvalidType, objectDecoder) {
    var context, result;
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectDecoder == null) {
      objectDecoder = null;
    }
    this.settings.exceptionOnInvalidType = exceptionOnInvalidType;
    this.settings.objectDecoder = objectDecoder;
    if (value == null) {
      return '';
    }
    value = Utils.trim(value);
    if (0 === value.length) {
      return '';
    }
    context = {
      exceptionOnInvalidType: exceptionOnInvalidType,
      objectDecoder: objectDecoder,
      i: 0
    };
    switch (value.charAt(0)) {
      case '[':
        result = this.parseSequence(value, context);
        ++context.i;
        break;
      case '{':
        result = this.parseMapping(value, context);
        ++context.i;
        break;
      default:
        result = this.parseScalar(value, null, ['"', "'"], context);
    }
    if (this.PATTERN_TRAILING_COMMENTS.replace(value.slice(context.i), '') !== '') {
      throw new ParseException('Unexpected characters near "' + value.slice(context.i) + '".');
    }
    return result;
  };

  Inline.dump = function(value, exceptionOnInvalidType, objectEncoder) {
    var result, type, _ref;
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectEncoder == null) {
      objectEncoder = null;
    }
    if (value == null) {
      return 'null';
    }
    type = typeof value;
    if (type === 'object') {
      if (value instanceof Date) {
        return value.toISOString();
      } else if (objectEncoder != null) {
        result = objectEncoder(value);
        if (typeof result === 'string' || (result != null)) {
          return result;
        }
      }
      return this.dumpObject(value);
    }
    if (type === 'boolean') {
      return (value ? 'true' : 'false');
    }
    if (Utils.isDigits(value)) {
      return (type === 'string' ? "'" + value + "'" : '' + parseInt(value));
    }
    if (Utils.isNumeric(value)) {
      return (type === 'string' ? "'" + value + "'" : '' + parseFloat(value));
    }
    if (type === 'number') {
      return (value === Infinity ? '.Inf' : (value === -Infinity ? '-.Inf' : (isNaN(value) ? '.NaN' : value)));
    }
    if (Escaper.requiresDoubleQuoting(value)) {
      return Escaper.escapeWithDoubleQuotes(value);
    }
    if (Escaper.requiresSingleQuoting(value)) {
      return yaml.escapeWithSingleQuotes(value);
    }
    if ('' === value) {
      return '""';
    }
    if (Utils.PATTERN_DATE.test(value)) {
      return "'" + value + "'";
    }
    if ((_ref = value.toLowerCase()) === 'null' || _ref === '~' || _ref === 'true' || _ref === 'false') {
      return "'" + value + "'";
    }
    return value;
  };

  Inline.dumpObject = function(value, exceptionOnInvalidType, objectSupport) {
    var key, output, val, _i, _len;
    if (objectSupport == null) {
      objectSupport = null;
    }
    if (value instanceof Array) {
      output = [];
      for (_i = 0, _len = value.length; _i < _len; _i++) {
        val = value[_i];
        output.push(this.dump(val));
      }
      return '[' + output.join(', ') + ']';
    } else {
      output = [];
      for (key in value) {
        val = value[key];
        output.push(this.dump(key) + ': ' + this.dump(val));
      }
      return '{' + output.join(', ') + '}';
    }
  };

  Inline.parseScalar = function(scalar, delimiters, stringDelimiters, context, evaluate) {
    var i, joinedDelimiters, match, output, pattern, strpos, tmp, _ref, _ref1;
    if (delimiters == null) {
      delimiters = null;
    }
    if (stringDelimiters == null) {
      stringDelimiters = ['"', "'"];
    }
    if (context == null) {
      context = null;
    }
    if (evaluate == null) {
      evaluate = true;
    }
    if (context == null) {
      context = {
        exceptionOnInvalidType: this.settings.exceptionOnInvalidType,
        objectDecoder: this.settings.objectDecoder,
        i: 0
      };
    }
    i = context.i;
    if (_ref = scalar.charAt(i), __indexOf.call(stringDelimiters, _ref) >= 0) {
      output = this.parseQuotedScalar(scalar, context);
      i = context.i;
      if (delimiters != null) {
        tmp = Utils.ltrim(scalar.slice(i), ' ');
        if (!(_ref1 = tmp.charAt(0), __indexOf.call(delimiters, _ref1) >= 0)) {
          throw new ParseException('Unexpected characters (' + scalar.slice(i) + ').');
        }
      }
    } else {
      if (!delimiters) {
        output = scalar.slice(i);
        i += output.length;
        strpos = output.indexOf(' #');
        if (strpos !== -1) {
          output = Utils.rtrim(output.slice(0, strpos));
        }
      } else {
        joinedDelimiters = delimiters.join('|');
        pattern = this.PATTERN_SCALAR_BY_DELIMITERS[joinedDelimiters];
        if (pattern == null) {
          pattern = new Pattern('^(.+?)(' + joinedDelimiters + ')');
          this.PATTERN_SCALAR_BY_DELIMITERS[joinedDelimiters] = pattern;
        }
        if (match = pattern.exec(scalar.slice(i))) {
          output = match[1];
          i += output.length;
        } else {
          throw new ParseException('Malformed inline YAML string (' + scalar + ').');
        }
      }
      if (evaluate) {
        output = this.evaluateScalar(output, context);
      }
    }
    context.i = i;
    return output;
  };

  Inline.parseQuotedScalar = function(scalar, context) {
    var i, match, output;
    i = context.i;
    if (!(match = this.PATTERN_QUOTED_SCALAR.exec(scalar.slice(i)))) {
      throw new ParseException('Malformed inline YAML string (' + scalar.slice(i) + ').');
    }
    output = match[0].substr(1, match[0].length - 2);
    if ('"' === scalar.charAt(i)) {
      output = Unescaper.unescapeDoubleQuotedString(output);
    } else {
      output = Unescaper.unescapeSingleQuotedString(output);
    }
    i += match[0].length;
    context.i = i;
    return output;
  };

  Inline.parseSequence = function(sequence, context) {
    var e, i, isQuoted, len, output, value, _ref;
    output = [];
    len = sequence.length;
    i = context.i;
    i += 1;
    while (i < len) {
      context.i = i;
      switch (sequence.charAt(i)) {
        case '[':
          output.push(this.parseSequence(sequence, context));
          i = context.i;
          break;
        case '{':
          output.push(this.parseMapping(sequence, context));
          i = context.i;
          break;
        case ']':
          return output;
        case ',':
        case ' ':
        case "\n":
          break;
        default:
          isQuoted = ((_ref = sequence.charAt(i)) === '"' || _ref === "'");
          value = this.parseScalar(sequence, [',', ']'], ['"', "'"], context);
          i = context.i;
          if (!isQuoted && typeof value === 'string' && (value.indexOf(': ') !== -1 || value.indexOf(":\n") !== -1)) {
            try {
              value = this.parseMapping('{' + value + '}');
            } catch (_error) {
              e = _error;
            }
          }
          output.push(value);
          --i;
      }
      ++i;
    }
    throw new ParseException('Malformed inline YAML string ' + sequence);
  };

  Inline.parseMapping = function(mapping, context) {
    var $value, done, i, key, len, output, shouldContinueWhileLoop, value;
    output = {};
    len = mapping.length;
    i = context.i;
    i += 1;
    shouldContinueWhileLoop = false;
    while (i < len) {
      context.i = i;
      switch (mapping.charAt(i)) {
        case ' ':
        case ',':
        case "\n":
          ++i;
          context.i = i;
          shouldContinueWhileLoop = true;
          break;
        case '}':
          return output;
      }
      if (shouldContinueWhileLoop) {
        shouldContinueWhileLoop = false;
        continue;
      }
      key = this.parseScalar(mapping, [':', ' ', "\n"], ['"', "'"], context, false);
      i = context.i;
      done = false;
      while (i < len) {
        context.i = i;
        switch (mapping.charAt(i)) {
          case '[':
            value = this.parseSequence(mapping, context);
            i = context.i;
            if (output[key] === void 0) {
              output[key] = value;
            }
            done = true;
            break;
          case '{':
            $value = this.parseMapping(mapping, context);
            i = context.i;
            if (output[key] === void 0) {
              output[key] = value;
            }
            done = true;
            break;
          case ':':
          case ' ':
          case "\n":
            break;
          default:
            value = this.parseScalar(mapping, [',', '}'], ['"', "'"], context);
            i = context.i;
            if (output[key] === void 0) {
              output[key] = value;
            }
            done = true;
            --i;
        }
        ++i;
        if (done) {
          break;
        }
      }
    }
    throw new ParseException('Malformed inline YAML string ' + mapping);
  };

  Inline.evaluateScalar = function(scalar, context) {
    var cast, exceptionOnInvalidType, firstChar, firstSpace, firstWord, objectDecoder, raw, scalarLower, subValue, trimmedScalar;
    scalar = Utils.trim(scalar);
    scalarLower = scalar.toLowerCase();
    switch (scalarLower) {
      case 'null':
      case '':
      case '~':
        return null;
      case 'true':
        return true;
      case 'false':
        return false;
      case '.inf':
        return Infinity;
      case '.nan':
        return NaN;
      case '-.inf':
        return Infinity;
      default:
        firstChar = scalarLower.charAt(0);
        switch (firstChar) {
          case '!':
            firstSpace = scalar.indexOf(' ');
            if (firstSpace === -1) {
              firstWord = scalarLower;
            } else {
              firstWord = scalarLower.slice(0, firstSpace);
            }
            switch (firstWord) {
              case '!':
                if (firstSpace !== -1) {
                  return parseInt(this.parseScalar(scalar.slice(2)));
                }
                return null;
              case '!str':
                return Utils.ltrim(scalar.slice(4));
              case '!!str':
                return Utils.ltrim(scalar.slice(5));
              case '!!int':
                return parseInt(this.parseScalar(scalar.slice(5)));
              case '!!bool':
                return Utils.parseBoolean(this.parseScalar(scalar.slice(6)), false);
              case '!!float':
                return parseFloat(this.parseScalar(scalar.slice(7)));
              case '!!timestamp':
                return Utils.stringToDate(Utils.ltrim(scalar.slice(11)));
              default:
                if (context == null) {
                  context = {
                    exceptionOnInvalidType: this.settings.exceptionOnInvalidType,
                    objectDecoder: this.settings.objectDecoder,
                    i: 0
                  };
                }
                objectDecoder = context.objectDecoder, exceptionOnInvalidType = context.exceptionOnInvalidType;
                if (objectDecoder) {
                  trimmedScalar = Utils.rtrim(scalar);
                  firstSpace = trimmedScalar.indexOf(' ');
                  if (firstSpace === -1) {
                    return objectDecoder(trimmedScalar, null);
                  } else {
                    subValue = Utils.ltrim(trimmedScalar.slice(firstSpace + 1));
                    if (!(subValue.length > 0)) {
                      subValue = null;
                    }
                    return objectDecoder(trimmedScalar.slice(0, firstSpace), subValue);
                  }
                }
                if (exceptionOnInvalidType) {
                  throw new ParseException('Custom object support when parsing a YAML file has been disabled.');
                }
                return null;
            }
            break;
          case '0':
            if ('0x' === scalar.slice(0, 2)) {
              return Utils.hexDec(scalar);
            } else if (Utils.isDigits(scalar)) {
              return Utils.octDec(scalar);
            } else if (Utils.isNumeric(scalar)) {
              return parseFloat(scalar);
            } else {
              return scalar;
            }
            break;
          case '+':
            if (Utils.isDigits(scalar)) {
              raw = scalar;
              cast = parseInt(raw);
              if (raw === '' + cast) {
                return cast;
              } else {
                return raw;
              }
            } else if (Utils.isNumeric(scalar)) {
              return parseFloat(scalar);
            }
            return scalar;
          case '-':
            if (Utils.isDigits(scalar.slice(1))) {
              if ('0' === scalar.charAt(1)) {
                return -Utils.octDec(scalar.slice(1));
              } else {
                raw = scalar.slice(1);
                cast = parseInt(raw);
                if (raw === '' + cast) {
                  return -cast;
                } else {
                  return -raw;
                }
              }
            } else if (Utils.isNumeric(scalar)) {
              return parseFloat(scalar);
            }
            return scalar;
          default:
            if (Utils.isNumeric(scalar)) {
              return parseFloat(scalar);
            }
            return scalar;
        }
    }
  };

  return Inline;

})();

module.exports = Inline;



},{"./Escaper":2,"./Exception/DumpException":3,"./Exception/ParseException":4,"./Pattern":7,"./Unescaper":8,"./Utils":9}],6:[function(require,module,exports){
var Inline, ParseException, Parser, Pattern, Utils;

Inline = require('./Inline');

Pattern = require('./Pattern');

Utils = require('./Utils');

ParseException = require('./Exception/ParseException');

Parser = (function() {
  Parser.prototype.PATTERN_FOLDED_SCALAR_ALL = new Pattern('^(?:(?<type>![^\\|>]*)\\s+)?(?<separator>\\||>)(?<modifiers>\\+|\\-|\\d+|\\+\\d+|\\-\\d+|\\d+\\+|\\d+\\-)?(?<comments> +#.*)?$');

  Parser.prototype.PATTERN_FOLDED_SCALAR_END = new Pattern('(?<separator>\\||>)(?<modifiers>\\+|\\-|\\d+|\\+\\d+|\\-\\d+|\\d+\\+|\\d+\\-)?(?<comments> +#.*)?$');

  Parser.prototype.PATTERN_SEQUENCE_ITEM = new Pattern('^\\-((?<leadspaces>\\s+)(?<value>.+?))?\\s*$');

  Parser.prototype.PATTERN_ANCHOR_VALUE = new Pattern('^&(?<ref>[^ ]+) *(?<value>.*)');

  Parser.prototype.PATTERN_COMPACT_NOTATION = new Pattern('^(?<key>' + Inline.REGEX_QUOTED_STRING + '|[^ \'"\\{\\[].*?) *\\:(\\s+(?<value>.+?))?\\s*$');

  Parser.prototype.PATTERN_MAPPING_ITEM = new Pattern('^(?<key>' + Inline.REGEX_QUOTED_STRING + '|[^ \'"\\[\\{].*?) *\\:(\\s+(?<value>.+?))?\\s*$');

  Parser.prototype.PATTERN_DECIMAL = new Pattern('\\d+');

  Parser.prototype.PATTERN_INDENT_SPACES = new Pattern('^ +');

  Parser.prototype.PATTERN_TRAILING_LINES = new Pattern('(\n*)$');

  Parser.prototype.PATTERN_YAML_HEADER = new Pattern('^\\%YAML[: ][\\d\\.]+.*\n');

  Parser.prototype.PATTERN_LEADING_COMMENTS = new Pattern('^(\\#.*?\n)+');

  Parser.prototype.PATTERN_DOCUMENT_MARKER_START = new Pattern('^\\-\\-\\-.*?\n');

  Parser.prototype.PATTERN_DOCUMENT_MARKER_END = new Pattern('^\\.\\.\\.\\s*$');

  Parser.prototype.PATTERN_FOLDED_SCALAR_BY_INDENTATION = {};

  Parser.prototype.CONTEXT_NONE = 0;

  Parser.prototype.CONTEXT_SEQUENCE = 1;

  Parser.prototype.CONTEXT_MAPPING = 2;

  function Parser(offset) {
    this.offset = offset != null ? offset : 0;
    this.lines = [];
    this.currentLineNb = -1;
    this.currentLine = '';
    this.refs = {};
  }

  Parser.prototype.parse = function(value, exceptionOnInvalidType, objectDecoder) {
    var alias, allowOverwrite, block, c, context, data, e, first, i, indent, isRef, key, lastKey, lineCount, matches, mergeNode, parsed, parsedItem, parser, refName, refValue, val, values, _i, _j, _k, _l, _len, _len1, _len2, _len3, _name, _name1, _ref, _ref1, _ref2;
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectDecoder == null) {
      objectDecoder = null;
    }
    this.currentLineNb = -1;
    this.currentLine = '';
    this.lines = this.cleanup(value).split("\n");
    data = null;
    context = this.CONTEXT_NONE;
    allowOverwrite = false;
    while (this.moveToNextLine()) {
      if (this.isCurrentLineEmpty()) {
        continue;
      }
      if ("\t" === this.currentLine[0]) {
        throw new ParseException('A YAML file cannot contain tabs as indentation.', this.getRealCurrentLineNb() + 1, this.currentLine);
      }
      isRef = mergeNode = false;
      if (values = this.PATTERN_SEQUENCE_ITEM.exec(this.currentLine)) {
        if (this.CONTEXT_MAPPING === context) {
          throw new ParseException('You cannot define a sequence item when in a mapping');
        }
        context = this.CONTEXT_SEQUENCE;
        if (data == null) {
          data = [];
        }
        if ((values.value != null) && (matches = this.PATTERN_ANCHOR_VALUE.exec(values.value))) {
          isRef = matches.ref;
          values.value = matches.value;
        }
        if (!(values.value != null) || '' === Utils.trim(values.value, ' ') || Utils.ltrim(values.value, ' ').indexOf('#') === 0) {
          if (this.currentLineNb < this.lines.length - 1 && !this.isNextLineUnIndentedCollection()) {
            c = this.getRealCurrentLineNb() + 1;
            parser = new Parser(c);
            parser.refs = this.refs;
            data.push(parser.parse(this.getNextEmbedBlock(null, true), exceptionOnInvalidType, objectDecoder));
          } else {
            data.push(null);
          }
        } else {
          if (((_ref = values.leadspaces) != null ? _ref.length : void 0) && (matches = this.PATTERN_COMPACT_NOTATION.exec(values.value))) {
            c = this.getRealCurrentLineNb();
            parser = new Parser(c);
            parser.refs = this.refs;
            block = values.value;
            indent = this.getCurrentLineIndentation();
            if (this.isNextLineIndented(false)) {
              block += "\n" + this.getNextEmbedBlock(indent + values.leadspaces.length + 1, true);
            }
            data.push(parser.parse(block, exceptionOnInvalidType, objectDecoder));
          } else {
            data.push(this.parseValue(values.value, exceptionOnInvalidType, objectDecoder));
          }
        }
      } else if ((values = this.PATTERN_MAPPING_ITEM.exec(this.currentLine)) && values.key.indexOf(' #') === -1) {
        if (this.CONTEXT_SEQUENCE === context) {
          throw new ParseException('You cannot define a mapping item when in a sequence');
        }
        context = this.CONTEXT_MAPPING;
        if (data == null) {
          data = {};
        }
        Inline.configure(exceptionOnInvalidType, objectDecoder);
        try {
          key = Inline.parseScalar(values.key);
        } catch (_error) {
          e = _error;
          e.parsedLine = this.getRealCurrentLineNb() + 1;
          e.snippet = this.currentLine;
          throw e;
        }
        if ('<<' === key) {
          mergeNode = true;
          allowOverwrite = true;
          if (((_ref1 = values.value) != null ? _ref1.indexOf('*') : void 0) === 0) {
            refName = values.value.slice(1);
            if (this.refs[refName] == null) {
              throw new ParseException('Reference "' + refName + '" does not exist.', this.getRealCurrentLineNb() + 1, this.currentLine);
            }
            refValue = this.refs[refName];
            if (typeof refValue !== 'object') {
              throw new ParseException('YAML merge keys used with a scalar value instead of an object.', this.getRealCurrentLineNb() + 1, this.currentLine);
            }
            if (refValue instanceof Array) {
              for (i = _i = 0, _len = refValue.length; _i < _len; i = ++_i) {
                value = refValue[i];
                if (data[_name = '' + i] == null) {
                  data[_name] = value;
                }
              }
            } else {
              for (key in refValue) {
                value = refValue[key];
                if (data[key] == null) {
                  data[key] = value;
                }
              }
            }
          } else {
            if (values.value !== '') {
              value = values.value;
            } else {
              value = this.getNextEmbedBlock();
            }
            c = this.getRealCurrentLineNb() + 1;
            parser = new Parser(c);
            parser.refs = this.refs;
            parsed = parser.parse(value, exceptionOnInvalidType);
            if (typeof parsed !== 'object') {
              throw new ParseException('YAML merge keys used with a scalar value instead of an object.', this.getRealCurrentLineNb() + 1, this.currentLine);
            }
            if (parsed instanceof Array) {
              for (_j = 0, _len1 = parsed.length; _j < _len1; _j++) {
                parsedItem = parsed[_j];
                if (typeof parsedItem !== 'object') {
                  throw new ParseException('Merge items must be objects.', this.getRealCurrentLineNb() + 1, parsedItem);
                }
                if (parsedItem instanceof Array) {
                  for (i = _k = 0, _len2 = parsedItem.length; _k < _len2; i = ++_k) {
                    value = parsedItem[i];
                    if (data[_name1 = '' + i] == null) {
                      data[_name1] = value;
                    }
                  }
                } else {
                  for (key in parsedItem) {
                    value = parsedItem[key];
                    if (data[key] == null) {
                      data[key] = value;
                    }
                  }
                }
              }
            } else {
              for (key in parsed) {
                value = parsed[key];
                if (data[key] == null) {
                  data[key] = value;
                }
              }
            }
          }
        } else if ((values.value != null) && (matches = this.PATTERN_ANCHOR_VALUE.exec(values.value))) {
          isRef = matches.ref;
          values.value = matches.value;
        }
        if (mergeNode) {

        } else if (!(values.value != null) || '' === Utils.trim(values.value, ' ') || Utils.ltrim(values.value, ' ').indexOf('#') === 0) {
          if (!(this.isNextLineIndented()) && !(this.isNextLineUnIndentedCollection())) {
            if (allowOverwrite || data[key] === void 0) {
              data[key] = null;
            }
          } else {
            c = this.getRealCurrentLineNb() + 1;
            parser = new Parser(c);
            parser.refs = this.refs;
            val = parser.parse(this.getNextEmbedBlock(), exceptionOnInvalidType, objectDecoder);
            if (allowOverwrite || data[key] === void 0) {
              data[key] = val;
            }
          }
        } else {
          val = this.parseValue(values.value, exceptionOnInvalidType, objectDecoder);
          if (allowOverwrite || data[key] === void 0) {
            data[key] = val;
          }
        }
      } else {
        lineCount = this.lines.length;
        if (1 === lineCount || (2 === lineCount && Utils.isEmpty(this.lines[1]))) {
          try {
            value = Inline.parse(this.lines[0], exceptionOnInvalidType, objectDecoder);
          } catch (_error) {
            e = _error;
            e.parsedLine = this.getRealCurrentLineNb() + 1;
            e.snippet = this.currentLine;
            throw e;
          }
          if (typeof value === 'object') {
            if (value instanceof Array) {
              first = value[0];
            } else {
              for (key in value) {
                first = value[key];
                break;
              }
            }
            if (typeof first === 'string' && first.indexOf('*') === 0) {
              data = [];
              for (_l = 0, _len3 = value.length; _l < _len3; _l++) {
                alias = value[_l];
                data.push(this.refs[alias.slice(1)]);
              }
              value = data;
            }
          }
          return value;
        } else if ((_ref2 = Utils.ltrim(value).charAt(0)) === '[' || _ref2 === '{') {
          try {
            return Inline.parse(value, exceptionOnInvalidType, objectDecoder);
          } catch (_error) {
            e = _error;
            e.parsedLine = this.getRealCurrentLineNb() + 1;
            e.snippet = this.currentLine;
            throw e;
          }
        }
        throw new ParseException('Unable to parse.', this.getRealCurrentLineNb() + 1, this.currentLine);
      }
      if (isRef) {
        if (data instanceof Array) {
          this.refs[isRef] = data[data.length - 1];
        } else {
          lastKey = null;
          for (key in data) {
            lastKey = key;
          }
          this.refs[isRef] = data[lastKey];
        }
      }
    }
    if (Utils.isEmpty(data)) {
      return null;
    } else {
      return data;
    }
  };

  Parser.prototype.getRealCurrentLineNb = function() {
    return this.currentLineNb + this.offset;
  };

  Parser.prototype.getCurrentLineIndentation = function() {
    return this.currentLine.length - Utils.ltrim(this.currentLine, ' ').length;
  };

  Parser.prototype.getNextEmbedBlock = function(indentation, includeUnindentedCollection) {
    var data, indent, isItUnindentedCollection, newIndent, removeComments, removeCommentsPattern, unindentedEmbedBlock;
    if (indentation == null) {
      indentation = null;
    }
    if (includeUnindentedCollection == null) {
      includeUnindentedCollection = false;
    }
    this.moveToNextLine();
    if (indentation == null) {
      newIndent = this.getCurrentLineIndentation();
      unindentedEmbedBlock = this.isStringUnIndentedCollectionItem(this.currentLine);
      if (!(this.isCurrentLineEmpty()) && 0 === newIndent && !unindentedEmbedBlock) {
        throw new ParseException('Indentation problem.', this.getRealCurrentLineNb() + 1, this.currentLine);
      }
    } else {
      newIndent = indentation;
    }
    data = [this.currentLine.slice(newIndent)];
    if (!includeUnindentedCollection) {
      isItUnindentedCollection = this.isStringUnIndentedCollectionItem(this.currentLine);
    }
    removeCommentsPattern = this.PATTERN_FOLDED_SCALAR_END;
    removeComments = !removeCommentsPattern.test(this.currentLine);
    while (this.moveToNextLine()) {
      indent = this.getCurrentLineIndentation();
      if (indent === newIndent) {
        removeComments = !removeCommentsPattern.test(this.currentLine);
      }
      if (isItUnindentedCollection && !this.isStringUnIndentedCollectionItem(this.currentLine) && indent === newIndent) {
        this.moveToPreviousLine();
        break;
      }
      if (this.isCurrentLineBlank()) {
        data.push(this.currentLine.slice(newIndent));
        continue;
      }
      if (removeComments && this.isCurrentLineComment()) {
        if (indent === newIndent) {
          continue;
        }
      }
      if (indent >= newIndent) {
        data.push(this.currentLine.slice(newIndent));
      } else if (0 === indent) {
        this.moveToPreviousLine();
        break;
      } else {
        throw new ParseException('Indentation problem.', this.getRealCurrentLineNb() + 1, this.currentLine);
      }
    }
    return data.join("\n");
  };

  Parser.prototype.moveToNextLine = function() {
    if (this.currentLineNb >= this.lines.length - 1) {
      return false;
    }
    this.currentLine = this.lines[++this.currentLineNb];
    return true;
  };

  Parser.prototype.moveToPreviousLine = function() {
    this.currentLine = this.lines[--this.currentLineNb];
  };

  Parser.prototype.parseValue = function(value, exceptionOnInvalidType, objectDecoder) {
    var e, foldedIndent, matches, modifiers, pos, val, _ref, _ref1;
    if (0 === value.indexOf('*')) {
      pos = value.indexOf('#');
      if (pos !== -1) {
        value = value.substr(1, pos - 2);
      } else {
        value = value.slice(1);
      }
      if (this.refs[value] === void 0) {
        throw new ParseException('Reference "' + value + '" does not exist.', this.currentLine);
      }
      return this.refs[value];
    }
    if (matches = this.PATTERN_FOLDED_SCALAR_ALL.exec(value)) {
      modifiers = (_ref = matches.modifiers) != null ? _ref : '';
      foldedIndent = Math.abs(parseInt(modifiers));
      if (isNaN(foldedIndent)) {
        foldedIndent = 0;
      }
      val = this.parseFoldedScalar(matches.separator, this.PATTERN_DECIMAL.replace(modifiers, ''), foldedIndent);
      if (matches.type != null) {
        Inline.configure(exceptionOnInvalidType, objectDecoder);
        return Inline.parseScalar(matches.type + ' ' + val);
      } else {
        return val;
      }
    }
    try {
      return Inline.parse(value, exceptionOnInvalidType, objectDecoder);
    } catch (_error) {
      e = _error;
      if (((_ref1 = value.charAt(0)) === '[' || _ref1 === '{') && e instanceof ParseException && this.isNextLineIndented()) {
        value += "\n" + this.getNextEmbedBlock();
        try {
          return Inline.parse(value, exceptionOnInvalidType, objectDecoder);
        } catch (_error) {
          e = _error;
          e.parsedLine = this.getRealCurrentLineNb() + 1;
          e.snippet = this.currentLine;
          throw e;
        }
      } else {
        e.parsedLine = this.getRealCurrentLineNb() + 1;
        e.snippet = this.currentLine;
        throw e;
      }
    }
  };

  Parser.prototype.parseFoldedScalar = function(separator, indicator, indentation) {
    var isCurrentLineBlank, line, matches, newText, notEOF, pattern, text, _i, _len, _ref;
    if (indicator == null) {
      indicator = '';
    }
    if (indentation == null) {
      indentation = 0;
    }
    notEOF = this.moveToNextLine();
    if (!notEOF) {
      return '';
    }
    isCurrentLineBlank = this.isCurrentLineBlank();
    text = '';
    while (notEOF && isCurrentLineBlank) {
      if (notEOF = this.moveToNextLine()) {
        text += "\n";
        isCurrentLineBlank = this.isCurrentLineBlank();
      }
    }
    if (0 === indentation) {
      if (matches = this.PATTERN_INDENT_SPACES.exec(this.currentLine)) {
        indentation = matches[0].length;
      }
    }
    if (indentation > 0) {
      pattern = this.PATTERN_FOLDED_SCALAR_BY_INDENTATION[indentation];
      if (pattern == null) {
        pattern = new Pattern('^ {' + indentation + '}(.*)$');
        Parser.prototype.PATTERN_FOLDED_SCALAR_BY_INDENTATION[indentation] = pattern;
      }
      while (notEOF && (isCurrentLineBlank || (matches = pattern.exec(this.currentLine)))) {
        if (isCurrentLineBlank) {
          text += this.currentLine.slice(indentation);
        } else {
          text += matches[1];
        }
        if (notEOF = this.moveToNextLine()) {
          text += "\n";
          isCurrentLineBlank = this.isCurrentLineBlank();
        }
      }
    } else if (notEOF) {
      text += "\n";
    }
    if (notEOF) {
      this.moveToPreviousLine();
    }
    if ('>' === separator) {
      newText = '';
      _ref = text.split("\n");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        if (line.length === 0 || line.charAt(0) === ' ') {
          newText += line + "\n";
        } else {
          newText += line + ' ';
        }
      }
      text = newText;
    }
    text = Utils.rtrim(text);
    if ('' === indicator) {
      text = this.PATTERN_TRAILING_LINES.replace(text, "\n");
    } else if ('-' === indicator) {
      text = this.PATTERN_TRAILING_LINES.replace(text, '');
    }
    return text;
  };

  Parser.prototype.isNextLineIndented = function(ignoreComments) {
    var EOF, currentIndentation, ret;
    if (ignoreComments == null) {
      ignoreComments = true;
    }
    currentIndentation = this.getCurrentLineIndentation();
    EOF = !this.moveToNextLine();
    if (ignoreComments) {
      while (!EOF && this.isCurrentLineEmpty()) {
        EOF = !this.moveToNextLine();
      }
    } else {
      while (!EOF && this.isCurrentLineBlank()) {
        EOF = !this.moveToNextLine();
      }
    }
    if (EOF) {
      return false;
    }
    ret = false;
    if (this.getCurrentLineIndentation() > currentIndentation) {
      ret = true;
    }
    this.moveToPreviousLine();
    return ret;
  };

  Parser.prototype.isCurrentLineEmpty = function() {
    var trimmedLine;
    trimmedLine = Utils.trim(this.currentLine, ' ');
    return trimmedLine.length === 0 || trimmedLine.charAt(0) === '#';
  };

  Parser.prototype.isCurrentLineBlank = function() {
    return '' === Utils.trim(this.currentLine, ' ');
  };

  Parser.prototype.isCurrentLineComment = function() {
    var ltrimmedLine;
    ltrimmedLine = Utils.ltrim(this.currentLine, ' ');
    return ltrimmedLine.charAt(0) === '#';
  };

  Parser.prototype.cleanup = function(value) {
    var count, trimmedValue, _ref, _ref1, _ref2;
    value = value.replace("\r\n", "\n").replace("\r", "\n");
    count = 0;
    _ref = this.PATTERN_YAML_HEADER.replaceAll(value, ''), value = _ref[0], count = _ref[1];
    this.offset += count;
    _ref1 = this.PATTERN_LEADING_COMMENTS.replaceAll(value, '', 1), trimmedValue = _ref1[0], count = _ref1[1];
    if (count === 1) {
      this.offset += Utils.subStrCount(value, "\n") - Utils.subStrCount(trimmedValue, "\n");
      value = trimmedValue;
    }
    _ref2 = this.PATTERN_DOCUMENT_MARKER_START.replaceAll(value, '', 1), trimmedValue = _ref2[0], count = _ref2[1];
    if (count === 1) {
      this.offset += Utils.subStrCount(value, "\n") - Utils.subStrCount(trimmedValue, "\n");
      value = trimmedValue;
      value = this.PATTERN_DOCUMENT_MARKER_END.replace(value, '');
    }
    return value;
  };

  Parser.prototype.isNextLineUnIndentedCollection = function(currentIndentation) {
    var notEOF, ret;
    if (currentIndentation == null) {
      currentIndentation = null;
    }
    if (currentIndentation == null) {
      currentIndentation = this.getCurrentLineIndentation();
    }
    notEOF = this.moveToNextLine();
    while (notEOF && this.isCurrentLineEmpty()) {
      notEOF = this.moveToNextLine();
    }
    if (false === notEOF) {
      return false;
    }
    ret = false;
    if (this.getCurrentLineIndentation() === currentIndentation && this.isStringUnIndentedCollectionItem(this.currentLine)) {
      ret = true;
    }
    this.moveToPreviousLine();
    return ret;
  };

  Parser.prototype.isStringUnIndentedCollectionItem = function() {
    return this.currentLine === '-' || this.currentLine.slice(0, 2) === '- ';
  };

  return Parser;

})();

module.exports = Parser;



},{"./Exception/ParseException":4,"./Inline":5,"./Pattern":7,"./Utils":9}],7:[function(require,module,exports){
var Pattern;

Pattern = (function() {
  Pattern.prototype.regex = null;

  Pattern.prototype.rawRegex = null;

  Pattern.prototype.cleanedRegex = null;

  Pattern.prototype.mapping = null;

  function Pattern(rawRegex, modifiers) {
    var capturingBracketNumber, char, cleanedRegex, i, len, mapping, name, part, subChar;
    if (modifiers == null) {
      modifiers = '';
    }
    cleanedRegex = '';
    len = rawRegex.length;
    mapping = null;
    capturingBracketNumber = 0;
    i = 0;
    while (i < len) {
      char = rawRegex.charAt(i);
      if (char === '\\') {
        cleanedRegex += rawRegex.slice(i, +(i + 1) + 1 || 9e9);
        i++;
      } else if (char === '(') {
        if (i < len - 2) {
          part = rawRegex.slice(i, +(i + 2) + 1 || 9e9);
          if (part === '(?:') {
            i += 2;
            cleanedRegex += part;
          } else if (part === '(?<') {
            capturingBracketNumber++;
            i += 2;
            name = '';
            while (i + 1 < len) {
              subChar = rawRegex.charAt(i + 1);
              if (subChar === '>') {
                cleanedRegex += '(';
                i++;
                if (name.length > 0) {
                  if (mapping == null) {
                    mapping = {};
                  }
                  mapping[name] = capturingBracketNumber;
                }
                break;
              } else {
                name += subChar;
              }
              i++;
            }
          } else {
            cleanedRegex += char;
            capturingBracketNumber++;
          }
        } else {
          cleanedRegex += char;
        }
      } else {
        cleanedRegex += char;
      }
      i++;
    }
    this.rawRegex = rawRegex;
    this.cleanedRegex = cleanedRegex;
    this.regex = new RegExp(this.cleanedRegex, 'g' + modifiers.replace('g', ''));
    this.mapping = mapping;
  }

  Pattern.prototype.exec = function(str) {
    var index, matches, name, _ref;
    this.regex.lastIndex = 0;
    matches = this.regex.exec(str);
    if (matches == null) {
      return null;
    }
    if (this.mapping != null) {
      _ref = this.mapping;
      for (name in _ref) {
        index = _ref[name];
        matches[name] = matches[index];
      }
    }
    return matches;
  };

  Pattern.prototype.test = function(str) {
    this.regex.lastIndex = 0;
    return this.regex.test(str);
  };

  Pattern.prototype.replace = function(str, replacement) {
    this.regex.lastIndex = 0;
    return str.replace(this.regex, replacement);
  };

  Pattern.prototype.replaceAll = function(str, replacement, limit) {
    var count;
    if (limit == null) {
      limit = 0;
    }
    this.regex.lastIndex = 0;
    count = 0;
    while (this.regex.test(str) && (limit === 0 || count < limit)) {
      this.regex.lastIndex = 0;
      str = str.replace(this.regex, '');
      count++;
    }
    return [str, count];
  };

  return Pattern;

})();

module.exports = Pattern;



},{}],8:[function(require,module,exports){
var Pattern, Unescaper, Utils;

Utils = require('./Utils');

Pattern = require('./Pattern');

Unescaper = (function() {
  function Unescaper() {}

  Unescaper.PATTERN_ESCAPED_CHARACTER = new Pattern('\\\\([0abt\tnvfre "\\/\\\\N_LP]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|U[0-9a-fA-F]{8})');

  Unescaper.unescapeSingleQuotedString = function(value) {
    return value.replace('\'\'', '\'');
  };

  Unescaper.unescapeDoubleQuotedString = function(value) {
    if (this._unescapeCallback == null) {
      this._unescapeCallback = (function(_this) {
        return function(str) {
          return _this.unescapeCharacter(str);
        };
      })(this);
    }
    return this.PATTERN_ESCAPED_CHARACTER.replace(value, this._unescapeCallback);
  };

  Unescaper.unescapeCharacter = function(value) {
    var ch;
    ch = String.fromCharCode;
    switch (value.charAt(1)) {
      case '0':
        return ch(0);
      case 'a':
        return ch(7);
      case 'b':
        return ch(8);
      case 't':
        return "\t";
      case "\t":
        return "\t";
      case 'n':
        return "\n";
      case 'v':
        return ch(11);
      case 'f':
        return ch(12);
      case 'r':
        return ch(13);
      case 'e':
        return ch(27);
      case ' ':
        return ' ';
      case '"':
        return '"';
      case '/':
        return '/';
      case '\\':
        return '\\';
      case 'N':
        return ch(0x0085);
      case '_':
        return ch(0x00A0);
      case 'L':
        return ch(0x2028);
      case 'P':
        return ch(0x2029);
      case 'x':
        return Utils.utf8chr(Utils.hexDec(value.substr(2, 2)));
      case 'u':
        return Utils.utf8chr(Utils.hexDec(value.substr(2, 4)));
      case 'U':
        return Utils.utf8chr(Utils.hexDec(value.substr(2, 8)));
      default:
        return '';
    }
  };

  return Unescaper;

})();

module.exports = Unescaper;



},{"./Pattern":7,"./Utils":9}],9:[function(require,module,exports){
var Pattern, Utils;

Pattern = require('./Pattern');

Utils = (function() {
  function Utils() {}

  Utils.REGEX_LEFT_TRIM_BY_CHAR = {};

  Utils.REGEX_RIGHT_TRIM_BY_CHAR = {};

  Utils.REGEX_SPACES = /\s+/g;

  Utils.REGEX_DIGITS = /^\d+$/;

  Utils.REGEX_OCTAL = /[^0-7]/gi;

  Utils.REGEX_HEXADECIMAL = /[^a-f0-9]/gi;

  Utils.PATTERN_DATE = new Pattern('^' + '(?<year>[0-9][0-9][0-9][0-9])' + '-(?<month>[0-9][0-9]?)' + '-(?<day>[0-9][0-9]?)' + '(?:(?:[Tt]|[ \t]+)' + '(?<hour>[0-9][0-9]?)' + ':(?<minute>[0-9][0-9])' + ':(?<second>[0-9][0-9])' + '(?:\.(?<fraction>[0-9]*))?' + '(?:[ \t]*(?<tz>Z|(?<tz_sign>[-+])(?<tz_hour>[0-9][0-9]?)' + '(?::(?<tz_minute>[0-9][0-9]))?))?)?' + '$', 'i');

  Utils.LOCAL_TIMEZONE_OFFSET = new Date().getTimezoneOffset() * 60 * 1000;

  Utils.trim = function(str, char) {
    var regexLeft, regexRight;
    if (char == null) {
      char = '\\s';
    }
    return str.trim();
    regexLeft = this.REGEX_LEFT_TRIM_BY_CHAR[char];
    if (regexLeft == null) {
      this.REGEX_LEFT_TRIM_BY_CHAR[char] = regexLeft = new RegExp('^' + char + '' + char + '*');
    }
    regexLeft.lastIndex = 0;
    regexRight = this.REGEX_RIGHT_TRIM_BY_CHAR[char];
    if (regexRight == null) {
      this.REGEX_RIGHT_TRIM_BY_CHAR[char] = regexRight = new RegExp(char + '' + char + '*$');
    }
    regexRight.lastIndex = 0;
    return str.replace(regexLeft, '').replace(regexRight, '');
  };

  Utils.ltrim = function(str, char) {
    var regexLeft;
    if (char == null) {
      char = '\\s';
    }
    regexLeft = this.REGEX_LEFT_TRIM_BY_CHAR[char];
    if (regexLeft == null) {
      this.REGEX_LEFT_TRIM_BY_CHAR[char] = regexLeft = new RegExp('^' + char + '' + char + '*');
    }
    regexLeft.lastIndex = 0;
    return str.replace(regexLeft, '');
  };

  Utils.rtrim = function(str, char) {
    var regexRight;
    if (char == null) {
      char = '\\s';
    }
    regexRight = this.REGEX_RIGHT_TRIM_BY_CHAR[char];
    if (regexRight == null) {
      this.REGEX_RIGHT_TRIM_BY_CHAR[char] = regexRight = new RegExp(char + '' + char + '*$');
    }
    regexRight.lastIndex = 0;
    return str.replace(regexRight, '');
  };

  Utils.isEmpty = function(value) {
    return !value || value === '' || value === '0';
  };

  Utils.subStrCount = function(string, subString, start, length) {
    var c, i, len, sublen, _i;
    c = 0;
    string = '' + string;
    subString = '' + subString;
    if (start != null) {
      string = string.slice(start);
    }
    if (length != null) {
      string = string.slice(0, length);
    }
    len = string.length;
    sublen = subString.length;
    for (i = _i = 0; 0 <= len ? _i < len : _i > len; i = 0 <= len ? ++_i : --_i) {
      if (subString === string.slice(i, sublen)) {
        c++;
        i += sublen - 1;
      }
    }
    return c;
  };

  Utils.isDigits = function(input) {
    this.REGEX_DIGITS.lastIndex = 0;
    return this.REGEX_DIGITS.test(input);
  };

  Utils.octDec = function(input) {
    this.REGEX_OCTAL.lastIndex = 0;
    return parseInt((input + '').replace(this.REGEX_OCTAL, ''), 8);
  };

  Utils.hexDec = function(input) {
    this.REGEX_HEXADECIMAL.lastIndex = 0;
    input = this.trim(input);
    if ((input + '').slice(0, 2) === '0x') {
      input = (input + '').slice(2);
    }
    return parseInt((input + '').replace(this.REGEX_HEXADECIMAL, ''), 16);
  };

  Utils.utf8chr = function(c) {
    var ch;
    ch = String.fromCharCode;
    if (0x80 > (c %= 0x200000)) {
      return ch(c);
    }
    if (0x800 > c) {
      return ch(0xC0 | c >> 6) + ch(0x80 | c & 0x3F);
    }
    if (0x10000 > c) {
      return ch(0xE0 | c >> 12) + ch(0x80 | c >> 6 & 0x3F) + ch(0x80 | c & 0x3F);
    }
    return ch(0xF0 | c >> 18) + ch(0x80 | c >> 12 & 0x3F) + ch(0x80 | c >> 6 & 0x3F) + ch(0x80 | c & 0x3F);
  };

  Utils.parseBoolean = function(input, strict) {
    var lowerInput;
    if (strict == null) {
      strict = true;
    }
    if (typeof input === 'string') {
      lowerInput = input.toLowerCase();
      if (!strict) {
        if (lowerInput === 'no') {
          return false;
        }
      }
      if (lowerInput === '0') {
        return false;
      }
      if (lowerInput === 'false') {
        return false;
      }
      if (lowerInput === '') {
        return false;
      }
      return true;
    }
    return !!input;
  };

  Utils.isNumeric = function(input) {
    this.REGEX_SPACES.lastIndex = 0;
    return typeof input === 'number' || typeof input === 'string' && !isNaN(input) && input.replace(this.REGEX_SPACES, '') !== '';
  };

  Utils.stringToDate = function(str) {
    var date, day, fraction, hour, info, minute, month, second, tz_hour, tz_minute, tz_offset, year;
    if (!(str != null ? str.length : void 0)) {
      return null;
    }
    info = this.PATTERN_DATE.exec(str);
    if (!info) {
      return null;
    }
    year = parseInt(info.year, 10);
    month = parseInt(info.month, 10) - 1;
    day = parseInt(info.day, 10);
    if (info.hour == null) {
      date = new Date(Date.UTC(year, month, day));
      return date;
    }
    hour = parseInt(info.hour, 10);
    minute = parseInt(info.minute, 10);
    second = parseInt(info.second, 10);
    if (info.fraction != null) {
      fraction = info.fraction.slice(0, 3);
      while (fraction.length < 3) {
        fraction += '0';
      }
      fraction = parseInt(fraction, 10);
    } else {
      fraction = 0;
    }
    if (info.tz != null) {
      tz_hour = parseInt(info.tz_hour, 10);
      if (info.tz_minute != null) {
        tz_minute = parseInt(info.tz_minute, 10);
      } else {
        tz_minute = 0;
      }
      tz_offset = (tz_hour * 60 + tz_minute) * 60000;
      if ('-' === info.tz_sign) {
        tz_offset *= -1;
      }
    }
    date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
    if (tz_offset) {
      date.setTime(date.getTime() + tz_offset);
    }
    return date;
  };

  Utils.strRepeat = function(str, number) {
    var i, res;
    res = '';
    i = 0;
    while (i < number) {
      res += str;
      i++;
    }
    return res;
  };

  Utils.getStringFromFile = function(path, callback) {
    var data, fs, name, req, xhr, _i, _len, _ref;
    if (callback == null) {
      callback = null;
    }
    xhr = null;
    if (typeof window !== "undefined" && window !== null) {
      if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
      } else if (window.ActiveXObject) {
        _ref = ["Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.3.0", "Msxml2.XMLHTTP", "Microsoft.XMLHTTP"];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          name = _ref[_i];
          try {
            xhr = new ActiveXObject(name);
          } catch (_error) {}
        }
      }
    }
    if (xhr != null) {
      if (callback != null) {
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 0) {
              return callback(xhr.responseText);
            } else {
              return callback(null);
            }
          }
        };
        xhr.open('GET', path, true);
        return xhr.send(null);
      } else {
        xhr.open('GET', path, false);
        xhr.send(null);
        if (xhr.status === 200 || xhr.status === 0) {
          return xhr.responseText;
        }
        return null;
      }
    } else {
      req = require;
      fs = req('fs');
      if (callback != null) {
        return fs.readFile(path, function(err, data) {
          if (err) {
            return callback(null);
          } else {
            return callback(data);
          }
        });
      } else {
        data = fs.readFileSync(path);
        if (data != null) {
          return '' + data;
        }
        return null;
      }
    }
  };

  return Utils;

})();

module.exports = Utils;



},{"./Pattern":7}],10:[function(require,module,exports){
var Dumper, Parser, Utils, Yaml;

Parser = require('./Parser');

Dumper = require('./Dumper');

Utils = require('./Utils');

Yaml = (function() {
  function Yaml() {}

  Yaml.parse = function(input, exceptionOnInvalidType, objectDecoder) {
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectDecoder == null) {
      objectDecoder = null;
    }
    return new Parser().parse(input, exceptionOnInvalidType, objectDecoder);
  };

  Yaml.parseFile = function(path, callback, exceptionOnInvalidType, objectDecoder) {
    var input;
    if (callback == null) {
      callback = null;
    }
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectDecoder == null) {
      objectDecoder = null;
    }
    if (callback != null) {
      return Utils.getStringFromFile(path, (function(_this) {
        return function(input) {
          if (input != null) {
            return _this.parse(input, exceptionOnInvalidType, objectDecoder);
          }
          return null;
        };
      })(this));
    } else {
      input = Utils.getStringFromFile(path);
      if (input != null) {
        return this.parse(input, exceptionOnInvalidType, objectDecoder);
      }
      return null;
    }
  };

  Yaml.dump = function(input, inline, indent, exceptionOnInvalidType, objectEncoder) {
    var yaml;
    if (inline == null) {
      inline = 2;
    }
    if (indent == null) {
      indent = 4;
    }
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectEncoder == null) {
      objectEncoder = null;
    }
    yaml = new Dumper();
    yaml.indentation = indent;
    return yaml.dump(input, inline, 0, exceptionOnInvalidType, objectEncoder);
  };

  Yaml.register = function() {
    var require_handler;
    require_handler = function(module, filename) {
      return module.exports = YAML.parseFile(filename);
    };
    if ((typeof require !== "undefined" && require !== null ? require.extensions : void 0) != null) {
      require.extensions['.yml'] = require_handler;
      return require.extensions['.yaml'] = require_handler;
    }
  };

  Yaml.prototype.stringify = function(input, inline, indent, exceptionOnInvalidType, objectEncoder) {
    return this.dump(input, inline, indent, exceptionOnInvalidType, objectEncoder);
  };

  Yaml.prototype.load = function(path, callback, exceptionOnInvalidType, objectDecoder) {
    return this.parseFile(path, callback, exceptionOnInvalidType, objectDecoder);
  };

  return Yaml;

})();

if (typeof window !== "undefined" && window !== null) {
  window.YAML = Yaml;
}

module.exports = Yaml;



},{"./Dumper":1,"./Parser":6,"./Utils":9}]},{},[10])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2plcmVteWZhL0RvY3VtZW50cy9Qcm9qZXRzL3lhbWxqcy0yL3NyYy9EdW1wZXIuY29mZmVlIiwiL1VzZXJzL2plcmVteWZhL0RvY3VtZW50cy9Qcm9qZXRzL3lhbWxqcy0yL3NyYy9Fc2NhcGVyLmNvZmZlZSIsIi9Vc2Vycy9qZXJlbXlmYS9Eb2N1bWVudHMvUHJvamV0cy95YW1sanMtMi9zcmMvRXhjZXB0aW9uL0R1bXBFeGNlcHRpb24uY29mZmVlIiwiL1VzZXJzL2plcmVteWZhL0RvY3VtZW50cy9Qcm9qZXRzL3lhbWxqcy0yL3NyYy9FeGNlcHRpb24vUGFyc2VFeGNlcHRpb24uY29mZmVlIiwiL1VzZXJzL2plcmVteWZhL0RvY3VtZW50cy9Qcm9qZXRzL3lhbWxqcy0yL3NyYy9JbmxpbmUuY29mZmVlIiwiL1VzZXJzL2plcmVteWZhL0RvY3VtZW50cy9Qcm9qZXRzL3lhbWxqcy0yL3NyYy9QYXJzZXIuY29mZmVlIiwiL1VzZXJzL2plcmVteWZhL0RvY3VtZW50cy9Qcm9qZXRzL3lhbWxqcy0yL3NyYy9QYXR0ZXJuLmNvZmZlZSIsIi9Vc2Vycy9qZXJlbXlmYS9Eb2N1bWVudHMvUHJvamV0cy95YW1sanMtMi9zcmMvVW5lc2NhcGVyLmNvZmZlZSIsIi9Vc2Vycy9qZXJlbXlmYS9Eb2N1bWVudHMvUHJvamV0cy95YW1sanMtMi9zcmMvVXRpbHMuY29mZmVlIiwiL1VzZXJzL2plcmVteWZhL0RvY3VtZW50cy9Qcm9qZXRzL3lhbWxqcy0yL3NyYy9ZYW1sLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0NBLElBQUEscUJBQUE7O0FBQUEsS0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSLENBQVYsQ0FBQTs7QUFBQSxNQUNBLEdBQVUsT0FBQSxD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QUFXLENBQUEsTUFBQSxDQUFuQixHQUE2QixlQUE3QixDQUFBO2FBQ0EsT0FBTyxDQUFDLFVBQVcsQ0FBQSxPQUFBLENBQW5CLEdBQThCLGdCQUZsQztLQVBPO0VBQUEsQ0ExRFgsQ0FBQTs7QUFBQSxpQkF3RUEsU0FBQSxHQUFXLFNBQUMsS0FBRCxFQUFRLE1BQVIsRUFBZ0IsTUFBaEIsRUFBd0Isc0JBQXhCLEVBQWdELGFBQWhELEdBQUE7QUFDUCxXQUFPLElBQUMsQ0FBQSxJQUFELENBQU0sS0FBTixFQUFhLE1BQWIsRUFBcUIsTUFBckIsRUFBNkIsc0JBQTdCLEVBQXFELGFBQXJELENBQVAsQ0FETztFQUFBLENBeEVYLENBQUE7O0FBQUEsaUJBOEVBLElBQUEsR0FBTSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLHNCQUFqQixFQUF5QyxhQUF6QyxHQUFBO0FBQ0YsV0FBTyxJQUFDLENBQUEsU0FBRCxDQUFXLElBQVgsRUFBaUIsUUFBakIsRUFBMkIsc0JBQTNCLEVBQW1ELGFBQW5ELENBQVAsQ0FERTtFQUFBLENBOUVOLENBQUE7O2NBQUE7O0lBekJKLENBQUE7OztFQTRHQSxNQUFNLENBQUUsSUFBUixHQUFlO0NBNUdmOztBQUFBLE1BOEdNLENBQUMsT0FBUCxHQUFpQixJQTlHakIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG5VdGlscyAgID0gcmVxdWlyZSAnLi9VdGlscydcbklubGluZSAgPSByZXF1aXJlICcuL0lubGluZSdcblxuIyBEdW1wZXIgZHVtcHMgSmF2YVNjcmlwdCB2YXJpYWJsZXMgdG8gWUFNTCBzdHJpbmdzLlxuI1xuY2xhc3MgRHVtcGVyXG5cbiAgICAjIFRoZSBhbW91bnQgb2Ygc3BhY2VzIHRvIHVzZSBmb3IgaW5kZW50YXRpb24gb2YgbmVzdGVkIG5vZGVzLlxuICAgIEBpbmRlbnRhdGlvbjogICA0XG5cblxuICAgICMgRHVtcHMgYSBKYXZhU2NyaXB0IHZhbHVlIHRvIFlBTUwuXG4gICAgI1xuICAgICMgQHBhcmFtIFtPYmplY3RdICAgaW5wdXQgICAgICAgICAgICAgICAgICAgVGhlIEphdmFTY3JpcHQgdmFsdWVcbiAgICAjIEBwYXJhbSBbSW50ZWdlcl0gIGlubGluZSAgICAgICAgICAgICAgICAgIFRoZSBsZXZlbCB3aGVyZSB5b3Ugc3dpdGNoIHRvIGlubGluZSBZQU1MXG4gICAgIyBAcGFyYW0gW0ludGVnZXJdICBpbmRlbnQgICAgICAgICAgICAgICAgICBUaGUgbGV2ZWwgb2YgaW5kZW50YXRpb24gKHVzZWQgaW50ZXJuYWxseSlcbiAgICAjIEBwYXJhbSBbQm9vbGVhbl0gIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgIHRydWUgaWYgYW4gZXhjZXB0aW9uIG11c3QgYmUgdGhyb3duIG9uIGludmFsaWQgdHlwZXMgKGEgSmF2YVNjcmlwdCByZXNvdXJjZSBvciBvYmplY3QpLCBmYWxzZSBvdGhlcndpc2VcbiAgICAjIEBwYXJhbSBbRnVuY3Rpb25dIG9iamVjdEVuY29kZXIgICAgICAgICAgIEEgZnVuY3Rpb24gdG8gc2VyaWFsaXplIGN1c3RvbSBvYmplY3RzLCBudWxsIG90aGVyd2lzZVxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIFRoZSBZQU1MIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBKYXZhU2NyaXB0IHZhbHVlXG4gICAgI1xuICAgIGR1bXA6IChpbnB1dCwgaW5saW5lID0gMCwgaW5kZW50ID0gMCwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSA9IGZhbHNlLCBvYmplY3RFbmNvZGVyID0gbnVsbCkgLT5cbiAgICAgICAgb3V0cHV0ID0gJydcbiAgICAgICAgcHJlZml4ID0gKGlmIGluZGVudCB0aGVuIFV0aWxzLnN0clJlcGVhdCgnICcsIGluZGVudCkgZWxzZSAnJylcblxuICAgICAgICBpZiBpbmxpbmUgPD0gMCBvciB0eXBlb2YoaW5wdXQpIGlzbnQgJ29iamVjdCcgb3IgVXRpbHMuaXNFbXB0eShpbnB1dClcbiAgICAgICAgICAgIG91dHB1dCArPSBwcmVmaXggKyBJbmxpbmUuZHVtcChpbnB1dCwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RW5jb2RlcilcbiAgICAgICAgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlzQUhhc2ggPSBub3QoaW5wdXQgaW5zdGFuY2VvZiBBcnJheSlcblxuICAgICAgICAgICAgZm9yIGtleSwgdmFsdWUgb2YgaW5wdXRcbiAgICAgICAgICAgICAgICB3aWxsQmVJbmxpbmVkID0gKGlubGluZSAtIDEgPD0gMCBvciB0eXBlb2YodmFsdWUpIGlzbnQgJ29iamVjdCcgb3IgVXRpbHMuaXNFbXB0eSh2YWx1ZSkpXG5cbiAgICAgICAgICAgICAgICBvdXRwdXQgKz1cbiAgICAgICAgICAgICAgICAgICAgcHJlZml4ICtcbiAgICAgICAgICAgICAgICAgICAgKGlmIGlzQUhhc2ggdGhlbiBJbmxpbmUuZHVtcChrZXksIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdEVuY29kZXIpICsgJzonIGVsc2UgJy0nKSArXG4gICAgICAgICAgICAgICAgICAgIChpZiB3aWxsQmVJbmxpbmVkIHRoZW4gJyAnIGVsc2UgXCJcXG5cIikgK1xuICAgICAgICAgICAgICAgICAgICBAZHVtcCh2YWx1ZSwgaW5saW5lIC0gMSwgKGlmIHdpbGxCZUlubGluZWQgdGhlbiAwIGVsc2UgaW5kZW50ICsgQGluZGVudGF0aW9uKSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RW5jb2RlcikgK1xuICAgICAgICAgICAgICAgICAgICAoaWYgd2lsbEJlSW5saW5lZCB0aGVuIFwiXFxuXCIgZWxzZSAnJylcblxuICAgICAgICByZXR1cm4gb3V0cHV0XG5cblxubW9kdWxlLmV4cG9ydHMgPSBEdW1wZXJcbiIsIlxuUGF0dGVybiA9IHJlcXVpcmUgJy4vUGF0dGVybidcblxuIyBFc2NhcGVyIGVuY2Fwc3VsYXRlcyBlc2NhcGluZyBydWxlcyBmb3Igc2luZ2xlXG4jIGFuZCBkb3VibGUtcXVvdGVkIFlBTUwgc3RyaW5ncy5cbmNsYXNzIEVzY2FwZXJcblxuICAgICMgTWFwcGluZyBhcnJheXMgZm9yIGVzY2FwaW5nIGEgZG91YmxlIHF1b3RlZCBzdHJpbmcuIFRoZSBiYWNrc2xhc2ggaXNcbiAgICAjIGZpcnN0IHRvIGVuc3VyZSBwcm9wZXIgZXNjYXBpbmcuXG4gICAgQExJU1RfRVNDQVBFRVM6ICAgICAgICAgICAgICAgICBbJ1xcXFxcXFxcJywgJ1xcXFxcIicsICdcIicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcXHgwMFwiLCAgXCJcXHgwMVwiLCAgXCJcXHgwMlwiLCAgXCJcXHgwM1wiLCAgXCJcXHgwNFwiLCAgXCJcXHgwNVwiLCAgXCJcXHgwNlwiLCAgXCJcXHgwN1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXFx4MDhcIiwgIFwiXFx4MDlcIiwgIFwiXFx4MGFcIiwgIFwiXFx4MGJcIiwgIFwiXFx4MGNcIiwgIFwiXFx4MGRcIiwgIFwiXFx4MGVcIiwgIFwiXFx4MGZcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlxceDEwXCIsICBcIlxceDExXCIsICBcIlxceDEyXCIsICBcIlxceDEzXCIsICBcIlxceDE0XCIsICBcIlxceDE1XCIsICBcIlxceDE2XCIsICBcIlxceDE3XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcXHgxOFwiLCAgXCJcXHgxOVwiLCAgXCJcXHgxYVwiLCAgXCJcXHgxYlwiLCAgXCJcXHgxY1wiLCAgXCJcXHgxZFwiLCAgXCJcXHgxZVwiLCAgXCJcXHgxZlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjaCA9IFN0cmluZy5mcm9tQ2hhckNvZGUpKDB4MDA4NSksIGNoKDB4MDBBMCksIGNoKDB4MjAyOCksIGNoKDB4MjAyOSldXG4gICAgQExJU1RfRVNDQVBFRDogICAgICAgICAgICAgICAgICBbJ1xcXFxcIicsICdcXFxcXFxcXCcsICdcXFxcXCInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXFxcXDBcIiwgICBcIlxcXFx4MDFcIiwgXCJcXFxceDAyXCIsIFwiXFxcXHgwM1wiLCBcIlxcXFx4MDRcIiwgXCJcXFxceDA1XCIsIFwiXFxcXHgwNlwiLCBcIlxcXFxhXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcXFxcYlwiLCAgIFwiXFxcXHRcIiwgICBcIlxcXFxuXCIsICAgXCJcXFxcdlwiLCAgIFwiXFxcXGZcIiwgICBcIlxcXFxyXCIsICAgXCJcXFxceDBlXCIsIFwiXFxcXHgwZlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXFxcXHgxMFwiLCBcIlxcXFx4MTFcIiwgXCJcXFxceDEyXCIsIFwiXFxcXHgxM1wiLCBcIlxcXFx4MTRcIiwgXCJcXFxceDE1XCIsIFwiXFxcXHgxNlwiLCBcIlxcXFx4MTdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlxcXFx4MThcIiwgXCJcXFxceDE5XCIsIFwiXFxcXHgxYVwiLCBcIlxcXFxlXCIsICAgXCJcXFxceDFjXCIsIFwiXFxcXHgxZFwiLCBcIlxcXFx4MWVcIiwgXCJcXFxceDFmXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcXFxcTlwiLCBcIlxcXFxfXCIsIFwiXFxcXExcIiwgXCJcXFxcUFwiXVxuXG4gICAgQE1BUFBJTkdfRVNDQVBFRVNfVE9fRVNDQVBFRDogICBkbyA9PlxuICAgICAgICBtYXBwaW5nID0ge31cbiAgICAgICAgZm9yIGkgaW4gWzAuLi5ATElTVF9FU0NBUEVFUy5sZW5ndGhdXG4gICAgICAgICAgICBtYXBwaW5nW0BMSVNUX0VTQ0FQRUVTW2ldXSA9IEBMSVNUX0VTQ0FQRURbaV1cbiAgICAgICAgcmV0dXJuIG1hcHBpbmcgXG5cbiAgICAjIENoYXJhY3RlcnMgdGhhdCB3b3VsZCBjYXVzZSBhIGR1bXBlZCBzdHJpbmcgdG8gcmVxdWlyZSBkb3VibGUgcXVvdGluZy5cbiAgICBAUEFUVEVSTl9DSEFSQUNURVJTX1RPX0VTQ0FQRTogIG5ldyBQYXR0ZXJuICdbXFxcXHgwMC1cXFxceDFmXXxcXHhjMlxceDg1fFxceGMyXFx4YTB8XFx4ZTJcXHg4MFxceGE4fFxceGUyXFx4ODBcXHhhOSdcblxuICAgICMgT3RoZXIgcHJlY29tcGlsZWQgcGF0dGVybnNcbiAgICBAUEFUVEVSTl9NQVBQSU5HX0VTQ0FQRUVTOiAgICAgIG5ldyBQYXR0ZXJuIEBMSVNUX0VTQ0FQRUVTLmpvaW4oJ3wnKVxuICAgIEBQQVRURVJOX1NJTkdMRV9RVU9USU5HOiAgICAgICAgbmV3IFBhdHRlcm4gJ1tcXFxcc1xcJ1wiOnt9W1xcXFxdLCYqIz9dfF5bLT98PD49ISVAYF0nXG5cblxuXG4gICAgIyBEZXRlcm1pbmVzIGlmIGEgSmF2YVNjcmlwdCB2YWx1ZSB3b3VsZCByZXF1aXJlIGRvdWJsZSBxdW90aW5nIGluIFlBTUwuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgdmFsdWUgICBBIEphdmFTY3JpcHQgdmFsdWUgdmFsdWVcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtCb29sZWFuXSB0cnVlICAgIGlmIHRoZSB2YWx1ZSB3b3VsZCByZXF1aXJlIGRvdWJsZSBxdW90ZXMuXG4gICAgI1xuICAgIEByZXF1aXJlc0RvdWJsZVF1b3Rpbmc6ICh2YWx1ZSkgLT5cbiAgICAgICAgcmV0dXJuIEBQQVRURVJOX0NIQVJBQ1RFUlNfVE9fRVNDQVBFLnRlc3QgdmFsdWVcblxuXG4gICAgIyBFc2NhcGVzIGFuZCBzdXJyb3VuZHMgYSBKYXZhU2NyaXB0IHZhbHVlIHdpdGggZG91YmxlIHF1b3Rlcy5cbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICB2YWx1ZSAgIEEgSmF2YVNjcmlwdCB2YWx1ZVxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIFRoZSBxdW90ZWQsIGVzY2FwZWQgc3RyaW5nXG4gICAgI1xuICAgIEBlc2NhcGVXaXRoRG91YmxlUXVvdGVzOiAodmFsdWUpIC0+XG4gICAgICAgIHJldHVybiBAUEFUVEVSTl9NQVBQSU5HX0VTQ0FQRUVTLnJlcGxhY2UgdmFsdWUsIChzdHIpID0+XG4gICAgICAgICAgICByZXR1cm4gQE1BUFBJTkdfRVNDQVBFRVNfVE9fRVNDQVBFRFtzdHJdXG5cblxuICAgICMgRGV0ZXJtaW5lcyBpZiBhIEphdmFTY3JpcHQgdmFsdWUgd291bGQgcmVxdWlyZSBzaW5nbGUgcXVvdGluZyBpbiBZQU1MLlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIHZhbHVlICAgQSBKYXZhU2NyaXB0IHZhbHVlXG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gdHJ1ZSBpZiB0aGUgdmFsdWUgd291bGQgcmVxdWlyZSBzaW5nbGUgcXVvdGVzLlxuICAgICNcbiAgICBAcmVxdWlyZXNTaW5nbGVRdW90aW5nOiAodmFsdWUpIC0+XG4gICAgICAgIHJldHVybiBAUEFUVEVSTl9TSU5HTEVfUVVPVElORy50ZXN0IHZhbHVlXG5cblxuICAgICMgRXNjYXBlcyBhbmQgc3Vycm91bmRzIGEgSmF2YVNjcmlwdCB2YWx1ZSB3aXRoIHNpbmdsZSBxdW90ZXMuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgdmFsdWUgICBBIEphdmFTY3JpcHQgdmFsdWVcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddICBUaGUgcXVvdGVkLCBlc2NhcGVkIHN0cmluZ1xuICAgICNcbiAgICBAZXNjYXBlV2l0aFNpbmdsZVF1b3RlczogKHZhbHVlKSAtPlxuICAgICAgICByZXR1cm4gXCInXCIrdmFsdWUucmVwbGFjZSgnXFwnJywgJ1xcJ1xcJycpK1wiJ1wiXG5cblxubW9kdWxlLmV4cG9ydHMgPSBFc2NhcGVyXG5cbiIsIlxuY2xhc3MgRHVtcEV4Y2VwdGlvbiBleHRlbmRzIEVycm9yXG5cbiAgICBjb25zdHJ1Y3RvcjogKEBtZXNzYWdlLCBAcGFyc2VkTGluZSwgQHNuaXBwZXQpIC0+XG5cbiAgICB0b1N0cmluZzogLT5cbiAgICAgICAgaWYgQHBhcnNlZExpbmU/IGFuZCBAc25pcHBldD9cbiAgICAgICAgICAgIHJldHVybiAnPER1bXBFeGNlcHRpb24+ICcgKyBAbWVzc2FnZSArICcgKGxpbmUgJyArIEBwYXJzZWRMaW5lICsgJzogXFwnJyArIEBzbmlwcGV0ICsgJ1xcJyknXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiAnPER1bXBFeGNlcHRpb24+ICcgKyBAbWVzc2FnZVxuXG5tb2R1bGUuZXhwb3J0cyA9IER1bXBFeGNlcHRpb25cbiIsIlxuY2xhc3MgUGFyc2VFeGNlcHRpb24gZXh0ZW5kcyBFcnJvclxuXG4gICAgY29uc3RydWN0b3I6IChAbWVzc2FnZSwgQHBhcnNlZExpbmUsIEBzbmlwcGV0KSAtPlxuXG4gICAgdG9TdHJpbmc6IC0+XG4gICAgICAgIGlmIEBwYXJzZWRMaW5lPyBhbmQgQHNuaXBwZXQ/XG4gICAgICAgICAgICByZXR1cm4gJzxQYXJzZUV4Y2VwdGlvbj4gJyArIEBtZXNzYWdlICsgJyAobGluZSAnICsgQHBhcnNlZExpbmUgKyAnOiBcXCcnICsgQHNuaXBwZXQgKyAnXFwnKSdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuICc8UGFyc2VFeGNlcHRpb24+ICcgKyBAbWVzc2FnZVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnNlRXhjZXB0aW9uXG4iLCJcblBhdHRlcm4gICAgICAgICA9IHJlcXVpcmUgJy4vUGF0dGVybidcblVuZXNjYXBlciAgICAgICA9IHJlcXVpcmUgJy4vVW5lc2NhcGVyJ1xuRXNjYXBlciAgICAgICAgID0gcmVxdWlyZSAnLi9Fc2NhcGVyJ1xuVXRpbHMgICAgICAgICAgID0gcmVxdWlyZSAnLi9VdGlscydcblBhcnNlRXhjZXB0aW9uICA9IHJlcXVpcmUgJy4vRXhjZXB0aW9uL1BhcnNlRXhjZXB0aW9uJ1xuRHVtcEV4Y2VwdGlvbiAgID0gcmVxdWlyZSAnLi9FeGNlcHRpb24vRHVtcEV4Y2VwdGlvbidcblxuIyBJbmxpbmUgWUFNTCBwYXJzaW5nIGFuZCBkdW1waW5nXG5jbGFzcyBJbmxpbmVcblxuICAgICMgUXVvdGVkIHN0cmluZyByZWd1bGFyIGV4cHJlc3Npb25cbiAgICBAUkVHRVhfUVVPVEVEX1NUUklORzogICAgICAgICAgICAgICAnKD86XCIoPzpbXlwiXFxcXFxcXFxdKig/OlxcXFxcXFxcLlteXCJcXFxcXFxcXF0qKSopXCJ8XFwnKD86W15cXCddKig/OlxcJ1xcJ1teXFwnXSopKilcXCcpJ1xuXG4gICAgIyBQcmUtY29tcGlsZWQgcGF0dGVybnNcbiAgICAjXG4gICAgQFBBVFRFUk5fVFJBSUxJTkdfQ09NTUVOVFM6ICAgICAgICAgbmV3IFBhdHRlcm4gJ15cXFxccyojLiokJ1xuICAgIEBQQVRURVJOX1FVT1RFRF9TQ0FMQVI6ICAgICAgICAgICAgIG5ldyBQYXR0ZXJuICdeJytAUkVHRVhfUVVPVEVEX1NUUklOR1xuICAgIEBQQVRURVJOX1RIT1VTQU5EX05VTUVSSUNfU0NBTEFSOiAgIG5ldyBQYXR0ZXJuICdeKC18XFxcXCspP1swLTksXSsoXFxcXC5bMC05XSspPyQnXG4gICAgQFBBVFRFUk5fU0NBTEFSX0JZX0RFTElNSVRFUlM6ICAgICAge31cblxuICAgICMgU2V0dGluZ3NcbiAgICBAc2V0dGluZ3M6IHt9XG5cblxuICAgICMgQ29uZmlndXJlIFlBTUwgaW5saW5lLlxuICAgICNcbiAgICAjIEBwYXJhbSBbQm9vbGVhbl0gIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgIHRydWUgaWYgYW4gZXhjZXB0aW9uIG11c3QgYmUgdGhyb3duIG9uIGludmFsaWQgdHlwZXMgKGEgSmF2YVNjcmlwdCByZXNvdXJjZSBvciBvYmplY3QpLCBmYWxzZSBvdGhlcndpc2VcbiAgICAjIEBwYXJhbSBbRnVuY3Rpb25dIG9iamVjdERlY29kZXIgICAgICAgICAgIEEgZnVuY3Rpb24gdG8gZGVzZXJpYWxpemUgY3VzdG9tIG9iamVjdHMsIG51bGwgb3RoZXJ3aXNlXG4gICAgI1xuICAgIEBjb25maWd1cmU6IChleGNlcHRpb25PbkludmFsaWRUeXBlID0gbnVsbCwgb2JqZWN0RGVjb2RlciA9IG51bGwpIC0+XG4gICAgICAgICMgVXBkYXRlIHNldHRpbmdzXG4gICAgICAgIEBzZXR0aW5ncy5leGNlcHRpb25PbkludmFsaWRUeXBlID0gZXhjZXB0aW9uT25JbnZhbGlkVHlwZVxuICAgICAgICBAc2V0dGluZ3Mub2JqZWN0RGVjb2RlciA9IG9iamVjdERlY29kZXJcbiAgICAgICAgcmV0dXJuXG5cblxuICAgICMgQ29udmVydHMgYSBZQU1MIHN0cmluZyB0byBhIEphdmFTY3JpcHQgb2JqZWN0LlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIHZhbHVlICAgICAgICAgICAgICAgICAgIEEgWUFNTCBzdHJpbmdcbiAgICAjIEBwYXJhbSBbQm9vbGVhbl0gIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgIHRydWUgaWYgYW4gZXhjZXB0aW9uIG11c3QgYmUgdGhyb3duIG9uIGludmFsaWQgdHlwZXMgKGEgSmF2YVNjcmlwdCByZXNvdXJjZSBvciBvYmplY3QpLCBmYWxzZSBvdGhlcndpc2VcbiAgICAjIEBwYXJhbSBbRnVuY3Rpb25dIG9iamVjdERlY29kZXIgICAgICAgICAgIEEgZnVuY3Rpb24gdG8gZGVzZXJpYWxpemUgY3VzdG9tIG9iamVjdHMsIG51bGwgb3RoZXJ3aXNlXG4gICAgI1xuICAgICMgQHJldHVybiBbT2JqZWN0XSAgQSBKYXZhU2NyaXB0IG9iamVjdCByZXByZXNlbnRpbmcgdGhlIFlBTUwgc3RyaW5nXG4gICAgI1xuICAgICMgQHRocm93IFtQYXJzZUV4Y2VwdGlvbl1cbiAgICAjXG4gICAgQHBhcnNlOiAodmFsdWUsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgPSBmYWxzZSwgb2JqZWN0RGVjb2RlciA9IG51bGwpIC0+XG4gICAgICAgICMgVXBkYXRlIHNldHRpbmdzIGZyb20gbGFzdCBjYWxsIG9mIElubGluZS5wYXJzZSgpXG4gICAgICAgIEBzZXR0aW5ncy5leGNlcHRpb25PbkludmFsaWRUeXBlID0gZXhjZXB0aW9uT25JbnZhbGlkVHlwZVxuICAgICAgICBAc2V0dGluZ3Mub2JqZWN0RGVjb2RlciA9IG9iamVjdERlY29kZXJcblxuICAgICAgICBpZiBub3QgdmFsdWU/XG4gICAgICAgICAgICByZXR1cm4gJydcblxuICAgICAgICB2YWx1ZSA9IFV0aWxzLnRyaW0gdmFsdWVcblxuICAgICAgICBpZiAwIGlzIHZhbHVlLmxlbmd0aFxuICAgICAgICAgICAgcmV0dXJuICcnXG5cbiAgICAgICAgIyBLZWVwIGEgY29udGV4dCBvYmplY3QgdG8gcGFzcyB0aHJvdWdoIHN0YXRpYyBtZXRob2RzXG4gICAgICAgIGNvbnRleHQgPSB7ZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlciwgaTogMH1cblxuICAgICAgICBzd2l0Y2ggdmFsdWUuY2hhckF0KDApXG4gICAgICAgICAgICB3aGVuICdbJ1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IEBwYXJzZVNlcXVlbmNlIHZhbHVlLCBjb250ZXh0XG4gICAgICAgICAgICAgICAgKytjb250ZXh0LmlcbiAgICAgICAgICAgIHdoZW4gJ3snXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gQHBhcnNlTWFwcGluZyB2YWx1ZSwgY29udGV4dFxuICAgICAgICAgICAgICAgICsrY29udGV4dC5pXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gQHBhcnNlU2NhbGFyIHZhbHVlLCBudWxsLCBbJ1wiJywgXCInXCJdLCBjb250ZXh0XG5cbiAgICAgICAgIyBTb21lIGNvbW1lbnRzIGFyZSBhbGxvd2VkIGF0IHRoZSBlbmRcbiAgICAgICAgaWYgQFBBVFRFUk5fVFJBSUxJTkdfQ09NTUVOVFMucmVwbGFjZSh2YWx1ZVtjb250ZXh0LmkuLl0sICcnKSBpc250ICcnXG4gICAgICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24gJ1VuZXhwZWN0ZWQgY2hhcmFjdGVycyBuZWFyIFwiJyt2YWx1ZVtjb250ZXh0LmkuLl0rJ1wiLidcblxuICAgICAgICByZXR1cm4gcmVzdWx0XG5cblxuICAgICMgRHVtcHMgYSBnaXZlbiBKYXZhU2NyaXB0IHZhcmlhYmxlIHRvIGEgWUFNTCBzdHJpbmcuXG4gICAgI1xuICAgICMgQHBhcmFtIFtPYmplY3RdICAgdmFsdWUgICAgICAgICAgICAgICAgICAgVGhlIEphdmFTY3JpcHQgdmFyaWFibGUgdG8gY29udmVydFxuICAgICMgQHBhcmFtIFtCb29sZWFuXSAgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSAgdHJ1ZSBpZiBhbiBleGNlcHRpb24gbXVzdCBiZSB0aHJvd24gb24gaW52YWxpZCB0eXBlcyAoYSBKYXZhU2NyaXB0IHJlc291cmNlIG9yIG9iamVjdCksIGZhbHNlIG90aGVyd2lzZVxuICAgICMgQHBhcmFtIFtGdW5jdGlvbl0gb2JqZWN0RW5jb2RlciAgICAgICAgICAgQSBmdW5jdGlvbiB0byBzZXJpYWxpemUgY3VzdG9tIG9iamVjdHMsIG51bGwgb3RoZXJ3aXNlXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgVGhlIFlBTUwgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgSmF2YVNjcmlwdCBvYmplY3RcbiAgICAjXG4gICAgIyBAdGhyb3cgW0R1bXBFeGNlcHRpb25dXG4gICAgI1xuICAgIEBkdW1wOiAodmFsdWUsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgPSBmYWxzZSwgb2JqZWN0RW5jb2RlciA9IG51bGwpIC0+XG4gICAgICAgIGlmIG5vdCB2YWx1ZT9cbiAgICAgICAgICAgIHJldHVybiAnbnVsbCdcbiAgICAgICAgdHlwZSA9IHR5cGVvZiB2YWx1ZVxuICAgICAgICBpZiB0eXBlIGlzICdvYmplY3QnXG4gICAgICAgICAgICBpZiB2YWx1ZSBpbnN0YW5jZW9mIERhdGVcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgZWxzZSBpZiBvYmplY3RFbmNvZGVyP1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IG9iamVjdEVuY29kZXIgdmFsdWVcbiAgICAgICAgICAgICAgICBpZiB0eXBlb2YgcmVzdWx0IGlzICdzdHJpbmcnIG9yIHJlc3VsdD9cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgICAgICAgcmV0dXJuIEBkdW1wT2JqZWN0IHZhbHVlXG4gICAgICAgIGlmIHR5cGUgaXMgJ2Jvb2xlYW4nXG4gICAgICAgICAgICByZXR1cm4gKGlmIHZhbHVlIHRoZW4gJ3RydWUnIGVsc2UgJ2ZhbHNlJylcbiAgICAgICAgaWYgVXRpbHMuaXNEaWdpdHModmFsdWUpXG4gICAgICAgICAgICByZXR1cm4gKGlmIHR5cGUgaXMgJ3N0cmluZycgdGhlbiBcIidcIit2YWx1ZStcIidcIiBlbHNlICcnK3BhcnNlSW50KHZhbHVlKSlcbiAgICAgICAgaWYgVXRpbHMuaXNOdW1lcmljKHZhbHVlKVxuICAgICAgICAgICAgcmV0dXJuIChpZiB0eXBlIGlzICdzdHJpbmcnIHRoZW4gXCInXCIrdmFsdWUrXCInXCIgZWxzZSAnJytwYXJzZUZsb2F0KHZhbHVlKSlcbiAgICAgICAgaWYgdHlwZSBpcyAnbnVtYmVyJ1xuICAgICAgICAgICAgcmV0dXJuIChpZiB2YWx1ZSBpcyBJbmZpbml0eSB0aGVuICcuSW5mJyBlbHNlIChpZiB2YWx1ZSBpcyAtSW5maW5pdHkgdGhlbiAnLS5JbmYnIGVsc2UgKGlmIGlzTmFOKHZhbHVlKSB0aGVuICcuTmFOJyBlbHNlIHZhbHVlKSkpXG4gICAgICAgIGlmIEVzY2FwZXIucmVxdWlyZXNEb3VibGVRdW90aW5nIHZhbHVlXG4gICAgICAgICAgICByZXR1cm4gRXNjYXBlci5lc2NhcGVXaXRoRG91YmxlUXVvdGVzIHZhbHVlXG4gICAgICAgIGlmIEVzY2FwZXIucmVxdWlyZXNTaW5nbGVRdW90aW5nIHZhbHVlXG4gICAgICAgICAgICByZXR1cm4geWFtbC5lc2NhcGVXaXRoU2luZ2xlUXVvdGVzIHZhbHVlXG4gICAgICAgIGlmICcnIGlzIHZhbHVlXG4gICAgICAgICAgICByZXR1cm4gJ1wiXCInXG4gICAgICAgIGlmIFV0aWxzLlBBVFRFUk5fREFURS50ZXN0IHZhbHVlXG4gICAgICAgICAgICByZXR1cm4gXCInXCIrdmFsdWUrXCInXCI7XG4gICAgICAgIGlmIHZhbHVlLnRvTG93ZXJDYXNlKCkgaW4gWydudWxsJywnficsJ3RydWUnLCdmYWxzZSddXG4gICAgICAgICAgICByZXR1cm4gXCInXCIrdmFsdWUrXCInXCJcbiAgICAgICAgIyBEZWZhdWx0XG4gICAgICAgIHJldHVybiB2YWx1ZTtcblxuXG4gICAgIyBEdW1wcyBhIEphdmFTY3JpcHQgb2JqZWN0IHRvIGEgWUFNTCBzdHJpbmcuXG4gICAgI1xuICAgICMgQHBhcmFtIFtPYmplY3RdICAgdmFsdWUgICAgICAgICAgICAgICAgICAgVGhlIEphdmFTY3JpcHQgb2JqZWN0IHRvIGR1bXBcbiAgICAjIEBwYXJhbSBbQm9vbGVhbl0gIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgIHRydWUgaWYgYW4gZXhjZXB0aW9uIG11c3QgYmUgdGhyb3duIG9uIGludmFsaWQgdHlwZXMgKGEgSmF2YVNjcmlwdCByZXNvdXJjZSBvciBvYmplY3QpLCBmYWxzZSBvdGhlcndpc2VcbiAgICAjIEBwYXJhbSBbRnVuY3Rpb25dIG9iamVjdEVuY29kZXIgICAgICAgICAgIEEgZnVuY3Rpb24gZG8gc2VyaWFsaXplIGN1c3RvbSBvYmplY3RzLCBudWxsIG90aGVyd2lzZVxuICAgICNcbiAgICAjIEByZXR1cm4gc3RyaW5nIFRoZSBZQU1MIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIEphdmFTY3JpcHQgb2JqZWN0XG4gICAgI1xuICAgIEBkdW1wT2JqZWN0OiAodmFsdWUsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdFN1cHBvcnQgPSBudWxsKSAtPlxuICAgICAgICAjIEFycmF5XG4gICAgICAgIGlmIHZhbHVlIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgIG91dHB1dCA9IFtdXG4gICAgICAgICAgICBmb3IgdmFsIGluIHZhbHVlXG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2ggQGR1bXAgdmFsXG4gICAgICAgICAgICByZXR1cm4gJ1snK291dHB1dC5qb2luKCcsICcpKyddJ1xuXG4gICAgICAgICMgTWFwcGluZ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvdXRwdXQgPSBbXVxuICAgICAgICAgICAgZm9yIGtleSwgdmFsIG9mIHZhbHVlXG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2ggQGR1bXAoa2V5KSsnOiAnK0BkdW1wKHZhbClcbiAgICAgICAgICAgIHJldHVybiAneycrb3V0cHV0LmpvaW4oJywgJykrJ30nXG5cblxuICAgICMgUGFyc2VzIGEgc2NhbGFyIHRvIGEgWUFNTCBzdHJpbmcuXG4gICAgI1xuICAgICMgQHBhcmFtIFtPYmplY3RdICAgc2NhbGFyXG4gICAgIyBAcGFyYW0gW0FycmF5XSAgICBkZWxpbWl0ZXJzXG4gICAgIyBAcGFyYW0gW0FycmF5XSAgICBzdHJpbmdEZWxpbWl0ZXJzXG4gICAgIyBAcGFyYW0gW09iamVjdF0gICBjb250ZXh0XG4gICAgIyBAcGFyYW0gW0Jvb2xlYW5dICBldmFsdWF0ZVxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIEEgWUFNTCBzdHJpbmdcbiAgICAjXG4gICAgIyBAdGhyb3cgW1BhcnNlRXhjZXB0aW9uXSBXaGVuIG1hbGZvcm1lZCBpbmxpbmUgWUFNTCBzdHJpbmcgaXMgcGFyc2VkXG4gICAgI1xuICAgIEBwYXJzZVNjYWxhcjogKHNjYWxhciwgZGVsaW1pdGVycyA9IG51bGwsIHN0cmluZ0RlbGltaXRlcnMgPSBbJ1wiJywgXCInXCJdLCBjb250ZXh0ID0gbnVsbCwgZXZhbHVhdGUgPSB0cnVlKSAtPlxuICAgICAgICB1bmxlc3MgY29udGV4dD9cbiAgICAgICAgICAgIGNvbnRleHQgPSBleGNlcHRpb25PbkludmFsaWRUeXBlOiBAc2V0dGluZ3MuZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlcjogQHNldHRpbmdzLm9iamVjdERlY29kZXIsIGk6IDBcbiAgICAgICAge2l9ID0gY29udGV4dFxuXG4gICAgICAgIGlmIHNjYWxhci5jaGFyQXQoaSkgaW4gc3RyaW5nRGVsaW1pdGVyc1xuICAgICAgICAgICAgIyBRdW90ZWQgc2NhbGFyXG4gICAgICAgICAgICBvdXRwdXQgPSBAcGFyc2VRdW90ZWRTY2FsYXIgc2NhbGFyLCBjb250ZXh0XG4gICAgICAgICAgICB7aX0gPSBjb250ZXh0XG5cbiAgICAgICAgICAgIGlmIGRlbGltaXRlcnM/XG4gICAgICAgICAgICAgICAgdG1wID0gVXRpbHMubHRyaW0gc2NhbGFyW2kuLl0sICcgJ1xuICAgICAgICAgICAgICAgIGlmIG5vdCh0bXAuY2hhckF0KDApIGluIGRlbGltaXRlcnMpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnVW5leHBlY3RlZCBjaGFyYWN0ZXJzICgnK3NjYWxhcltpLi5dKycpLidcblxuICAgICAgICBlbHNlXG4gICAgICAgICAgICAjIFwibm9ybWFsXCIgc3RyaW5nXG4gICAgICAgICAgICBpZiBub3QgZGVsaW1pdGVyc1xuICAgICAgICAgICAgICAgIG91dHB1dCA9IHNjYWxhcltpLi5dXG4gICAgICAgICAgICAgICAgaSArPSBvdXRwdXQubGVuZ3RoXG5cbiAgICAgICAgICAgICAgICAjIFJlbW92ZSBjb21tZW50c1xuICAgICAgICAgICAgICAgIHN0cnBvcyA9IG91dHB1dC5pbmRleE9mICcgIydcbiAgICAgICAgICAgICAgICBpZiBzdHJwb3MgaXNudCAtMVxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQgPSBVdGlscy5ydHJpbSBvdXRwdXRbMC4uLnN0cnBvc11cblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGpvaW5lZERlbGltaXRlcnMgPSBkZWxpbWl0ZXJzLmpvaW4oJ3wnKVxuICAgICAgICAgICAgICAgIHBhdHRlcm4gPSBAUEFUVEVSTl9TQ0FMQVJfQllfREVMSU1JVEVSU1tqb2luZWREZWxpbWl0ZXJzXVxuICAgICAgICAgICAgICAgIHVubGVzcyBwYXR0ZXJuP1xuICAgICAgICAgICAgICAgICAgICBwYXR0ZXJuID0gbmV3IFBhdHRlcm4gJ14oLis/KSgnK2pvaW5lZERlbGltaXRlcnMrJyknXG4gICAgICAgICAgICAgICAgICAgIEBQQVRURVJOX1NDQUxBUl9CWV9ERUxJTUlURVJTW2pvaW5lZERlbGltaXRlcnNdID0gcGF0dGVyblxuICAgICAgICAgICAgICAgIGlmIG1hdGNoID0gcGF0dGVybi5leGVjIHNjYWxhcltpLi5dXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dCA9IG1hdGNoWzFdXG4gICAgICAgICAgICAgICAgICAgIGkgKz0gb3V0cHV0Lmxlbmd0aFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdNYWxmb3JtZWQgaW5saW5lIFlBTUwgc3RyaW5nICgnK3NjYWxhcisnKS4nXG5cblxuICAgICAgICAgICAgaWYgZXZhbHVhdGVcbiAgICAgICAgICAgICAgICBvdXRwdXQgPSBAZXZhbHVhdGVTY2FsYXIgb3V0cHV0LCBjb250ZXh0XG5cbiAgICAgICAgY29udGV4dC5pID0gaVxuICAgICAgICByZXR1cm4gb3V0cHV0XG5cblxuICAgICMgUGFyc2VzIGEgcXVvdGVkIHNjYWxhciB0byBZQU1MLlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIHNjYWxhclxuICAgICMgQHBhcmFtIFtPYmplY3RdICAgY29udGV4dFxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIEEgWUFNTCBzdHJpbmdcbiAgICAjXG4gICAgIyBAdGhyb3cgW1BhcnNlRXhjZXB0aW9uXSBXaGVuIG1hbGZvcm1lZCBpbmxpbmUgWUFNTCBzdHJpbmcgaXMgcGFyc2VkXG4gICAgI1xuICAgIEBwYXJzZVF1b3RlZFNjYWxhcjogKHNjYWxhciwgY29udGV4dCkgLT5cbiAgICAgICAge2l9ID0gY29udGV4dFxuXG4gICAgICAgIHVubGVzcyBtYXRjaCA9IEBQQVRURVJOX1FVT1RFRF9TQ0FMQVIuZXhlYyBzY2FsYXJbaS4uXVxuICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdNYWxmb3JtZWQgaW5saW5lIFlBTUwgc3RyaW5nICgnK3NjYWxhcltpLi5dKycpLidcblxuICAgICAgICBvdXRwdXQgPSBtYXRjaFswXS5zdWJzdHIoMSwgbWF0Y2hbMF0ubGVuZ3RoIC0gMilcblxuICAgICAgICBpZiAnXCInIGlzIHNjYWxhci5jaGFyQXQoaSlcbiAgICAgICAgICAgIG91dHB1dCA9IFVuZXNjYXBlci51bmVzY2FwZURvdWJsZVF1b3RlZFN0cmluZyBvdXRwdXRcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgb3V0cHV0ID0gVW5lc2NhcGVyLnVuZXNjYXBlU2luZ2xlUXVvdGVkU3RyaW5nIG91dHB1dFxuXG4gICAgICAgIGkgKz0gbWF0Y2hbMF0ubGVuZ3RoXG5cbiAgICAgICAgY29udGV4dC5pID0gaVxuICAgICAgICByZXR1cm4gb3V0cHV0XG5cblxuICAgICMgUGFyc2VzIGEgc2VxdWVuY2UgdG8gYSBZQU1MIHN0cmluZy5cbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICBzZXF1ZW5jZVxuICAgICMgQHBhcmFtIFtPYmplY3RdICAgY29udGV4dFxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIEEgWUFNTCBzdHJpbmdcbiAgICAjXG4gICAgIyBAdGhyb3cgW1BhcnNlRXhjZXB0aW9uXSBXaGVuIG1hbGZvcm1lZCBpbmxpbmUgWUFNTCBzdHJpbmcgaXMgcGFyc2VkXG4gICAgI1xuICAgIEBwYXJzZVNlcXVlbmNlOiAoc2VxdWVuY2UsIGNvbnRleHQpIC0+XG4gICAgICAgIG91dHB1dCA9IFtdXG4gICAgICAgIGxlbiA9IHNlcXVlbmNlLmxlbmd0aFxuICAgICAgICB7aX0gPSBjb250ZXh0XG4gICAgICAgIGkgKz0gMVxuXG4gICAgICAgICMgW2ZvbywgYmFyLCAuLi5dXG4gICAgICAgIHdoaWxlIGkgPCBsZW5cbiAgICAgICAgICAgIGNvbnRleHQuaSA9IGlcbiAgICAgICAgICAgIHN3aXRjaCBzZXF1ZW5jZS5jaGFyQXQoaSlcbiAgICAgICAgICAgICAgICB3aGVuICdbJ1xuICAgICAgICAgICAgICAgICAgICAjIE5lc3RlZCBzZXF1ZW5jZVxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaCBAcGFyc2VTZXF1ZW5jZSBzZXF1ZW5jZSwgY29udGV4dFxuICAgICAgICAgICAgICAgICAgICB7aX0gPSBjb250ZXh0XG4gICAgICAgICAgICAgICAgd2hlbiAneydcbiAgICAgICAgICAgICAgICAgICAgIyBOZXN0ZWQgbWFwcGluZ1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaCBAcGFyc2VNYXBwaW5nIHNlcXVlbmNlLCBjb250ZXh0XG4gICAgICAgICAgICAgICAgICAgIHtpfSA9IGNvbnRleHRcbiAgICAgICAgICAgICAgICB3aGVuICddJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3V0cHV0XG4gICAgICAgICAgICAgICAgd2hlbiAnLCcsICcgJywgXCJcXG5cIlxuICAgICAgICAgICAgICAgICAgICAjIERvIG5vdGhpbmdcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGlzUXVvdGVkID0gKHNlcXVlbmNlLmNoYXJBdChpKSBpbiBbJ1wiJywgXCInXCJdKVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IEBwYXJzZVNjYWxhciBzZXF1ZW5jZSwgWycsJywgJ10nXSwgWydcIicsIFwiJ1wiXSwgY29udGV4dFxuICAgICAgICAgICAgICAgICAgICB7aX0gPSBjb250ZXh0XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgbm90KGlzUXVvdGVkKSBhbmQgdHlwZW9mKHZhbHVlKSBpcyAnc3RyaW5nJyBhbmQgKHZhbHVlLmluZGV4T2YoJzogJykgaXNudCAtMSBvciB2YWx1ZS5pbmRleE9mKFwiOlxcblwiKSBpc250IC0xKVxuICAgICAgICAgICAgICAgICAgICAgICAgIyBFbWJlZGRlZCBtYXBwaW5nP1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBAcGFyc2VNYXBwaW5nICd7Jyt2YWx1ZSsnfSdcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIE5vLCBpdCdzIG5vdFxuXG5cbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2ggdmFsdWVcblxuICAgICAgICAgICAgICAgICAgICAtLWlcblxuICAgICAgICAgICAgKytpXG5cbiAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdNYWxmb3JtZWQgaW5saW5lIFlBTUwgc3RyaW5nICcrc2VxdWVuY2VcblxuXG4gICAgIyBQYXJzZXMgYSBtYXBwaW5nIHRvIGEgWUFNTCBzdHJpbmcuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgbWFwcGluZ1xuICAgICMgQHBhcmFtIFtPYmplY3RdICAgY29udGV4dFxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIEEgWUFNTCBzdHJpbmdcbiAgICAjXG4gICAgIyBAdGhyb3cgW1BhcnNlRXhjZXB0aW9uXSBXaGVuIG1hbGZvcm1lZCBpbmxpbmUgWUFNTCBzdHJpbmcgaXMgcGFyc2VkXG4gICAgI1xuICAgIEBwYXJzZU1hcHBpbmc6IChtYXBwaW5nLCBjb250ZXh0KSAtPlxuICAgICAgICBvdXRwdXQgPSB7fVxuICAgICAgICBsZW4gPSBtYXBwaW5nLmxlbmd0aFxuICAgICAgICB7aX0gPSBjb250ZXh0XG4gICAgICAgIGkgKz0gMVxuXG4gICAgICAgICMge2ZvbzogYmFyLCBiYXI6Zm9vLCAuLi59XG4gICAgICAgIHNob3VsZENvbnRpbnVlV2hpbGVMb29wID0gZmFsc2VcbiAgICAgICAgd2hpbGUgaSA8IGxlblxuICAgICAgICAgICAgY29udGV4dC5pID0gaVxuICAgICAgICAgICAgc3dpdGNoIG1hcHBpbmcuY2hhckF0KGkpXG4gICAgICAgICAgICAgICAgd2hlbiAnICcsICcsJywgXCJcXG5cIlxuICAgICAgICAgICAgICAgICAgICArK2lcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5pID0gaVxuICAgICAgICAgICAgICAgICAgICBzaG91bGRDb250aW51ZVdoaWxlTG9vcCA9IHRydWVcbiAgICAgICAgICAgICAgICB3aGVuICd9J1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3V0cHV0XG5cbiAgICAgICAgICAgIGlmIHNob3VsZENvbnRpbnVlV2hpbGVMb29wXG4gICAgICAgICAgICAgICAgc2hvdWxkQ29udGludWVXaGlsZUxvb3AgPSBmYWxzZVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgICMgS2V5XG4gICAgICAgICAgICBrZXkgPSBAcGFyc2VTY2FsYXIgbWFwcGluZywgWyc6JywgJyAnLCBcIlxcblwiXSwgWydcIicsIFwiJ1wiXSwgY29udGV4dCwgZmFsc2VcbiAgICAgICAgICAgIHtpfSA9IGNvbnRleHRcblxuICAgICAgICAgICAgIyBWYWx1ZVxuICAgICAgICAgICAgZG9uZSA9IGZhbHNlXG5cbiAgICAgICAgICAgIHdoaWxlIGkgPCBsZW5cbiAgICAgICAgICAgICAgICBjb250ZXh0LmkgPSBpXG4gICAgICAgICAgICAgICAgc3dpdGNoIG1hcHBpbmcuY2hhckF0KGkpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ1snXG4gICAgICAgICAgICAgICAgICAgICAgICAjIE5lc3RlZCBzZXF1ZW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBAcGFyc2VTZXF1ZW5jZSBtYXBwaW5nLCBjb250ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICB7aX0gPSBjb250ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAjIFNwZWM6IEtleXMgTVVTVCBiZSB1bmlxdWU7IGZpcnN0IG9uZSB3aW5zLlxuICAgICAgICAgICAgICAgICAgICAgICAgIyBQYXJzZXIgY2Fubm90IGFib3J0IHRoaXMgbWFwcGluZyBlYXJsaWVyLCBzaW5jZSBsaW5lc1xuICAgICAgICAgICAgICAgICAgICAgICAgIyBhcmUgcHJvY2Vzc2VkIHNlcXVlbnRpYWxseS5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG91dHB1dFtrZXldID09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFtrZXldID0gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3snXG4gICAgICAgICAgICAgICAgICAgICAgICAjIE5lc3RlZCBtYXBwaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAkdmFsdWUgPSBAcGFyc2VNYXBwaW5nIG1hcHBpbmcsIGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIHtpfSA9IGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgICMgU3BlYzogS2V5cyBNVVNUIGJlIHVuaXF1ZTsgZmlyc3Qgb25lIHdpbnMuXG4gICAgICAgICAgICAgICAgICAgICAgICAjIFBhcnNlciBjYW5ub3QgYWJvcnQgdGhpcyBtYXBwaW5nIGVhcmxpZXIsIHNpbmNlIGxpbmVzXG4gICAgICAgICAgICAgICAgICAgICAgICAjIGFyZSBwcm9jZXNzZWQgc2VxdWVudGlhbGx5LlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgb3V0cHV0W2tleV0gPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0W2tleV0gPSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnOicsICcgJywgXCJcXG5cIlxuICAgICAgICAgICAgICAgICAgICAgICAgIyBEbyBub3RoaW5nXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gQHBhcnNlU2NhbGFyIG1hcHBpbmcsIFsnLCcsICd9J10sIFsnXCInLCBcIidcIl0sIGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIHtpfSA9IGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgICMgU3BlYzogS2V5cyBNVVNUIGJlIHVuaXF1ZTsgZmlyc3Qgb25lIHdpbnMuXG4gICAgICAgICAgICAgICAgICAgICAgICAjIFBhcnNlciBjYW5ub3QgYWJvcnQgdGhpcyBtYXBwaW5nIGVhcmxpZXIsIHNpbmNlIGxpbmVzXG4gICAgICAgICAgICAgICAgICAgICAgICAjIGFyZSBwcm9jZXNzZWQgc2VxdWVudGlhbGx5LlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgb3V0cHV0W2tleV0gPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0W2tleV0gPSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIC0taVxuXG4gICAgICAgICAgICAgICAgKytpXG5cbiAgICAgICAgICAgICAgICBpZiBkb25lXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdNYWxmb3JtZWQgaW5saW5lIFlBTUwgc3RyaW5nICcrbWFwcGluZ1xuXG5cbiAgICAjIEV2YWx1YXRlcyBzY2FsYXJzIGFuZCByZXBsYWNlcyBtYWdpYyB2YWx1ZXMuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgc2NhbGFyXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgQSBZQU1MIHN0cmluZ1xuICAgICNcbiAgICBAZXZhbHVhdGVTY2FsYXI6IChzY2FsYXIsIGNvbnRleHQpIC0+XG4gICAgICAgIHNjYWxhciA9IFV0aWxzLnRyaW0oc2NhbGFyKVxuICAgICAgICBzY2FsYXJMb3dlciA9IHNjYWxhci50b0xvd2VyQ2FzZSgpXG5cbiAgICAgICAgc3dpdGNoIHNjYWxhckxvd2VyXG4gICAgICAgICAgICB3aGVuICdudWxsJywgJycsICd+J1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgICAgICB3aGVuICd0cnVlJ1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICB3aGVuICdmYWxzZSdcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIHdoZW4gJy5pbmYnXG4gICAgICAgICAgICAgICAgcmV0dXJuIEluZmluaXR5XG4gICAgICAgICAgICB3aGVuICcubmFuJ1xuICAgICAgICAgICAgICAgIHJldHVybiBOYU5cbiAgICAgICAgICAgIHdoZW4gJy0uaW5mJ1xuICAgICAgICAgICAgICAgIHJldHVybiBJbmZpbml0eVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZpcnN0Q2hhciA9IHNjYWxhckxvd2VyLmNoYXJBdCgwKVxuICAgICAgICAgICAgICAgIHN3aXRjaCBmaXJzdENoYXJcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnISdcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0U3BhY2UgPSBzY2FsYXIuaW5kZXhPZignICcpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBmaXJzdFNwYWNlIGlzIC0xXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RXb3JkID0gc2NhbGFyTG93ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdFdvcmQgPSBzY2FsYXJMb3dlclswLi4uZmlyc3RTcGFjZV1cbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCBmaXJzdFdvcmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGVuICchJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBmaXJzdFNwYWNlIGlzbnQgLTFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUludCBAcGFyc2VTY2FsYXIoc2NhbGFyWzIuLl0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnIXN0cidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFV0aWxzLmx0cmltIHNjYWxhcls0Li5dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnISFzdHInXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBVdGlscy5sdHJpbSBzY2FsYXJbNS4uXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJyEhaW50J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VJbnQoQHBhcnNlU2NhbGFyKHNjYWxhcls1Li5dKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGVuICchIWJvb2wnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBVdGlscy5wYXJzZUJvb2xlYW4oQHBhcnNlU2NhbGFyKHNjYWxhcls2Li5dKSwgZmFsc2UpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnISFmbG9hdCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoQHBhcnNlU2NhbGFyKHNjYWxhcls3Li5dKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGVuICchIXRpbWVzdGFtcCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFV0aWxzLnN0cmluZ1RvRGF0ZShVdGlscy5sdHJpbShzY2FsYXJbMTEuLl0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5sZXNzIGNvbnRleHQ/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0ID0gZXhjZXB0aW9uT25JbnZhbGlkVHlwZTogQHNldHRpbmdzLmV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXI6IEBzZXR0aW5ncy5vYmplY3REZWNvZGVyLCBpOiAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtvYmplY3REZWNvZGVyLCBleGNlcHRpb25PbkludmFsaWRUeXBlfSA9IGNvbnRleHRcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBvYmplY3REZWNvZGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIElmIG9iamVjdERlY29kZXIgZnVuY3Rpb24gaXMgZ2l2ZW4sIHdlIGNhbiBkbyBjdXN0b20gZGVjb2Rpbmcgb2YgY3VzdG9tIHR5cGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmltbWVkU2NhbGFyID0gVXRpbHMucnRyaW0gc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdFNwYWNlID0gdHJpbW1lZFNjYWxhci5pbmRleE9mKCcgJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGZpcnN0U3BhY2UgaXMgLTFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2JqZWN0RGVjb2RlciB0cmltbWVkU2NhbGFyLCBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ViVmFsdWUgPSBVdGlscy5sdHJpbSB0cmltbWVkU2NhbGFyW2ZpcnN0U3BhY2UrMS4uXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVubGVzcyBzdWJWYWx1ZS5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YlZhbHVlID0gbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvYmplY3REZWNvZGVyIHRyaW1tZWRTY2FsYXJbMC4uLmZpcnN0U3BhY2VdLCBzdWJWYWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBleGNlcHRpb25PbkludmFsaWRUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24gJ0N1c3RvbSBvYmplY3Qgc3VwcG9ydCB3aGVuIHBhcnNpbmcgYSBZQU1MIGZpbGUgaGFzIGJlZW4gZGlzYWJsZWQuJ1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJzAnXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAnMHgnIGlzIHNjYWxhclswLi4uMl1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gVXRpbHMuaGV4RGVjIHNjYWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBVdGlscy5pc0RpZ2l0cyBzY2FsYXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gVXRpbHMub2N0RGVjIHNjYWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBVdGlscy5pc051bWVyaWMgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNjYWxhclxuICAgICAgICAgICAgICAgICAgICB3aGVuICcrJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgVXRpbHMuaXNEaWdpdHMgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmF3ID0gc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzdCA9IHBhcnNlSW50KHJhdylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiByYXcgaXMgJycrY2FzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJhd1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBVdGlscy5pc051bWVyaWMgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAjZWxzZSBpZiBAUEFUVEVSTl9USE9VU0FORF9OVU1FUklDX1NDQUxBUi50ZXN0IHNjYWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgIyAgICByZXR1cm4gcGFyc2VGbG9hdChzY2FsYXIucmVwbGFjZSgnLCcsICcnKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzY2FsYXJcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnLSdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIFV0aWxzLmlzRGlnaXRzKHNjYWxhclsxLi5dKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICcwJyBpcyBzY2FsYXIuY2hhckF0KDEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAtVXRpbHMub2N0RGVjKHNjYWxhclsxLi5dKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmF3ID0gc2NhbGFyWzEuLl1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzdCA9IHBhcnNlSW50KHJhdylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgcmF3IGlzICcnK2Nhc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAtY2FzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gLXJhd1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBVdGlscy5pc051bWVyaWMgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAjZWxzZSBpZiBAUEFUVEVSTl9USE9VU0FORF9OVU1FUklDX1NDQUxBUi50ZXN0IHNjYWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgIyAgICByZXR1cm4gcGFyc2VGbG9hdChzY2FsYXIucmVwbGFjZSgnLCcsICcnKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzY2FsYXJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgVXRpbHMuaXNOdW1lcmljKHNjYWxhcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdCBzY2FsYXJcbiAgICAgICAgICAgICAgICAgICAgICAgICNlbHNlIGlmIEBQQVRURVJOX1RIT1VTQU5EX05VTUVSSUNfU0NBTEFSLnRlc3Qgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAjICAgIHJldHVybiBwYXJzZUZsb2F0KHNjYWxhci5yZXBsYWNlKCcsJywgJycpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNjYWxhclxuXG5tb2R1bGUuZXhwb3J0cyA9IElubGluZVxuIiwiXG5JbmxpbmUgICAgICAgICAgPSByZXF1aXJlICcuL0lubGluZSdcblBhdHRlcm4gICAgICAgICA9IHJlcXVpcmUgJy4vUGF0dGVybidcblV0aWxzICAgICAgICAgICA9IHJlcXVpcmUgJy4vVXRpbHMnXG5QYXJzZUV4Y2VwdGlvbiAgPSByZXF1aXJlICcuL0V4Y2VwdGlvbi9QYXJzZUV4Y2VwdGlvbidcblxuIyBQYXJzZXIgcGFyc2VzIFlBTUwgc3RyaW5ncyB0byBjb252ZXJ0IHRoZW0gdG8gSmF2YVNjcmlwdCBvYmplY3RzLlxuI1xuY2xhc3MgUGFyc2VyXG5cbiAgICAjIFByZS1jb21waWxlZCBwYXR0ZXJuc1xuICAgICNcbiAgICBQQVRURVJOX0ZPTERFRF9TQ0FMQVJfQUxMOiAgICAgICAgICAgICAgbmV3IFBhdHRlcm4gJ14oPzooPzx0eXBlPiFbXlxcXFx8Pl0qKVxcXFxzKyk/KD88c2VwYXJhdG9yPlxcXFx8fD4pKD88bW9kaWZpZXJzPlxcXFwrfFxcXFwtfFxcXFxkK3xcXFxcK1xcXFxkK3xcXFxcLVxcXFxkK3xcXFxcZCtcXFxcK3xcXFxcZCtcXFxcLSk/KD88Y29tbWVudHM+ICsjLiopPyQnXG4gICAgUEFUVEVSTl9GT0xERURfU0NBTEFSX0VORDogICAgICAgICAgICAgIG5ldyBQYXR0ZXJuICcoPzxzZXBhcmF0b3I+XFxcXHx8PikoPzxtb2RpZmllcnM+XFxcXCt8XFxcXC18XFxcXGQrfFxcXFwrXFxcXGQrfFxcXFwtXFxcXGQrfFxcXFxkK1xcXFwrfFxcXFxkK1xcXFwtKT8oPzxjb21tZW50cz4gKyMuKik/JCdcbiAgICBQQVRURVJOX1NFUVVFTkNFX0lURU06ICAgICAgICAgICAgICAgICAgbmV3IFBhdHRlcm4gJ15cXFxcLSgoPzxsZWFkc3BhY2VzPlxcXFxzKykoPzx2YWx1ZT4uKz8pKT9cXFxccyokJ1xuICAgIFBBVFRFUk5fQU5DSE9SX1ZBTFVFOiAgICAgICAgICAgICAgICAgICBuZXcgUGF0dGVybiAnXiYoPzxyZWY+W14gXSspICooPzx2YWx1ZT4uKiknXG4gICAgUEFUVEVSTl9DT01QQUNUX05PVEFUSU9OOiAgICAgICAgICAgICAgIG5ldyBQYXR0ZXJuICdeKD88a2V5PicrSW5saW5lLlJFR0VYX1FVT1RFRF9TVFJJTkcrJ3xbXiBcXCdcIlxcXFx7XFxcXFtdLio/KSAqXFxcXDooXFxcXHMrKD88dmFsdWU+Lis/KSk/XFxcXHMqJCdcbiAgICBQQVRURVJOX01BUFBJTkdfSVRFTTogICAgICAgICAgICAgICAgICAgbmV3IFBhdHRlcm4gJ14oPzxrZXk+JytJbmxpbmUuUkVHRVhfUVVPVEVEX1NUUklORysnfFteIFxcJ1wiXFxcXFtcXFxce10uKj8pICpcXFxcOihcXFxccysoPzx2YWx1ZT4uKz8pKT9cXFxccyokJ1xuICAgIFBBVFRFUk5fREVDSU1BTDogICAgICAgICAgICAgICAgICAgICAgICBuZXcgUGF0dGVybiAnXFxcXGQrJ1xuICAgIFBBVFRFUk5fSU5ERU5UX1NQQUNFUzogICAgICAgICAgICAgICAgICBuZXcgUGF0dGVybiAnXiArJ1xuICAgIFBBVFRFUk5fVFJBSUxJTkdfTElORVM6ICAgICAgICAgICAgICAgICBuZXcgUGF0dGVybiAnKFxcbiopJCdcbiAgICBQQVRURVJOX1lBTUxfSEVBREVSOiAgICAgICAgICAgICAgICAgICAgbmV3IFBhdHRlcm4gJ15cXFxcJVlBTUxbOiBdW1xcXFxkXFxcXC5dKy4qXFxuJ1xuICAgIFBBVFRFUk5fTEVBRElOR19DT01NRU5UUzogICAgICAgICAgICAgICBuZXcgUGF0dGVybiAnXihcXFxcIy4qP1xcbikrJ1xuICAgIFBBVFRFUk5fRE9DVU1FTlRfTUFSS0VSX1NUQVJUOiAgICAgICAgICBuZXcgUGF0dGVybiAnXlxcXFwtXFxcXC1cXFxcLS4qP1xcbidcbiAgICBQQVRURVJOX0RPQ1VNRU5UX01BUktFUl9FTkQ6ICAgICAgICAgICAgbmV3IFBhdHRlcm4gJ15cXFxcLlxcXFwuXFxcXC5cXFxccyokJ1xuICAgIFBBVFRFUk5fRk9MREVEX1NDQUxBUl9CWV9JTkRFTlRBVElPTjogICB7fVxuXG4gICAgIyBDb250ZXh0IHR5cGVzXG4gICAgI1xuICAgIENPTlRFWFRfTk9ORTogICAgICAgMFxuICAgIENPTlRFWFRfU0VRVUVOQ0U6ICAgMVxuICAgIENPTlRFWFRfTUFQUElORzogICAgMlxuXG5cbiAgICAjIENvbnN0cnVjdG9yXG4gICAgI1xuICAgICMgQHBhcmFtIFtJbnRlZ2VyXSAgb2Zmc2V0ICBUaGUgb2Zmc2V0IG9mIFlBTUwgZG9jdW1lbnQgKHVzZWQgZm9yIGxpbmUgbnVtYmVycyBpbiBlcnJvciBtZXNzYWdlcylcbiAgICAjXG4gICAgY29uc3RydWN0b3I6IChAb2Zmc2V0ID0gMCkgLT5cbiAgICAgICAgQGxpbmVzICAgICAgICAgID0gW11cbiAgICAgICAgQGN1cnJlbnRMaW5lTmIgID0gLTFcbiAgICAgICAgQGN1cnJlbnRMaW5lICAgID0gJydcbiAgICAgICAgQHJlZnMgICAgICAgICAgID0ge31cblxuXG4gICAgIyBQYXJzZXMgYSBZQU1MIHN0cmluZyB0byBhIEphdmFTY3JpcHQgdmFsdWUuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgdmFsdWUgICAgICAgICAgICAgICAgICAgQSBZQU1MIHN0cmluZ1xuICAgICMgQHBhcmFtIFtCb29sZWFuXSAgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSAgdHJ1ZSBpZiBhbiBleGNlcHRpb24gbXVzdCBiZSB0aHJvd24gb24gaW52YWxpZCB0eXBlcyAoYSBKYXZhU2NyaXB0IHJlc291cmNlIG9yIG9iamVjdCksIGZhbHNlIG90aGVyd2lzZVxuICAgICMgQHBhcmFtIFtGdW5jdGlvbl0gb2JqZWN0RGVjb2RlciAgICAgICAgICAgQSBmdW5jdGlvbiB0byBkZXNlcmlhbGl6ZSBjdXN0b20gb2JqZWN0cywgbnVsbCBvdGhlcndpc2VcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtPYmplY3RdICBBIEphdmFTY3JpcHQgdmFsdWVcbiAgICAjXG4gICAgIyBAdGhyb3cgW1BhcnNlRXhjZXB0aW9uXSBJZiB0aGUgWUFNTCBpcyBub3QgdmFsaWRcbiAgICAjXG4gICAgcGFyc2U6ICh2YWx1ZSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSA9IGZhbHNlLCBvYmplY3REZWNvZGVyID0gbnVsbCkgLT5cbiAgICAgICAgQGN1cnJlbnRMaW5lTmIgPSAtMVxuICAgICAgICBAY3VycmVudExpbmUgPSAnJ1xuICAgICAgICBAbGluZXMgPSBAY2xlYW51cCh2YWx1ZSkuc3BsaXQgXCJcXG5cIlxuXG4gICAgICAgIGRhdGEgPSBudWxsXG4gICAgICAgIGNvbnRleHQgPSBAQ09OVEVYVF9OT05FXG4gICAgICAgIGFsbG93T3ZlcndyaXRlID0gZmFsc2VcbiAgICAgICAgd2hpbGUgQG1vdmVUb05leHRMaW5lKClcbiAgICAgICAgICAgIGlmIEBpc0N1cnJlbnRMaW5lRW1wdHkoKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgICMgVGFiP1xuICAgICAgICAgICAgaWYgXCJcXHRcIiBpcyBAY3VycmVudExpbmVbMF1cbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24gJ0EgWUFNTCBmaWxlIGNhbm5vdCBjb250YWluIHRhYnMgYXMgaW5kZW50YXRpb24uJywgQGdldFJlYWxDdXJyZW50TGluZU5iKCkgKyAxLCBAY3VycmVudExpbmVcblxuICAgICAgICAgICAgaXNSZWYgPSBtZXJnZU5vZGUgPSBmYWxzZVxuICAgICAgICAgICAgaWYgdmFsdWVzID0gQFBBVFRFUk5fU0VRVUVOQ0VfSVRFTS5leGVjIEBjdXJyZW50TGluZVxuICAgICAgICAgICAgICAgIGlmIEBDT05URVhUX01BUFBJTkcgaXMgY29udGV4dFxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24gJ1lvdSBjYW5ub3QgZGVmaW5lIGEgc2VxdWVuY2UgaXRlbSB3aGVuIGluIGEgbWFwcGluZydcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0gQENPTlRFWFRfU0VRVUVOQ0VcbiAgICAgICAgICAgICAgICBkYXRhID89IFtdXG5cbiAgICAgICAgICAgICAgICBpZiB2YWx1ZXMudmFsdWU/IGFuZCBtYXRjaGVzID0gQFBBVFRFUk5fQU5DSE9SX1ZBTFVFLmV4ZWMgdmFsdWVzLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGlzUmVmID0gbWF0Y2hlcy5yZWZcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzLnZhbHVlID0gbWF0Y2hlcy52YWx1ZVxuXG4gICAgICAgICAgICAgICAgIyBBcnJheVxuICAgICAgICAgICAgICAgIGlmIG5vdCh2YWx1ZXMudmFsdWU/KSBvciAnJyBpcyBVdGlscy50cmltKHZhbHVlcy52YWx1ZSwgJyAnKSBvciBVdGlscy5sdHJpbSh2YWx1ZXMudmFsdWUsICcgJykuaW5kZXhPZignIycpIGlzIDBcbiAgICAgICAgICAgICAgICAgICAgaWYgQGN1cnJlbnRMaW5lTmIgPCBAbGluZXMubGVuZ3RoIC0gMSBhbmQgbm90IEBpc05leHRMaW5lVW5JbmRlbnRlZENvbGxlY3Rpb24oKVxuICAgICAgICAgICAgICAgICAgICAgICAgYyA9IEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMVxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VyID0gbmV3IFBhcnNlciBjXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZXIucmVmcyA9IEByZWZzXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2ggcGFyc2VyLnBhcnNlKEBnZXROZXh0RW1iZWRCbG9jayhudWxsLCB0cnVlKSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlcilcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoIG51bGxcblxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaWYgdmFsdWVzLmxlYWRzcGFjZXM/Lmxlbmd0aCBhbmQgbWF0Y2hlcyA9IEBQQVRURVJOX0NPTVBBQ1RfTk9UQVRJT04uZXhlYyB2YWx1ZXMudmFsdWVcblxuICAgICAgICAgICAgICAgICAgICAgICAgIyBUaGlzIGlzIGEgY29tcGFjdCBub3RhdGlvbiBlbGVtZW50LCBhZGQgdG8gbmV4dCBibG9jayBhbmQgcGFyc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgPSBAZ2V0UmVhbEN1cnJlbnRMaW5lTmIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VyID0gbmV3IFBhcnNlciBjXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZXIucmVmcyA9IEByZWZzXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrID0gdmFsdWVzLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRlbnQgPSBAZ2V0Q3VycmVudExpbmVJbmRlbnRhdGlvbigpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBAaXNOZXh0TGluZUluZGVudGVkKGZhbHNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrICs9IFwiXFxuXCIrQGdldE5leHRFbWJlZEJsb2NrKGluZGVudCArIHZhbHVlcy5sZWFkc3BhY2VzLmxlbmd0aCArIDEsIHRydWUpXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaCBwYXJzZXIucGFyc2UgYmxvY2ssIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXJcblxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2ggQHBhcnNlVmFsdWUgdmFsdWVzLnZhbHVlLCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyXG5cbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbHVlcyA9IEBQQVRURVJOX01BUFBJTkdfSVRFTS5leGVjIEBjdXJyZW50TGluZSkgYW5kIHZhbHVlcy5rZXkuaW5kZXhPZignICMnKSBpcyAtMVxuICAgICAgICAgICAgICAgIGlmIEBDT05URVhUX1NFUVVFTkNFIGlzIGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdZb3UgY2Fubm90IGRlZmluZSBhIG1hcHBpbmcgaXRlbSB3aGVuIGluIGEgc2VxdWVuY2UnXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IEBDT05URVhUX01BUFBJTkdcbiAgICAgICAgICAgICAgICBkYXRhID89IHt9XG5cbiAgICAgICAgICAgICAgICAjIEZvcmNlIGNvcnJlY3Qgc2V0dGluZ3NcbiAgICAgICAgICAgICAgICBJbmxpbmUuY29uZmlndXJlIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXJcbiAgICAgICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICAgICAga2V5ID0gSW5saW5lLnBhcnNlU2NhbGFyIHZhbHVlcy5rZXlcbiAgICAgICAgICAgICAgICBjYXRjaCBlXG4gICAgICAgICAgICAgICAgICAgIGUucGFyc2VkTGluZSA9IEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMVxuICAgICAgICAgICAgICAgICAgICBlLnNuaXBwZXQgPSBAY3VycmVudExpbmVcblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlXG5cbiAgICAgICAgICAgICAgICBpZiAnPDwnIGlzIGtleVxuICAgICAgICAgICAgICAgICAgICBtZXJnZU5vZGUgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIGFsbG93T3ZlcndyaXRlID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBpZiB2YWx1ZXMudmFsdWU/LmluZGV4T2YoJyonKSBpcyAwXG4gICAgICAgICAgICAgICAgICAgICAgICByZWZOYW1lID0gdmFsdWVzLnZhbHVlWzEuLl1cbiAgICAgICAgICAgICAgICAgICAgICAgIHVubGVzcyBAcmVmc1tyZWZOYW1lXT9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24gJ1JlZmVyZW5jZSBcIicrcmVmTmFtZSsnXCIgZG9lcyBub3QgZXhpc3QuJywgQGdldFJlYWxDdXJyZW50TGluZU5iKCkgKyAxLCBAY3VycmVudExpbmVcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmVmFsdWUgPSBAcmVmc1tyZWZOYW1lXVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiB0eXBlb2YgcmVmVmFsdWUgaXNudCAnb2JqZWN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnWUFNTCBtZXJnZSBrZXlzIHVzZWQgd2l0aCBhIHNjYWxhciB2YWx1ZSBpbnN0ZWFkIG9mIGFuIG9iamVjdC4nLCBAZ2V0UmVhbEN1cnJlbnRMaW5lTmIoKSArIDEsIEBjdXJyZW50TGluZVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiByZWZWYWx1ZSBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBNZXJnZSBhcnJheSB3aXRoIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciB2YWx1ZSwgaSBpbiByZWZWYWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhWycnK2ldID89IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBNZXJnZSBvYmplY3RzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGtleSwgdmFsdWUgb2YgcmVmVmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtrZXldID89IHZhbHVlXG5cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgdmFsdWVzLnZhbHVlIGlzbnQgJydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlcy52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gQGdldE5leHRFbWJlZEJsb2NrKClcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgYyA9IEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMVxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VyID0gbmV3IFBhcnNlciBjXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZXIucmVmcyA9IEByZWZzXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZWQgPSBwYXJzZXIucGFyc2UgdmFsdWUsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGVcblxuICAgICAgICAgICAgICAgICAgICAgICAgdW5sZXNzIHR5cGVvZiBwYXJzZWQgaXMgJ29iamVjdCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24gJ1lBTUwgbWVyZ2Uga2V5cyB1c2VkIHdpdGggYSBzY2FsYXIgdmFsdWUgaW5zdGVhZCBvZiBhbiBvYmplY3QuJywgQGdldFJlYWxDdXJyZW50TGluZU5iKCkgKyAxLCBAY3VycmVudExpbmVcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgcGFyc2VkIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIElmIHRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhlIG1lcmdlIGtleSBpcyBhIHNlcXVlbmNlLCB0aGVuIHRoaXMgc2VxdWVuY2UgaXMgZXhwZWN0ZWQgdG8gY29udGFpbiBtYXBwaW5nIG5vZGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBhbmQgZWFjaCBvZiB0aGVzZSBub2RlcyBpcyBtZXJnZWQgaW4gdHVybiBhY2NvcmRpbmcgdG8gaXRzIG9yZGVyIGluIHRoZSBzZXF1ZW5jZS4gS2V5cyBpbiBtYXBwaW5nIG5vZGVzIGVhcmxpZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIGluIHRoZSBzZXF1ZW5jZSBvdmVycmlkZSBrZXlzIHNwZWNpZmllZCBpbiBsYXRlciBtYXBwaW5nIG5vZGVzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBwYXJzZWRJdGVtIGluIHBhcnNlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmxlc3MgdHlwZW9mIHBhcnNlZEl0ZW0gaXMgJ29iamVjdCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnTWVyZ2UgaXRlbXMgbXVzdCBiZSBvYmplY3RzLicsIEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMSwgcGFyc2VkSXRlbVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHBhcnNlZEl0ZW0gaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBNZXJnZSBhcnJheSB3aXRoIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIHZhbHVlLCBpIGluIHBhcnNlZEl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhWycnK2ldID89IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgTWVyZ2Ugb2JqZWN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGtleSwgdmFsdWUgb2YgcGFyc2VkSXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFba2V5XSA/PSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgSWYgdGhlIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCB0aGUga2V5IGlzIGEgc2luZ2xlIG1hcHBpbmcgbm9kZSwgZWFjaCBvZiBpdHMga2V5L3ZhbHVlIHBhaXJzIGlzIGluc2VydGVkIGludG8gdGhlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBjdXJyZW50IG1hcHBpbmcsIHVubGVzcyB0aGUga2V5IGFscmVhZHkgZXhpc3RzIGluIGl0LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBrZXksIHZhbHVlIG9mIHBhcnNlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2tleV0gPz0gdmFsdWVcblxuICAgICAgICAgICAgICAgIGVsc2UgaWYgdmFsdWVzLnZhbHVlPyBhbmQgbWF0Y2hlcyA9IEBQQVRURVJOX0FOQ0hPUl9WQUxVRS5leGVjIHZhbHVlcy52YWx1ZVxuICAgICAgICAgICAgICAgICAgICBpc1JlZiA9IG1hdGNoZXMucmVmXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlcy52YWx1ZSA9IG1hdGNoZXMudmFsdWVcbiAgICAgICAgICAgICAgICBcblxuICAgICAgICAgICAgICAgIGlmIG1lcmdlTm9kZVxuICAgICAgICAgICAgICAgICAgICAjIE1lcmdlIGtleXNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIG5vdCh2YWx1ZXMudmFsdWU/KSBvciAnJyBpcyBVdGlscy50cmltKHZhbHVlcy52YWx1ZSwgJyAnKSBvciBVdGlscy5sdHJpbSh2YWx1ZXMudmFsdWUsICcgJykuaW5kZXhPZignIycpIGlzIDBcbiAgICAgICAgICAgICAgICAgICAgIyBIYXNoXG4gICAgICAgICAgICAgICAgICAgICMgaWYgbmV4dCBsaW5lIGlzIGxlc3MgaW5kZW50ZWQgb3IgZXF1YWwsIHRoZW4gaXQgbWVhbnMgdGhhdCB0aGUgY3VycmVudCB2YWx1ZSBpcyBudWxsXG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdChAaXNOZXh0TGluZUluZGVudGVkKCkpIGFuZCBub3QoQGlzTmV4dExpbmVVbkluZGVudGVkQ29sbGVjdGlvbigpKVxuICAgICAgICAgICAgICAgICAgICAgICAgIyBTcGVjOiBLZXlzIE1VU1QgYmUgdW5pcXVlOyBmaXJzdCBvbmUgd2lucy5cbiAgICAgICAgICAgICAgICAgICAgICAgICMgQnV0IG92ZXJ3cml0aW5nIGlzIGFsbG93ZWQgd2hlbiBhIG1lcmdlIG5vZGUgaXMgdXNlZCBpbiBjdXJyZW50IGJsb2NrLlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgYWxsb3dPdmVyd3JpdGUgb3IgZGF0YVtrZXldIGlzIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFba2V5XSA9IG51bGxcblxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjID0gQGdldFJlYWxDdXJyZW50TGluZU5iKCkgKyAxXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZXIgPSBuZXcgUGFyc2VyIGNcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlci5yZWZzID0gQHJlZnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbCA9IHBhcnNlci5wYXJzZSBAZ2V0TmV4dEVtYmVkQmxvY2soKSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlclxuXG4gICAgICAgICAgICAgICAgICAgICAgICAjIFNwZWM6IEtleXMgTVVTVCBiZSB1bmlxdWU7IGZpcnN0IG9uZSB3aW5zLlxuICAgICAgICAgICAgICAgICAgICAgICAgIyBCdXQgb3ZlcndyaXRpbmcgaXMgYWxsb3dlZCB3aGVuIGEgbWVyZ2Ugbm9kZSBpcyB1c2VkIGluIGN1cnJlbnQgYmxvY2suXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBhbGxvd092ZXJ3cml0ZSBvciBkYXRhW2tleV0gaXMgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtrZXldID0gdmFsXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdmFsID0gQHBhcnNlVmFsdWUgdmFsdWVzLnZhbHVlLCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyXG5cbiAgICAgICAgICAgICAgICAgICAgIyBTcGVjOiBLZXlzIE1VU1QgYmUgdW5pcXVlOyBmaXJzdCBvbmUgd2lucy5cbiAgICAgICAgICAgICAgICAgICAgIyBCdXQgb3ZlcndyaXRpbmcgaXMgYWxsb3dlZCB3aGVuIGEgbWVyZ2Ugbm9kZSBpcyB1c2VkIGluIGN1cnJlbnQgYmxvY2suXG4gICAgICAgICAgICAgICAgICAgIGlmIGFsbG93T3ZlcndyaXRlIG9yIGRhdGFba2V5XSBpcyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFba2V5XSA9IHZhbFxuXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgIyAxLWxpbmVyIG9wdGlvbmFsbHkgZm9sbG93ZWQgYnkgbmV3bGluZVxuICAgICAgICAgICAgICAgIGxpbmVDb3VudCA9IEBsaW5lcy5sZW5ndGhcbiAgICAgICAgICAgICAgICBpZiAxIGlzIGxpbmVDb3VudCBvciAoMiBpcyBsaW5lQ291bnQgYW5kIFV0aWxzLmlzRW1wdHkoQGxpbmVzWzFdKSlcbiAgICAgICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IElubGluZS5wYXJzZSBAbGluZXNbMF0sIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXJcbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgICAgICAgICAgICAgZS5wYXJzZWRMaW5lID0gQGdldFJlYWxDdXJyZW50TGluZU5iKCkgKyAxXG4gICAgICAgICAgICAgICAgICAgICAgICBlLnNuaXBwZXQgPSBAY3VycmVudExpbmVcblxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIHR5cGVvZiB2YWx1ZSBpcyAnb2JqZWN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgdmFsdWUgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0ID0gdmFsdWVbMF1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3Iga2V5IG9mIHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0ID0gdmFsdWVba2V5XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiB0eXBlb2YgZmlyc3QgaXMgJ3N0cmluZycgYW5kIGZpcnN0LmluZGV4T2YoJyonKSBpcyAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YSA9IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGFsaWFzIGluIHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaCBAcmVmc1thbGlhc1sxLi5dXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gZGF0YVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZVxuXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBVdGlscy5sdHJpbSh2YWx1ZSkuY2hhckF0KDApIGluIFsnWycsICd7J11cbiAgICAgICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gSW5saW5lLnBhcnNlIHZhbHVlLCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyXG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGUucGFyc2VkTGluZSA9IEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMVxuICAgICAgICAgICAgICAgICAgICAgICAgZS5zbmlwcGV0ID0gQGN1cnJlbnRMaW5lXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVcblxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnVW5hYmxlIHRvIHBhcnNlLicsIEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMSwgQGN1cnJlbnRMaW5lXG5cbiAgICAgICAgICAgIGlmIGlzUmVmXG4gICAgICAgICAgICAgICAgaWYgZGF0YSBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICAgICAgICAgIEByZWZzW2lzUmVmXSA9IGRhdGFbZGF0YS5sZW5ndGgtMV1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGxhc3RLZXkgPSBudWxsXG4gICAgICAgICAgICAgICAgICAgIGZvciBrZXkgb2YgZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdEtleSA9IGtleVxuICAgICAgICAgICAgICAgICAgICBAcmVmc1tpc1JlZl0gPSBkYXRhW2xhc3RLZXldXG5cblxuICAgICAgICBpZiBVdGlscy5pc0VtcHR5KGRhdGEpXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gZGF0YVxuXG5cbiAgICBcbiAgICAjIFJldHVybnMgdGhlIGN1cnJlbnQgbGluZSBudW1iZXIgKHRha2VzIHRoZSBvZmZzZXQgaW50byBhY2NvdW50KS5cbiAgICAjXG4gICAgIyBAcmV0dXJuIFtJbnRlZ2VyXSAgICAgVGhlIGN1cnJlbnQgbGluZSBudW1iZXJcbiAgICAjXG4gICAgZ2V0UmVhbEN1cnJlbnRMaW5lTmI6IC0+XG4gICAgICAgIHJldHVybiBAY3VycmVudExpbmVOYiArIEBvZmZzZXRcbiAgICBcblxuICAgICMgUmV0dXJucyB0aGUgY3VycmVudCBsaW5lIGluZGVudGF0aW9uLlxuICAgICNcbiAgICAjIEByZXR1cm4gW0ludGVnZXJdICAgICBUaGUgY3VycmVudCBsaW5lIGluZGVudGF0aW9uXG4gICAgI1xuICAgIGdldEN1cnJlbnRMaW5lSW5kZW50YXRpb246IC0+XG4gICAgICAgIHJldHVybiBAY3VycmVudExpbmUubGVuZ3RoIC0gVXRpbHMubHRyaW0oQGN1cnJlbnRMaW5lLCAnICcpLmxlbmd0aFxuXG5cbiAgICAjIFJldHVybnMgdGhlIG5leHQgZW1iZWQgYmxvY2sgb2YgWUFNTC5cbiAgICAjXG4gICAgIyBAcGFyYW0gW0ludGVnZXJdICAgICAgICAgIGluZGVudGF0aW9uIFRoZSBpbmRlbnQgbGV2ZWwgYXQgd2hpY2ggdGhlIGJsb2NrIGlzIHRvIGJlIHJlYWQsIG9yIG51bGwgZm9yIGRlZmF1bHRcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddICAgICAgICAgIEEgWUFNTCBzdHJpbmdcbiAgICAjXG4gICAgIyBAdGhyb3cgW1BhcnNlRXhjZXB0aW9uXSAgIFdoZW4gaW5kZW50YXRpb24gcHJvYmxlbSBhcmUgZGV0ZWN0ZWRcbiAgICAjXG4gICAgZ2V0TmV4dEVtYmVkQmxvY2s6IChpbmRlbnRhdGlvbiA9IG51bGwsIGluY2x1ZGVVbmluZGVudGVkQ29sbGVjdGlvbiA9IGZhbHNlKSAtPlxuICAgICAgICBAbW92ZVRvTmV4dExpbmUoKVxuXG4gICAgICAgIGlmIG5vdCBpbmRlbnRhdGlvbj9cbiAgICAgICAgICAgIG5ld0luZGVudCA9IEBnZXRDdXJyZW50TGluZUluZGVudGF0aW9uKClcblxuICAgICAgICAgICAgdW5pbmRlbnRlZEVtYmVkQmxvY2sgPSBAaXNTdHJpbmdVbkluZGVudGVkQ29sbGVjdGlvbkl0ZW0gQGN1cnJlbnRMaW5lXG5cbiAgICAgICAgICAgIGlmIG5vdChAaXNDdXJyZW50TGluZUVtcHR5KCkpIGFuZCAwIGlzIG5ld0luZGVudCBhbmQgbm90KHVuaW5kZW50ZWRFbWJlZEJsb2NrKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnSW5kZW50YXRpb24gcHJvYmxlbS4nLCBAZ2V0UmVhbEN1cnJlbnRMaW5lTmIoKSArIDEsIEBjdXJyZW50TGluZVxuICAgICAgICAgICAgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG5ld0luZGVudCA9IGluZGVudGF0aW9uXG5cblxuICAgICAgICBkYXRhID0gW0BjdXJyZW50TGluZVtuZXdJbmRlbnQuLl1dXG5cbiAgICAgICAgdW5sZXNzIGluY2x1ZGVVbmluZGVudGVkQ29sbGVjdGlvblxuICAgICAgICAgICAgaXNJdFVuaW5kZW50ZWRDb2xsZWN0aW9uID0gQGlzU3RyaW5nVW5JbmRlbnRlZENvbGxlY3Rpb25JdGVtIEBjdXJyZW50TGluZVxuXG4gICAgICAgICMgQ29tbWVudHMgbXVzdCBub3QgYmUgcmVtb3ZlZCBpbnNpZGUgYSBzdHJpbmcgYmxvY2sgKGllLiBhZnRlciBhIGxpbmUgZW5kaW5nIHdpdGggXCJ8XCIpXG4gICAgICAgICMgVGhleSBtdXN0IG5vdCBiZSByZW1vdmVkIGluc2lkZSBhIHN1Yi1lbWJlZGRlZCBibG9jayBhcyB3ZWxsXG4gICAgICAgIHJlbW92ZUNvbW1lbnRzUGF0dGVybiA9IEBQQVRURVJOX0ZPTERFRF9TQ0FMQVJfRU5EXG4gICAgICAgIHJlbW92ZUNvbW1lbnRzID0gbm90IHJlbW92ZUNvbW1lbnRzUGF0dGVybi50ZXN0IEBjdXJyZW50TGluZVxuXG4gICAgICAgIHdoaWxlIEBtb3ZlVG9OZXh0TGluZSgpXG4gICAgICAgICAgICBpbmRlbnQgPSBAZ2V0Q3VycmVudExpbmVJbmRlbnRhdGlvbigpXG5cbiAgICAgICAgICAgIGlmIGluZGVudCBpcyBuZXdJbmRlbnRcbiAgICAgICAgICAgICAgICByZW1vdmVDb21tZW50cyA9IG5vdCByZW1vdmVDb21tZW50c1BhdHRlcm4udGVzdCBAY3VycmVudExpbmVcblxuICAgICAgICAgICAgaWYgaXNJdFVuaW5kZW50ZWRDb2xsZWN0aW9uIGFuZCBub3QgQGlzU3RyaW5nVW5JbmRlbnRlZENvbGxlY3Rpb25JdGVtKEBjdXJyZW50TGluZSkgYW5kIGluZGVudCBpcyBuZXdJbmRlbnRcbiAgICAgICAgICAgICAgICBAbW92ZVRvUHJldmlvdXNMaW5lKClcbiAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICBpZiBAaXNDdXJyZW50TGluZUJsYW5rKClcbiAgICAgICAgICAgICAgICBkYXRhLnB1c2ggQGN1cnJlbnRMaW5lW25ld0luZGVudC4uXVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIGlmIHJlbW92ZUNvbW1lbnRzIGFuZCBAaXNDdXJyZW50TGluZUNvbW1lbnQoKVxuICAgICAgICAgICAgICAgIGlmIGluZGVudCBpcyBuZXdJbmRlbnRcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgaWYgaW5kZW50ID49IG5ld0luZGVudFxuICAgICAgICAgICAgICAgIGRhdGEucHVzaCBAY3VycmVudExpbmVbbmV3SW5kZW50Li5dXG4gICAgICAgICAgICBlbHNlIGlmIDAgaXMgaW5kZW50XG4gICAgICAgICAgICAgICAgQG1vdmVUb1ByZXZpb3VzTGluZSgpXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24gJ0luZGVudGF0aW9uIHByb2JsZW0uJywgQGdldFJlYWxDdXJyZW50TGluZU5iKCkgKyAxLCBAY3VycmVudExpbmVcbiAgICAgICAgXG5cbiAgICAgICAgcmV0dXJuIGRhdGEuam9pbiBcIlxcblwiXG4gICAgXG5cbiAgICAjIE1vdmVzIHRoZSBwYXJzZXIgdG8gdGhlIG5leHQgbGluZS5cbiAgICAjXG4gICAgIyBAcmV0dXJuIFtCb29sZWFuXVxuICAgICNcbiAgICBtb3ZlVG9OZXh0TGluZTogLT5cbiAgICAgICAgaWYgQGN1cnJlbnRMaW5lTmIgPj0gQGxpbmVzLmxlbmd0aCAtIDFcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgICAgIEBjdXJyZW50TGluZSA9IEBsaW5lc1srK0BjdXJyZW50TGluZU5iXTtcblxuICAgICAgICByZXR1cm4gdHJ1ZVxuXG5cbiAgICAjIE1vdmVzIHRoZSBwYXJzZXIgdG8gdGhlIHByZXZpb3VzIGxpbmUuXG4gICAgI1xuICAgIG1vdmVUb1ByZXZpb3VzTGluZTogLT5cbiAgICAgICAgQGN1cnJlbnRMaW5lID0gQGxpbmVzWy0tQGN1cnJlbnRMaW5lTmJdXG4gICAgICAgIHJldHVyblxuXG5cbiAgICAjIFBhcnNlcyBhIFlBTUwgdmFsdWUuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgdmFsdWUgICAgICAgICAgICAgICAgICAgQSBZQU1MIHZhbHVlXG4gICAgIyBAcGFyYW0gW0Jvb2xlYW5dICBleGNlcHRpb25PbkludmFsaWRUeXBlICB0cnVlIGlmIGFuIGV4Y2VwdGlvbiBtdXN0IGJlIHRocm93biBvbiBpbnZhbGlkIHR5cGVzIGZhbHNlIG90aGVyd2lzZVxuICAgICMgQHBhcmFtIFtGdW5jdGlvbl0gb2JqZWN0RGVjb2RlciAgICAgICAgICAgQSBmdW5jdGlvbiB0byBkZXNlcmlhbGl6ZSBjdXN0b20gb2JqZWN0cywgbnVsbCBvdGhlcndpc2VcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtPYmplY3RdIEEgSmF2YVNjcmlwdCB2YWx1ZVxuICAgICNcbiAgICAjIEB0aHJvdyBbUGFyc2VFeGNlcHRpb25dIFdoZW4gcmVmZXJlbmNlIGRvZXMgbm90IGV4aXN0XG4gICAgI1xuICAgIHBhcnNlVmFsdWU6ICh2YWx1ZSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlcikgLT5cbiAgICAgICAgaWYgMCBpcyB2YWx1ZS5pbmRleE9mKCcqJylcbiAgICAgICAgICAgIHBvcyA9IHZhbHVlLmluZGV4T2YgJyMnXG4gICAgICAgICAgICBpZiBwb3MgaXNudCAtMVxuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUuc3Vic3RyKDEsIHBvcy0yKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWVbMS4uXVxuXG4gICAgICAgICAgICBpZiBAcmVmc1t2YWx1ZV0gaXMgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdSZWZlcmVuY2UgXCInK3ZhbHVlKydcIiBkb2VzIG5vdCBleGlzdC4nLCBAY3VycmVudExpbmVcblxuICAgICAgICAgICAgcmV0dXJuIEByZWZzW3ZhbHVlXVxuXG5cbiAgICAgICAgaWYgbWF0Y2hlcyA9IEBQQVRURVJOX0ZPTERFRF9TQ0FMQVJfQUxMLmV4ZWMgdmFsdWVcbiAgICAgICAgICAgIG1vZGlmaWVycyA9IG1hdGNoZXMubW9kaWZpZXJzID8gJydcblxuICAgICAgICAgICAgZm9sZGVkSW5kZW50ID0gTWF0aC5hYnMocGFyc2VJbnQobW9kaWZpZXJzKSlcbiAgICAgICAgICAgIGlmIGlzTmFOKGZvbGRlZEluZGVudCkgdGhlbiBmb2xkZWRJbmRlbnQgPSAwXG4gICAgICAgICAgICB2YWwgPSBAcGFyc2VGb2xkZWRTY2FsYXIgbWF0Y2hlcy5zZXBhcmF0b3IsIEBQQVRURVJOX0RFQ0lNQUwucmVwbGFjZShtb2RpZmllcnMsICcnKSwgZm9sZGVkSW5kZW50XG4gICAgICAgICAgICBpZiBtYXRjaGVzLnR5cGU/XG4gICAgICAgICAgICAgICAgIyBGb3JjZSBjb3JyZWN0IHNldHRpbmdzXG4gICAgICAgICAgICAgICAgSW5saW5lLmNvbmZpZ3VyZSBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyXG4gICAgICAgICAgICAgICAgcmV0dXJuIElubGluZS5wYXJzZVNjYWxhciBtYXRjaGVzLnR5cGUrJyAnK3ZhbFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiB2YWxcblxuICAgICAgICB0cnlcbiAgICAgICAgICAgIHJldHVybiBJbmxpbmUucGFyc2UgdmFsdWUsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXJcbiAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgIyBUcnkgdG8gcGFyc2UgbXVsdGlsaW5lIGNvbXBhY3Qgc2VxdWVuY2Ugb3IgbWFwcGluZ1xuICAgICAgICAgICAgaWYgdmFsdWUuY2hhckF0KDApIGluIFsnWycsICd7J10gYW5kIGUgaW5zdGFuY2VvZiBQYXJzZUV4Y2VwdGlvbiBhbmQgQGlzTmV4dExpbmVJbmRlbnRlZCgpXG4gICAgICAgICAgICAgICAgdmFsdWUgKz0gXCJcXG5cIiArIEBnZXROZXh0RW1iZWRCbG9jaygpXG4gICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBJbmxpbmUucGFyc2UgdmFsdWUsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXJcbiAgICAgICAgICAgICAgICBjYXRjaCBlXG4gICAgICAgICAgICAgICAgICAgIGUucGFyc2VkTGluZSA9IEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMVxuICAgICAgICAgICAgICAgICAgICBlLnNuaXBwZXQgPSBAY3VycmVudExpbmVcblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlXG5cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBlLnBhcnNlZExpbmUgPSBAZ2V0UmVhbEN1cnJlbnRMaW5lTmIoKSArIDFcbiAgICAgICAgICAgICAgICBlLnNuaXBwZXQgPSBAY3VycmVudExpbmVcblxuICAgICAgICAgICAgICAgIHRocm93IGVcblxuICAgICAgICByZXR1cm5cblxuXG4gICAgIyBQYXJzZXMgYSBmb2xkZWQgc2NhbGFyLlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgICAgICBzZXBhcmF0b3IgICBUaGUgc2VwYXJhdG9yIHRoYXQgd2FzIHVzZWQgdG8gYmVnaW4gdGhpcyBmb2xkZWQgc2NhbGFyICh8IG9yID4pXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICAgICAgaW5kaWNhdG9yICAgVGhlIGluZGljYXRvciB0aGF0IHdhcyB1c2VkIHRvIGJlZ2luIHRoaXMgZm9sZGVkIHNjYWxhciAoKyBvciAtKVxuICAgICMgQHBhcmFtIFtJbnRlZ2VyXSAgICAgIGluZGVudGF0aW9uIFRoZSBpbmRlbnRhdGlvbiB0aGF0IHdhcyB1c2VkIHRvIGJlZ2luIHRoaXMgZm9sZGVkIHNjYWxhclxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gICAgICBUaGUgdGV4dCB2YWx1ZVxuICAgICNcbiAgICBwYXJzZUZvbGRlZFNjYWxhcjogKHNlcGFyYXRvciwgaW5kaWNhdG9yID0gJycsIGluZGVudGF0aW9uID0gMCkgLT5cbiAgICAgICAgbm90RU9GID0gQG1vdmVUb05leHRMaW5lKClcbiAgICAgICAgaWYgbm90IG5vdEVPRlxuICAgICAgICAgICAgcmV0dXJuICcnXG5cbiAgICAgICAgaXNDdXJyZW50TGluZUJsYW5rID0gQGlzQ3VycmVudExpbmVCbGFuaygpXG4gICAgICAgIHRleHQgPSAnJ1xuXG4gICAgICAgICMgTGVhZGluZyBibGFuayBsaW5lcyBhcmUgY29uc3VtZWQgYmVmb3JlIGRldGVybWluaW5nIGluZGVudGF0aW9uXG4gICAgICAgIHdoaWxlIG5vdEVPRiBhbmQgaXNDdXJyZW50TGluZUJsYW5rXG4gICAgICAgICAgICAjIG5ld2xpbmUgb25seSBpZiBub3QgRU9GXG4gICAgICAgICAgICBpZiBub3RFT0YgPSBAbW92ZVRvTmV4dExpbmUoKVxuICAgICAgICAgICAgICAgIHRleHQgKz0gXCJcXG5cIlxuICAgICAgICAgICAgICAgIGlzQ3VycmVudExpbmVCbGFuayA9IEBpc0N1cnJlbnRMaW5lQmxhbmsoKVxuXG5cbiAgICAgICAgIyBEZXRlcm1pbmUgaW5kZW50YXRpb24gaWYgbm90IHNwZWNpZmllZFxuICAgICAgICBpZiAwIGlzIGluZGVudGF0aW9uXG4gICAgICAgICAgICBpZiBtYXRjaGVzID0gQFBBVFRFUk5fSU5ERU5UX1NQQUNFUy5leGVjIEBjdXJyZW50TGluZVxuICAgICAgICAgICAgICAgIGluZGVudGF0aW9uID0gbWF0Y2hlc1swXS5sZW5ndGhcblxuXG4gICAgICAgIGlmIGluZGVudGF0aW9uID4gMFxuICAgICAgICAgICAgcGF0dGVybiA9IEBQQVRURVJOX0ZPTERFRF9TQ0FMQVJfQllfSU5ERU5UQVRJT05baW5kZW50YXRpb25dXG4gICAgICAgICAgICB1bmxlc3MgcGF0dGVybj9cbiAgICAgICAgICAgICAgICBwYXR0ZXJuID0gbmV3IFBhdHRlcm4gJ14geycraW5kZW50YXRpb24rJ30oLiopJCdcbiAgICAgICAgICAgICAgICBQYXJzZXI6OlBBVFRFUk5fRk9MREVEX1NDQUxBUl9CWV9JTkRFTlRBVElPTltpbmRlbnRhdGlvbl0gPSBwYXR0ZXJuXG5cbiAgICAgICAgICAgIHdoaWxlIG5vdEVPRiBhbmQgKGlzQ3VycmVudExpbmVCbGFuayBvciBtYXRjaGVzID0gcGF0dGVybi5leGVjIEBjdXJyZW50TGluZSlcbiAgICAgICAgICAgICAgICBpZiBpc0N1cnJlbnRMaW5lQmxhbmtcbiAgICAgICAgICAgICAgICAgICAgdGV4dCArPSBAY3VycmVudExpbmVbaW5kZW50YXRpb24uLl1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRleHQgKz0gbWF0Y2hlc1sxXVxuXG4gICAgICAgICAgICAgICAgIyBuZXdsaW5lIG9ubHkgaWYgbm90IEVPRlxuICAgICAgICAgICAgICAgIGlmIG5vdEVPRiA9IEBtb3ZlVG9OZXh0TGluZSgpXG4gICAgICAgICAgICAgICAgICAgIHRleHQgKz0gXCJcXG5cIlxuICAgICAgICAgICAgICAgICAgICBpc0N1cnJlbnRMaW5lQmxhbmsgPSBAaXNDdXJyZW50TGluZUJsYW5rKClcblxuICAgICAgICBlbHNlIGlmIG5vdEVPRlxuICAgICAgICAgICAgdGV4dCArPSBcIlxcblwiXG5cblxuICAgICAgICBpZiBub3RFT0ZcbiAgICAgICAgICAgIEBtb3ZlVG9QcmV2aW91c0xpbmUoKVxuXG5cbiAgICAgICAgIyBSZW1vdmUgbGluZSBicmVha3Mgb2YgZWFjaCBsaW5lcyBleGNlcHQgdGhlIGVtcHR5IGFuZCBtb3JlIGluZGVudGVkIG9uZXNcbiAgICAgICAgaWYgJz4nIGlzIHNlcGFyYXRvclxuICAgICAgICAgICAgbmV3VGV4dCA9ICcnXG4gICAgICAgICAgICBmb3IgbGluZSBpbiB0ZXh0LnNwbGl0IFwiXFxuXCJcbiAgICAgICAgICAgICAgICBpZiBsaW5lLmxlbmd0aCBpcyAwIG9yIGxpbmUuY2hhckF0KDApIGlzICcgJ1xuICAgICAgICAgICAgICAgICAgICBuZXdUZXh0ICs9IGxpbmUgKyBcIlxcblwiXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBuZXdUZXh0ICs9IGxpbmUgKyAnICdcbiAgICAgICAgICAgIHRleHQgPSBuZXdUZXh0XG5cbiAgICAgICAgIyBSZW1vdmUgYW55IGV4dHJhIHNwYWNlIG9yIG5ldyBsaW5lIGFzIHdlIGFyZSBhZGRpbmcgdGhlbSBhZnRlclxuICAgICAgICB0ZXh0ID0gVXRpbHMucnRyaW0odGV4dClcblxuICAgICAgICAjIERlYWwgd2l0aCB0cmFpbGluZyBuZXdsaW5lcyBhcyBpbmRpY2F0ZWRcbiAgICAgICAgaWYgJycgaXMgaW5kaWNhdG9yXG4gICAgICAgICAgICB0ZXh0ID0gQFBBVFRFUk5fVFJBSUxJTkdfTElORVMucmVwbGFjZSB0ZXh0LCBcIlxcblwiXG4gICAgICAgIGVsc2UgaWYgJy0nIGlzIGluZGljYXRvclxuICAgICAgICAgICAgdGV4dCA9IEBQQVRURVJOX1RSQUlMSU5HX0xJTkVTLnJlcGxhY2UgdGV4dCwgJydcblxuICAgICAgICByZXR1cm4gdGV4dFxuXG5cbiAgICAjIFJldHVybnMgdHJ1ZSBpZiB0aGUgbmV4dCBsaW5lIGlzIGluZGVudGVkLlxuICAgICNcbiAgICAjIEByZXR1cm4gW0Jvb2xlYW5dICAgICBSZXR1cm5zIHRydWUgaWYgdGhlIG5leHQgbGluZSBpcyBpbmRlbnRlZCwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgI1xuICAgIGlzTmV4dExpbmVJbmRlbnRlZDogKGlnbm9yZUNvbW1lbnRzID0gdHJ1ZSkgLT5cbiAgICAgICAgY3VycmVudEluZGVudGF0aW9uID0gQGdldEN1cnJlbnRMaW5lSW5kZW50YXRpb24oKVxuICAgICAgICBFT0YgPSBub3QgQG1vdmVUb05leHRMaW5lKClcblxuICAgICAgICBpZiBpZ25vcmVDb21tZW50c1xuICAgICAgICAgICAgd2hpbGUgbm90KEVPRikgYW5kIEBpc0N1cnJlbnRMaW5lRW1wdHkoKVxuICAgICAgICAgICAgICAgIEVPRiA9IG5vdCBAbW92ZVRvTmV4dExpbmUoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB3aGlsZSBub3QoRU9GKSBhbmQgQGlzQ3VycmVudExpbmVCbGFuaygpXG4gICAgICAgICAgICAgICAgRU9GID0gbm90IEBtb3ZlVG9OZXh0TGluZSgpXG5cbiAgICAgICAgaWYgRU9GXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICAgICByZXQgPSBmYWxzZVxuICAgICAgICBpZiBAZ2V0Q3VycmVudExpbmVJbmRlbnRhdGlvbigpID4gY3VycmVudEluZGVudGF0aW9uXG4gICAgICAgICAgICByZXQgPSB0cnVlXG5cbiAgICAgICAgQG1vdmVUb1ByZXZpb3VzTGluZSgpXG5cbiAgICAgICAgcmV0dXJuIHJldFxuXG5cbiAgICAjIFJldHVybnMgdHJ1ZSBpZiB0aGUgY3VycmVudCBsaW5lIGlzIGJsYW5rIG9yIGlmIGl0IGlzIGEgY29tbWVudCBsaW5lLlxuICAgICNcbiAgICAjIEByZXR1cm4gW0Jvb2xlYW5dICAgICBSZXR1cm5zIHRydWUgaWYgdGhlIGN1cnJlbnQgbGluZSBpcyBlbXB0eSBvciBpZiBpdCBpcyBhIGNvbW1lbnQgbGluZSwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgI1xuICAgIGlzQ3VycmVudExpbmVFbXB0eTogLT5cbiAgICAgICAgdHJpbW1lZExpbmUgPSBVdGlscy50cmltKEBjdXJyZW50TGluZSwgJyAnKVxuICAgICAgICByZXR1cm4gdHJpbW1lZExpbmUubGVuZ3RoIGlzIDAgb3IgdHJpbW1lZExpbmUuY2hhckF0KDApIGlzICcjJ1xuXG5cbiAgICAjIFJldHVybnMgdHJ1ZSBpZiB0aGUgY3VycmVudCBsaW5lIGlzIGJsYW5rLlxuICAgICNcbiAgICAjIEByZXR1cm4gW0Jvb2xlYW5dICAgICBSZXR1cm5zIHRydWUgaWYgdGhlIGN1cnJlbnQgbGluZSBpcyBibGFuaywgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgI1xuICAgIGlzQ3VycmVudExpbmVCbGFuazogLT5cbiAgICAgICAgcmV0dXJuICcnIGlzIFV0aWxzLnRyaW0oQGN1cnJlbnRMaW5lLCAnICcpXG5cblxuICAgICMgUmV0dXJucyB0cnVlIGlmIHRoZSBjdXJyZW50IGxpbmUgaXMgYSBjb21tZW50IGxpbmUuXG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gICAgIFJldHVybnMgdHJ1ZSBpZiB0aGUgY3VycmVudCBsaW5lIGlzIGEgY29tbWVudCBsaW5lLCBmYWxzZSBvdGhlcndpc2VcbiAgICAjXG4gICAgaXNDdXJyZW50TGluZUNvbW1lbnQ6IC0+XG4gICAgICAgICMgQ2hlY2tpbmcgZXhwbGljaXRseSB0aGUgZmlyc3QgY2hhciBvZiB0aGUgdHJpbSBpcyBmYXN0ZXIgdGhhbiBsb29wcyBvciBzdHJwb3NcbiAgICAgICAgbHRyaW1tZWRMaW5lID0gVXRpbHMubHRyaW0oQGN1cnJlbnRMaW5lLCAnICcpXG5cbiAgICAgICAgcmV0dXJuIGx0cmltbWVkTGluZS5jaGFyQXQoMCkgaXMgJyMnXG5cblxuICAgICMgQ2xlYW51cHMgYSBZQU1MIHN0cmluZyB0byBiZSBwYXJzZWQuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgdmFsdWUgVGhlIGlucHV0IFlBTUwgc3RyaW5nXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgQSBjbGVhbmVkIHVwIFlBTUwgc3RyaW5nXG4gICAgI1xuICAgIGNsZWFudXA6ICh2YWx1ZSkgLT5cbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKFwiXFxyXFxuXCIsIFwiXFxuXCIpLnJlcGxhY2UoXCJcXHJcIiwgXCJcXG5cIilcblxuICAgICAgICAjIFN0cmlwIFlBTUwgaGVhZGVyXG4gICAgICAgIGNvdW50ID0gMFxuICAgICAgICBbdmFsdWUsIGNvdW50XSA9IEBQQVRURVJOX1lBTUxfSEVBREVSLnJlcGxhY2VBbGwgdmFsdWUsICcnXG4gICAgICAgIEBvZmZzZXQgKz0gY291bnRcblxuICAgICAgICAjIFJlbW92ZSBsZWFkaW5nIGNvbW1lbnRzXG4gICAgICAgIFt0cmltbWVkVmFsdWUsIGNvdW50XSA9IEBQQVRURVJOX0xFQURJTkdfQ09NTUVOVFMucmVwbGFjZUFsbCB2YWx1ZSwgJycsIDFcbiAgICAgICAgaWYgY291bnQgaXMgMVxuICAgICAgICAgICAgIyBJdGVtcyBoYXZlIGJlZW4gcmVtb3ZlZCwgdXBkYXRlIHRoZSBvZmZzZXRcbiAgICAgICAgICAgIEBvZmZzZXQgKz0gVXRpbHMuc3ViU3RyQ291bnQodmFsdWUsIFwiXFxuXCIpIC0gVXRpbHMuc3ViU3RyQ291bnQodHJpbW1lZFZhbHVlLCBcIlxcblwiKVxuICAgICAgICAgICAgdmFsdWUgPSB0cmltbWVkVmFsdWVcblxuICAgICAgICAjIFJlbW92ZSBzdGFydCBvZiB0aGUgZG9jdW1lbnQgbWFya2VyICgtLS0pXG4gICAgICAgIFt0cmltbWVkVmFsdWUsIGNvdW50XSA9IEBQQVRURVJOX0RPQ1VNRU5UX01BUktFUl9TVEFSVC5yZXBsYWNlQWxsIHZhbHVlLCAnJywgMVxuICAgICAgICBpZiBjb3VudCBpcyAxXG4gICAgICAgICAgICAjIEl0ZW1zIGhhdmUgYmVlbiByZW1vdmVkLCB1cGRhdGUgdGhlIG9mZnNldFxuICAgICAgICAgICAgQG9mZnNldCArPSBVdGlscy5zdWJTdHJDb3VudCh2YWx1ZSwgXCJcXG5cIikgLSBVdGlscy5zdWJTdHJDb3VudCh0cmltbWVkVmFsdWUsIFwiXFxuXCIpXG4gICAgICAgICAgICB2YWx1ZSA9IHRyaW1tZWRWYWx1ZVxuXG4gICAgICAgICAgICAjIFJlbW92ZSBlbmQgb2YgdGhlIGRvY3VtZW50IG1hcmtlciAoLi4uKVxuICAgICAgICAgICAgdmFsdWUgPSBAUEFUVEVSTl9ET0NVTUVOVF9NQVJLRVJfRU5ELnJlcGxhY2UgdmFsdWUsICcnXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdmFsdWVcblxuXG4gICAgIyBSZXR1cm5zIHRydWUgaWYgdGhlIG5leHQgbGluZSBzdGFydHMgdW5pbmRlbnRlZCBjb2xsZWN0aW9uXG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gICAgIFJldHVybnMgdHJ1ZSBpZiB0aGUgbmV4dCBsaW5lIHN0YXJ0cyB1bmluZGVudGVkIGNvbGxlY3Rpb24sIGZhbHNlIG90aGVyd2lzZVxuICAgICNcbiAgICBpc05leHRMaW5lVW5JbmRlbnRlZENvbGxlY3Rpb246IChjdXJyZW50SW5kZW50YXRpb24gPSBudWxsKSAtPlxuICAgICAgICBjdXJyZW50SW5kZW50YXRpb24gPz0gQGdldEN1cnJlbnRMaW5lSW5kZW50YXRpb24oKVxuICAgICAgICBub3RFT0YgPSBAbW92ZVRvTmV4dExpbmUoKVxuXG4gICAgICAgIHdoaWxlIG5vdEVPRiBhbmQgQGlzQ3VycmVudExpbmVFbXB0eSgpXG4gICAgICAgICAgICBub3RFT0YgPSBAbW92ZVRvTmV4dExpbmUoKVxuXG4gICAgICAgIGlmIGZhbHNlIGlzIG5vdEVPRlxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgICAgcmV0ID0gZmFsc2VcbiAgICAgICAgaWYgQGdldEN1cnJlbnRMaW5lSW5kZW50YXRpb24oKSBpcyBjdXJyZW50SW5kZW50YXRpb24gYW5kIEBpc1N0cmluZ1VuSW5kZW50ZWRDb2xsZWN0aW9uSXRlbShAY3VycmVudExpbmUpXG4gICAgICAgICAgICByZXQgPSB0cnVlXG5cbiAgICAgICAgQG1vdmVUb1ByZXZpb3VzTGluZSgpXG5cbiAgICAgICAgcmV0dXJuIHJldFxuXG5cbiAgICAjIFJldHVybnMgdHJ1ZSBpZiB0aGUgc3RyaW5nIGlzIHVuLWluZGVudGVkIGNvbGxlY3Rpb24gaXRlbVxuICAgICNcbiAgICAjIEByZXR1cm4gW0Jvb2xlYW5dICAgICBSZXR1cm5zIHRydWUgaWYgdGhlIHN0cmluZyBpcyB1bi1pbmRlbnRlZCBjb2xsZWN0aW9uIGl0ZW0sIGZhbHNlIG90aGVyd2lzZVxuICAgICNcbiAgICBpc1N0cmluZ1VuSW5kZW50ZWRDb2xsZWN0aW9uSXRlbTogLT5cbiAgICAgICAgcmV0dXJuIEBjdXJyZW50TGluZSBpcyAnLScgb3IgQGN1cnJlbnRMaW5lWzAuLi4yXSBpcyAnLSAnXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYXJzZXJcbiIsIlxuIyBQYXR0ZXJuIGlzIGEgemVyby1jb25mbGljdCB3cmFwcGVyIGV4dGVuZGluZyBSZWdFeHAgZmVhdHVyZXNcbiMgaW4gb3JkZXIgdG8gbWFrZSBZQU1MIHBhcnNpbmcgcmVnZXggbW9yZSBleHByZXNzaXZlLlxuI1xuY2xhc3MgUGF0dGVyblxuXG4gICAgIyBAcHJvcGVydHkgW1JlZ0V4cF0gVGhlIFJlZ0V4cCBpbnN0YW5jZVxuICAgIHJlZ2V4OiAgICAgICAgICBudWxsXG5cbiAgICAjIEBwcm9wZXJ0eSBbU3RyaW5nXSBUaGUgcmF3IHJlZ2V4IHN0cmluZ1xuICAgIHJhd1JlZ2V4OiAgICAgICBudWxsXG5cbiAgICAjIEBwcm9wZXJ0eSBbU3RyaW5nXSBUaGUgY2xlYW5lZCByZWdleCBzdHJpbmcgKHVzZWQgdG8gY3JlYXRlIHRoZSBSZWdFeHAgaW5zdGFuY2UpXG4gICAgY2xlYW5lZFJlZ2V4OiAgIG51bGxcblxuICAgICMgQHByb3BlcnR5IFtPYmplY3RdIFRoZSBkaWN0aW9uYXJ5IG1hcHBpbmcgbmFtZXMgdG8gY2FwdHVyaW5nIGJyYWNrZXQgbnVtYmVyc1xuICAgIG1hcHBpbmc6ICAgICAgICBudWxsXG5cbiAgICAjIENvbnN0cnVjdG9yXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddIHJhd1JlZ2V4IFRoZSByYXcgcmVnZXggc3RyaW5nIGRlZmluaW5nIHRoZSBwYXR0ZXJuXG4gICAgI1xuICAgIGNvbnN0cnVjdG9yOiAocmF3UmVnZXgsIG1vZGlmaWVycyA9ICcnKSAtPlxuICAgICAgICBjbGVhbmVkUmVnZXggPSAnJ1xuICAgICAgICBsZW4gPSByYXdSZWdleC5sZW5ndGhcbiAgICAgICAgbWFwcGluZyA9IG51bGxcblxuICAgICAgICAjIENsZWFudXAgcmF3IHJlZ2V4IGFuZCBjb21wdXRlIG1hcHBpbmdcbiAgICAgICAgY2FwdHVyaW5nQnJhY2tldE51bWJlciA9IDBcbiAgICAgICAgaSA9IDBcbiAgICAgICAgd2hpbGUgaSA8IGxlblxuICAgICAgICAgICAgY2hhciA9IHJhd1JlZ2V4LmNoYXJBdChpKVxuICAgICAgICAgICAgaWYgY2hhciBpcyAnXFxcXCdcbiAgICAgICAgICAgICAgICAjIElnbm9yZSBuZXh0IGNoYXJhY3RlclxuICAgICAgICAgICAgICAgIGNsZWFuZWRSZWdleCArPSByYXdSZWdleFtpLi5pKzFdXG4gICAgICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICBlbHNlIGlmIGNoYXIgaXMgJygnXG4gICAgICAgICAgICAgICAgIyBJbmNyZWFzZSBicmFja2V0IG51bWJlciwgb25seSBpZiBpdCBpcyBjYXB0dXJpbmdcbiAgICAgICAgICAgICAgICBpZiBpIDwgbGVuIC0gMlxuICAgICAgICAgICAgICAgICAgICBwYXJ0ID0gcmF3UmVnZXhbaS4uaSsyXVxuICAgICAgICAgICAgICAgICAgICBpZiBwYXJ0IGlzICcoPzonXG4gICAgICAgICAgICAgICAgICAgICAgICAjIE5vbi1jYXB0dXJpbmcgYnJhY2tldFxuICAgICAgICAgICAgICAgICAgICAgICAgaSArPSAyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhbmVkUmVnZXggKz0gcGFydFxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIHBhcnQgaXMgJyg/PCdcbiAgICAgICAgICAgICAgICAgICAgICAgICMgQ2FwdHVyaW5nIGJyYWNrZXQgd2l0aCBwb3NzaWJseSBhIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcHR1cmluZ0JyYWNrZXROdW1iZXIrK1xuICAgICAgICAgICAgICAgICAgICAgICAgaSArPSAyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lID0gJydcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIGkgKyAxIDwgbGVuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ViQ2hhciA9IHJhd1JlZ2V4LmNoYXJBdChpICsgMSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBzdWJDaGFyIGlzICc+J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhbmVkUmVnZXggKz0gJygnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBuYW1lLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgQXNzb2NpYXRlIGEgbmFtZSB3aXRoIGEgY2FwdHVyaW5nIGJyYWNrZXQgbnVtYmVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXBwaW5nID89IHt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXBwaW5nW25hbWVdID0gY2FwdHVyaW5nQnJhY2tldE51bWJlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSArPSBzdWJDaGFyXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpKytcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYW5lZFJlZ2V4ICs9IGNoYXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcHR1cmluZ0JyYWNrZXROdW1iZXIrK1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgY2xlYW5lZFJlZ2V4ICs9IGNoYXJcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjbGVhbmVkUmVnZXggKz0gY2hhclxuXG4gICAgICAgICAgICBpKytcblxuICAgICAgICBAcmF3UmVnZXggPSByYXdSZWdleFxuICAgICAgICBAY2xlYW5lZFJlZ2V4ID0gY2xlYW5lZFJlZ2V4XG4gICAgICAgIEByZWdleCA9IG5ldyBSZWdFeHAgQGNsZWFuZWRSZWdleCwgJ2cnK21vZGlmaWVycy5yZXBsYWNlKCdnJywgJycpXG4gICAgICAgIEBtYXBwaW5nID0gbWFwcGluZ1xuXG5cbiAgICAjIEV4ZWN1dGVzIHRoZSBwYXR0ZXJuJ3MgcmVnZXggYW5kIHJldHVybnMgdGhlIG1hdGNoaW5nIHZhbHVlc1xuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSBzdHIgVGhlIHN0cmluZyB0byB1c2UgdG8gZXhlY3V0ZSB0aGUgcGF0dGVyblxuICAgICNcbiAgICAjIEByZXR1cm4gW0FycmF5XSBUaGUgbWF0Y2hpbmcgdmFsdWVzIGV4dHJhY3RlZCBmcm9tIGNhcHR1cmluZyBicmFja2V0cyBvciBudWxsIGlmIG5vdGhpbmcgbWF0Y2hlZFxuICAgICNcbiAgICBleGVjOiAoc3RyKSAtPlxuICAgICAgICBAcmVnZXgubGFzdEluZGV4ID0gMFxuICAgICAgICBtYXRjaGVzID0gQHJlZ2V4LmV4ZWMgc3RyXG5cbiAgICAgICAgaWYgbm90IG1hdGNoZXM/XG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuXG4gICAgICAgIGlmIEBtYXBwaW5nP1xuICAgICAgICAgICAgZm9yIG5hbWUsIGluZGV4IG9mIEBtYXBwaW5nXG4gICAgICAgICAgICAgICAgbWF0Y2hlc1tuYW1lXSA9IG1hdGNoZXNbaW5kZXhdXG5cbiAgICAgICAgcmV0dXJuIG1hdGNoZXNcblxuXG4gICAgIyBUZXN0cyB0aGUgcGF0dGVybidzIHJlZ2V4XG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddIHN0ciBUaGUgc3RyaW5nIHRvIHVzZSB0byB0ZXN0IHRoZSBwYXR0ZXJuXG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gdHJ1ZSBpZiB0aGUgc3RyaW5nIG1hdGNoZWRcbiAgICAjXG4gICAgdGVzdDogKHN0cikgLT5cbiAgICAgICAgQHJlZ2V4Lmxhc3RJbmRleCA9IDBcbiAgICAgICAgcmV0dXJuIEByZWdleC50ZXN0IHN0clxuXG5cbiAgICAjIFJlcGxhY2VzIG9jY3VyZW5jZXMgbWF0Y2hpbmcgd2l0aCB0aGUgcGF0dGVybidzIHJlZ2V4IHdpdGggcmVwbGFjZW1lbnRcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gc3RyIFRoZSBzb3VyY2Ugc3RyaW5nIHRvIHBlcmZvcm0gcmVwbGFjZW1lbnRzXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gcmVwbGFjZW1lbnQgVGhlIHN0cmluZyB0byB1c2UgaW4gcGxhY2Ugb2YgZWFjaCByZXBsYWNlZCBvY2N1cmVuY2UuXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSBUaGUgcmVwbGFjZWQgc3RyaW5nXG4gICAgI1xuICAgIHJlcGxhY2U6IChzdHIsIHJlcGxhY2VtZW50KSAtPlxuICAgICAgICBAcmVnZXgubGFzdEluZGV4ID0gMFxuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UgQHJlZ2V4LCByZXBsYWNlbWVudFxuXG5cbiAgICAjIFJlcGxhY2VzIG9jY3VyZW5jZXMgbWF0Y2hpbmcgd2l0aCB0aGUgcGF0dGVybidzIHJlZ2V4IHdpdGggcmVwbGFjZW1lbnQgYW5kXG4gICAgIyBnZXQgYm90aCB0aGUgcmVwbGFjZWQgc3RyaW5nIGFuZCB0aGUgbnVtYmVyIG9mIHJlcGxhY2VkIG9jY3VyZW5jZXMgaW4gdGhlIHN0cmluZy5cbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gc3RyIFRoZSBzb3VyY2Ugc3RyaW5nIHRvIHBlcmZvcm0gcmVwbGFjZW1lbnRzXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gcmVwbGFjZW1lbnQgVGhlIHN0cmluZyB0byB1c2UgaW4gcGxhY2Ugb2YgZWFjaCByZXBsYWNlZCBvY2N1cmVuY2UuXG4gICAgIyBAcGFyYW0gW0ludGVnZXJdIGxpbWl0IFRoZSBtYXhpbXVtIG51bWJlciBvZiBvY2N1cmVuY2VzIHRvIHJlcGxhY2UgKDAgbWVhbnMgaW5maW5pdGUgbnVtYmVyIG9mIG9jY3VyZW5jZXMpXG4gICAgI1xuICAgICMgQHJldHVybiBbQXJyYXldIEEgZGVzdHJ1Y3R1cmFibGUgYXJyYXkgY29udGFpbmluZyB0aGUgcmVwbGFjZWQgc3RyaW5nIGFuZCB0aGUgbnVtYmVyIG9mIHJlcGxhY2VkIG9jY3VyZW5jZXMuIEZvciBpbnN0YW5jZTogW1wibXkgcmVwbGFjZWQgc3RyaW5nXCIsIDJdXG4gICAgI1xuICAgIHJlcGxhY2VBbGw6IChzdHIsIHJlcGxhY2VtZW50LCBsaW1pdCA9IDApIC0+XG4gICAgICAgIEByZWdleC5sYXN0SW5kZXggPSAwXG4gICAgICAgIGNvdW50ID0gMFxuICAgICAgICB3aGlsZSBAcmVnZXgudGVzdChzdHIpIGFuZCAobGltaXQgaXMgMCBvciBjb3VudCA8IGxpbWl0KVxuICAgICAgICAgICAgQHJlZ2V4Lmxhc3RJbmRleCA9IDBcbiAgICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlIEByZWdleCwgJydcbiAgICAgICAgICAgIGNvdW50KytcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBbc3RyLCBjb3VudF1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhdHRlcm5cblxuIiwiXG5VdGlscyAgID0gcmVxdWlyZSAnLi9VdGlscydcblBhdHRlcm4gPSByZXF1aXJlICcuL1BhdHRlcm4nXG5cbiMgVW5lc2NhcGVyIGVuY2Fwc3VsYXRlcyB1bmVzY2FwaW5nIHJ1bGVzIGZvciBzaW5nbGUgYW5kIGRvdWJsZS1xdW90ZWQgWUFNTCBzdHJpbmdzLlxuI1xuY2xhc3MgVW5lc2NhcGVyXG5cbiAgICAjIFJlZ2V4IGZyYWdtZW50IHRoYXQgbWF0Y2hlcyBhbiBlc2NhcGVkIGNoYXJhY3RlciBpblxuICAgICMgYSBkb3VibGUgcXVvdGVkIHN0cmluZy5cbiAgICBAUEFUVEVSTl9FU0NBUEVEX0NIQVJBQ1RFUjogICAgIG5ldyBQYXR0ZXJuICdcXFxcXFxcXChbMGFidFxcdG52ZnJlIFwiXFxcXC9cXFxcXFxcXE5fTFBdfHhbMC05YS1mQS1GXXsyfXx1WzAtOWEtZkEtRl17NH18VVswLTlhLWZBLUZdezh9KSc7XG5cblxuICAgICMgVW5lc2NhcGVzIGEgc2luZ2xlIHF1b3RlZCBzdHJpbmcuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgICAgIHZhbHVlIEEgc2luZ2xlIHF1b3RlZCBzdHJpbmcuXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgICAgIFRoZSB1bmVzY2FwZWQgc3RyaW5nLlxuICAgICNcbiAgICBAdW5lc2NhcGVTaW5nbGVRdW90ZWRTdHJpbmc6ICh2YWx1ZSkgLT5cbiAgICAgICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoJ1xcJ1xcJycsICdcXCcnKVxuXG5cbiAgICAjIFVuZXNjYXBlcyBhIGRvdWJsZSBxdW90ZWQgc3RyaW5nLlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgICAgICB2YWx1ZSBBIGRvdWJsZSBxdW90ZWQgc3RyaW5nLlxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gICAgICBUaGUgdW5lc2NhcGVkIHN0cmluZy5cbiAgICAjXG4gICAgQHVuZXNjYXBlRG91YmxlUXVvdGVkU3RyaW5nOiAodmFsdWUpIC0+XG4gICAgICAgIEBfdW5lc2NhcGVDYWxsYmFjayA/PSAoc3RyKSA9PlxuICAgICAgICAgICAgcmV0dXJuIEB1bmVzY2FwZUNoYXJhY3RlcihzdHIpXG5cbiAgICAgICAgIyBFdmFsdWF0ZSB0aGUgc3RyaW5nXG4gICAgICAgIHJldHVybiBAUEFUVEVSTl9FU0NBUEVEX0NIQVJBQ1RFUi5yZXBsYWNlIHZhbHVlLCBAX3VuZXNjYXBlQ2FsbGJhY2tcblxuXG4gICAgIyBVbmVzY2FwZXMgYSBjaGFyYWN0ZXIgdGhhdCB3YXMgZm91bmQgaW4gYSBkb3VibGUtcXVvdGVkIHN0cmluZ1xuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgICAgICB2YWx1ZSBBbiBlc2NhcGVkIGNoYXJhY3RlclxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gICAgICBUaGUgdW5lc2NhcGVkIGNoYXJhY3RlclxuICAgICNcbiAgICBAdW5lc2NhcGVDaGFyYWN0ZXI6ICh2YWx1ZSkgLT5cbiAgICAgICAgY2ggPSBTdHJpbmcuZnJvbUNoYXJDb2RlXG4gICAgICAgIHN3aXRjaCB2YWx1ZS5jaGFyQXQoMSlcbiAgICAgICAgICAgIHdoZW4gJzAnXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoKDApXG4gICAgICAgICAgICB3aGVuICdhJ1xuICAgICAgICAgICAgICAgIHJldHVybiBjaCg3KVxuICAgICAgICAgICAgd2hlbiAnYidcbiAgICAgICAgICAgICAgICByZXR1cm4gY2goOClcbiAgICAgICAgICAgIHdoZW4gJ3QnXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiXFx0XCJcbiAgICAgICAgICAgIHdoZW4gXCJcXHRcIlxuICAgICAgICAgICAgICAgIHJldHVybiBcIlxcdFwiXG4gICAgICAgICAgICB3aGVuICduJ1xuICAgICAgICAgICAgICAgIHJldHVybiBcIlxcblwiXG4gICAgICAgICAgICB3aGVuICd2J1xuICAgICAgICAgICAgICAgIHJldHVybiBjaCgxMSlcbiAgICAgICAgICAgIHdoZW4gJ2YnXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoKDEyKVxuICAgICAgICAgICAgd2hlbiAncidcbiAgICAgICAgICAgICAgICByZXR1cm4gY2goMTMpXG4gICAgICAgICAgICB3aGVuICdlJ1xuICAgICAgICAgICAgICAgIHJldHVybiBjaCgyNylcbiAgICAgICAgICAgIHdoZW4gJyAnXG4gICAgICAgICAgICAgICAgcmV0dXJuICcgJ1xuICAgICAgICAgICAgd2hlbiAnXCInXG4gICAgICAgICAgICAgICAgcmV0dXJuICdcIidcbiAgICAgICAgICAgIHdoZW4gJy8nXG4gICAgICAgICAgICAgICAgcmV0dXJuICcvJ1xuICAgICAgICAgICAgd2hlbiAnXFxcXCdcbiAgICAgICAgICAgICAgICByZXR1cm4gJ1xcXFwnXG4gICAgICAgICAgICB3aGVuICdOJ1xuICAgICAgICAgICAgICAgICMgVSswMDg1IE5FWFQgTElORVxuICAgICAgICAgICAgICAgIHJldHVybiBjaCgweDAwODUpXG4gICAgICAgICAgICB3aGVuICdfJ1xuICAgICAgICAgICAgICAgICMgVSswMEEwIE5PLUJSRUFLIFNQQUNFXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoKDB4MDBBMClcbiAgICAgICAgICAgIHdoZW4gJ0wnXG4gICAgICAgICAgICAgICAgIyBVKzIwMjggTElORSBTRVBBUkFUT1JcbiAgICAgICAgICAgICAgICByZXR1cm4gY2goMHgyMDI4KVxuICAgICAgICAgICAgd2hlbiAnUCdcbiAgICAgICAgICAgICAgICAjIFUrMjAyOSBQQVJBR1JBUEggU0VQQVJBVE9SXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoKDB4MjAyOSlcbiAgICAgICAgICAgIHdoZW4gJ3gnXG4gICAgICAgICAgICAgICAgcmV0dXJuIFV0aWxzLnV0ZjhjaHIoVXRpbHMuaGV4RGVjKHZhbHVlLnN1YnN0cigyLCAyKSkpXG4gICAgICAgICAgICB3aGVuICd1J1xuICAgICAgICAgICAgICAgIHJldHVybiBVdGlscy51dGY4Y2hyKFV0aWxzLmhleERlYyh2YWx1ZS5zdWJzdHIoMiwgNCkpKVxuICAgICAgICAgICAgd2hlbiAnVSdcbiAgICAgICAgICAgICAgICByZXR1cm4gVXRpbHMudXRmOGNocihVdGlscy5oZXhEZWModmFsdWUuc3Vic3RyKDIsIDgpKSlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gJydcblxubW9kdWxlLmV4cG9ydHMgPSBVbmVzY2FwZXJcbiIsIlxuUGF0dGVybiA9IHJlcXVpcmUgJy4vUGF0dGVybidcblxuIyBBIGJ1bmNoIG9mIHV0aWxpdHkgbWV0aG9kc1xuI1xuY2xhc3MgVXRpbHNcblxuICAgIEBSRUdFWF9MRUZUX1RSSU1fQllfQ0hBUjogICB7fVxuICAgIEBSRUdFWF9SSUdIVF9UUklNX0JZX0NIQVI6ICB7fVxuICAgIEBSRUdFWF9TUEFDRVM6ICAgICAgICAgICAgICAvXFxzKy9nXG4gICAgQFJFR0VYX0RJR0lUUzogICAgICAgICAgICAgIC9eXFxkKyQvXG4gICAgQFJFR0VYX09DVEFMOiAgICAgICAgICAgICAgIC9bXjAtN10vZ2lcbiAgICBAUkVHRVhfSEVYQURFQ0lNQUw6ICAgICAgICAgL1teYS1mMC05XS9naVxuXG4gICAgIyBQcmVjb21waWxlZCBkYXRlIHBhdHRlcm5cbiAgICBAUEFUVEVSTl9EQVRFOiAgICAgICAgICAgICAgbmV3IFBhdHRlcm4gJ14nK1xuICAgICAgICAgICAgJyg/PHllYXI+WzAtOV1bMC05XVswLTldWzAtOV0pJytcbiAgICAgICAgICAgICctKD88bW9udGg+WzAtOV1bMC05XT8pJytcbiAgICAgICAgICAgICctKD88ZGF5PlswLTldWzAtOV0/KScrXG4gICAgICAgICAgICAnKD86KD86W1R0XXxbIFxcdF0rKScrXG4gICAgICAgICAgICAnKD88aG91cj5bMC05XVswLTldPyknK1xuICAgICAgICAgICAgJzooPzxtaW51dGU+WzAtOV1bMC05XSknK1xuICAgICAgICAgICAgJzooPzxzZWNvbmQ+WzAtOV1bMC05XSknK1xuICAgICAgICAgICAgJyg/OlxcLig/PGZyYWN0aW9uPlswLTldKikpPycrXG4gICAgICAgICAgICAnKD86WyBcXHRdKig/PHR6Plp8KD88dHpfc2lnbj5bLStdKSg/PHR6X2hvdXI+WzAtOV1bMC05XT8pJytcbiAgICAgICAgICAgICcoPzo6KD88dHpfbWludXRlPlswLTldWzAtOV0pKT8pKT8pPycrXG4gICAgICAgICAgICAnJCcsICdpJ1xuXG4gICAgIyBMb2NhbCB0aW1lem9uZSBvZmZzZXQgaW4gbXNcbiAgICBATE9DQUxfVElNRVpPTkVfT0ZGU0VUOiAgICAgbmV3IERhdGUoKS5nZXRUaW1lem9uZU9mZnNldCgpICogNjAgKiAxMDAwXG5cbiAgICAjIFRyaW1zIHRoZSBnaXZlbiBzdHJpbmcgb24gYm90aCBzaWRlc1xuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSBzdHIgVGhlIHN0cmluZyB0byB0cmltXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gY2hhciBUaGUgY2hhcmFjdGVyIHRvIHVzZSBmb3IgdHJpbW1pbmcgKGRlZmF1bHQ6ICdcXFxccycpXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSBBIHRyaW1tZWQgc3RyaW5nXG4gICAgI1xuICAgIEB0cmltOiAoc3RyLCBjaGFyID0gJ1xcXFxzJykgLT5cbiAgICAgICAgcmV0dXJuIHN0ci50cmltKClcbiAgICAgICAgcmVnZXhMZWZ0ID0gQFJFR0VYX0xFRlRfVFJJTV9CWV9DSEFSW2NoYXJdXG4gICAgICAgIHVubGVzcyByZWdleExlZnQ/XG4gICAgICAgICAgICBAUkVHRVhfTEVGVF9UUklNX0JZX0NIQVJbY2hhcl0gPSByZWdleExlZnQgPSBuZXcgUmVnRXhwICdeJytjaGFyKycnK2NoYXIrJyonXG4gICAgICAgIHJlZ2V4TGVmdC5sYXN0SW5kZXggPSAwXG4gICAgICAgIHJlZ2V4UmlnaHQgPSBAUkVHRVhfUklHSFRfVFJJTV9CWV9DSEFSW2NoYXJdXG4gICAgICAgIHVubGVzcyByZWdleFJpZ2h0P1xuICAgICAgICAgICAgQFJFR0VYX1JJR0hUX1RSSU1fQllfQ0hBUltjaGFyXSA9IHJlZ2V4UmlnaHQgPSBuZXcgUmVnRXhwIGNoYXIrJycrY2hhcisnKiQnXG4gICAgICAgIHJlZ2V4UmlnaHQubGFzdEluZGV4ID0gMFxuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UocmVnZXhMZWZ0LCAnJykucmVwbGFjZShyZWdleFJpZ2h0LCAnJylcblxuXG4gICAgIyBUcmltcyB0aGUgZ2l2ZW4gc3RyaW5nIG9uIHRoZSBsZWZ0IHNpZGVcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gc3RyIFRoZSBzdHJpbmcgdG8gdHJpbVxuICAgICMgQHBhcmFtIFtTdHJpbmddIGNoYXIgVGhlIGNoYXJhY3RlciB0byB1c2UgZm9yIHRyaW1taW5nIChkZWZhdWx0OiAnXFxcXHMnKVxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gQSB0cmltbWVkIHN0cmluZ1xuICAgICNcbiAgICBAbHRyaW06IChzdHIsIGNoYXIgPSAnXFxcXHMnKSAtPlxuICAgICAgICByZWdleExlZnQgPSBAUkVHRVhfTEVGVF9UUklNX0JZX0NIQVJbY2hhcl1cbiAgICAgICAgdW5sZXNzIHJlZ2V4TGVmdD9cbiAgICAgICAgICAgIEBSRUdFWF9MRUZUX1RSSU1fQllfQ0hBUltjaGFyXSA9IHJlZ2V4TGVmdCA9IG5ldyBSZWdFeHAgJ14nK2NoYXIrJycrY2hhcisnKidcbiAgICAgICAgcmVnZXhMZWZ0Lmxhc3RJbmRleCA9IDBcbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKHJlZ2V4TGVmdCwgJycpXG5cblxuICAgICMgVHJpbXMgdGhlIGdpdmVuIHN0cmluZyBvbiB0aGUgcmlnaHQgc2lkZVxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSBzdHIgVGhlIHN0cmluZyB0byB0cmltXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gY2hhciBUaGUgY2hhcmFjdGVyIHRvIHVzZSBmb3IgdHJpbW1pbmcgKGRlZmF1bHQ6ICdcXFxccycpXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSBBIHRyaW1tZWQgc3RyaW5nXG4gICAgI1xuICAgIEBydHJpbTogKHN0ciwgY2hhciA9ICdcXFxccycpIC0+XG4gICAgICAgIHJlZ2V4UmlnaHQgPSBAUkVHRVhfUklHSFRfVFJJTV9CWV9DSEFSW2NoYXJdXG4gICAgICAgIHVubGVzcyByZWdleFJpZ2h0P1xuICAgICAgICAgICAgQFJFR0VYX1JJR0hUX1RSSU1fQllfQ0hBUltjaGFyXSA9IHJlZ2V4UmlnaHQgPSBuZXcgUmVnRXhwIGNoYXIrJycrY2hhcisnKiQnXG4gICAgICAgIHJlZ2V4UmlnaHQubGFzdEluZGV4ID0gMFxuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UocmVnZXhSaWdodCwgJycpXG5cblxuICAgICMgQ2hlY2tzIGlmIHRoZSBnaXZlbiB2YWx1ZSBpcyBlbXB0eSAobnVsbCwgdW5kZWZpbmVkLCBlbXB0eSBzdHJpbmcsIHN0cmluZyAnMCcpXG4gICAgI1xuICAgICMgQHBhcmFtIFtPYmplY3RdIHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVja1xuICAgICNcbiAgICAjIEByZXR1cm4gW0Jvb2xlYW5dIHRydWUgaWYgdGhlIHZhbHVlIGlzIGVtcHR5XG4gICAgI1xuICAgIEBpc0VtcHR5OiAodmFsdWUpIC0+XG4gICAgICAgIHJldHVybiBub3QodmFsdWUpIG9yIHZhbHVlIGlzICcnIG9yIHZhbHVlIGlzICcwJ1xuXG5cbiAgICAjIENvdW50cyB0aGUgbnVtYmVyIG9mIG9jY3VyZW5jZXMgb2Ygc3ViU3RyaW5nIGluc2lkZSBzdHJpbmdcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gc3RyaW5nIFRoZSBzdHJpbmcgd2hlcmUgdG8gY291bnQgb2NjdXJlbmNlc1xuICAgICMgQHBhcmFtIFtTdHJpbmddIHN1YlN0cmluZyBUaGUgc3ViU3RyaW5nIHRvIGNvdW50XG4gICAgIyBAcGFyYW0gW0ludGVnZXJdIHN0YXJ0IFRoZSBzdGFydCBpbmRleFxuICAgICMgQHBhcmFtIFtJbnRlZ2VyXSBsZW5ndGggVGhlIHN0cmluZyBsZW5ndGggdW50aWwgd2hlcmUgdG8gY291bnRcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtJbnRlZ2VyXSBUaGUgbnVtYmVyIG9mIG9jY3VyZW5jZXNcbiAgICAjXG4gICAgQHN1YlN0ckNvdW50OiAoc3RyaW5nLCBzdWJTdHJpbmcsIHN0YXJ0LCBsZW5ndGgpIC0+XG4gICAgICAgIGMgPSAwXG4gICAgICAgIFxuICAgICAgICBzdHJpbmcgPSAnJyArIHN0cmluZ1xuICAgICAgICBzdWJTdHJpbmcgPSAnJyArIHN1YlN0cmluZ1xuICAgICAgICBcbiAgICAgICAgaWYgc3RhcnQ/XG4gICAgICAgICAgICBzdHJpbmcgPSBzdHJpbmdbc3RhcnQuLl1cbiAgICAgICAgaWYgbGVuZ3RoP1xuICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nWzAuLi5sZW5ndGhdXG4gICAgICAgIFxuICAgICAgICBsZW4gPSBzdHJpbmcubGVuZ3RoXG4gICAgICAgIHN1YmxlbiA9IHN1YlN0cmluZy5sZW5ndGhcbiAgICAgICAgZm9yIGkgaW4gWzAuLi5sZW5dXG4gICAgICAgICAgICBpZiBzdWJTdHJpbmcgaXMgc3RyaW5nW2kuLi5zdWJsZW5dXG4gICAgICAgICAgICAgICAgYysrXG4gICAgICAgICAgICAgICAgaSArPSBzdWJsZW4gLSAxXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gY1xuXG5cbiAgICAjIFJldHVybnMgdHJ1ZSBpZiBpbnB1dCBpcyBvbmx5IGNvbXBvc2VkIG9mIGRpZ2l0c1xuICAgICNcbiAgICAjIEBwYXJhbSBbT2JqZWN0XSBpbnB1dCBUaGUgdmFsdWUgdG8gdGVzdFxuICAgICNcbiAgICAjIEByZXR1cm4gW0Jvb2xlYW5dIHRydWUgaWYgaW5wdXQgaXMgb25seSBjb21wb3NlZCBvZiBkaWdpdHNcbiAgICAjXG4gICAgQGlzRGlnaXRzOiAoaW5wdXQpIC0+XG4gICAgICAgIEBSRUdFWF9ESUdJVFMubGFzdEluZGV4ID0gMFxuICAgICAgICByZXR1cm4gQFJFR0VYX0RJR0lUUy50ZXN0IGlucHV0XG5cblxuICAgICMgRGVjb2RlIG9jdGFsIHZhbHVlXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddIGlucHV0IFRoZSB2YWx1ZSB0byBkZWNvZGVcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtJbnRlZ2VyXSBUaGUgZGVjb2RlZCB2YWx1ZVxuICAgICNcbiAgICBAb2N0RGVjOiAoaW5wdXQpIC0+XG4gICAgICAgIEBSRUdFWF9PQ1RBTC5sYXN0SW5kZXggPSAwXG4gICAgICAgIHJldHVybiBwYXJzZUludCgoaW5wdXQrJycpLnJlcGxhY2UoQFJFR0VYX09DVEFMLCAnJyksIDgpXG5cblxuICAgICMgRGVjb2RlIGhleGFkZWNpbWFsIHZhbHVlXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddIGlucHV0IFRoZSB2YWx1ZSB0byBkZWNvZGVcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtJbnRlZ2VyXSBUaGUgZGVjb2RlZCB2YWx1ZVxuICAgICNcbiAgICBAaGV4RGVjOiAoaW5wdXQpIC0+XG4gICAgICAgIEBSRUdFWF9IRVhBREVDSU1BTC5sYXN0SW5kZXggPSAwXG4gICAgICAgIGlucHV0ID0gQHRyaW0oaW5wdXQpXG4gICAgICAgIGlmIChpbnB1dCsnJylbMC4uLjJdIGlzICcweCcgdGhlbiBpbnB1dCA9IChpbnB1dCsnJylbMi4uXVxuICAgICAgICByZXR1cm4gcGFyc2VJbnQoKGlucHV0KycnKS5yZXBsYWNlKEBSRUdFWF9IRVhBREVDSU1BTCwgJycpLCAxNilcblxuXG4gICAgIyBHZXQgdGhlIFVURi04IGNoYXJhY3RlciBmb3IgdGhlIGdpdmVuIGNvZGUgcG9pbnQuXG4gICAgI1xuICAgICMgQHBhcmFtIFtJbnRlZ2VyXSBjIFRoZSB1bmljb2RlIGNvZGUgcG9pbnRcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddIFRoZSBjb3JyZXNwb25kaW5nIFVURi04IGNoYXJhY3RlclxuICAgICNcbiAgICBAdXRmOGNocjogKGMpIC0+XG4gICAgICAgIGNoID0gU3RyaW5nLmZyb21DaGFyQ29kZVxuICAgICAgICBpZiAweDgwID4gKGMgJT0gMHgyMDAwMDApXG4gICAgICAgICAgICByZXR1cm4gY2goYylcbiAgICAgICAgaWYgMHg4MDAgPiBjXG4gICAgICAgICAgICByZXR1cm4gY2goMHhDMCB8IGM+PjYpICsgY2goMHg4MCB8IGMgJiAweDNGKVxuICAgICAgICBpZiAweDEwMDAwID4gY1xuICAgICAgICAgICAgcmV0dXJuIGNoKDB4RTAgfCBjPj4xMikgKyBjaCgweDgwIHwgYz4+NiAmIDB4M0YpICsgY2goMHg4MCB8IGMgJiAweDNGKVxuXG4gICAgICAgIHJldHVybiBjaCgweEYwIHwgYz4+MTgpICsgY2goMHg4MCB8IGM+PjEyICYgMHgzRikgKyBjaCgweDgwIHwgYz4+NiAmIDB4M0YpICsgY2goMHg4MCB8IGMgJiAweDNGKVxuXG5cbiAgICAjIFJldHVybnMgdGhlIGJvb2xlYW4gdmFsdWUgZXF1aXZhbGVudCB0byB0aGUgZ2l2ZW4gaW5wdXRcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ3xPYmplY3RdICAgIGlucHV0ICAgICAgIFRoZSBpbnB1dCB2YWx1ZVxuICAgICMgQHBhcmFtIFtCb29sZWFuXSAgICAgICAgICBzdHJpY3QgICAgICBJZiBzZXQgdG8gZmFsc2UsIGFjY2VwdCAneWVzJyBhbmQgJ25vJyBhcyBib29sZWFuIHZhbHVlc1xuICAgICNcbiAgICAjIEByZXR1cm4gW0Jvb2xlYW5dICAgICAgICAgdGhlIGJvb2xlYW4gdmFsdWVcbiAgICAjXG4gICAgQHBhcnNlQm9vbGVhbjogKGlucHV0LCBzdHJpY3QgPSB0cnVlKSAtPlxuICAgICAgICBpZiB0eXBlb2YoaW5wdXQpIGlzICdzdHJpbmcnXG4gICAgICAgICAgICBsb3dlcklucHV0ID0gaW5wdXQudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgaWYgbm90IHN0cmljdFxuICAgICAgICAgICAgICAgIGlmIGxvd2VySW5wdXQgaXMgJ25vJyB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgaWYgbG93ZXJJbnB1dCBpcyAnMCcgdGhlbiByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIGlmIGxvd2VySW5wdXQgaXMgJ2ZhbHNlJyB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgaWYgbG93ZXJJbnB1dCBpcyAnJyB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgcmV0dXJuICEhaW5wdXRcblxuXG5cbiAgICAjIFJldHVybnMgdHJ1ZSBpZiBpbnB1dCBpcyBudW1lcmljXG4gICAgI1xuICAgICMgQHBhcmFtIFtPYmplY3RdIGlucHV0IFRoZSB2YWx1ZSB0byB0ZXN0XG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gdHJ1ZSBpZiBpbnB1dCBpcyBudW1lcmljXG4gICAgI1xuICAgIEBpc051bWVyaWM6IChpbnB1dCkgLT5cbiAgICAgICAgQFJFR0VYX1NQQUNFUy5sYXN0SW5kZXggPSAwXG4gICAgICAgIHJldHVybiB0eXBlb2YoaW5wdXQpIGlzICdudW1iZXInIG9yIHR5cGVvZihpbnB1dCkgaXMgJ3N0cmluZycgYW5kICFpc05hTihpbnB1dCkgYW5kIGlucHV0LnJlcGxhY2UoQFJFR0VYX1NQQUNFUywgJycpIGlzbnQgJydcblxuXG4gICAgIyBSZXR1cm5zIGEgcGFyc2VkIGRhdGUgZnJvbSB0aGUgZ2l2ZW4gc3RyaW5nXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddIHN0ciBUaGUgZGF0ZSBzdHJpbmcgdG8gcGFyc2VcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtEYXRlXSBUaGUgcGFyc2VkIGRhdGUgb3IgbnVsbCBpZiBwYXJzaW5nIGZhaWxlZFxuICAgICNcbiAgICBAc3RyaW5nVG9EYXRlOiAoc3RyKSAtPlxuICAgICAgICB1bmxlc3Mgc3RyPy5sZW5ndGhcbiAgICAgICAgICAgIHJldHVybiBudWxsXG5cbiAgICAgICAgIyBQZXJmb3JtIHJlZ3VsYXIgZXhwcmVzc2lvbiBwYXR0ZXJuXG4gICAgICAgIGluZm8gPSBAUEFUVEVSTl9EQVRFLmV4ZWMgc3RyXG4gICAgICAgIHVubGVzcyBpbmZvXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuXG4gICAgICAgICMgRXh0cmFjdCB5ZWFyLCBtb250aCwgZGF5XG4gICAgICAgIHllYXIgPSBwYXJzZUludCBpbmZvLnllYXIsIDEwXG4gICAgICAgIG1vbnRoID0gcGFyc2VJbnQoaW5mby5tb250aCwgMTApIC0gMSAjIEluIGphdmFzY3JpcHQsIGphbnVhcnkgaXMgMCwgZmVicnVhcnkgMSwgZXRjLi4uXG4gICAgICAgIGRheSA9IHBhcnNlSW50IGluZm8uZGF5LCAxMFxuXG4gICAgICAgICMgSWYgbm8gaG91ciBpcyBnaXZlbiwgcmV0dXJuIGEgZGF0ZSB3aXRoIGRheSBwcmVjaXNpb25cbiAgICAgICAgdW5sZXNzIGluZm8uaG91cj9cbiAgICAgICAgICAgIGRhdGUgPSBuZXcgRGF0ZSBEYXRlLlVUQyh5ZWFyLCBtb250aCwgZGF5KVxuICAgICAgICAgICAgcmV0dXJuIGRhdGVcblxuICAgICAgICAjIEV4dHJhY3QgaG91ciwgbWludXRlLCBzZWNvbmRcbiAgICAgICAgaG91ciA9IHBhcnNlSW50IGluZm8uaG91ciwgMTBcbiAgICAgICAgbWludXRlID0gcGFyc2VJbnQgaW5mby5taW51dGUsIDEwXG4gICAgICAgIHNlY29uZCA9IHBhcnNlSW50IGluZm8uc2Vjb25kLCAxMFxuXG4gICAgICAgICMgRXh0cmFjdCBmcmFjdGlvbiwgaWYgZ2l2ZW5cbiAgICAgICAgaWYgaW5mby5mcmFjdGlvbj9cbiAgICAgICAgICAgIGZyYWN0aW9uID0gaW5mby5mcmFjdGlvblswLi4uM11cbiAgICAgICAgICAgIHdoaWxlIGZyYWN0aW9uLmxlbmd0aCA8IDNcbiAgICAgICAgICAgICAgICBmcmFjdGlvbiArPSAnMCdcbiAgICAgICAgICAgIGZyYWN0aW9uID0gcGFyc2VJbnQgZnJhY3Rpb24sIDEwXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZyYWN0aW9uID0gMFxuXG4gICAgICAgICMgQ29tcHV0ZSB0aW1lem9uZSBvZmZzZXQgaWYgZ2l2ZW5cbiAgICAgICAgaWYgaW5mby50ej9cbiAgICAgICAgICAgIHR6X2hvdXIgPSBwYXJzZUludCBpbmZvLnR6X2hvdXIsIDEwXG4gICAgICAgICAgICBpZiBpbmZvLnR6X21pbnV0ZT9cbiAgICAgICAgICAgICAgICB0el9taW51dGUgPSBwYXJzZUludCBpbmZvLnR6X21pbnV0ZSwgMTBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0el9taW51dGUgPSAwXG5cbiAgICAgICAgICAgICMgQ29tcHV0ZSB0aW1lem9uZSBkZWx0YSBpbiBtc1xuICAgICAgICAgICAgdHpfb2Zmc2V0ID0gKHR6X2hvdXIgKiA2MCArIHR6X21pbnV0ZSkgKiA2MDAwMFxuICAgICAgICAgICAgaWYgJy0nIGlzIGluZm8udHpfc2lnblxuICAgICAgICAgICAgICAgIHR6X29mZnNldCAqPSAtMVxuXG4gICAgICAgICMgQ29tcHV0ZSBkYXRlXG4gICAgICAgIGRhdGUgPSBuZXcgRGF0ZSBEYXRlLlVUQyh5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgZnJhY3Rpb24pXG4gICAgICAgIGlmIHR6X29mZnNldFxuICAgICAgICAgICAgZGF0ZS5zZXRUaW1lIGRhdGUuZ2V0VGltZSgpICsgdHpfb2Zmc2V0XG5cbiAgICAgICAgcmV0dXJuIGRhdGVcblxuXG4gICAgIyBSZXBlYXRzIHRoZSBnaXZlbiBzdHJpbmcgYSBudW1iZXIgb2YgdGltZXNcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICBzdHIgICAgIFRoZSBzdHJpbmcgdG8gcmVwZWF0XG4gICAgIyBAcGFyYW0gW0ludGVnZXJdICBudW1iZXIgIFRoZSBudW1iZXIgb2YgdGltZXMgdG8gcmVwZWF0IHRoZSBzdHJpbmdcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddICBUaGUgcmVwZWF0ZWQgc3RyaW5nXG4gICAgI1xuICAgIEBzdHJSZXBlYXQ6IChzdHIsIG51bWJlcikgLT5cbiAgICAgICAgcmVzID0gJydcbiAgICAgICAgaSA9IDBcbiAgICAgICAgd2hpbGUgaSA8IG51bWJlclxuICAgICAgICAgICAgcmVzICs9IHN0clxuICAgICAgICAgICAgaSsrXG4gICAgICAgIHJldHVybiByZXNcblxuXG4gICAgIyBSZWFkcyB0aGUgZGF0YSBmcm9tIHRoZSBnaXZlbiBmaWxlIHBhdGggYW5kIHJldHVybnMgdGhlIHJlc3VsdCBhcyBzdHJpbmdcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICBwYXRoICAgICAgICBUaGUgcGF0aCB0byB0aGUgZmlsZVxuICAgICMgQHBhcmFtIFtGdW5jdGlvbl0gY2FsbGJhY2sgICAgQSBjYWxsYmFjayB0byByZWFkIGZpbGUgYXN5bmNocm9ub3VzbHkgKG9wdGlvbmFsKVxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIFRoZSByZXN1bHRpbmcgZGF0YSBhcyBzdHJpbmdcbiAgICAjXG4gICAgQGdldFN0cmluZ0Zyb21GaWxlOiAocGF0aCwgY2FsbGJhY2sgPSBudWxsKSAtPlxuICAgICAgICB4aHIgPSBudWxsXG4gICAgICAgIGlmIHdpbmRvdz9cbiAgICAgICAgICAgIGlmIHdpbmRvdy5YTUxIdHRwUmVxdWVzdFxuICAgICAgICAgICAgICAgIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gICAgICAgICAgICBlbHNlIGlmIHdpbmRvdy5BY3RpdmVYT2JqZWN0XG4gICAgICAgICAgICAgICAgZm9yIG5hbWUgaW4gW1wiTXN4bWwyLlhNTEhUVFAuNi4wXCIsIFwiTXN4bWwyLlhNTEhUVFAuMy4wXCIsIFwiTXN4bWwyLlhNTEhUVFBcIiwgXCJNaWNyb3NvZnQuWE1MSFRUUFwiXVxuICAgICAgICAgICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICAgICAgICAgIHhociA9IG5ldyBBY3RpdmVYT2JqZWN0KG5hbWUpXG5cbiAgICAgICAgaWYgeGhyP1xuICAgICAgICAgICAgIyBCcm93c2VyXG4gICAgICAgICAgICBpZiBjYWxsYmFjaz9cbiAgICAgICAgICAgICAgICAjIEFzeW5jXG4gICAgICAgICAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XG4gICAgICAgICAgICAgICAgICAgIGlmIHhoci5yZWFkeVN0YXRlIGlzIDRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHhoci5zdGF0dXMgaXMgMjAwIG9yIHhoci5zdGF0dXMgaXMgMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHhoci5yZXNwb25zZVRleHQpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbClcbiAgICAgICAgICAgICAgICB4aHIub3BlbiAnR0VUJywgcGF0aCwgdHJ1ZVxuICAgICAgICAgICAgICAgIHhoci5zZW5kIG51bGxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICMgU3luY1xuICAgICAgICAgICAgICAgIHhoci5vcGVuICdHRVQnLCBwYXRoLCBmYWxzZVxuICAgICAgICAgICAgICAgIHhoci5zZW5kIG51bGxcblxuICAgICAgICAgICAgICAgIGlmIHhoci5zdGF0dXMgaXMgMjAwIG9yIHhoci5zdGF0dXMgPT0gMFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geGhyLnJlc3BvbnNlVGV4dFxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgIyBOb2RlLmpzLWxpa2VcbiAgICAgICAgICAgIHJlcSA9IHJlcXVpcmVcbiAgICAgICAgICAgIGZzID0gcmVxKCdmcycpICMgUHJldmVudCBicm93c2VyaWZ5IGZyb20gdHJ5aW5nIHRvIGxvYWQgJ2ZzJyBtb2R1bGVcbiAgICAgICAgICAgIGlmIGNhbGxiYWNrP1xuICAgICAgICAgICAgICAgICMgQXN5bmNcbiAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZSBwYXRoLCAoZXJyLCBkYXRhKSAtPlxuICAgICAgICAgICAgICAgICAgICBpZiBlcnJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrIG51bGxcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sgZGF0YVxuXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgIyBTeW5jXG4gICAgICAgICAgICAgICAgZGF0YSA9IGZzLnJlYWRGaWxlU3luYyBwYXRoXG4gICAgICAgICAgICAgICAgaWYgZGF0YT9cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcnK2RhdGFcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBVdGlsc1xuIiwiXG5QYXJzZXIgPSByZXF1aXJlICcuL1BhcnNlcidcbkR1bXBlciA9IHJlcXVpcmUgJy4vRHVtcGVyJ1xuVXRpbHMgID0gcmVxdWlyZSAnLi9VdGlscydcblxuIyBZYW1sIG9mZmVycyBjb252ZW5pZW5jZSBtZXRob2RzIHRvIGxvYWQgYW5kIGR1bXAgWUFNTC5cbiNcbmNsYXNzIFlhbWxcblxuICAgICMgUGFyc2VzIFlBTUwgaW50byBhIEphdmFTY3JpcHQgb2JqZWN0LlxuICAgICNcbiAgICAjIFRoZSBwYXJzZSBtZXRob2QsIHdoZW4gc3VwcGxpZWQgd2l0aCBhIFlBTUwgc3RyaW5nLFxuICAgICMgd2lsbCBkbyBpdHMgYmVzdCB0byBjb252ZXJ0IFlBTUwgaW4gYSBmaWxlIGludG8gYSBKYXZhU2NyaXB0IG9iamVjdC5cbiAgICAjXG4gICAgIyAgVXNhZ2U6XG4gICAgIyAgICAgbXlPYmplY3QgPSBZYW1sLnBhcnNlKCdzb21lOiB5YW1sJyk7XG4gICAgIyAgICAgY29uc29sZS5sb2cobXlPYmplY3QpO1xuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIGlucHV0ICAgICAgICAgICAgICAgICAgIEEgc3RyaW5nIGNvbnRhaW5pbmcgWUFNTFxuICAgICMgQHBhcmFtIFtCb29sZWFuXSAgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSAgdHJ1ZSBpZiBhbiBleGNlcHRpb24gbXVzdCBiZSB0aHJvd24gb24gaW52YWxpZCB0eXBlcywgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgIyBAcGFyYW0gW0Z1bmN0aW9uXSBvYmplY3REZWNvZGVyICAgICAgICAgICBBIGZ1bmN0aW9uIHRvIGRlc2VyaWFsaXplIGN1c3RvbSBvYmplY3RzLCBudWxsIG90aGVyd2lzZVxuICAgICNcbiAgICAjIEByZXR1cm4gW09iamVjdF0gIFRoZSBZQU1MIGNvbnZlcnRlZCB0byBhIEphdmFTY3JpcHQgb2JqZWN0XG4gICAgI1xuICAgICMgQHRocm93IFtQYXJzZUV4Y2VwdGlvbl0gSWYgdGhlIFlBTUwgaXMgbm90IHZhbGlkXG4gICAgI1xuICAgIEBwYXJzZTogKGlucHV0LCBleGNlcHRpb25PbkludmFsaWRUeXBlID0gZmFsc2UsIG9iamVjdERlY29kZXIgPSBudWxsKSAtPlxuICAgICAgICByZXR1cm4gbmV3IFBhcnNlcigpLnBhcnNlKGlucHV0LCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyKVxuXG5cbiAgICAjIFBhcnNlcyBZQU1MIGZyb20gZmlsZSBwYXRoIGludG8gYSBKYXZhU2NyaXB0IG9iamVjdC5cbiAgICAjXG4gICAgIyBUaGUgcGFyc2VGaWxlIG1ldGhvZCwgd2hlbiBzdXBwbGllZCB3aXRoIGEgWUFNTCBmaWxlLFxuICAgICMgd2lsbCBkbyBpdHMgYmVzdCB0byBjb252ZXJ0IFlBTUwgaW4gYSBmaWxlIGludG8gYSBKYXZhU2NyaXB0IG9iamVjdC5cbiAgICAjXG4gICAgIyAgVXNhZ2U6XG4gICAgIyAgICAgbXlPYmplY3QgPSBZYW1sLnBhcnNlRmlsZSgnY29uZmlnLnltbCcpO1xuICAgICMgICAgIGNvbnNvbGUubG9nKG15T2JqZWN0KTtcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICBwYXRoICAgICAgICAgICAgICAgICAgICBBIGZpbGUgcGF0aCBwb2ludGluZyB0byBhIHZhbGlkIFlBTUwgZmlsZVxuICAgICMgQHBhcmFtIFtCb29sZWFuXSAgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSAgdHJ1ZSBpZiBhbiBleGNlcHRpb24gbXVzdCBiZSB0aHJvd24gb24gaW52YWxpZCB0eXBlcywgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgIyBAcGFyYW0gW0Z1bmN0aW9uXSBvYmplY3REZWNvZGVyICAgICAgICAgICBBIGZ1bmN0aW9uIHRvIGRlc2VyaWFsaXplIGN1c3RvbSBvYmplY3RzLCBudWxsIG90aGVyd2lzZVxuICAgICNcbiAgICAjIEByZXR1cm4gW09iamVjdF0gIFRoZSBZQU1MIGNvbnZlcnRlZCB0byBhIEphdmFTY3JpcHQgb2JqZWN0IG9yIG51bGwgaWYgdGhlIGZpbGUgZG9lc24ndCBleGlzdC5cbiAgICAjXG4gICAgIyBAdGhyb3cgW1BhcnNlRXhjZXB0aW9uXSBJZiB0aGUgWUFNTCBpcyBub3QgdmFsaWRcbiAgICAjXG4gICAgQHBhcnNlRmlsZTogKHBhdGgsIGNhbGxiYWNrID0gbnVsbCwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSA9IGZhbHNlLCBvYmplY3REZWNvZGVyID0gbnVsbCkgLT5cbiAgICAgICAgaWYgY2FsbGJhY2s/XG4gICAgICAgICAgICAjIEFzeW5jXG4gICAgICAgICAgICBVdGlscy5nZXRTdHJpbmdGcm9tRmlsZSBwYXRoLCAoaW5wdXQpID0+XG4gICAgICAgICAgICAgICAgaWYgaW5wdXQ/XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBAcGFyc2UgaW5wdXQsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICAjIFN5bmNcbiAgICAgICAgICAgIGlucHV0ID0gVXRpbHMuZ2V0U3RyaW5nRnJvbUZpbGUgcGF0aFxuICAgICAgICAgICAgaWYgaW5wdXQ/XG4gICAgICAgICAgICAgICAgcmV0dXJuIEBwYXJzZSBpbnB1dCwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlclxuICAgICAgICAgICAgcmV0dXJuIG51bGxcblxuXG4gICAgIyBEdW1wcyBhIEphdmFTY3JpcHQgb2JqZWN0IHRvIGEgWUFNTCBzdHJpbmcuXG4gICAgI1xuICAgICMgVGhlIGR1bXAgbWV0aG9kLCB3aGVuIHN1cHBsaWVkIHdpdGggYW4gb2JqZWN0LCB3aWxsIGRvIGl0cyBiZXN0XG4gICAgIyB0byBjb252ZXJ0IHRoZSBvYmplY3QgaW50byBmcmllbmRseSBZQU1MLlxuICAgICNcbiAgICAjIEBwYXJhbSBbT2JqZWN0XSAgIGlucHV0ICAgICAgICAgICAgICAgICAgIEphdmFTY3JpcHQgb2JqZWN0XG4gICAgIyBAcGFyYW0gW0ludGVnZXJdICBpbmxpbmUgICAgICAgICAgICAgICAgICBUaGUgbGV2ZWwgd2hlcmUgeW91IHN3aXRjaCB0byBpbmxpbmUgWUFNTFxuICAgICMgQHBhcmFtIFtJbnRlZ2VyXSAgaW5kZW50ICAgICAgICAgICAgICAgICAgVGhlIGFtb3VudCBvZiBzcGFjZXMgdG8gdXNlIGZvciBpbmRlbnRhdGlvbiBvZiBuZXN0ZWQgbm9kZXMuXG4gICAgIyBAcGFyYW0gW0Jvb2xlYW5dICBleGNlcHRpb25PbkludmFsaWRUeXBlICB0cnVlIGlmIGFuIGV4Y2VwdGlvbiBtdXN0IGJlIHRocm93biBvbiBpbnZhbGlkIHR5cGVzIChhIEphdmFTY3JpcHQgcmVzb3VyY2Ugb3Igb2JqZWN0KSwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgIyBAcGFyYW0gW0Z1bmN0aW9uXSBvYmplY3RFbmNvZGVyICAgICAgICAgICBBIGZ1bmN0aW9uIHRvIHNlcmlhbGl6ZSBjdXN0b20gb2JqZWN0cywgbnVsbCBvdGhlcndpc2VcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddICBBIFlBTUwgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgb3JpZ2luYWwgSmF2YVNjcmlwdCBvYmplY3RcbiAgICAjXG4gICAgQGR1bXA6IChpbnB1dCwgaW5saW5lID0gMiwgaW5kZW50ID0gNCwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSA9IGZhbHNlLCBvYmplY3RFbmNvZGVyID0gbnVsbCkgLT5cbiAgICAgICAgeWFtbCA9IG5ldyBEdW1wZXIoKVxuICAgICAgICB5YW1sLmluZGVudGF0aW9uID0gaW5kZW50XG5cbiAgICAgICAgcmV0dXJuIHlhbWwuZHVtcChpbnB1dCwgaW5saW5lLCAwLCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3RFbmNvZGVyKVxuXG5cbiAgICAjIFJlZ2lzdGVycyAueW1sIGV4dGVuc2lvbiB0byB3b3JrIHdpdGggbm9kZSdzIHJlcXVpcmUoKSBmdW5jdGlvbi5cbiAgICAjXG4gICAgQHJlZ2lzdGVyOiAtPlxuICAgICAgICByZXF1aXJlX2hhbmRsZXIgPSAobW9kdWxlLCBmaWxlbmFtZSkgLT5cbiAgICAgICAgICAgICMgRmlsbCBpbiByZXN1bHRcbiAgICAgICAgICAgIG1vZHVsZS5leHBvcnRzID0gWUFNTC5wYXJzZUZpbGUgZmlsZW5hbWVcblxuICAgICAgICAjIFJlZ2lzdGVyIHJlcXVpcmUgZXh0ZW5zaW9ucyBvbmx5IGlmIHdlJ3JlIG9uIG5vZGUuanNcbiAgICAgICAgIyBoYWNrIGZvciBicm93c2VyaWZ5XG4gICAgICAgIGlmIHJlcXVpcmU/LmV4dGVuc2lvbnM/XG4gICAgICAgICAgICByZXF1aXJlLmV4dGVuc2lvbnNbJy55bWwnXSA9IHJlcXVpcmVfaGFuZGxlclxuICAgICAgICAgICAgcmVxdWlyZS5leHRlbnNpb25zWycueWFtbCddID0gcmVxdWlyZV9oYW5kbGVyXG5cblxuICAgICMgQWxpYXMgb2YgZHVtcCgpIG1ldGhvZCBmb3IgY29tcGF0aWJpbGl0eSByZWFzb25zLlxuICAgICNcbiAgICBzdHJpbmdpZnk6IChpbnB1dCwgaW5saW5lLCBpbmRlbnQsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdEVuY29kZXIpIC0+XG4gICAgICAgIHJldHVybiBAZHVtcCBpbnB1dCwgaW5saW5lLCBpbmRlbnQsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdEVuY29kZXJcblxuXG4gICAgIyBBbGlhcyBvZiBwYXJzZUZpbGUoKSBtZXRob2QgZm9yIGNvbXBhdGliaWxpdHkgcmVhc29ucy5cbiAgICAjXG4gICAgbG9hZDogKHBhdGgsIGNhbGxiYWNrLCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyKSAtPlxuICAgICAgICByZXR1cm4gQHBhcnNlRmlsZSBwYXRoLCBjYWxsYmFjaywgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlclxuXG5cbiMgRXhwb3NlIFlBTUwgbmFtZXNwYWNlIHRvIGJyb3dzZXJcbndpbmRvdz8uWUFNTCA9IFlhbWxcblxubW9kdWxlLmV4cG9ydHMgPSBZYW1sXG5cbiJdfQ==
