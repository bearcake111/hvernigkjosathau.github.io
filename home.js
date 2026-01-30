'use strict';

//Elements

const labelPagetitle = document.querySelector(`.page-title`);
const tabThingmenn = document.getElementById(`tab-thingmenn`);
const tabMalaskra = document.getElementById(`tab-malaskra`);

const inputSearchName = document.getElementById(`input-nafn`);
const containerProfiles = document.getElementById(`profiles`);

//Loose variables
let arrThingmenn;

function displayProfiles(arrThingmenn) {
  containerProfiles.innerHTML = ``;

  arrThingmenn.forEach(person => {
    const name = person.name;
    const img = person.img;

    const html = `<div class="profile-container">
          <div class="image-wrapper">
            <img src="${img || 'thingmenn-profile.jpg'}" alt="profile-picture" 
            onerror="this.onerror=null; this.src='thingmenn-profile.jpg';"/>
            <div class="name-banner"><p class="name-text">${name}</p></div>
          </div>
        </div>`;

    containerProfiles.insertAdjacentHTML(`beforeend`, html);
  });

  document.querySelectorAll('.profile-container').forEach(container => {
    container.addEventListener('click', () => {
      const name = container.querySelector(`.name-text`).textContent;
      const url = `./search-thingmenn/index.html?name=${encodeURIComponent(
        name,
      )}`;
      window.location.href = url;
    });
  });
  return arrThingmenn;
}

function filterThingmenn(arrThingmenn) {
  const filter = normalizeString(inputSearchName.value);

  if (!filter) return arrThingmenn;

  return arrThingmenn.filter(person => {
    return normalizeString(person.name).includes(filter);
  });
}

function normalizeString(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ð/g, 'd')
    .replace(/þ/g, 'th')
    .replace(/æ/g, 'ae');
}

//LOADING DATA//

async function loadThingmenn() {
  try {
    const res = await fetch('./thingmenn.json');
    const data = await res.json();
    arrThingmenn = data;
    displayProfiles(arrThingmenn);
  } catch (err) {
    console.error(err);
  }
}

async function initialize() {
  await loadThingmenn();
}

initialize();

//EVENT LISTENERS//

//NAVIGATION//

tabThingmenn.addEventListener(`click`, function () {
  window.location.href = `./index.html`;
});

tabMalaskra.addEventListener(`click`, function () {
  window.location.href = `./search-malaskra/index.html`;
});

//SEARCHBAR//
inputSearchName.addEventListener(`input`, element => {
  displayProfiles(filterThingmenn(arrThingmenn));
  console.log(`click`);
});
