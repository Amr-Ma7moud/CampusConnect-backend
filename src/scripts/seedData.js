import bcrypt from "bcryptjs";
import { getConnection } from "../config/db.js";

const hashPassword = async (plainPassword) => bcrypt.hash(plainPassword, 10);

const seed = async () => {
    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const deleteQueries = [
            "DELETE FROM admin_privileges",
            "DELETE FROM privileges",
            "DELETE FROM posts_for_event",
            "DELETE FROM std_comment_post",
            "DELETE FROM std_like_post",
            "DELETE FROM std_attend_event",
            "DELETE FROM std_register_event",
            "DELETE FROM std_report_event",
            "DELETE FROM std_report_club",
            "DELETE FROM std_follow_club",
            "DELETE FROM std_report_room",
            "DELETE FROM std_reserve_room",
            "DELETE FROM std_report_facility",
            "DELETE FROM std_reserve_facility",
            "DELETE FROM club_manager",
            "DELETE FROM posts",
            "DELETE FROM events",
            "DELETE FROM clubs",
            "DELETE FROM room_has_resources",
            "DELETE FROM resources",
            "DELETE FROM rooms",
            "DELETE FROM facilities",
            "DELETE FROM admins",
            "DELETE FROM students",
            "DELETE FROM users",
        ];

        for (const query of deleteQueries) {
            await conn.query(query);
        }

        const resetAutoIncrementQueries = [
            "ALTER TABLE users AUTO_INCREMENT = 1",
            "ALTER TABLE facilities AUTO_INCREMENT = 1",
            "ALTER TABLE rooms AUTO_INCREMENT = 1",
            "ALTER TABLE resources AUTO_INCREMENT = 1",
            "ALTER TABLE clubs AUTO_INCREMENT = 1",
            "ALTER TABLE posts AUTO_INCREMENT = 1",
            "ALTER TABLE events AUTO_INCREMENT = 1",
            "ALTER TABLE privileges AUTO_INCREMENT = 1",
        ];

        for (const query of resetAutoIncrementQueries) {
            await conn.query(query);
        }

        const passwords = {
            admin: await hashPassword("Admin123!"),
            manager: await hashPassword("Manager123!"),
            studentOne: await hashPassword("Student123!"),
            studentTwo: await hashPassword("Student123!"),
            studentThree: await hashPassword("Student123!"),
            studentFour: await hashPassword("Student123!"),
            studentFive: await hashPassword("Student123!"),
        };

        const userInserts = [
            [
                "Maya",
                "Hassan",
                "maya_admin",
                "0100000001",
                "maya.admin@campusconnect.test",
                passwords.admin,
                "admin",
            ],
            [
                "Omar",
                "Nabil",
                "omar_manager",
                "0100000002",
                "omar.manager@campusconnect.test",
                passwords.manager,
                "student",
            ],
            [
                "Sara",
                "Ali",
                "sara_student",
                "0100000003",
                "sara.student@campusconnect.test",
                passwords.studentOne,
                "student",
            ],
            [
                "Youssef",
                "Tarek",
                "youssef_student",
                "0100000004",
                "youssef.student@campusconnect.test",
                passwords.studentTwo,
                "student",
            ],
            [
                "Laila",
                "Ibrahim",
                "laila_student",
                "0100000005",
                "laila.student@campusconnect.test",
                passwords.studentThree,
                "student",
            ],
            [
                "Karim",
                "Mostafa",
                "karim_student",
                "0100000006",
                "karim.student@campusconnect.test",
                passwords.studentFour,
                "student",
            ],
            [
                "Nour",
                "Adel",
                "nour_student",
                "0100000007",
                "nour.student@campusconnect.test",
                passwords.studentFive,
                "student",
            ],
        ];

        const userIds = [];

        for (const user of userInserts) {
            const result = await conn.query(
                `
                INSERT INTO users
                    (first_name, last_name, user_name, phone, email, password, role, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
                `,
                user
            );
            userIds.push(result.insertId);
        }

        const [
            adminId,
            managerId,
            saraId,
            youssefId,
            lailaId,
            karimId,
            nourId,
        ] = userIds;

        await conn.query(
            `
            INSERT INTO admins (admin_id, role)
            VALUES (?, ?)
            `,
            [adminId, "system_admin"]
        );

        const studentInserts = [
            [managerId, "club_manager", "CSIT", "Software Engineering", 4, "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", false],
            [saraId, "student", "CSIT", "Artificial Intelligence", 3, "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400", true],
            [youssefId, "student", "FOE", "Mechanical Engineering", 2, "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400", false],
            [lailaId, "student", "PharmaD", "Clinical Pharmacy", 5, "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400", true],
            [karimId, "student", "ARCH", "Urban Design", 4, "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=400", false],
            [nourId, "student", "BAS", "Applied Mathematics", 1, "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400", true],
        ];

        for (const student of studentInserts) {
            await conn.query(
                `
                INSERT INTO students
                    (student_id, type, faculty, major, level, picture, in_dorms)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                student
            );
        }

        const privilegeNames = [
            "manage_users",
            "manage_events",
            "manage_rooms",
            "view_reports",
        ];

        const privilegeIds = [];
        for (const privilegeName of privilegeNames) {
            const result = await conn.query(
                `
                INSERT INTO privileges (name)
                VALUES (?)
                `,
                [privilegeName]
            );
            privilegeIds.push(result.insertId);
        }

        for (const privilegeId of privilegeIds) {
            await conn.query(
                `
                INSERT INTO admin_privileges (admin_id, privilege_id)
                VALUES (?, ?)
                `,
                [adminId, privilegeId]
            );
        }

        const roomInserts = [
            ["Library", 101, 8, 8, 20, true, "meeting room"],
            ["Innovation Hub", 204, 20, 9, 22, true, "theatre"],
            ["Academic Center", 12, 4, 8, 18, true, "private study room"],
            ["Engineering Complex", 55, 10, 8, 20, false, "public study room"],
        ];

        const roomIds = [];
        for (const room of roomInserts) {
            const result = await conn.query(
                `
                INSERT INTO rooms
                    (building_name, room_number, capacity, start_time, end_time, is_available, type)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                room
            );
            roomIds.push(result.insertId);
        }

        const resourceNames = ["Projector", "Whiteboard", "Conference Screen", "Sound System"];
        const resourceIds = [];
        for (const resourceName of resourceNames) {
            const result = await conn.query(
                `
                INSERT INTO resources (name)
                VALUES (?)
                `,
                [resourceName]
            );
            resourceIds.push(result.insertId);
        }

        const roomResourceLinks = [
            [roomIds[0], resourceIds[0]],
            [roomIds[0], resourceIds[1]],
            [roomIds[1], resourceIds[2]],
            [roomIds[1], resourceIds[3]],
            [roomIds[2], resourceIds[1]],
        ];

        for (const link of roomResourceLinks) {
            await conn.query(
                `
                INSERT INTO room_has_resources (room_id, resource_id)
                VALUES (?, ?)
                `,
                link
            );
        }

        const facilityInserts = [
            ["Titan Gym", "Sports Arena, North Wing", 4, 18, "gym", "available"],
            ["Blue Court", "Outdoor sports zone beside dorms", 6, 22, "playground", "available"],
            ["Pulse Fitness Studio", "Student center, floor 2", 3, 12, "gym", "under_maintenance"],
        ];

        const facilityIds = [];
        for (const facility of facilityInserts) {
            const result = await conn.query(
                `
                INSERT INTO facilities
                    (name, location_description, min_capacity, max_capacity, type, status)
                VALUES (?, ?, ?, ?, ?, ?)
                `,
                facility
            );
            facilityIds.push(result.insertId);
        }

        const clubInserts = [
            [
                "Robotics Club",
                "robotics@campusconnect.test",
                "Build sessions, hack nights, and competition prep for curious engineers.",
                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200",
                "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400",
                "active",
            ],
            [
                "Wellness Collective",
                "wellness@campusconnect.test",
                "Campus-wide fitness, mental wellbeing, and lifestyle programming.",
                "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200",
                "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400",
                "active",
            ],
        ];

        const clubIds = [];
        for (const club of clubInserts) {
            const result = await conn.query(
                `
                INSERT INTO clubs
                    (name, email, description, cover, logo, start_date, status)
                VALUES (?, ?, ?, ?, ?, NOW(), ?)
                `,
                club
            );
            clubIds.push(result.insertId);
        }

        const clubManagers = [
            [managerId, clubIds[0], "Club President"],
            [saraId, clubIds[1], "Wellness Lead"],
        ];

        for (const clubManager of clubManagers) {
            await conn.query(
                `
                INSERT INTO club_manager (student_id, club_id, role_title)
                VALUES (?, ?, ?)
                `,
                clubManager
            );
        }

        const events = [
            [
                "Autonomous Bots Workshop",
                "Hands-on workshop for beginners to build and test autonomous line-following robots.",
                "2026-05-14 13:00:00",
                "2026-05-14 16:00:00",
                "scheduled",
                "event",
                roomIds[0],
                adminId,
                clubIds[0],
                30,
            ],
            [
                "Team Conditioning Session",
                "A guided group fitness session focused on mobility, cardio, and recovery.",
                "2026-05-16 18:00:00",
                "2026-05-16 19:30:00",
                "scheduled",
                "session",
                roomIds[1],
                adminId,
                clubIds[1],
                40,
            ],
            [
                "Robotics Expo Pitch Review",
                "Pending event request for club members to rehearse expo demos and judge flow.",
                "2026-05-20 12:00:00",
                "2026-05-20 14:00:00",
                "pending",
                "event",
                null,
                null,
                clubIds[0],
                20,
            ],
        ];

        const eventIds = [];
        for (const event of events) {
            const result = await conn.query(
                `
                INSERT INTO events
                    (title, description, event_start_date, event_end_date, status, type, room_id, admin_id, club_id, max_capacity)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                event
            );
            eventIds.push(result.insertId);
        }

        const posts = [
            [
                "We’re opening registrations for the Autonomous Bots Workshop. Bring your laptop and your curiosity.",
                "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200",
                clubIds[0],
            ],
            [
                "Saturday conditioning is on. Expect a high-energy session and recovery cooldown.",
                "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200",
                clubIds[1],
            ],
            [
                "Our robotics team just finished testing the new sensor package in the lab.",
                "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=1200",
                clubIds[0],
            ],
        ];

        const postIds = [];
        for (const post of posts) {
            const result = await conn.query(
                `
                INSERT INTO posts (content, image_url, created_at, club_id)
                VALUES (?, ?, NOW(), ?)
                `,
                post
            );
            postIds.push(result.insertId);
        }

        const postEventLinks = [
            [postIds[0], eventIds[0]],
            [postIds[1], eventIds[1]],
        ];

        for (const link of postEventLinks) {
            await conn.query(
                `
                INSERT INTO posts_for_event (post_id, event_id)
                VALUES (?, ?)
                `,
                link
            );
        }

        const followers = [
            [saraId, clubIds[0]],
            [youssefId, clubIds[0]],
            [lailaId, clubIds[1]],
            [karimId, clubIds[1]],
            [nourId, clubIds[0]],
        ];

        for (const follower of followers) {
            await conn.query(
                `
                INSERT INTO std_follow_club (student_id, club_id)
                VALUES (?, ?)
                `,
                follower
            );
        }

        const comments = [
            [saraId, postIds[0], "I’m in. This one looks seriously fun."],
            [youssefId, postIds[0], "Can first-year students join too?"],
            [lailaId, postIds[1], "Perfect timing for a reset before finals."],
        ];

        for (const comment of comments) {
            await conn.query(
                `
                INSERT INTO std_comment_post (student_id, post_id, content, created_at)
                VALUES (?, ?, ?, NOW())
                `,
                comment
            );
        }

        const likes = [
            [saraId, postIds[0]],
            [youssefId, postIds[0]],
            [karimId, postIds[1]],
            [nourId, postIds[2]],
        ];

        for (const like of likes) {
            await conn.query(
                `
                INSERT INTO std_like_post (student_id, post_id)
                VALUES (?, ?)
                `,
                like
            );
        }

        const roomReservations = [
            [managerId, roomIds[0], "2026-05-12 10:00:00", "2026-05-12 12:00:00", "Club strategy meeting", "completed"],
            [saraId, roomIds[0], "2026-05-12 10:00:00", "2026-05-12 12:00:00", "Club strategy meeting", "completed"],
            [youssefId, roomIds[2], "2026-05-13 14:00:00", "2026-05-13 16:00:00", "Exam prep group", "confirmed"],
            [karimId, roomIds[2], "2026-05-13 14:00:00", "2026-05-13 16:00:00", "Exam prep group", "confirmed"],
        ];

        for (const reservation of roomReservations) {
            await conn.query(
                `
                INSERT INTO std_reserve_room
                    (student_id, room_id, start_time, end_time, purpose, status)
                VALUES (?, ?, ?, ?, ?, ?)
                `,
                reservation
            );
        }

        const facilityReservations = [
            [saraId, facilityIds[0], "2026-05-08 18:00:00", "2026-05-08 20:00:00", "completed"],
            [youssefId, facilityIds[0], "2026-05-08 18:00:00", "2026-05-08 20:00:00", "completed"],
            [lailaId, facilityIds[1], "2026-05-09 17:00:00", "2026-05-09 19:00:00", "completed"],
            [karimId, facilityIds[1], "2026-05-09 17:00:00", "2026-05-09 19:00:00", "completed"],
            [nourId, facilityIds[0], "2026-05-15 17:30:00", "2026-05-15 18:30:00", "confirmed"],
            [managerId, facilityIds[0], "2026-05-15 17:30:00", "2026-05-15 18:30:00", "confirmed"],
        ];

        for (const reservation of facilityReservations) {
            await conn.query(
                `
                INSERT INTO std_reserve_facility
                    (student_id, facility_id, reservation_start_date, reservation_end_date, status)
                VALUES (?, ?, ?, ?, ?)
                `,
                reservation
            );
        }

        const eventRegistrations = [
            [saraId, eventIds[0]],
            [youssefId, eventIds[0]],
            [lailaId, eventIds[1]],
            [karimId, eventIds[1]],
            [nourId, eventIds[0]],
        ];

        for (const registration of eventRegistrations) {
            await conn.query(
                `
                INSERT INTO std_register_event (student_id, event_id)
                VALUES (?, ?)
                `,
                registration
            );
        }

        const eventAttendance = [
            [saraId, eventIds[0]],
            [youssefId, eventIds[0]],
            [lailaId, eventIds[1]],
        ];

        for (const attendance of eventAttendance) {
            await conn.query(
                `
                INSERT INTO std_attend_event (student_id, event_id)
                VALUES (?, ?)
                `,
                attendance
            );
        }

        const roomReports = [
            [karimId, roomIds[3], "Air conditioning issue", "The room gets too warm after 6 PM."],
        ];

        for (const report of roomReports) {
            await conn.query(
                `
                INSERT INTO std_report_room (student_id, room_id, details, reason, status)
                VALUES (?, ?, ?, ?, 'open')
                `,
                report
            );
        }

        const facilityReports = [
            [nourId, facilityIds[2], "Equipment maintenance", "Treadmills are marked unavailable but still visible in the booking area."],
        ];

        for (const report of facilityReports) {
            await conn.query(
                `
                INSERT INTO std_report_facility (student_id, facility_id, reason, details, status)
                VALUES (?, ?, ?, ?, 'in_progress')
                `,
                report
            );
        }

        const eventReports = [
            [karimId, eventIds[0], "Timing conflict", "The workshop overlaps with a required studio review.", "2026-05-07 10:30:00"],
        ];

        for (const report of eventReports) {
            await conn.query(
                `
                INSERT INTO std_report_event (student_id, event_id, reason, details, status, date)
                VALUES (?, ?, ?, ?, 'open', ?)
                `,
                report
            );
        }

        const clubReports = [
            [nourId, clubIds[1], "Communication gap", "The event reminder was posted too late for first-year students.",],
        ];

        for (const report of clubReports) {
            await conn.query(
                `
                INSERT INTO std_report_club (student_id, club_id, reason, details, status)
                VALUES (?, ?, ?, ?, 'resolved')
                `,
                report
            );
        }

        await conn.commit();

        console.log("Seed completed successfully.");
        console.log("Demo credentials:");
        console.log("Admin: maya.admin@campusconnect.test / Admin123!");
        console.log("Club manager: omar.manager@campusconnect.test / Manager123!");
        console.log("Student: sara.student@campusconnect.test / Student123!");
        console.log("Student: youssef.student@campusconnect.test / Student123!");
    } catch (error) {
        if (conn) {
            await conn.rollback();
        }
        console.error("Error seeding database:", error);
        process.exitCode = 1;
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

await seed();
