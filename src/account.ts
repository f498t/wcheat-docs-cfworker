import { Prisma,PrismaClient } from '@prisma/client'

class Result{
    data:any = null
    error:string = ''
}
const AccountStatus={
    NOT_LOGGED:  0,
    LOGGED: 1,
    LOGGING: 2,
    DISABLED: 3,
    TRIAL_EXPIRED: 4,
    UNABLE_CONNECT: 5,
    PASSWORD_EXPIRED: 6,
    APPCODE_ERROR: 7
}
const EnableStatus={
    NOT_ENABLE:0,
    PAUSE:1,
    DR:2,
    SQB:3,
    UNLOCK_TRANSFERMARKET:4
}
const get_updated_at = () => {
    return (new Date()).toISOString().replace("T", " ").replace(/\.\d{3}Z/,'');
}

const getAccountList = async(uuid:string, searchParams:URLSearchParams, prisma: PrismaClient)=>{
    const res = new Result()
    //分页信息
    const pageSize = searchParams.get("pageSize")
    const page = searchParams.get("page")
    const limit = pageSize? parseInt(pageSize):0 
    const offset = page? limit * (parseInt(page) - 1) : 0
    //查询条件
    const where :Prisma.AccountsWhereInput = {uuid:uuid}
    const email = searchParams.get("email")
    if (email){
        where.email = {
            contains:email
        }
    }
    const record = searchParams.get("record")
    if (record){
        where.record={contains:record}
    }
    const status = searchParams.get("status")?.split(",").filter(element=>!isNaN(parseInt(element))).map(element=>parseInt(element))??[]
    if(status.length > 0){
        where.status={in:status}
    }
    const enable_status = searchParams.get("enable_status")?.split(",").filter(element=>!isNaN(parseInt(element))).map(element=>parseInt(element))??[]
    if(enable_status.length > 0){
        where.enable_status={in:enable_status}
    }
    const dr_level = searchParams.get("dr_level")?.split(",").filter(element=>!isNaN(parseInt(element))).map(element=>parseInt(element))??[]
    if(dr_level.length > 0){
        where.dr_level={in:dr_level}
    }
    const transformarket_unlockeds: (Prisma.AccountsWhereInput)[] = []
    searchParams.get("transformarket_unlocked")?.split(",").forEach(element=>{
        if (element === "true"){
            transformarket_unlockeds.push({transformarket_unlocked:true})
        }
        if (element === "false"){
            transformarket_unlockeds.push(...[{transformarket_unlocked:false},{transformarket_unlocked:null}])
        }
    })
    if (transformarket_unlockeds.length > 0){
        where.AND={
            OR:transformarket_unlockeds
        }
    }
    // 排序
    let orderBy:Prisma.AccountsOrderByWithRelationInput = {}
    const prop = searchParams.get("prop")
    if(prop){
        let tmp:{ [key: string]: string } = {}
        if(searchParams.get("order") === "descending"){
            tmp[prop]= "desc"
        }else{
            tmp[prop]= "asc"
        }
        orderBy = tmp
    }
    try{
        //查询计数
        const total = await prisma.accounts.count({where:where})
        if (!total){
            res.data = {
                list: [],
                total: 0,
                page: page,
                pageSize: pageSize
            }
            return res
        }
        //查询数据
        const list = await prisma.accounts.findMany({
            skip:offset,
            take:limit,
            where:where,
            orderBy:orderBy
        })
        res.data = {
            list: list,
            total: total,
            page: page,
            pageSize: pageSize
        }
    }catch(error:any){
        res.error = error.message
    }
    return res
}

const findAccount = async(uuid:string, searchParams:URLSearchParams, prisma: PrismaClient)=>{
    const res = new Result()
    const id = parseInt(searchParams.get("id")??'0')
    if (id){
        try{
            const account = await prisma.accounts.findFirst({
                where:{
                    uuid:uuid,
                    id:id
                }
            })
            if (account){
                res.data = account
            }else{
                res.error = "查找账号失败"
            }
        }catch(error:any){
            res.error = error.message
        }
    }else{
        res.error = "没有提供账号的id"
    }
    return res
}
const deleteAccount = async(uuid:string, searchParams:URLSearchParams, prisma: PrismaClient)=>{
    const res = new Result()
    const id = parseInt(searchParams.get("id")??'0')
    if (id){
        try{
            const result = await prisma.accounts.delete({
                where:{
                    uuid:uuid,
                    id:id
                }
            })
            if( result){
                res.data = result
            }else{
                res.error = "删除账号失败"
            }
        }catch(error:any){
            res.error = error.message
        }
    }else{
        res.error = "没有提供账号的id"
    }
    return res
}

