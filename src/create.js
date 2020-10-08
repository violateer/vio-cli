const axios = require('axios')
const ora = require('ora')
const Inquirer = require('inquirer')
const path = require('path')
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
    await ncp(result, path.resolve(proname))
}