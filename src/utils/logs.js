import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the path to the logs.json file in the project root
const LOGS_FILE_PATH = path.join(__dirname, '../../logs.json');

/**
 * Saves a log entry to the logs.json file.
 * 
 * @param {Object} logData - The data to log.
 * @param {string} logData.ip_address - The IP address of the user.
 * @param {string} logData.user_type - The type of user (e.g., admin, student).
 * @param {string|number} logData.record_id - The ID of the record being edited.
 * @param {string} logData.edited_table - The name of the table being edited.
 * @param {string} logData.action - The action performed (e.g., create, update, delete).
 * @param {string} logData.changed_by - The identifier of the user who made the change.
 * @param {string|Date} [logData.time] - The time of the action. Defaults to current time.
 * @returns {Promise<void>}
 */
export const saveLog = async ({ ip_address, user_type, record_id, edited_table, action, changed_by, time }) => {
    const newLog = {
        ip_address,
        user_type,
        record_id,
        edited_table,
        action,
        changed_by,
        time: time || new Date().toISOString()
    };

    try {
        let logs = [];

        // Check if file exists
        if (fs.existsSync(LOGS_FILE_PATH)) {
            const fileContent = await fs.promises.readFile(LOGS_FILE_PATH, 'utf-8');
            try {
                logs = JSON.parse(fileContent);
                if (!Array.isArray(logs)) {
                    logs = []; // Reset if not an array
                }
            } catch (parseError) {
                console.error('Error parsing logs.json, starting with empty array:', parseError);
                logs = [];
            }
        }

        logs.push(newLog);

        await fs.promises.writeFile(LOGS_FILE_PATH, JSON.stringify(logs, null, 2), 'utf-8');
        console.log('Log saved successfully.');
    } catch (error) {
        console.error('Error saving log:', error);
    }
};
