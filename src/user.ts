import {Env} from "./ienv"
export const login = async (uuid:string, env: Env) => {
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