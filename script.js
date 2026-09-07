const API_URL = "https://pokeapi.co/api/v2";

const pokemonCount = 1025;

let allPokemon = [];
let currentGeneration = "all";

let selectedPokemon = null;
let gamePokemon = null;
let gameScore = 0;

let battleRunning = false;

let redTeamData = [];
let blueTeamData = [];

let redCurrent = 0;
let blueCurrent = 0;

let teamBattleRunning = false;


/* ELEMENTOS */

const pokeContainer =
    document.getElementById("pokeContainer");

const searchInput =
    document.getElementById("search");

const typeFilter =
    document.getElementById("typeFilter");

const randomPokemon =
    document.getElementById("randomPokemon");

const guessGame =
    document.getElementById("guessGame");

const battleButton =
    document.getElementById("battleButton");

const teamBattleButton =
    document.getElementById("teamBattleButton");

const regionGeneration =
    document.getElementById("regionGeneration");

const regionName =
    document.getElementById("regionName");

const regionNumber =
    document.getElementById("regionNumber");


/* DETALHES */

const detailsOverlay =
    document.getElementById("detailsOverlay");

const closeDetails =
    document.getElementById("closeDetails");

const detailsContent =
    document.getElementById("detailsContent");


/* JOGO */

const gameOverlay =
    document.getElementById("gameOverlay");

const closeGame =
    document.getElementById("closeGame");

const gameImage =
    document.getElementById("gameImage");

const gameInput =
    document.getElementById("gameInput");

const gameSubmit =
    document.getElementById("gameSubmit");

const gameResult =
    document.getElementById("gameResult");

const scoreElement =
    document.getElementById("score");


/* BATALHA 1X1 */

const battleOverlay =
    document.getElementById("battleOverlay");

const closeBattle =
    document.getElementById("closeBattle");

const battlePokemon1 =
    document.getElementById("battlePokemon1");

const battlePokemon2 =
    document.getElementById("battlePokemon2");

const battleSearch1 =
    document.getElementById("battleSearch1");

const battleSearch2 =
    document.getElementById("battleSearch2");

const preview1 =
    document.getElementById("preview1");

const preview2 =
    document.getElementById("preview2");

const startBattle =
    document.getElementById("startBattle");

const battleArena =
    document.getElementById("battleArena");


/* BATALHA DE TIMES */

const teamBattleOverlay =
    document.getElementById("teamBattleOverlay");

const closeTeamBattle =
    document.getElementById("closeTeamBattle");

const redTeam =
    document.getElementById("redTeam");

const blueTeam =
    document.getElementById("blueTeam");

const redFighterImage =
    document.getElementById("redFighterImage");

const blueFighterImage =
    document.getElementById("blueFighterImage");

const redFighterName =
    document.getElementById("redFighterName");

const blueFighterName =
    document.getElementById("blueFighterName");

const redHP =
    document.getElementById("redHP");

const blueHP =
    document.getElementById("blueHP");

const redHPText =
    document.getElementById("redHPText");

const blueHPText =
    document.getElementById("blueHPText");

const teamBattleMessage =
    document.getElementById("teamBattleMessage");

const teamBattleResult =
    document.getElementById("teamBattleResult");

const newTeamsButton =
    document.getElementById("newTeamsButton");

const startTeamBattle =
    document.getElementById("startTeamBattle");


/* INICIALIZAÇÃO */

async function startApp() {

    setupSearchAndFilter();

    setupGenerations();

    setupRandomPokemon();

    setupDetailsModal();

    setupCardEvents();

    setupGame();

    setupBattle();

    setupTeamBattle();

    setupKeyboard();

    updateRegionInfo();

    if (battleButton) {
        battleButton.disabled = true;
    }

    if (teamBattleButton) {
        teamBattleButton.disabled = true;
    }

    await loadPokemon();
}


/* CARREGAR POKÉMON */

async function loadPokemon() {

    try {

        pokeContainer.innerHTML =
            `<p class="loading">Carregando Pokémon...</p>`;

        const requests = [];

        for (let i = 1; i <= pokemonCount; i++) {

            requests.push(
                fetch(`${API_URL}/pokemon/${i}`)
                    .then(response => response.json())
            );

        }

        const results = await Promise.all(requests);

        allPokemon = results;

        renderPokemon();

        populateBattleSelects();

        if (battleButton) {
            battleButton.disabled = false;
        }

        if (teamBattleButton) {
            teamBattleButton.disabled = false;
        }

    } catch (error) {

        console.error(
            "Erro ao carregar Pokémon:",
            error
        );

        pokeContainer.innerHTML =
            `<p class="loading">
                Erro ao carregar os Pokémon.
            </p>`;
    }
}


/* RENDERIZAÇÃO */

function renderPokemon() {

    const filteredPokemon =
        getFilteredPokemon();

    pokeContainer.innerHTML = "";

    if (filteredPokemon.length === 0) {

        pokeContainer.innerHTML =
            `<p class="loading">
                Nenhum Pokémon encontrado.
            </p>`;

        updateRegionInfo();

        return;
    }

    filteredPokemon.forEach(pokemon => {

        const card =
            createPokemonCard(pokemon);

        pokeContainer.appendChild(card);

    });

    updateRegionInfo();
}


