using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using EnfocateService.Models;
using EnfocateService.Services;

namespace EnfocateService.Pages
{
    public class IndexModel : PageModel
    {
        private readonly PomodoroService _pomodoroService;

        [BindProperty]
        public EnfocateSettings Settings { get; set; }

        public string StatusMessage { get; set; }

        public IndexModel(PomodoroService pomodoroService)
        {
            _pomodoroService = pomodoroService;
            Settings = new EnfocateSettings();
            StatusMessage = "Configura y empieza tu sesión de Enfócate";
        }

        public void OnGet()
        {
            Settings = new EnfocateSettings();
        }

        public IActionResult OnPost()
        {
            if (!ModelState.IsValid)
                return Page();

            try
            {
                _pomodoroService.ValidateSettings(Settings);
                StatusMessage = "Configuración aplicada. ¡Listo para empezar!";
            }
            catch (ArgumentException ex)
            {
                ModelState.AddModelError(string.Empty, ex.Message);
            }
            return Page();
        }
    }
}
