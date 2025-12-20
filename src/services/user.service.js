import userRepository from "../repositories/user.repository.js";
import bcrypt from 'bcryptjs';


class UserService {

    async createUser(userData) {
        const { first_name, last_name, email, password, user_name, phone, role } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);

        const userId = await userRepository.createUser([first_name, last_name, email, hashedPassword, user_name, phone, role]);
        return userId;
    }

    async createStudent(studentData) {
        const { student_id, faculty, major, level, picture, in_dorms } = studentData;
        const studentId = await userRepository.createStudent([student_id, faculty, major, level, picture, in_dorms]);
        return studentId;
    }

    async createAdmin(adminData) {
        const { admin_id, role } = adminData;
        const adminId = await userRepository.createAdmin([admin_id, role]);
        return adminId;
    }



    async getStudentById(student_id) {
        const student = await userRepository.getStudentById(student_id);
        return {
            student_id: student.student_id,
            first_name: student.first_name,
            last_name: student.last_name,
            email: student.email,
            user_name: student.user_name,
            faculty: student.faculty,
            major: student.major,
            phone: student.phone,
            level: student.level,
            picture: student.picture,
            in_dorms: student.in_dorms,
            hasClub: student.type == "club_manager" ? true : false
        };
    }

    async getAdminById(admin_id) {
        const admin = await userRepository.getAdminById(admin_id);
        return admin;
    }

    async getUserByEmail(email) {
        const user = await userRepository.getUserByEmail(email);
        return user;
    }

    async banUser(userId) {
        await userRepository.updateUserStatus(userId, 0);
    }

}

export default new UserService();