/* CRIAR CARD */

function createPokemonCard(pokemon) {

    const card =
        document.createElement("article");

    card.className = "pokemon";

    card.dataset.id =
        pokemon.id;

    card.dataset.name =
        pokemon.name;

    const types =
        pokemon.types   
            .map(type => type.type.name);

    const mainType =
        types[0];

    const typeNames = {
        normal: "Normal",
        fire: "Fogo",
        water: "Água",
        electric: "Elétrico",
        grass: "Grama",
        ice: "Gelo",
        fighting: "Lutador",
        poison: "Veneno",
        ground: "Terrestre",
        flying: "Voador",
        psychic: "Psíquico",
        bug: "Inseto",
        rock: "Pedra",
        ghost: "Fantasma",
        dragon: "Dragão",
        dark: "Sombrio",
        steel: "Aço",
        fairy: "Fada"
    };

    const image =
        getPixelImage(pokemon.id);

    card.innerHTML = `

        <div class="number">
            #${String(pokemon.id).padStart(3, "0")}
        </div>

        <div class="imgContainer">

            <img
                src="${image}"
                alt="${capitalizeName(pokemon.name)}"
                loading="lazy"
                onerror="this.src='${getFallbackImage(pokemon.id)}'"
            >

        </div>

        <h3 class="name">
            ${capitalizeName(pokemon.name)}
        </h3>

        <div class="types">

            ${types.map(type => `
                <span class="type ${type}">
                    ${typeNames[type] || type}
                </span>
            `).join("")}

        </div>

    `;

    card.style.setProperty(
        "--pokemon-type",
        mainType
    );

    return card;
}


/* FILTROS */

function getFilteredPokemon() {

    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";

    const type =
        typeFilter
            ? typeFilter.value
            : "all";

    return allPokemon.filter(pokemon => {

        const matchesGeneration =
            currentGeneration === "all" ||
            getGeneration(pokemon.id) ===
            Number(currentGeneration);

        const matchesSearch =
            !search ||
            pokemon.name
                .toLowerCase()
                .includes(search) ||
            String(pokemon.id)
                .includes(search);

        const matchesType =
            type === "all" ||
            pokemon.types.some(
                item =>
                    item.type.name === type
            );

        return (
            matchesGeneration &&
            matchesSearch &&
            matchesType
        );

    });
}


/* BUSCA E FILTRO */

function setupSearchAndFilter() {

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            renderPokemon
        );

    }

    if (typeFilter) {

        typeFilter.addEventListener(
            "change",
            renderPokemon
        );

    }
}


/* GERAÇÕES */

function setupGenerations() {

    const generationButtons =
        document.querySelectorAll(
            ".generation"
        );

    generationButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                generationButtons.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );

                button.classList.add("active");

                currentGeneration =
                    button.dataset.generation;

                renderPokemon();

            }
        );

    });
}


function getGeneration(id) {

    if (id <= 151) return 1;
    if (id <= 251) return 2;
    if (id <= 386) return 3;
    if (id <= 493) return 4;
    if (id <= 649) return 5;
    if (id <= 721) return 6;
    if (id <= 809) return 7;
    if (id <= 905) return 8;

    return 9;
}


function updateRegionInfo() {

    const generations = {

        all: {
            generation: "TODAS AS GERAÇÕES",
            name: "TODOS OS POKÉMON"
        },

        1: {
            generation: "GERAÇÃO I",
            name: "KANTO"
        },

        2: {
            generation: "GERAÇÃO II",
            name: "JOHTO"
        },

        3: {
            generation: "GERAÇÃO III",
            name: "HOENN"
        },

        4: {
            generation: "GERAÇÃO IV",
            name: "SINNOH"
        },

        5: {
            generation: "GERAÇÃO V",
            name: "UNOVA"
        },

        6: {
            generation: "GERAÇÃO VI",
            name: "KALOS"
        },

        7: {
            generation: "GERAÇÃO VII",
            name: "ALOLA"
        },

        8: {
            generation: "GERAÇÃO VIII",
            name: "GALAR"
        },

        9: {
            generation: "GERAÇÃO IX",
            name: "PALDEA"
        }

    };

    const data =
        generations[currentGeneration];

    const visible =
        getFilteredPokemon();

    if (regionGeneration) {
        regionGeneration.textContent =
            data.generation;
    }

    if (regionName) {
        regionName.textContent =
            data.name;
    }

    if (regionNumber) {

        regionNumber.textContent =
            `${visible.length} Pokémon`;

    }
}


/* RANDOM */

function setupRandomPokemon() {

    if (!randomPokemon) {
        return;
    }

    randomPokemon.addEventListener(
        "click",
        event => {

            event.preventDefault();

            const visible =
                getFilteredPokemon();

            if (!visible.length) {
                return;
            }

            const pokemon =
                visible[
                    Math.floor(
                        Math.random() *
                        visible.length
                    )
                ];

            const card =
                document.querySelector(
                    `.pokemon[data-id="${pokemon.id}"]`
                );

            if (card) {

                card.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

                setTimeout(
                    () =>
                        openDetails(pokemon),
                    350
                );

            }

        }
    );
}


