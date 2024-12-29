import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const AddItem = () => {
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { categoryId } = useParams();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || quantity < 0) {
            setError('Item name cannot be empty and quantity cannot be negative');
            return;
        }

        try {
            await axios.post('http://localhost:5000/items', {
                Name: name,
                Quantity: quantity,
                SubcategoryId: categoryId,
            });
            // Redirect back to manager's view of the category
            navigate(`/manager?category=${categoryId}`);
        } catch (err) {
            setError('Failed to add item');
        }
    };

    return (
        <div>
            <h2>Add Item to Category {categoryId}</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <label>
                    Name:
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </label>
                <br />
                <label>
                    Quantity:
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                </label>
                <br />
                <button type="submit">Add Item</button>
                <button type="button" onClick={() => navigate(`/manager?category=${categoryId}`)}>
                    Cancel
                </button>
            </form>
        </div>
    );
};

export default AddItem;
