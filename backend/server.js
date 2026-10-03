const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs'); // Para guardar en un archivo (simulando base de datos)

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Si mueves tu frontend a una carpeta 'public'

// Ruta para recibir los datos del formulario
app.post('/api/guardar-relacion', (req, res) => {
    const { alumno, profesor, tema } = req.body;
    
    // Aquí simulas la base de datos guardando en un archivo JSON
    const nuevoRegistro = { alumno, profesor, tema, fecha: new Date() };
    
    // Leer archivo existente o crear uno nuevo
    let datos = [];
    if (fs.existsSync('datos.json')) {
        const contenido = fs.readFileSync('datos.json', 'utf8');
        datos = JSON.parse(contenido);
    }
    datos.push(nuevoRegistro);
    fs.writeFileSync('datos.json', JSON.stringify(datos, null, 2));

    console.log('Datos recibidos:', nuevoRegistro);
    res.json({ mensaje: 'Datos guardados en el servidor exitosamente', datos: nuevoRegistro });
});

app.listen(PORT, () => {
    console.log(`Servidor Backend corriendo en http://localhost:${PORT}`);
});