/* CARDS */

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
                Number(card.dataset.id);

            const pokemon =
                allPokemon.find(
                    item =>
                        item.id === id
                );

            if (pokemon) {
                openDetails(pokemon);
            }

        }
    );
}


/* DETALHES */

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


function openDetails(pokemon) {

    selectedPokemon =
        pokemon;

    if (!detailsOverlay ||
        !detailsContent) {
        return;
    }

    const types =
        pokemon.types.map(
            item =>
                item.type.name
        );

    const typeNames = {
        normal: "Normal",
        fire: "Fogo",
        water: "Água",
        electric: "Elétrico",
        grass: "Grama",
        ice: "Gelo",
        fighting: "Lutador",
        poison: "Veneno",
        ground: "Terrestre",
        flying: "Voador",
        psychic: "Psíquico",
        bug: "Inseto",
        rock: "Pedra",
        ghost: "Fantasma",
        dragon: "Dragão",
        dark: "Sombrio",
        steel: "Aço",
        fairy: "Fada"
    };

    const stats = {

        hp:
            getStat(
                pokemon,
                "hp"
            ),

        attack:
            getStat(
                pokemon,
                "attack"
            ),

        defense:
            getStat(
                pokemon,
                "defense"
            ),

        speed:
            getStat(
                pokemon,
                "speed"
            )

    };

    detailsContent.innerHTML = `

        <div class="detailsHeader">

            <img
                src="${getOfficialArtwork(pokemon.id)}"
                alt="${capitalizeName(pokemon.name)}"
                onerror="this.src='${getPixelImage(pokemon.id)}'"
            >

            <div>

                <span class="detailsNumber">
                    #${String(pokemon.id).padStart(3, "0")}
                </span>

                <h2 class="detailsName">
                    ${capitalizeName(pokemon.name)}
                </h2>

                <div class="detailsTypes">

                    ${types.map(type => `
                        <span class="type ${type}">
                            ${typeNames[type] || type}
                        </span>
                    `).join("")}

                </div>

            </div>

        </div>

        <div class="stats">

            ${createStatHTML(
                "HP",
                stats.hp
            )}

            ${createStatHTML(
                "Attack",
                stats.attack
            )}

            ${createStatHTML(
                "Defense",
                stats.defense
            )}

            ${createStatHTML(
                "Speed",
                stats.speed
            )}

        </div>

        <div
            class="evolutionSection"
            id="evolutionSection"
        >

            <h3>
                EVOLUÇÕES
            </h3>

            <div
                class="evolutionChain"
                id="evolutionChain"
            >

                <p>
                    Carregando evoluções...
                </p>

            </div>

        </div>

    `;

    detailsOverlay.classList.add("active");

    loadEvolutionChain(pokemon.id);
}


function closeDetailsModal() {

    if (detailsOverlay) {
        detailsOverlay.classList.remove(
            "active"
        );
    }

    selectedPokemon = null;
}


function getStat(pokemon, statName) {

    const stat =
        pokemon.stats.find(
            item =>
                item.stat.name ===
                statName
        );

    return stat
        ? stat.base_stat
        : 0;
}


function createStatHTML(name, value) {

    const percentage =
        Math.min(
            100,
            (value / 180) * 100
        );

    return `

        <div class="stat">

            <div class="statTop">

                <span>
                    ${name}
                </span>

                <strong>
                    ${value}
                </strong>

            </div>

            <div class="statBar">

                <div
                    class="statFill"
                    style="width:${percentage}%"
                ></div>

            </div>

        </div>

    `;
}


/* EVOLUÇÕES */

async function loadEvolutionChain(
    pokemonId
) {

    const evolutionChain =
        document.getElementById(
            "evolutionChain"
        );

    if (!evolutionChain) {
        return;
    }

    try {

        const speciesResponse =
            await fetch(
                `${API_URL}/pokemon-species/${pokemonId}`
            );

        const species =
            await speciesResponse.json();

        const evolutionResponse =
            await fetch(
                species.evolution_chain.url
            );

        const evolutionData =
            await evolutionResponse.json();

        const chain =
            await buildEvolutionChain(
                evolutionData.chain
            );

        renderEvolutionChain(
            chain,
            evolutionChain
        );

    } catch (error) {

        console.error(
            "Erro nas evoluções:",
            error
        );

        evolutionChain.innerHTML =
            `<p class="noEvolution">
                Não foi possível carregar as evoluções.
            </p>`;
    }
}


async function buildEvolutionChain(
    chain
) {

    const result = [];

    let current =
        chain;

    while (current) {

        const id =
            getPokemonId(
                current.species.url
            );

        const pokemon =
            allPokemon.find(
                item =>
                    item.id === id
            );

        if (pokemon) {

            result.push({
                pokemon,
                details:
                    current.evolution_details?.[0] ||
                    null
            });

        }

        if (
            current.evolves_to &&
            current.evolves_to.length > 0
        ) {

            current =
                current.evolves_to[0];

        } else {

            current = null;
        }

    }

    return result;
}


