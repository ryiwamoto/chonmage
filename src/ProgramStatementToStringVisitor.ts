/// <reference path="TypeStringUtil.ts" />
/// <reference path="ProgramStatement.ts" />

module Chonmage.Generator {
    import TypeStringUtil = Chonmage.TypeStringUtil;

    export interface IProgramStatementToStringVisitor {
        visitProgramStatementTree(tree:ProgramStatementTree): string;
        visitConditionStatement(statement:ConditionStatement): string;
        visitArrayLoopStatement(statement:ArrayLoopStatement): string;
        visitVariableStatement(statement:VariableStatement):string;
        visitStringStatement(statement:StringStatement):string;
        visitCommentStatement(statement:CommentStatement):string;
    }

    export class ProgramStatementToStringVisitor implements IProgramStatementToStringVisitor {
        constructor(private deleteComment:boolean = false) {
        }

        public visitProgramStatementTree(tree:ProgramStatementTree):string {
            return this.createInit(tree.contextType, tree.children.map(c => c.accept(this)).join(';'));
        }

        private createInit(contextType:string, code:string):string {
            return 'new Chonmage.Compiled<' + contextType + '>(function(context: ' + contextType + '){var _ = this, __b = "";' + code + '; return __b;})';
        }

        private getPrecompiledSymbol(statement:ISymbolStatement):string {
            //check "{{.}}"
            return  statement.container.getContainerName() + (statement.symbol === '' ? '' : '.') + statement.symbol;
        }

        public visitConditionStatement(statement:ConditionStatement):string {
            var self = this;
            var buffer:string = '';
            buffer += 'if(' + (statement.isInverted ? '!' : '') + this.getPrecompiledSymbol(statement) + '){';
            buffer += statement.children.map(function (child) {
                return child.accept(self);
            }).join(';');
            buffer += '}';
            return buffer;
        }

        public visitArrayLoopStatement(statement:ArrayLoopStatement):string {
            var self = this;
            var varName = this.getPrecompiledSymbol(statement);

            //for expression
            var loopCountName = '_i_' + statement.getLoopUUID();
            var loopLengthName = '_len_' + statement.getLoopUUID();
            //var _i_0 = 0; _len0 = array.length;
            var initialization = loopCountName + ' = 0, ' + loopLengthName + ' = ' + this.getPrecompiledSymbol(statement) + '.length';
            //_i_0 < _len;
            var condition = loopCountName + ' < ' + loopLengthName;
            //_i_0++
            var finalExpression = loopCountName + '++';

            var buffer:string = 'var ' + loopCountName + ', ' + loopLengthName + ';';
            buffer += 'for(' + initialization + '; ' + condition + '; ' + finalExpression + '){';
            buffer += 'var ' + statement.getContainerName() + ' = ' + varName + '[' + loopCountName + '];';//var item_0 = array[_i_0]
            buffer += statement.children.map(function (child) {
                return child.accept(self);
            }).join(';');
            buffer += '}';
            return buffer;
        }

        public visitVariableStatement(statement:VariableStatement):string {
            var symbol = this.getPrecompiledSymbol(statement);
            if (statement.escape) {
                if (Chonmage.TypeStringUtil.isString(statement.type)) {
                    return '__b += _.esc(' + symbol + ')';
                } else if (Chonmage.TypeStringUtil.isNumber(statement.type)) {
                    return '__b += (+' + symbol + ')';
                }
            } else {
                return '__b += ' + symbol;
            }
        }

        public visitStringStatement(statement:StringStatement):string {
            return '__b += "' + statement.text.replace(/"/g, '\\"') + '"';
        }

        public visitCommentStatement(statement:CommentStatement):string {
            if (this.deleteComment) {
                return '';
            } else {
                return '__b += "<!-- ' + statement.text.replace(/"/g, '\\"') + ' -->"';
            }
        }
    }
}
