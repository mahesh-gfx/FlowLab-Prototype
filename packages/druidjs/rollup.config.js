import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import json from "@rollup/plugin-json";

const onwarn = (message, warn) => {
  if (message.code === "CIRCULAR_DEPENDENCY") return;
  warn(message);
};

export default [
  {
    input: "src/index.js",
    output: {
      sourcemap: true,
      extend: true,
      file: "dist/druid.js",
      format: "umd",
      indent: false,
      name: "druid",
    },
    plugins: [
      json({
        compact: true,
        exclude: "node_modules/**",
      }),
      resolve(),
    ],
    onwarn,
  },
  {
    input: "src/index.js",
    plugins: [
      json({
        compact: true,
      }),
      resolve(),
      terser(),
    ],
    output: {
      sourcemap: true,
      extend: true,
      file: "dist/druid.min.js",
      format: "umd",
      indent: false,
      name: "druid",
    },
    onwarn,
  },
  {
    input: "src/index.js",
    plugins: [
      json({
        compact: true,
      }),
      resolve(),
      commonjs(),
    ],
    output: {
      sourcemap: true,
      extend: true,
      file: "dist/druid.cjs",
      format: "cjs",
      indent: false,
      name: "druid",
    },
    onwarn,
  },
];
