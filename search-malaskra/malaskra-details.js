'use strict';

//ELEMENTS//
const labelPagetitle = document.querySelector(`.page-title`);
const tabThingmenn = document.getElementById(`tab-thingmenn`);
const tabMalaskra = document.getElementById(`tab-malaskra`);

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

const labelMal = document.getElementById(`mal-label`);
const labelMalDate = document.getElementById(`mal-date`);
const labelMalStatus = document.getElementById(`mal-status`);
const linkMalDocuments = document.getElementById(`mal-documents`);

const labelDate = document.querySelector(`.category-date`);
const labelName = document.querySelector(`.category-name`);
const labelResult = document.querySelector(`.category-result`);

const buttonThingmenn = document.getElementById(`thingmenn-button`);
const containerMal = document.querySelector(`.mal-container`);

//LOOSE VARIABLES//
let arrThingmenn;
let arrMalaskra;
let arrEfnisflokkar;
let currAtkvGrNr;
let currMal;
let currEfnisflokkur = `Öll mál`;
let dateSorting = true;
let nameSorting = false;
let resultSorting = true;

//FUNCTIONS//

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

  //Add eventListeners for hovering
  document.querySelectorAll(`.yfirflokkur-div`).forEach(div => {
    div.addEventListener(`mouseenter`, function () {
      //Change color of label
      this.style.backgroundColor = `#DDDDDD`;
    });
    div.addEventListener(`mouseleave`, function () {
      //Change color of label
      this.style.backgroundColor = ``;
    });
  });
}

function displayMal(malaskra) {
  clearDateSearch();
  containerMal.innerHTML = ``;

  const tempMalaskra = filterMalaskra(malaskra);

  let row = `even`;

  tempMalaskra.forEach(mal => {
    const link = `../mal-details/index.html?atkvGrNr=${encodeURIComponent(
      mal.atkvGrNr,
    )}`;
    const html = `<tr class="mal ${row}" data-nr="${mal.nr}" data-atkvgrnr="${mal.atkvGrNr}" data-date="${mal.date}"data-time="${mal.time}">    
                <th class="mal-date">${mal.date}</th>
                <th class="name"><a href="${link}">${mal.name}</a></th>
                <th class="more"><a href="${link}">Nánar</a></th>                
                <td class="vote">${mal.atkv.ja}</td>
                <td class="vote">${mal.atkv.nei}</td>
                <td class="vote">${mal.atkv.greiðirEkki}</td>
                <td class="result">${mal.atkv.afgr}</td>
              </tr>`;
    containerMal.insertAdjacentHTML(`afterbegin`, html);
  });
  foldMal();
  assignRows();
}

function foldMal() {
  const rows = Array.from(containerMal.querySelectorAll('.mal'));
  if (rows.length === 0) return;

  const groups = new Map();

  rows.forEach(row => {
    const nr = row.dataset.nr;
    if (!groups.has(nr)) groups.set(nr, []);
    groups.get(nr).push(row);
  });

  const fragment = document.createDocumentFragment();

  groups.forEach(groupRows => {
    groupRows.sort((a, b) => {
      const dA = new Date(
        a.dataset.date.split('.').reverse().join('-') + 'T' + a.dataset.time,
      );
      const dB = new Date(
        b.dataset.date.split('.').reverse().join('-') + 'T' + b.dataset.time,
      );
      return dB - dA;
    });

    const [newest, ...older] = groupRows;

    newest.classList.add('newest');

    older.forEach(r => {
      r.classList.add('older', 'hidden');
    });

    // arrow
    let arrow = newest.querySelector('.fold-arrow');
    if (!arrow) {
      arrow = document.createElement('div');
      arrow.className = 'fold-arrow';
      newest.firstElementChild.prepend(arrow);
    }

    arrow.onclick = () => {
      older.forEach(r => r.classList.toggle('hidden'));
      arrow.classList.toggle('open');
      assignRows();
    };

    fragment.appendChild(newest);
    older.forEach(r => fragment.appendChild(r));
  });

  containerMal.appendChild(fragment);
}

