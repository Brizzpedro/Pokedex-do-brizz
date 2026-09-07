const pokeContainer = document.querySelector("#pokeContainer");

const pokemonCount = 1025;

const search = document.querySelector("#search");
const typeFilter = document.querySelector("#typeFilter");

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
    normal: '#F5F5F5'
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
    const card = document.createElement('div');

    card.classList.add('pokemon');

    card.dataset.name = poke.name;
    card.dataset.id = poke.id;

    const name = poke.name[0].toUpperCase() + poke.name.slice(1);
    const id = poke.id.toString().padStart(3, '0');

    const pokeTypes = poke.types.map(type => type.type.name);

    card.dataset.types = pokeTypes.join(",");

    const type = mainTypes.find(type => pokeTypes.indexOf(type) > -1);
    const color = colors[type];

    card.style.backgroundColor = color;

    const pokemonInnerHTML = `
        <div class="imgContainer">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.id}.png" alt="${name}">
        </div>

        <div class="info">
            <span class="number">#${id}</span>
            <h3 class="name">${name}</h3>
            <small class="type">Type: ${type}</small>
        </div>
    `;

    card.innerHTML = pokemonInnerHTML;

    pokeContainer.appendChild(card);
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

search.addEventListener("input", filterPokemons);

typeFilter.addEventListener("change", filterPokemons);

fetchPokemons();
