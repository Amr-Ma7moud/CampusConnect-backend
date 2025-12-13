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

createTestAdminUser();