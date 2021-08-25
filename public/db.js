let db;

const request = indexedDB.open("budget", 1);

//create a store called pending
request.onupgradeneeded = function (evt) {
  const db = evt.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (e) {
  db = e.target.result;

  if (navigator.onLine) {
    checkDB();
  }
};

function checkDB() {
  const transaction = db.transaction(["pending"], "readwrite");

  const store = transaction.objectStore("pending");

  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length !== 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(getAll.result),
      })
        .then((res) => res.json())
        .then((data) => {
          const transaction = db.transaction(["pending"], "readwrite");

          const store = transaction.objectStore("pending");

          store.clear();

          if(data.length !== 0){
            window.location.reload();
          }
        });
    }
  };
}

window.addEventListener("online", checkDB);

function saveRecord(data) {
  const transaction = db.transaction(["pending"], "readwrite");

  const store = transaction.objectStore("pending");

  store.add(data);
}
