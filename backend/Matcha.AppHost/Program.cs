var builder = DistributedApplication.CreateBuilder(args);

var sqlPassword = builder.AddParameter("sql-password", "YourPassword123!", secret: true);

var sql = builder.AddSqlServer("sql", password: sqlPassword)
    .WithDataVolume()
    .WithLifetime(ContainerLifetime.Persistent);

var db = sql.AddDatabase("sparkdatesdb");

var api = builder.AddProject("sparkdates-api", "../sparkdates.API/sparkdates.API.csproj")
    .WithReference(db);

builder.Build().Run();

