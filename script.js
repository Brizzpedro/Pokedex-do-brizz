const pokemonCount = 1025;

const generationData = {
    all: {
        start: 1,
        end: 1025,
        region: "TODAS AS GERAÇÕES",
        name: "TODOS OS POKÉMON"
    },
    1: {
        start: 1,
        end: 151,
        region: "GERAÇÃO I",
        name: "KANTO"
    },
    2: {
        start: 152,
        end: 251,
        region: "GERAÇÃO II",
        name: "JOHTO"
    },
    3: {
        start: 252,
        end: 386,
        region: "GERAÇÃO III",
        name: "HOENN"
    },
    4: {
        start: 387,
        end: 493,
        region: "GERAÇÃO IV",
        name: "SINNOH"
    },
    5: {
        start: 494,
        end: 649,
        region: "GERAÇÃO V",
        name: "UNOVA"
    },
    6: {
        start: 650,
        end: 721,
        region: "GERAÇÃO VI",
        name: "KALOS"
    },
    7: {
        start: 722,
        end: 809,
        region: "GERAÇÃO VII",
        name: "ALOLA"
    },
    8: {
        start: 810,
        end: 905,
        region: "GERAÇÃO VIII",
        name: "GALAR"
    },
    9: {
        start: 906,
        end: 1025,
        region: "GERAÇÃO IX",
        name: "PALDEA"
    }
};

let allPokemon = [];
const pokemonCache = new Map();
const evolutionCache = new Map();

let currentGeneration = "all";
let currentGamePokemon = null;
let detailsRequestId = 0;

let score = 0;

let randomTimer = null;
let randomFinishTimer = null;
let randomSelectedCard = null;
let randomMode = false;

let battleSimulationId = 0;
let battleTimer = null;

let searchTimeout = null;

const pokeContainer =
    document.getElementById("pokeContainer");

const searchInput =
    document.getElementById("search");

const typeFilter =
    document.getElementById("typeFilter");

const randomPokemonButton =
    document.getElementById("randomPokemon");

const detailsOverlay =
    document.getElementById("detailsOverlay");

const detailsContent =
    document.getElementById("detailsContent");

const closeDetails =
    document.getElementById("closeDetails");

const gameOverlay =
    document.getElementById("gameOverlay");

const closeGame =
    document.getElementById("closeGame");

const gameImage =
    document.getElementById("gameImage");

const guessInput =
    document.getElementById("gameInput");

const guessButton =
    document.getElementById("gameSubmit");

const gameResult =
    document.getElementById("gameResult");

const scoreElement =
    document.getElementById("score");

const battleButton =
    document.getElementById("battleButton");

const battleOverlay =
    document.getElementById("battleOverlay");

const closeBattle =
    document.getElementById("closeBattle");

const battlePokemon1 =
    document.getElementById("battlePokemon1");

const battlePokemon2 =
    document.getElementById("battlePokemon2");

const preview1 =
    document.getElementById("preview1");

const preview2 =
    document.getElementById("preview2");

const startBattleButton =
    document.getElementById("startBattle");

const battleArena =
    document.getElementById("battleArena");

let battleSearch1 =
    document.getElementById("battleSearch1");

let battleSearch2 =
    document.getElementById("battleSearch2");

function formatNumber(number) {
    return String(number).padStart(3, "0");
}

function normalizeName(name) {
    return String(name)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}

function capitalizeName(name) {
    return String(name)
        .split("-")
        .map(part => {
            return (
                part.charAt(0).toUpperCase() +
                part.slice(1)
            );
        })
        .join(" ");
}

function getPokemonId(url) {
    const match =
        String(url).match(/\/(\d+)\/?$/);

    return match
        ? Number(match[1])
        : null;
}

function getTypeClass(type) {
    return `type-${type}`;
}

function updateBodyLock() {
    const locked =
        detailsOverlay?.classList.contains("active") ||
        gameOverlay?.classList.contains("active") ||
        battleOverlay?.classList.contains("active");

    document.body.style.overflow =
        locked ? "hidden" : "";
}

async function fetchPokemon(id) {
    if (pokemonCache.has(id)) {
        return pokemonCache.get(id);
    }

    try {
        const controller =
            new AbortController();

        const timeout =
            setTimeout(() => {
                controller.abort();
            }, 8000);

        const response =
            await fetch(
                `https://pokeapi.co/api/v2/pokemon/${id}`,
                {
                    signal: controller.signal
                }
            );

        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const data =
            await response.json();

        const stats = {
            hp: 0,
            attack: 0,
            defense: 0,
            specialAttack: 0,
            specialDefense: 0,
            speed: 0
        };

        data.stats.forEach(statInfo => {
            const name =
                statInfo.stat.name;

            if (name === "hp") {
                stats.hp =
                    statInfo.base_stat;
            }

            if (name === "attack") {
                stats.attack =
                    statInfo.base_stat;
            }

            if (name === "defense") {
                stats.defense =
                    statInfo.base_stat;
            }

            if (name === "special-attack") {
                stats.specialAttack =
                    statInfo.base_stat;
            }

            if (name === "special-defense") {
                stats.specialDefense =
                    statInfo.base_stat;
            }

            if (name === "speed") {
                stats.speed =
                    statInfo.base_stat;
            }
        });

        const pokemon = {
            id: data.id,
            name: data.name,
            normalizedName:
                normalizeName(data.name),
            types: data.types.map(
                typeInfo =>
                    typeInfo.type.name
            ),
            image:
                data.sprites.front_default ||
                data.sprites.front_shiny,
            artwork:
                data.sprites.other?.[
                    "official-artwork"
                ]?.front_default ||
                data.sprites.front_default,
            stats
        };

        pokemonCache.set(
            id,
            pokemon
        );

        return pokemon;
    } catch (error) {
        console.warn(
            `Não foi possível carregar o Pokémon #${id}`
        );

        return null;
    }
}

