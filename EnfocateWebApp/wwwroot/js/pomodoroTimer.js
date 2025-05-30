(function () {
    const workAudio = document.getElementById('workAudio');
    workAudio.load();

    document.getElementById('startButton').addEventListener('click', startTimer);
    document.getElementById('pauseButton').addEventListener('click', pauseTimer);
    document.getElementById('resetButton').addEventListener('click', resetTimer);

    let workDuration = window.workDuration || 25 * 60;
    let breakDuration = window.breakDuration || 5 * 60;
    let totalDuration = workDuration;
    let remainingTime = workDuration;
    let isRunning = false;
    let isWorkPeriod = true;
    let timer;
    let startTime;
    let elapsedOffset = 0;

    function recalcRemaining() {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        remainingTime = Math.max(totalDuration - elapsed, 0);
    }
    function updateDisplay() {
        const m = Math.floor(remainingTime / 60).toString().padStart(2, '0');
        const s = (remainingTime % 60).toString().padStart(2, '0');
        document.getElementById('timerDisplay').textContent = `${m}:${s}`;
        document.title = `${m}:${s} – Enfócate Web App`;
    }

    if ('Notification' in window) {
        Notification.requestPermission();
    }
    function notifyEnd() {

        const title = isWorkPeriod
            ? '¡Tiempo de trabajo terminado!'
            : '¡Descanso terminado!';
        const body = isWorkPeriod
            ? 'Hora de descansar.'
            : 'Hora de volver a trabajar.';

        if (Notification.permission === 'granted') {
            new Notification(title, { body, requireInteraction: true })
                .onclick = () => window.focus();
        } else {

            alert(`${title} ${body}`);
        }

        document.getElementById('statusMessage').textContent =
            'Periodo finalizado. Pulsa Aceptar para continuar.';

        const btn = document.createElement('button');
        btn.textContent = 'Aceptar';
        btn.className = 'btn btn-primary mt-3';
        btn.id = 'acceptPomodoro';
        btn.onclick = () => {

            workAudio.loop = false;
            workAudio.pause();
            workAudio.currentTime = 0;

            isWorkPeriod = !isWorkPeriod;
            resetTimer();
            btn.remove();

            startTimer();
        };


        document.querySelector('.card').append(btn);
    }

    // Función para iniciar o reanudar el temporizador
    // wwwroot/js/pomodoroTimer.js

    function startTimer() {
        if (isRunning) return;
        isRunning = true;

        // 1) Definir duración del periodo actual
        totalDuration = isWorkPeriod ? workDuration : breakDuration;
        // 2) Ajustar startTime teniendo en cuenta pausas
        startTime = Date.now() - elapsedOffset * 1000;

        timer = setInterval(() => {
            // 3) Recalcular y refrescar pantalla
            recalcRemaining();
            updateDisplay();

            // 4) Al llegar a cero, parar el interval y reproducir audio UNA sola vez
            if (remainingTime <= 0) {
                clearInterval(timer);
                isRunning = false;

                // Reproducir audio una vez (no en bucle)
                workAudio.loop = false;
                workAudio.currentTime = 0;
                workAudio.play().catch(() => { });

                // 5) Notificar fin de periodo
                notifyEnd();
            }
        }, 1000);
    }


    // Función para reiniciar el temporizador al inicio del periodo
    function resetTimer() {
        // 1) Detener cualquier interval activo
        isRunning = false;
        clearInterval(timer);

        // 2) Reiniciar offset de pausa
        elapsedOffset = 0;

        // 3) Volver siempre al periodo de TRABAJO
        isWorkPeriod = true;

        // 4) Restaurar remainingTime al inicio del trabajo
        remainingTime = workDuration;

        // 5) Eliminar botón “Aceptar” si sigue en pantalla
        const acceptBtn = document.getElementById('acceptPomodoro');
        if (acceptBtn) acceptBtn.remove();

        // 6) Actualizar display y texto
        updateDisplay();
        document.getElementById('statusMessage').textContent =
            'Configura y empieza tu sesión de Enfócate';
    }



    function pauseTimer() {
        if (!isRunning) return;
        isRunning = false;
        clearInterval(timer);
        elapsedOffset = Math.floor((Date.now() - startTime) / 1000);
        document.getElementById('statusMessage').textContent = 'Pausado';
    }
    function resetTimer() {
        // 1) Detener cualquier intervalo activo
        isRunning = false;
        clearInterval(timer);

        // 2) Reiniciar offset para que al reanudar empiece desde cero
        elapsedOffset = 0;

        // 3) Volver al inicio del periodo actual (trabajo o descanso)
        remainingTime = isWorkPeriod ? workDuration : breakDuration;

        // 4) Actualizar la pantalla y el mensaje
        updateDisplay();
        document.getElementById('statusMessage').textContent =
            isWorkPeriod
                ? 'Configura y empieza tu sesión de Enfócate'
                : 'Configura y comienza tu descanso';

    }


    document.getElementById('settingsForm').addEventListener('submit', e => {
        e.preventDefault();
        const wd = parseInt(document.getElementById('workInput').value, 10);
        const bd = parseInt(document.getElementById('breakInput').value, 10);
        if (!isNaN(wd) && wd > 0) workDuration = wd * 60;
        if (!isNaN(bd) && bd > 0) breakDuration = bd * 60;
        resetTimer();
    });

    /**
      * Dibuja un aro de progreso en el favicon
      * @param {number} pct Valor entre 0 y 1 con el % completado 
      */
    function updateProgressFavicon(pct) {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d');

        // 1) Fondo circular (btn-primary)
        ctx.fillStyle = '#1b6ec2';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();

        // 2) Arco de progreso en blanco
        const thickness = 6;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = thickness;
        const start = -Math.PI / 2;                      
        const end = start + Math.PI * 2 * pct;            
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - thickness, start, end);
        ctx.stroke();

        // 3) Actualiza el <link> del favicon
        const link = document.getElementById('dynamic-favicon');
        if (link) link.href = canvas.toDataURL('image/png');
    }

        const _originalUpdateDisplay = updateDisplay;
        updateDisplay = function () {
        _originalUpdateDisplay();
        const pct = (totalDuration - remainingTime) / totalDuration;
        updateProgressFavicon(pct);
    };

    updateDisplay();
    document.getElementById('statusMessage').textContent =
        'Configura y empieza tu sesión de Enfócate';

    document.getElementById('linkPrivacy').addEventListener('click', e => {
        if (!confirm('Si cambias de sección, el Pomodoro se reiniciará. ¿Continuar?')) {
            e.preventDefault();
        }
    });

})();  
