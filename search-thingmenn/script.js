'use strict';

// Elements
const tabThingmenn = document.getElementById(`tab-thingmenn`);
const tabMalaskra = document.getElementById(`tab-malaskra`);

const sectionNameSelected = document.getElementById(`thingmadur-valinn`);
const imgProfile = document.querySelector(`.profile_picture`);
const labelName = document.getElementById(`profile-name`);
const labelParty = document.getElementById(`label-party`);
const containerThingseta = document.getElementById(`container-thingseta`);

const buttonAdvancedSearch = document.querySelector(`.advanced-search-btn`);
const containerSearchDate = document.getElementById(`date-searchbar`);
const inputDateFirst = document.getElementById(`input-date-first`);
const inputDateSecond = document.getElementById(`input-date-second`);
const buttonSearchDate = document.getElementById(`search-date-button`);
const errorNoDate = document.getElementById(`error-no-date`);
const errorWrongOrder = document.getElementById(`error-wrong-order`);

const inputSearchMalaskra = document.getElementById(`search-malaskra-input`);
const buttonSearchMalaskra = document.getElementById(`search-malaskra-button`);

const containerEfnisflokkar = document.getElementById('efnisflokkar');

const containerDagsetning = document.getElementById(`dags-container`);
const arrow = document.querySelector('.filter-arrow');

const containerMal = document.querySelector(`.mal-container`);

//Loose variables
let arrThingmenn;
let arrMalaskra;
let arrEfnisflokkar;
let currEfnisflokkur = `Öll mál`;
let malOrder = false;
let currThingmadur;

// Functions

function findThingmadur() {
  currThingmadur = arrThingmenn.find(
    thingmadur => thingmadur.name === labelName.textContent,
  );
  return currThingmadur;
}

function displayName(name) {
  labelName.textContent = `${name}`;
  return name;
}

function displayProfileInfo(thingmadur) {
  const name = thingmadur.name;
  const party = thingmadur.flokkur;
  const arrThingseta = thingmadur.thingsetaNr;

  labelParty.textContent = party;

  arrThingseta.forEach(elem => {
    const html = `<p class="thingseta">${elem}. þing</p>`;

    containerThingseta.insertAdjacentHTML('afterbegin', html);
  });
  displayName(name);
  displayImg(thingmadur);
}

function displayImg(thingmadur) {
  labelName.textContent = thingmadur.name;
  imgProfile.src = thingmadur.img;
}

function revealAdvancedSearch() {
  containerSearchDate.classList.toggle(`hidden`);
  containerEfnisflokkar.classList.toggle(`hidden`);
}

function addCategories() {
  const efnisflokkurReversed = arrEfnisflokkar.toReversed();
  efnisflokkurReversed.forEach(obj => {
    const yfirflokkur = obj.yfirflokkur;
    const yfirflokkurId = yfirflokkur.replaceAll(` `, `-`);

    const html = `
      <div class="yfirflokkur-div">
        <p id="${yfirflokkurId}" class="yfirflokkur-txt">${yfirflokkur}</p>
      </div>
    `;
    containerEfnisflokkar.insertAdjacentHTML(`afterbegin`, html);
  });

  document.querySelectorAll(`.yfirflokkur-div`).forEach(div => {
    div.addEventListener(`mouseenter`, function () {
      this.style.backgroundColor = `#DDDDDD`;
    });
    div.addEventListener(`mouseleave`, function () {
      this.style.backgroundColor = ``;
    });
  });
}

