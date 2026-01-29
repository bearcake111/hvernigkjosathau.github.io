'use strict';
//CLEAN Allt á ensku
//TODO Skoða GITHUB og github pages
//Material UI eða MUI til að auðvelda UI vinnu
//TODO Bæta inn gervigreind til að gera útdrátt úr málum

// Elements
const labelPagetitle = document.querySelector(`.page-title`);
const tabThingmenn = document.getElementById(`tab-thingmenn`);
const tabMalaskra = document.getElementById(`tab-malaskra`);

const sectionNameSelected = document.getElementById(`thingmadur-valinn`);
// const labelName = document.querySelector('.nafn');
// const searchbar = document.getElementById('searchbar');
const inputNafn = document.getElementById('input-nafn');
const imgProfile = document.querySelector(`.profile_picture`);
const labelName = document.getElementById(`profile-name`);
const labelParty = document.getElementById(`label-party`);
const containerThingseta = document.getElementById(`container-thingseta`);
// const thingmennDropdown = document.getElementById('thingmenn-dropdown');

const buttonAdvancedSearch = document.querySelector(`.advanced-search-btn`);
const containerSearchDate = document.getElementById(`date-searchbar`);
const containerSearchMalaskra = document.getElementById(`malaskra-searchbar`);
const inputDateFirst = document.getElementById(`input-date-first`);
const inputDateSecond = document.getElementById(`input-date-second`);
const divButtonDate = document.querySelector(`.date-button`);
const buttonSearchDate = document.getElementById(`search-date-button`);
const errorNoDate = document.getElementById(`error-no-date`);
const errorWrongOrder = document.getElementById(`error-wrong-order`);

const inputSearchMalaskra = document.getElementById(`search-malaskra-input`);
const buttonSearchMalaskra = document.getElementById(`search-malaskra-button`);

const containerEfnisflokkar = document.getElementById('efnisflokkar');

const containerDagsetning = document.getElementById(`dags-container`);
const arrow = document.querySelector('.filter-arrow');

const containerMal = document.querySelector(`.mal-container`);
const voteYes = document.querySelector('.já');
const voteNo = document.querySelector('.nei');
const voteAbstain = document.querySelector('.greiðir-ekki-atkvæði');
const voteAbscent = document.querySelector('.boðaði-fjarvist');
const voteAway = document.querySelector('.fjarverandi');

//Loose variables
let arrThingmenn;
let arrMalaskra;
let arrEfnisflokkar;
let currEfnisflokkur = `Öll mál`;
let malOrder = `up`;
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

function populateList() {
  thingmennDropdown.innerHTML = ``;
  arrThingmenn.forEach(function (thingmadur, i) {
    const div = document.createElement('div');
    const name = thingmadur.name;

    div.classList.add('searchable-item');
    div.textContent = name;

    div.addEventListener('click', () => {
      searchbar.classList.toggle(`hidden`);
      // labelName.classList.toggle(`hidden`);
      thingmennDropdown.style.display = 'none';
      sectionNameSelected.classList.remove(`hidden`);
      displayProfileInfo(thingmadur);
      displayMal(arrMalaskra);
      moreInfoRedirect();
    });
    thingmennDropdown.appendChild(div);
  });
}

//Shows filtered options as user types //CLEAN Mögulega betra upp á performance að hafa hann bara í gangi á meðan verið er að skrifa í boxið //CLEAN Ætti kannski að færa þetta niður í event listeners
// inputNafn.addEventListener(`input`, () => {
//   const filter = inputNafn.value.toLowerCase();
//   thingmennDropdown.style.display = `block`;

//   Array.from(thingmennDropdown.children).forEach(item => {
//     const text = item.textContent.toLowerCase();
//     item.style.display = text.startsWith(filter) ? 'block' : 'none';
//   });
// });

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

