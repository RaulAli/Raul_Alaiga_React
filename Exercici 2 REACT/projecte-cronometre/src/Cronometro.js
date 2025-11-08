import { useState, useRef } from 'react';

export default function Cronometro() {
    const [startTime, setStartTime] = useState(null);
    const [now, setNow] = useState(null);
    const [vueltas, setVueltas] = useState([]);
    const [corriendo, setCorriendo] = useState(false);
    const [tiempo, setTiempo] = useState(0);

    const intervalRef = useRef(null);


    function handleStart() {
        setCorriendo(true);
        setTiempo(0);
        setStartTime(Date.now());
        setNow(Date.now());
        setVueltas([]);

        clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            setNow(Date.now());
        }, 10);
    }

    function handleStop() {
        setCorriendo(false);
        clearInterval(intervalRef.current);
        setTiempo(prevTiempo => prevTiempo + (now - startTime));
    }

    function handleVueltas() {
        if (!corriendo) return;

        const tiempoTotalMs = tiempo + (now - startTime);
        const volta = tiempoTotalMs / 1000;
        setVueltas([...vueltas, volta.toFixed(3)]);
    }

    function handleReanudar() {
        setCorriendo(true);
        setStartTime(Date.now());
        setNow(Date.now());

        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setNow(Date.now());
        }, 10);
    };

    let tiempoTotalMs = tiempo;
    if (corriendo && startTime != null && now != null) {
        tiempoTotalMs += (now - startTime);
    }
    const secondsPassed = tiempoTotalMs / 1000;

    return (
        <div style={{ fontFamily: 'sans-serif', textAlign: 'center', fontSize: '1.5rem' }}>
            <h1>Cronòmetre</h1>
            <p style={{ fontSize: '3rem', margin: '20px' }}>{secondsPassed.toFixed(3)}</p>

            <button onClick={handleStart} style={{ fontSize: '1.2rem', margin: '5px', padding: '10px 20px' }}>
                Començar
            </button>

            {corriendo ? (
                <button onClick={handleStop} style={{ fontSize: '1.2rem', margin: '5px', padding: '10px 20px' }}>
                    STOP
                </button>
            ) : (
                <button onClick={handleReanudar} style={{ fontSize: '1.2rem', margin: '5px', padding: '10px 20px' }}>
                    Reanudar
                </button>
            )}

            <button onClick={handleVueltas} style={{ fontSize: '1.2rem', margin: '5px', padding: '10px 20px' }}>
                Vuelta
            </button>

            {vueltas.length > 0 && (
                <div style={{ marginTop: '30px' }}>
                    <h2>Marques</h2>
                    <ul style={{ listStyleType: 'none', padding: 0, margin: '0 auto', maxWidth: '300px' }}>
                        {vueltas.map((vueltas, index) => (
                            <li key={index} style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>
                                Marca {index + 1}: <strong>{vueltas}s</strong>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

        </div>
    );
}