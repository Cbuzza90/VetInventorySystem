import { useState, useEffect } from 'react';
import { getCategories } from '../services/apiService';
import { Link } from 'react-router-dom';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (err) {
            setError('Failed to load categories');
        }
    };

    // Fetch categories when the component loads
    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <div>
            <h2>Categories</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <ul>
                {categories.map((category) => (
                    <li key={category.idCategory}>
                        <Link to={`/items/${category.idCategory}`}>{category.Name}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Categories;
