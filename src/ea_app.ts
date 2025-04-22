import { keysOf } from "element-plus/es/utils/objects.mjs"

const ea_login =async (data:any)=>{
    if(!data.url||!data.method||!data.headers){
        return {error:"请求的参数不完整"}
    }
    try{
        let url:string = data.url
        const request_init = {
            method:data.method,
            headers:data.headers,
            body:data.body,
            redirect:"manual"
        }
        const cookie:Map<string,string> = new Map(data.headers["Cookie"]?.split("; ").map((c: string)=>c.split('=')))
        while (url){
            if (request_init.method === "GET"){
                request_init.body = undefined
            }
            // console.log("request：")
            const req = new Request(url,request_init)
            // console.log(req)
            // console.log("request body:")
            // console.log(request_init.body)
            const response = await fetch(req)
            // const response = await fetch(url,request_init)
            // console.log("response:")
            // console.log(response)
            // console.log("response set cookie:")
            // console.log(response.headers.getSetCookie())
            //设置cookie
            response.headers.getSetCookie().map(cookie=>cookie.split(";")[0].split('=')).forEach(([key,value])=>{
                if(value){
                    cookie.set(key,value)
                }
            })
            const cookies:string[] = []
            if(cookie.size>0){
                cookie.forEach((value,key)=>{
                    if(key&&value){
                        cookies.push(key+'='+value)
                    }
                })
            }
            url = response.status === 302&&response.headers.get("location")||""
            if(!url){
                if (response.headers.get("content-type")?.startsWith("application/json")){//如果最后返回内容是json格式的
                    return {data: {json:await response.json(),cookie:cookies.join('; '),url:response.url,status_code:response.status}}
                }
                return {data: {text:await response.text(),cookie:cookies.join('; '),url:response.url,status_code:response.status}}
            }
            if (url.startsWith("qrc:/html/login_successful.html") || url.startsWith("http://127.0.0.1/login_successful.html")){
                return {data:url.split('code=')[1]}
            }
            request_init.method = "GET"
            if(cookies.length>0){
                request_init.headers["Cookie"] = cookies.join('; ')
            }
            if (request_init.headers["Content-Type"] ){
                request_init.headers["Content-Type"] = undefined
            }
            if (url.startsWith("/p/juno/login")){
                url = "https://signin.ea.com" + url
                request_init.headers["Host"] = "signin.ea.com"
                continue
            }
            if (url.startsWith("https://signin.ea.com/p/juno/login")){
                // url = url.replace("https://signin.ea.com","https://accounts.ea.com")
                request_init.headers["Host"] = "signin.ea.com"
                continue
            }
            return {error:"未知的url: "+url}
        }
        return {error:"未知异常"}
    }catch(error:any){
        console.log(error)
        return {error}
    }
}
export default{ea_login}