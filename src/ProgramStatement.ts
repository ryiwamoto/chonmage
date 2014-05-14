/// <reference path="ProgramStatementToStringVisitor.ts" />

module Chonmage.Generator {
    export interface IProgramStatement {
        children:IProgramStatement[]
        toJSON(): any;
        accept(visitor:IProgramStatementToStringVisitor):string;
    }

    export interface IContainerStatement {
        getContainerName(): string;
    }

    export interface ISymbolStatement {
        symbol: string;
        container:IContainerStatement;
    }

    export class RootModule implements IContainerStatement {
        getContainerName():string {
            return '';
        }
    }

    export class ProgramStatementTree implements IProgramStatement, IContainerStatement {
        public children:IProgramStatement[] = [];

        public constructor(public contextType:string) {

        }

        public add(statement:IProgramStatement) {
            this.children.push(statement);
        }

        public getContainerName():string {
            return 'context';
        }

        public toString():string {
            return JSON.stringify(this.toJSON());
        }

        public toJSON():any {
            return this.children.map(c => c.toJSON())
        }

        public accept(visitor:IProgramStatementToStringVisitor):string {
            return visitor.visitProgramStatementTree(this);
        }
    }

    export class ConditionStatement implements IProgramStatement, ISymbolStatement {
        constructor(public symbol:string, public container:IContainerStatement, public children:IProgramStatement[], public isInverted:boolean) {
        }

        public toJSON():any {
            return {
                statement: 'array',
                symbol: this.symbol,
                container: this.container.getContainerName(),
                children: this.children.map(c => c.toJSON())
            };
        }

        public accept(visitor:IProgramStatementToStringVisitor):string {
            return visitor.visitConditionStatement(this);
        }
    }

    export class ArrayLoopStatement implements IProgramStatement, IContainerStatement, ISymbolStatement {
        static counter:number = 0;

        public children:IProgramStatement[];

        constructor(public symbol:string, public container:IContainerStatement, private arrayUUID:number) {
        }

        public getLoopUUID(): number{
            return this.arrayUUID;
        }

        public getContainerName():string {
            return '__item_' + this.arrayUUID + '';
        }

        public toJSON():any {
            return {
                statement: 'array',
                symbol: this.symbol,
                container: this.container.getContainerName(),
                children: this.children.map(c => c.toJSON())
            };
        }

        public accept(visitor:IProgramStatementToStringVisitor):string {
            return visitor.visitArrayLoopStatement(this);
        }
    }

    export class VariableStatement implements IProgramStatement, ISymbolStatement {
        public children:IProgramStatement[] = [];

        constructor(public symbol:string, public container:IContainerStatement, public type:string, public escape:boolean) {
        }

        public toJSON():any {
            return {
                statement: 'variable',
                symbol: this.symbol,
                container: this.container.getContainerName(),
                type: this.type,
                escape: this.escape
            };
        }

        public accept(visitor:IProgramStatementToStringVisitor):string {
            return visitor.visitVariableStatement(this);
        }
    }

    export class StringStatement implements IProgramStatement {
        public children:IProgramStatement[] = [];

        constructor(public text:string) {
        }

        public toJSON():any {
            return {
                statement: 'string',
                text: this.text
            };
        }

        public accept(visitor:IProgramStatementToStringVisitor):string {
            return visitor.visitStringStatement(this);
        }
    }

    export class CommentStatement implements IProgramStatement {
        public children:IProgramStatement[] = [];

        constructor(public text:string) {
        }

        public toJSON():any {
            return {
                statement: 'comment',
                text: this.text
            };
        }

        public accept(visitor:IProgramStatementToStringVisitor):string {
            return visitor.visitCommentStatement(this);
        }
    }
}
