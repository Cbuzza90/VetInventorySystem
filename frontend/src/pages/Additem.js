import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/apiService';

const AddItem = () => {
    const [type, setType] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        quantity: 0,
        categoryId: '',
        subcategoryId: '',
    });
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const navigate = useNavigate();

    // Navigate back to dashboard
    const handleBackToDashboard = () => {
        navigate('/');
    };

    // Fetch categories on load
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await API.get('/categories');
                setCategories(response.data);
            } catch (err) {
                console.error('Error fetching categories:', err);
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    // Fetch subcategories when a category is selected
    useEffect(() => {
        if (formData.categoryId) {
            const fetchSubcategories = async () => {
                try {
                    const response = await API.get(`/subcategories/${formData.categoryId}`);
                    setSubcategories(response.data);
                } catch (err) {
                    console.error('Error fetching subcategories:', err);
                    setSubcategories([]);
                }
            };
            fetchSubcategories();
        } else {
            setSubcategories([]);
        }
    }, [formData.categoryId]);

    const handleTypeSelect = (selectedType) => {
        setType(selectedType);
        setFormData({
            name: '',
            quantity: 0,
            categoryId: '',
            subcategoryId: '',
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        try {
            if (type === 'category') {
                await API.post('/categories', { Name: formData.name });
            } else if (type === 'subcategory') {
                await API.post('/subcategories', {
                    Name: formData.name,
                    idCategory: formData.categoryId,
                });
            } else if (type === 'item') {
                const payload = {
                    Name: formData.name,
                    Quantity: formData.quantity,
                    idSubcategory: formData.subcategoryId,
                };
                console.log('Payload to be sent:', payload);
                await API.post('/items', payload);
            }

            navigate('/'); // Redirect to dashboard after saving
        } catch (err) {
            console.error('Error adding entity:', err);
        }
    };

    return (
        <div>
            {/* Back to Dashboard Button */}
            <button onClick={handleBackToDashboard} style={{ marginBottom: '20px' }}>
                Back to Dashboard
            </button>

            <h2>Add Item</h2>
            {!type && (
                <div>
                    <button onClick={() => handleTypeSelect('category')}>New Category</button>
                    <button onClick={() => handleTypeSelect('subcategory')}>New Subcategory</button>
                    <button onClick={() => handleTypeSelect('item')}>New Item</button>
                </div>
            )}
            {type && (
                <form>
                    <h3>Add New {type.charAt(0).toUpperCase() + type.slice(1)}</h3>
                    <div>
                        <label>Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    {(type === 'subcategory' || type === 'item') && (
                        <div>
                            <label>Category:</label>
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map((category) => (
                                    <option key={category.idCategory} value={category.idCategory}>
                                        {category.Name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    {type === 'item' && (
                        <div>
                            <label>Subcategory:</label>
                            <select
                                name="subcategoryId"
                                value={formData.subcategoryId}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Subcategory</option>
                                {subcategories.map((subcategory) => (
                                    <option key={subcategory.idSubcategory} value={subcategory.idSubcategory}>
                                        {subcategory.Name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    {type === 'item' && (
                        <div>
                            <label>Quantity:</label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    )}
                    <button type="button" onClick={handleSave}>
                        Save
                    </button>
                    <button type="button" onClick={() => setType(null)}>
                        Back
                    </button>
                </form>
            )}
        </div>
    );
};

export default AddItem;
