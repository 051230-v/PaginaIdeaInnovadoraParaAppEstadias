// ====== FUNCIÓN PARA CAMBIAR DE PÁGINA ======
function showPage(pageId) {
    // 1. Ocultar todas las secciones
    document.querySelectorAll('.page-section').forEach(sec => {
        sec.classList.remove('active');
    });

    // 2. Mostrar la sección seleccionada
    document.getElementById(pageId).classList.add('active');

    // 3. Actualizar la barra de navegación superior
    document.querySelectorAll('nav ul li a').forEach(a => a.classList.remove('active-nav'));
    document.getElementById('nav-' + pageId).classList.add('active-nav');

    // 4. Scroll al inicio de la página
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ====== LÓGICA DEL FORMULARIO Y EXCEL ======
document.getElementById('formularioExcel').addEventListener('submit', async function(event) {
    event.preventDefault();

    const alumno = document.getElementById('alumno').value;
    const profesor = document.getElementById('profesor').value;
    const tema = document.getElementById('tema').value;

    // 1. Enviar datos al Backend
    try {
        const respuesta = await fetch('http://localhost:3000/api/guardar-relacion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ alumno, profesor, tema })
        });
        const data = await respuesta.json();
        console.log('Respuesta del servidor:', data.mensaje);
    } catch (error) {
        console.error('Error al conectar con el backend:', error);
    }

    // 2. Generar el Excel (CSV)
    let csvContent = "\ufeffNombre del Alumno,Nombre del Profesor Asesor,Tema de Tesis / Estadía\n";
    csvContent += `"${alumno}","${profesor}","${tema}"\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Relacion_Profesores_Alumnos.csv");
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert("¡Datos enviados al servidor y Excel generado!");
    this.reset();
});