function displayMal(malaskra) {
  clearDateSearch();
  containerMal.innerHTML = ``;
  const tempMalaskra = filterMalaskra(malaskra);
  const sortedMalaskra = sortMalaskra(tempMalaskra, malOrder);

  sortedMalaskra.forEach(function (mal, i) {
    const name = mal.name;
    const date = mal.date;
    const time = mal.time;
    const nr = mal.nr;
    const atkvGrNr = mal.atkvGrNr;
    const skjalPdf = mal.skjalPdf;
    const result = mal.atkv.afgr;

    const html = `
      <tr class="mal" data-nr="${nr}" data-atkvgrnr="${atkvGrNr}" data-date="${date}"data-time="${time}">
        <th class="mal-date">${date}</th>
        <th class="mal-heading">${name}</th>
        <th class="mal-pdf"><a href="${skjalPdf}" target="_blank">Nánar</a></th>
        <td><div class="vote já hidden"></div></td>
        <td><div class="vote nei hidden"></div></td>
        <td><div class="vote greiðir-ekki-atkvæði hidden"></div></td>
        <td><div class="vote boðaði-fjarvist hidden"></div></td>
        <td><div class="vote fjarverandi hidden"></div></td>
        <td><div class="result">${result}</div></td>
      </tr>
    `;
    containerMal.insertAdjacentHTML(`afterbegin`, html);
    const foundVote = mal.atkvListi.find(
      item => item.nafn === labelName.textContent,
    );

    if (foundVote) {
      const atkv = foundVote.atkv;
      const containerAtkv = document.querySelector(`.${atkv}`);
      containerAtkv.classList.toggle(`hidden`);
    }
  });
  foldMal();
  assignRows();

  return sortedMalaskra;
}

function filterMalaskra(arrMalaskra) {
  if (currEfnisflokkur === `Öll mál`) return arrMalaskra;

  const setNr = new Set(
    arrEfnisflokkar
      .find(yf => yf.yfirflokkur === currEfnisflokkur)
      .undirflokkar.flatMap(uf => uf.mal)
      .map(mal => mal.nr),
  );

  const filteredMalaskra = arrMalaskra.filter(mal => setNr.has(mal.nr));
  return filteredMalaskra;
}

function foldMal() {
  const rows = [...document.querySelectorAll('.mal')];
  if (rows.length === 0) return;

  const groups = new Map();

  rows.forEach(row => {
    const nr = row.dataset.nr;
    const date = row.dataset.date;
    const time = row.dataset.time;

    if (!groups.has(nr)) groups.set(nr, []);
    groups.get(nr).push({ row, date, time });
  });

  groups.forEach(malNr => {
    if (malNr.length === 1) return;

    malNr.sort((a, b) => {
      return parseDT(b.date, b.time) - parseDT(a.date, a.time);
    });

    const newest = malNr[0].row;
    const older = malNr.slice(1).map(x => x.row);
    newest.classList.add('newest');
    older.forEach(r => r.classList.add('older', 'hidden'));

    //add arrow
    let arrow = newest.querySelector('.fold-arrow');
    if (!arrow) {
      arrow = document.createElement('div');
      arrow.classList.add('fold-arrow');
      newest.firstElementChild.prepend(arrow);
    }

    arrow.onclick = () => {
      older.forEach(r => r.classList.toggle('hidden'));
      arrow.classList.toggle('open');
      assignRows();
    };
  });
}

function sortMalaskra(tempMalaskra, desc = false) {
  const sortedArr = tempMalaskra.map(mal => ({ ...mal }));

  const groups = new Map();
  for (const mal of sortedArr) {
    if (!groups.has(mal.nr)) groups.set(mal.nr, []);
    groups.get(mal.nr).push(mal);
  }

  for (const group of groups.values()) {
    group.sort((a, b) => {
      const A = parseDT(a.date, a.time);
      const B = parseDT(b.date, b.time);
      return (A - B) * (desc ? -1 : 1);
    });
  }

  const groupArr = Array.from(groups.values());

  groupArr.sort((groupA, groupB) => {
    const newestA = parseDT(
      groupA[groupA.length - 1].date,
      groupA[groupA.length - 1].time,
    );
    const newestB = parseDT(
      groupB[groupB.length - 1].date,
      groupB[groupB.length - 1].time,
    );

    return (newestA - newestB) * (desc ? -1 : 1);
  });

  return groupArr.flat();
}

function assignRows() {
  const rows = containerMal.children;
  let count = 0;

  for (const rowEl of rows) {
    if (rowEl.classList.contains(`hidden`)) continue;

    rowEl.classList.remove(`even`, `odd`);
    const row = count % 2 === 0 ? `even` : `odd`;
    rowEl.classList.add(row);
    count++;
  }
}

