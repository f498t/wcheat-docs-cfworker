export const Success = (data:any, message:string = '')=>{
    return Response.json({
        code: 0,
        data: data,
        message: message
    });
};
export const OK = (message:string)=>{
    return Response.json({
        code: 0,
        data: {},
        message: message
    });
};
export const Fail = (message:string, data:any = {})=>{
    return Response.json({
        code: 1,
        data: data,
        message: message
    });
};