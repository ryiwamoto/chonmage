/// <reference path="../typings/typescript/typescriptServices.d.ts" />
/// <reference path="../typings/tsd.d.ts" />
declare module Chonmage.TypeStringUtil {
    class Primitives {
        static string: string;
        static boolean: string;
        static number: string;
        static Array: string;
        static Function: string;
        static Object: string;
    }
    function isPrimitive(type: string): boolean;
    function isString(type: string): boolean;
    function isBoolean(type: string): boolean;
    function isNumber(type: string): boolean;
    function isArray(type: string): boolean;
    function getArrayItem(type: string): string;
    function concat(typeA: string, typeB: string): string;
    function getContainerName(type: string): string;
}
declare module Chonmage.Generator {
    interface IProgramStatementToStringVisitor {
        visitProgramStatementTree(tree: ProgramStatementTree): string;
        visitConditionStatement(statement: ConditionStatement): string;
        visitArrayLoopStatement(statement: ArrayLoopStatement): string;
        visitVariableStatement(statement: VariableStatement): string;
        visitStringStatement(statement: StringStatement): string;
        visitCommentStatement(statement: CommentStatement): string;
    }
    class ProgramStatementToStringVisitor implements IProgramStatementToStringVisitor {
        private deleteComment;
        constructor(deleteComment?: boolean);
        public visitProgramStatementTree(tree: ProgramStatementTree): string;
        private createInit(contextType, code);
        private getPrecompiledSymbol(statement);
        public visitConditionStatement(statement: ConditionStatement): string;
        public visitArrayLoopStatement(statement: ArrayLoopStatement): string;
        public visitVariableStatement(statement: VariableStatement): string;
        public visitStringStatement(statement: StringStatement): string;
        public visitCommentStatement(statement: CommentStatement): string;
    }
}
declare module Chonmage.Generator {
    interface IProgramStatement {
        children: IProgramStatement[];
        toJSON(): any;
        accept(visitor: IProgramStatementToStringVisitor): string;
    }
    interface IContainerStatement {
        getContainerName(): string;
    }
    interface ISymbolStatement {
        symbol: string;
        container: IContainerStatement;
    }
    class RootModule implements IContainerStatement {
        public getContainerName(): string;
    }
    class ProgramStatementTree implements IProgramStatement, IContainerStatement {
        public contextType: string;
        public children: IProgramStatement[];
        constructor(contextType: string);
        public add(statement: IProgramStatement): void;
        public getContainerName(): string;
        public toString(): string;
        public toJSON(): any;
        public accept(visitor: IProgramStatementToStringVisitor): string;
    }
    class ConditionStatement implements IProgramStatement, ISymbolStatement {
        public symbol: string;
        public container: IContainerStatement;
        public children: IProgramStatement[];
        public isInverted: boolean;
        constructor(symbol: string, container: IContainerStatement, children: IProgramStatement[], isInverted: boolean);
        public toJSON(): any;
        public accept(visitor: IProgramStatementToStringVisitor): string;
    }
    class ArrayLoopStatement implements IProgramStatement, IContainerStatement, ISymbolStatement {
        public symbol: string;
        public container: IContainerStatement;
        private arrayUUID;
        static counter: number;
        public children: IProgramStatement[];
        constructor(symbol: string, container: IContainerStatement, arrayUUID: number);
        public getContainerName(): string;
        public toJSON(): any;
        public accept(visitor: IProgramStatementToStringVisitor): string;
    }
    class VariableStatement implements IProgramStatement, ISymbolStatement {
        public symbol: string;
        public container: IContainerStatement;
        public type: string;
        public escape: boolean;
        public children: IProgramStatement[];
        constructor(symbol: string, container: IContainerStatement, type: string, escape: boolean);
        public toJSON(): any;
        public accept(visitor: IProgramStatementToStringVisitor): string;
    }
    class StringStatement implements IProgramStatement {
        public text: string;
        public children: IProgramStatement[];
        constructor(text: string);
        public toJSON(): any;
        public accept(visitor: IProgramStatementToStringVisitor): string;
    }
    class CommentStatement implements IProgramStatement {
        public text: string;
        public children: IProgramStatement[];
        constructor(text: string);
        public toJSON(): any;
        public accept(visitor: IProgramStatementToStringVisitor): string;
    }
}
declare module Chonmage.Template {
    interface ITemplateNode {
        children: ITemplateNode[];
        accept(visitor: Generator.ITemplateNodeToProgramVisitor, scopeChain: Generator.Scope[]): Generator.IProgramStatement;
    }
    class TemplateNodeTree {
        public children: ITemplateNode[];
        constructor(children: ITemplateNode[]);
        public accept(visitor: Generator.ITemplateNodeToProgramVisitor, scopeChain: Generator.Scope[]): Generator.IProgramStatement[];
    }
    class StringNode implements ITemplateNode {
        public text: string;
        public children: ITemplateNode[];
        constructor(text: string);
        public accept(visitor: Generator.ITemplateNodeToProgramVisitor, scopeChain: Generator.Scope[]): Generator.IProgramStatement;
    }
    class SectionNode implements ITemplateNode {
        public symbol: string;
        public isInverted: boolean;
        public children: ITemplateNode[];
        constructor(symbol: string, isInverted: boolean, children: ITemplateNode[]);
        public accept(visitor: Generator.ITemplateNodeToProgramVisitor, scopeChain: Generator.Scope[]): Generator.IProgramStatement;
    }
    class CommentNode implements ITemplateNode {
        public text: string;
        public children: ITemplateNode[];
        constructor(text: string);
        public accept(visitor: Generator.ITemplateNodeToProgramVisitor, scopeChain: Generator.Scope[]): Generator.IProgramStatement;
    }
    class VariableNode implements ITemplateNode {
        public symbol: string;
        public escape: boolean;
        public children: ITemplateNode[];
        constructor(symbol: string, escape: boolean);
        public accept(visitor: Generator.ITemplateNodeToProgramVisitor, scopeChain: Generator.Scope[]): Generator.IProgramStatement;
    }
}
declare module Chonmage {
    class ScriptInfo {
        public fileName: string;
        public content: string;
        public isOpen: boolean;
        public byteOrderMark: TypeScript.ByteOrderMark;
        public version: number;
        public editRanges: {
            length: number;
            textChangeRange: TypeScript.TextChangeRange;
        }[];
        public lineMap: TypeScript.LineMap;
        constructor(fileName: string, content: string, isOpen?: boolean, byteOrderMark?: TypeScript.ByteOrderMark);
        private setContent(content);
        public updateContent(content: string): void;
        public editContent(minChar: number, limChar: number, newText: string): void;
        public getTextChangeRangeBetweenVersions(startVersion: number, endVersion: number): TypeScript.TextChangeRange;
    }
    class TypeScriptLanguageService {
        private lsHost;
        private ls;
        constructor(compilationSettings: TypeScript.CompilationSettings);
        public addScript(path: string, rootPath?: string): void;
        public findSymbol(symbol: string, containerName: string): TypeScript.Services.NavigateToItem;
        public findMemberName(item: TypeScript.Services.NavigateToItem): string;
    }
}
declare module Chonmage.Generator {
    interface ITemplateNodeToProgramVisitor {
        visitStringNode(node: Chonmage.Template.StringNode, scopeChain: Scope[]): IProgramStatement;
        visitSectionNode(node: Chonmage.Template.SectionNode, scopeChain: Scope[]): IProgramStatement;
        visitCommentNode(node: Chonmage.Template.CommentNode, scopeChain: Scope[]): IProgramStatement;
        visitVariableNode(node: Chonmage.Template.VariableNode, scopeChain: Scope[]): IProgramStatement;
    }
    class Scope {
        public fullSymbol: string;
        public container: IContainerStatement;
        public isArrayItem: boolean;
        constructor(fullSymbol: string, container: IContainerStatement, isArrayItem?: boolean);
    }
    class TemplateNodeToProgramVisitor implements ITemplateNodeToProgramVisitor {
        private ls;
        private rootPath;
        private arrayUUID;
        private typeResolver;
        constructor(ls: TypeScriptLanguageService, rootPath: string);
        public visitTree(contextType: string, references: string[], nodeTree: Chonmage.Template.TemplateNodeTree): ProgramStatementTree;
        public visitStringNode(node: Chonmage.Template.StringNode, scopeChain: Scope[]): IProgramStatement;
        public visitSectionNode(node: Chonmage.Template.SectionNode, scopeChain: Scope[]): IProgramStatement;
        private createArrayLoopStatement(node, scopeChain, assignedVarInfo);
        private createNewArrayScope(assignedVarInfo, scopeChain, arrayLoopStatement);
        public visitCommentNode(node: Chonmage.Template.CommentNode, scopeChain: Scope[]): IProgramStatement;
        public visitVariableNode(node: Chonmage.Template.VariableNode, scopeChain: Scope[]): IProgramStatement;
    }
}
declare var Hogan: Hogan;
declare module Chonmage.Template {
    interface ITemplateParseResult {
        contextType: string;
        references: string[];
        tree: TemplateNodeTree;
    }
    class Parser {
        static referencePattern: RegExp;
        static contextTypePattern: RegExp;
        private contextType;
        private references;
        public parse(template: string): ITemplateParseResult;
        public toTemplateNode(hoganNode: HoganNode): ITemplateNode;
        private parseSectionNode(hoganNode, isInverted);
        private parseVariableNode(hoganNode, escape);
        private parseStringNode(value);
        private parseCommentNode(hoganNode);
    }
}
declare var ChonmageTemplates: Chonmage.ITemplateStore;
declare module Chonmage {
    interface ITemplateStore {
        get(name: string): void;
    }
    class Compiled<T> {
        private compiled;
        constructor(compiled: (T: any) => string);
        public render(context: T): string;
        private coerceToString(val);
        private esc(str);
    }
}
declare module Chonmage.CompiledTemplate {
    var templateForBrowser: Compiled<IDestTemplate>;
}
declare module Chonmage {
    function compile(templateContent: string, rootPath: string): ICompileResult;
    interface ICompileResult {
        references: string[];
        contextType: string;
        compiled: string;
    }
    interface IDestTemplate {
        references: string[];
        templateKey: string;
        contextType: string;
        compiled: string;
    }
    function createTsFileForBrowser(compileResult: ICompileResult, templateKey: string): string;
}
