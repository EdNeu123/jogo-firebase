const admin = require('firebase-admin');

let serviceAccount;

// Tenta carregar as credenciais da variável de ambiente primeiro (para Vercel)
if (process.env.FIREBASE_CREDENTIALS) {
  serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
} 
// Se não encontrar, carrega do arquivo (para desenvolvimento local)
else {
  serviceAccount = require('./firebase-credentials.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`
});

const db = admin.database();

module.exports = {
  admin,
  db
};
