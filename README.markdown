yaml.js
=======

Standalone JavaScript YAML 1.2 Parser & Encoder. You don't need any javascript framework to use it.

Mainly inspired from [Yaml Component](https://github.com/symfony/Yaml) (part of the php framework Symfony).

How to use
----------

Import yaml.js in your html page:

    <script type="text/javascript" src="yaml.js"></script>

Parse yaml string:

    nativeObject = YAML.decode(yamlString);

Load yaml file:

    nativeObject = YAML.load('file.yml');

Load yaml file (asynchronous):

    YAML.load('file.yml', function(result)
    {
      nativeObject = result;
    });

Dump native object into yaml string:

    yamlString = YAML.encode(nativeObject[, inline /* @integer depth to start using inline notation at */ ]);
    
Important
---------

Symfony dropped support for YAML 1.1 spec. This means that `yes`, `no` and similar no longer convert to their *boolean* equivalents.

The internal `Yaml().load()` and `Yaml().loadFile()` methods renamed to `Yaml().parse()` and `Yaml().parseFile()` respectively. Exceptions replaced with `YamlParseException` object.

