import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getItemsBySubcategory } from '../services/apiService';

const Items = () => {
    const { categoryId } = useParams(); // Get category ID from the URL
    const [items, setItems] = useState([]);

    useEffect(() => {
        async function fetchItems() {
            const data = await getItemsBySubcategory(categoryId);
            setItems(data);
        }
        fetchItems();
    }, [categoryId]);

    return (
        <div>
            <h2>Items for Category {categoryId}</h2>
            <ul>
                {items.map((item) => (
                    <li key={item.idItem}>
                        {item.Name} - {item.Quantity} in stock
                    </li>
                ))}
            </ul>
            {/* Add a link to go back to categories */}
            <Link to="/">Back to Categories</Link>
        </div>
    );
};

export default Items;
