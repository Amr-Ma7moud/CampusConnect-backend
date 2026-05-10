import { describe, test, expect, beforeEach, afterAll } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOGS_PATH = path.resolve(__dirname, '../../../logs.json');

const { saveLog } = await import('../../../src/utils/logs.js');

const sampleEntry = (id = 1) => ({
    ip_address: '127.0.0.1',
    user_type: 'admin',
    record_id: id,
    edited_table: 'users',
    action: 'create',
    changed_by: 'tester',
});

const readLogs = () => JSON.parse(fs.readFileSync(LOGS_PATH, 'utf-8'));

describe('saveLog', () => {
    let backup = null;

    beforeEach(() => {
        if (fs.existsSync(LOGS_PATH)) {
            backup = fs.readFileSync(LOGS_PATH, 'utf-8');
        } else {
            backup = null;
        }
        if (fs.existsSync(LOGS_PATH)) fs.unlinkSync(LOGS_PATH);
    });

    afterAll(() => {
        if (backup !== null) fs.writeFileSync(LOGS_PATH, backup, 'utf-8');
        else if (fs.existsSync(LOGS_PATH)) fs.unlinkSync(LOGS_PATH);
    });

    test('creates the file and writes one entry', async () => {
        await saveLog(sampleEntry(1));
        const logs = readLogs();
        expect(logs).toHaveLength(1);
        expect(logs[0]).toMatchObject({ record_id: 1, edited_table: 'users' });
        expect(logs[0].time).toEqual(expect.any(String));
    });

    test('appends subsequent entries', async () => {
        await saveLog(sampleEntry(1));
        await saveLog(sampleEntry(2));
        const logs = readLogs();
        expect(logs).toHaveLength(2);
        expect(logs.map(l => l.record_id)).toEqual([1, 2]);
    });

    test('recovers from malformed JSON by resetting the file', async () => {
        fs.writeFileSync(LOGS_PATH, '{not json', 'utf-8');
        await saveLog(sampleEntry(7));
        const logs = readLogs();
        expect(logs).toHaveLength(1);
    });

    test('resets to array when file content is a non-array JSON', async () => {
        fs.writeFileSync(LOGS_PATH, '{"x":1}', 'utf-8');
        await saveLog(sampleEntry(8));
        const logs = readLogs();
        expect(Array.isArray(logs)).toBe(true);
        expect(logs).toHaveLength(1);
    });
});
