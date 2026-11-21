# Implantação: gravação na planilha para todos os artistas

Este guia liga os **10 apps dos artistas** e o **Booker** às planilhas reais "Gestão e Propostas", pelo projeto
**DROM Escrita** (Apps Script, conta **contato@dromentretenimento.com**). Também passa o carimbo da coluna **BB**
de todas as planilhas para esse único projeto.

O que muda depois da implantação:

- **Apps dos artistas:** botões **Cachê** e **Custos** em cada show (as mesmas janelas do app de teste).
  Cada app só consegue gravar na planilha do próprio artista.
- **Booker:** **Salvar**, **Lançar custos**, **Cachê recebido** e **Comissão paga** passam a valer para todos os artistas.
  (**Nova** e **Copiar para…** continuam criando só no Artista Teste.)
- **Carimbo da coluna BB:** 1 projeto com 11 acionadores (10 planilhas + teste), no lugar dos 10 "Projeto sem título".

> Importante: os apps já foram publicados com a gravação ligada. **Até você concluir o Passo 3**, um clique em
> Cachê/Custos/Salvar num artista real mostra "Não foi gravado na planilha: app não autorizado" e **nada é gravado**.
> Faça os passos abaixo logo depois de receber este guia.

Tempo: uns 15 minutos.

---

## Passo 1 — Abrir o projeto DROM Escrita (logado como contato@)

1. Abra **https://accounts.google.com** e confira que a conta ativa é **contato@dromentretenimento.com**.
   Com várias contas logadas, prefira uma janela anônima só com o contato@.
2. Acesse **https://script.google.com**.
3. Clique no projeto **DROM Escrita**.

## Passo 2 — Colar o código novo e salvar

1. No GitHub, abra **https://github.com/** → repositório **sistema** → `tools/escrita/escrita.gs` → botão **Raw**
   (ou o ícone **Copiar arquivo bruto**). Ou peça ao Claude o conteúdo.
2. Selecione tudo (**Ctrl+A**) e copie (**Ctrl+C**).
3. No DROM Escrita, clique em **Código.gs** (barra da esquerda), **Ctrl+A**, **Delete**, cole (**Ctrl+V**).
4. Clique no ícone de **disquete (Salvar projeto)** ou **Ctrl+S**.

## Passo 3 — Nova versão da implantação (a URL não muda)

1. Botão azul **Implantar** (canto superior direito) → **Gerenciar implantações**.
2. Na lista da esquerda, selecione a implantação ativa (App da Web, "escrita v1").
3. Clique no **lápis ✏️ (Editar)**.
4. Em **Versão**, escolha **Nova versão**. Descrição: `todos os artistas`.
5. Confira: **Executar como: Eu (contato@…)** e **Quem pode acessar: Qualquer pessoa**.
6. Clique em **Implantar** → **Concluído**.
7. Teste: abra a URL `/exec` numa aba. Deve aparecer `{"ok":1,"svc":"drom-escrita"}`.

## Passo 4 — Autorizar e instalar os acionadores do carimbo

1. Na barra de cima do editor, ao lado de **▶ Executar**, escolha a função **autorizar** e clique **▶ Executar**.
2. Se aparecer **Autorização necessária** → **Revisar permissões** → conta **contato@** →
   (se aparecer "O Google não verificou este app") **Avançado** → **Acessar DROM Escrita (não seguro)** → **Permitir**.
3. No **Registro de execução** devem aparecer os nomes das **11 planilhas**. Se der erro de acesso numa delas,
   ela não está compartilhada como Editor com o contato@ — corrija antes de seguir.
4. Escolha a função **installTriggers** e clique **▶ Executar**. O registro deve mostrar
   `gatilhos instalados: 11 (esperado 11)`. (Pode rodar de novo sem medo: ele apaga os acionadores antigos dele antes de criar.)

## Passo 5 — Conferir os 11 acionadores

1. Abra **https://script.google.com/home/triggers** (**Meus acionadores**).
2. Devem aparecer **11** linhas do projeto **DROM Escrita**, função **carimbo**, evento **Da planilha – Ao editar**.
   (Também dá para ver em DROM Escrita → ícone de **relógio ⏰ Acionadores** na barra da esquerda.)
3. Ainda vão aparecer os acionadores/projetos antigos ("Projeto sem título") — eles saem no Passo 7.

## Passo 6 — Testar o carimbo

1. Abra a planilha de um artista (ex.: Cenoura) → aba **PROPOSTAS**.
2. Edite uma célula qualquer de uma linha a partir da **linha 5** (ex.: reescreva o mesmo texto em OBSERVAÇÕES) e tecle Enter.
3. Em poucos segundos a coluna **BB** dessa linha recebe a data e hora atuais.
4. Editar a própria coluna BB **não** gera carimbo, e as linhas 1 a 4 também não (mesmas regras de antes).
5. Repita em mais uma planilha, de preferência a do **Cadu** (que tem colunas extras; o carimbo fica na coluna 54 = BB).

## Passo 7 — Só depois de confirmar: apagar os 10 projetos antigos de carimbo

Os scripts antigos são os **"Projeto sem título"** **vinculados** a cada planilha (cada um tem uma função `onEdit` que
grava a data na coluna 54). Enquanto existirem, cada edição é carimbada duas vezes (não estraga nada, só é redundante).

