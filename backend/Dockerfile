# Use the .NET 8.0 SDK image for building the project
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy all .csproj files and restore dependencies for all projects
COPY ["matcha.API/matcha.API.csproj", "matcha.API/"]
COPY ["matcha.DomainServices/matcha.DomainServices.csproj", "matcha.DomainServices/"]
COPY ["matcha.Application/matcha.Application.csproj", "matcha.Application/"]
COPY ["matcha.Infrastructure/matcha.Infrastructure.csproj", "matcha.Infrastructure/"]
COPY ["matcha.Domain/matcha.Domain.csproj", "matcha.Domain/"]
COPY ["matcha.Shared/matcha.Shared.csproj", "matcha.Shared/"]

# Restore all project dependencies
RUN dotnet restore "./matcha.API/matcha.API.csproj"

# Copy the rest of the application files
COPY . .

# Set the working directory to match the API project
WORKDIR "/src/matcha.API"

# Build the API project
RUN dotnet build "./matcha.API.csproj" -c Release -o /app/build

# Publish the project in Release mode
FROM build AS publish
RUN dotnet publish "./matcha.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Use the .NET 8.0 ASP.NET image as the base image for runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080

# Copy the published files to the final image
COPY --from=publish /app/publish .

# Set the entry point for the container
ENTRYPOINT ["dotnet", "matcha.API.dll"]
