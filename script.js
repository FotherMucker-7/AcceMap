const scriptURL = 'https://script.google.com/macros/s/AKfycbxccL4YlqqqG0VXorTL8nAc4_WVkl9YADIm_gpB-AeO5vjDHgauFxgxfNYm1nw7AuUR/exec';
const container = document.getElementById('app-container');
const form = document.getElementById('accemap-validator');

let userEmailSaved = "anonimo";

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
    const emailUsuario = userEmailSaved;
    const shareUrl = window.location.href;
    const shareText = `Vi barreras de accesibilidad y las reporté en AcceMap. ¿Ayudarías tú también?`;

    // Formateamos el mensaje completo (Texto + 2 saltos de línea + URL)
    const fullMessage = `${shareText}\n\n${shareUrl}`;

    // RASTREO (Se mantiene igual, esto es sagrado)
    fetch(scriptURL, {
        method: 'POST',
        body: new URLSearchParams({
            'timestamp': new Date().toISOString(),
            'issue': 'INTENTO_COMPARTIR',
            'email': emailUsuario
        })
    });

    // DETECTAR SI ES MOBILE O DESKTOP
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || window.innerWidth <= 768;

    if (isMobile && navigator.share) {
        // MOBILE: Usar Share API nativa (funciona perfecto)
        const shareData = {
            title: 'AcceMap',
            text: fullMessage,
            url: shareUrl
        };

        navigator.share(shareData)
            .then(() => console.log('Ventana compartida abierta'))
            .catch((err) => {
                // Si el usuario cancela, no hacemos nada intrusivo
                console.log('Compartir cancelado o fallido');
            });
    } else {
        // DESKTOP: Abrir WhatsApp Web directamente con el mensaje completo
        const whatsappMessage = encodeURIComponent(fullMessage);
        const whatsappUrl = `https://web.whatsapp.com/send?text=${whatsappMessage}`;

        // Abrir en nueva pestaña
        window.open(whatsappUrl, '_blank');

        // Feedback visual para el usuario
        const shareBtn = document.querySelector('button[onclick="shareAcceMap()"]');
        if (shareBtn) {
            const originalText = shareBtn.innerHTML;
            shareBtn.innerHTML = "✅ ¡WhatsApp Web abierto!";
            shareBtn.style.background = "var(--am-accent)";
            shareBtn.style.color = "var(--am-primary)";

            setTimeout(() => {
                shareBtn.innerHTML = originalText;
                shareBtn.style.background = "#fff";
                shareBtn.style.color = "#000";
            }, 3000);
        }
    }
}

// Función auxiliar para no repetir código y evitar el alert feo
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // En lugar de un alert, cambiaremos el texto del botón temporalmente
        // Esto es MUCHO más profesional (Feedback Visual No Invasivo)
        const shareBtn = document.querySelector('button[onclick="shareAcceMap()"]');
        const originalText = shareBtn.innerHTML;
        shareBtn.innerHTML = "✅ ¡Link copiado! Pégalo donde quieras";
        shareBtn.style.background = "var(--am-accent)";
        shareBtn.style.color = "var(--am-primary)";

        setTimeout(() => {
            shareBtn.innerHTML = originalText;
            shareBtn.style.background = "#fff";
            shareBtn.style.color = "#000";
        }, 3000);
    });
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
    userEmailSaved = form.querySelector('input[name="email"]').value; // GUARDAMOS EL EMAIL
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