const admin = require('firebase-admin');

let serviceAccount;

// Tenta carregar as credenciais da variável de ambiente (para Vercel)
if (process.env.FIREBASE_CREDENTIALS_BASE64) {
  const decodedCredentials = Buffer.from(process.env.FIREBASE_CREDENTIALS_BASE64, 'base64').toString('ascii');
  serviceAccount = JSON.parse(decodedCredentials);
} 
// Senão, carrega do arquivo local (para desenvolvimento na sua máquina)
else {
  serviceAccount = require('./firebase-credentials.json');
}

// Inicializa o app somente se não houver outras instâncias
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`
  });
}

const db = admin.database();

module.exports = {
  admin,
  db
};