function renderEvolutionChain(
    chain,
    container
) {

    if (!chain.length) {

        container.innerHTML =
            `<p class="noEvolution">
                Este Pokémon não possui evoluções.
            </p>`;

        return;
    }

    container.innerHTML = "";

    chain.forEach(
        (item, index) => {

            const evolution =
                document.createElement(
                    "div"
                );

            evolution.className =
                "evolutionItem";

            evolution.dataset.id =
                item.pokemon.id;

            evolution.innerHTML = `

                <img
                    src="${getPixelImage(item.pokemon.id)}"
                    alt="${capitalizeName(item.pokemon.name)}"
                    onerror="this.src='${getFallbackImage(item.pokemon.id)}'"
                >

                <span>
                    #${String(item.pokemon.id).padStart(3, "0")}
                </span>

                <strong>
                    ${capitalizeName(item.pokemon.name)}
                </strong>

            `;

            evolution.addEventListener(
                "click",
                () => {

                    openDetails(
                        item.pokemon
                    );

                }
            );

            container.appendChild(
                evolution
            );

            if (
                index <
                chain.length - 1
            ) {

                const arrow =
                    document.createElement(
                        "div"
                    );

                arrow.className =
                    "evolutionArrow";

                arrow.textContent =
                    "→";

                container.appendChild(
                    arrow
                );

            }

        }
    );
}


function getPokemonId(url) {

    const match =
        url.match(
            /\/(\d+)\/?$/
        );

    return match
        ? Number(match[1])
        : null;
}


/* JOGO */

function setupGame() {

    if (guessGame) {

        guessGame.addEventListener(
            "click",
            event => {

                event.preventDefault();

                openGame();

            }
        );

    }

    if (closeGame) {

        closeGame.addEventListener(
            "click",
            closeGameModal
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
                    closeGameModal();
                }

            }
        );

    }

    if (gameSubmit) {

        gameSubmit.addEventListener(
            "click",
            checkGameAnswer
        );

    }

    if (gameInput) {

        gameInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    checkGameAnswer();

                }

            }
        );

    }
}


function openGame() {

    if (!allPokemon.length) {
        return;
    }

    gameScore = 0;

    if (scoreElement) {
        scoreElement.textContent =
            gameScore;
    }

    if (gameOverlay) {
        gameOverlay.classList.add(
            "active"
        );
    }

    nextGamePokemon();

    setTimeout(
        () => gameInput?.focus(),
        100
    );
}


function nextGamePokemon() {

    if (!allPokemon.length) {
        return;
    }

    gamePokemon =
        allPokemon[
            Math.floor(
                Math.random() *
                allPokemon.length
            )
        ];

    if (gameImage) {

        gameImage.src =
            getPixelImage(
                gamePokemon.id
            );

        gameImage.style.filter =
            "brightness(0)";

    }

    if (gameInput) {
        gameInput.value = "";
    }

    if (gameResult) {
        gameResult.textContent = "";
    }
}


function checkGameAnswer() {

    if (!gamePokemon ||
        !gameInput) {
        return;
    }

    const answer =
        normalizeName(
            gameInput.value
        );

    const correct =
        normalizeName(
            gamePokemon.name
        );

    if (answer === correct) {

        gameScore++;

        if (scoreElement) {
            scoreElement.textContent =
                gameScore;
        }

        if (gameResult) {

            gameResult.textContent =
                `🎉 Acertou! Era ${capitalizeName(gamePokemon.name)}!`;

        }

        if (gameImage) {
            gameImage.style.filter =
                "none";
        }

        setTimeout(
            nextGamePokemon,
            1000
        );

    } else {

        if (gameResult) {

            gameResult.textContent =
                "❌ Errado! Tente novamente.";

        }

    }
}


function closeGameModal() {

    if (gameOverlay) {

        gameOverlay.classList.remove(
            "active"
        );

    }

    gamePokemon = null;
}


/* BATALHA 1X1 */

function setupBattle() {

    if (battleButton) {

        battleButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                openBattle();

            }
        );

    }

    if (closeBattle) {

        closeBattle.addEventListener(
            "click",
            closeBattleModal
        );

    }

    if (battleOverlay) {

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

    }

    if (battlePokemon1) {

        battlePokemon1.addEventListener(
            "change",
            () =>
                updateBattlePreview(
                    1
                )
        );

    }

    if (battlePokemon2) {

        battlePokemon2.addEventListener(
            "change",
            () =>
                updateBattlePreview(
                    2
                )
        );

    }

    setupBattleSearch(
        battleSearch1,
        battlePokemon1
    );

    setupBattleSearch(
        battleSearch2,
        battlePokemon2
    );

    if (startBattle) {

        startBattle.addEventListener(
            "click",
            startSingleBattle
        );

    }
}


function openBattle() {

    if (!allPokemon.length) {
        return;
    }

    if (battleOverlay) {

        battleOverlay.classList.add(
            "active"
        );

    }

    populateBattleSelects();
}


