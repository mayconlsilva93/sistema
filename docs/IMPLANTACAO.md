# Implantação: DROM Escrita (gravação nas planilhas, carimbo BB, rotina de hora em hora)

Guia clique a clique para colocar no ar a versão atual do **DROM Escrita** (Apps Script da conta
**contato@dromentretenimento.com**), que:

- grava nas planilhas "Gestão e Propostas" o que os **10 apps dos artistas** e o **Booker** mandam
  (Salvar, Nova, Lançar custos, Cachê recebido, Comissão paga);
- devolve ao Booker o **detalhe dos custos** (nota da célula DESPESAS), operação nova `notas` (só leitura);
- carimba a coluna **BB** a cada edição (11 acionadores "Ao editar", no lugar dos 10 "Projeto sem título");
- **NOVO:** roda uma **rotina de hora em hora** com duas funções opcionais, **desligadas por padrão**:
  - **AUTO_REALIZADO** — "Show confirmado" vira "Show realizado" quando o show termina;
  - **AUTO_CONTRATO** — PDF "[assinado]" salvo na pasta de contratos do artista marca **CONTRATO = "Sim"**.

Tempo total: uns 20 minutos.

| Arquivo | Vai para | Mudou nesta versão? |
|---|---|---|
| `tools/escrita/escrita.gs` | projeto **DROM Escrita** | **SIM — colar e implantar nova versão** |
| `tools/drive/drive.gs` | projeto **DROM Contratos** (sincronização Drive → GitHub) | não (não precisa mexer) |

Links dos arquivos (repositório **mayconlsilva93/sistema**, ramo `main`):

- escrita.gs — página: https://github.com/mayconlsilva93/sistema/blob/main/tools/escrita/escrita.gs
  — texto puro (para copiar): https://raw.githubusercontent.com/mayconlsilva93/sistema/main/tools/escrita/escrita.gs
- drive.gs — página: https://github.com/mayconlsilva93/sistema/blob/main/tools/drive/drive.gs
  — texto puro: https://raw.githubusercontent.com/mayconlsilva93/sistema/main/tools/drive/drive.gs

> Enquanto o Passo 3 não for feito, o Booker continua funcionando com a versão antiga do script; só o
> "detalhe dos custos" (operação `notas`) responde "operação não permitida" e a janela Lançar custos abre
> apenas com o total. Nada é gravado errado.

---

## NOVO (21/11/2026, 2ª versão do dia) — o que muda e o que fazer

Mudou o `escrita.gs` → **é preciso colar e implantar nova versão** (Passos 1, 2 e 3 abaixo; a URL `/exec` não muda).
Não há permissão nova (nada de reautorizar), nem acionador novo.

O que esta versão traz:

1. **Leitura ao vivo pelo Booker** — a operação `ler` aceita o Nº da proposta e devolve só aquela linha,
   com os valores exibidos e as **notas** das células. O Booker chama isso toda vez que uma proposta é aberta
   e mostra os valores da planilha por cima dos sincronizados ("✓ conferido na planilha às HH:MM").
   Com a versão antiga do script o Booker continua funcionando (lê a aba inteira e ignora notas/horas).
2. **Vários horários** — o Booker grava a lista ("Horários: 23:00 às 00:00 e 01:30 às 02:30") como **nota da
   célula INÍCIO DO SHOW** (campo `nota:INÍCIO DO SHOW` nas operações `editar`/`criar`) e também mantém a linha
   "Horários:" nas OBSERVAÇÕES, porque os apps e o Painel recebem os dados pela sincronização (IMPORTRANGE),
   que não copia notas. A rotina AUTO_REALIZADO passa a ler também a nota.
3. **Cachê recebido em dobro é recusado** (`cache`): "total" com CACHÊ RECEBIDO? = Pago; sinal com Entrada já
   marcada; parcela repetida (mesma data + valor em DATA RECEBIMENTO) ou que passe do CACHÊ BRUTO.
   A mensagem aparece na janela do app/Booker ("Não foi gravado na planilha: …").