const deleteAccountByIds = async(uuid:string, searchParams:URLSearchParams, prisma: PrismaClient)=>{
    const res = new Result()
    const ids = searchParams.get("ids")?.split(",").filter(element=>!isNaN(parseInt(element))).map(element=>parseInt(element))??[]
    if (ids.length>0){
        try{
            const result = await prisma.accounts.deleteMany({
                where:{
                    uuid:uuid,
                    id:{
                        in:ids
                    }
                }
            })
            if (result.count){
                res.data = result
            }else{
                res.error = "删除账号失败"
            }
        }catch(error:any){
            res.error = error.message
        }
    }else{
        res.error="没有提供账号的id"
    }
    return res
}

const createAccount = async(uuid:string, data:any, prisma: PrismaClient)=>{
    const res = new Result()
    try{
        const account = await prisma.accounts.create({
            data:{
                ...data,
                uuid:uuid,
                updated_at:new Date()
            }
        })
        if (account){
            res.data = account
        }else{
            res.error = "创建账号失败"
        }
    }catch(error:any){
        res.error = error.message
    }
    return res
}

const updateAccount = async(uuid:string, data:any, prisma: PrismaClient)=>{
    const res = new Result()
    const id = data['id']
    if (id){
        try{
            const account = await prisma.accounts.update({
                where:{
                    uuid:uuid,
                    id:data['id']
                },
                data:{
                    ...data,
                    updated_at:new Date()
                }
            })
            if (account){
                res.data = account
            }else{
                res.error = "修改账号失败"
            }
        }catch(error:any){
            res.error = error.message
        }
    }else{
        res.error="没有提供账号的id"
    }
    return res
}

const enableAccount = async(uuid:string, data:any, prisma: PrismaClient)=>{
    const res = new Result()
    if (data.ids?.length>0&&!isNaN(data.enable_status)){
        try{
            const result = await prisma.accounts.updateMany({
                where:{
                    uuid:uuid,
                    id:{
                        in:data.ids
                    }
                },
                data:{
                    enable_status:data.enable_status,
                    updated_at:new Date()
                }
            })
            if (result.count){
                res.data = result
            }else{
                res.error = "启动账号失败"
            }
        }catch(error:any){
            res.error = error.message
        }
    }else{
        res.error="没有提供账号的id"
    }
    return res
}

const importAccount = async(uuid:string, formData:FormData, prisma: PrismaClient)=>{
    const res = new Result()
    if(uuid){
        const file = formData.get("file")
        if (file && typeof file !== "string" && file.type === 'text/plain'){
            const import_text =  await file.text()
            const updated_at = new Date()
            const import_accounts:Prisma.AccountsCreateManyInput[] = import_text.split(/[\r\n]+/)
                .map(line=>{
                    return line.split('----')
                }).filter(account=>{
                    return account.length>=3
                }).map((account):Prisma.AccountsCreateManyInput=>{
                    return {
                        uuid:uuid,
                        email:account[0],
                        password:account[1],
                        appcode:account[2],
                        updated_at:updated_at
                    }
                })
            if (import_accounts.length === 0){
                res.error = "没有导入的账号"
                return res
            }
            try{
                const result = await prisma.accounts.createMany({
                    data:import_accounts
                })
                if (result.count){
                    res.data = result
                }else{
                    res.error = "导入账号失败"
                }
            }catch(error:any){
                if (error.code === "P2002"){
                    res.error = "存在重复账号"
                }else{
                    res.error = error.message
                }
            }
        }
    }else{
        res.error = "未登录"
    }
    return res
}
/**并发锁 */
class Lock {
    locked:boolean = false
    constructor() {
        this.locked = false;
    }
    acquire() {
        if (!this.locked) {
            this.locked = true;
            return Promise.resolve();
        } else {
            return new Promise<void>(resolve => {
                const unlock = () => {
                    this.locked = false;
                    resolve();
                };
                const interval = setInterval(() => {
                    if (!this.locked) {
                        clearInterval(interval);
                        unlock();
                    }
                }, 100); // 每100毫秒检查一次
            });
        }
    }
    release() {
        this.locked = false;
    }
}
 
