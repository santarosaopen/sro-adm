# SRO — Sistema de Registro Operacional

Sistema web completo para gestão operacional de consumo de recursos e controle de funcionários. Desenvolvido com Next.js 14, MongoDB e Tailwind CSS, com deploy gratuito no Vercel.

---

## Módulos

| Módulo | Descrição |
|--------|-----------|
| **Água** | Registro de leituras diárias e da companhia, gráfico de consumo, estatísticas, cota de consumo e exportação em PDF |
| **Energia** | Registro de leituras diárias e da companhia, gráfico de consumo, estatísticas e calculadora de custo estimado |
| **Ponto** | Registro de entrada/saída com foto via webcam, verificação por GPS e visualização de horários |
| **Atividades** | Checklist de atividades diárias por funcionário |
| **Administrativo** | Gestão de funcionários, usuários admin, medidas, pontos, configurações e logs de auditoria |

---

## Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Estilização**: Tailwind CSS
- **Banco de dados**: MongoDB via Mongoose
- **Autenticação**: JWT em cookie `httpOnly` (biblioteca `jose`)
- **Gráficos**: Recharts
- **PDF**: jsPDF + jspdf-autotable
- **Webcam**: react-webcam (import dinâmico com `ssr: false`)
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

Crie o arquivo `.env.local` na raiz do projeto:

```env
# String de conexão do MongoDB Atlas
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/SRO?retryWrites=true&w=majority

# Credenciais do administrador padrão
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Segredo para assinatura dos tokens JWT (use uma string longa e aleatória)
JWT_SECRET=troque-por-uma-string-aleatoria-segura-aqui
```

> **Atenção**: nunca suba o `.env.local` para o repositório. Ele já está listado no `.gitignore`.

---

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Inicia o servidor de produção |
| `npm run lint` | Executa o ESLint |

---

## Estrutura de Pastas

```
SRO/
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── src/
    ├── middleware.ts              ← Protege /admin/* via JWT
    ├── types/index.ts             ← Interfaces TypeScript compartilhadas
    ├── context/
    │   └── ModoContext.tsx        ← Contexto global: modo operacional/visualização
    ├── lib/
    │   ├── mongodb.ts             ← Singleton de conexão para serverless
    │   ├── auth.ts                ← Criação e verificação de JWT
    │   ├── adminAuth.ts           ← Helpers de autenticação admin
    │   ├── gps.ts                 ← Cálculo de distância geográfica (Haversine)
    │   ├── formatters.ts          ← Formatação de datas, números e moeda (pt-BR)
    │   └── graficos.ts            ← Agrupamento de leituras por semana/mês/ano
    ├── models/
    │   ├── LeituraAgua.ts
    │   ├── LeituraEnergia.ts
    │   ├── Funcionario.ts
    │   ├── RegistroPonto.ts
    │   ├── RegistroAtividade.ts
    │   ├── Configuracao.ts
    │   ├── AdminUser.ts
    │   └── LogSistema.ts
    ├── services/
    │   ├── aguaService.ts
    │   ├── energiaService.ts
    │   ├── funcionarioService.ts
    │   ├── pontoService.ts
    │   ├── atividadeService.ts
    │   ├── configuracaoService.ts
    │   ├── adminUserService.ts
    │   └── logService.ts
    ├── app/
    │   ├── layout.tsx             ← Layout raiz com Navbar
    │   ├── page.tsx               ← Home com cards de navegação
    │   ├── agua/page.tsx
    │   ├── energia/page.tsx
    │   ├── ponto/page.tsx
    │   ├── atividades/page.tsx
    │   ├── admin/
    │   │   ├── page.tsx           ← Painel administrativo (protegido)
    │   │   └── login/page.tsx
    │   └── api/
    │       ├── agua/              ← GET, POST / GET, PUT, DELETE por id
    │       ├── energia/           ← GET, POST / GET, PUT, DELETE por id
    │       ├── ponto/             ← GET, POST / DELETE por id / GET presença
    │       ├── atividades/        ← GET, POST
    │       ├── funcionarios/      ← GET, POST / GET, PUT, DELETE por id
    │       ├── configuracao/      ← GET, POST (chave/valor)
    │       ├── logs/              ← GET (últimas 200 entradas)
    │       ├── admin/
    │       │   ├── login/         ← POST (gera cookie JWT)
    │       │   ├── logout/        ← POST (remove cookie)
    │       │   └── usuarios/      ← CRUD de usuários admin
    │       └── operacional/
    │           ├── status/        ← GET (verifica se modo operacional está ativo)
    │           ├── senha/         ← POST (define senha do modo operacional)
    │           └── verificar/     ← POST (valida senha e libera o modo)
    └── components/
        ├── ui/
        │   ├── Button.tsx
        │   ├── Card.tsx
        │   └── ModalSenhaModo.tsx
        ├── navigation/
        │   ├── Navbar.tsx
        │   └── NavigationProgress.tsx
        ├── agua/
        │   ├── FormMedicao.tsx
        │   ├── GraficoConsumo.tsx
        │   ├── EstatisticasConsumo.tsx
        │   ├── ConsumoCotas.tsx
        │   ├── FormCota.tsx
        │   └── BotaoExportarPDF.tsx
        ├── energia/
        │   ├── FormMedicao.tsx
        │   ├── GraficoConsumo.tsx
        │   ├── EstatisticasConsumo.tsx
        │   └── CalculadoraEnergia.tsx
        ├── ponto/
        │   ├── RelogioAtual.tsx
        │   ├── SeletorFuncionario.tsx
        │   ├── CapturaFoto.tsx
        │   ├── TabelaHorariosPonto.tsx
        │   └── PresencaAtual.tsx
        ├── atividades/
        │   ├── SeletorFuncionario.tsx
        │   └── ChecklistAtividades.tsx
        └── admin/
            ├── FormFuncionario.tsx
            ├── ListaFuncionarios.tsx
            ├── TabelaPontos.tsx
            ├── TabelaLeituras.tsx
            ├── TabelaLogs.tsx
            ├── FormAdminUser.tsx
            ├── FormNomeEmpresa.tsx
            ├── FormSenhaOperacional.tsx
            └── FormGPS.tsx
```

