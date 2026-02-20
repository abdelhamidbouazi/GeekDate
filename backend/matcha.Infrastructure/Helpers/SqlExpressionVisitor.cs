using System.Linq.Expressions;

namespace matcha.Infrastructure.Helpers
{
    public class SqlExpressionVisitor<T> : ExpressionVisitor where T : class
    {
        private readonly System.Text.StringBuilder _sqlBuilder = new System.Text.StringBuilder();
        private readonly Dictionary<string, object> _parameters = new Dictionary<string, object>();
        private int _parameterCounter = 0;

        public string GetWhereClause(Expression<Func<T, bool>> expression)
        {
            _sqlBuilder.Clear();
            _parameters.Clear();
            _parameterCounter = 0;

            Visit(expression.Body); // Start visiting the expression tree
            return _sqlBuilder.ToString();
        }

        public Dictionary<string, object> GetParameters()
        {
            return _parameters;
        }

        protected override Expression VisitBinary(BinaryExpression node)
        {
            _sqlBuilder.Append("(");
            Visit(node.Left); // Visit the left side of the binary expression

            // Translate the operator
            switch (node.NodeType)
            {
                case ExpressionType.Equal:
                    _sqlBuilder.Append(" = ");
                    break;
                case ExpressionType.NotEqual:
                    _sqlBuilder.Append(" <> ");
                    break;
                case ExpressionType.GreaterThan:
                    _sqlBuilder.Append(" > ");
                    break;
                case ExpressionType.GreaterThanOrEqual:
                    _sqlBuilder.Append(" >= ");
                    break;
                case ExpressionType.LessThan:
                    _sqlBuilder.Append(" < ");
                    break;
                case ExpressionType.LessThanOrEqual:
                    _sqlBuilder.Append(" <= ");
                    break;
                case ExpressionType.AndAlso:
                    _sqlBuilder.Append(" AND ");
                    break;
                case ExpressionType.OrElse:
                    _sqlBuilder.Append(" OR ");
                    break;
                default:
                    throw new NotSupportedException($"Operator '{node.NodeType}' is not supported.");
            }

            Visit(node.Right); // Visit the right side of the binary expression
            _sqlBuilder.Append(")");

            return node;
        }

        protected override Expression VisitMethodCall(MethodCallExpression node)
        {
            // Handle the Contains method
            if (node.Method.Name == "Contains")
            {
                // Case 1: String.Contains ( e.Name.Contains("test"))
                if (node.Object != null && node.Object.Type == typeof(string))
                {
                    Visit(node.Object); // Visit the string property ( e.Name)
                    _sqlBuilder.Append(" LIKE ");

                    // Generate a parameter name ( @p0)
                    string parameterName = $"@p{_parameterCounter++}";

                    // Add the parameter value with wildcards
                    var value = ((ConstantExpression)node.Arguments[0]).Value.ToString();
                    _parameters[parameterName] = $"%{value}%";

                    // Use the parameter in the LIKE condition
                    _sqlBuilder.Append(parameterName);
                }
                // Case 2: List.Contains (list.Contains(e.Id))
                else if (node.Method.DeclaringType == typeof(Enumerable) && node.Arguments.Count == 2)
                {
                    Visit(node.Arguments[1]); // Visit the property ( e.Id)
                    _sqlBuilder.Append(" IN (");

                    // Generate parameter names for each item in the list
                    var list = (IEnumerable<int>)((ConstantExpression)node.Arguments[0]).Value;
                    var parameterNames = list.Select((_, index) =>
                    {
                        string parameterName = $"@p{_parameterCounter++}";
                        _parameters[parameterName] = list.ElementAt(index);
                        return parameterName;
                    }).ToArray();

                    _sqlBuilder.Append(string.Join(", ", parameterNames));
                    _sqlBuilder.Append(")");
                }
                else
                {
                    throw new NotSupportedException($"Contains method with parameters '{node.Method}' is not supported.");
                }
            }
            else
            {
                throw new NotSupportedException($"Method '{node.Method.Name}' is not supported.");
            }

            return node;
        }

        protected override Expression VisitMember(MemberExpression node)
        {
            if (node.Expression != null && node.Expression.NodeType == ExpressionType.Parameter)
            {
                _sqlBuilder.Append("[" + node.Member.Name + "]");
                return node;
            }

            var value = Expression.Lambda(node).Compile().DynamicInvoke();
            AddSqlParameter(value);
            return node;
        }
        private void AddSqlParameter(object value)
        {
            string paramName = "@p" + _parameterCounter++;
            _sqlBuilder.Append(paramName);
            _parameters.Add(paramName, value ?? DBNull.Value);
        }
        protected override Expression VisitConstant(ConstantExpression node)
        {
            // Generate a parameter name ( @p0, @p1, etc.)
            string parameterName = $"@p{_parameterCounter++}";

            // Add the parameter value to the dictionary
            _parameters[parameterName] = node.Value;

            // Replace the constant value with the parameter placeholder
            _sqlBuilder.Append(parameterName);

            return node;
        }
    }
}
