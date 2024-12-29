import { useState, useEffect } from 'react';
import { getCategories, getItemsBySubcategory } from '../services/apiService';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Manager = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [items, setItems] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editCategory, setEditCategory] = useState(null);
    const [editItem, setEditItem] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (err) {
            setError('Failed to load categories');
        }
    };

    const fetchItems = async (categoryId) => {
        try {
            const data = await getItemsBySubcategory(categoryId);
            setItems(data);
            setSelectedCategory(categoryId);
        } catch (err) {
            setError('Failed to load items');
        }
    };

    const addCategory = async () => {
        if (!newCategoryName.trim()) {
            setError('Category name cannot be empty');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('You must be logged in as a Manager to add categories.');
                return;
            }

            await axios.post(
                'http://localhost:5000/categories',
                { Name: newCategoryName },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setNewCategoryName('');
            fetchCategories();
        } catch (err) {
            console.error('Error adding category:', err.response || err);
            setError(err.response?.data?.message || 'Failed to add category');
        }
    };


    const updateCategory = async () => {
        if (!editCategory?.Name.trim()) {
            setError('Category name cannot be empty');
            return;
        }
        try {
            await axios.put(
                `http://localhost:5000/categories/${editCategory.idCategory}`,
                { Name: editCategory.Name },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setEditCategory(null);
            fetchCategories();
        } catch (err) {
            setError('Failed to update category');
        }
    };

    const deleteCategory = async (id) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this category?');
        if (!confirmDelete) return; // Exit if user cancels

        try {
            await axios.delete(
                `http://localhost:5000/categories/${id}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            fetchCategories();
            setSelectedCategory(null); // Reset in case deleted category is selected
        } catch (err) {
            setError('Failed to delete category');
        }
    };

    const updateItem = async () => {
        if (!editItem?.Name.trim() || editItem.Quantity < 0) {
            setError('Item name cannot be empty and quantity cannot be negative');
            return;
        }
        try {
            await axios.put(
                `http://localhost:5000/items/${editItem.idItem}`,
                { Name: editItem.Name, Quantity: editItem.Quantity },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setEditItem(null);
            fetchItems(selectedCategory);
        } catch (err) {
            setError('Failed to update item');
        }
    };

    const deleteItem = async (id) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this item?');
        if (!confirmDelete) return; // Exit if user cancels

        try {
            await axios.delete(
                `http://localhost:5000/items/${id}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            fetchItems(selectedCategory);
        } catch (err) {
            setError('Failed to delete item');
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <div>
            <h2>Manager Dashboard</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Navigate to Create Accounts */}
            <button onClick={() => navigate('/manager/create-account')}>Create Accounts</button>

            {/* Categories Section */}
            {!selectedCategory && (
                <section>
                    <h3>Categories</h3>
                    <div>
                        <input
                            type="text"
                            placeholder="Enter category name"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                        />
                        <button onClick={addCategory}>Add Category</button>
                    </div>
                    <ul>
                        {categories.map((category) => (
                            <li key={category.idCategory}>
                                {editCategory?.idCategory === category.idCategory ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editCategory.Name}
                                            onChange={(e) =>
                                                setEditCategory({ ...editCategory, Name: e.target.value })
                                            }
                                        />
                                        <button onClick={updateCategory}>Save</button>
                                        <button onClick={() => setEditCategory(null)}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <Link to="#" onClick={() => fetchItems(category.idCategory)}>
                                            {category.Name}
                                        </Link>
                                        <button onClick={() => setEditCategory(category)}>Edit</button>
                                        <button onClick={() => deleteCategory(category.idCategory)}>
                                            Delete
                                        </button>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Items Section */}
            {selectedCategory && (
                <section>
                    <button onClick={() => navigate(`/categories/${selectedCategory}/add-item`)}>Add Item</button>
                    <h3>Items for Category {selectedCategory}</h3>
                    <ul>
                        {items.map((item) => (
                            <li key={item.idItem}>
                                {editItem?.idItem === item.idItem ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editItem.Name}
                                            onChange={(e) =>
                                                setEditItem({ ...editItem, Name: e.target.value })
                                            }
                                        />
                                        <input
                                            type="number"
                                            value={editItem.Quantity}
                                            onChange={(e) =>
                                                setEditItem({ ...editItem, Quantity: Number(e.target.value) })
                                            }
                                        />
                                        <button onClick={updateItem}>Save</button>
                                        <button onClick={() => setEditItem(null)}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        {item.Name} - {item.Quantity} in stock
                                        <button onClick={() => setEditItem(item)}>Edit</button>
                                        <button onClick={() => deleteItem(item.idItem)}>Delete</button>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => setSelectedCategory(null)}>Back to Categories</button>
                </section>
            )}
        </div>
    );
};

export default Manager;
