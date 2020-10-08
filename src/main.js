const {
    version
} = require('./constantes')

// 获取版本号
const program = require('commander');

program.version(version).parse(process.argv);