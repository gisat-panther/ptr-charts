import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import filesize from "rollup-plugin-filesize";
import postcss from "rollup-plugin-postcss";
import postcssUrl from "./build/plugins/postcssUrl";
import path from "path";

const env = process.env.NODE_ENV;
const pkg = require("./package.json");

// process.env.NODE_ENV = 'development'

const CWD = process.cwd();
const Paths = {
  SRC: `${CWD}/src`,
  DIST: `${CWD}/dist`,
  NODE_MODULES: `${CWD}/node_modules`,
};
Object.assign(Paths, {
  INPUT: Paths.SRC + "/index.js",
  OUTPUT: Paths.DIST + "/index.js",
});

const lodashExternal = [
  "lodash/indexOf",
  "lodash/get",
  "lodash/forEach",
  "lodash/isString",
  "lodash/min",
  "lodash/max",
  "lodash/set",
  "lodash/map",
  "lodash/intersection",
  "lodash/includes",
  "lodash/isArray",
  "lodash/isObject",
  "lodash/cloneDeep",
  "lodash/reverse",
  "lodash/sum",
  "lodash/forIn",
  "lodash/sortBy",
  "lodash/flatten",
  "lodash/uniqBy",
];

export default {
  input: "src/index.js",
  external: [
    "react",
    "react/jsx-runtime",
    "prop-types",
    "classnames",
    "chroma-js",
    "moment",
    "d3",
    "d3-sankey",
    "react-resize-detector",
    "dom-to-image",
    "downloadjs",
    "@gisatcz/ptr-core",
    "@gisatcz/ptr-atoms",
    "@gisatcz/ptr-utils",
    "@gisatcz/ptr-locales",
    "@gisatcz/cross-package-react-context",
    "react-rnd",
    /@babel\/runtime/,
    ...lodashExternal,
  ],
  output: {
    file: {
      es: "dist/index.es.js",
      cjs: pkg.main,
    }[env],
    format: env,
    globals: {
      // 'lodash/random': '_.random'
    },
    exports: "named" /** Disable warning for default imports */,
    sourcemap: true,
  },
  plugins: [
    babel({
      plugins: ["lodash"],
      babelHelpers: "runtime",
    }),
    commonjs({
      include: "node_modules/**",
    }),
    postcss({
      extract: path.resolve(Paths.DIST + "/style.css"),
      plugins: [
        ...postcssUrl({
          basePath: [Paths.SRC, Paths.NODE_MODULES],
          assetsPath: Paths.DIST + "/assets",
          dest: Paths.DIST,
        }),
      ],
    }),
    filesize(),
  ],
};
