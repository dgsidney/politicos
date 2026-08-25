// FV-C · Para cada candidato no D1, busca o detalhe no DivulgaCandContas,
// mapeia -> ato_oficial, classifica (verde/laranja/vermelho/cinza) e gera
// db/seed-atos-<slug>-sp.sql (idempotente).
//
// Uso:
//   node scripts/ingest-atos.mjs                                   (governador, D1 local)
//   node scripts/ingest-atos.mjs --cargo=deputado-federal --remote
//   node scripts/ingest-atos.mjs --cargo=deputado-estadual
// Depois: wrangler d1 execute politicos-db [--local|--remote] --file db/seed-atos-<slug>-sp.sql
//
// Roda LOCAL: a API do TSE exige headers de navegador (o client cuida disso).
// Aviso: dep. federal ~1119, dep. estadual ~1426 → com 800ms/req dá 15-19 min.

import fs from "node:fs";
import { execSync } from "node:child_process";
import {
  detalheCandidato,
  mapAtos,
  comRateLimit,
  ELEICAO_GERAL_2026,
} from "../worker/src/divulgacand.js";
import { classificarComMotivo } from "../worker/src/classificar.js";

const CARGOS = {
  "governador": "GOVERNADOR",
  "deputado-federal": "DEPUTADO FEDERAL",
  "deputado-estadual": "DEPUTADO ESTADUAL",
};

// Cada cargo escreve num range fixo de ato_oficial.id para não colidir entre seeds
// quando aplicados no mesmo D1 (DELETE só limpa os SQs do próprio cargo).
const ATO_ID_OFFSET = {
  "governador": 0,
  "deputado-federal": 1_000_000,
  "deputado-estadual": 2_000_000,
};

const REMOTE = process.argv.includes("--remote");
const FLAG = REMOTE ? "--remote" : "--local";
const cargoArg = (process.argv.find((a) => a.startsWith("--cargo=")) || "--cargo=governador").split("=")[1];
const CARGO_SLUG = cargoArg.toLowerCase();
const CARGO = CARGOS[CARGO_SLUG];
if (!CARGO) {
  console.error(`--cargo desconhecido: ${cargoArg}. Use um de: ${Object.keys(CARGOS).join(", ")}`);
  process.exit(1);
}

const ANO = 2026;
const UE = "SP";
const OUT = `db/seed-atos-${CARGO_SLUG}-sp.sql`;

function candidatosDoD1() {
  const cmd =
    `npx wrangler d1 execute politicos-db ${FLAG} --json --config worker/wrangler.jsonc ` +
    `--command "SELECT sq_candidato, nome_urna FROM candidato WHERE cargo='${CARGO}' AND sg_uf='SP'"`;
  const out = execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  const json = JSON.parse(out.slice(out.indexOf("[")));
  return json[0].results;
}

const sqlStr = (v) => (v == null || v === "" ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);

const now = new Date().toISOString();

async function main() {
  const cands = candidatosDoD1();
  console.log(`${cands.length} candidatos a ${CARGO} lidos do D1 (${FLAG})`);

  const detalhes = await comRateLimit(cands, async (c) => {
    const d = await detalheCandidato({ ano: ANO, ue: UE, eleicao: ELEICAO_GERAL_2026, sq: c.sq_candidato });
    return { c, d };
  });

  const sqList = cands.map((c) => sqlStr(c.sq_candidato)).join(",");
  let sql =
    `-- gerado por scripts/ingest-atos.mjs em ${now}\n` +
    `-- atos + classificação de ${cands.length} candidatos (${UE}/${CARGO})\n` +
    `PRAGMA foreign_keys=OFF;\n` +
    `DELETE FROM classificacao WHERE sq_candidato IN (${sqList});\n` +
    `DELETE FROM ato_oficial   WHERE sq_candidato IN (${sqList});\n`;

  let atoId = ATO_ID_OFFSET[CARGO_SLUG];
  const contagem = { verde: 0, laranja: 0, vermelho: 0, cinza: 0 };

  for (const { c, d } of detalhes) {
    const atos = mapAtos(d, { ano: ANO, ue: UE, eleicao: ELEICAO_GERAL_2026, sq: c.sq_candidato });
    atos.forEach((a) => (a._id = ++atoId));
    for (const a of atos) {
      sql +=
        `INSERT INTO ato_oficial (id,sq_candidato,tipo,situacao,descricao,orgao,numero_processo,data_ato,fonte_url,fonte_coletada_em) VALUES (` +
        `${a._id},${sqlStr(c.sq_candidato)},${sqlStr(a.tipo)},${sqlStr(a.situacao)},${sqlStr(a.descricao)},` +
        `${sqlStr(a.orgao)},${sqlStr(a.numero_processo)},${sqlStr(a.data_ato)},${sqlStr(a.fonte_url)},${sqlStr(a.fonte_coletada_em)});\n`;
    }
    const { balde, motivo } = classificarComMotivo(atos);
    contagem[balde]++;
    const motivoId = motivo != null ? atos[motivo]._id : "NULL";
    sql +=
      `INSERT INTO classificacao (sq_candidato,balde,motivo_ato_id,calculada_em) VALUES (` +
      `${sqlStr(c.sq_candidato)},${sqlStr(balde)},${motivoId},${sqlStr(now)});\n`;
    console.log(`  ${c.nome_urna}: ${balde}`);
  }

  fs.writeFileSync(OUT, sql);
  console.log("\ndistribuição:", contagem);
  console.log("SQL escrito em", OUT);
  console.log(`\nCarregar:\n  npx wrangler d1 execute politicos-db ${FLAG} --file ${OUT} --config worker/wrangler.jsonc`);
}

main().catch((e) => {
  console.error("FALHOU:", e.message);
  process.exit(1);
});
