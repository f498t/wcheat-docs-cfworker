[本地]初始化您的数据库以首先在本地运行和测试。通过运行以下命令引导新的 D1 数据库：

npx wrangler d1 execute fc25_account --local --file=./schema.sql

[本地]通过运行以下命令来验证数据是否在数据库中：

npx wrangler d1 execute fc25_account --local --command="SELECT * FROM users"

[远程]使用创建的schema.sql文件引导数据库：

npx wrangler d1 execute fc25_account --remote --file=./schema.sql

[远程]通过运行以下命令来验证数据是否在生产环境中：

npx wrangler d1 execute fc25_account --remote --command="SELECT * FROM users"

[部署]部署Worker使项目可在 Internet 上访问：

npx wrangler deploy

Outputs: https://d1-tutorial.<YOUR_SUBDOMAIN>.workers.dev


7JFHAUtLrBzVrAM0TwSwb8s47Gn9E4c5gmZo-P7X
要确认您的令牌是否工作正常，请复制下面的 CURL 命令并将其粘贴到终端 Shell 中进行测试。

curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
     -H "Authorization: Bearer 7JFHAUtLrBzVrAM0TwSwb8s47Gn9E4c5gmZo-P7X" \
     -H "Content-Type:application/json"