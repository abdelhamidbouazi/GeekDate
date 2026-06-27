using sparkdates.Application.Interfaces.Repositories;
using sparkdates.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace sparkdates.API.Controllers
{
    [AllowAnonymous]
    public class TestController : BaseApiController
    {
        private readonly IGenericRepoAsync<AppUser> repo;

        public TestController(IGenericRepoAsync<AppUser> repo)
        {
            this.repo = repo;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            return Ok(await repo.GetAllAsync());
        }
    }
}
