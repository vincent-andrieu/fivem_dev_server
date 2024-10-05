import * as mongoose from "mongoose";

export type NonFunctionPropertyNames<T> = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
export type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

export type ObjectId = mongoose.Types.ObjectId;
// export const ObjectId = mongoose.Types.ObjectId;

export function toObjectId(id: ObjectId | string) {
    if (typeof id === "string") {
        return new mongoose.Types.ObjectId(id);
    }
    return id;
}

export function isObjectId(id: Parameters<typeof mongoose.Types.ObjectId.isValid>[0]) {
    return mongoose.Types.ObjectId.isValid(id);
}

export type Coords = [number, number, number]; // x, y, z
export type Position = {
    x: number;
    y: number;
    z: number;
    heading: number;
};
export type Color = [number, number, number, number]; // r, g, b, a
