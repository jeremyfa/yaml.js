#!/bin/sh
cd `dirname $0`

cmd="java -jar libs/yuicompressor.jar --type js"
file="yaml.js"

> $file

echo Compiling $file ...

echo " - LICENSE"

echo "/*" >> $file
cat LICENSE >> $file
echo "\n*/" >> $file

echo " - YamlParseException.js"
$cmd com/jeremyfa/yaml/YamlParseException.js >> $file
echo " - Yaml.js"
$cmd com/jeremyfa/yaml/Yaml.js >> $file
echo " - YamlInline.js"
$cmd com/jeremyfa/yaml/YamlInline.js >> $file
echo " - YamlParser.js"
$cmd com/jeremyfa/yaml/YamlParser.js >> $file
echo " - YamlEscaper.js"
$cmd com/jeremyfa/yaml/YamlEscaper.js >> $file
echo " - YamlUnescaper.js"
$cmd com/jeremyfa/yaml/YamlUnescaper.js >> $file
echo " - YamlDumper.js"
$cmd com/jeremyfa/yaml/YamlDumper.js >> $file

echo $file compiled.
