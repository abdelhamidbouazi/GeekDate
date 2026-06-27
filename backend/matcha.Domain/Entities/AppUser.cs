using sparkdates.Domain.Common.Enums;

namespace sparkdates.Domain.Entities
{
    public class AppUser : EntityBase
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public byte[] PasswordHash { get; set; }
        public byte[] PasswordSalt { get; set; }
        public Gender Gender { get; set; } = Gender.Unknown;
        public DateTime? DateOfBirth { get; set; }
        public string Biography { get; set; }
        public RelationshipGoals LookingFor { get; set; } = RelationshipGoals.Unknown;
        public SexualPreferences PreferredGender { get; set; } = SexualPreferences.None;
        public ICollection<UserInterest> Interests { get; set; }
        public string City { get; set; }
        public string Country { get; set; }
        public ICollection<Photo> Photos { get; set; } = [];
        public ICollection<UserLike> UserLikes { get; set; }
        public ICollection<UserBlock> UserBlocks { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastActive { get; set; } = DateTime.UtcNow;
        public bool EmailConfirmed { get; set; } = false;
        public virtual ICollection<ConfirmEmailToken> ConfirmEmailTokens { get; set; }
        public bool HasLoggedIn { get; set; } = false;
        public bool IsBasicInfoComplete { get; set; } = false;
        public bool IsPreferencesComplete { get; set; } = false;
        public bool IsProfileCompleted { get; set; } = false;
        public ICollection<UserTag> Tags { get; set; }
        public int FameRating { get; set; } = 0;
        public double Latitude { get; set; } = 0;
        public double Longitude { get; set; } = 0;
        public string PhotoProfileUrl { get; set; }
    }
}
