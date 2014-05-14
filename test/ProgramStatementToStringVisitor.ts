/// <reference path="TestSettings.ts" />

/// <reference path="../src/TypeScriptLanguageService.ts" />

var expect = require('chai').expect;

describe('ProgramStatementToStringVisitor', function () {
    var Generator = Chonmage.Generator;

    it('visitProgramStatementTree', function () {
        var fixture:Chonmage.Generator.ProgramStatementTree = new Chonmage.Generator.ProgramStatementTree(
            'ITemplateNodeToProgramContext'
        )
        var arrayLoop = new Generator.ArrayLoopStatement('section', fixture, 0);
        arrayLoop.children = [
            new Generator.VariableStatement('itemStr', arrayLoop, 'string', true),
            new Generator.VariableStatement('escapedVariable', fixture, 'string', true),
            new Generator.ConditionStatement('invertedSection', fixture, [
                new Generator.VariableStatement('unescapedVariable', fixture, 'number', false),
            ], true)
        ];

        fixture.children = [
            new Generator.StringStatement('string'),
            new Generator.StringStatement('\n'),
            arrayLoop,
            new Generator.StringStatement('\n'),
        ];

        var visitor = new Generator.ProgramStatementToStringVisitor();
        var precompiled:string = visitor.visitProgramStatementTree(fixture);

        var expected:string = 'new Chonmage.Compiled<ITemplateNodeToProgramContext>(function(context: ITemplateNodeToProgramContext){var _ = this, __b = \"\";__b += \"string\";__b += \"\n\";var _i_0, _len_0;for(_i_0 = 0, _len_0 = context.section.length; _i_0 < _len_0; _i_0++){var __item_0 = context.section[_i_0];__b += _.esc(__item_0.itemStr);__b += _.esc(context.escapedVariable);if(!context.invertedSection){__b += context.unescapedVariable}};__b += \"\n\"; return __b;})';
        expect(precompiled).to.eq(expected);
    });

});
