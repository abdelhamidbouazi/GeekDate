using AutoMapper;
using matcha.Application.Dtos.InterestDtos;
using matcha.Application.Dtos.Profile;
using matcha.Application.Dtos.UserInterestsDtos;
using matcha.Application.Dtos.Users;
using matcha.Application.Features.Profile.Commands.UpdateUserProfile;
using matcha.Domain.Entities;

namespace matcha.Application.MappingProfile
{
    public class AutoMapperConfiguration : Profile
    {
        public AutoMapperConfiguration()
        {
            #region Interests

            CreateMap<Interest, GetInterestsDto>().ReverseMap();
            CreateMap<Interest, GetInterestDto>().ReverseMap();
            CreateMap<Interest, CreateInterestDto>().ReverseMap();
            CreateMap<Interest, InterestDto>()
                .ReverseMap();
            CreateMap<UpdateInterestDto, Interest>().ReverseMap();

            #endregion

            #region UserInterest

            CreateMap<GetUserInterestDto, UserInterest>().ReverseMap();
            CreateMap<GetUserInterestsDto, UserInterest>().ReverseMap();
            CreateMap<UserInterest, GetUserInterestsFromUserProfile>()
                .ForMember(x => x.Name, map => map.MapFrom(d => d.Interest.Name));

            CreateMap<CreateUserInterestDto, UserInterest>().ReverseMap();
            CreateMap<UserInterest, UserInterestDto>().ReverseMap();

            CreateMap<UpdateUserInterestDto, UserInterest>().ReverseMap();
            CreateMap<UpdateUserInterestDto, UserInterestDto>().ReverseMap();

            #endregion


            #region Users
            CreateMap<CreateUserProfileDto, UserProfileDto>().ReverseMap();
            CreateMap<AppUser, UserProfileDto>();
            CreateMap<AppUser, ConnectedUserProfileDto>()
                .ForMember(x => x.Pictures, t => t.MapFrom(y => y.Photos));

            // ✅ BasicUserProfileDto -> AppUser (ONE WAY ONLY!)
            CreateMap<BasicUserProfileDto, AppUser>()
                .ForMember(dest => dest.Photos, opt => opt.Ignore())
                .ForMember(dest => dest.PhotoProfileUrl, opt => opt.Ignore())
                .ForSourceMember(src => src.Photos, opt => opt.DoNotValidate())
                .ForSourceMember(src => src.MainPicture, opt => opt.DoNotValidate());

            // ✅ UpdateUserProfileDto mappings (SANS DOUBLONS!)
            CreateMap<UpdateUserProfileDto, AppUser>();  // ← UN SEUL mapping, SANS ReverseMap!
            CreateMap<UpdateUserProfileDto, UserProfileDto>().ReverseMap();
            CreateMap<UpdatedUserProfileDto, AppUser>().ReverseMap();

            // ❌ SUPPRIMÉ COMPLÈTEMENT - crée des chaînes vers IFormFile
            // CreateMap<BasicUserProfileDto, UpdateUserProfileDto>().ReverseMap();

            // ✅ Si tu en as VRAIMENT besoin (je doute), crée ONE WAY:
            // CreateMap<BasicUserProfileDto, UpdateUserProfileDto>();

            CreateMap<UpdateUserProfileCommand, AppUser>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Photos, opt => opt.Ignore())
                .ForMember(dest => dest.PhotoProfileUrl, opt => opt.Ignore())
                .ForMember(dest => dest.Interests, opt => opt.Ignore())
                .ForMember(dest => dest.UserLikes, opt => opt.Ignore())
                .ForMember(dest => dest.UserBlocks, opt => opt.Ignore())
                .ForMember(dest => dest.Tags, opt => opt.Ignore())
                .ForMember(dest => dest.ConfirmEmailTokens, opt => opt.Ignore())
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.PasswordSalt, opt => opt.Ignore())
                .ForMember(dest => dest.PreferredGender, opt => opt.MapFrom(src => src.SexualPreferences));

            CreateMap<PreferencesAndInterestsDto, AppUser>().ReverseMap();

            // ❌ SUPPRIMÉ - doublon inutile
            // CreateMap<UpdateUserProfileDto, BasicUserProfileDto>();
            #endregion

            #region SearchPreferences
            CreateMap<SearchPreferencesDto, UserSearchPreference>().ReverseMap();
            #endregion

            #region Photo
            CreateMap<Photo, ImageDto>().ReverseMap();
            CreateMap<Photo, UserPhotoDto>().ReverseMap();
            #endregion

            #region CompleteProfile
            CreateMap<BasicUserProfileDto, AppUser>().ReverseMap();
            #endregion
        }

    }
}
