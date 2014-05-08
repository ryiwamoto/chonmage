/// <reference path="TestSettings.ts" />

/// <reference path="../src/TemplateNodeToProgramVisitor.ts" />

var expect = require('chai').expect;

describe('TemplateNodeToProgramVisitor', function () {
    var Template = Chonmage.Template;
    var Generator = Chonmage.Generator;

    it('visitTree', function () {
        var fixture:Chonmage.Template.ITemplateParseResult = {
            contextType: 'ITemplateNodeToProgramContext',
            references: [
                './ITemplateNodeToProgramContext.ts',
            ],
            tree: new Template.TemplateNodeTree([
                new Template.StringNode('string'),
                new Template.StringNode('\\n'),
                new Template.SectionNode('section', false, [
                    new Template.VariableNode('itemStr', true),
                    new Template.VariableNode('escapedVariable', true),
                    new Template.SectionNode('invertedSection', true, [
                        new Template.VariableNode('unescapedVariable', false),
                    ])
                ]),
                new Template.StringNode('\\n'),
            ])
        };

        var expected:Chonmage.Generator.ProgramStatementTree = new Chonmage.Generator.ProgramStatementTree(
            'ITemplateNodeToProgramContext'
        )
        var arrayLoop = new Generator.ArrayLoopStatement('section', expected, 0);
        arrayLoop.children = [
            new Generator.VariableStatement('itemStr', arrayLoop, 'string', true),
            new Generator.VariableStatement('escapedVariable', expected, 'string', true),
            new Generator.ConditionStatement('invertedSection', expected, [
                new Generator.VariableStatement('unescapedVariable', expected, 'number', false),
            ], true)
        ];

        expected.children = [
            new Generator.StringStatement('string'),
            new Generator.StringStatement('\\n'),
            arrayLoop,
            new Generator.StringStatement('\\n'),
        ];

        var ls = new Chonmage.TypeScriptLanguageService(new TypeScript.CompilationSettings());
        var actual = new Chonmage.Generator.TemplateNodeToProgramVisitor(ls, Chonmage.TestSettings.tsDir).visitTree(
            fixture.contextType, fixture.references, fixture.tree);

        expect(actual).to.eql(expected);
    });

    it('dot variable in array', function () {
        var fixture:Chonmage.Template.ITemplateParseResult = {
            contextType: 'ITemplateNodeToProgramContext',
            references: [
                './ITemplateNodeToProgramContext.ts',
            ],
            tree: new Template.TemplateNodeTree([
                new Template.SectionNode('numberArr', false, [
                    new Template.VariableNode('.', true),
                ]),
            ])
        };

        var expected:Chonmage.Generator.ProgramStatementTree = new Chonmage.Generator.ProgramStatementTree(
            'ITemplateNodeToProgramContext'
        )
        var arrayLoop = new Generator.ArrayLoopStatement('numberArr', expected, 0);
        arrayLoop.children = [
            new Generator.VariableStatement('', arrayLoop, 'number', true),
        ];

        expected.children = [
            arrayLoop,
        ];

        var ls = new Chonmage.TypeScriptLanguageService(new TypeScript.CompilationSettings());
        var actual = new Chonmage.Generator.TemplateNodeToProgramVisitor(ls, Chonmage.TestSettings.tsDir).visitTree(
            fixture.contextType, fixture.references, fixture.tree);

        expect(actual).to.eql(expected);
    });

    it('interface nested Array (IInnerArray[][])', function () {
        var fixture:Chonmage.Template.ITemplateParseResult = {
            contextType: 'CompileTest.IInterfaceNestedArray',
            references: [
                './CompileTest.ts',
            ],
            tree: new Template.TemplateNodeTree([
                new Template.SectionNode('interfaceNestedArray', false, [
                    new Template.SectionNode('.', false, [
                        new Template.VariableNode('itemStr', true)
                    ])
                ]),
            ])
        };

        var expected:Chonmage.Generator.ProgramStatementTree = new Chonmage.Generator.ProgramStatementTree(
            'CompileTest.IInterfaceNestedArray'
        )
        var arrayLoop = new Generator.ArrayLoopStatement('interfaceNestedArray', expected, 0);
        var innerArrayLoop = new Generator.ArrayLoopStatement('', arrayLoop, 1);

        innerArrayLoop.children = [
            new Generator.VariableStatement('itemStr', innerArrayLoop, 'string', true),
        ];
        arrayLoop.children = [
            innerArrayLoop
        ];
        expected.children = [
            arrayLoop,
        ];


        var ls = new Chonmage.TypeScriptLanguageService(new TypeScript.CompilationSettings());
        var actual:Chonmage.Generator.ProgramStatementTree = new Chonmage.Generator.TemplateNodeToProgramVisitor(ls, Chonmage.TestSettings.tsDir).visitTree(
            fixture.contextType, fixture.references, fixture.tree);

        expect(actual.toJSON()).to.eql(expected.toJSON());
    });
});

