-- gerado por scripts/ingest-bulk.mjs em 2026-08-24T13:36:52.234Z
-- 7 candidatos a GOVERNADOR/SP · fonte: TSE dados abertos · CPF omitido (LGPD)
PRAGMA foreign_keys=OFF;
INSERT OR IGNORE INTO partido (sigla,nome) VALUES ('PT','PARTIDO DOS TRABALHADORES');
INSERT OR IGNORE INTO partido (sigla,nome) VALUES ('REPUBLICANOS','REPUBLICANOS');
INSERT OR IGNORE INTO partido (sigla,nome) VALUES ('UP','UNIDADE POPULAR');
INSERT OR IGNORE INTO partido (sigla,nome) VALUES ('PCO','PARTIDO DA CAUSA OPERÁRIA');
INSERT OR IGNORE INTO partido (sigla,nome) VALUES ('PSTU','PARTIDO SOCIALISTA  DOS TRABALHADORES UNIFICADO');
INSERT OR IGNORE INTO partido (sigla,nome) VALUES ('AGIR','AGIR');
INSERT OR IGNORE INTO partido (sigla,nome) VALUES ('PCB','PARTIDO COMUNISTA BRASILEIRO');
INSERT OR REPLACE INTO candidato (sq_candidato,cpf,nome,nome_urna,numero,cargo,sg_uf,partido_id,eleicao_ano,fonte_url,fonte_coletada_em) VALUES ('250002549705',NULL,'FERNANDO HADDAD','FERNANDO HADDAD','13','GOVERNADOR','SP',(SELECT id FROM partido WHERE sigla='PT'),2026,'https://divulgacandcontas.tse.jus.br/divulga/','2026-08-24T13:36:52.234Z');
INSERT OR REPLACE INTO candidato (sq_candidato,cpf,nome,nome_urna,numero,cargo,sg_uf,partido_id,eleicao_ano,fonte_url,fonte_coletada_em) VALUES ('250002541303',NULL,'TARCISIO GOMES DE FREITAS','TARCÍSIO','10','GOVERNADOR','SP',(SELECT id FROM partido WHERE sigla='REPUBLICANOS'),2026,'https://divulgacandcontas.tse.jus.br/divulga/','2026-08-24T13:36:52.234Z');
INSERT OR REPLACE INTO candidato (sq_candidato,cpf,nome,nome_urna,numero,cargo,sg_uf,partido_id,eleicao_ano,fonte_url,fonte_coletada_em) VALUES ('250002544912',NULL,'VIVIAN MENDES DA SILVA','VIVIAN MENDES','80','GOVERNADOR','SP',(SELECT id FROM partido WHERE sigla='UP'),2026,'https://divulgacandcontas.tse.jus.br/divulga/','2026-08-24T13:36:52.234Z');
INSERT OR REPLACE INTO candidato (sq_candidato,cpf,nome,nome_urna,numero,cargo,sg_uf,partido_id,eleicao_ano,fonte_url,fonte_coletada_em) VALUES ('250002553062',NULL,'IZADORA CRISTINA DIAS DA SILVA','IZADORA DIAS','29','GOVERNADOR','SP',(SELECT id FROM partido WHERE sigla='PCO'),2026,'https://divulgacandcontas.tse.jus.br/divulga/','2026-08-24T13:36:52.234Z');
INSERT OR REPLACE INTO candidato (sq_candidato,cpf,nome,nome_urna,numero,cargo,sg_uf,partido_id,eleicao_ano,fonte_url,fonte_coletada_em) VALUES ('250002536915',NULL,'VERA LÚCIA PEREIRA DA SILVA SALGADO','VERA LÚCIA','16','GOVERNADOR','SP',(SELECT id FROM partido WHERE sigla='PSTU'),2026,'https://divulgacandcontas.tse.jus.br/divulga/','2026-08-24T13:36:52.234Z');
INSERT OR REPLACE INTO candidato (sq_candidato,cpf,nome,nome_urna,numero,cargo,sg_uf,partido_id,eleicao_ano,fonte_url,fonte_coletada_em) VALUES ('250002548080',NULL,'EDJANE LIMA DE SOUSA','POLICIAL EDJANE','36','GOVERNADOR','SP',(SELECT id FROM partido WHERE sigla='AGIR'),2026,'https://divulgacandcontas.tse.jus.br/divulga/','2026-08-24T13:36:52.234Z');
INSERT OR REPLACE INTO candidato (sq_candidato,cpf,nome,nome_urna,numero,cargo,sg_uf,partido_id,eleicao_ano,fonte_url,fonte_coletada_em) VALUES ('250002550913',NULL,'CARLOS ALBERTO MACHADO','CARLOS MACHADO','21','GOVERNADOR','SP',(SELECT id FROM partido WHERE sigla='PCB'),2026,'https://divulgacandcontas.tse.jus.br/divulga/','2026-08-24T13:36:52.234Z');
