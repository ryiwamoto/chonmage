/// <reference path="../typings/typescript/typescriptServices.d.ts" />

module Chonmage {
    var _fs = require('fs');
    var _path = require('path');

    //from harness.ts
    export class ScriptInfo {

        public version:number = 1;
        public editRanges:{ length: number; textChangeRange: TypeScript.TextChangeRange; }[] = [];
        public lineMap:TypeScript.LineMap = null;

        constructor(public fileName:string, public content:string, public isOpen = true, public byteOrderMark:TypeScript.ByteOrderMark = TypeScript.ByteOrderMark.None) {
            this.setContent(content);
        }

        private setContent(content:string):void {
            this.content = content;
            this.lineMap = TypeScript.LineMap1.fromString(content);
        }

        public updateContent(content:string):void {
            var old_length = this.content.length;
            this.setContent(content);
            this.editRanges.push({
                length: content.length,
                textChangeRange: // NOTE: no shortcut for "update everything" (null only works in some places, #10)
                    new TypeScript.TextChangeRange(new TypeScript.TextSpan(0, old_length), content.length)
            });
            this.version++;
        }

        public editContent(minChar:number, limChar:number, newText:string):void {
            // Apply edits
            var prefix = this.content.substring(0, minChar);
            var middle = newText;
            var suffix = this.content.substring(limChar);
            this.setContent(prefix + middle + suffix);

            // Store edit range + new length of script
            this.editRanges.push({
                length: this.content.length,
                textChangeRange: new TypeScript.TextChangeRange(
                    TypeScript.TextSpan.fromBounds(minChar, limChar), newText.length)
            });

            // Update version #
            this.version++;
        }

        public getTextChangeRangeBetweenVersions(startVersion:number, endVersion:number):TypeScript.TextChangeRange {
            if (startVersion === endVersion) {
                // No edits!
                return TypeScript.TextChangeRange.unchanged;
            }

            var initialEditRangeIndex = this.editRanges.length - (this.version - startVersion);
            var lastEditRangeIndex = this.editRanges.length - (this.version - endVersion);

            var entries = this.editRanges.slice(initialEditRangeIndex, lastEditRangeIndex);
            return TypeScript.TextChangeRange.collapseChangesAcrossMultipleVersions(entries.map(e => e.textChangeRange));
        }
    }

    class LanguageServiceHost implements TypeScript.Services.ILanguageServiceHost {
        private compilationSettings:TypeScript.CompilationSettings;

        private scripts:TypeScript.StringHashTable<ScriptInfo>;

        constructor(compilationSettings:TypeScript.CompilationSettings) {
            this.compilationSettings = compilationSettings;
            this.scripts = new TypeScript.StringHashTable<ScriptInfo>();
        }

        //--------------------IReferenceResolverHost--------------------
        public resolveRelativePath(path:string, directory:string = null):string {
            return directory ? _path.resolve(_path.join(directory, path)) : _path.resolve(path);
        }

        public fileExists(path:string):boolean {
            return _fs.existsSync(path);
        }

        public directoryExists(path:string):boolean {
            return _fs.existsSync(path) && _fs.statSync(path).isDirectory();
        }

        public getParentDirectory(path:string):string {
            return _path.dirname(path);
        }


        //--------------------ILogger--------------------
        public information():boolean {
            return false;
        }

        public debug():boolean {
            return false;
        }

        public warning():boolean {
            return false;
        }

        public error():boolean {
            return false;
        }

        public fatal():boolean {
            return false;
        }

        public log(s:string):void {
        }


        //--------------------ILanguageServiceHost--------------------
        public getCompilationSettings():TypeScript.CompilationSettings {
            return this.compilationSettings;
        }

        public getScriptFileNames():string[] {
            return this.scripts.getAllKeys();
        }

        public getScriptVersion(fileName:string):number {
            return this.scripts.lookup(fileName).version;
        }

        public getScriptIsOpen(fileName:string):boolean {
            return true;
        }

        public getScriptByteOrderMark(fileName:string):TypeScript.ByteOrderMark {
            return null;
        }

        public getScriptSnapshot(fileName:string):TypeScript.IScriptSnapshot {
            var result = TypeScript.ScriptSnapshot.fromString(this.scripts.lookup(fileName).content);
            result["getTextChangeRangeSinceVersion"] = (version) => {
                return null;
            };
            return result;
        }

        public getDiagnosticsObject():TypeScript.Services.ILanguageServicesDiagnostics {
            return {
                log: function (content:string) {
                }
            };
        }

        public getLocalizedDiagnosticMessages():any {
            return null;
        }

        //--------------------others--------------------
        public addOrUpdateScript(fileName:string) {
            var resolvedPath = this.resolveRelativePath(fileName);
            var content = _fs.readFileSync(resolvedPath, {encoding: 'utf8'});
            this.scripts.addOrUpdate(resolvedPath, new ScriptInfo(resolvedPath, content));
        }
    }

    export class TypeScriptLanguageService {
        private lsHost:LanguageServiceHost;
        private ls:TypeScript.Services.ILanguageService;

        constructor(compilationSettings:TypeScript.CompilationSettings) {
            this.lsHost = new LanguageServiceHost(compilationSettings);
            this.ls = new TypeScript.Services.TypeScriptServicesFactory().createPullLanguageService(this.lsHost);
        }

        public addScript(path:string, rootPath?:string) {
            this.lsHost.addOrUpdateScript(this.lsHost.resolveRelativePath(path, rootPath));
        }

        public findSymbol(symbol:string, containerName:string):TypeScript.Services.NavigateToItem {
            var splited = symbol.split('.')
            var query = splited.pop();
            var suffix = splited.length ? '.' + splited.join('.') : '';
            var navigateToItems = this.ls.getNavigateToItems(query);
            if (!navigateToItems.length) {
                return null;
            }
            for (var i = 0, _len = navigateToItems.length; i < _len; i++) {
                var item = navigateToItems[i];
                if (item.containerName === containerName + suffix) {
                    return item;
                }
            }
            return null;
        }

        public findMemberName(item:TypeScript.Services.NavigateToItem):string {
            if (item.kind !== 'property') {
                return TypeStringUtil.concat(item.containerName, item.name);
            }
            var typeInfo = this.ls.getTypeAtPosition(item.fileName, item.minChar)
            return TypeScript.MemberName.memberNameToString(typeInfo.memberName);
        }
    }
}