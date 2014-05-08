/// <reference path="Parser.ts" />
/// <reference path="TemplateNodeToProgramVisitor.ts" />
/// <reference path="ProgramStatementToStringVisitor.ts" />
/// <reference path="compiledTemplate/TemplateForBrowser.ts" />

module Chonmage {
    var Template = Chonmage.Template;
    var Generator = Chonmage.Generator;

    export function compile(templateContent:string, rootPath:string):ICompileResult {
        var parseResult:Template.ITemplateParseResult = new Template.Parser().parse(templateContent);
        var ls = new Chonmage.TypeScriptLanguageService(new TypeScript.CompilationSettings());
        var programStatementTree = new Generator.TemplateNodeToProgramVisitor(ls, rootPath).visitTree(
            parseResult.contextType, parseResult.references, parseResult.tree);
        return {
            references: parseResult.references,
            contextType: parseResult.contextType,
            compiled: new Generator.ProgramStatementToStringVisitor().visitProgramStatementTree(programStatementTree)
        };
    }

    export interface ICompileResult {
        references: string[];
        contextType: string;
        compiled: string;
    }

    export interface IDestTemplate {
        references: string[];
        templateKey: string;
        contextType:string;
        compiled:string;
    }

    export function createTsFileForBrowser(compileResult:ICompileResult, templateKey:string):string {
        var context:IDestTemplate = {
            references: compileResult.references,
            templateKey: templateKey,
            contextType: compileResult.contextType,
            compiled: compileResult.compiled
        };
        return Chonmage.CompiledTemplate.templateForBrowser.render(context);
    }
}

module.exports = Chonmage;
