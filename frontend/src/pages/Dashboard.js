import { useState, useEffect, useContext } from 'react';
import {
    getCategories,
    getSubcategoriesByCategory,
    getItemsBySubcategory,
    getAllItems,
    updateItemQuantity,
} from '../services/apiService';
import { AuthContext } from '../AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Dashboard = () => {
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('items'); // Dropdown selection
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
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

    const fetchAllItems = async () => {
        try {
            const data = await getAllItems();
            setItems(data);
            setFilteredItems(data);
        } catch (err) {
            console.error('Failed to load items globally');
        }
    };

    const fetchSubcategories = async (idCategory) => {
        try {
            const data = await getSubcategoriesByCategory(idCategory);
            setSubcategories(data);
            setSelectedCategory(idCategory);
            setSelectedSubcategory(null);
            setItems([]);
            setFilteredItems([]);
        } catch (err) {
            console.error('Failed to load subcategories');
        }
    };

    const fetchItems = async (subcategoryId) => {
        try {
            const data = await getItemsBySubcategory(subcategoryId);
            if (!Array.isArray(data)) {
                console.error('Invalid response data for subcategory items:', data);
                setItems([]);
                setFilteredItems([]);
                return;
            }
            setItems(data);
            setFilteredItems(data);
            setSelectedSubcategory(subcategoryId);
        } catch (err) {
            console.error('Failed to load items:', err.message);
            setItems([]);
            setFilteredItems([]);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };

    const handleDropdownChange = (e) => {
        setSearchType(e.target.value);
        setSearchQuery(''); // Clear search query when type changes
        setFilteredItems([]); // Clear filtered results
    };

    const handleEditClick = (type, id, entityData) => {
        navigate(`/edit/${type}/${id}`, {
            state: {
                from: location.pathname,
                entity: entityData,
            },
        });
    };

    const handleQuantityChange = async (id, increment) => {
        try {
            const updatedItem = await updateItemQuantity(id, increment);
            setItems((prevItems) =>
                prevItems.map((item) =>
                    item.idItem === id
                        ? { ...item, Quantity: updatedItem.Quantity }
                        : item
                )
            );
            setFilteredItems((prevItems) =>
                prevItems.map((item) =>
                    item.idItem === id
                        ? { ...item, Quantity: updatedItem.Quantity }
                        : item
                )
            );
        } catch (err) {
            console.error('Failed to update quantity:', err);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleCategoryClick = (idCategory) => {
        fetchSubcategories(idCategory);
        setSearchQuery('');
        setFilteredItems([]);
        setSearchType('subcategories');
    };

    const handleSubcategoryClick = (idSubcategory) => {
        if (!idSubcategory) {
            console.error('Invalid subcategory ID:', idSubcategory);
            return;
        }
        fetchItems(idSubcategory);
        setSearchQuery('');
        setFilteredItems([]);
        setSearchType('items');
    };

    useEffect(() => {
        fetchCategories();
        fetchAllItems();
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredItems([]);
            return;
        }

        const dataMap = {
            categories: categories,
            subcategories: subcategories,
            items: items,
        };

        const dataSource = dataMap[searchType] || [];

        const filteredData = dataSource.filter((entry) =>
            entry.Name.toLowerCase().includes(searchQuery)
        );

        setFilteredItems(filteredData);
    }, [searchQuery, searchType, categories, subcategories, items]);

    return (
        <div>
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

            {/* Manage Accounts Button */}
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
                    Manage Accounts
                </button>
            )}

            {/* Add Item Button */}
            {authState.role === 'Manager' && (
                <button
                    onClick={() =>
                        navigate(`/categories/${selectedCategory || 1}/add-item`, {
                            state: { from: location.pathname },
                        })
                    }
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

            {/* Search Bar with Dropdown */}
            <div
                style={{
                    marginBottom: '20px',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center',
                }}
            >
                <select
                    value={searchType}
                    onChange={handleDropdownChange}
                    style={{
                        padding: '10px',
                        fontSize: '16px',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                    }}
                >
                    <option value="categories">Categories</option>
                    <option value="subcategories">Subcategories</option>
                    <option value="items">Items</option>
                </select>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder={`Search ${searchType}...`}
                    style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: '16px',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                    }}
                />
            </div>

            {/* Search Results */}
            {searchQuery && (
                <section>
                    <h3>{searchType.charAt(0).toUpperCase() + searchType.slice(1)} Results</h3>
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item) => {
                            if (searchType === 'categories') {
                                return (
                                    <div key={item.idCategory} className="dashboard-item">
                                        <span
                                            onClick={() => handleCategoryClick(item.idCategory)}
                                            style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                        >
                                            {item.Name}
                                        </span>
                                        {authState.role === 'Manager' && (
                                            <button
                                                onClick={() =>
                                                    handleEditClick('categories', item.idCategory, {
                                                        Name: item.Name,
                                                    })
                                                }
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </div>
                                );
                            } else if (searchType === 'subcategories') {
                                return (
                                    <div key={item.idSubcategory} className="dashboard-item">
                                        <span
                                            onClick={() => handleSubcategoryClick(item.idSubcategory)}
                                            style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                        >
                                            {item.Name}
                                        </span>
                                        {authState.role === 'Manager' && (
                                            <button
                                                onClick={() =>
                                                    handleEditClick('subcategories', item.idSubcategory, {
                                                        Name: item.Name,
                                                    })
                                                }
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </div>
                                );
                            } else if (searchType === 'items') {
                                return (
                                    <div key={item.idItem} className="dashboard-item">
                                        <span>{item.Name}</span>
                                        <button
                                            onClick={() => handleQuantityChange(item.idItem, -1)}
                                        >
                                            -
                                        </button>
                                        <span>{item.Quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(item.idItem, 1)}
                                        >
                                            +
                                        </button>
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
                                );
                            }
                            return null;
                        })
                    ) : (
                        <p>No {searchType} found.</p>
                    )}
                </section>
            )}

            {/* Categories Section */}
            {!searchQuery && !selectedCategory && (
                <section>
                    <h3>Categories</h3>
                    {categories.map((category) => (
                        <div key={category.idCategory} className="dashboard-item">
                            <span
                                onClick={() => handleCategoryClick(category.idCategory)}
                                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                            >
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
            {!searchQuery && selectedCategory && !selectedSubcategory && (
                <section>
                    <button onClick={() => setSelectedCategory(null)}>Back to Categories</button>
                    <h3>Subcategories</h3>
                    {subcategories.map((subcategory) => (
                        <div key={subcategory.idSubcategory} className="dashboard-item">
                            <span
                                onClick={() => handleSubcategoryClick(subcategory.idSubcategory)}
                                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                            >
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
            {!searchQuery && selectedSubcategory && (
                <section>
                    <button onClick={() => setSelectedSubcategory(null)}>Back to Subcategories</button>
                    <h3>Items</h3>
                    {items.map((item) => (
                        <div key={item.idItem} className="dashboard-item">
                            <span>{item.Name}</span>
                            <button onClick={() => handleQuantityChange(item.idItem, -1)}>-</button>
                            <span>{item.Quantity}</span>
                            <button onClick={() => handleQuantityChange(item.idItem, 1)}>+</button>
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
        </div>
    );
};

export default Dashboard;
