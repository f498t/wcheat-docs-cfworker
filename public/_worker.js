export default {
    async fetch(request, env, ctx) {
        const {pathname, searchParams} = new URL(request.url);
        const request_body = await request_body_reader(request)
        if(pathname === "/userlogin"){
            if (request_body.error.length > 0){
                return Fail(request_body.error)
            }else{
                const data = request_body.json
                const result = await login(data['uuid'],env)
                if (result){
                    return Success(result)
                }else{
                    return Fail("用户不存在")
                }
            }
        }else if(pathname.startsWith("/account")){
            const account_path = pathname.slice("/account".length)
            if (account_path === "/import"){
                if (request_body.error.length > 0){
                    return Fail(request_body.error)
                }else{
                    const result = await account_service.importAccount(searchParams,request_body.form_data,env)
                    if (result.error){
                        return Fail(result.error)
                    }else{
                        return Success(result.data)
                    }
                }
            }
            const uuid = request.headers.get('x-uuid')
            if (!uuid){
                return Fail("未登录")
            }
            if (account_path === "/getAccountList"){
                const result = await account_service.getAccountList(uuid,searchParams,env)
                if (result.error){
                    return Fail(result.error)
                }else{
                    return Success(result.data)
                }
            }
            if (account_path === "/findAccount"){
                const result = await account_service.findAccount(uuid,searchParams, env)
                if (result.error){
                    return Fail(result.error)
                }else{
                    return Success(result.data)
                }
            }
            if (account_path === "/createAccount"){
                if (request_body.error.length > 0){
                    return Fail(request_body.error)
                }else{
                    const result = await account_service.createAccount(uuid, request_body.json, env)
                    if (result.error){
                        return Fail(result.error)
                    }else{
                        return Success(result.data)
                    }
                }

            }
            if (account_path === "/updateAccount"){
                if (request_body.error.length > 0){
                    return Fail(request_body.error)
                }else{
                    const result = await account_service.updateAccount(uuid,request_body.json,env)
                    if (result.error){
                        return Fail(result.error)
                    }else{
                        return Success(result.data)
                    }
                }
            }
            if (account_path === "/deleteAccount"){
                const result = await account_service.deleteAccount(uuid,searchParams,env)
                if (result.error){
                    return Fail(result.error)
                }else{
                    return Success(result.data)
                }
            }
            if (account_path === "/deleteAccountByIds"){
                const result = await account_service.deleteAccountByIds(uuid,searchParams,env)
                if (result.error){
                    return Fail(result.error)
                }else{
                    return Success(result.data)
                }
            }
            if (account_path === "/enableAccount"){
                if (request_body.error.length > 0){
                    return Fail(request_body.error)
                }else{
                    const result = await account_service.enableAccount(uuid,request_body.json,env)
                    if (result.error){
                        return Fail(result.error)
                    }else{
                        return Success(result.data)
                    }
                }
            }
        }
        return Fail("未找到请求的资源");

        // const url = new URL(request.url);

        // if (url.pathname === '/connect/auth') {
        //     return await fetch('https://accounts.ea.com/connect/auth' + url.search, request);
        // }
        // else if (url.pathname === '/connect/token') {
        //     return await fetch('https://accounts.ea.com//connect/token', request);
        // }

        // return env.ASSETS.fetch(request);
    },
};

///// request_body_reader.js

export class RequestBody{
    body = new Uint8Array()
    error = ''
    json = {}
    form_data = new FormData()
}

export const request_body_reader = async(request)=>{
    const res = new RequestBody()
    const content_type = request.headers.get("content-type")
    if (!content_type){
        res.error = "没有请求内容"
        return res
    }
    if (content_type === "application/json"){
        const reader = request.body?.getReader();
        if (!reader){
            res.error = 'Reader is undefined';
        }else{
            await reader.read().then(async ({ done, value }) => {
                if (done) {
                    res.error = 'Stream is done';
                } else {
                    const data = JSON.parse(String.fromCharCode(...value))
                    if(data){
                        res.body = value
                        res.json = data;
                    }else{
                        res.error = "解析失败"
                    }
                }
            }).catch(error => {res.error = error});
        }
    }else if(content_type.startsWith("multipart/form-data")){
        res.form_data = await request.formData()
    }else{
        const reader = request.body?.getReader();
        if (!reader){
            res.error = 'Reader is undefined';
        }else{
            await reader.read().then(async ({ done, value }) => {
                if (done) {
                    res.error = 'Stream is done';
                } else {
                    res.body = value
                }
            }).catch(error => {res.error = error});
        }
        res.error = "未知的类型："+content_type
    }
    return res
}

