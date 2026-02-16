import path from "path";
import { fileURLToPath } from "url";
import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import alias from "@rollup/plugin-alias";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
    input: "client/src/client.ts",
    output: {
        file: "build/client/client.js",
        format: "commonjs"
    },
    treeshake: {
        moduleSideEffects: "no-external"
    },
    plugins: [
        alias({
            entries: [
                { find: "@shared/core", replacement: path.resolve(__dirname, "../../../../shared/core/build") }
            ]
        }),
        resolve(),
        commonjs(),
        typescript({
            tsconfig: "client/tsconfig.json"
        })
    ]
};
