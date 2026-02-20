using System.ComponentModel.DataAnnotations.Schema;

namespace matcha.Domain.Entities
{
    [Table("Matches")]
    public class Match : EntityBase
    {
        public Guid User1Id { get; set; }
        public Guid User2Id { get; set; }
        public DateTime MatchedAt { get; set; }
    }
}
