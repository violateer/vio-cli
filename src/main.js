const {
    version
} = require('./constantes')
const program = require('commander');
const path = require('path')
// 配置3个指令命令
const mapActions = {
    create: {
        alias: "c",
        description: "create a project",
        examples: ["vio-cli create <project-name>"]
    },
    config: {
        alias: "conf",
        description: "config project variable",
        examples: ["vio-cli config set <k><v>", "vio-cli config get <k>"]
    },
    "*": {
        alias: "",
        description: "command not found",
        examples: []
    }
}

// 循环创建命令
Reflect.ownKeys(mapActions).forEach(action => {
    program
        .command(action) // 配置命令的名称
        .alias(mapActions[action].alias) // 配置命令的别称
        .description(mapActions[action].description) // 配置命令的描述
        .action(() => {
            if (action === '*') {
                // 访问不到对应的命令
                console.log(mapActions[action].description);
            } else {
                // 截取命令
                // vio-cli create project-name
                require(path.resolve(__dirname, action))(...process.argv.slice(3))
            }
        })
})

// 监听用户的--help事件
program.on('--help', () => {
    console.log('\nExamples:');
    Reflect.ownKeys(mapActions).forEach(action => {
        mapActions[action].examples.forEach(example => {
            console.log(example);
        })
    })
})

// 获取版本号
program.version(version).parse(process.argv);