class AssetConfigPlugin {
    /**
     * @param {Partial<AssetConfigPlugin>} options
     */
    constructor(options = {}) {
      this.options = Object.assign({}, options);
    }
  
    /**
     * @param {WebpackCompiler} compiler
     */
    apply(compiler) {
      const config = require("./config/index.js")(this.options);
      // Merge config
      config.plugins.forEach((plugin) => plugin.apply(compiler));
      compiler.hooks.afterEnvironment.tap("AssetConfigPlugin", () => {
        compiler.options.module.rules.push(...config.module.rules);
      });
    }
  }
  
  exports = module.exports = AssetConfigPlugin;