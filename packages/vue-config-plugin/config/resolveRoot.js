const path = require('path')
const resolveRoot = (...args) => {
    return path.resolve(process.cwd(), ...args);
};

module.exports = resolveRoot