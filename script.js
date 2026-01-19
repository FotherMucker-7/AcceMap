const scriptURL = 'https://script.google.com/macros/s/AKfycbxccL4YlqqqG0VXorTL8nAc4_WVkl9YADIm_gpB-AeO5vjDHgauFxgxfNYm1nw7AuUR/exec';
const container = document.getElementById('app-container');
const form = document.getElementById('accemap-validator');

// 1. Lógica de LocalStorage: ¿Ya reportó antes?
window.onload = () => {
    if (localStorage.getItem('accemap_user_reported')) {
        showThankYouMessage(true);
    }
};

function showThankYouMessage(isRepeat) {
    const message = isRepeat
        ? "¡Hola de nuevo, guardián! Ya tenemos tu reporte anterior."
        : "¡Gracias por tu reporte!";

    container.innerHTML = `
                <div style="text-align:center; animation: fadeIn 0.5s;">
                    <h1 style="color:var(--am-accent)">${message}</h1>
                    <p>Tu aporte ayuda a crear una ciudad sin barreras.</p>
                    
                    <!-- Botón de Compartir -->
                    <button class="btn-next" onclick="shareAcceMap()" style="background:#fff; color:#000; margin-bottom:10px;">
                        📢 Compartir con un amigo
                    </button>

                    <button class="btn-next" onclick="resetForm()">
                        Reportar otra barrera
                    </button>
                    <br><br>
                    <img src="logo.png" width="80">
                </div>
            `;
}

function resetForm() {
    localStorage.removeItem('accemap_user_reported');
    location.reload();
}

// 2. Compartir
function shareAcceMap() {
    // 1. Capturamos los datos básicos
    const emailUsuario = document.querySelector('input[name="email"]')?.value || "anonimo";
    const shareData = {
        title: 'AcceMap',
        text: 'Vi barreras de accesibilidad y las reporté en AcceMap. ¿Ayudarías tú también?',
        url: window.location.href
    };

    // 2. RASTREO: Avisamos al Sheet que alguien hizo clic (Opcional pero recomendado)
    // Esto envía una mini-petición al mismo script que ya tienes
    fetch(scriptURL, {
        method: 'POST',
        body: new URLSearchParams({
            'timestamp': new Date().toISOString(),
            'issue': 'INTENTO_COMPARTIR',
            'email': emailUsuario
        })
    });

    // 3. EJECUCIÓN: La Web Share API
    if (navigator.share) {
        navigator.share(shareData)
            .then(() => console.log('Menú compartido abierto'))
            .catch((err) => console.log('El usuario canceló el compartido'));
    } else {
        // Respaldo para Desktop
        navigator.clipboard.writeText(shareData.url).then(() => {
            alert('¡Link copiado! Pégalo en tus redes para ayudarnos.');
        });
    }
}

// 3. Navegación entre pasos
let currentStep = 1;
function nextStep(step, val) {
    if (val) document.getElementById('issue-input').value = val;
    document.getElementById('step' + step).classList.remove('active');
    currentStep++;
    document.getElementById('step' + currentStep).classList.add('active');
    document.getElementById('progress').style.width = (currentStep * 33) + '%';
}

// 4. Envío de datos
form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = document.getElementById('submit-btn');
    btn.innerText = 'ENVIANDO...';
    btn.disabled = true;

    fetch(scriptURL, { method: 'POST', body: new FormData(form) })
        .then(response => {
            localStorage.setItem('accemap_user_reported', 'true');
            showThankYouMessage(false);
        })
        .catch(error => {
            alert('Error de conexión. Inténtalo de nuevo.');
            btn.disabled = false;
            btn.innerText = 'FINALIZAR Y REPORTAR';
        });
});