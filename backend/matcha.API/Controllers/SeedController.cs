using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sparkdates.Infrastructure.Seeding;

namespace sparkdates.API.Controllers
{
    [AllowAnonymous]
    [ApiExplorerSettings(IgnoreApi = true)]
    public class SeedController : BaseApiController
    {
        private readonly Seed _seeder;
        private readonly IWebHostEnvironment _env;

        public SeedController(Seed seeder, IWebHostEnvironment env)
        {
            _seeder = seeder;
            _env = env;
        }

        [HttpPost]
        public async Task<IActionResult> RunSeed([FromQuery] bool force = false)
        {
            if (!_env.IsDevelopment())
                return Forbid();

            if (force)
                await _seeder.ForceSeedAsync();
            else
                await _seeder.SeedAsync();

            return Ok(new { message = "Seed completed." });
        }

        [HttpDelete]
        public async Task<IActionResult> RemoveSeed()
        {
            if (!_env.IsDevelopment())
                return Forbid();

            await _seeder.RemoveSeedAsync();
            return Ok(new { message = "Seed data removed." });
        }
    }
}
