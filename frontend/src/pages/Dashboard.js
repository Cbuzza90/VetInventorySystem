import { useState, useEffect, useContext } from 'react';
import {
    getCategories,
    getSubcategoriesByCategory,
    getItemsBySubcategory,
    getVariantsByItem,
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
    const { authState } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Fetch all categories
    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (err) {
            console.error('Failed to load categories');
        }
    };

    // Fetch subcategories for a selected category
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

    // Fetch items for a selected subcategory
    const fetchItems = async (subcategoryId) => {
        try {
            const data = await getItemsBySubcategory(subcategoryId);
            setItems(data);
            setSelectedSubcategory(subcategoryId);
        } catch (err) {
            console.error('Failed to load items');
        }
    };

    // Fetch variants for a selected item
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
                entity: entityData, // Pass the entity data here
            },
        });
    };


    return (
        <div>
            <h2>Dashboard</h2>

            {/* Categories Section */}
            {!selectedCategory && (
                <section>
                    <h3>Categories</h3>
                    <ul>
                        {categories.map((category) => (
                            <li key={category.idCategory}>
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
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Items Section */}
            {selectedSubcategory && !showVariants && (
                <section>
                    <button onClick={() => setSelectedSubcategory(null)}>Back to Subcategories</button>
                    <h3>Items</h3>
                    <ul>
                        {items.map((item) => (
                            <li key={item.idItem}>
                                <span
                                    onClick={() => fetchVariants(item.idItem)}
                                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    {item.Name}
                                </span>
                                <span> - {item.Quantity} in stock</span>
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
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Variants Section */}
            {showVariants && (
                <section>
                    <button onClick={goBackToItems}>Back to Items</button>
                    <h3>Variants for {items.find((item) => item.idItem === selectedItemId)?.Name}</h3>
                    <ul>
                        {variants.map((variant) => (
                            <li key={variant.idVariant}>
                                {variant.Name} - {variant.Quantity} in stock
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
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
};

export default Dashboard;
