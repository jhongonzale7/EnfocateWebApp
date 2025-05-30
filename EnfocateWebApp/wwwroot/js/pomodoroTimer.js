// wwwroot/js/pomodoroTimer.js

(function () {
    const workAudio = document.getElementById('workAudio');
    workAudio.load();

    // Controles y elementos de UI
    const startBtn = document.getElementById('startButton');
    const pauseBtn = document.getElementById('pauseButton');
    const resetBtn = document.getElementById('resetButton');
    const settingsForm = document.getElementById('settingsForm');
    const statusEl = document.getElementById('statusMessage');

    // Duraciones y estado
    let workDuration = window.workDuration || 25 * 60;
    let breakDuration = window.breakDuration || 5 * 60;
    let totalDuration = workDuration;
    let remainingTime = workDuration;
    let isRunning = false;
    let isWorkPeriod = true;
    let timer;
    let startTime;
    let elapsedOffset = 0;

    // Recalcula remainingTime según timestamps
    function recalcRemaining() {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        remainingTime = Math.max(totalDuration - elapsed, 0);
    }

    // Dibuja MM:SS y actualiza título
    function updateDisplay() {
        const m = Math.floor(remainingTime / 60).toString().padStart(2, '0');
        const s = (remainingTime % 60).toString().padStart(2, '0');
        document.getElementById('timerDisplay').textContent = `${m}:${s}`;
        document.title = `${m}:${s} – Enfócate Web App`;
    }

    // Pedir permiso de notificaciones al inicio
    if ('Notification' in window) {
        Notification.requestPermission();
    }

    // Al finalizar un periodo
    // Reemplaza tu función notifyEnd() completa por esta:
    function notifyEnd() {
        const title = isWorkPeriod
            ? '¡Tiempo de trabajo terminado!'
            : '¡Descanso terminado!';
        const body = isWorkPeriod
            ? 'Hora de descansar.'
            : 'Hora de volver a trabajar.';
        const options = { body, requireInteraction: true };

        // 1) Notificación via Service Worker o Notification API
        if (Notification.permission === 'granted') {
            navigator.serviceWorker.ready
                .then(reg => reg.showNotification(title, options))
                .catch(() => new Notification(title, options));
        } else {
            alert(`${title} ${body}`);
        }

        // 2) Mensaje en pantalla
        statusEl.textContent = 'Periodo finalizado. Pulsa Aceptar para continuar.';

        // 3) Eliminar botón previo si existe
        const old = document.getElementById('acceptPomodoro');
        if (old) old.remove();

        // 4) Crear botón Aceptar siempre (móvil y escritorio)
        const btn = document.createElement('button');
        btn.id = 'acceptPomodoro';
        btn.className = 'btn btn-primary mt-3';
        btn.textContent = 'Aceptar';
        btn.onclick = () => {
            workAudio.loop = false;
            workAudio.pause();
            workAudio.currentTime = 0;

            // Alternar periodo y reiniciar
            isWorkPeriod = !isWorkPeriod;
            elapsedOffset = 0;
            remainingTime = isWorkPeriod ? workDuration : breakDuration;
            updateDisplay();
            statusEl.textContent = isWorkPeriod ? 'Trabajando…' : 'Descansando…';

            btn.remove();
            startTimer();
        };
        document.querySelector('.card').append(btn);
    }


    // Inicia o reanuda el temporizador
    function startTimer() {
        if (isRunning) return;
        isRunning = true;

        totalDuration = isWorkPeriod ? workDuration : breakDuration;

        // Desbloquear audio en móviles
        workAudio.play()
            .then(() => {
                workAudio.pause();
                workAudio.currentTime = 0;
            })
            .catch(() => { });

        startTime = Date.now() - elapsedOffset * 1000;
        statusEl.textContent = isWorkPeriod ? 'Trabajando…' : 'Descansando…';

        timer = setInterval(() => {
            recalcRemaining();
            updateDisplay();

            if (remainingTime <= 0) {
                clearInterval(timer);
                isRunning = false;

                // Reproducir audio UNA vez
                workAudio.loop = false;
                workAudio.currentTime = 0;
                workAudio.play().catch(() => { });

                notifyEnd();
            }
        }, 1000);
    }

    // Pausa el temporizador y guarda offset
    function pauseTimer() {
        if (!isRunning) return;
        isRunning = false;
        clearInterval(timer);
        elapsedOffset = Math.floor((Date.now() - startTime) / 1000);
        statusEl.textContent = 'Pausado';
    }

    // Reinicia al inicio de trabajo (permite reconfiguración)
    function resetTimer() {
        // 1) Detener cualquier intervalo activo
        isRunning = false;
        clearInterval(timer);

        // 2) Reiniciar offset de pausa
        elapsedOffset = 0;

        // 3) Mantener el periodo actual y fijar el tiempo inicial
        remainingTime = isWorkPeriod
            ? workDuration
            : breakDuration;

        // 4) Refrescar pantalla y mensaje según periodo
        updateDisplay();
        statusEl.textContent = isWorkPeriod
            ? 'Configura y empieza tu sesión de Enfócate'
            : 'Configura y comienza tu descanso';

        // 5) Eliminar botón “Aceptar” si existe
        const acceptBtn = document.getElementById('acceptPomodoro');
        if (acceptBtn) acceptBtn.remove();
    }


    // Listeners de botones y formulario
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    settingsForm.addEventListener('submit', e => {
        e.preventDefault();
        const wd = parseInt(document.getElementById('workInput').value, 10);
        const bd = parseInt(document.getElementById('breakInput').value, 10);
        if (!isNaN(wd) && wd > 0) workDuration = wd * 60;
        if (!isNaN(bd) && bd > 0) breakDuration = bd * 60;
        resetTimer();
    });

    // Dibuja aro de progreso en el favicon
    function updateProgressFavicon(pct) {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#1b6ec2';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();

        const thickness = 6;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = thickness;
        const start = -Math.PI / 2;
        const end = start + Math.PI * 2 * pct;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - thickness, start, end);
        ctx.stroke();

        const link = document.getElementById('dynamic-favicon');
        if (link) link.href = canvas.toDataURL('image/png');
    }

    // Sobrescribir updateDisplay para incluir favicon
    const _origUpdate = updateDisplay;
    updateDisplay = function () {
        _origUpdate();
        const pct = (totalDuration - remainingTime) / totalDuration;
        updateProgressFavicon(pct);
    };

    // Inicialización (después de sobrescritura)
    updateDisplay();
    statusEl.textContent = 'Configura y empieza tu sesión de Enfócate';

    // Confirmación al cambiar de sección
    document.getElementById('linkPrivacy').addEventListener('click', e => {
        if (!confirm('Si cambias de sección, el Pomodoro se reiniciará. ¿Continuar?')) {
            e.preventDefault();
        }
    });
})();
