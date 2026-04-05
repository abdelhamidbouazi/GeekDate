namespace matcha.Application.Interfaces.Services
{
    public interface IGeocodingService
    {
        /// <summary>
        /// Resolve a free-form place query (e.g. "Rabat, Morocco") into coordinates.
        /// Returns null when no result is found.
        /// </summary>
        Task<(double Latitude, double Longitude)?> GeocodeAsync(string query, CancellationToken cancellationToken = default);
    }
}

