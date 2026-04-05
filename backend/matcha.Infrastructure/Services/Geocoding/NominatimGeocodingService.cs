using matcha.Application.Interfaces.Services;
using Microsoft.Extensions.Caching.Memory;
using System.Net.Http.Json;

namespace matcha.Infrastructure.Services.Geocoding
{
    internal sealed class NominatimGeocodingService : IGeocodingService
    {
        private readonly HttpClient _httpClient;
        private readonly IMemoryCache _cache;

        public NominatimGeocodingService(HttpClient httpClient, IMemoryCache cache)
        {
            _httpClient = httpClient;
            _cache = cache;
        }

        public async Task<(double Latitude, double Longitude)?> GeocodeAsync(string query, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(query))
                return null;

            var normalized = query.Trim();
            var cacheKey = $"geo:nominatim:{normalized.ToLowerInvariant()}";

            if (_cache.TryGetValue<(double, double)?>(cacheKey, out var cached))
                return cached;

            var url = $"search?format=jsonv2&limit=1&q={Uri.EscapeDataString(normalized)}";
            var results = await _httpClient.GetFromJsonAsync<List<NominatimResult>>(url, cancellationToken);

            (double Latitude, double Longitude)? parsed = null;
            var first = results?.FirstOrDefault();
            if (first != null
                && double.TryParse(first.lat, System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out var lat)
                && double.TryParse(first.lon, System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out var lon))
            {
                parsed = (lat, lon);
            }

            _cache.Set(cacheKey, parsed, new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(7)
            });

            return parsed;
        }

        private sealed class NominatimResult
        {
            public string? lat { get; set; }
            public string? lon { get; set; }
        }
    }
}

