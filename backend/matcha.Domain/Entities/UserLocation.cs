namespace matcha.Domain.Entities
{
    public class UserLocation : EntityBase
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public bool Manual { get; set; } = false;
    }
}
