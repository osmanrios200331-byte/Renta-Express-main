const API = "/api/rentas";
const API_CLIENTES = "/api/clientes";
const API_VEHICULOS = "/api/vehiculos";

let rentasGlobal = [];
let clientesGlobal = [];
let vehiculosGlobal = [];
let editandoId = null;

// ================= FECHA HOY =================
function obtenerFechaHoy() {
    return new Date().toISOString().split("T")[0];
}

// ================= OBTENER RENTAS =================
async function obtenerRentas() {
    try {
        const res = await fetch(API);
        const data = await res.json();

        rentasGlobal = data;
        renderRentas(rentasGlobal);
        actualizarContador();

    } catch (error) {
        console.error("Error:", error);
    }
}

// ================= RENDER =================
function renderRentas(lista) {
    const tabla = document.getElementById("tablaRentas");
    tabla.innerHTML = "";

    lista.forEach(r => {
        const cliente = obtenerNombreCliente(r.IdCliente);
        const vehiculo = obtenerNombreVehiculo(r.IdVehiculos);
        const placa = obtenerPlacaVehiculo(r.IdVehiculos);

        const fechaInicio = r.FechaInicio ? new Date(r.FechaInicio).toLocaleDateString() : '';
        const fechaFin    = r.FechaFin    ? new Date(r.FechaFin).toLocaleDateString()    : '';

        tabla.innerHTML += `
            <tr>
                <td>${r.IdRenta}</td>
                <td>${cliente}</td>
                <td>${vehiculo}</td>
                <td>${placa}</td>
                <td>${fechaInicio}</td>
                <td>${fechaFin}</td>
                <td>$${Number(r.ValorTotal || 0).toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editar(${r.IdRenta})">✏️</button>
                    <button class="btn btn-sm btn-danger" onclick="eliminar(${r.IdRenta})">🗑️</button>
                </td>
            </tr>
        `;
    });
}

// ================= HELPERS =================
function obtenerNombreCliente(id) {
    const c = clientesGlobal.find(c => c.IdCliente == id);
    return c ? c.NombreCompleto : "N/A";
}

function obtenerNombreVehiculo(id) {
    const v = vehiculosGlobal.find(v => v.IdVehiculos == id);
    return v ? `${v.Marca} ${v.Modelo}` : "N/A";
}

function obtenerPlacaVehiculo(id) {
    const v = vehiculosGlobal.find(v => v.IdVehiculos == id);
    return v ? v.Placa : "N/A";
}

// ================= CARGAR CLIENTES =================
async function cargarClientes() {
    const res = await fetch(API_CLIENTES);
    const data = await res.json();

    clientesGlobal = data;

    const select = document.getElementById("cliente");
    select.innerHTML = '<option value="">Seleccionar cliente</option>';

    data.forEach(c => {
        select.innerHTML += `<option value="${c.IdCliente}">${c.NombreCompleto}</option>`;
    });
}

// ================= CARGAR VEHICULOS =================
async function cargarVehiculos(seleccionadoId = null) {
    const res = await fetch(API_VEHICULOS);
    const data = await res.json();

    vehiculosGlobal = data;

    const select = document.getElementById("vehiculo");
    select.innerHTML = '<option value="">Seleccionar vehículo</option>';

    data
        .filter(v => v.Estado === "Disponible" || v.IdVehiculos == seleccionadoId)
        .forEach(v => {
            select.innerHTML += `
                <option value="${v.IdVehiculos}" data-tarifa="${v.TarifaDiaria}">
                    ${v.Marca} ${v.Modelo} - ${v.Placa}
                </option>
            `;
        });
}

// ================= EDITAR =================
async function editar(id) {
    const r = rentasGlobal.find(r => r.IdRenta == id);

    if (!r) {
        alert("Renta no encontrada");
        return;
    }

    editandoId = id;

    await cargarVehiculos(r.IdVehiculos);

    document.getElementById("cliente").value     = r.IdCliente || "";
    document.getElementById("vehiculo").value    = r.IdVehiculos || "";
    document.getElementById("fechaInicio").value = r.FechaInicio ? r.FechaInicio.split("T")[0] : "";
    document.getElementById("fechaFin").value    = r.FechaFin ? r.FechaFin.split("T")[0] : "";
    document.getElementById("tarifa").value      = r.TarifaAplicada || "";
    document.getElementById("total").value       = r.ValorTotal || "";

    new bootstrap.Modal(document.getElementById("modalNuevaRenta")).show();
}