function searchByDate() {
  const fromDate = new Date(inputDateFirst.value);
  const toDate = new Date(inputDateSecond.value);

  if (!inputDateFirst.value || !inputDateSecond.value) {
    errorNoDate.classList.remove(`hidden`);
    return;
  } else {
    errorNoDate.classList.add(`hidden`);
  }

  if (fromDate > toDate) {
    errorWrongOrder.classList.remove(`hidden`);
    return;
  } else {
    errorWrongOrder.classList.add(`hidden`);
  }

  document.querySelectorAll('tr[data-date]').forEach(tr => {
    const rowDate = parseDT(tr.dataset.date);

    const isBeforeFrom = fromDate && rowDate < fromDate;
    const isAfterTo = toDate && rowDate > toDate;

    if (isBeforeFrom || isAfterTo) {
      tr.classList.add(`hidden`);
    } else tr.classList.remove('hidden');
  });
  foldMal();
  return;
}

function clearDateSearch() {
  inputDateFirst.value = ``;
  inputDateSecond.value = ``;
}

function searchByMal() {
  const input = normalizeString(inputSearchMalaskra.value);
  if (input === '') {
    displayMal(arrMalaskra);
    moreInfoRedirect();
    return;
  }

  const filteredMalaskra = arrMalaskra.filter(mal =>
    normalizeString(mal.name).includes(input),
  );

  displayMal(filteredMalaskra);
  moreInfoRedirect();
  inputSearchMalaskra.value = ``;
  return filteredMalaskra;
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

function parseDT(date, time = '00:00:00') {
  return new Date(
    date.split('.').reverse().join('-') + (time ? 'T' + time : ``),
  );
}

function moreInfoRedirect() {
  document.querySelectorAll('.mal').forEach(container => {
    const malHeading = container.querySelector(`.mal-heading`);

    malHeading.addEventListener('click', () => {
      const atkvGrNr = container.dataset.atkvgrnr;
      const url = `../mal-details/index.html?atkvGrNr=${encodeURIComponent(
        atkvGrNr,
      )}`;
      window.location.href = url;
    });
  });
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

//////////LOADING DATA//////////

window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const name = params.get('name');

  if (name) {
    labelName.textContent = name;
  }
});

async function loadMalaskra() {
  try {
    const res = await fetch('../malaskra.json');
    const data = await res.json();
    arrMalaskra = data;
  } catch (err) {
    console.error(err);
  }
}

async function loadThingmenn() {
  try {
    const res = await fetch('../thingmenn.json');
    const data = await res.json();
    arrThingmenn = data;
    currThingmadur = findThingmadur();
    displayProfileInfo(currThingmadur);
  } catch (err) {
    console.error(err);
  }
}

async function loadEfnisflokkar() {
  try {
    const res = await fetch('../efnisflokkar.json');
    const data = await res.json();
    arrEfnisflokkar = data;
  } catch (err) {
    console.error(err);
  }
}

async function initialize() {
  await loadThingmenn();
  await loadMalaskra();
  await loadEfnisflokkar();
  addCategories();
  displayMal(arrMalaskra);
  moreInfoRedirect();
}

initialize();

//////////EVENT LISTENERS//////////

//NAVIGATION//

tabThingmenn.addEventListener(`click`, function () {
  window.location.href = `../index.html`;
});

tabMalaskra.addEventListener(`click`, function () {
  window.location.href = `../search-malaskra/index.html`;
});

//SEARCH MALASKRA//
buttonSearchMalaskra.addEventListener(`click`, searchByMal);

inputSearchMalaskra.addEventListener('keypress', function (event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    buttonSearchMalaskra.click();
  }
});

//ADVANCED-SEARCH//
buttonAdvancedSearch.addEventListener(`click`, revealAdvancedSearch);

//DATE SEARCHBAR//
buttonSearchDate.addEventListener(`click`, searchByDate);

//EFNISFLOKKAR//
containerEfnisflokkar.addEventListener('click', event => {
  const allDivs = containerEfnisflokkar.querySelectorAll(`.yfirflokkur-div`);
  const div = event.target.closest('.yfirflokkur-div');

  if (div) {
    allDivs.forEach(d => d.classList.remove(`clicked`));
    div.classList.add(`clicked`);

    const p = div.querySelector('.yfirflokkur-txt');
    const yfirflokkur = p ? p.textContent : '';
    currEfnisflokkur = yfirflokkur;
    displayMal(arrMalaskra);
    moreInfoRedirect();
  }
});

//DAGSETNING//
containerDagsetning.addEventListener('click', function (e) {
  malOrder = !malOrder;
  flipArrow(e, malOrder);
  displayMal(arrMalaskra);
  moreInfoRedirect();
});
