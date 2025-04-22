
export class RequestBody{
    body:Uint8Array = new Uint8Array()
    error:string = ''
    json:any = {}
    form_data:FormData = new FormData()
}

export const request_body_reader = async(request:Request):Promise<RequestBody>=>{
    const res = new RequestBody()
    const content_type = request.headers.get("content-type")
    if (!content_type){
        res.error = "没有请求内容"
        return res
    }
    if (content_type === "application/json"){
        res.json =await request.json()
    }else if(content_type.startsWith("multipart/form-data")){
        res.form_data = await request.formData()
    }else{
        res.body = await request.bytes()
    }
    return res
}