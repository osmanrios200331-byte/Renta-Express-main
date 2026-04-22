const API = "/api/vehiculos";

let editandoId = null;
let vehiculosGlobal = [];

// ================= OBTENER =================
async function obtenerVehiculos() {
    try {
        const res = await fetch(API);
        const data = await res.json();

        vehiculosGlobal = data;
        renderVehiculos(vehiculosGlobal);
        actualizarContadores();

    } catch (error) {
        console.error("❌ Error obtener vehículos:", error);
    }
}

// ================= RENDER =================
function renderVehiculos(lista) {
    const tabla = document.getElementById("tablaVehiculos");
    tabla.innerHTML = "";

    lista.forEach(v => {
        tabla.innerHTML += `
            <tr>
                <td>${v.Placa || ''}</td>
                <td>${v.Marca || ''}</td>
                <td>${v.Modelo || ''}</td>
                <td>${v.Anio || ''}</td>
                <td>${v.Color || ''}</td>
                <td>${v.TipoVehiculo || ''}</td>
                <td>${v.Transmision || ''}</td>
                <td>${v.TarifaDiaria || ''}</td>
                <td>${v.Estado || ''}</td>
                <td>
                    <button class="btn btn-sm btn-primary"
                        onclick="editar(${v.IdVehiculos})">✏️</button>
                    <button class="btn btn-sm btn-danger"
                        onclick="eliminar(${v.IdVehiculos})">🗑️</button>
                </td>
            </tr>
        `;
    });
}

// ================= EDITAR =================
async function editar(id) {
    try {
        const res = await fetch(`${API}/${id}`);
        const v = await res.json();

        editandoId = id;

        const form = document.getElementById("formVehiculo");

        form.placa.value        = v.Placa || '';
        form.marca.value        = v.Marca || '';
        form.modelo.value       = v.Modelo || '';
        form.anio.value         = v.Anio || '';
        form.color.value        = v.Color || '';
        form.tipoVehiculo.value = v.TipoVehiculo || '';
        form.transmision.value  = v.Transmision || '';
        form.combustible.value  = v.Combustible || '';
        form.tarifaDiaria.value = v.TarifaDiaria || '';
        form.estado.value       = v.Estado || '';
        // FechaRegistro es automática, no se edita

        new bootstrap.Modal(
            document.getElementById("modalNuevoVehiculo")
        ).show();

    } catch (error) {
        console.error("❌ Error editar:", error);
    }
}

// ================= GUARDAR =================
document.getElementById("formVehiculo")
.addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = new FormData(e.target);

    // Nombres exactos igual que las columnas de la BD
    const datos = {
        Placa:        form.get("placa"),
        Marca:        form.get("marca"),
        Modelo:       form.get("modelo"),
        Anio:         form.get("anio"),
        Color:        form.get("color"),
        TipoVehiculo: form.get("tipoVehiculo"),
        Transmision:  form.get("transmision"),
        Combustible:  form.get("combustible"),
        TarifaDiaria: form.get("tarifaDiaria"),
        Estado:       form.get("estado")
        // FechaRegistro la pone MySQL automáticamente
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
            alert("❌ Error: " + respuesta.mensaje);
            return;
        }

        bootstrap.Modal.getInstance(
            document.getElementById("modalNuevoVehiculo")
        ).hide();

        e.target.reset();
        editandoId = null;
        obtenerVehiculos();

    } catch (error) {
        console.error("❌ Error guardar:", error);
    }
});

// ================= ELIMINAR =================
async function eliminar(id) {
    if (!confirm("¿Eliminar vehículo?")) return;

    try {
        await fetch(`${API}/${id}`, { method: "DELETE" });
        obtenerVehiculos();
    } catch (error) {
        console.error("❌ Error eliminar:", error);
    }
}

// ================= BUSCADOR =================
document.getElementById("buscadorVehiculos")
.addEventListener("input", function () {
    const valor = this.value.toLowerCase();

    const filtrados = vehiculosGlobal.filter(v =>
        (v.Marca || '').toLowerCase().includes(valor) ||
        (v.Modelo || '').toLowerCase().includes(valor) ||
        (v.Placa || '').toLowerCase().includes(valor)
    );

    renderVehiculos(filtrados);
});

// ================= CONTADORES =================
function actualizarContadores() {
    document.getElementById("totalVehiculos").innerText = vehiculosGlobal.length;

    document.getElementById("vehiculosDisponibles").innerText =
        vehiculosGlobal.filter(v => (v.Estado || '') === "Disponible").length;

    document.getElementById("vehiculosRentados").innerText =
        vehiculosGlobal.filter(v => (v.Estado || '') === "Rentado").length;

    document.getElementById("vehiculosMantenimiento").innerText =
        vehiculosGlobal.filter(v => (v.Estado || '') === "Mantenimiento").length;

    document.getElementById("vehiculosInactivos").innerText =
        vehiculosGlobal.filter(v => (v.Estado || '') === "Inactivo").length;
}

// ================= INICIO =================
document.addEventListener("DOMContentLoaded", () => {
    obtenerVehiculos();
});

// ================= GLOBAL =================
window.editar = editar;
window.eliminar = eliminar;