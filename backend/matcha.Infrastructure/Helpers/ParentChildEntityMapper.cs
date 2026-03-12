using Microsoft.Data.SqlClient;

namespace matcha.Infrastructure.Helpers
{
    public class ParentChildEntityMapper<TParent, TChild, TKey>
    {
        private readonly bool isJoin;

        private Func<SqlDataReader, TParent> MapParent { get; set; }
        private Func<SqlDataReader, TChild> MapChild { get; set; }
        public Func<TParent, TKey> MapKey { get; set; }
        public Action<TParent, TChild> MapChildToParent { get; set; }
        public ParentChildEntityMapper(SqlDataReader reader, bool isJoin = true)
        {
            MapParent = (reader) => SingleEntityMapper.MapSingleWitoutExecutingReader<TParent>(reader, isJoin);
            MapChild = (reader) => SingleEntityMapper.MapSingleWitoutExecutingReader<TChild>(reader, isJoin);
            this.isJoin = isJoin;
        }

        public async Task<IReadOnlyList<TParent>> MapParentsWithChilds(SqlDataReader reader)
        {
            Dictionary<TKey, TParent> dict = new Dictionary<TKey, TParent>();

            while (await reader.ReadAsync())
            {
                var parent = MapParent(reader);
                var key = MapKey(parent);
                var child = MapChild(reader);
                if (dict.TryGetValue(key, out var existingParent))
                    MapChildToParent(existingParent, child);
                else
                {
                    dict.Add(key, parent);
                    MapChildToParent(parent, child);
                }
            }
            return dict.Values.ToList();
        }
        public async Task<TParent> MapParentWithChilds(SqlDataReader reader)
        {
            Dictionary<TKey, TParent> dict = new Dictionary<TKey, TParent>();

            while (await reader.ReadAsync())
            {
                var parent = MapParent(reader);
                var key = MapKey(parent);
                var child = MapChild(reader);
                if (dict.TryGetValue(key, out var existingParent))
                    MapChildToParent(existingParent, child);
                else
                {
                    dict.Add(key, parent);
                    MapChildToParent(parent, child);
                }
            }
            return dict.Values.FirstOrDefault();
        }

    }
}
