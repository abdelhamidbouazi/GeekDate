using sparkdates.Application.Dtos.Users;

namespace sparkdates.Application.Dtos.InterestDtos
{
    public class GetInterestDto
    {
        public string Name { get; set; }
        public List<UsersProfileDto> Users { get; set; }
    }
}