Opção A — pela planilha (mais seguro para identificar):
1. Abra a planilha do artista → menu **Extensões → Apps Script**.
2. Confira que o código é o `function onEdit(e){… aba=e.source.getActiveSheet() …}` de carimbo.
3. No Apps Script aberto: **Visão geral (ícone ⓘ)** → **Remover projeto** (ou, se não houver essa opção,
   apague todo o código do arquivo, salve, e o carimbo antigo para).
4. Repita para as 10 planilhas.

Opção B — pela lista:
1. Abra **https://script.google.com** → **Meus projetos**.
2. Os projetos vinculados aparecem como **Projeto sem título**, com o ícone de planilha e o nome da planilha na coluna
   "Contêiner" / ao passar o mouse.
3. Para cada um que estiver ligado a uma planilha "Gestão e Propostas": **⋮** → **Remover**.
   **Não apague o DROM Escrita nem o projeto do drive.gs (sincronização).**

Depois, edite de novo uma célula (Passo 6) para confirmar que o BB continua sendo carimbado (agora só pelo DROM Escrita).

## Passo 8 — Teste com um artista real (lista de conferência)

Escolha um show real futuro de um artista (ex.: Cenoura) e combine com ele/ela, ou use um show que você mesmo vá corrigir depois.

- [ ] App do artista (`/sistema/<app>/`) → abra o show → **Custos** → preencha um item → **OK** →
      aparece "Custos lançados com sucesso" e no card **"⏳ custos lançados · sincronizando"**.
- [ ] Na planilha: **DESPESAS** mudou e a célula ganhou a **nota** com os itens e "Lançado pelo app em…"; **BB** carimbado.
- [ ] App → **Cachê** → **Sinal 30%** → OK → planilha: **CACHÊ RECEBIDO?** e **STATUS ARTISTA** = "Entrada 30%",
      **RECEBIDO POR** = nome do artista, **DATA RECEBIMENTO** preenchida.
- [ ] Espere a sincronização normal (planilha → BASECLAUDE → DROM Sync → `d.json`, **uns 5 a 15 minutos**) e reabra o app:
      o card mostra **"✓ custos conferidos com a planilha"** (some depois de alguns segundos).
- [ ] Booker → mesmo artista e proposta → altere um campo → **Salvar** → "Gravado na planilha".
- [ ] Booker → **Comissão paga** → Confirmar → **STATUS COMISSÃO** = "Pago". Custos e cachê passam a ficar bloqueados no app.
- [ ] Desfaça na planilha o que foi só teste (valores, nota, status).
- [ ] Notificações do app continuam chegando normalmente (nada mudou nelas; só a versão do cache do app).

Se aparecer **"Não foi gravado na planilha"**, a mensagem diz o motivo (ex.: comissão já paga, coluna não encontrada,
Nº não encontrado, app não autorizado = Passo 3 não foi feito).

## Como desfazer (rollback)

- **Desligar a gravação de um app de artista:** peça ao Claude para esvaziar a URL do `w.json` daquele app
  (`python3 tools/escrita/chave.py url "" cenoura173`) e publicar. O app volta a só ler; os botões avisam
  "Gravação indisponível".
- **Desligar no Booker:** o mesmo com `booker` (`chave.py url "" booker`).
- **Desligar tudo de uma vez, sem esperar publicação:** no DROM Escrita, **Implantar → Gerenciar implantações → ✏️ →
  Versão:** escolha a versão anterior → **Implantar**. (Ou tire o artista de `ARTS` no código e faça Nova versão.)
- **Carimbo:** se algo der errado com o carimbo centralizado, rode a função **installTriggers** depois de esvaziar
  `CARIMBO`, ou apague os acionadores em **Meus acionadores**; os scripts antigos podem ser recriados com o mesmo `onEdit`.

## Observações da conferência das planilhas (somente leitura, 21/11/2026)

Todas as 10 planilhas têm, na linha 4 da aba PROPOSTAS, as colunas que **Cachê/Custos/Comissão** usam:
Nº, CACHÊ BRUTO, DESPESAS, CACHÊ RECEBIDO?, RECEBIDO POR, DATA RECEBIMENTO, STATUS ARTISTA, STATUS COMISSÃO.
RECEBIDO POR usa o nome do artista (ex.: "Cenoura", "Liquinho"; no Cadu, **"Cadu"**).

Diferenças que afetam só o **Salvar/Nova** do Booker (tratadas no código):
- **Cadu Vieira:** colunas extras (MÊS, CHEGADA/SAÍDA, COMISSÃO R$); "INÍCIO DO SET" e "DURAÇÃO TOTAL" no lugar de
  "INÍCIO DO SHOW" e "DURAÇÃO" (o código aceita os dois nomes). Sem título em BB: carimbo pela posição 54.
- **Liquinho:** "RIDER CAMARIM" no lugar de "RIDER HOSPITALIDADE" (aceito); **não tem HOSPEDAGEM nem VENCIMENTO SINAL**.
- **Brinquinho:** **não tem VENCIMENTO SINAL**.
- Campos sem coluna na planilha são ignorados ao salvar e o Booker avisa "(ignorado: …)".
- **Ramonstro:** a coluna BB tem o título "ALTERAÇÃO" (o carimbo continua na 54).
