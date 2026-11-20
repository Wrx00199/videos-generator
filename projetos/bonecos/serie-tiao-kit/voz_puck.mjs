import fs from 'node:fs'; import { spawnSync } from 'node:child_process';
const R='/media/wr/HDD/Estudio de video';
process.loadEnvFile(R+'/.env');
const { chaveTts } = await import(R+'/ferramentas/tts_config.mjs');
const k = chaveTts(process.env);
const [voz, saida] = process.argv.slice(2);
const texto = fs.readFileSync(process.env.ROTEIRO,'utf8').trim();
const estilo=process.env.ESTILO??'Narre em português do Brasil com voz natural e calorosa, como um contador de histórias, ritmo fluido e expressivo, com pausas curtas: ';
const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent',{method:'POST',signal:AbortSignal.timeout(120000),headers:{'x-goog-api-key':k,'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:estilo+texto}]}],generationConfig:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:voz}}}}})});
const j = await r.json(); const b=j.candidates?.[0]?.content?.parts?.find(p=>p.inlineData)?.inlineData?.data;
if(!b){console.error(r.status, JSON.stringify(j.error?.message??j).slice(0,150));process.exit(1)}
fs.writeFileSync(saida+'.pcm',Buffer.from(b,'base64'));
spawnSync('ffmpeg',['-y','-loglevel','error','-f','s16le','-ar','24000','-ac','1','-i',saida+'.pcm','-b:a','160k',saida]);fs.rmSync(saida+'.pcm');
console.log(voz, spawnSync('ffprobe',['-v','error','-show_entries','format=duration','-of','csv=p=0',saida],{encoding:'utf8'}).stdout.trim());
