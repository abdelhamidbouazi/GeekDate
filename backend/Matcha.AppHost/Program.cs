var builder = DistributedApplication.CreateBuilder(args);

var sqlPassword = builder.AddParameter("sql-password", "YourPassword123!", secret: true);

var sql = builder.AddSqlServer("sql", password: sqlPassword)
    .WithDataVolume()
    .WithLifetime(ContainerLifetime.Persistent);

var db = sql.AddDatabase("matchadb");

var api = builder.AddProject("matcha-api", "../matcha.API/matcha.API.csproj")
    .WithReference(db);

builder.Build().Run();

