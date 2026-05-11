export default async function globalTeardown() {
    if (process.env.SKIP_DB_SETUP === '1') return;
    const { closePool } = await import('../../src/config/db.js');
    await closePool();
}
