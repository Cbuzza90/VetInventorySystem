import axios from 'axios';

// Create an Axios instance
// Create an Axios instance
const API = axios.create({
    baseURL: 'http://localhost:5000',
    timeout: 5000,
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`, // Assuming token is stored in localStorage
    },
});


// Get all categories
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
        console.error(`Error fetching items for subcategory ID ${subcategoryId}:`, error.message);
        throw new Error('Could not fetch items. Please try again later.');
    }
};
