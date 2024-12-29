import { useState } from 'react';
import axios from 'axios';

const CreateAccounts = () => {
    const [newUser, setNewUser] = useState({ Username: '', Password: '', Role: 'User' });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:5000/register',
                newUser,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess('User created successfully!');
            setNewUser({ Username: '', Password: '', Role: 'User' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create user');
        }
    };

    return (
        <div>
            <h2>Create New User</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <form onSubmit={handleRegister}>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={newUser.Username}
                        onChange={(e) =>
                            setNewUser({ ...newUser, Username: e.target.value })
                        }
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={newUser.Password}
                        onChange={(e) =>
                            setNewUser({ ...newUser, Password: e.target.value })
                        }
                        required
                    />
                </div>
                <div>
                    <label>Role:</label>
                    <select
                        value={newUser.Role}
                        onChange={(e) =>
                            setNewUser({ ...newUser, Role: e.target.value })
                        }
                    >
                        <option value="User">User</option>
                        <option value="Manager">Manager</option>
                    </select>
                </div>
                <button type="submit">Create User</button>
            </form>
        </div>
    );
};

export default CreateAccounts;
