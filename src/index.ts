/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import {Success, OK, Fail} from './response'
import {Env} from "./ienv"
import { request_body_reader } from './request_body_reader';
import { login } from './user';
import account_service from './account'

export default {
async fetch(request, env): Promise<Response> {
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
},
} satisfies ExportedHandler<Env>;
