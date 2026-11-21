# Integração de escrita nas planilhas (Apps Script)

Este guia liga o app do **Artista Teste** (`dev/artistateste`) e o **Booker** à planilha
**"ARTISTATESTE - Gestão e Propostas | DROM"**. Por enquanto **só a planilha de teste** pode ser alterada.
Os artistas reais continuam **somente leitura** até você aprovar.

O que passa a funcionar depois deste guia:

- **App do artista → botão Custos:** grava o total em **DESPESAS** e o detalhamento como **nota** na mesma célula
  (um custo por linha + "Lançado pelo app em dd/mm/aaaa hh:mm"). Se a comissão já estiver **Paga**, o app recusa
  (na planilha você continua podendo editar à vontade).
- **App do artista → botão Cachê:**
  - cachê total → "Pago" em CACHÊ RECEBIDO? e STATUS ARTISTA, nome do artista em RECEBIDO POR, data em DATA RECEBIMENTO;
  - sinal de 30% ou 50% → "Entrada 30%" / "Entrada 50%" nas duas colunas de status, o resto igual;
  - qualquer outro valor → só RECEBIDO POR e DATA RECEBIMENTO no formato `DD/MM/AAAA (R$ 0,00)`, somando às entradas que já existem (separadas por ", "). Os status não mudam.
  - O card mostra **"⏳ lançado · sincronizando"** até a próxima sincronização trazer o valor da planilha; aí aparece **"✓ conferido com a planilha"**.
- **Booker → Artista Teste:** botão **Salvar** grava os campos alterados na linha do Nº; **+ Nova proposta** cria uma linha nova no fim, com o próximo Nº (fórmulas e formatação copiadas da linha anterior).
- Toda gravação atualiza o **carimbo da coluna BB** (gravação por script não dispara o onEdit).

Tempo total: uns 15 minutos.

---

## Passo 1 — Compartilhar a planilha de teste com o contato@

1. Abra a planilha **ARTISTATESTE - Gestão e Propostas | DROM** com a conta que é dona dela.
2. Clique no botão azul **Compartilhar** (canto superior direito).
3. No campo "Adicionar pessoas", digite **contato@dromentretenimento.com**.
4. À direita, deixe **Editor**.
5. Desmarque "Notificar pessoas" (opcional) e clique em **Compartilhar** / **Enviar**.

> Se a planilha já é do contato@, pule este passo.

## Passo 2 — Criar o projeto do Apps Script (logado como contato@)

1. Abra uma **janela anônima** (ou um perfil do Chrome) e entre **só** com **contato@dromentretenimento.com**.
   (Com várias contas logadas, o Apps Script costuma abrir na conta errada.)
2. Acesse **https://script.google.com**.
3. Clique em **+ Novo projeto** (canto superior esquerdo).
4. Clique no título **"Projeto sem título"** (no topo), troque para **DROM Escrita** e clique em **Renomear**.

## Passo 3 — Colar o código

1. No GitHub, abra o arquivo **`tools/escrita/escrita.gs`** do repositório `sistema` e clique em **Raw** (ou no ícone de copiar).
   (Ou peça ao Claude que mande o conteúdo.)
2. Selecione **tudo** (Ctrl+A) e copie (Ctrl+C).
3. Volte ao Apps Script. No arquivo **Código.gs**, apague tudo o que estiver lá (Ctrl+A, Delete).
4. Cole (Ctrl+V).
5. Clique no ícone de **disquete** (Salvar projeto) ou Ctrl+S.

## Passo 4 — Criar a propriedade KEY

1. Na barra da esquerda, clique na **engrenagem ⚙️ (Configurações do projeto)**.
2. Role até o fim: **Propriedades do script** → clique em **Adicionar propriedade do script**.
3. **Propriedade:** `KEY`
4. **Valor:** a chave que o Claude te passou na conversa (uma sequência de 43 caracteres com letras, números, `-` e `_`).
   Cole sem espaços antes ou depois.
5. Clique em **Salvar propriedades do script**.

> A chave **não** fica em texto aberto no repositório. Ela está guardada cifrada em `tools/escrita/key.enc.json`
> e, se precisar vê-la de novo, o Claude a recupera com `python3 tools/escrita/chave.py mostrar`.

## Passo 5 — Autorizar (uma vez)

1. Volte ao editor (ícone **< >** na barra da esquerda).
2. Na barra de cima, ao lado de "Depurar", escolha a função **autorizar** na lista.
3. Clique em **▶ Executar**.
4. Aparece "Autorização necessária" → **Revisar permissões**.
5. Escolha a conta **contato@dromentretenimento.com**.
6. Se aparecer "O Google não verificou este app": clique em **Avançado** → **Acessar DROM Escrita (não seguro)**.
7. Clique em **Permitir**.
8. No "Registro de execução" deve aparecer o nome da planilha de teste. Se aparecer erro de acesso, revise o Passo 1.

## Passo 6 — Implantar como App da Web

1. Clique no botão azul **Implantar** (canto superior direito) → **Nova implantação**.
2. Ao lado de "Selecionar tipo", clique na **engrenagem ⚙️** → **App da Web**.
3. **Descrição:** `escrita v1`
4. **Executar como:** **Eu (contato@dromentretenimento.com)**
5. **Quem pode acessar:** **Qualquer pessoa**
6. Clique em **Implantar**. Se pedir autorização de novo, repita os itens 4 a 7 do Passo 5.
7. Copie a **URL do app da Web** (termina em `/exec`). Clique em **Concluído**.