// ================= ELIMINAR =================
async function eliminar(id) {
    if (!confirm("¿Eliminar renta?")) return;

    await fetch(`${API}/${id}`, { method: "DELETE" });

    obtenerRentas();
    cargarVehiculos();
}

// ================= LIMPIAR =================
function limpiarFormulario() {
    document.getElementById("cliente").value     = "";
    document.getElementById("vehiculo").value    = "";
    document.getElementById("fechaInicio").value = obtenerFechaHoy();
    document.getElementById("fechaFin").value    = "";
    document.getElementById("tarifa").value      = "";
    document.getElementById("total").value       = "";

    editandoId = null;
}

// ================= CALCULAR TOTAL =================
function calcularTotal() {
    const inicio   = new Date(document.getElementById("fechaInicio").value);
    const fin      = new Date(document.getElementById("fechaFin").value);
    const tarifa   = parseFloat(document.getElementById("tarifa").value) || 0;

    if (!fin || fin <= inicio) {
        document.getElementById("total").value = 0;
        return;
    }

    const dias = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
    document.getElementById("total").value = dias * tarifa;
}

// ================= BUSCADOR =================
function activarBuscador() {
    document.getElementById("buscadorRentas").addEventListener("input", function () {
        const valor = this.value.toLowerCase().trim();

        if (!valor) {
            renderRentas(rentasGlobal);
            return;
        }

        const filtradas = rentasGlobal.filter(r => {
            const cliente  = obtenerNombreCliente(r.IdCliente).toLowerCase();
            const vehiculo = obtenerNombreVehiculo(r.IdVehiculos).toLowerCase();
            const placa    = obtenerPlacaVehiculo(r.IdVehiculos).toLowerCase();

            return (
                cliente.includes(valor)  ||
                vehiculo.includes(valor) ||
                placa.includes(valor)    ||
                String(r.IdRenta).includes(valor)
            );
        });

        renderRentas(filtradas);
    });
}

// ================= CONTADOR =================
function actualizarContador() {
    document.getElementById("totalRentas").innerText = rentasGlobal.length;
    document.getElementById("infoTabla").innerText   = `${rentasGlobal.length} registros`;
}

// ================= INICIO =================
document.addEventListener("DOMContentLoaded", async () => {

    await cargarClientes();
    await cargarVehiculos();
    await obtenerRentas();
    activarBuscador();

    document.getElementById("fechaInicio").value = obtenerFechaHoy();

    // Auto-rellenar tarifa al seleccionar vehículo
    document.getElementById("vehiculo").addEventListener("change", function () {
        const selected   = this.options[this.selectedIndex];
        const tarifaData = selected.getAttribute("data-tarifa");

        if (tarifaData) {
            document.getElementById("tarifa").value = tarifaData;
            calcularTotal();
        }
    });

    document.getElementById("fechaInicio").addEventListener("change", calcularTotal);
    document.getElementById("fechaFin").addEventListener("change", calcularTotal);
    document.getElementById("tarifa").addEventListener("input", calcularTotal);

    // ================= GUARDAR =================
    document.getElementById("btnGuardarRenta").addEventListener("click", async () => {

        const IdCliente      = document.getElementById("cliente").value;
        const IdVehiculos    = document.getElementById("vehiculo").value;
        const FechaInicio    = document.getElementById("fechaInicio").value;
        const FechaFin       = document.getElementById("fechaFin").value;
        const TarifaAplicada = document.getElementById("tarifa").value;

        if (!IdCliente || !IdVehiculos || !FechaInicio || !FechaFin) {
            alert("Completa todos los campos");
            return;
        }

        const dias       = Math.ceil((new Date(FechaFin) - new Date(FechaInicio)) / (1000 * 60 * 60 * 24));
        const ValorTotal = dias * parseFloat(TarifaAplicada);

        const datos = { IdCliente, IdVehiculos, FechaInicio, FechaFin, TarifaAplicada, ValorTotal };

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
                alert("❌ Error: " + respuesta.mensaje);
                return;
            }

            bootstrap.Modal.getInstance(
                document.getElementById("modalNuevaRenta")
            ).hide();

            limpiarFormulario();
            obtenerRentas();
            cargarVehiculos();

        } catch (error) {
            console.error("❌ Error al guardar:", error);
        }
    });

    document.getElementById("modalNuevaRenta")
        .addEventListener("hidden.bs.modal", () => {
            limpiarFormulario();
            cargarVehiculos();
        });
});

// ================= GLOBAL =================
window.editar   = editar;
window.eliminar = eliminar;