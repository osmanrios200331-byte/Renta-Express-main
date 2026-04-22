// ===== SIDEBAR =====
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.querySelector(".sidebar");
const overlay = document.getElementById("overlay");


if (menuToggle && sidebar && overlay) {
    menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("show");
        overlay.classList.toggle("show");
    });

    overlay.addEventListener("click", () => {
        sidebar.classList.remove("show");
        overlay.classList.remove("show");
    });
}


// ===== DROPDOWN =====
const userMenu = document.getElementById("userMenu");
const dropdown = document.getElementById("dropdownMenu");

if (userMenu && dropdown) {
    userMenu.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.style.display =
            dropdown.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
        if (!userMenu.contains(e.target)) {
            dropdown.style.display = "none";
        }
    });
}


// ===== BOTONES =====
const perfilBtn = document.getElementById("perfilBtn");
const configBtn = document.getElementById("configBtn");
const logoutBtn = document.getElementById("logoutBtn");

// ir a perfil
if (perfilBtn) {
    perfilBtn.addEventListener("click", () => {
        window.location.href = "/perfil";
    });
}

// ir a configuración
if (configBtn) {
    configBtn.addEventListener("click", () => {
        window.location.href = "/configuracion";
    });
}

// 🔥 LOGOUT CORREGIDO (IMPORTANTE)
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            await fetch("/logout", {
                method: "POST"
            });

            // limpiar por si acaso (aunque usas sesión)
            localStorage.removeItem("token");

            // redirigir al login real
            window.location.href = "/";
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    });
}
