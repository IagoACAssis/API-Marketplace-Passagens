# API Marketplace de Passagens

API para o Marketplace de Passagens de ônibus, barcos e balsas.

## Novidades: Rotas Dinâmicas

O sistema agora implementa um mecanismo de **Rotas Dinâmicas** que permite:

1. Cadastrar **Templates de Rota** ao invés de rotas físicas para cada dia
2. Consultar rotas para datas futuras sem necessidade de cadastro prévio
3. Criar rotas físicas apenas quando há reserva efetiva
4. Otimizar o banco de dados e evitar registros desnecessários

### Como funcionam as Rotas Dinâmicas:

- As empresas cadastram templates com dias da semana, horários e preços
- O sistema gera rotas virtuais com base nos templates durante as consultas
- Quando um cliente faz uma reserva, a rota virtual é materializada em uma rota física no banco
- Consultas subsequentes usam a rota física já criada

## Funcionalidades

- Autenticação e gerenciamento de usuários
- Cadastro e gerenciamento de empresas de transporte
- Pesquisa e reserva de passagens
- Gerenciamento de rotas e templates de rota
- Pagamento e confirmação de reservas
- Histórico de compras e viagens

## Tecnologias Utilizadas

- Node.js
- TypeScript
- Fastify
- Prisma ORM
- MySQL
- JWT para autenticação
- Docker (opcional)

## Instalação e Configuração

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Configure as variáveis de ambiente (crie um arquivo `.env` baseado no `.env.example`)
4. Configure o banco de dados:
   ```
   npx prisma migrate dev
   ```
5. Inicie a aplicação:
   ```
   npm run dev
   ```

## Documentação da API

### Endpoints de Templates de Rota

- `GET /route-templates` - Lista todos os templates de rota
- `GET /route-templates/:id` - Obtém um template específico
- `GET /route-templates/company` - Lista templates da empresa autenticada
- `POST /route-templates` - Cria um novo template
- `PUT /route-templates/:id` - Atualiza um template existente
- `DELETE /route-templates/:id` - Remove um template

### Endpoints de Rotas

- `GET /routes/search` - Pesquisa rotas (físicas + virtuais)
- `GET /routes/:id` - Obtém detalhes de uma rota específica

### Endpoints de Tickets

- `POST /tickets/reserve` - Reserva um ou mais tickets (materializa rotas virtuais quando necessário)
- `POST /tickets/pay-multiple` - Realiza o pagamento de múltiplos tickets

## Contribuição

Contribuições são bem-vindas! Por favor, siga as boas práticas de código e documente suas alterações.

## Licença

Este projeto está licenciado sob [inserir licença]. 