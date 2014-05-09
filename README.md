chonmage
========

TypeScript template engine for web pages.

# sample

interface of rendering context
```TypeScript
interface IContext{
    booleanVar: boolean;
    numberVar: number;
    stringVar: string;
    arrayVar: IArrayItem[];
}
 
interface IArrayItem{
    stringVar: string;
}
```

template file
```mustache
{{!reference path="../IContext.ts"}}
{{!context:IContext}}
{{numberVar}}
{{stringVar}}
{{#booleanVar}}
        {{#arrayVar}}
        	{{stringVar}}
        {{/arrayVar}}
{{/booleanVar}}
```

generated TypeScript code
```TypeScript
///<reference path="../IContext.ts"/>
 
module Chonmage {
    export interface ITemplateStore {
        get(name: "chonmage_template_sample.mustache"): Chonmage.Compiled<IContext>;
    }
}
 
(<any>window)["ChonmageTemplates"]["templates"]["chonmage_template_sample.mustache"] =
    new Chonmage.Compiled<IContext>(function(context) {
        var _ = this, __b = "";
        __b += (+context.numberVar);
        __b += "\n";
        __b += _.esc(context.stringVar);
        __b += "\n";
        if (context.booleanVar) {
            context.arrayVar.forEach(function(__item_0) {
                __b += "        	";
                __b += _.esc(__item_0.stringVar);
                __b += "\n"
            })
        };
        return __b;
    });
```

[see Chonmage sample project](https://github.com/ryiwamoto/chonmage-sample)
