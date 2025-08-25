# Hotel Check-in System

Hotel Check-in System é um projeto desenvolvido para automatizar e gerenciar o processo de check-in em hotéis, oferecendo uma solução completa para controle de hospedagem, cálculo automático de tarifas e gestão de hóspedes.

## Funcionalidades

O projeto inclui as seguintes funcionalidades:

### Sistema de Check-in
- **Criação de check-ins** com data/hora de entrada e saída
- **Cálculo automático de tarifas** baseado em regras de negócio específicas
- **Gestão de veículos** com taxas adicionais para garagem
- **Validação de datas** e períodos de estadia
- **Controle de conflitos** para evitar reservas duplicadas

### Regras de Negócio Implementadas
- **Tarifas diferenciadas**: R$ 120,00 (segunda a sexta) e R$ 150,00 (fins de semana)
- **Taxas de garagem**: R$ 15,00 (dias úteis) e R$ 20,00 (fins de semana)
- **Regra das 16:30**: Cobrança de diária extra se saída após 16:30
- **Cálculo por noites**: Conta apenas as noites de hospedagem (não dias completos)

### Sistema de Pessoas
- **Cadastro completo** de hóspedes (nome, documento, telefone)
- **Edição de dados** com validação de campos únicos
- **Exclusão segura** de registros

### Consultas e Relatórios
- **Filtros inteligentes**: Pessoas presentes, saídas, reservas futuras
- **Paginação** com 5 registros por página
- **Busca em tempo real** por documento ou nome
- **Cálculo automático** de valores gastos

## Tecnologias

O projeto foi desenvolvido usando as seguintes tecnologias:

### Backend
- **Java 17**: Linguagem principal do projeto
- **Spring Boot 3.x**: Framework para desenvolvimento de APIs
- **Spring Data MongoDB**: Integração com banco de dados
- **MongoDB 6.0**: Banco de dados NoSQL para persistência
- **Maven**: Gerenciador de dependências e build

### Frontend
- **Angular 17**: Framework para desenvolvimento de interfaces
- **TypeScript**: Linguagem de programação tipada
- **SCSS**: Pré-processador CSS para estilos avançados
- **HTTP Client**: Comunicação com APIs REST

### Infraestrutura
- **Docker**: Containerização da aplicação
- **Docker Compose**: Orquestração de múltiplos containers
- **Nginx**: Servidor web para o frontend
- **Mongo Express**: Interface web para MongoDB

## Pré-requisitos

Para executar o projeto 100% funcional, você precisa ter instalado:

### Software Obrigatório
- **Docker Desktop** (versão 4.0 ou superior)
  - [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)
  - Certifique-se de que o Docker está rodando

### Portas Disponíveis
- **Porta 3000**: Frontend Angular
- **Porta 8080**: Backend Spring Boot
- **Porta 27017**: MongoDB
- **Porta 8081**: Mongo Express (interface web)

## Como Executar o Projeto

### 1. Clone do Repositório
```bash
git clone https://github.com/PedroEmmanuelBuerger/hotel-checkin-system.git
```

### 2. Inicialização com Docker Compose
```bash
# Iniciar todos os serviços
docker-compose up -d

# Verificar status dos containers
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f
```

### 3. Acesso às Aplicações
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **MongoDB**: mongodb://localhost:27017
- **Mongo Express**: http://localhost:8081
  - **Usuário**: admin
  - **Senha**: password123

### 4. Verificação de Saúde
```bash
# Verificar se todos os serviços estão rodando
docker-compose ps

# Testar API do backend
curl http://localhost:8080/api/checkins/health

# Verificar logs de cada serviço
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
```

### 5. Acesso ao MongoDB Express
Para visualizar e gerenciar o banco de dados através da interface web:

1. **Acesse**: http://localhost:8081
2. **Login**: admin
3. **Senha**: password123
4. **Banco de dados**: hotel_checkin

**Nota**: O MongoDB Express permite visualizar coleções, documentos e executar consultas diretamente no navegador.

## Rotas para Teste

### Backend API (Porta 8080)

#### Check-ins
- **GET** `/api/checkins` - Listar todos os check-ins
- **POST** `/api/checkins` - Criar novo check-in
- **GET** `/api/checkins/presentes` - Check-ins ativos
- **GET** `/api/checkins/saidos` - Check-ins finalizados
- **GET** `/api/checkins/reserva-futura` - Reservas futuras
- **GET** `/api/checkins/health` - Status da API

#### Pessoas
- **GET** `/api/pessoas` - Listar todas as pessoas
- **POST** `/api/pessoas` - Cadastrar nova pessoa
- **PUT** `/api/pessoas/{id}` - Atualizar pessoa
- **DELETE** `/api/pessoas/documento/{documento}` - Excluir pessoa

### Frontend (Porta 3000)

#### Páginas Principais
- **Página inicial**: http://localhost:3000
- **Gerenciar pessoas**: Botão "Gerenciar Pessoas" no topo
- **Sistema de check-in**: Formulário principal

## Casos de Uso para Teste

### 1. Cadastro de Pessoa
1. Acesse http://localhost:3000
2. Clique em "Gerenciar Pessoas"
3. Preencha: Nome, Documento, Telefone
4. Clique em "Salvar"

### 2. Criação de Check-in
1. No formulário principal, preencha:
   - Data/hora de entrada
   - Data/hora de saída
   - Selecione uma pessoa
   - Marque se possui veículo
2. Clique em "Salvar"
3. Verifique o valor calculado automaticamente

### 3. Teste das Regras de Negócio
- **Check-in fim de semana**: Deve cobrar R$ 150,00
- **Check-in dia útil**: Deve cobrar R$ 120,00
- **Com veículo**: Deve adicionar taxa de garagem
- **Saída após 16:30**: Deve cobrar diária extra

### 4. Filtros e Consultas
- **"Pessoas ainda presentes"**: Mostra hóspedes ativos
- **"Pessoas que já deixaram"**: Mostra check-ins finalizados
- **"Pessoas com reserva futura"**: Mostra reservas futuras
- **Busca por documento**: Filtra por CPF/identidade

## Comandos Úteis

### Desenvolvimento
```bash
# Rebuild de um serviço específico
docker-compose build backend
docker-compose build frontend

# Restart de um serviço
docker-compose restart backend
docker-compose restart frontend

# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Manutenção
```bash
# Parar todos os serviços
docker-compose down

# Parar e remover volumes (cuidado: apaga dados)
docker-compose down -v

# Limpar containers não utilizados
docker system prune

# Ver uso de recursos
docker stats
```
## Estrutura do Projeto

```
hotel-checkin-system/
├── backend/                 # Aplicação Spring Boot
│   ├── src/main/java/      # Código fonte Java
│   ├── src/main/resources/ # Configurações
│   └── Dockerfile          # Container do backend
├── frontend/               # Aplicação Angular
│   ├── src/app/           # Componentes Angular
│   ├── src/assets/        # Recursos estáticos
│   └── Dockerfile         # Container do frontend
├── docker-compose.yml      # Orquestração dos serviços
└── README.md              # Este arquivo
```

## Conclusão

Hotel Check-in System é uma solução completa e profissional para gestão de hospedagem em hotéis. O projeto combina conceitos importantes de desenvolvimento full-stack, integração com bancos de dados, containerização e implementação de regras de negócio complexas.

A arquitetura modular permite fácil manutenção e expansão, enquanto a interface intuitiva garante uma excelente experiência do usuário. O sistema está pronto para uso em produção e pode ser facilmente adaptado para diferentes necessidades de negócio.
