using Microsoft.Data.SqlClient;

namespace matcha.Application.Helper
{
    public interface ICondition
    {
        string Clause { get; }
        SqlParameter[] Parameters { get; }
    }
}