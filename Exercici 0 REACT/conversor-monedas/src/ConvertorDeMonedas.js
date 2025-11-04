import React, { useState } from "react";

export default function ConvertorDeMonedas() {
    const [cantidad, setCantidad] = useState({
        eur: 1,
        usd: 1.1,
        cny: 7.8
    })

    const ratios = {
        eur: 1,
        usd: 1.1,
        cny: 7.8
    }

    const controladorDeCambios = (valor, moneda) => {
        const cantidadEnEuro = valor / ratios[moneda];

        setCantidad({
            eur: +(cantidadEnEuro * ratios.eur).toFixed(2),
            usd: +(cantidadEnEuro * ratios.usd).toFixed(2),
            cny: +(cantidadEnEuro * ratios.cny).toFixed(2),
        });
    }

    return (<div>
        <h1>Convertor de monedas</h1>
        <div>
            <label>
                Euro:
                <input type="number" value={cantidad.eur} onChange={(e) => controladorDeCambios(parseFloat(e.target.value), "eur")}>
                </input>
            </label>
            <br />
            <br />
            <label>
                Dolar:
                <input type="number" value={cantidad.usd} onChange={(e) => controladorDeCambios(parseFloat(e.target.value), "eur")}>
                </input>
            </label>
            <br />
            <br />
            <label>
                Yuan:
                <input type="number" value={cantidad.cny} onChange={(e) => controladorDeCambios(parseFloat(e.target.value), "eur")}>
                </input>
            </label>
            <br />
            <br />
        </div>
    </div >)


}
