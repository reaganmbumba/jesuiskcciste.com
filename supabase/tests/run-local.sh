#!/usr/bin/env bash
# Exécute les migrations et les tests de sécurité sur un PostgreSQL local (≥ 15).
# Usage : PGHOST=... PGPORT=... PGUSER=postgres ./supabase/tests/run-local.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
DB=${KCC_TEST_DB:-kcc_test}
psql -v ON_ERROR_STOP=1 -q -c "drop database if exists $DB" -c "create database $DB"
for f in supabase/tests/00_local_supabase_stub.sql supabase/migrations/*.sql supabase/seed.sql supabase/tests/10_rls_tests.sql; do
  echo "→ $f"
  psql -v ON_ERROR_STOP=1 -q -d "$DB" -f "$f"
done
