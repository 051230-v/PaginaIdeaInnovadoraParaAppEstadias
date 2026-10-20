// ====== FUNCIÓN PARA CAMBIAR DE PÁGINA ======
function showPage(pageId) {
    // 1. Ocultar todas las secciones
    document.querySelectorAll(".page-section").forEach((sec) => {
        sec.classList.remove("active");
    });

    // 2. Mostrar la sección seleccionada
    document.getElementById(pageId).classList.add("active");

    // 3. Actualizar la barra de navegación superior
    document.querySelectorAll("nav ul li a").forEach((a) => a.classList.remove("active-nav"));
    document.getElementById("nav-" + pageId).classList.add("active-nav");

    // 4. Scroll al inicio de la página
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// ============================================
// LÓGICA DEL MÓDULO 1: EXPEDIENTE DIGITAL
// ============================================

// --- CONFIGURACIÓN ---
const API_URL = "https://paginaideainnovadoraparaappestadias.onrender.com/api"; 
const EXPEDIENTE_ID = 1; // ID del expediente de prueba
let todosLosDocumentos = []; // Variable para guardar los documentos y filtrarlos

// --- INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
    // Si estamos en la página del módulo, cargamos los datos
    if (document.getElementById("documentos-lista")) {
        cargarTiposDocumento();
        cargarDocumentos();
    }

    // Configurar los botones de filtro
    document.querySelectorAll(".filtro-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            // Quitar 'active' de todos y ponerlo al seleccionado
            document.querySelectorAll(".filtro-btn").forEach((b) => b.classList.remove("active"));
            e.target.classList.add("active");

            // Obtener el valor del filtro y aplicarlo
            const filtro = e.target.getAttribute("data-filtro");
            filtrarDocumentos(filtro);
        });
    });

    // Configurar el formulario de subida
    const formSubir = document.getElementById("form-subir-documento");
    if (formSubir) {
        formSubir.addEventListener("submit", subirDocumento);
    }
});

// --- FUNCIONES DE CARGA DE DATOS ---

// 1. Obtener los documentos del backend
async function cargarDocumentos() {
    try {
        const response = await fetch(`${API_URL}/expedientes/${EXPEDIENTE_ID}`);
        if (!response.ok) throw new Error("Error al cargar expediente");

        const data = await response.json();
        todosLosDocumentos = data.documentos;

        renderizarDocumentos(todosLosDocumentos);
        calcularProgreso(todosLosDocumentos);
    } catch (error) {
        console.error(error);
        document.getElementById("documentos-lista").innerHTML = `
            <div class="sin-documentos" style="color: #e74c3c;">
                ❌ Error al conectar con el servidor.<br>
                <small>Asegúrate de que el backend esté corriendo (node server.js).</small>
            </div>
        `;
    }
}

// 2. Obtener los tipos de documento para el select del modal
async function cargarTiposDocumento() {
    try {
        const response = await fetch(`${API_URL}/tipos-documento`);
        const tipos = await response.json();

        const select = document.getElementById("tipo-documento");
        tipos.forEach((tipo) => {
            const option = document.createElement("option");
            option.value = tipo.id;
            option.textContent = tipo.nombre;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar tipos de documento:", error);
    }
}

// --- RENDERIZADO EN PANTALLA ---

// 3. Dibujar las tarjetas de los documentos
function renderizarDocumentos(documentos) {
    const contenedor = document.getElementById("documentos-lista");
    contenedor.innerHTML = ""; // Limpiar

    if (documentos.length === 0) {
        contenedor.innerHTML = '<div class="sin-documentos">No hay documentos para mostrar.</div>';
        return;
    }

    documentos.forEach((doc) => {
        // Determinar la clase del badge según el estado
        let badgeClass = "badge-pendiente";
        if (doc.estado === "Aprobado") badgeClass = "badge-aprobado";
        else if (doc.estado === "En revisión") badgeClass = "badge-revision";
        else if (doc.estado === "Requiere corrección") badgeClass = "badge-correccion";

        // Formatear la fecha
        const fecha = new Date(doc.fecha_subida).toLocaleDateString("es-MX");

        // Crear la tarjeta HTML
        const card = document.createElement("div");
        card.className = "documento-card";
        card.innerHTML = `
            <div class="documento-icono">📄</div>
            <div class="documento-info">
                <div class="documento-nombre">${doc.tipo_documento} <small style="color:#94a3b8; font-weight:normal;">(v${doc.version})</small></div>
                <div class="documento-fecha">Subido el: ${fecha}</div>
            </div>
            <div class="documento-acciones">
                <span class="badge ${badgeClass}">${doc.estado}</span>
                <button class="btn-accion" title="Ver PDF" onclick="verPDF('${doc.archivo_pdf}')">👁️</button>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

// 4. Calcular y mostrar la barra de progreso
function calcularProgreso(documentos) {
    const total = documentos.length;
    const aprobados = documentos.filter((d) => d.estado === "Aprobado").length;

    const porcentaje = total === 0 ? 0 : Math.round((aprobados / total) * 100);

    // Actualizar UI
    document.getElementById("porcentaje-avance").textContent = `${porcentaje}%`;
    document.getElementById("progreso-fill").style.width = `${porcentaje}%`;
    document.getElementById("progreso-detalle").textContent = `${aprobados} de ${total} documentos aprobados`;
}

// --- FILTROS ---

// 5. Filtrar la lista de documentos según la pestaña seleccionada
function filtrarDocumentos(filtro) {
    let filtrados;

    if (filtro === "todos") {
        filtrados = todosLosDocumentos;
    } else {
        filtrados = todosLosDocumentos.filter((doc) => doc.estado === filtro);
    }

    renderizarDocumentos(filtrados);
}

// --- MODAL Y SUBIDA DE ARCHIVOS ---

// 6. Abrir y cerrar modal
function abrirModalSubir() {
    document.getElementById("modal-subir").classList.add("activo");
}

function cerrarModalSubir() {
    document.getElementById("modal-subir").classList.remove("activo");
    document.getElementById("form-subir-documento").reset();
}

// 7. Subir el archivo PDF al backend
async function subirDocumento(event) {
    event.preventDefault();

    const tipoId = document.getElementById("tipo-documento").value;
    const archivoInput = document.getElementById("archivo-pdf");

    if (!archivoInput.files[0]) return alert("Selecciona un archivo PDF");

    // Usamos FormData para enviar archivos
    const formData = new FormData();
    formData.append("archivo", archivoInput.files[0]);
    formData.append("expediente_id", EXPEDIENTE_ID);
    formData.append("tipo_documento_id", tipoId);
    formData.append("usuario", "Ana Belén");

    try {
        const response = await fetch(`${API_URL}/documentos`, {
            method: "POST",
            body: formData, // No ponemos headers, fetch lo hace solo para FormData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error al subir");
        }

        alert("¡Documento subido con éxito!");
        cerrarModalSubir();
        cargarDocumentos(); // Recargar la lista
    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
    }
}

// 8. Abrir el PDF en una nueva pestaña
function verPDF(nombreArchivo) {
    window.open(`https://paginaideainnovadoraparaappestadias.onrender.com/uploads/${nombreArchivo}`, "_blank");
}