async function fetchPokemonBatch(ids) {
    const results =
        await Promise.allSettled(
            ids.map(id =>
                fetchPokemon(id)
            )
        );

    return results
        .filter(
            result =>
                result.status ===
                "fulfilled"
        )
        .map(
            result =>
                result.value
        )
        .filter(Boolean);
}

async function loadPokemon() {
    const generation =
        generationData[currentGeneration];

    stopRandomAnimation();

    allPokemon = [];

    if (battleButton) {
        battleButton.disabled = true;
    }

    pokeContainer.innerHTML = `
        <p class="loading">
            Carregando Pokémon...
        </p>
    `;

    updateRegionInfo();

    const ids = [];

    for (
        let id = generation.start;
        id <= generation.end;
        id++
    ) {
        ids.push(id);
    }

    const batchSize = 20;

    for (
        let i = 0;
        i < ids.length;
        i += batchSize
    ) {
        const batchIds =
            ids.slice(
                i,
                i + batchSize
            );

        const batchPokemon =
            await fetchPokemonBatch(
                batchIds
            );

        allPokemon.push(
            ...batchPokemon
        );

        allPokemon.sort(
            (a, b) =>
                a.id - b.id
        );

        const loaded =
            Math.min(
                i + batchIds.length,
                ids.length
            );

        pokeContainer.innerHTML = `
            <p class="loading">
                Carregando Pokémon...
                ${loaded}/${ids.length}
            </p>
        `;
    }

    allPokemon.sort(
        (a, b) =>
            a.id - b.id
    );

    renderPokemon(allPokemon);

    populateBattleSelectors();

    if (battleButton) {
        battleButton.disabled = false;
    }
}

function updateRegionInfo() {
    const generation =
        generationData[currentGeneration];

    const regionGeneration =
        document.getElementById(
            "regionGeneration"
        );

    const regionName =
        document.getElementById(
            "regionName"
        );

    const regionNumber =
        document.getElementById(
            "regionNumber"
        );

    if (regionGeneration) {
        regionGeneration.textContent =
            generation.region;
    }

    if (regionName) {
        regionName.textContent =
            generation.name;
    }

    if (regionNumber) {
        regionNumber.textContent =
            `${generation.end - generation.start + 1} Pokémon`;
    }
}

function getFilteredPokemon(
    pokemonList
) {
    const searchTerm =
        normalizeName(
            searchInput?.value || ""
        );

    const selectedType =
        typeFilter?.value || "all";

    return pokemonList.filter(
        pokemon => {
            const name =
                pokemon.normalizedName ||
                normalizeName(
                    pokemon.name
                );

            const matchesSearch =
                name.includes(
                    searchTerm
                ) ||
                String(
                    pokemon.id
                ).includes(
                    searchTerm
                );

            const matchesType =
                selectedType === "all" ||
                pokemon.types.includes(
                    selectedType
                );

            return (
                matchesSearch &&
                matchesType
            );
        }
    );
}

function renderPokemon(
    pokemonList
) {
    const filteredPokemon =
        getFilteredPokemon(
            pokemonList
        );

    if (
        filteredPokemon.length === 0
    ) {
        pokeContainer.innerHTML = `
            <p class="loading">
                Nenhum Pokémon encontrado.
            </p>
        `;

        return;
    }

    pokeContainer.innerHTML =
        filteredPokemon
            .map(
                createPokemonCard
            )
            .join("");
}

function createPokemonCard(
    pokemon
) {
    const types =
        pokemon.types
            .map(
                type => `
                    <span class="type ${getTypeClass(type)}">
                        ${capitalizeName(type)}
                    </span>
                `
            )
            .join("");

    return `
        <div
            class="pokemon"
            data-id="${pokemon.id}"
        >
            <span class="number">
                #${formatNumber(pokemon.id)}
            </span>

            <div class="imgContainer">
                <img
                    src="${pokemon.image}"
                    alt="${capitalizeName(
                        pokemon.name
                    )}"
                    loading="lazy"
                >
            </div>

            <div class="name">
                ${capitalizeName(
                    pokemon.name
                )}
            </div>

            <div>
                ${types}
            </div>
        </div>
    `;
}

function filterPokemon() {
    stopRandomAnimation();
    renderPokemon(allPokemon);
}

function setupSearchAndFilter() {
    if (searchInput) {
        searchInput.addEventListener(
            "input",
            () => {
                clearTimeout(
                    searchTimeout
                );

                searchTimeout =
                    setTimeout(() => {
                        filterPokemon();
                    }, 80);
            }
        );
    }

    if (typeFilter) {
        typeFilter.addEventListener(
            "change",
            filterPokemon
        );
    }
}