///// response.js
export const Success = (data, message = '')=>{
    return Response.json({
        code: 0,
        data: data,
        message: message
    });
};
export const OK = (message)=>{
    return Response.json({
        code: 0,
        data: {},
        message: message
    });
};
export const Fail = (message, data = {})=>{
    return Response.json({
        code: 1,
        data: data,
        message: message
    });
};

///// users.js
export const login = async (uuid, env) => {
    if (uuid && uuid.length > 0){
        const result = await env.DB.prepare(
            "SELECT * FROM users WHERE uuid = ? LIMIT 1",
        )
        .bind(uuid)
        .first();
        return result
    }
    return null
}

///// accounts.js
class Result{
    data = null
    error = ''
}

const get_updated_at = () => {
    return (new Date()).toISOString().replace("T", " ").replace(/\.\d{3}Z/,'');
}

const getAccountList = async(uuid, searchParams, env)=>{
    const res = new Result()
    // 查询条件
    let sql_where = " WHERE uuid='"+uuid+"'"
    const status = []
    const enable_status = []
    const dr_level = []
    const transformarket_unlocked = []
    let prop = ''
    let order = ''
    searchParams.forEach((value,key)=>{
        if(value === ""){
            return
        }
        if (key === "email"){
            sql_where += " AND email LIKE '%" + value + "%'"
        }else if(key === "record"){
            sql_where += " AND record LIKE '%" + value + "%'"
        }else if(key.startsWith("status")){
            status.push(value)
        }else if(key.startsWith("enableStatus")){
            enable_status.push(value)
        }else if(key.startsWith("drLevel")){
            dr_level.push(value)
        }else if(key.startsWith("transformarketUnlocked")){
            transformarket_unlocked.push(value)
        }else if(key === "prop"){
            prop = value
        }else if(key === "order"){
            order = value
        }
    })
    if (status.length > 0){
        sql_where += " AND status IN (" + status.join(",") + ")"
    }
    if (enable_status.length > 0){
        sql_where += " AND enable_status IN (" + enable_status.join(",") + ")"
    }
    if (dr_level.length > 0){
        sql_where += " AND dr_level IN (" + dr_level.join(",") + ")"
    }
    if (transformarket_unlocked.length > 0){
        sql_where += " AND transformarket_unlocked IN (" + transformarket_unlocked.join(",") + ")"
    }
    // 查询计数
    const total_result = await env.DB.prepare("SELECT count(*) as total FROM accounts" + sql_where).first()
    if (!total_result || !("total" in total_result)){
        res.error = "没有结果"
        return res
    }
    // 查询排序
    if (prop.length > 0){
        sql_where += " ORDER BY " + prop
        if (order === "descending"){
            sql_where += " DESC"
        }
    }
    // 查询分页
    const pageSize = searchParams.get("pageSize")
    const page = searchParams.get("page")
    const limit = pageSize? parseInt(pageSize):0 
    if (limit){
        const offset = page? limit * (parseInt(page) - 1) : 0
        sql_where += " LIMIT " + limit + " OFFSET " + offset 
    }
    // 查询结果
    const list = await env.DB.prepare("SELECT * FROM accounts" + sql_where).all()
    if (list.success){
        res.data = {
            list: list.results,
            total: total_result["total"],
            page: page,
            pageSize: pageSize
        }
    }else{
        res.error = list.error? list.error : '查询失败'
    }
    return res
}

const findAccount = async(uuid, searchParams, env)=>{
    const res = new Result()
    const id = searchParams.get("id")
    if (id){
        const account = await env.DB.prepare("SELECT * FROM accounts WHERE uuid = ? AND id = ? LIMIT 1")
        .bind(uuid, id)
        .first()
        if (account){
            res.data = account
        }else{
            res.error = "查找账号失败"
        }
    }else{
        res.error = "没有提供账号的id"
    }
    return res
}
const deleteAccount = async(uuid, searchParams, env)=>{
    const res = new Result()
    const id_param = searchParams.get("id")
    const id = id_param?parseInt(id_param):0
    if (id){
        const result = await env.DB.prepare("DELETE FROM accounts WHERE uuid=? AND id=?")
            .bind(uuid, id)
            .run()
        if( result.success){
            res.data = result.results
        }else{
            res.error = result.error? result.error:"删除账号失败"
        }
    }else{
        res.error = "没有提供账号的id"
    }
    return res
}

