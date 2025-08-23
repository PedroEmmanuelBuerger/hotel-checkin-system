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

db.createCollection('checkins');
db.createCollection('pessoas');

db.pessoas.createIndex({ "documento": 1 }, { unique: true });
db.pessoas.createIndex({ "telefone": 1 }, { unique: true });
db.pessoas.createIndex({ "nome": 1 });

db.checkins.createIndex({ "pessoa.documento": 1 });
db.checkins.createIndex({ "pessoa.nome": 1 });

print("MongoDB inicializado com sucesso!");
print("Usuário da aplicação criado: hotel_app");
print("Coleções criadas: checkins, pessoas");
print("Índices criados para todas as coleções"); 