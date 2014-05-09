/// <reference path="../ChonmageTemplate.ts" />
module Chonmage.CompiledTemplate{
   export var templateForBrowser: Chonmage.Compiled<Chonmage.IDestTemplate> = new Chonmage.Compiled<Chonmage.IDestTemplate>(function(context){var _ = this, __b = "";context.references.forEach(function(__item_0){__b += "///<reference path=\"";__b += _.esc(__item_0);__b += "\"/>";__b += "\n"});__b += "\n";__b += "module Chonmage{";__b += "\n";__b += "    export interface ITemplateStore {";__b += "\n";__b += "        get(name: \"";__b += context.templateKey;__b += "\"): Chonmage.Compiled<";__b += context.contextType;__b += ">;";__b += "\n";__b += "    }";__b += "\n";__b += "}";__b += "\n";__b += "\n";__b += "(<any>window)[\"ChonmageTemplates\"][\"templates\"][\"";__b += context.templateKey;__b += "\"] = ";__b += context.compiled;__b += ";";__b += "\n"; return __b;})
}