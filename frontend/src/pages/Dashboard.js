import { useState, useEffect, useContext } from 'react';
import {
    getCategories,
    getSubcategoriesByCategory,
    getItemsBySubcategory,
    getAllItems,
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
    const [filteredItems, setFilteredItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('items'); // Dropdown selection
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
            setItems(data);
            setFilteredItems(data);
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

    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        if (searchType === 'categories') {
            setFilteredItems(
                categories.filter((category) =>
                    category.Name.toLowerCase().includes(query)
                )
            );
        } else if (searchType === 'subcategories') {
            setFilteredItems(
                subcategories.filter((subcategory) =>
                    subcategory.Name.toLowerCase().includes(query)
                )
            );
        } else if (searchType === 'items') {
            setFilteredItems(
                items.filter((item) =>
                    item.Name.toLowerCase().includes(query)
                )
            );
        } else if (searchType === 'variants') {
            setFilteredItems(
                variants.filter((variant) =>
                    variant.Name.toLowerCase().includes(query)
                )
            );
        }
    };

    const handleDropdownChange = (e) => {
        setSearchType(e.target.value);
        setSearchQuery('');
        setFilteredItems([]); // Clear results on type change
    };

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
                setFilteredItems((prevItems) =>
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
        logout();
        navigate('/login');
    };

    useEffect(() => {
        fetchCategories();
        fetchAllItems();
    }, []);

    //ALL THESE NEEDED TO RESET SEARCH BAR TO NOTHING
    const handleCategoryClick = (idCategory) => {
        console.log('Category Clicked:', idCategory); // Debug log
        fetchSubcategories(idCategory);
        setSearchQuery(''); // Reset search bar
        setSearchType('subcategories'); // Adjust search type if needed
    };

    const handleSubcategoryClick = (idSubcategory) => {
        console.log('Subcategory Clicked:', idSubcategory); // Debug log
        fetchItems(idSubcategory);
        setSearchQuery(''); // Reset search bar
        setSearchType('items'); // Adjust search type if needed
    };

    const handleItemClick = (itemId) => {
        console.log('Item Clicked:', itemId); // Debug log
        if (items.find((item) => item.idItem === itemId)?.hasVariants) {
            fetchVariants(itemId);
            setSearchQuery(''); // Reset search bar
            setSearchType('variants'); // Adjust search type if needed
        }
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
                    onClick={() => navigate(`/categories/${selectedCategory || 1}/add-item`, { state: { from: location.pathname } })}
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
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
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
                    <option value="variants">Variants</option>
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
                                        {item.hasVariants ? (
                                            <span
                                                onClick={() => handleItemClick(item.idItem)}
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
                                );
                            } else if (searchType === 'variants') {
                                return (
                                    <div key={item.idVariant} className="dashboard-item">
                                        <span>{item.Name}</span>
                                        <button onClick={() => handleQuantityChange('variant', item.idVariant, -1)}>
                                            -
                                        </button>
                                        <span>{item.Quantity}</span>
                                        <button onClick={() => handleQuantityChange('variant', item.idVariant, 1)}>
                                            +
                                        </button>
                                        {authState.role === 'Manager' && (
                                            <button
                                                onClick={() =>
                                                    handleEditClick('variants', item.idVariant, {
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
            {!searchQuery && selectedSubcategory && !showVariants && (
                <section>
                    <button onClick={() => setSelectedSubcategory(null)}>Back to Subcategories</button>
                    <h3>Items</h3>
                    {items.map((item) => (
                        <div key={item.idItem} className="dashboard-item">
                            {item.hasVariants ? (
                                <span
                                    onClick={() => handleItemClick(item.idItem)}
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
