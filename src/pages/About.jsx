import "./About.css";

export function About() {
  return (
    <main className="app">
      <div className="text-container">
        <h1>Um verkefnið</h1>
        <p>
          Á þessum vef má finna upplýsingar um hvernig þingmenn Alþingis kjósa
          um þau mörgu mál sem fara í gegnum þingið. Einnig er að finna
          ítarupplýsingar og fylgiskjöl um hvert mál fyrir sig.
        </p>
        <p>
          Athugið að vefurinn sýnir aðeins mál þar sem atkvæði hvers og eins
          þingmanns eru skráð. Þau mál sem ekki varða kosningar eða mál sem
          kosið er um án þess að atkvæðalisti sé gefinn upp, eru ekki sýnd á
          þessum vef. Dæmi um slík mál eru óundirbúnar fyrirspurnir og kosningar
          um hvort mál skuli ganga til næstu umræðu eða í nefnd.
        </p>
        <p>
          Markmið vefsinns er að auðvelda aðgengi almennings að upplýsingum um
          kosningar Alþingis og þau mál sem þar eru tekin fyrir. Lagt er upp úr
          því að gögnin séu sett fram eins skýrt og hlutlaust og kostur er.
        </p>
        <h2>Hvaðan koma gögnin</h2>
        <p>Öll gögn eru opinber og eru sótt á vef Alþingis.</p>
        <h2>Aðrar sjálfstæðar síður með gögnum frá athingi.is</h2>
        <p>
          <a href="thingmenn.is" target="_blank">
            thingmenn.is
          </a>
        </p>
        <p>
          <a href="thingvaktin.is" target="_blank">
            thingvaktin.is
          </a>
        </p>
      </div>
      <div className="text-container">
        <p>
          Verkefnið er hugarsmíði Bjarka Rafns Andréssonar. Athugasemdir og
          ábendingar sendist á <a>hvernigkjosathau@gmail.com</a>.
        </p>
      </div>
    </main>
  );
}
