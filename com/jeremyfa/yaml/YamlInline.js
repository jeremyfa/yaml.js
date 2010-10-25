
/**
 * YamlInline implements a YAML parser/dumper for the YAML inline syntax.
 */
var YamlInline = function(){};
YamlInline.prototype =
{
	i: null,
	
	/**
	 * Convert a YAML string to a JS object.
	 *
	 * @param string value A YAML string
	 *
	 * @return object A JS object representing the YAML string
	 */
	load: function(value)
	{
		var result = null;
		value = this.trim(value);

		if ( 0 == value.length )
		{
			return '';
		}

		switch ( value.charAt(0) )
		{
			case '[':
				result = this.parseSequence(value);
				break;
			case '{':
				result = this.parseMapping(value);
				break;
			default:
				result = this.parseScalar(value);
		}

		return result;
	},

	/**
	 * Dumps a given JS variable to a YAML string.
	 *
	 * @param mixed value The JS variable to convert
	 *
	 * @return string The YAML string representing the JS object
	 */
	dump: function(value)
	{
		var trueValues;
		var falseValues;
		
		var yaml = new Yaml();
		
		if ( '1.1' == yaml.getSpecVersion() )
		{
			trueValues = ['true', 'on', '+', 'yes', 'y'];
			falseValues = ['false', 'off', '-', 'no', 'n'];
		}
		else
		{
			trueValues = ['true'];
			falseValues = ['false'];
		}

		if ( typeof(value) == 'object' && null != value )
			return this.dumpObject(value);
		if ( undefined == value || null == value )
			return 'null';
		if ( typeof(value) == 'boolean' )
			return value ? 'true' : 'false';
		if ( /^\d+/.test(value) )
			return typeof(value) == 'string' ? "'"+value+"'" : parseInt(value);
		if ( this.isNumeric(value) )
			return typeof(value) == 'string' ? "'"+value+"'" : parseFloat(value);
		if ( typeof(value) == 'number' )
			return value == Infinity ? '.Inf' : ( value == -Infinity ? '-.Inf' : ( isNaN(value) ? '.NAN' : value ) );
		if ( (value+'').indexOf("\n") != -1 || (value+'').indexOf("\r") != -1 )
			return '"'+value.split('"').join('\\"').split("\n").join('\\n').split("\r").join('\\r')+'"';
		if ( ( /[\s\'"\:\{\}\[\],&\*\#\?]/.test(value) ) || ( /^[-?|<>=!%@`]/.test(value) ) )
			return "'"+value.split('\'').join('\'\'')+"'";
		if ( '' == value )
			return "''";
		if ( this.getTimestampRegex().test(value) )
			return "'"+value+"'";
		if ( this.inArray(value.toLowerCase(), trueValues) )
			return "'"+value+"'";
		if ( this.inArray(value.toLowerCase(), falseValues) )
			return "'"+value+"'";
		if ( this.inArray(value.toLowerCase(), ['null','~']) )
			return "'"+value+"'";
		// default
			return value;
	},

	/**
	 * Dumps a JS object to a YAML string.
	 *
	 * @param object value The JS array to dump
	 *
	 * @return string The YAML string representing the JS object
	 */
	dumpObject: function(value)
	{
		var keys = this.getKeys(value);
		var output = null;
		var i;
		var len = keys.length;

		// array
		if ( value instanceof Array )
			/*( 1 == len && '0' == keys[0] )
			||
			( len > 1 && this.reduceArray(keys, function(v,w){return Math.floor(v+w);}, 0) == len * (len - 1) / 2) )*/
		{
			output = [];
			for ( i = 0; i < len; i++ )
			{
				output.push(this.dump(value[keys[i]]));
			}

			return '['+output.join(', ')+']';
		}

		// mapping
		output = [];
		for ( i = 0; i < len; i++ )
		{
			output.push(this.dump(keys[i])+': '+this.dump(value[keys[i]]));
		}

		return '{ '+output.join(', ')+' }';
	},

	/**
	 * Parses a scalar to a YAML string.
	 *
	 * @param scalar scalar
	 * @param string delimiters
	 * @param object stringDelimiter
	 * @param integer i
	 * @param boolean evaluate
	 *
	 * @return string A YAML string
	 */
	parseScalar: function(scalar, delimiters, stringDelimiters, i, evaluate)
	{
		if ( delimiters == undefined ) delimiters = null;
		if ( stringDelimiters == undefined ) stringDelimiters = ['"', "'"];
		if ( i == undefined ) i = 0;
		if ( evaluate == undefined ) evaluate = true;
		
		var output = null;
		var pos = null;
		var match = null;
		
		if ( this.inArray(scalar[i], stringDelimiters) )
		{
			// quoted scalar
			output = this.parseQuotedScalar(scalar, i);
			i = this.i;
		}
		else
		{
			// "normal" string
			if ( !delimiters )
			{
				output = (scalar+'').substring(i);
				
				i += output.length;

				// remove comments
				pos = output.indexOf(' #');
				if ( pos != -1 )
				{
					output = output.substr(0, pos).replace(/\s+$/g,'');
				}
			}
			else if ( match = new RegExp('^(.+?)('+delimiters.join('|')+')').exec((scalar+'').substring(i)) )
			{
				output = match[1];
				i += output.length;
			}
			else
			{
				throw new InvalidArgumentException('Malformed inline YAML string ('+scalar+').');
			}
			output = evaluate ? this.evaluateScalar(output) : output;
		}

		this.i = i;
		
		return output;
	},

	/**
	 * Parses a quoted scalar to YAML.
	 *
	 * @param string	$scalar
	 * @param integer $i
	 *
	 * @return string A YAML string
	 */
	parseQuotedScalar: function(scalar, i)
	{
		var match = null;
		if ( !(match = new RegExp('^'+YamlInline.REGEX_QUOTED_STRING).exec((scalar+'').substring(i))) )
		{
			throw new InvalidArgumentException('Malformed inline YAML string ('+(scalar+'').substring(i)+').');
		}

		var output = match[0].substr(1, match[0].length - 2);

		if ( '"' == (scalar+'').charAt(i) )
		{
			// evaluate the string
			output = output
				.split('\\"').join('"')
				.split('\\n').join("\n")
				.split('\\r').join("\r");
		}
		else
		{
			// unescape '
			output = output.split('\'\'').join('\'');
		}

		i += match[0].length;

		this.i = i;
		return output;
	},

	/**
	 * Parses a sequence to a YAML string.
	 *
	 * @param string sequence
	 * @param integer i
	 *
	 * @return string A YAML string
	 */
	parseSequence: function(sequence, i)
	{
		if ( i == undefined ) i = 0;
		
		var output = [];
		var len = sequence.length;
		i += 1;

		// [foo, bar, ...]
		while ( i < len )
		{
			switch ( sequence.charAt(i) )
			{
				case '[':
					// nested sequence
					output.push(this.parseSequence(sequence, i));
					i = this.i;
					break;
				case '{':
					// nested mapping
					output.push(this.parseMapping(sequence, i));
					i = this.i;
					break;
				case ']':
					this.i = i;
					return output;
				case ',':
				case ' ':
					break;
				default:
					isQuoted = this.inArray(sequence.charAt(i), ['"', "'"]);
					var value = this.parseScalar(sequence, [',', ']'], ['"', "'"], i);
					i = this.i;
					
					if ( !isQuoted && (value+'').indexOf(': ') != -1 )
					{
						// embedded mapping?
						try
						{
							value = this.parseMapping('{'+value+'}');
						}
						catch ( e )
						{
							if ( !(e instanceof InvalidArgumentException ) ) throw e;
							// no, it's not
						}
					}

					output.push(value);

					i--;
			}

			i++;
		}

		throw new InvalidArgumentException('Malformed inline YAML string '+sequence);
	},

	/**
	 * Parses a mapping to a YAML string.
	 *
	 * @param string mapping
	 * @param integer i
	 *
	 * @return string A YAML string
	 */
	parseMapping: function(mapping, i)
	{
		if ( i == undefined ) i = 0;
		var output = {};
		var len = mapping.length;
		i += 1;
		var done = false;
		var doContinue = false;

		// {foo: bar, bar:foo, ...}
		while ( i < len )
		{
			doContinue = false;
			
			switch ( mapping.charAt(i) )
			{
				case ' ':
				case ',':
					i++;
					doContinue = true;
					break;
				case '}':
					this.i = i;
					return output;
			}
			
			if ( doContinue ) continue;

			// key
			var key = this.parseScalar(mapping, [':', ' '], ['"', "'"], i, false);
			i = this.i;

			// value
			done = false;
			while ( i < len )
			{
				switch ( mapping.charAt(i) )
				{
					case '[':
						// nested sequence
						output[key] = this.parseSequence(mapping, i);
						i = this.i;
						done = true;
						break;
					case '{':
						// nested mapping
						output[key] = this.parseMapping(mapping, i);
						i = this.i;
						done = true;
						break;
					case ':':
					case ' ':
						break;
					default:
						output[key] = this.parseScalar(mapping, [',', '}'], ['"', "'"], i);
						i = this.i;
						done = true;
						i--;
				}

				++i;

				if ( done )
				{
					doContinue = true;
					break;
				}
			}
			
			if ( doContinue ) continue;
		}

		throw new InvalidArgumentException('Malformed inline YAML string '+mapping);
	},

	/**
	 * Evaluates scalars and replaces magic values.
	 *
	 * @param string scalar
	 *
	 * @return string A YAML string
	 */
	evaluateScalar: function(scalar)
	{
		scalar = this.trim(scalar);
		
		var trueValues;
		var falseValues;
		
		var yaml = new Yaml();
		
		if ( '1.1' == yaml.getSpecVersion() )
		{
			trueValues = ['true', 'on', '+', 'yes', 'y'];
			falseValues = ['false', 'off', '-', 'no', 'n'];
		}
		else
		{
			trueValues = ['true'];
			falseValues = ['false'];
		}
		
		var raw = null;
		var cast = null;

		if (	( 'null' == scalar.toLowerCase() ) ||
				( '' == scalar ) ||
				( '~' == scalar ) )
			return null;
		if ( (scalar+'').indexOf('!str') != -1 )
			return (''+scalar).substring(5);
		if ( (scalar+'').indexOf('! ') != -1 )
			return parseInt(this.parseScalar((scalar+'').substring(2)));
		if ( /^\d+/.test(scalar) )
		{
			raw = scalar;
			cast = parseInt(scalar);
			return '0' == scalar.charAt(0) ? this.octdec(scalar) : (( ''+raw == ''+cast ) ? cast : raw);
		}
		if ( this.inArray(scalar.toLowerCase(), trueValues) )
			return true;
		if ( this.inArray(scalar.toLowerCase(), falseValues) )
			return false;
		if ( this.isNumeric(scalar) )
			return '0x' == (scalar+'').substr(0, 2) ? hexdec($scalar) : floatval($scalar);
		if ( scalar.toLowerCase() == '.inf' )
			return Infinity;
		if ( scalar.toLowerCase() == '.nan' )
			return NaN;
		if ( scalar.toLowerCase() == '-.inf' )
			return -Infinity;
		if ( /^(-|\+)?[0-9,]+(\.[0-9]+)?$/.test(scalar) )
			return parseFloat(scalar.split(',').join(''));
		if ( this.getTimestampRegex().test(scalar) )
			return this.strtodate(scalar);
		//else
			return ''+scalar;
	},

	getTimestampRegex: function()
	{
		return new RegExp('^'+
		'([0-9][0-9][0-9][0-9])'+
		'-([0-9][0-9]?)'+
		'-([0-9][0-9]?)'+
		'(?:(?:[Tt]|[ \t]+)'+
		'([0-9][0-9]?)'+
		':([0-9][0-9])'+
		':([0-9][0-9])'+
		'(?:\.([0-9]*))?'+
		'(?:[ \t]*(Z|([-+])([0-9][0-9]?)'+
		'(?::([0-9][0-9]))?))?)?'+
		'$','gi');
	},
	
	trim: function(str /* String */)
	{
		return (str+'').replace(/^\s+/,'').replace(/\s+$/,'');
	},
	
	isNumeric: function(input)
	{
		return (input - 0) == input && input.length > 0 && input.replace(/\s+/g,'') != '';
	},
	
	inArray: function(key, tab)
	{
		var i;
		var len = tab.length;
		for ( i = 0; i < len; i++ )
		{
			if ( key == tab[i] ) return true;
		}
		return false;
	},
	
	getKeys: function(tab)
	{
		var ret = [];
		
		for ( var name in tab )
		{
			if ( tab.hasOwnProperty(name) )
			{
				ret.push(name);
			}
		}
		
		return ret;
	},
	
	/*reduceArray: function(tab, fun)
	{
		var len = tab.length;
		if (typeof fun != "function")
			throw new InvalidArgumentException("fun is not a function");
		
		// no value to return if no initial value and an empty array
		if (len == 0 && arguments.length == 1)
			throw new InvalidArgumentException("empty array");
		
		var i = 0;
		if (arguments.length >= 2)
		{
			var rv = arguments[1];
		}
		else
		{
			do
			{
				if (i in tab)
				{
					rv = tab[i++];
					break;
				}
		
				// if array contains no values, no initial value to return
				if (++i >= len)
					throw new InvalidArgumentException("no initial value to return");
			}
			while (true);
		}

		for (; i < len; i++)
		{
			if (i in tab)
				rv = fun.call(null, rv, tab[i], i, tab);
		}

		return rv;
	},*/
	
	octdec: function(input)
	{
	    return parseInt((input+'').replace(/[^0-7]/gi, ''), 8);
	},
	
	hexdec: function(input)
	{
		input = this.trim(input);
		if ( (input+'').substr(0, 2) == '0x' ) input = (input+'').substring(2);
	    return parseInt((input+'').replace(/[^a-f0-9]/gi, ''), 16);
	},
	
	strtodate: function(input)
	{
		var date = new Date();
		date.setTime(this.strtotime(input, new Date().getTime()));
		return date;
	},
	
	/**
	 * @see http://phpjs.org/functions/strtotime
	 */
	strtotime: function(h,c){var f,g,l,k="",d="";k=h;k=k.replace(/\s{2,}|^\s|\s$/g," ");k=k.replace(/[\t\r\n]/g,"");if(k=="now"){return(new Date()).getTime()/1000}else{if(!isNaN(d=Date.parse(k))){return(d/1000)}else{if(c){c=new Date(c*1000)}else{c=new Date()}}}k=k.toLowerCase();var e={day:{sun:0,mon:1,tue:2,wed:3,thu:4,fri:5,sat:6},mon:{jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11}};var a=this.strtotime;var b=function(i){var p=(i[2]&&i[2]=="ago");var o=(o=i[0]=="last"?-1:1)*(p?-1:1);switch(i[0]){case"last":case"next":switch(i[1].substring(0,3)){case"yea":c.setFullYear(c.getFullYear()+o);break;case"mon":c.setMonth(c.getMonth()+o);break;case"wee":c.setDate(c.getDate()+(o*7));break;case"day":c.setDate(c.getDate()+o);break;case"hou":c.setHours(c.getHours()+o);break;case"min":c.setMinutes(c.getMinutes()+o);break;case"sec":c.setSeconds(c.getSeconds()+o);break;default:var n;if(typeof(n=e.day[i[1].substring(0,3)])!="undefined"){var q=n-c.getDay();if(q==0){q=7*o}else{if(q>0){if(i[0]=="last"){q-=7}}else{if(i[0]=="next"){q+=7}}}c.setDate(c.getDate()+q)}}break;default:if(/\d+/.test(i[0])){o*=parseInt(i[0],10);switch(i[1].substring(0,3)){case"yea":c.setFullYear(c.getFullYear()+o);break;case"mon":c.setMonth(c.getMonth()+o);break;case"wee":c.setDate(c.getDate()+(o*7));break;case"day":c.setDate(c.getDate()+o);break;case"hou":c.setHours(c.getHours()+o);break;case"min":c.setMinutes(c.getMinutes()+o);break;case"sec":c.setSeconds(c.getSeconds()+o);break}}else{return false}break}return true};g=k.match(/^(\d{2,4}-\d{2}-\d{2})(?:\s(\d{1,2}:\d{2}(:\d{2})?)?(?:\.(\d+))?)?$/);if(g!=null){if(!g[2]){g[2]="00:00:00"}else{if(!g[3]){g[2]+=":00"}}l=g[1].split(/-/g);for(f in e.mon){if(e.mon[f]==l[1]-1){l[1]=f}}l[0]=parseInt(l[0],10);l[0]=(l[0]>=0&&l[0]<=69)?"20"+(l[0]<10?"0"+l[0]:l[0]+""):(l[0]>=70&&l[0]<=99)?"19"+l[0]:l[0]+"";return parseInt(a(l[2]+" "+l[1]+" "+l[0]+" "+g[2])+(g[4]?g[4]/1000:""),10)}var j="([+-]?\\d+\\s(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?|sun\\.?|sunday|mon\\.?|monday|tue\\.?|tuesday|wed\\.?|wednesday|thu\\.?|thursday|fri\\.?|friday|sat\\.?|saturday)|(last|next)\\s(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?|sun\\.?|sunday|mon\\.?|monday|tue\\.?|tuesday|wed\\.?|wednesday|thu\\.?|thursday|fri\\.?|friday|sat\\.?|saturday))(\\sago)?";g=k.match(new RegExp(j,"gi"));if(g==null){return false}for(f=0;f<g.length;f++){if(!b(g[f].split(" "))){return false}}return(c.getTime()/1000)}
};

YamlInline.REGEX_QUOTED_STRING = '(?:"(?:[^"\\\\]*(?:\\\\.[^"\\\\]*)*)"|\'(?:[^\']*(?:\'\'[^\']*)*)\')';

