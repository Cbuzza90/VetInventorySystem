import { useState, useEffect, useContext } from 'react';
import {
    getCategories,
    getSubcategoriesByCategory,
    getItemsBySubcategory,
    getVariantsByItem,
    updateItemQuantity,
    updateVariantQuantity,
} from '../services/apiService';
import { AuthContext } from '../AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Dashboard = () => {
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [items, setItems] = useState([]);
    const [variants, setVariants] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [showVariants, setShowVariants] = useState(false);
    const { authState, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (err) {
            console.error('Failed to load categories');
        }
    };

    const fetchSubcategories = async (idCategory) => {
        try {
            const data = await getSubcategoriesByCategory(idCategory);
            setSubcategories(data);
            setSelectedCategory(idCategory);
            setSelectedSubcategory(null);
            setItems([]);
        } catch (err) {
            console.error('Failed to load subcategories');
        }
    };

    const fetchItems = async (subcategoryId) => {
        try {
            const data = await getItemsBySubcategory(subcategoryId);
            setItems(data);
            setSelectedSubcategory(subcategoryId);
        } catch (err) {
            console.error('Failed to load items');
        }
    };

    const fetchVariants = async (itemId) => {
        setSelectedItemId(itemId);
        try {
            const data = await getVariantsByItem(itemId);
            setVariants(data);
            setShowVariants(true);
        } catch (err) {
            console.error('Failed to fetch variants');
        }
    };

    const goBackToItems = () => {
        setShowVariants(false);
        setVariants([]);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleEditClick = (type, id, entityData) => {
        navigate(`/edit/${type}/${id}`, {
            state: {
                from: location.pathname,
                entity: entityData,
            },
        });
    };

    const handleQuantityChange = async (type, id, increment) => {
        try {
            if (type === 'item') {
                const updatedItem = await updateItemQuantity(id, increment);
                setItems((prevItems) =>
                    prevItems.map((item) =>
                        item.idItem === id
                            ? { ...item, Quantity: updatedItem.Quantity }
                            : item
                    )
                );
            } else if (type === 'variant') {
                const updatedVariant = await updateVariantQuantity(id, increment);
                setVariants((prevVariants) =>
                    prevVariants.map((variant) =>
                        variant.idVariant === id
                            ? { ...variant, Quantity: updatedVariant.Quantity }
                            : variant
                    )
                );
            }
        } catch (err) {
            console.error('Failed to update quantity:', err);
        }
    };

    const handleLogout = () => {
        logout(); // Clears token and authentication state
        navigate('/login'); // Redirects to the login page
    };

    return (
        <div>
            <h2>Dashboard</h2>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                style={{
                    marginBottom: '20px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    padding: '10px',
                }}
            >
                Logout
            </button>

            {authState.role === 'Manager' && (
                <button
                    onClick={() => navigate('/EditAccounts')}
                    style={{
                        marginBottom: '20px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        padding: '10px',
                    }}
                >
                    Edit Accounts
                </button>
            )}

            {/* Add Item Button */}
            {authState.role === 'Manager' && (
                <button
                    onClick={() => navigate('/categories/1/add-item', { state: { from: location.pathname } })} // Replace `1` with the actual category ID
                    style={{
                        marginBottom: '20px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        padding: '10px',
                    }}
                >
                    Add Item
                </button>
            )}

            {/* Categories Section */}
            {!selectedCategory && (
                <section>
                    <h3>Categories</h3>
                    {categories.map((category) => (
                        <div key={category.idCategory} className="dashboard-item">
                            <span onClick={() => fetchSubcategories(category.idCategory)}>
                                {category.Name}
                            </span>
                            {authState.role === 'Manager' && (
                                <button
                                    onClick={() =>
                                        handleEditClick('categories', category.idCategory, {
                                            Name: category.Name,
                                        })
                                    }
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                    ))}
                </section>
            )}

            {/* Subcategories Section */}
            {selectedCategory && !selectedSubcategory && (
                <section>
                    <button onClick={() => setSelectedCategory(null)}>Back to Categories</button>
                    <h3>Subcategories</h3>
                    {subcategories.map((subcategory) => (
                        <div key={subcategory.idSubcategory} className="dashboard-item">
                            <span onClick={() => fetchItems(subcategory.idSubcategory)}>
                                {subcategory.Name}
                            </span>
                            {authState.role === 'Manager' && (
                                <button
                                    onClick={() =>
                                        handleEditClick('subcategories', subcategory.idSubcategory, {
                                            Name: subcategory.Name,
                                        })
                                    }
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                    ))}
                </section>
            )}

            {/* Items Section */}
            {selectedSubcategory && !showVariants && (
                <section>
                    <button onClick={() => setSelectedSubcategory(null)}>Back to Subcategories</button>
                    <h3>Items</h3>
                    {items.map((item) => (
                        <div key={item.idItem} className="dashboard-item">
                            {item.hasVariants ? (
                                <span
                                    onClick={() => fetchVariants(item.idItem)}
                                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    {item.Name}
                                </span>
                            ) : (
                                <span>{item.Name}</span>
                            )}
                            {!item.hasVariants && (
                                <>
                                    <button onClick={() => handleQuantityChange('item', item.idItem, -1)}>
                                        -
                                    </button>
                                    <span>{item.Quantity}</span>
                                    <button onClick={() => handleQuantityChange('item', item.idItem, 1)}>
                                        +
                                    </button>
                                </>
                            )}
                            {authState.role === 'Manager' && (
                                <button
                                    onClick={() =>
                                        handleEditClick('items', item.idItem, {
                                            Name: item.Name,
                                            Quantity: item.Quantity,
                                        })
                                    }
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                    ))}
                </section>
            )}

            {/* Variants Section */}
            {showVariants && (
                <section>
                    <button onClick={goBackToItems}>Back to Items</button>
                    <h3>Variants for {items.find((item) => item.idItem === selectedItemId)?.Name}</h3>
                    {variants.map((variant) => (
                        <div key={variant.idVariant} className="dashboard-item">
                            <span>{variant.Name}</span>
                            <button onClick={() => handleQuantityChange('variant', variant.idVariant, -1)}>
                                -
                            </button>
                            <span>{variant.Quantity}</span>
                            <button onClick={() => handleQuantityChange('variant', variant.idVariant, 1)}>
                                +
                            </button>
                            {authState.role === 'Manager' && (
                                <button
                                    onClick={() =>
                                        handleEditClick('variants', variant.idVariant, {
                                            Name: variant.Name,
                                            Quantity: variant.Quantity,
                                        })
                                    }
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                    ))}
                </section>
            )}
        </div>
    );
};

export default Dashboard;
