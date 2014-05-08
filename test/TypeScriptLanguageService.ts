/// <reference path="TestSettings.ts" />

/// <reference path="../src/TypeScriptLanguageService.ts" />

var expect = require('chai').expect;

describe('TypeScriptLanguageService', function () {
    it('findSymbol', function () {
        var compilationSettings = new TypeScript.CompilationSettings();

        var tsFile = Chonmage.TestSettings.tsDir + '/IContext.ts';

        var ls = new Chonmage.TypeScriptLanguageService(compilationSettings);
        ls.addScript(tsFile);
        var navigateToItems = ls.findSymbol('strVar', 'TestModule.IArrayItem');
        expect(navigateToItems).not.to.be.null;
    });
});
