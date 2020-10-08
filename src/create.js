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
            'Authorization': 'token 9b6b1e176b54cb095cce5144871faf392e07f30c',
            'Content-Type': 'application/json',
            'method': 'GET',
            'Accept': 'application/json'
        }
    })
    return data
}

module.exports = async () => {
    // 开始加载loading
    const spinner = ora('fetching template...')
    spinner.start()

    let repos = await fetchRepoList()

    // 结束加载loading
    spinner.succeed()
    repos = repos.map(item => item.name)
    // console.log(repos)
    const {
        repo
    } = await Inquirer.prompt({
        name: 'repo', // 选择后的结果
        type: 'list', // 展现的方式
        message: 'please choose a template to create a project', // 提示信息
        choices: repos // 选项
    })
    console.log(repo);
}