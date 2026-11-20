import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chaveTts} from '../ferramentas/tts_config.mjs';
test('conta fixa aceita nome principal e alias legado, nunca outras contas',()=>{
 assert.equal(chaveTts({GEMINI_API_KEY:' principal ',GEMINI_API_KEY_1:'legado'}),'principal');
 assert.equal(chaveTts({GEMINI_API_KEY_1:' legado ',GEMINI_API_KEY_2:'outra'}),'legado');
 assert.equal(chaveTts({GEMINI_API_KEY_2:'outra',GEMINI_API_KEYS:'outra'}),'');
});
