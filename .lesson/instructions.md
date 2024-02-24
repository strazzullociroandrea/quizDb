# Instructions  

## Quiz con database
Riprendere la soluzione dell'esercizio Quiz ma utilizzando i database.
Consegnare oltre al codice funzionante anche:

- lo schema ER usato;
- le query SQL per creare le tabelle (si ricorda che occorre memorizzare domande, risposte e punteggi)
- le query per inserire almeno un quiz con 10 domande.

Qui sotto le istruzioni del vecchio esercizio
---
## INTRODUZIONE
In questo esercizio applicheremo quanto appreso sui web services per realizzare una applicazione per fare quiz.

In questa applicazione all'utente sono proposte diverse domande a risposta multipla dove l'utente ne può selezionare solo una. Ad ogni risposta corrisponde un determinato punteggio. 

Al termine del sondaggio l'utente invia  le proprie risposte (insieme al proprio nome) e riceve immediatamente la somma dei punti raccolti, che verrà mostrato, insieme agli altri punteggi, nella pagina principale.

Vediamo in dettaglio l'implementazione richiesta.

## LATO CLIENT
Lato client è presente una schermata principale contenente l'elenco degli utenti che hanno risposto al quiz col loro punteggio. Questa classifica è richiesta dal client al server mediante il servizio **/ratings**.
E' presente un pulsante che permette di fare un nuovo quiz. Alla sua pressione si apre una modale che chiede il nome utente, e dopo l'inserimento di questo chiude la modale di richiesta del nome e ne apre una nuova che mostra tutte le domande con le relative caselle di selezione a risposta multipla. La modale ha un titolo col nome del questionario. Le domande sono scaricate dal server mediante il servizio **/questions**.
E' possibile rispondere con una sola risposta. 
Le domande vanno presentate in modo casuale.
E' presente un timer che fa chiudere la modale (ed inviare le risposte fatte finora) alla scadenza del tempo.

Alla pressione del pulsante invio, la modale si chiude, ed il client invia le risposte con il servizio **/answers**.

## LATO SERVER
Lato server verranno messi a disposizione i seguenti servizi:

### /questions (GET)

Il server invia un JSON contenente tutte le domande da porre all'utente. (si veda sotto la struttura del JSON).

### /answers (POST)

Viene inviato dal client un JSON con le risposte dell'utente insieme al suo nome (si veda sotto la struttura del JSON). La risposta sarà {result: ok}.

Ogni volta che il server riceve un set di risposte calcolerà il punteggio dell'utente e aggiornerà la classifica.

### /ratings (GET)

Viene inviato dal server un JSON con la classifica contenente utenti e risposte. Si veda sotto la struttura del JSON.


## STRUTTURE DEI JSON e ALGORITMO DI CALCOLO

### Servizio 1: /questions

`
{
  title: "Domande facili",
  timer: 180,
  questions: [
    {
      "id": 1,
      "question": "Di che colore è il cavallo bianco di Napoleone?",
      "answers": ["Blu", "Verde", "Bianco", "Marrone"]          
    },
    {
      "id": 2,
      "question": "Da dove sorge il sole?",
      "answers": ["Nord", "Sud", "Ovest", "Est"]          
    }
  ]
}

Questo è il JSON che va inviato al client.
Si ricorda però che per ogni domanda occorre memorizzare il punteggio di ogni risposta, quindi è necessaria una lista coi punteggi per ogni risposta, che avrà il seguente array **punteggi** (questo array è quindi gestito lato server):

`
[
  {
  "id": 1,
  "points": [0, 0, 10, 0]
  },
  {
  "id": 2,
  "points": [0, 0, 0, 10]
  }
]
`

Gli indici dei punteggi ovviamente corrisponderanno alle domande inviate.
Questo secondo JSON NON va inviato ma utilizzato lato server per calcolare la classifica.

### Servizio: /answers

`
{
  "username": "Mario",
  "timestamp": 292827662,
  "answers": 
  [{
    id: 1,
    value: 2
  },
  {
    id: 2,
    value: 3
  }
}
`

Si ricorda che "value" indica l'indice nell'array delle risposte. 
Il server quindi calcolerà il punteggio prendendo i punti dalla variabile **punteggi** e sommandoli.
Genererà infine un dizionario con questa struttura:

`
{
  "username": "Mario",
  "timestamp": 292827662,
  "rating": 20
}
`

E aggiornerà la classifica di conseguenza ottenendo una struttura come questa.

`
[
  {
    "username": "Mario",
    "timestamp": 292827662,
    "rating": 20
  },
  {
    "username": "Sandra",
    "timestamp": 292822727,
    "rating": 10
  },
  {
    "username": "Luigi",
    "timestamp": 292822117,
    "rating": 0
  }
]
`
Si ricorda che la classifica va ordinata LATO CLIENT e non lato server.
E che non va mostrato il timestamp, ma la data ora corretta.

### NOTE

Sviluppare la grafica usando Bootstrap.


