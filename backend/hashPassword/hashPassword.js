const bcrypt = require('bcrypt');

const hashPassword = async () => {
    const plainTextPassword = 'admin'; // Password to hash
    const saltRounds = 10; // Number of salt rounds for bcrypt
    try {
        const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
        console.log(`Hashed Password: ${hashedPassword}`);
    } catch (error) {
        console.error('Error hashing password:', error);
    }
};

hashPassword();
