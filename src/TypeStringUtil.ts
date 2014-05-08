module Chonmage.TypeStringUtil {
    export class Primitives {
        static string:string = 'string';
        static boolean:string = 'boolean';
        static number:string = 'number';
        static Array:string = '[]';
        static Function:string = 'Function';
        static Object:string = '{}';
    }

    export function isPrimitive(type:string):boolean {
        return type === Primitives.string ||
            type === Primitives.boolean ||
            type === Primitives.number ||
            type === Primitives.Array ||
            type === Primitives.Function ||
            type === Primitives.Object;
    }

    export function isString(type:string):boolean {
        return type === Primitives.string;
    }

    export function isBoolean(type:string):boolean {
        return type === Primitives.boolean;
    }

    export function isNumber(type:string):boolean {
        return type === Primitives.number;
    }

    export function isArray(type:string):boolean {
        return type.slice(-2) === '[]';
    }

    export function getArrayItem(type:string):string {
        return isArray(type) ? type.slice(0, -2) : '';
    }

    export function concat(typeA:string, typeB:string):string {
        return (typeA ? typeA + '.' : '') + typeB;
    }

    export function getContainerName(type:string):string {
        return type.split('.').length > 1 ? type.split('.').slice(0, -1).join('.') : '';
    }
}

