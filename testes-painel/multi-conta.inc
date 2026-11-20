// Dados novos ficam sob o painel enquanto a exceção para legendas/referências não for autorizada.
const SEMENTES = [
  {id:'six_stars',nome:'Six Stars',nicho:'GTA 6',plataformas:[{rede:'instagram',handle:'six_starsbr',ligado:true,modo:'manual'},{rede:'facebook',handle:'six_starsbr',ligado:true,modo:'manual'},{rede:'tiktok',handle:'wrx00_',ligado:false,modo:'manual'}],pasta_saida:'prontos/Gta 6',legenda_modelo:'{titulo} #gta6 #gtavi',horarios:['12:00','15:00','19:00','21:30'],tipo_producao:'cortes',filtro_acabamento:true},
  {id:'aventuras_do_tiao',nome:'Aventuras do Tião',nicho:'Tião',plataformas:[{rede:'youtube',handle:'aventurasdotiao',ligado:true,modo:'manual'},{rede:'tiktok',handle:'aventurasdotião',ligado:true,modo:'manual'}],pasta_saida:'prontos/3D/Aventuras do Tião',legenda_modelo:'{titulo} #aventurasdotiao',horarios:['12:00','19:00'],tipo_producao:'bonecos',filtro_acabamento:true}
];
const contasCfg = () => {const v=lerJson(path.join(CONFIG,'contas.json'),SEMENTES);return Array.isArray(v)?v:SEMENTES;};
function erro(status,msg){throw Object.assign(new Error(msg),{status});}
function acharConta(id){const c=contasCfg().find(c=>c.id===id);if(!c)erro(404,'Conta não encontrada');return c;}
const contaDaUrl=u=>acharConta(u.searchParams.get('conta')||'six_stars');
function pastaConta(c){const rel=String(c.pasta_saida||'');const f=path.resolve(RAIZ,rel);const base=path.join(RAIZ,'prontos');if(!f.startsWith(base+path.sep))erro(400,'Pasta deve estar dentro de prontos/');
  let atual=RAIZ;for(const parte of path.relative(RAIZ,f).split(path.sep)){atual=path.join(atual,parte);if(fs.existsSync(atual)&&fs.lstatSync(atual).isSymbolicLink())erro(400,'Pasta com link simbólico não permitida');}return f;}
function validarConta(c){
  if(!c||! /^[a-z0-9_]{1,60}$/.test(c.id||'')||typeof c.nome!=='string'||!c.nome.trim()||c.nome.length>100||typeof c.nicho!=='string'||!c.nicho.trim()||c.nicho.length>100)erro(400,'ID, nome e nicho obrigatórios');
  pastaConta(c);
  if(!Array.isArray(c.plataformas)||c.plataformas.length>8||c.plataformas.some(p=>!['instagram','facebook','tiktok','youtube'].includes(p.rede)||!['manual','chrome','api'].includes(p.modo)||typeof p.handle!=='string'||p.handle.length>100||typeof p.ligado!=='boolean'))erro(400,'Plataformas inválidas');
  if(new Set(c.plataformas.map(p=>p.rede)).size!==c.plataformas.length)erro(400,'Rede duplicada');
  if(!Array.isArray(c.horarios)||c.horarios.length>24||c.horarios.some(h=>! /^([01]\d|2[0-3]):[0-5]\d$/.test(h)))erro(400,'Horários inválidos');
  if(typeof c.legenda_modelo!=='string'||c.legenda_modelo.length>5000||typeof c.tipo_producao!=='string'||c.tipo_producao.length>100||typeof c.filtro_acabamento!=='boolean')erro(400,'Modelo, tipo ou filtro inválido');
  return {id:c.id,nome:c.nome.trim(),nicho:c.nicho.trim(),plataformas:c.plataformas.map(({rede,handle,ligado,modo})=>({rede,handle,ligado,modo})),pasta_saida:path.relative(RAIZ,pastaConta(c)),legenda_modelo:c.legenda_modelo,horarios:c.horarios,tipo_producao:c.tipo_producao,filtro_acabamento:c.filtro_acabamento};
}
const LEGENDAS=path.join(DADOS,'legendas.json');
const REFERENCIAS=path.join(DADOS,'_fila_painel.jsonl');
function revisaoConta(c){
  const base=pastaConta(c), mapa=new Map();
  // Reaproveita a revisão de lives apenas para a conta GTA.
  if(c.id==='six_stars')for(const i of listarRevisao().itens)mapa.set(i.id,{...i,conta:c.id});
  function andar(dir,n=0){if(n>12)return;for(const e of ls(dir)){const f=path.join(dir,e.name);if(e.isDirectory())andar(f,n+1);else if(e.isFile()&&/\.mp4$/i.test(e.name)){
    const mp4=path.relative(RAIZ,f),id=b64(mp4),titulo=e.name.replace(/\.mp4$/i,'').replace(/[-_]/g,' ');
    if(!mapa.has(id))mapa.set(id,{id,id_texto:mp4,mp4,titulo,conta:c.id,streamer:c.nome,criado:mtime(f),estado:'revisao',origem:'prontos',legenda:lerTexto(f.replace(/\.mp4$/i,'.txt')).trim()||c.legenda_modelo.replaceAll('{titulo}',titulo).replaceAll('{streamer}',c.nome)});
  }}}andar(base);
  const dec=decisoes(),legs=lerJson(LEGENDAS,{});
  const itens=[...mapa.values()].map(i=>{const d=dec[i.id];return {...i,...(d?{estado:d.estado,motivo:d.motivo,decidido_em:d.ts}:{}),legenda:legs[i.id]?.legenda??d?.legenda??i.legenda??''};}).sort((a,b)=>b.criado-a.criado);
  return {itens,contagem:Object.fromEntries(['revisao','aprovado','recusado'].map(k=>[k,itens.filter(i=>i.estado===k).length]))};
}
function placarConta(c){const r=revisaoConta(c);const dec=r.contagem.aprovado+r.contagem.recusado;return [{conta:c.id,streamer:c.nome,...r.contagem,auto:0,total:r.itens.length,taxa:dec?Math.round(r.contagem.aprovado/dec*100):null}];}
const diaSP=t=>new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo'}).format(new Date(t));
function calendario(c){const itens=revisaoConta(c).itens, hoje=diaSP(Date.now()),min=c.id==='aventuras_do_tiao'?2:c.id==='six_stars'?3:1,max=c.id==='six_stars'?4:min;
  const dias={};for(const i of itens){const dia=diaSP(i.criado);dias[dia]=(dias[dia]||0)+1;}return {conta:c.id,hoje,meta_min:min,meta_max:max,produzidos_hoje:dias[hoje]||0,faltam:Math.max(0,min-(dias[hoje]||0)),horarios:c.horarios,dias};}
