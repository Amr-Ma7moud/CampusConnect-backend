import { getConnection } from "../config/db.js";


const createStudent = async () => {
    let conn;
    try {
        conn = await getConnection();
        const createTablesQueries = [
            `CREATE TABLE IF NOT EXISTS students (
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
            )`,
            `CREATE TABLE IF NOT EXISTS facilities (
                facility_id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                location_description VARCHAR(250),
                min_capacity INT,
                max_capacity INT,
                type VARCHAR(50) NOT NULL,
                status ENUM('available', 'under_maintenance', 'closed') DEFAULT 'available'
            )`,
            `CREATE TABLE IF NOT EXISTS privileges (
                privilege_id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE
            )`,
            `CREATE TABLE IF NOT EXISTS admins (
                admin_id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(100) NOT NULL UNIQUE,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                user_name VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                role ENUM('system_admin', 'sports_admin', 'events_and_rooms_admin') DEFAULT 'system_admin'
            )`,
            `CREATE TABLE IF NOT EXISTS rooms (
                room_id INT PRIMARY KEY AUTO_INCREMENT,
                building_name VARCHAR(50) NOT NULL,
                room_number INT NOT NULL,
                capacity INT NOT NULL,
                start_time INT NOT NULL,
                end_time INT NOT NULL,
                is_available BOOLEAN,
                type ENUM('public study room', 'private study room', 'meeting room', 'theatre')
            )`,
            `CREATE TABLE IF NOT EXISTS resources (
                resource_id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(50) NOT NULL
            )`,
            `CREATE TABLE IF NOT EXISTS clubs (
                club_id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(250),
                email VARCHAR(50) NOT NULL,
                description TEXT,
                cover VARCHAR(255),
                logo VARCHAR(255),
                start_date DATETIME DEFAULT NOW(),
                status ENUM('active','closed','pending')
            )`,
            `CREATE TABLE IF NOT EXISTS posts (
                post_id INT PRIMARY KEY AUTO_INCREMENT,
                content TEXT NOT NULL,
                image_url VARCHAR(255),
                created_at DATETIME DEFAULT NOW(),
                club_id INT,
                FOREIGN KEY (club_id) REFERENCES clubs(club_id)
            )`,
            `CREATE TABLE IF NOT EXISTS events (
                event_id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(150) NOT NULL,
                description TEXT,
                event_start_date DATETIME NOT NULL,
                event_end_date DATETIME NOT NULL,
                status ENUM('scheduled', 'ongoing', 'completed', 'cancelled') DEFAULT 'scheduled',
                type VARCHAR(100) NOT NULL,
                room_id INT,
                admin_id INT,
                club_id INT,
                FOREIGN KEY (admin_id) REFERENCES admins(admin_id),
                FOREIGN KEY (room_id) REFERENCES rooms(room_id),
                FOREIGN KEY (club_id) REFERENCES clubs(club_id)
            )`,
            `CREATE TABLE IF NOT EXISTS admin_privileges (
                admin_id INT,
                privilege_id INT,
                assigned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (admin_id, privilege_id),
                FOREIGN KEY (admin_id) REFERENCES admins(admin_id),
                FOREIGN KEY (privilege_id) REFERENCES privileges(privilege_id)
            )`,
            `CREATE TABLE IF NOT EXISTS room_has_resources (
                room_id INT,
                resource_id INT,
                PRIMARY KEY (room_id, resource_id),
                FOREIGN KEY (room_id) REFERENCES rooms(room_id),
                FOREIGN KEY (resource_id) REFERENCES resources(resource_id)
            )`,
            `CREATE TABLE IF NOT EXISTS std_reserve_room (
                student_id INT NOT NULL,
                room_id INT NOT NULL,
                start_time DATETIME NOT NULL,
                end_time DATETIME NOT NULL,
                purpose VARCHAR(50),
                status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
                PRIMARY KEY (student_id, room_id, start_time),
                FOREIGN KEY (student_id) REFERENCES students(student_id),
                FOREIGN KEY (room_id) REFERENCES rooms(room_id)
            )`,
            `CREATE TABLE IF NOT EXISTS std_report_room (
                student_id INT NOT NULL,
                room_id INT NOT NULL,
                date DATETIME NOT NULL DEFAULT NOW(),
                details TEXT,
                reason VARCHAR(100),
                status ENUM('open', 'in_progress', 'resolved') DEFAULT 'open',
                PRIMARY KEY (student_id, room_id, date),
                FOREIGN KEY (student_id) REFERENCES students(student_id),
                FOREIGN KEY (room_id) REFERENCES rooms(room_id)
            )`,
            `CREATE TABLE IF NOT EXISTS std_report_facility (
                student_id INT,
                facility_id INT,
                report_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                reason VARCHAR(255) NOT NULL,
                details TEXT NOT NULL,
                status ENUM('open', 'in_progress', 'resolved') DEFAULT 'open',
                PRIMARY KEY (student_id, facility_id, report_date),
                FOREIGN KEY (student_id) REFERENCES students(student_id),
                FOREIGN KEY (facility_id) REFERENCES facilities(facility_id)
            )`,
            `CREATE TABLE IF NOT EXISTS std_reserve_facility (
                student_id INT,
                facility_id INT,
                reservation_start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                reservation_end_date DATETIME NOT NULL,
                status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
                PRIMARY KEY (student_id, facility_id, reservation_start_date),
                FOREIGN KEY (student_id) REFERENCES students(student_id),
                FOREIGN KEY (facility_id) REFERENCES facilities(facility_id)
            )`,
            `CREATE TABLE IF NOT EXISTS std_report_event (
                student_id INT,
                event_id INT,
                reason VARCHAR(100) NOT NULL,
                details TEXT NOT NULL,
                status ENUM('open', 'in_progress', 'resolved') DEFAULT 'open',
                date DATETIME NOT NULL,
                PRIMARY KEY (student_id, event_id, date),
                FOREIGN KEY (student_id) REFERENCES students(student_id),
                FOREIGN KEY (event_id) REFERENCES events(event_id)
            )`,
            `CREATE TABLE IF NOT EXISTS std_register_event (
                student_id INT,
                event_id INT,
                PRIMARY KEY (student_id, event_id),
                FOREIGN KEY (student_id) REFERENCES students(student_id),
                FOREIGN KEY (event_id) REFERENCES events(event_id)
            )`,
            `CREATE TABLE IF NOT EXISTS std_attend_event (
                student_id INT,
                event_id INT,
                check_in DATETIME NOT NULL DEFAULT NOW(),
                PRIMARY KEY (student_id, event_id),
                FOREIGN KEY (student_id) REFERENCES students(student_id),
                FOREIGN KEY (event_id) REFERENCES events(event_id)
            )`,
            `CREATE TABLE IF NOT EXISTS std_like_post (
                student_id INT,
                post_id INT,
                PRIMARY KEY (student_id, post_id),
                FOREIGN KEY (student_id) REFERENCES students(student_id),
                FOREIGN KEY (post_id) REFERENCES posts(post_id)
            )`,
            `CREATE TABLE IF NOT EXISTS std_comment_post (
                student_id INT,
                post_id INT,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT NOW(),
                PRIMARY KEY (student_id, post_id, created_at),
                FOREIGN KEY (student_id) REFERENCES students(student_id),
                FOREIGN KEY (post_id) REFERENCES posts(post_id)
            )`,
            `CREATE TABLE IF NOT EXISTS std_follow_club (
                student_id INT,
                club_id INT,
                follow_date DATETIME DEFAULT NOW(),
                PRIMARY KEY (student_id, club_id),
                FOREIGN KEY (student_id) REFERENCES students(student_id),
                FOREIGN KEY (club_id) REFERENCES clubs(club_id)
            )`,
            `CREATE TABLE IF NOT EXISTS std_report_club (
                student_id INT,
                club_id INT,
                date DATETIME DEFAULT NOW(),
                reason VARCHAR(100),
                details TEXT,
                status ENUM('open', 'in_progress', 'resolved') DEFAULT 'open',
                PRIMARY KEY (student_id, club_id, date),
                FOREIGN KEY (student_id) REFERENCES students(student_id),
                FOREIGN KEY (club_id) REFERENCES clubs(club_id)
            )`,
            `CREATE TABLE IF NOT EXISTS club_manager (
                student_id INT,
                club_id INT,
                start_date DATETIME DEFAULT NOW(),
                role_title VARCHAR(100),
                PRIMARY KEY (student_id, club_id),
                FOREIGN KEY (student_id) REFERENCES students(student_id),
                FOREIGN KEY (club_id) REFERENCES clubs(club_id)
            )`,
            `CREATE TABLE IF NOT EXISTS posts_for_event (
                post_id INT,
                event_id INT,
                PRIMARY KEY (post_id, event_id),
                FOREIGN KEY (post_id) REFERENCES posts(post_id),
                FOREIGN KEY (event_id) REFERENCES events(event_id)
            )`
        ];

        for (const query of createTablesQueries) {
            await conn.query(query);
        }

        console.log("Tables created or already exist.");
    } catch (err) {
        console.error("Error creating students table:", err);
    } finally {
        if (conn) conn.end();
        process.exit();
    }
}

createStudent();