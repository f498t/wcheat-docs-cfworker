
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

// export class RequestJson{
//     data:any = {}
//     error:string = ''
// }

// export const request_body_json = async(request:Request):Promise<RequestJson>=>{
//     const res = new RequestJson()
// 	const reader = request.body?.getReader();
// 	if (!reader){
// 		res.error = 'Reader is undefined';
// 	}else{
// 		await reader.read().then(async ({ done, value }) => {
// 			if (done) {
// 				res.error = 'Stream is done';
// 			} else {
//                 const data = JSON.parse(String.fromCharCode(...value))
//                 if(data){
//                     res.data = data;
//                 }else{
//                     res.error = "解析失败"
//                 }
// 			}
// 		}).catch(error => {res.error = error});
// 	}
//     return res
// }