4. **AUTO_DESCARTE** (rotina de hora em hora, **desligada até você criar a propriedade**): passado o dia do
   evento (06:00 do dia seguinte à DATA DO SHOW — regra da madrugada — ou o fim do show, se for depois), a
   proposta que nunca virou "Show confirmado"/"Show realizado" passa a **"Proposta descartada"**
   (ex.: Proposta emitida, Em negociação, Data reservada, Remarcar). Não mexe em Show cancelado, em quem já
   está descartada, em STATUS vazio nem em célula com fórmula.
5. Operação `ping` (só confere assinatura e autorização; não lê nem grava) — para testes.

Depois de implantar:

- **Simulação do AUTO_DESCARTE (não grava nada):** no editor, escolha a função **testeRotina** na lista ao
  lado de ▶ Executar → **Executar** → **Registro de execução**. A última linha diz
  `AUTO_DESCARTE (simulação, nada gravado): N proposta(s) virariam Proposta descartada` e, acima, cada uma
  (planilha · Nº · status · data). Confira algumas na planilha.
- **Ligar o AUTO_DESCARTE:** ⚙️ **Configurações do projeto** → **Propriedades do script** → **Editar propriedades
  do script** → **Adicionar propriedade do script** → Propriedade `AUTO_DESCARTE`, Valor `1` →
  **Salvar propriedades do script**. Vale na próxima execução da rotina (até 1 hora). Para desligar: apague a
  linha ou troque para `0`.
- **Conferir:** https://script.google.com/home → DROM Escrita → **Execuções** (ícone ☰ com relógio, à esquerda):
  as execuções de `rotina` mostram `descartadas: N`.

Também nesta entrega (GitHub, sem ação sua): `dev.yml` (planilha falsa → app dev/Booker) roda **a cada 10 minutos**.

---

## Passo 1 — Entrar como contato@ e abrir o DROM Escrita

1. Abra **https://accounts.google.com** e confira, no canto superior direito, que a conta ativa é
   **contato@dromentretenimento.com**. Com várias contas logadas, use uma **janela anônima**
   (**Ctrl+Shift+N** no Chrome) e entre só com o contato@.
2. Abra **https://script.google.com/home** (lista "Meus projetos").
3. Clique no projeto **DROM Escrita**. Abre o editor, com o arquivo **Código.gs** na barra da esquerda.

## Passo 2 — Colar o escrita.gs novo

1. Numa nova aba, abra **https://raw.githubusercontent.com/mayconlsilva93/sistema/main/tools/escrita/escrita.gs**.
   (Se pedir login do GitHub ou der 404, abra https://github.com/mayconlsilva93/sistema/blob/main/tools/escrita/escrita.gs
   logado no GitHub e clique no ícone **Copiar arquivo bruto** — dois quadradinhos — no canto superior direito do código.)
2. Na aba do texto puro: clique dentro do texto, **Ctrl+A** (selecionar tudo), **Ctrl+C** (copiar).
3. Volte ao editor do DROM Escrita → clique em **Código.gs** → clique dentro do código → **Ctrl+A** → **Delete**.
4. **Ctrl+V** para colar.
5. Confira: a primeira linha começa com `/* DROM · ESCRITA nas planilhas` e, perto do fim, existem as funções
   `installTriggers`, `rotina`, `autoRealizado`, `autoDescarte`, `autoContrato`, `testeRotina` e `autorizar`.
6. Salve: ícone de **disquete (Salvar projeto)** na barra de cima, ou **Ctrl+S**. O ponto laranja ao lado de
   "Código.gs" some.

## Passo 3 — Implantar uma nova versão (a URL /exec não muda)

1. Botão azul **Implantar** (canto superior direito) → **Gerenciar implantações**.
2. Na coluna da esquerda, clique na implantação ativa (tipo **App da Web**).
3. Clique no ícone de **lápis ✏️ (Editar)**, no alto da janela.
4. Em **Versão**, abra a lista e escolha **Nova versão**. Em **Descrição**, escreva `ler ao vivo + horários + cachê duplicado + AUTO_DESCARTE`.
5. Confira: **Executar como: Eu (contato@dromentretenimento.com)** e **Quem pode acessar: Qualquer pessoa**.
6. Clique em **Implantar** → **Concluído**.
7. Teste: ainda em **Implantar → Gerenciar implantações**, copie a **URL do app da Web** (termina em `/exec`) e abra
   numa aba. Deve aparecer `{"ok":1,"svc":"drom-escrita"}`.
   **Não crie uma implantação nova** (botão "Nova implantação"): isso gera outra URL e os apps não a conhecem.

