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
            console.error('Failed to load items:', err.message);
        }
    };

    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        if (!query.trim()) {
            setFilteredItems([]);
            return;
        }

        const dataset = searchType === 'categories'
            ? categories
            : searchType === 'subcategories'
                ? subcategories
                : items;

        const results = dataset.filter((entry) =>
            entry.Name.toLowerCase().includes(query)
        );
        setFilteredItems(results);
    };

    const handleDropdownChange = (e) => {
        const newSearchType = e.target.value;
        setSearchType(newSearchType);
        setSearchQuery('');
        setFilteredItems([]);

        if (newSearchType === 'items') fetchAllItems();
        else if (newSearchType === 'subcategories' && selectedCategory) fetchSubcategories(selectedCategory);
        else if (newSearchType === 'categories') fetchCategories();
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
        } catch (err) {
            console.error('Failed to update quantity:', err);
        }
    };

    const handleLogout = () => {
        clearState(true, true);
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
        fetchItems(idSubcategory);
        setSearchQuery('');
        setFilteredItems([]);
        setSearchType('items');
    };

    const handleBackToCategories = () => {
        setSelectedCategory(null);
        setSubcategories([]);
        setItems([]);
        fetchCategories();
        setSearchQuery('');
        setFilteredItems([]);
        setSearchType('categories');
    };

    const handleBackToSubcategories = () => {
        setSelectedSubcategory(null);
        setItems([]);
        fetchSubcategories(selectedCategory);
        setSearchQuery('');
        setFilteredItems([]);
        setSearchType('items');
    };

    const clearState = (resetCategory = false, resetSubcategory = false) => {
        setFilteredItems([]);
        setSearchQuery('');
        setSearchType('items');
        if (resetCategory) setSelectedCategory(null);
        if (resetSubcategory) setSelectedSubcategory(null);
    };

    useEffect(() => {
        fetchCategories();
        fetchAllItems();
    }, []);

    return (
        <div>
            <button onClick={handleLogout}>Logout</button>
            <button onClick={() => clearState(true, true)}>Reset View</button>

            {authState.role === 'Manager' && (
                <button onClick={() => navigate('/EditAccounts')}>Manage Accounts</button>
            )}

            {authState.role === 'Manager' && (
                <button
                    onClick={() =>
                        navigate(`/categories/${selectedCategory}/add-item`, {
                            state: { from: location.pathname },
                        })
                    }
                >
                    Add Item
                </button>
            )}

            <div>
                <select value={searchType} onChange={handleDropdownChange}>
                    <option value="categories">Categories</option>
                    <option value="subcategories">Subcategories</option>
                    <option value="items">Items</option>
                </select>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder={`Search ${searchType}...`}
                />
            </div>

            {!searchQuery && !selectedCategory && (
                <section>
                    <h3>Categories</h3>
                    {categories.map((category) => (
                        <div key={category.idCategory}>
                            <span onClick={() => handleCategoryClick(category.idCategory)}>
                                {category.Name}
                            </span>
                        </div>
                    ))}
                </section>
            )}

            {!searchQuery && selectedCategory && !selectedSubcategory && (
                <section>
                    <button onClick={handleBackToCategories}>Back to Categories</button>
                    <h3>Subcategories</h3>
                    {subcategories.map((subcategory) => (
                        <div key={subcategory.idSubcategory}>
                            <span onClick={() => handleSubcategoryClick(subcategory.idSubcategory)}>
                                {subcategory.Name}
                            </span>
                        </div>
                    ))}
                </section>
            )}

            {!searchQuery && selectedSubcategory && (
                <section>
                    <button onClick={handleBackToSubcategories}>Back to Subcategories</button>
                    <h3>Items</h3>
                    {items.map((item) => (
                        <div key={item.idItem}>
                            <span>{item.Name}</span>
                            <button onClick={() => handleQuantityChange(item.idItem, -1)}>
                                -
                            </button>
                            <span>{item.Quantity}</span>
                            <button onClick={() => handleQuantityChange(item.idItem, 1)}>
                                +
                            </button>
                        </div>
                    ))}
                </section>
            )}

            {searchQuery && (
                <section>
                    <h3>Search Results</h3>
                    {filteredItems.map((item) => (
                        <div key={item.idCategory || item.idSubcategory || item.idItem}>
                            <span>{item.Name}</span>
                        </div>
                    ))}
                </section>
            )}
        </div>
    );
};

export default Dashboard;
