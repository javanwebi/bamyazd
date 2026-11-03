import Estate from './estate';
import {identity} from '../lib/estate';
export const dynamic='force-dynamic';
export default async function Page(){let signedIn=false,admin=false;try{const state=await identity();signedIn=!!state.user;admin=state.admin;}catch{}return <Estate signedIn={signedIn} isAdmin={admin}/>;}
