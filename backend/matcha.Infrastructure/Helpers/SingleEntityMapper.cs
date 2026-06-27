using Microsoft.Data.SqlClient;
using System.Reflection;

namespace sparkdates.Infrastructure.Helpers
{
    public class SingleEntityMapper
    {
        public static T MapSingleWitoutExecutingReader<T>(SqlDataReader reader)
        {
            var instance = Activator.CreateInstance<T>();
            var props = typeof(T).GetProperties().ToArray();
            var nullableCheck = new NullabilityInfoContext();
            //while (await reader.ReadAsync())
            //{
            bool isAllFieldsNullable = true;
            foreach (var prop in props)
            {
                if (reader.GetColumnSchema().Any(x => x.ColumnName.ToLower() == prop.Name.ToLower()))
                {
                    var value = reader[prop.Name];
                    if (value != DBNull.Value)
                    {
                        var propertyInfo = instance.GetType().GetProperty(prop.Name, System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);
                        if (propertyInfo != null && propertyInfo.CanWrite)
                        {
                            var targetType = Nullable.GetUnderlyingType(propertyInfo.PropertyType) ?? propertyInfo.PropertyType;
                            if (targetType.IsEnum)
                                value = Enum.ToObject(targetType, value);
                            propertyInfo.SetValue(instance, value);
                        }
                        isAllFieldsNullable = false;
                    }
                    else
                    {
                        continue;
                        var propNullable = nullableCheck.Create(prop);
                        if (propNullable.ReadState == NullabilityState.Nullable)
                            value = null;
                        else if (prop.PropertyType == typeof(string))
                            value = string.Empty;
                        else if (prop.PropertyType == typeof(bool))
                            value = false;
                        else if (prop.PropertyType == typeof(int) || prop.PropertyType == typeof(long) || prop.PropertyType == typeof(float) || prop.PropertyType == typeof(double) || prop.PropertyType == typeof(decimal))
                            value = 0;
                        prop.SetValue(instance, value);
                    }
                }
            }
            if (isAllFieldsNullable) return default(T);
            //}
            return instance;
        }

        public static T MapSingleWitoutExecutingReader<T>(SqlDataReader reader, bool isJoin)
        {
            var instance = Activator.CreateInstance<T>();
            var props = typeof(T).GetProperties().ToArray();
            var nullableCheck = new NullabilityInfoContext();
            //while (await reader.ReadAsync())
            //{
            bool isAllFieldsNullable = true;
            var schema = reader.GetColumnSchema();
            foreach (var prop in props)
            {
                if (prop.Name.ToLower() == "id" && schema.Any(x => x.ColumnName.ToLower() == (typeof(T).Name + "Id").ToLower()))
                {
                    var value = reader[typeof(T).Name + "Id"];
                    if (value != DBNull.Value)
                    {
                        var propertyInfo = instance.GetType().GetProperty(prop.Name, System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);
                        if (propertyInfo != null && propertyInfo.CanWrite)
                        {
                            propertyInfo.SetValue(instance, value);
                        }
                        isAllFieldsNullable = false;
                    }
                    continue;
                }
                if (schema.Any(x => x.ColumnName.ToLower() == prop.Name.ToLower()))
                {
                    var value = reader[prop.Name];
                    if (value != DBNull.Value)
                    {
                        var propertyInfo = instance.GetType().GetProperty(prop.Name, System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);
                        if (propertyInfo != null && propertyInfo.CanWrite)
                        {
                            var targetType = Nullable.GetUnderlyingType(propertyInfo.PropertyType) ?? propertyInfo.PropertyType;
                            if (targetType.IsEnum)
                                value = Enum.ToObject(targetType, value);
                            propertyInfo.SetValue(instance, value);
                        }
                        isAllFieldsNullable = false;
                    }
                    else
                    {
                        continue;
                        var propNullable = nullableCheck.Create(prop);
                        if (propNullable.ReadState == NullabilityState.Nullable)
                            value = null;
                        else if (prop.PropertyType == typeof(string))
                            value = string.Empty;
                        else if (prop.PropertyType == typeof(bool))
                            value = false;
                        else if (prop.PropertyType == typeof(int) || prop.PropertyType == typeof(long) || prop.PropertyType == typeof(float) || prop.PropertyType == typeof(double) || prop.PropertyType == typeof(decimal))
                            value = 0;
                        prop.SetValue(instance, value);
                    }
                }
            }
            if (isAllFieldsNullable) return default(T);
            //}
            return instance;
        }

        public static async Task<T> MapSingle<T>(SqlDataReader reader)
        {
            T instance = default;
            while (await reader.ReadAsync())
                instance = MapSingleWitoutExecutingReader<T>(reader);
            return instance;
        }
    }
}