function closeBattleModal() {

    if (battleRunning) {
        return;
    }

    if (battleOverlay) {

        battleOverlay.classList.remove(
            "active"
        );

    }
}


function populateBattleSelects() {

    if (
        !battlePokemon1 ||
        !battlePokemon2 ||
        !allPokemon.length
    ) {
        return;
    }

    const current1 =
        battlePokemon1.value;

    const current2 =
        battlePokemon2.value;

    const options =
        allPokemon.map(
            pokemon => `

                <option value="${pokemon.id}">
                    #${String(pokemon.id).padStart(3, "0")}
                    -
                    ${capitalizeName(pokemon.name)}
                </option>

            `
        ).join("");

    battlePokemon1.innerHTML =
        `<option value="">
            Escolha o Pokémon
        </option>` +
        options;

    battlePokemon2.innerHTML =
        `<option value="">
            Escolha o Pokémon
        </option>` +
        options;

    if (current1) {
        battlePokemon1.value =
            current1;
    }

    if (current2) {
        battlePokemon2.value =
            current2;
    }
}


function setupBattleSearch(
    input,
    select
) {

    if (!input || !select) {
        return;
    }

    input.addEventListener(
        "input",
        () => {

            const search =
                normalizeName(
                    input.value
                );

            const current =
                select.value;

            select.innerHTML =
                `<option value="">
                    Escolha o Pokémon
                </option>`;

            const filtered =
                allPokemon.filter(
                    pokemon =>
                        !search ||
                        normalizeName(
                            pokemon.name
                        ).includes(search) ||
                        String(
                            pokemon.id
                        ).includes(search)
                );

            filtered.forEach(
                pokemon => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        pokemon.id;

                    option.textContent =
                        `#${String(pokemon.id).padStart(3, "0")} - ${capitalizeName(pokemon.name)}`;

                    select.appendChild(
                        option
                    );

                }
            );

            if (
                current &&
                filtered.some(
                    pokemon =>
                        pokemon.id ===
                        Number(current)
                )
            ) {

                select.value =
                    current;

            }

        }
    );
}


function updateBattlePreview(
    number
) {

    const select =
        number === 1
            ? battlePokemon1
            : battlePokemon2;

    const preview =
        number === 1
            ? preview1
            : preview2;

    if (!select || !preview) {
        return;
    }

    const id =
        Number(select.value);

    const pokemon =
        allPokemon.find(
            item =>
                item.id === id
        );

    if (!pokemon) {

        preview.innerHTML =
            `<span>
                Escolha um Pokémon
            </span>`;

        return;
    }

    preview.innerHTML = `

        <img
            src="${getOfficialArtwork(pokemon.id)}"
            alt="${capitalizeName(pokemon.name)}"
            onerror="this.src='${getPixelImage(pokemon.id)}'"
        >

        <strong>
            ${capitalizeName(pokemon.name)}
        </strong>

    `;
}


async function startSingleBattle() {

    if (battleRunning) {
        return;
    }

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
            "Escolha os dois Pokémon."
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
        allPokemon.find(
            pokemon =>
                pokemon.id === id1
        );

    const pokemon2 =
        allPokemon.find(
            pokemon =>
                pokemon.id === id2
        );

    if (!pokemon1 || !pokemon2) {
        return;
    }

    battleRunning = true;

    if (startBattle) {
        startBattle.disabled = true;
    }

    renderBattleArena(
        pokemon1,
        pokemon2
    );

    let hp1 =
        getStat(
            pokemon1,
            "hp"
        );

    let hp2 =
        getStat(
            pokemon2,
            "hp"
        );

    const maxHP1 = hp1;
    const maxHP2 = hp2;

    let attacker =
        pokemon1.stats.find(
            stat =>
                stat.stat.name ===
                "speed"
        ).base_stat >=
        pokemon2.stats.find(
            stat =>
                stat.stat.name ===
                "speed"
        ).base_stat
            ? 1
            : 2;

    for (
        let turn = 0;
        turn < 50 &&
        hp1 > 0 &&
        hp2 > 0;
        turn++
    ) {

        await wait(500);

        if (attacker === 1) {

            const damage =
                calculateTeamDamage(
                    pokemon1,
                    pokemon2
                );

            hp2 =
                Math.max(
                    0,
                    hp2 - damage
                );

            updateSingleBattleHP(
                2,
                hp2,
                maxHP2
            );

            animateBattleHit(
                ".fighter2"
            );

        } else {

            const damage =
                calculateTeamDamage(
                    pokemon2,
                    pokemon1
                );

            hp1 =
                Math.max(
                    0,
                    hp1 - damage
                );

            updateSingleBattleHP(
                1,
                hp1,
                maxHP1
            );

            animateBattleHit(
                ".fighter1"
            );
        }

        attacker =
            attacker === 1
                ? 2
                : 1;
    }

    const winner =
        hp1 > hp2
            ? pokemon1
            : pokemon2;

    if (battleArena) {

        const winnerElement =
            document.createElement(
                "div"
            );

        winnerElement.className =
            "battleWinner";

        winnerElement.textContent =
            `🏆 ${capitalizeName(winner.name)} venceu!`;

        battleArena.appendChild(
            winnerElement
        );

    }

    battleRunning = false;

    if (startBattle) {
        startBattle.disabled = false;
    }
}