function setupCardEvents() {
    if (!pokeContainer) {
        return;
    }

    pokeContainer.addEventListener(
        "click",
        event => {
            const card =
                event.target.closest(
                    ".pokemon"
                );

            if (!card) {
                return;
            }

            const id =
                Number(
                    card.dataset.id
                );

            const pokemon =
                allPokemon.find(
                    item =>
                        item.id === id
                );

            if (pokemon) {
                openDetails(
                    pokemon,
                    false
                );
            }
        }
    );
}

function setupGenerations() {
    document
        .querySelectorAll(
            ".generation"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                async () => {
                    document
                        .querySelectorAll(
                            ".generation"
                        )
                        .forEach(
                            item => {
                                item.classList.remove(
                                    "active"
                                );
                            }
                        );

                    button.classList.add(
                        "active"
                    );

                    currentGeneration =
                        button.dataset.generation ||
                        "all";

                    await loadPokemon();

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });
                }
            );
        });
}

function setupRandomPokemon() {
    if (!randomPokemonButton) {
        return;
    }

    randomPokemonButton.addEventListener(
        "click",
        startRandomAnimation
    );
}

function startRandomAnimation() {
    const visiblePokemon =
        getFilteredPokemon(
            allPokemon
        );

    if (
        visiblePokemon.length === 0 ||
        randomTimer
    ) {
        return;
    }

    stopRandomAnimation();

    randomPokemonButton.disabled =
        true;

    let lastPokemon = null;

    let step = 0;

    const totalSteps = 18;

    function next() {
        let pokemon;

        do {
            pokemon =
                visiblePokemon[
                    Math.floor(
                        Math.random() *
                        visiblePokemon.length
                    )
                ];
        } while (
            visiblePokemon.length > 1 &&
            pokemon === lastPokemon
        );

        lastPokemon = pokemon;

        highlightRandomCard(
            pokemon
        );

        step++;

        if (
            step >= totalSteps
        ) {
            finishRandomAnimation(
                pokemon
            );

            return;
        }

        let delay = 70;

        if (step > 14) {
            delay = 220;
        } else if (step > 10) {
            delay = 150;
        } else if (step > 6) {
            delay = 100;
        }

        randomTimer =
            setTimeout(
                next,
                delay
            );
    }

    next();
}

function highlightRandomCard(
    pokemon
) {
    if (randomSelectedCard) {
        randomSelectedCard.classList.remove(
            "randomSelected"
        );
    }

    const card =
        document.querySelector(
            `.pokemon[data-id="${pokemon.id}"]`
        );

    if (!card) {
        randomSelectedCard = null;
        return;
    }

    card.classList.add(
        "randomSelected"
    );

    randomSelectedCard = card;
}

function finishRandomAnimation(
    pokemon
) {
    if (randomTimer) {
        clearTimeout(
            randomTimer
        );

        randomTimer = null;
    }

    randomMode = true;

    randomFinishTimer =
        setTimeout(() => {
            if (randomSelectedCard) {
                randomSelectedCard.classList.remove(
                    "randomSelected"
                );

                randomSelectedCard =
                    null;
            }

            const card =
                document.querySelector(
                    `.pokemon[data-id="${pokemon.id}"]`
                );

            if (card) {
                card.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }

            randomPokemonButton.disabled =
                false;

            randomFinishTimer = null;

            setTimeout(() => {
                openDetails(
                    pokemon,
                    true
                );
            }, 450);
        }, 500);
}

function stopRandomAnimation() {
    if (randomTimer) {
        clearTimeout(
            randomTimer
        );

        randomTimer = null;
    }

    if (randomFinishTimer) {
        clearTimeout(
            randomFinishTimer
        );

        randomFinishTimer = null;
    }

    if (randomSelectedCard) {
        randomSelectedCard.classList.remove(
            "randomSelected"
        );

        randomSelectedCard = null;
    }

    if (randomPokemonButton) {
        randomPokemonButton.disabled =
            false;
    }
}

async function openDetails(
    pokemon,
    fromRandom = false
) {
    if (
        !detailsOverlay ||
        !detailsContent
    ) {
        return;
    }

    randomMode = fromRandom;

    const requestId =
        ++detailsRequestId;

    const types =
        pokemon.types
            .map(
                type => `
                    <span class="type ${getTypeClass(type)}">
                        ${capitalizeName(type)}
                    </span>
                `
            )
            .join("");

    detailsContent.innerHTML = `
        <div class="detailsHeader">
            <img
                src="${pokemon.artwork}"
                alt="${capitalizeName(
                    pokemon.name
                )}"
            >

            <span class="detailsNumber">
                #${formatNumber(
                    pokemon.id
                )}
            </span>

            <div class="detailsName">
                ${capitalizeName(
                    pokemon.name
                )}
            </div>

            <div class="detailsTypes">
                ${types}
            </div>
        </div>

        <div class="stats">
            <h3>Estatísticas</h3>

            ${createStatBar(
                "HP",
                pokemon.stats.hp
            )}

            ${createStatBar(
                "Ataque",
                pokemon.stats.attack
            )}

            ${createStatBar(
                "Defesa",
                pokemon.stats.defense
            )}

            ${createStatBar(
                "Velocidade",
                pokemon.stats.speed
            )}
        </div>

        <div class="evolutionSection">
            <h3>Evoluções</h3>

            <div id="evolutionContent">
                <p>
                    Carregando evoluções...
                </p>
            </div>
        </div>
    `;

    detailsOverlay.classList.add(
        "active"
    );

    updateBodyLock();

    await loadEvolutionChain(
        pokemon.id,
        requestId
    );
}

