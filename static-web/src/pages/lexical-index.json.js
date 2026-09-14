import { listLexicalWordSummaries } from '../lib/lexical.mjs';
export function GET(){return new Response(JSON.stringify(listLexicalWordSummaries().map(({word,ordinal,objectId})=>({word,ordinal,objectId}))),{headers:{'Content-Type':'application/json'}});}