function renderBattleArena(
    pokemon1,
    pokemon2
) {

    if (!battleArena) {
        return;
    }

    const hp1 =
        getStat(
            pokemon1,
            "hp"
        );

    const hp2 =
        getStat(
            pokemon2,
            "hp"
        );

    battleArena.innerHTML = `

        <div class="battleFighters">

            <div class="fighter fighter1">

                <img
                    src="${getOfficialArtwork(pokemon1.id)}"
                    alt="${capitalizeName(pokemon1.name)}"
                    onerror="this.src='${getPixelImage(pokemon1.id)}'"
                >

                <strong>
                    ${capitalizeName(pokemon1.name)}
                </strong>

                <div class="battleHPBar">

                    <div
                        class="battleHPFill"
                        id="battleHP1"
                        style="width:100%"
                    ></div>

                </div>

                <span id="battleHPText1">
                    ${hp1} HP
                </span>

            </div>


            <div class="battleVS">
                VS
            </div>


            <div class="fighter fighter2">

                <img
                    src="${getOfficialArtwork(pokemon2.id)}"
                    alt="${capitalizeName(pokemon2.name)}"
                    onerror="this.src='${getPixelImage(pokemon2.id)}'"
                >

                <strong>
                    ${capitalizeName(pokemon2.name)}
                </strong>

                <div class="battleHPBar">

                    <div
                        class="battleHPFill"
                        id="battleHP2"
                        style="width:100%"
                    ></div>

                </div>

                <span id="battleHPText2">
                    ${hp2} HP
                </span>

            </div>

        </div>

    `;
}


function updateSingleBattleHP(
    player,
    hp,
    maxHP
) {

    const fill =
        document.getElementById(
            `battleHP${player}`
        );

    const text =
        document.getElementById(
            `battleHPText${player}`
        );

    if (fill) {

        fill.style.width =
            `${(hp / maxHP) * 100}%`;

    }

    if (text) {

        text.textContent =
            `${hp} HP`;

    }
}


function animateBattleHit(
    selector
) {

    const element =
        document.querySelector(
            selector
        );

    if (!element) {
        return;
    }

    element.classList.remove(
        "hit"
    );

    void element.offsetWidth;

    element.classList.add(
        "hit"
    );
}


/* BATALHA DE TIMES */

function setupTeamBattle() {

    if (teamBattleButton) {

        teamBattleButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                openTeamBattle();

            }
        );

    }

    if (closeTeamBattle) {

        closeTeamBattle.addEventListener(
            "click",
            closeTeamBattleModal
        );

    }

    if (teamBattleOverlay) {

        teamBattleOverlay.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    teamBattleOverlay
                ) {

                    closeTeamBattleModal();

                }

            }
        );

    }

    if (newTeamsButton) {

        newTeamsButton.addEventListener(
            "click",
            () => {

                if (teamBattleRunning) {
                    return;
                }

                createRandomTeams();

            }
        );

    }

    if (startTeamBattle) {

        startTeamBattle.addEventListener(
            "click",
            startFullTeamBattle
        );

    }
}


function openTeamBattle() {

    if (!allPokemon.length) {
        return;
    }

    if (teamBattleOverlay) {

        teamBattleOverlay.classList.add(
            "active"
        );

    }

    createRandomTeams();
}


function closeTeamBattleModal() {

    if (teamBattleRunning) {
        return;
    }

    if (teamBattleOverlay) {

        teamBattleOverlay.classList.remove(
            "active"
        );

    }
}


function createRandomTeams() {

    if (
        allPokemon.length <
        12
    ) {
        return;
    }

    teamBattleRunning = false;

    redCurrent = 0;
    blueCurrent = 0;

    teamBattleResult.textContent = "";

    teamBattleMessage.textContent =
        "Times sorteados!";

    const shuffled =
        [...allPokemon].sort(
            () =>
                Math.random() - 0.5
        );

    redTeamData =
        shuffled.slice(0, 6);

    blueTeamData =
        shuffled.slice(6, 12);

    renderTeam(
        redTeam,
        redTeamData,
        "red"
    );

    renderTeam(
        blueTeam,
        blueTeamData,
        "blue"
    );

    resetTeamFighters();

    if (startTeamBattle) {
        startTeamBattle.disabled = false;
    }

    if (newTeamsButton) {
        newTeamsButton.disabled = false;
    }
}


function renderTeam(
    container,
    team,
    color
) {

    if (!container) {
        return;
    }

    container.innerHTML = "";

    team.forEach(
        (pokemon, index) => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "teamPokemon";

            card.dataset.index =
                index;

            card.dataset.id =
                pokemon.id;

            card.innerHTML = `

                <img
                    src="${getPixelImage(pokemon.id)}"
                    alt="${capitalizeName(pokemon.name)}"
                    onerror="this.src='${getFallbackImage(pokemon.id)}'"
                >

                <div>

                    <strong>
                        ${capitalizeName(pokemon.name)}
                    </strong>

                    <span>
                        #${String(pokemon.id).padStart(3, "0")}
                    </span>

                </div>

            `;

            container.appendChild(
                card
            );

        }
    );
}