const deleteAccountByIds = async(uuid, searchParams, env)=>{
    const res = new Result()
    const ids = []
    searchParams.forEach((value, key)=>{
        if (key.startsWith("ids")){
            ids.push(value)
        }
    })
    if (ids.length>0){
        const result = await env.DB.prepare("DELETE FROM accounts WHERE uuid=? AND id IN ("+ids.join(',')+")")
            .bind(uuid)
            .run()
        if( result.success){
            res.data = result.results
        }else{
            res.error = result.error? result.error:"删除账号失败"
        }
    }else{
        res.error="没有提供账号的id"
    }
    return res
}

const createAccount = async(uuid, data, env)=>{
    const res = new Result()
    const result = await env.DB.prepare("INSERT INTO accounts (uuid, email, password, appcode, status, enable_status, access_token, coins, dr_level, stage_id, champions_points, transformarket_unlocked, record, updated_at)"+
        " VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
        .bind(uuid,//在进入之前判断 
            data["email"]??'',
            data["password"]??'',
            data["appcode"]??'',
            data["status"]??0,
            data["enable_status"]??0,
            data["access_token"]??'',
            data["coins"]??null,
            data["dr_level"]??null,
            data["stage_id"]??null,
            data["champions_points"]??null,
            data["transformarket_unlocked"]??null,
            data["record"]??'',
            get_updated_at())
        .run()
    if( result.success){
        res.data = result.results
    }else{
        res.error = result.error? result.error:"新增账号失败"
    }
    return res
}

const updateAccount = async(uuid, data, env)=>{
    const res = new Result()
    if(!data['id']){
        res.error = "没有提供账号的id"
        return res
    }
    const result = await env.DB.prepare("UPDATE accounts SET email=?, password=?, appcode=?, status=?, enable_status=?, access_token=?, coins=?, dr_level=?, stage_id=?, champions_points=?, transformarket_unlocked=?, record=?, updated_at=?"+
        " WHERE uuid=? AND id=?")
        .bind( 
            data["email"]??'',
            data["password"]??'',
            data["appcode"]??'',
            data["status"]??0,
            data["enable_status"]??0,
            data["access_token"]??'',
            data["coins"]??null,
            data["dr_level"]??null,
            data["stage_id"]??null,
            data["champions_points"]??null,
            data["transformarket_unlocked"]??false,
            data["record"]??'',
            get_updated_at(),
            uuid,
            data['id']
        )
        .run()
    if( result.success){
        res.data = result.results
    }else{
        res.error = result.error? result.error:"修改账号失败"
    }
    return res
}

const enableAccount = async(uuid, data, env)=>{
    const res = new Result()
    if (data.ids?.length>0){
        const result = await env.DB.prepare("UPDATE accounts SET enable_status=?, updated_at=? WHERE uuid=? AND id IN ("+data.ids.join(',')+")")
            .bind(data.status, get_updated_at(), uuid)
            .run()
        if( result.success){
            res.data = result.results
        }else{
            res.error = result.error? result.error:"启用账号失败"
        }
    }else{
        res.error="没有提供账号的id"
    }
    return res
}

const importAccount = async(searchParams, formData, env)=>{
    const res = new Result()
    const uuid = searchParams.get("uuid")
    if(uuid){
        const file = formData.get("file")
        if (file && typeof file !== "string" && file.type === 'text/plain'){
            const import_text =  await file.text()
            const import_accounts = import_text.split(/\r\n|\n|\r/)
                .map(line=>{
                    return line.split('----')
                }).filter(account=>{
                    return account.length>=3
                })
            if (import_accounts.length === 0){
                res.error = "没有导入的账号"
                return res
            }
            const updated_at = get_updated_at()
            const stmt = env.DB.prepare("INSERT INTO accounts(uuid, email, password, appcode, status, enable_status, updated_at) Values(?, ?, ?, ?, 0, 0, ?)")
            res.data = await env.DB.batch(
                import_accounts.map((account)=>{
                    return stmt.bind(uuid, account[0], account[1], account[2], updated_at)
                }))
        }
    }else{
        res.error = "未登录"
    }
    return res
}