---

## Modelos de Dados (MongoDB)

### LeituraAgua / LeituraEnergia
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `valor` | Number | Valor acumulado do medidor |
| `data` | Date | Data da leitura |
| `tipo` | `'diaria' \| 'mensal'` | Diária (própria) ou da companhia |

### Funcionario
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `nome` | String | Nome completo |
| `cargo` | String | Cargo/função |
| `ativo` | Boolean | Se aparece nas seleções |
| `atividades` | String[] | Lista de atividades do checklist |

### RegistroPonto
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `funcionarioId` | ObjectId | Referência ao funcionário |
| `tipo` | `'entrada' \| 'saida'` | Tipo do registro |
| `foto` | String | Imagem JPEG 320×240 em base64 (~15 KB) |
| `timestamp` | Date | Data e hora do registro |

### RegistroAtividade
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `funcionarioId` | ObjectId | Referência ao funcionário |
| `data` | Date | Data do registro |
| `itens` | `{nome, concluida}[]` | Checklist de atividades |

### Configuracao
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `chave` | String | Identificador único |
| `valor` | String | Valor armazenado |

**Chaves utilizadas:**

| Chave | Descrição |
|-------|-----------|
| `cota_agua` | Cota de consumo do período (m³) |
| `nome_empresa_agua` | Nome da companhia de água (ex: SABESP) |
| `nome_empresa_energia` | Nome da companhia de energia (ex: COPEL) |
| `gps_latitude` | Latitude do ponto de referência para registro de ponto |
| `gps_longitude` | Longitude do ponto de referência |
| `gps_raio` | Raio de tolerância em metros |
| `senha_operacional` | Hash da senha do modo operacional |

### AdminUser / LogSistema
Gerenciamento de usuários administrativos e log de auditoria de ações no sistema.

---

## API REST

### Água
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/agua` | Lista todas as leituras |
| `POST` | `/api/agua` | Registra nova leitura |
| `PUT` | `/api/agua/[id]` | Atualiza leitura |
| `DELETE` | `/api/agua/[id]` | Remove leitura |

### Energia
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/energia` | Lista todas as leituras |
| `POST` | `/api/energia` | Registra nova leitura |
| `PUT` | `/api/energia/[id]` | Atualiza leitura |
| `DELETE` | `/api/energia/[id]` | Remove leitura |

### Ponto
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/ponto` | Lista registros (filtro por `funcionarioId`) |
| `POST` | `/api/ponto` | Registra entrada ou saída com foto |
| `DELETE` | `/api/ponto/[id]` | Remove registro |
| `GET` | `/api/ponto/presenca` | Retorna quem está presente no momento |

### Funcionários
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/funcionarios` | Lista todos os funcionários |
| `POST` | `/api/funcionarios` | Cria funcionário |
| `PUT` | `/api/funcionarios/[id]` | Atualiza dados |
| `DELETE` | `/api/funcionarios/[id]` | Remove funcionário |

### Atividades
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/atividades` | Lista registros (filtro por `funcionarioId` e `data`) |
| `POST` | `/api/atividades` | Salva checklist do dia |

### Configuração
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/configuracao?chave=<chave>` | Busca valor de uma configuração |
| `POST` | `/api/configuracao` | Salva ou atualiza configuração |

### Admin — Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/admin/login` | Autentica e define cookie JWT (8h) |
| `POST` | `/api/admin/logout` | Remove o cookie JWT |