function showTeamFighters() {

    const redPokemon =
        redTeamData[redCurrent];

    const bluePokemon =
        blueTeamData[blueCurrent];

    if (
        !redPokemon ||
        !bluePokemon
    ) {
        return;
    }

    redFighterImage.src =
        getOfficialArtwork(
            redPokemon.id
        );

    blueFighterImage.src =
        getOfficialArtwork(
            bluePokemon.id
        );

    redFighterImage.onerror =
        () => {
            redFighterImage.src =
                getPixelImage(
                    redPokemon.id
                );
        };

    blueFighterImage.onerror =
        () => {
            blueFighterImage.src =
                getPixelImage(
                    bluePokemon.id
                );
        };

    redFighterImage.alt =
        capitalizeName(
            redPokemon.name
        );

    blueFighterImage.alt =
        capitalizeName(
            bluePokemon.name
        );

    redFighterName.textContent =
        capitalizeName(
            redPokemon.name
        );

    blueFighterName.textContent =
        capitalizeName(
            bluePokemon.name
        );

    const redMaxHP =
        getStat(
            redPokemon,
            "hp"
        );

    const blueMaxHP =
        getStat(
            bluePokemon,
            "hp"
        );

    redHP.style.width =
        "100%";

    blueHP.style.width =
        "100%";

    redHPText.textContent =
        `${redMaxHP} HP`;

    blueHPText.textContent =
        `${blueMaxHP} HP`;

    updateActiveTeamCards();
}


async function startFullTeamBattle() {

    if (
        teamBattleRunning ||
        redTeamData.length !== 6 ||
        blueTeamData.length !== 6
    ) {
        return;
    }

    teamBattleRunning = true;

    if (startTeamBattle) {
        startTeamBattle.disabled = true;
    }

    if (newTeamsButton) {
        newTeamsButton.disabled = true;
    }

    redCurrent = 0;
    blueCurrent = 0;

    teamBattleResult.textContent = "";

    clearActiveTeamCards();

    try {

        while (
            redCurrent < 6 &&
            blueCurrent < 6 &&
            teamBattleRunning
        ) {

            showTeamFighters();

            const redPokemon =
                redTeamData[redCurrent];

            const bluePokemon =
                blueTeamData[blueCurrent];

            if (
                !redPokemon ||
                !bluePokemon
            ) {
                break;
            }

            teamBattleMessage.textContent =
                `${capitalizeName(redPokemon.name)} VS ${capitalizeName(bluePokemon.name)}`;

            await wait(700);

            await fightTeamRound();

        }

        if (!teamBattleRunning) {
            return;
        }

        let winner;

        if (redCurrent >= 6) {
            winner = "BLUE";
        } else if (blueCurrent >= 6) {
            winner = "RED";
        } else {
            winner = "NONE";
        }

        if (winner === "RED") {

            teamBattleMessage.textContent =
                "🏆 Batalha encerrada!";

            teamBattleResult.textContent =
                "🔴 TIME RED VENCEU!";

        } else if (winner === "BLUE") {

            teamBattleMessage.textContent =
                "🏆 Batalha encerrada!";

            teamBattleResult.textContent =
                "🔵 TIME BLUE VENCEU!";

        }

    } catch (error) {

        console.error(
            "Erro na batalha de times:",
            error
        );

        teamBattleMessage.textContent =
            "Ocorreu um erro durante a batalha.";

    } finally {

        teamBattleRunning = false;

        if (startTeamBattle) {
            startTeamBattle.disabled = false;
        }

        if (newTeamsButton) {
            newTeamsButton.disabled = false;
        }

    }
}


