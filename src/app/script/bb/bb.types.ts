
export interface IVector2D {
    x: number;
    y: number;
}

export interface ISize2D {
    width: number;
    height: number;
}

export interface IKeyString {
    [key: string]: string;
}

export interface ISVG {
    elementType: string;
    childrenArr?: ISVG[];
    [key: string]: string | ISVG[]; // only string really
}