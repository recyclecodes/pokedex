document.addEventListener('DOMContentLoaded', () => {
  const pokedex = document.getElementById('pokedex');
  const paginationContainer = document.getElementById('pagination');
  const itemsPerPage = 24;
  const MAX_POKEMONS = 493;
  let currentPage = 1;
  let pokemonData = [];
  let filteredData = [];

  const typeColors = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC',
  };

  const fetchPokemon = async () => {
    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=${MAX_POKEMONS}`
      );
      const data = await response.json();
      pokemonData = data.results;
      filteredData = [...pokemonData];
      displayPokemon(currentPage);
    } catch (error) {
      console.error('Failed to fetch Pokémon data', error);
    }
  };

  const fetchPokemonDetails = async (id) => {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const data = await response.json();
      const types = data.types.map((type) => type.type.name);
      return {
        id: data.id,
        name: data.name,
        image:
          data.sprites.versions['generation-v']['black-white'].animated
            .front_default,
        types: types,
        backgroundColor: types.length > 0 ? typeColors[types[0]] : '#ffffff',
        atk: data.stats[1].base_stat,
        def: data.stats[2].base_stat,
        hp: data.stats[0].base_stat,
        spd: data.stats[5].base_stat,
      };
    } catch (error) {
      console.error('Failed to fetch Pokémon details', error);
    }
  };

  const displayPokemon = async (page) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = page * itemsPerPage;
    const currentPageData = filteredData.slice(startIndex, endIndex);
    pokedex.innerHTML = '';
    currentPageData.forEach(async (pokemon) => {
      const pokemonDetails = await fetchPokemonDetails(
        pokemon.url.split('/').slice(-2, -1)[0]
      );
      const listItem = createPokemonCard(pokemonDetails);
      pokedex.appendChild(listItem);
    });
    displayPagination(page);
  };

  const createPokemonCard = (pokemonDetails) => {
    const listItem = document.createElement('li');
    listItem.classList.add('pokemon-card');

    const link = document.createElement('div');
    link.classList.add('pokemon-link');
    link.style.cursor = 'pointer';
    link.style.textDecoration = 'none';
    link.style.color = 'inherit';
    link.addEventListener('click', async () => {
      showLoadingIndicator();
      const trivia = await getPokemonTrivia(pokemonDetails.name);
      displayPokemonTrivia(trivia, pokemonDetails.image, pokemonDetails);
      openModal(pokemonDetails.backgroundColor);
      hideLoadingIndicator();
    });

    const imageContainer = document.createElement('div');
    imageContainer.classList.add('image-container');
    imageContainer.style.backgroundColor = pokemonDetails.backgroundColor;

    const image = document.createElement('img');
    image.src = pokemonDetails.image;
    image.alt = pokemonDetails.name;
    imageContainer.appendChild(image);

    const nameIdContainer = document.createElement('div');
    nameIdContainer.classList.add('name-id-container');
    nameIdContainer.innerHTML = `
          <span class="name-id-container__item name-id-container__name">${pokemonDetails.name}</span>
          <span class="name-id-container__item name-id-container__separator">#${pokemonDetails.id}</span>
      `;

    const typeList = document.createElement('ul');
    typeList.classList.add('type-list');
    pokemonDetails.types.forEach((type) => {
      const typeItem = document.createElement('li');
      typeItem.classList.add('type-list__item');
      typeItem.textContent = type;
      typeItem.style.backgroundColor = typeColors[type];
      typeList.appendChild(typeItem);
    });

    link.appendChild(imageContainer);
    link.appendChild(nameIdContainer);
    link.appendChild(typeList);
    listItem.appendChild(link);

    return listItem;
  };

  const displayPagination = (currentPage) => {
    paginationContainer.innerHTML = '';

    const prevButton = createPaginationButton('<');
    prevButton.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        displayPokemon(currentPage);
      }
    });
    paginationContainer.appendChild(prevButton);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    for (let i = 1; i <= totalPages; i++) {
      const pageButton = createPaginationButton(i);
      if (i === currentPage) {
        pageButton.classList.add('active');
      }
      pageButton.addEventListener('click', () => {
        currentPage = i;
        displayPokemon(currentPage);
      });
      paginationContainer.appendChild(pageButton);
    }

    const nextButton = createPaginationButton('>');
    nextButton.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage++;
        displayPokemon(currentPage);
      }
    });
    paginationContainer.appendChild(nextButton);
  };

  const createPaginationButton = (content) => {
    const button = document.createElement('button');
    button.classList.add('pagination__button');
    if (typeof content === 'number') {
      button.textContent = content;
    } else {
      button.innerHTML = content;
    }
    return button;
  };

  const searchPokemon = () => {
    const input = document.getElementById('searchbar').value.toLowerCase();
    filteredData = pokemonData.filter((pokemon) =>
      pokemon.name.includes(input)
    );
    displayPokemon(1);
  };

  document.getElementById('searchbar').addEventListener('keyup', searchPokemon);

  const modal = document.getElementById('modal');
  const closeBtn = document.getElementById('closeBtn');

  const closeModal = () => {
    modal.style.display = 'none';
  };

  closeBtn.onclick = () => {
    closeModal();
  };

  window.onclick = (event) => {
    if (event.target === modal) {
      closeModal();
    }
  };

  window.onkeydown = (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  };

  const showLoadingIndicator = () => {
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'block';
  };

  const hideLoadingIndicator = () => {
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'none';
  };

  const displayPokemonTrivia = (trivia, imageSrc, pokemonDetails) => {
    const modalText = document.getElementById('modalDetails');
    modalText.innerHTML = `
      <h2 class="name-id-container__item name-id-container__name">${pokemonDetails.name}</h2>
      <p>HP: ${pokemonDetails.hp}</p>
      <p>ATK: ${pokemonDetails.atk}</p>
      <p>DEF: ${pokemonDetails.def}</p>
      <p>SPD: ${pokemonDetails.spd}</p>
    `

    const modalTrivia = document.getElementById('modalTrivia');
    modalTrivia.innerHTML = trivia;

    const modalImage = document.getElementById('modalImage');
    modalImage.src = imageSrc;
  };

  const openModal = (backgroundColor) => {
    const modalBackground = document.getElementById('modalBackground');
    modalBackground.className = 'modal-background bg-' + backgroundColor;
    modal.style.display = 'block';
  };

  const getPokemonTrivia = async (pokemonName) => {
    try {
      showLoadingIndicator();
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPEN_AI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `As a passionate Pokémon enthusiast, your task is to unveil captivating facts about ${pokemonName}. Craft an engaging presentation with finesse, ensuring it is both responsive and well-structured. Your presentation will be displayed in a modal. Ensure your presentation showcases intriguing tidbits about the chosen Pokémon, maintaining both accessibility and flair. Dive into the world of ${pokemonName} with enthusiasm and creativity! Limit the facts to 400 characters make each facts enclose in an appropriate header tags and paragraph tags. Start every trivia with header "Meet ${pokemonName}"`,
              },
            ],
            max_tokens: 400,
          }),
        }
      );
      const data = await response.json();
      if (data && data.choices && data.choices.length > 0) {
        const triviaMessage = data.choices[0].message.content;
        return triviaMessage || 'Trivia not available for this Pokémon.';
      } else {
        throw new Error('Trivia not found.');
      }
    } catch (error) {
      console.error('Error fetching Pokémon trivia:', error);
      return 'Trivia not available for this Pokémon.';
    } finally {
      hideLoadingIndicator();
    }
  };

  fetchPokemon();
});
