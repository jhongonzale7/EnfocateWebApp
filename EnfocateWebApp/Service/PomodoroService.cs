using EnfocateService.Models;


namespace EnfocateService.Services
{
    public class PomodoroService
    {
        public void ValidateSettings(EnfocateSettings settings)
        {
            if (settings.WorkDurationMinutes <= 0)
                throw new ArgumentException("La duración del trabajo debe ser mayor a cero.");
            if (settings.BreakDurationMinutes <= 0)
                throw new ArgumentException("La duración del descanso debe ser mayor a cero.");
        }
    }
}
