using sparkdates.Domain.Common.Enums;

namespace sparkdates.Application.Dtos.Users
{
    public class PersonalDetailsDto
    {
        public DateTime DateOfBirth { get; set; }
        public Gender Gender { get; set; }
        public List<Guid> PhotosIds { get; set; }
    }
}
