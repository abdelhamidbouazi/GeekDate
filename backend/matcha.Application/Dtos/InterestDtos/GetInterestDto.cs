using matcha.Application.Dtos.Users;

namespace matcha.Application.Dtos.InterestDtos
{
    public class GetInterestDto
    {
        public string Name { get; set; }
        public List<UsersProfileDto> Users { get; set; }
    }
}