function createStatBar(
    name,
    value
) {
    const percentage =
        Math.min(
            (value / 255) * 100,
            100
        );

    return `
        <div class="stat">
            <div class="statTop">
                <span>${name}</span>
                <strong>${value}</strong>
            </div>

            <div class="statBar">
                <div
                    class="statFill"
                    style="width: ${percentage}%"
                ></div>
            </div>
        </div>
    `;
}

async function loadEvolutionChain(
    pokemonId,
    requestId
) {
    const evolutionContent =
        document.getElementById(
            "evolutionContent"
        );

    if (!evolutionContent) {
        return;
    }

    if (
        evolutionCache.has(
            pokemonId
        )
    ) {
        renderEvolutionChain(
            evolutionCache.get(
                pokemonId
            ),
            evolutionContent,
            requestId
        );

        return;
    }

    try {
        const speciesResponse =
            await fetch(
                `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`
            );

        if (!speciesResponse.ok) {
            throw new Error(
                "Erro ao buscar espécie"
            );
        }

        const speciesData =
            await speciesResponse.json();

        const evolutionUrl =
            speciesData
                .evolution_chain
                ?.url;

        if (!evolutionUrl) {
            evolutionContent.innerHTML = `
                <p class="noEvolution">
                    Este Pokémon não possui evoluções.
                </p>
            `;

            return;
        }

        if (
            evolutionCache.has(
                evolutionUrl
            )
        ) {
            const cached =
                evolutionCache.get(
                    evolutionUrl
                );

            evolutionCache.set(
                pokemonId,
                cached
            );

            renderEvolutionChain(
                cached,
                evolutionContent,
                requestId
            );

            return;
        }

        const evolutionResponse =
            await fetch(
                evolutionUrl
            );

        if (!evolutionResponse.ok) {
            throw new Error(
                "Erro ao buscar evolução"
            );
        }

        const evolutionData =
            await evolutionResponse.json();

        const evolutionList = [];

        function collectEvolution(
            node,
            method = ""
        ) {
            const id =
                getPokemonId(
                    node.species.url
                );

            if (id) {
                evolutionList.push({
                    id,
                    name:
                        node.species.name,
                    method
                });
            }

            node.evolves_to.forEach(
                next => {
                    const nextMethod =
                        getEvolutionMethod(
                            next
                                .evolution_details?.[0]
                        );

                    collectEvolution(
                        next,
                        nextMethod
                    );
                }
            );
        }

        collectEvolution(
            evolutionData.chain
        );

        evolutionCache.set(
            evolutionUrl,
            evolutionList
        );

        evolutionCache.set(
            pokemonId,
            evolutionList
        );

        renderEvolutionChain(
            evolutionList,
            evolutionContent,
            requestId
        );
    } catch (error) {
        console.error(
            "Erro nas evoluções:",
            error
        );

        if (
            requestId ===
            detailsRequestId
        ) {
            evolutionContent.innerHTML = `
                <p class="noEvolution">
                    Não foi possível carregar as evoluções.
                </p>
            `;
        }
    }
}

function renderEvolutionChain(
    evolutionList,
    evolutionContent,
    requestId
) {
    if (
        requestId !==
        detailsRequestId
    ) {
        return;
    }

    if (
        evolutionList.length <= 1
    ) {
        evolutionContent.innerHTML = `
            <p class="noEvolution">
                Este Pokémon não possui evoluções.
            </p>
        `;

        return;
    }

    evolutionContent.innerHTML = `
        <div class="evolutionChain">
            ${evolutionList
                .map(
                    (evolution, index) => {
                        const arrow =
                            index <
                            evolutionList.length - 1
                                ? `
                                    <span class="evolutionArrow">
                                        →
                                    </span>
                                `
                                : "";

                        return `
                            <div
                                class="evolutionItem"
                                data-evolution-id="${evolution.id}"
                            >
                                <img
                                    src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evolution.id}.png"
                                    alt="${capitalizeName(
                                        evolution.name
                                    )}"
                                    loading="lazy"
                                >

                                <span class="evolutionNumber">
                                    #${formatNumber(
                                        evolution.id
                                    )}
                                </span>

                                <span>
                                    ${capitalizeName(
                                        evolution.name
                                    )}
                                </span>

                                ${
                                    evolution.method
                                        ? `
                                            <small>
                                                ${evolution.method}
                                            </small>
                                        `
                                        : ""
                                }
                            </div>

                            ${arrow}
                        `;
                    }
                )
                .join("")}
        </div>
    `;

    evolutionContent
        .querySelectorAll(
            ".evolutionItem"
        )
        .forEach(card => {
            card.addEventListener(
                "click",
                async () => {
                    const id =
                        Number(
                            card.dataset
                                .evolutionId
                        );

                    const evolution =
                        await fetchPokemon(
                            id
                        );

                    if (evolution) {
                        openDetails(
                            evolution,
                            false
                        );
                    }
                }
            );
        });
}

