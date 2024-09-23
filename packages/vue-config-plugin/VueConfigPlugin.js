
class VueConfigPlugin {
    constructor(options = {}) {
        this.options = Object.assign({}, options);
    }
    apply(compiler) {
        const config = require("../config/index.js")(this.options);
        config.plugins.forEach((plugin) => plugin.apply(compiler));
        compiler.hooks.afterEnvironment.tap("VueConfigPlugin", () => {
            compiler.options.module.rules.push(...config.module.rules);
        });
    }

}