import { useState, useEffect, useContext } from 'react';
import { getCategories, getSubcategoriesByCategory, getItemsBySubcategory, getVariantsByItem } from '../services/apiService';
import { AuthContext } from '../AuthContext';
import axios from 'axios';

const Dashboard = () => {
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [items, setItems] = useState([]);
    const [variants, setVariants] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newItem, setNewItem] = useState({ Name: '', Quantity: 0 });
    const [error, setError] = useState(null);
    const { authState } = useContext(AuthContext);
    const [selectedItemId, setSelectedItemId] = useState(null);


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
        try {
            const data = await getSubcategoriesByCategory(idCategory);
            setSubcategories(data);
            setSelectedCategory(idCategory);
            setSelectedSubcategory(null); // Clear subcategory selection
            setItems([]); // Clear items
        } catch (err) {
            setError('Failed to load subcategories. Please try again later.');
        }
    };

    // Fetch items for a selected subcategory
    const fetchItems = async (subcategoryId) => {
        try {
            const data = await getItemsBySubcategory(subcategoryId);
            setItems(data);
            setSelectedSubcategory(subcategoryId);
        } catch (err) {
            setError('Failed to load items. Please try again later.');
        }
    };

    // Fetch variants for a selected item
    const fetchVariants = async (itemId) => {
        setSelectedItemId(itemId); // Set the selected item ID
        try {
            const data = await getVariantsByItem(itemId);
            setVariants(data); // Update variants state
        } catch (err) {
            console.error('Error fetching variants:', err);
            setError('Could not fetch variants. Please try again later.');
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
            setError('Failed to add category');
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
            setError('Failed to add item');
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
                                <span onClick={() => fetchSubcategories(category.idCategory)}>
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
                        <ul>
                            {items.map((item) => (
                                <li key={item.idItem}>
                                    <span
                                        onClick={() => fetchVariants(item.idItem)}
                                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                    >
                                        {item.Name}
                                    </span>
                                    {!item.hasVariants && <span> - {item.Quantity} in stock</span>}
                                    {authState.role === 'Manager' && (
                                        <button onClick={() => deleteItem(item.idItem)}>Delete</button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </ul>
                </section>
            )}

            {/* Variants Section */}
            {variants.length > 0 && (
                <section>
                    <h3>Variants for {items.find((item) => item.idItem === selectedItemId)?.Name}</h3>
                    <ul>
                        {variants.map((variant) => (
                            <li key={variant.idVariant}>
                                {variant.Name} - {variant.Quantity} in stock
                            </li>
                        ))}
                    </ul>
                </section>
            )}

        </div>
    );
};

export default Dashboard;
