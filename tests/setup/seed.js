import bcrypt from 'bcryptjs';
import { getConnection } from '../../src/config/db.js';

const HASH_COST = 10;
let counter = 0;
const uniq = (prefix) => `${prefix}_${Date.now()}_${++counter}`;

export const hashPassword = async (plain) => bcrypt.hash(plain, HASH_COST);

export const makeUser = async ({
    first_name = 'Test',
    last_name = 'User',
    user_name,
    phone = '01000000000',
    email,
    password = 'Password1!',
    role = 'student',
    is_active = true,
} = {}) => {
    const conn = await getConnection();
    try {
        const hashed = await hashPassword(password);
        const u = user_name || uniq('user');
        const e = email || `${u}@test.local`;
        const res = await conn.query(
            `INSERT INTO users (first_name, last_name, user_name, phone, email, password, role, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [first_name, last_name, u, phone, e, hashed, role, is_active ? 1 : 0]
        );
        const user_id = Number(res.insertId);
        return { user_id, first_name, last_name, user_name: u, phone, email: e, role, is_active, _plainPassword: password };
    } finally {
        await conn.release();
    }
};

export const makeStudent = async (overrides = {}) => {
    const {
        type = 'student',
        faculty = 'CSIT',
        major = 'CS',
        level = 2,
        picture = null,
        in_dorms = false,
        ...userOverrides
    } = overrides;
    const user = await makeUser({ ...userOverrides, role: 'student' });
    const conn = await getConnection();
    try {
        await conn.query(
            `INSERT INTO students (student_id, type, faculty, major, level, picture, in_dorms)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [user.user_id, type, faculty, major, level, picture, in_dorms ? 1 : 0]
        );
        return { ...user, student_id: user.user_id, type, faculty, major, level, picture, in_dorms };
    } finally {
        await conn.release();
    }
};

export const makeAdmin = async (overrides = {}) => {
    const { role: adminSubRole = 'system_admin', ...userOverrides } = overrides;
    const user = await makeUser({ ...userOverrides, role: 'admin' });
    const conn = await getConnection();
    try {
        await conn.query(
            `INSERT INTO admins (admin_id, role) VALUES (?, ?)`,
            [user.user_id, adminSubRole]
        );
        return { ...user, admin_id: user.user_id, adminSubRole };
    } finally {
        await conn.release();
    }
};

export const makeClub = async ({
    name,
    email,
    description = 'A test club',
    cover = null,
    logo = null,
    status = 'active',
} = {}) => {
    const conn = await getConnection();
    try {
        const n = name || uniq('club');
        const e = email || `${n}@clubs.test.local`;
        const res = await conn.query(
            `INSERT INTO clubs (name, email, description, cover, logo, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [n, e, description, cover, logo, status]
        );
        return { club_id: Number(res.insertId), name: n, email: e, description, cover, logo, status };
    } finally {
        await conn.release();
    }
};

export const makeClubManager = async (clubManagerOverrides = {}, studentOverrides = {}) => {
    const student = await makeStudent({ type: 'club_manager', ...studentOverrides });
    const club = clubManagerOverrides.club || await makeClub();
    const conn = await getConnection();
    try {
        await conn.query(
            `INSERT INTO club_manager (student_id, club_id, role_title) VALUES (?, ?, ?)`,
            [student.user_id, club.club_id, clubManagerOverrides.role_title || 'head']
        );
        return { ...student, club, role: 'club_manager' };
    } finally {
        await conn.release();
    }
};

export const makeRoom = async ({
    building_name = 'A',
    room_number = 101,
    capacity = 30,
    start_time = 8,
    end_time = 18,
    is_available = true,
    type = 'public study room',
} = {}) => {
    const conn = await getConnection();
    try {
        const res = await conn.query(
            `INSERT INTO rooms (building_name, room_number, capacity, start_time, end_time, is_available, type)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [building_name, room_number, capacity, start_time, end_time, is_available ? 1 : 0, type]
        );
        return { room_id: Number(res.insertId), building_name, room_number, capacity, start_time, end_time, is_available, type };
    } finally {
        await conn.release();
    }
};

export const makeFacility = async ({
    name,
    location_description = 'Wing B',
    min_capacity = 2,
    max_capacity = 10,
    type = 'sport',
    status = 'available',
} = {}) => {
    const conn = await getConnection();
    try {
        const n = name || uniq('facility');
        const res = await conn.query(
            `INSERT INTO facilities (name, location_description, min_capacity, max_capacity, type, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [n, location_description, min_capacity, max_capacity, type, status]
        );
        return { facility_id: Number(res.insertId), name: n, location_description, min_capacity, max_capacity, type, status };
    } finally {
        await conn.release();
    }
};

export const makeEvent = async ({
    title,
    description = 'A test event',
    event_start_date,
    event_end_date,
    status = 'scheduled',
    type = 'event',
    room_id = null,
    admin_id = null,
    club_id = null,
    max_capacity = 50,
} = {}) => {
    const conn = await getConnection();
    try {
        const t = title || uniq('event');
        const start = event_start_date || new Date(Date.now() + 24 * 60 * 60 * 1000);
        const end = event_end_date || new Date(Date.now() + 26 * 60 * 60 * 1000);
        const res = await conn.query(
            `INSERT INTO events (title, description, event_start_date, event_end_date, status, type, room_id, admin_id, club_id, max_capacity)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [t, description, start, end, status, type, room_id, admin_id, club_id, max_capacity]
        );
        return { event_id: Number(res.insertId), title: t, description, event_start_date: start, event_end_date: end, status, type, room_id, admin_id, club_id, max_capacity };
    } finally {
        await conn.release();
    }
};

export const makePost = async ({
    content = 'Hello world',
    image_url = null,
    club_id,
} = {}) => {
    const conn = await getConnection();
    try {
        const res = await conn.query(
            `INSERT INTO posts (content, image_url, club_id) VALUES (?, ?, ?)`,
            [content, image_url, club_id]
        );
        return { post_id: Number(res.insertId), content, image_url, club_id };
    } finally {
        await conn.release();
    }
};
