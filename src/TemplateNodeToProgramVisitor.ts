/// <reference path="Parser.ts" />
/// <reference path="TypeStringUtil.ts" />
/// <reference path="ProgramStatement.ts" />
/// <reference path="TemplateNode.ts" />
/// <reference path="TypeScriptLanguageService.ts" />

module Chonmage.Generator {
    declare var __dirname:string;
    import Template = Chonmage.Template;
    import TypeStringUtil = Chonmage.TypeStringUtil;

    export interface ITemplateNodeToProgramVisitor {
        visitStringNode(node:Template.StringNode, scopeChain:Scope[]): IProgramStatement;
        visitSectionNode(node:Template.SectionNode, scopeChain:Scope[]): IProgramStatement;
        visitCommentNode(node:Template.CommentNode, scopeChain:Scope[]):IProgramStatement;
        visitVariableNode(node:Template.VariableNode, scopeChain:Scope[]):IProgramStatement;
    }

    export class Scope {
        constructor(public fullSymbol:string, public container:Generator.IContainerStatement, public isArrayItem:boolean = false) {
        }
    }

    class AssignedVarInfo {
        constructor(public symbol:string, public type:string, public container:Generator.IContainerStatement = null) {
        }
    }

    class TypeResolver {
        constructor(private ls:TypeScriptLanguageService, private rootPath:string) {
        }

        public addReferences(references:string[]) {
            this.ls.addScript(__dirname + '/../lib/lib.d.ts')//TODO inject lib.d.ts
            references.forEach(r => this.ls.addScript(r, this.rootPath))
        }

        public resolveSymbol(symbol:string, scopeChain:Scope[]):AssignedVarInfo {
            if (symbol === '.') {
                return this.findArrayItem(scopeChain)
            } else {
                return this.findSymbol(symbol, scopeChain);
            }
        }

        private findArrayItem(scopeChain:Scope[]):AssignedVarInfo {
            for (var i = scopeChain.length - 1; i >= 0; i--) {
                var currentScope = scopeChain[i];
                if (currentScope.isArrayItem) {
                    return new AssignedVarInfo('', currentScope.fullSymbol, currentScope.container);
                }
            }
        }

        private findSymbol(symbol:string, scopeChain:Scope[]):AssignedVarInfo {
            var found:TypeScript.Services.NavigateToItem = null;
            var assignedVarInfo:AssignedVarInfo;
            for (var i = scopeChain.length - 1; i >= 0; i--) {
                var currentScope = scopeChain[i];
                if (found = this.ls.findSymbol(symbol, currentScope.fullSymbol)) {
                    var memberName = this.ls.findMemberName(found);
                    assignedVarInfo = new AssignedVarInfo(
                        symbol,
                        memberName,
                        currentScope.container
                    );
                    break;
                }
            }
            if (!assignedVarInfo || assignedVarInfo.type === null || assignedVarInfo.type === undefined) {
                throw new Error('symbol:(' + symbol + ') was not found.');
            }
            return assignedVarInfo;
        }

    }

    export class TemplateNodeToProgramVisitor implements ITemplateNodeToProgramVisitor {
        private arrayUUID:number = 0;

        private typeResolver:TypeResolver;

        constructor(private ls:TypeScriptLanguageService, private rootPath:string) {
            this.typeResolver = new TypeResolver(ls, rootPath);
        }

        public visitTree(contextType:string, references:string[], nodeTree:Template.TemplateNodeTree):ProgramStatementTree {
            this.typeResolver.addReferences(references);

            var tree = new ProgramStatementTree(contextType);
            var initScope = [new Scope(TypeStringUtil.getContainerName(contextType), new RootModule()), new Scope(contextType, tree)];
            tree.children = nodeTree.accept(this, initScope);
            return tree;
        }


        public visitStringNode(node:Template.StringNode, scopeChain:Scope[]):IProgramStatement {
            return new Generator.StringStatement(node.text);
        }

        public visitSectionNode(node:Template.SectionNode, scopeChain:Scope[]):IProgramStatement {
            var assignedVarInfo = this.typeResolver.resolveSymbol(node.symbol, scopeChain);
            if (!node.isInverted && TypeStringUtil.isArray(assignedVarInfo.type)) {
                return this.createArrayLoopStatement(node, scopeChain, assignedVarInfo);
            } else if (TypeStringUtil.isBoolean(assignedVarInfo.type)) {
                var nodes = node.children.map(n => n.accept(this, scopeChain));
                return new ConditionStatement(assignedVarInfo.symbol, assignedVarInfo.container, nodes, node.isInverted)
            } else {
                throw new Error('SectionParseError: ' + node.symbol + ' is not Array/boolean but ' + assignedVarInfo.type);
            }
        }

        private createArrayLoopStatement(node:Template.SectionNode, scopeChain:Scope[], assignedVarInfo:AssignedVarInfo):ArrayLoopStatement {
            var arrayLoopStatement = new ArrayLoopStatement(assignedVarInfo.symbol, assignedVarInfo.container, this.arrayUUID++);
            var newScopeChain = this.createNewArrayScope(assignedVarInfo, scopeChain, arrayLoopStatement);
            arrayLoopStatement.children = node.children.map(n => n.accept(this, newScopeChain));
            return arrayLoopStatement;
        }

        private createNewArrayScope(assignedVarInfo:AssignedVarInfo, scopeChain:Scope[], arrayLoopStatement:ArrayLoopStatement):Scope[] {
            var arrayItemType = TypeStringUtil.getArrayItem(assignedVarInfo.type);
            var mayBeShortTypeName = !TypeStringUtil.isPrimitive(arrayItemType) && !TypeStringUtil.isArray(arrayItemType);
            var arrayItemFullSymbol = mayBeShortTypeName ? this.typeResolver.resolveSymbol(arrayItemType, scopeChain).type : arrayItemType;
            var newScope = new Scope(arrayItemFullSymbol, arrayLoopStatement, true);
            return scopeChain.concat(newScope);
        }

        public visitCommentNode(node:Template.CommentNode, scopeChain:Scope[]):IProgramStatement {
            return new CommentStatement(node.text);
        }

        public visitVariableNode(node:Template.VariableNode, scopeChain:Scope[]):IProgramStatement {
            var assignedVarInfo = this.typeResolver.resolveSymbol(node.symbol, scopeChain);
            if (TypeStringUtil.isString(assignedVarInfo.type) && TypeStringUtil.isNumber(assignedVarInfo.type)) {
                throw new Error('VariableParseError: ' + node.symbol + ' is not number/string but ' + assignedVarInfo.type);
            }
            return new VariableStatement(assignedVarInfo.symbol, assignedVarInfo.container, assignedVarInfo.type, node.escape);
        }
    }
}
