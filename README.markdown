yaml.js
=======

Standalone JavaScript YAML Parser & Encoder. You don't need any javascript framework to use it.

Mainly inspired from [sfYaml Library](http://components.symfony-project.org/yaml/) (part of the php Symfony components).

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

    yamlString = YAML.encode(nativeObject);