# Database Table Creation Script

This script (`src/scripts/createTables.js`) creates all database tables for CampusConnect in dependency-safe order without requiring the MariaDB/MySQL `multipleStatements` flag.

## What it does
- Opens a pooled MariaDB connection via `getConnection()`.
- Executes a list of `CREATE TABLE IF NOT EXISTS` statements sequentially to avoid multi-statement requirements.
- Orders table creation so foreign key references always point to tables that already exist.
- Adds composite primary keys to junction/report tables to prevent duplicate relationship rows.
- Closes the connection and exits the process when finished.

## Prerequisites
- MariaDB/MySQL reachable with credentials provided in environment variables:
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- Node.js runtime (the script is invoked with `node`).

## How to run
From the repo root:
```sh
node src/scripts/createTables.js
```
If connection succeeds, the script logs that tables were created or already exist.

## Table ordering (high level)
1) Core entities: `students`, `facilities`, `privileges`, `admins`, `rooms`, `resources`, `clubs`, `posts`, `events`
2) Linking/child tables that reference the above: `admin_privileges`, `room_has_resources`, `std_reserve_room`, `std_report_room`, `std_report_facility`, `std_reserve_facility`, `std_report_event`, `std_register_event`, `std_attend_event`, `std_like_post`, `std_comment_post`, `std_follow_club`, `std_report_club`, `club_manager`, `posts_for_event`

## Notes and defaults
- Junction/report tables use composite primary keys (e.g., `(student_id, room_id, start_time)` for `std_reserve_room`).
- `admins.role` defaults to `system_admin` (allowed enum values: `system_admin`, `sports_admin`, `events_and_rooms_admin`).
- Timestamps use `NOW()`/`CURRENT_TIMESTAMP` defaults where provided; adjust if you need timezone-specific handling.
- If you prefer single-column surrogate keys on comment/report tables, add an `AUTO_INCREMENT` column and keep a unique constraint on the existing composite key.

## Troubleshooting
- If you see a foreign key creation error, ensure the DB user has `REFERENCES`/`ALTER` permissions and that the database name matches `DB_NAME`.
- Connection issues: verify host/port/user/password and that SSL settings in `src/config/db.js` match your DB server.
- Reruns are safe because the script uses `CREATE TABLE IF NOT EXISTS` for all tables.
