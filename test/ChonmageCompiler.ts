/// <reference path="TestSettings.ts" />
/// <reference path="../src/ChonmageCompiler.ts" />

describe('Chonmage.Compiler', function () {
    var fs = require('fs');
    it('.createTsFileForBrowser', function () {
        var templatePath = __dirname + '/template';
        var templateFilePath = templatePath + '/create_ts_file_test.tmpl';
        var templateContext = fs.readFileSync(templateFilePath, {encoding: 'utf8'});
        expect(function () {
            Chonmage.createTsFileForBrowser(
                Chonmage.compile(templateContext, templatePath),
                'testTemplate'
            )
        }).not.to.throw();
    })
});
