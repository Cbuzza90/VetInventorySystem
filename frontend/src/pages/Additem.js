import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../services/apiService';

const AddItem = () => {
    const [type, setType] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        quantity: 0,
        categoryId: '',
        subcategoryId: '',
        itemId: '',
        hasVariants: false, // Added for tracking the checkbox
        variants: [], // Added for tracking variants
    });
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [items, setItems] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

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

    // Fetch items when a subcategory is selected
    useEffect(() => {
        if (formData.subcategoryId) {
            const fetchItems = async () => {
                try {
                    const response = await API.get(`/items/${formData.subcategoryId}`);
                    const itemsWithVariants = response.data.filter((item) => item.hasVariants);
                    setItems(itemsWithVariants);
                } catch (err) {
                    console.error('Error fetching items:', err);
                    setItems([]);
                }
            };
            fetchItems();
        } else {
            setItems([]);
        }
    }, [formData.subcategoryId]);

    const handleTypeSelect = (selectedType) => {
        setType(selectedType);
        setFormData({
            name: '',
            quantity: 0,
            categoryId: '',
            subcategoryId: '',
            itemId: '',
            hasVariants: false,
            variants: [],
        });
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleVariantChange = (index, field, value) => {
        const updatedVariants = [...formData.variants];
        updatedVariants[index][field] = value;
        setFormData((prevData) => ({
            ...prevData,
            variants: updatedVariants,
        }));
    };

    const addVariant = () => {
        setFormData((prevData) => ({
            ...prevData,
            variants: [...prevData.variants, { name: '', quantity: 0 }],
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
                    Quantity: formData.hasVariants ? 0 : formData.quantity, // Ignore quantity if variants are present
                    idSubcategory: formData.subcategoryId,
                    hasVariants: formData.hasVariants,
                    variants: formData.hasVariants ? formData.variants : [],
                };
                console.log("Payload to be sent:", payload);
                console.log("Variants array:", payload.variants);
                await API.post('/items', payload);
            } else if (type === 'variant') {
                const payload = {
                    name: formData.name, // Ensure proper key name
                    quantity: formData.quantity, // Ensure quantity is included
                    idItem: formData.itemId, // Ensure this links to the correct item
                };

                console.log("Payload for variant:", payload);

                await API.post('/variants', payload);
            }

            navigate(location.state?.from || '/');
        } catch (err) {
            console.error('Error adding entity:', err);
        }
    };

    return (
        <div>
            <h2>Add Item</h2>
            {!type && (
                <div>
                    <button onClick={() => handleTypeSelect('category')}>New Category</button>
                    <button onClick={() => handleTypeSelect('subcategory')}>New Subcategory</button>
                    <button onClick={() => handleTypeSelect('item')}>New Item</button>
                    <button onClick={() => handleTypeSelect('variant')}>New Variant</button>
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
                    {(type === 'subcategory' || type === 'item' || type === 'variant') && (
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
                    {(type === 'item' || type === 'variant') && (
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
                        <>
                            <div>
                                <label>Quantity:</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    required
                                    disabled={formData.hasVariants} // Disable if hasVariants is true
                                />
                            </div>
                            <div>
                                <label>Has Variants:</label>
                                <input
                                    type="checkbox"
                                    name="hasVariants"
                                    checked={formData.hasVariants}
                                    onChange={handleInputChange}
                                />
                            </div>
                            {formData.hasVariants && (
                                <div>
                                    <h4>Variants:</h4>
                                    {formData.variants.map((variant, index) => (
                                        <div key={index}>
                                            <label>Variant Name:</label>
                                            <input
                                                type="text"
                                                value={variant.name}
                                                onChange={(e) =>
                                                    handleVariantChange(index, 'name', e.target.value)
                                                }
                                            />
                                            <label>Quantity:</label>
                                            <input
                                                type="number"
                                                value={variant.quantity}
                                                onChange={(e) =>
                                                    handleVariantChange(index, 'quantity', e.target.value)
                                                }
                                            />
                                        </div>
                                    ))}
                                    <button type="button" onClick={addVariant}>
                                        Add Another Variant
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                    {type === 'variant' && (
                        <div>
                            <label>Item:</label>
                            <select
                                name="itemId"
                                value={formData.itemId}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Item</option>
                                {items.map((item) => (
                                    <option key={item.idItem} value={item.idItem}>
                                        {item.Name}
                                    </option>
                                ))}
                            </select>
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
