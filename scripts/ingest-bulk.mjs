// FV-B · Ingestor bulk de candidatos (TSE dados abertos).
// Baixa consulta_cand_<ano>.zip, filtra SP + <cargo>, e gera db/seed-<slug>-sp.sql.
//
// Uso:
//   node scripts/ingest-bulk.mjs                            (governador, default)
//   node scripts/ingest-bulk.mjs --cargo=deputado-federal
//   node scripts/ingest-bulk.mjs --cargo=deputado-estadual
//
// O download funciona com um User-Agent de navegador. Se der 403, rode de um
// IP no Brasil — o CDN do TSE às vezes bloqueia egress cru.
//
// Privacidade (LGPD): o CPF NÃO é carregado. A lista de candidatos é pública, o CPF não precisa estar.

import fs from "node:fs";
import path from "node:path";
import AdmZip from "adm-zip";

const YEAR = 2026;
const UF = "SP";

// Mapa slug (usado no CLI e no nome do arquivo) → valor real de DS_CARGO no CSV do TSE.
const CARGOS = {
  "governador": "GOVERNADOR",
  "deputado-federal": "DEPUTADO FEDERAL",
  "deputado-estadual": "DEPUTADO ESTADUAL",
};

const cargoArg = (process.argv.find((a) => a.startsWith("--cargo=")) || "--cargo=governador").split("=")[1];
const CARGO_SLUG = cargoArg.toLowerCase();
const CARGO = CARGOS[CARGO_SLUG];
if (!CARGO) {
  console.error(`--cargo desconhecido: ${cargoArg}. Use um de: ${Object.keys(CARGOS).join(", ")}`);
  process.exit(1);
}

const ZIP_URL = `https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_${YEAR}.zip`;
const RAW_DIR = "db/raw";
const ZIP_PATH = path.join(RAW_DIR, `consulta_cand_${YEAR}.zip`);
const OUT_SQL = `db/seed-${CARGO_SLUG}-sp.sql`;

async function download() {
  if (fs.existsSync(ZIP_PATH)) {
    console.log("zip já existe, pulando download:", ZIP_PATH);
    return;
  }
  fs.mkdirSync(RAW_DIR, { recursive: true });
  console.log("baixando", ZIP_URL);
  const res = await fetch(ZIP_URL, { headers: { "User-Agent": "Mozilla/5.0", Accept: "*/*" } });
  if (!res.ok) {
    throw new Error(
      `download falhou: HTTP ${res.status}. ` +
        `Se for 403, rode este script de um IP no Brasil (o TSE bloqueia egress de datacenter/fora do país).`,
    );
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(ZIP_PATH, buf);
  console.log("salvo", ZIP_PATH, (buf.length / 1e6).toFixed(1), "MB");
}

// CSV do TSE: delimitado por ';', campos entre aspas duplas.
function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else q = false;
      } else cur += c;
    } else if (c === '"') q = true;
    else if (c === ";") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

const pick = (header, row, names) => {
  for (const n of names) {
    const i = header.indexOf(n);
    if (i >= 0) return row[i];
  }
  return "";
};
const sqlStr = (v) => (v == null || v === "" ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);

function main() {
  const zip = new AdmZip(ZIP_PATH);
  const names = zip.getEntries().map((e) => e.entryName);
  const entry =
    names.find((n) => /_SP\.csv$/i.test(n)) ||
    names.find((n) => /BRASIL\.csv$/i.test(n)) ||
    names.find((n) => /\.csv$/i.test(n));
  if (!entry) throw new Error("nenhum CSV no zip: " + names.join(", "));
  console.log("usando arquivo:", entry);

  const text = new TextDecoder("latin1").decode(zip.getEntry(entry).getData());
  const lines = text.split(/\r?\n/).filter((l) => l.length);
  const header = parseCsvLine(lines[0]);
  console.log("\nHEADER (confira e atualize db/dicionario-notes.md):\n", header.join(" | "), "\n");

  const cands = [];
  const partidos = new Map();
  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    if (pick(header, row, ["SG_UF"]) !== UF) continue;
    if ((pick(header, row, ["DS_CARGO"]) || "").toUpperCase().trim() !== CARGO) continue;
    const c = {
      sq: pick(header, row, ["SQ_CANDIDATO"]),
      nome: pick(header, row, ["NM_CANDIDATO"]),
      urna: pick(header, row, ["NM_URNA_CANDIDATO"]),
      numero: pick(header, row, ["NR_CANDIDATO"]),
      partido: pick(header, row, ["SG_PARTIDO"]),
    };
    cands.push(c);
    if (c.partido && !partidos.has(c.partido)) partidos.set(c.partido, pick(header, row, ["NM_PARTIDO"]));
  }
  console.log(`encontrados ${cands.length} candidatos a ${CARGO} em ${UF}`);

  const now = new Date().toISOString();
  const fonte = "https://divulgacandcontas.tse.jus.br/divulga/"; // FV-C refina p/ o link direto do candidato
  let sql =
    `-- gerado por scripts/ingest-bulk.mjs em ${now}\n` +
    `-- ${cands.length} candidatos a ${CARGO}/${UF} · fonte: TSE dados abertos · CPF omitido (LGPD)\n` +
    `PRAGMA foreign_keys=OFF;\n`;
  for (const [sigla, nome] of partidos) sql += `INSERT OR IGNORE INTO partido (sigla,nome) VALUES (${sqlStr(sigla)},${sqlStr(nome)});\n`;
  for (const c of cands) {
    sql +=
      `INSERT OR REPLACE INTO candidato (sq_candidato,cpf,nome,nome_urna,numero,cargo,sg_uf,partido_id,eleicao_ano,fonte_url,fonte_coletada_em) VALUES (` +
      `${sqlStr(c.sq)},NULL,${sqlStr(c.nome)},${sqlStr(c.urna)},${sqlStr(c.numero)},'${CARGO}','${UF}',` +
      `(SELECT id FROM partido WHERE sigla=${sqlStr(c.partido)}),${YEAR},${sqlStr(fonte)},${sqlStr(now)});\n`;
  }
  fs.writeFileSync(OUT_SQL, sql);
  console.log("\nSQL escrito em", OUT_SQL);
  console.log("\nCarregar no D1:");
  console.log(`  npx wrangler d1 execute politicos-db --local  --file ${OUT_SQL} --config worker/wrangler.jsonc`);
  console.log(`  npx wrangler d1 execute politicos-db --remote --file ${OUT_SQL} --config worker/wrangler.jsonc`);
  console.log("\n(Opcional, arquivar o bruto no R2):");
  console.log(`  npx wrangler r2 object put raw-tse/consulta_cand_${YEAR}.zip --file ${ZIP_PATH}`);
}

await download();
main();