function gpus(){return ls('/sys/class/drm').filter(e=>/^card\d+$/.test(e.name)).map(e=>{const base=path.join('/sys/class/drm',e.name,'device');const num=n=>{const t=lerTexto(path.join(base,n)).trim();return t&&Number.isFinite(+t)?+t:null;};return {nome:e.name,uso_percent:num('gpu_busy_percent'),vram_usada_bytes:num('mem_info_vram_used'),vram_total_bytes:num('mem_info_vram_total')};});}
function chaves(){const texto=lerTexto(path.join(RAIZ,'.env'));return Array.from({length:5},(_,i)=>{const nome=`GEMINI_API_KEY_${i+1}`,m=texto.match(new RegExp(`^\\s*(?:export\\s+)?${nome}\\s*=\\s*(.*)$`,'m'));const valor=String(process.env[nome]||m?.[1]||'').trim().replace(/^(['"])(.*?)\1(?:\s*#.*)?$/,'$2').replace(/\s+#.*$/,'');return {nome,existe:!!valor,formato_valido:/^AIza[\w-]{35}$/.test(valor),validade:'não consultada (sem chamada de IA)'};});}
let cacheBots={t:0,v:[]};
function statusBots(){if(Date.now()-cacheBots.t<30000)return cacheBots.v;
  const arquivos=[];const visitar=(dir,n=0)=>{if(n>2)return;for(const e of ls(dir)){if(e.name.startsWith('.')||['node_modules','ambiente'].includes(e.name))continue;const f=path.join(dir,e.name);if(e.isDirectory())visitar(f,n+1);else if(e.isFile()&&/\.(log|lock)$/.test(e.name))arquivos.push({f,nome:e.name,ts:mtime(f)});}};visitar(ESTADO);visitar(path.join(RAIZ,'ferramentas'));
  const v=Object.entries({olheiro:/olheiro|ronda/,clipador:/clipador|clipper/,ao_vivo:/ao[_-]vivo/,render:/render/}).map(([bot,re])=>{const a=arquivos.filter(a=>re.test(a.nome)).sort((a,b)=>b.ts-a.ts)[0];return {bot,ativo:!!a&&Date.now()-a.ts<120000,ultimo_sinal:a?.ts||null,criterio:'log/lock atualizado nos últimos 2 min; sinal de atividade, não prova de processo vivo'};});cacheBots={t:Date.now(),v};return v;
}
const rede={ligado:false,hash:null,salt:null};let servidorLAN=null;
function ipsLAN(){return [...new Set(Object.values(os.networkInterfaces()).flat().filter(i=>i&&i.family==='IPv4'&&!i.internal).map(i=>i.address))];}
function autenticado(req){try{const a=String(req.headers.authorization||'');if(!a.startsWith('Basic '))return false;const txt=Buffer.from(a.slice(6),'base64').toString();const senha=txt.slice(txt.indexOf(':')+1);const hash=crypto.scryptSync(senha,rede.salt,32);return crypto.timingSafeEqual(hash,rede.hash);}catch{return false;}}
async function rotasNovas(req,res,u,local){
 const rota=u.pathname; if(!['/api/contas-cfg','/api/legendas','/api/referencias','/api/calendario','/api/bots','/api/render-fila','/api/rede'].includes(rota))return false;
 if(!['GET','POST'].includes(req.method)){json(res,405,{erro:'Método não permitido'});return true;}
 if(rota==='/api/contas-cfg'){
  if(req.method==='GET')json(res,200,contasCfg());else{const b=await corpo(req);let lista=contasCfg();if(b.acao==='remover'){acharConta(b.id);lista=lista.filter(c=>c.id!==b.id);}else{const c=validarConta(b.conta||b);lista=lista.filter(x=>x.id!==c.id);lista.push(c);}gravarJson(path.join(CONFIG,'contas.json'),lista);json(res,200,{ok:true,contas:lista});}
 }else if(rota==='/api/legendas'){
  if(req.method==='GET'){const c=contaDaUrl(u);json(res,200,revisaoConta(c).itens.map(({id,legenda})=>({id,legenda})));}else{const b=await corpo(req),c=acharConta(b.conta);if(!revisaoConta(c).itens.some(i=>i.id===b.id))erro(404,'Vídeo não pertence à conta');if(typeof b.legenda!=='string'||b.legenda.length>10000)erro(400,'Legenda inválida');const l=lerJson(LEGENDAS,{});l[b.id]={conta:c.id,legenda:b.legenda,atualizado:Date.now()};gravarJson(LEGENDAS,l);json(res,200,{ok:true});}
 }else if(rota==='/api/referencias'){
  if(req.method!=='POST')erro(405,'Use POST');const b=await corpo(req);let url;try{url=new URL(b.url);}catch{erro(400,'URL inválida');}if(!['http:','https:'].includes(url.protocol)||url.username||url.password)erro(400,'Somente link HTTP/HTTPS sem senha');if(b.conta)acharConta(b.conta);if(b.nota!==undefined&&typeof b.nota!=='string')erro(400,'Nota inválida');const item={id:crypto.randomUUID(),url:url.href,nota:String(b.nota||'').slice(0,2000),conta:b.conta||null,status:'pendente',criado:Date.now()};fs.mkdirSync(path.dirname(REFERENCIAS),{recursive:true});fs.appendFileSync(REFERENCIAS,JSON.stringify(item)+'\n');json(res,201,item);
 }else if(rota==='/api/calendario')json(res,200,calendario(contaDaUrl(u)));
 else if(rota==='/api/bots')json(res,200,statusBots());
 else if(rota==='/api/render-fila')json(res,200,{limite_pesados:1,somente_visual:true,itens:(await processos()).filter(p=>/ffmpeg|render/.test(p.tipo+' '+p.cmd)).map(p=>({...p,peso:'pesada',estado:'em execução (externa)'})),classes:['leve','média','pesada']});
 else if(rota==='/api/rede'){
  if(!local)erro(403,'Configure a rede neste PC');
  if(req.method==='POST'){const b=await corpo(req);if(typeof b.ligado!=='boolean')erro(400,'Estado inválido');if(b.ligado){if(typeof b.senha!=='string'||b.senha.length<10||b.senha.length>200)erro(400,'Senha deve ter de 10 a 200 caracteres');const ip=ipsLAN()[0];if(!ip)erro(409,'IP de rede local não encontrado');if(!servidorLAN){const srv=http.createServer(atender);await new Promise((ok,no)=>{srv.once('error',no);srv.listen(PORTA,ip,ok);});servidorLAN=srv;}rede.salt=crypto.randomBytes(16);rede.hash=crypto.scryptSync(b.senha,rede.salt,32);rede.ligado=true;}else{rede.ligado=false;rede.hash=null;rede.salt=null;servidorLAN?.close();servidorLAN?.closeAllConnections();servidorLAN=null;}}
  json(res,200,{ligado:rede.ligado,ips:rede.ligado?ipsLAN():[],urls:rede.ligado?ipsLAN().map(ip=>`http://${ip}:${PORTA}`):[],aviso:'Desligado ao reiniciar. Na LAN o transporte é HTTP; use apenas rede confiável.'});
 }
 return true;
}