## Passo 4 — Propriedades do script (KEY, AUTO_REALIZADO, AUTO_DESCARTE, AUTO_CONTRATO)

1. No editor, barra da esquerda, clique na **engrenagem ⚙️ (Configurações do projeto)**.
2. Role até **Propriedades do script**. Deve existir **KEY** (já configurada na implantação anterior — **não altere**).
3. **AUTO_REALIZADO** (opcional; deixe **sem criar** para manter desligado):
   - para ligar: **Editar propriedades do script** → **Adicionar propriedade do script** →
     Propriedade `AUTO_REALIZADO`, Valor `1` → **Salvar propriedades do script**;
   - para desligar depois: apague a linha (ícone de lixeira) ou troque o valor para `0` e salve.
4. **AUTO_CONTRATO** (opcional; mesmo jeito): Propriedade `AUTO_CONTRATO`, Valor `1`.
   **AUTO_DESCARTE** (opcional; mesmo jeito): Propriedade `AUTO_DESCARTE`, Valor `1` — rode antes o **testeRotina** (simulação).
5. A rotina lê essas propriedades **a cada execução**: ligar/desligar vale na hora seguinte, sem nova implantação.
6. `CONTRATOS_FEITOS` aparece sozinha depois que o AUTO_CONTRATO rodar (memória dos PDFs já vistos). Não edite.

Recomendação: implante com as duas **desligadas**, rode o **testeRotina** (Passo 7) e só então ligue.

## Passo 5 — Autorizar (permissões novas: Drive e acionadores de tempo)

1. Na barra de cima do editor, ao lado de **▶ Executar** e **Depurar**, abra a lista de funções e escolha **autorizar**.
2. Clique em **▶ Executar**.
3. Vai aparecer **Autorização necessária** → **Revisar permissões** → escolha **contato@dromentretenimento.com**.
4. Se aparecer "O Google não verificou este app": **Avançado** → **Acessar DROM Escrita (não seguro)**.
5. Revise a lista (planilhas, **Google Drive — ver arquivos**, executar quando você não estiver presente) → **Permitir**.
6. No **Registro de execução** (parte de baixo) devem aparecer os nomes das **11 planilhas** e, no fim,
   `Drive: Meu Drive`. Erro de acesso numa planilha = ela não está compartilhada como **Editor** com o contato@.

## Passo 6 — Instalar os acionadores (installTriggers)

1. Na lista de funções escolha **installTriggers** → **▶ Executar**.
2. O registro deve mostrar:
   - `gatilhos instalados: 11 de carimbo (esperado 11) + 1 de rotina (de hora em hora)`
   - `AUTO_REALIZADO=(vazio = desligado) · AUTO_CONTRATO=(vazio = desligado)` (ou `=1`, se você ligou).
3. Pode rodar de novo sem medo: ele apaga os acionadores **carimbo** e **rotina** antigos dele antes de criar.

## Passo 7 — Conferir a página de acionadores

1. Abra **https://script.google.com/home/triggers** (**Meus acionadores**).
   (Ou, no editor: ícone de **relógio ⏰ Acionadores** na barra da esquerda.)
2. Do projeto **DROM Escrita** devem existir **12** linhas:
   - **11** com função **carimbo**, evento **Da planilha – Ao editar**;
   - **1** com função **rotina**, evento **Baseado no tempo – Timer de horas – A cada hora**.
3. Os acionadores dos projetos antigos ("Projeto sem título") ainda aparecem — saem no Passo 10.
4. Depois de algumas horas, a coluna **Taxa de erros** da rotina deve ficar em 0%. Clique nos **⋮ → Execuções**
   para ver o registro de cada hora (ex.: `realizados: 2 · contratos: 0`, ou `rotina: nada ligado`).

## Passo 8 — Testes

**8.1 Teste a seco da rotina (não grava nada).** No editor, escolha **testeRotina** → **▶ Executar**. O registro lista
cada "Show confirmado" das 11 planilhas com o horário de fim calculado, e marca `-> viraria Show realizado` nos que a
rotina mudaria agora. Confira 2 ou 3 casos com a planilha antes de ligar o AUTO_REALIZADO.

