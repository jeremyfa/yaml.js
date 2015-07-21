(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Dumper, Inline, Utils;

Utils = require('./Utils');

Inline = require('./Inline');

Dumper = (function() {
  function Dumper() {}

  Dumper.indentation = 4;

  Dumper.prototype.dump = function(input, inline, indent, exceptionOnInvalidType, objectEncoder) {
    var i, key, len, output, prefix, value, willBeInlined;
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
    if (inline <= 0 || typeof input !== 'object' || input instanceof Date || Utils.isEmpty(input)) {
      output += prefix + Inline.dump(input, exceptionOnInvalidType, objectEncoder);
    } else {
      if (input instanceof Array) {
        for (i = 0, len = input.length; i < len; i++) {
          value = input[i];
          willBeInlined = inline - 1 <= 0 || typeof value !== 'object' || Utils.isEmpty(value);
          output += prefix + '-' + (willBeInlined ? ' ' : "\n") + this.dump(value, inline - 1, (willBeInlined ? 0 : indent + this.indentation), exceptionOnInvalidType, objectEncoder) + (willBeInlined ? "\n" : '');
        }
      } else {
        for (key in input) {
          value = input[key];
          willBeInlined = inline - 1 <= 0 || typeof value !== 'object' || Utils.isEmpty(value);
          output += prefix + Inline.dump(key, exceptionOnInvalidType, objectEncoder) + ':' + (willBeInlined ? ' ' : "\n") + this.dump(value, inline - 1, (willBeInlined ? 0 : indent + this.indentation), exceptionOnInvalidType, objectEncoder) + (willBeInlined ? "\n" : '');
        }
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
    var i, j, mapping, ref;
    mapping = {};
    for (i = j = 0, ref = Escaper.LIST_ESCAPEES.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
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
    var result;
    result = this.PATTERN_MAPPING_ESCAPEES.replace(value, (function(_this) {
      return function(str) {
        return _this.MAPPING_ESCAPEES_TO_ESCAPED[str];
      };
    })(this));
    return '"' + result + '"';
  };

  Escaper.requiresSingleQuoting = function(value) {
    return this.PATTERN_SINGLE_QUOTING.test(value);
  };

  Escaper.escapeWithSingleQuotes = function(value) {
    return "'" + value.replace(/'/g, "''") + "'";
  };

  return Escaper;

})();

module.exports = Escaper;


},{"./Pattern":7}],3:[function(require,module,exports){
var DumpException,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

DumpException = (function(superClass) {
  extend(DumpException, superClass);

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
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ParseException = (function(superClass) {
  extend(ParseException, superClass);

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
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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
    var ref, result, type;
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
      return (type === 'string' ? "'" + value + "'" : String(parseInt(value)));
    }
    if (Utils.isNumeric(value)) {
      return (type === 'string' ? "'" + value + "'" : String(parseFloat(value)));
    }
    if (type === 'number') {
      return (value === Infinity ? '.Inf' : (value === -Infinity ? '-.Inf' : (isNaN(value) ? '.NaN' : value)));
    }
    if (Escaper.requiresDoubleQuoting(value)) {
      return Escaper.escapeWithDoubleQuotes(value);
    }
    if (Escaper.requiresSingleQuoting(value)) {
      return Escaper.escapeWithSingleQuotes(value);
    }
    if ('' === value) {
      return '""';
    }
    if (Utils.PATTERN_DATE.test(value)) {
      return "'" + value + "'";
    }
    if ((ref = value.toLowerCase()) === 'null' || ref === '~' || ref === 'true' || ref === 'false') {
      return "'" + value + "'";
    }
    return value;
  };

  Inline.dumpObject = function(value, exceptionOnInvalidType, objectSupport) {
    var j, key, len1, output, val;
    if (objectSupport == null) {
      objectSupport = null;
    }
    if (value instanceof Array) {
      output = [];
      for (j = 0, len1 = value.length; j < len1; j++) {
        val = value[j];
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
    var i, joinedDelimiters, match, output, pattern, ref, ref1, strpos, tmp;
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
    if (ref = scalar.charAt(i), indexOf.call(stringDelimiters, ref) >= 0) {
      output = this.parseQuotedScalar(scalar, context);
      i = context.i;
      if (delimiters != null) {
        tmp = Utils.ltrim(scalar.slice(i), ' ');
        if (!(ref1 = tmp.charAt(0), indexOf.call(delimiters, ref1) >= 0)) {
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
    var e, i, isQuoted, len, output, ref, value;
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
          isQuoted = ((ref = sequence.charAt(i)) === '"' || ref === "'");
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
    var done, i, key, len, output, shouldContinueWhileLoop, value;
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
            value = this.parseMapping(mapping, context);
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
    var cast, date, exceptionOnInvalidType, firstChar, firstSpace, firstWord, objectDecoder, raw, scalarLower, subValue, trimmedScalar;
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
              if (raw === String(cast)) {
                return cast;
              } else {
                return raw;
              }
            } else if (Utils.isNumeric(scalar)) {
              return parseFloat(scalar);
            } else if (this.PATTERN_THOUSAND_NUMERIC_SCALAR.test(scalar)) {
              return parseFloat(scalar.replace(',', ''));
            }
            return scalar;
          case '-':
            if (Utils.isDigits(scalar.slice(1))) {
              if ('0' === scalar.charAt(1)) {
                return -Utils.octDec(scalar.slice(1));
              } else {
                raw = scalar.slice(1);
                cast = parseInt(raw);
                if (raw === String(cast)) {
                  return -cast;
                } else {
                  return -raw;
                }
              }
            } else if (Utils.isNumeric(scalar)) {
              return parseFloat(scalar);
            } else if (this.PATTERN_THOUSAND_NUMERIC_SCALAR.test(scalar)) {
              return parseFloat(scalar.replace(',', ''));
            }
            return scalar;
          default:
            if (date = Utils.stringToDate(scalar)) {
              return date;
            } else if (Utils.isNumeric(scalar)) {
              return parseFloat(scalar);
            } else if (this.PATTERN_THOUSAND_NUMERIC_SCALAR.test(scalar)) {
              return parseFloat(scalar.replace(',', ''));
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
    var alias, allowOverwrite, block, c, context, data, e, first, i, indent, isRef, j, k, key, l, lastKey, len, len1, len2, len3, lineCount, m, matches, mergeNode, n, name, parsed, parsedItem, parser, ref, ref1, ref2, refName, refValue, val, values;
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
          if (((ref = values.leadspaces) != null ? ref.length : void 0) && (matches = this.PATTERN_COMPACT_NOTATION.exec(values.value))) {
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
          if (((ref1 = values.value) != null ? ref1.indexOf('*') : void 0) === 0) {
            refName = values.value.slice(1);
            if (this.refs[refName] == null) {
              throw new ParseException('Reference "' + refName + '" does not exist.', this.getRealCurrentLineNb() + 1, this.currentLine);
            }
            refValue = this.refs[refName];
            if (typeof refValue !== 'object') {
              throw new ParseException('YAML merge keys used with a scalar value instead of an object.', this.getRealCurrentLineNb() + 1, this.currentLine);
            }
            if (refValue instanceof Array) {
              for (i = j = 0, len = refValue.length; j < len; i = ++j) {
                value = refValue[i];
                if (data[name = String(i)] == null) {
                  data[name] = value;
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
            if ((values.value != null) && values.value !== '') {
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
              for (l = 0, len1 = parsed.length; l < len1; l++) {
                parsedItem = parsed[l];
                if (typeof parsedItem !== 'object') {
                  throw new ParseException('Merge items must be objects.', this.getRealCurrentLineNb() + 1, parsedItem);
                }
                if (parsedItem instanceof Array) {
                  for (i = m = 0, len2 = parsedItem.length; m < len2; i = ++m) {
                    value = parsedItem[i];
                    k = String(i);
                    if (!data.hasOwnProperty(k)) {
                      data[k] = value;
                    }
                  }
                } else {
                  for (key in parsedItem) {
                    value = parsedItem[key];
                    if (!data.hasOwnProperty(key)) {
                      data[key] = value;
                    }
                  }
                }
              }
            } else {
              for (key in parsed) {
                value = parsed[key];
                if (!data.hasOwnProperty(key)) {
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
              for (n = 0, len3 = value.length; n < len3; n++) {
                alias = value[n];
                data.push(this.refs[alias.slice(1)]);
              }
              value = data;
            }
          }
          return value;
        } else if ((ref2 = Utils.ltrim(value).charAt(0)) === '[' || ref2 === '{') {
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
      } else if (Utils.ltrim(this.currentLine).charAt(0) === '#') {

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
    var e, foldedIndent, matches, modifiers, pos, ref, ref1, val;
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
      modifiers = (ref = matches.modifiers) != null ? ref : '';
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
      if (((ref1 = value.charAt(0)) === '[' || ref1 === '{') && e instanceof ParseException && this.isNextLineIndented()) {
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
    var isCurrentLineBlank, j, len, line, matches, newText, notEOF, pattern, ref, text;
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
      ref = text.split("\n");
      for (j = 0, len = ref.length; j < len; j++) {
        line = ref[j];
        if (line.length === 0 || line.charAt(0) === ' ') {
          newText = Utils.rtrim(newText, ' ') + line + "\n";
        } else {
          newText += line + ' ';
        }
      }
      text = newText;
    }
    if ('+' !== indicator) {
      text = Utils.rtrim(text);
    }
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
    var count, i, indent, j, l, len, len1, line, lines, ref, ref1, ref2, smallestIndent, trimmedValue;
    if (value.indexOf("\r") !== -1) {
      value = value.split("\r\n").join("\n").split("\r").join("\n");
    }
    count = 0;
    ref = this.PATTERN_YAML_HEADER.replaceAll(value, ''), value = ref[0], count = ref[1];
    this.offset += count;
    ref1 = this.PATTERN_LEADING_COMMENTS.replaceAll(value, '', 1), trimmedValue = ref1[0], count = ref1[1];
    if (count === 1) {
      this.offset += Utils.subStrCount(value, "\n") - Utils.subStrCount(trimmedValue, "\n");
      value = trimmedValue;
    }
    ref2 = this.PATTERN_DOCUMENT_MARKER_START.replaceAll(value, '', 1), trimmedValue = ref2[0], count = ref2[1];
    if (count === 1) {
      this.offset += Utils.subStrCount(value, "\n") - Utils.subStrCount(trimmedValue, "\n");
      value = trimmedValue;
      value = this.PATTERN_DOCUMENT_MARKER_END.replace(value, '');
    }
    lines = value.split("\n");
    smallestIndent = -1;
    for (j = 0, len = lines.length; j < len; j++) {
      line = lines[j];
      indent = line.length - Utils.ltrim(line).length;
      if (smallestIndent === -1 || indent < smallestIndent) {
        smallestIndent = indent;
      }
    }
    if (smallestIndent > 0) {
      for (i = l = 0, len1 = lines.length; l < len1; i = ++l) {
        line = lines[i];
        lines[i] = line.slice(smallestIndent);
      }
      value = lines.join("\n");
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
    var index, matches, name, ref;
    this.regex.lastIndex = 0;
    matches = this.regex.exec(str);
    if (matches == null) {
      return null;
    }
    if (this.mapping != null) {
      ref = this.mapping;
      for (name in ref) {
        index = ref[name];
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
    return value.replace(/\'\'/g, '\'');
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
    var c, i, j, len, ref, sublen;
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
    for (i = j = 0, ref = len; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
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
    var data, fs, j, len1, name, ref, req, xhr;
    if (callback == null) {
      callback = null;
    }
    xhr = null;
    if (typeof window !== "undefined" && window !== null) {
      if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
      } else if (window.ActiveXObject) {
        ref = ["Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.3.0", "Msxml2.XMLHTTP", "Microsoft.XMLHTTP"];
        for (j = 0, len1 = ref.length; j < len1; j++) {
          name = ref[j];
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
            return callback(String(data));
          }
        });
      } else {
        data = fs.readFileSync(path);
        if (data != null) {
          return String(data);
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
          var result;
          result = null;
          if (input != null) {
            result = _this.parse(input, exceptionOnInvalidType, objectDecoder);
          }
          callback(result);
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

  Yaml.stringify = function(input, inline, indent, exceptionOnInvalidType, objectEncoder) {
    return this.dump(input, inline, indent, exceptionOnInvalidType, objectEncoder);
  };

  Yaml.load = function(path, callback, exceptionOnInvalidType, objectDecoder) {
    return this.parseFile(path, callback, exceptionOnInvalidType, objectDecoder);
  };

  return Yaml;

})();

if (typeof window !== "undefined" && window !== null) {
  window.YAML = Yaml;
}

if (typeof window === "undefined" || window === null) {
  this.YAML = Yaml;
}

module.exports = Yaml;


},{"./Dumper":1,"./Parser":6,"./Utils":9}]},{},[10])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9pZm91cnMvUHJvamVjdHMveWFtbC5qcy9zcmMvRHVtcGVyLmNvZmZlZSIsIi9Vc2Vycy9pZm91cnMvUHJvamVjdHMveWFtbC5qcy9zcmMvRXNjYXBlci5jb2ZmZWUiLCIvVXNlcnMvaWZvdXJzL1Byb2plY3RzL3lhbWwuanMvc3JjL0V4Y2VwdGlvbi9EdW1wRXhjZXB0aW9uLmNvZmZlZSIsIi9Vc2Vycy9pZm91cnMvUHJvamVjdHMveWFtbC5qcy9zcmMvRXhjZXB0aW9uL1BhcnNlRXhjZXB0aW9uLmNvZmZlZSIsIi9Vc2Vycy9pZm91cnMvUHJvamVjdHMveWFtbC5qcy9zcmMvSW5saW5lLmNvZmZlZSIsIi9Vc2Vycy9pZm91cnMvUHJvamVjdHMveWFtbC5qcy9zcmMvUGFyc2VyLmNvZmZlZSIsIi9Vc2Vycy9pZm91cnMvUHJvamVjdHMveWFtbC5qcy9zcmMvUGF0dGVybi5jb2ZmZWUiLCIvVXNlcnMvaWZvdXJzL1Byb2plY3RzL3lhbWwuanMvc3JjL1VuZXNjYXBlci5jb2ZmZWUiLCIvVXNlcnMvaWZvdXJzL1Byb2plY3RzL3lhbWwuanMvc3JjL1V0aWxzLmNvZmZlZSIsIi9Vc2Vycy9pZm91cnMvUHJvamVjdHMveWFtbC5qcy9zcmMvWWFtbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNDQSxJQUFBOztBQUFBLEtBQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7QUFDVixNQUFBLEdBQVUsT0FBQSxDQUFRLFVBQVI7O0FBSUo7OztFQUdGLE1BQUMsQ0FBQSxXQUFELEdBQWdCOzttQkFhaEIsSUFBQSxHQUFNLFNBQUMsS0FBRCxFQUFRLE1BQVIsRUFBb0IsTUFBcEIsRUFBZ0Msc0JBQWhDLEVBQWdFLGFBQWhFO0FBQ0YsUUFBQTs7TUFEVSxTQUFTOzs7TUFBRyxT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R0FBbUI7QUFFbkIsV0FBTyxJQUFJLENBQUMsSUFBTCxDQUFVLEtBQVYsRUFBaUIsTUFBakIsRUFBeUIsQ0FBekIsRUFBNEIsc0JBQTVCLEVBQW9ELGFBQXBEO0VBSko7O0VBU1AsSUFBQyxDQUFBLFFBQUQsR0FBVyxTQUFBO0FBQ1AsUUFBQTtJQUFBLGVBQUEsR0FBa0IsU0FBQyxNQUFELEVBQVMsUUFBVDthQUVkLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLElBQUksQ0FBQyxTQUFMLENBQWUsUUFBZjtJQUZIO0lBTWxCLElBQUcsMEZBQUg7TUFDSSxPQUFPLENBQUMsVUFBVyxDQUFBLE1BQUEsQ0FBbkIsR0FBNkI7YUFDN0IsT0FBTyxDQUFDLFVBQVcsQ0FBQSxPQUFBLENBQW5CLEdBQThCLGdCQUZsQzs7RUFQTzs7RUFjWCxJQUFDLENBQUEsU0FBRCxHQUFZLFNBQUMsS0FBRCxFQUFRLE1BQVIsRUFBZ0IsTUFBaEIsRUFBd0Isc0JBQXhCLEVBQWdELGFBQWhEO0FBQ1IsV0FBTyxJQUFDLENBQUEsSUFBRCxDQUFNLEtBQU4sRUFBYSxNQUFiLEVBQXFCLE1BQXJCLEVBQTZCLHNCQUE3QixFQUFxRCxhQUFyRDtFQURDOztFQU1aLElBQUMsQ0FBQSxJQUFELEdBQU8sU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixzQkFBakIsRUFBeUMsYUFBekM7QUFDSCxXQUFPLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBWCxFQUFpQixRQUFqQixFQUEyQixzQkFBM0IsRUFBbUQsYUFBbkQ7RUFESjs7Ozs7OztFQUtYLE1BQU0sQ0FBRSxJQUFSLEdBQWU7OztBQUdmLElBQU8sZ0RBQVA7RUFDSSxJQUFDLENBQUEsSUFBRCxHQUFRLEtBRFo7OztBQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxuVXRpbHMgICA9IHJlcXVpcmUgJy4vVXRpbHMnXG5JbmxpbmUgID0gcmVxdWlyZSAnLi9JbmxpbmUnXG5cbiMgRHVtcGVyIGR1bXBzIEphdmFTY3JpcHQgdmFyaWFibGVzIHRvIFlBTUwgc3RyaW5ncy5cbiNcbmNsYXNzIER1bXBlclxuXG4gICAgIyBUaGUgYW1vdW50IG9mIHNwYWNlcyB0byB1c2UgZm9yIGluZGVudGF0aW9uIG9mIG5lc3RlZCBub2Rlcy5cbiAgICBAaW5kZW50YXRpb246ICAgNFxuXG5cbiAgICAjIER1bXBzIGEgSmF2YVNjcmlwdCB2YWx1ZSB0byBZQU1MLlxuICAgICNcbiAgICAjIEBwYXJhbSBbT2JqZWN0XSAgIGlucHV0ICAgICAgICAgICAgICAgICAgIFRoZSBKYXZhU2NyaXB0IHZhbHVlXG4gICAgIyBAcGFyYW0gW0ludGVnZXJdICBpbmxpbmUgICAgICAgICAgICAgICAgICBUaGUgbGV2ZWwgd2hlcmUgeW91IHN3aXRjaCB0byBpbmxpbmUgWUFNTFxuICAgICMgQHBhcmFtIFtJbnRlZ2VyXSAgaW5kZW50ICAgICAgICAgICAgICAgICAgVGhlIGxldmVsIG9mIGluZGVudGF0aW9uICh1c2VkIGludGVybmFsbHkpXG4gICAgIyBAcGFyYW0gW0Jvb2xlYW5dICBleGNlcHRpb25PbkludmFsaWRUeXBlICB0cnVlIGlmIGFuIGV4Y2VwdGlvbiBtdXN0IGJlIHRocm93biBvbiBpbnZhbGlkIHR5cGVzIChhIEphdmFTY3JpcHQgcmVzb3VyY2Ugb3Igb2JqZWN0KSwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgIyBAcGFyYW0gW0Z1bmN0aW9uXSBvYmplY3RFbmNvZGVyICAgICAgICAgICBBIGZ1bmN0aW9uIHRvIHNlcmlhbGl6ZSBjdXN0b20gb2JqZWN0cywgbnVsbCBvdGhlcndpc2VcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddICBUaGUgWUFNTCByZXByZXNlbnRhdGlvbiBvZiB0aGUgSmF2YVNjcmlwdCB2YWx1ZVxuICAgICNcbiAgICBkdW1wOiAoaW5wdXQsIGlubGluZSA9IDAsIGluZGVudCA9IDAsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgPSBmYWxzZSwgb2JqZWN0RW5jb2RlciA9IG51bGwpIC0+XG4gICAgICAgIG91dHB1dCA9ICcnXG4gICAgICAgIHByZWZpeCA9IChpZiBpbmRlbnQgdGhlbiBVdGlscy5zdHJSZXBlYXQoJyAnLCBpbmRlbnQpIGVsc2UgJycpXG5cbiAgICAgICAgaWYgaW5saW5lIDw9IDAgb3IgdHlwZW9mKGlucHV0KSBpc250ICdvYmplY3QnIG9yIGlucHV0IGluc3RhbmNlb2YgRGF0ZSBvciBVdGlscy5pc0VtcHR5KGlucHV0KVxuICAgICAgICAgICAgb3V0cHV0ICs9IHByZWZpeCArIElubGluZS5kdW1wKGlucHV0LCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3RFbmNvZGVyKVxuICAgICAgICBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgaW5wdXQgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgICAgIGZvciB2YWx1ZSBpbiBpbnB1dFxuICAgICAgICAgICAgICAgICAgICB3aWxsQmVJbmxpbmVkID0gKGlubGluZSAtIDEgPD0gMCBvciB0eXBlb2YodmFsdWUpIGlzbnQgJ29iamVjdCcgb3IgVXRpbHMuaXNFbXB0eSh2YWx1ZSkpXG5cbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0ICs9XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVmaXggK1xuICAgICAgICAgICAgICAgICAgICAgICAgJy0nICtcbiAgICAgICAgICAgICAgICAgICAgICAgIChpZiB3aWxsQmVJbmxpbmVkIHRoZW4gJyAnIGVsc2UgXCJcXG5cIikgK1xuICAgICAgICAgICAgICAgICAgICAgICAgQGR1bXAodmFsdWUsIGlubGluZSAtIDEsIChpZiB3aWxsQmVJbmxpbmVkIHRoZW4gMCBlbHNlIGluZGVudCArIEBpbmRlbnRhdGlvbiksIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdEVuY29kZXIpICtcbiAgICAgICAgICAgICAgICAgICAgICAgIChpZiB3aWxsQmVJbmxpbmVkIHRoZW4gXCJcXG5cIiBlbHNlICcnKVxuXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZm9yIGtleSwgdmFsdWUgb2YgaW5wdXRcbiAgICAgICAgICAgICAgICAgICAgd2lsbEJlSW5saW5lZCA9IChpbmxpbmUgLSAxIDw9IDAgb3IgdHlwZW9mKHZhbHVlKSBpc250ICdvYmplY3QnIG9yIFV0aWxzLmlzRW1wdHkodmFsdWUpKVxuXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dCArPVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZml4ICtcbiAgICAgICAgICAgICAgICAgICAgICAgIElubGluZS5kdW1wKGtleSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RW5jb2RlcikgKyAnOicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgKGlmIHdpbGxCZUlubGluZWQgdGhlbiAnICcgZWxzZSBcIlxcblwiKSArXG4gICAgICAgICAgICAgICAgICAgICAgICBAZHVtcCh2YWx1ZSwgaW5saW5lIC0gMSwgKGlmIHdpbGxCZUlubGluZWQgdGhlbiAwIGVsc2UgaW5kZW50ICsgQGluZGVudGF0aW9uKSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RW5jb2RlcikgK1xuICAgICAgICAgICAgICAgICAgICAgICAgKGlmIHdpbGxCZUlubGluZWQgdGhlbiBcIlxcblwiIGVsc2UgJycpXG5cbiAgICAgICAgcmV0dXJuIG91dHB1dFxuXG5cbm1vZHVsZS5leHBvcnRzID0gRHVtcGVyXG4iLCJcblBhdHRlcm4gPSByZXF1aXJlICcuL1BhdHRlcm4nXG5cbiMgRXNjYXBlciBlbmNhcHN1bGF0ZXMgZXNjYXBpbmcgcnVsZXMgZm9yIHNpbmdsZVxuIyBhbmQgZG91YmxlLXF1b3RlZCBZQU1MIHN0cmluZ3MuXG5jbGFzcyBFc2NhcGVyXG5cbiAgICAjIE1hcHBpbmcgYXJyYXlzIGZvciBlc2NhcGluZyBhIGRvdWJsZSBxdW90ZWQgc3RyaW5nLiBUaGUgYmFja3NsYXNoIGlzXG4gICAgIyBmaXJzdCB0byBlbnN1cmUgcHJvcGVyIGVzY2FwaW5nLlxuICAgIEBMSVNUX0VTQ0FQRUVTOiAgICAgICAgICAgICAgICAgWydcXFxcXFxcXCcsICdcXFxcXCInLCAnXCInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXFx4MDBcIiwgIFwiXFx4MDFcIiwgIFwiXFx4MDJcIiwgIFwiXFx4MDNcIiwgIFwiXFx4MDRcIiwgIFwiXFx4MDVcIiwgIFwiXFx4MDZcIiwgIFwiXFx4MDdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlxceDA4XCIsICBcIlxceDA5XCIsICBcIlxceDBhXCIsICBcIlxceDBiXCIsICBcIlxceDBjXCIsICBcIlxceDBkXCIsICBcIlxceDBlXCIsICBcIlxceDBmXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcXHgxMFwiLCAgXCJcXHgxMVwiLCAgXCJcXHgxMlwiLCAgXCJcXHgxM1wiLCAgXCJcXHgxNFwiLCAgXCJcXHgxNVwiLCAgXCJcXHgxNlwiLCAgXCJcXHgxN1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXFx4MThcIiwgIFwiXFx4MTlcIiwgIFwiXFx4MWFcIiwgIFwiXFx4MWJcIiwgIFwiXFx4MWNcIiwgIFwiXFx4MWRcIiwgIFwiXFx4MWVcIiwgIFwiXFx4MWZcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoY2ggPSBTdHJpbmcuZnJvbUNoYXJDb2RlKSgweDAwODUpLCBjaCgweDAwQTApLCBjaCgweDIwMjgpLCBjaCgweDIwMjkpXVxuICAgIEBMSVNUX0VTQ0FQRUQ6ICAgICAgICAgICAgICAgICAgWydcXFxcXCInLCAnXFxcXFxcXFwnLCAnXFxcXFwiJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlxcXFwwXCIsICAgXCJcXFxceDAxXCIsIFwiXFxcXHgwMlwiLCBcIlxcXFx4MDNcIiwgXCJcXFxceDA0XCIsIFwiXFxcXHgwNVwiLCBcIlxcXFx4MDZcIiwgXCJcXFxcYVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXFxcXGJcIiwgICBcIlxcXFx0XCIsICAgXCJcXFxcblwiLCAgIFwiXFxcXHZcIiwgICBcIlxcXFxmXCIsICAgXCJcXFxcclwiLCAgIFwiXFxcXHgwZVwiLCBcIlxcXFx4MGZcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlxcXFx4MTBcIiwgXCJcXFxceDExXCIsIFwiXFxcXHgxMlwiLCBcIlxcXFx4MTNcIiwgXCJcXFxceDE0XCIsIFwiXFxcXHgxNVwiLCBcIlxcXFx4MTZcIiwgXCJcXFxceDE3XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcXFxceDE4XCIsIFwiXFxcXHgxOVwiLCBcIlxcXFx4MWFcIiwgXCJcXFxcZVwiLCAgIFwiXFxcXHgxY1wiLCBcIlxcXFx4MWRcIiwgXCJcXFxceDFlXCIsIFwiXFxcXHgxZlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXFxcXE5cIiwgXCJcXFxcX1wiLCBcIlxcXFxMXCIsIFwiXFxcXFBcIl1cblxuICAgIEBNQVBQSU5HX0VTQ0FQRUVTX1RPX0VTQ0FQRUQ6ICAgZG8gPT5cbiAgICAgICAgbWFwcGluZyA9IHt9XG4gICAgICAgIGZvciBpIGluIFswLi4uQExJU1RfRVNDQVBFRVMubGVuZ3RoXVxuICAgICAgICAgICAgbWFwcGluZ1tATElTVF9FU0NBUEVFU1tpXV0gPSBATElTVF9FU0NBUEVEW2ldXG4gICAgICAgIHJldHVybiBtYXBwaW5nIFxuXG4gICAgIyBDaGFyYWN0ZXJzIHRoYXQgd291bGQgY2F1c2UgYSBkdW1wZWQgc3RyaW5nIHRvIHJlcXVpcmUgZG91YmxlIHF1b3RpbmcuXG4gICAgQFBBVFRFUk5fQ0hBUkFDVEVSU19UT19FU0NBUEU6ICBuZXcgUGF0dGVybiAnW1xcXFx4MDAtXFxcXHgxZl18XFx4YzJcXHg4NXxcXHhjMlxceGEwfFxceGUyXFx4ODBcXHhhOHxcXHhlMlxceDgwXFx4YTknXG5cbiAgICAjIE90aGVyIHByZWNvbXBpbGVkIHBhdHRlcm5zXG4gICAgQFBBVFRFUk5fTUFQUElOR19FU0NBUEVFUzogICAgICBuZXcgUGF0dGVybiBATElTVF9FU0NBUEVFUy5qb2luKCd8JylcbiAgICBAUEFUVEVSTl9TSU5HTEVfUVVPVElORzogICAgICAgIG5ldyBQYXR0ZXJuICdbXFxcXHNcXCdcIjp7fVtcXFxcXSwmKiM/XXxeWy0/fDw+PSElQGBdJ1xuXG5cblxuICAgICMgRGV0ZXJtaW5lcyBpZiBhIEphdmFTY3JpcHQgdmFsdWUgd291bGQgcmVxdWlyZSBkb3VibGUgcXVvdGluZyBpbiBZQU1MLlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIHZhbHVlICAgQSBKYXZhU2NyaXB0IHZhbHVlIHZhbHVlXG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gdHJ1ZSAgICBpZiB0aGUgdmFsdWUgd291bGQgcmVxdWlyZSBkb3VibGUgcXVvdGVzLlxuICAgICNcbiAgICBAcmVxdWlyZXNEb3VibGVRdW90aW5nOiAodmFsdWUpIC0+XG4gICAgICAgIHJldHVybiBAUEFUVEVSTl9DSEFSQUNURVJTX1RPX0VTQ0FQRS50ZXN0IHZhbHVlXG5cblxuICAgICMgRXNjYXBlcyBhbmQgc3Vycm91bmRzIGEgSmF2YVNjcmlwdCB2YWx1ZSB3aXRoIGRvdWJsZSBxdW90ZXMuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgdmFsdWUgICBBIEphdmFTY3JpcHQgdmFsdWVcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddICBUaGUgcXVvdGVkLCBlc2NhcGVkIHN0cmluZ1xuICAgICNcbiAgICBAZXNjYXBlV2l0aERvdWJsZVF1b3RlczogKHZhbHVlKSAtPlxuICAgICAgICByZXN1bHQgPSBAUEFUVEVSTl9NQVBQSU5HX0VTQ0FQRUVTLnJlcGxhY2UgdmFsdWUsIChzdHIpID0+XG4gICAgICAgICAgICByZXR1cm4gQE1BUFBJTkdfRVNDQVBFRVNfVE9fRVNDQVBFRFtzdHJdXG4gICAgICAgIHJldHVybiAnXCInK3Jlc3VsdCsnXCInXG5cblxuICAgICMgRGV0ZXJtaW5lcyBpZiBhIEphdmFTY3JpcHQgdmFsdWUgd291bGQgcmVxdWlyZSBzaW5nbGUgcXVvdGluZyBpbiBZQU1MLlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIHZhbHVlICAgQSBKYXZhU2NyaXB0IHZhbHVlXG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gdHJ1ZSBpZiB0aGUgdmFsdWUgd291bGQgcmVxdWlyZSBzaW5nbGUgcXVvdGVzLlxuICAgICNcbiAgICBAcmVxdWlyZXNTaW5nbGVRdW90aW5nOiAodmFsdWUpIC0+XG4gICAgICAgIHJldHVybiBAUEFUVEVSTl9TSU5HTEVfUVVPVElORy50ZXN0IHZhbHVlXG5cblxuICAgICMgRXNjYXBlcyBhbmQgc3Vycm91bmRzIGEgSmF2YVNjcmlwdCB2YWx1ZSB3aXRoIHNpbmdsZSBxdW90ZXMuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgdmFsdWUgICBBIEphdmFTY3JpcHQgdmFsdWVcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddICBUaGUgcXVvdGVkLCBlc2NhcGVkIHN0cmluZ1xuICAgICNcbiAgICBAZXNjYXBlV2l0aFNpbmdsZVF1b3RlczogKHZhbHVlKSAtPlxuICAgICAgICByZXR1cm4gXCInXCIrdmFsdWUucmVwbGFjZSgvJy9nLCBcIicnXCIpK1wiJ1wiXG5cblxubW9kdWxlLmV4cG9ydHMgPSBFc2NhcGVyXG5cbiIsIlxuY2xhc3MgRHVtcEV4Y2VwdGlvbiBleHRlbmRzIEVycm9yXG5cbiAgICBjb25zdHJ1Y3RvcjogKEBtZXNzYWdlLCBAcGFyc2VkTGluZSwgQHNuaXBwZXQpIC0+XG5cbiAgICB0b1N0cmluZzogLT5cbiAgICAgICAgaWYgQHBhcnNlZExpbmU/IGFuZCBAc25pcHBldD9cbiAgICAgICAgICAgIHJldHVybiAnPER1bXBFeGNlcHRpb24+ICcgKyBAbWVzc2FnZSArICcgKGxpbmUgJyArIEBwYXJzZWRMaW5lICsgJzogXFwnJyArIEBzbmlwcGV0ICsgJ1xcJyknXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiAnPER1bXBFeGNlcHRpb24+ICcgKyBAbWVzc2FnZVxuXG5tb2R1bGUuZXhwb3J0cyA9IER1bXBFeGNlcHRpb25cbiIsIlxuY2xhc3MgUGFyc2VFeGNlcHRpb24gZXh0ZW5kcyBFcnJvclxuXG4gICAgY29uc3RydWN0b3I6IChAbWVzc2FnZSwgQHBhcnNlZExpbmUsIEBzbmlwcGV0KSAtPlxuXG4gICAgdG9TdHJpbmc6IC0+XG4gICAgICAgIGlmIEBwYXJzZWRMaW5lPyBhbmQgQHNuaXBwZXQ/XG4gICAgICAgICAgICByZXR1cm4gJzxQYXJzZUV4Y2VwdGlvbj4gJyArIEBtZXNzYWdlICsgJyAobGluZSAnICsgQHBhcnNlZExpbmUgKyAnOiBcXCcnICsgQHNuaXBwZXQgKyAnXFwnKSdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuICc8UGFyc2VFeGNlcHRpb24+ICcgKyBAbWVzc2FnZVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnNlRXhjZXB0aW9uXG4iLCJcblBhdHRlcm4gICAgICAgICA9IHJlcXVpcmUgJy4vUGF0dGVybidcblVuZXNjYXBlciAgICAgICA9IHJlcXVpcmUgJy4vVW5lc2NhcGVyJ1xuRXNjYXBlciAgICAgICAgID0gcmVxdWlyZSAnLi9Fc2NhcGVyJ1xuVXRpbHMgICAgICAgICAgID0gcmVxdWlyZSAnLi9VdGlscydcblBhcnNlRXhjZXB0aW9uICA9IHJlcXVpcmUgJy4vRXhjZXB0aW9uL1BhcnNlRXhjZXB0aW9uJ1xuRHVtcEV4Y2VwdGlvbiAgID0gcmVxdWlyZSAnLi9FeGNlcHRpb24vRHVtcEV4Y2VwdGlvbidcblxuIyBJbmxpbmUgWUFNTCBwYXJzaW5nIGFuZCBkdW1waW5nXG5jbGFzcyBJbmxpbmVcblxuICAgICMgUXVvdGVkIHN0cmluZyByZWd1bGFyIGV4cHJlc3Npb25cbiAgICBAUkVHRVhfUVVPVEVEX1NUUklORzogICAgICAgICAgICAgICAnKD86XCIoPzpbXlwiXFxcXFxcXFxdKig/OlxcXFxcXFxcLlteXCJcXFxcXFxcXF0qKSopXCJ8XFwnKD86W15cXCddKig/OlxcJ1xcJ1teXFwnXSopKilcXCcpJ1xuXG4gICAgIyBQcmUtY29tcGlsZWQgcGF0dGVybnNcbiAgICAjXG4gICAgQFBBVFRFUk5fVFJBSUxJTkdfQ09NTUVOVFM6ICAgICAgICAgbmV3IFBhdHRlcm4gJ15cXFxccyojLiokJ1xuICAgIEBQQVRURVJOX1FVT1RFRF9TQ0FMQVI6ICAgICAgICAgICAgIG5ldyBQYXR0ZXJuICdeJytAUkVHRVhfUVVPVEVEX1NUUklOR1xuICAgIEBQQVRURVJOX1RIT1VTQU5EX05VTUVSSUNfU0NBTEFSOiAgIG5ldyBQYXR0ZXJuICdeKC18XFxcXCspP1swLTksXSsoXFxcXC5bMC05XSspPyQnXG4gICAgQFBBVFRFUk5fU0NBTEFSX0JZX0RFTElNSVRFUlM6ICAgICAge31cblxuICAgICMgU2V0dGluZ3NcbiAgICBAc2V0dGluZ3M6IHt9XG5cblxuICAgICMgQ29uZmlndXJlIFlBTUwgaW5saW5lLlxuICAgICNcbiAgICAjIEBwYXJhbSBbQm9vbGVhbl0gIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgIHRydWUgaWYgYW4gZXhjZXB0aW9uIG11c3QgYmUgdGhyb3duIG9uIGludmFsaWQgdHlwZXMgKGEgSmF2YVNjcmlwdCByZXNvdXJjZSBvciBvYmplY3QpLCBmYWxzZSBvdGhlcndpc2VcbiAgICAjIEBwYXJhbSBbRnVuY3Rpb25dIG9iamVjdERlY29kZXIgICAgICAgICAgIEEgZnVuY3Rpb24gdG8gZGVzZXJpYWxpemUgY3VzdG9tIG9iamVjdHMsIG51bGwgb3RoZXJ3aXNlXG4gICAgI1xuICAgIEBjb25maWd1cmU6IChleGNlcHRpb25PbkludmFsaWRUeXBlID0gbnVsbCwgb2JqZWN0RGVjb2RlciA9IG51bGwpIC0+XG4gICAgICAgICMgVXBkYXRlIHNldHRpbmdzXG4gICAgICAgIEBzZXR0aW5ncy5leGNlcHRpb25PbkludmFsaWRUeXBlID0gZXhjZXB0aW9uT25JbnZhbGlkVHlwZVxuICAgICAgICBAc2V0dGluZ3Mub2JqZWN0RGVjb2RlciA9IG9iamVjdERlY29kZXJcbiAgICAgICAgcmV0dXJuXG5cblxuICAgICMgQ29udmVydHMgYSBZQU1MIHN0cmluZyB0byBhIEphdmFTY3JpcHQgb2JqZWN0LlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIHZhbHVlICAgICAgICAgICAgICAgICAgIEEgWUFNTCBzdHJpbmdcbiAgICAjIEBwYXJhbSBbQm9vbGVhbl0gIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgIHRydWUgaWYgYW4gZXhjZXB0aW9uIG11c3QgYmUgdGhyb3duIG9uIGludmFsaWQgdHlwZXMgKGEgSmF2YVNjcmlwdCByZXNvdXJjZSBvciBvYmplY3QpLCBmYWxzZSBvdGhlcndpc2VcbiAgICAjIEBwYXJhbSBbRnVuY3Rpb25dIG9iamVjdERlY29kZXIgICAgICAgICAgIEEgZnVuY3Rpb24gdG8gZGVzZXJpYWxpemUgY3VzdG9tIG9iamVjdHMsIG51bGwgb3RoZXJ3aXNlXG4gICAgI1xuICAgICMgQHJldHVybiBbT2JqZWN0XSAgQSBKYXZhU2NyaXB0IG9iamVjdCByZXByZXNlbnRpbmcgdGhlIFlBTUwgc3RyaW5nXG4gICAgI1xuICAgICMgQHRocm93IFtQYXJzZUV4Y2VwdGlvbl1cbiAgICAjXG4gICAgQHBhcnNlOiAodmFsdWUsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgPSBmYWxzZSwgb2JqZWN0RGVjb2RlciA9IG51bGwpIC0+XG4gICAgICAgICMgVXBkYXRlIHNldHRpbmdzIGZyb20gbGFzdCBjYWxsIG9mIElubGluZS5wYXJzZSgpXG4gICAgICAgIEBzZXR0aW5ncy5leGNlcHRpb25PbkludmFsaWRUeXBlID0gZXhjZXB0aW9uT25JbnZhbGlkVHlwZVxuICAgICAgICBAc2V0dGluZ3Mub2JqZWN0RGVjb2RlciA9IG9iamVjdERlY29kZXJcblxuICAgICAgICBpZiBub3QgdmFsdWU/XG4gICAgICAgICAgICByZXR1cm4gJydcblxuICAgICAgICB2YWx1ZSA9IFV0aWxzLnRyaW0gdmFsdWVcblxuICAgICAgICBpZiAwIGlzIHZhbHVlLmxlbmd0aFxuICAgICAgICAgICAgcmV0dXJuICcnXG5cbiAgICAgICAgIyBLZWVwIGEgY29udGV4dCBvYmplY3QgdG8gcGFzcyB0aHJvdWdoIHN0YXRpYyBtZXRob2RzXG4gICAgICAgIGNvbnRleHQgPSB7ZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlciwgaTogMH1cblxuICAgICAgICBzd2l0Y2ggdmFsdWUuY2hhckF0KDApXG4gICAgICAgICAgICB3aGVuICdbJ1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IEBwYXJzZVNlcXVlbmNlIHZhbHVlLCBjb250ZXh0XG4gICAgICAgICAgICAgICAgKytjb250ZXh0LmlcbiAgICAgICAgICAgIHdoZW4gJ3snXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gQHBhcnNlTWFwcGluZyB2YWx1ZSwgY29udGV4dFxuICAgICAgICAgICAgICAgICsrY29udGV4dC5pXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gQHBhcnNlU2NhbGFyIHZhbHVlLCBudWxsLCBbJ1wiJywgXCInXCJdLCBjb250ZXh0XG5cbiAgICAgICAgIyBTb21lIGNvbW1lbnRzIGFyZSBhbGxvd2VkIGF0IHRoZSBlbmRcbiAgICAgICAgaWYgQFBBVFRFUk5fVFJBSUxJTkdfQ09NTUVOVFMucmVwbGFjZSh2YWx1ZVtjb250ZXh0LmkuLl0sICcnKSBpc250ICcnXG4gICAgICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24gJ1VuZXhwZWN0ZWQgY2hhcmFjdGVycyBuZWFyIFwiJyt2YWx1ZVtjb250ZXh0LmkuLl0rJ1wiLidcblxuICAgICAgICByZXR1cm4gcmVzdWx0XG5cblxuICAgICMgRHVtcHMgYSBnaXZlbiBKYXZhU2NyaXB0IHZhcmlhYmxlIHRvIGEgWUFNTCBzdHJpbmcuXG4gICAgI1xuICAgICMgQHBhcmFtIFtPYmplY3RdICAgdmFsdWUgICAgICAgICAgICAgICAgICAgVGhlIEphdmFTY3JpcHQgdmFyaWFibGUgdG8gY29udmVydFxuICAgICMgQHBhcmFtIFtCb29sZWFuXSAgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSAgdHJ1ZSBpZiBhbiBleGNlcHRpb24gbXVzdCBiZSB0aHJvd24gb24gaW52YWxpZCB0eXBlcyAoYSBKYXZhU2NyaXB0IHJlc291cmNlIG9yIG9iamVjdCksIGZhbHNlIG90aGVyd2lzZVxuICAgICMgQHBhcmFtIFtGdW5jdGlvbl0gb2JqZWN0RW5jb2RlciAgICAgICAgICAgQSBmdW5jdGlvbiB0byBzZXJpYWxpemUgY3VzdG9tIG9iamVjdHMsIG51bGwgb3RoZXJ3aXNlXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgVGhlIFlBTUwgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgSmF2YVNjcmlwdCBvYmplY3RcbiAgICAjXG4gICAgIyBAdGhyb3cgW0R1bXBFeGNlcHRpb25dXG4gICAgI1xuICAgIEBkdW1wOiAodmFsdWUsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgPSBmYWxzZSwgb2JqZWN0RW5jb2RlciA9IG51bGwpIC0+XG4gICAgICAgIGlmIG5vdCB2YWx1ZT9cbiAgICAgICAgICAgIHJldHVybiAnbnVsbCdcbiAgICAgICAgdHlwZSA9IHR5cGVvZiB2YWx1ZVxuICAgICAgICBpZiB0eXBlIGlzICdvYmplY3QnXG4gICAgICAgICAgICBpZiB2YWx1ZSBpbnN0YW5jZW9mIERhdGVcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgZWxzZSBpZiBvYmplY3RFbmNvZGVyP1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IG9iamVjdEVuY29kZXIgdmFsdWVcbiAgICAgICAgICAgICAgICBpZiB0eXBlb2YgcmVzdWx0IGlzICdzdHJpbmcnIG9yIHJlc3VsdD9cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgICAgICAgcmV0dXJuIEBkdW1wT2JqZWN0IHZhbHVlXG4gICAgICAgIGlmIHR5cGUgaXMgJ2Jvb2xlYW4nXG4gICAgICAgICAgICByZXR1cm4gKGlmIHZhbHVlIHRoZW4gJ3RydWUnIGVsc2UgJ2ZhbHNlJylcbiAgICAgICAgaWYgVXRpbHMuaXNEaWdpdHModmFsdWUpXG4gICAgICAgICAgICByZXR1cm4gKGlmIHR5cGUgaXMgJ3N0cmluZycgdGhlbiBcIidcIit2YWx1ZStcIidcIiBlbHNlIFN0cmluZyhwYXJzZUludCh2YWx1ZSkpKVxuICAgICAgICBpZiBVdGlscy5pc051bWVyaWModmFsdWUpXG4gICAgICAgICAgICByZXR1cm4gKGlmIHR5cGUgaXMgJ3N0cmluZycgdGhlbiBcIidcIit2YWx1ZStcIidcIiBlbHNlIFN0cmluZyhwYXJzZUZsb2F0KHZhbHVlKSkpXG4gICAgICAgIGlmIHR5cGUgaXMgJ251bWJlcidcbiAgICAgICAgICAgIHJldHVybiAoaWYgdmFsdWUgaXMgSW5maW5pdHkgdGhlbiAnLkluZicgZWxzZSAoaWYgdmFsdWUgaXMgLUluZmluaXR5IHRoZW4gJy0uSW5mJyBlbHNlIChpZiBpc05hTih2YWx1ZSkgdGhlbiAnLk5hTicgZWxzZSB2YWx1ZSkpKVxuICAgICAgICBpZiBFc2NhcGVyLnJlcXVpcmVzRG91YmxlUXVvdGluZyB2YWx1ZVxuICAgICAgICAgICAgcmV0dXJuIEVzY2FwZXIuZXNjYXBlV2l0aERvdWJsZVF1b3RlcyB2YWx1ZVxuICAgICAgICBpZiBFc2NhcGVyLnJlcXVpcmVzU2luZ2xlUXVvdGluZyB2YWx1ZVxuICAgICAgICAgICAgcmV0dXJuIEVzY2FwZXIuZXNjYXBlV2l0aFNpbmdsZVF1b3RlcyB2YWx1ZVxuICAgICAgICBpZiAnJyBpcyB2YWx1ZVxuICAgICAgICAgICAgcmV0dXJuICdcIlwiJ1xuICAgICAgICBpZiBVdGlscy5QQVRURVJOX0RBVEUudGVzdCB2YWx1ZVxuICAgICAgICAgICAgcmV0dXJuIFwiJ1wiK3ZhbHVlK1wiJ1wiO1xuICAgICAgICBpZiB2YWx1ZS50b0xvd2VyQ2FzZSgpIGluIFsnbnVsbCcsJ34nLCd0cnVlJywnZmFsc2UnXVxuICAgICAgICAgICAgcmV0dXJuIFwiJ1wiK3ZhbHVlK1wiJ1wiXG4gICAgICAgICMgRGVmYXVsdFxuICAgICAgICByZXR1cm4gdmFsdWU7XG5cblxuICAgICMgRHVtcHMgYSBKYXZhU2NyaXB0IG9iamVjdCB0byBhIFlBTUwgc3RyaW5nLlxuICAgICNcbiAgICAjIEBwYXJhbSBbT2JqZWN0XSAgIHZhbHVlICAgICAgICAgICAgICAgICAgIFRoZSBKYXZhU2NyaXB0IG9iamVjdCB0byBkdW1wXG4gICAgIyBAcGFyYW0gW0Jvb2xlYW5dICBleGNlcHRpb25PbkludmFsaWRUeXBlICB0cnVlIGlmIGFuIGV4Y2VwdGlvbiBtdXN0IGJlIHRocm93biBvbiBpbnZhbGlkIHR5cGVzIChhIEphdmFTY3JpcHQgcmVzb3VyY2Ugb3Igb2JqZWN0KSwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgIyBAcGFyYW0gW0Z1bmN0aW9uXSBvYmplY3RFbmNvZGVyICAgICAgICAgICBBIGZ1bmN0aW9uIGRvIHNlcmlhbGl6ZSBjdXN0b20gb2JqZWN0cywgbnVsbCBvdGhlcndpc2VcbiAgICAjXG4gICAgIyBAcmV0dXJuIHN0cmluZyBUaGUgWUFNTCBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBKYXZhU2NyaXB0IG9iamVjdFxuICAgICNcbiAgICBAZHVtcE9iamVjdDogKHZhbHVlLCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3RTdXBwb3J0ID0gbnVsbCkgLT5cbiAgICAgICAgIyBBcnJheVxuICAgICAgICBpZiB2YWx1ZSBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICBvdXRwdXQgPSBbXVxuICAgICAgICAgICAgZm9yIHZhbCBpbiB2YWx1ZVxuICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoIEBkdW1wIHZhbFxuICAgICAgICAgICAgcmV0dXJuICdbJytvdXRwdXQuam9pbignLCAnKSsnXSdcblxuICAgICAgICAjIE1hcHBpbmdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgb3V0cHV0ID0gW11cbiAgICAgICAgICAgIGZvciBrZXksIHZhbCBvZiB2YWx1ZVxuICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoIEBkdW1wKGtleSkrJzogJytAZHVtcCh2YWwpXG4gICAgICAgICAgICByZXR1cm4gJ3snK291dHB1dC5qb2luKCcsICcpKyd9J1xuXG5cbiAgICAjIFBhcnNlcyBhIHNjYWxhciB0byBhIFlBTUwgc3RyaW5nLlxuICAgICNcbiAgICAjIEBwYXJhbSBbT2JqZWN0XSAgIHNjYWxhclxuICAgICMgQHBhcmFtIFtBcnJheV0gICAgZGVsaW1pdGVyc1xuICAgICMgQHBhcmFtIFtBcnJheV0gICAgc3RyaW5nRGVsaW1pdGVyc1xuICAgICMgQHBhcmFtIFtPYmplY3RdICAgY29udGV4dFxuICAgICMgQHBhcmFtIFtCb29sZWFuXSAgZXZhbHVhdGVcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddICBBIFlBTUwgc3RyaW5nXG4gICAgI1xuICAgICMgQHRocm93IFtQYXJzZUV4Y2VwdGlvbl0gV2hlbiBtYWxmb3JtZWQgaW5saW5lIFlBTUwgc3RyaW5nIGlzIHBhcnNlZFxuICAgICNcbiAgICBAcGFyc2VTY2FsYXI6IChzY2FsYXIsIGRlbGltaXRlcnMgPSBudWxsLCBzdHJpbmdEZWxpbWl0ZXJzID0gWydcIicsIFwiJ1wiXSwgY29udGV4dCA9IG51bGwsIGV2YWx1YXRlID0gdHJ1ZSkgLT5cbiAgICAgICAgdW5sZXNzIGNvbnRleHQ/XG4gICAgICAgICAgICBjb250ZXh0ID0gZXhjZXB0aW9uT25JbnZhbGlkVHlwZTogQHNldHRpbmdzLmV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXI6IEBzZXR0aW5ncy5vYmplY3REZWNvZGVyLCBpOiAwXG4gICAgICAgIHtpfSA9IGNvbnRleHRcblxuICAgICAgICBpZiBzY2FsYXIuY2hhckF0KGkpIGluIHN0cmluZ0RlbGltaXRlcnNcbiAgICAgICAgICAgICMgUXVvdGVkIHNjYWxhclxuICAgICAgICAgICAgb3V0cHV0ID0gQHBhcnNlUXVvdGVkU2NhbGFyIHNjYWxhciwgY29udGV4dFxuICAgICAgICAgICAge2l9ID0gY29udGV4dFxuXG4gICAgICAgICAgICBpZiBkZWxpbWl0ZXJzP1xuICAgICAgICAgICAgICAgIHRtcCA9IFV0aWxzLmx0cmltIHNjYWxhcltpLi5dLCAnICdcbiAgICAgICAgICAgICAgICBpZiBub3QodG1wLmNoYXJBdCgwKSBpbiBkZWxpbWl0ZXJzKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24gJ1VuZXhwZWN0ZWQgY2hhcmFjdGVycyAoJytzY2FsYXJbaS4uXSsnKS4nXG5cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgIyBcIm5vcm1hbFwiIHN0cmluZ1xuICAgICAgICAgICAgaWYgbm90IGRlbGltaXRlcnNcbiAgICAgICAgICAgICAgICBvdXRwdXQgPSBzY2FsYXJbaS4uXVxuICAgICAgICAgICAgICAgIGkgKz0gb3V0cHV0Lmxlbmd0aFxuXG4gICAgICAgICAgICAgICAgIyBSZW1vdmUgY29tbWVudHNcbiAgICAgICAgICAgICAgICBzdHJwb3MgPSBvdXRwdXQuaW5kZXhPZiAnICMnXG4gICAgICAgICAgICAgICAgaWYgc3RycG9zIGlzbnQgLTFcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0ID0gVXRpbHMucnRyaW0gb3V0cHV0WzAuLi5zdHJwb3NdXG5cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBqb2luZWREZWxpbWl0ZXJzID0gZGVsaW1pdGVycy5qb2luKCd8JylcbiAgICAgICAgICAgICAgICBwYXR0ZXJuID0gQFBBVFRFUk5fU0NBTEFSX0JZX0RFTElNSVRFUlNbam9pbmVkRGVsaW1pdGVyc11cbiAgICAgICAgICAgICAgICB1bmxlc3MgcGF0dGVybj9cbiAgICAgICAgICAgICAgICAgICAgcGF0dGVybiA9IG5ldyBQYXR0ZXJuICdeKC4rPykoJytqb2luZWREZWxpbWl0ZXJzKycpJ1xuICAgICAgICAgICAgICAgICAgICBAUEFUVEVSTl9TQ0FMQVJfQllfREVMSU1JVEVSU1tqb2luZWREZWxpbWl0ZXJzXSA9IHBhdHRlcm5cbiAgICAgICAgICAgICAgICBpZiBtYXRjaCA9IHBhdHRlcm4uZXhlYyBzY2FsYXJbaS4uXVxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQgPSBtYXRjaFsxXVxuICAgICAgICAgICAgICAgICAgICBpICs9IG91dHB1dC5sZW5ndGhcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnTWFsZm9ybWVkIGlubGluZSBZQU1MIHN0cmluZyAoJytzY2FsYXIrJykuJ1xuXG5cbiAgICAgICAgICAgIGlmIGV2YWx1YXRlXG4gICAgICAgICAgICAgICAgb3V0cHV0ID0gQGV2YWx1YXRlU2NhbGFyIG91dHB1dCwgY29udGV4dFxuXG4gICAgICAgIGNvbnRleHQuaSA9IGlcbiAgICAgICAgcmV0dXJuIG91dHB1dFxuXG5cbiAgICAjIFBhcnNlcyBhIHF1b3RlZCBzY2FsYXIgdG8gWUFNTC5cbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICBzY2FsYXJcbiAgICAjIEBwYXJhbSBbT2JqZWN0XSAgIGNvbnRleHRcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddICBBIFlBTUwgc3RyaW5nXG4gICAgI1xuICAgICMgQHRocm93IFtQYXJzZUV4Y2VwdGlvbl0gV2hlbiBtYWxmb3JtZWQgaW5saW5lIFlBTUwgc3RyaW5nIGlzIHBhcnNlZFxuICAgICNcbiAgICBAcGFyc2VRdW90ZWRTY2FsYXI6IChzY2FsYXIsIGNvbnRleHQpIC0+XG4gICAgICAgIHtpfSA9IGNvbnRleHRcblxuICAgICAgICB1bmxlc3MgbWF0Y2ggPSBAUEFUVEVSTl9RVU9URURfU0NBTEFSLmV4ZWMgc2NhbGFyW2kuLl1cbiAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnTWFsZm9ybWVkIGlubGluZSBZQU1MIHN0cmluZyAoJytzY2FsYXJbaS4uXSsnKS4nXG5cbiAgICAgICAgb3V0cHV0ID0gbWF0Y2hbMF0uc3Vic3RyKDEsIG1hdGNoWzBdLmxlbmd0aCAtIDIpXG5cbiAgICAgICAgaWYgJ1wiJyBpcyBzY2FsYXIuY2hhckF0KGkpXG4gICAgICAgICAgICBvdXRwdXQgPSBVbmVzY2FwZXIudW5lc2NhcGVEb3VibGVRdW90ZWRTdHJpbmcgb3V0cHV0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG91dHB1dCA9IFVuZXNjYXBlci51bmVzY2FwZVNpbmdsZVF1b3RlZFN0cmluZyBvdXRwdXRcblxuICAgICAgICBpICs9IG1hdGNoWzBdLmxlbmd0aFxuXG4gICAgICAgIGNvbnRleHQuaSA9IGlcbiAgICAgICAgcmV0dXJuIG91dHB1dFxuXG5cbiAgICAjIFBhcnNlcyBhIHNlcXVlbmNlIHRvIGEgWUFNTCBzdHJpbmcuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgc2VxdWVuY2VcbiAgICAjIEBwYXJhbSBbT2JqZWN0XSAgIGNvbnRleHRcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddICBBIFlBTUwgc3RyaW5nXG4gICAgI1xuICAgICMgQHRocm93IFtQYXJzZUV4Y2VwdGlvbl0gV2hlbiBtYWxmb3JtZWQgaW5saW5lIFlBTUwgc3RyaW5nIGlzIHBhcnNlZFxuICAgICNcbiAgICBAcGFyc2VTZXF1ZW5jZTogKHNlcXVlbmNlLCBjb250ZXh0KSAtPlxuICAgICAgICBvdXRwdXQgPSBbXVxuICAgICAgICBsZW4gPSBzZXF1ZW5jZS5sZW5ndGhcbiAgICAgICAge2l9ID0gY29udGV4dFxuICAgICAgICBpICs9IDFcblxuICAgICAgICAjIFtmb28sIGJhciwgLi4uXVxuICAgICAgICB3aGlsZSBpIDwgbGVuXG4gICAgICAgICAgICBjb250ZXh0LmkgPSBpXG4gICAgICAgICAgICBzd2l0Y2ggc2VxdWVuY2UuY2hhckF0KGkpXG4gICAgICAgICAgICAgICAgd2hlbiAnWydcbiAgICAgICAgICAgICAgICAgICAgIyBOZXN0ZWQgc2VxdWVuY2VcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2ggQHBhcnNlU2VxdWVuY2Ugc2VxdWVuY2UsIGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAge2l9ID0gY29udGV4dFxuICAgICAgICAgICAgICAgIHdoZW4gJ3snXG4gICAgICAgICAgICAgICAgICAgICMgTmVzdGVkIG1hcHBpbmdcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2ggQHBhcnNlTWFwcGluZyBzZXF1ZW5jZSwgY29udGV4dFxuICAgICAgICAgICAgICAgICAgICB7aX0gPSBjb250ZXh0XG4gICAgICAgICAgICAgICAgd2hlbiAnXSdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG91dHB1dFxuICAgICAgICAgICAgICAgIHdoZW4gJywnLCAnICcsIFwiXFxuXCJcbiAgICAgICAgICAgICAgICAgICAgIyBEbyBub3RoaW5nXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBpc1F1b3RlZCA9IChzZXF1ZW5jZS5jaGFyQXQoaSkgaW4gWydcIicsIFwiJ1wiXSlcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBAcGFyc2VTY2FsYXIgc2VxdWVuY2UsIFsnLCcsICddJ10sIFsnXCInLCBcIidcIl0sIGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAge2l9ID0gY29udGV4dFxuXG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdChpc1F1b3RlZCkgYW5kIHR5cGVvZih2YWx1ZSkgaXMgJ3N0cmluZycgYW5kICh2YWx1ZS5pbmRleE9mKCc6ICcpIGlzbnQgLTEgb3IgdmFsdWUuaW5kZXhPZihcIjpcXG5cIikgaXNudCAtMSlcbiAgICAgICAgICAgICAgICAgICAgICAgICMgRW1iZWRkZWQgbWFwcGluZz9cbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gQHBhcnNlTWFwcGluZyAneycrdmFsdWUrJ30nXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBObywgaXQncyBub3RcblxuXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoIHZhbHVlXG5cbiAgICAgICAgICAgICAgICAgICAgLS1pXG5cbiAgICAgICAgICAgICsraVxuXG4gICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnTWFsZm9ybWVkIGlubGluZSBZQU1MIHN0cmluZyAnK3NlcXVlbmNlXG5cblxuICAgICMgUGFyc2VzIGEgbWFwcGluZyB0byBhIFlBTUwgc3RyaW5nLlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIG1hcHBpbmdcbiAgICAjIEBwYXJhbSBbT2JqZWN0XSAgIGNvbnRleHRcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddICBBIFlBTUwgc3RyaW5nXG4gICAgI1xuICAgICMgQHRocm93IFtQYXJzZUV4Y2VwdGlvbl0gV2hlbiBtYWxmb3JtZWQgaW5saW5lIFlBTUwgc3RyaW5nIGlzIHBhcnNlZFxuICAgICNcbiAgICBAcGFyc2VNYXBwaW5nOiAobWFwcGluZywgY29udGV4dCkgLT5cbiAgICAgICAgb3V0cHV0ID0ge31cbiAgICAgICAgbGVuID0gbWFwcGluZy5sZW5ndGhcbiAgICAgICAge2l9ID0gY29udGV4dFxuICAgICAgICBpICs9IDFcblxuICAgICAgICAjIHtmb286IGJhciwgYmFyOmZvbywgLi4ufVxuICAgICAgICBzaG91bGRDb250aW51ZVdoaWxlTG9vcCA9IGZhbHNlXG4gICAgICAgIHdoaWxlIGkgPCBsZW5cbiAgICAgICAgICAgIGNvbnRleHQuaSA9IGlcbiAgICAgICAgICAgIHN3aXRjaCBtYXBwaW5nLmNoYXJBdChpKVxuICAgICAgICAgICAgICAgIHdoZW4gJyAnLCAnLCcsIFwiXFxuXCJcbiAgICAgICAgICAgICAgICAgICAgKytpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuaSA9IGlcbiAgICAgICAgICAgICAgICAgICAgc2hvdWxkQ29udGludWVXaGlsZUxvb3AgPSB0cnVlXG4gICAgICAgICAgICAgICAgd2hlbiAnfSdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG91dHB1dFxuXG4gICAgICAgICAgICBpZiBzaG91bGRDb250aW51ZVdoaWxlTG9vcFxuICAgICAgICAgICAgICAgIHNob3VsZENvbnRpbnVlV2hpbGVMb29wID0gZmFsc2VcbiAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICAjIEtleVxuICAgICAgICAgICAga2V5ID0gQHBhcnNlU2NhbGFyIG1hcHBpbmcsIFsnOicsICcgJywgXCJcXG5cIl0sIFsnXCInLCBcIidcIl0sIGNvbnRleHQsIGZhbHNlXG4gICAgICAgICAgICB7aX0gPSBjb250ZXh0XG5cbiAgICAgICAgICAgICMgVmFsdWVcbiAgICAgICAgICAgIGRvbmUgPSBmYWxzZVxuXG4gICAgICAgICAgICB3aGlsZSBpIDwgbGVuXG4gICAgICAgICAgICAgICAgY29udGV4dC5pID0gaVxuICAgICAgICAgICAgICAgIHN3aXRjaCBtYXBwaW5nLmNoYXJBdChpKVxuICAgICAgICAgICAgICAgICAgICB3aGVuICdbJ1xuICAgICAgICAgICAgICAgICAgICAgICAgIyBOZXN0ZWQgc2VxdWVuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gQHBhcnNlU2VxdWVuY2UgbWFwcGluZywgY29udGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAge2l9ID0gY29udGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgIyBTcGVjOiBLZXlzIE1VU1QgYmUgdW5pcXVlOyBmaXJzdCBvbmUgd2lucy5cbiAgICAgICAgICAgICAgICAgICAgICAgICMgUGFyc2VyIGNhbm5vdCBhYm9ydCB0aGlzIG1hcHBpbmcgZWFybGllciwgc2luY2UgbGluZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICMgYXJlIHByb2Nlc3NlZCBzZXF1ZW50aWFsbHkuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBvdXRwdXRba2V5XSA9PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRba2V5XSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICBkb25lID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB3aGVuICd7J1xuICAgICAgICAgICAgICAgICAgICAgICAgIyBOZXN0ZWQgbWFwcGluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBAcGFyc2VNYXBwaW5nIG1hcHBpbmcsIGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIHtpfSA9IGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgICMgU3BlYzogS2V5cyBNVVNUIGJlIHVuaXF1ZTsgZmlyc3Qgb25lIHdpbnMuXG4gICAgICAgICAgICAgICAgICAgICAgICAjIFBhcnNlciBjYW5ub3QgYWJvcnQgdGhpcyBtYXBwaW5nIGVhcmxpZXIsIHNpbmNlIGxpbmVzXG4gICAgICAgICAgICAgICAgICAgICAgICAjIGFyZSBwcm9jZXNzZWQgc2VxdWVudGlhbGx5LlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgb3V0cHV0W2tleV0gPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0W2tleV0gPSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnOicsICcgJywgXCJcXG5cIlxuICAgICAgICAgICAgICAgICAgICAgICAgIyBEbyBub3RoaW5nXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gQHBhcnNlU2NhbGFyIG1hcHBpbmcsIFsnLCcsICd9J10sIFsnXCInLCBcIidcIl0sIGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIHtpfSA9IGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgICMgU3BlYzogS2V5cyBNVVNUIGJlIHVuaXF1ZTsgZmlyc3Qgb25lIHdpbnMuXG4gICAgICAgICAgICAgICAgICAgICAgICAjIFBhcnNlciBjYW5ub3QgYWJvcnQgdGhpcyBtYXBwaW5nIGVhcmxpZXIsIHNpbmNlIGxpbmVzXG4gICAgICAgICAgICAgICAgICAgICAgICAjIGFyZSBwcm9jZXNzZWQgc2VxdWVudGlhbGx5LlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgb3V0cHV0W2tleV0gPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0W2tleV0gPSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIC0taVxuXG4gICAgICAgICAgICAgICAgKytpXG5cbiAgICAgICAgICAgICAgICBpZiBkb25lXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdNYWxmb3JtZWQgaW5saW5lIFlBTUwgc3RyaW5nICcrbWFwcGluZ1xuXG5cbiAgICAjIEV2YWx1YXRlcyBzY2FsYXJzIGFuZCByZXBsYWNlcyBtYWdpYyB2YWx1ZXMuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgc2NhbGFyXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgQSBZQU1MIHN0cmluZ1xuICAgICNcbiAgICBAZXZhbHVhdGVTY2FsYXI6IChzY2FsYXIsIGNvbnRleHQpIC0+XG4gICAgICAgIHNjYWxhciA9IFV0aWxzLnRyaW0oc2NhbGFyKVxuICAgICAgICBzY2FsYXJMb3dlciA9IHNjYWxhci50b0xvd2VyQ2FzZSgpXG5cbiAgICAgICAgc3dpdGNoIHNjYWxhckxvd2VyXG4gICAgICAgICAgICB3aGVuICdudWxsJywgJycsICd+J1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgICAgICB3aGVuICd0cnVlJ1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICB3aGVuICdmYWxzZSdcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIHdoZW4gJy5pbmYnXG4gICAgICAgICAgICAgICAgcmV0dXJuIEluZmluaXR5XG4gICAgICAgICAgICB3aGVuICcubmFuJ1xuICAgICAgICAgICAgICAgIHJldHVybiBOYU5cbiAgICAgICAgICAgIHdoZW4gJy0uaW5mJ1xuICAgICAgICAgICAgICAgIHJldHVybiBJbmZpbml0eVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZpcnN0Q2hhciA9IHNjYWxhckxvd2VyLmNoYXJBdCgwKVxuICAgICAgICAgICAgICAgIHN3aXRjaCBmaXJzdENoYXJcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnISdcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0U3BhY2UgPSBzY2FsYXIuaW5kZXhPZignICcpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBmaXJzdFNwYWNlIGlzIC0xXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RXb3JkID0gc2NhbGFyTG93ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdFdvcmQgPSBzY2FsYXJMb3dlclswLi4uZmlyc3RTcGFjZV1cbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCBmaXJzdFdvcmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGVuICchJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBmaXJzdFNwYWNlIGlzbnQgLTFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUludCBAcGFyc2VTY2FsYXIoc2NhbGFyWzIuLl0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnIXN0cidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFV0aWxzLmx0cmltIHNjYWxhcls0Li5dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnISFzdHInXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBVdGlscy5sdHJpbSBzY2FsYXJbNS4uXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJyEhaW50J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VJbnQoQHBhcnNlU2NhbGFyKHNjYWxhcls1Li5dKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGVuICchIWJvb2wnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBVdGlscy5wYXJzZUJvb2xlYW4oQHBhcnNlU2NhbGFyKHNjYWxhcls2Li5dKSwgZmFsc2UpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnISFmbG9hdCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoQHBhcnNlU2NhbGFyKHNjYWxhcls3Li5dKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGVuICchIXRpbWVzdGFtcCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFV0aWxzLnN0cmluZ1RvRGF0ZShVdGlscy5sdHJpbShzY2FsYXJbMTEuLl0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5sZXNzIGNvbnRleHQ/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0ID0gZXhjZXB0aW9uT25JbnZhbGlkVHlwZTogQHNldHRpbmdzLmV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXI6IEBzZXR0aW5ncy5vYmplY3REZWNvZGVyLCBpOiAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtvYmplY3REZWNvZGVyLCBleGNlcHRpb25PbkludmFsaWRUeXBlfSA9IGNvbnRleHRcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBvYmplY3REZWNvZGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIElmIG9iamVjdERlY29kZXIgZnVuY3Rpb24gaXMgZ2l2ZW4sIHdlIGNhbiBkbyBjdXN0b20gZGVjb2Rpbmcgb2YgY3VzdG9tIHR5cGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmltbWVkU2NhbGFyID0gVXRpbHMucnRyaW0gc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdFNwYWNlID0gdHJpbW1lZFNjYWxhci5pbmRleE9mKCcgJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGZpcnN0U3BhY2UgaXMgLTFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2JqZWN0RGVjb2RlciB0cmltbWVkU2NhbGFyLCBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ViVmFsdWUgPSBVdGlscy5sdHJpbSB0cmltbWVkU2NhbGFyW2ZpcnN0U3BhY2UrMS4uXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVubGVzcyBzdWJWYWx1ZS5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YlZhbHVlID0gbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvYmplY3REZWNvZGVyIHRyaW1tZWRTY2FsYXJbMC4uLmZpcnN0U3BhY2VdLCBzdWJWYWx1ZVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnQ3VzdG9tIG9iamVjdCBzdXBwb3J0IHdoZW4gcGFyc2luZyBhIFlBTUwgZmlsZSBoYXMgYmVlbiBkaXNhYmxlZC4nXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnMCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICcweCcgaXMgc2NhbGFyWzAuLi4yXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBVdGlscy5oZXhEZWMgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIFV0aWxzLmlzRGlnaXRzIHNjYWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBVdGlscy5vY3REZWMgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIFV0aWxzLmlzTnVtZXJpYyBzY2FsYXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdCBzY2FsYXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJysnXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBVdGlscy5pc0RpZ2l0cyBzY2FsYXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByYXcgPSBzY2FsYXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXN0ID0gcGFyc2VJbnQocmF3KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHJhdyBpcyBTdHJpbmcoY2FzdClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByYXdcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgVXRpbHMuaXNOdW1lcmljIHNjYWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0IHNjYWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBAUEFUVEVSTl9USE9VU0FORF9OVU1FUklDX1NDQUxBUi50ZXN0IHNjYWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHNjYWxhci5yZXBsYWNlKCcsJywgJycpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNjYWxhclxuICAgICAgICAgICAgICAgICAgICB3aGVuICctJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgVXRpbHMuaXNEaWdpdHMoc2NhbGFyWzEuLl0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgJzAnIGlzIHNjYWxhci5jaGFyQXQoMSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC1VdGlscy5vY3REZWMoc2NhbGFyWzEuLl0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByYXcgPSBzY2FsYXJbMS4uXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXN0ID0gcGFyc2VJbnQocmF3KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiByYXcgaXMgU3RyaW5nKGNhc3QpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gLWNhc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC1yYXdcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgVXRpbHMuaXNOdW1lcmljIHNjYWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0IHNjYWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBAUEFUVEVSTl9USE9VU0FORF9OVU1FUklDX1NDQUxBUi50ZXN0IHNjYWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHNjYWxhci5yZXBsYWNlKCcsJywgJycpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNjYWxhclxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBkYXRlID0gVXRpbHMuc3RyaW5nVG9EYXRlKHNjYWxhcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBVdGlscy5pc051bWVyaWMoc2NhbGFyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0IHNjYWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBAUEFUVEVSTl9USE9VU0FORF9OVU1FUklDX1NDQUxBUi50ZXN0IHNjYWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHNjYWxhci5yZXBsYWNlKCcsJywgJycpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNjYWxhclxuXG5tb2R1bGUuZXhwb3J0cyA9IElubGluZVxuIiwiXG5JbmxpbmUgICAgICAgICAgPSByZXF1aXJlICcuL0lubGluZSdcblBhdHRlcm4gICAgICAgICA9IHJlcXVpcmUgJy4vUGF0dGVybidcblV0aWxzICAgICAgICAgICA9IHJlcXVpcmUgJy4vVXRpbHMnXG5QYXJzZUV4Y2VwdGlvbiAgPSByZXF1aXJlICcuL0V4Y2VwdGlvbi9QYXJzZUV4Y2VwdGlvbidcblxuIyBQYXJzZXIgcGFyc2VzIFlBTUwgc3RyaW5ncyB0byBjb252ZXJ0IHRoZW0gdG8gSmF2YVNjcmlwdCBvYmplY3RzLlxuI1xuY2xhc3MgUGFyc2VyXG5cbiAgICAjIFByZS1jb21waWxlZCBwYXR0ZXJuc1xuICAgICNcbiAgICBQQVRURVJOX0ZPTERFRF9TQ0FMQVJfQUxMOiAgICAgICAgICAgICAgbmV3IFBhdHRlcm4gJ14oPzooPzx0eXBlPiFbXlxcXFx8Pl0qKVxcXFxzKyk/KD88c2VwYXJhdG9yPlxcXFx8fD4pKD88bW9kaWZpZXJzPlxcXFwrfFxcXFwtfFxcXFxkK3xcXFxcK1xcXFxkK3xcXFxcLVxcXFxkK3xcXFxcZCtcXFxcK3xcXFxcZCtcXFxcLSk/KD88Y29tbWVudHM+ICsjLiopPyQnXG4gICAgUEFUVEVSTl9GT0xERURfU0NBTEFSX0VORDogICAgICAgICAgICAgIG5ldyBQYXR0ZXJuICcoPzxzZXBhcmF0b3I+XFxcXHx8PikoPzxtb2RpZmllcnM+XFxcXCt8XFxcXC18XFxcXGQrfFxcXFwrXFxcXGQrfFxcXFwtXFxcXGQrfFxcXFxkK1xcXFwrfFxcXFxkK1xcXFwtKT8oPzxjb21tZW50cz4gKyMuKik/JCdcbiAgICBQQVRURVJOX1NFUVVFTkNFX0lURU06ICAgICAgICAgICAgICAgICAgbmV3IFBhdHRlcm4gJ15cXFxcLSgoPzxsZWFkc3BhY2VzPlxcXFxzKykoPzx2YWx1ZT4uKz8pKT9cXFxccyokJ1xuICAgIFBBVFRFUk5fQU5DSE9SX1ZBTFVFOiAgICAgICAgICAgICAgICAgICBuZXcgUGF0dGVybiAnXiYoPzxyZWY+W14gXSspICooPzx2YWx1ZT4uKiknXG4gICAgUEFUVEVSTl9DT01QQUNUX05PVEFUSU9OOiAgICAgICAgICAgICAgIG5ldyBQYXR0ZXJuICdeKD88a2V5PicrSW5saW5lLlJFR0VYX1FVT1RFRF9TVFJJTkcrJ3xbXiBcXCdcIlxcXFx7XFxcXFtdLio/KSAqXFxcXDooXFxcXHMrKD88dmFsdWU+Lis/KSk/XFxcXHMqJCdcbiAgICBQQVRURVJOX01BUFBJTkdfSVRFTTogICAgICAgICAgICAgICAgICAgbmV3IFBhdHRlcm4gJ14oPzxrZXk+JytJbmxpbmUuUkVHRVhfUVVPVEVEX1NUUklORysnfFteIFxcJ1wiXFxcXFtcXFxce10uKj8pICpcXFxcOihcXFxccysoPzx2YWx1ZT4uKz8pKT9cXFxccyokJ1xuICAgIFBBVFRFUk5fREVDSU1BTDogICAgICAgICAgICAgICAgICAgICAgICBuZXcgUGF0dGVybiAnXFxcXGQrJ1xuICAgIFBBVFRFUk5fSU5ERU5UX1NQQUNFUzogICAgICAgICAgICAgICAgICBuZXcgUGF0dGVybiAnXiArJ1xuICAgIFBBVFRFUk5fVFJBSUxJTkdfTElORVM6ICAgICAgICAgICAgICAgICBuZXcgUGF0dGVybiAnKFxcbiopJCdcbiAgICBQQVRURVJOX1lBTUxfSEVBREVSOiAgICAgICAgICAgICAgICAgICAgbmV3IFBhdHRlcm4gJ15cXFxcJVlBTUxbOiBdW1xcXFxkXFxcXC5dKy4qXFxuJ1xuICAgIFBBVFRFUk5fTEVBRElOR19DT01NRU5UUzogICAgICAgICAgICAgICBuZXcgUGF0dGVybiAnXihcXFxcIy4qP1xcbikrJ1xuICAgIFBBVFRFUk5fRE9DVU1FTlRfTUFSS0VSX1NUQVJUOiAgICAgICAgICBuZXcgUGF0dGVybiAnXlxcXFwtXFxcXC1cXFxcLS4qP1xcbidcbiAgICBQQVRURVJOX0RPQ1VNRU5UX01BUktFUl9FTkQ6ICAgICAgICAgICAgbmV3IFBhdHRlcm4gJ15cXFxcLlxcXFwuXFxcXC5cXFxccyokJ1xuICAgIFBBVFRFUk5fRk9MREVEX1NDQUxBUl9CWV9JTkRFTlRBVElPTjogICB7fVxuXG4gICAgIyBDb250ZXh0IHR5cGVzXG4gICAgI1xuICAgIENPTlRFWFRfTk9ORTogICAgICAgMFxuICAgIENPTlRFWFRfU0VRVUVOQ0U6ICAgMVxuICAgIENPTlRFWFRfTUFQUElORzogICAgMlxuXG5cbiAgICAjIENvbnN0cnVjdG9yXG4gICAgI1xuICAgICMgQHBhcmFtIFtJbnRlZ2VyXSAgb2Zmc2V0ICBUaGUgb2Zmc2V0IG9mIFlBTUwgZG9jdW1lbnQgKHVzZWQgZm9yIGxpbmUgbnVtYmVycyBpbiBlcnJvciBtZXNzYWdlcylcbiAgICAjXG4gICAgY29uc3RydWN0b3I6IChAb2Zmc2V0ID0gMCkgLT5cbiAgICAgICAgQGxpbmVzICAgICAgICAgID0gW11cbiAgICAgICAgQGN1cnJlbnRMaW5lTmIgID0gLTFcbiAgICAgICAgQGN1cnJlbnRMaW5lICAgID0gJydcbiAgICAgICAgQHJlZnMgICAgICAgICAgID0ge31cblxuXG4gICAgIyBQYXJzZXMgYSBZQU1MIHN0cmluZyB0byBhIEphdmFTY3JpcHQgdmFsdWUuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgdmFsdWUgICAgICAgICAgICAgICAgICAgQSBZQU1MIHN0cmluZ1xuICAgICMgQHBhcmFtIFtCb29sZWFuXSAgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSAgdHJ1ZSBpZiBhbiBleGNlcHRpb24gbXVzdCBiZSB0aHJvd24gb24gaW52YWxpZCB0eXBlcyAoYSBKYXZhU2NyaXB0IHJlc291cmNlIG9yIG9iamVjdCksIGZhbHNlIG90aGVyd2lzZVxuICAgICMgQHBhcmFtIFtGdW5jdGlvbl0gb2JqZWN0RGVjb2RlciAgICAgICAgICAgQSBmdW5jdGlvbiB0byBkZXNlcmlhbGl6ZSBjdXN0b20gb2JqZWN0cywgbnVsbCBvdGhlcndpc2VcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtPYmplY3RdICBBIEphdmFTY3JpcHQgdmFsdWVcbiAgICAjXG4gICAgIyBAdGhyb3cgW1BhcnNlRXhjZXB0aW9uXSBJZiB0aGUgWUFNTCBpcyBub3QgdmFsaWRcbiAgICAjXG4gICAgcGFyc2U6ICh2YWx1ZSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSA9IGZhbHNlLCBvYmplY3REZWNvZGVyID0gbnVsbCkgLT5cbiAgICAgICAgQGN1cnJlbnRMaW5lTmIgPSAtMVxuICAgICAgICBAY3VycmVudExpbmUgPSAnJ1xuICAgICAgICBAbGluZXMgPSBAY2xlYW51cCh2YWx1ZSkuc3BsaXQgXCJcXG5cIlxuXG4gICAgICAgIGRhdGEgPSBudWxsXG4gICAgICAgIGNvbnRleHQgPSBAQ09OVEVYVF9OT05FXG4gICAgICAgIGFsbG93T3ZlcndyaXRlID0gZmFsc2VcbiAgICAgICAgd2hpbGUgQG1vdmVUb05leHRMaW5lKClcbiAgICAgICAgICAgIGlmIEBpc0N1cnJlbnRMaW5lRW1wdHkoKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgICMgVGFiP1xuICAgICAgICAgICAgaWYgXCJcXHRcIiBpcyBAY3VycmVudExpbmVbMF1cbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24gJ0EgWUFNTCBmaWxlIGNhbm5vdCBjb250YWluIHRhYnMgYXMgaW5kZW50YXRpb24uJywgQGdldFJlYWxDdXJyZW50TGluZU5iKCkgKyAxLCBAY3VycmVudExpbmVcblxuICAgICAgICAgICAgaXNSZWYgPSBtZXJnZU5vZGUgPSBmYWxzZVxuICAgICAgICAgICAgaWYgdmFsdWVzID0gQFBBVFRFUk5fU0VRVUVOQ0VfSVRFTS5leGVjIEBjdXJyZW50TGluZVxuICAgICAgICAgICAgICAgIGlmIEBDT05URVhUX01BUFBJTkcgaXMgY29udGV4dFxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24gJ1lvdSBjYW5ub3QgZGVmaW5lIGEgc2VxdWVuY2UgaXRlbSB3aGVuIGluIGEgbWFwcGluZydcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0gQENPTlRFWFRfU0VRVUVOQ0VcbiAgICAgICAgICAgICAgICBkYXRhID89IFtdXG5cbiAgICAgICAgICAgICAgICBpZiB2YWx1ZXMudmFsdWU/IGFuZCBtYXRjaGVzID0gQFBBVFRFUk5fQU5DSE9SX1ZBTFVFLmV4ZWMgdmFsdWVzLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGlzUmVmID0gbWF0Y2hlcy5yZWZcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzLnZhbHVlID0gbWF0Y2hlcy52YWx1ZVxuXG4gICAgICAgICAgICAgICAgIyBBcnJheVxuICAgICAgICAgICAgICAgIGlmIG5vdCh2YWx1ZXMudmFsdWU/KSBvciAnJyBpcyBVdGlscy50cmltKHZhbHVlcy52YWx1ZSwgJyAnKSBvciBVdGlscy5sdHJpbSh2YWx1ZXMudmFsdWUsICcgJykuaW5kZXhPZignIycpIGlzIDBcbiAgICAgICAgICAgICAgICAgICAgaWYgQGN1cnJlbnRMaW5lTmIgPCBAbGluZXMubGVuZ3RoIC0gMSBhbmQgbm90IEBpc05leHRMaW5lVW5JbmRlbnRlZENvbGxlY3Rpb24oKVxuICAgICAgICAgICAgICAgICAgICAgICAgYyA9IEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMVxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VyID0gbmV3IFBhcnNlciBjXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZXIucmVmcyA9IEByZWZzXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2ggcGFyc2VyLnBhcnNlKEBnZXROZXh0RW1iZWRCbG9jayhudWxsLCB0cnVlKSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlcilcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoIG51bGxcblxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaWYgdmFsdWVzLmxlYWRzcGFjZXM/Lmxlbmd0aCBhbmQgbWF0Y2hlcyA9IEBQQVRURVJOX0NPTVBBQ1RfTk9UQVRJT04uZXhlYyB2YWx1ZXMudmFsdWVcblxuICAgICAgICAgICAgICAgICAgICAgICAgIyBUaGlzIGlzIGEgY29tcGFjdCBub3RhdGlvbiBlbGVtZW50LCBhZGQgdG8gbmV4dCBibG9jayBhbmQgcGFyc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgPSBAZ2V0UmVhbEN1cnJlbnRMaW5lTmIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VyID0gbmV3IFBhcnNlciBjXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZXIucmVmcyA9IEByZWZzXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrID0gdmFsdWVzLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRlbnQgPSBAZ2V0Q3VycmVudExpbmVJbmRlbnRhdGlvbigpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBAaXNOZXh0TGluZUluZGVudGVkKGZhbHNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrICs9IFwiXFxuXCIrQGdldE5leHRFbWJlZEJsb2NrKGluZGVudCArIHZhbHVlcy5sZWFkc3BhY2VzLmxlbmd0aCArIDEsIHRydWUpXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaCBwYXJzZXIucGFyc2UgYmxvY2ssIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXJcblxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2ggQHBhcnNlVmFsdWUgdmFsdWVzLnZhbHVlLCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyXG5cbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbHVlcyA9IEBQQVRURVJOX01BUFBJTkdfSVRFTS5leGVjIEBjdXJyZW50TGluZSkgYW5kIHZhbHVlcy5rZXkuaW5kZXhPZignICMnKSBpcyAtMVxuICAgICAgICAgICAgICAgIGlmIEBDT05URVhUX1NFUVVFTkNFIGlzIGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdZb3UgY2Fubm90IGRlZmluZSBhIG1hcHBpbmcgaXRlbSB3aGVuIGluIGEgc2VxdWVuY2UnXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IEBDT05URVhUX01BUFBJTkdcbiAgICAgICAgICAgICAgICBkYXRhID89IHt9XG5cbiAgICAgICAgICAgICAgICAjIEZvcmNlIGNvcnJlY3Qgc2V0dGluZ3NcbiAgICAgICAgICAgICAgICBJbmxpbmUuY29uZmlndXJlIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXJcbiAgICAgICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICAgICAga2V5ID0gSW5saW5lLnBhcnNlU2NhbGFyIHZhbHVlcy5rZXlcbiAgICAgICAgICAgICAgICBjYXRjaCBlXG4gICAgICAgICAgICAgICAgICAgIGUucGFyc2VkTGluZSA9IEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMVxuICAgICAgICAgICAgICAgICAgICBlLnNuaXBwZXQgPSBAY3VycmVudExpbmVcblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlXG5cbiAgICAgICAgICAgICAgICBpZiAnPDwnIGlzIGtleVxuICAgICAgICAgICAgICAgICAgICBtZXJnZU5vZGUgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIGFsbG93T3ZlcndyaXRlID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBpZiB2YWx1ZXMudmFsdWU/LmluZGV4T2YoJyonKSBpcyAwXG4gICAgICAgICAgICAgICAgICAgICAgICByZWZOYW1lID0gdmFsdWVzLnZhbHVlWzEuLl1cbiAgICAgICAgICAgICAgICAgICAgICAgIHVubGVzcyBAcmVmc1tyZWZOYW1lXT9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24gJ1JlZmVyZW5jZSBcIicrcmVmTmFtZSsnXCIgZG9lcyBub3QgZXhpc3QuJywgQGdldFJlYWxDdXJyZW50TGluZU5iKCkgKyAxLCBAY3VycmVudExpbmVcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmVmFsdWUgPSBAcmVmc1tyZWZOYW1lXVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiB0eXBlb2YgcmVmVmFsdWUgaXNudCAnb2JqZWN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnWUFNTCBtZXJnZSBrZXlzIHVzZWQgd2l0aCBhIHNjYWxhciB2YWx1ZSBpbnN0ZWFkIG9mIGFuIG9iamVjdC4nLCBAZ2V0UmVhbEN1cnJlbnRMaW5lTmIoKSArIDEsIEBjdXJyZW50TGluZVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiByZWZWYWx1ZSBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBNZXJnZSBhcnJheSB3aXRoIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciB2YWx1ZSwgaSBpbiByZWZWYWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhW1N0cmluZyhpKV0gPz0gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIE1lcmdlIG9iamVjdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3Iga2V5LCB2YWx1ZSBvZiByZWZWYWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2tleV0gPz0gdmFsdWVcblxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiB2YWx1ZXMudmFsdWU/IGFuZCB2YWx1ZXMudmFsdWUgaXNudCAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWVzLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBAZ2V0TmV4dEVtYmVkQmxvY2soKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBjID0gQGdldFJlYWxDdXJyZW50TGluZU5iKCkgKyAxXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZXIgPSBuZXcgUGFyc2VyIGNcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlci5yZWZzID0gQHJlZnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlZCA9IHBhcnNlci5wYXJzZSB2YWx1ZSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB1bmxlc3MgdHlwZW9mIHBhcnNlZCBpcyAnb2JqZWN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnWUFNTCBtZXJnZSBrZXlzIHVzZWQgd2l0aCBhIHNjYWxhciB2YWx1ZSBpbnN0ZWFkIG9mIGFuIG9iamVjdC4nLCBAZ2V0UmVhbEN1cnJlbnRMaW5lTmIoKSArIDEsIEBjdXJyZW50TGluZVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBwYXJzZWQgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgSWYgdGhlIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCB0aGUgbWVyZ2Uga2V5IGlzIGEgc2VxdWVuY2UsIHRoZW4gdGhpcyBzZXF1ZW5jZSBpcyBleHBlY3RlZCB0byBjb250YWluIG1hcHBpbmcgbm9kZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIGFuZCBlYWNoIG9mIHRoZXNlIG5vZGVzIGlzIG1lcmdlZCBpbiB0dXJuIGFjY29yZGluZyB0byBpdHMgb3JkZXIgaW4gdGhlIHNlcXVlbmNlLiBLZXlzIGluIG1hcHBpbmcgbm9kZXMgZWFybGllclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgaW4gdGhlIHNlcXVlbmNlIG92ZXJyaWRlIGtleXMgc3BlY2lmaWVkIGluIGxhdGVyIG1hcHBpbmcgbm9kZXMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIHBhcnNlZEl0ZW0gaW4gcGFyc2VkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVubGVzcyB0eXBlb2YgcGFyc2VkSXRlbSBpcyAnb2JqZWN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdNZXJnZSBpdGVtcyBtdXN0IGJlIG9iamVjdHMuJywgQGdldFJlYWxDdXJyZW50TGluZU5iKCkgKyAxLCBwYXJzZWRJdGVtXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgcGFyc2VkSXRlbSBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIE1lcmdlIGFycmF5IHdpdGggb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgdmFsdWUsIGkgaW4gcGFyc2VkSXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGsgPSBTdHJpbmcoaSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmxlc3MgZGF0YS5oYXNPd25Qcm9wZXJ0eShrKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2tdID0gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBNZXJnZSBvYmplY3RzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3Iga2V5LCB2YWx1ZSBvZiBwYXJzZWRJdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5sZXNzIGRhdGEuaGFzT3duUHJvcGVydHkoa2V5KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2tleV0gPSB2YWx1ZVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBJZiB0aGUgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIHRoZSBrZXkgaXMgYSBzaW5nbGUgbWFwcGluZyBub2RlLCBlYWNoIG9mIGl0cyBrZXkvdmFsdWUgcGFpcnMgaXMgaW5zZXJ0ZWQgaW50byB0aGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIGN1cnJlbnQgbWFwcGluZywgdW5sZXNzIHRoZSBrZXkgYWxyZWFkeSBleGlzdHMgaW4gaXQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGtleSwgdmFsdWUgb2YgcGFyc2VkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVubGVzcyBkYXRhLmhhc093blByb3BlcnR5KGtleSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFba2V5XSA9IHZhbHVlXG5cbiAgICAgICAgICAgICAgICBlbHNlIGlmIHZhbHVlcy52YWx1ZT8gYW5kIG1hdGNoZXMgPSBAUEFUVEVSTl9BTkNIT1JfVkFMVUUuZXhlYyB2YWx1ZXMudmFsdWVcbiAgICAgICAgICAgICAgICAgICAgaXNSZWYgPSBtYXRjaGVzLnJlZlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZXMudmFsdWUgPSBtYXRjaGVzLnZhbHVlXG5cblxuICAgICAgICAgICAgICAgIGlmIG1lcmdlTm9kZVxuICAgICAgICAgICAgICAgICAgICAjIE1lcmdlIGtleXNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIG5vdCh2YWx1ZXMudmFsdWU/KSBvciAnJyBpcyBVdGlscy50cmltKHZhbHVlcy52YWx1ZSwgJyAnKSBvciBVdGlscy5sdHJpbSh2YWx1ZXMudmFsdWUsICcgJykuaW5kZXhPZignIycpIGlzIDBcbiAgICAgICAgICAgICAgICAgICAgIyBIYXNoXG4gICAgICAgICAgICAgICAgICAgICMgaWYgbmV4dCBsaW5lIGlzIGxlc3MgaW5kZW50ZWQgb3IgZXF1YWwsIHRoZW4gaXQgbWVhbnMgdGhhdCB0aGUgY3VycmVudCB2YWx1ZSBpcyBudWxsXG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdChAaXNOZXh0TGluZUluZGVudGVkKCkpIGFuZCBub3QoQGlzTmV4dExpbmVVbkluZGVudGVkQ29sbGVjdGlvbigpKVxuICAgICAgICAgICAgICAgICAgICAgICAgIyBTcGVjOiBLZXlzIE1VU1QgYmUgdW5pcXVlOyBmaXJzdCBvbmUgd2lucy5cbiAgICAgICAgICAgICAgICAgICAgICAgICMgQnV0IG92ZXJ3cml0aW5nIGlzIGFsbG93ZWQgd2hlbiBhIG1lcmdlIG5vZGUgaXMgdXNlZCBpbiBjdXJyZW50IGJsb2NrLlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgYWxsb3dPdmVyd3JpdGUgb3IgZGF0YVtrZXldIGlzIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFba2V5XSA9IG51bGxcblxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjID0gQGdldFJlYWxDdXJyZW50TGluZU5iKCkgKyAxXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZXIgPSBuZXcgUGFyc2VyIGNcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlci5yZWZzID0gQHJlZnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbCA9IHBhcnNlci5wYXJzZSBAZ2V0TmV4dEVtYmVkQmxvY2soKSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlclxuXG4gICAgICAgICAgICAgICAgICAgICAgICAjIFNwZWM6IEtleXMgTVVTVCBiZSB1bmlxdWU7IGZpcnN0IG9uZSB3aW5zLlxuICAgICAgICAgICAgICAgICAgICAgICAgIyBCdXQgb3ZlcndyaXRpbmcgaXMgYWxsb3dlZCB3aGVuIGEgbWVyZ2Ugbm9kZSBpcyB1c2VkIGluIGN1cnJlbnQgYmxvY2suXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBhbGxvd092ZXJ3cml0ZSBvciBkYXRhW2tleV0gaXMgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtrZXldID0gdmFsXG5cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHZhbCA9IEBwYXJzZVZhbHVlIHZhbHVlcy52YWx1ZSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlclxuXG4gICAgICAgICAgICAgICAgICAgICMgU3BlYzogS2V5cyBNVVNUIGJlIHVuaXF1ZTsgZmlyc3Qgb25lIHdpbnMuXG4gICAgICAgICAgICAgICAgICAgICMgQnV0IG92ZXJ3cml0aW5nIGlzIGFsbG93ZWQgd2hlbiBhIG1lcmdlIG5vZGUgaXMgdXNlZCBpbiBjdXJyZW50IGJsb2NrLlxuICAgICAgICAgICAgICAgICAgICBpZiBhbGxvd092ZXJ3cml0ZSBvciBkYXRhW2tleV0gaXMgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2tleV0gPSB2YWxcblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICMgMS1saW5lciBvcHRpb25hbGx5IGZvbGxvd2VkIGJ5IG5ld2xpbmVcbiAgICAgICAgICAgICAgICBsaW5lQ291bnQgPSBAbGluZXMubGVuZ3RoXG4gICAgICAgICAgICAgICAgaWYgMSBpcyBsaW5lQ291bnQgb3IgKDIgaXMgbGluZUNvdW50IGFuZCBVdGlscy5pc0VtcHR5KEBsaW5lc1sxXSkpXG4gICAgICAgICAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBJbmxpbmUucGFyc2UgQGxpbmVzWzBdLCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyXG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGUucGFyc2VkTGluZSA9IEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMVxuICAgICAgICAgICAgICAgICAgICAgICAgZS5zbmlwcGV0ID0gQGN1cnJlbnRMaW5lXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVcblxuICAgICAgICAgICAgICAgICAgICBpZiB0eXBlb2YgdmFsdWUgaXMgJ29iamVjdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHZhbHVlIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdCA9IHZhbHVlWzBdXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGtleSBvZiB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdCA9IHZhbHVlW2tleV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgdHlwZW9mIGZpcnN0IGlzICdzdHJpbmcnIGFuZCBmaXJzdC5pbmRleE9mKCcqJykgaXMgMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEgPSBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBhbGlhcyBpbiB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2ggQHJlZnNbYWxpYXNbMS4uXV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGRhdGFcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWVcblxuICAgICAgICAgICAgICAgIGVsc2UgaWYgVXRpbHMubHRyaW0odmFsdWUpLmNoYXJBdCgwKSBpbiBbJ1snLCAneyddXG4gICAgICAgICAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElubGluZS5wYXJzZSB2YWx1ZSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlclxuICAgICAgICAgICAgICAgICAgICBjYXRjaCBlXG4gICAgICAgICAgICAgICAgICAgICAgICBlLnBhcnNlZExpbmUgPSBAZ2V0UmVhbEN1cnJlbnRMaW5lTmIoKSArIDFcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuc25pcHBldCA9IEBjdXJyZW50TGluZVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlXG5cbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24gJ1VuYWJsZSB0byBwYXJzZS4nLCBAZ2V0UmVhbEN1cnJlbnRMaW5lTmIoKSArIDEsIEBjdXJyZW50TGluZVxuXG4gICAgICAgICAgICBpZiBpc1JlZlxuICAgICAgICAgICAgICAgIGlmIGRhdGEgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgICAgICAgICBAcmVmc1tpc1JlZl0gPSBkYXRhW2RhdGEubGVuZ3RoLTFdXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBsYXN0S2V5ID0gbnVsbFxuICAgICAgICAgICAgICAgICAgICBmb3Iga2V5IG9mIGRhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RLZXkgPSBrZXlcbiAgICAgICAgICAgICAgICAgICAgQHJlZnNbaXNSZWZdID0gZGF0YVtsYXN0S2V5XVxuXG5cbiAgICAgICAgaWYgVXRpbHMuaXNFbXB0eShkYXRhKVxuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGRhdGFcblxuXG5cbiAgICAjIFJldHVybnMgdGhlIGN1cnJlbnQgbGluZSBudW1iZXIgKHRha2VzIHRoZSBvZmZzZXQgaW50byBhY2NvdW50KS5cbiAgICAjXG4gICAgIyBAcmV0dXJuIFtJbnRlZ2VyXSAgICAgVGhlIGN1cnJlbnQgbGluZSBudW1iZXJcbiAgICAjXG4gICAgZ2V0UmVhbEN1cnJlbnRMaW5lTmI6IC0+XG4gICAgICAgIHJldHVybiBAY3VycmVudExpbmVOYiArIEBvZmZzZXRcblxuXG4gICAgIyBSZXR1cm5zIHRoZSBjdXJyZW50IGxpbmUgaW5kZW50YXRpb24uXG4gICAgI1xuICAgICMgQHJldHVybiBbSW50ZWdlcl0gICAgIFRoZSBjdXJyZW50IGxpbmUgaW5kZW50YXRpb25cbiAgICAjXG4gICAgZ2V0Q3VycmVudExpbmVJbmRlbnRhdGlvbjogLT5cbiAgICAgICAgcmV0dXJuIEBjdXJyZW50TGluZS5sZW5ndGggLSBVdGlscy5sdHJpbShAY3VycmVudExpbmUsICcgJykubGVuZ3RoXG5cblxuICAgICMgUmV0dXJucyB0aGUgbmV4dCBlbWJlZCBibG9jayBvZiBZQU1MLlxuICAgICNcbiAgICAjIEBwYXJhbSBbSW50ZWdlcl0gICAgICAgICAgaW5kZW50YXRpb24gVGhlIGluZGVudCBsZXZlbCBhdCB3aGljaCB0aGUgYmxvY2sgaXMgdG8gYmUgcmVhZCwgb3IgbnVsbCBmb3IgZGVmYXVsdFxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gICAgICAgICAgQSBZQU1MIHN0cmluZ1xuICAgICNcbiAgICAjIEB0aHJvdyBbUGFyc2VFeGNlcHRpb25dICAgV2hlbiBpbmRlbnRhdGlvbiBwcm9ibGVtIGFyZSBkZXRlY3RlZFxuICAgICNcbiAgICBnZXROZXh0RW1iZWRCbG9jazogKGluZGVudGF0aW9uID0gbnVsbCwgaW5jbHVkZVVuaW5kZW50ZWRDb2xsZWN0aW9uID0gZmFsc2UpIC0+XG4gICAgICAgIEBtb3ZlVG9OZXh0TGluZSgpXG5cbiAgICAgICAgaWYgbm90IGluZGVudGF0aW9uP1xuICAgICAgICAgICAgbmV3SW5kZW50ID0gQGdldEN1cnJlbnRMaW5lSW5kZW50YXRpb24oKVxuXG4gICAgICAgICAgICB1bmluZGVudGVkRW1iZWRCbG9jayA9IEBpc1N0cmluZ1VuSW5kZW50ZWRDb2xsZWN0aW9uSXRlbSBAY3VycmVudExpbmVcblxuICAgICAgICAgICAgaWYgbm90KEBpc0N1cnJlbnRMaW5lRW1wdHkoKSkgYW5kIDAgaXMgbmV3SW5kZW50IGFuZCBub3QodW5pbmRlbnRlZEVtYmVkQmxvY2spXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdJbmRlbnRhdGlvbiBwcm9ibGVtLicsIEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMSwgQGN1cnJlbnRMaW5lXG5cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbmV3SW5kZW50ID0gaW5kZW50YXRpb25cblxuXG4gICAgICAgIGRhdGEgPSBbQGN1cnJlbnRMaW5lW25ld0luZGVudC4uXV1cblxuICAgICAgICB1bmxlc3MgaW5jbHVkZVVuaW5kZW50ZWRDb2xsZWN0aW9uXG4gICAgICAgICAgICBpc0l0VW5pbmRlbnRlZENvbGxlY3Rpb24gPSBAaXNTdHJpbmdVbkluZGVudGVkQ29sbGVjdGlvbkl0ZW0gQGN1cnJlbnRMaW5lXG5cbiAgICAgICAgIyBDb21tZW50cyBtdXN0IG5vdCBiZSByZW1vdmVkIGluc2lkZSBhIHN0cmluZyBibG9jayAoaWUuIGFmdGVyIGEgbGluZSBlbmRpbmcgd2l0aCBcInxcIilcbiAgICAgICAgIyBUaGV5IG11c3Qgbm90IGJlIHJlbW92ZWQgaW5zaWRlIGEgc3ViLWVtYmVkZGVkIGJsb2NrIGFzIHdlbGxcbiAgICAgICAgcmVtb3ZlQ29tbWVudHNQYXR0ZXJuID0gQFBBVFRFUk5fRk9MREVEX1NDQUxBUl9FTkRcbiAgICAgICAgcmVtb3ZlQ29tbWVudHMgPSBub3QgcmVtb3ZlQ29tbWVudHNQYXR0ZXJuLnRlc3QgQGN1cnJlbnRMaW5lXG5cbiAgICAgICAgd2hpbGUgQG1vdmVUb05leHRMaW5lKClcbiAgICAgICAgICAgIGluZGVudCA9IEBnZXRDdXJyZW50TGluZUluZGVudGF0aW9uKClcblxuICAgICAgICAgICAgaWYgaW5kZW50IGlzIG5ld0luZGVudFxuICAgICAgICAgICAgICAgIHJlbW92ZUNvbW1lbnRzID0gbm90IHJlbW92ZUNvbW1lbnRzUGF0dGVybi50ZXN0IEBjdXJyZW50TGluZVxuXG4gICAgICAgICAgICBpZiBpc0l0VW5pbmRlbnRlZENvbGxlY3Rpb24gYW5kIG5vdCBAaXNTdHJpbmdVbkluZGVudGVkQ29sbGVjdGlvbkl0ZW0oQGN1cnJlbnRMaW5lKSBhbmQgaW5kZW50IGlzIG5ld0luZGVudFxuICAgICAgICAgICAgICAgIEBtb3ZlVG9QcmV2aW91c0xpbmUoKVxuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgIGlmIEBpc0N1cnJlbnRMaW5lQmxhbmsoKVxuICAgICAgICAgICAgICAgIGRhdGEucHVzaCBAY3VycmVudExpbmVbbmV3SW5kZW50Li5dXG4gICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgaWYgcmVtb3ZlQ29tbWVudHMgYW5kIEBpc0N1cnJlbnRMaW5lQ29tbWVudCgpXG4gICAgICAgICAgICAgICAgaWYgaW5kZW50IGlzIG5ld0luZGVudFxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICBpZiBpbmRlbnQgPj0gbmV3SW5kZW50XG4gICAgICAgICAgICAgICAgZGF0YS5wdXNoIEBjdXJyZW50TGluZVtuZXdJbmRlbnQuLl1cbiAgICAgICAgICAgIGVsc2UgaWYgVXRpbHMubHRyaW0oQGN1cnJlbnRMaW5lKS5jaGFyQXQoMCkgaXMgJyMnXG4gICAgICAgICAgICAgICAgIyBEb24ndCBhZGQgbGluZSB3aXRoIGNvbW1lbnRzXG4gICAgICAgICAgICBlbHNlIGlmIDAgaXMgaW5kZW50XG4gICAgICAgICAgICAgICAgQG1vdmVUb1ByZXZpb3VzTGluZSgpXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24gJ0luZGVudGF0aW9uIHByb2JsZW0uJywgQGdldFJlYWxDdXJyZW50TGluZU5iKCkgKyAxLCBAY3VycmVudExpbmVcblxuXG4gICAgICAgIHJldHVybiBkYXRhLmpvaW4gXCJcXG5cIlxuXG5cbiAgICAjIE1vdmVzIHRoZSBwYXJzZXIgdG8gdGhlIG5leHQgbGluZS5cbiAgICAjXG4gICAgIyBAcmV0dXJuIFtCb29sZWFuXVxuICAgICNcbiAgICBtb3ZlVG9OZXh0TGluZTogLT5cbiAgICAgICAgaWYgQGN1cnJlbnRMaW5lTmIgPj0gQGxpbmVzLmxlbmd0aCAtIDFcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgICAgIEBjdXJyZW50TGluZSA9IEBsaW5lc1srK0BjdXJyZW50TGluZU5iXTtcblxuICAgICAgICByZXR1cm4gdHJ1ZVxuXG5cbiAgICAjIE1vdmVzIHRoZSBwYXJzZXIgdG8gdGhlIHByZXZpb3VzIGxpbmUuXG4gICAgI1xuICAgIG1vdmVUb1ByZXZpb3VzTGluZTogLT5cbiAgICAgICAgQGN1cnJlbnRMaW5lID0gQGxpbmVzWy0tQGN1cnJlbnRMaW5lTmJdXG4gICAgICAgIHJldHVyblxuXG5cbiAgICAjIFBhcnNlcyBhIFlBTUwgdmFsdWUuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgdmFsdWUgICAgICAgICAgICAgICAgICAgQSBZQU1MIHZhbHVlXG4gICAgIyBAcGFyYW0gW0Jvb2xlYW5dICBleGNlcHRpb25PbkludmFsaWRUeXBlICB0cnVlIGlmIGFuIGV4Y2VwdGlvbiBtdXN0IGJlIHRocm93biBvbiBpbnZhbGlkIHR5cGVzIGZhbHNlIG90aGVyd2lzZVxuICAgICMgQHBhcmFtIFtGdW5jdGlvbl0gb2JqZWN0RGVjb2RlciAgICAgICAgICAgQSBmdW5jdGlvbiB0byBkZXNlcmlhbGl6ZSBjdXN0b20gb2JqZWN0cywgbnVsbCBvdGhlcndpc2VcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtPYmplY3RdIEEgSmF2YVNjcmlwdCB2YWx1ZVxuICAgICNcbiAgICAjIEB0aHJvdyBbUGFyc2VFeGNlcHRpb25dIFdoZW4gcmVmZXJlbmNlIGRvZXMgbm90IGV4aXN0XG4gICAgI1xuICAgIHBhcnNlVmFsdWU6ICh2YWx1ZSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlcikgLT5cbiAgICAgICAgaWYgMCBpcyB2YWx1ZS5pbmRleE9mKCcqJylcbiAgICAgICAgICAgIHBvcyA9IHZhbHVlLmluZGV4T2YgJyMnXG4gICAgICAgICAgICBpZiBwb3MgaXNudCAtMVxuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUuc3Vic3RyKDEsIHBvcy0yKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWVbMS4uXVxuXG4gICAgICAgICAgICBpZiBAcmVmc1t2YWx1ZV0gaXMgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdSZWZlcmVuY2UgXCInK3ZhbHVlKydcIiBkb2VzIG5vdCBleGlzdC4nLCBAY3VycmVudExpbmVcblxuICAgICAgICAgICAgcmV0dXJuIEByZWZzW3ZhbHVlXVxuXG5cbiAgICAgICAgaWYgbWF0Y2hlcyA9IEBQQVRURVJOX0ZPTERFRF9TQ0FMQVJfQUxMLmV4ZWMgdmFsdWVcbiAgICAgICAgICAgIG1vZGlmaWVycyA9IG1hdGNoZXMubW9kaWZpZXJzID8gJydcblxuICAgICAgICAgICAgZm9sZGVkSW5kZW50ID0gTWF0aC5hYnMocGFyc2VJbnQobW9kaWZpZXJzKSlcbiAgICAgICAgICAgIGlmIGlzTmFOKGZvbGRlZEluZGVudCkgdGhlbiBmb2xkZWRJbmRlbnQgPSAwXG4gICAgICAgICAgICB2YWwgPSBAcGFyc2VGb2xkZWRTY2FsYXIgbWF0Y2hlcy5zZXBhcmF0b3IsIEBQQVRURVJOX0RFQ0lNQUwucmVwbGFjZShtb2RpZmllcnMsICcnKSwgZm9sZGVkSW5kZW50XG4gICAgICAgICAgICBpZiBtYXRjaGVzLnR5cGU/XG4gICAgICAgICAgICAgICAgIyBGb3JjZSBjb3JyZWN0IHNldHRpbmdzXG4gICAgICAgICAgICAgICAgSW5saW5lLmNvbmZpZ3VyZSBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyXG4gICAgICAgICAgICAgICAgcmV0dXJuIElubGluZS5wYXJzZVNjYWxhciBtYXRjaGVzLnR5cGUrJyAnK3ZhbFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiB2YWxcblxuICAgICAgICB0cnlcbiAgICAgICAgICAgIHJldHVybiBJbmxpbmUucGFyc2UgdmFsdWUsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXJcbiAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgIyBUcnkgdG8gcGFyc2UgbXVsdGlsaW5lIGNvbXBhY3Qgc2VxdWVuY2Ugb3IgbWFwcGluZ1xuICAgICAgICAgICAgaWYgdmFsdWUuY2hhckF0KDApIGluIFsnWycsICd7J10gYW5kIGUgaW5zdGFuY2VvZiBQYXJzZUV4Y2VwdGlvbiBhbmQgQGlzTmV4dExpbmVJbmRlbnRlZCgpXG4gICAgICAgICAgICAgICAgdmFsdWUgKz0gXCJcXG5cIiArIEBnZXROZXh0RW1iZWRCbG9jaygpXG4gICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBJbmxpbmUucGFyc2UgdmFsdWUsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXJcbiAgICAgICAgICAgICAgICBjYXRjaCBlXG4gICAgICAgICAgICAgICAgICAgIGUucGFyc2VkTGluZSA9IEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMVxuICAgICAgICAgICAgICAgICAgICBlLnNuaXBwZXQgPSBAY3VycmVudExpbmVcblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlXG5cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBlLnBhcnNlZExpbmUgPSBAZ2V0UmVhbEN1cnJlbnRMaW5lTmIoKSArIDFcbiAgICAgICAgICAgICAgICBlLnNuaXBwZXQgPSBAY3VycmVudExpbmVcblxuICAgICAgICAgICAgICAgIHRocm93IGVcblxuICAgICAgICByZXR1cm5cblxuXG4gICAgIyBQYXJzZXMgYSBmb2xkZWQgc2NhbGFyLlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgICAgICBzZXBhcmF0b3IgICBUaGUgc2VwYXJhdG9yIHRoYXQgd2FzIHVzZWQgdG8gYmVnaW4gdGhpcyBmb2xkZWQgc2NhbGFyICh8IG9yID4pXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICAgICAgaW5kaWNhdG9yICAgVGhlIGluZGljYXRvciB0aGF0IHdhcyB1c2VkIHRvIGJlZ2luIHRoaXMgZm9sZGVkIHNjYWxhciAoKyBvciAtKVxuICAgICMgQHBhcmFtIFtJbnRlZ2VyXSAgICAgIGluZGVudGF0aW9uIFRoZSBpbmRlbnRhdGlvbiB0aGF0IHdhcyB1c2VkIHRvIGJlZ2luIHRoaXMgZm9sZGVkIHNjYWxhclxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gICAgICBUaGUgdGV4dCB2YWx1ZVxuICAgICNcbiAgICBwYXJzZUZvbGRlZFNjYWxhcjogKHNlcGFyYXRvciwgaW5kaWNhdG9yID0gJycsIGluZGVudGF0aW9uID0gMCkgLT5cbiAgICAgICAgbm90RU9GID0gQG1vdmVUb05leHRMaW5lKClcbiAgICAgICAgaWYgbm90IG5vdEVPRlxuICAgICAgICAgICAgcmV0dXJuICcnXG5cbiAgICAgICAgaXNDdXJyZW50TGluZUJsYW5rID0gQGlzQ3VycmVudExpbmVCbGFuaygpXG4gICAgICAgIHRleHQgPSAnJ1xuXG4gICAgICAgICMgTGVhZGluZyBibGFuayBsaW5lcyBhcmUgY29uc3VtZWQgYmVmb3JlIGRldGVybWluaW5nIGluZGVudGF0aW9uXG4gICAgICAgIHdoaWxlIG5vdEVPRiBhbmQgaXNDdXJyZW50TGluZUJsYW5rXG4gICAgICAgICAgICAjIG5ld2xpbmUgb25seSBpZiBub3QgRU9GXG4gICAgICAgICAgICBpZiBub3RFT0YgPSBAbW92ZVRvTmV4dExpbmUoKVxuICAgICAgICAgICAgICAgIHRleHQgKz0gXCJcXG5cIlxuICAgICAgICAgICAgICAgIGlzQ3VycmVudExpbmVCbGFuayA9IEBpc0N1cnJlbnRMaW5lQmxhbmsoKVxuXG5cbiAgICAgICAgIyBEZXRlcm1pbmUgaW5kZW50YXRpb24gaWYgbm90IHNwZWNpZmllZFxuICAgICAgICBpZiAwIGlzIGluZGVudGF0aW9uXG4gICAgICAgICAgICBpZiBtYXRjaGVzID0gQFBBVFRFUk5fSU5ERU5UX1NQQUNFUy5leGVjIEBjdXJyZW50TGluZVxuICAgICAgICAgICAgICAgIGluZGVudGF0aW9uID0gbWF0Y2hlc1swXS5sZW5ndGhcblxuXG4gICAgICAgIGlmIGluZGVudGF0aW9uID4gMFxuICAgICAgICAgICAgcGF0dGVybiA9IEBQQVRURVJOX0ZPTERFRF9TQ0FMQVJfQllfSU5ERU5UQVRJT05baW5kZW50YXRpb25dXG4gICAgICAgICAgICB1bmxlc3MgcGF0dGVybj9cbiAgICAgICAgICAgICAgICBwYXR0ZXJuID0gbmV3IFBhdHRlcm4gJ14geycraW5kZW50YXRpb24rJ30oLiopJCdcbiAgICAgICAgICAgICAgICBQYXJzZXI6OlBBVFRFUk5fRk9MREVEX1NDQUxBUl9CWV9JTkRFTlRBVElPTltpbmRlbnRhdGlvbl0gPSBwYXR0ZXJuXG5cbiAgICAgICAgICAgIHdoaWxlIG5vdEVPRiBhbmQgKGlzQ3VycmVudExpbmVCbGFuayBvciBtYXRjaGVzID0gcGF0dGVybi5leGVjIEBjdXJyZW50TGluZSlcbiAgICAgICAgICAgICAgICBpZiBpc0N1cnJlbnRMaW5lQmxhbmtcbiAgICAgICAgICAgICAgICAgICAgdGV4dCArPSBAY3VycmVudExpbmVbaW5kZW50YXRpb24uLl1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRleHQgKz0gbWF0Y2hlc1sxXVxuXG4gICAgICAgICAgICAgICAgIyBuZXdsaW5lIG9ubHkgaWYgbm90IEVPRlxuICAgICAgICAgICAgICAgIGlmIG5vdEVPRiA9IEBtb3ZlVG9OZXh0TGluZSgpXG4gICAgICAgICAgICAgICAgICAgIHRleHQgKz0gXCJcXG5cIlxuICAgICAgICAgICAgICAgICAgICBpc0N1cnJlbnRMaW5lQmxhbmsgPSBAaXNDdXJyZW50TGluZUJsYW5rKClcblxuICAgICAgICBlbHNlIGlmIG5vdEVPRlxuICAgICAgICAgICAgdGV4dCArPSBcIlxcblwiXG5cblxuICAgICAgICBpZiBub3RFT0ZcbiAgICAgICAgICAgIEBtb3ZlVG9QcmV2aW91c0xpbmUoKVxuXG5cbiAgICAgICAgIyBSZW1vdmUgbGluZSBicmVha3Mgb2YgZWFjaCBsaW5lcyBleGNlcHQgdGhlIGVtcHR5IGFuZCBtb3JlIGluZGVudGVkIG9uZXNcbiAgICAgICAgaWYgJz4nIGlzIHNlcGFyYXRvclxuICAgICAgICAgICAgbmV3VGV4dCA9ICcnXG4gICAgICAgICAgICBmb3IgbGluZSBpbiB0ZXh0LnNwbGl0IFwiXFxuXCJcbiAgICAgICAgICAgICAgICBpZiBsaW5lLmxlbmd0aCBpcyAwIG9yIGxpbmUuY2hhckF0KDApIGlzICcgJ1xuICAgICAgICAgICAgICAgICAgICBuZXdUZXh0ID0gVXRpbHMucnRyaW0obmV3VGV4dCwgJyAnKSArIGxpbmUgKyBcIlxcblwiXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBuZXdUZXh0ICs9IGxpbmUgKyAnICdcbiAgICAgICAgICAgIHRleHQgPSBuZXdUZXh0XG5cbiAgICAgICAgaWYgJysnIGlzbnQgaW5kaWNhdG9yXG4gICAgICAgICAgICAjIFJlbW92ZSBhbnkgZXh0cmEgc3BhY2Ugb3IgbmV3IGxpbmUgYXMgd2UgYXJlIGFkZGluZyB0aGVtIGFmdGVyXG4gICAgICAgICAgICB0ZXh0ID0gVXRpbHMucnRyaW0odGV4dClcblxuICAgICAgICAjIERlYWwgd2l0aCB0cmFpbGluZyBuZXdsaW5lcyBhcyBpbmRpY2F0ZWRcbiAgICAgICAgaWYgJycgaXMgaW5kaWNhdG9yXG4gICAgICAgICAgICB0ZXh0ID0gQFBBVFRFUk5fVFJBSUxJTkdfTElORVMucmVwbGFjZSB0ZXh0LCBcIlxcblwiXG4gICAgICAgIGVsc2UgaWYgJy0nIGlzIGluZGljYXRvclxuICAgICAgICAgICAgdGV4dCA9IEBQQVRURVJOX1RSQUlMSU5HX0xJTkVTLnJlcGxhY2UgdGV4dCwgJydcblxuICAgICAgICByZXR1cm4gdGV4dFxuXG5cbiAgICAjIFJldHVybnMgdHJ1ZSBpZiB0aGUgbmV4dCBsaW5lIGlzIGluZGVudGVkLlxuICAgICNcbiAgICAjIEByZXR1cm4gW0Jvb2xlYW5dICAgICBSZXR1cm5zIHRydWUgaWYgdGhlIG5leHQgbGluZSBpcyBpbmRlbnRlZCwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgI1xuICAgIGlzTmV4dExpbmVJbmRlbnRlZDogKGlnbm9yZUNvbW1lbnRzID0gdHJ1ZSkgLT5cbiAgICAgICAgY3VycmVudEluZGVudGF0aW9uID0gQGdldEN1cnJlbnRMaW5lSW5kZW50YXRpb24oKVxuICAgICAgICBFT0YgPSBub3QgQG1vdmVUb05leHRMaW5lKClcblxuICAgICAgICBpZiBpZ25vcmVDb21tZW50c1xuICAgICAgICAgICAgd2hpbGUgbm90KEVPRikgYW5kIEBpc0N1cnJlbnRMaW5lRW1wdHkoKVxuICAgICAgICAgICAgICAgIEVPRiA9IG5vdCBAbW92ZVRvTmV4dExpbmUoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB3aGlsZSBub3QoRU9GKSBhbmQgQGlzQ3VycmVudExpbmVCbGFuaygpXG4gICAgICAgICAgICAgICAgRU9GID0gbm90IEBtb3ZlVG9OZXh0TGluZSgpXG5cbiAgICAgICAgaWYgRU9GXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICAgICByZXQgPSBmYWxzZVxuICAgICAgICBpZiBAZ2V0Q3VycmVudExpbmVJbmRlbnRhdGlvbigpID4gY3VycmVudEluZGVudGF0aW9uXG4gICAgICAgICAgICByZXQgPSB0cnVlXG5cbiAgICAgICAgQG1vdmVUb1ByZXZpb3VzTGluZSgpXG5cbiAgICAgICAgcmV0dXJuIHJldFxuXG5cbiAgICAjIFJldHVybnMgdHJ1ZSBpZiB0aGUgY3VycmVudCBsaW5lIGlzIGJsYW5rIG9yIGlmIGl0IGlzIGEgY29tbWVudCBsaW5lLlxuICAgICNcbiAgICAjIEByZXR1cm4gW0Jvb2xlYW5dICAgICBSZXR1cm5zIHRydWUgaWYgdGhlIGN1cnJlbnQgbGluZSBpcyBlbXB0eSBvciBpZiBpdCBpcyBhIGNvbW1lbnQgbGluZSwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgI1xuICAgIGlzQ3VycmVudExpbmVFbXB0eTogLT5cbiAgICAgICAgdHJpbW1lZExpbmUgPSBVdGlscy50cmltKEBjdXJyZW50TGluZSwgJyAnKVxuICAgICAgICByZXR1cm4gdHJpbW1lZExpbmUubGVuZ3RoIGlzIDAgb3IgdHJpbW1lZExpbmUuY2hhckF0KDApIGlzICcjJ1xuXG5cbiAgICAjIFJldHVybnMgdHJ1ZSBpZiB0aGUgY3VycmVudCBsaW5lIGlzIGJsYW5rLlxuICAgICNcbiAgICAjIEByZXR1cm4gW0Jvb2xlYW5dICAgICBSZXR1cm5zIHRydWUgaWYgdGhlIGN1cnJlbnQgbGluZSBpcyBibGFuaywgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgI1xuICAgIGlzQ3VycmVudExpbmVCbGFuazogLT5cbiAgICAgICAgcmV0dXJuICcnIGlzIFV0aWxzLnRyaW0oQGN1cnJlbnRMaW5lLCAnICcpXG5cblxuICAgICMgUmV0dXJucyB0cnVlIGlmIHRoZSBjdXJyZW50IGxpbmUgaXMgYSBjb21tZW50IGxpbmUuXG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gICAgIFJldHVybnMgdHJ1ZSBpZiB0aGUgY3VycmVudCBsaW5lIGlzIGEgY29tbWVudCBsaW5lLCBmYWxzZSBvdGhlcndpc2VcbiAgICAjXG4gICAgaXNDdXJyZW50TGluZUNvbW1lbnQ6IC0+XG4gICAgICAgICMgQ2hlY2tpbmcgZXhwbGljaXRseSB0aGUgZmlyc3QgY2hhciBvZiB0aGUgdHJpbSBpcyBmYXN0ZXIgdGhhbiBsb29wcyBvciBzdHJwb3NcbiAgICAgICAgbHRyaW1tZWRMaW5lID0gVXRpbHMubHRyaW0oQGN1cnJlbnRMaW5lLCAnICcpXG5cbiAgICAgICAgcmV0dXJuIGx0cmltbWVkTGluZS5jaGFyQXQoMCkgaXMgJyMnXG5cblxuICAgICMgQ2xlYW51cHMgYSBZQU1MIHN0cmluZyB0byBiZSBwYXJzZWQuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgdmFsdWUgVGhlIGlucHV0IFlBTUwgc3RyaW5nXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgQSBjbGVhbmVkIHVwIFlBTUwgc3RyaW5nXG4gICAgI1xuICAgIGNsZWFudXA6ICh2YWx1ZSkgLT5cbiAgICAgICAgaWYgdmFsdWUuaW5kZXhPZihcIlxcclwiKSBpc250IC0xXG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnNwbGl0KFwiXFxyXFxuXCIpLmpvaW4oXCJcXG5cIikuc3BsaXQoXCJcXHJcIikuam9pbihcIlxcblwiKVxuXG4gICAgICAgICMgU3RyaXAgWUFNTCBoZWFkZXJcbiAgICAgICAgY291bnQgPSAwXG4gICAgICAgIFt2YWx1ZSwgY291bnRdID0gQFBBVFRFUk5fWUFNTF9IRUFERVIucmVwbGFjZUFsbCB2YWx1ZSwgJydcbiAgICAgICAgQG9mZnNldCArPSBjb3VudFxuXG4gICAgICAgICMgUmVtb3ZlIGxlYWRpbmcgY29tbWVudHNcbiAgICAgICAgW3RyaW1tZWRWYWx1ZSwgY291bnRdID0gQFBBVFRFUk5fTEVBRElOR19DT01NRU5UUy5yZXBsYWNlQWxsIHZhbHVlLCAnJywgMVxuICAgICAgICBpZiBjb3VudCBpcyAxXG4gICAgICAgICAgICAjIEl0ZW1zIGhhdmUgYmVlbiByZW1vdmVkLCB1cGRhdGUgdGhlIG9mZnNldFxuICAgICAgICAgICAgQG9mZnNldCArPSBVdGlscy5zdWJTdHJDb3VudCh2YWx1ZSwgXCJcXG5cIikgLSBVdGlscy5zdWJTdHJDb3VudCh0cmltbWVkVmFsdWUsIFwiXFxuXCIpXG4gICAgICAgICAgICB2YWx1ZSA9IHRyaW1tZWRWYWx1ZVxuXG4gICAgICAgICMgUmVtb3ZlIHN0YXJ0IG9mIHRoZSBkb2N1bWVudCBtYXJrZXIgKC0tLSlcbiAgICAgICAgW3RyaW1tZWRWYWx1ZSwgY291bnRdID0gQFBBVFRFUk5fRE9DVU1FTlRfTUFSS0VSX1NUQVJULnJlcGxhY2VBbGwgdmFsdWUsICcnLCAxXG4gICAgICAgIGlmIGNvdW50IGlzIDFcbiAgICAgICAgICAgICMgSXRlbXMgaGF2ZSBiZWVuIHJlbW92ZWQsIHVwZGF0ZSB0aGUgb2Zmc2V0XG4gICAgICAgICAgICBAb2Zmc2V0ICs9IFV0aWxzLnN1YlN0ckNvdW50KHZhbHVlLCBcIlxcblwiKSAtIFV0aWxzLnN1YlN0ckNvdW50KHRyaW1tZWRWYWx1ZSwgXCJcXG5cIilcbiAgICAgICAgICAgIHZhbHVlID0gdHJpbW1lZFZhbHVlXG5cbiAgICAgICAgICAgICMgUmVtb3ZlIGVuZCBvZiB0aGUgZG9jdW1lbnQgbWFya2VyICguLi4pXG4gICAgICAgICAgICB2YWx1ZSA9IEBQQVRURVJOX0RPQ1VNRU5UX01BUktFUl9FTkQucmVwbGFjZSB2YWx1ZSwgJydcblxuICAgICAgICAjIEVuc3VyZSB0aGUgYmxvY2sgaXMgbm90IGluZGVudGVkXG4gICAgICAgIGxpbmVzID0gdmFsdWUuc3BsaXQoXCJcXG5cIilcbiAgICAgICAgc21hbGxlc3RJbmRlbnQgPSAtMVxuICAgICAgICBmb3IgbGluZSBpbiBsaW5lc1xuICAgICAgICAgICAgaW5kZW50ID0gbGluZS5sZW5ndGggLSBVdGlscy5sdHJpbShsaW5lKS5sZW5ndGhcbiAgICAgICAgICAgIGlmIHNtYWxsZXN0SW5kZW50IGlzIC0xIG9yIGluZGVudCA8IHNtYWxsZXN0SW5kZW50XG4gICAgICAgICAgICAgICAgc21hbGxlc3RJbmRlbnQgPSBpbmRlbnRcbiAgICAgICAgaWYgc21hbGxlc3RJbmRlbnQgPiAwXG4gICAgICAgICAgICBmb3IgbGluZSwgaSBpbiBsaW5lc1xuICAgICAgICAgICAgICAgIGxpbmVzW2ldID0gbGluZVtzbWFsbGVzdEluZGVudC4uXVxuICAgICAgICAgICAgdmFsdWUgPSBsaW5lcy5qb2luKFwiXFxuXCIpXG5cbiAgICAgICAgcmV0dXJuIHZhbHVlXG5cblxuICAgICMgUmV0dXJucyB0cnVlIGlmIHRoZSBuZXh0IGxpbmUgc3RhcnRzIHVuaW5kZW50ZWQgY29sbGVjdGlvblxuICAgICNcbiAgICAjIEByZXR1cm4gW0Jvb2xlYW5dICAgICBSZXR1cm5zIHRydWUgaWYgdGhlIG5leHQgbGluZSBzdGFydHMgdW5pbmRlbnRlZCBjb2xsZWN0aW9uLCBmYWxzZSBvdGhlcndpc2VcbiAgICAjXG4gICAgaXNOZXh0TGluZVVuSW5kZW50ZWRDb2xsZWN0aW9uOiAoY3VycmVudEluZGVudGF0aW9uID0gbnVsbCkgLT5cbiAgICAgICAgY3VycmVudEluZGVudGF0aW9uID89IEBnZXRDdXJyZW50TGluZUluZGVudGF0aW9uKClcbiAgICAgICAgbm90RU9GID0gQG1vdmVUb05leHRMaW5lKClcblxuICAgICAgICB3aGlsZSBub3RFT0YgYW5kIEBpc0N1cnJlbnRMaW5lRW1wdHkoKVxuICAgICAgICAgICAgbm90RU9GID0gQG1vdmVUb05leHRMaW5lKClcblxuICAgICAgICBpZiBmYWxzZSBpcyBub3RFT0ZcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgICAgIHJldCA9IGZhbHNlXG4gICAgICAgIGlmIEBnZXRDdXJyZW50TGluZUluZGVudGF0aW9uKCkgaXMgY3VycmVudEluZGVudGF0aW9uIGFuZCBAaXNTdHJpbmdVbkluZGVudGVkQ29sbGVjdGlvbkl0ZW0oQGN1cnJlbnRMaW5lKVxuICAgICAgICAgICAgcmV0ID0gdHJ1ZVxuXG4gICAgICAgIEBtb3ZlVG9QcmV2aW91c0xpbmUoKVxuXG4gICAgICAgIHJldHVybiByZXRcblxuXG4gICAgIyBSZXR1cm5zIHRydWUgaWYgdGhlIHN0cmluZyBpcyB1bi1pbmRlbnRlZCBjb2xsZWN0aW9uIGl0ZW1cbiAgICAjXG4gICAgIyBAcmV0dXJuIFtCb29sZWFuXSAgICAgUmV0dXJucyB0cnVlIGlmIHRoZSBzdHJpbmcgaXMgdW4taW5kZW50ZWQgY29sbGVjdGlvbiBpdGVtLCBmYWxzZSBvdGhlcndpc2VcbiAgICAjXG4gICAgaXNTdHJpbmdVbkluZGVudGVkQ29sbGVjdGlvbkl0ZW06IC0+XG4gICAgICAgIHJldHVybiBAY3VycmVudExpbmUgaXMgJy0nIG9yIEBjdXJyZW50TGluZVswLi4uMl0gaXMgJy0gJ1xuXG5cbm1vZHVsZS5leHBvcnRzID0gUGFyc2VyXG4iLCJcbiMgUGF0dGVybiBpcyBhIHplcm8tY29uZmxpY3Qgd3JhcHBlciBleHRlbmRpbmcgUmVnRXhwIGZlYXR1cmVzXG4jIGluIG9yZGVyIHRvIG1ha2UgWUFNTCBwYXJzaW5nIHJlZ2V4IG1vcmUgZXhwcmVzc2l2ZS5cbiNcbmNsYXNzIFBhdHRlcm5cblxuICAgICMgQHByb3BlcnR5IFtSZWdFeHBdIFRoZSBSZWdFeHAgaW5zdGFuY2VcbiAgICByZWdleDogICAgICAgICAgbnVsbFxuXG4gICAgIyBAcHJvcGVydHkgW1N0cmluZ10gVGhlIHJhdyByZWdleCBzdHJpbmdcbiAgICByYXdSZWdleDogICAgICAgbnVsbFxuXG4gICAgIyBAcHJvcGVydHkgW1N0cmluZ10gVGhlIGNsZWFuZWQgcmVnZXggc3RyaW5nICh1c2VkIHRvIGNyZWF0ZSB0aGUgUmVnRXhwIGluc3RhbmNlKVxuICAgIGNsZWFuZWRSZWdleDogICBudWxsXG5cbiAgICAjIEBwcm9wZXJ0eSBbT2JqZWN0XSBUaGUgZGljdGlvbmFyeSBtYXBwaW5nIG5hbWVzIHRvIGNhcHR1cmluZyBicmFja2V0IG51bWJlcnNcbiAgICBtYXBwaW5nOiAgICAgICAgbnVsbFxuXG4gICAgIyBDb25zdHJ1Y3RvclxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSByYXdSZWdleCBUaGUgcmF3IHJlZ2V4IHN0cmluZyBkZWZpbmluZyB0aGUgcGF0dGVyblxuICAgICNcbiAgICBjb25zdHJ1Y3RvcjogKHJhd1JlZ2V4LCBtb2RpZmllcnMgPSAnJykgLT5cbiAgICAgICAgY2xlYW5lZFJlZ2V4ID0gJydcbiAgICAgICAgbGVuID0gcmF3UmVnZXgubGVuZ3RoXG4gICAgICAgIG1hcHBpbmcgPSBudWxsXG5cbiAgICAgICAgIyBDbGVhbnVwIHJhdyByZWdleCBhbmQgY29tcHV0ZSBtYXBwaW5nXG4gICAgICAgIGNhcHR1cmluZ0JyYWNrZXROdW1iZXIgPSAwXG4gICAgICAgIGkgPSAwXG4gICAgICAgIHdoaWxlIGkgPCBsZW5cbiAgICAgICAgICAgIGNoYXIgPSByYXdSZWdleC5jaGFyQXQoaSlcbiAgICAgICAgICAgIGlmIGNoYXIgaXMgJ1xcXFwnXG4gICAgICAgICAgICAgICAgIyBJZ25vcmUgbmV4dCBjaGFyYWN0ZXJcbiAgICAgICAgICAgICAgICBjbGVhbmVkUmVnZXggKz0gcmF3UmVnZXhbaS4uaSsxXVxuICAgICAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgZWxzZSBpZiBjaGFyIGlzICcoJ1xuICAgICAgICAgICAgICAgICMgSW5jcmVhc2UgYnJhY2tldCBudW1iZXIsIG9ubHkgaWYgaXQgaXMgY2FwdHVyaW5nXG4gICAgICAgICAgICAgICAgaWYgaSA8IGxlbiAtIDJcbiAgICAgICAgICAgICAgICAgICAgcGFydCA9IHJhd1JlZ2V4W2kuLmkrMl1cbiAgICAgICAgICAgICAgICAgICAgaWYgcGFydCBpcyAnKD86J1xuICAgICAgICAgICAgICAgICAgICAgICAgIyBOb24tY2FwdHVyaW5nIGJyYWNrZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgKz0gMlxuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYW5lZFJlZ2V4ICs9IHBhcnRcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBwYXJ0IGlzICcoPzwnXG4gICAgICAgICAgICAgICAgICAgICAgICAjIENhcHR1cmluZyBicmFja2V0IHdpdGggcG9zc2libHkgYSBuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXB0dXJpbmdCcmFja2V0TnVtYmVyKytcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgKz0gMlxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSBpICsgMSA8IGxlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YkNoYXIgPSByYXdSZWdleC5jaGFyQXQoaSArIDEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgc3ViQ2hhciBpcyAnPidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYW5lZFJlZ2V4ICs9ICcoJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpKytcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgbmFtZS5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIEFzc29jaWF0ZSBhIG5hbWUgd2l0aCBhIGNhcHR1cmluZyBicmFja2V0IG51bWJlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwcGluZyA/PSB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwcGluZ1tuYW1lXSA9IGNhcHR1cmluZ0JyYWNrZXROdW1iZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgKz0gc3ViQ2hhclxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFuZWRSZWdleCArPSBjaGFyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXB0dXJpbmdCcmFja2V0TnVtYmVyKytcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGNsZWFuZWRSZWdleCArPSBjaGFyXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY2xlYW5lZFJlZ2V4ICs9IGNoYXJcblxuICAgICAgICAgICAgaSsrXG5cbiAgICAgICAgQHJhd1JlZ2V4ID0gcmF3UmVnZXhcbiAgICAgICAgQGNsZWFuZWRSZWdleCA9IGNsZWFuZWRSZWdleFxuICAgICAgICBAcmVnZXggPSBuZXcgUmVnRXhwIEBjbGVhbmVkUmVnZXgsICdnJyttb2RpZmllcnMucmVwbGFjZSgnZycsICcnKVxuICAgICAgICBAbWFwcGluZyA9IG1hcHBpbmdcblxuXG4gICAgIyBFeGVjdXRlcyB0aGUgcGF0dGVybidzIHJlZ2V4IGFuZCByZXR1cm5zIHRoZSBtYXRjaGluZyB2YWx1ZXNcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gc3RyIFRoZSBzdHJpbmcgdG8gdXNlIHRvIGV4ZWN1dGUgdGhlIHBhdHRlcm5cbiAgICAjXG4gICAgIyBAcmV0dXJuIFtBcnJheV0gVGhlIG1hdGNoaW5nIHZhbHVlcyBleHRyYWN0ZWQgZnJvbSBjYXB0dXJpbmcgYnJhY2tldHMgb3IgbnVsbCBpZiBub3RoaW5nIG1hdGNoZWRcbiAgICAjXG4gICAgZXhlYzogKHN0cikgLT5cbiAgICAgICAgQHJlZ2V4Lmxhc3RJbmRleCA9IDBcbiAgICAgICAgbWF0Y2hlcyA9IEByZWdleC5leGVjIHN0clxuXG4gICAgICAgIGlmIG5vdCBtYXRjaGVzP1xuICAgICAgICAgICAgcmV0dXJuIG51bGxcblxuICAgICAgICBpZiBAbWFwcGluZz9cbiAgICAgICAgICAgIGZvciBuYW1lLCBpbmRleCBvZiBAbWFwcGluZ1xuICAgICAgICAgICAgICAgIG1hdGNoZXNbbmFtZV0gPSBtYXRjaGVzW2luZGV4XVxuXG4gICAgICAgIHJldHVybiBtYXRjaGVzXG5cblxuICAgICMgVGVzdHMgdGhlIHBhdHRlcm4ncyByZWdleFxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSBzdHIgVGhlIHN0cmluZyB0byB1c2UgdG8gdGVzdCB0aGUgcGF0dGVyblxuICAgICNcbiAgICAjIEByZXR1cm4gW0Jvb2xlYW5dIHRydWUgaWYgdGhlIHN0cmluZyBtYXRjaGVkXG4gICAgI1xuICAgIHRlc3Q6IChzdHIpIC0+XG4gICAgICAgIEByZWdleC5sYXN0SW5kZXggPSAwXG4gICAgICAgIHJldHVybiBAcmVnZXgudGVzdCBzdHJcblxuXG4gICAgIyBSZXBsYWNlcyBvY2N1cmVuY2VzIG1hdGNoaW5nIHdpdGggdGhlIHBhdHRlcm4ncyByZWdleCB3aXRoIHJlcGxhY2VtZW50XG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddIHN0ciBUaGUgc291cmNlIHN0cmluZyB0byBwZXJmb3JtIHJlcGxhY2VtZW50c1xuICAgICMgQHBhcmFtIFtTdHJpbmddIHJlcGxhY2VtZW50IFRoZSBzdHJpbmcgdG8gdXNlIGluIHBsYWNlIG9mIGVhY2ggcmVwbGFjZWQgb2NjdXJlbmNlLlxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gVGhlIHJlcGxhY2VkIHN0cmluZ1xuICAgICNcbiAgICByZXBsYWNlOiAoc3RyLCByZXBsYWNlbWVudCkgLT5cbiAgICAgICAgQHJlZ2V4Lmxhc3RJbmRleCA9IDBcbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlIEByZWdleCwgcmVwbGFjZW1lbnRcblxuXG4gICAgIyBSZXBsYWNlcyBvY2N1cmVuY2VzIG1hdGNoaW5nIHdpdGggdGhlIHBhdHRlcm4ncyByZWdleCB3aXRoIHJlcGxhY2VtZW50IGFuZFxuICAgICMgZ2V0IGJvdGggdGhlIHJlcGxhY2VkIHN0cmluZyBhbmQgdGhlIG51bWJlciBvZiByZXBsYWNlZCBvY2N1cmVuY2VzIGluIHRoZSBzdHJpbmcuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddIHN0ciBUaGUgc291cmNlIHN0cmluZyB0byBwZXJmb3JtIHJlcGxhY2VtZW50c1xuICAgICMgQHBhcmFtIFtTdHJpbmddIHJlcGxhY2VtZW50IFRoZSBzdHJpbmcgdG8gdXNlIGluIHBsYWNlIG9mIGVhY2ggcmVwbGFjZWQgb2NjdXJlbmNlLlxuICAgICMgQHBhcmFtIFtJbnRlZ2VyXSBsaW1pdCBUaGUgbWF4aW11bSBudW1iZXIgb2Ygb2NjdXJlbmNlcyB0byByZXBsYWNlICgwIG1lYW5zIGluZmluaXRlIG51bWJlciBvZiBvY2N1cmVuY2VzKVxuICAgICNcbiAgICAjIEByZXR1cm4gW0FycmF5XSBBIGRlc3RydWN0dXJhYmxlIGFycmF5IGNvbnRhaW5pbmcgdGhlIHJlcGxhY2VkIHN0cmluZyBhbmQgdGhlIG51bWJlciBvZiByZXBsYWNlZCBvY2N1cmVuY2VzLiBGb3IgaW5zdGFuY2U6IFtcIm15IHJlcGxhY2VkIHN0cmluZ1wiLCAyXVxuICAgICNcbiAgICByZXBsYWNlQWxsOiAoc3RyLCByZXBsYWNlbWVudCwgbGltaXQgPSAwKSAtPlxuICAgICAgICBAcmVnZXgubGFzdEluZGV4ID0gMFxuICAgICAgICBjb3VudCA9IDBcbiAgICAgICAgd2hpbGUgQHJlZ2V4LnRlc3Qoc3RyKSBhbmQgKGxpbWl0IGlzIDAgb3IgY291bnQgPCBsaW1pdClcbiAgICAgICAgICAgIEByZWdleC5sYXN0SW5kZXggPSAwXG4gICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZSBAcmVnZXgsICcnXG4gICAgICAgICAgICBjb3VudCsrXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gW3N0ciwgY291bnRdXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYXR0ZXJuXG5cbiIsIlxuVXRpbHMgICA9IHJlcXVpcmUgJy4vVXRpbHMnXG5QYXR0ZXJuID0gcmVxdWlyZSAnLi9QYXR0ZXJuJ1xuXG4jIFVuZXNjYXBlciBlbmNhcHN1bGF0ZXMgdW5lc2NhcGluZyBydWxlcyBmb3Igc2luZ2xlIGFuZCBkb3VibGUtcXVvdGVkIFlBTUwgc3RyaW5ncy5cbiNcbmNsYXNzIFVuZXNjYXBlclxuXG4gICAgIyBSZWdleCBmcmFnbWVudCB0aGF0IG1hdGNoZXMgYW4gZXNjYXBlZCBjaGFyYWN0ZXIgaW5cbiAgICAjIGEgZG91YmxlIHF1b3RlZCBzdHJpbmcuXG4gICAgQFBBVFRFUk5fRVNDQVBFRF9DSEFSQUNURVI6ICAgICBuZXcgUGF0dGVybiAnXFxcXFxcXFwoWzBhYnRcXHRudmZyZSBcIlxcXFwvXFxcXFxcXFxOX0xQXXx4WzAtOWEtZkEtRl17Mn18dVswLTlhLWZBLUZdezR9fFVbMC05YS1mQS1GXXs4fSknO1xuXG5cbiAgICAjIFVuZXNjYXBlcyBhIHNpbmdsZSBxdW90ZWQgc3RyaW5nLlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgICAgICB2YWx1ZSBBIHNpbmdsZSBxdW90ZWQgc3RyaW5nLlxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gICAgICBUaGUgdW5lc2NhcGVkIHN0cmluZy5cbiAgICAjXG4gICAgQHVuZXNjYXBlU2luZ2xlUXVvdGVkU3RyaW5nOiAodmFsdWUpIC0+XG4gICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC9cXCdcXCcvZywgJ1xcJycpXG5cblxuICAgICMgVW5lc2NhcGVzIGEgZG91YmxlIHF1b3RlZCBzdHJpbmcuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgICAgIHZhbHVlIEEgZG91YmxlIHF1b3RlZCBzdHJpbmcuXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgICAgIFRoZSB1bmVzY2FwZWQgc3RyaW5nLlxuICAgICNcbiAgICBAdW5lc2NhcGVEb3VibGVRdW90ZWRTdHJpbmc6ICh2YWx1ZSkgLT5cbiAgICAgICAgQF91bmVzY2FwZUNhbGxiYWNrID89IChzdHIpID0+XG4gICAgICAgICAgICByZXR1cm4gQHVuZXNjYXBlQ2hhcmFjdGVyKHN0cilcblxuICAgICAgICAjIEV2YWx1YXRlIHRoZSBzdHJpbmdcbiAgICAgICAgcmV0dXJuIEBQQVRURVJOX0VTQ0FQRURfQ0hBUkFDVEVSLnJlcGxhY2UgdmFsdWUsIEBfdW5lc2NhcGVDYWxsYmFja1xuXG5cbiAgICAjIFVuZXNjYXBlcyBhIGNoYXJhY3RlciB0aGF0IHdhcyBmb3VuZCBpbiBhIGRvdWJsZS1xdW90ZWQgc3RyaW5nXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgICAgIHZhbHVlIEFuIGVzY2FwZWQgY2hhcmFjdGVyXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgICAgIFRoZSB1bmVzY2FwZWQgY2hhcmFjdGVyXG4gICAgI1xuICAgIEB1bmVzY2FwZUNoYXJhY3RlcjogKHZhbHVlKSAtPlxuICAgICAgICBjaCA9IFN0cmluZy5mcm9tQ2hhckNvZGVcbiAgICAgICAgc3dpdGNoIHZhbHVlLmNoYXJBdCgxKVxuICAgICAgICAgICAgd2hlbiAnMCdcbiAgICAgICAgICAgICAgICByZXR1cm4gY2goMClcbiAgICAgICAgICAgIHdoZW4gJ2EnXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoKDcpXG4gICAgICAgICAgICB3aGVuICdiJ1xuICAgICAgICAgICAgICAgIHJldHVybiBjaCg4KVxuICAgICAgICAgICAgd2hlbiAndCdcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJcXHRcIlxuICAgICAgICAgICAgd2hlbiBcIlxcdFwiXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiXFx0XCJcbiAgICAgICAgICAgIHdoZW4gJ24nXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiXFxuXCJcbiAgICAgICAgICAgIHdoZW4gJ3YnXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoKDExKVxuICAgICAgICAgICAgd2hlbiAnZidcbiAgICAgICAgICAgICAgICByZXR1cm4gY2goMTIpXG4gICAgICAgICAgICB3aGVuICdyJ1xuICAgICAgICAgICAgICAgIHJldHVybiBjaCgxMylcbiAgICAgICAgICAgIHdoZW4gJ2UnXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoKDI3KVxuICAgICAgICAgICAgd2hlbiAnICdcbiAgICAgICAgICAgICAgICByZXR1cm4gJyAnXG4gICAgICAgICAgICB3aGVuICdcIidcbiAgICAgICAgICAgICAgICByZXR1cm4gJ1wiJ1xuICAgICAgICAgICAgd2hlbiAnLydcbiAgICAgICAgICAgICAgICByZXR1cm4gJy8nXG4gICAgICAgICAgICB3aGVuICdcXFxcJ1xuICAgICAgICAgICAgICAgIHJldHVybiAnXFxcXCdcbiAgICAgICAgICAgIHdoZW4gJ04nXG4gICAgICAgICAgICAgICAgIyBVKzAwODUgTkVYVCBMSU5FXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoKDB4MDA4NSlcbiAgICAgICAgICAgIHdoZW4gJ18nXG4gICAgICAgICAgICAgICAgIyBVKzAwQTAgTk8tQlJFQUsgU1BBQ0VcbiAgICAgICAgICAgICAgICByZXR1cm4gY2goMHgwMEEwKVxuICAgICAgICAgICAgd2hlbiAnTCdcbiAgICAgICAgICAgICAgICAjIFUrMjAyOCBMSU5FIFNFUEFSQVRPUlxuICAgICAgICAgICAgICAgIHJldHVybiBjaCgweDIwMjgpXG4gICAgICAgICAgICB3aGVuICdQJ1xuICAgICAgICAgICAgICAgICMgVSsyMDI5IFBBUkFHUkFQSCBTRVBBUkFUT1JcbiAgICAgICAgICAgICAgICByZXR1cm4gY2goMHgyMDI5KVxuICAgICAgICAgICAgd2hlbiAneCdcbiAgICAgICAgICAgICAgICByZXR1cm4gVXRpbHMudXRmOGNocihVdGlscy5oZXhEZWModmFsdWUuc3Vic3RyKDIsIDIpKSlcbiAgICAgICAgICAgIHdoZW4gJ3UnXG4gICAgICAgICAgICAgICAgcmV0dXJuIFV0aWxzLnV0ZjhjaHIoVXRpbHMuaGV4RGVjKHZhbHVlLnN1YnN0cigyLCA0KSkpXG4gICAgICAgICAgICB3aGVuICdVJ1xuICAgICAgICAgICAgICAgIHJldHVybiBVdGlscy51dGY4Y2hyKFV0aWxzLmhleERlYyh2YWx1ZS5zdWJzdHIoMiwgOCkpKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiAnJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFVuZXNjYXBlclxuIiwiXG5QYXR0ZXJuID0gcmVxdWlyZSAnLi9QYXR0ZXJuJ1xuXG4jIEEgYnVuY2ggb2YgdXRpbGl0eSBtZXRob2RzXG4jXG5jbGFzcyBVdGlsc1xuXG4gICAgQFJFR0VYX0xFRlRfVFJJTV9CWV9DSEFSOiAgIHt9XG4gICAgQFJFR0VYX1JJR0hUX1RSSU1fQllfQ0hBUjogIHt9XG4gICAgQFJFR0VYX1NQQUNFUzogICAgICAgICAgICAgIC9cXHMrL2dcbiAgICBAUkVHRVhfRElHSVRTOiAgICAgICAgICAgICAgL15cXGQrJC9cbiAgICBAUkVHRVhfT0NUQUw6ICAgICAgICAgICAgICAgL1teMC03XS9naVxuICAgIEBSRUdFWF9IRVhBREVDSU1BTDogICAgICAgICAvW15hLWYwLTldL2dpXG5cbiAgICAjIFByZWNvbXBpbGVkIGRhdGUgcGF0dGVyblxuICAgIEBQQVRURVJOX0RBVEU6ICAgICAgICAgICAgICBuZXcgUGF0dGVybiAnXicrXG4gICAgICAgICAgICAnKD88eWVhcj5bMC05XVswLTldWzAtOV1bMC05XSknK1xuICAgICAgICAgICAgJy0oPzxtb250aD5bMC05XVswLTldPyknK1xuICAgICAgICAgICAgJy0oPzxkYXk+WzAtOV1bMC05XT8pJytcbiAgICAgICAgICAgICcoPzooPzpbVHRdfFsgXFx0XSspJytcbiAgICAgICAgICAgICcoPzxob3VyPlswLTldWzAtOV0/KScrXG4gICAgICAgICAgICAnOig/PG1pbnV0ZT5bMC05XVswLTldKScrXG4gICAgICAgICAgICAnOig/PHNlY29uZD5bMC05XVswLTldKScrXG4gICAgICAgICAgICAnKD86XFwuKD88ZnJhY3Rpb24+WzAtOV0qKSk/JytcbiAgICAgICAgICAgICcoPzpbIFxcdF0qKD88dHo+WnwoPzx0el9zaWduPlstK10pKD88dHpfaG91cj5bMC05XVswLTldPyknK1xuICAgICAgICAgICAgJyg/OjooPzx0el9taW51dGU+WzAtOV1bMC05XSkpPykpPyk/JytcbiAgICAgICAgICAgICckJywgJ2knXG5cbiAgICAjIExvY2FsIHRpbWV6b25lIG9mZnNldCBpbiBtc1xuICAgIEBMT0NBTF9USU1FWk9ORV9PRkZTRVQ6ICAgICBuZXcgRGF0ZSgpLmdldFRpbWV6b25lT2Zmc2V0KCkgKiA2MCAqIDEwMDBcblxuICAgICMgVHJpbXMgdGhlIGdpdmVuIHN0cmluZyBvbiBib3RoIHNpZGVzXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddIHN0ciBUaGUgc3RyaW5nIHRvIHRyaW1cbiAgICAjIEBwYXJhbSBbU3RyaW5nXSBjaGFyIFRoZSBjaGFyYWN0ZXIgdG8gdXNlIGZvciB0cmltbWluZyAoZGVmYXVsdDogJ1xcXFxzJylcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddIEEgdHJpbW1lZCBzdHJpbmdcbiAgICAjXG4gICAgQHRyaW06IChzdHIsIGNoYXIgPSAnXFxcXHMnKSAtPlxuICAgICAgICByZXR1cm4gc3RyLnRyaW0oKVxuICAgICAgICByZWdleExlZnQgPSBAUkVHRVhfTEVGVF9UUklNX0JZX0NIQVJbY2hhcl1cbiAgICAgICAgdW5sZXNzIHJlZ2V4TGVmdD9cbiAgICAgICAgICAgIEBSRUdFWF9MRUZUX1RSSU1fQllfQ0hBUltjaGFyXSA9IHJlZ2V4TGVmdCA9IG5ldyBSZWdFeHAgJ14nK2NoYXIrJycrY2hhcisnKidcbiAgICAgICAgcmVnZXhMZWZ0Lmxhc3RJbmRleCA9IDBcbiAgICAgICAgcmVnZXhSaWdodCA9IEBSRUdFWF9SSUdIVF9UUklNX0JZX0NIQVJbY2hhcl1cbiAgICAgICAgdW5sZXNzIHJlZ2V4UmlnaHQ/XG4gICAgICAgICAgICBAUkVHRVhfUklHSFRfVFJJTV9CWV9DSEFSW2NoYXJdID0gcmVnZXhSaWdodCA9IG5ldyBSZWdFeHAgY2hhcisnJytjaGFyKycqJCdcbiAgICAgICAgcmVnZXhSaWdodC5sYXN0SW5kZXggPSAwXG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZShyZWdleExlZnQsICcnKS5yZXBsYWNlKHJlZ2V4UmlnaHQsICcnKVxuXG5cbiAgICAjIFRyaW1zIHRoZSBnaXZlbiBzdHJpbmcgb24gdGhlIGxlZnQgc2lkZVxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSBzdHIgVGhlIHN0cmluZyB0byB0cmltXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gY2hhciBUaGUgY2hhcmFjdGVyIHRvIHVzZSBmb3IgdHJpbW1pbmcgKGRlZmF1bHQ6ICdcXFxccycpXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSBBIHRyaW1tZWQgc3RyaW5nXG4gICAgI1xuICAgIEBsdHJpbTogKHN0ciwgY2hhciA9ICdcXFxccycpIC0+XG4gICAgICAgIHJlZ2V4TGVmdCA9IEBSRUdFWF9MRUZUX1RSSU1fQllfQ0hBUltjaGFyXVxuICAgICAgICB1bmxlc3MgcmVnZXhMZWZ0P1xuICAgICAgICAgICAgQFJFR0VYX0xFRlRfVFJJTV9CWV9DSEFSW2NoYXJdID0gcmVnZXhMZWZ0ID0gbmV3IFJlZ0V4cCAnXicrY2hhcisnJytjaGFyKycqJ1xuICAgICAgICByZWdleExlZnQubGFzdEluZGV4ID0gMFxuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UocmVnZXhMZWZ0LCAnJylcblxuXG4gICAgIyBUcmltcyB0aGUgZ2l2ZW4gc3RyaW5nIG9uIHRoZSByaWdodCBzaWRlXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddIHN0ciBUaGUgc3RyaW5nIHRvIHRyaW1cbiAgICAjIEBwYXJhbSBbU3RyaW5nXSBjaGFyIFRoZSBjaGFyYWN0ZXIgdG8gdXNlIGZvciB0cmltbWluZyAoZGVmYXVsdDogJ1xcXFxzJylcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddIEEgdHJpbW1lZCBzdHJpbmdcbiAgICAjXG4gICAgQHJ0cmltOiAoc3RyLCBjaGFyID0gJ1xcXFxzJykgLT5cbiAgICAgICAgcmVnZXhSaWdodCA9IEBSRUdFWF9SSUdIVF9UUklNX0JZX0NIQVJbY2hhcl1cbiAgICAgICAgdW5sZXNzIHJlZ2V4UmlnaHQ/XG4gICAgICAgICAgICBAUkVHRVhfUklHSFRfVFJJTV9CWV9DSEFSW2NoYXJdID0gcmVnZXhSaWdodCA9IG5ldyBSZWdFeHAgY2hhcisnJytjaGFyKycqJCdcbiAgICAgICAgcmVnZXhSaWdodC5sYXN0SW5kZXggPSAwXG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZShyZWdleFJpZ2h0LCAnJylcblxuXG4gICAgIyBDaGVja3MgaWYgdGhlIGdpdmVuIHZhbHVlIGlzIGVtcHR5IChudWxsLCB1bmRlZmluZWQsIGVtcHR5IHN0cmluZywgc3RyaW5nICcwJylcbiAgICAjXG4gICAgIyBAcGFyYW0gW09iamVjdF0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrXG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gdHJ1ZSBpZiB0aGUgdmFsdWUgaXMgZW1wdHlcbiAgICAjXG4gICAgQGlzRW1wdHk6ICh2YWx1ZSkgLT5cbiAgICAgICAgcmV0dXJuIG5vdCh2YWx1ZSkgb3IgdmFsdWUgaXMgJycgb3IgdmFsdWUgaXMgJzAnXG5cblxuICAgICMgQ291bnRzIHRoZSBudW1iZXIgb2Ygb2NjdXJlbmNlcyBvZiBzdWJTdHJpbmcgaW5zaWRlIHN0cmluZ1xuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSBzdHJpbmcgVGhlIHN0cmluZyB3aGVyZSB0byBjb3VudCBvY2N1cmVuY2VzXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gc3ViU3RyaW5nIFRoZSBzdWJTdHJpbmcgdG8gY291bnRcbiAgICAjIEBwYXJhbSBbSW50ZWdlcl0gc3RhcnQgVGhlIHN0YXJ0IGluZGV4XG4gICAgIyBAcGFyYW0gW0ludGVnZXJdIGxlbmd0aCBUaGUgc3RyaW5nIGxlbmd0aCB1bnRpbCB3aGVyZSB0byBjb3VudFxuICAgICNcbiAgICAjIEByZXR1cm4gW0ludGVnZXJdIFRoZSBudW1iZXIgb2Ygb2NjdXJlbmNlc1xuICAgICNcbiAgICBAc3ViU3RyQ291bnQ6IChzdHJpbmcsIHN1YlN0cmluZywgc3RhcnQsIGxlbmd0aCkgLT5cbiAgICAgICAgYyA9IDBcbiAgICAgICAgXG4gICAgICAgIHN0cmluZyA9ICcnICsgc3RyaW5nXG4gICAgICAgIHN1YlN0cmluZyA9ICcnICsgc3ViU3RyaW5nXG4gICAgICAgIFxuICAgICAgICBpZiBzdGFydD9cbiAgICAgICAgICAgIHN0cmluZyA9IHN0cmluZ1tzdGFydC4uXVxuICAgICAgICBpZiBsZW5ndGg/XG4gICAgICAgICAgICBzdHJpbmcgPSBzdHJpbmdbMC4uLmxlbmd0aF1cbiAgICAgICAgXG4gICAgICAgIGxlbiA9IHN0cmluZy5sZW5ndGhcbiAgICAgICAgc3VibGVuID0gc3ViU3RyaW5nLmxlbmd0aFxuICAgICAgICBmb3IgaSBpbiBbMC4uLmxlbl1cbiAgICAgICAgICAgIGlmIHN1YlN0cmluZyBpcyBzdHJpbmdbaS4uLnN1Ymxlbl1cbiAgICAgICAgICAgICAgICBjKytcbiAgICAgICAgICAgICAgICBpICs9IHN1YmxlbiAtIDFcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBjXG5cblxuICAgICMgUmV0dXJucyB0cnVlIGlmIGlucHV0IGlzIG9ubHkgY29tcG9zZWQgb2YgZGlnaXRzXG4gICAgI1xuICAgICMgQHBhcmFtIFtPYmplY3RdIGlucHV0IFRoZSB2YWx1ZSB0byB0ZXN0XG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gdHJ1ZSBpZiBpbnB1dCBpcyBvbmx5IGNvbXBvc2VkIG9mIGRpZ2l0c1xuICAgICNcbiAgICBAaXNEaWdpdHM6IChpbnB1dCkgLT5cbiAgICAgICAgQFJFR0VYX0RJR0lUUy5sYXN0SW5kZXggPSAwXG4gICAgICAgIHJldHVybiBAUkVHRVhfRElHSVRTLnRlc3QgaW5wdXRcblxuXG4gICAgIyBEZWNvZGUgb2N0YWwgdmFsdWVcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gaW5wdXQgVGhlIHZhbHVlIHRvIGRlY29kZVxuICAgICNcbiAgICAjIEByZXR1cm4gW0ludGVnZXJdIFRoZSBkZWNvZGVkIHZhbHVlXG4gICAgI1xuICAgIEBvY3REZWM6IChpbnB1dCkgLT5cbiAgICAgICAgQFJFR0VYX09DVEFMLmxhc3RJbmRleCA9IDBcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KChpbnB1dCsnJykucmVwbGFjZShAUkVHRVhfT0NUQUwsICcnKSwgOClcblxuXG4gICAgIyBEZWNvZGUgaGV4YWRlY2ltYWwgdmFsdWVcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gaW5wdXQgVGhlIHZhbHVlIHRvIGRlY29kZVxuICAgICNcbiAgICAjIEByZXR1cm4gW0ludGVnZXJdIFRoZSBkZWNvZGVkIHZhbHVlXG4gICAgI1xuICAgIEBoZXhEZWM6IChpbnB1dCkgLT5cbiAgICAgICAgQFJFR0VYX0hFWEFERUNJTUFMLmxhc3RJbmRleCA9IDBcbiAgICAgICAgaW5wdXQgPSBAdHJpbShpbnB1dClcbiAgICAgICAgaWYgKGlucHV0KycnKVswLi4uMl0gaXMgJzB4JyB0aGVuIGlucHV0ID0gKGlucHV0KycnKVsyLi5dXG4gICAgICAgIHJldHVybiBwYXJzZUludCgoaW5wdXQrJycpLnJlcGxhY2UoQFJFR0VYX0hFWEFERUNJTUFMLCAnJyksIDE2KVxuXG5cbiAgICAjIEdldCB0aGUgVVRGLTggY2hhcmFjdGVyIGZvciB0aGUgZ2l2ZW4gY29kZSBwb2ludC5cbiAgICAjXG4gICAgIyBAcGFyYW0gW0ludGVnZXJdIGMgVGhlIHVuaWNvZGUgY29kZSBwb2ludFxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gVGhlIGNvcnJlc3BvbmRpbmcgVVRGLTggY2hhcmFjdGVyXG4gICAgI1xuICAgIEB1dGY4Y2hyOiAoYykgLT5cbiAgICAgICAgY2ggPSBTdHJpbmcuZnJvbUNoYXJDb2RlXG4gICAgICAgIGlmIDB4ODAgPiAoYyAlPSAweDIwMDAwMClcbiAgICAgICAgICAgIHJldHVybiBjaChjKVxuICAgICAgICBpZiAweDgwMCA+IGNcbiAgICAgICAgICAgIHJldHVybiBjaCgweEMwIHwgYz4+NikgKyBjaCgweDgwIHwgYyAmIDB4M0YpXG4gICAgICAgIGlmIDB4MTAwMDAgPiBjXG4gICAgICAgICAgICByZXR1cm4gY2goMHhFMCB8IGM+PjEyKSArIGNoKDB4ODAgfCBjPj42ICYgMHgzRikgKyBjaCgweDgwIHwgYyAmIDB4M0YpXG5cbiAgICAgICAgcmV0dXJuIGNoKDB4RjAgfCBjPj4xOCkgKyBjaCgweDgwIHwgYz4+MTIgJiAweDNGKSArIGNoKDB4ODAgfCBjPj42ICYgMHgzRikgKyBjaCgweDgwIHwgYyAmIDB4M0YpXG5cblxuICAgICMgUmV0dXJucyB0aGUgYm9vbGVhbiB2YWx1ZSBlcXVpdmFsZW50IHRvIHRoZSBnaXZlbiBpbnB1dFxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nfE9iamVjdF0gICAgaW5wdXQgICAgICAgVGhlIGlucHV0IHZhbHVlXG4gICAgIyBAcGFyYW0gW0Jvb2xlYW5dICAgICAgICAgIHN0cmljdCAgICAgIElmIHNldCB0byBmYWxzZSwgYWNjZXB0ICd5ZXMnIGFuZCAnbm8nIGFzIGJvb2xlYW4gdmFsdWVzXG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gICAgICAgICB0aGUgYm9vbGVhbiB2YWx1ZVxuICAgICNcbiAgICBAcGFyc2VCb29sZWFuOiAoaW5wdXQsIHN0cmljdCA9IHRydWUpIC0+XG4gICAgICAgIGlmIHR5cGVvZihpbnB1dCkgaXMgJ3N0cmluZydcbiAgICAgICAgICAgIGxvd2VySW5wdXQgPSBpbnB1dC50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICBpZiBub3Qgc3RyaWN0XG4gICAgICAgICAgICAgICAgaWYgbG93ZXJJbnB1dCBpcyAnbm8nIHRoZW4gcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICBpZiBsb3dlcklucHV0IGlzICcwJyB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgaWYgbG93ZXJJbnB1dCBpcyAnZmFsc2UnIHRoZW4gcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICBpZiBsb3dlcklucHV0IGlzICcnIHRoZW4gcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICByZXR1cm4gISFpbnB1dFxuXG5cblxuICAgICMgUmV0dXJucyB0cnVlIGlmIGlucHV0IGlzIG51bWVyaWNcbiAgICAjXG4gICAgIyBAcGFyYW0gW09iamVjdF0gaW5wdXQgVGhlIHZhbHVlIHRvIHRlc3RcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtCb29sZWFuXSB0cnVlIGlmIGlucHV0IGlzIG51bWVyaWNcbiAgICAjXG4gICAgQGlzTnVtZXJpYzogKGlucHV0KSAtPlxuICAgICAgICBAUkVHRVhfU1BBQ0VTLmxhc3RJbmRleCA9IDBcbiAgICAgICAgcmV0dXJuIHR5cGVvZihpbnB1dCkgaXMgJ251bWJlcicgb3IgdHlwZW9mKGlucHV0KSBpcyAnc3RyaW5nJyBhbmQgIWlzTmFOKGlucHV0KSBhbmQgaW5wdXQucmVwbGFjZShAUkVHRVhfU1BBQ0VTLCAnJykgaXNudCAnJ1xuXG5cbiAgICAjIFJldHVybnMgYSBwYXJzZWQgZGF0ZSBmcm9tIHRoZSBnaXZlbiBzdHJpbmdcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gc3RyIFRoZSBkYXRlIHN0cmluZyB0byBwYXJzZVxuICAgICNcbiAgICAjIEByZXR1cm4gW0RhdGVdIFRoZSBwYXJzZWQgZGF0ZSBvciBudWxsIGlmIHBhcnNpbmcgZmFpbGVkXG4gICAgI1xuICAgIEBzdHJpbmdUb0RhdGU6IChzdHIpIC0+XG4gICAgICAgIHVubGVzcyBzdHI/Lmxlbmd0aFxuICAgICAgICAgICAgcmV0dXJuIG51bGxcblxuICAgICAgICAjIFBlcmZvcm0gcmVndWxhciBleHByZXNzaW9uIHBhdHRlcm5cbiAgICAgICAgaW5mbyA9IEBQQVRURVJOX0RBVEUuZXhlYyBzdHJcbiAgICAgICAgdW5sZXNzIGluZm9cbiAgICAgICAgICAgIHJldHVybiBudWxsXG5cbiAgICAgICAgIyBFeHRyYWN0IHllYXIsIG1vbnRoLCBkYXlcbiAgICAgICAgeWVhciA9IHBhcnNlSW50IGluZm8ueWVhciwgMTBcbiAgICAgICAgbW9udGggPSBwYXJzZUludChpbmZvLm1vbnRoLCAxMCkgLSAxICMgSW4gamF2YXNjcmlwdCwgamFudWFyeSBpcyAwLCBmZWJydWFyeSAxLCBldGMuLi5cbiAgICAgICAgZGF5ID0gcGFyc2VJbnQgaW5mby5kYXksIDEwXG5cbiAgICAgICAgIyBJZiBubyBob3VyIGlzIGdpdmVuLCByZXR1cm4gYSBkYXRlIHdpdGggZGF5IHByZWNpc2lvblxuICAgICAgICB1bmxlc3MgaW5mby5ob3VyP1xuICAgICAgICAgICAgZGF0ZSA9IG5ldyBEYXRlIERhdGUuVVRDKHllYXIsIG1vbnRoLCBkYXkpXG4gICAgICAgICAgICByZXR1cm4gZGF0ZVxuXG4gICAgICAgICMgRXh0cmFjdCBob3VyLCBtaW51dGUsIHNlY29uZFxuICAgICAgICBob3VyID0gcGFyc2VJbnQgaW5mby5ob3VyLCAxMFxuICAgICAgICBtaW51dGUgPSBwYXJzZUludCBpbmZvLm1pbnV0ZSwgMTBcbiAgICAgICAgc2Vjb25kID0gcGFyc2VJbnQgaW5mby5zZWNvbmQsIDEwXG5cbiAgICAgICAgIyBFeHRyYWN0IGZyYWN0aW9uLCBpZiBnaXZlblxuICAgICAgICBpZiBpbmZvLmZyYWN0aW9uP1xuICAgICAgICAgICAgZnJhY3Rpb24gPSBpbmZvLmZyYWN0aW9uWzAuLi4zXVxuICAgICAgICAgICAgd2hpbGUgZnJhY3Rpb24ubGVuZ3RoIDwgM1xuICAgICAgICAgICAgICAgIGZyYWN0aW9uICs9ICcwJ1xuICAgICAgICAgICAgZnJhY3Rpb24gPSBwYXJzZUludCBmcmFjdGlvbiwgMTBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZnJhY3Rpb24gPSAwXG5cbiAgICAgICAgIyBDb21wdXRlIHRpbWV6b25lIG9mZnNldCBpZiBnaXZlblxuICAgICAgICBpZiBpbmZvLnR6P1xuICAgICAgICAgICAgdHpfaG91ciA9IHBhcnNlSW50IGluZm8udHpfaG91ciwgMTBcbiAgICAgICAgICAgIGlmIGluZm8udHpfbWludXRlP1xuICAgICAgICAgICAgICAgIHR6X21pbnV0ZSA9IHBhcnNlSW50IGluZm8udHpfbWludXRlLCAxMFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHR6X21pbnV0ZSA9IDBcblxuICAgICAgICAgICAgIyBDb21wdXRlIHRpbWV6b25lIGRlbHRhIGluIG1zXG4gICAgICAgICAgICB0el9vZmZzZXQgPSAodHpfaG91ciAqIDYwICsgdHpfbWludXRlKSAqIDYwMDAwXG4gICAgICAgICAgICBpZiAnLScgaXMgaW5mby50el9zaWduXG4gICAgICAgICAgICAgICAgdHpfb2Zmc2V0ICo9IC0xXG5cbiAgICAgICAgIyBDb21wdXRlIGRhdGVcbiAgICAgICAgZGF0ZSA9IG5ldyBEYXRlIERhdGUuVVRDKHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBmcmFjdGlvbilcbiAgICAgICAgaWYgdHpfb2Zmc2V0XG4gICAgICAgICAgICBkYXRlLnNldFRpbWUgZGF0ZS5nZXRUaW1lKCkgKyB0el9vZmZzZXRcblxuICAgICAgICByZXR1cm4gZGF0ZVxuXG5cbiAgICAjIFJlcGVhdHMgdGhlIGdpdmVuIHN0cmluZyBhIG51bWJlciBvZiB0aW1lc1xuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIHN0ciAgICAgVGhlIHN0cmluZyB0byByZXBlYXRcbiAgICAjIEBwYXJhbSBbSW50ZWdlcl0gIG51bWJlciAgVGhlIG51bWJlciBvZiB0aW1lcyB0byByZXBlYXQgdGhlIHN0cmluZ1xuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIFRoZSByZXBlYXRlZCBzdHJpbmdcbiAgICAjXG4gICAgQHN0clJlcGVhdDogKHN0ciwgbnVtYmVyKSAtPlxuICAgICAgICByZXMgPSAnJ1xuICAgICAgICBpID0gMFxuICAgICAgICB3aGlsZSBpIDwgbnVtYmVyXG4gICAgICAgICAgICByZXMgKz0gc3RyXG4gICAgICAgICAgICBpKytcbiAgICAgICAgcmV0dXJuIHJlc1xuXG5cbiAgICAjIFJlYWRzIHRoZSBkYXRhIGZyb20gdGhlIGdpdmVuIGZpbGUgcGF0aCBhbmQgcmV0dXJucyB0aGUgcmVzdWx0IGFzIHN0cmluZ1xuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIHBhdGggICAgICAgIFRoZSBwYXRoIHRvIHRoZSBmaWxlXG4gICAgIyBAcGFyYW0gW0Z1bmN0aW9uXSBjYWxsYmFjayAgICBBIGNhbGxiYWNrIHRvIHJlYWQgZmlsZSBhc3luY2hyb25vdXNseSAob3B0aW9uYWwpXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgVGhlIHJlc3VsdGluZyBkYXRhIGFzIHN0cmluZ1xuICAgICNcbiAgICBAZ2V0U3RyaW5nRnJvbUZpbGU6IChwYXRoLCBjYWxsYmFjayA9IG51bGwpIC0+XG4gICAgICAgIHhociA9IG51bGxcbiAgICAgICAgaWYgd2luZG93P1xuICAgICAgICAgICAgaWYgd2luZG93LlhNTEh0dHBSZXF1ZXN0XG4gICAgICAgICAgICAgICAgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgICAgICAgICAgIGVsc2UgaWYgd2luZG93LkFjdGl2ZVhPYmplY3RcbiAgICAgICAgICAgICAgICBmb3IgbmFtZSBpbiBbXCJNc3htbDIuWE1MSFRUUC42LjBcIiwgXCJNc3htbDIuWE1MSFRUUC4zLjBcIiwgXCJNc3htbDIuWE1MSFRUUFwiLCBcIk1pY3Jvc29mdC5YTUxIVFRQXCJdXG4gICAgICAgICAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgICAgICAgICAgeGhyID0gbmV3IEFjdGl2ZVhPYmplY3QobmFtZSlcblxuICAgICAgICBpZiB4aHI/XG4gICAgICAgICAgICAjIEJyb3dzZXJcbiAgICAgICAgICAgIGlmIGNhbGxiYWNrP1xuICAgICAgICAgICAgICAgICMgQXN5bmNcbiAgICAgICAgICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cbiAgICAgICAgICAgICAgICAgICAgaWYgeGhyLnJlYWR5U3RhdGUgaXMgNFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgeGhyLnN0YXR1cyBpcyAyMDAgb3IgeGhyLnN0YXR1cyBpcyAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soeGhyLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKVxuICAgICAgICAgICAgICAgIHhoci5vcGVuICdHRVQnLCBwYXRoLCB0cnVlXG4gICAgICAgICAgICAgICAgeGhyLnNlbmQgbnVsbFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgIyBTeW5jXG4gICAgICAgICAgICAgICAgeGhyLm9wZW4gJ0dFVCcsIHBhdGgsIGZhbHNlXG4gICAgICAgICAgICAgICAgeGhyLnNlbmQgbnVsbFxuXG4gICAgICAgICAgICAgICAgaWYgeGhyLnN0YXR1cyBpcyAyMDAgb3IgeGhyLnN0YXR1cyA9PSAwXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB4aHIucmVzcG9uc2VUZXh0XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICAjIE5vZGUuanMtbGlrZVxuICAgICAgICAgICAgcmVxID0gcmVxdWlyZVxuICAgICAgICAgICAgZnMgPSByZXEoJ2ZzJykgIyBQcmV2ZW50IGJyb3dzZXJpZnkgZnJvbSB0cnlpbmcgdG8gbG9hZCAnZnMnIG1vZHVsZVxuICAgICAgICAgICAgaWYgY2FsbGJhY2s/XG4gICAgICAgICAgICAgICAgIyBBc3luY1xuICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlIHBhdGgsIChlcnIsIGRhdGEpIC0+XG4gICAgICAgICAgICAgICAgICAgIGlmIGVyclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sgbnVsbFxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayBTdHJpbmcoZGF0YSlcblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICMgU3luY1xuICAgICAgICAgICAgICAgIGRhdGEgPSBmcy5yZWFkRmlsZVN5bmMgcGF0aFxuICAgICAgICAgICAgICAgIGlmIGRhdGE/XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTdHJpbmcoZGF0YSlcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBVdGlsc1xuIiwiXG5QYXJzZXIgPSByZXF1aXJlICcuL1BhcnNlcidcbkR1bXBlciA9IHJlcXVpcmUgJy4vRHVtcGVyJ1xuVXRpbHMgID0gcmVxdWlyZSAnLi9VdGlscydcblxuIyBZYW1sIG9mZmVycyBjb252ZW5pZW5jZSBtZXRob2RzIHRvIGxvYWQgYW5kIGR1bXAgWUFNTC5cbiNcbmNsYXNzIFlhbWxcblxuICAgICMgUGFyc2VzIFlBTUwgaW50byBhIEphdmFTY3JpcHQgb2JqZWN0LlxuICAgICNcbiAgICAjIFRoZSBwYXJzZSBtZXRob2QsIHdoZW4gc3VwcGxpZWQgd2l0aCBhIFlBTUwgc3RyaW5nLFxuICAgICMgd2lsbCBkbyBpdHMgYmVzdCB0byBjb252ZXJ0IFlBTUwgaW4gYSBmaWxlIGludG8gYSBKYXZhU2NyaXB0IG9iamVjdC5cbiAgICAjXG4gICAgIyAgVXNhZ2U6XG4gICAgIyAgICAgbXlPYmplY3QgPSBZYW1sLnBhcnNlKCdzb21lOiB5YW1sJyk7XG4gICAgIyAgICAgY29uc29sZS5sb2cobXlPYmplY3QpO1xuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIGlucHV0ICAgICAgICAgICAgICAgICAgIEEgc3RyaW5nIGNvbnRhaW5pbmcgWUFNTFxuICAgICMgQHBhcmFtIFtCb29sZWFuXSAgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSAgdHJ1ZSBpZiBhbiBleGNlcHRpb24gbXVzdCBiZSB0aHJvd24gb24gaW52YWxpZCB0eXBlcywgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgIyBAcGFyYW0gW0Z1bmN0aW9uXSBvYmplY3REZWNvZGVyICAgICAgICAgICBBIGZ1bmN0aW9uIHRvIGRlc2VyaWFsaXplIGN1c3RvbSBvYmplY3RzLCBudWxsIG90aGVyd2lzZVxuICAgICNcbiAgICAjIEByZXR1cm4gW09iamVjdF0gIFRoZSBZQU1MIGNvbnZlcnRlZCB0byBhIEphdmFTY3JpcHQgb2JqZWN0XG4gICAgI1xuICAgICMgQHRocm93IFtQYXJzZUV4Y2VwdGlvbl0gSWYgdGhlIFlBTUwgaXMgbm90IHZhbGlkXG4gICAgI1xuICAgIEBwYXJzZTogKGlucHV0LCBleGNlcHRpb25PbkludmFsaWRUeXBlID0gZmFsc2UsIG9iamVjdERlY29kZXIgPSBudWxsKSAtPlxuICAgICAgICByZXR1cm4gbmV3IFBhcnNlcigpLnBhcnNlKGlucHV0LCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyKVxuXG5cbiAgICAjIFBhcnNlcyBZQU1MIGZyb20gZmlsZSBwYXRoIGludG8gYSBKYXZhU2NyaXB0IG9iamVjdC5cbiAgICAjXG4gICAgIyBUaGUgcGFyc2VGaWxlIG1ldGhvZCwgd2hlbiBzdXBwbGllZCB3aXRoIGEgWUFNTCBmaWxlLFxuICAgICMgd2lsbCBkbyBpdHMgYmVzdCB0byBjb252ZXJ0IFlBTUwgaW4gYSBmaWxlIGludG8gYSBKYXZhU2NyaXB0IG9iamVjdC5cbiAgICAjXG4gICAgIyAgVXNhZ2U6XG4gICAgIyAgICAgbXlPYmplY3QgPSBZYW1sLnBhcnNlRmlsZSgnY29uZmlnLnltbCcpO1xuICAgICMgICAgIGNvbnNvbGUubG9nKG15T2JqZWN0KTtcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICBwYXRoICAgICAgICAgICAgICAgICAgICBBIGZpbGUgcGF0aCBwb2ludGluZyB0byBhIHZhbGlkIFlBTUwgZmlsZVxuICAgICMgQHBhcmFtIFtCb29sZWFuXSAgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSAgdHJ1ZSBpZiBhbiBleGNlcHRpb24gbXVzdCBiZSB0aHJvd24gb24gaW52YWxpZCB0eXBlcywgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgIyBAcGFyYW0gW0Z1bmN0aW9uXSBvYmplY3REZWNvZGVyICAgICAgICAgICBBIGZ1bmN0aW9uIHRvIGRlc2VyaWFsaXplIGN1c3RvbSBvYmplY3RzLCBudWxsIG90aGVyd2lzZVxuICAgICNcbiAgICAjIEByZXR1cm4gW09iamVjdF0gIFRoZSBZQU1MIGNvbnZlcnRlZCB0byBhIEphdmFTY3JpcHQgb2JqZWN0IG9yIG51bGwgaWYgdGhlIGZpbGUgZG9lc24ndCBleGlzdC5cbiAgICAjXG4gICAgIyBAdGhyb3cgW1BhcnNlRXhjZXB0aW9uXSBJZiB0aGUgWUFNTCBpcyBub3QgdmFsaWRcbiAgICAjXG4gICAgQHBhcnNlRmlsZTogKHBhdGgsIGNhbGxiYWNrID0gbnVsbCwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSA9IGZhbHNlLCBvYmplY3REZWNvZGVyID0gbnVsbCkgLT5cbiAgICAgICAgaWYgY2FsbGJhY2s/XG4gICAgICAgICAgICAjIEFzeW5jXG4gICAgICAgICAgICBVdGlscy5nZXRTdHJpbmdGcm9tRmlsZSBwYXRoLCAoaW5wdXQpID0+XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbnVsbFxuICAgICAgICAgICAgICAgIGlmIGlucHV0P1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBAcGFyc2UgaW5wdXQsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXJcbiAgICAgICAgICAgICAgICBjYWxsYmFjayByZXN1bHRcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgIyBTeW5jXG4gICAgICAgICAgICBpbnB1dCA9IFV0aWxzLmdldFN0cmluZ0Zyb21GaWxlIHBhdGhcbiAgICAgICAgICAgIGlmIGlucHV0P1xuICAgICAgICAgICAgICAgIHJldHVybiBAcGFyc2UgaW5wdXQsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXJcbiAgICAgICAgICAgIHJldHVybiBudWxsXG5cblxuICAgICMgRHVtcHMgYSBKYXZhU2NyaXB0IG9iamVjdCB0byBhIFlBTUwgc3RyaW5nLlxuICAgICNcbiAgICAjIFRoZSBkdW1wIG1ldGhvZCwgd2hlbiBzdXBwbGllZCB3aXRoIGFuIG9iamVjdCwgd2lsbCBkbyBpdHMgYmVzdFxuICAgICMgdG8gY29udmVydCB0aGUgb2JqZWN0IGludG8gZnJpZW5kbHkgWUFNTC5cbiAgICAjXG4gICAgIyBAcGFyYW0gW09iamVjdF0gICBpbnB1dCAgICAgICAgICAgICAgICAgICBKYXZhU2NyaXB0IG9iamVjdFxuICAgICMgQHBhcmFtIFtJbnRlZ2VyXSAgaW5saW5lICAgICAgICAgICAgICAgICAgVGhlIGxldmVsIHdoZXJlIHlvdSBzd2l0Y2ggdG8gaW5saW5lIFlBTUxcbiAgICAjIEBwYXJhbSBbSW50ZWdlcl0gIGluZGVudCAgICAgICAgICAgICAgICAgIFRoZSBhbW91bnQgb2Ygc3BhY2VzIHRvIHVzZSBmb3IgaW5kZW50YXRpb24gb2YgbmVzdGVkIG5vZGVzLlxuICAgICMgQHBhcmFtIFtCb29sZWFuXSAgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSAgdHJ1ZSBpZiBhbiBleGNlcHRpb24gbXVzdCBiZSB0aHJvd24gb24gaW52YWxpZCB0eXBlcyAoYSBKYXZhU2NyaXB0IHJlc291cmNlIG9yIG9iamVjdCksIGZhbHNlIG90aGVyd2lzZVxuICAgICMgQHBhcmFtIFtGdW5jdGlvbl0gb2JqZWN0RW5jb2RlciAgICAgICAgICAgQSBmdW5jdGlvbiB0byBzZXJpYWxpemUgY3VzdG9tIG9iamVjdHMsIG51bGwgb3RoZXJ3aXNlXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgQSBZQU1MIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIG9yaWdpbmFsIEphdmFTY3JpcHQgb2JqZWN0XG4gICAgI1xuICAgIEBkdW1wOiAoaW5wdXQsIGlubGluZSA9IDIsIGluZGVudCA9IDQsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgPSBmYWxzZSwgb2JqZWN0RW5jb2RlciA9IG51bGwpIC0+XG4gICAgICAgIHlhbWwgPSBuZXcgRHVtcGVyKClcbiAgICAgICAgeWFtbC5pbmRlbnRhdGlvbiA9IGluZGVudFxuXG4gICAgICAgIHJldHVybiB5YW1sLmR1bXAoaW5wdXQsIGlubGluZSwgMCwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RW5jb2RlcilcblxuXG4gICAgIyBSZWdpc3RlcnMgLnltbCBleHRlbnNpb24gdG8gd29yayB3aXRoIG5vZGUncyByZXF1aXJlKCkgZnVuY3Rpb24uXG4gICAgI1xuICAgIEByZWdpc3RlcjogLT5cbiAgICAgICAgcmVxdWlyZV9oYW5kbGVyID0gKG1vZHVsZSwgZmlsZW5hbWUpIC0+XG4gICAgICAgICAgICAjIEZpbGwgaW4gcmVzdWx0XG4gICAgICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IFlBTUwucGFyc2VGaWxlIGZpbGVuYW1lXG5cbiAgICAgICAgIyBSZWdpc3RlciByZXF1aXJlIGV4dGVuc2lvbnMgb25seSBpZiB3ZSdyZSBvbiBub2RlLmpzXG4gICAgICAgICMgaGFjayBmb3IgYnJvd3NlcmlmeVxuICAgICAgICBpZiByZXF1aXJlPy5leHRlbnNpb25zP1xuICAgICAgICAgICAgcmVxdWlyZS5leHRlbnNpb25zWycueW1sJ10gPSByZXF1aXJlX2hhbmRsZXJcbiAgICAgICAgICAgIHJlcXVpcmUuZXh0ZW5zaW9uc1snLnlhbWwnXSA9IHJlcXVpcmVfaGFuZGxlclxuXG5cbiAgICAjIEFsaWFzIG9mIGR1bXAoKSBtZXRob2QgZm9yIGNvbXBhdGliaWxpdHkgcmVhc29ucy5cbiAgICAjXG4gICAgQHN0cmluZ2lmeTogKGlucHV0LCBpbmxpbmUsIGluZGVudCwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RW5jb2RlcikgLT5cbiAgICAgICAgcmV0dXJuIEBkdW1wIGlucHV0LCBpbmxpbmUsIGluZGVudCwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RW5jb2RlclxuXG5cbiAgICAjIEFsaWFzIG9mIHBhcnNlRmlsZSgpIG1ldGhvZCBmb3IgY29tcGF0aWJpbGl0eSByZWFzb25zLlxuICAgICNcbiAgICBAbG9hZDogKHBhdGgsIGNhbGxiYWNrLCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyKSAtPlxuICAgICAgICByZXR1cm4gQHBhcnNlRmlsZSBwYXRoLCBjYWxsYmFjaywgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlclxuXG5cbiMgRXhwb3NlIFlBTUwgbmFtZXNwYWNlIHRvIGJyb3dzZXJcbndpbmRvdz8uWUFNTCA9IFlhbWxcblxuIyBOb3QgaW4gdGhlIGJyb3dzZXI/XG51bmxlc3Mgd2luZG93P1xuICAgIEBZQU1MID0gWWFtbFxuXG5tb2R1bGUuZXhwb3J0cyA9IFlhbWxcbiJdfQ==