Teste rápido: cole a URL numa aba nova. Deve aparecer `{"ok":1,"svc":"drom-escrita"}`.

## Passo 7 — Mandar a URL para o Claude

Mande a URL `/exec` na conversa. O Claude roda `python3 tools/escrita/chave.py url <URL>`, que grava
`dev/artistateste/w.json` e `booker/w.json` (cada app recebe só a sua chave derivada, cifrada) e publica.
Enquanto esses arquivos estiverem sem URL, os apps continuam como hoje (só local).

## Passo 8 — Reimplantar o drive.gs (sincronização da planilha de teste)

O app de teste e o Booker leem a planilha de teste pelo projeto antigo **drive.gs** (parâmetro `dev=1`), que ainda não foi reimplantado.

1. Em https://script.google.com, abra o projeto do **drive.gs** (o da sincronização Drive → GitHub).
2. Substitua o código pelo conteúdo atual de **`tools/drive/drive.gs`** do repositório e salve.
3. **Implantar** → **Gerenciar implantações**.
4. Selecione a implantação ativa (App da Web) e clique no **lápis ✏️ (Editar)**.
5. Em **Versão**, escolha **Nova versão**. Mantenha "Executar como: Eu" e "Qualquer pessoa".
6. Clique em **Implantar**. A **URL continua a mesma** (não precisa mexer no segredo DRIVE_URL).
7. Se o projeto do drive.gs for de outra conta, a planilha de teste também precisa estar compartilhada com ela.
8. Teste: no GitHub, aba **Actions** → **DROM · DEV** → **Run workflow**. Deve terminar verde.

## Passo 9 (opcional) — Carimbo de edição centralizado

O projeto DROM Escrita também pode carimbar a coluna **BB** quando alguém edita a planilha à mão
(mesmas regras de hoje: aba PROPOSTAS, linha ≥ 5, edição no próprio BB é ignorada).

1. No editor do DROM Escrita, escolha a função **installTriggers** e clique **▶ Executar**.
2. Autorize se pedir.
3. Confira em **⏰ Acionadores** (barra da esquerda): deve haver um acionador `carimbo` "Da planilha – Ao editar".
4. **Só depois**, se quiser, remova o script de carimbo antigo da própria planilha de teste (Extensões → Apps Script) para não carimbar duas vezes. (Carimbar duas vezes não estraga nada; só é redundante.)

Rodar `installTriggers` de novo é seguro: ele apaga os acionadores antigos dele e recria.

---

## Como testar depois de tudo

1. App de teste (`/sistema/dev/artistateste/`, PIN 123321): abra um show → **Custos** → preencha → OK.
   Na planilha, DESPESAS muda e ganha a nota. O card mostra "⏳ custos lançados · sincronizando".
2. Rode **Actions → DROM · DEV** (ou espere a hora cheia + 43 min). Reabra o app: "✓ custos conferidos com a planilha".
3. Booker → artista **Artista Teste** → altere um campo → **💾 Salvar** → "Gravado na planilha".
4. Erros (comissão paga, coluna sumida, Nº não encontrado) aparecem numa janela "Não foi gravado na planilha".

## Como estender para todos os artistas (quando você aprovar)

Para cada artista real:

1. **Compartilhe** a planilha "Gestão e Propostas" dele com contato@ como **Editor** (Passo 1).
2. No `escrita.gs`, acrescente o artista em `APPS`:
   ```js
   cenoura173: {planilhas:{'Cenoura':'<id da planilha>'}, ops:['custos','cache'], recebidoPor:'Cenoura'},
   booker:     {planilhas:{'Artista Teste':TESTE, 'Cenoura':'<id da planilha>'}, ops:['criar','editar','ler']}
   ```
   e o id em `CARIMBO` (se quiser o carimbo centralizado). Salve e faça **Implantar → Gerenciar implantações → ✏️ → Nova versão** (a URL não muda).
   Rode `installTriggers` de novo se mexeu em `CARIMBO`.
3. O Claude gera o `w.json` do app daquele artista (`chave.py`, chave própria do app, cifrada com o PIN dele),
   leva os botões Cachê/Custos para o app real e libera o artista no Booker (`WRT` em `booker/bx.js`).
4. Ao instalar o carimbo centralizado de um artista, apague o script de carimbo antigo daquela planilha.

Segurança: cada app só tem a **sua** chave (derivada da KEY) e só consegue escrever nas planilhas listadas para ele;
pedidos têm validade de 15 minutos e um id único (repetir o mesmo pedido não grava duas vezes). Para trocar a KEY:
gere outra (`chave.py nova` após apagar `key.enc.json`), troque a propriedade KEY no Apps Script e rode `chave.py url <URL>`.

## Arquivos

| Arquivo | Papel |
|---|---|
| `tools/escrita/escrita.gs` | código do Apps Script (colar no projeto DROM Escrita) |
| `tools/escrita/key.enc.json` | KEY cifrada com DROM_BKK |
| `tools/escrita/chave.py` | gera/mostra a KEY e grava os `w.json` |
| `tools/escrita/mock.cjs` | simulador local do Apps Script para testes |
| `ew.js` | cliente comum (assina e envia) |
| `dev/artistateste/w.json`, `booker/w.json` | URL + chave do app (cifrada); URL vazia = escrita desligada |
| `booker/bx.js` | recursos novos do Booker (Salvar, nova proposta, copiar, semelhantes, calculadora) |
| `booker/dv.json` | dados do Artista Teste no Booker (gerado por `tools/dev/devsync.py`) |