**8.2 Carimbo BB.** Abra a planilha de um artista (ex.: Cenoura) → aba **PROPOSTAS** → reescreva o mesmo texto numa célula
de OBSERVAÇÕES (linha 5 ou abaixo) → Enter. Em segundos a coluna **BB** da linha recebe data e hora. Repita na planilha do
**Cadu** (colunas extras; o carimbo continua na coluna 54 = BB).

**8.3 Booker (no Artista Teste primeiro).** Abra o Booker → artista **Artista Teste** → uma proposta "Show confirmado":
- [ ] **Lançar custos** → preencha **Pedágios** → OK → planilha de teste: DESPESAS mudou e a célula ganhou a **nota**.
- [ ] Feche e abra o Booker em outro aparelho (ou limpe os dados do site) → **Lançar custos** de novo: os itens voltam
      preenchidos (lidos da nota pela operação `notas`).
- [ ] Mude o **Status** de uma proposta para **Show confirmado** → o Booker preenche Data de aprovação, Vencimento do
      sinal e Contrato = Pendente → **Salvar** → confira na planilha.
- [ ] **Vários horários**: escreva `23:00 às 00:00 e 01:30 às 02:30` → Salvar → planilha: INÍCIO DO SHOW `23:00`,
      DURAÇÃO `2:00` e OBSERVAÇÕES com a linha `Horários: …`.

