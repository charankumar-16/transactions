const express = require("express");
const app = express();

const fs = require("fs");
const csv = require("csv-parser");

let transactions = [];
let products = [];

//parsing the transactions into JavaScript Object
fs.createReadStream("transactions.csv", {
  encoding: "utf-8",
})
  .pipe(csv())
  .on("data", (data) => transactions.push(data))
  .on("end", () => {
    console.log("transactionsList in transactions");
  });

//Parsing the referenceData into javascript object
fs.createReadStream("referenceData.csv", {
  encoding: "utf-8",
})
  .pipe(csv())
  .on("data", (data) => products.push(data))
  .on("end", () => {
    console.log("referenceDataList in products");
  });

setInterval(() => {
  fs.createReadStream("transactions.csv", {
    encoding: "utf-8",
  })
    .pipe(csv())
    .on("data", (data) => transactions.push(data))
    .on("end", () => {
      console.log("Successfully Updated Transactions");
    });
}, 1000);

//API GET call
app.get("/assignment/transaction/:transactionId/", (request, response) => {
  const { transactionId } = request.params;
  const requiredTransaction = transactions.find(
    (eachTransaction) => eachTransaction.transactionId == transactionId
  );
  if (requiredTransaction !== undefined) {
    const requiredProduct = products.find(
      (eachProduct) => eachProduct.productId == requiredTransaction.productId
    );
    if (requiredProduct !== undefined) {
      let output = {
        transactionId: parseInt(requiredTransaction.transactionId),
        productName: requiredProduct.productName,
        transactionAmount: parseFloat(requiredTransaction.transactionAmount),
        transactionDatetime: requiredTransaction.transactionDatetime,
      };
      response.send(JSON.stringify(output));
    } else {
      response.send(
        `Product with ID ${requiredTransaction.productId} not found`
      );
    }
  } else {
    response.status(400);
    response.send(`Transaction with ID ${transactionId} not found`);
  }
});

app.listen(8080, () => {
  console.log("Server Running at http://localhost:8080/");
});
