import React, { useState, useEffect } from 'react';
import { getCategories } from '../services/chuckNorrisApi';

const CategoryMenu = ({ onSelectCategory }) => {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoading(true);
            try {
                const fetchedCategories = await getCategories();
                setCategories(fetchedCategories);
                setError(null);
            } catch (err) {
                setError('Could not fetch categories.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (isLoading) {
        return <div>Loading categories...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <nav>
            <h2>Categories</h2>
            <ul>
                {categories.map(category => (
                    <li key={category}>
                        <button onClick={() => onSelectCategory(category)}>
                            {category}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default CategoryMenu;
