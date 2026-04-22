const API_PAGOS    = "/api/pagos";
const API_RENTAS   = "/api/rentas";
const API_CLIENTES = "/api/clientes";

let pagosGlobal    = [];
let rentasGlobal   = [];
let clientesGlobal = [];
let editandoId     = null;

// ================= HELPERS =================
function obtenerNombreCliente(idCliente) {
    const c = clientesGlobal.find(c => c.IdCliente == idCliente);
    return c ? c.NombreCompleto : "N/A";
}

function obtenerRenta(idRenta) {
    return rentasGlobal.find(r => r.IdRenta == idRenta);
}

// ================= OBTENER DATOS =================
async function obtenerClientes() {
    const res = await fetch(API_CLIENTES);
    clientesGlobal = await res.json();
}

async function obtenerRentas() {
    const res = await fetch(API_RENTAS);
    rentasGlobal = await res.json();
    cargarRentas();
}

async function obtenerPagos() {
    const res  = await fetch(API_PAGOS);
    const data = await res.json();

    pagosGlobal = data;
    renderPagos(pagosGlobal);
    calcularRecaudo();
}

// ================= CARGAR RENTAS EN SELECT =================
function cargarRentas() {
    const select = document.getElementById("renta");
    select.innerHTML = `<option value="">Seleccionar renta</option>`;

    rentasGlobal.forEach(r => {
        select.innerHTML += `
            <option value="${r.IdRenta}">
                Renta #${r.IdRenta} - $${Number(r.ValorTotal || 0).toLocaleString()}
            </option>
        `;
    });
}

// ================= RENDER =================
function renderPagos(lista) {
    const tabla = document.getElementById("tablaPagos");
    tabla.innerHTML = "";

    lista.forEach(p => {
        // Obtener nombre del cliente a través de la renta
        const renta   = obtenerRenta(p.IdRenta);
        const cliente = renta ? obtenerNombreCliente(renta.IdCliente) : "N/A";
        const fecha   = p.FechaPago ? new Date(p.FechaPago).toLocaleDateString() : '';

        tabla.innerHTML += `
            <tr>
                <td>${p.IdRenta}</td>
                <td>${cliente}</td>
                <td>$${Number(p.Monto).toLocaleString()}</td>
                <td>${p.MetodoPago}</td>
                <td>${p.ReferenciaTransaccion || "-"}</td>
                <td>${fecha}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editar(${p.IdPagos})">✏️</button>
                    <button class="btn btn-sm btn-danger"  onclick="eliminar(${p.IdPagos})">🗑️</button>
                </td>
            </tr>
        `;
    });
}

// ================= EDITAR =================
function editar(id) {
    const p = pagosGlobal.find(p => p.IdPagos == id);

    if (!p) { alert("Pago no encontrado"); return; }

    editandoId = id;

    document.getElementById("renta").value     = p.IdRenta || "";
    document.getElementById("monto").value     = p.Monto || "";
    document.getElementById("metodo").value    = p.MetodoPago || "";
    document.getElementById("referencia").value = p.ReferenciaTransaccion || "";

    // Mostrar cliente
    const renta = obtenerRenta(p.IdRenta);
    document.getElementById("cliente").value = renta
        ? obtenerNombreCliente(renta.IdCliente)
        : "";

    abrirModalPago();
}

// ================= ELIMINAR =================
async function eliminar(id) {
    if (!confirm("¿Eliminar pago?")) return;

    await fetch(`${API_PAGOS}/${id}`, { method: "DELETE" });
    obtenerPagos();
}

// ================= RECAUDO =================
function calcularRecaudo() {
    const total = pagosGlobal.reduce((acc, p) => acc + Number(p.Monto), 0);
    document.getElementById("totalRecaudo").innerText = total.toLocaleString();
}

// ================= MODAL =================
function abrirModalPago() {
    bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modalPago")
    ).show();
}

function cerrarModal() {
    bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modalPago")
    ).hide();

    document.getElementById("formPago").reset();
    editandoId = null;
}

// ================= INICIO =================
document.addEventListener("DOMContentLoaded", async () => {

    await obtenerClientes();
    await obtenerRentas();
    await obtenerPagos();

    // Auto-rellenar cliente y monto al seleccionar renta
    document.getElementById("renta").addEventListener("change", function () {
        const r = obtenerRenta(this.value);

        if (r) {
            document.getElementById("cliente").value = obtenerNombreCliente(r.IdCliente);
            document.getElementById("monto").value   = r.ValorTotal || 0;
        } else {
            document.getElementById("cliente").value = "";
            document.getElementById("monto").value   = "";
        }
    });

    // Buscador
    document.getElementById("buscadorPagos").addEventListener("input", function () {
        const valor = this.value.toLowerCase();

        const filtrados = pagosGlobal.filter(p => {
            const renta   = obtenerRenta(p.IdRenta);
            const cliente = renta ? obtenerNombreCliente(renta.IdCliente).toLowerCase() : "";
            const ref     = (p.ReferenciaTransaccion || "").toLowerCase();

            return cliente.includes(valor) || ref.includes(valor);
        });

        renderPagos(filtrados);
    });

    // Guardar
    document.getElementById("formPago").addEventListener("submit", async (e) => {
        e.preventDefault();

        const IdRenta              = document.getElementById("renta").value;
        const Monto                = document.getElementById("monto").value;
        const MetodoPago           = document.getElementById("metodo").value;
        const ReferenciaTransaccion = document.getElementById("referencia").value;

        if (!IdRenta) { alert("Selecciona una renta"); return; }

        const datos = { IdRenta, Monto: Number(Monto), MetodoPago, ReferenciaTransaccion };

        console.log("📤 ENVIANDO:", datos);

        try {
            let res;

            if (editandoId) {
                res = await fetch(`${API_PAGOS}/${editandoId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(datos)
                });
            } else {
                res = await fetch(API_PAGOS, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(datos)
                });
            }

            const respuesta = await res.json();
            console.log("📥 RESPUESTA:", respuesta);

            if (!res.ok) {
                console.error("❌ ERROR BACKEND:", respuesta);
                alert("❌ Error: " + respuesta.mensaje);
                return;
            }

            cerrarModal();
            obtenerPagos();

        } catch (error) {
            console.error("❌ Error al guardar:", error);
        }
    });

    // Abrir modal desde URL ?renta=X (viene de rentas.js)
    const params = new URLSearchParams(window.location.search);
    const rentaParam = params.get("renta");

    if (rentaParam) {
        document.getElementById("renta").value = rentaParam;
        document.getElementById("renta").dispatchEvent(new Event("change"));
        abrirModalPago();
    }
});

// ================= GLOBAL =================
window.editar        = editar;
window.eliminar      = eliminar;
window.abrirModalPago = abrirModalPago;