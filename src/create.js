const axios = require('axios')
const ora = require('ora')
const Inquirer = require('inquirer')
const path = require('path')
const fs = require('fs')
const MetalSmith = require('metalsmith')
const {
    downloadDirectory
} = require('./constantes')
const {
    promisify
} = require('util')
let downLoadGitRepo = require('download-git-repo')
downLoadGitRepo = promisify(downLoadGitRepo)
let ncp = require('ncp')
ncp = promisify(ncp)
let {
    render
} = require('consolidate').ejs
render = promisify(render)

//获取仓库模板信息
const fetchRepoList = async () => {
    const {
        data
    } = await axios.get("https://api.github.com/orgs/vio-cli/repos")
    return data
}

// 封装loading
const waitFnLoading = (fn, message) => async (...args) => {
    // 开始加载loading
    const spinner = ora(message)
    spinner.start()

    let repos = await fn(...args)

    // 结束加载loading
    spinner.succeed()

    return repos
}

// 抓取tag列表
const fetchTagList = async (repo) => {
    const {
        data
    } = await axios.get(`https://api.github.com/repos/vio-cli/${repo}/tags`)
    return data
}

// 下载项目
const download = async (repo, tag) => {
    let api = `vio-cli/${repo}`
    if (tag) {
        api += `#${tag}`
    }
    const dist = `${downloadDirectory}/${repo}`
    await downLoadGitRepo(api, dist)
    return dist
}

module.exports = async (proname) => {
    // 1.获取项目模板
    let repos = await waitFnLoading(fetchRepoList, 'fetching template...')()
    repos = repos.map(item => item.name)
    const {
        repo
    } = await Inquirer.prompt({
        name: 'repo', // 选择后的结果
        type: 'list', // 展现的方式
        message: 'please choose a template to create a project', // 提示信息
        choices: repos // 选项
    })
    // 2.获取对应版本号
    let tags = await waitFnLoading(fetchTagList, 'fetching tags...')(repo)
    tags = tags.map(item => item.name)
    // 选择版本号
    const {
        tag
    } = await Inquirer.prompt({
        name: 'tag',
        type: 'list',
        message: 'please choose a tag to create a project',
        choices: tags
    })
    // 3.下载项目 返回一个临时的存放目录
    const result = await waitFnLoading(download, 'download template...')(repo, tag)
    if (!fs.existsSync(path.join(result, 'ask.js'))) {
        await ncp(result, path.resolve(proname))
    } else {
        // 复杂模板
        // 需要用户选择  选择后编译模板
        await new Promise((resolve, reject) => {
            // 如果传入路径  就会默认遍历当前文件夹下的src文件
            MetalSmith(__dirname)
                .source(result)
                .destination(path.resolve(proname)) // 编译要去的地方
                .use(async (files, metal, done) => {
                    // files是所有的文件
                    // 拿到提前配置好的信息  传下去渲染
                    const args = require(path.join(result, 'ask.js'))

                    // 拿到后让用户选择  返回选择的信息
                    const obj = await Inquirer.prompt(args)

                    // 将获取的信息合并传入下一个中间件use
                    const meta = metal.metadata()
                    Object.assign(meta, obj)

                    // 删除ask.js
                    delete files["ask.js"]
                    done()
                })
                .use((files, metal, done) => {
                    // 根据用户信息渲染模板
                    const obj = metal.metadata()
                    Reflect.ownKeys(files).forEach(async (file) => {
                        if (file.includes("js") || file.includes("json")) {
                            // 文件内容
                            let content = files[file].contents.toString()
                            // 判断是否为模板
                            if (content.includes("<%")) {
                                content = await render(content, obj)
                                // 渲染
                                files[file].contents = Buffer.from(content)
                            }
                        }
                    })
                    done()
                }).build(err => {
                    if (err) {
                        reject()
                    } else {
                        resolve()
                    }
                })
        })
    }
}