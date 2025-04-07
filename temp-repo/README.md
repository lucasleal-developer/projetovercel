# Sistema de Gerenciamento de Escalas

Um sistema de gerenciamento de escalas de horários com arquitetura moderna e flexível, projetado para otimizar a criação e visualização de atividades.

## Tecnologias

- React com Vite para frontend
- Node.js com Express para backend
- Tailwind CSS para estilização responsiva
- PostgreSQL (Neon) para banco de dados
- Drizzle ORM para gerenciamento de banco de dados

## Configuração do Ambiente

### Pré-requisitos

- Node.js versão 18 ou superior
- PostgreSQL (ou Neon Database como serviço)
- NPM ou Yarn

### Instalação

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd <nome-da-pasta>
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:
```
DATABASE_URL=postgres://seu-usuario:sua-senha@seu-host:5432/seu-banco
PGUSER=seu-usuario
PGPASSWORD=sua-senha
PGDATABASE=seu-banco
PGHOST=seu-host
PGPORT=5432
NODE_ENV=development
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Implantação na Vercel

1. Faça o push do seu código para o GitHub.

2. Na Vercel, crie um novo projeto e importe o repositório do GitHub.

3. Configure as variáveis de ambiente na interface da Vercel:
   - DATABASE_URL
   - PGUSER
   - PGPASSWORD
   - PGDATABASE
   - PGHOST
   - PGPORT

4. A Vercel usará automaticamente a configuração em `vercel.json` para o deployment.

## Estrutura do Banco de Dados

O sistema utiliza cinco tabelas principais:
- Users: Armazena os usuários do sistema
- ActivityTypes: Tipos de atividades (aula, reunião, etc.)
- Professionals: Professores e profissionais
- TimeSlots: Slots de tempo disponíveis
- Schedules: Escalas e agendamentos

## Funcionalidades

- Visualização de escalas por dia da semana
- Visualização de escalas semanais por professor
- Gerenciamento de tipos de atividades com cores personalizadas
- Gerenciamento de slots de tempo com intervalos de 30 minutos
- Compartilhamento de visualizações via tokens seguros

## Licença

Este projeto está licenciado sob a licença MIT.