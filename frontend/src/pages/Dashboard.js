import { useState, useEffect, useContext } from 'react';
import { getCategories, getSubcategoriesByCategory, getItemsBySubcategory } from '../services/apiService';
import { AuthContext } from '../AuthContext';
import axios from 'axios';

const Dashboard = () => {
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [items, setItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newItem, setNewItem] = useState({ Name: '', Quantity: 0 });
    const [editItem, setEditItem] = useState(null);
    const [error, setError] = useState(null);
    const { authState } = useContext(AuthContext);

    // Fetch all categories
    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (err) {
            setError('Failed to load categories');
        }
    };

    // Fetch subcategories for a selected category
    const fetchSubcategories = async (idCategory) => {
        console.log(`Fetching subcategories for category ID: ${idCategory}`); // Log category ID
        try {
            const data = await getSubcategoriesByCategory(idCategory);
            console.log('Subcategories received from API:', data); // Log received data
            if (!data || data.length === 0) {
                console.warn(`No subcategories found for category ID: ${idCategory}`); // Warn if empty
                setError(`No subcategories found for category ID: ${idCategory}`);
            }
            setSubcategories(data);
            setSelectedCategory(idCategory);
            setSelectedSubcategory(null); // Clear subcategory selection
            setItems([]); // Clear items
        } catch (err) {
            console.error('Error fetching subcategories:', err); // Log the full error
            setError('Failed to load subcategories. Please check the console for details.');
        }
    };


    // Fetch items for a selected subcategory
    const fetchItems = async (subcategoryId) => {
        console.log(`Fetching items for subcategory ID: ${subcategoryId}`); // Log subcategory ID
        try {
            const data = await getItemsBySubcategory(subcategoryId);
            console.log('Items received from API:', data); // Log API response
            setItems(data);
            setSelectedSubcategory(subcategoryId);
        } catch (err) {
            console.error('Error fetching items:', err.message); // Log error
            setError('Failed to load items. Please check the console for details.');
        }
    };



    // Add a new category
    const addCategory = async () => {
        if (!newCategoryName.trim()) {
            setError('Category name cannot be empty');
            return;
        }
        try {
            await axios.post(
                'http://localhost:5000/categories',
                { Name: newCategoryName },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setNewCategoryName('');
            fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add category');
        }
    };

    // Add a new item
    const addItem = async () => {
        if (!newItem.Name.trim() || newItem.Quantity < 0) {
            setError('Item name cannot be empty and quantity cannot be negative');
            return;
        }
        try {
            await axios.post(
                'http://localhost:5000/items',
                {
                    Name: newItem.Name,
                    Quantity: newItem.Quantity,
                    SubcategoryId: selectedSubcategory,
                },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setNewItem({ Name: '', Quantity: 0 });
            fetchItems(selectedSubcategory);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add item');
        }
    };

    // Delete an item
    const deleteItem = async (id) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this item?');
        if (!confirmDelete) return;

        try {
            await axios.delete(
                `http://localhost:5000/items/${id}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            fetchItems(selectedSubcategory);
        } catch (err) {
            setError('Failed to delete item');
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <div>
            <h2>Dashboard</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Categories Section */}
            {!selectedCategory && (
                <section>
                    <h3>Categories</h3>
                    {authState.role === 'Manager' && (
                        <div>
                            <input
                                type="text"
                                placeholder="Enter category name"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                            />
                            <button onClick={addCategory}>Add Category</button>
                        </div>
                    )}
                    <ul>
                        {categories.map((category) => (
                            <li key={category.idCategory}>
                                <span
                                    onClick={() => {
                                        console.log(`Category clicked: ${category.Name}, ID: ${category.idCategory}`); // Log details
                                        fetchSubcategories(category.idCategory);
                                    }}
                                >
                                    {category.Name}
                                </span>
                            </li>
                        ))}
                    </ul>

                </section>
            )}

            {/* Subcategories Section */}
            {selectedCategory && !selectedSubcategory && (
                <section>
                    <button onClick={() => setSelectedCategory(null)}>Back to Categories</button>
                    <h3>Subcategories</h3>
                    <ul>
                        {subcategories.map((subcategory) => (
                            <li key={subcategory.idSubcategory}>
                                <span onClick={() => fetchItems(subcategory.idSubcategory)}>
                                    {subcategory.Name}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Items Section */}
            {selectedSubcategory && (
                <section>
                    <button onClick={() => setSelectedSubcategory(null)}>Back to Subcategories</button>
                    <h3>Items</h3>
                    {authState.role === 'Manager' && (
                        <div>
                            <input
                                type="text"
                                placeholder="Item Name"
                                value={newItem.Name}
                                onChange={(e) => setNewItem({ ...newItem, Name: e.target.value })}
                            />
                            <input
                                type="number"
                                placeholder="Quantity"
                                value={newItem.Quantity}
                                onChange={(e) =>
                                    setNewItem({ ...newItem, Quantity: Number(e.target.value) })
                                }
                            />
                            <button onClick={addItem}>Add Item</button>
                        </div>
                    )}
                    <ul>
                        {items.map((item) => (
                            <li key={item.idItem}>
                                {item.Name} - {item.Quantity} in stock
                                {authState.role === 'Manager' && (
                                    <button onClick={() => deleteItem(item.idItem)}>Delete</button>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
};

export default Dashboard;
