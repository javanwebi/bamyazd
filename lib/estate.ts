import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../app/chatgpt-auth';
export function db(){if(!env.DB)throw new Error('Database unavailable');return env.DB;}
export async function identity(){const user=await getChatGPTUser(); if(!user)return {user:null,admin:false};const row=await db().prepare('SELECT value FROM settings WHERE key = ?').bind('admin_user').first<{value:string}>();return {user,admin:row?.value===user.userId};}
export const publicColumns='id,title,deal,type,neighborhood,area,rooms,year,floor,price,deposit,rent,description,amenities,images,created_at';
export function cleanPublic(row:any){return {...row,images:JSON.parse(row.images||'[]'),amenities:JSON.parse(row.amenities||'[]')};}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
export function sameOrigin(req:Request){return req.headers.get('origin')===new URL(req.url).origin;}
export function normalizePhone(v:string){return v.replace(/[۰-۹]/g,c=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c))).replace(/[٠-٩]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))).replace(/[\s-]/g,'');}
