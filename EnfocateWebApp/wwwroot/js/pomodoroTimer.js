(function () {
    const workAudio = document.getElementById('workAudio');
    workAudio.load(); 

    document.getElementById('startButton').addEventListener('click', () => {
        workAudio.play()
            .then(() => {
                workAudio.pause();
                workAudio.currentTime = 0;
            })
            .catch(err => console.warn('No se pudo desbloquear audio:', err));
    });

    let workDuration = window.workDuration || 25 * 60;
    let breakDuration = window.breakDuration || 5 * 60;
    let totalDuration = workDuration;
    let remainingTime = workDuration;
    let isRunning = false;
    let isWorkPeriod = true;
    let timer;

    function updateDisplay() {
        const m = Math.floor(remainingTime / 60).toString().padStart(2, '0');
        const s = (remainingTime % 60).toString().padStart(2, '0');
        document.getElementById('timerDisplay').textContent = `${m}:${s}`;
        const pct = Math.round((totalDuration - remainingTime) / totalDuration * 100);
        document.title = `(${pct}%) Enfócate Web App`;
    }

    function notifyEnd() {
        const msg = isWorkPeriod
            ? '¡Tiempo de trabajo terminado! Hora de descansar.'
            : '¡Descanso terminado! Hora de trabajar.';

        alert(msg);

        isWorkPeriod = !isWorkPeriod;
        remainingTime = isWorkPeriod ? workDuration : breakDuration;
        updateDisplay();
        document.getElementById('statusMessage').textContent =
            isWorkPeriod ? 'Trabajando...' : 'Descansando...';

        startTimer();
    }

    function startTimer() {
        if (isRunning) return;
        isRunning = true;
        document.getElementById('statusMessage').textContent =
            isWorkPeriod ? 'Trabajando...' : 'Descansando...';

        timer = setInterval(() => {
            remainingTime--;
            updateDisplay();

            if (remainingTime <= 0) {
                clearInterval(timer);
                isRunning = false;

                workAudio.pause();
                workAudio.currentTime = 0;
                workAudio.play()
                    .then(notifyEnd)
                    .catch(notifyEnd);
            }
        }, 1000);
    }

    function pauseTimer() {
        if (!isRunning) return;
        isRunning = false;
        clearInterval(timer);
        document.getElementById('statusMessage').textContent = 'Pausado';
    }

    function resetTimer() {
        isRunning = false;
        clearInterval(timer);
        isWorkPeriod = true;
        remainingTime = workDuration;
        updateDisplay();
        document.getElementById('statusMessage').textContent =
            'Configura y empieza tu sesión de Enfócate';
    }

    document.getElementById('startButton').addEventListener('click', startTimer);
    document.getElementById('pauseButton').addEventListener('click', pauseTimer);
    document.getElementById('resetButton').addEventListener('click', resetTimer);

    document.getElementById('settingsForm').addEventListener('submit', e => {
        e.preventDefault();
        const wd = parseInt(document.getElementById('workInput').value, 10);
        const bd = parseInt(document.getElementById('breakInput').value, 10);
        if (!isNaN(wd) && wd > 0) workDuration = wd * 60;
        if (!isNaN(bd) && bd > 0) breakDuration = bd * 60;
        resetTimer();
    });

    // Inicialización
    updateDisplay();
    document.getElementById('statusMessage').textContent =
        'Configura y empieza tu sesión de Enfócate';

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
        const start = -Math.PI / 2;                       // punta arriba
        const end = start + Math.PI * 2 * pct;            // según porcentaje
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

})();  
