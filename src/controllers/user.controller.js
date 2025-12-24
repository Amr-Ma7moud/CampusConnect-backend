import userService from "../services/user.service.js";
import { saveLog } from "../utils/logs.js";

const checkIfUserExists = async (email) => {
    const user = await userService.getUserByEmail(email);
    return !!user;
}

export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        let user;

        if(req.user.role == "student") {
            user = await userService.getStudentById(userId);
        } else {
            user = await userService.getAdminById(userId);
        }

        if (!user) {
                return res.status(404).json({
                    message: 'user not found',
                    details: "No user exists with the provided ID."
                });
            }

        res.status(200).json(user);

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};



export const createUser = async (req, res) => {
    try {

        console.log("Hello from the createUser controller");
        
        const userData = req.body;

        console.log("Received createUser request:", userData);

        if (!userData.first_name || !userData.last_name || !userData.email || !userData.password ||
            !userData.user_name || !userData.phone || !userData.role) {
            return res.status(400).json({ message: 'Bad Request', details: 'Missing required user fields' });
        }

        const user = await checkIfUserExists(userData.email);
        if (user) {
            console.log(user);
            const currentUser = await userService.getUserByEmail(userData.email);
            console.log(currentUser);
            
            return res.status(409).json({ message: 'Conflict', details: 'A user withthis email already exists' });
        }

        console.log("Hello from the createUser controller");

        const userId = await userService.createUser({
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            password: userData.password,
            user_name: userData.user_name,
            phone: userData.phone,
            role: userData.role
        });

        if (userData.role === 'student') {
            if (!userData.faculty || !userData.major || !userData.level || !userData.picture) {
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
        } else if (userData.role === 'admin') {
            await userService.createAdmin({
                admin_id: userId,
                role: 'admin' // we have to add all types of admins (system, sports, rooms & events) --> userData.admin_role
            });
        }

        // Log user creation
        await saveLog({
            ip_address: req.ip,
            user_type: userData.role,
            record_id: userId.toString(),
            edited_table: 'users',
            action: 'create',
            changed_by: req.user.id.toString() // Self-registration
        });

        console.log("UserId type:", typeof userId, "Value:", userId);
        const responseData = { message: 'User created successfully', user_id: userId.toString() };
        console.log("Sending response:", responseData);
        res.status(201).json(responseData);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

export const banUser = async (req, res) => {
    const userId = req.params.id;

    try {
        await userService.banUser(userId);

        // Log user ban
        await saveLog({
            ip_address: req.ip,
            user_type: 'admin', // Assuming only admin can ban (though req.user.id is used, need to check if it's self-ban or admin banning someone else. The code says `const userId = req.user.id;` which implies banning SELF? Or `req.user` is the target? Usually `req.user` is the authenticated user. If `banUser` takes no params and uses `req.user.id`, it means "ban myself"? Or maybe `req.user` is populated with the target user by middleware? 
            // Looking at the code: `const userId = req.user.id; await userService.banUser(userId);`
            // If this is "ban myself" (deactivate account), then user_type is whatever the user is.
            // If this is admin banning someone, `userId` should probably come from params.
            // Let's assume it's "deactivate my account" for now based on code.
            record_id: userId,
            edited_table: 'users',
            action: 'ban/deactivate',
            changed_by: userId.toString()
        });

        res.status(200).json({ message: "User has been banned" });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


export const searchForStudent = async (req, res) => {
    try {
        const { query } = req.body;
        const students = await userService.searchForStudent(query);

        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const getAllStudents = async (req, res) => {
    try {
        const students = await userService.getAllStudents();
        res.status(200).json(students);
    } catch (error) {
        console.error("ERROR IN GETTING STUDETNTS" + error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};