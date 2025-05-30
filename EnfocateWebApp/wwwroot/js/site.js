// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

// — Solicitar suscripción Push —
if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.ready.then(reg => {
        return reg.pushManager.getSubscription()
            .then(sub => {
                if (!sub) {
                    return reg.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array('BMLSx8fA3OuKwf3iITttPihGQow-8yqi-QLYO-7vuj6jePbXZRZRGcYv1n0IMbE0Q_SNyHymzF_ovbBFPCZ7dn8')
                    });
                }
                return sub;
            });
    }).then(sub => {
    
        fetch('/api/Push/Subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sub)
        });
    }).catch(console.error);
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}
