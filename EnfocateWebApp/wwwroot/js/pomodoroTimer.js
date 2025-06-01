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

        remainingTime = 0;
        isRunning = false;

        const title = isWorkPeriod
            ? '¡Tiempo de trabajo terminado!'
            : '¡Descanso terminado!';
        const body = isWorkPeriod
            ? 'Hora de descansar.'
            : 'Hora de volver a trabajar.';
        const options = { body, requireInteraction: true };

     
        if (!/iP(hone|ad|od)|Android/i.test(navigator.userAgent)) {
            if (Notification.permission === 'granted') {
                navigator.serviceWorker.ready
                    .then(reg => reg.showNotification(title, options))
                    .catch(() => new Notification(title, options));
            } else {
                alert(`${title} ${body}`);
            }
        }

        const old = document.getElementById('acceptPomodoro');
        if (old) old.remove();

        if (!/iP(hone|ad|od)|Android/i.test(navigator.userAgent)) {
            statusEl.textContent = 'Periodo finalizado. Pulsa Aceptar para continuar.';
            const btn = document.createElement('button');
            btn.id = 'acceptPomodoro';
            btn.className = 'btn btn-primary mt-3';
            btn.textContent = 'Aceptar';
            btn.onclick = () => {
                workAudio.loop = false;
                workAudio.pause();
                workAudio.currentTime = 0;

                isWorkPeriod = !isWorkPeriod;
                elapsedOffset = 0;
                remainingTime = isWorkPeriod ? workDuration : breakDuration;
                updateDisplay();
                statusEl.textContent = isWorkPeriod ? 'Trabajando…' : 'Descansando…';

                btn.remove();
                startTimer();
            };
            document.querySelector('.card').append(btn);

        } else {
         
            isWorkPeriod = !isWorkPeriod;
            elapsedOffset = 0;
            remainingTime = isWorkPeriod ? workDuration : breakDuration;
            updateDisplay();
            statusEl.textContent = 'Periodo finalizado. Pulsa "Iniciar" para comenzar tu ' + (isWorkPeriod ? 'sesión de trabajo.' : 'descanso.');
            
            startBtn.disabled = false;
        }
    }
    function startTimer() {
        if (isRunning) return;
        isRunning = true;

        if (/iP(hone|ad)/.test(navigator.userAgent)) {
            const silent = new Audio('/sounds/silence.mp3');
            silent.loop = true;
            silent.play().catch(() => { });
        }

        totalDuration = isWorkPeriod ? workDuration : breakDuration;

        localStorage.setItem('pomodoroStart', Date.now().toString());
        localStorage.setItem('isWorkPeriod', isWorkPeriod);
        localStorage.setItem('isRunning', true);
 
        workAudio.play()
            .then(() => { workAudio.pause(); workAudio.currentTime = 0; })
            .catch(() => { });

        startTime = Date.now() - elapsedOffset * 1000;
        statusEl.textContent = isWorkPeriod ? 'Trabajando…' : 'Descansando…';

        timer = setInterval(() => {
            recalcRemaining();
            updateDisplay();

            if (remainingTime <= 0) {
                clearInterval(timer);
                isRunning = false;

                workAudio.loop = false;
                workAudio.currentTime = 0;
                workAudio.play().catch(() => { });

                notifyEnd();
            }
        }, 1000);
    }

    function pauseTimer() {
        if (!isRunning) return;
        isRunning = false;
        clearInterval(timer);
        elapsedOffset = Math.floor((Date.now() - startTime) / 1000);
        statusEl.textContent = 'Pausado';

        localStorage.setItem('pomodoroStart', startTime.toString());
        localStorage.setItem('isWorkPeriod', isWorkPeriod);
        localStorage.setItem('isRunning', false);
    }
    function resetTimer() {

        isRunning = false;
        clearInterval(timer);

        elapsedOffset = 0;

        remainingTime = isWorkPeriod
            ? workDuration
            : breakDuration;

        updateDisplay();
        statusEl.textContent = isWorkPeriod
            ? 'Configura y empieza tu sesión de Enfócate'
            : 'Configura y comienza tu descanso';

        localStorage.removeItem('pomodoroStart');
        localStorage.removeItem('isWorkPeriod');
        localStorage.removeItem('isRunning');

        const acceptBtn = document.getElementById('acceptPomodoro');
        if (acceptBtn) acceptBtn.remove();
    }

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

    const _origUpdate = updateDisplay;
    updateDisplay = function () {
        _origUpdate();
        const pct = (totalDuration - remainingTime) / totalDuration;
        updateProgressFavicon(pct);
    };
 
    updateDisplay();
    statusEl.textContent = 'Configura y empieza tu sesión de Enfócate';

    ['linkPrivacy', 'linkManual'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('click', e => {
            const isPaused = statusEl.textContent === 'Pausado';
            if ((isRunning || isPaused)
                && !confirm('Si cambias de sección, el Pomodoro se reiniciará. ¿Continuar?')) {
                e.preventDefault();
            }
        });
    });

    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') {
            let startTimestamp = localStorage.getItem('pomodoroStart');
            let isWork = localStorage.getItem('isWorkPeriod') === 'true';
            let isRunningStored = localStorage.getItem('isRunning') === 'true';

            let duration = isWork ? workDuration : breakDuration;

            if (startTimestamp && isRunningStored) {
                let elapsed = Math.floor((Date.now() - parseInt(startTimestamp, 10)) / 1000);
                if (elapsed >= duration) {        

                    isWorkPeriod = isWork;
                    isRunning = false;
                    remainingTime = 0;

                    clearInterval(timer);

                    notifyEnd();

                } else {
 
                    isWorkPeriod = isWork;
                    remainingTime = duration - elapsed;
                    updateDisplay();

                    if (isRunningStored) {
                        startTime = parseInt(startTimestamp, 10);
                        startTimer();
                    }
                }
            }
        }
    });

    window.startTimer = startTimer;
    window.pauseTimer = pauseTimer;
    window.resetTimer = resetTimer;
    window.totalDuration = totalDuration;
    window.remainingTime = remainingTime;
    window.isRunning = isRunning;

})();

