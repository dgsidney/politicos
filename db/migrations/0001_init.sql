-- 0001_init.sql — Fatia vertical (Governador SP 2026)
-- D1 = SQLite. Subconjunto do schema do mapa: partido, candidato, ato_oficial, classificacao.

CREATE TABLE IF NOT EXISTS partido (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  sigla  TEXT NOT NULL UNIQUE,
  nome   TEXT
);

CREATE TABLE IF NOT EXISTS candidato (
  sq_candidato       TEXT PRIMARY KEY,          -- SQ_CANDIDATO (chave natural do TSE)
  cpf                TEXT,
  nome               TEXT NOT NULL,
  nome_urna          TEXT,
  numero             TEXT,
  cargo              TEXT NOT NULL,             -- 'GOVERNADOR' na fatia
  sg_uf              TEXT NOT NULL,             -- 'SP' na fatia
  partido_id         INTEGER REFERENCES partido(id),
  eleicao_ano        INTEGER NOT NULL,
  fonte_url          TEXT,                      -- provenance: link à fonte oficial
  fonte_coletada_em  TEXT                       -- ISO datetime da coleta
);
CREATE INDEX IF NOT EXISTS idx_candidato_cargo_uf ON candidato(cargo, sg_uf);

CREATE TABLE IF NOT EXISTS ato_oficial (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  sq_candidato       TEXT NOT NULL REFERENCES candidato(sq_candidato),
  tipo               TEXT NOT NULL,             -- registro|impugnacao|processo|condenacao|inelegibilidade
  situacao           TEXT,                      -- deferido|indeferido|sub_judice|sem_transito|colegiado...
  descricao          TEXT,
  orgao              TEXT,
  numero_processo    TEXT,
  data_ato           TEXT,
  fonte_url          TEXT NOT NULL,             -- obrigatório: sem fonte, não entra
  fonte_coletada_em  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ato_candidato ON ato_oficial(sq_candidato);

CREATE TABLE IF NOT EXISTS classificacao (
  sq_candidato   TEXT PRIMARY KEY REFERENCES candidato(sq_candidato),
  balde          TEXT NOT NULL CHECK (balde IN ('verde','laranja','vermelho','cinza')),
  motivo_ato_id  INTEGER REFERENCES ato_oficial(id),
  calculada_em   TEXT NOT NULL,
  -- REGRA DE OURO: laranja e vermelho exigem um ato oficial que os justifique.
  -- verde (nada) e cinza (aguardando) não têm motivo.
  CHECK (balde IN ('verde','cinza') OR motivo_ato_id IS NOT NULL)
);