**8.4 AUTO_REALIZADO (se ligar).** Na planilha de teste
(https://docs.google.com/spreadsheets/d/1_FIaPSZjz7rr1QwDvC7jL6qCXu09Wh1ZsgTTdearxGs/edit), deixe uma linha como
"Show confirmado" com data de ontem e início 23:00, duração 1:00. Ligue AUTO_REALIZADO=1, escolha **rotina** → ▶ Executar:
o registro mostra `realizados: 1` (ou mais) e a linha vira **Show realizado** com BB carimbado.

**8.5 AUTO_CONTRATO (se ligar).** Salve um PDF de teste com nome no padrão
`DROM Entretenimento - Contrato 110003-2026 [assinado].pdf` dentro de `…/Artista Teste/Contratos com Contratantes/`
**(só funciona para os 10 artistas reais; o teste usa o prefixo 11, que a rotina ignora)**. Para um artista real,
o nome tem de ter o número do contrato (prefixo do artista + Nº com 4 dígitos, igual ao Booker: ex. Cenoura Nº 589 →
`Contrato 50589-2026`). Rode **rotina** → `contratos: 1` e CONTRATO = "Sim" com uma nota "Contrato assinado no Drive: …".

## Passo 9 — O que a rotina faz, exatamente

**AUTO_REALIZADO (desligado por padrão).** Para cada linha com STATUS exatamente "Show confirmado" (sem fórmula):
- fim do show = DATA DO SHOW + INÍCIO DO SHOW + DURAÇÃO;
- início entre **00:00 e 05:59 = madrugada**: conta no **dia seguinte** à data do show (mesma regra do Painel e dos apps);
- show com **vários horários** (linha `Horários: 23:00 às 00:00 e 01:30 às 02:30` nas OBSERVAÇÕES): fim = fim do último horário;
- início **"a definir"**/vazio: considera realizado às **06:00 do dia seguinte** à data do show;
- duração vazia: 1 hora.
Quando a hora atual passa do fim, grava "Show realizado" e carimba BB. Nunca mexe em "Proposta emitida", cancelados etc.
Por que vem desligado: um show que foi cancelado ou remarcado sem atualizar a planilha viraria "realizado"
(e entraria em financeiro/comissões). Ligue quando o hábito de atualizar o status estiver firme.

**AUTO_CONTRATO (desligado por padrão).** Procura PDFs com "assinado" no nome, alterados nos últimos 3 dias, cujo nome
tenha `Contrato NNNNN-AAAA` e que estejam em `…/<pasta do artista>/Contratos com Contratantes/` (ou numa subpasta de ano).
Marca CONTRATO = "Sim" só se estiver vazio, "Não" ou "Pendente". PDFs com nome fora do padrão são ignorados
(a sincronização do GitHub continua achando esses pelo nome do evento, mas não marca a planilha).

## Passo 10 — Só depois dos testes: apagar os projetos antigos de carimbo

Os scripts antigos são os **"Projeto sem título"** vinculados a cada planilha (função `onEdit` que grava a data na
coluna 54). Enquanto existirem, cada edição é carimbada duas vezes (redundante, não estraga nada).

Opção A — pela planilha (mais seguro):
1. Abra a planilha do artista → menu **Extensões → Apps Script**.
2. Confira que o código é o `function onEdit(e){… e.source.getActiveSheet() …}` de carimbo.
3. No Apps Script: **Visão geral (ícone ⓘ)** → **Remover projeto**. Se não houver a opção, apague todo o código,
   salve (**Ctrl+S**) e feche.
4. Repita nas 10 planilhas.

Opção B — pela lista:
1. Abra **https://script.google.com/home/my** → **Meus projetos**.
2. Os vinculados aparecem como **Projeto sem título**, com ícone de planilha (passe o mouse para ver o nome da planilha).
3. Em cada um ligado a uma "Gestão e Propostas": **⋮ → Remover**.
   **Não apague o DROM Escrita nem o DROM Contratos (drive.gs).**

Depois, refaça o teste 8.2: o BB continua sendo carimbado (agora só pelo DROM Escrita), e em
https://script.google.com/home/triggers só ficam os 12 do DROM Escrita (+ os do DROM Contratos, se houver).

## drive.gs (DROM Contratos) — nada a fazer nesta versão

O `tools/drive/drive.gs` não mudou. Se um dia precisar recolar: abra https://script.google.com/home → **DROM Contratos**
→ cole o texto de https://raw.githubusercontent.com/mayconlsilva93/sistema/main/tools/drive/drive.gs em Código.gs →
**Ctrl+S** → **Implantar → Gerenciar implantações → ✏️ → Versão: Nova versão → Implantar** → rode **teste** (▶) para autorizar.

## Como desfazer (rollback)

- **Desligar a rotina:** apague as propriedades AUTO_REALIZADO / AUTO_CONTRATO (Passo 4) — vale na hora seguinte.
  Para tirar o acionador: https://script.google.com/home/triggers → linha **rotina** → **⋮ → Excluir acionador**.
- **Voltar o script todo:** **Implantar → Gerenciar implantações → ✏️ → Versão:** escolha a versão anterior → **Implantar**
  (a rotina e o carimbo usam o código salvo do projeto; para eles, cole de volta o código antigo e salve).
- **Desligar a gravação de um app:** peça ao Claude `python3 tools/escrita/chave.py url "" <app>` e publicar.
- **Desfazer um "Show realizado" automático:** na planilha, volte o STATUS para "Show confirmado" (e corrija a data/horário,
  senão a rotina muda de novo na hora seguinte).

## Observações das planilhas (somente leitura, 21/11/2026)

Listas de validação (aba **_AUXILIAR**), usadas nos campos de escolha do Booker:
STATUS (Proposta emitida, Proposta descartada, Em negociação, Show confirmado, Show realizado, Show cancelado,
Data reservada, Remarcar, Data indisponível) · CATEGORIA · EQUIPAMENTO (LEVAR, CONFIRMAR, 2CDJ+Mixer, XDJ, Controladora) ·
HOSPEDAGEM (Contratante, Artista, Não) · CONTRATO e NOTA FISCAL (Sim, Não, Pendente) ·
CACHÊ RECEBIDO?, STATUS ARTISTA, STATUS COMISSÃO (Pago, Pendente, Entrada 30%, Entrada 50%).

Diferenças entre planilhas (tratadas no código): **Cadu Vieira** — "INÍCIO DO SET"/"DURAÇÃO TOTAL" e colunas extras;
**Liquinho** — "RIDER CAMARIM", sem HOSPEDAGEM nem VENCIMENTO SINAL; **Brinquinho** — sem VENCIMENTO SINAL;
**Ramonstro** — BB com título "ALTERAÇÃO" (carimbo continua na 54). Campos sem coluna são ignorados ao salvar e o Booker avisa.