const lock = new Lock();
 
/**获取未使用的账号 */
const getUnusedAccount = async(uuid:string, prisma: PrismaClient)=>{
    const res = new Result()
    await lock.acquire()//加锁，
    try{
        let account = await prisma.accounts.findFirst({
            where:{
                uuid:uuid,
                enable_status:{not: EnableStatus.NOT_ENABLE},
                OR:[
                    {status:AccountStatus.NOT_LOGGED},
                    {status:null}
                ]
            }
        })
        if (account){
            account.status = AccountStatus.LOGGING
            account = await prisma.accounts.update({
                where:{
                    uuid:uuid,
                    id:account.id
                },
                data:{
                    ...account,
                    updated_at:new Date()
                }
            })
            if (account){
                res.data = account
            }else{
                res.error = "获取账号失败"
            }
        }else{
            res.error = "没有找到可用账号"
        }
    }catch(error:any){
        res.error = error.message
    }finally{
        lock.release()//确保释放锁
    }
    return res
}
/**检查账号 */
const checkAccount=async(uuid:string,account:any,prisma:PrismaClient)=>{
    const res = new Result()
    if(!account.id){
        res.error = "账号信息异常"
        account.enable_status = EnableStatus.NOT_ENABLE
        res.data = account
        return res
    }
    try{
        //在数据库中查找该账号
        let resAccount = await prisma.accounts.findFirst({
            where:{
                uuid:uuid,
                id:account.id
            }
        })
        if (resAccount){
            //如果账号状态异常
            if(resAccount.status !== AccountStatus.LOGGING&&resAccount.status!==AccountStatus.LOGGED){
                resAccount.enable_status = EnableStatus.NOT_ENABLE
                res.data = resAccount
                res.error = "账号状态异常"
                return res
            }
            //更新账号的启用状态
            account.enable_status = resAccount.enable_status
            resAccount = await prisma.accounts.update({
                where:{
                    uuid:uuid,
                    id:account.id
                },
                data:{
                    ...account,
                    updated_at:new Date()
                }
            })
            res.data = resAccount
        }else{
            account.enable_status = EnableStatus.NOT_ENABLE
            res.data = account
            res.error = "查找账号失败"
        }
    }catch(error:any){
        account.enable_status = EnableStatus.NOT_ENABLE
        res.data = account
        res.error = error.message
    }
    return res
}
/**释放账号 */
const releaseAccount=async(uuid:string,account:any,prisma:PrismaClient)=>{
    const res = new Result()
    if(!account.id){
        res.error = "账号信息异常"
        account.enable_status = EnableStatus.NOT_ENABLE
        res.data = account
        return res
    }
    try{
        //在数据库中查找该账号
        let resAccount = await prisma.accounts.findFirst({
            where:{
                uuid:uuid,
                id:account.id
            }
        })
        if (resAccount){
            //如果账号状态异常
            if(resAccount.status !== AccountStatus.LOGGING&&resAccount.status!==AccountStatus.LOGGED){
                resAccount.enable_status = EnableStatus.NOT_ENABLE
                res.data = resAccount
                res.error = "账号状态异常"
                return res
            }
            //更新账号的状态
            account.enable_status = EnableStatus.NOT_ENABLE// 不启用被释放的账号
            if(account.status === AccountStatus.LOGGING||account.status === AccountStatus.LOGGED){
                account.status = AccountStatus.NOT_LOGGED// 退出登录
            }
            resAccount = await prisma.accounts.update({
                where:{
                    uuid:uuid,
                    id:account.id
                },
                data:{
                    ...account,
                    updated_at:new Date()
                }
            })
            res.data = resAccount
        }else{
            account.enable_status = EnableStatus.NOT_ENABLE
            res.data = account
            res.error = "查找账号失败"
        }
    }catch(error:any){
        account.enable_status = EnableStatus.NOT_ENABLE
        res.data = account
        res.error = error.message
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
    importAccount,

    getUnusedAccount,
    checkAccount,
    releaseAccount
}