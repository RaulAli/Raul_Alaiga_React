import React, { useState, useEffect, useCallback } from 'react';
import CategoryMenu from '../../components/CategoryMenu';
import JokeList from '../../components/JokeList';
import { getJokesFromCategory } from '../../services/chuckNorrisApi';
import { translateText } from '../../services/libreTranslateApi';
import { useAuth } from '../../context/AuthContext';

const JokesPage = () => {
    const [jokes, setJokes] = useState([]);
    const [translatedJokes, setTranslatedJokes] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [language, setLanguage] = useState('en'); // Default language
    const [isLoading, setIsLoading] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [error, setError] = useState(null);
    
    const { user, token } = useAuth();

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'it', name: 'Italian' },
        { code: 'pt', name: 'Portuguese' },
    ];

    const logActivity = useCallback(async (jokesToLog) => {
        if (!token || !selectedCategory) return;
        try {
            for (const joke of jokesToLog) {
                await fetch('http://localhost:5000/api/user/activity', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    // Log the original English joke
                    body: JSON.stringify({ category: selectedCategory, joke: joke.value })
                });
            }
        } catch (error) {
            console.error('Failed to log activity:', error);
        }
    }, [token, selectedCategory]);

    useEffect(() => {
        if (selectedCategory) {
            const fetchJokes = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const fetchedJokes = await getJokesFromCategory(selectedCategory, 2);
                    setJokes(fetchedJokes);
                    logActivity(fetchedJokes);
                } catch (err) {
                    setError(`Failed to fetch jokes for ${selectedCategory}.`);
                    setJokes([]); // Clear previous jokes on error
                } finally {
                    setIsLoading(false);
                }
            };
            fetchJokes();
        }
    }, [selectedCategory, logActivity]);

    useEffect(() => {
        const translateJokes = async () => {
            if (jokes.length === 0) {
                setTranslatedJokes([]);
                return;
            }

            if (language === 'en') {
                setTranslatedJokes(jokes.map(j => ({ ...j, translatedValue: j.value })));
                return;
            }

            setIsTranslating(true);
            try {
                const translated = await Promise.all(
                    jokes.map(async (joke) => {
                        const translatedText = await translateText(joke.value, 'en', language);
                        return { ...joke, translatedValue: translatedText };
                    })
                );
                setTranslatedJokes(translated);
            } catch (err) {
                setError('Failed to translate jokes.');
                // Fallback to original jokes if translation fails
                setTranslatedJokes(jokes.map(j => ({ ...j, translatedValue: j.value })));
            } finally {
                setIsTranslating(false);
            }
        };

        translateJokes();
    }, [jokes, language]);

    const handleSelectCategory = (category) => {
        setSelectedCategory(category);
    };

    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
    };

    return (
        <div className="jokes-page">
            <aside>
                <CategoryMenu onSelectCategory={handleSelectCategory} />
            </aside>
            <main>
                <header className="jokes-header">
                    <h1>Chuck Norris Jokes</h1>
                    <div className="language-selector">
                        <label htmlFor="language">Language: </label>
                        <select id="language" value={language} onChange={handleLanguageChange}>
                            {languages.map((lang) => (
                                <option key={lang.code} value={lang.code}>{lang.name}</option>
                            ))}
                        </select>
                    </div>
                </header>
                {(isLoading || isTranslating) && <p>Loading...</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <JokeList jokes={translatedJokes.map(j => ({...j, value: j.translatedValue}))} />
            </main>
        </div>
    );
};

export default JokesPage;
