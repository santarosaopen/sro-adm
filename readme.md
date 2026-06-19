# SRO — Sistema de Registro Operacional

Sistema web completo para gestão operacional de consumo de recursos, controle de presenças e registro de atividades com evidências fotográficas. Desenvolvido com Next.js 14, MongoDB e Tailwind CSS.

---

## Módulos

| Módulo | Descrição |
|--------|-----------|
| **Água** | Registro de leituras diárias e da companhia, gráfico de consumo, estatísticas, cota e exportação em PDF |
| **Energia** | Registro de leituras, gráfico, estatísticas e calculadora de custo |
| **Horários** | Registro de presença com foto, validação GPS, histórico e visualização de quem está presente |
| **Atividades** | Registro via QR Code com foto + observação, atividades extras, sugestão de periodicidade e histórico do dia |
| **Administrativo** | Gestão completa de funcionários, funções, atividades, execuções, extras, presenças, medidas, usuários, logs e configurações |

---

## Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Estilização**: Tailwind CSS
- **Banco de dados**: MongoDB via Mongoose (TTL automático configurável)
- **Autenticação admin**: JWT em cookie `httpOnly` (biblioteca `jose`)
- **Autenticação operacional**: credenciais de funcionário ou senha operacional de admin
- **QR Code**: `qrcode` (geração client-side) + `jsqr` (leitura via câmera)
- **Câmera**: API nativa `getUserMedia` + `canvas` (sem dependência de lib de webcam para fotos)
- **Gráficos**: Recharts
- **PDF**: jsPDF + jspdf-autotable
- **Deploy**: Vercel (Free Tier)

---

## Pré-requisitos

