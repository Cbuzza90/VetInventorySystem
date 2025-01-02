import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

const Edit = () => {
    const { type, id } = useParams();
    const location = useLocation();
    const { entity } = location.state || {};

    const [formData, setFormData] = useState({
        Name: entity?.Name || '',
        Quantity: entity?.Quantity || 0,
    });

    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'Quantity') {
            const numericValue = value.replace(/^0+(?=\d)/, ''); // Remove leading zeros
            setFormData({
                ...formData,
                [name]: numericValue === '' ? '' : parseInt(numericValue, 10),
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSave = async () => {
        if (formData.Quantity === '' && type !== 'categories') {
            setError('Quantity cannot be empty for this type.');
            return;
        }

        try {
            await axios.put(
                `http://localhost:5000/${type}/${id}`,
                formData,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            );
            navigate(location.state?.from || '/'); // Navigate back to the originating page
        } catch (err) {
            console.error('Error updating entity:', err);
            setError('Failed to update the entity. Please try again later.');
        }
    };

    return (
        <div>
            <h2>Edit {type.slice(0, -1)}</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        name="Name"
                        value={formData.Name}
                        onChange={handleInputChange}
                    />
                </div>
                {type !== 'categories' && (
                    <div>
                        <label>Quantity:</label>
                        <input
                            type="number"
                            name="Quantity"
                            value={formData.Quantity || ''}
                            onChange={handleInputChange}
                            placeholder="Enter Quantity"
                        />
                    </div>
                )}
                <button type="button" onClick={handleSave}>
                    Save
                </button>
                <button type="button" onClick={() => navigate(location.state?.from || '/')}>
                    Cancel
                </button>
            </form>
        </div>
    );
};

export default Edit;
