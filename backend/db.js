// ============================================
// CONEXION A MYSQL - MODULO 1
// ============================================
const mysql = require('mysql2');
require('dotenv').config();

// Creamos un "pool" de conexiones (mas eficiente que una sola conexion)
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'estadias_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Convertimos el pool a promesas para poder usar async/await
const promisePool = pool.promise();

// Probamos la conexion al iniciar
(async () => {
    try {
        const [rows] = await promisePool.query('SELECT 1 + 1 AS resultado');
        console.log('Conexion a MySQL exitosa. Base de datos: ' + process.env.DB_NAME);
    } catch (error) {
        console.error('Error al conectar con MySQL:', error.message);
        console.error('Verifica que XAMPP este encendido y que las credenciales en .env sean correctas.');
    }
})();

module.exports = promisePool;