- Node.js 18+
- Conta no [MongoDB Atlas](https://cloud.mongodb.com) (Free Tier disponível)
- Conta no [Vercel](https://vercel.com) para deploy (opcional)

---

## Instalação local

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd SRO

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com seus valores reais

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse em [http://localhost:3000](http://localhost:3000).

---

## Variáveis de Ambiente

```env
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/SRO?retryWrites=true&w=majority
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
JWT_SECRET=troque-por-uma-string-aleatoria-segura-aqui
```

> **Atenção**: nunca suba o `.env.local` para o repositório.

---

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Inicia o servidor de produção |
| `npm run lint` | Executa o ESLint |

---

## Modelos de Dados (MongoDB)

### Funcao
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `nome` | String | Nome da função/cargo |
| `ativo` | Boolean | Se aparece nas seleções |

### Funcionario
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `nome` | String | Nome completo |
| `username` | String | Login para modo operacional |
| `senhaHash` | String | SHA-256 da senha (nunca exposto na API) |
| `ativo` | Boolean | Se aparece nas seleções |

### Atividade
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `nome` | String | Descrição da atividade |
| `funcaoId` | ObjectId | Função à qual pertence |
| `qrToken` | String | UUID único para o QR Code |
| `ativo` | Boolean | Se está ativa |
| `periodicidade` | Object | `{ tipo: 'intervalo'\|'diasSemana', intervalo?, diasSemana? }` |

### ExecucaoAtividade
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `atividadeId` | ObjectId | Atividade executada |
| `funcionarioId` | ObjectId | Executor |
| `nomeExecutor` | String | Nome gravado no momento (persiste após deletar funcionário) |
| `fotoExecutor` | String | Foto da presença do dia (persiste após deletar funcionário) |
| `fotos` | String[] | Fotos da execução (base64) |
| `observacao` | String | Observação opcional |
| `timestamp` | Date | Data e hora da execução |

### AtividadeExtra
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `funcionarioId` | ObjectId | Executor |
| `descricao` | String | Descrição da atividade extra |
| `observacao` | String | Observação opcional |
| `fotos` | String[] | Fotos da execução |
| `timestamp` | Date | Data e hora |

### RegistroPonto
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `funcionarioId` | ObjectId | Funcionário |
| `funcaoId` | ObjectId | Função exercida no dia |
| `foto` | String | Foto do registro (base64) |
| `timestamp` | Date | Data e hora da presença |

### LeituraAgua / LeituraEnergia
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `valor` | Number | Valor acumulado do medidor |
| `data` | Date | Data da leitura |
| `tipo` | `'diaria'\|'mensal'` | Diária (própria) ou da companhia |

### Configuracao — Chaves utilizadas

| Chave | Padrão | Descrição |
|-------|--------|-----------|
| `cota_agua` | — | Cota diária de consumo de água (m³) |
| `nome_empresa_agua` | — | Nome da companhia de água para o gráfico |
| `nome_empresa_energia` | — | Nome da companhia de energia |
| `gps_latitude` | — | Latitude do ponto de referência para presença |
| `gps_longitude` | — | Longitude do ponto de referência |
| `gps_raio_metros` | 100 | Raio de tolerância em metros |
| `retencao_presencas_dias` | 30 | Dias de retenção dos registros de presença (TTL) |
| `retencao_execucoes_dias` | 90 | Dias de retenção das execuções de atividades (TTL) |

---

## API REST

### Água
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/agua` | Lista leituras |
| `POST` | `/api/agua` | Registra leitura |
| `PUT` | `/api/agua/[id]` | Atualiza leitura |
| `DELETE` | `/api/agua/[id]` | Remove leitura |

### Energia
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/energia` | Lista leituras |
| `POST` | `/api/energia` | Registra leitura |
| `PUT` | `/api/energia/[id]` | Atualiza leitura |
| `DELETE` | `/api/energia/[id]` | Remove leitura |

### Presenças
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/ponto` | Lista registros (`?funcionarioId=`) |
| `POST` | `/api/ponto` | Registra presença (1 por funcionário+função por dia) |
| `DELETE` | `/api/ponto/[id]` | Remove registro |
| `GET` | `/api/ponto/presenca` | Quem está presente hoje (BRT) |
| `GET` | `/api/ponto/verificar` | Verifica se já registrou (`?funcionarioId=&funcaoId=`) |

### Funcionários
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/funcionarios` | Lista (`?ativos=true`) |
| `POST` | `/api/funcionarios` | Cria funcionário |
| `PUT` | `/api/funcionarios/[id]` | Atualiza (inclui `username` e `senha`) |
| `DELETE` | `/api/funcionarios/[id]` | Remove apenas o cadastro (demais registros preservados) |

### Funções
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/funcoes` | Lista (`?ativas=true`) |
| `POST` | `/api/funcoes` | Cria função |
| `GET` | `/api/funcoes/[id]` | Busca por ID |
| `PUT` | `/api/funcoes/[id]` | Atualiza |
| `DELETE` | `/api/funcoes/[id]` | Remove |

### Atividades (entidades com QR)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/atividades` | Lista (`?funcaoId=`) |
| `POST` | `/api/atividades` | Cria atividade (gera `qrToken`) |
| `GET` | `/api/atividades/[id]` | Busca por ID |
| `PUT` | `/api/atividades/[id]` | Atualiza |
| `DELETE` | `/api/atividades/[id]` | Remove |
| `GET` | `/api/atividades/scan` | Resolve token do QR (`?t=<token>`) |
| `GET` | `/api/atividades/dia` | Execuções QR + extras do dia mesclados |
| `GET` | `/api/atividades/sugestoes` | Atividades pendentes por periodicidade (`?funcaoId=&funcionarioId=`) |

### Execuções de Atividades
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/execucoes` | Lista (`?atividadeId=&funcionarioId=`) |
| `POST` | `/api/execucoes` | Registra execução com fotos |
| `PUT` | `/api/execucoes/[id]` | Atualiza fotos e observação |
| `DELETE` | `/api/execucoes/[id]` | Remove execução |
| `GET` | `/api/execucoes/dia` | Execuções de um dia (`?data=&funcaoId=`) |
| `GET` | `/api/execucoes/periodo` | Execuções em intervalo (`?inicio=&fim=&funcaoId=&funcionarioId=`) |
| `GET` | `/api/execucoes/verificar` | Verifica se já executou hoje (`?atividadeId=&funcionarioId=`) |

### Atividades Extras
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/extras` | Lista (`?periodo=dia\|semana\|mes&funcionarioId=`) |
| `POST` | `/api/extras` | Registra atividade extra |
| `DELETE` | `/api/extras/[id]` | Remove atividade extra |

### Configuração
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/configuracao?chave=<chave>` | Lê valor |
| `POST` | `/api/configuracao` | Salva ou atualiza |

### Admin — Auth
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/admin/login` | Autentica e define cookie JWT (8h) |
| `POST` | `/api/admin/logout` | Remove o cookie |
| `GET/POST/PUT/DELETE` | `/api/admin/usuarios` | CRUD de usuários admin |
| `POST` | `/api/admin/ttl` | Sincroniza índices TTL com configurações atuais |

### Modo Operacional
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/operacional/verificar` | Valida credenciais (funcionário ou admin com senha operacional) |

### Logs
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/logs` | Últimas 200 entradas de auditoria |

---

## Funcionalidades por Módulo

### Água e Energia
- Leituras **diárias** e **mensais** (companhia)
- Gráfico com navegação por Semana / Mês / Ano
- Linhas de referência das leituras da companhia
- Estatísticas de máximo, mínimo e média
- **Água**: barra de progresso vs. cota e exportação em PDF
- **Energia**: calculadora de custo estimado

### Horários (Presença)
- Um registro por funcionário **por função** por dia (mesma pessoa pode registrar em funções diferentes)
- Validação client-side antes de mostrar a câmera — bloqueia se já registrou na mesma função hoje
- Captura de foto via câmera do dispositivo com seleção automática entre câmeras disponíveis
- Validação de GPS (opcional) — bloqueia fora do raio configurado
- **Registro por terceiro**: funcionário logado pode registrar presença de outro após validar as credenciais desse outro funcionário
- Visualização em tempo real de quem está presente

### Atividades
**Modo Operacional:**
- Sugestões de periodicidade — lista atividades pendentes baseado no intervalo ou dias da semana configurados
- Escanear QR Code via câmera para registrar execução
- Ao escanear: verifica se já foi executada hoje e permite editar o registro existente em vez de criar um novo
- Registro com 1 ou mais fotos + observação opcional
- Atividades Extras: descrição livre + fotos + observação
- Lista das atividades executadas no dia (QR + extras)
- Relógio circular de 10s na tela de sucesso antes de redirecionar para o scanner

**Modo Visualização:**
- Lista unificada de execuções QR + extras do dia com filtro de dia e função
- Badge de cor por função, badge roxo para extras
- Fotos clicáveis com lightbox e navegação por setas (←/→ ou teclado)

### Painel Administrativo
**Estrutura:** sidebar fixa com navegação entre módulos sem precisar do botão voltar do browser.

**Módulos disponíveis:**
- **Funcionários**: CRUD + credenciais de login operacional (username + senha)
- **Funções**: CRUD de funções/cargos
- **Atividades**: CRUD com geração de QR Code, periodicidade configurável, botão "Ver execuções" para histórico completo, impressão de QR Codes em PDF (máx. 9 por página, grid A4)
- **Execuções de Atividades**: histórico filtrado por dia/semana/mês/range + função, com foto do executor, observações e exclusão
- **Extras**: histórico de atividades extras com filtros completos, observações e exclusão
- **Presenças**: registros por funcionário e período com exclusão
- **Medidas**: tabela editável de leituras de água e energia
- **Usuários**: CRUD de administradores
- **Logs**: auditoria das últimas 200 ações
- **Configurações**: cotas, nomes de companhia, GPS, retenção de dados (TTL automático configurável pelo admin)

### QR Codes
- Gerado automaticamente ao criar cada atividade (UUID único)
- Exibido no admin com opção de imprimir
- Impressão em lote: selecionar atividades específicas ou todas → PDF A4 com grid 3×3, borda preta, nome e função
- Escaneado via câmera no modo operacional (detecção em tempo real com `jsqr`)

### Periodicidade de Atividades
Configurada por atividade no admin com dois modos:
- **Intervalo**: a cada N dias (ex: a cada 2 dias)
- **Dias da semana**: seg, qua, sex — sugere no próximo dia configurado após a última execução

As sugestões aparecem no modo operacional quando o funcionário tem presença registrada hoje.

### TTL Automático
Registros são apagados automaticamente pelo MongoDB após o período configurado:
- **Presenças**: padrão 30 dias
- **Execuções de atividades**: padrão 90 dias

Os valores são configuráveis no admin (Configurações → Retenção de Registros). Ao salvar, os índices TTL do MongoDB são atualizados via `collMod` sem downtime.

---

## Modo Operacional

O sistema possui dois modos de uso:

| Modo | Acesso | Permissões |
|------|--------|------------|
| **Visualização** | Sem senha | Apenas leitura |
| **Operacional** | Credenciais de funcionário ou senha operacional de admin | Registros completos |

- Funcionário acessa com `username` + `senha` definidos pelo admin
- Admin com senha operacional também pode acessar
- O sistema identifica o tipo de usuário e adapta a interface (ex: pré-seleciona o funcionário no registro de presença)
- Botão "Sair" destacado na navbar quando operacional; também funciona clicando no badge de modo

---

## Autenticação Administrativa

- Rota protegida: `/admin/*` (exceto `/admin/login`)
- `middleware.ts` intercepta e verifica o cookie `admin-token` via `jose`
- Token com validade de **8 horas**
- Página de login não exibe a sidebar administrativa

---

## Detalhes Técnicos

### Fuso horário (BRT / UTC-3)
Todo cálculo de "hoje" usa UTC-3: meia-noite BRT = 03:00 UTC. Registros são filtrados por `timestamp >= UTC(dia, mês, ano, 3h)` e `< UTC(dia+1, mês, ano, 3h)`.

### Foto no ponto e execuções
- Capturada via `getUserMedia` + `canvas.toDataURL('image/jpeg', 0.85)`
- A foto de presença é copiada para `ExecucaoAtividade.fotoExecutor` no momento do registro — persiste mesmo após o funcionário ser deletado

### GPS
Distância calculada pela fórmula de Haversine. O registro é bloqueado se além do raio configurado.

### Deleção segura de funcionários
`DELETE /api/funcionarios/[id]` apaga apenas o documento do `Funcionario`. Registros de presença, execuções, atividades extras e logs mantêm o `funcionarioId` como referência (pode ser dangling) mas preservam `nomeExecutor` e `fotoExecutor` para exibição histórica.

### Leituras acumulativas
O gráfico exibe o **delta** entre leituras consecutivas. Valores negativos (troca de medidor) são normalizados para `0`.
