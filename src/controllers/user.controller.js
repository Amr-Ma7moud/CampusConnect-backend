import userService from "../services/user.service.js";

const checkIfUserExists = async (email) => {
    const user = await userService.getUserByEmail(email);
    return !!user;
}

export const getStudentProfile = async (req, res) => {
    try {
        const studentId = req.user.id;
        const student = await userService.getStudentById(studentId);

        if (!student) {
            return res.status(404).json({ 
                message: 'Student not found',
                details: "No student exists with the provided ID."
             });
        }

        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};



export const createUser = async (req, res) => {
    try {
        const userData = req.body;
        
        if( !userData.first_name || !userData.last_name || !userData.email || !userData.password ||
            !userData.user_name || !userData.phone || !userData.role ) {
                return res.status(400).json({ message: 'Bad Request', details: 'Missing required user fields' });
            }
        if( await checkIfUserExists(userData.email) ) {
            return res.status(409).json({ message: 'Conflict', details: 'A user withthis email already exists' });
        }
        
        const userId = await userService.createUser({
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            password: userData.password,
            user_name: userData.user_name,
            phone: userData.phone,
            role: userData.role
        });

        if(userData.role === 'student') {
            if( !userData.faculty || !userData.major || !userData.level || !userData.picture ) {
                return res.status(400).json({ message: 'Bad Request', details: 'Missing required student fields' });
            }

            await userService.createStudent({
                student_id: userId,
                faculty: userData.faculty,
                major: userData.major,
                level: userData.level,
                picture: userData.picture,
                in_dorms: userData.in_dorms || false
            });
        } else if(userData.role === 'admin') {
            await userService.createAdmin({
                admin_id: userId,
                role: userData.admin_role || 'system admin'
            });
        }

        res.status(201).json({ message: 'User created successfully', user_id: userId });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}
                

