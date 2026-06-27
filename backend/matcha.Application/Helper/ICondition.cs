using Microsoft.Data.SqlClient;

namespace sparkdates.Application.Helper
{
    public interface ICondition
    {
        string Clause { get; }
        SqlParameter[] Parameters { get; }
    }
}