using Microsoft.Data.SqlClient;

namespace matcha.Application.Helper
{
    public class Condition : ICondition
    {
        public string Clause { get; }
        public SqlParameter[] Parameters { get; }

        public Condition(string clause, params SqlParameter[] parameters)
        {
            Clause = clause;
            Parameters = parameters;
        }

        public static Condition operator &(Condition left, Condition right)
        {
            return new Condition($"({left.Clause} AND {right.Clause})", left.Parameters.Concat(right.Parameters).ToArray());
        }

        public static Condition operator |(Condition left, Condition right)
        {
            return new Condition($"({left.Clause} OR {right.Clause})", left.Parameters.Concat(right.Parameters).ToArray());
        }
    }
}
