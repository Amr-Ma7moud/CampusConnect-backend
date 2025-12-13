// import { connection } from "mongoose";
import { getConnection } from "../config/db.js";

export const createTestAdminUser = async() => {
    let connection;
    try {
        connection = await getConnection();
        const query = ([
            `
            INSERT INTO users 
                (first_name, last_name, user_name, email, password, role) 
            VALUES 
                ('Test', 'Admin', 'testAdmin1', 'test1@ejust.edu.eg', 'admin123', 'admin');
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
        throw err;
    }
    finally {
        if (connection) connection.end();
        process.exit();
    }
};

createTestAdminUser();