const myInput = document.getElementById('myInput');
const dropDownMenu = document.querySelector('.dropDownMenu');
const menuItems = document.querySelectorAll('.menu li');

const repos = [];
const suggestions = [];

async function getDataFromApiGithub(api) {
    const response = await fetch(api);
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();

    const newSuggestions = data.items.slice(0, 5).map(obj => ({
        name: obj.name,
        id: obj.id,
        owner: obj.owner.login,
        stars: obj.stargazers_count
    }));

    suggestions.length = 0;
    suggestions.push(...newSuggestions);

    return data;
}

function debounce(fn, ms = 300) {
    let timer;

    return function (...args) {
        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(() => {
            fn.apply(this, args);
        }, ms);
    };
}

const debouncedSearch = debounce(async (value) => {
    if (value.trim() === '') {
        suggestions.length = 0;
        dropDownMenu.style.display = 'none';
        return;
    }

    try {
        const data = await getDataFromApiGithub(`https://api.github.com/search/repositories?q=${value}`);
        console.log(data, `https://api.github.com/search/repositories?q=${value}`);
        console.log(suggestions);

        dropDownMenu.style.display = 'block';
        menuItems.forEach((item, index) => {
            if (suggestions[index]) {
                item.textContent = suggestions[index].name;
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}, 300);

function renderList(repoObj) {
    const exists = repos.some(repo => repo.name === repoObj.name);
    if (exists) {
        return;
    }

    repos.push(repoObj);

    const newDiv = document.createElement('div');
    newDiv.className = 'repo';

    const paraOfName = document.createElement('p');
    const paraOfOwner = document.createElement('p');
    const paraOfStars = document.createElement('p');

    const divOfBtnDelete = document.createElement('div');
    divOfBtnDelete.className = 'button-container';
    const btnDelete = document.createElement('button');
    btnDelete.className = 'buttonDelete';
    btnDelete.innerText = 'X';

    divOfBtnDelete.appendChild(btnDelete);

    paraOfName.innerText = `Name: ${repoObj.name}`;
    paraOfOwner.innerText = `Owner: ${repoObj.owner}`;
    paraOfStars.innerText = `Stars: ${repoObj.stars}`;

    newDiv.append(paraOfName, paraOfOwner, paraOfStars, divOfBtnDelete);
    document.getElementById("listOfRepos").appendChild(newDiv);

    btnDelete.addEventListener('click', function () {
        newDiv.remove();
        const index = repos.findIndex(repo => repo.name === repoObj.name);
        if (index !== -1) {
            repos.splice(index, 1);
        }
        console.log(repos);
    });
}

myInput.addEventListener('input', function (event) {
    const value = event.target.value.trim();
    if (value === '') {
        dropDownMenu.style.display = 'none';
        suggestions.length = 0;
        return;
    }

    debouncedSearch(value);
});

menuItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        const selectedSuggestion = suggestions[index];
        if (selectedSuggestion) {
            const repoObj = {
                name: selectedSuggestion.name,
                owner: selectedSuggestion.owner,
                stars: selectedSuggestion.stars
            };
            renderList(repoObj);

            myInput.value = '';
            dropDownMenu.style.display = 'none';
            suggestions.length = 0;
        }
    });
});