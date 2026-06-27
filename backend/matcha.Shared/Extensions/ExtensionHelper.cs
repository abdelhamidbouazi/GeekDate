namespace sparkdates.Shared.Extensions
{
    public static class ExtensionHelper
    {
        public static bool IsNumber(this string value) => double.TryParse(value, out var result);
        public static bool IsNullOrEmpty(this string value) => string.IsNullOrEmpty(value);
        public static int ToInt(this string value) => int.Parse(value);
    }
}
