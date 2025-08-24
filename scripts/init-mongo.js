db = db.getSiblingDB('admin');

db.createUser({
  user: 'hotel_app',
  pwd: 'hotel_app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'hotel_checkin'
    }
  ]
});

db = db.getSiblingDB('hotel_checkin');

// Limpar coleções existentes e índices antigos
db.checkins.drop();
db.pessoas.drop();

// Recriar coleções
db.createCollection('checkins');
db.createCollection('pessoas');

// Criar índices para pessoas
db.pessoas.createIndex({ "documento": 1 }, { unique: true });
db.pessoas.createIndex({ "telefone": 1 }, { unique: true });
db.pessoas.createIndex({ "nome": 1 });

// Criar índices para checkins
db.checkins.createIndex({ "pessoa.documento": 1 });
db.checkins.createIndex({ "pessoa.nome": 1 });
db.checkins.createIndex({ "dataEntrada": 1 });
db.checkins.createIndex({ "dataSaida": 1 });
db.checkins.createIndex({ "adicionalVeiculo": 1 });
db.checkins.createIndex({ "dataEntrada": 1, "dataSaida": 1 });
db.checkins.createIndex({ "pessoa.documento": 1, "dataEntrada": 1, "dataSaida": 1 });

print("MongoDB inicializado com sucesso!");
print("Usuário da aplicação criado: hotel_app");
print("Coleções criadas: checkins, pessoas");
print("Índices criados para todas as coleções");
print("Índices de check-in otimizados para consultas por período e disponibilidade"); 