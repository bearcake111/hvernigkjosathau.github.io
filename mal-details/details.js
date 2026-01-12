'use strict';

//ELEMENTS//
const labelPagetitle = document.querySelector(`.page-title`);
const tabThingmenn = document.getElementById(`tab-thingmenn`);
const tabMalaskra = document.getElementById(`tab-malaskra`);

const labelMal = document.getElementById(`mal-label`);
const labelMalDate = document.getElementById(`mal-date`);
const labelMalStatus = document.getElementById(`mal-status`);
const linkMalDocuments = document.getElementById(`mal-documents`);

const labelName = document.querySelector(`.category-name`);
const labelParty = document.querySelector(`.category-party`);
const containerThingmenn = document.querySelector(`.thingmenn-container`);

//LOOSE VARIABLES//
let arrThingmenn;
let arrMalaskra;
let currAtkvGrNr;
let currMal;
let nameSorting = false;
let partySorting = true;

//FUNCTIONS//
function declareCurrMal() {
  if (currAtkvGrNr) {
    currMal = arrMalaskra.find(mal => mal.atkvGrNr === currAtkvGrNr);
  }
}

function displayMal() {
  labelMal.textContent = currMal.name;
  labelMalDate.textContent = currMal.date;
  labelMalStatus.textContent = currMal.atkv.afgr;
  linkMalDocuments.href = currMal.skjalPdf;
}

function displayThingmennVotes(arrThingmenn) {
  containerThingmenn.innerHTML = ``;

  arrThingmenn.forEach(thingmadur => {
    const name = thingmadur.name;
    const party = thingmadur.flokkur;

    const html = `<tr>
                <th class="name">${name}</th>
                <th class="party">${party}</th>
                <td><div class="vote já hidden"></div></td>
                <td><div class="vote nei hidden"></div></td>
                <td><div class="vote greiðir-ekki-atkvæði hidden"></div></td>
                <td><div class="vote boðaði-fjarvist hidden"></div></td>
                <td><div class="vote fjarverandi hidden"></div></td>
              </tr>`;

    containerThingmenn.insertAdjacentHTML(`beforeend`, html);
    const row = containerThingmenn.lastElementChild;

    const foundVote = currMal.atkvListi.find(atkv => atkv.nafn === name);

    if (foundVote) {
      const voteMarker = row.querySelector(`.${foundVote.atkv}`);

      voteMarker.classList.toggle(`hidden`);
    }
  });
}

function sortByName(desc = false) {
  const rows = Array.from(containerThingmenn.querySelectorAll('tr'));
  rows.sort((a, b) => {
    const pa = a.querySelector('.name')?.textContent.trim() ?? '';
    const pb = b.querySelector('.name')?.textContent.trim() ?? '';

    return (
      pa.localeCompare(pb, 'is', { sensitivity: 'base' }) * (desc ? -1 : 1)
    );
  });

  rows.forEach(row => containerThingmenn.appendChild(row));
}

function sortByParty(desc = false) {
  const rows = Array.from(containerThingmenn.querySelectorAll('tr'));
  rows.sort((a, b) => {
    const pa = a.querySelector('.party')?.textContent.trim() ?? '';
    const pb = b.querySelector('.party')?.textContent.trim() ?? '';

    return (
      pa.localeCompare(pb, 'is', { sensitivity: 'base' }) * (desc ? -1 : 1)
    );
  });

  rows.forEach(row => containerThingmenn.appendChild(row));
}

//LOADING DATA//

window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  currAtkvGrNr = params.get('atkvGrNr');
});

async function loadThingmenn() {
  try {
    const res = await fetch('/api/thingmenn');
    const data = await res.json();
    arrThingmenn = data;
  } catch (err) {
    console.error(err);
  }
}

async function loadMalaskra() {
  try {
    const res = await fetch('/api/malaskra');
    const data = await res.json();
    arrMalaskra = data;
  } catch (err) {
    console.error(err);
  }
}

async function initialize() {
  await loadThingmenn();
  await loadMalaskra();
  declareCurrMal();
  displayMal();
  displayThingmennVotes(arrThingmenn);
}

initialize();

//EVENT LISTENERS//

//NAVBAR//
labelPagetitle.addEventListener(`click`, function () {
  window.location.href = `/index.html`;
});

tabThingmenn.addEventListener(`click`, function () {
  window.location.href = `/index.html`;
});

tabMalaskra.addEventListener(`click`, function () {
  window.location.href = `../search-malaskra/index.html`;
});

//SORTING//
labelName.addEventListener(`click`, function () {
  nameSorting = nameSorting ? false : true;
  partySorting = true;
  sortByName(nameSorting);
});

labelParty.addEventListener(`click`, function () {
  partySorting = partySorting ? false : true;
  nameSorting = true;
  sortByParty(partySorting);
});
