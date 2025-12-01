// src/app/services/libreTranslateApi.js
const apiUrl = '/api'; // Using relative path to proxy through the backend

export const translateText = async (text, source, target) => {
    if (!text) return '';

    // Don't translate if source and target are the same
    if (source === target) return text;

    try {
        const res = await fetch(`${apiUrl}/translate`, {
            method: 'POST',
            body: JSON.stringify({
                q: text,
                source,
                target,
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!res.ok) {
            const errorData = await res.json();
            console.error('Translation API request failed:', errorData);
            throw new Error(`Translation API request failed with status ${res.status}`);
        }

        const data = await res.json();
        return data.translatedText;

    } catch (error) {
        console.error('Error translating text:', error.message);
        // Return original text if translation fails
        return text;
    }
};
