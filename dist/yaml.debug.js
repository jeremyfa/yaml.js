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
    var count, ref, ref1, ref2, trimmedValue;
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

module.exports = Yaml;



},{"./Dumper":1,"./Parser":6,"./Utils":9}]},{},[10])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9qZXJlbXlmYS9Eb2N1bWVudHMvUHJvamV0cy95YW1sLmpzL3NyYy9EdW1wZXIuY29mZmVlIiwiL1VzZXJzL2plcmVteWZhL0RvY3VtZW50cy9Qcm9qZXRzL3lhbWwuanMvc3JjL0VzY2FwZXIuY29mZmVlIiwiL1VzZXJzL2plcmVteWZhL0RvY3VtZW50cy9Qcm9qZXRzL3lhbWwuanMvc3JjL0V4Y2VwdGlvbi9EdW1wRXhjZXB0aW9uLmNvZmZlZSIsIi9Vc2Vycy9qZXJlbXlmYS9Eb2N1bWVudHMvUHJvamV0cy95YW1sLmpzL3NyYy9FeGNlcHRpb24vUGFyc2VFeGNlcHRpb24uY29mZmVlIiwiL1VzZXJzL2plcmVteWZhL0RvY3VtZW50cy9Qcm9qZXRzL3lhbWwuanMvc3JjL0lubGluZS5jb2ZmZWUiLCIvVXNlcnMvamVyZW15ZmEvRG9jdW1lbnRzL1Byb2pldHMveWFtbC5qcy9zcmMvUGFyc2VyLmNvZmZlZSIsIi9Vc2Vycy9qZXJlbXlmYS9Eb2N1bWVudHMvUHJvamV0cy95YW1sLmpzL3NyYy9QYXR0ZXJuLmNvZmZlZSIsIi9Vc2Vycy9qZXJlbXlmYS9Eb2N1bWVudHMvUHJvamV0cy95YW1sLmpzL3NyYy9VbmVzY2FwZXIuY29mZmVlIiwiL1VzZXJzL2plcmVteWZhL0RvY3VtZW50cy9Qcm9qZXRzL3lhbWwuanMvc3JjL1V0aWxzLmNvZmZlZSIsIi9Vc2Vycy9qZXJlbXlmYS9Eb2N1bWVudHMvUHJvamV0cy95YW1sLmpzL3NyYy9ZYW1sLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0NBLElBQUEscUJBQUE7O0FBQUEsS0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSLENBQVYsQ0FBQTs7QUFBQSxNQUNBLEdBQVUsT0FBQSxDQUFRLFVBQVIsQ0FEVixDQUFB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QUFnRCxhQUFoRCxHQUFBO0FBQ1IsV0FBTyxJQUFDLENBQUEsSUFBRCxDQUFNLEtBQU4sRUFBYSxNQUFiLEVBQXFCLE1BQXJCLEVBQTZCLHNCQUE3QixFQUFxRCxhQUFyRCxDQUFQLENBRFE7RUFBQSxDQTFFWixDQUFBOztBQUFBLEVBZ0ZBLElBQUMsQ0FBQSxJQUFELEdBQU8sU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixzQkFBakIsRUFBeUMsYUFBekMsR0FBQTtBQUNILFdBQU8sSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFYLEVBQWlCLFFBQWpCLEVBQTJCLHNCQUEzQixFQUFtRCxhQUFuRCxDQUFQLENBREc7RUFBQSxDQWhGUCxDQUFBOztjQUFBOztJQXpCSixDQUFBOzs7RUE4R0EsTUFBTSxDQUFFLElBQVIsR0FBZTtDQTlHZjs7QUFBQSxNQWdITSxDQUFDLE9BQVAsR0FBaUIsSUFoSGpCLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG5VdGlscyAgID0gcmVxdWlyZSAnLi9VdGlscydcbklubGluZSAgPSByZXF1aXJlICcuL0lubGluZSdcblxuIyBEdW1wZXIgZHVtcHMgSmF2YVNjcmlwdCB2YXJpYWJsZXMgdG8gWUFNTCBzdHJpbmdzLlxuI1xuY2xhc3MgRHVtcGVyXG5cbiAgICAjIFRoZSBhbW91bnQgb2Ygc3BhY2VzIHRvIHVzZSBmb3IgaW5kZW50YXRpb24gb2YgbmVzdGVkIG5vZGVzLlxuICAgIEBpbmRlbnRhdGlvbjogICA0XG5cblxuICAgICMgRHVtcHMgYSBKYXZhU2NyaXB0IHZhbHVlIHRvIFlBTUwuXG4gICAgI1xuICAgICMgQHBhcmFtIFtPYmplY3RdICAgaW5wdXQgICAgICAgICAgICAgICAgICAgVGhlIEphdmFTY3JpcHQgdmFsdWVcbiAgICAjIEBwYXJhbSBbSW50ZWdlcl0gIGlubGluZSAgICAgICAgICAgICAgICAgIFRoZSBsZXZlbCB3aGVyZSB5b3Ugc3dpdGNoIHRvIGlubGluZSBZQU1MXG4gICAgIyBAcGFyYW0gW0ludGVnZXJdICBpbmRlbnQgICAgICAgICAgICAgICAgICBUaGUgbGV2ZWwgb2YgaW5kZW50YXRpb24gKHVzZWQgaW50ZXJuYWxseSlcbiAgICAjIEBwYXJhbSBbQm9vbGVhbl0gIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgIHRydWUgaWYgYW4gZXhjZXB0aW9uIG11c3QgYmUgdGhyb3duIG9uIGludmFsaWQgdHlwZXMgKGEgSmF2YVNjcmlwdCByZXNvdXJjZSBvciBvYmplY3QpLCBmYWxzZSBvdGhlcndpc2VcbiAgICAjIEBwYXJhbSBbRnVuY3Rpb25dIG9iamVjdEVuY29kZXIgICAgICAgICAgIEEgZnVuY3Rpb24gdG8gc2VyaWFsaXplIGN1c3RvbSBvYmplY3RzLCBudWxsIG90aGVyd2lzZVxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIFRoZSBZQU1MIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBKYXZhU2NyaXB0IHZhbHVlXG4gICAgI1xuICAgIGR1bXA6IChpbnB1dCwgaW5saW5lID0gMCwgaW5kZW50ID0gMCwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSA9IGZhbHNlLCBvYmplY3RFbmNvZGVyID0gbnVsbCkgLT5cbiAgICAgICAgb3V0cHV0ID0gJydcbiAgICAgICAgcHJlZml4ID0gKGlmIGluZGVudCB0aGVuIFV0aWxzLnN0clJlcGVhdCgnICcsIGluZGVudCkgZWxzZSAnJylcblxuICAgICAgICBpZiBpbmxpbmUgPD0gMCBvciB0eXBlb2YoaW5wdXQpIGlzbnQgJ29iamVjdCcgb3IgaW5wdXQgaW5zdGFuY2VvZiBEYXRlIG9yIFV0aWxzLmlzRW1wdHkoaW5wdXQpXG4gICAgICAgICAgICBvdXRwdXQgKz0gcHJlZml4ICsgSW5saW5lLmR1bXAoaW5wdXQsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdEVuY29kZXIpXG4gICAgICAgIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBpbnB1dCBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICAgICAgZm9yIHZhbHVlIGluIGlucHV0XG4gICAgICAgICAgICAgICAgICAgIHdpbGxCZUlubGluZWQgPSAoaW5saW5lIC0gMSA8PSAwIG9yIHR5cGVvZih2YWx1ZSkgaXNudCAnb2JqZWN0JyBvciBVdGlscy5pc0VtcHR5KHZhbHVlKSlcblxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQgKz1cbiAgICAgICAgICAgICAgICAgICAgICAgIHByZWZpeCArXG4gICAgICAgICAgICAgICAgICAgICAgICAnLScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgKGlmIHdpbGxCZUlubGluZWQgdGhlbiAnICcgZWxzZSBcIlxcblwiKSArXG4gICAgICAgICAgICAgICAgICAgICAgICBAZHVtcCh2YWx1ZSwgaW5saW5lIC0gMSwgKGlmIHdpbGxCZUlubGluZWQgdGhlbiAwIGVsc2UgaW5kZW50ICsgQGluZGVudGF0aW9uKSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RW5jb2RlcikgK1xuICAgICAgICAgICAgICAgICAgICAgICAgKGlmIHdpbGxCZUlubGluZWQgdGhlbiBcIlxcblwiIGVsc2UgJycpXG5cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmb3Iga2V5LCB2YWx1ZSBvZiBpbnB1dFxuICAgICAgICAgICAgICAgICAgICB3aWxsQmVJbmxpbmVkID0gKGlubGluZSAtIDEgPD0gMCBvciB0eXBlb2YodmFsdWUpIGlzbnQgJ29iamVjdCcgb3IgVXRpbHMuaXNFbXB0eSh2YWx1ZSkpXG5cbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0ICs9XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVmaXggK1xuICAgICAgICAgICAgICAgICAgICAgICAgSW5saW5lLmR1bXAoa2V5LCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3RFbmNvZGVyKSArICc6JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAoaWYgd2lsbEJlSW5saW5lZCB0aGVuICcgJyBlbHNlIFwiXFxuXCIpICtcbiAgICAgICAgICAgICAgICAgICAgICAgIEBkdW1wKHZhbHVlLCBpbmxpbmUgLSAxLCAoaWYgd2lsbEJlSW5saW5lZCB0aGVuIDAgZWxzZSBpbmRlbnQgKyBAaW5kZW50YXRpb24pLCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3RFbmNvZGVyKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAoaWYgd2lsbEJlSW5saW5lZCB0aGVuIFwiXFxuXCIgZWxzZSAnJylcblxuICAgICAgICByZXR1cm4gb3V0cHV0XG5cblxubW9kdWxlLmV4cG9ydHMgPSBEdW1wZXJcbiIsIlxuUGF0dGVybiA9IHJlcXVpcmUgJy4vUGF0dGVybidcblxuIyBFc2NhcGVyIGVuY2Fwc3VsYXRlcyBlc2NhcGluZyBydWxlcyBmb3Igc2luZ2xlXG4jIGFuZCBkb3VibGUtcXVvdGVkIFlBTUwgc3RyaW5ncy5cbmNsYXNzIEVzY2FwZXJcblxuICAgICMgTWFwcGluZyBhcnJheXMgZm9yIGVzY2FwaW5nIGEgZG91YmxlIHF1b3RlZCBzdHJpbmcuIFRoZSBiYWNrc2xhc2ggaXNcbiAgICAjIGZpcnN0IHRvIGVuc3VyZSBwcm9wZXIgZXNjYXBpbmcuXG4gICAgQExJU1RfRVNDQVBFRVM6ICAgICAgICAgICAgICAgICBbJ1xcXFxcXFxcJywgJ1xcXFxcIicsICdcIicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcXHgwMFwiLCAgXCJcXHgwMVwiLCAgXCJcXHgwMlwiLCAgXCJcXHgwM1wiLCAgXCJcXHgwNFwiLCAgXCJcXHgwNVwiLCAgXCJcXHgwNlwiLCAgXCJcXHgwN1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXFx4MDhcIiwgIFwiXFx4MDlcIiwgIFwiXFx4MGFcIiwgIFwiXFx4MGJcIiwgIFwiXFx4MGNcIiwgIFwiXFx4MGRcIiwgIFwiXFx4MGVcIiwgIFwiXFx4MGZcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlxceDEwXCIsICBcIlxceDExXCIsICBcIlxceDEyXCIsICBcIlxceDEzXCIsICBcIlxceDE0XCIsICBcIlxceDE1XCIsICBcIlxceDE2XCIsICBcIlxceDE3XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcXHgxOFwiLCAgXCJcXHgxOVwiLCAgXCJcXHgxYVwiLCAgXCJcXHgxYlwiLCAgXCJcXHgxY1wiLCAgXCJcXHgxZFwiLCAgXCJcXHgxZVwiLCAgXCJcXHgxZlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjaCA9IFN0cmluZy5mcm9tQ2hhckNvZGUpKDB4MDA4NSksIGNoKDB4MDBBMCksIGNoKDB4MjAyOCksIGNoKDB4MjAyOSldXG4gICAgQExJU1RfRVNDQVBFRDogICAgICAgICAgICAgICAgICBbJ1xcXFxcIicsICdcXFxcXFxcXCcsICdcXFxcXCInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXFxcXDBcIiwgICBcIlxcXFx4MDFcIiwgXCJcXFxceDAyXCIsIFwiXFxcXHgwM1wiLCBcIlxcXFx4MDRcIiwgXCJcXFxceDA1XCIsIFwiXFxcXHgwNlwiLCBcIlxcXFxhXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcXFxcYlwiLCAgIFwiXFxcXHRcIiwgICBcIlxcXFxuXCIsICAgXCJcXFxcdlwiLCAgIFwiXFxcXGZcIiwgICBcIlxcXFxyXCIsICAgXCJcXFxceDBlXCIsIFwiXFxcXHgwZlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXFxcXHgxMFwiLCBcIlxcXFx4MTFcIiwgXCJcXFxceDEyXCIsIFwiXFxcXHgxM1wiLCBcIlxcXFx4MTRcIiwgXCJcXFxceDE1XCIsIFwiXFxcXHgxNlwiLCBcIlxcXFx4MTdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlxcXFx4MThcIiwgXCJcXFxceDE5XCIsIFwiXFxcXHgxYVwiLCBcIlxcXFxlXCIsICAgXCJcXFxceDFjXCIsIFwiXFxcXHgxZFwiLCBcIlxcXFx4MWVcIiwgXCJcXFxceDFmXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcXFxcTlwiLCBcIlxcXFxfXCIsIFwiXFxcXExcIiwgXCJcXFxcUFwiXVxuXG4gICAgQE1BUFBJTkdfRVNDQVBFRVNfVE9fRVNDQVBFRDogICBkbyA9PlxuICAgICAgICBtYXBwaW5nID0ge31cbiAgICAgICAgZm9yIGkgaW4gWzAuLi5ATElTVF9FU0NBUEVFUy5sZW5ndGhdXG4gICAgICAgICAgICBtYXBwaW5nW0BMSVNUX0VTQ0FQRUVTW2ldXSA9IEBMSVNUX0VTQ0FQRURbaV1cbiAgICAgICAgcmV0dXJuIG1hcHBpbmcgXG5cbiAgICAjIENoYXJhY3RlcnMgdGhhdCB3b3VsZCBjYXVzZSBhIGR1bXBlZCBzdHJpbmcgdG8gcmVxdWlyZSBkb3VibGUgcXVvdGluZy5cbiAgICBAUEFUVEVSTl9DSEFSQUNURVJTX1RPX0VTQ0FQRTogIG5ldyBQYXR0ZXJuICdbXFxcXHgwMC1cXFxceDFmXXxcXHhjMlxceDg1fFxceGMyXFx4YTB8XFx4ZTJcXHg4MFxceGE4fFxceGUyXFx4ODBcXHhhOSdcblxuICAgICMgT3RoZXIgcHJlY29tcGlsZWQgcGF0dGVybnNcbiAgICBAUEFUVEVSTl9NQVBQSU5HX0VTQ0FQRUVTOiAgICAgIG5ldyBQYXR0ZXJuIEBMSVNUX0VTQ0FQRUVTLmpvaW4oJ3wnKVxuICAgIEBQQVRURVJOX1NJTkdMRV9RVU9USU5HOiAgICAgICAgbmV3IFBhdHRlcm4gJ1tcXFxcc1xcJ1wiOnt9W1xcXFxdLCYqIz9dfF5bLT98PD49ISVAYF0nXG5cblxuXG4gICAgIyBEZXRlcm1pbmVzIGlmIGEgSmF2YVNjcmlwdCB2YWx1ZSB3b3VsZCByZXF1aXJlIGRvdWJsZSBxdW90aW5nIGluIFlBTUwuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgdmFsdWUgICBBIEphdmFTY3JpcHQgdmFsdWUgdmFsdWVcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtCb29sZWFuXSB0cnVlICAgIGlmIHRoZSB2YWx1ZSB3b3VsZCByZXF1aXJlIGRvdWJsZSBxdW90ZXMuXG4gICAgI1xuICAgIEByZXF1aXJlc0RvdWJsZVF1b3Rpbmc6ICh2YWx1ZSkgLT5cbiAgICAgICAgcmV0dXJuIEBQQVRURVJOX0NIQVJBQ1RFUlNfVE9fRVNDQVBFLnRlc3QgdmFsdWVcblxuXG4gICAgIyBFc2NhcGVzIGFuZCBzdXJyb3VuZHMgYSBKYXZhU2NyaXB0IHZhbHVlIHdpdGggZG91YmxlIHF1b3Rlcy5cbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICB2YWx1ZSAgIEEgSmF2YVNjcmlwdCB2YWx1ZVxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIFRoZSBxdW90ZWQsIGVzY2FwZWQgc3RyaW5nXG4gICAgI1xuICAgIEBlc2NhcGVXaXRoRG91YmxlUXVvdGVzOiAodmFsdWUpIC0+XG4gICAgICAgIHJlc3VsdCA9IEBQQVRURVJOX01BUFBJTkdfRVNDQVBFRVMucmVwbGFjZSB2YWx1ZSwgKHN0cikgPT5cbiAgICAgICAgICAgIHJldHVybiBATUFQUElOR19FU0NBUEVFU19UT19FU0NBUEVEW3N0cl1cbiAgICAgICAgcmV0dXJuICdcIicrcmVzdWx0KydcIidcblxuXG4gICAgIyBEZXRlcm1pbmVzIGlmIGEgSmF2YVNjcmlwdCB2YWx1ZSB3b3VsZCByZXF1aXJlIHNpbmdsZSBxdW90aW5nIGluIFlBTUwuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgdmFsdWUgICBBIEphdmFTY3JpcHQgdmFsdWVcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtCb29sZWFuXSB0cnVlIGlmIHRoZSB2YWx1ZSB3b3VsZCByZXF1aXJlIHNpbmdsZSBxdW90ZXMuXG4gICAgI1xuICAgIEByZXF1aXJlc1NpbmdsZVF1b3Rpbmc6ICh2YWx1ZSkgLT5cbiAgICAgICAgcmV0dXJuIEBQQVRURVJOX1NJTkdMRV9RVU9USU5HLnRlc3QgdmFsdWVcblxuXG4gICAgIyBFc2NhcGVzIGFuZCBzdXJyb3VuZHMgYSBKYXZhU2NyaXB0IHZhbHVlIHdpdGggc2luZ2xlIHF1b3Rlcy5cbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICB2YWx1ZSAgIEEgSmF2YVNjcmlwdCB2YWx1ZVxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIFRoZSBxdW90ZWQsIGVzY2FwZWQgc3RyaW5nXG4gICAgI1xuICAgIEBlc2NhcGVXaXRoU2luZ2xlUXVvdGVzOiAodmFsdWUpIC0+XG4gICAgICAgIHJldHVybiBcIidcIit2YWx1ZS5yZXBsYWNlKC8nL2csIFwiJydcIikrXCInXCJcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEVzY2FwZXJcblxuIiwiXG5jbGFzcyBEdW1wRXhjZXB0aW9uIGV4dGVuZHMgRXJyb3JcblxuICAgIGNvbnN0cnVjdG9yOiAoQG1lc3NhZ2UsIEBwYXJzZWRMaW5lLCBAc25pcHBldCkgLT5cblxuICAgIHRvU3RyaW5nOiAtPlxuICAgICAgICBpZiBAcGFyc2VkTGluZT8gYW5kIEBzbmlwcGV0P1xuICAgICAgICAgICAgcmV0dXJuICc8RHVtcEV4Y2VwdGlvbj4gJyArIEBtZXNzYWdlICsgJyAobGluZSAnICsgQHBhcnNlZExpbmUgKyAnOiBcXCcnICsgQHNuaXBwZXQgKyAnXFwnKSdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuICc8RHVtcEV4Y2VwdGlvbj4gJyArIEBtZXNzYWdlXG5cbm1vZHVsZS5leHBvcnRzID0gRHVtcEV4Y2VwdGlvblxuIiwiXG5jbGFzcyBQYXJzZUV4Y2VwdGlvbiBleHRlbmRzIEVycm9yXG5cbiAgICBjb25zdHJ1Y3RvcjogKEBtZXNzYWdlLCBAcGFyc2VkTGluZSwgQHNuaXBwZXQpIC0+XG5cbiAgICB0b1N0cmluZzogLT5cbiAgICAgICAgaWYgQHBhcnNlZExpbmU/IGFuZCBAc25pcHBldD9cbiAgICAgICAgICAgIHJldHVybiAnPFBhcnNlRXhjZXB0aW9uPiAnICsgQG1lc3NhZ2UgKyAnIChsaW5lICcgKyBAcGFyc2VkTGluZSArICc6IFxcJycgKyBAc25pcHBldCArICdcXCcpJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gJzxQYXJzZUV4Y2VwdGlvbj4gJyArIEBtZXNzYWdlXG5cbm1vZHVsZS5leHBvcnRzID0gUGFyc2VFeGNlcHRpb25cbiIsIlxuUGF0dGVybiAgICAgICAgID0gcmVxdWlyZSAnLi9QYXR0ZXJuJ1xuVW5lc2NhcGVyICAgICAgID0gcmVxdWlyZSAnLi9VbmVzY2FwZXInXG5Fc2NhcGVyICAgICAgICAgPSByZXF1aXJlICcuL0VzY2FwZXInXG5VdGlscyAgICAgICAgICAgPSByZXF1aXJlICcuL1V0aWxzJ1xuUGFyc2VFeGNlcHRpb24gID0gcmVxdWlyZSAnLi9FeGNlcHRpb24vUGFyc2VFeGNlcHRpb24nXG5EdW1wRXhjZXB0aW9uICAgPSByZXF1aXJlICcuL0V4Y2VwdGlvbi9EdW1wRXhjZXB0aW9uJ1xuXG4jIElubGluZSBZQU1MIHBhcnNpbmcgYW5kIGR1bXBpbmdcbmNsYXNzIElubGluZVxuXG4gICAgIyBRdW90ZWQgc3RyaW5nIHJlZ3VsYXIgZXhwcmVzc2lvblxuICAgIEBSRUdFWF9RVU9URURfU1RSSU5HOiAgICAgICAgICAgICAgICcoPzpcIig/OlteXCJcXFxcXFxcXF0qKD86XFxcXFxcXFwuW15cIlxcXFxcXFxcXSopKilcInxcXCcoPzpbXlxcJ10qKD86XFwnXFwnW15cXCddKikqKVxcJyknXG5cbiAgICAjIFByZS1jb21waWxlZCBwYXR0ZXJuc1xuICAgICNcbiAgICBAUEFUVEVSTl9UUkFJTElOR19DT01NRU5UUzogICAgICAgICBuZXcgUGF0dGVybiAnXlxcXFxzKiMuKiQnXG4gICAgQFBBVFRFUk5fUVVPVEVEX1NDQUxBUjogICAgICAgICAgICAgbmV3IFBhdHRlcm4gJ14nK0BSRUdFWF9RVU9URURfU1RSSU5HXG4gICAgQFBBVFRFUk5fVEhPVVNBTkRfTlVNRVJJQ19TQ0FMQVI6ICAgbmV3IFBhdHRlcm4gJ14oLXxcXFxcKyk/WzAtOSxdKyhcXFxcLlswLTldKyk/JCdcbiAgICBAUEFUVEVSTl9TQ0FMQVJfQllfREVMSU1JVEVSUzogICAgICB7fVxuXG4gICAgIyBTZXR0aW5nc1xuICAgIEBzZXR0aW5nczoge31cblxuXG4gICAgIyBDb25maWd1cmUgWUFNTCBpbmxpbmUuXG4gICAgI1xuICAgICMgQHBhcmFtIFtCb29sZWFuXSAgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSAgdHJ1ZSBpZiBhbiBleGNlcHRpb24gbXVzdCBiZSB0aHJvd24gb24gaW52YWxpZCB0eXBlcyAoYSBKYXZhU2NyaXB0IHJlc291cmNlIG9yIG9iamVjdCksIGZhbHNlIG90aGVyd2lzZVxuICAgICMgQHBhcmFtIFtGdW5jdGlvbl0gb2JqZWN0RGVjb2RlciAgICAgICAgICAgQSBmdW5jdGlvbiB0byBkZXNlcmlhbGl6ZSBjdXN0b20gb2JqZWN0cywgbnVsbCBvdGhlcndpc2VcbiAgICAjXG4gICAgQGNvbmZpZ3VyZTogKGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgPSBudWxsLCBvYmplY3REZWNvZGVyID0gbnVsbCkgLT5cbiAgICAgICAgIyBVcGRhdGUgc2V0dGluZ3NcbiAgICAgICAgQHNldHRpbmdzLmV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgPSBleGNlcHRpb25PbkludmFsaWRUeXBlXG4gICAgICAgIEBzZXR0aW5ncy5vYmplY3REZWNvZGVyID0gb2JqZWN0RGVjb2RlclxuICAgICAgICByZXR1cm5cblxuXG4gICAgIyBDb252ZXJ0cyBhIFlBTUwgc3RyaW5nIHRvIGEgSmF2YVNjcmlwdCBvYmplY3QuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgdmFsdWUgICAgICAgICAgICAgICAgICAgQSBZQU1MIHN0cmluZ1xuICAgICMgQHBhcmFtIFtCb29sZWFuXSAgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSAgdHJ1ZSBpZiBhbiBleGNlcHRpb24gbXVzdCBiZSB0aHJvd24gb24gaW52YWxpZCB0eXBlcyAoYSBKYXZhU2NyaXB0IHJlc291cmNlIG9yIG9iamVjdCksIGZhbHNlIG90aGVyd2lzZVxuICAgICMgQHBhcmFtIFtGdW5jdGlvbl0gb2JqZWN0RGVjb2RlciAgICAgICAgICAgQSBmdW5jdGlvbiB0byBkZXNlcmlhbGl6ZSBjdXN0b20gb2JqZWN0cywgbnVsbCBvdGhlcndpc2VcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtPYmplY3RdICBBIEphdmFTY3JpcHQgb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgWUFNTCBzdHJpbmdcbiAgICAjXG4gICAgIyBAdGhyb3cgW1BhcnNlRXhjZXB0aW9uXVxuICAgICNcbiAgICBAcGFyc2U6ICh2YWx1ZSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSA9IGZhbHNlLCBvYmplY3REZWNvZGVyID0gbnVsbCkgLT5cbiAgICAgICAgIyBVcGRhdGUgc2V0dGluZ3MgZnJvbSBsYXN0IGNhbGwgb2YgSW5saW5lLnBhcnNlKClcbiAgICAgICAgQHNldHRpbmdzLmV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgPSBleGNlcHRpb25PbkludmFsaWRUeXBlXG4gICAgICAgIEBzZXR0aW5ncy5vYmplY3REZWNvZGVyID0gb2JqZWN0RGVjb2RlclxuXG4gICAgICAgIGlmIG5vdCB2YWx1ZT9cbiAgICAgICAgICAgIHJldHVybiAnJ1xuXG4gICAgICAgIHZhbHVlID0gVXRpbHMudHJpbSB2YWx1ZVxuXG4gICAgICAgIGlmIDAgaXMgdmFsdWUubGVuZ3RoXG4gICAgICAgICAgICByZXR1cm4gJydcblxuICAgICAgICAjIEtlZXAgYSBjb250ZXh0IG9iamVjdCB0byBwYXNzIHRocm91Z2ggc3RhdGljIG1ldGhvZHNcbiAgICAgICAgY29udGV4dCA9IHtleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyLCBpOiAwfVxuXG4gICAgICAgIHN3aXRjaCB2YWx1ZS5jaGFyQXQoMClcbiAgICAgICAgICAgIHdoZW4gJ1snXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gQHBhcnNlU2VxdWVuY2UgdmFsdWUsIGNvbnRleHRcbiAgICAgICAgICAgICAgICArK2NvbnRleHQuaVxuICAgICAgICAgICAgd2hlbiAneydcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBAcGFyc2VNYXBwaW5nIHZhbHVlLCBjb250ZXh0XG4gICAgICAgICAgICAgICAgKytjb250ZXh0LmlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBAcGFyc2VTY2FsYXIgdmFsdWUsIG51bGwsIFsnXCInLCBcIidcIl0sIGNvbnRleHRcblxuICAgICAgICAjIFNvbWUgY29tbWVudHMgYXJlIGFsbG93ZWQgYXQgdGhlIGVuZFxuICAgICAgICBpZiBAUEFUVEVSTl9UUkFJTElOR19DT01NRU5UUy5yZXBsYWNlKHZhbHVlW2NvbnRleHQuaS4uXSwgJycpIGlzbnQgJydcbiAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnVW5leHBlY3RlZCBjaGFyYWN0ZXJzIG5lYXIgXCInK3ZhbHVlW2NvbnRleHQuaS4uXSsnXCIuJ1xuXG4gICAgICAgIHJldHVybiByZXN1bHRcblxuXG4gICAgIyBEdW1wcyBhIGdpdmVuIEphdmFTY3JpcHQgdmFyaWFibGUgdG8gYSBZQU1MIHN0cmluZy5cbiAgICAjXG4gICAgIyBAcGFyYW0gW09iamVjdF0gICB2YWx1ZSAgICAgICAgICAgICAgICAgICBUaGUgSmF2YVNjcmlwdCB2YXJpYWJsZSB0byBjb252ZXJ0XG4gICAgIyBAcGFyYW0gW0Jvb2xlYW5dICBleGNlcHRpb25PbkludmFsaWRUeXBlICB0cnVlIGlmIGFuIGV4Y2VwdGlvbiBtdXN0IGJlIHRocm93biBvbiBpbnZhbGlkIHR5cGVzIChhIEphdmFTY3JpcHQgcmVzb3VyY2Ugb3Igb2JqZWN0KSwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgIyBAcGFyYW0gW0Z1bmN0aW9uXSBvYmplY3RFbmNvZGVyICAgICAgICAgICBBIGZ1bmN0aW9uIHRvIHNlcmlhbGl6ZSBjdXN0b20gb2JqZWN0cywgbnVsbCBvdGhlcndpc2VcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddICBUaGUgWUFNTCBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBKYXZhU2NyaXB0IG9iamVjdFxuICAgICNcbiAgICAjIEB0aHJvdyBbRHVtcEV4Y2VwdGlvbl1cbiAgICAjXG4gICAgQGR1bXA6ICh2YWx1ZSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSA9IGZhbHNlLCBvYmplY3RFbmNvZGVyID0gbnVsbCkgLT5cbiAgICAgICAgaWYgbm90IHZhbHVlP1xuICAgICAgICAgICAgcmV0dXJuICdudWxsJ1xuICAgICAgICB0eXBlID0gdHlwZW9mIHZhbHVlXG4gICAgICAgIGlmIHR5cGUgaXMgJ29iamVjdCdcbiAgICAgICAgICAgIGlmIHZhbHVlIGluc3RhbmNlb2YgRGF0ZVxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICBlbHNlIGlmIG9iamVjdEVuY29kZXI/XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gb2JqZWN0RW5jb2RlciB2YWx1ZVxuICAgICAgICAgICAgICAgIGlmIHR5cGVvZiByZXN1bHQgaXMgJ3N0cmluZycgb3IgcmVzdWx0P1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICAgICAgICByZXR1cm4gQGR1bXBPYmplY3QgdmFsdWVcbiAgICAgICAgaWYgdHlwZSBpcyAnYm9vbGVhbidcbiAgICAgICAgICAgIHJldHVybiAoaWYgdmFsdWUgdGhlbiAndHJ1ZScgZWxzZSAnZmFsc2UnKVxuICAgICAgICBpZiBVdGlscy5pc0RpZ2l0cyh2YWx1ZSlcbiAgICAgICAgICAgIHJldHVybiAoaWYgdHlwZSBpcyAnc3RyaW5nJyB0aGVuIFwiJ1wiK3ZhbHVlK1wiJ1wiIGVsc2UgU3RyaW5nKHBhcnNlSW50KHZhbHVlKSkpXG4gICAgICAgIGlmIFV0aWxzLmlzTnVtZXJpYyh2YWx1ZSlcbiAgICAgICAgICAgIHJldHVybiAoaWYgdHlwZSBpcyAnc3RyaW5nJyB0aGVuIFwiJ1wiK3ZhbHVlK1wiJ1wiIGVsc2UgU3RyaW5nKHBhcnNlRmxvYXQodmFsdWUpKSlcbiAgICAgICAgaWYgdHlwZSBpcyAnbnVtYmVyJ1xuICAgICAgICAgICAgcmV0dXJuIChpZiB2YWx1ZSBpcyBJbmZpbml0eSB0aGVuICcuSW5mJyBlbHNlIChpZiB2YWx1ZSBpcyAtSW5maW5pdHkgdGhlbiAnLS5JbmYnIGVsc2UgKGlmIGlzTmFOKHZhbHVlKSB0aGVuICcuTmFOJyBlbHNlIHZhbHVlKSkpXG4gICAgICAgIGlmIEVzY2FwZXIucmVxdWlyZXNEb3VibGVRdW90aW5nIHZhbHVlXG4gICAgICAgICAgICByZXR1cm4gRXNjYXBlci5lc2NhcGVXaXRoRG91YmxlUXVvdGVzIHZhbHVlXG4gICAgICAgIGlmIEVzY2FwZXIucmVxdWlyZXNTaW5nbGVRdW90aW5nIHZhbHVlXG4gICAgICAgICAgICByZXR1cm4gRXNjYXBlci5lc2NhcGVXaXRoU2luZ2xlUXVvdGVzIHZhbHVlXG4gICAgICAgIGlmICcnIGlzIHZhbHVlXG4gICAgICAgICAgICByZXR1cm4gJ1wiXCInXG4gICAgICAgIGlmIFV0aWxzLlBBVFRFUk5fREFURS50ZXN0IHZhbHVlXG4gICAgICAgICAgICByZXR1cm4gXCInXCIrdmFsdWUrXCInXCI7XG4gICAgICAgIGlmIHZhbHVlLnRvTG93ZXJDYXNlKCkgaW4gWydudWxsJywnficsJ3RydWUnLCdmYWxzZSddXG4gICAgICAgICAgICByZXR1cm4gXCInXCIrdmFsdWUrXCInXCJcbiAgICAgICAgIyBEZWZhdWx0XG4gICAgICAgIHJldHVybiB2YWx1ZTtcblxuXG4gICAgIyBEdW1wcyBhIEphdmFTY3JpcHQgb2JqZWN0IHRvIGEgWUFNTCBzdHJpbmcuXG4gICAgI1xuICAgICMgQHBhcmFtIFtPYmplY3RdICAgdmFsdWUgICAgICAgICAgICAgICAgICAgVGhlIEphdmFTY3JpcHQgb2JqZWN0IHRvIGR1bXBcbiAgICAjIEBwYXJhbSBbQm9vbGVhbl0gIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgIHRydWUgaWYgYW4gZXhjZXB0aW9uIG11c3QgYmUgdGhyb3duIG9uIGludmFsaWQgdHlwZXMgKGEgSmF2YVNjcmlwdCByZXNvdXJjZSBvciBvYmplY3QpLCBmYWxzZSBvdGhlcndpc2VcbiAgICAjIEBwYXJhbSBbRnVuY3Rpb25dIG9iamVjdEVuY29kZXIgICAgICAgICAgIEEgZnVuY3Rpb24gZG8gc2VyaWFsaXplIGN1c3RvbSBvYmplY3RzLCBudWxsIG90aGVyd2lzZVxuICAgICNcbiAgICAjIEByZXR1cm4gc3RyaW5nIFRoZSBZQU1MIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIEphdmFTY3JpcHQgb2JqZWN0XG4gICAgI1xuICAgIEBkdW1wT2JqZWN0OiAodmFsdWUsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdFN1cHBvcnQgPSBudWxsKSAtPlxuICAgICAgICAjIEFycmF5XG4gICAgICAgIGlmIHZhbHVlIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgIG91dHB1dCA9IFtdXG4gICAgICAgICAgICBmb3IgdmFsIGluIHZhbHVlXG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2ggQGR1bXAgdmFsXG4gICAgICAgICAgICByZXR1cm4gJ1snK291dHB1dC5qb2luKCcsICcpKyddJ1xuXG4gICAgICAgICMgTWFwcGluZ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvdXRwdXQgPSBbXVxuICAgICAgICAgICAgZm9yIGtleSwgdmFsIG9mIHZhbHVlXG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2ggQGR1bXAoa2V5KSsnOiAnK0BkdW1wKHZhbClcbiAgICAgICAgICAgIHJldHVybiAneycrb3V0cHV0LmpvaW4oJywgJykrJ30nXG5cblxuICAgICMgUGFyc2VzIGEgc2NhbGFyIHRvIGEgWUFNTCBzdHJpbmcuXG4gICAgI1xuICAgICMgQHBhcmFtIFtPYmplY3RdICAgc2NhbGFyXG4gICAgIyBAcGFyYW0gW0FycmF5XSAgICBkZWxpbWl0ZXJzXG4gICAgIyBAcGFyYW0gW0FycmF5XSAgICBzdHJpbmdEZWxpbWl0ZXJzXG4gICAgIyBAcGFyYW0gW09iamVjdF0gICBjb250ZXh0XG4gICAgIyBAcGFyYW0gW0Jvb2xlYW5dICBldmFsdWF0ZVxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIEEgWUFNTCBzdHJpbmdcbiAgICAjXG4gICAgIyBAdGhyb3cgW1BhcnNlRXhjZXB0aW9uXSBXaGVuIG1hbGZvcm1lZCBpbmxpbmUgWUFNTCBzdHJpbmcgaXMgcGFyc2VkXG4gICAgI1xuICAgIEBwYXJzZVNjYWxhcjogKHNjYWxhciwgZGVsaW1pdGVycyA9IG51bGwsIHN0cmluZ0RlbGltaXRlcnMgPSBbJ1wiJywgXCInXCJdLCBjb250ZXh0ID0gbnVsbCwgZXZhbHVhdGUgPSB0cnVlKSAtPlxuICAgICAgICB1bmxlc3MgY29udGV4dD9cbiAgICAgICAgICAgIGNvbnRleHQgPSBleGNlcHRpb25PbkludmFsaWRUeXBlOiBAc2V0dGluZ3MuZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlcjogQHNldHRpbmdzLm9iamVjdERlY29kZXIsIGk6IDBcbiAgICAgICAge2l9ID0gY29udGV4dFxuXG4gICAgICAgIGlmIHNjYWxhci5jaGFyQXQoaSkgaW4gc3RyaW5nRGVsaW1pdGVyc1xuICAgICAgICAgICAgIyBRdW90ZWQgc2NhbGFyXG4gICAgICAgICAgICBvdXRwdXQgPSBAcGFyc2VRdW90ZWRTY2FsYXIgc2NhbGFyLCBjb250ZXh0XG4gICAgICAgICAgICB7aX0gPSBjb250ZXh0XG5cbiAgICAgICAgICAgIGlmIGRlbGltaXRlcnM/XG4gICAgICAgICAgICAgICAgdG1wID0gVXRpbHMubHRyaW0gc2NhbGFyW2kuLl0sICcgJ1xuICAgICAgICAgICAgICAgIGlmIG5vdCh0bXAuY2hhckF0KDApIGluIGRlbGltaXRlcnMpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnVW5leHBlY3RlZCBjaGFyYWN0ZXJzICgnK3NjYWxhcltpLi5dKycpLidcblxuICAgICAgICBlbHNlXG4gICAgICAgICAgICAjIFwibm9ybWFsXCIgc3RyaW5nXG4gICAgICAgICAgICBpZiBub3QgZGVsaW1pdGVyc1xuICAgICAgICAgICAgICAgIG91dHB1dCA9IHNjYWxhcltpLi5dXG4gICAgICAgICAgICAgICAgaSArPSBvdXRwdXQubGVuZ3RoXG5cbiAgICAgICAgICAgICAgICAjIFJlbW92ZSBjb21tZW50c1xuICAgICAgICAgICAgICAgIHN0cnBvcyA9IG91dHB1dC5pbmRleE9mICcgIydcbiAgICAgICAgICAgICAgICBpZiBzdHJwb3MgaXNudCAtMVxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQgPSBVdGlscy5ydHJpbSBvdXRwdXRbMC4uLnN0cnBvc11cblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGpvaW5lZERlbGltaXRlcnMgPSBkZWxpbWl0ZXJzLmpvaW4oJ3wnKVxuICAgICAgICAgICAgICAgIHBhdHRlcm4gPSBAUEFUVEVSTl9TQ0FMQVJfQllfREVMSU1JVEVSU1tqb2luZWREZWxpbWl0ZXJzXVxuICAgICAgICAgICAgICAgIHVubGVzcyBwYXR0ZXJuP1xuICAgICAgICAgICAgICAgICAgICBwYXR0ZXJuID0gbmV3IFBhdHRlcm4gJ14oLis/KSgnK2pvaW5lZERlbGltaXRlcnMrJyknXG4gICAgICAgICAgICAgICAgICAgIEBQQVRURVJOX1NDQUxBUl9CWV9ERUxJTUlURVJTW2pvaW5lZERlbGltaXRlcnNdID0gcGF0dGVyblxuICAgICAgICAgICAgICAgIGlmIG1hdGNoID0gcGF0dGVybi5leGVjIHNjYWxhcltpLi5dXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dCA9IG1hdGNoWzFdXG4gICAgICAgICAgICAgICAgICAgIGkgKz0gb3V0cHV0Lmxlbmd0aFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdNYWxmb3JtZWQgaW5saW5lIFlBTUwgc3RyaW5nICgnK3NjYWxhcisnKS4nXG5cblxuICAgICAgICAgICAgaWYgZXZhbHVhdGVcbiAgICAgICAgICAgICAgICBvdXRwdXQgPSBAZXZhbHVhdGVTY2FsYXIgb3V0cHV0LCBjb250ZXh0XG5cbiAgICAgICAgY29udGV4dC5pID0gaVxuICAgICAgICByZXR1cm4gb3V0cHV0XG5cblxuICAgICMgUGFyc2VzIGEgcXVvdGVkIHNjYWxhciB0byBZQU1MLlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIHNjYWxhclxuICAgICMgQHBhcmFtIFtPYmplY3RdICAgY29udGV4dFxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIEEgWUFNTCBzdHJpbmdcbiAgICAjXG4gICAgIyBAdGhyb3cgW1BhcnNlRXhjZXB0aW9uXSBXaGVuIG1hbGZvcm1lZCBpbmxpbmUgWUFNTCBzdHJpbmcgaXMgcGFyc2VkXG4gICAgI1xuICAgIEBwYXJzZVF1b3RlZFNjYWxhcjogKHNjYWxhciwgY29udGV4dCkgLT5cbiAgICAgICAge2l9ID0gY29udGV4dFxuXG4gICAgICAgIHVubGVzcyBtYXRjaCA9IEBQQVRURVJOX1FVT1RFRF9TQ0FMQVIuZXhlYyBzY2FsYXJbaS4uXVxuICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdNYWxmb3JtZWQgaW5saW5lIFlBTUwgc3RyaW5nICgnK3NjYWxhcltpLi5dKycpLidcblxuICAgICAgICBvdXRwdXQgPSBtYXRjaFswXS5zdWJzdHIoMSwgbWF0Y2hbMF0ubGVuZ3RoIC0gMilcblxuICAgICAgICBpZiAnXCInIGlzIHNjYWxhci5jaGFyQXQoaSlcbiAgICAgICAgICAgIG91dHB1dCA9IFVuZXNjYXBlci51bmVzY2FwZURvdWJsZVF1b3RlZFN0cmluZyBvdXRwdXRcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgb3V0cHV0ID0gVW5lc2NhcGVyLnVuZXNjYXBlU2luZ2xlUXVvdGVkU3RyaW5nIG91dHB1dFxuXG4gICAgICAgIGkgKz0gbWF0Y2hbMF0ubGVuZ3RoXG5cbiAgICAgICAgY29udGV4dC5pID0gaVxuICAgICAgICByZXR1cm4gb3V0cHV0XG5cblxuICAgICMgUGFyc2VzIGEgc2VxdWVuY2UgdG8gYSBZQU1MIHN0cmluZy5cbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICBzZXF1ZW5jZVxuICAgICMgQHBhcmFtIFtPYmplY3RdICAgY29udGV4dFxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIEEgWUFNTCBzdHJpbmdcbiAgICAjXG4gICAgIyBAdGhyb3cgW1BhcnNlRXhjZXB0aW9uXSBXaGVuIG1hbGZvcm1lZCBpbmxpbmUgWUFNTCBzdHJpbmcgaXMgcGFyc2VkXG4gICAgI1xuICAgIEBwYXJzZVNlcXVlbmNlOiAoc2VxdWVuY2UsIGNvbnRleHQpIC0+XG4gICAgICAgIG91dHB1dCA9IFtdXG4gICAgICAgIGxlbiA9IHNlcXVlbmNlLmxlbmd0aFxuICAgICAgICB7aX0gPSBjb250ZXh0XG4gICAgICAgIGkgKz0gMVxuXG4gICAgICAgICMgW2ZvbywgYmFyLCAuLi5dXG4gICAgICAgIHdoaWxlIGkgPCBsZW5cbiAgICAgICAgICAgIGNvbnRleHQuaSA9IGlcbiAgICAgICAgICAgIHN3aXRjaCBzZXF1ZW5jZS5jaGFyQXQoaSlcbiAgICAgICAgICAgICAgICB3aGVuICdbJ1xuICAgICAgICAgICAgICAgICAgICAjIE5lc3RlZCBzZXF1ZW5jZVxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaCBAcGFyc2VTZXF1ZW5jZSBzZXF1ZW5jZSwgY29udGV4dFxuICAgICAgICAgICAgICAgICAgICB7aX0gPSBjb250ZXh0XG4gICAgICAgICAgICAgICAgd2hlbiAneydcbiAgICAgICAgICAgICAgICAgICAgIyBOZXN0ZWQgbWFwcGluZ1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaCBAcGFyc2VNYXBwaW5nIHNlcXVlbmNlLCBjb250ZXh0XG4gICAgICAgICAgICAgICAgICAgIHtpfSA9IGNvbnRleHRcbiAgICAgICAgICAgICAgICB3aGVuICddJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3V0cHV0XG4gICAgICAgICAgICAgICAgd2hlbiAnLCcsICcgJywgXCJcXG5cIlxuICAgICAgICAgICAgICAgICAgICAjIERvIG5vdGhpbmdcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGlzUXVvdGVkID0gKHNlcXVlbmNlLmNoYXJBdChpKSBpbiBbJ1wiJywgXCInXCJdKVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IEBwYXJzZVNjYWxhciBzZXF1ZW5jZSwgWycsJywgJ10nXSwgWydcIicsIFwiJ1wiXSwgY29udGV4dFxuICAgICAgICAgICAgICAgICAgICB7aX0gPSBjb250ZXh0XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgbm90KGlzUXVvdGVkKSBhbmQgdHlwZW9mKHZhbHVlKSBpcyAnc3RyaW5nJyBhbmQgKHZhbHVlLmluZGV4T2YoJzogJykgaXNudCAtMSBvciB2YWx1ZS5pbmRleE9mKFwiOlxcblwiKSBpc250IC0xKVxuICAgICAgICAgICAgICAgICAgICAgICAgIyBFbWJlZGRlZCBtYXBwaW5nP1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBAcGFyc2VNYXBwaW5nICd7Jyt2YWx1ZSsnfSdcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIE5vLCBpdCdzIG5vdFxuXG5cbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2ggdmFsdWVcblxuICAgICAgICAgICAgICAgICAgICAtLWlcblxuICAgICAgICAgICAgKytpXG5cbiAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdNYWxmb3JtZWQgaW5saW5lIFlBTUwgc3RyaW5nICcrc2VxdWVuY2VcblxuXG4gICAgIyBQYXJzZXMgYSBtYXBwaW5nIHRvIGEgWUFNTCBzdHJpbmcuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgbWFwcGluZ1xuICAgICMgQHBhcmFtIFtPYmplY3RdICAgY29udGV4dFxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIEEgWUFNTCBzdHJpbmdcbiAgICAjXG4gICAgIyBAdGhyb3cgW1BhcnNlRXhjZXB0aW9uXSBXaGVuIG1hbGZvcm1lZCBpbmxpbmUgWUFNTCBzdHJpbmcgaXMgcGFyc2VkXG4gICAgI1xuICAgIEBwYXJzZU1hcHBpbmc6IChtYXBwaW5nLCBjb250ZXh0KSAtPlxuICAgICAgICBvdXRwdXQgPSB7fVxuICAgICAgICBsZW4gPSBtYXBwaW5nLmxlbmd0aFxuICAgICAgICB7aX0gPSBjb250ZXh0XG4gICAgICAgIGkgKz0gMVxuXG4gICAgICAgICMge2ZvbzogYmFyLCBiYXI6Zm9vLCAuLi59XG4gICAgICAgIHNob3VsZENvbnRpbnVlV2hpbGVMb29wID0gZmFsc2VcbiAgICAgICAgd2hpbGUgaSA8IGxlblxuICAgICAgICAgICAgY29udGV4dC5pID0gaVxuICAgICAgICAgICAgc3dpdGNoIG1hcHBpbmcuY2hhckF0KGkpXG4gICAgICAgICAgICAgICAgd2hlbiAnICcsICcsJywgXCJcXG5cIlxuICAgICAgICAgICAgICAgICAgICArK2lcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5pID0gaVxuICAgICAgICAgICAgICAgICAgICBzaG91bGRDb250aW51ZVdoaWxlTG9vcCA9IHRydWVcbiAgICAgICAgICAgICAgICB3aGVuICd9J1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3V0cHV0XG5cbiAgICAgICAgICAgIGlmIHNob3VsZENvbnRpbnVlV2hpbGVMb29wXG4gICAgICAgICAgICAgICAgc2hvdWxkQ29udGludWVXaGlsZUxvb3AgPSBmYWxzZVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgICMgS2V5XG4gICAgICAgICAgICBrZXkgPSBAcGFyc2VTY2FsYXIgbWFwcGluZywgWyc6JywgJyAnLCBcIlxcblwiXSwgWydcIicsIFwiJ1wiXSwgY29udGV4dCwgZmFsc2VcbiAgICAgICAgICAgIHtpfSA9IGNvbnRleHRcblxuICAgICAgICAgICAgIyBWYWx1ZVxuICAgICAgICAgICAgZG9uZSA9IGZhbHNlXG5cbiAgICAgICAgICAgIHdoaWxlIGkgPCBsZW5cbiAgICAgICAgICAgICAgICBjb250ZXh0LmkgPSBpXG4gICAgICAgICAgICAgICAgc3dpdGNoIG1hcHBpbmcuY2hhckF0KGkpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ1snXG4gICAgICAgICAgICAgICAgICAgICAgICAjIE5lc3RlZCBzZXF1ZW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBAcGFyc2VTZXF1ZW5jZSBtYXBwaW5nLCBjb250ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICB7aX0gPSBjb250ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAjIFNwZWM6IEtleXMgTVVTVCBiZSB1bmlxdWU7IGZpcnN0IG9uZSB3aW5zLlxuICAgICAgICAgICAgICAgICAgICAgICAgIyBQYXJzZXIgY2Fubm90IGFib3J0IHRoaXMgbWFwcGluZyBlYXJsaWVyLCBzaW5jZSBsaW5lc1xuICAgICAgICAgICAgICAgICAgICAgICAgIyBhcmUgcHJvY2Vzc2VkIHNlcXVlbnRpYWxseS5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG91dHB1dFtrZXldID09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFtrZXldID0gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3snXG4gICAgICAgICAgICAgICAgICAgICAgICAjIE5lc3RlZCBtYXBwaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IEBwYXJzZU1hcHBpbmcgbWFwcGluZywgY29udGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAge2l9ID0gY29udGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgIyBTcGVjOiBLZXlzIE1VU1QgYmUgdW5pcXVlOyBmaXJzdCBvbmUgd2lucy5cbiAgICAgICAgICAgICAgICAgICAgICAgICMgUGFyc2VyIGNhbm5vdCBhYm9ydCB0aGlzIG1hcHBpbmcgZWFybGllciwgc2luY2UgbGluZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICMgYXJlIHByb2Nlc3NlZCBzZXF1ZW50aWFsbHkuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBvdXRwdXRba2V5XSA9PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRba2V5XSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICBkb25lID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB3aGVuICc6JywgJyAnLCBcIlxcblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAjIERvIG5vdGhpbmdcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBAcGFyc2VTY2FsYXIgbWFwcGluZywgWycsJywgJ30nXSwgWydcIicsIFwiJ1wiXSwgY29udGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAge2l9ID0gY29udGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgIyBTcGVjOiBLZXlzIE1VU1QgYmUgdW5pcXVlOyBmaXJzdCBvbmUgd2lucy5cbiAgICAgICAgICAgICAgICAgICAgICAgICMgUGFyc2VyIGNhbm5vdCBhYm9ydCB0aGlzIG1hcHBpbmcgZWFybGllciwgc2luY2UgbGluZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICMgYXJlIHByb2Nlc3NlZCBzZXF1ZW50aWFsbHkuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBvdXRwdXRba2V5XSA9PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRba2V5XSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICBkb25lID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgLS1pXG5cbiAgICAgICAgICAgICAgICArK2lcblxuICAgICAgICAgICAgICAgIGlmIGRvbmVcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24gJ01hbGZvcm1lZCBpbmxpbmUgWUFNTCBzdHJpbmcgJyttYXBwaW5nXG5cblxuICAgICMgRXZhbHVhdGVzIHNjYWxhcnMgYW5kIHJlcGxhY2VzIG1hZ2ljIHZhbHVlcy5cbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICBzY2FsYXJcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddICBBIFlBTUwgc3RyaW5nXG4gICAgI1xuICAgIEBldmFsdWF0ZVNjYWxhcjogKHNjYWxhciwgY29udGV4dCkgLT5cbiAgICAgICAgc2NhbGFyID0gVXRpbHMudHJpbShzY2FsYXIpXG4gICAgICAgIHNjYWxhckxvd2VyID0gc2NhbGFyLnRvTG93ZXJDYXNlKClcblxuICAgICAgICBzd2l0Y2ggc2NhbGFyTG93ZXJcbiAgICAgICAgICAgIHdoZW4gJ251bGwnLCAnJywgJ34nXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgICAgIHdoZW4gJ3RydWUnXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIHdoZW4gJ2ZhbHNlJ1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgd2hlbiAnLmluZidcbiAgICAgICAgICAgICAgICByZXR1cm4gSW5maW5pdHlcbiAgICAgICAgICAgIHdoZW4gJy5uYW4nXG4gICAgICAgICAgICAgICAgcmV0dXJuIE5hTlxuICAgICAgICAgICAgd2hlbiAnLS5pbmYnXG4gICAgICAgICAgICAgICAgcmV0dXJuIEluZmluaXR5XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZmlyc3RDaGFyID0gc2NhbGFyTG93ZXIuY2hhckF0KDApXG4gICAgICAgICAgICAgICAgc3dpdGNoIGZpcnN0Q2hhclxuICAgICAgICAgICAgICAgICAgICB3aGVuICchJ1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RTcGFjZSA9IHNjYWxhci5pbmRleE9mKCcgJylcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGZpcnN0U3BhY2UgaXMgLTFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdFdvcmQgPSBzY2FsYXJMb3dlclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0V29yZCA9IHNjYWxhckxvd2VyWzAuLi5maXJzdFNwYWNlXVxuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIGZpcnN0V29yZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJyEnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGZpcnN0U3BhY2UgaXNudCAtMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50IEBwYXJzZVNjYWxhcihzY2FsYXJbMi4uXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGVuICchc3RyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gVXRpbHMubHRyaW0gc2NhbGFyWzQuLl1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGVuICchIXN0cidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFV0aWxzLmx0cmltIHNjYWxhcls1Li5dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnISFpbnQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUludChAcGFyc2VTY2FsYXIoc2NhbGFyWzUuLl0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJyEhYm9vbCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFV0aWxzLnBhcnNlQm9vbGVhbihAcGFyc2VTY2FsYXIoc2NhbGFyWzYuLl0pLCBmYWxzZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGVuICchIWZsb2F0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChAcGFyc2VTY2FsYXIoc2NhbGFyWzcuLl0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJyEhdGltZXN0YW1wJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gVXRpbHMuc3RyaW5nVG9EYXRlKFV0aWxzLmx0cmltKHNjYWxhclsxMS4uXSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmxlc3MgY29udGV4dD9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQgPSBleGNlcHRpb25PbkludmFsaWRUeXBlOiBAc2V0dGluZ3MuZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlcjogQHNldHRpbmdzLm9iamVjdERlY29kZXIsIGk6IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge29iamVjdERlY29kZXIsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGV9ID0gY29udGV4dFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIG9iamVjdERlY29kZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgSWYgb2JqZWN0RGVjb2RlciBmdW5jdGlvbiBpcyBnaXZlbiwgd2UgY2FuIGRvIGN1c3RvbSBkZWNvZGluZyBvZiBjdXN0b20gdHlwZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyaW1tZWRTY2FsYXIgPSBVdGlscy5ydHJpbSBzY2FsYXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0U3BhY2UgPSB0cmltbWVkU2NhbGFyLmluZGV4T2YoJyAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgZmlyc3RTcGFjZSBpcyAtMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvYmplY3REZWNvZGVyIHRyaW1tZWRTY2FsYXIsIG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJWYWx1ZSA9IFV0aWxzLmx0cmltIHRyaW1tZWRTY2FsYXJbZmlyc3RTcGFjZSsxLi5dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5sZXNzIHN1YlZhbHVlLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ViVmFsdWUgPSBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9iamVjdERlY29kZXIgdHJpbW1lZFNjYWxhclswLi4uZmlyc3RTcGFjZV0sIHN1YlZhbHVlXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgZXhjZXB0aW9uT25JbnZhbGlkVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdDdXN0b20gb2JqZWN0IHN1cHBvcnQgd2hlbiBwYXJzaW5nIGEgWUFNTCBmaWxlIGhhcyBiZWVuIGRpc2FibGVkLidcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICAgICAgICAgICAgICB3aGVuICcwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgJzB4JyBpcyBzY2FsYXJbMC4uLjJdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFV0aWxzLmhleERlYyBzY2FsYXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgVXRpbHMuaXNEaWdpdHMgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFV0aWxzLm9jdERlYyBzY2FsYXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgVXRpbHMuaXNOdW1lcmljIHNjYWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0IHNjYWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzY2FsYXJcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnKydcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIFV0aWxzLmlzRGlnaXRzIHNjYWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJhdyA9IHNjYWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc3QgPSBwYXJzZUludChyYXcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgcmF3IGlzIFN0cmluZyhjYXN0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJhd1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBVdGlscy5pc051bWVyaWMgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIEBQQVRURVJOX1RIT1VTQU5EX05VTUVSSUNfU0NBTEFSLnRlc3Qgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoc2NhbGFyLnJlcGxhY2UoJywnLCAnJykpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJy0nXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBVdGlscy5pc0RpZ2l0cyhzY2FsYXJbMS4uXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAnMCcgaXMgc2NhbGFyLmNoYXJBdCgxKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gLVV0aWxzLm9jdERlYyhzY2FsYXJbMS4uXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJhdyA9IHNjYWxhclsxLi5dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc3QgPSBwYXJzZUludChyYXcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHJhdyBpcyBTdHJpbmcoY2FzdClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAtY2FzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gLXJhd1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBVdGlscy5pc051bWVyaWMgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIEBQQVRURVJOX1RIT1VTQU5EX05VTUVSSUNfU0NBTEFSLnRlc3Qgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoc2NhbGFyLnJlcGxhY2UoJywnLCAnJykpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGRhdGUgPSBVdGlscy5zdHJpbmdUb0RhdGUoc2NhbGFyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIFV0aWxzLmlzTnVtZXJpYyhzY2FsYXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIEBQQVRURVJOX1RIT1VTQU5EX05VTUVSSUNfU0NBTEFSLnRlc3Qgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoc2NhbGFyLnJlcGxhY2UoJywnLCAnJykpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2NhbGFyXG5cbm1vZHVsZS5leHBvcnRzID0gSW5saW5lXG4iLCJcbklubGluZSAgICAgICAgICA9IHJlcXVpcmUgJy4vSW5saW5lJ1xuUGF0dGVybiAgICAgICAgID0gcmVxdWlyZSAnLi9QYXR0ZXJuJ1xuVXRpbHMgICAgICAgICAgID0gcmVxdWlyZSAnLi9VdGlscydcblBhcnNlRXhjZXB0aW9uICA9IHJlcXVpcmUgJy4vRXhjZXB0aW9uL1BhcnNlRXhjZXB0aW9uJ1xuXG4jIFBhcnNlciBwYXJzZXMgWUFNTCBzdHJpbmdzIHRvIGNvbnZlcnQgdGhlbSB0byBKYXZhU2NyaXB0IG9iamVjdHMuXG4jXG5jbGFzcyBQYXJzZXJcblxuICAgICMgUHJlLWNvbXBpbGVkIHBhdHRlcm5zXG4gICAgI1xuICAgIFBBVFRFUk5fRk9MREVEX1NDQUxBUl9BTEw6ICAgICAgICAgICAgICBuZXcgUGF0dGVybiAnXig/Oig/PHR5cGU+IVteXFxcXHw+XSopXFxcXHMrKT8oPzxzZXBhcmF0b3I+XFxcXHx8PikoPzxtb2RpZmllcnM+XFxcXCt8XFxcXC18XFxcXGQrfFxcXFwrXFxcXGQrfFxcXFwtXFxcXGQrfFxcXFxkK1xcXFwrfFxcXFxkK1xcXFwtKT8oPzxjb21tZW50cz4gKyMuKik/JCdcbiAgICBQQVRURVJOX0ZPTERFRF9TQ0FMQVJfRU5EOiAgICAgICAgICAgICAgbmV3IFBhdHRlcm4gJyg/PHNlcGFyYXRvcj5cXFxcfHw+KSg/PG1vZGlmaWVycz5cXFxcK3xcXFxcLXxcXFxcZCt8XFxcXCtcXFxcZCt8XFxcXC1cXFxcZCt8XFxcXGQrXFxcXCt8XFxcXGQrXFxcXC0pPyg/PGNvbW1lbnRzPiArIy4qKT8kJ1xuICAgIFBBVFRFUk5fU0VRVUVOQ0VfSVRFTTogICAgICAgICAgICAgICAgICBuZXcgUGF0dGVybiAnXlxcXFwtKCg/PGxlYWRzcGFjZXM+XFxcXHMrKSg/PHZhbHVlPi4rPykpP1xcXFxzKiQnXG4gICAgUEFUVEVSTl9BTkNIT1JfVkFMVUU6ICAgICAgICAgICAgICAgICAgIG5ldyBQYXR0ZXJuICdeJig/PHJlZj5bXiBdKykgKig/PHZhbHVlPi4qKSdcbiAgICBQQVRURVJOX0NPTVBBQ1RfTk9UQVRJT046ICAgICAgICAgICAgICAgbmV3IFBhdHRlcm4gJ14oPzxrZXk+JytJbmxpbmUuUkVHRVhfUVVPVEVEX1NUUklORysnfFteIFxcJ1wiXFxcXHtcXFxcW10uKj8pICpcXFxcOihcXFxccysoPzx2YWx1ZT4uKz8pKT9cXFxccyokJ1xuICAgIFBBVFRFUk5fTUFQUElOR19JVEVNOiAgICAgICAgICAgICAgICAgICBuZXcgUGF0dGVybiAnXig/PGtleT4nK0lubGluZS5SRUdFWF9RVU9URURfU1RSSU5HKyd8W14gXFwnXCJcXFxcW1xcXFx7XS4qPykgKlxcXFw6KFxcXFxzKyg/PHZhbHVlPi4rPykpP1xcXFxzKiQnXG4gICAgUEFUVEVSTl9ERUNJTUFMOiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBQYXR0ZXJuICdcXFxcZCsnXG4gICAgUEFUVEVSTl9JTkRFTlRfU1BBQ0VTOiAgICAgICAgICAgICAgICAgIG5ldyBQYXR0ZXJuICdeICsnXG4gICAgUEFUVEVSTl9UUkFJTElOR19MSU5FUzogICAgICAgICAgICAgICAgIG5ldyBQYXR0ZXJuICcoXFxuKikkJ1xuICAgIFBBVFRFUk5fWUFNTF9IRUFERVI6ICAgICAgICAgICAgICAgICAgICBuZXcgUGF0dGVybiAnXlxcXFwlWUFNTFs6IF1bXFxcXGRcXFxcLl0rLipcXG4nXG4gICAgUEFUVEVSTl9MRUFESU5HX0NPTU1FTlRTOiAgICAgICAgICAgICAgIG5ldyBQYXR0ZXJuICdeKFxcXFwjLio/XFxuKSsnXG4gICAgUEFUVEVSTl9ET0NVTUVOVF9NQVJLRVJfU1RBUlQ6ICAgICAgICAgIG5ldyBQYXR0ZXJuICdeXFxcXC1cXFxcLVxcXFwtLio/XFxuJ1xuICAgIFBBVFRFUk5fRE9DVU1FTlRfTUFSS0VSX0VORDogICAgICAgICAgICBuZXcgUGF0dGVybiAnXlxcXFwuXFxcXC5cXFxcLlxcXFxzKiQnXG4gICAgUEFUVEVSTl9GT0xERURfU0NBTEFSX0JZX0lOREVOVEFUSU9OOiAgIHt9XG5cbiAgICAjIENvbnRleHQgdHlwZXNcbiAgICAjXG4gICAgQ09OVEVYVF9OT05FOiAgICAgICAwXG4gICAgQ09OVEVYVF9TRVFVRU5DRTogICAxXG4gICAgQ09OVEVYVF9NQVBQSU5HOiAgICAyXG5cblxuICAgICMgQ29uc3RydWN0b3JcbiAgICAjXG4gICAgIyBAcGFyYW0gW0ludGVnZXJdICBvZmZzZXQgIFRoZSBvZmZzZXQgb2YgWUFNTCBkb2N1bWVudCAodXNlZCBmb3IgbGluZSBudW1iZXJzIGluIGVycm9yIG1lc3NhZ2VzKVxuICAgICNcbiAgICBjb25zdHJ1Y3RvcjogKEBvZmZzZXQgPSAwKSAtPlxuICAgICAgICBAbGluZXMgICAgICAgICAgPSBbXVxuICAgICAgICBAY3VycmVudExpbmVOYiAgPSAtMVxuICAgICAgICBAY3VycmVudExpbmUgICAgPSAnJ1xuICAgICAgICBAcmVmcyAgICAgICAgICAgPSB7fVxuXG5cbiAgICAjIFBhcnNlcyBhIFlBTUwgc3RyaW5nIHRvIGEgSmF2YVNjcmlwdCB2YWx1ZS5cbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICB2YWx1ZSAgICAgICAgICAgICAgICAgICBBIFlBTUwgc3RyaW5nXG4gICAgIyBAcGFyYW0gW0Jvb2xlYW5dICBleGNlcHRpb25PbkludmFsaWRUeXBlICB0cnVlIGlmIGFuIGV4Y2VwdGlvbiBtdXN0IGJlIHRocm93biBvbiBpbnZhbGlkIHR5cGVzIChhIEphdmFTY3JpcHQgcmVzb3VyY2Ugb3Igb2JqZWN0KSwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgIyBAcGFyYW0gW0Z1bmN0aW9uXSBvYmplY3REZWNvZGVyICAgICAgICAgICBBIGZ1bmN0aW9uIHRvIGRlc2VyaWFsaXplIGN1c3RvbSBvYmplY3RzLCBudWxsIG90aGVyd2lzZVxuICAgICNcbiAgICAjIEByZXR1cm4gW09iamVjdF0gIEEgSmF2YVNjcmlwdCB2YWx1ZVxuICAgICNcbiAgICAjIEB0aHJvdyBbUGFyc2VFeGNlcHRpb25dIElmIHRoZSBZQU1MIGlzIG5vdCB2YWxpZFxuICAgICNcbiAgICBwYXJzZTogKHZhbHVlLCBleGNlcHRpb25PbkludmFsaWRUeXBlID0gZmFsc2UsIG9iamVjdERlY29kZXIgPSBudWxsKSAtPlxuICAgICAgICBAY3VycmVudExpbmVOYiA9IC0xXG4gICAgICAgIEBjdXJyZW50TGluZSA9ICcnXG4gICAgICAgIEBsaW5lcyA9IEBjbGVhbnVwKHZhbHVlKS5zcGxpdCBcIlxcblwiXG5cbiAgICAgICAgZGF0YSA9IG51bGxcbiAgICAgICAgY29udGV4dCA9IEBDT05URVhUX05PTkVcbiAgICAgICAgYWxsb3dPdmVyd3JpdGUgPSBmYWxzZVxuICAgICAgICB3aGlsZSBAbW92ZVRvTmV4dExpbmUoKVxuICAgICAgICAgICAgaWYgQGlzQ3VycmVudExpbmVFbXB0eSgpXG4gICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgIyBUYWI/XG4gICAgICAgICAgICBpZiBcIlxcdFwiIGlzIEBjdXJyZW50TGluZVswXVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnQSBZQU1MIGZpbGUgY2Fubm90IGNvbnRhaW4gdGFicyBhcyBpbmRlbnRhdGlvbi4nLCBAZ2V0UmVhbEN1cnJlbnRMaW5lTmIoKSArIDEsIEBjdXJyZW50TGluZVxuXG4gICAgICAgICAgICBpc1JlZiA9IG1lcmdlTm9kZSA9IGZhbHNlXG4gICAgICAgICAgICBpZiB2YWx1ZXMgPSBAUEFUVEVSTl9TRVFVRU5DRV9JVEVNLmV4ZWMgQGN1cnJlbnRMaW5lXG4gICAgICAgICAgICAgICAgaWYgQENPTlRFWFRfTUFQUElORyBpcyBjb250ZXh0XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnWW91IGNhbm5vdCBkZWZpbmUgYSBzZXF1ZW5jZSBpdGVtIHdoZW4gaW4gYSBtYXBwaW5nJ1xuICAgICAgICAgICAgICAgIGNvbnRleHQgPSBAQ09OVEVYVF9TRVFVRU5DRVxuICAgICAgICAgICAgICAgIGRhdGEgPz0gW11cblxuICAgICAgICAgICAgICAgIGlmIHZhbHVlcy52YWx1ZT8gYW5kIG1hdGNoZXMgPSBAUEFUVEVSTl9BTkNIT1JfVkFMVUUuZXhlYyB2YWx1ZXMudmFsdWVcbiAgICAgICAgICAgICAgICAgICAgaXNSZWYgPSBtYXRjaGVzLnJlZlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZXMudmFsdWUgPSBtYXRjaGVzLnZhbHVlXG5cbiAgICAgICAgICAgICAgICAjIEFycmF5XG4gICAgICAgICAgICAgICAgaWYgbm90KHZhbHVlcy52YWx1ZT8pIG9yICcnIGlzIFV0aWxzLnRyaW0odmFsdWVzLnZhbHVlLCAnICcpIG9yIFV0aWxzLmx0cmltKHZhbHVlcy52YWx1ZSwgJyAnKS5pbmRleE9mKCcjJykgaXMgMFxuICAgICAgICAgICAgICAgICAgICBpZiBAY3VycmVudExpbmVOYiA8IEBsaW5lcy5sZW5ndGggLSAxIGFuZCBub3QgQGlzTmV4dExpbmVVbkluZGVudGVkQ29sbGVjdGlvbigpXG4gICAgICAgICAgICAgICAgICAgICAgICBjID0gQGdldFJlYWxDdXJyZW50TGluZU5iKCkgKyAxXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZXIgPSBuZXcgUGFyc2VyIGNcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlci5yZWZzID0gQHJlZnNcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaCBwYXJzZXIucGFyc2UoQGdldE5leHRFbWJlZEJsb2NrKG51bGwsIHRydWUpLCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyKVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2ggbnVsbFxuXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBpZiB2YWx1ZXMubGVhZHNwYWNlcz8ubGVuZ3RoIGFuZCBtYXRjaGVzID0gQFBBVFRFUk5fQ09NUEFDVF9OT1RBVElPTi5leGVjIHZhbHVlcy52YWx1ZVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAjIFRoaXMgaXMgYSBjb21wYWN0IG5vdGF0aW9uIGVsZW1lbnQsIGFkZCB0byBuZXh0IGJsb2NrIGFuZCBwYXJzZVxuICAgICAgICAgICAgICAgICAgICAgICAgYyA9IEBnZXRSZWFsQ3VycmVudExpbmVOYigpXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZXIgPSBuZXcgUGFyc2VyIGNcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlci5yZWZzID0gQHJlZnNcblxuICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2sgPSB2YWx1ZXMudmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGVudCA9IEBnZXRDdXJyZW50TGluZUluZGVudGF0aW9uKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIEBpc05leHRMaW5lSW5kZW50ZWQoZmFsc2UpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2sgKz0gXCJcXG5cIitAZ2V0TmV4dEVtYmVkQmxvY2soaW5kZW50ICsgdmFsdWVzLmxlYWRzcGFjZXMubGVuZ3RoICsgMSwgdHJ1ZSlcblxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoIHBhcnNlci5wYXJzZSBibG9jaywgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlclxuXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaCBAcGFyc2VWYWx1ZSB2YWx1ZXMudmFsdWUsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXJcblxuICAgICAgICAgICAgZWxzZSBpZiAodmFsdWVzID0gQFBBVFRFUk5fTUFQUElOR19JVEVNLmV4ZWMgQGN1cnJlbnRMaW5lKSBhbmQgdmFsdWVzLmtleS5pbmRleE9mKCcgIycpIGlzIC0xXG4gICAgICAgICAgICAgICAgaWYgQENPTlRFWFRfU0VRVUVOQ0UgaXMgY29udGV4dFxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24gJ1lvdSBjYW5ub3QgZGVmaW5lIGEgbWFwcGluZyBpdGVtIHdoZW4gaW4gYSBzZXF1ZW5jZSdcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0gQENPTlRFWFRfTUFQUElOR1xuICAgICAgICAgICAgICAgIGRhdGEgPz0ge31cblxuICAgICAgICAgICAgICAgICMgRm9yY2UgY29ycmVjdCBzZXR0aW5nc1xuICAgICAgICAgICAgICAgIElubGluZS5jb25maWd1cmUgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlclxuICAgICAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgICAgICBrZXkgPSBJbmxpbmUucGFyc2VTY2FsYXIgdmFsdWVzLmtleVxuICAgICAgICAgICAgICAgIGNhdGNoIGVcbiAgICAgICAgICAgICAgICAgICAgZS5wYXJzZWRMaW5lID0gQGdldFJlYWxDdXJyZW50TGluZU5iKCkgKyAxXG4gICAgICAgICAgICAgICAgICAgIGUuc25pcHBldCA9IEBjdXJyZW50TGluZVxuXG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVcblxuICAgICAgICAgICAgICAgIGlmICc8PCcgaXMga2V5XG4gICAgICAgICAgICAgICAgICAgIG1lcmdlTm9kZSA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgYWxsb3dPdmVyd3JpdGUgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIGlmIHZhbHVlcy52YWx1ZT8uaW5kZXhPZignKicpIGlzIDBcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZk5hbWUgPSB2YWx1ZXMudmFsdWVbMS4uXVxuICAgICAgICAgICAgICAgICAgICAgICAgdW5sZXNzIEByZWZzW3JlZk5hbWVdP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnUmVmZXJlbmNlIFwiJytyZWZOYW1lKydcIiBkb2VzIG5vdCBleGlzdC4nLCBAZ2V0UmVhbEN1cnJlbnRMaW5lTmIoKSArIDEsIEBjdXJyZW50TGluZVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZWZWYWx1ZSA9IEByZWZzW3JlZk5hbWVdXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHR5cGVvZiByZWZWYWx1ZSBpc250ICdvYmplY3QnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdZQU1MIG1lcmdlIGtleXMgdXNlZCB3aXRoIGEgc2NhbGFyIHZhbHVlIGluc3RlYWQgb2YgYW4gb2JqZWN0LicsIEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMSwgQGN1cnJlbnRMaW5lXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHJlZlZhbHVlIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIE1lcmdlIGFycmF5IHdpdGggb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIHZhbHVlLCBpIGluIHJlZlZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFbU3RyaW5nKGkpXSA/PSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgTWVyZ2Ugb2JqZWN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBrZXksIHZhbHVlIG9mIHJlZlZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFba2V5XSA/PSB2YWx1ZVxuXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHZhbHVlcy52YWx1ZT8gYW5kIHZhbHVlcy52YWx1ZSBpc250ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZXMudmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IEBnZXROZXh0RW1iZWRCbG9jaygpXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGMgPSBAZ2V0UmVhbEN1cnJlbnRMaW5lTmIoKSArIDFcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlciA9IG5ldyBQYXJzZXIgY1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VyLnJlZnMgPSBAcmVmc1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VkID0gcGFyc2VyLnBhcnNlIHZhbHVlLCBleGNlcHRpb25PbkludmFsaWRUeXBlXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHVubGVzcyB0eXBlb2YgcGFyc2VkIGlzICdvYmplY3QnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdZQU1MIG1lcmdlIGtleXMgdXNlZCB3aXRoIGEgc2NhbGFyIHZhbHVlIGluc3RlYWQgb2YgYW4gb2JqZWN0LicsIEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMSwgQGN1cnJlbnRMaW5lXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHBhcnNlZCBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBJZiB0aGUgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIHRoZSBtZXJnZSBrZXkgaXMgYSBzZXF1ZW5jZSwgdGhlbiB0aGlzIHNlcXVlbmNlIGlzIGV4cGVjdGVkIHRvIGNvbnRhaW4gbWFwcGluZyBub2Rlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgYW5kIGVhY2ggb2YgdGhlc2Ugbm9kZXMgaXMgbWVyZ2VkIGluIHR1cm4gYWNjb3JkaW5nIHRvIGl0cyBvcmRlciBpbiB0aGUgc2VxdWVuY2UuIEtleXMgaW4gbWFwcGluZyBub2RlcyBlYXJsaWVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBpbiB0aGUgc2VxdWVuY2Ugb3ZlcnJpZGUga2V5cyBzcGVjaWZpZWQgaW4gbGF0ZXIgbWFwcGluZyBub2Rlcy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgcGFyc2VkSXRlbSBpbiBwYXJzZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5sZXNzIHR5cGVvZiBwYXJzZWRJdGVtIGlzICdvYmplY3QnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24gJ01lcmdlIGl0ZW1zIG11c3QgYmUgb2JqZWN0cy4nLCBAZ2V0UmVhbEN1cnJlbnRMaW5lTmIoKSArIDEsIHBhcnNlZEl0ZW1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBwYXJzZWRJdGVtIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgTWVyZ2UgYXJyYXkgd2l0aCBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciB2YWx1ZSwgaSBpbiBwYXJzZWRJdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgayA9IFN0cmluZyhpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVubGVzcyBkYXRhLmhhc093blByb3BlcnR5KGspXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFba10gPSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIE1lcmdlIG9iamVjdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBrZXksIHZhbHVlIG9mIHBhcnNlZEl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmxlc3MgZGF0YS5oYXNPd25Qcm9wZXJ0eShrZXkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFba2V5XSA9IHZhbHVlXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIElmIHRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhlIGtleSBpcyBhIHNpbmdsZSBtYXBwaW5nIG5vZGUsIGVhY2ggb2YgaXRzIGtleS92YWx1ZSBwYWlycyBpcyBpbnNlcnRlZCBpbnRvIHRoZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgY3VycmVudCBtYXBwaW5nLCB1bmxlc3MgdGhlIGtleSBhbHJlYWR5IGV4aXN0cyBpbiBpdC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3Iga2V5LCB2YWx1ZSBvZiBwYXJzZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5sZXNzIGRhdGEuaGFzT3duUHJvcGVydHkoa2V5KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtrZXldID0gdmFsdWVcblxuICAgICAgICAgICAgICAgIGVsc2UgaWYgdmFsdWVzLnZhbHVlPyBhbmQgbWF0Y2hlcyA9IEBQQVRURVJOX0FOQ0hPUl9WQUxVRS5leGVjIHZhbHVlcy52YWx1ZVxuICAgICAgICAgICAgICAgICAgICBpc1JlZiA9IG1hdGNoZXMucmVmXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlcy52YWx1ZSA9IG1hdGNoZXMudmFsdWVcblxuXG4gICAgICAgICAgICAgICAgaWYgbWVyZ2VOb2RlXG4gICAgICAgICAgICAgICAgICAgICMgTWVyZ2Uga2V5c1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgbm90KHZhbHVlcy52YWx1ZT8pIG9yICcnIGlzIFV0aWxzLnRyaW0odmFsdWVzLnZhbHVlLCAnICcpIG9yIFV0aWxzLmx0cmltKHZhbHVlcy52YWx1ZSwgJyAnKS5pbmRleE9mKCcjJykgaXMgMFxuICAgICAgICAgICAgICAgICAgICAjIEhhc2hcbiAgICAgICAgICAgICAgICAgICAgIyBpZiBuZXh0IGxpbmUgaXMgbGVzcyBpbmRlbnRlZCBvciBlcXVhbCwgdGhlbiBpdCBtZWFucyB0aGF0IHRoZSBjdXJyZW50IHZhbHVlIGlzIG51bGxcbiAgICAgICAgICAgICAgICAgICAgaWYgbm90KEBpc05leHRMaW5lSW5kZW50ZWQoKSkgYW5kIG5vdChAaXNOZXh0TGluZVVuSW5kZW50ZWRDb2xsZWN0aW9uKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAjIFNwZWM6IEtleXMgTVVTVCBiZSB1bmlxdWU7IGZpcnN0IG9uZSB3aW5zLlxuICAgICAgICAgICAgICAgICAgICAgICAgIyBCdXQgb3ZlcndyaXRpbmcgaXMgYWxsb3dlZCB3aGVuIGEgbWVyZ2Ugbm9kZSBpcyB1c2VkIGluIGN1cnJlbnQgYmxvY2suXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBhbGxvd092ZXJ3cml0ZSBvciBkYXRhW2tleV0gaXMgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtrZXldID0gbnVsbFxuXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgPSBAZ2V0UmVhbEN1cnJlbnRMaW5lTmIoKSArIDFcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlciA9IG5ldyBQYXJzZXIgY1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VyLnJlZnMgPSBAcmVmc1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsID0gcGFyc2VyLnBhcnNlIEBnZXROZXh0RW1iZWRCbG9jaygpLCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICMgU3BlYzogS2V5cyBNVVNUIGJlIHVuaXF1ZTsgZmlyc3Qgb25lIHdpbnMuXG4gICAgICAgICAgICAgICAgICAgICAgICAjIEJ1dCBvdmVyd3JpdGluZyBpcyBhbGxvd2VkIHdoZW4gYSBtZXJnZSBub2RlIGlzIHVzZWQgaW4gY3VycmVudCBibG9jay5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGFsbG93T3ZlcndyaXRlIG9yIGRhdGFba2V5XSBpcyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2tleV0gPSB2YWxcblxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdmFsID0gQHBhcnNlVmFsdWUgdmFsdWVzLnZhbHVlLCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyXG5cbiAgICAgICAgICAgICAgICAgICAgIyBTcGVjOiBLZXlzIE1VU1QgYmUgdW5pcXVlOyBmaXJzdCBvbmUgd2lucy5cbiAgICAgICAgICAgICAgICAgICAgIyBCdXQgb3ZlcndyaXRpbmcgaXMgYWxsb3dlZCB3aGVuIGEgbWVyZ2Ugbm9kZSBpcyB1c2VkIGluIGN1cnJlbnQgYmxvY2suXG4gICAgICAgICAgICAgICAgICAgIGlmIGFsbG93T3ZlcndyaXRlIG9yIGRhdGFba2V5XSBpcyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFba2V5XSA9IHZhbFxuXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgIyAxLWxpbmVyIG9wdGlvbmFsbHkgZm9sbG93ZWQgYnkgbmV3bGluZVxuICAgICAgICAgICAgICAgIGxpbmVDb3VudCA9IEBsaW5lcy5sZW5ndGhcbiAgICAgICAgICAgICAgICBpZiAxIGlzIGxpbmVDb3VudCBvciAoMiBpcyBsaW5lQ291bnQgYW5kIFV0aWxzLmlzRW1wdHkoQGxpbmVzWzFdKSlcbiAgICAgICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IElubGluZS5wYXJzZSBAbGluZXNbMF0sIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXJcbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgICAgICAgICAgICAgZS5wYXJzZWRMaW5lID0gQGdldFJlYWxDdXJyZW50TGluZU5iKCkgKyAxXG4gICAgICAgICAgICAgICAgICAgICAgICBlLnNuaXBwZXQgPSBAY3VycmVudExpbmVcblxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIHR5cGVvZiB2YWx1ZSBpcyAnb2JqZWN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgdmFsdWUgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0ID0gdmFsdWVbMF1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3Iga2V5IG9mIHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0ID0gdmFsdWVba2V5XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiB0eXBlb2YgZmlyc3QgaXMgJ3N0cmluZycgYW5kIGZpcnN0LmluZGV4T2YoJyonKSBpcyAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YSA9IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGFsaWFzIGluIHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaCBAcmVmc1thbGlhc1sxLi5dXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gZGF0YVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZVxuXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBVdGlscy5sdHJpbSh2YWx1ZSkuY2hhckF0KDApIGluIFsnWycsICd7J11cbiAgICAgICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gSW5saW5lLnBhcnNlIHZhbHVlLCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyXG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGUucGFyc2VkTGluZSA9IEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMVxuICAgICAgICAgICAgICAgICAgICAgICAgZS5zbmlwcGV0ID0gQGN1cnJlbnRMaW5lXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVcblxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnVW5hYmxlIHRvIHBhcnNlLicsIEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMSwgQGN1cnJlbnRMaW5lXG5cbiAgICAgICAgICAgIGlmIGlzUmVmXG4gICAgICAgICAgICAgICAgaWYgZGF0YSBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICAgICAgICAgIEByZWZzW2lzUmVmXSA9IGRhdGFbZGF0YS5sZW5ndGgtMV1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGxhc3RLZXkgPSBudWxsXG4gICAgICAgICAgICAgICAgICAgIGZvciBrZXkgb2YgZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdEtleSA9IGtleVxuICAgICAgICAgICAgICAgICAgICBAcmVmc1tpc1JlZl0gPSBkYXRhW2xhc3RLZXldXG5cblxuICAgICAgICBpZiBVdGlscy5pc0VtcHR5KGRhdGEpXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gZGF0YVxuXG5cblxuICAgICMgUmV0dXJucyB0aGUgY3VycmVudCBsaW5lIG51bWJlciAodGFrZXMgdGhlIG9mZnNldCBpbnRvIGFjY291bnQpLlxuICAgICNcbiAgICAjIEByZXR1cm4gW0ludGVnZXJdICAgICBUaGUgY3VycmVudCBsaW5lIG51bWJlclxuICAgICNcbiAgICBnZXRSZWFsQ3VycmVudExpbmVOYjogLT5cbiAgICAgICAgcmV0dXJuIEBjdXJyZW50TGluZU5iICsgQG9mZnNldFxuXG5cbiAgICAjIFJldHVybnMgdGhlIGN1cnJlbnQgbGluZSBpbmRlbnRhdGlvbi5cbiAgICAjXG4gICAgIyBAcmV0dXJuIFtJbnRlZ2VyXSAgICAgVGhlIGN1cnJlbnQgbGluZSBpbmRlbnRhdGlvblxuICAgICNcbiAgICBnZXRDdXJyZW50TGluZUluZGVudGF0aW9uOiAtPlxuICAgICAgICByZXR1cm4gQGN1cnJlbnRMaW5lLmxlbmd0aCAtIFV0aWxzLmx0cmltKEBjdXJyZW50TGluZSwgJyAnKS5sZW5ndGhcblxuXG4gICAgIyBSZXR1cm5zIHRoZSBuZXh0IGVtYmVkIGJsb2NrIG9mIFlBTUwuXG4gICAgI1xuICAgICMgQHBhcmFtIFtJbnRlZ2VyXSAgICAgICAgICBpbmRlbnRhdGlvbiBUaGUgaW5kZW50IGxldmVsIGF0IHdoaWNoIHRoZSBibG9jayBpcyB0byBiZSByZWFkLCBvciBudWxsIGZvciBkZWZhdWx0XG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgICAgICAgICBBIFlBTUwgc3RyaW5nXG4gICAgI1xuICAgICMgQHRocm93IFtQYXJzZUV4Y2VwdGlvbl0gICBXaGVuIGluZGVudGF0aW9uIHByb2JsZW0gYXJlIGRldGVjdGVkXG4gICAgI1xuICAgIGdldE5leHRFbWJlZEJsb2NrOiAoaW5kZW50YXRpb24gPSBudWxsLCBpbmNsdWRlVW5pbmRlbnRlZENvbGxlY3Rpb24gPSBmYWxzZSkgLT5cbiAgICAgICAgQG1vdmVUb05leHRMaW5lKClcblxuICAgICAgICBpZiBub3QgaW5kZW50YXRpb24/XG4gICAgICAgICAgICBuZXdJbmRlbnQgPSBAZ2V0Q3VycmVudExpbmVJbmRlbnRhdGlvbigpXG5cbiAgICAgICAgICAgIHVuaW5kZW50ZWRFbWJlZEJsb2NrID0gQGlzU3RyaW5nVW5JbmRlbnRlZENvbGxlY3Rpb25JdGVtIEBjdXJyZW50TGluZVxuXG4gICAgICAgICAgICBpZiBub3QoQGlzQ3VycmVudExpbmVFbXB0eSgpKSBhbmQgMCBpcyBuZXdJbmRlbnQgYW5kIG5vdCh1bmluZGVudGVkRW1iZWRCbG9jaylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24gJ0luZGVudGF0aW9uIHByb2JsZW0uJywgQGdldFJlYWxDdXJyZW50TGluZU5iKCkgKyAxLCBAY3VycmVudExpbmVcblxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBuZXdJbmRlbnQgPSBpbmRlbnRhdGlvblxuXG5cbiAgICAgICAgZGF0YSA9IFtAY3VycmVudExpbmVbbmV3SW5kZW50Li5dXVxuXG4gICAgICAgIHVubGVzcyBpbmNsdWRlVW5pbmRlbnRlZENvbGxlY3Rpb25cbiAgICAgICAgICAgIGlzSXRVbmluZGVudGVkQ29sbGVjdGlvbiA9IEBpc1N0cmluZ1VuSW5kZW50ZWRDb2xsZWN0aW9uSXRlbSBAY3VycmVudExpbmVcblxuICAgICAgICAjIENvbW1lbnRzIG11c3Qgbm90IGJlIHJlbW92ZWQgaW5zaWRlIGEgc3RyaW5nIGJsb2NrIChpZS4gYWZ0ZXIgYSBsaW5lIGVuZGluZyB3aXRoIFwifFwiKVxuICAgICAgICAjIFRoZXkgbXVzdCBub3QgYmUgcmVtb3ZlZCBpbnNpZGUgYSBzdWItZW1iZWRkZWQgYmxvY2sgYXMgd2VsbFxuICAgICAgICByZW1vdmVDb21tZW50c1BhdHRlcm4gPSBAUEFUVEVSTl9GT0xERURfU0NBTEFSX0VORFxuICAgICAgICByZW1vdmVDb21tZW50cyA9IG5vdCByZW1vdmVDb21tZW50c1BhdHRlcm4udGVzdCBAY3VycmVudExpbmVcblxuICAgICAgICB3aGlsZSBAbW92ZVRvTmV4dExpbmUoKVxuICAgICAgICAgICAgaW5kZW50ID0gQGdldEN1cnJlbnRMaW5lSW5kZW50YXRpb24oKVxuXG4gICAgICAgICAgICBpZiBpbmRlbnQgaXMgbmV3SW5kZW50XG4gICAgICAgICAgICAgICAgcmVtb3ZlQ29tbWVudHMgPSBub3QgcmVtb3ZlQ29tbWVudHNQYXR0ZXJuLnRlc3QgQGN1cnJlbnRMaW5lXG5cbiAgICAgICAgICAgIGlmIGlzSXRVbmluZGVudGVkQ29sbGVjdGlvbiBhbmQgbm90IEBpc1N0cmluZ1VuSW5kZW50ZWRDb2xsZWN0aW9uSXRlbShAY3VycmVudExpbmUpIGFuZCBpbmRlbnQgaXMgbmV3SW5kZW50XG4gICAgICAgICAgICAgICAgQG1vdmVUb1ByZXZpb3VzTGluZSgpXG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgaWYgQGlzQ3VycmVudExpbmVCbGFuaygpXG4gICAgICAgICAgICAgICAgZGF0YS5wdXNoIEBjdXJyZW50TGluZVtuZXdJbmRlbnQuLl1cbiAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICBpZiByZW1vdmVDb21tZW50cyBhbmQgQGlzQ3VycmVudExpbmVDb21tZW50KClcbiAgICAgICAgICAgICAgICBpZiBpbmRlbnQgaXMgbmV3SW5kZW50XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIGlmIGluZGVudCA+PSBuZXdJbmRlbnRcbiAgICAgICAgICAgICAgICBkYXRhLnB1c2ggQGN1cnJlbnRMaW5lW25ld0luZGVudC4uXVxuICAgICAgICAgICAgZWxzZSBpZiBVdGlscy5sdHJpbShAY3VycmVudExpbmUpLmNoYXJBdCgwKSBpcyAnIydcbiAgICAgICAgICAgICAgICAjIERvbid0IGFkZCBsaW5lIHdpdGggY29tbWVudHNcbiAgICAgICAgICAgIGVsc2UgaWYgMCBpcyBpbmRlbnRcbiAgICAgICAgICAgICAgICBAbW92ZVRvUHJldmlvdXNMaW5lKClcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnSW5kZW50YXRpb24gcHJvYmxlbS4nLCBAZ2V0UmVhbEN1cnJlbnRMaW5lTmIoKSArIDEsIEBjdXJyZW50TGluZVxuXG5cbiAgICAgICAgcmV0dXJuIGRhdGEuam9pbiBcIlxcblwiXG5cblxuICAgICMgTW92ZXMgdGhlIHBhcnNlciB0byB0aGUgbmV4dCBsaW5lLlxuICAgICNcbiAgICAjIEByZXR1cm4gW0Jvb2xlYW5dXG4gICAgI1xuICAgIG1vdmVUb05leHRMaW5lOiAtPlxuICAgICAgICBpZiBAY3VycmVudExpbmVOYiA+PSBAbGluZXMubGVuZ3RoIC0gMVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgICAgQGN1cnJlbnRMaW5lID0gQGxpbmVzWysrQGN1cnJlbnRMaW5lTmJdO1xuXG4gICAgICAgIHJldHVybiB0cnVlXG5cblxuICAgICMgTW92ZXMgdGhlIHBhcnNlciB0byB0aGUgcHJldmlvdXMgbGluZS5cbiAgICAjXG4gICAgbW92ZVRvUHJldmlvdXNMaW5lOiAtPlxuICAgICAgICBAY3VycmVudExpbmUgPSBAbGluZXNbLS1AY3VycmVudExpbmVOYl1cbiAgICAgICAgcmV0dXJuXG5cblxuICAgICMgUGFyc2VzIGEgWUFNTCB2YWx1ZS5cbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICB2YWx1ZSAgICAgICAgICAgICAgICAgICBBIFlBTUwgdmFsdWVcbiAgICAjIEBwYXJhbSBbQm9vbGVhbl0gIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgIHRydWUgaWYgYW4gZXhjZXB0aW9uIG11c3QgYmUgdGhyb3duIG9uIGludmFsaWQgdHlwZXMgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgIyBAcGFyYW0gW0Z1bmN0aW9uXSBvYmplY3REZWNvZGVyICAgICAgICAgICBBIGZ1bmN0aW9uIHRvIGRlc2VyaWFsaXplIGN1c3RvbSBvYmplY3RzLCBudWxsIG90aGVyd2lzZVxuICAgICNcbiAgICAjIEByZXR1cm4gW09iamVjdF0gQSBKYXZhU2NyaXB0IHZhbHVlXG4gICAgI1xuICAgICMgQHRocm93IFtQYXJzZUV4Y2VwdGlvbl0gV2hlbiByZWZlcmVuY2UgZG9lcyBub3QgZXhpc3RcbiAgICAjXG4gICAgcGFyc2VWYWx1ZTogKHZhbHVlLCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyKSAtPlxuICAgICAgICBpZiAwIGlzIHZhbHVlLmluZGV4T2YoJyonKVxuICAgICAgICAgICAgcG9zID0gdmFsdWUuaW5kZXhPZiAnIydcbiAgICAgICAgICAgIGlmIHBvcyBpc250IC0xXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5zdWJzdHIoMSwgcG9zLTIpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZVsxLi5dXG5cbiAgICAgICAgICAgIGlmIEByZWZzW3ZhbHVlXSBpcyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24gJ1JlZmVyZW5jZSBcIicrdmFsdWUrJ1wiIGRvZXMgbm90IGV4aXN0LicsIEBjdXJyZW50TGluZVxuXG4gICAgICAgICAgICByZXR1cm4gQHJlZnNbdmFsdWVdXG5cblxuICAgICAgICBpZiBtYXRjaGVzID0gQFBBVFRFUk5fRk9MREVEX1NDQUxBUl9BTEwuZXhlYyB2YWx1ZVxuICAgICAgICAgICAgbW9kaWZpZXJzID0gbWF0Y2hlcy5tb2RpZmllcnMgPyAnJ1xuXG4gICAgICAgICAgICBmb2xkZWRJbmRlbnQgPSBNYXRoLmFicyhwYXJzZUludChtb2RpZmllcnMpKVxuICAgICAgICAgICAgaWYgaXNOYU4oZm9sZGVkSW5kZW50KSB0aGVuIGZvbGRlZEluZGVudCA9IDBcbiAgICAgICAgICAgIHZhbCA9IEBwYXJzZUZvbGRlZFNjYWxhciBtYXRjaGVzLnNlcGFyYXRvciwgQFBBVFRFUk5fREVDSU1BTC5yZXBsYWNlKG1vZGlmaWVycywgJycpLCBmb2xkZWRJbmRlbnRcbiAgICAgICAgICAgIGlmIG1hdGNoZXMudHlwZT9cbiAgICAgICAgICAgICAgICAjIEZvcmNlIGNvcnJlY3Qgc2V0dGluZ3NcbiAgICAgICAgICAgICAgICBJbmxpbmUuY29uZmlndXJlIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXJcbiAgICAgICAgICAgICAgICByZXR1cm4gSW5saW5lLnBhcnNlU2NhbGFyIG1hdGNoZXMudHlwZSsnICcrdmFsXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbFxuXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgcmV0dXJuIElubGluZS5wYXJzZSB2YWx1ZSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlclxuICAgICAgICBjYXRjaCBlXG4gICAgICAgICAgICAjIFRyeSB0byBwYXJzZSBtdWx0aWxpbmUgY29tcGFjdCBzZXF1ZW5jZSBvciBtYXBwaW5nXG4gICAgICAgICAgICBpZiB2YWx1ZS5jaGFyQXQoMCkgaW4gWydbJywgJ3snXSBhbmQgZSBpbnN0YW5jZW9mIFBhcnNlRXhjZXB0aW9uIGFuZCBAaXNOZXh0TGluZUluZGVudGVkKClcbiAgICAgICAgICAgICAgICB2YWx1ZSArPSBcIlxcblwiICsgQGdldE5leHRFbWJlZEJsb2NrKClcbiAgICAgICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElubGluZS5wYXJzZSB2YWx1ZSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlclxuICAgICAgICAgICAgICAgIGNhdGNoIGVcbiAgICAgICAgICAgICAgICAgICAgZS5wYXJzZWRMaW5lID0gQGdldFJlYWxDdXJyZW50TGluZU5iKCkgKyAxXG4gICAgICAgICAgICAgICAgICAgIGUuc25pcHBldCA9IEBjdXJyZW50TGluZVxuXG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVcblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGUucGFyc2VkTGluZSA9IEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMVxuICAgICAgICAgICAgICAgIGUuc25pcHBldCA9IEBjdXJyZW50TGluZVxuXG4gICAgICAgICAgICAgICAgdGhyb3cgZVxuXG4gICAgICAgIHJldHVyblxuXG5cbiAgICAjIFBhcnNlcyBhIGZvbGRlZCBzY2FsYXIuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgICAgIHNlcGFyYXRvciAgIFRoZSBzZXBhcmF0b3IgdGhhdCB3YXMgdXNlZCB0byBiZWdpbiB0aGlzIGZvbGRlZCBzY2FsYXIgKHwgb3IgPilcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgICAgICBpbmRpY2F0b3IgICBUaGUgaW5kaWNhdG9yIHRoYXQgd2FzIHVzZWQgdG8gYmVnaW4gdGhpcyBmb2xkZWQgc2NhbGFyICgrIG9yIC0pXG4gICAgIyBAcGFyYW0gW0ludGVnZXJdICAgICAgaW5kZW50YXRpb24gVGhlIGluZGVudGF0aW9uIHRoYXQgd2FzIHVzZWQgdG8gYmVnaW4gdGhpcyBmb2xkZWQgc2NhbGFyXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgICAgIFRoZSB0ZXh0IHZhbHVlXG4gICAgI1xuICAgIHBhcnNlRm9sZGVkU2NhbGFyOiAoc2VwYXJhdG9yLCBpbmRpY2F0b3IgPSAnJywgaW5kZW50YXRpb24gPSAwKSAtPlxuICAgICAgICBub3RFT0YgPSBAbW92ZVRvTmV4dExpbmUoKVxuICAgICAgICBpZiBub3Qgbm90RU9GXG4gICAgICAgICAgICByZXR1cm4gJydcblxuICAgICAgICBpc0N1cnJlbnRMaW5lQmxhbmsgPSBAaXNDdXJyZW50TGluZUJsYW5rKClcbiAgICAgICAgdGV4dCA9ICcnXG5cbiAgICAgICAgIyBMZWFkaW5nIGJsYW5rIGxpbmVzIGFyZSBjb25zdW1lZCBiZWZvcmUgZGV0ZXJtaW5pbmcgaW5kZW50YXRpb25cbiAgICAgICAgd2hpbGUgbm90RU9GIGFuZCBpc0N1cnJlbnRMaW5lQmxhbmtcbiAgICAgICAgICAgICMgbmV3bGluZSBvbmx5IGlmIG5vdCBFT0ZcbiAgICAgICAgICAgIGlmIG5vdEVPRiA9IEBtb3ZlVG9OZXh0TGluZSgpXG4gICAgICAgICAgICAgICAgdGV4dCArPSBcIlxcblwiXG4gICAgICAgICAgICAgICAgaXNDdXJyZW50TGluZUJsYW5rID0gQGlzQ3VycmVudExpbmVCbGFuaygpXG5cblxuICAgICAgICAjIERldGVybWluZSBpbmRlbnRhdGlvbiBpZiBub3Qgc3BlY2lmaWVkXG4gICAgICAgIGlmIDAgaXMgaW5kZW50YXRpb25cbiAgICAgICAgICAgIGlmIG1hdGNoZXMgPSBAUEFUVEVSTl9JTkRFTlRfU1BBQ0VTLmV4ZWMgQGN1cnJlbnRMaW5lXG4gICAgICAgICAgICAgICAgaW5kZW50YXRpb24gPSBtYXRjaGVzWzBdLmxlbmd0aFxuXG5cbiAgICAgICAgaWYgaW5kZW50YXRpb24gPiAwXG4gICAgICAgICAgICBwYXR0ZXJuID0gQFBBVFRFUk5fRk9MREVEX1NDQUxBUl9CWV9JTkRFTlRBVElPTltpbmRlbnRhdGlvbl1cbiAgICAgICAgICAgIHVubGVzcyBwYXR0ZXJuP1xuICAgICAgICAgICAgICAgIHBhdHRlcm4gPSBuZXcgUGF0dGVybiAnXiB7JytpbmRlbnRhdGlvbisnfSguKikkJ1xuICAgICAgICAgICAgICAgIFBhcnNlcjo6UEFUVEVSTl9GT0xERURfU0NBTEFSX0JZX0lOREVOVEFUSU9OW2luZGVudGF0aW9uXSA9IHBhdHRlcm5cblxuICAgICAgICAgICAgd2hpbGUgbm90RU9GIGFuZCAoaXNDdXJyZW50TGluZUJsYW5rIG9yIG1hdGNoZXMgPSBwYXR0ZXJuLmV4ZWMgQGN1cnJlbnRMaW5lKVxuICAgICAgICAgICAgICAgIGlmIGlzQ3VycmVudExpbmVCbGFua1xuICAgICAgICAgICAgICAgICAgICB0ZXh0ICs9IEBjdXJyZW50TGluZVtpbmRlbnRhdGlvbi4uXVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGV4dCArPSBtYXRjaGVzWzFdXG5cbiAgICAgICAgICAgICAgICAjIG5ld2xpbmUgb25seSBpZiBub3QgRU9GXG4gICAgICAgICAgICAgICAgaWYgbm90RU9GID0gQG1vdmVUb05leHRMaW5lKClcbiAgICAgICAgICAgICAgICAgICAgdGV4dCArPSBcIlxcblwiXG4gICAgICAgICAgICAgICAgICAgIGlzQ3VycmVudExpbmVCbGFuayA9IEBpc0N1cnJlbnRMaW5lQmxhbmsoKVxuXG4gICAgICAgIGVsc2UgaWYgbm90RU9GXG4gICAgICAgICAgICB0ZXh0ICs9IFwiXFxuXCJcblxuXG4gICAgICAgIGlmIG5vdEVPRlxuICAgICAgICAgICAgQG1vdmVUb1ByZXZpb3VzTGluZSgpXG5cblxuICAgICAgICAjIFJlbW92ZSBsaW5lIGJyZWFrcyBvZiBlYWNoIGxpbmVzIGV4Y2VwdCB0aGUgZW1wdHkgYW5kIG1vcmUgaW5kZW50ZWQgb25lc1xuICAgICAgICBpZiAnPicgaXMgc2VwYXJhdG9yXG4gICAgICAgICAgICBuZXdUZXh0ID0gJydcbiAgICAgICAgICAgIGZvciBsaW5lIGluIHRleHQuc3BsaXQgXCJcXG5cIlxuICAgICAgICAgICAgICAgIGlmIGxpbmUubGVuZ3RoIGlzIDAgb3IgbGluZS5jaGFyQXQoMCkgaXMgJyAnXG4gICAgICAgICAgICAgICAgICAgIG5ld1RleHQgPSBVdGlscy5ydHJpbShuZXdUZXh0LCAnICcpICsgbGluZSArIFwiXFxuXCJcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG5ld1RleHQgKz0gbGluZSArICcgJ1xuICAgICAgICAgICAgdGV4dCA9IG5ld1RleHRcblxuICAgICAgICBpZiAnKycgaXNudCBpbmRpY2F0b3JcbiAgICAgICAgICAgICMgUmVtb3ZlIGFueSBleHRyYSBzcGFjZSBvciBuZXcgbGluZSBhcyB3ZSBhcmUgYWRkaW5nIHRoZW0gYWZ0ZXJcbiAgICAgICAgICAgIHRleHQgPSBVdGlscy5ydHJpbSh0ZXh0KVxuXG4gICAgICAgICMgRGVhbCB3aXRoIHRyYWlsaW5nIG5ld2xpbmVzIGFzIGluZGljYXRlZFxuICAgICAgICBpZiAnJyBpcyBpbmRpY2F0b3JcbiAgICAgICAgICAgIHRleHQgPSBAUEFUVEVSTl9UUkFJTElOR19MSU5FUy5yZXBsYWNlIHRleHQsIFwiXFxuXCJcbiAgICAgICAgZWxzZSBpZiAnLScgaXMgaW5kaWNhdG9yXG4gICAgICAgICAgICB0ZXh0ID0gQFBBVFRFUk5fVFJBSUxJTkdfTElORVMucmVwbGFjZSB0ZXh0LCAnJ1xuXG4gICAgICAgIHJldHVybiB0ZXh0XG5cblxuICAgICMgUmV0dXJucyB0cnVlIGlmIHRoZSBuZXh0IGxpbmUgaXMgaW5kZW50ZWQuXG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gICAgIFJldHVybnMgdHJ1ZSBpZiB0aGUgbmV4dCBsaW5lIGlzIGluZGVudGVkLCBmYWxzZSBvdGhlcndpc2VcbiAgICAjXG4gICAgaXNOZXh0TGluZUluZGVudGVkOiAoaWdub3JlQ29tbWVudHMgPSB0cnVlKSAtPlxuICAgICAgICBjdXJyZW50SW5kZW50YXRpb24gPSBAZ2V0Q3VycmVudExpbmVJbmRlbnRhdGlvbigpXG4gICAgICAgIEVPRiA9IG5vdCBAbW92ZVRvTmV4dExpbmUoKVxuXG4gICAgICAgIGlmIGlnbm9yZUNvbW1lbnRzXG4gICAgICAgICAgICB3aGlsZSBub3QoRU9GKSBhbmQgQGlzQ3VycmVudExpbmVFbXB0eSgpXG4gICAgICAgICAgICAgICAgRU9GID0gbm90IEBtb3ZlVG9OZXh0TGluZSgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHdoaWxlIG5vdChFT0YpIGFuZCBAaXNDdXJyZW50TGluZUJsYW5rKClcbiAgICAgICAgICAgICAgICBFT0YgPSBub3QgQG1vdmVUb05leHRMaW5lKClcblxuICAgICAgICBpZiBFT0ZcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgICAgIHJldCA9IGZhbHNlXG4gICAgICAgIGlmIEBnZXRDdXJyZW50TGluZUluZGVudGF0aW9uKCkgPiBjdXJyZW50SW5kZW50YXRpb25cbiAgICAgICAgICAgIHJldCA9IHRydWVcblxuICAgICAgICBAbW92ZVRvUHJldmlvdXNMaW5lKClcblxuICAgICAgICByZXR1cm4gcmV0XG5cblxuICAgICMgUmV0dXJucyB0cnVlIGlmIHRoZSBjdXJyZW50IGxpbmUgaXMgYmxhbmsgb3IgaWYgaXQgaXMgYSBjb21tZW50IGxpbmUuXG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gICAgIFJldHVybnMgdHJ1ZSBpZiB0aGUgY3VycmVudCBsaW5lIGlzIGVtcHR5IG9yIGlmIGl0IGlzIGEgY29tbWVudCBsaW5lLCBmYWxzZSBvdGhlcndpc2VcbiAgICAjXG4gICAgaXNDdXJyZW50TGluZUVtcHR5OiAtPlxuICAgICAgICB0cmltbWVkTGluZSA9IFV0aWxzLnRyaW0oQGN1cnJlbnRMaW5lLCAnICcpXG4gICAgICAgIHJldHVybiB0cmltbWVkTGluZS5sZW5ndGggaXMgMCBvciB0cmltbWVkTGluZS5jaGFyQXQoMCkgaXMgJyMnXG5cblxuICAgICMgUmV0dXJucyB0cnVlIGlmIHRoZSBjdXJyZW50IGxpbmUgaXMgYmxhbmsuXG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gICAgIFJldHVybnMgdHJ1ZSBpZiB0aGUgY3VycmVudCBsaW5lIGlzIGJsYW5rLCBmYWxzZSBvdGhlcndpc2VcbiAgICAjXG4gICAgaXNDdXJyZW50TGluZUJsYW5rOiAtPlxuICAgICAgICByZXR1cm4gJycgaXMgVXRpbHMudHJpbShAY3VycmVudExpbmUsICcgJylcblxuXG4gICAgIyBSZXR1cm5zIHRydWUgaWYgdGhlIGN1cnJlbnQgbGluZSBpcyBhIGNvbW1lbnQgbGluZS5cbiAgICAjXG4gICAgIyBAcmV0dXJuIFtCb29sZWFuXSAgICAgUmV0dXJucyB0cnVlIGlmIHRoZSBjdXJyZW50IGxpbmUgaXMgYSBjb21tZW50IGxpbmUsIGZhbHNlIG90aGVyd2lzZVxuICAgICNcbiAgICBpc0N1cnJlbnRMaW5lQ29tbWVudDogLT5cbiAgICAgICAgIyBDaGVja2luZyBleHBsaWNpdGx5IHRoZSBmaXJzdCBjaGFyIG9mIHRoZSB0cmltIGlzIGZhc3RlciB0aGFuIGxvb3BzIG9yIHN0cnBvc1xuICAgICAgICBsdHJpbW1lZExpbmUgPSBVdGlscy5sdHJpbShAY3VycmVudExpbmUsICcgJylcblxuICAgICAgICByZXR1cm4gbHRyaW1tZWRMaW5lLmNoYXJBdCgwKSBpcyAnIydcblxuXG4gICAgIyBDbGVhbnVwcyBhIFlBTUwgc3RyaW5nIHRvIGJlIHBhcnNlZC5cbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICB2YWx1ZSBUaGUgaW5wdXQgWUFNTCBzdHJpbmdcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddICBBIGNsZWFuZWQgdXAgWUFNTCBzdHJpbmdcbiAgICAjXG4gICAgY2xlYW51cDogKHZhbHVlKSAtPlxuICAgICAgICBpZiB2YWx1ZS5pbmRleE9mKFwiXFxyXCIpIGlzbnQgLTFcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUuc3BsaXQoXCJcXHJcXG5cIikuam9pbihcIlxcblwiKS5zcGxpdChcIlxcclwiKS5qb2luKFwiXFxuXCIpXG5cbiAgICAgICAgIyBTdHJpcCBZQU1MIGhlYWRlclxuICAgICAgICBjb3VudCA9IDBcbiAgICAgICAgW3ZhbHVlLCBjb3VudF0gPSBAUEFUVEVSTl9ZQU1MX0hFQURFUi5yZXBsYWNlQWxsIHZhbHVlLCAnJ1xuICAgICAgICBAb2Zmc2V0ICs9IGNvdW50XG5cbiAgICAgICAgIyBSZW1vdmUgbGVhZGluZyBjb21tZW50c1xuICAgICAgICBbdHJpbW1lZFZhbHVlLCBjb3VudF0gPSBAUEFUVEVSTl9MRUFESU5HX0NPTU1FTlRTLnJlcGxhY2VBbGwgdmFsdWUsICcnLCAxXG4gICAgICAgIGlmIGNvdW50IGlzIDFcbiAgICAgICAgICAgICMgSXRlbXMgaGF2ZSBiZWVuIHJlbW92ZWQsIHVwZGF0ZSB0aGUgb2Zmc2V0XG4gICAgICAgICAgICBAb2Zmc2V0ICs9IFV0aWxzLnN1YlN0ckNvdW50KHZhbHVlLCBcIlxcblwiKSAtIFV0aWxzLnN1YlN0ckNvdW50KHRyaW1tZWRWYWx1ZSwgXCJcXG5cIilcbiAgICAgICAgICAgIHZhbHVlID0gdHJpbW1lZFZhbHVlXG5cbiAgICAgICAgIyBSZW1vdmUgc3RhcnQgb2YgdGhlIGRvY3VtZW50IG1hcmtlciAoLS0tKVxuICAgICAgICBbdHJpbW1lZFZhbHVlLCBjb3VudF0gPSBAUEFUVEVSTl9ET0NVTUVOVF9NQVJLRVJfU1RBUlQucmVwbGFjZUFsbCB2YWx1ZSwgJycsIDFcbiAgICAgICAgaWYgY291bnQgaXMgMVxuICAgICAgICAgICAgIyBJdGVtcyBoYXZlIGJlZW4gcmVtb3ZlZCwgdXBkYXRlIHRoZSBvZmZzZXRcbiAgICAgICAgICAgIEBvZmZzZXQgKz0gVXRpbHMuc3ViU3RyQ291bnQodmFsdWUsIFwiXFxuXCIpIC0gVXRpbHMuc3ViU3RyQ291bnQodHJpbW1lZFZhbHVlLCBcIlxcblwiKVxuICAgICAgICAgICAgdmFsdWUgPSB0cmltbWVkVmFsdWVcblxuICAgICAgICAgICAgIyBSZW1vdmUgZW5kIG9mIHRoZSBkb2N1bWVudCBtYXJrZXIgKC4uLilcbiAgICAgICAgICAgIHZhbHVlID0gQFBBVFRFUk5fRE9DVU1FTlRfTUFSS0VSX0VORC5yZXBsYWNlIHZhbHVlLCAnJ1xuXG4gICAgICAgIHJldHVybiB2YWx1ZVxuXG5cbiAgICAjIFJldHVybnMgdHJ1ZSBpZiB0aGUgbmV4dCBsaW5lIHN0YXJ0cyB1bmluZGVudGVkIGNvbGxlY3Rpb25cbiAgICAjXG4gICAgIyBAcmV0dXJuIFtCb29sZWFuXSAgICAgUmV0dXJucyB0cnVlIGlmIHRoZSBuZXh0IGxpbmUgc3RhcnRzIHVuaW5kZW50ZWQgY29sbGVjdGlvbiwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgI1xuICAgIGlzTmV4dExpbmVVbkluZGVudGVkQ29sbGVjdGlvbjogKGN1cnJlbnRJbmRlbnRhdGlvbiA9IG51bGwpIC0+XG4gICAgICAgIGN1cnJlbnRJbmRlbnRhdGlvbiA/PSBAZ2V0Q3VycmVudExpbmVJbmRlbnRhdGlvbigpXG4gICAgICAgIG5vdEVPRiA9IEBtb3ZlVG9OZXh0TGluZSgpXG5cbiAgICAgICAgd2hpbGUgbm90RU9GIGFuZCBAaXNDdXJyZW50TGluZUVtcHR5KClcbiAgICAgICAgICAgIG5vdEVPRiA9IEBtb3ZlVG9OZXh0TGluZSgpXG5cbiAgICAgICAgaWYgZmFsc2UgaXMgbm90RU9GXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICAgICByZXQgPSBmYWxzZVxuICAgICAgICBpZiBAZ2V0Q3VycmVudExpbmVJbmRlbnRhdGlvbigpIGlzIGN1cnJlbnRJbmRlbnRhdGlvbiBhbmQgQGlzU3RyaW5nVW5JbmRlbnRlZENvbGxlY3Rpb25JdGVtKEBjdXJyZW50TGluZSlcbiAgICAgICAgICAgIHJldCA9IHRydWVcblxuICAgICAgICBAbW92ZVRvUHJldmlvdXNMaW5lKClcblxuICAgICAgICByZXR1cm4gcmV0XG5cblxuICAgICMgUmV0dXJucyB0cnVlIGlmIHRoZSBzdHJpbmcgaXMgdW4taW5kZW50ZWQgY29sbGVjdGlvbiBpdGVtXG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gICAgIFJldHVybnMgdHJ1ZSBpZiB0aGUgc3RyaW5nIGlzIHVuLWluZGVudGVkIGNvbGxlY3Rpb24gaXRlbSwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgI1xuICAgIGlzU3RyaW5nVW5JbmRlbnRlZENvbGxlY3Rpb25JdGVtOiAtPlxuICAgICAgICByZXR1cm4gQGN1cnJlbnRMaW5lIGlzICctJyBvciBAY3VycmVudExpbmVbMC4uLjJdIGlzICctICdcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnNlclxuIiwiXG4jIFBhdHRlcm4gaXMgYSB6ZXJvLWNvbmZsaWN0IHdyYXBwZXIgZXh0ZW5kaW5nIFJlZ0V4cCBmZWF0dXJlc1xuIyBpbiBvcmRlciB0byBtYWtlIFlBTUwgcGFyc2luZyByZWdleCBtb3JlIGV4cHJlc3NpdmUuXG4jXG5jbGFzcyBQYXR0ZXJuXG5cbiAgICAjIEBwcm9wZXJ0eSBbUmVnRXhwXSBUaGUgUmVnRXhwIGluc3RhbmNlXG4gICAgcmVnZXg6ICAgICAgICAgIG51bGxcblxuICAgICMgQHByb3BlcnR5IFtTdHJpbmddIFRoZSByYXcgcmVnZXggc3RyaW5nXG4gICAgcmF3UmVnZXg6ICAgICAgIG51bGxcblxuICAgICMgQHByb3BlcnR5IFtTdHJpbmddIFRoZSBjbGVhbmVkIHJlZ2V4IHN0cmluZyAodXNlZCB0byBjcmVhdGUgdGhlIFJlZ0V4cCBpbnN0YW5jZSlcbiAgICBjbGVhbmVkUmVnZXg6ICAgbnVsbFxuXG4gICAgIyBAcHJvcGVydHkgW09iamVjdF0gVGhlIGRpY3Rpb25hcnkgbWFwcGluZyBuYW1lcyB0byBjYXB0dXJpbmcgYnJhY2tldCBudW1iZXJzXG4gICAgbWFwcGluZzogICAgICAgIG51bGxcblxuICAgICMgQ29uc3RydWN0b3JcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gcmF3UmVnZXggVGhlIHJhdyByZWdleCBzdHJpbmcgZGVmaW5pbmcgdGhlIHBhdHRlcm5cbiAgICAjXG4gICAgY29uc3RydWN0b3I6IChyYXdSZWdleCwgbW9kaWZpZXJzID0gJycpIC0+XG4gICAgICAgIGNsZWFuZWRSZWdleCA9ICcnXG4gICAgICAgIGxlbiA9IHJhd1JlZ2V4Lmxlbmd0aFxuICAgICAgICBtYXBwaW5nID0gbnVsbFxuXG4gICAgICAgICMgQ2xlYW51cCByYXcgcmVnZXggYW5kIGNvbXB1dGUgbWFwcGluZ1xuICAgICAgICBjYXB0dXJpbmdCcmFja2V0TnVtYmVyID0gMFxuICAgICAgICBpID0gMFxuICAgICAgICB3aGlsZSBpIDwgbGVuXG4gICAgICAgICAgICBjaGFyID0gcmF3UmVnZXguY2hhckF0KGkpXG4gICAgICAgICAgICBpZiBjaGFyIGlzICdcXFxcJ1xuICAgICAgICAgICAgICAgICMgSWdub3JlIG5leHQgY2hhcmFjdGVyXG4gICAgICAgICAgICAgICAgY2xlYW5lZFJlZ2V4ICs9IHJhd1JlZ2V4W2kuLmkrMV1cbiAgICAgICAgICAgICAgICBpKytcbiAgICAgICAgICAgIGVsc2UgaWYgY2hhciBpcyAnKCdcbiAgICAgICAgICAgICAgICAjIEluY3JlYXNlIGJyYWNrZXQgbnVtYmVyLCBvbmx5IGlmIGl0IGlzIGNhcHR1cmluZ1xuICAgICAgICAgICAgICAgIGlmIGkgPCBsZW4gLSAyXG4gICAgICAgICAgICAgICAgICAgIHBhcnQgPSByYXdSZWdleFtpLi5pKzJdXG4gICAgICAgICAgICAgICAgICAgIGlmIHBhcnQgaXMgJyg/OidcbiAgICAgICAgICAgICAgICAgICAgICAgICMgTm9uLWNhcHR1cmluZyBicmFja2V0XG4gICAgICAgICAgICAgICAgICAgICAgICBpICs9IDJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFuZWRSZWdleCArPSBwYXJ0XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgcGFydCBpcyAnKD88J1xuICAgICAgICAgICAgICAgICAgICAgICAgIyBDYXB0dXJpbmcgYnJhY2tldCB3aXRoIHBvc3NpYmx5IGEgbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgY2FwdHVyaW5nQnJhY2tldE51bWJlcisrXG4gICAgICAgICAgICAgICAgICAgICAgICBpICs9IDJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgaSArIDEgPCBsZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJDaGFyID0gcmF3UmVnZXguY2hhckF0KGkgKyAxKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHN1YkNoYXIgaXMgJz4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFuZWRSZWdleCArPSAnKCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5hbWUubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBBc3NvY2lhdGUgYSBuYW1lIHdpdGggYSBjYXB0dXJpbmcgYnJhY2tldCBudW1iZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcHBpbmcgPz0ge31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcHBpbmdbbmFtZV0gPSBjYXB0dXJpbmdCcmFja2V0TnVtYmVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lICs9IHN1YkNoYXJcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhbmVkUmVnZXggKz0gY2hhclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FwdHVyaW5nQnJhY2tldE51bWJlcisrXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBjbGVhbmVkUmVnZXggKz0gY2hhclxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGNsZWFuZWRSZWdleCArPSBjaGFyXG5cbiAgICAgICAgICAgIGkrK1xuXG4gICAgICAgIEByYXdSZWdleCA9IHJhd1JlZ2V4XG4gICAgICAgIEBjbGVhbmVkUmVnZXggPSBjbGVhbmVkUmVnZXhcbiAgICAgICAgQHJlZ2V4ID0gbmV3IFJlZ0V4cCBAY2xlYW5lZFJlZ2V4LCAnZycrbW9kaWZpZXJzLnJlcGxhY2UoJ2cnLCAnJylcbiAgICAgICAgQG1hcHBpbmcgPSBtYXBwaW5nXG5cblxuICAgICMgRXhlY3V0ZXMgdGhlIHBhdHRlcm4ncyByZWdleCBhbmQgcmV0dXJucyB0aGUgbWF0Y2hpbmcgdmFsdWVzXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddIHN0ciBUaGUgc3RyaW5nIHRvIHVzZSB0byBleGVjdXRlIHRoZSBwYXR0ZXJuXG4gICAgI1xuICAgICMgQHJldHVybiBbQXJyYXldIFRoZSBtYXRjaGluZyB2YWx1ZXMgZXh0cmFjdGVkIGZyb20gY2FwdHVyaW5nIGJyYWNrZXRzIG9yIG51bGwgaWYgbm90aGluZyBtYXRjaGVkXG4gICAgI1xuICAgIGV4ZWM6IChzdHIpIC0+XG4gICAgICAgIEByZWdleC5sYXN0SW5kZXggPSAwXG4gICAgICAgIG1hdGNoZXMgPSBAcmVnZXguZXhlYyBzdHJcblxuICAgICAgICBpZiBub3QgbWF0Y2hlcz9cbiAgICAgICAgICAgIHJldHVybiBudWxsXG5cbiAgICAgICAgaWYgQG1hcHBpbmc/XG4gICAgICAgICAgICBmb3IgbmFtZSwgaW5kZXggb2YgQG1hcHBpbmdcbiAgICAgICAgICAgICAgICBtYXRjaGVzW25hbWVdID0gbWF0Y2hlc1tpbmRleF1cblxuICAgICAgICByZXR1cm4gbWF0Y2hlc1xuXG5cbiAgICAjIFRlc3RzIHRoZSBwYXR0ZXJuJ3MgcmVnZXhcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gc3RyIFRoZSBzdHJpbmcgdG8gdXNlIHRvIHRlc3QgdGhlIHBhdHRlcm5cbiAgICAjXG4gICAgIyBAcmV0dXJuIFtCb29sZWFuXSB0cnVlIGlmIHRoZSBzdHJpbmcgbWF0Y2hlZFxuICAgICNcbiAgICB0ZXN0OiAoc3RyKSAtPlxuICAgICAgICBAcmVnZXgubGFzdEluZGV4ID0gMFxuICAgICAgICByZXR1cm4gQHJlZ2V4LnRlc3Qgc3RyXG5cblxuICAgICMgUmVwbGFjZXMgb2NjdXJlbmNlcyBtYXRjaGluZyB3aXRoIHRoZSBwYXR0ZXJuJ3MgcmVnZXggd2l0aCByZXBsYWNlbWVudFxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSBzdHIgVGhlIHNvdXJjZSBzdHJpbmcgdG8gcGVyZm9ybSByZXBsYWNlbWVudHNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSByZXBsYWNlbWVudCBUaGUgc3RyaW5nIHRvIHVzZSBpbiBwbGFjZSBvZiBlYWNoIHJlcGxhY2VkIG9jY3VyZW5jZS5cbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddIFRoZSByZXBsYWNlZCBzdHJpbmdcbiAgICAjXG4gICAgcmVwbGFjZTogKHN0ciwgcmVwbGFjZW1lbnQpIC0+XG4gICAgICAgIEByZWdleC5sYXN0SW5kZXggPSAwXG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZSBAcmVnZXgsIHJlcGxhY2VtZW50XG5cblxuICAgICMgUmVwbGFjZXMgb2NjdXJlbmNlcyBtYXRjaGluZyB3aXRoIHRoZSBwYXR0ZXJuJ3MgcmVnZXggd2l0aCByZXBsYWNlbWVudCBhbmRcbiAgICAjIGdldCBib3RoIHRoZSByZXBsYWNlZCBzdHJpbmcgYW5kIHRoZSBudW1iZXIgb2YgcmVwbGFjZWQgb2NjdXJlbmNlcyBpbiB0aGUgc3RyaW5nLlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSBzdHIgVGhlIHNvdXJjZSBzdHJpbmcgdG8gcGVyZm9ybSByZXBsYWNlbWVudHNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSByZXBsYWNlbWVudCBUaGUgc3RyaW5nIHRvIHVzZSBpbiBwbGFjZSBvZiBlYWNoIHJlcGxhY2VkIG9jY3VyZW5jZS5cbiAgICAjIEBwYXJhbSBbSW50ZWdlcl0gbGltaXQgVGhlIG1heGltdW0gbnVtYmVyIG9mIG9jY3VyZW5jZXMgdG8gcmVwbGFjZSAoMCBtZWFucyBpbmZpbml0ZSBudW1iZXIgb2Ygb2NjdXJlbmNlcylcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtBcnJheV0gQSBkZXN0cnVjdHVyYWJsZSBhcnJheSBjb250YWluaW5nIHRoZSByZXBsYWNlZCBzdHJpbmcgYW5kIHRoZSBudW1iZXIgb2YgcmVwbGFjZWQgb2NjdXJlbmNlcy4gRm9yIGluc3RhbmNlOiBbXCJteSByZXBsYWNlZCBzdHJpbmdcIiwgMl1cbiAgICAjXG4gICAgcmVwbGFjZUFsbDogKHN0ciwgcmVwbGFjZW1lbnQsIGxpbWl0ID0gMCkgLT5cbiAgICAgICAgQHJlZ2V4Lmxhc3RJbmRleCA9IDBcbiAgICAgICAgY291bnQgPSAwXG4gICAgICAgIHdoaWxlIEByZWdleC50ZXN0KHN0cikgYW5kIChsaW1pdCBpcyAwIG9yIGNvdW50IDwgbGltaXQpXG4gICAgICAgICAgICBAcmVnZXgubGFzdEluZGV4ID0gMFxuICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UgQHJlZ2V4LCAnJ1xuICAgICAgICAgICAgY291bnQrK1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIFtzdHIsIGNvdW50XVxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGF0dGVyblxuXG4iLCJcblV0aWxzICAgPSByZXF1aXJlICcuL1V0aWxzJ1xuUGF0dGVybiA9IHJlcXVpcmUgJy4vUGF0dGVybidcblxuIyBVbmVzY2FwZXIgZW5jYXBzdWxhdGVzIHVuZXNjYXBpbmcgcnVsZXMgZm9yIHNpbmdsZSBhbmQgZG91YmxlLXF1b3RlZCBZQU1MIHN0cmluZ3MuXG4jXG5jbGFzcyBVbmVzY2FwZXJcblxuICAgICMgUmVnZXggZnJhZ21lbnQgdGhhdCBtYXRjaGVzIGFuIGVzY2FwZWQgY2hhcmFjdGVyIGluXG4gICAgIyBhIGRvdWJsZSBxdW90ZWQgc3RyaW5nLlxuICAgIEBQQVRURVJOX0VTQ0FQRURfQ0hBUkFDVEVSOiAgICAgbmV3IFBhdHRlcm4gJ1xcXFxcXFxcKFswYWJ0XFx0bnZmcmUgXCJcXFxcL1xcXFxcXFxcTl9MUF18eFswLTlhLWZBLUZdezJ9fHVbMC05YS1mQS1GXXs0fXxVWzAtOWEtZkEtRl17OH0pJztcblxuXG4gICAgIyBVbmVzY2FwZXMgYSBzaW5nbGUgcXVvdGVkIHN0cmluZy5cbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICAgICAgdmFsdWUgQSBzaW5nbGUgcXVvdGVkIHN0cmluZy5cbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddICAgICAgVGhlIHVuZXNjYXBlZCBzdHJpbmcuXG4gICAgI1xuICAgIEB1bmVzY2FwZVNpbmdsZVF1b3RlZFN0cmluZzogKHZhbHVlKSAtPlxuICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgnXFwnXFwnJywgJ1xcJycpXG5cblxuICAgICMgVW5lc2NhcGVzIGEgZG91YmxlIHF1b3RlZCBzdHJpbmcuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgICAgIHZhbHVlIEEgZG91YmxlIHF1b3RlZCBzdHJpbmcuXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgICAgIFRoZSB1bmVzY2FwZWQgc3RyaW5nLlxuICAgICNcbiAgICBAdW5lc2NhcGVEb3VibGVRdW90ZWRTdHJpbmc6ICh2YWx1ZSkgLT5cbiAgICAgICAgQF91bmVzY2FwZUNhbGxiYWNrID89IChzdHIpID0+XG4gICAgICAgICAgICByZXR1cm4gQHVuZXNjYXBlQ2hhcmFjdGVyKHN0cilcblxuICAgICAgICAjIEV2YWx1YXRlIHRoZSBzdHJpbmdcbiAgICAgICAgcmV0dXJuIEBQQVRURVJOX0VTQ0FQRURfQ0hBUkFDVEVSLnJlcGxhY2UgdmFsdWUsIEBfdW5lc2NhcGVDYWxsYmFja1xuXG5cbiAgICAjIFVuZXNjYXBlcyBhIGNoYXJhY3RlciB0aGF0IHdhcyBmb3VuZCBpbiBhIGRvdWJsZS1xdW90ZWQgc3RyaW5nXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgICAgIHZhbHVlIEFuIGVzY2FwZWQgY2hhcmFjdGVyXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgICAgIFRoZSB1bmVzY2FwZWQgY2hhcmFjdGVyXG4gICAgI1xuICAgIEB1bmVzY2FwZUNoYXJhY3RlcjogKHZhbHVlKSAtPlxuICAgICAgICBjaCA9IFN0cmluZy5mcm9tQ2hhckNvZGVcbiAgICAgICAgc3dpdGNoIHZhbHVlLmNoYXJBdCgxKVxuICAgICAgICAgICAgd2hlbiAnMCdcbiAgICAgICAgICAgICAgICByZXR1cm4gY2goMClcbiAgICAgICAgICAgIHdoZW4gJ2EnXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoKDcpXG4gICAgICAgICAgICB3aGVuICdiJ1xuICAgICAgICAgICAgICAgIHJldHVybiBjaCg4KVxuICAgICAgICAgICAgd2hlbiAndCdcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJcXHRcIlxuICAgICAgICAgICAgd2hlbiBcIlxcdFwiXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiXFx0XCJcbiAgICAgICAgICAgIHdoZW4gJ24nXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiXFxuXCJcbiAgICAgICAgICAgIHdoZW4gJ3YnXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoKDExKVxuICAgICAgICAgICAgd2hlbiAnZidcbiAgICAgICAgICAgICAgICByZXR1cm4gY2goMTIpXG4gICAgICAgICAgICB3aGVuICdyJ1xuICAgICAgICAgICAgICAgIHJldHVybiBjaCgxMylcbiAgICAgICAgICAgIHdoZW4gJ2UnXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoKDI3KVxuICAgICAgICAgICAgd2hlbiAnICdcbiAgICAgICAgICAgICAgICByZXR1cm4gJyAnXG4gICAgICAgICAgICB3aGVuICdcIidcbiAgICAgICAgICAgICAgICByZXR1cm4gJ1wiJ1xuICAgICAgICAgICAgd2hlbiAnLydcbiAgICAgICAgICAgICAgICByZXR1cm4gJy8nXG4gICAgICAgICAgICB3aGVuICdcXFxcJ1xuICAgICAgICAgICAgICAgIHJldHVybiAnXFxcXCdcbiAgICAgICAgICAgIHdoZW4gJ04nXG4gICAgICAgICAgICAgICAgIyBVKzAwODUgTkVYVCBMSU5FXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoKDB4MDA4NSlcbiAgICAgICAgICAgIHdoZW4gJ18nXG4gICAgICAgICAgICAgICAgIyBVKzAwQTAgTk8tQlJFQUsgU1BBQ0VcbiAgICAgICAgICAgICAgICByZXR1cm4gY2goMHgwMEEwKVxuICAgICAgICAgICAgd2hlbiAnTCdcbiAgICAgICAgICAgICAgICAjIFUrMjAyOCBMSU5FIFNFUEFSQVRPUlxuICAgICAgICAgICAgICAgIHJldHVybiBjaCgweDIwMjgpXG4gICAgICAgICAgICB3aGVuICdQJ1xuICAgICAgICAgICAgICAgICMgVSsyMDI5IFBBUkFHUkFQSCBTRVBBUkFUT1JcbiAgICAgICAgICAgICAgICByZXR1cm4gY2goMHgyMDI5KVxuICAgICAgICAgICAgd2hlbiAneCdcbiAgICAgICAgICAgICAgICByZXR1cm4gVXRpbHMudXRmOGNocihVdGlscy5oZXhEZWModmFsdWUuc3Vic3RyKDIsIDIpKSlcbiAgICAgICAgICAgIHdoZW4gJ3UnXG4gICAgICAgICAgICAgICAgcmV0dXJuIFV0aWxzLnV0ZjhjaHIoVXRpbHMuaGV4RGVjKHZhbHVlLnN1YnN0cigyLCA0KSkpXG4gICAgICAgICAgICB3aGVuICdVJ1xuICAgICAgICAgICAgICAgIHJldHVybiBVdGlscy51dGY4Y2hyKFV0aWxzLmhleERlYyh2YWx1ZS5zdWJzdHIoMiwgOCkpKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiAnJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFVuZXNjYXBlclxuIiwiXG5QYXR0ZXJuID0gcmVxdWlyZSAnLi9QYXR0ZXJuJ1xuXG4jIEEgYnVuY2ggb2YgdXRpbGl0eSBtZXRob2RzXG4jXG5jbGFzcyBVdGlsc1xuXG4gICAgQFJFR0VYX0xFRlRfVFJJTV9CWV9DSEFSOiAgIHt9XG4gICAgQFJFR0VYX1JJR0hUX1RSSU1fQllfQ0hBUjogIHt9XG4gICAgQFJFR0VYX1NQQUNFUzogICAgICAgICAgICAgIC9cXHMrL2dcbiAgICBAUkVHRVhfRElHSVRTOiAgICAgICAgICAgICAgL15cXGQrJC9cbiAgICBAUkVHRVhfT0NUQUw6ICAgICAgICAgICAgICAgL1teMC03XS9naVxuICAgIEBSRUdFWF9IRVhBREVDSU1BTDogICAgICAgICAvW15hLWYwLTldL2dpXG5cbiAgICAjIFByZWNvbXBpbGVkIGRhdGUgcGF0dGVyblxuICAgIEBQQVRURVJOX0RBVEU6ICAgICAgICAgICAgICBuZXcgUGF0dGVybiAnXicrXG4gICAgICAgICAgICAnKD88eWVhcj5bMC05XVswLTldWzAtOV1bMC05XSknK1xuICAgICAgICAgICAgJy0oPzxtb250aD5bMC05XVswLTldPyknK1xuICAgICAgICAgICAgJy0oPzxkYXk+WzAtOV1bMC05XT8pJytcbiAgICAgICAgICAgICcoPzooPzpbVHRdfFsgXFx0XSspJytcbiAgICAgICAgICAgICcoPzxob3VyPlswLTldWzAtOV0/KScrXG4gICAgICAgICAgICAnOig/PG1pbnV0ZT5bMC05XVswLTldKScrXG4gICAgICAgICAgICAnOig/PHNlY29uZD5bMC05XVswLTldKScrXG4gICAgICAgICAgICAnKD86XFwuKD88ZnJhY3Rpb24+WzAtOV0qKSk/JytcbiAgICAgICAgICAgICcoPzpbIFxcdF0qKD88dHo+WnwoPzx0el9zaWduPlstK10pKD88dHpfaG91cj5bMC05XVswLTldPyknK1xuICAgICAgICAgICAgJyg/OjooPzx0el9taW51dGU+WzAtOV1bMC05XSkpPykpPyk/JytcbiAgICAgICAgICAgICckJywgJ2knXG5cbiAgICAjIExvY2FsIHRpbWV6b25lIG9mZnNldCBpbiBtc1xuICAgIEBMT0NBTF9USU1FWk9ORV9PRkZTRVQ6ICAgICBuZXcgRGF0ZSgpLmdldFRpbWV6b25lT2Zmc2V0KCkgKiA2MCAqIDEwMDBcblxuICAgICMgVHJpbXMgdGhlIGdpdmVuIHN0cmluZyBvbiBib3RoIHNpZGVzXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddIHN0ciBUaGUgc3RyaW5nIHRvIHRyaW1cbiAgICAjIEBwYXJhbSBbU3RyaW5nXSBjaGFyIFRoZSBjaGFyYWN0ZXIgdG8gdXNlIGZvciB0cmltbWluZyAoZGVmYXVsdDogJ1xcXFxzJylcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddIEEgdHJpbW1lZCBzdHJpbmdcbiAgICAjXG4gICAgQHRyaW06IChzdHIsIGNoYXIgPSAnXFxcXHMnKSAtPlxuICAgICAgICByZXR1cm4gc3RyLnRyaW0oKVxuICAgICAgICByZWdleExlZnQgPSBAUkVHRVhfTEVGVF9UUklNX0JZX0NIQVJbY2hhcl1cbiAgICAgICAgdW5sZXNzIHJlZ2V4TGVmdD9cbiAgICAgICAgICAgIEBSRUdFWF9MRUZUX1RSSU1fQllfQ0hBUltjaGFyXSA9IHJlZ2V4TGVmdCA9IG5ldyBSZWdFeHAgJ14nK2NoYXIrJycrY2hhcisnKidcbiAgICAgICAgcmVnZXhMZWZ0Lmxhc3RJbmRleCA9IDBcbiAgICAgICAgcmVnZXhSaWdodCA9IEBSRUdFWF9SSUdIVF9UUklNX0JZX0NIQVJbY2hhcl1cbiAgICAgICAgdW5sZXNzIHJlZ2V4UmlnaHQ/XG4gICAgICAgICAgICBAUkVHRVhfUklHSFRfVFJJTV9CWV9DSEFSW2NoYXJdID0gcmVnZXhSaWdodCA9IG5ldyBSZWdFeHAgY2hhcisnJytjaGFyKycqJCdcbiAgICAgICAgcmVnZXhSaWdodC5sYXN0SW5kZXggPSAwXG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZShyZWdleExlZnQsICcnKS5yZXBsYWNlKHJlZ2V4UmlnaHQsICcnKVxuXG5cbiAgICAjIFRyaW1zIHRoZSBnaXZlbiBzdHJpbmcgb24gdGhlIGxlZnQgc2lkZVxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSBzdHIgVGhlIHN0cmluZyB0byB0cmltXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gY2hhciBUaGUgY2hhcmFjdGVyIHRvIHVzZSBmb3IgdHJpbW1pbmcgKGRlZmF1bHQ6ICdcXFxccycpXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSBBIHRyaW1tZWQgc3RyaW5nXG4gICAgI1xuICAgIEBsdHJpbTogKHN0ciwgY2hhciA9ICdcXFxccycpIC0+XG4gICAgICAgIHJlZ2V4TGVmdCA9IEBSRUdFWF9MRUZUX1RSSU1fQllfQ0hBUltjaGFyXVxuICAgICAgICB1bmxlc3MgcmVnZXhMZWZ0P1xuICAgICAgICAgICAgQFJFR0VYX0xFRlRfVFJJTV9CWV9DSEFSW2NoYXJdID0gcmVnZXhMZWZ0ID0gbmV3IFJlZ0V4cCAnXicrY2hhcisnJytjaGFyKycqJ1xuICAgICAgICByZWdleExlZnQubGFzdEluZGV4ID0gMFxuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UocmVnZXhMZWZ0LCAnJylcblxuXG4gICAgIyBUcmltcyB0aGUgZ2l2ZW4gc3RyaW5nIG9uIHRoZSByaWdodCBzaWRlXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddIHN0ciBUaGUgc3RyaW5nIHRvIHRyaW1cbiAgICAjIEBwYXJhbSBbU3RyaW5nXSBjaGFyIFRoZSBjaGFyYWN0ZXIgdG8gdXNlIGZvciB0cmltbWluZyAoZGVmYXVsdDogJ1xcXFxzJylcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddIEEgdHJpbW1lZCBzdHJpbmdcbiAgICAjXG4gICAgQHJ0cmltOiAoc3RyLCBjaGFyID0gJ1xcXFxzJykgLT5cbiAgICAgICAgcmVnZXhSaWdodCA9IEBSRUdFWF9SSUdIVF9UUklNX0JZX0NIQVJbY2hhcl1cbiAgICAgICAgdW5sZXNzIHJlZ2V4UmlnaHQ/XG4gICAgICAgICAgICBAUkVHRVhfUklHSFRfVFJJTV9CWV9DSEFSW2NoYXJdID0gcmVnZXhSaWdodCA9IG5ldyBSZWdFeHAgY2hhcisnJytjaGFyKycqJCdcbiAgICAgICAgcmVnZXhSaWdodC5sYXN0SW5kZXggPSAwXG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZShyZWdleFJpZ2h0LCAnJylcblxuXG4gICAgIyBDaGVja3MgaWYgdGhlIGdpdmVuIHZhbHVlIGlzIGVtcHR5IChudWxsLCB1bmRlZmluZWQsIGVtcHR5IHN0cmluZywgc3RyaW5nICcwJylcbiAgICAjXG4gICAgIyBAcGFyYW0gW09iamVjdF0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrXG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gdHJ1ZSBpZiB0aGUgdmFsdWUgaXMgZW1wdHlcbiAgICAjXG4gICAgQGlzRW1wdHk6ICh2YWx1ZSkgLT5cbiAgICAgICAgcmV0dXJuIG5vdCh2YWx1ZSkgb3IgdmFsdWUgaXMgJycgb3IgdmFsdWUgaXMgJzAnXG5cblxuICAgICMgQ291bnRzIHRoZSBudW1iZXIgb2Ygb2NjdXJlbmNlcyBvZiBzdWJTdHJpbmcgaW5zaWRlIHN0cmluZ1xuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSBzdHJpbmcgVGhlIHN0cmluZyB3aGVyZSB0byBjb3VudCBvY2N1cmVuY2VzXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gc3ViU3RyaW5nIFRoZSBzdWJTdHJpbmcgdG8gY291bnRcbiAgICAjIEBwYXJhbSBbSW50ZWdlcl0gc3RhcnQgVGhlIHN0YXJ0IGluZGV4XG4gICAgIyBAcGFyYW0gW0ludGVnZXJdIGxlbmd0aCBUaGUgc3RyaW5nIGxlbmd0aCB1bnRpbCB3aGVyZSB0byBjb3VudFxuICAgICNcbiAgICAjIEByZXR1cm4gW0ludGVnZXJdIFRoZSBudW1iZXIgb2Ygb2NjdXJlbmNlc1xuICAgICNcbiAgICBAc3ViU3RyQ291bnQ6IChzdHJpbmcsIHN1YlN0cmluZywgc3RhcnQsIGxlbmd0aCkgLT5cbiAgICAgICAgYyA9IDBcbiAgICAgICAgXG4gICAgICAgIHN0cmluZyA9ICcnICsgc3RyaW5nXG4gICAgICAgIHN1YlN0cmluZyA9ICcnICsgc3ViU3RyaW5nXG4gICAgICAgIFxuICAgICAgICBpZiBzdGFydD9cbiAgICAgICAgICAgIHN0cmluZyA9IHN0cmluZ1tzdGFydC4uXVxuICAgICAgICBpZiBsZW5ndGg/XG4gICAgICAgICAgICBzdHJpbmcgPSBzdHJpbmdbMC4uLmxlbmd0aF1cbiAgICAgICAgXG4gICAgICAgIGxlbiA9IHN0cmluZy5sZW5ndGhcbiAgICAgICAgc3VibGVuID0gc3ViU3RyaW5nLmxlbmd0aFxuICAgICAgICBmb3IgaSBpbiBbMC4uLmxlbl1cbiAgICAgICAgICAgIGlmIHN1YlN0cmluZyBpcyBzdHJpbmdbaS4uLnN1Ymxlbl1cbiAgICAgICAgICAgICAgICBjKytcbiAgICAgICAgICAgICAgICBpICs9IHN1YmxlbiAtIDFcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBjXG5cblxuICAgICMgUmV0dXJucyB0cnVlIGlmIGlucHV0IGlzIG9ubHkgY29tcG9zZWQgb2YgZGlnaXRzXG4gICAgI1xuICAgICMgQHBhcmFtIFtPYmplY3RdIGlucHV0IFRoZSB2YWx1ZSB0byB0ZXN0XG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gdHJ1ZSBpZiBpbnB1dCBpcyBvbmx5IGNvbXBvc2VkIG9mIGRpZ2l0c1xuICAgICNcbiAgICBAaXNEaWdpdHM6IChpbnB1dCkgLT5cbiAgICAgICAgQFJFR0VYX0RJR0lUUy5sYXN0SW5kZXggPSAwXG4gICAgICAgIHJldHVybiBAUkVHRVhfRElHSVRTLnRlc3QgaW5wdXRcblxuXG4gICAgIyBEZWNvZGUgb2N0YWwgdmFsdWVcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gaW5wdXQgVGhlIHZhbHVlIHRvIGRlY29kZVxuICAgICNcbiAgICAjIEByZXR1cm4gW0ludGVnZXJdIFRoZSBkZWNvZGVkIHZhbHVlXG4gICAgI1xuICAgIEBvY3REZWM6IChpbnB1dCkgLT5cbiAgICAgICAgQFJFR0VYX09DVEFMLmxhc3RJbmRleCA9IDBcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KChpbnB1dCsnJykucmVwbGFjZShAUkVHRVhfT0NUQUwsICcnKSwgOClcblxuXG4gICAgIyBEZWNvZGUgaGV4YWRlY2ltYWwgdmFsdWVcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gaW5wdXQgVGhlIHZhbHVlIHRvIGRlY29kZVxuICAgICNcbiAgICAjIEByZXR1cm4gW0ludGVnZXJdIFRoZSBkZWNvZGVkIHZhbHVlXG4gICAgI1xuICAgIEBoZXhEZWM6IChpbnB1dCkgLT5cbiAgICAgICAgQFJFR0VYX0hFWEFERUNJTUFMLmxhc3RJbmRleCA9IDBcbiAgICAgICAgaW5wdXQgPSBAdHJpbShpbnB1dClcbiAgICAgICAgaWYgKGlucHV0KycnKVswLi4uMl0gaXMgJzB4JyB0aGVuIGlucHV0ID0gKGlucHV0KycnKVsyLi5dXG4gICAgICAgIHJldHVybiBwYXJzZUludCgoaW5wdXQrJycpLnJlcGxhY2UoQFJFR0VYX0hFWEFERUNJTUFMLCAnJyksIDE2KVxuXG5cbiAgICAjIEdldCB0aGUgVVRGLTggY2hhcmFjdGVyIGZvciB0aGUgZ2l2ZW4gY29kZSBwb2ludC5cbiAgICAjXG4gICAgIyBAcGFyYW0gW0ludGVnZXJdIGMgVGhlIHVuaWNvZGUgY29kZSBwb2ludFxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gVGhlIGNvcnJlc3BvbmRpbmcgVVRGLTggY2hhcmFjdGVyXG4gICAgI1xuICAgIEB1dGY4Y2hyOiAoYykgLT5cbiAgICAgICAgY2ggPSBTdHJpbmcuZnJvbUNoYXJDb2RlXG4gICAgICAgIGlmIDB4ODAgPiAoYyAlPSAweDIwMDAwMClcbiAgICAgICAgICAgIHJldHVybiBjaChjKVxuICAgICAgICBpZiAweDgwMCA+IGNcbiAgICAgICAgICAgIHJldHVybiBjaCgweEMwIHwgYz4+NikgKyBjaCgweDgwIHwgYyAmIDB4M0YpXG4gICAgICAgIGlmIDB4MTAwMDAgPiBjXG4gICAgICAgICAgICByZXR1cm4gY2goMHhFMCB8IGM+PjEyKSArIGNoKDB4ODAgfCBjPj42ICYgMHgzRikgKyBjaCgweDgwIHwgYyAmIDB4M0YpXG5cbiAgICAgICAgcmV0dXJuIGNoKDB4RjAgfCBjPj4xOCkgKyBjaCgweDgwIHwgYz4+MTIgJiAweDNGKSArIGNoKDB4ODAgfCBjPj42ICYgMHgzRikgKyBjaCgweDgwIHwgYyAmIDB4M0YpXG5cblxuICAgICMgUmV0dXJucyB0aGUgYm9vbGVhbiB2YWx1ZSBlcXVpdmFsZW50IHRvIHRoZSBnaXZlbiBpbnB1dFxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nfE9iamVjdF0gICAgaW5wdXQgICAgICAgVGhlIGlucHV0IHZhbHVlXG4gICAgIyBAcGFyYW0gW0Jvb2xlYW5dICAgICAgICAgIHN0cmljdCAgICAgIElmIHNldCB0byBmYWxzZSwgYWNjZXB0ICd5ZXMnIGFuZCAnbm8nIGFzIGJvb2xlYW4gdmFsdWVzXG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gICAgICAgICB0aGUgYm9vbGVhbiB2YWx1ZVxuICAgICNcbiAgICBAcGFyc2VCb29sZWFuOiAoaW5wdXQsIHN0cmljdCA9IHRydWUpIC0+XG4gICAgICAgIGlmIHR5cGVvZihpbnB1dCkgaXMgJ3N0cmluZydcbiAgICAgICAgICAgIGxvd2VySW5wdXQgPSBpbnB1dC50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICBpZiBub3Qgc3RyaWN0XG4gICAgICAgICAgICAgICAgaWYgbG93ZXJJbnB1dCBpcyAnbm8nIHRoZW4gcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICBpZiBsb3dlcklucHV0IGlzICcwJyB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgaWYgbG93ZXJJbnB1dCBpcyAnZmFsc2UnIHRoZW4gcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICBpZiBsb3dlcklucHV0IGlzICcnIHRoZW4gcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICByZXR1cm4gISFpbnB1dFxuXG5cblxuICAgICMgUmV0dXJucyB0cnVlIGlmIGlucHV0IGlzIG51bWVyaWNcbiAgICAjXG4gICAgIyBAcGFyYW0gW09iamVjdF0gaW5wdXQgVGhlIHZhbHVlIHRvIHRlc3RcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtCb29sZWFuXSB0cnVlIGlmIGlucHV0IGlzIG51bWVyaWNcbiAgICAjXG4gICAgQGlzTnVtZXJpYzogKGlucHV0KSAtPlxuICAgICAgICBAUkVHRVhfU1BBQ0VTLmxhc3RJbmRleCA9IDBcbiAgICAgICAgcmV0dXJuIHR5cGVvZihpbnB1dCkgaXMgJ251bWJlcicgb3IgdHlwZW9mKGlucHV0KSBpcyAnc3RyaW5nJyBhbmQgIWlzTmFOKGlucHV0KSBhbmQgaW5wdXQucmVwbGFjZShAUkVHRVhfU1BBQ0VTLCAnJykgaXNudCAnJ1xuXG5cbiAgICAjIFJldHVybnMgYSBwYXJzZWQgZGF0ZSBmcm9tIHRoZSBnaXZlbiBzdHJpbmdcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gc3RyIFRoZSBkYXRlIHN0cmluZyB0byBwYXJzZVxuICAgICNcbiAgICAjIEByZXR1cm4gW0RhdGVdIFRoZSBwYXJzZWQgZGF0ZSBvciBudWxsIGlmIHBhcnNpbmcgZmFpbGVkXG4gICAgI1xuICAgIEBzdHJpbmdUb0RhdGU6IChzdHIpIC0+XG4gICAgICAgIHVubGVzcyBzdHI/Lmxlbmd0aFxuICAgICAgICAgICAgcmV0dXJuIG51bGxcblxuICAgICAgICAjIFBlcmZvcm0gcmVndWxhciBleHByZXNzaW9uIHBhdHRlcm5cbiAgICAgICAgaW5mbyA9IEBQQVRURVJOX0RBVEUuZXhlYyBzdHJcbiAgICAgICAgdW5sZXNzIGluZm9cbiAgICAgICAgICAgIHJldHVybiBudWxsXG5cbiAgICAgICAgIyBFeHRyYWN0IHllYXIsIG1vbnRoLCBkYXlcbiAgICAgICAgeWVhciA9IHBhcnNlSW50IGluZm8ueWVhciwgMTBcbiAgICAgICAgbW9udGggPSBwYXJzZUludChpbmZvLm1vbnRoLCAxMCkgLSAxICMgSW4gamF2YXNjcmlwdCwgamFudWFyeSBpcyAwLCBmZWJydWFyeSAxLCBldGMuLi5cbiAgICAgICAgZGF5ID0gcGFyc2VJbnQgaW5mby5kYXksIDEwXG5cbiAgICAgICAgIyBJZiBubyBob3VyIGlzIGdpdmVuLCByZXR1cm4gYSBkYXRlIHdpdGggZGF5IHByZWNpc2lvblxuICAgICAgICB1bmxlc3MgaW5mby5ob3VyP1xuICAgICAgICAgICAgZGF0ZSA9IG5ldyBEYXRlIERhdGUuVVRDKHllYXIsIG1vbnRoLCBkYXkpXG4gICAgICAgICAgICByZXR1cm4gZGF0ZVxuXG4gICAgICAgICMgRXh0cmFjdCBob3VyLCBtaW51dGUsIHNlY29uZFxuICAgICAgICBob3VyID0gcGFyc2VJbnQgaW5mby5ob3VyLCAxMFxuICAgICAgICBtaW51dGUgPSBwYXJzZUludCBpbmZvLm1pbnV0ZSwgMTBcbiAgICAgICAgc2Vjb25kID0gcGFyc2VJbnQgaW5mby5zZWNvbmQsIDEwXG5cbiAgICAgICAgIyBFeHRyYWN0IGZyYWN0aW9uLCBpZiBnaXZlblxuICAgICAgICBpZiBpbmZvLmZyYWN0aW9uP1xuICAgICAgICAgICAgZnJhY3Rpb24gPSBpbmZvLmZyYWN0aW9uWzAuLi4zXVxuICAgICAgICAgICAgd2hpbGUgZnJhY3Rpb24ubGVuZ3RoIDwgM1xuICAgICAgICAgICAgICAgIGZyYWN0aW9uICs9ICcwJ1xuICAgICAgICAgICAgZnJhY3Rpb24gPSBwYXJzZUludCBmcmFjdGlvbiwgMTBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZnJhY3Rpb24gPSAwXG5cbiAgICAgICAgIyBDb21wdXRlIHRpbWV6b25lIG9mZnNldCBpZiBnaXZlblxuICAgICAgICBpZiBpbmZvLnR6P1xuICAgICAgICAgICAgdHpfaG91ciA9IHBhcnNlSW50IGluZm8udHpfaG91ciwgMTBcbiAgICAgICAgICAgIGlmIGluZm8udHpfbWludXRlP1xuICAgICAgICAgICAgICAgIHR6X21pbnV0ZSA9IHBhcnNlSW50IGluZm8udHpfbWludXRlLCAxMFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHR6X21pbnV0ZSA9IDBcblxuICAgICAgICAgICAgIyBDb21wdXRlIHRpbWV6b25lIGRlbHRhIGluIG1zXG4gICAgICAgICAgICB0el9vZmZzZXQgPSAodHpfaG91ciAqIDYwICsgdHpfbWludXRlKSAqIDYwMDAwXG4gICAgICAgICAgICBpZiAnLScgaXMgaW5mby50el9zaWduXG4gICAgICAgICAgICAgICAgdHpfb2Zmc2V0ICo9IC0xXG5cbiAgICAgICAgIyBDb21wdXRlIGRhdGVcbiAgICAgICAgZGF0ZSA9IG5ldyBEYXRlIERhdGUuVVRDKHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBmcmFjdGlvbilcbiAgICAgICAgaWYgdHpfb2Zmc2V0XG4gICAgICAgICAgICBkYXRlLnNldFRpbWUgZGF0ZS5nZXRUaW1lKCkgKyB0el9vZmZzZXRcblxuICAgICAgICByZXR1cm4gZGF0ZVxuXG5cbiAgICAjIFJlcGVhdHMgdGhlIGdpdmVuIHN0cmluZyBhIG51bWJlciBvZiB0aW1lc1xuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIHN0ciAgICAgVGhlIHN0cmluZyB0byByZXBlYXRcbiAgICAjIEBwYXJhbSBbSW50ZWdlcl0gIG51bWJlciAgVGhlIG51bWJlciBvZiB0aW1lcyB0byByZXBlYXQgdGhlIHN0cmluZ1xuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIFRoZSByZXBlYXRlZCBzdHJpbmdcbiAgICAjXG4gICAgQHN0clJlcGVhdDogKHN0ciwgbnVtYmVyKSAtPlxuICAgICAgICByZXMgPSAnJ1xuICAgICAgICBpID0gMFxuICAgICAgICB3aGlsZSBpIDwgbnVtYmVyXG4gICAgICAgICAgICByZXMgKz0gc3RyXG4gICAgICAgICAgICBpKytcbiAgICAgICAgcmV0dXJuIHJlc1xuXG5cbiAgICAjIFJlYWRzIHRoZSBkYXRhIGZyb20gdGhlIGdpdmVuIGZpbGUgcGF0aCBhbmQgcmV0dXJucyB0aGUgcmVzdWx0IGFzIHN0cmluZ1xuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIHBhdGggICAgICAgIFRoZSBwYXRoIHRvIHRoZSBmaWxlXG4gICAgIyBAcGFyYW0gW0Z1bmN0aW9uXSBjYWxsYmFjayAgICBBIGNhbGxiYWNrIHRvIHJlYWQgZmlsZSBhc3luY2hyb25vdXNseSAob3B0aW9uYWwpXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgVGhlIHJlc3VsdGluZyBkYXRhIGFzIHN0cmluZ1xuICAgICNcbiAgICBAZ2V0U3RyaW5nRnJvbUZpbGU6IChwYXRoLCBjYWxsYmFjayA9IG51bGwpIC0+XG4gICAgICAgIHhociA9IG51bGxcbiAgICAgICAgaWYgd2luZG93P1xuICAgICAgICAgICAgaWYgd2luZG93LlhNTEh0dHBSZXF1ZXN0XG4gICAgICAgICAgICAgICAgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgICAgICAgICAgIGVsc2UgaWYgd2luZG93LkFjdGl2ZVhPYmplY3RcbiAgICAgICAgICAgICAgICBmb3IgbmFtZSBpbiBbXCJNc3htbDIuWE1MSFRUUC42LjBcIiwgXCJNc3htbDIuWE1MSFRUUC4zLjBcIiwgXCJNc3htbDIuWE1MSFRUUFwiLCBcIk1pY3Jvc29mdC5YTUxIVFRQXCJdXG4gICAgICAgICAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgICAgICAgICAgeGhyID0gbmV3IEFjdGl2ZVhPYmplY3QobmFtZSlcblxuICAgICAgICBpZiB4aHI/XG4gICAgICAgICAgICAjIEJyb3dzZXJcbiAgICAgICAgICAgIGlmIGNhbGxiYWNrP1xuICAgICAgICAgICAgICAgICMgQXN5bmNcbiAgICAgICAgICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cbiAgICAgICAgICAgICAgICAgICAgaWYgeGhyLnJlYWR5U3RhdGUgaXMgNFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgeGhyLnN0YXR1cyBpcyAyMDAgb3IgeGhyLnN0YXR1cyBpcyAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soeGhyLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKVxuICAgICAgICAgICAgICAgIHhoci5vcGVuICdHRVQnLCBwYXRoLCB0cnVlXG4gICAgICAgICAgICAgICAgeGhyLnNlbmQgbnVsbFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgIyBTeW5jXG4gICAgICAgICAgICAgICAgeGhyLm9wZW4gJ0dFVCcsIHBhdGgsIGZhbHNlXG4gICAgICAgICAgICAgICAgeGhyLnNlbmQgbnVsbFxuXG4gICAgICAgICAgICAgICAgaWYgeGhyLnN0YXR1cyBpcyAyMDAgb3IgeGhyLnN0YXR1cyA9PSAwXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB4aHIucmVzcG9uc2VUZXh0XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICAjIE5vZGUuanMtbGlrZVxuICAgICAgICAgICAgcmVxID0gcmVxdWlyZVxuICAgICAgICAgICAgZnMgPSByZXEoJ2ZzJykgIyBQcmV2ZW50IGJyb3dzZXJpZnkgZnJvbSB0cnlpbmcgdG8gbG9hZCAnZnMnIG1vZHVsZVxuICAgICAgICAgICAgaWYgY2FsbGJhY2s/XG4gICAgICAgICAgICAgICAgIyBBc3luY1xuICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlIHBhdGgsIChlcnIsIGRhdGEpIC0+XG4gICAgICAgICAgICAgICAgICAgIGlmIGVyclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sgbnVsbFxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayBTdHJpbmcoZGF0YSlcblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICMgU3luY1xuICAgICAgICAgICAgICAgIGRhdGEgPSBmcy5yZWFkRmlsZVN5bmMgcGF0aFxuICAgICAgICAgICAgICAgIGlmIGRhdGE/XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTdHJpbmcoZGF0YSlcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBVdGlsc1xuIiwiXG5QYXJzZXIgPSByZXF1aXJlICcuL1BhcnNlcidcbkR1bXBlciA9IHJlcXVpcmUgJy4vRHVtcGVyJ1xuVXRpbHMgID0gcmVxdWlyZSAnLi9VdGlscydcblxuIyBZYW1sIG9mZmVycyBjb252ZW5pZW5jZSBtZXRob2RzIHRvIGxvYWQgYW5kIGR1bXAgWUFNTC5cbiNcbmNsYXNzIFlhbWxcblxuICAgICMgUGFyc2VzIFlBTUwgaW50byBhIEphdmFTY3JpcHQgb2JqZWN0LlxuICAgICNcbiAgICAjIFRoZSBwYXJzZSBtZXRob2QsIHdoZW4gc3VwcGxpZWQgd2l0aCBhIFlBTUwgc3RyaW5nLFxuICAgICMgd2lsbCBkbyBpdHMgYmVzdCB0byBjb252ZXJ0IFlBTUwgaW4gYSBmaWxlIGludG8gYSBKYXZhU2NyaXB0IG9iamVjdC5cbiAgICAjXG4gICAgIyAgVXNhZ2U6XG4gICAgIyAgICAgbXlPYmplY3QgPSBZYW1sLnBhcnNlKCdzb21lOiB5YW1sJyk7XG4gICAgIyAgICAgY29uc29sZS5sb2cobXlPYmplY3QpO1xuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIGlucHV0ICAgICAgICAgICAgICAgICAgIEEgc3RyaW5nIGNvbnRhaW5pbmcgWUFNTFxuICAgICMgQHBhcmFtIFtCb29sZWFuXSAgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSAgdHJ1ZSBpZiBhbiBleGNlcHRpb24gbXVzdCBiZSB0aHJvd24gb24gaW52YWxpZCB0eXBlcywgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgIyBAcGFyYW0gW0Z1bmN0aW9uXSBvYmplY3REZWNvZGVyICAgICAgICAgICBBIGZ1bmN0aW9uIHRvIGRlc2VyaWFsaXplIGN1c3RvbSBvYmplY3RzLCBudWxsIG90aGVyd2lzZVxuICAgICNcbiAgICAjIEByZXR1cm4gW09iamVjdF0gIFRoZSBZQU1MIGNvbnZlcnRlZCB0byBhIEphdmFTY3JpcHQgb2JqZWN0XG4gICAgI1xuICAgICMgQHRocm93IFtQYXJzZUV4Y2VwdGlvbl0gSWYgdGhlIFlBTUwgaXMgbm90IHZhbGlkXG4gICAgI1xuICAgIEBwYXJzZTogKGlucHV0LCBleGNlcHRpb25PbkludmFsaWRUeXBlID0gZmFsc2UsIG9iamVjdERlY29kZXIgPSBudWxsKSAtPlxuICAgICAgICByZXR1cm4gbmV3IFBhcnNlcigpLnBhcnNlKGlucHV0LCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyKVxuXG5cbiAgICAjIFBhcnNlcyBZQU1MIGZyb20gZmlsZSBwYXRoIGludG8gYSBKYXZhU2NyaXB0IG9iamVjdC5cbiAgICAjXG4gICAgIyBUaGUgcGFyc2VGaWxlIG1ldGhvZCwgd2hlbiBzdXBwbGllZCB3aXRoIGEgWUFNTCBmaWxlLFxuICAgICMgd2lsbCBkbyBpdHMgYmVzdCB0byBjb252ZXJ0IFlBTUwgaW4gYSBmaWxlIGludG8gYSBKYXZhU2NyaXB0IG9iamVjdC5cbiAgICAjXG4gICAgIyAgVXNhZ2U6XG4gICAgIyAgICAgbXlPYmplY3QgPSBZYW1sLnBhcnNlRmlsZSgnY29uZmlnLnltbCcpO1xuICAgICMgICAgIGNvbnNvbGUubG9nKG15T2JqZWN0KTtcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICBwYXRoICAgICAgICAgICAgICAgICAgICBBIGZpbGUgcGF0aCBwb2ludGluZyB0byBhIHZhbGlkIFlBTUwgZmlsZVxuICAgICMgQHBhcmFtIFtCb29sZWFuXSAgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSAgdHJ1ZSBpZiBhbiBleGNlcHRpb24gbXVzdCBiZSB0aHJvd24gb24gaW52YWxpZCB0eXBlcywgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgIyBAcGFyYW0gW0Z1bmN0aW9uXSBvYmplY3REZWNvZGVyICAgICAgICAgICBBIGZ1bmN0aW9uIHRvIGRlc2VyaWFsaXplIGN1c3RvbSBvYmplY3RzLCBudWxsIG90aGVyd2lzZVxuICAgICNcbiAgICAjIEByZXR1cm4gW09iamVjdF0gIFRoZSBZQU1MIGNvbnZlcnRlZCB0byBhIEphdmFTY3JpcHQgb2JqZWN0IG9yIG51bGwgaWYgdGhlIGZpbGUgZG9lc24ndCBleGlzdC5cbiAgICAjXG4gICAgIyBAdGhyb3cgW1BhcnNlRXhjZXB0aW9uXSBJZiB0aGUgWUFNTCBpcyBub3QgdmFsaWRcbiAgICAjXG4gICAgQHBhcnNlRmlsZTogKHBhdGgsIGNhbGxiYWNrID0gbnVsbCwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSA9IGZhbHNlLCBvYmplY3REZWNvZGVyID0gbnVsbCkgLT5cbiAgICAgICAgaWYgY2FsbGJhY2s/XG4gICAgICAgICAgICAjIEFzeW5jXG4gICAgICAgICAgICBVdGlscy5nZXRTdHJpbmdGcm9tRmlsZSBwYXRoLCAoaW5wdXQpID0+XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbnVsbFxuICAgICAgICAgICAgICAgIGlmIGlucHV0P1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBAcGFyc2UgaW5wdXQsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXJcbiAgICAgICAgICAgICAgICBjYWxsYmFjayByZXN1bHRcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgIyBTeW5jXG4gICAgICAgICAgICBpbnB1dCA9IFV0aWxzLmdldFN0cmluZ0Zyb21GaWxlIHBhdGhcbiAgICAgICAgICAgIGlmIGlucHV0P1xuICAgICAgICAgICAgICAgIHJldHVybiBAcGFyc2UgaW5wdXQsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXJcbiAgICAgICAgICAgIHJldHVybiBudWxsXG5cblxuICAgICMgRHVtcHMgYSBKYXZhU2NyaXB0IG9iamVjdCB0byBhIFlBTUwgc3RyaW5nLlxuICAgICNcbiAgICAjIFRoZSBkdW1wIG1ldGhvZCwgd2hlbiBzdXBwbGllZCB3aXRoIGFuIG9iamVjdCwgd2lsbCBkbyBpdHMgYmVzdFxuICAgICMgdG8gY29udmVydCB0aGUgb2JqZWN0IGludG8gZnJpZW5kbHkgWUFNTC5cbiAgICAjXG4gICAgIyBAcGFyYW0gW09iamVjdF0gICBpbnB1dCAgICAgICAgICAgICAgICAgICBKYXZhU2NyaXB0IG9iamVjdFxuICAgICMgQHBhcmFtIFtJbnRlZ2VyXSAgaW5saW5lICAgICAgICAgICAgICAgICAgVGhlIGxldmVsIHdoZXJlIHlvdSBzd2l0Y2ggdG8gaW5saW5lIFlBTUxcbiAgICAjIEBwYXJhbSBbSW50ZWdlcl0gIGluZGVudCAgICAgICAgICAgICAgICAgIFRoZSBhbW91bnQgb2Ygc3BhY2VzIHRvIHVzZSBmb3IgaW5kZW50YXRpb24gb2YgbmVzdGVkIG5vZGVzLlxuICAgICMgQHBhcmFtIFtCb29sZWFuXSAgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSAgdHJ1ZSBpZiBhbiBleGNlcHRpb24gbXVzdCBiZSB0aHJvd24gb24gaW52YWxpZCB0eXBlcyAoYSBKYXZhU2NyaXB0IHJlc291cmNlIG9yIG9iamVjdCksIGZhbHNlIG90aGVyd2lzZVxuICAgICMgQHBhcmFtIFtGdW5jdGlvbl0gb2JqZWN0RW5jb2RlciAgICAgICAgICAgQSBmdW5jdGlvbiB0byBzZXJpYWxpemUgY3VzdG9tIG9iamVjdHMsIG51bGwgb3RoZXJ3aXNlXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgQSBZQU1MIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIG9yaWdpbmFsIEphdmFTY3JpcHQgb2JqZWN0XG4gICAgI1xuICAgIEBkdW1wOiAoaW5wdXQsIGlubGluZSA9IDIsIGluZGVudCA9IDQsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgPSBmYWxzZSwgb2JqZWN0RW5jb2RlciA9IG51bGwpIC0+XG4gICAgICAgIHlhbWwgPSBuZXcgRHVtcGVyKClcbiAgICAgICAgeWFtbC5pbmRlbnRhdGlvbiA9IGluZGVudFxuXG4gICAgICAgIHJldHVybiB5YW1sLmR1bXAoaW5wdXQsIGlubGluZSwgMCwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RW5jb2RlcilcblxuXG4gICAgIyBSZWdpc3RlcnMgLnltbCBleHRlbnNpb24gdG8gd29yayB3aXRoIG5vZGUncyByZXF1aXJlKCkgZnVuY3Rpb24uXG4gICAgI1xuICAgIEByZWdpc3RlcjogLT5cbiAgICAgICAgcmVxdWlyZV9oYW5kbGVyID0gKG1vZHVsZSwgZmlsZW5hbWUpIC0+XG4gICAgICAgICAgICAjIEZpbGwgaW4gcmVzdWx0XG4gICAgICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IFlBTUwucGFyc2VGaWxlIGZpbGVuYW1lXG5cbiAgICAgICAgIyBSZWdpc3RlciByZXF1aXJlIGV4dGVuc2lvbnMgb25seSBpZiB3ZSdyZSBvbiBub2RlLmpzXG4gICAgICAgICMgaGFjayBmb3IgYnJvd3NlcmlmeVxuICAgICAgICBpZiByZXF1aXJlPy5leHRlbnNpb25zP1xuICAgICAgICAgICAgcmVxdWlyZS5leHRlbnNpb25zWycueW1sJ10gPSByZXF1aXJlX2hhbmRsZXJcbiAgICAgICAgICAgIHJlcXVpcmUuZXh0ZW5zaW9uc1snLnlhbWwnXSA9IHJlcXVpcmVfaGFuZGxlclxuXG5cbiAgICAjIEFsaWFzIG9mIGR1bXAoKSBtZXRob2QgZm9yIGNvbXBhdGliaWxpdHkgcmVhc29ucy5cbiAgICAjXG4gICAgQHN0cmluZ2lmeTogKGlucHV0LCBpbmxpbmUsIGluZGVudCwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RW5jb2RlcikgLT5cbiAgICAgICAgcmV0dXJuIEBkdW1wIGlucHV0LCBpbmxpbmUsIGluZGVudCwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RW5jb2RlclxuXG5cbiAgICAjIEFsaWFzIG9mIHBhcnNlRmlsZSgpIG1ldGhvZCBmb3IgY29tcGF0aWJpbGl0eSByZWFzb25zLlxuICAgICNcbiAgICBAbG9hZDogKHBhdGgsIGNhbGxiYWNrLCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyKSAtPlxuICAgICAgICByZXR1cm4gQHBhcnNlRmlsZSBwYXRoLCBjYWxsYmFjaywgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlclxuXG5cbiMgRXhwb3NlIFlBTUwgbmFtZXNwYWNlIHRvIGJyb3dzZXJcbndpbmRvdz8uWUFNTCA9IFlhbWxcblxubW9kdWxlLmV4cG9ydHMgPSBZYW1sXG5cbiJdfQ==
