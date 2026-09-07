```css
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap');

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Roboto', sans-serif;
}

body {
    min-height: 100vh;
    color: #ffffff;
    background:
        radial-gradient(circle at top left, #31245c 0%, transparent 35%),
        radial-gradient(circle at bottom right, #471f55 0%, transparent 35%),
        #0d0b18;
}

.header {
    padding: 40px 7%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.logo {
    display: flex;
    flex-direction: column;
    line-height: 0.9;
}

.logo span {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 5px;
    opacity: 0.7;
}

.logo strong {
    font-size: 42px;
    font-weight: 900;
    letter-spacing: 2px;
}

.header p {
    color: #aaa5b9;
    font-size: 15px;
}

main {
    width: 86%;
    max-width: 1500px;
    margin: auto;
}

.controls {
    display: flex;
    gap: 12px;
    padding: 35px 0 20px;
    flex-wrap: wrap;
}

.searchBox {
    flex: 1;
    min-width: 250px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
}

.searchBox input {
    width: 100%;
    border: none;
    outline: none;
    color: white;
    background: transparent;
    font-size: 15px;
}

.searchBox input::placeholder {
    color: #8d8998;
}

select,
.controls button {
    border: none;
    outline: none;
    padding: 14px 18px;
    border-radius: 14px;
    color: white;
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid rgba(255, 255, 255, 0.08);
    cursor: pointer;
    font-weight: 700;
    transition: 0.2s;
}

select {
    min-width: 170px;
}

select option {
    color: #111;
}

.controls button:hover,
select:hover {
    background: rgba(255, 255, 255, 0.13);
    transform: translateY(-2px);
}

.generations {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    padding: 10px 0 35px;
}

.generation {
    min-width: 50px;
    padding: 10px 15px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.05);
    color: #aaa5b9;
    cursor: pointer;
    font-weight: 700;
    transition: 0.2s;
}

.generation:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
}

.generation.active {
    color: white;
    background: #6d4aff;
    border-color: #6d4aff;
}

.regionTitle {
    margin-bottom: 25px;
}

.regionTitle span {
    color: #8e7cff;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 3px;
}

.regionTitle h2 {
    font-size: 34px;
    margin-top: 5px;
}

.regionTitle p {
    color: #777283;
    margin-top: 5px;
}

.pokeContainer {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: 18px;
    padding-bottom: 60px;
}

.pokemon {
    position: relative;
    overflow: hidden;
    padding: 20px;
    min-height: 260px;
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    cursor: pointer;
    transition: 0.25s;
}

.pokemon:hover {
    transform: translateY(-7px);
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.09);
}

.pokemon .number {
    color: rgba(255, 255, 255, 0.4);
    font-size: 13px;
    font-weight: 700;
}

.pokemon .name {
    margin-top: 5px;
    font-size: 21px;
    font-weight: 900;
    text-transform: capitalize;
}

.imgContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 175px;
}

.imgContainer img {
    width: 160px;
    height: 160px;
    object-fit: contain;
    transition: 0.25s;
}

.pokemon:hover .imgContainer img {
    transform: scale(1.08);
}

.type {
    display: inline-block;
    padding: 6px 10px;
    margin: 3px 3px 0 0;
    border-radius: 8px;
    color: #222;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
}

.detailsOverlay,
.gameOverlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(4, 3, 10, 0.85);
    backdrop-filter: blur(10px);
}

.detailsOverlay.active,
.gameOverlay.active {
    display: flex;
}

.detailsCard,
.gameCard {
    position: relative;
    width: 100%;
    max-width: 700px;
    max-height: 90vh;
    overflow-y: auto;
    padding: 35px;
    border-radius: 28px;
    background: #15121f;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
}

.closeDetails,
.closeGame {
    position: absolute;
    top: 18px;
    right: 18px;
    width: 38px;
    height: 38px;
    border: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    color: white;
    font-size: 18px;
    cursor: pointer;
}

.detailsHeader {
    text-align: center;
}

.detailsHeader img {
    width: 220px;
    height: 220px;
    object-fit: contain;
}

.detailsNumber {
    color: #8170ff;
    font-size: 14px;
    font-weight: 700;
}

.detailsName {
    margin: 5px 0 12px;
    font-size: 34px;
    font-weight: 900;
    text-transform: capitalize;
}

.detailsTypes {
    margin-bottom: 25px;
}

.stats {
    margin-top: 20px;
}

.stats h3,
.evolutionSection h3 {
    margin-bottom: 15px;
    font-size: 17px;
}

.stat {
    margin-bottom: 12px;
}

.statTop {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    color: #aaa5b9;
    font-size: 13px;
}

.statBar {
    height: 7px;
    overflow: hidden;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.08);
}

.statFill {
    height: 100%;
    border-radius: 10px;
    background: linear-gradient(90deg, #6d4aff, #9b7cff);
}

.evolutionSection {
    margin-top: 35px;
    padding-top: 25px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.evolutionChain {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    flex-wrap: wrap;
}

.evolutionItem {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 115px;
    padding: 12px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.05);
    cursor: pointer;
    transition: 0.2s;
}

.evolutionItem:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.1);
}

.evolutionItem img {
    width: 90px;
    height: 90px;
    object-fit: contain;
}

.evolutionItem span {
    margin-top: 5px;
    font-size: 14px;
    font-weight: 800;
    text-transform: capitalize;
}

.evolutionNumber {
    color: #777283;
    font-size: 11px;
}

.evolutionArrow {
    color: #8170ff;
    font-size: 25px;
    font-weight: 900;
}

.noEvolution {
    padding: 18px;
    text-align: center;
    color: #888291;
    border-radius: 15px;
    background: rgba(255, 255, 255, 0.04);
}

.gameCard {
    max-width: 450px;
    text-align: center;
}

.gameCard h2 {
    margin-bottom: 20px;
}

.gameImage {
    width: 250px;
    height: 250px;
    object-fit: contain;
    margin-bottom: 20px;
}

.gameCard input {
    width: 100%;
    padding: 14px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    outline: none;
    color: white;
    background: rgba(255, 255, 255, 0.06);
    text-align: center;
    font-size: 15px;
}

.gameCard > button:not(.closeGame) {
    width: 100%;
    margin-top: 10px;
    padding: 14px;
    border: none;
    border-radius: 12px;
    color: white;
    background: #6d4aff;
    cursor: pointer;
    font-weight: 800;
}

#gameResult {
    min-height: 25px;
    margin-top: 15px;
    font-weight: 700;
}

.score {
    margin-top: 10px;
    color: #aaa5b9;
}

@media (max-width: 700px) {
    .header {
        align-items: flex-start;
        flex-direction: column;
        gap: 10px;
        padding: 30px 7%;
    }

    .logo strong {
        font-size: 34px;
    }

    .controls {
        flex-direction: column;
    }

    .controls button,
    select {
        width: 100%;
    }

    .pokeContainer {
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
    }

    .pokemon {
        min-height: 220px;
        padding: 14px;
    }

    .imgContainer {
        height: 140px;
    }

    .imgContainer img {
        width: 125px;
        height: 125px;
    }

    .detailsCard,
    .gameCard {
        padding: 25px 18px;
    }

    .detailsHeader img {
        width: 180px;
        height: 180px;
    }

    .evolutionChain {
        flex-direction: column;
    }

    .evolutionArrow {
        transform: rotate(90deg);
    }
}
