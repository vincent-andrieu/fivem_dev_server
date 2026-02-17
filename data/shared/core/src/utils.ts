export type NonFunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
export type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

export type Coords = [number, number, number]; // x, y, z
export type Position = { x: number; y: number; z: number; heading: number };
export type Color = [number, number, number, number]; // r, g, b, a

export function distance3D(coordsA: { x: number; y: number; z: number }, coordsB: { x: number; y: number; z: number }): number {
    const dx = coordsA.x - coordsB.x;
    const dy = coordsA.y - coordsB.y;
    const dz = coordsA.z - coordsB.z;

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function nonBlockingWait(waitCondition: () => boolean, ms: number): Promise<void> {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            if (!waitCondition()) {
                clearInterval(interval);
                resolve();
            }
        }, ms);
    });
}

export function isNotObjectId(obj: any): boolean {
    return typeof obj === "object" && typeof (obj as any).toHexString !== "function";
}
