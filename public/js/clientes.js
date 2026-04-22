// 🔥 URL correcta de la API
const API = "http://localhost:3000/api/clientes";

let editandoId = null;
let clientesGlobal = [];

// ================= OBTENER CLIENTES =================
async function obtenerClientes() {
    try {
        const res = await fetch(API);

        if (!res.ok) throw new Error("Error al obtener clientes");

        const data = await res.json();

        clientesGlobal = data;
        renderClientes(clientesGlobal);

    } catch (error) {
        console.error("❌ Error al obtener clientes:", error);
    }
}

// ================= RENDERIZAR =================
function renderClientes(lista) {
    const tabla = document.getElementById("tablaClientes");
    tabla.innerHTML = "";

    lista.forEach(c => {
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
                    <button class="btn btn-sm btn-primary" onclick="editar(${c.IdCliente})">✏️</button>
                    <button class="btn btn-sm btn-danger" onclick="eliminar(${c.IdCliente})">🗑️</button>
                </td>
            </tr>
        `;
    });
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
        console.error("❌ Error al editar:", error);
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

    console.log("📤 ENVIANDO:", datos);

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

        console.log("📥 RESPUESTA:", respuesta);

        if (!res.ok) {
            console.error("❌ ERROR BACKEND:", respuesta);
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
        console.error("❌ Error al guardar:", error);
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
        console.error("❌ Error al eliminar:", error);
    }
}

// ================= BUSCADOR =================
function activarBuscador() {
    const buscador = document.getElementById("buscador");

    buscador.addEventListener("input", function () {
        const valor = this.value.toLowerCase();

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
window.editar = editar;
window.eliminar = eliminar;
window.abrirModal = abrirModal;