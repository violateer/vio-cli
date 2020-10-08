const axios = require('axios')
//获取仓库模板信息
const fetchRepoList = async () => {
    const {
        data
    } = await axios.get("https://api.github.com/orgs/vio-cli/repos", {
        params: null,
        headers: {
            'User-Agent': 'Mozilla/5.0',
            'Authorization': 'token 62f637331c36ceb662a5e13d4d2b279e38f6601b',
            'Content-Type': 'application/json',
            'method': 'GET',
            'Accept': 'application/json'
        }
    })
    return data
}

module.exports = async () => {
    let repos = await fetchRepoList()
    repos = repos.map(item => item.name)
    console.log(repos);
}