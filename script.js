const scriptURL = 'https://script.google.com/macros/s/AKfycbxccL4YlqqqG0VXorTL8nAc4_WVkl9YADIm_gpB-AeO5vjDHgauFxgxfNYm1nw7AuUR/exec';
const container = document.getElementById('app-container');
const form = document.getElementById('accemap-validator');

let userEmailSaved = "anonimo";

// 1. Lógica de LocalStorage: ¿Ya reportó antes?
window.onload = () => {
    // Recuperar el email guardado si existe
    const savedEmail = localStorage.getItem('accemap_user_email');
    if (savedEmail) {
        userEmailSaved = savedEmail;
    }

    if (localStorage.getItem('accemap_user_reported')) {
        showThankYouMessage(true);
    }
};

function showThankYouMessage(isRepeat) {
    // Definimos los mensajes basados en el nuevo enfoque de Design Thinking
    const title = isRepeat
        ? "¡Hola de nuevo, guardián de la libertad!"
        : "¡Todo listo! Tu próxima salida será mejor.";

    const body = isRepeat
        ? "Ya registramos tus nuevas sugerencias. Estamos mapeando la ciudad gracias a tu insistencia."
        : "Hemos recibido tus lugares. Muy pronto verificaremos que sean 100% accesibles para que salgas con total autonomía.";

    container.innerHTML = `
        <div style="text-align:center; animation: fadeIn 0.5s;">
            <h1 style="color:var(--am-accent); font-size: 1.8rem;">${title}</h1>
            <p style="color:#cbd5e1; margin-bottom: 2rem;">${body}</p>
            
            <!-- Botón de Compartir (Viral Loop) -->
            <button class="btn-next" onclick="shareAcceMap()" 
                style="background:#fff; color:#000; margin-bottom:12px;"
                aria-label="Compartir esta iniciativa con tus contactos">
                📢 Invitar a un aliado
            </button>

            <!-- Botón de Acción Repetida (Engagement) -->
            <button class="btn-next" onclick="resetForm()"
                style="background: transparent; border: 2px solid var(--am-accent); color: var(--am-accent);"
                aria-label="Sugerir otro lugar para verificación">
                Sugerir otro lugar
            </button>

            <br><br>
            <img src="logo.png" alt="AcceMap Logo" width="80" style="opacity: 0.8;">
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
    const shareText = `¡Basta de sorpresas al llegar! 🚀 Estoy usando AcceMap para encontrar lugares realmente accesibles en la ciudad. Échale un ojo y dinos qué lugar deberíamos verificar por ti:`;

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

    // Actualizar indicador de paso
    const stepIndicatorSpan = document.getElementById('current-step');
    if (stepIndicatorSpan) {
        stepIndicatorSpan.textContent = currentStep;
    }
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
            localStorage.setItem('accemap_user_email', userEmailSaved); // Guardar email en localStorage

            // Tracking de Vercel Analytics: Reporte completado
            if (window.va) {
                window.va('event', { name: 'reporte_completado' });
            }

            showThankYouMessage(false);
        })
        .catch(error => {
            alert('Error de conexión. Inténtalo de nuevo.');
            btn.disabled = false;
            btn.innerText = 'FINALIZAR Y REPORTAR';
        });
});

// 5. Accesibilidad: Navegación por teclado para botones de selección
document.addEventListener('DOMContentLoaded', () => {
    // Agregar soporte de Enter y Space para todos los botones .btn-choice
    document.addEventListener('keydown', (e) => {
        if (e.target.classList.contains('btn-choice') && e.target.hasAttribute('role')) {
            // Enter (código 13) o Espacio (código 32)
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault(); // Prevenir scroll con espacio
                e.target.click(); // Simular click
            }
        }
    });

    // 6. Validación en tiempo real del email
    const emailInput = document.getElementById('email-input');
    if (emailInput) {
        emailInput.addEventListener('input', (e) => {
            const email = e.target.value;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (email.length > 0) {
                if (emailRegex.test(email)) {
                    // Email válido
                    emailInput.style.borderColor = 'var(--am-accent)';
                    emailInput.style.outline = 'none';
                } else {
                    // Email inválido
                    emailInput.style.borderColor = '#ef4444';
                    emailInput.style.outline = 'none';
                }
            } else {
                // Campo vacío, resetear estilo
                emailInput.style.borderColor = '';
            }
        });
    }
});