const pokeContainer = document.querySelector("#pokeContainer");

const pokemonCount = 1025;

const search = document.querySelector("#search");
const typeFilter = document.querySelector("#typeFilter");

const generations = document.querySelectorAll(".generation");
const regionGeneration = document.querySelector("#regionGeneration");
const regionName = document.querySelector("#regionName");
const regionNumber = document.querySelector("#regionNumber");

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
    fire: "#f5cbc8",
    grass: "#DEFDE0",
    electric: "#FCF7DE",
    water: "#c7ebfc",
    ground: "#caaf94",
    rock: "#bdbd7c",
    fairy: "#e6b7df",
    poison: "#97e4a6",
    bug: "#a2d19d",
    dragon: "#97b3e6",
    psychic: "#f8bcee",
    flying: "#F5F5F5",
    fighting: "#E6E0D4",
    normal: "#F5F5F5",
    ice: "#ccecff",
    ghost: "#c9b6e4",
    dark: "#a9a9a9",
    steel: "#d0d0d0"
};

const generationData = {
    all: {
        name: "Pokémon",
        roman: "TODOS OS POKÉMON",
        start: 1,
        end: 1025
    },
    1: {
        name: "Kanto",
        roman: "GERAÇÃO I",
        start: 1,
        end: 151
    },
    2: {
        name: "Johto",
        roman: "GERAÇÃO II",
        start: 152,
        end: 251
    },
    3: {
        name: "Hoenn",
        roman: "GERAÇÃO III",
        start: 252,
        end: 386
    },
    4: {
        name: "Sinnoh",
        roman: "GERAÇÃO IV",
        start: 387,
        end: 493
    },
    5: {
        name: "Unova",
        roman: "GERAÇÃO V",
        start: 494,
        end: 649
    },
    6: {
        name: "Kalos",
        roman: "GERAÇÃO VI",
        start: 650,
        end: 721
    },
    7: {
        name: "Alola",
        roman: "GERAÇÃO VII",
        start: 722,
        end: 809
    },
    8: {
        name: "Galar",
        roman: "GERAÇÃO VIII",
        start: 810,
        end: 905
    },
    9: {
        name: "Paldea",
        roman: "GERAÇÃO IX",
        start: 906,
        end: 1025
    }
};

let selectedGeneration = "all";
let allPokemons = [];
let gamePokemon = null;
let score = 0;

const formatNumber = (number) => {
    return `#${String(number).padStart(3, "0")}`;
};

const normalizeName = (name) => {
    return name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
};

const getPokemonId = (url) => {
    const parts = url.split("/");
    return Number(parts[parts.length - 2]);
};

const createPokemonCard = (pokemon) => {
    const pokemonElement = document.createElement("div");

    pokemonElement.classList.add("pokemon");

    pokemonElement.dataset.name = pokemon.name;
    pokemonElement.dataset.id = pokemon.id;
    pokemonElement.dataset.types = pokemon.types.join(",");

    const typeColor = colors[pokemon.types[0]] || "#ffffff";

    pokemonElement.style.boxShadow =
        `inset 0 0 0 1px ${typeColor}22`;

    const typesHTML = pokemon.types
        .map(type => {
            return `
                <span
                    class="type"
                    style="background-color: ${colors[type] || "#ffffff"}"
                >
                    ${type}
                </span>
            `;
        })
        .join("");

    pokemonElement.innerHTML = `
        <span class="number">
            ${formatNumber(pokemon.id)}
        </span>

        <div class="imgContainer">
            <img
                src="${pokemon.image}"
                alt="${pokemon.name}"
            >
        </div>

        <div class="name">
            ${pokemon.name}
        </div>

        <div>
            ${typesHTML}
        </div>
    `;

    pokemonElement.addEventListener("click", () => {
        showPokemonDetails(pokemon);
    });

    pokeContainer.appendChild(pokemonElement);
};

