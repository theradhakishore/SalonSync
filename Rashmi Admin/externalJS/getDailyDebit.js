import { app } from "./firebase.js";

import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  collection,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const db = getFirestore();

let totalDailyDebit = document.getElementById("totalDebit");
let totalEmployeeDebit = document.getElementById("totalEmployeeDebit");
let totalProductStudioDebit = document.getElementById("totalProductStudioDebit");
let totalRecoveryStudioDebit = document.getElementById("totalRecoveryStudioDebit");
let totalAdvanceDebit = document.getElementById("totalAdvanceDebit");
let totalTaxesDebit = document.getElementById("totalTaxesDebit");
let totalOpeningBalanceDebit = document.getElementById("totalOpeningBalanceDebit");

// async function getAllDebitDetailsRealTime(date) {
//   const docRef = doc(db, "dailyDebit", date);
//   let docSnap = await getDoc(docRef);
//   var data = docSnap.data();
//   if (docSnap.exists()) {
//     const realtimeDocRef = onSnapshot(doc(db, "dailyDebit", date), (doc) => {
//       data = doc.data();
//       totalOpeningBalanceDebit.innerHTML = "Rs " + data["openingBalance"];
//       totalDailyDebit.innerHTML = "Rs " + data["totalDebit"];
//       // totalEmployeeDebit.innerHTML='Rs '+data['employees'];
//       totalProductStudioDebit.innerHTML = "Rs " + data["productStudio"];
//       // totalRecoveryStudioDebit.innerHTML='Rs '+data['recoveryStudio'];
//       //   totalAdvanceDebit.innerHTML = "Rs " + data["advance"];
//       totalTaxesDebit.innerHTML = "Rs " + data["taxes"];
//     });
//   } else {
//     totalOpeningBalanceDebit.innerHTML = "Rs 0";
//     totalDailyDebit.innerHTML = "Rs 0";
//     // totalEmployeeDebit.innerHTML='Rs 0';
//     totalProductStudioDebit.innerHTML = "Rs 0";
//     // totalRecoveryStudioDebit.innerHTML='Rs 0';
//     // totalAdvanceDebit.innerHTML = "Rs 0";
//     totalTaxesDebit.innerHTML = "Rs 0";
//   }
// }

// function setDate() {
//   let datefield = document.getElementById("filterDate");

//   datefield.value = moment().format("yyyy-MM-DD");
//   console.log(moment().format("yyyy-MM-DD"));

//   let selectedDate = new Date(datefield.value);
//   selectedDate = moment(selectedDate).format("DD-MM-yyyy");
//   console.log(selectedDate);
//   getAllDebitDetailsRealTime(selectedDate);

//   // Handle date changes
//   datefield.addEventListener("change", function (e) {
//     console.log(e.target.value);

//     // Get the date
//     selectedDate = e.target.value;
//     selectedDate =
//       selectedDate.substring(8, 10) +
//       "-" +
//       selectedDate.substring(5, 7) +
//       "-" +
//       selectedDate.substring(0, 4);
//     getAllDebitDetailsRealTime(selectedDate);
//   });
// }

// setDate();
totalOpeningBalanceDebit.innerHTML = "Rs 900";

const updateDebit = () => {
  let amounts = [
    totalOpeningBalanceDebit.innerHTML,
    totalProductStudioDebit.innerHTML,
    totalAdvanceDebit.innerHTML,
    totalTaxesDebit.innerHTML,
    totalEmployeeDebit.innerHTML,
  ];
  amounts = amounts?.map((i) => parseInt(i?.split(" ")?.[1] || 0) || 0);
  amounts = amounts?.reduce((acc, cur) => acc + cur, 0);
  totalDailyDebit.innerHTML = "Rs " + (amounts || 0);
};

const config = { attributes: true, childList: true, subtree: true };

const callback = (mutationList, observer) => {
  // for (const mutation of mutationList) {
  //   if (mutation.type === "childList") {
  //     console.log("A child node has been added or removed.");
  //   } else if (mutation.type === "attributes") {
  //     console.log(`The ${mutation.attributeName} attribute was modified.`);
  //   }
  // }
  updateDebit();
};

const observer = new MutationObserver(callback);

observer.observe(totalProductStudioDebit, config);
observer.observe(totalAdvanceDebit, config);
observer.observe(totalTaxesDebit, config);
observer.observe(totalEmployeeDebit, config);
