import {Env} from "./ienv"

class Result{
    data:any = null
    error:string = ''
}

const get_updated_at = () => {
    return (new Date()).toISOString().replace("T", " ").replace(/\.\d{3}Z/,'');
}

// class Account{
//     id:any=undefined
//     uuid:string = ''
//     email:string = ''
//     password:string = ''
//     appcode:string = ''
//     status:any = undefined
//     enable_status:any = undefined
//     access_token:string = ''
//     coins:any = undefined
//     dr_level:any = undefined
//     stage_id:any = undefined
//     champions_points:any = undefined
//     transformarket_unlocked:boolean|undefined = undefined
//     record:string = ''
//     updated_at:Date|undefined = undefined
// }

const getAccountList = async(uuid:string, searchParams:URLSearchParams, env:Env)=>{
    const res = new Result()
    // 查询条件
    let sql_where:string = " WHERE uuid='"+uuid+"'"
    const status:string[] = []
    const enable_status:string[] = []
    const dr_level:string[] = []
    const transformarket_unlocked:string[] = []
    let prop:string = ''
    let order:string = ''
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

const findAccount = async(uuid:string, searchParams:URLSearchParams, env:Env)=>{
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
const deleteAccount = async(uuid:string, searchParams:URLSearchParams, env:Env)=>{
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

const deleteAccountByIds = async(uuid:string, searchParams:URLSearchParams, env:Env)=>{
    const res = new Result()
    const ids:string[] = []
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

const createAccount = async(uuid:string, data:any, env:Env)=>{
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

const updateAccount = async(uuid:string, data:any, env:Env)=>{
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

const enableAccount = async(uuid:string, data:any, env:Env)=>{
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

const importAccount = async(searchParams:URLSearchParams, formData:FormData, env:Env)=>{
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
                import_accounts.map((account):D1PreparedStatement=>{
                    return stmt.bind(uuid, account[0], account[1], account[2], updated_at)
                }))
        }
    }else{
        res.error = "未登录"
    }
    return res
}

export default {
    getAccountList,
    findAccount,
    createAccount,
    updateAccount,
    deleteAccount,
    deleteAccountByIds,
    enableAccount,
    importAccount
}