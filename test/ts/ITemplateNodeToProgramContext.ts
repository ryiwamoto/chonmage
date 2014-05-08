interface ITemplateNodeToProgramContext {
    numberArr: number[];
    section: IInnerArray[];
    invertedSection: boolean;
    escapedVariable: string;
    unescapedVariable: number;
}

interface IInnerArray {
    itemStr: string;
}