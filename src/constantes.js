// 该文件用于存放用户的变量
const {
    version
} = require('../package.json')
const downloadDirectory = `${process.env[process.platform === 'darwin' ? 'HOME' : 'USERPROFILE']}/.template`

module.exports = {
    version,
    downloadDirectory
}