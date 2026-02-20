namespace matcha.Domain.Entities
{
    public class Interest : EntityBase
    {
        public string Name { get; set; }
        public List<UserInterest> Users { get; set; }
    }
}
