import { getConnection } from "../config/db.js";
import bcrypt from 'bcryptjs';

export const createTestAdminUser = async() => {
    let connection;
    let pass = await bcrypt.hash('admin123', 10);
    try {
        connection = await getConnection();
        const query = ([
            `
            INSERT INTO users 
                (first_name, last_name, user_name, email, password, role) 
            VALUES 
                ('Test', 'Admin', 'testAdmin1', 'test1@ejust.edu.eg', '${pass}', 'admin');
            `,
            `
            INSERT INTO user_type
                (email, type)
            VALUES
                ('test1@ejust.edu.eg', 'admin');
            `]);

        for (const q of query) {
            await connection.query(q);
            console.log('a query was successfully done .');
        }
    }catch (err) {
        console.error('Error creating test admin user:', err);
        throw err;
    }
    finally {
        if (connection) connection.end();
        process.exit();
    }
};

// fetch the user using the email to check if already exists
export const checkIfUserExists = async (email) => {
    let connection;
    try {
        connection = await getConnection();
        const [rows] = await connection.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows.length > 0;
    } catch (error) {
        console.error('Error checking user existence:', error);
        throw error;
    } finally {
        if (connection) connection.end();
    }
};

await createTestAdminUser();
// console.log(await checkIfUserExists('test1@ejust.edu.eg'));