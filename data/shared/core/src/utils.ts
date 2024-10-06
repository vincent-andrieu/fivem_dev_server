export type NonFunctionPropertyNames<T> = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
export type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

export type Coords = [number, number, number]; // x, y, z
export type Position = { x: number; y: number; z: number; heading: number };
export type Color = [number, number, number, number]; // r, g, b, a

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
