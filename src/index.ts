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
import { request_body_reader } from './request_body_reader';
import { login } from './user';
import account_service from './account'
import {Env, prismaClients }from "./prisma";
import ea_app from './ea_app'

export default {
async fetch(request, env): Promise<Response> {
	const prisma = await prismaClients.fetch(env.DB)
	const {pathname, searchParams} = new URL(request.url);
	const request_body = await request_body_reader(request)
	const uuid = request.headers.get('x-uuid')
	if(pathname === "/userlogin"){
		if (request_body.error.length > 0){
			return Fail(request_body.error)
		}else{
			const data = request_body.json
			const result = await login(data['uuid'],prisma)
			if (result){
				return Success(result)
			}else{
				return Fail("用户不存在")
			}
		}
	}else if(pathname.startsWith("/account")){
		const account_path = pathname.slice("/account".length)
		if (!uuid){
			return Fail("未登录")
		}
		if (account_path === "/getList"){
			const result = await account_service.getAccountList(uuid,searchParams,prisma)
			// const result = await account_service.getAccountList(uuid,searchParams,env)
			if (result.error){
				return Fail(result.error)
			}else{
				return Success(result.data)
			}
		}
		if (account_path === "/find"){
			const result = await account_service.findAccount(uuid,searchParams, prisma)
			if (result.error){
				return Fail(result.error)
			}else{
				return Success(result.data)
			}
		}
		if (account_path === "/create"){
			if (request_body.error.length > 0){
				return Fail(request_body.error)
			}else{
				const result = await account_service.createAccount(uuid, request_body.json, prisma)
				if (result.error){
					return Fail(result.error)
				}else{
					return Success(result.data)
				}
			}

		}
		if (account_path === "/update"){
			if (request_body.error.length > 0){
				return Fail(request_body.error)
			}else{
				const result = await account_service.updateAccount(uuid,request_body.json,prisma)
				if (result.error){
					return Fail(result.error)
				}else{
					return Success(result.data)
				}
			}
		}
		if (account_path === "/delete"){
			const result = await account_service.deleteAccount(uuid,searchParams,prisma)
			if (result.error){
				return Fail(result.error)
			}else{
				return Success(result.data)
			}
		}
		if (account_path === "/deleteByIds"){
			const result = await account_service.deleteAccountByIds(uuid,searchParams,prisma)
			if (result.error){
				return Fail(result.error)
			}else{
				return Success(result.data)
			}
		}
		if (account_path === "/enable"){
			if (request_body.error.length > 0){
				return Fail(request_body.error)
			}else{
				const result = await account_service.enableAccount(uuid,request_body.json,prisma)
				if (result.error){
					return Fail(result.error)
				}else{
					return Success(result.data)
				}
			}
		}
		if (account_path === "/import"){
			if (request_body.error.length > 0){
				return Fail(request_body.error)
			}else{
				const result = await account_service.importAccount(uuid,request_body.form_data,prisma)
				if (result.error){
					return Fail(result.error)
				}else{
					return Success(result.data)
				}
			}
		}
		if(account_path === "/getUnusedAccount"){
			const result = await account_service.getUnusedAccount(uuid,prisma)
			if (result.error){
				return Fail(result.error)
			}else{
				return Success(result.data)
			}
		}
		if(account_path === "/checkAccount"){
			if (request_body.error.length > 0){
				return Fail(request_body.error)
			}else{
				const result = await account_service.checkAccount(uuid,request_body.json,prisma)
				if (result.error){
					return Fail(result.error)
				}else{
					return Success(result.data)
				}
			}
		}
		if(account_path === "/releaseAccount"){
			if (request_body.error.length > 0){
				return Fail(request_body.error)
			}else{
				const result = await account_service.releaseAccount(uuid,request_body.json,prisma)
				if (result.error){
					return Fail(result.error)
				}else{
					return Success(result.data)
				}
			}
		}
	}else if(pathname==="/EALogin"){
		if (request_body.error.length > 0){
			return Fail(request_body.error)
		}else{
			const result = await ea_app.ea_login(request_body.json)
			if (result.error){
				return Fail(result.error)
			}else{
				return Success(result.data)
			}
		}
	}
	return Fail("未找到请求的资源");
},
} satisfies ExportedHandler<Env>;
