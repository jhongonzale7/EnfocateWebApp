(function () {
    const alertAudio = document.getElementById('workAudio');

    let workDuration = window.workDuration || 25 * 60;
    let breakDuration = window.breakDuration || 5 * 60;
    let remainingTime = workDuration;
    let isRunning = false;
    let isWorkPeriod = true;
    let timer;

    function updateDisplay() {
        const m = Math.floor(remainingTime / 60).toString().padStart(2, '0');
        const s = (remainingTime % 60).toString().padStart(2, '0');
        document.getElementById('timerDisplay').textContent = `${m}:${s}`;
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

                alertAudio.currentTime = 0;
                alertAudio.play()
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
})();
