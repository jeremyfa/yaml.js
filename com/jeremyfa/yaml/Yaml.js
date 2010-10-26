/**
 * sfYaml offers convenience methods to load and dump YAML.
 *
 * @package		symfony
 * @subpackage yaml
 * @author		 Fabien Potencier <fabien.potencier@symfony-project.com>
 * @version		SVN: $Id: sfYaml.class.php 8988 2008-05-15 20:24:26Z fabien $
 */
 
var Yaml = function(){};
Yaml.prototype =
{
	spec: '1.2',

	/**
	 * Sets the YAML specification version to use.
	 *
	 * @param string version The YAML specification version
	 */
	setSpecVersion: function(version /* String */)
	{
		if ( version != '1.1' && version != '1.2' )
		{
			throw new InvalidArgumentException('Version '+version+' of the YAML specifications is not supported');
		}

		this.spec = version;
	},

	/**
	 * Gets the YAML specification version to use.
	 *
	 * @return string The YAML specification version
	 */
	getSpecVersion: function()
	{
		return this.spec;
	},

	/**
	 * Loads YAML into a JS representation.
	 *
	 * The load method, when supplied with a YAML stream (file),
	 * will do its best to convert YAML in a file into a JS representation.
	 *
	 *	Usage:
	 *	<code>
	 *	 obj = yaml.loadFile('config.yml');
	 *	</code>
	 *
	 * @param string input Path of YAML file or string containing YAML
	 *
	 * @return array The YAML converted to a JS representation
	 *
	 * @throws InvalidArgumentException If the YAML is not valid
	 */
	loadFile: function(file /* String */)
	{
		input = this.getFileContents(file);
		
		return this.load(input);
	},

	/**
	 * Loads YAML into a JS representation.
	 *
	 * The load method, when supplied with a YAML stream (string),
	 * will do its best to convert YAML in a file into a JS representation.
	 *
	 *	Usage:
	 *	<code>
	 *	 obj = yaml.load(...);
	 *	</code>
	 *
	 * @param string input Path of YAML file or string containing YAML
	 *
	 * @return array The YAML converted to a JS representation
	 *
	 * @throws InvalidArgumentException If the YAML is not valid
	 */
	load: function(input /* String */)
	{
		var yaml = new YamlParser();
		var ret = null;

		try
		{
			ret = yaml.parse(input);
		}
		catch ( e )
		{
			if ( e.name != undefined && e.name.toString == "TypeError" ) throw e;
			throw 'Syntax error: '+e.message;
			//throw new InvalidArgumentException(e.name+' ('+e.lineNumber+') '+e.message);
		}

		return ret;
	},

	/**
	 * Dumps a JS representation to a YAML string.
	 *
	 * The dump method, when supplied with an array, will do its best
	 * to convert the array into friendly YAML.
	 *
	 * @param array	 array JS representation
	 * @param integer inline The level where you switch to inline YAML
	 *
	 * @return string A YAML string representing the original JS representation
	 */
	dump: function(array, inline)
	{
		if ( inline == undefined ) inline = 2;

		yaml = new YamlDumper();

		return yaml.dump(array, inline);
	},
	
	getXHR: function()
	{
		if ( window.XMLHttpRequest )
			return new XMLHttpRequest();
		 
		if ( window.ActiveXObject )
		{
			var names = [
			"Msxml2.XMLHTTP.6.0",
			"Msxml2.XMLHTTP.3.0",
			"Msxml2.XMLHTTP",
			"Microsoft.XMLHTTP"
			];
			
			for ( var i = 0; i < 4; i++ )
			{
				try{ return new ActiveXObject(names[i]); }
				catch(e){}
			}
		}
		return null;
	},
	
	getFileContents: function(file)
	{
		var request = this.getXHR();
		
		request.open('GET', file, false);                  
		request.send(null);
		
		return request.responseText;
	}
};

var YAML =
{
	encode: function(input)
	{
		var yaml = new Yaml();
		return yaml.dump(input);
	},
	
	decode: function(input)
	{
		var yaml = new Yaml();
		return yaml.load(input);
	}
};

if ( typeof(InvalidArgumentException) == 'undefined' )
	InvalidArgumentException = function(message)
	{
		this.name = 'InvalidArgumentException';
		this.message = message;
	};
