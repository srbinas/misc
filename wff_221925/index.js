const fs = require("fs");
const fetch = require('node-fetch');

const API_CALL_TIMEOUT = 250; // Um evtl. IP-Sperre zu verhindern, wenn man 100te Adressen verwendet, gerne auf 1 stellen

function getBlockCypherDataJson(btcAdress) {
    return fetch(`https://api.blockcypher.com/v1/btc/main/addrs/${btcAdress}?limit=1`).then(res => res.json());
}

function prepareResultAndWriteFile(fileName, result = []) {
    const filteredHeadlines = {
        "@date": "Datum",
        address: "BTC-Adresse",
        balance: "balance",
        final_n_tx: "AnzahlTX",
        total_received: "totalreceived"
    }
    const date = new Date().toLocaleDateString("de");
    //
    const fileContent = [];
    fileContent.push(Object.values(filteredHeadlines).join(";")); // Überschrift
    const accessVariables = Object.keys(filteredHeadlines).filter((key) => !key.startsWith("@"));
    result.forEach((aResult) => {
        const row = [];
        row.push(date);
        accessVariables.forEach((aAccessVariable) => {
            row.push(aResult[aAccessVariable])
        });
        fileContent.push(row.join(";"));
    });
    //
    fs.writeFile(fileName, fileContent.join("\n"), (err) => {
        if (err) throw err;
        console.log("Erfolgreich gespeichert!");
    });
}

fs.readFile("BTCAdressen.txt", "utf8", (err, data) => {
    if (err) {
        console.log("BTCAdressen nicht gefunden!");
        return;
    }

    const btcAdresses = data.split("\n");
    const maxLen = btcAdresses.length;
    const result = [];

    btcAdresses.forEach((btcAdress) => {
        getBlockCypherDataJson(btcAdress).then((btcResult) => {
             result.push(btcResult);
             console.log(`Adresse: ${btcAdress} verarbeitet!`);
             if (result.length === maxLen) {
                 console.log("Alle Werte abgeholt, speichere in Ausgabe.txt...");
                 prepareResultAndWriteFile("Ausgabe.txt", result);
             }
         })
    });
});
