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

db.createCollection('guests');
db.createCollection('rooms');
db.createCollection('bookings');
db.createCollection('checkins');
db.createCollection('pessoas');

db.guests.createIndex({ "email": 1 }, { unique: true });
db.guests.createIndex({ "documentNumber": 1 }, { unique: true });
db.rooms.createIndex({ "roomNumber": 1 }, { unique: true });
db.bookings.createIndex({ "checkInDate": 1 });
db.bookings.createIndex({ "checkOutDate": 1 });
db.checkins.createIndex({ "bookingId": 1 }, { unique: true });

db.pessoas.createIndex({ "documento": 1 }, { unique: true });
db.pessoas.createIndex({ "telefone": 1 }, { unique: true });
db.pessoas.createIndex({ "nome": 1 });
db.pessoas.createIndex({ "dataCriacao": 1 });

print("MongoDB inicializado com sucesso!");
print("Usuário da aplicação criado: hotel_app");
print("Coleções criadas: guests, rooms, bookings, checkins, pessoas");
print("Índices criados para todas as coleções"); 