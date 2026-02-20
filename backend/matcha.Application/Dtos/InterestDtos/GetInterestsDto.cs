using matcha.Application.Dtos.Users;
using System;


namespace matcha.Application.Dtos.InterestDtos
{
    public class GetInterestsDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public List<UsersProfileDto> Users { get; set; }
    }
}
