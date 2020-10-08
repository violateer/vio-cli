const axios = require('axios')
const ora = require('ora')
const Inquirer = require('inquirer')
//获取仓库模板信息
const fetchRepoList = async () => {
    const {
        data
    } = await axios.get("https://api.github.com/orgs/vio-cli/repos", {
        params: null,
        headers: {
            'User-Agent': 'Mozilla/5.0',
            'Authorization': 'token 91a4c6cd68960a1d07c09c01e60d5d8a5f361d31',
            'Content-Type': 'application/json',
            'method': 'GET',
            'Accept': 'application/json'
        }
    })
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
    } = await axios.get(`https://api.github.com/repos/vio-cli/${repo}/tags`, {
        params: null,
        headers: {
            'User-Agent': 'Mozilla/5.0',
            'Authorization': 'token 91a4c6cd68960a1d07c09c01e60d5d8a5f361d31',
            'Content-Type': 'application/json',
            'method': 'GET',
            'Accept': 'application/json'
        }
    })
    return data
}

module.exports = async () => {
    // 获取项目模板
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
    // 获取对应版本号
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
    console.log(repo, tag);
}