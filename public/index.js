const persone = document.getElementById("persone");
const nome = document.getElementById("nome");
const confermaNome = document.getElementById("confermaNome");
const modalNominativo = document.getElementById("nominativo");
const modalDomande = document.getElementById("domande");
const domandeDiv = document.getElementById("Domande");
let domande = [];
let domandaTemplate = `
  <p class="mt-3"> -> <span class="fw-bold">%DOMANDA</span></p>
  <form class="m-3" method="" action="">
  <div class="form-check">
    <input name="gruppo" class="%CERCA" type="radio" id="radio1" value="%VALUE1">
    <label for="radio1">%RADIO1</label>
  </div>
  <div class="form-check">
    <input name="gruppo" class="%CERCA" type="radio" value="%VALUE2"  id="radio2" >
    <label for="radio2">%RADIO2</label>
  </div>
    <div class="form-check">
    <input name="gruppo" class="%CERCA" type="radio" value="%VALUE3"  id="radio3" >
    <label for="radio3">%RADIO3</label>
  </div>
    <div class="form-check">
    <input name="gruppo" class="%CERCA" type="radio" value="%VALUE4"  id="radio4" >
    <label for="radio4">%RADIO4</label>
  </div>
  </form>
`;
let partita = {};

/**
 * Funzione per la gestione del salvataggio lato server dei dati
 */
const gestisciSalvataggio = () => {
  partita = {};
  partita["username"] = nome.value;
  nome.value = "";
  const inputs = document.querySelectorAll(".input");
  //gestione risposte
  const risposteDate = [];
  let conta = 0;
  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].checked) {
      const json = {};
      json["id"] = domande[conta].id;
      console.log("id domanda: "+domande[conta].id);
      json["value"] = inputs[i].id.replace("radio", "");
      //json[domande[conta].id] = inputs[i].id.replace("radio","")
      risposteDate.push(json);
      conta++;
    }
  }
  partita["answers"] = risposteDate;
  salvaRisultato(partita).then(() => {
    window.location.reload();
    console.log("salvato e aggiornato");
  });
};

/**
 * Funzione per recuperare da server tutte le persone che hanno fatto il quiz
 * @returns promise
 */
const recuperaPersone = () => {
  return new Promise((resolve, reject) => {
    fetch("/ratings")
      .then((response) => response.json())
      .then((response) => resolve(response.result))
      .catch((exception) => reject(exception));
  });
};

/**
 * Funzione per recuperare da server le domande da fare all'utente
 * @returns promise
 */
const recuperaDomande = () => {
  return new Promise((resolve, reject) => {
    fetch("/questions")
      .then((response) => response.json())
      .then((response) => resolve(response.result))
      .catch((exception) => reject(exception));
  });
};

/**
 * Funzione per salvare lato server le risposte date dall'utente
 * @param {*} json
 * @returns promise
 */
const salvaRisultato = (json) => {
  return new Promise((resolve, reject) => {
    fetch("/answers", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        risultato: json,
      }),
    })
      .then((response) => response.json())
      .then((response) => resolve(response));
  });
};
/**
 * Funzione di visualizzazione della wall of fame
 */
const renderWall = () => {
  recuperaPersone().then((response) => {
    if (response) {
      //ordinamento decrescente per rating
      response = response.sort((a, b) => b.rating - a.rating);
      persone.innerHTML = "";
      response.forEach((persona) => {
        const data = new Date(persona.timestamp);
        persone.innerHTML +=
          "<tr><td>" +
          persona.nome +
          "</td><td>" +
          (data.getDay() +
            "." +
            (data.getMonth() + 1) +
            "." +
            data.getFullYear()) +
          "</td><td>" +
          persona.punteggio +
          "</td></tr>";
      });
    }
  });
};

//  ------>   main

renderWall();
/**
 * Gestione input nome
 */
nome.addEventListener("input", (event) => {
  if (event.target.value.length > 0) {
    confermaNome.classList.remove("disabled");
  } else {
    confermaNome.classList.add("disabled");
  }
});

/**
 * Funzione per la gestione della visualizzazione delle domande temporizzando la visuale
 */
const gestisciTempoEVisualizzazione = (time) => {
  setTimeout(() => {
    gestisciSalvataggio();
  }, time);
};

/**
 * Funzione per la gestione della visualizzazione in finestra della pagina
 */
const visualizzaDomande = () => {
  recuperaDomande().then((response) => {
    gestisciTempoEVisualizzazione(response.timer);
    domande = response.questions;
    console.log(domande[0].question);
    let html = "";
    for (let i = 0; i < domande.length; i++) {
      let riga = domandaTemplate;
      riga = riga.replace("%DOMANDA", domande[i].question);
    for (let j = 0; j < domande[i].answers.length; j++) {
        riga = riga
          .replace("%RADIO" + (j + 1), domande[i].answers[j])
          .replace("%RADIO" + (j + 1), j)
          .replace("%CERCA", "input");
      }
      html += riga;
    }
    domandeDiv.innerHTML =
      html +
      '<div class="row justify-content-end><div class="col-auto"><input type="button" id="confermaRisposte" class="btn btn-success mt-3" value="Conferma"/></div></div>';
    document.getElementById("confermaRisposte").onclick = () => {
      gestisciSalvataggio();
    };
  });
};

/**
 * Funzione per la gestione dell'input dell'utente
 */
confermaNome.onclick = () => {
  if (nome.value) {
    visualizzaDomande();
  }
};
