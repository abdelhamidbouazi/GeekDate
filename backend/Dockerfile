# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files and restore dependencies
COPY ["matcha.API/matcha.API.csproj", "matcha.API/"]
COPY ["matcha.DomainServices/matcha.DomainServices.csproj", "matcha.DomainServices/"]
COPY ["matcha.Application/matcha.Application.csproj", "matcha.Application/"]
COPY ["matcha.Infrastructure/matcha.Infrastructure.csproj", "matcha.Infrastructure/"]
COPY ["matcha.Domain/matcha.Domain.csproj", "matcha.Domain/"]
COPY ["matcha.Shared/matcha.Shared.csproj", "matcha.Shared/"]

# Restore all project dependencies
RUN dotnet restore "matcha.API/matcha.API.csproj"

# Copy the rest of the application files
COPY . .

# Set the working directory to match the API project
WORKDIR "/src/matcha.API"

# Build the API project
RUN dotnet build "matcha.API.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "matcha.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy the published files to the final image
COPY --from=publish /app/publish .

# Set the entry point for the container
ENTRYPOINT ["dotnet", "matcha.API.dll"]

