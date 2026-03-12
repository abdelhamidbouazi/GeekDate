#!/usr/bin/env bash
# Restore database from Matcha Database Backup.bak.
# Run from project root. Requires sqlserver to be up (backend is mounted at /backup).
# Usage: MSSQL_SA_PASSWORD=xxx ./backend/scripts/restore-from-backup.sh

set -e

CONTAINER="${SQLSERVER_CONTAINER:-matcha-sqlserver}"
BACKUP_PATH="/backup/Matcha Database Backup.bak"

if [ -z "${MSSQL_SA_PASSWORD}" ]; then
  echo "Error: MSSQL_SA_PASSWORD must be set (e.g. from .env)"
  exit 1
fi

echo "Restoring database matchadb from backup..."
# Backup was created on Windows; redirect files to Linux container paths via MOVE
docker exec "$CONTAINER" /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -Q "
RESTORE DATABASE matchadb
FROM DISK = N'$BACKUP_PATH'
WITH REPLACE, STATS = 5,
  MOVE 'MatchaDbSql' TO '/var/opt/mssql/data/matchadb.mdf',
  MOVE 'MatchaDbSql_log' TO '/var/opt/mssql/data/matchadb_log.ldf'
" -b

echo "Restore complete."