//Assign rows
function assignRows() {
  console.log(`assigning rows`);
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

function clearDateSearch() {
  inputDateFirst.value = ``;
  inputDateSecond.value = ``;
}

function formatDate(date) {
  const newDate = new Date(date.split('.').reverse().join('-')).getTime();
  return newDate;
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

function searchByMal() {
  const input = normalizeString(inputSearchMalaskra.value);
  if (input === '') {
    displayMal(arrMalaskra);
    return;
  }

  const filteredMalaskra = arrMalaskra.filter(mal =>
    normalizeString(mal.name).includes(input),
  );

  displayMal(filteredMalaskra);
  inputSearchMalaskra.value = ``;
  return filteredMalaskra;
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

function normalizeString(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ð/g, 'd')
    .replace(/þ/g, 'th')
    .replace(/æ/g, 'ae');
}

function sortByName(desc = false) {
  const rows = Array.from(containerMal.querySelectorAll('tr'));
  rows.sort((a, b) => {
    const pa = a.querySelector('.name')?.textContent.trim() ?? '';
    const pb = b.querySelector('.name')?.textContent.trim() ?? '';

    return (
      pa.localeCompare(pb, 'is', { sensitivity: 'base' }) * (desc ? -1 : 1)
    );
  });

  rows.forEach(row => containerMal.appendChild(row));
}

function sortByResult(desc = false) {
  const rows = Array.from(containerMal.querySelectorAll('tr'));
  rows.sort((a, b) => {
    const pa = a.querySelector('.result').textContent.trim();
    const pb = b.querySelector('.result').textContent.trim();

    return (
      pa.localeCompare(pb, 'is', { sensitivity: 'base' }) * (desc ? -1 : 1)
    );
  });

  rows.forEach(row => containerMal.appendChild(row));

  assignRows();
}

function sortByDate(desc = false) {
  const rows = Array.from(containerMal.querySelectorAll('tr'));
  if (rows.length === 0) return;

  const groups = new Map();
  rows.forEach(row => {
    const nr = row.dataset.nr;
    if (!groups.has(nr)) groups.set(nr, []);
    groups.get(nr).push(row);
  });

  const sortedGroups = Array.from(groups.values()).sort((groupA, groupB) => {
    const newestA = groupA[0];
    const newestB = groupB[0];
    const dateA = formatDate(newestA.dataset.date);
    const dateB = formatDate(newestB.dataset.date);
    return (dateA - dateB) * (desc ? -1 : 1);
  });

  const fragment = document.createDocumentFragment();
  sortedGroups.forEach(group => {
    group.forEach(row => fragment.appendChild(row));
  });
  containerMal.appendChild(fragment);

  assignRows();
}

function flipArrow(e) {
  const arrow = e.currentTarget.querySelector(`.filter-arrow`);

  if (!arrow.classList.contains(`arrow-rotated`)) {
    const allArrows = document.querySelectorAll(`.filter-arrow`);
    allArrows.forEach(ar => {
      ar.classList.remove(`arrow-rotated`);
    });
  }

  arrow.classList.toggle('arrow-rotated');
}

//LOADING DATA//

async function loadMalaskra() {
  try {
    const res = await fetch('../malaskra.json');
    const data = await res.json();
    arrMalaskra = data;
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
  await loadMalaskra();
  await loadEfnisflokkar();
  addCategories();
  displayMal(arrMalaskra);
}

initialize();

//EVENT LISTENERS//

//NAVBAR//
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
  }
});

//SORT BY DATE//
labelDate.addEventListener(`click`, function (e) {
  dateSorting = !dateSorting;
  resultSorting = true;
  nameSorting = true;
  flipArrow(e);
  sortByDate(dateSorting);
  assignRows();
});

//SORT BY NAME//
labelName.addEventListener(`click`, function (e) {
  nameSorting = !nameSorting;
  resultSorting = true;
  dateSorting = true;
  flipArrow(e);
  sortByName(nameSorting);
  assignRows();
});

//SORT BY RESULT//
labelResult.addEventListener(`click`, function (e) {
  resultSorting = !resultSorting;
  nameSorting = true;
  dateSorting = true;
  flipArrow(e);
  sortByResult(resultSorting);
  assignRows();
});
