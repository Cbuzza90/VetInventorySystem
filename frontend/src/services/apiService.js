import axios from 'axios';

// Create an Axios instance
const API = axios.create({
    baseURL: 'http://192.168.2.158:5000', // Replace <your-local-ip> with your actual IP address
    timeout: 5000,
});

// Add token to headers dynamically
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default API; // Export the API instance

// Named exports for specific API methods
export const getCategories = async () => {
    try {
        const response = await API.get('/categories');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error.message);
        throw new Error('Could not fetch categories. Please try again later.');
    }
};

// Get items by subcategory ID
export const getItemsBySubcategory = async (subcategoryId) => {
    try {
        const response = await API.get(`/items/${subcategoryId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching items for subcategory ID ${subcategoryId}:`, error.response?.data || error.message);
        throw new Error(`Could not fetch items for subcategory ID ${subcategoryId}. Please check the backend or data.`);
    }
};


// Get subcategories by category ID
export const getSubcategoriesByCategory = async (idCategory) => {
    try {
        const response = await API.get(`/subcategories/${idCategory}`);
        return response.data;
    } catch (error) {
        console.error(
            `Error fetching subcategories for category ID ${idCategory}:`,
            error.message
        );
        throw new Error('Could not fetch subcategories. Please try again later.');
    }
};

// Get variants by item
export const getVariantsByItem = async (itemId) => {
    try {
        const response = await API.get(`/items/variants/${itemId}`); // Ensure this matches the backend route
        return response.data;
    } catch (error) {
        console.error(`Error fetching variants for item ID ${itemId}:`, error);
        throw new Error('Could not fetch variants. Please try again later.');
    }
};

// Update item quantity
export const updateItemQuantity = async (id, increment) => {
    const response = await API.put(`/items/${id}/quantity`, {
        increment,
    });
    return response.data; // The updated item data
};

// Update variant quantity
export const updateVariantQuantity = async (id, increment) => {
    const response = await API.put(`/variants/${id}/quantity`, {
        increment,
    });
    return response.data; // The updated variant data
};

// get all items in search
export const getAllItems = async () => {
    try {
        const response = await API.get('/items'); // Correctly match the backend route
        return response.data;
    } catch (err) {
        console.error('Error fetching all items:', err);
        throw new Error('Could not fetch all items. Please try again later.');
    }
};
