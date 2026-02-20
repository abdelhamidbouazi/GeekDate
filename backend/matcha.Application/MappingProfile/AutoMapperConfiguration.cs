using AutoMapper;
using matcha.Application.Dtos.InterestDtos;
using matcha.Application.Dtos.Profile;
using matcha.Application.Dtos.UserInterestsDtos;
using matcha.Application.Dtos.Users;
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
            CreateMap<Interest, InterestDto>().ReverseMap();
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
            CreateMap<AppUser, ConnectedUserProfileDto>().ForMember(x => x.Pictures, t => t.MapFrom(y => y.Photos));
            // CreateMap<BasicUserProfileDto, AppUser>()
            //.ForMember(dest => dest.Photos, opt => opt.Ignore())
            //.ForMember(dest => dest.DateOfBirth, opt => opt.MapFrom(src => DateOnly.FromDateTime(src.DateOfBirth)))
            //.ReverseMap()
            //.ForMember(dest => dest.DateOfBirth, opt => opt.MapFrom(src => src.DateOfBirth));
            CreateMap<BasicUserProfileDto, AppUser>()
                  .ForMember(dest => dest.Photos, opt => opt.Ignore())
                  .ReverseMap();
            CreateMap<UpdateUserProfileDto, AppUser>().ReverseMap();
            CreateMap<UpdateUserProfileDto, UserProfileDto>().ReverseMap();
            CreateMap<UpdatedUserProfileDto, AppUser>().ReverseMap();
            CreateMap<BasicUserProfileDto, UpdateUserProfileDto>().ReverseMap();
            CreateMap<UpdateUserProfileDto, AppUser>().ReverseMap();
            CreateMap<PreferencesAndInterestsDto, AppUser>().ReverseMap();
            CreateMap<UpdateUserProfileDto, AppUser>();
            CreateMap<UpdateUserProfileDto, BasicUserProfileDto>();

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
