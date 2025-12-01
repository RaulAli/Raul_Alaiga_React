import React from 'react';

const JokeList = ({ jokes }) => {
    if (!jokes.length) {
        return <p>Select a category to see some jokes!</p>;
    }

    return (
        <div className="joke-list">
            {jokes.map((joke, index) => (
                <div key={`${joke.id}-${index}`} className="joke">
                    <p>{joke.value}</p>
                </div>
            ))}
        </div>
    );
};

export default JokeList;
