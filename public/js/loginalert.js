
  document.addEventListener("DOMContentLoaded", function() {
    const alert = document.getElementById('alertBienvenida');
    alert.style.display = 'block'; // muestra la alerta

    
    // Después de 5 segundos, cierra la alerta usando la funcionalidad de Bootstrap
    setTimeout(() => {
      // Usamos el método de Bootstrap para cerrar alertas programáticamente
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    }, 5000);
  });