### Admin — Usuários
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/admin/usuarios` | Lista usuários admin |
| `POST` | `/api/admin/usuarios` | Cria usuário admin |
| `PUT` | `/api/admin/usuarios/[id]` | Atualiza usuário |
| `DELETE` | `/api/admin/usuarios/[id]` | Remove usuário |

### Modo Operacional
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/operacional/status` | Verifica se o modo está configurado |
| `POST` | `/api/operacional/senha` | Define a senha do modo operacional |
| `POST` | `/api/operacional/verificar` | Valida a senha e libera o modo |

### Logs
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/logs` | Retorna as últimas 200 entradas de auditoria |

---

## Funcionalidades por Módulo

### Água e Energia
- Registro de leituras **diárias** (próprias) e **mensais** (da companhia)
- Leituras são **acumulativas** — o gráfico exibe o **delta** entre leituras consecutivas
- A leitura da companhia serve como **baseline** para o primeiro delta diário
- **Gráfico de consumo** com navegação por Semana / Mês / Ano e setas de período anterior/próximo
- **Linhas de referência** no gráfico marcando as datas das leituras da companhia (nome configurável no admin)
- **Estatísticas**: maior consumo, menor consumo e média diária no período entre as duas últimas leituras da companhia
- **Água**: barra de progresso de consumo vs. cota do período; linha de cota no gráfico
- **Água**: exportação das leituras em PDF (jsPDF + autotable)
- **Energia**: calculadora de custo estimado (kWh × tarifa)

### Registro de Ponto
- Relógio em tempo real
- Seleção de funcionário
- Captura de foto via webcam (JPEG 320×240, ~15 KB em base64)
- Validação opcional de GPS — bloqueia registro se o funcionário estiver fora do raio configurado
- Exibição de quem está presente no momento
- Histórico de registros do dia com horários e fotos

### Atividades
- Checklist diário por funcionário
- Atividades configuradas por funcionário no painel admin
- Progresso visual de conclusão

### Painel Administrativo (protegido por JWT)
**Abas disponíveis:**
- **Funcionários**: CRUD completo com lista de atividades do checklist
- **Registros de Horário**: filtro por funcionário e período, visualização com foto, exclusão
- **Medidas**: tabela editável de todas as leituras de água e energia
- **Usuários**: CRUD de usuários administradores
- **Logs**: auditoria das últimas 200 ações no sistema
- **Configurações**:
  - Cota de consumo de água (m³)
  - Nome da companhia de água (aparece nas marcações do gráfico)
  - Nome da companhia de energia (aparece nas marcações do gráfico)
  - Localização GPS de referência para registro de ponto
  - Senha do modo operacional

### Modo Operacional
O sistema possui dois modos de uso:

| Modo | Acesso | Permissões |
|------|--------|-----------|
| **Visualização** | Sem senha | Apenas leitura — gráficos, estatísticas e histórico |
| **Operacional** | Senha configurada no admin | Registro de leituras, ponto e atividades |

A senha do modo operacional é independente da senha administrativa.

---

## Autenticação Administrativa

- Rota protegida: `/admin/*`
- O `middleware.ts` intercepta todas as requisições para `/admin/*` (exceto `/admin/login`)
- Valida o cookie `admin-token` usando `jwtVerify` da biblioteca `jose`
- Token com validade de **8 horas**
- Múltiplos usuários admin com controle de ativo/inativo

---

## Deploy no Vercel

1. Faça push do repositório para o GitHub
2. Acesse [vercel.com](https://vercel.com) e importe o repositório
3. Configure as variáveis de ambiente no painel do Vercel:
   - `MONGODB_URI`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `JWT_SECRET`
4. Deploy automático a cada push na branch `main`

> O projeto usa exclusivamente Free Tiers (Vercel + MongoDB Atlas) — **sem custo**.

---

## Detalhes Técnicos

### Leituras acumulativas e cálculo de delta
Os medidores de água e energia registram valores crescentes. O consumo real é calculado como a diferença entre leituras consecutivas (`leitura[i] - leitura[i-1]`). Leituras com valor negativo (ex: troca de medidor) são normalizadas para `0`.

### Fuso horário (UTC)
Datas armazenadas como `UTC midnight` são exibidas corretamente em fuso BRT (UTC-3) via extração de componentes UTC (`getUTCFullYear`, `getUTCMonth`, `getUTCDate`) antes de criar uma data local.

### Semana iniciando na segunda-feira
A função `inicioSemana(offset)` calcula a segunda-feira da semana atual/offset:
- Domingo (`getDay() === 0`) → recua 6 dias
- Demais dias → recua `dia - 1` dias

### Foto no ponto
Capturada em JPEG 320×240 com qualidade 60%, resultando em ~15 KB por registro em base64 — dentro do limite de documento do MongoDB (16 MB).

### GPS
Distância calculada pela fórmula de Haversine. O registro de ponto é bloqueado se o funcionário estiver além do raio configurado (em metros).
