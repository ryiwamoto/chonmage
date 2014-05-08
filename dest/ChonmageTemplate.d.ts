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
