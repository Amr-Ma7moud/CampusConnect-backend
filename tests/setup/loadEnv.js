import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env.test');

dotenv.config({ path: envPath });

if (!process.env.DB_NAME || !process.env.DB_NAME.endsWith('_test')) {
    throw new Error(
        `Refusing to run tests: DB_NAME must end with "_test" but is "${process.env.DB_NAME}". ` +
        `Check ${envPath}.`
    );
}
