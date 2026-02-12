'use strict';

//ELEMENTS//
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

    const html = `<tr class="thingmadur">
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
  assignRows();
}

function assignRows() {
  const rows = containerThingmenn.children;
  let count = 0;

  for (const rowEl of rows) {
    rowEl.classList.remove(`even`, `odd`);
    const row = count % 2 === 0 ? `even` : `odd`;
    rowEl.classList.add(row);
    count++;
  }
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

function flipArrow(e, sorting) {
  const arrow = e.currentTarget.querySelector(`.filter-arrow`);

  if (!arrow.classList.contains(`arrow-rotated`)) {
    const allArrows = document.querySelectorAll(`.filter-arrow`);
    allArrows.forEach(ar => {
      ar.classList.remove(`arrow-rotated`);
    });
  }
  if (sorting) {
    arrow.classList.add('arrow-rotated');
  } else {
    arrow.classList.remove('arrow-rotated');
  }
}

//LOADING DATA//

window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  currAtkvGrNr = params.get('atkvGrNr');
});

async function loadThingmenn() {
  try {
    const res = await fetch('../thingmenn.json');
    const data = await res.json();
    arrThingmenn = data;
  } catch (err) {
    console.error(err);
  }
}

async function loadMalaskra() {
  try {
    const res = await fetch('../malaskra.json');
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

tabThingmenn.addEventListener(`click`, function () {
  window.location.href = `../index.html`;
});

tabMalaskra.addEventListener(`click`, function () {
  window.location.href = `../search-malaskra/index.html`;
});

//SORT BY NAME//
labelName.addEventListener(`click`, function (e) {
  nameSorting = !nameSorting;
  partySorting = true;
  flipArrow(e, nameSorting);
  sortByName(nameSorting);
  assignRows();
});

//SORT BY PARTY//
labelParty.addEventListener(`click`, function (e) {
  partySorting = !partySorting;
  nameSorting = true;
  flipArrow(e, partySorting);
  sortByParty(partySorting);
  assignRows();
});
