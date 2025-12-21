import { saveLog } from './src/utils/logs.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOGS_FILE_PATH = path.join(__dirname, 'logs.json');

const testLogging = async () => {
    console.log('Starting logging test...');

    // Clean up previous test run
    if (fs.existsSync(LOGS_FILE_PATH)) {
        fs.unlinkSync(LOGS_FILE_PATH);
        console.log('Cleaned up existing logs.json');
    }

    const logEntry1 = {
        ip_address: '127.0.0.1',
        user_type: 'admin',
        record_id: 101,
        edited_table: 'users',
        action: 'update',
        changed_by: 'admin_user'
    };

    const logEntry2 = {
        ip_address: '192.168.1.5',
        user_type: 'student',
        record_id: 'STU-2024',
        edited_table: 'courses',
        action: 'enroll',
        changed_by: 'student_user'
    };

    console.log('Saving log entry 1...');
    await saveLog(logEntry1);

    console.log('Saving log entry 2...');
    await saveLog(logEntry2);

    // Verify content
    if (fs.existsSync(LOGS_FILE_PATH)) {
        const content = fs.readFileSync(LOGS_FILE_PATH, 'utf-8');
        const logs = JSON.parse(content);

        console.log('Reading logs.json content:');
        console.log(JSON.stringify(logs, null, 2));

        if (logs.length === 2) {
            console.log('SUCCESS: Logs file contains 2 entries.');
        } else {
            console.error(`FAILURE: Expected 2 entries, found ${logs.length}.`);
        }
    } else {
        console.error('FAILURE: logs.json was not created.');
    }
};

testLogging();
