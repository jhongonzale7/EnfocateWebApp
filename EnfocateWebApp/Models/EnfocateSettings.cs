namespace EnfocateService.Models
{
    public class EnfocateSettings
    {
        public int WorkDurationMinutes { get; set; }
        public int BreakDurationMinutes { get; set; }

        public EnfocateSettings()
        {
            WorkDurationMinutes = 25;
            BreakDurationMinutes = 5;
        }
    }
}