//TODO Only display mal if there is a vote for it
//TODO If there is no mal with votes then display a message: "Engin atkvæði á skrá"
function displayMal(malaskra) {
  clearDateSearch();
  containerMal.innerHTML = ``;
  const tempMalaskra = filterMalaskra(malaskra);
  const sortedMalaskra = sortMalaskra(tempMalaskra, malOrder);

  sortedMalaskra.forEach(function (mal, i) {
    // const row = i % 2 === 0 ? `even` : `odd`;
    const name = mal.name;
    const date = mal.date;
    const time = mal.time;
    const nr = mal.nr;
    const atkvGrNr = mal.atkvGrNr;
    const skjalPdf = mal.skjalPdf; //TODO Bæta við grunnskjali þegar á við s.s. fjárlögum
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
    //Add votes
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

//Filter by efnisflokkur
function filterMalaskra(arrMalaskra) {
  if (currEfnisflokkur === `Öll mál`) {
    return arrMalaskra;
  }
  let count = 0;
  const nrEfnisflokkar = new Set();

  for (const yf of arrEfnisflokkar) {
    if (currEfnisflokkur && yf.yfirflokkur !== currEfnisflokkur) continue;

    for (const uf of yf.undirflokkar) {
      for (const mal of uf.mal) {
        nrEfnisflokkar.add(mal.nr);
      }
    }
  }
  const filteredMalaskra = arrMalaskra.filter(mal => {
    if (nrEfnisflokkar.has(mal.nr)) {
      count++;
      return true;
    }
    return false;
  });
  console.log(
    `Found ${count} matches out of a total of ${arrMalaskra.length} mal.`,
  );

  return filteredMalaskra;
}

function foldMal() {
  const rows = Array.from(document.querySelectorAll('.mal'));
  if (rows.length === 0) return;

  const groups = new Map();

  rows.forEach(row => {
    const nr = row.dataset.nr;
    const date = row.dataset.date;
    const time = row.dataset.time;

    if (!groups.has(nr)) groups.set(nr, []);
    groups.get(nr).push({ row, date, time });
  });

  groups.forEach(items => {
    if (items.length === 1) return;

    items.sort((a, b) => {
      const dateA = new Date(
        a.date.split('.').reverse().join('-') + `T` + a.time,
      );
      const dateB = new Date(
        b.date.split('.').reverse().join('-') + `T` + b.time,
      );
      return dateB - dateA;
    });

    const newest = items[0].row;
    const older = items.slice(1).map(x => x.row);

    // Mark classes
    newest.classList.add('newest');

    older.forEach(r => {
      r.classList.add('older', 'hidden');
    });

    // Insert fold arrow into newest row (if not already there)
    let arrow = newest.querySelector('.fold-arrow');
    if (!arrow) {
      arrow = document.createElement('div');
      arrow.className = 'fold-arrow';
      newest.firstElementChild.prepend(arrow);
    }

    // Add click event to newest row
    arrow.addEventListener('click', () => {
      older.forEach(r => r.classList.toggle('hidden'));
      arrow.classList.toggle('open');
      assignRows();
    });
  });
}

//CLEAN Probably can make a common function for both this and foldMal since it also sorts stuff
function sortMalaskra(tempMalaskra, order = 'up') {
  const parseDT = (date, time = '00:00:00') =>
    new Date(date.split('.').reverse().join('-') + 'T' + time);

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
      return order === 'up' ? A - B : B - A;
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

    return order === 'up' ? newestA - newestB : newestB - newestA;
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

//TODO Flokka thingmenn eftir kjördæmum
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
    const rowDate = new Date(tr.dataset.date.split('.').reverse().join('-'));

    const isBeforeFrom = fromDate && rowDate < fromDate;
    const isAfterTo = toDate && rowDate > toDate;

    // Hide rows outside the selected range
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
  //CLEAN Maybe use initialize instead of calling each funtion everywhere
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
    // populateList();
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

//NAVIGATION
labelPagetitle.addEventListener(`click`, function () {
  window.location.href = `../index.html`;
});

tabThingmenn.addEventListener(`click`, function () {
  window.location.href = `../index.html`;
});

tabMalaskra.addEventListener(`click`, function () {
  window.location.href = `../search-malaskra/index.html`;
});

//SEARCH MALASKRA
buttonSearchMalaskra.addEventListener(`click`, searchByMal);

inputSearchMalaskra.addEventListener('keypress', function (event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    buttonSearchMalaskra.click();
  }
});

//ADVANCED-SEARCH
buttonAdvancedSearch.addEventListener(`click`, revealAdvancedSearch);

//DATE SEARCHBAR
buttonSearchDate.addEventListener(`click`, searchByDate);

//EFNISFLOKKAR
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

//DAGSETNING
containerDagsetning.addEventListener('click', () => {
  malOrder = malOrder === `up` ? `down` : `up`;
  arrow.classList.toggle('arrow-rotated');
  displayMal(arrMalaskra);
  moreInfoRedirect();
});
