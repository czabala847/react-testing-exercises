module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    ["@babel/preset-react", { runtime: "automatic" }],
    "@babel/preset-typescript",
  ],
  plugins: [
    function stubImportMeta({ types: t }) {
      return {
        visitor: {
          MetaProperty(path) {
            path.replaceWith(t.objectExpression([]));
          },
        },
      };
    },
  ],
};
