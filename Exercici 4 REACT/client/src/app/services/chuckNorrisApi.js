const API_URL = 'http://localhost:5000'; // Using the backend server URL

export const getCategories = async () => {
    try {
        const response = await fetch(`${API_URL}/api/chuck/categories`);
        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

export const getJokesFromCategory = async (category, count = 1) => {
    try {
        const jokePromises = [];
        for (let i = 0; i < count; i++) {
            jokePromises.push(
                fetch(`${API_URL}/api/chuck/joke/${category}`).then(res => res.json())
            );
        }
        return await Promise.all(jokePromises);
    } catch (error) {
        console.error(`Error fetching jokes for category ${category}:`, error);
        throw error;
    }
};
