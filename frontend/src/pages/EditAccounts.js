import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import axios from 'axios';

const EditAccounts = () => {
    const { authState } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ Username: '', Password: '', Role: 'User' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://192.168.2.158:5000/users', {
                headers: { Authorization: `Bearer ${authState.token}` },
            });
            setUsers(response.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const handleAddUser = async () => {
        try {
            await axios.post(
                'http://192.168.2.158:5000/users',
                newUser,
                { headers: { Authorization: `Bearer ${authState.token}` } }
            );
            fetchUsers(); // Refresh the users list
            setNewUser({ Username: '', Password: '', Role: 'User' });
        } catch (err) {
            console.error('Error adding user:', err);
        }
    };


    const handleDeleteUser = async (id) => {
        try {
            if (window.confirm('Are you sure you want to delete this user?')) {
                await axios.delete(`http://192.168.2.158:5000/users/${id}`, {
                    headers: { Authorization: `Bearer ${authState.token}` },
                });
                fetchUsers();
            }
        } catch (err) {
            console.error('Error deleting user:', err);
        }
    };


    return (
        <div>
            <h2>Edit Accounts</h2>
            <div>
                <h3>Add User</h3>
                <input
                    type="text"
                    placeholder="Username"
                    value={newUser.Username}
                    onChange={(e) => setNewUser({ ...newUser, Username: e.target.value })}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={newUser.Password}
                    onChange={(e) => setNewUser({ ...newUser, Password: e.target.value })}
                />
                <select
                    value={newUser.Role}
                    onChange={(e) => setNewUser({ ...newUser, Role: e.target.value })}
                >
                    <option value="User">User</option>
                    <option value="Manager">Manager</option>
                </select>
                <button onClick={handleAddUser}>Add User</button>
            </div>

            <div>
                <h3>Existing Users</h3>
                {users.map((user) => (
                    <div key={user.idUser}>
                        {user.Username} ({user.Role})
                        <button onClick={() => handleDeleteUser(user.idUser)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EditAccounts;
