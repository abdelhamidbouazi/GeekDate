# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY ["matcha.API/matcha.API.csproj", "matcha.API/"]
COPY ["matcha.Application/matcha.Application.csproj", "matcha.Application/"]
COPY ["matcha.Domain/matcha.Domain.csproj", "matcha.Domain/"]
COPY ["matcha.DomainServices/matcha.DomainServices.csproj", "matcha.DomainServices/"]
COPY ["matcha.Infrastructure/matcha.Infrastructure.csproj", "matcha.Infrastructure/"]
COPY ["matcha.Shared/matcha.Shared.csproj", "matcha.Shared/"]

RUN dotnet restore "matcha.API/matcha.API.csproj"

COPY . .
RUN dotnet publish "matcha.API/matcha.API.csproj" \
    -c "$BUILD_CONFIGURATION" \
    -o /app/publish \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_HTTP_PORTS=8080 \
    ASPNETCORE_URLS=http://+:8080 \
    DOTNET_RUNNING_IN_CONTAINER=true

EXPOSE 8080

COPY --from=build /app/publish .

USER app
ENTRYPOINT ["dotnet", "matcha.API.dll"]
