// ================= RENTAS POR MES =================
async function cargarRentasPorMes() {
    try {
        const res  = await fetch('/api/reportes/rentas-por-mes');
        const data = await res.json();

        const labels = data.map(d => d.MesNombre);
        const valores = data.map(d => d.TotalRentas);

        // Tarjeta total
        const total = valores.reduce((a, b) => a + b, 0);
        document.getElementById("totalRentas").innerText = total;

        // Gráfica
        new Chart(document.getElementById("graficaRentas"), {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Rentas',
                    data: valores,
                    backgroundColor: '#1cc847',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });

    } catch (error) {
        console.error('Error rentas por mes:', error);
    }
}

// ================= INGRESOS POR MES =================
async function cargarIngresosPorMes() {
    try {
        const res  = await fetch('/api/reportes/ingresos-por-mes');
        const data = await res.json();

        const labels  = data.map(d => d.MesNombre);
        const valores = data.map(d => d.TotalIngresos);
        const pagos   = data.map(d => d.TotalPagos);

        // Tarjetas
        const totalIngresos = valores.reduce((a, b) => a + Number(b), 0);
        const totalPagos    = pagos.reduce((a, b) => a + Number(b), 0);

        document.getElementById("totalIngresos").innerText = `$${totalIngresos.toLocaleString()}`;
        document.getElementById("totalPagos").innerText    = totalPagos;

        // Gráfica
        new Chart(document.getElementById("graficaIngresos"), {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Ingresos ($)',
                    data: valores,
                    borderColor: '#f4a62a',
                    backgroundColor: 'rgba(244,166,42,0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });

    } catch (error) {
        console.error('Error ingresos por mes:', error);
    }
}

// ================= INICIO =================
document.addEventListener("DOMContentLoaded", () => {
    cargarRentasPorMes();
    cargarIngresosPorMes();
});