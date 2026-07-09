require('dotenv').config();

const app = require('./src/app');
const { createServer } = require('http');
const { initSocket } = require('./src/socket');
const { initDatabase } = require('./src/config/database');

const PORT = process.env.PORT || 3001;

async function main() {
  try {
    // Inicializar base de datos
    const db = initDatabase();
    console.log('✓ Base de datos inicializada');

    // Crear servidor HTTP
    const server = createServer(app);

    // Inicializar Socket.IO
    const io = initSocket(server);
    app.set('io', io);
    console.log('✓ Socket.IO inicializado');

    // Iniciar servidor
    server.listen(PORT, () => {
      console.log(`\n═══════════════════════════════════════`);
      console.log(`  ${process.env.APP_NAME || 'Pacha Experiences'}`);
      console.log(`  Servidor: http://localhost:${PORT}`);
      console.log(`  API:      http://localhost:${PORT}/api`);
      console.log(`  Entorno:  ${process.env.NODE_ENV}`);
      console.log(`═══════════════════════════════════════\n`);
    });
  } catch (error) {
    console.error('Error al iniciar servidor:', error);
    process.exit(1);
  }
}

main();
