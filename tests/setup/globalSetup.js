import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mariaDB from 'mariadb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function globalSetup() {
    dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

    if (process.env.SKIP_DB_SETUP === '1') {
        console.log('[globalSetup] SKIP_DB_SETUP=1 — skipping database bootstrap.');
        return;
    }

    const dbName = process.env.DB_NAME;
    if (!dbName || !dbName.endsWith('_test')) {
        throw new Error(`Refusing to run: DB_NAME must end with "_test" (got "${dbName}")`);
    }

    const adminConn = await mariaDB.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        connectTimeout: 10000,
        multipleStatements: true,
    });

    try {
        await adminConn.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
        await adminConn.query(`CREATE DATABASE \`${dbName}\``);
        await adminConn.query(`USE \`${dbName}\``);

        const { buildTableQueries } = await import('../../src/scripts/createTables.js');
        const queries = buildTableQueries(dbName);
        // Skip DROP/CREATE/USE prefix queries — we've already done them
        for (const q of queries) {
            const trimmed = q.trim().toUpperCase();
            if (trimmed.startsWith('DROP DATABASE') ||
                trimmed.startsWith('CREATE DATABASE') ||
                trimmed.startsWith('USE ')) {
                continue;
            }
            await adminConn.query(q);
        }

        console.log(`[globalSetup] Test database "${dbName}" ready.`);
    } finally {
        await adminConn.end();
    }
}