async function fightTeamRound() {

    const redPokemon =
        redTeamData[redCurrent];

    const bluePokemon =
        blueTeamData[blueCurrent];

    if (
        !redPokemon ||
        !bluePokemon
    ) {
        return;
    }

    let redHealth =
        getStat(
            redPokemon,
            "hp"
        );

    let blueHealth =
        getStat(
            bluePokemon,
            "hp"
        );

    const maxRedHealth =
        redHealth;

    const maxBlueHealth =
        blueHealth;

    const redSpeed =
        getStat(
            redPokemon,
            "speed"
        );

    const blueSpeed =
        getStat(
            bluePokemon,
            "speed"
        );

    let attacker =
        redSpeed >= blueSpeed
            ? "red"
            : "blue";

    let turns = 0;

    while (
        redHealth > 0 &&
        blueHealth > 0 &&
        teamBattleRunning &&
        turns < 40
    ) {

        turns++;

        let damage;

        if (attacker === "red") {

            damage =
                calculateTeamDamage(
                    redPokemon,
                    bluePokemon
                );

            blueHealth =
                Math.max(
                    0,
                    blueHealth - damage
                );

            updateTeamHP(
                "blue",
                blueHealth,
                maxBlueHealth
            );

            animateTeamHit(
                blueFighterImage
            );

            teamBattleMessage.textContent =
                `🔴 ${capitalizeName(redPokemon.name)} atacou!`;

        } else {

            damage =
                calculateTeamDamage(
                    bluePokemon,
                    redPokemon
                );

            redHealth =
                Math.max(
                    0,
                    redHealth - damage
                );

            updateTeamHP(
                "red",
                redHealth,
                maxRedHealth
            );

            animateTeamHit(
                redFighterImage
            );

            teamBattleMessage.textContent =
                `🔵 ${capitalizeName(bluePokemon.name)} atacou!`;

        }

        await wait(450);

        attacker =
            attacker === "red"
                ? "blue"
                : "red";
    }

    if (!teamBattleRunning) {
        return;
    }

    if (redHealth <= 0) {

        markTeamPokemonDefeated(
            "red",
            redCurrent
        );

        teamBattleMessage.textContent =
            `💥 ${capitalizeName(redPokemon.name)} foi derrotado!`;

        redCurrent++;

    } else if (blueHealth <= 0) {

        markTeamPokemonDefeated(
            "blue",
            blueCurrent
        );

        teamBattleMessage.textContent =
            `💥 ${capitalizeName(bluePokemon.name)} foi derrotado!`;

        blueCurrent++;

    } else {

        if (
            redHealth <=
            blueHealth
        ) {

            markTeamPokemonDefeated(
                "red",
                redCurrent
            );

            redCurrent++;

        } else {

            markTeamPokemonDefeated(
                "blue",
                blueCurrent
            );

            blueCurrent++;

        }

    }

    await wait(800);
}


function calculateTeamDamage(
    attacker,
    defender
) {

    const attack =
        getStat(
            attacker,
            "attack"
        );

    const defense =
        getStat(
            defender,
            "defense"
        );

    const random =
        0.85 +
        Math.random() * 0.15;

    const damage =
        Math.floor(
            (
                (
                    (
                        attack *
                        2
                    ) / 5
                    + 2
                ) *
                50 *
                Math.max(
                    1,
                    attack
                )
                /
                Math.max(
                    1,
                    defense
                )
                /
                50
                + 2
            ) *
            random
        );

    return Math.max(
        1,
        damage
    );
}


function updateTeamHP(
    team,
    hp,
    maxHP
) {

    const percentage =
        Math.max(
            0,
            Math.min(
                100,
                (hp / maxHP) * 100
            )
        );

    if (team === "red") {

        redHP.style.width =
            `${percentage}%`;

        redHPText.textContent =
            `${hp} HP`;

    } else {

        blueHP.style.width =
            `${percentage}%`;

        blueHPText.textContent =
            `${hp} HP`;

    }
}


function markTeamPokemonDefeated(
    team,
    index
) {

    const container =
        team === "red"
            ? redTeam
            : blueTeam;

    if (!container) {
        return;
    }

    const card =
        container.querySelector(
            `[data-index="${index}"]`
        );

    if (card) {

        card.classList.add(
            "defeated"
        );

    }
}


function updateActiveTeamCards() {

    clearActiveTeamCards();

    const redCard =
        redTeam?.querySelector(
            `[data-index="${redCurrent}"]`
        );

    const blueCard =
        blueTeam?.querySelector(
            `[data-index="${blueCurrent}"]`
        );

    if (redCard) {

        redCard.classList.add(
            "active"
        );

    }

    if (blueCard) {

        blueCard.classList.add(
            "active"
        );

    }
}


function clearActiveTeamCards() {

    document
        .querySelectorAll(
            ".teamPokemon"
        )
        .forEach(
            card => {

                card.classList.remove(
                    "active"
                );

            }
        );
}


function resetTeamFighters() {

    redFighterImage.src = "";
    blueFighterImage.src = "";

    redFighterName.textContent =
        "---";

    blueFighterName.textContent =
        "---";

    redHP.style.width =
        "0%";

    blueHP.style.width =
        "0%";

    redHPText.textContent =
        "0 HP";

    blueHPText.textContent =
        "0 HP";
}


function animateTeamHit(
    image
) {

    if (!image) {
        return;
    }

    image.classList.remove(
        "hit"
    );

    void image.offsetWidth;

    image.classList.add(
        "hit"
    );
}


/* TECLADO */

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

                closeGameModal();

            }

            if (
                battleOverlay?.classList.contains(
                    "active"
                ) &&
                !battleRunning
            ) {

                closeBattleModal();

            }

            if (
                teamBattleOverlay?.classList.contains(
                    "active"
                ) &&
                !teamBattleRunning
            ) {

                closeTeamBattleModal();

            }

        }
    );
}


/* IMAGENS */

function getPixelImage(id) {

    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}


function getFallbackImage(id) {

    return getPixelImage(id);
}


function getOfficialArtwork(id) {

    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}


/* UTILIDADES */

function capitalizeName(name) {

    return name
        .split("-")
        .map(
            part =>
                part.charAt(0).toUpperCase() +
                part.slice(1)
        )
        .join(" ");

}


function normalizeName(name) {

    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /[^a-z0-9]/g,
            ""
        );
}


function wait(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );
}


/* INICIAR */

startApp();
