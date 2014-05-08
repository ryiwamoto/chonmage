/// <reference path="../typings/tsd.d.ts" />
/// <reference path="TemplateNodeToProgramVisitor.ts" />
/// <reference path="TemplateNode.ts" />

var Hogan = <Hogan>require('hogan.js');

module Chonmage.Template {
    import Template = Chonmage.Template;

    export interface ITemplateParseResult {
        contextType:string;
        references: string[];
        tree: TemplateNodeTree
    }

    export class Parser {
        static referencePattern = /\s*reference="([^"]+)"\s*/;
        static contextTypePattern = /\s*context:\s*([\w.]+)\s*/;

        private contextType:string;
        private references:string[] = [];

        public parse(template:string):Chonmage.Template.ITemplateParseResult {
            var nodes = Hogan.parse(Hogan.scan(template)).map(n=>this.toTemplateNode(n)).filter(n => !!n)
            if (!this.contextType) {
                throw new Error('contextType was not found.')
            }
            if (!this.references) {
                throw new Error('reference file is not found.')
            }
            return {
                contextType: this.contextType,
                references: this.references,
                tree: new TemplateNodeTree(nodes)
            };
        }

        public toTemplateNode(hoganNode:HoganNode):ITemplateNode {
            switch (hoganNode.tag) {
                case '#':
                    return this.parseSectionNode(hoganNode, false);
                case '^':
                    return this.parseSectionNode(hoganNode, true);
                case '_v':
                    return this.parseVariableNode(hoganNode, true);
                case '{':
                case '&':
                    return this.parseVariableNode(hoganNode, false);
                case undefined:
                    return this.parseStringNode(hoganNode);
                case '\n':
                    return this.parseStringNode('\\n');
                case '!' :
                    return this.parseCommentNode(hoganNode);
                default:
                    throw Error('tag: ' + hoganNode.tag + ' is not supported.');
            }
        }

        private parseSectionNode(hoganNode:HoganNode, isInverted:boolean):ITemplateNode {
            return new SectionNode(
                hoganNode.n,
                isInverted,
                hoganNode.nodes.map(n => this.toTemplateNode(n)).filter(n => !!n)
            );
        }

        private parseVariableNode(hoganNode:HoganNode, escape:boolean):ITemplateNode {
            return new VariableNode(hoganNode.n, escape);
        }

        private parseStringNode(value:any):ITemplateNode {
            return new StringNode(value + '');
        }

        private parseCommentNode(hoganNode:HoganNode):ITemplateNode {
            var referenceMatch:RegExpExecArray, contextTypeMatch:RegExpExecArray;
            if (referenceMatch = Parser.referencePattern.exec(hoganNode.n)) {
                this.references.push(referenceMatch[1])
                return null;
            } else if (contextTypeMatch = Parser.contextTypePattern.exec(hoganNode.n)) {
                if (this.contextType) {
                    throw new Error('ContextTypePattern is duplicated.');
                }
                this.contextType = contextTypeMatch[1];
                return null;
            } else {
                return new CommentNode(hoganNode.n);
            }
        }
    }
}