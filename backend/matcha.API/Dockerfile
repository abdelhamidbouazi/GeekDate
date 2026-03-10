#See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER app
WORKDIR /app
EXPOSE 3000
EXPOSE 3001

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy all project files
COPY ["matcha.API/matcha.API.csproj", "matcha.API/"]
COPY ["matcha.DomainServices/matcha.DomainServices.csproj", "matcha.DomainServices/"]
COPY ["matcha. Application/matcha.Application.csproj", "matcha.Application/"]
COPY ["matcha.Domain/matcha.Domain. csproj", "matcha. Domain/"]
COPY ["matcha.Infrastructure/matcha.Infrastructure.csproj", "matcha.Infrastructure/"]
COPY ["matcha.Shared/matcha.Shared.csproj", "matcha.Shared/"]
COPY ["matcha.persistence/matcha.persistence.csproj", "matcha.persistence/"]

# Restore dependencies
RUN dotnet restore "./matcha.API/matcha. API.csproj"

# Copy the rest of the source code
COPY .  .

# Build the project
WORKDIR "/src/matcha.API"
RUN dotnet build "./matcha.API.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./matcha.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "matcha.API.dll"]