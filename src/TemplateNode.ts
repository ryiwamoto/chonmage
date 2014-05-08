/// <reference path="TemplateNodeToProgramVisitor.ts" />
module Chonmage.Template {
    export interface ITemplateNode {
        children: ITemplateNode[];
        accept(visitor:Generator.ITemplateNodeToProgramVisitor, scopeChain:Generator.Scope[]): Generator.IProgramStatement;
    }

    export class TemplateNodeTree {
        constructor(public children:ITemplateNode[]) {
        }

        accept(visitor:Generator.ITemplateNodeToProgramVisitor, scopeChain:Generator.Scope[]):Generator.IProgramStatement[] {
            return this.children.map(c => c.accept(visitor, scopeChain))
        }
    }

    export class StringNode implements ITemplateNode {
        public children:ITemplateNode[] = [];

        constructor(public text:string) {
        }

        public accept(visitor:Generator.ITemplateNodeToProgramVisitor, scopeChain:Generator.Scope[]):Generator.IProgramStatement {
            return visitor.visitStringNode(this, scopeChain);
        }
    }

    export class SectionNode implements ITemplateNode {
        constructor(public symbol:string, public isInverted:boolean, public children:ITemplateNode[]) {
        }

        public accept(visitor:Generator.ITemplateNodeToProgramVisitor, scopeChain:Generator.Scope[]):Generator.IProgramStatement {
            return visitor.visitSectionNode(this, scopeChain);
        }
    }

    export class CommentNode implements ITemplateNode {
        public children:ITemplateNode[] = [];

        constructor(public text:string) {
        }

        public accept(visitor:Generator.ITemplateNodeToProgramVisitor, scopeChain:Generator.Scope[]):Generator.IProgramStatement {
            return visitor.visitCommentNode(this, scopeChain);
        }
    }

    export class VariableNode implements ITemplateNode {
        public children:ITemplateNode[] = [];

        constructor(public symbol:string, public escape:boolean) {
        }

        public accept(visitor:Generator.ITemplateNodeToProgramVisitor, scopeChain:Generator.Scope[]):Generator.IProgramStatement {
            return visitor.visitVariableNode(this, scopeChain);
        }
    }
}