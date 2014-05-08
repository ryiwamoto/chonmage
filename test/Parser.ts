/// <reference path="TestSettings.ts" />

/// <reference path="../src/Parser.ts" />

var expect = require('chai').expect;

var fs = require('fs');

import Template = Chonmage.Template;

describe('Parser.parse', function () {
    var Template = Chonmage.Template;
    it('correctly parse', function () {
        var expected:Template.ITemplateParseResult = {
            contextType: 'IContextType',
            references: [
                'foo/bar/a.ts',
                '../foo/bar/b.ts',
                '../foo/bar/c.ts',
            ],
            tree: new Template.TemplateNodeTree([
                new Template.StringNode('string'),
                new Template.StringNode('\\n'),
                new Template.SectionNode('section', false, [
                    new Template.VariableNode('escapedVariable', true),
                    new Template.SectionNode('invertedSection', true, [
                        new Template.VariableNode('unescapedVariable', false),
                    ])
                ]),
                new Template.StringNode('\\n'),
            ])
        };

        var template:string = fs.readFileSync(Chonmage.TestSettings.templateDir + '/parse_test_template_01.tmpl', {encoding: 'utf8'});
        var actual:Template.ITemplateParseResult = new Chonmage.Template.Parser().parse(template);
        expect(actual).to.eql(expected);
    });

    it('throw Error when contextTypeDeclaration is duplicated.', function () {
        var template:string = fs.readFileSync(Chonmage.TestSettings.templateDir + '/duplicated_context_declaration.tmpl', {encoding: 'utf8'});
        expect(()=> new Chonmage.Template.Parser().parse(template)).throw();
    });
});