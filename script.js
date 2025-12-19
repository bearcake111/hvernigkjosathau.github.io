'use strict';
//CLEAN Allt á ensku
//TODO Skoða "routing" til að búa til flipa
//TODO Skoða GITHUB og github pages
//Material UI eða MUI til að auðvelda UI vinnu
//TODO Bæta inn gervigreind til að gera útdrátt úr málum

// Elements
const sectionNameSelected = document.getElementById(`thingmadur-valinn`);
const labelName = document.querySelector('.nafn');
const labelMal = document.querySelector('.mal-heading');
const searchbar = document.getElementById('searchbar');
const inputNafn = document.getElementById('input-nafn');
const imgProfile = document.querySelector(`.profile_picture`);
const thingmennDropdown = document.getElementById('thingmenn-dropdown');

const inputDateFirst = document.getElementById(`input-date-first`);
const inputDateSecond = document.getElementById(`input-date-second`);
const divButtonDate = document.querySelector(`.date-button`);
const buttonSearchDate = document.getElementById(`search-date-button`);
const errorNoDate = document.getElementById(`error-no-date`);
const errorWrongOrder = document.getElementById(`error-wrong-order`);

const inputSearchMalaskra = document.getElementById(`search-malaskra-input`);
const buttonSearchMalaskra = document.getElementById(`search-malaskra-button`);

const containerEfnisflokkar = document.getElementById('efnisflokkar');

const arrow = document.getElementById('filter-arrow');

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
let currEfnisflokkur;
let malOrder = `up`;
let testThingmadur;

// Functions
function displayName(name) {
  labelName.textContent = `${name}`;
  return name;
}

function displayImg(thingmadur) {
  const flokkurFormated = thingmadur.flokkur.replaceAll(` `, `-`);
  imgProfile.src = thingmadur.img;
  imgProfile.style.border = `2px solid var(--${flokkurFormated})`;
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
      labelName.classList.toggle(`hidden`);
      thingmennDropdown.style.display = 'none';
      sectionNameSelected.classList.remove(`hidden`);
      displayName(name);
      displayImg(thingmadur);
      displayMal(arrMalaskra);
    });
    thingmennDropdown.appendChild(div);
  });
}

//Shows filtered options as user types //CLEAN Mögulega betra upp á performance að hafa hann bara í gangi á meðan verið er að skrifa í boxið //CLEAN Ætti kannski að færa þetta niður í event listeners
inputNafn.addEventListener(`input`, () => {
  const filter = inputNafn.value.toLowerCase();
  thingmennDropdown.style.display = `block`;

  Array.from(thingmennDropdown.children).forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.startsWith(filter) ? 'block' : 'none';
  });
});
//TODO Láta flokkinn highlitast þegar hann er valinn
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
  const sortedMalaskra = sortMalaskra(tempMalaskra, malOrder);

  sortedMalaskra.forEach(function (mal, i) {
    // const row = i % 2 === 0 ? `even` : `odd`;
    const name = mal.name;
    const date = mal.date;
    const time = mal.time;
    const nr = mal.nr;
    const skjalPdf = mal.skjalPdf; //TODO Bæta við grunnskjali þegar á við s.s. fjárlögum

    const html = `
      <tr class="mal" data-nr="${nr}" data-date="${date}"data-time="${time}">
        <th class="mal-date">${date}</th>
        <th class="mal-heading">${name}</th>
        <th class="mal-heading"><a href="${skjalPdf}" target="_blank">Nánar</a></th>
        <td><div class="vote já hidden"></div></td>
        <td><div class="vote nei hidden"></div></td>
        <td><div class="vote greiðir-ekki-atkvæði hidden"></div></td>
        <td><div class="vote boðaði-fjarvist hidden"></div></td>
        <td><div class="vote fjarverandi hidden"></div></td>
      </tr>
    `;
    containerMal.insertAdjacentHTML(`afterbegin`, html);
    //Add votes
    const foundVote = mal.atkvListi.find(
      item => item.nafn === labelName.textContent
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
    `Found ${count} matches out of a total of ${arrMalaskra.length} mal.`
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
        a.date.split('.').reverse().join('-') + `T` + a.time
      );
      const dateB = new Date(
        b.date.split('.').reverse().join('-') + `T` + b.time
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
      arrow.textContent = '›';
      // prepend arrow cell or append to first cell depending on your layout
      newest.firstElementChild.prepend(arrow);
    }

    // Add click event to newest row
    newest.addEventListener('click', () => {
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
      groupA[groupA.length - 1].time
    );
    const newestB = parseDT(
      groupB[groupB.length - 1].date,
      groupB[groupB.length - 1].time
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
//TODO Fold searchbydate, search by mal, search by malnr under "ítarleg leit"
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

  if (input === '') {
    displayMal(arrMalaskra);
    return;
  }

  const filteredMalaskra = arrMalaskra.filter(mal =>
    normalizeString(mal.name).startsWith(input)
  );

  displayMal(filteredMalaskra);
  return filteredMalaskra;
}

function normalizeString(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

//////////LOADING DATA//////////

async function loadMalaskra() {
  try {
    const res = await fetch('/api/malaskra');
    const data = await res.json();
    arrMalaskra = data;
  } catch (err) {
    console.error(err);
  }
}

async function loadThingmenn() {
  try {
    const res = await fetch('/api/thingmenn');
    const data = await res.json();
    arrThingmenn = data;
    testThingmadur = arrThingmenn[0];
    populateList();
    displayName(testThingmadur.name);
    displayImg(testThingmadur);
  } catch (err) {
    console.error(err);
  }
}

async function loadEfnisflokkar() {
  try {
    const res = await fetch('/api/efnisflokkar');
    const data = await res.json();
    arrEfnisflokkar = data;
    testThingmadur = arrEfnisflokkar[0].name;
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
}

initialize();

//////////EVENT LISTENERS//////////

//SEARCHBAR
//FIX move hover to CSS
labelName.addEventListener(`mouseenter`, function () {
  //Change color of label
  labelName.style.backgroundColor = `#DDDDDD`;
  //Change cursor to hand
  labelName.style.cursor = `pointer`;
});
labelName.addEventListener(`mouseleave`, function () {
  //Change color of label
  labelName.style.backgroundColor = ``;
});
labelName.addEventListener(`click`, function () {
  //Hide name
  labelName.classList.toggle(`hidden`);
  //Show searchbar
  searchbar.classList.toggle(`hidden`);
});
searchbar.addEventListener(`click`, function () {
  //Show names
  thingmennDropdown.style.display = `block`;
});

//DATE SEARCHBAR
buttonSearchDate.addEventListener(`click`, searchByDate);

//SEARCH MALASKRA
buttonSearchMalaskra.addEventListener(`click`, searchByMal);

//EFNISFLOKKAR
containerEfnisflokkar.addEventListener('click', event => {
  const div = event.target.closest('.yfirflokkur-div');

  if (div) {
    const p = div.querySelector('.yfirflokkur-txt');
    const yfirflokkur = p ? p.textContent : '';
    currEfnisflokkur = yfirflokkur;
    displayMal(arrMalaskra);
  }
});

//DAGSETNING
arrow.addEventListener('click', () => {
  malOrder = malOrder === `up` ? `down` : `up`;
  arrow.classList.toggle('arrow-rotated');
  displayMal(arrMalaskra);
});
