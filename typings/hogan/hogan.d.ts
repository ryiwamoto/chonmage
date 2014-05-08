interface HoganToken {
    tag?: string;
    otag?:string;
    ctag?: string;
    i?: number;
    n?: string
}

interface HoganNode extends HoganToken{
    nodes: HoganNode[]
}

interface Hogan {
    scan(template:string): HoganToken[];
    parse(tokens:HoganToken[]): HoganNode[];
}
