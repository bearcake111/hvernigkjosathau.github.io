'use strict';

//ELEMENTS//
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
const containerMal = document.querySelector(`.mal-container`);

const labelDate = document.querySelector(`.category-date`);
const labelName = document.querySelector(`.category-name`);
const labelResult = document.querySelector(`.category-result`);

//LOOSE VARIABLES//
let arrMalaskra;
let arrEfnisflokkar;
let currEfnisflokkur = `Öll mál`;
let dateSorting = false;
let nameSorting = true;
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
  const sortedMalaskra = sortByDate(tempMalaskra, dateSorting);

  let row = `even`;

  sortedMalaskra.forEach(mal => {
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
    if (malNr.length === 1) {
      return;
    }

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

function clearDateSearch() {
  inputDateFirst.value = ``;
  inputDateSecond.value = ``;
}

function parseDT(date, time = '00:00:00') {
  return new Date(
    date.split('.').reverse().join('-') + (time ? 'T' + time : ``),
  );
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

function sortByDate(tempMalaskra, desc = false) {
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

//TODO copy fixed arrow logic into other pages
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
  }
});

//SORT BY DATE//
labelDate.addEventListener(`click`, function (e) {
  dateSorting = !dateSorting;
  resultSorting = true;
  nameSorting = true;
  flipArrow(e, dateSorting);
  displayMal(arrMalaskra);
  assignRows();
});

//SORT BY NAME//
labelName.addEventListener(`click`, function (e) {
  nameSorting = !nameSorting;
  resultSorting = true;
  dateSorting = true;
  flipArrow(e, nameSorting);
  sortByName(nameSorting);
  assignRows();
});

//SORT BY RESULT//
labelResult.addEventListener(`click`, function (e) {
  resultSorting = !resultSorting;
  nameSorting = true;
  dateSorting = true;
  flipArrow(e, resultSorting);
  sortByResult(resultSorting);
  assignRows();
});
