import { afterEach } from '@jest/globals';

afterEach(async () => {
    if (process.env.SKIP_DB_SETUP === '1') return;
    const { getConnection } = await import('../../src/config/db.js');
    const { ALL_TABLES } = await import('../../src/scripts/createTables.js');
    let conn;
    try {
        conn = await getConnection();
        await conn.query('SET FOREIGN_KEY_CHECKS=0');
        for (const table of ALL_TABLES) {
            await conn.query(`TRUNCATE TABLE \`${table}\``);
        }
        await conn.query('SET FOREIGN_KEY_CHECKS=1');
    } finally {
        if (conn) await conn.release();
    }
});
