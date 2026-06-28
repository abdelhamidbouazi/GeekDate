using sparkdates.Application.Exceptions;
using sparkdates.Application.Interfaces.Repositories;
using sparkdates.Application.Interfaces.Services;
using sparkdates.Application.Interfaces.UoW;

namespace sparkdates.DomainServices.Services
{
    public class BlockGuardServiceAsync : IBlockGuardServiceAsync
    {
        private readonly IUnitOfWork _unitOfWork;

        public BlockGuardServiceAsync(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<bool> IsBlockedBetweenUsersAsync(Guid firstUserId, Guid secondUserId)
        {
            if (firstUserId == Guid.Empty || secondUserId == Guid.Empty || firstUserId == secondUserId)
            {
                return false;
            }

            var block = await _unitOfWork.GetRepository<IGenericRepoAsync<Domain.Entities.UserBlock>>()
                .FirstOrDefaultAsync(block =>
                    (block.BlockingUserId == firstUserId && block.BlockedUserId == secondUserId) ||
                    (block.BlockingUserId == secondUserId && block.BlockedUserId == firstUserId));

            return block != null;
        }

        public async Task EnsureUsersCanInteractAsync(Guid firstUserId, Guid secondUserId, string? message = null)
        {
            if (await IsBlockedBetweenUsersAsync(firstUserId, secondUserId))
            {
                throw new ForbiddenException(message ?? "This user is unavailable.");
            }
        }
    }
}
