//TODO Breyta malaskra, thingmenn og efnisflokkar í "object oriented programming"

const axios = require(`axios`);
const cheerio = require(`cheerio`);
const fs = require(`fs`);
const thingmenn = [];

//scrape functions
const getDate = function () {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1); //CLEAN Þarf líklega ekki að vera string
  const day = String(now.getDate()); //CLEAN Þarf líklega ekki að vera string

  const formattedDate = `${day}.${month}.${year}`;
  return formattedDate;
};

const dateDiffCurrent = function () {
  const date1 = new Date('2024-11-30'); //Dags. seinustu althingiskosninga 2024
  const date2 = new Date(getDate().split(`.`).reverse().join(`-`));
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

async function scrapeThingmenn() {
  const url = `https://www.althingi.is/altext/xml/thingmenn/?dagur=${getDate()}`;

  const { data } = await axios.get(url);

  const $ = cheerio.load(data, { xml: true });

  //CLEAN think the 'i' is not needed in .each
  $(`þingmaður`).each((i, elem) => {
    const name = $(elem).find(`nafn`).text();
    const id = $(elem).attr(`id`);
    const img = `https://www.althingi.is/myndir/thingmenn-cache/${id}/${id}-220.jpg`;
    thingmenn.push({ name, id, img });
  });
  await scrapeFlokkar();

  try {
    fs.writeFile(
      `./thingmenn.json`,
      JSON.stringify(thingmenn, null, 2),
      `utf8`,
      err => {
        if (err) {
          console.error('Failed to write thingmenn.json', err);
        } else {
          console.log('thingmenn file created');
        }
      }
    );
  } catch (err) {
    console.error('Error saving thingmenn:', err); //CLEAN þarf líklega ekki tvö error skilaboð
  }

  return thingmenn;
}

async function scrapeFlokkar() {
  for (let i = 0; i < thingmenn.length; i++) {
    const url = `https://www.althingi.is/altext/xml/thingmenn/thingmadur/thingseta/?nr=${thingmenn[i].id}`;

    const { data } = await axios.get(url);

    const $ = cheerio.load(data, { xml: true });

    const thingNr = [];
    $('þingseta')
      .find(`þing`)
      .each((i, elem) => {
        const nr = $(elem).text();
        if (!thingNr.includes(nr)) {
          thingNr.push(nr);
        }

        console.log(`retreaving thingNr for Thingseta`);
      });

    thingmenn[i].thingsetaNr = thingNr;

    thingmenn[i].flokkur = $('þingseta').find(`þingflokkur`).last().text();
  }
  return thingmenn;
}

scrapeThingmenn()
  .then(thingmenn => {
    console.log(thingmenn);
  })
  .catch(err => console.log(err));

async function scrapeMalaskra() {
  const url = `https://www.althingi.is/altext/xml/atkvaedagreidslur/?lthing=157`; //FIX Ekki dynamic, sýnir bara fyrir 157. þing sem er núverandi þing
  // const url = `https://www.althingi.is/altext/xml/atkvaedagreidslur/?dagar=${dateDiffCurrent()}`;//FIX bara hægt að nota þetta format fyrir seinasta árið

  const { data } = await axios.get(url);

  const $ = cheerio.load(data, { xml: true });

  const malaskra = [];
  const elems = $(`atkvæðagreiðsla`).toArray();

  for (const elem of elems) {
    if (
      $(elem).find(`samantekt`).find(`aðferð`).text() === `atkvæðagreiðslukerfi`
    ) {
      const capitalizeFirst = str => str.charAt(0).toUpperCase() + str.slice(1);

      const name = capitalizeFirst(
        $(elem).find(`mál`).find(`málsheiti`).text()
      );
      const nr = $(elem).attr(`málsnúmer`);
      const thingskj = $(elem).find(`þingskjal`).attr(`skjalsnúmer`);
      const atkvGrNr = $(elem).attr(`atkvæðagreiðslunúmer`);
      const date = $(elem)
        .find(`tími`)
        .text()
        .substring(0, 10)
        .split(`-`)
        .reverse()
        .join(`.`);
      const time = $(elem).find(`tími`).text().substring(11, 16);

      const afgreiðsla = $(elem).find(`samantekt`).find(`afgreiðsla`).text();
      const ja = Number(
        $(elem).find(`samantekt`).find(`já`).find(`fjöldi`).text()
      );
      const nei = Number(
        $(elem).find(`samantekt`).find(`nei`).find(`fjöldi`).text()
      );
      const greiðirEkki = Number(
        $(elem)
          .find(`samantekt`)
          .find(`greiðirekkiatkvæði`)
          .find(`fjöldi`)
          .text()
      );
      const atkv = {
        afgr: afgreiðsla,
        ja: ja,
        nei: nei,
        greiðirEkki: greiðirEkki,
      };
      //TODO Hægt að fá ítarupplýsingar um hvert mál f. sig á xml síðunni
      malaskra.push({ name, date, time, nr, thingskj, atkvGrNr, atkv });
    }
  }

  try {
    fs.writeFile(
      `./malaskra.json`,
      JSON.stringify(malaskra, null, 2),
      `utf8`,
      err => {
        if (err) {
          console.error('Failed to write malaskra.json', err);
        } else {
          console.log('malaskra file created');
        }
      }
    );
  } catch (err) {
    console.error('Error saving malaskra:', err); //CLEAN þarf líklega ekki tvö error skilaboð
  }

  await getPdf(malaskra);
  await getVotes(malaskra);

  return malaskra;
}

//Fetch votes for specific mal
async function getVotes(malaskra) {
  for (const mal of malaskra) {
    if (!mal.atkvGrNr) {
      console.log('getVotes: missing atkvGrNr for', mal.nr || mal.name);
      continue;
    }
    const url = `https://www.althingi.is/altext/xml/atkvaedagreidslur/atkvaedagreidsla/?numer=${mal.atkvGrNr}`;
    console.log('getVotes fetching');

    const { data } = await axios.get(url);
    const $ = cheerio.load(data, { xml: true });

    mal.atkvListi = [];
    const count = $(`þingmaður`).length;
    console.log(`found ${count} þingmaður for ${mal.nr || mal.name}`);

    $(`þingmaður`).each((i, elem) => {
      const nafn = $(elem).find(`nafn`).text();
      const atkv = $(elem).find(`atkvæði`).text().replaceAll(` `, `-`);

      mal.atkvListi.push({ nafn, atkv }); //this is in a JSON format I think?
    });
  }
  console.log(JSON.stringify(malaskra));

  try {
    fs.writeFile(
      `./malaskra.json`,
      JSON.stringify(malaskra, null, 2),
      `utf8`,
      err => {
        if (err) {
          console.error('Failed to write malaskra.json', err);
        } else {
          console.log('malaskra file created');
        }
      }
    );
  } catch (err) {
    console.error('Error saving malaskra:', err); //CLEAN þarf líklega ekki tvö error skilaboð
  }

  return malaskra;
}

async function getPdf(malaskra) {
  for (const mal of malaskra) {
    if (!mal.thingskj) {
      console.log('getPdf: missing thingskj for', mal.nr || mal.name);
      continue;
    }
    const url = `https://www.althingi.is/altext/xml/thingskjol/thingskjal/?lthing=157&skjalnr=${mal.thingskj}`;
    console.log('getPdf fetching');

    const { data } = await axios.get(url);
    const $ = cheerio.load(data, { xml: true });

    mal.skjalPdf = $(`þingskjal`).find(`slóð`).find(`pdf`).text();
  }
  console.log(JSON.stringify(malaskra));

  try {
    fs.writeFile(
      `./malaskra.json`,
      JSON.stringify(malaskra, null, 2),
      `utf8`,
      err => {
        if (err) {
          console.error('Failed to write malaskra.json', err);
        } else {
          console.log('malaskra file created');
        }
      }
    );
  } catch (err) {
    console.error('Error saving malaskra:', err); //CLEAN þarf líklega ekki tvö error skilaboð
  }

  return malaskra;
}

scrapeMalaskra()
  .then(malaskra => {
    console.log(malaskra);
  })
  .catch(err => console.log(err));

async function scrapeEfnisflokkar() {
  const url = `https://www.althingi.is/altext/xml/efnisflokkar/`;
  console.log('scrapeEfnisflokkar fetching');

  const { data } = await axios.get(url);
  const $ = cheerio.load(data, { xml: true });

  const efnisflokkar = [];

  $(`yfirflokkur`).each((i, elem) => {
    const yfirflokkur = $(elem).find(`heiti`).first().text();
    const undirflokkar = [];

    $(elem)
      .find(`efnisflokkur`)
      .each((i, elem2) => {
        const heiti = $(elem2).find(`heiti`).text();
        const id = Number($(elem2).attr(`id`));
        undirflokkar.push({ heiti, id });
      });

    efnisflokkar.push({ yfirflokkur, undirflokkar });
  });

  async function populateEfnisflokkar() {
    for (const yfirflokkur of efnisflokkar) {
      for (const flokkur of yfirflokkur.undirflokkar) {
        flokkur.mal = [];

        const url = `https://www.althingi.is/altext/xml/efnisflokkar/efnisflokkur/?lthing=157&efnisflokkur=${flokkur.id}`;

        try {
          const { data } = await axios.get(url);
          const $ = cheerio.load(data, { xml: true });

          $(`málalisti`)
            .find(`mál`)
            .each((i, elem) => {
              const heiti = $(elem).find(`málsheiti`).text();
              const nr = $(elem).attr(`málsnúmer`);
              flokkur.mal.push({ heiti, nr });
            });
        } catch (err) {
          console.error('Error loading:', flokkur.id, err);
        }
      }
    }
  }

  await populateEfnisflokkar();

  try {
    fs.writeFile(
      `./efnisflokkar.json`,
      JSON.stringify(efnisflokkar, null, 2),
      `utf8`,
      err => {
        if (err) {
          console.error('Failed to write efnisflokkar.json', err);
        } else {
          console.log('efnisflokkar file created');
        }
      }
    );
  } catch (err) {
    console.error('Error saving efnisflokkar:', err); //CLEAN þarf líklega ekki tvö error skilaboð
  }

  return efnisflokkar;
}

scrapeEfnisflokkar()
  .then(efnisflokkar => {
    console.log(efnisflokkar);
  })
  .catch(err => console.log(err));
