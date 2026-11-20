# painelgta

Painel de cortes de GTA 6 (lives → clipes → revisão → Meta).

- `servidor.mjs` + `index.html`: painel local (porta 7777), Node puro.
  Rodar: `node servidor.mjs`
- `netlify-deploy/`: versão online só-leitura (função `ao-vivo` + prévias da revisão).
  `node gerar.mjs` gera as prévias; deploy: `npx netlify-cli deploy --prod --dir public --functions netlify/functions`
