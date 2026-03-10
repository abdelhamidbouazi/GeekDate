using matcha.Application.Interfaces.Repositories;
using matcha.Application.Interfaces.Services;
using matcha.Application.Interfaces.UoW;

namespace matcha.DomainServices.UserPresence
{
    public class UserPresenceServiceAsync : IUserPresenceServiceAsync
    {
        private readonly IUnitOfWork _unitOfWork;

        public UserPresenceServiceAsync(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task UpdateLastActiveAsync(Guid userId)
        {
            await _unitOfWork.CreateTransaction();
            try
            {
                var user = await _unitOfWork.GetRepository<IUserRepositoryAsync>()
                    .FindAsync(userId);

                if (user == null)
                {
                    await _unitOfWork.RollBackTransaction();
                    return;
                }

                user.LastActive = DateTime.UtcNow;
                await _unitOfWork.GetRepository<IUserRepositoryAsync>().Update(user);
                await _unitOfWork.CommitTransaction();
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollBackTransaction();
            }
        }
    }
}
