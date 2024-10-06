import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
    input: "src/index.ts", // The entry point of your application
    output: {
        file: "build/index.js", // The output bundled file
        format: "commonjs" // The output format ('module', 'commonjs', 'iife', 'umd', 'amd', 'system')
    },
    external: ["mongoose"],
    plugins: [
        resolve(), // Allows Rollup to resolve modules
        commonjs(), // Converts CommonJS modules to ES6
        typescript()
    ]
};
