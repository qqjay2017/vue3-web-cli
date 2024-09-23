const typescript = require("typescript");
const fs = require("fs");
const path = require("path");
const { getTsConfigWarnings } = require("./TsConfigValidator");

class TsConfigPlugin {
  /**
   * configFile
   * mode
   * cacheDir
   */
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Search for a tsconfig file
   * @param {string} contextPath
   * @returns {string}
   */
  resolveTsConfigFilePath(contextPath) {
    // Try to locate a tsconfig relative to the cwd
    const resolvedFile = typescript.findConfigFile(contextPath, fs.existsSync);
    if (resolvedFile) {
      return resolvedFile;
    }
    // If no tsconfig can be found fallback to the tsconfig.base.json
    // Based on ts-loaders default tsconfig.json: https://github.com/TypeStrong/ts-loader/blob/002c0f651cf1a8e27b0e232b7fe4a982ddce6323/src/compilerSetup.ts#L57
    console.warn(
      "Couldn't find a tsconfig.json in the current working directory.\nYou can either set the configFile path explicitly or create a new config:\n  npx tsc --init"
    );
    return path.resolve(__dirname, "./config/tsconfig.base.json");
  }

  /**
   * @param {WebpackCompiler} compiler
   */
  apply(compiler) {
    const defaultOptions = {
      configFile:
        this.options.configFile ||
        this.resolveTsConfigFilePath(compiler.context),
    };
    const options = Object.assign({}, defaultOptions, this.options);
    // From https://github.com/webpack/webpack/blob/3366421f1784c449f415cda5930a8e445086f688/lib/WebpackOptionsDefaulter.js#L12-L14
    const isProductionLikeMode =
      options.mode !== undefined
        ? options.mode === "production"
        : compiler.options.mode === "production" || !compiler.options.mode;
    // Verify Config for common tsconfig issues
    const warnings = getTsConfigWarnings(options.configFile);
    if (warnings) {
      console.warn(warnings);
    }
    // Get Typescript config
    const config = isProductionLikeMode
      ? require("./config/production.config")(options)
      : require("./config/development.config")(options);
    // Merge config
    compiler.options.plugins.push(...config.plugins);
    compiler.hooks.afterEnvironment.tap("TsConfigPlugin", () => {
      compiler.options.module.rules.push(...config.module.rules);
    });
    // unshift 插入在前面(高优先级) 
    const typescriptPreExtensions = [".ts", ".tsx"].filter(
      (ext) => !(compiler.options.resolve.extensions||[]).includes(ext)
    );
    compiler.options.resolve.extensions.unshift(...typescriptPreExtensions);
    // .d.ts 低优先级
    const typescriptPostExtensions = [".d.ts"].filter(
      (ext) => !(compiler.options.resolve.extensions||[]).includes(ext)
    );
    compiler.options.resolve.extensions.push(...typescriptPostExtensions);
  }
}

exports = module.exports = TsConfigPlugin;