function getEvolutionMethod(
    details
) {
    if (!details) {
        return "";
    }

    if (
        details.min_level != null
    ) {
        return `Nível ${details.min_level}`;
    }

    if (
        details.item?.name
    ) {
        return `Item: ${capitalizeName(
            details.item.name
        )}`;
    }

    if (
        details.held_item?.name
    ) {
        return `Segurando: ${capitalizeName(
            details.held_item.name
        )}`;
    }

    if (
        details.trigger?.name ===
        "trade"
    ) {
        return "Troca";
    }

    if (
        details.min_happiness != null
    ) {
        return "Felicidade";
    }

    if (
        details.min_affection != null
    ) {
        return "Carinho";
    }

    if (
        details.time_of_day
    ) {
        return `Durante ${details.time_of_day}`;
    }

    if (
        details.known_move?.name
    ) {
        return `Movimento: ${capitalizeName(
            details.known_move.name
        )}`;
    }

    if (
        details.location?.name
    ) {
        return `Local: ${capitalizeName(
            details.location.name
        )}`;
    }

    if (
        details.trigger?.name
    ) {
        return capitalizeName(
            details.trigger.name
        );
    }

    return "";
}

function closeDetailsModal() {
    if (!detailsOverlay) {
        return;
    }

    const wasRandom =
        randomMode;

    detailsRequestId++;

    detailsOverlay.classList.remove(
        "active"
    );

    randomMode = false;

    updateBodyLock();

    if (wasRandom) {
        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }, 100);
    }
}

function setupDetailsModal() {
    if (closeDetails) {
        closeDetails.addEventListener(
            "click",
            closeDetailsModal
        );
    }

    if (detailsOverlay) {
        detailsOverlay.addEventListener(
            "click",
            event => {
                if (
                    event.target ===
                    detailsOverlay
                ) {
                    closeDetailsModal();
                }
            }
        );
    }
}

function setupGame() {
    const guessGameButton =
        document.getElementById(
            "guessGame"
        );

    if (guessGameButton) {
        guessGameButton.addEventListener(
            "click",
            startGuessGame
        );
    }

    if (closeGame) {
        closeGame.addEventListener(
            "click",
            closeGuessGame
        );
    }

    if (gameOverlay) {
        gameOverlay.addEventListener(
            "click",
            event => {
                if (
                    event.target ===
                    gameOverlay
                ) {
                    closeGuessGame();
                }
            }
        );
    }

    if (guessButton) {
        guessButton.addEventListener(
            "click",
            checkGuess
        );
    }

    if (guessInput) {
        guessInput.addEventListener(
            "keydown",
            event => {
                if (
                    event.key ===
                    "Enter"
                ) {
                    checkGuess();
                }
            }
        );
    }
}

function startGuessGame() {
    if (
        !gameOverlay ||
        allPokemon.length === 0
    ) {
        return;
    }

    currentGamePokemon =
        allPokemon[
            Math.floor(
                Math.random() *
                allPokemon.length
            )
        ];

    gameImage.src =
        currentGamePokemon.image;

    gameImage.style.filter =
        "brightness(0)";

    gameImage.classList.remove(
        "gameCorrect",
        "gameWrong"
    );

    guessInput.value = "";

    gameResult.textContent = "";
    gameResult.className = "";

    gameOverlay.classList.add(
        "active"
    );

    updateBodyLock();

    setTimeout(() => {
        guessInput.focus();
    }, 100);
}

function checkGuess() {
    if (
        !currentGamePokemon ||
        !guessInput
    ) {
        return;
    }

    const guess =
        normalizeName(
            guessInput.value
        );

    if (!guess) {
        return;
    }

    const correct =
        currentGamePokemon
            .normalizedName;

    if (guess === correct) {
        score++;

        if (scoreElement) {
            scoreElement.textContent =
                score;
        }

        gameResult.textContent =
            `Acertou! É ${capitalizeName(
                currentGamePokemon.name
            )}!`;

        gameResult.className =
            "correct";

        gameImage.style.filter =
            "brightness(1)";

        gameImage.classList.add(
            "gameCorrect"
        );

        setTimeout(() => {
            gameImage.classList.remove(
                "gameCorrect"
            );

            if (
                gameOverlay.classList.contains(
                    "active"
                )
            ) {
                startGuessGame();
            }
        }, 1200);
    } else {
        gameResult.textContent =
            "Errou! Tente novamente.";

        gameResult.className =
            "wrong";

        gameImage.classList.add(
            "gameWrong"
        );

        setTimeout(() => {
            gameImage.classList.remove(
                "gameWrong"
            );
        }, 450);
    }
}

function closeGuessGame() {
    if (!gameOverlay) {
        return;
    }

    gameOverlay.classList.remove(
        "active"
    );

    currentGamePokemon = null;

    updateBodyLock();
}

