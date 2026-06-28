using sparkdates.API.Authentication;
using sparkdates.Application.ExceptionHandlerMiddleware;
using sparkdates.Application.Extensions;
using sparkdates.Application.Interfaces.Services.Authentication;
using sparkdates.Application.MappingProfile;
using sparkdates.DomainServices.Extensions;
using sparkdates.Infrastructure.Extensions;
using sparkdates.Infrastructure.Hubs;
using sparkdates.Infrastructure.Seeding;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Models;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);
var nextPublicApiUrl = builder.Configuration["NEXT_PUBLIC_API_URL"];
var nextPublicApiOrigin = Uri.TryCreate(nextPublicApiUrl, UriKind.Absolute, out var nextPublicApiUri)
    ? nextPublicApiUri.GetLeftPart(UriPartial.Authority)
    : null;
string? NormalizeOrigin(string? origin)
{
    if (string.IsNullOrWhiteSpace(origin))
        return null;

    var trimmed = origin.Trim();
    if (Uri.TryCreate(trimmed, UriKind.Absolute, out var uri))
        return uri.GetLeftPart(UriPartial.Authority);

    return trimmed.Replace(":///", "://", StringComparison.Ordinal);
}

var allowedOrigins = new[]
{
    NormalizeOrigin("http://localhost:3000"),
    NormalizeOrigin("http://localhost:3001"),
    NormalizeOrigin("http://localhost:3006"),
    NormalizeOrigin("http://10.32.114.107:3006"),
    NormalizeOrigin("https://sparkdates-dating.vercel.app"),
    nextPublicApiOrigin,
    NormalizeOrigin(builder.Configuration["AppSettings:FrontUri"])
}
.Where(origin => !string.IsNullOrWhiteSpace(origin))
.Distinct()
.ToArray();

// Add services to the container.
builder.Services.AddDbContextRegistration(builder.Configuration);
builder.Services.AddAutoMapper(typeof(AutoMapperConfiguration));

//builder.Services.AddDbContextRegistration(builder.Configuration);
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddApplicationRepositories(builder.Configuration);
builder.Services.AddDomainServices(builder.Configuration);
builder.Services.AddApplicationExtensions(builder.Configuration);
builder.Services.AddEmailService(builder.Configuration);
builder.Services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
            });
builder.Services.AddScoped<IAuthenticatedUser, AuthenticatedUser>();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    var jwtSecurityScheme = new OpenApiSecurityScheme
    {
        BearerFormat = "JWT",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = JwtBearerDefaults.AuthenticationScheme,
        Description = "Enter your JWT access token",
        Reference = new OpenApiReference
        {
            Id = JwtBearerDefaults.AuthenticationScheme,
            Type = ReferenceType.SecurityScheme
        }
    };

    options.AddSecurityDefinition("Bearer", jwtSecurityScheme);
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { jwtSecurityScheme, Array.Empty<string>()}
    });
});

builder.Services.AddTransient<ExceptionHandlerMiddleware>();

builder.Services.AddJwtAuthentication(builder.Configuration);

builder.Services.AddHttpContextAccessor();

builder.Services.AddSignalR()
    .AddJsonProtocol(options =>
    {
        options.PayloadSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseSwagger();
app.UseSwaggerUI();

app.UseMiddleware<ExceptionHandlerMiddleware>();

app.ApplyMigration();

app.UseCors(builder => builder.AllowAnyHeader()
     .AllowAnyMethod()
     .AllowCredentials()
     .WithOrigins(allowedOrigins!));


app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();


app.MapControllers();

app.MapHub<ChatHub>("/chatHub");

using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<Seed>();
    await seeder.SeedAsync();
}

app.Run();
