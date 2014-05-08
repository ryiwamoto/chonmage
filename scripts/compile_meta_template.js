var fs = require('fs');

var Chonmage = require('../dest/ChonmageCompiler.js');

var templateDir = __dirname + '/../src/template';
var tsFileTemplate = fs.readFileSync(templateDir + '/browser_ts_file.tmpl', {encoding: 'utf8'});
var compileResult = Chonmage.compile(tsFileTemplate, templateDir);

//TODO: support for node.js
var fileContent =
    '/// <reference path="../ChonmageTemplate.ts" />\n' +
    'module Chonmage.CompiledTemplate{\n' +
    '   export var templateForBrowser: Chonmage.Compiled<' + compileResult.contextType + '> = ' + compileResult.compiled + '\n' +
    '}';

fs.writeFileSync(__dirname + '/../src/compiledTemplate/TemplateForBrowser.ts', fileContent, {encoding: 'utf8'});