function createBattleSearchInputs() {
    if (
        !battlePokemon1 ||
        !battlePokemon2
    ) {
        return;
    }

    const parent1 =
        battlePokemon1.parentElement;

    const parent2 =
        battlePokemon2.parentElement;

    if (!battleSearch1) {
        battleSearch1 =
            document.createElement(
                "input"
            );

        battleSearch1.type =
            "text";

        battleSearch1.id =
            "battleSearch1";

        battleSearch1.className =
            "battleSearch";

        battleSearch1.placeholder =
            "Pesquisar Pokémon...";

        battleSearch1.autocomplete =
            "off";

        parent1.insertBefore(
            battleSearch1,
            battlePokemon1
        );
    }

    if (!battleSearch2) {
        battleSearch2 =
            document.createElement(
                "input"
            );

        battleSearch2.type =
            "text";

        battleSearch2.id =
            "battleSearch2";

        battleSearch2.className =
            "battleSearch";

        battleSearch2.placeholder =
            "Pesquisar Pokémon...";

        battleSearch2.autocomplete =
            "off";

        parent2.insertBefore(
            battleSearch2,
            battlePokemon2
        );
    }
}

function getBattlePokemonList() {
    return Array.from(
        pokemonCache.values()
    ).sort(
        (a, b) =>
            a.id - b.id
    );
}

function filterBattleList(
    pokemonList,
    search
) {
    const term =
        normalizeName(search);

    if (!term) {
        return pokemonList;
    }

    return pokemonList.filter(
        pokemon => {
            const name =
                pokemon.normalizedName;

            return (
                name.includes(term) ||
                String(
                    pokemon.id
                ).includes(term)
            );
        }
    );
}

function populateBattleSelectors(
    search1 = "",
    search2 = ""
) {
    if (
        !battlePokemon1 ||
        !battlePokemon2
    ) {
        return;
    }

    const pokemonList =
        getBattlePokemonList();

    const selected1 =
        battlePokemon1.value;

    const selected2 =
        battlePokemon2.value;

    const filtered1 =
        filterBattleList(
            pokemonList,
            search1
        );

    const filtered2 =
        filterBattleList(
            pokemonList,
            search2
        );

    battlePokemon1.innerHTML = `
        <option value="">
            Escolha o Pokémon
        </option>
    `;

    battlePokemon2.innerHTML = `
        <option value="">
            Escolha o Pokémon
        </option>
    `;

    filtered1.forEach(
        pokemon => {
            const option =
                document.createElement(
                    "option"
                );

            option.value =
                pokemon.id;

            option.textContent =
                `#${formatNumber(
                    pokemon.id
                )} ${capitalizeName(
                    pokemon.name
                )}`;

            battlePokemon1.appendChild(
                option
            );
        }
    );

    filtered2.forEach(
        pokemon => {
            const option =
                document.createElement(
                    "option"
                );

            option.value =
                pokemon.id;

            option.textContent =
                `#${formatNumber(
                    pokemon.id
                )} ${capitalizeName(
                    pokemon.name
                )}`;

            battlePokemon2.appendChild(
                option
            );
        }
    );

    if (
        [...battlePokemon1.options]
            .some(
                option =>
                    option.value ===
                    selected1
            )
    ) {
        battlePokemon1.value =
            selected1;
    }

    if (
        [...battlePokemon2.options]
            .some(
                option =>
                    option.value ===
                    selected2
            )
    ) {
        battlePokemon2.value =
            selected2;
    }
}

function updateBattlePreview(
    selectElement,
    previewElement
) {
    if (
        !selectElement ||
        !previewElement
    ) {
        return;
    }

    const id =
        Number(
            selectElement.value
        );

    if (!id) {
        previewElement.innerHTML = `
            <span>
                Escolha um Pokémon
            </span>
        `;

        return;
    }

    const pokemon =
        pokemonCache.get(id);

    if (!pokemon) {
        return;
    }

    previewElement.innerHTML = `
        <img
            src="${pokemon.artwork}"
            alt="${capitalizeName(
                pokemon.name
            )}"
        >

        <strong>
            ${capitalizeName(
                pokemon.name
            )}
        </strong>
    `;
}

function setupBattleSearch() {
    createBattleSearchInputs();

    if (battleSearch1) {
        battleSearch1.addEventListener(
            "input",
            () => {
                populateBattleSelectors(
                    battleSearch1.value,
                    battleSearch2?.value ||
                        ""
                );

                updateBattlePreview(
                    battlePokemon1,
                    preview1
                );
            }
        );
    }

    if (battleSearch2) {
        battleSearch2.addEventListener(
            "input",
            () => {
                populateBattleSelectors(
                    battleSearch1?.value ||
                        "",
                    battleSearch2.value
                );

                updateBattlePreview(
                    battlePokemon2,
                    preview2
                );
            }
        );
    }
}