const fetchPokemon = async (id) => {
    try {
        const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${id}`
        );

        if (!response.ok) {
            throw new Error("Pokémon não encontrado");
        }

        const data = await response.json();

        return {
            id: data.id,
            name: data.name,

            image:
                data.sprites.front_default ||
                data.sprites.front_shiny,

            artwork:
                data.sprites.other["official-artwork"].front_default ||
                data.sprites.front_default,

            types: data.types.map(type => type.type.name),

            stats: {
                hp: data.stats[0].base_stat,
                attack: data.stats[1].base_stat,
                defense: data.stats[2].base_stat,
                speed: data.stats[5].base_stat
            }
        };
    } catch (error) {
        console.error("Erro ao carregar Pokémon:", error);
        return null;
    }
};

const fetchPokemons = async () => {
    pokeContainer.innerHTML = "";
    allPokemons = [];

    for (let i = 1; i <= pokemonCount; i++) {
        const pokemon = await fetchPokemon(i);

        if (pokemon) {
            allPokemons.push(pokemon);
            createPokemonCard(pokemon);
        }
    }

    filterPokemons();
};

const updateGeneration = (generation) => {
    selectedGeneration = generation;

    const data = generationData[generation];

    regionGeneration.textContent = data.roman;
    regionName.textContent = data.name;

    regionNumber.textContent =
        `${formatNumber(data.start)} — ${formatNumber(data.end)}`;

    generations.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.generation === generation
        );
    });

    filterPokemons();
};

const filterPokemons = () => {
    const searchValue = normalizeName(search.value);
    const selectedType = typeFilter.value;

    const generation = generationData[selectedGeneration];

    const pokemonElements =
        document.querySelectorAll(".pokemon");

    pokemonElements.forEach(element => {
        const id = Number(element.dataset.id);
        const name = normalizeName(element.dataset.name);
        const types = element.dataset.types.split(",");

        const matchesSearch =
            name.includes(searchValue) ||
            String(id).includes(searchValue);

        const matchesType =
            selectedType === "all" ||
            types.includes(selectedType);

        const matchesGeneration =
            id >= generation.start &&
            id <= generation.end;

        element.style.display =
            matchesSearch &&
            matchesType &&
            matchesGeneration
                ? ""
                : "none";
    });
};

const getEvolutionData = async (pokemonId) => {
    try {
        const speciesResponse = await fetch(
            `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`
        );

        if (!speciesResponse.ok) {
            throw new Error("Espécie não encontrada");
        }

        const speciesData = await speciesResponse.json();

        const evolutionResponse = await fetch(
            speciesData.evolution_chain.url
        );

        if (!evolutionResponse.ok) {
            throw new Error("Linha evolutiva não encontrada");
        }

        const evolutionData = await evolutionResponse.json();

        return evolutionData.chain;
    } catch (error) {
        console.error("Erro nas evoluções:", error);
        return null;
    }
};

const flattenEvolutionChain = (chain) => {
    const result = [];

    const processStage = (stage) => {
        const id = getPokemonId(stage.species.url);

        result.push({
            id,
            name: stage.species.name,
            details: stage.evolution_details
        });

        stage.evolves_to.forEach(nextStage => {
            processStage(nextStage);
        });
    };

    processStage(chain);

    return result;
};

const getEvolutionMethod = (details) => {
    if (!details || !details.length) {
        return "";
    }

    const evolution = details[0];

    if (evolution.min_level) {
        return `Nível ${evolution.min_level}`;
    }

    if (evolution.item) {
        return evolution.item.name
            .replace(/-/g, " ");
    }

    if (evolution.trigger?.name === "trade") {
        return "Troca";
    }

    if (evolution.trigger?.name === "use-item") {
        return "Usar item";
    }

    if (evolution.min_happiness) {
        return "Felicidade";
    }

    if (evolution.min_affection) {
        return "Afeto";
    }

    if (evolution.time_of_day) {
        return evolution.time_of_day === "day"
            ? "Durante o dia"
            : "Durante a noite";
    }

    if (evolution.known_move) {
        return `Movimento: ${evolution.known_move.name}`;
    }

    if (evolution.location) {
        return "Local específico";
    }

    return "";
};

const createEvolutionCard = (evolution) => {
    const pokemon =
        allPokemons.find(item => item.id === evolution.id);

    const image =
        pokemon?.image ||
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evolution.id}.png`;

    const method =
        getEvolutionMethod(evolution.details);

    return `
        <div
            class="evolutionItem"
            data-evolution-id="${evolution.id}"
        >
            <img
                src="${image}"
                alt="${evolution.name}"
            >

            <span class="evolutionNumber">
                ${formatNumber(evolution.id)}
            </span>

            <span>
                ${evolution.name}
            </span>

            ${
                method
                    ? `<small>${method}</small>`
                    : ""
            }
        </div>
    `;
};

const getEvolutionHtml = async (pokemon) => {
    const chain = await getEvolutionData(pokemon.id);

    if (!chain) {
        return `
            <div class="noEvolution">
                Não foi possível carregar as evoluções.
            </div>
        `;
    }

    const evolutions = flattenEvolutionChain(chain);

    if (evolutions.length <= 1) {
        return `
            <div class="noEvolution">
                ✨ Este Pokémon não possui evoluções.
            </div>
        `;
    }

    const chainHTML = evolutions
        .map((evolution, index) => {
            const arrow =
                index > 0
                    ? `<span class="evolutionArrow">→</span>`
                    : "";

            return `
                ${arrow}
                ${createEvolutionCard(evolution)}
            `;
        })
        .join("");

    return `
        <div class="evolutionChain">
            ${chainHTML}
        </div>
    `;
};

const showPokemonDetails = async (pokemon) => {
    detailsOverlay.classList.add("active");

    detailsContent.innerHTML = `
        <div class="detailsHeader">

            <img
                src="${pokemon.artwork}"
                alt="${pokemon.name}"
            >

            <div class="detailsNumber">
                ${formatNumber(pokemon.id)}
            </div>

            <div class="detailsName">
                ${pokemon.name}
            </div>

            <div class="detailsTypes">
                ${pokemon.types
                    .map(type => `
                        <span
                            class="type"
                            style="background-color: ${colors[type] || "#ffffff"}"
                        >
                            ${type}
                        </span>
                    `)
                    .join("")}
            </div>

        </div>

        <div class="stats">

            <h3>Status</h3>

            <div class="stat">
                <div class="statTop">
                    <span>HP</span>
                    <span>${pokemon.stats.hp}</span>
                </div>

                <div class="statBar">
                    <div
                        class="statFill"
                        style="width: ${Math.min(pokemon.stats.hp, 150) / 150 * 100}%"
                    ></div>
                </div>
            </div>

            <div class="stat">
                <div class="statTop">
                    <span>Ataque</span>
                    <span>${pokemon.stats.attack}</span>
                </div>

                <div class="statBar">
                    <div
                        class="statFill"
                        style="width: ${Math.min(pokemon.stats.attack, 150) / 150 * 100}%"
                    ></div>
                </div>
            </div>

            <div class="stat">
                <div class="statTop">
                    <span>Defesa</span>
                    <span>${pokemon.stats.defense}</span>
                </div>

                <div class="statBar">
                    <div
                        class="statFill"
                        style="width: ${Math.min(pokemon.stats.defense, 150) / 150 * 100}%"
                    ></div>
                </div>
            </div>

            <div class="stat">
                <div class="statTop">
                    <span>Velocidade</span>
                    <span>${pokemon.stats.speed}</span>
                </div>

                <div class="statBar">
                    <div
                        class="statFill"
                        style="width: ${Math.min(pokemon.stats.speed, 150) / 150 * 100}%"
                    ></div>
                </div>
            </div>

        </div>

        <div class="evolutionSection">

            <h3>🧬 Linha evolutiva</h3>

            <div id="evolutionContent">

                <div class="noEvolution">
                    Carregando evoluções...
                </div>

            </div>

        </div>
    `;

    const evolutionContent =
        document.querySelector("#evolutionContent");

    const evolutionHTML =
        await getEvolutionHtml(pokemon);

    evolutionContent.innerHTML = evolutionHTML;

    document
        .querySelectorAll(".evolutionItem")
        .forEach(item => {
            item.addEventListener("click", () => {

                const id =
                    Number(item.dataset.evolutionId);

                const evolutionPokemon =
                    allPokemons.find(
                        pokemon => pokemon.id === id
                    );

                if (evolutionPokemon) {
                    showPokemonDetails(evolutionPokemon);
                }
            });
        });
};

closeDetails.addEventListener("click", () => {
    detailsOverlay.classList.remove("active");
});

detailsOverlay.addEventListener("click", event => {
    if (event.target === detailsOverlay) {
        detailsOverlay.classList.remove("active");
    }
});

generations.forEach(button => {
    button.addEventListener("click", () => {
        updateGeneration(
            button.dataset.generation
        );
    });
});

search.addEventListener("input", filterPokemons);

typeFilter.addEventListener("change", filterPokemons);

randomPokemon.addEventListener("click", () => {
    const visiblePokemons =
        [...document.querySelectorAll(".pokemon")]
            .filter(pokemon =>
                pokemon.style.display !== "none"
            );

    if (!visiblePokemons.length) {
        return;
    }

    const randomIndex =
        Math.floor(
            Math.random() *
            visiblePokemons.length
        );

    const pokemon =
        visiblePokemons[randomIndex];

    pokemon.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    pokemon.click();
});

const startGame = () => {
    if (!allPokemons.length) {
        return;
    }

    const randomIndex =
        Math.floor(
            Math.random() *
            allPokemons.length
        );

    gamePokemon = allPokemons[randomIndex];

    gameImage.src = gamePokemon.image;
    gameImage.style.filter = "brightness(0)";

    guessInput.value = "";
    gameResult.textContent = "";

    gameOverlay.classList.add("active");

    setTimeout(() => {
        guessInput.focus();
    }, 100);
};

const checkGuess = () => {
    if (!gamePokemon) {
        return;
    }

    const answer =
        normalizeName(guessInput.value);

    const correct =
        normalizeName(gamePokemon.name);

    if (answer === correct) {

        score++;

        scoreElement.textContent = score;

        gameResult.textContent =
            `🎉 Acertou! Era ${gamePokemon.name}!`;

        gameImage.style.filter =
            "brightness(1)";

        setTimeout(() => {
            startGame();
        }, 1500);

    } else {

        gameResult.textContent =
            "❌ Errou! Tente novamente.";
    }
};

guessGame.addEventListener("click", startGame);

closeGame.addEventListener("click", () => {
    gameOverlay.classList.remove("active");
});

gameOverlay.addEventListener("click", event => {
    if (event.target === gameOverlay) {
        gameOverlay.classList.remove("active");
    }
});

guessButton.addEventListener("click", checkGuess);

guessInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        checkGuess();
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        detailsOverlay.classList.remove("active");
        gameOverlay.classList.remove("active");
    }
});

updateGeneration("all");

fetchPokemons();
