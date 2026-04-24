const API = "/api/clientes";

let editandoId = null;
let clientesGlobal = [];

// ================= PAGINACIÓN =================
const REGISTROS_POR_PAGINA = 10;
let paginaActual = 1;

// ================= OBTENER CLIENTES =================
async function obtenerClientes() {
    try {
        const res = await fetch(API);

        if (!res.ok) throw new Error("Error al obtener clientes");

        const data = await res.json();

        clientesGlobal = data;
        paginaActual = 1;
        renderClientes(clientesGlobal);

    } catch (error) {
        console.error("Error al obtener clientes:", error);
    }
}

// ================= RENDERIZAR =================
function renderClientes(lista) {
    const tabla = document.getElementById("tablaClientes");
    tabla.innerHTML = "";

    const totalPaginas = Math.ceil(lista.length / REGISTROS_POR_PAGINA);
    const inicio = (paginaActual - 1) * REGISTROS_POR_PAGINA;
    const fin = inicio + REGISTROS_POR_PAGINA;
    const paginados = lista.slice(inicio, fin);

    paginados.forEach(c => {
        tabla.innerHTML += `
            <tr>
                <td>${c.TipoDocumento || ''}</td>
                <td>${c.Documento || ''}</td>
                <td>${c.NombreCompleto || ''}</td>
                <td>${c.Telefono || ''}</td>
                <td>${c.Email || ''}</td>
                <td>${c.Licencia || ''}</td>
                <td>${c.FechaRegistro ? new Date(c.FechaRegistro).toLocaleDateString() : ''}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editar(${c.IdCliente})"><i class="bi bi-pencil-square"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="eliminar(${c.IdCliente})"><i class="bi bi-trash"></i></button>
                </td>
            </tr>
        `;
    });

    renderPaginacion(totalPaginas);
}

// ================= PAGINACIÓN RENDER =================
function renderPaginacion(totalPaginas) {
    const ul = document.querySelector(".pagination");
    if (!ul) return;

    ul.innerHTML = `
        <li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual - 1}, event)">‹</a>
        </li>
    `;

    for (let i = 1; i <= totalPaginas; i++) {
        ul.innerHTML += `
            <li class="page-item ${i === paginaActual ? 'active' : ''}">
                <a class="page-link" href="#" onclick="cambiarPagina(${i}, event)">${i}</a>
            </li>
        `;
    }

    ul.innerHTML += `
        <li class="page-item ${paginaActual === totalPaginas || totalPaginas === 0 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual + 1}, event)">›</a>
        </li>
    `;
}

function cambiarPagina(pagina, event) {
    event.preventDefault();
    const totalPaginas = Math.ceil(clientesGlobal.length / REGISTROS_POR_PAGINA);
    if (pagina < 1 || pagina > totalPaginas) return;
    paginaActual = pagina;
    renderClientes(clientesGlobal);
}

// ================= ABRIR MODAL =================
function abrirModal() {
    editandoId = null;

    const form = document.getElementById("formCliente");
    form.reset();

    new bootstrap.Modal(document.getElementById("modalCliente")).show();
}

// ================= EDITAR =================
async function editar(id) {
    try {
        const res = await fetch(`${API}/${id}`);
        if (!res.ok) throw new Error("Cliente no encontrado");

        const c = await res.json();

        editandoId = id;

        const form = document.getElementById("formCliente");

        form.TipoDocumento.value = c.TipoDocumento || '';
        form.Documento.value = c.Documento || '';
        form.NombreCompleto.value = c.NombreCompleto || '';
        form.Telefono.value = c.Telefono || '';
        form.Email.value = c.Email || '';
        form.Licencia.value = c.Licencia || '';

        new bootstrap.Modal(document.getElementById("modalCliente")).show();

    } catch (error) {
        console.error("Error al editar:", error);
    }
}

// ================= GUARDAR =================
document.addEventListener("submit", async function (e) {
    if (e.target.id !== "formCliente") return;

    e.preventDefault();

    const form = new FormData(e.target);

    const datos = {
        TipoDocumento: form.get("TipoDocumento") || "",
        Documento: form.get("Documento") || "",
        NombreCompleto: form.get("NombreCompleto") || "",
        Telefono: form.get("Telefono") || "",
        Email: form.get("Email") || "",
        Licencia: form.get("Licencia") || ""
    };

    try {
        let res;

        if (editandoId) {
            res = await fetch(`${API}/${editandoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });
        } else {
            res = await fetch(API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });
        }

        const respuesta = await res.json();

        if (!res.ok) {
            alert("Error al guardar cliente");
            return;
        }

        bootstrap.Modal.getInstance(
            document.getElementById("modalCliente")
        ).hide();

        e.target.reset();
        editandoId = null;

        obtenerClientes();

    } catch (error) {
        console.error("Error al guardar:", error);
    }
});

// ================= ELIMINAR =================
async function eliminar(id) {
    if (!confirm("¿Eliminar cliente?")) return;

    try {
        const res = await fetch(`${API}/${id}`, { method: "DELETE" });

        if (!res.ok) throw new Error("Error al eliminar");

        obtenerClientes();

    } catch (error) {
        console.error("Error al eliminar:", error);
    }
}

// ================= BUSCADOR =================
function activarBuscador() {
    const buscador = document.getElementById("buscador");

    buscador.addEventListener("input", function () {
        const valor = this.value.toLowerCase();

        paginaActual = 1;

        const filtrados = clientesGlobal.filter(c =>
            (c.NombreCompleto || '').toLowerCase().includes(valor) ||
            (c.Documento || '').toLowerCase().includes(valor)
        );

        renderClientes(filtrados);
    });
}

// ================= INICIO =================
document.addEventListener("DOMContentLoaded", () => {
    obtenerClientes();
    activarBuscador();
});

// ================= GLOBAL =================
window.editar        = editar;
window.eliminar      = eliminar;
window.abrirModal    = abrirModal;
window.cambiarPagina = cambiarPagina;