function setupBattle() {
    if (
        !battleButton ||
        !battleOverlay
    ) {
        return;
    }

    setupBattleSearch();

    battleButton.addEventListener(
        "click",
        () => {
            battleSimulationId++;

            battleOverlay.classList.add(
                "active"
            );

            updateBodyLock();

            battleArena.innerHTML =
                "";

            if (battleSearch1) {
                battleSearch1.value =
                    "";
            }

            if (battleSearch2) {
                battleSearch2.value =
                    "";
            }

            populateBattleSelectors();

            updateBattlePreview(
                battlePokemon1,
                preview1
            );

            updateBattlePreview(
                battlePokemon2,
                preview2
            );
        }
    );

    if (closeBattle) {
        closeBattle.addEventListener(
            "click",
            closeBattleModal
        );
    }

    battleOverlay.addEventListener(
        "click",
        event => {
            if (
                event.target ===
                battleOverlay
            ) {
                closeBattleModal();
            }
        }
    );

    if (battlePokemon1) {
        battlePokemon1.addEventListener(
            "change",
            () => {
                updateBattlePreview(
                    battlePokemon1,
                    preview1
                );
            }
        );
    }

    if (battlePokemon2) {
        battlePokemon2.addEventListener(
            "change",
            () => {
                updateBattlePreview(
                    battlePokemon2,
                    preview2
                );
            }
        );
    }

    if (startBattleButton) {
        startBattleButton.addEventListener(
            "click",
            startBattle
        );
    }
}

function closeBattleModal() {
    battleSimulationId++;

    if (battleTimer) {
        clearTimeout(
            battleTimer
        );

        battleTimer = null;
    }

    if (battleOverlay) {
        battleOverlay.classList.remove(
            "active"
        );
    }

    updateBodyLock();
}

function startBattle() {
    const id1 =
        Number(
            battlePokemon1?.value
        );

    const id2 =
        Number(
            battlePokemon2?.value
        );

    if (!id1 || !id2) {
        alert(
            "Escolha os dois Pokémon para começar a batalha."
        );

        return;
    }

    if (id1 === id2) {
        alert(
            "Escolha dois Pokémon diferentes."
        );

        return;
    }

    const pokemon1 =
        pokemonCache.get(id1);

    const pokemon2 =
        pokemonCache.get(id2);

    if (
        !pokemon1 ||
        !pokemon2
    ) {
        return;
    }

    battleSimulationId++;

    const simulationId =
        battleSimulationId;

    startBattleButton.disabled =
        true;

    renderBattleArena(
        pokemon1,
        pokemon2,
        simulationId
    );
}

function renderBattleArena(
    pokemon1,
    pokemon2,
    simulationId
) {
    const hp1 =
        pokemon1.stats.hp;

    const hp2 =
        pokemon2.stats.hp;

    const firstPokemon =
        pokemon1.stats.speed >=
        pokemon2.stats.speed
            ? pokemon1
            : pokemon2;

    battleArena.innerHTML = `
        <div class="fighters">
            <div
                class="fighter fighterOne"
                id="fighterOne"
            >
                <img
                    src="${pokemon1.artwork}"
                    alt="${capitalizeName(
                        pokemon1.name
                    )}"
                >

                <div class="fighterInfo">
                    <strong>
                        ${capitalizeName(
                            pokemon1.name
                        )}
                    </strong>

                    <span id="battleHpText1">
                        ${hp1}/${hp1}
                    </span>
                </div>

                <div class="battleHp">
                    <div
                        class="battleHpFill"
                        id="battleHpFill1"
                    ></div>
                </div>
            </div>

            <div class="battleMiddle">
                <strong>VS</strong>

                <span id="battleMessage">
                    ${capitalizeName(
                        firstPokemon.name
                    )} começa!
                </span>
            </div>

            <div
                class="fighter fighterTwo"
                id="fighterTwo"
            >
                <img
                    src="${pokemon2.artwork}"
                    alt="${capitalizeName(
                        pokemon2.name
                    )}"
                >

                <div class="fighterInfo">
                    <strong>
                        ${capitalizeName(
                            pokemon2.name
                        )}
                    </strong>

                    <span id="battleHpText2">
                        ${hp2}/${hp2}
                    </span>
                </div>

                <div class="battleHp">
                    <div
                        class="battleHpFill"
                        id="battleHpFill2"
                    ></div>
                </div>
            </div>
        </div>

        <div class="battleStats">
            <div>
                <strong>HP</strong>
                <span>
                    ${pokemon1.stats.hp}
                    vs
                    ${pokemon2.stats.hp}
                </span>
            </div>

            <div>
                <strong>Ataque</strong>
                <span>
                    ${pokemon1.stats.attack}
                    vs
                    ${pokemon2.stats.attack}
                </span>
            </div>

            <div>
                <strong>Defesa</strong>
                <span>
                    ${pokemon1.stats.defense}
                    vs
                    ${pokemon2.stats.defense}
                </span>
            </div>

            <div>
                <strong>Velocidade</strong>
                <span>
                    ${pokemon1.stats.speed}
                    vs
                    ${pokemon2.stats.speed}
                </span>
            </div>
        </div>

        <div
            class="winnerBox"
            id="winnerBox"
        >
            <span class="winnerBoxEmoji">
                ⚔️
            </span>

            <span>
                A batalha começou!
            </span>

            <strong>
                Preparando...
            </strong>
        </div>
    `;

    updateBattleHp(
        1,
        hp1,
        hp1
    );

    updateBattleHp(
        2,
        hp2,
        hp2
    );

    battleTimer =
        setTimeout(() => {
            battleTimer = null;

            simulateBattle(
                pokemon1,
                pokemon2,
                hp1,
                hp2,
                firstPokemon,
                simulationId
            );
        }, 800);
}

