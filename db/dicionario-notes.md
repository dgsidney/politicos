# Notas do dicionário de dados — dataset candidatos-2026 (FV-B1)

> A PREENCHER ao baixar o dicionário oficial do dataset em
> `dadosabertos.tse.jus.br/dataset/candidatos-2026`.
> Confirmar os nomes reais antes de escrever o parser (FV-B).

Arquivo bulk: `consulta_cand_2026_SP.csv` (dentro do zip por UF).
Encoding: **ISO-8859-1** · Delimitador: **`;`** · Campos entre aspas.

| Campo no nosso schema | Coluna TSE (provável — CONFIRMAR) |
|-----------------------|-----------------------------------|
| sq_candidato          | `SQ_CANDIDATO`                    |
| cpf                   | `NR_CPF_CANDIDATO`                |
| nome                  | `NM_CANDIDATO`                    |
| nome_urna             | `NM_URNA_CANDIDATO`               |
| numero                | `NR_CANDIDATO`                    |
| cargo                 | `DS_CARGO`  (filtrar 'GOVERNADOR')|
| sg_uf                 | `SG_UF`     (filtrar 'SP')        |
| partido (sigla)       | `SG_PARTIDO`                      |
| situação do registro  | `DS_SITUACAO_CANDIDATURA` / `DS_DETALHE_SITUACAO_CAND` |

Observações a validar:
- [ ] O bulk já traz a situação do registro, ou só o DivulgaCand (FV-C)?
- [ ] Como o dataset representa "não apreciado" (→ cinza)?
