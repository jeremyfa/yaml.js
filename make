#!/bin/sh
cd `dirname $0`

cmd="java -jar libs/yuicompressor.jar --type js"
file="yaml.js"

> $file

echo Compiling $file ...

echo " - Yaml.js"
$cmd com/jeremyfa/yaml/Yaml.js >> $file
echo " - YamlInline.js"
$cmd com/jeremyfa/yaml/YamlInline.js >> $file
echo " - YamlParser.js"
$cmd com/jeremyfa/yaml/YamlParser.js >> $file
echo " - YamlDumper.js"
$cmd com/jeremyfa/yaml/YamlDumper.js >> $file

echo $file compiled.