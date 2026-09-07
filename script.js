const pokeContainer = document.querySelector("#pokeContainer");

const pokemonCount = 151;

const search = document.querySelector("#search");
const typeFilter = document.querySelector("#typeFilter");

const detailsOverlay = document.querySelector("#detailsOverlay");
const detailsContent = document.querySelector("#detailsContent");
const closeDetails = document.querySelector("#closeDetails");

const randomPokemon = document.querySelector("#randomPokemon");

const guessGame = document.querySelector("#guessGame");
const gameOverlay = document.querySelector("#gameOverlay");
const closeGame = document.querySelector("#closeGame");
const gameImage = document.querySelector("#gameImage");
const guessInput = document.querySelector("#guessInput");
const guessButton = document.querySelector("#guessButton");
const gameResult = document.querySelector("#gameResult");
const scoreElement = document.querySelector("#score");

const colors = {
    fire: '#f5cbc8',
    grass: '#DEFDE0',
    electric: '#FCF7DE',
    water: '#c7ebfc',
    ground: '#caaf94',
    rock: '#bdbd7c',
    fairy: '#e6b7df',
    poison: '#97e4a6',
    bug: '#a2d19d',
    dragon: '#97b3e6',
    psychic: '#f8bcee',
    flying: '#F5F5F5',
    fighting: '#E6E0D4',
    normal: '#F5F5F5',
    ice: '#ccecff',
    ghost: '#c9b6e4',
    dark: '#a9a9a9',
    steel: '#d0d0d0'
};

const mainTypes = Object.keys(colors);

const fetchPokemons = async () => {
    for (let i = 1; i <= pokemonCount; i++) {
        await getPokemon(i);
    }
};

const getPokemon = async (id) => {
    const url = `https://pokeapi.co/api/v2/pokemon/${id}`;

    const resp = await fetch(url);
    const data = await resp.json();

    createPokemonCard(data);
};

const createPokemonCard = (poke) => {
    const card = document.createElement("div");

    card.classList.add("pokemon");

    card.dataset.name = poke.name;
    card.dataset.id = poke.id;

    const name = poke.name[0].toUpperCase() + poke.name.slice(1);
    const id = poke.id.toString().padStart(3, "0");

    const pokeTypes = poke.types.map(type => type.type.name);

    card.dataset.types = pokeTypes.join(",");

    const type = mainTypes.find(type => pokeTypes.includes(type)) || pokeTypes[0];
    const color = colors[type] || "#eee";

    card.style.backgroundColor = color;

    const pokemonInnerHTML = `
        <div class="imgContainer">
            <img
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.id}.png"
                alt="${name}"
            >
        </div>

        <div class="info">
            <span class="number">#${id}</span>
            <h3 class="name">${name}</h3>
            <small class="type">Type: ${type}</small>
        </div>
    `;

    card.innerHTML = pokemonInnerHTML;

    pokeContainer.appendChild(card);

    card.addEventListener("click", () => {
        showPokemonDetails(poke);
    });
};

const filterPokemons = () => {
    const searchValue = search.value.toLowerCase().trim();
    const selectedType = typeFilter.value;

    const pokemons = document.querySelectorAll(".pokemon");

    pokemons.forEach(pokemon => {
        const name = pokemon.dataset.name;
        const id = pokemon.dataset.id;
        const types = pokemon.dataset.types.split(",");

        const matchesSearch =
            name.includes(searchValue) || id.includes(searchValue);

        const matchesType =
            selectedType === "all" || types.includes(selectedType);

        if (matchesSearch && matchesType) {
            pokemon.style.display = "";
        } else {
            pokemon.style.display = "none";
        }
    });
};

const showPokemonDetails = (poke) => {
    const name = poke.name[0].toUpperCase() + poke.name.slice(1);
    const id = poke.id.toString().padStart(3, "0");

    const types = poke.types
        .map(type => type.type.name)
        .join(" / ");

    const stats = {
        hp: poke.stats[0].base_stat,
        attack: poke.stats[1].base_stat,
        defense: poke.stats[2].base_stat,
        speed: poke.stats[5].base_stat
    };

    detailsContent.innerHTML = `
        <span class="detailsNumber">#${id}</span>

        <img
            class="detailsImage"
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${poke.id}.png"
            alt="${name}"
        >

        <h2 class="detailsName">${name}</h2>

        <div class="detailsType">
            ${types}
        </div>

        <div class="stats">

            <div class="stat">
                <strong>❤️ HP</strong>

                <div class="statBar">
                    <div
                        class="statFill"
                        style="width: ${Math.min(stats.hp, 100)}%"
                    ></div>
                </div>

                <span>${stats.hp}</span>
            </div>

            <div class="stat">
                <strong>⚔️ Ataque</strong>

                <div class="statBar">
                    <div
                        class="statFill"
                        style="width: ${Math.min(stats.attack, 100)}%"
                    ></div>
                </div>

                <span>${stats.attack}</span>
            </div>

            <div class="stat">
                <strong>🛡️ Defesa</strong>

                <div class="statBar">
                    <div
                        class="statFill"
                        style="width: ${Math.min(stats.defense, 100)}%"
                    ></div>
                </div>

                <span>${stats.defense}</span>
            </div>

            <div class="stat">
                <strong>⚡ Velocidade</strong>

                <div class="statBar">
                    <div
                        class="statFill"
                        style="width: ${Math.min(stats.speed, 100)}%"
                    ></div>
                </div>

                <span>${stats.speed}</span>
            </div>

        </div>
    `;

    detailsOverlay.classList.add("active");
};

search.addEventListener("input", filterPokemons);

typeFilter.addEventListener("change", filterPokemons);

randomPokemon.addEventListener("click", () => {
    const randomId = Math.floor(Math.random() * pokemonCount) + 1;

    const pokemon = document.querySelector(
        `.pokemon[data-id="${randomId}"]`
    );

    if (pokemon) {
        pokemon.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        pokemon.click();
    }
});

closeDetails.addEventListener("click", () => {
    detailsOverlay.classList.remove("active");
});

detailsOverlay.addEventListener("click", (event) => {
    if (event.target === detailsOverlay) {
        detailsOverlay.classList.remove("active");
    }
});

let currentPokemon;
let score = 0;

const startGame = () => {
    const randomId = Math.floor(Math.random() * pokemonCount) + 1;

    currentPokemon = randomId;

    gameImage.src =
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${randomId}.png`;

    gameImage.style.filter = "brightness(0)";

    guessInput.value = "";
    gameResult.textContent = "";

    gameOverlay.classList.add("active");

    guessInput.focus();
};

guessGame.addEventListener("click", startGame);

guessButton.addEventListener("click", async () => {
    const answer = guessInput.value.toLowerCase().trim();

    if (!answer) {
        return;
    }

    const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${currentPokemon}`
    );

    const pokemon = await response.json();

    if (answer === pokemon.name) {
        score++;

        scoreElement.textContent = score;

        gameImage.style.filter = "brightness(1)";

        gameResult.textContent = "🎉 ACERTOU!";

        setTimeout(startGame, 1500);
    } else {
        gameResult.textContent = "❌ Errou! Tente novamente!";
    }
});

closeGame.addEventListener("click", () => {
    gameOverlay.classList.remove("active");
});

gameOverlay.addEventListener("click", (event) => {
    if (event.target === gameOverlay) {
        gameOverlay.classList.remove("active");
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        detailsOverlay.classList.remove("active");
        gameOverlay.classList.remove("active");
    }
});

fetchPokemons();


