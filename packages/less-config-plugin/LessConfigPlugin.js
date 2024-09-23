const defaultOptions = {
  vue: true
};

class LessConfigPlugin {
  /**
   *  options
   */
  constructor(options = {}) {
    this.options = Object.assign({}, defaultOptions, options);
  }

  /**
   * @param {WebpackCompiler} compiler
   */
  apply(compiler) {
    const isProductionLikeMode =
      this.options.mode !== undefined
        ? this.options.mode === "production"
        : compiler.options.mode === "production" || !compiler.options.mode;

    const config = isProductionLikeMode
      ? require("./config/production.config")(
        Object.assign({ mode: "production" }, this.options)
      )
      : require("./config/development.config")(
        Object.assign({ mode: "development" }, this.options)
      );
    // Merge config
    compiler.options.plugins.push(...config.plugins);
    compiler.hooks.afterEnvironment.tap("LessConfigPlugin", () => {
      compiler.options.module.rules.push(...config.module.rules);

      compiler.options.optimization = {
        ...compiler.options.optimization,
        minimizer: [
          ...compiler.options.optimization.minimizer,
          ...config.optimization.minimizer,
        ],
      };
    });
  }
}

exports = module.exports = LessConfigPlugin;