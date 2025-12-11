import { getConnection } from "../config/db.js";


const createStudent = async () => {
    let conn;
    try {
        conn = await getConnection();
        const createTableQuery = `
        CREATE TABLE IF NOT EXISTS students (
            student_id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(100) NOT NULL UNIQUE,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            user_name VARCHAR(100) NOT NULL UNIQUE,
            type ENUM('student', 'club_manager') DEFAULT 'student',
            faculty ENUM('CSIT', 'FOE', 'PharmaD', 'FIBH', 'BAS', 'ARCH', 'Art') DEFAULT 'CSIT',
            major VARCHAR(100) NOT NULL,
            level INT NOT NULL,
            picture VARCHAR(255),
            phone VARCHAR(15),
            is_active BOOLEAN DEFAULT TRUE,
            in_dorms BOOLEAN DEFAULT FALSE,
            password VARCHAR(255) NOT NULL
        )`;
        await conn.query(createTableQuery);
        console.log("Students table created or already exists.");
    } catch (err) {
        console.error("Error creating students table:", err);
    } finally {
        if (conn) conn.end();
        process.exit();
    }
}

createStudent();