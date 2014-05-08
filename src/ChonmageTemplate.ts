declare var ChonmageTemplates:Chonmage.ITemplateStore;

(function (global) {
    if (!("process" in global)) {
        global["ChonmageTemplates"] = {
            get: function (name:string) {
                return this.templates[name];
            },
            templates: []
        }
    }
})(<any>(new Function('return this;')()));

module Chonmage {
    export interface ITemplateStore {
        get(name:string):void;
    }

    var rAmp = /&/g,
        rLt = /</g,
        rGt = />/g,
        rApos = /\'/g,
        rQuot = /\"/g,
        hChars = /[&<>\"\']/;


    export class Compiled <T> {
        constructor(private compiled:(T)=> string) {
        }

        public render(context:T):string {
            return this.compiled(context);
        }

        private coerceToString(val:any) {
            return String((val === null || val === undefined) ? '' : val);
        }

        private esc(str:any):string {
            str = this.coerceToString(str);
            return hChars.test(str) ?
                str
                    .replace(rAmp, '&amp;')
                    .replace(rLt, '&lt;')
                    .replace(rGt, '&gt;')
                    .replace(rApos, '&#39;')
                    .replace(rQuot, '&quot;') :
                str;
        }
    }
}
