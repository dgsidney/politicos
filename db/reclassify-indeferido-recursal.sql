-- Régua Ficha Limpa: "Indeferido em prazo recursal ou com recurso" = trâmite não julgado
-- → sub_judice (laranja), não indeferido (vermelho). Ato consumado só quando TRE confirmar.
-- Aplica só nos atos afetados; mantém motivo_ato_id (é o mesmo ato, com situação normalizada).

UPDATE ato_oficial
   SET situacao = 'sub_judice'
 WHERE tipo = 'registro'
   AND situacao = 'indeferido'
   AND descricao LIKE '%Indeferido em prazo recursal%';

UPDATE classificacao
   SET balde = 'laranja',
       calculada_em = strftime('%Y-%m-%dT%H:%M:%fZ','now')
 WHERE balde = 'vermelho'
   AND motivo_ato_id IN (
     SELECT id FROM ato_oficial
      WHERE tipo = 'registro' AND situacao = 'sub_judice'
        AND descricao LIKE '%Indeferido em prazo recursal%'
   );
