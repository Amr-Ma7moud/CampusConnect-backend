# CampusConnect Backend

Node.js + Express.js backend for CampusConnect: a campus engagement platform with authentication, events, rooms, facilities, clubs, posts, and reporting workflows.

## Tech Stack
- Node.js, Express.js
- MariaDB/MySQL (via `mariadb` driver)
- JWT authentication middleware
- Docker-friendly environment variables (see below)

## Prerequisites
- Node.js 18+ recommended
- MariaDB/MySQL instance
- `.env` file with DB credentials (copied from `.env.example` if you have one)

Required environment variables:

```
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
JWT_EXPIRES_IN=7d
```

## Installation

```sh
npm i
# or 
bun i
```

## Database Setup

Run the table creation script (executes statements sequentially):

```sh
node src/scripts/createTables.js
```

Details are in `docs/createTables.md`.

## Running the Server

```sh
npm start
# or 
bun run dev
```

By default the server listens on the port defined in your environment or port 3000 if no port defined the .env (check `src/server.js`).

## Project Structure
```
src/
	server.js             # Express app bootstrap
	config/db.js          # MariaDB pool setup
	controllers/          # Route handlers
	middlewares/          # Auth middleware, etc.
	repositories/         # Data access layer
	routes/               # Express routers
	services/             # Business logic
	scripts/createTables.js# DB schema creation
	utils/log.js          # Logging helper
docs/
	createTables.md       # Table creation script notes
```

## Development Notes
- Table creation is dependency-safe; FK parents are created before children.
- Junction/report tables use composite primary keys to prevent duplicates.
- Adjust `ssl` settings in `src/config/db.js` if your DB does not require TLS.
- Add more logging or request validation as needed for your deployment.

## Testing
(Add your testing commands here, e.g., `npm test`), and ensure DB-dependent tests have a test database configured.

## Contributing
- Fork this repository to your GitHub account.
- Create a topic branch from `main`: `git checkout -b feature/your-topic`.
- Make focused changes; include tests and docs where relevant.
- Run format/lint/test before opening a PR (add exact commands once defined).
- Push your branch and open a Pull Request to `main` with:
	- What changed and why
	- Any schema/API updates (and updated docs)
	- Impact/risk and how to validate
	- Screenshots or sample requests if applicable

### Code style / expectations
- Keep DB migrations/schema changes reflected in `docs/createTables.md` (and any API docs).
- Prefer small, reviewable PRs over large ones.
- Add or update tests for new behavior.
- Avoid breaking changes unless coordinated; call out breaking changes clearly in the PR.

## Reporting Issues / Ideas
- File an issue with steps to reproduce, expected vs. actual behavior, and logs if available.
- For feature ideas, outline the use-case and any API/schema impacts.

## Community & Support
- Use the issue tracker for bugs and questions.
- If you’re adding endpoints or tables, update `docs/createTables.md` and any API docs you maintain.

## License
MIT
