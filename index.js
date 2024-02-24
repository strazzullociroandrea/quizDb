const express = require("express");
const http = require("http");
const path = require("path");
const bodyParser = require("body-parser");
const mysql = require("mysql");
//non importava il file ./conf.json
const conf = require('./conf.js');
const app = express();
const connection = mysql.createConnection(conf);

/**
 * Funzione per eseguire la query
 * @param {string} sql
 * @returns {Promise<any>}
 */
const executeQuery = (sql) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, function (err, result) {
      if (err) {
        console.error(err);
        reject(err);
      }
      //console.log('Query eseguita con successo');
      resolve(result);
    });
  });
};
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use("/", express.static(path.join(__dirname, "public")));

/**
 * Funzione per recuperare l'elenco delle persone che hanno fatto il quiz con il relativo punteggio
 */
app.get("/ratings", (req, res) => {
  executeQuery(
    "SELECT nomeGiocatore as nome, timestamp, punteggio FROM partita ORDER BY punteggio DESC",
  ).then((response) =>
    res.json({
      result: response,
    }),
  );
});

const recuperaRisposte = (response) => {
  return new Promise((resolve, reject) => {
    const risposte = "SELECT * FROM risposta WHERE idDomanda=" + response.id;
    executeQuery(risposte).then((respo) => {
      resolve(respo);
    });
  });
};
/**
 * Funzione per restituire al client le domande generate in modo casuale
 */
app.get("/questions", (req, resp) => {
  executeQuery(
    "SELECT * FROM argomento INNER JOIN domanda ON argomento.titolo=domanda.argomento  WHERE titolo='informatica' ORDER BY RAND()",
  ).then((response) => {
    const promise = [];
    const jsonFinal = {
      timer: response[0].tempoRisposta,
      title: response[0].titolo,
    };
    response.forEach((element) => {
      const promiseTemp = recuperaRisposte(element).then((response) => {
        const array = [];
        response.forEach((risposta) => {
          array.push(risposta.valore);
        });
        return {
          question: element.question,
          id: element.id,
          answers: array,
        };
      });
      promise.push(promiseTemp);
    });
    Promise.all(promise).then((response) => {
      jsonFinal["questions"] = response;
      resp.json({ result: jsonFinal });
    });
  });
});

/**
 * Funzione per recuperare le risposte dell'utente e verificare il punteggio
 * @param {*} answers
 * @returns
 */
const recuperaPunteggio = (answers) => {
  return new Promise((resolve, reject) => {
    let result = 0;
    const promise = []; //array di promise
    answers.forEach((element) => {
      const queryRisultati =
        "SELECT punteggio FROM risposta where idDomanda=" + element.id;
      const promiseTemp = executeQuery(queryRisultati).then((response) => {
        result += response[element.value - 1].punteggio;
      });
      promise.push(promiseTemp);
    });
    Promise.all(promise).then(() => resolve(result));
  });
};
/**
 * Metodo per recuperare le risposte dell'utente
 */
app.post("/answers", (req, resp) => {
  const data = req.body.risultato;
  const { username, answers } = data;
  recuperaPunteggio(answers).then((response) => {
    const sqlAdd =
      "INSERT INTO partita(argomento,punteggio,nomeGiocatore) VALUES('informatica'," +
      response +
      ",'" +
      username +
      "')";
    executeQuery(sqlAdd).then((response) => {
      resp.json({ result: "OK" });
    });
  });
});

/**
 * Creazione del server
 */
const server = http.createServer(app);
server.listen(80, () => {
  console.log("-> Server in esecuzione sulla porta 80");
});
