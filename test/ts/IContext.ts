module TestModule {
    export interface IContext {
        boolVar: boolean;
        strVar:string;
        numArrVar: number[];
        complexArrVar: IArrayItem[][];
    }

    export interface IArrayItem {
        strVar: string;
    }
}