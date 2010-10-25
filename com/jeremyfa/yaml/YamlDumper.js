
/**
 * YamlDumper dumps JS variables to YAML strings.
 *
 * @package		symfony
 * @subpackage yaml
 * @author		 Fabien Potencier <fabien.potencier@symfony-project.com>
 * @version		SVN: $Id: sfYamlDumper.class.php 10575 2008-08-01 13:08:42Z nicolas $
 */
YamlDumper = function(){};
YamlDumper.prototype =
{
	/**
	 * Dumps a PHP value to YAML.
	 *
	 * @param	mixed	 $input	The PHP value
	 * @param	integer $inline The level where you switch to inline YAML
	 * @param	integer $indent The level o indentation indentation (used internally)
	 *
	 * @return string	The YAML representation of the PHP value
	 */
	dump: function(input, inline, indent)
	{
		if ( inline == undefined ) inline = 0;
		if ( indent == undefined ) indent = 0;
		var output = '';
		var prefix = indent ? this.strRepeat(' ', indent) : '';
		var yaml;

		if ( inline <= 0 || !this.isObject(input) || this.isEmpty(input) )
		{
			yaml = new YamlInline();
			output += prefix + yaml.dump(input);
		}
		else
		{
			var isAHash = !this.arrayEquals(this.getKeys(input), this.range(0,input.length - 1));
			var willBeInlined;
			
			for ( var key in input )
			{
				if ( input.hasOwnProperty(key) )
				{
					willBeInlined = inline - 1 <= 0 || !this.isObject(input[key]) || this.isEmpty(input[key]);
					
					if ( isAHash ) yaml = new YamlInline();
					
					output += 
						prefix + '' +
						(isAHash ? yaml.dump(key)+':' : '-') + '' +
						(willBeInlined ? ' ' : "\n") + '' +
						this.dump(input[key], inline - 1, (willBeInlined ? 0 : indent + 2)) + '' +
						(willBeInlined ? "\n" : '');
				}
			}
		}

		return output;
	},
	
	strRepeat: function(str /* String */, count /* Integer */)
	{
		var i;
		var result = '';
		for ( i = 0; i < count; i++ ) result += str;
		return str;
	},
	
	isObject: function(input)
	{
		return typeof(input) == 'object' && this.isDefined(input);
	},
	
	isEmpty: function(input)
	{
		return input == undefined || input == null || input == '' || input == 0 || input == "0" || input == false;
	},
	
	isDefined: function(input)
	{
		return input != undefined && input != null;
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
	
	range: function(start, end)
	{
		if ( start > end ) return [];
		
		var ret = [];
		
		for ( var i = start; i <= end; i++ )
		{
			ret.push(i);
		}
		
		return ret;
	},
	
	arrayEquals: function(a,b)
	{
		if ( a.length != b.length ) return false;
		
		var len = a.length;
		
		for ( var i = 0; i < len; i++ )
		{
			if ( a[i] != b[i] ) return false;
		}
		
		return true;
	}
};