async function simulateBattle(
    pokemon1,
    pokemon2,
    hp1,
    hp2,
    firstPokemon,
    simulationId
) {
    const maxHp1 =
        pokemon1.stats.hp;

    const maxHp2 =
        pokemon2.stats.hp;

    let attacker =
        firstPokemon;

    let defender =
        attacker.id === pokemon1.id
            ? pokemon2
            : pokemon1;

    let turn = 0;

    while (
        hp1 > 0 &&
        hp2 > 0 &&
        turn < 30
    ) {
        if (
            simulationId !==
            battleSimulationId
        ) {
            return;
        }

        if (
            !battleOverlay.classList.contains(
                "active"
            )
        ) {
            return;
        }

        turn++;

        const attackerIsOne =
            attacker.id ===
            pokemon1.id;

        const attack =
            attacker.stats.attack;

        const defense =
            defender.stats.defense;

        let damage =
            Math.floor(
                attack * 1.5 -
                defense * 0.35 +
                Math.random() * 20
            );

        damage =
            Math.max(
                5,
                damage
            );

        if (attackerIsOne) {
            hp2 =
                Math.max(
                    0,
                    hp2 - damage
                );

            animateAttack(
                "fighterOne",
                "fighterTwo"
            );
        } else {
            hp1 =
                Math.max(
                    0,
                    hp1 - damage
                );

            animateAttack(
                "fighterTwo",
                "fighterOne"
            );
        }

        const message =
            document.getElementById(
                "battleMessage"
            );

        if (message) {
            message.textContent =
                `${capitalizeName(
                    attacker.name
                )} causou ${damage} de dano!`;
        }

        updateBattleHp(
            1,
            hp1,
            maxHp1
        );

        updateBattleHp(
            2,
            hp2,
            maxHp2
        );

        await wait(700);

        if (
            simulationId !==
            battleSimulationId
        ) {
            return;
        }

        const temp =
            attacker;

        attacker =
            defender;

        defender =
            temp;
    }

    if (
        simulationId !==
        battleSimulationId
    ) {
        return;
    }

    let winner = null;

    if (
        hp1 > 0 &&
        hp2 <= 0
    ) {
        winner = pokemon1;
    }

    if (
        hp2 > 0 &&
        hp1 <= 0
    ) {
        winner = pokemon2;
    }

    const winnerBox =
        document.getElementById(
            "winnerBox"
        );

    if (!winnerBox) {
        return;
    }

    if (!winner) {
        winnerBox.innerHTML = `
            <span class="winnerBoxEmoji">
                🤝
            </span>

            <span>
                Resultado
            </span>

            <strong>
                Empate!
            </strong>
        `;
    } else {
        winnerBox.innerHTML = `
            <span class="winnerBoxEmoji">
                🏆
            </span>

            <span>
                Vencedor
            </span>

            <strong>
                ${capitalizeName(
                    winner.name
                )}
            </strong>
        `;
    }

    startBattleButton.disabled =
        false;
}

function updateBattleHp(
    player,
    currentHp,
    maxHp
) {
    const hpFill =
        document.getElementById(
            `battleHpFill${player}`
        );

    const hpText =
        document.getElementById(
            `battleHpText${player}`
        );

    if (hpFill) {
        const percentage =
            Math.max(
                0,
                Math.min(
                    100,
                    (currentHp /
                        maxHp) *
                        100
                )
            );

        hpFill.style.width =
            `${percentage}%`;
    }

    if (hpText) {
        hpText.textContent =
            `${Math.max(
                0,
                currentHp
            )}/${maxHp}`;
    }
}

function animateAttack(
    attackerId,
    defenderId
) {
    const attacker =
        document.getElementById(
            attackerId
        );

    const defender =
        document.getElementById(
            defenderId
        );

    if (
        !attacker ||
        !defender
    ) {
        return;
    }

    attacker.classList.remove(
        "attackAnimation"
    );

    defender.classList.remove(
        "hitAnimation"
    );

    void attacker.offsetWidth;
    void defender.offsetWidth;

    attacker.classList.add(
        "attackAnimation"
    );

    defender.classList.add(
        "hitAnimation"
    );

    setTimeout(() => {
        attacker.classList.remove(
            "attackAnimation"
        );

        defender.classList.remove(
            "hitAnimation"
        );
    }, 450);
}

function wait(milliseconds) {
    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );
}

function setupKeyboard() {
    document.addEventListener(
        "keydown",
        event => {
            if (
                event.key !==
                "Escape"
            ) {
                return;
            }

            if (
                detailsOverlay?.classList.contains(
                    "active"
                )
            ) {
                closeDetailsModal();
            }

            if (
                gameOverlay?.classList.contains(
                    "active"
                )
            ) {
                closeGuessGame();
            }

            if (
                battleOverlay?.classList.contains(
                    "active"
                )
            ) {
                closeBattleModal();
            }
        }
    );
}

async function startApp() {
    setupSearchAndFilter();
    setupGenerations();
    setupRandomPokemon();
    setupDetailsModal();
    setupCardEvents();
    setupGame();
    setupBattle();
    setupKeyboard();

    updateRegionInfo();

    if (battleButton) {
        battleButton.disabled =
            true;
    }

    await loadPokemon();
}

startApp();
