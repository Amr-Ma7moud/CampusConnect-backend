import { getLogs } from './src/controllers/admin.controller.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOGS_FILE_PATH = path.join(__dirname, 'logs.json');

const testLogsEndpoint = async () => {
    console.log('Starting logs endpoint test...');

    // Mock req and res
    const req = {};
    const res = {
        status: (code) => {
            console.log(`Response Status: ${code}`);
            return res;
        },
        json: (data) => {
            console.log('Response Data:');
            console.log(JSON.stringify(data, null, 2));
            return res;
        }
    };

    // Ensure logs.json exists with some data
    if (!fs.existsSync(LOGS_FILE_PATH)) {
        const sampleLogs = [
            {
                ip_address: "127.0.0.1",
                user_type: "test",
                record_id: 1,
                edited_table: "test_table",
                action: "test_action",
                changed_by: "tester",
                time: new Date().toISOString()
            }
        ];
        fs.writeFileSync(LOGS_FILE_PATH, JSON.stringify(sampleLogs, null, 2));
        console.log('Created sample logs.json');
    }

    await getLogs(req, res);
};

testLogsEndpoint();
