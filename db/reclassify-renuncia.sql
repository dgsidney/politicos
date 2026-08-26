-- Renúncia: candidato desistiu, sai da lista. Normaliza situacao no ato_oficial
-- e remove classificacao (não faz sentido classificar quem não está mais na disputa).
-- A API filtra WHERE NOT EXISTS ato_oficial.situacao='renuncia'.

UPDATE ato_oficial
   SET situacao = 'renuncia'
 WHERE tipo = 'registro'
   AND situacao = 'aguardando'
   AND descricao LIKE '%Renúncia%';

DELETE FROM classificacao
 WHERE sq_candidato IN (
   SELECT sq_candidato FROM ato_oficial WHERE situacao = 'renuncia'
 );
