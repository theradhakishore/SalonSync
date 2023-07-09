import { app } from "./firebase.js";
var newAppointmentList = document.getElementById("newAppointmentList");
var ongoingAppointmentList = document.getElementById("ongoingAppointmentList");
var billedAppointmentList = document.getElementById("billedAppointmentList");

var myDate = new Date();
var hrs = myDate.getHours();

var greet;

if (hrs < 12) greet = "Good Morning, ";
else if (hrs >= 12 && hrs <= 17) greet = "Good Afternoon, ";
else if (hrs >= 17 && hrs <= 24) greet = "Good Evening, ";

document.getElementById("RashmiGreetings").innerHTML =
  greet + ' <span class="text-black fw-bold">Puneet Mishra</span>';

import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const db = getFirestore();

let paymentModes = null;
const getPaymentMethods = async () => {
  const dbRef = collection(db, "paymentMode");
  const q = query(dbRef);
  const payModeData = await getDocs(q);
  const payMode = [];
  payModeData.forEach((doc) => {
    payMode.push({ doc_id: doc.id, data: doc.data() });
  });
  return payMode;
};

async function getAllAppointmentsRealTime(date) {
  const dbRef = collection(db, "appointments");

  const q = query(
    dbRef,
    where("appointmentDate", "==", date),
    where("visitingStatus", "==", false),
    where("isBilled", "==", false)
  );
  console.log(q);

  onSnapshot(q, (querySnapshot) => {
    var appointments = [];
    console.log(appointments);

    querySnapshot.forEach((doc) => {
      appointments.push(doc.data());
    });
    addAllNewAppointmentsToList(appointments);
  });
}

async function getOngoingAppointmentsRealTime(date) {
  const dbRef = collection(db, "appointments");

  const q = query(
    dbRef,
    where("appointmentDate", "==", date),
    where("visitingStatus", "==", true),
    where("isBilled", "==", false)
  );

  onSnapshot(q, (querySnapshot) => {
    var appointments = [];

    console.log(appointments);

    querySnapshot.forEach((doc) => {
      appointments.push(doc.data());
    });
    addAllOngoingAppointmentsToList(appointments);
  });
}

async function getBilledAppointmentsRealTime(date) {
  const dbRef = collection(db, "appointments");

  const q = query(
    dbRef,
    where("appointmentDate", "==", date),
    where("visitingStatus", "==", true),
    where("isBilled", "==", true)
  );

  const appointments = [];
  const appointmentSnapshot = await getDocs(q);
  // console.log(appointmentSnapshot.docs[0].data())
  for (let i = 0; i < appointmentSnapshot.docs.length; i++) {
    const subDbRef = collection(
      dbRef,
      appointmentSnapshot.docs[i].id,
      "servicesProvided"
    );

    const q1 = query(subDbRef);
    const serviceDetails = [];
    const ss = await getDocs(q1);
    ss.forEach((doc) => {
      serviceDetails.push({ id: doc.id, data: doc.data() });
    });
    appointments.push({
      ...appointmentSnapshot.docs[i].data(),
      serviceDetails: serviceDetails,
    });
  }

  //   console.log(appointments);
  addAllBilledAppointmentsToList(appointments);

  //   onSnapshot(q, (querySnapshot) => {
  //     var appointments = [];

  //     querySnapshot.forEach((doc) => {
  //       appointments.push(doc.data());
  //     });

  //     console.log(appointments);
  //     addAllBilledAppointmentsToList(appointments);
  //   });
}

function setDate() {
  let datefield = document.getElementById("filterDate");

  // var today=new Date();
  // console.log(today);
  // datefield.value = today.getFullYear()+'-'+today.getMonth()+1+'-'+today.getDate();

  datefield.value = moment().format("yyyy-MM-DD");

  let selectedDate = new Date(datefield.value);
  selectedDate = moment(selectedDate).format("DD-MM-yyyy");
  console.log(selectedDate);
  getAllAppointmentsRealTime(selectedDate);
  getOngoingAppointmentsRealTime(selectedDate);
  getBilledAppointmentsRealTime(selectedDate);

  // Handle date changes
  datefield.addEventListener("change", function (e) {
    console.log(e.target.value);

    // Get the date
    selectedDate = e.target.value;
    selectedDate =
      selectedDate.substring(8, 10) +
      "-" +
      selectedDate.substring(5, 7) +
      "-" +
      selectedDate.substring(0, 4);
    getAllAppointmentsRealTime(selectedDate);
    getOngoingAppointmentsRealTime(selectedDate);
    getBilledAppointmentsRealTime(selectedDate);
  });
}

setDate();

function updateVisitingStatus(id) {
  console.log(typeof id);

  const updateStatusRef = doc(db, "appointments", `${id}`);

  updateDoc(updateStatusRef, {
    visitingStatus: true,
  });
}

function updateBillingStatus(id) {
  const updateBillRef = doc(db, "appointments", `${id}`);

  updateDoc(updateBillRef, {
    isBilled: true,
  }).finally(() => {
    let datefield = document.getElementById("filterDate");

    datefield.value = moment().format("yyyy-MM-DD");

    let selectedDate = new Date(datefield.value);
    selectedDate = moment(selectedDate).format("DD-MM-yyyy");
    getBilledAppointmentsRealTime(selectedDate);
  });
}

//---------function for updating New Appointments List------------------//
function addNewAppointmentsToList(
  id,
  name,
  number,
  appointmentDate,
  appointmentTime
) {
  let trow = document.createElement("tr");
  let td1 = document.createElement("td");
  let td2 = document.createElement("td");
  let td3 = document.createElement("td");
  let td4 = document.createElement("td");
  let td5 = document.createElement("td");

  td1.innerHTML = id;
  td2.innerHTML = name;
  td3.innerHTML = `${appointmentDate}&nbsp;&nbsp;&nbsp;${appointmentTime}`;
  td4.innerHTML = number;
  td5.innerHTML = `<button type="button" class="btn btn-outline-secondary btn-rounded btn-icon" id=${id} > 
    <i class="mdi mdi-check"></i>
    </button>`;

  trow.appendChild(td1);
  trow.appendChild(td2);
  trow.appendChild(td3);
  trow.appendChild(td4);
  trow.appendChild(td5);

  newAppointmentList.appendChild(trow);

  document.getElementById(id).addEventListener("click", () => {
    updateVisitingStatus(id);
  });
}

function addAllNewAppointmentsToList(allAppointments) {
  newAppointmentList.innerHTML = "";
  // ongoingAppointmentList.innerHTML="";
  // billedAppointmentList.innerHTML="";
  allAppointments.forEach((element) => {
    addNewAppointmentsToList(
      element.appointmentID,
      element.customerName,
      element.contactNumber,
      element.appointmentDate,
      element.appointmentTime,
      element.visitingStatus
    );
  });
}

//---------function for updating Ongoing Appointments List------------------//
function addOngoingAppointmentsToList(
  id,
  name,
  number,
  appointmentDate,
  appointmentTime
) {
  let trow = document.createElement("tr");
  let td1 = document.createElement("td");
  let td2 = document.createElement("td");
  let td3 = document.createElement("td");
  let td4 = document.createElement("td");
  let td5 = document.createElement("td");

  td1.innerHTML = id;
  td2.innerHTML = name;
  td3.innerHTML = `${appointmentDate}&nbsp;&nbsp;&nbsp;${appointmentTime}`;
  td4.innerHTML = number;
  td5.innerHTML = `<button type="button" class="btn btn-outline-secondary btn-rounded btn-icon" id=${id} > 
    <i class="mdi mdi-check"></i>
    </button>`;

  trow.appendChild(td1);
  trow.appendChild(td2);
  trow.appendChild(td3);
  trow.appendChild(td4);
  trow.appendChild(td5);

  ongoingAppointmentList.appendChild(trow);

  document.getElementById(id).addEventListener("click", () => {
    updateBillingStatus(id);
  });
}

function addAllOngoingAppointmentsToList(allAppointments) {
  ongoingAppointmentList.innerHTML = "";

  allAppointments.forEach((element) => {
    addOngoingAppointmentsToList(
      element.appointmentID,
      element.customerName,
      element.contactNumber,
      element.appointmentDate,
      element.appointmentTime,
      element.isBilled
    );
  });
}

//---------function for updating billed Appointments List------------------//
function addBilledAppointmentsToList(
  id,
  name,
  number,
  appointmentDate,
  appointmentTime,
  appointmentAdvance,
  appointmentBillAmount,
  appointmentPaymentMode
) {
  let trow = document.createElement("tr");
  let td1 = document.createElement("td");
  let td2 = document.createElement("td");
  let td3 = document.createElement("td");
  let td4 = document.createElement("td");
  let td5 = document.createElement("td");
  let td6 = document.createElement("td");
  let td7 = document.createElement("td");

  td1.innerHTML = id;
  td2.innerHTML = name;
  td3.innerHTML = `${appointmentDate}&nbsp;&nbsp;&nbsp;${appointmentTime}`;
  td4.innerHTML = number;
  td5.innerHTML = "Rs " + (appointmentAdvance || 0);
  td6.innerHTML =
    "Rs " +
    (appointmentAdvance
      ? appointmentBillAmount - appointmentAdvance > 0
        ? appointmentBillAmount - appointmentAdvance
        : appointmentBillAmount || 0
      : appointmentBillAmount || 0);
  td7.innerHTML = `
    <select class="form-select" id=${`${id}-select`}>
        ${paymentModes?.map(
          (i) => `<option value=${i?.data?.id}>${i?.data?.name}</option>`
        )}

    </select>
  `;

  trow.appendChild(td1);
  trow.appendChild(td2);
  trow.appendChild(td3);
  trow.appendChild(td4);
  trow.appendChild(td5);
  trow.appendChild(td6);
  trow.appendChild(td7);

  billedAppointmentList.appendChild(trow);
  document.getElementById(`${id}-select`).value = appointmentPaymentMode;
  document.getElementById(`${id}-select`).addEventListener("change", (e) => {
    const valueOfMode = e?.target?.value;
    const updateBillRef = doc(db, "appointments", id);

    updateDoc(updateBillRef, {
      paymentMode: valueOfMode,
    })
      .then(() => {
        $("#createAppointmentModal").modal("hide");
        document.getElementById("appointmentToast").innerHTML =
          "Payment mode updated";
        $("#success").toast("show");
      })
      .catch(() => {
        $("#createAppointmentModal").modal("hide");
        document.getElementById("appointmentToast").innerHTML =
          "Error in updating payment mode";
        $("#success").toast("show");
      });
  });
}

async function addAllBilledAppointmentsToList(allAppointments) {
  billedAppointmentList.innerHTML = "";
  if (!paymentModes) {
    paymentModes = await getPaymentMethods();
  }
  allAppointments.forEach((element) => {
    addBilledAppointmentsToList(
      element.appointmentID,
      element.customerName,
      element.contactNumber,
      element.appointmentDate,
      element.appointmentTime,
      element.advanceAmount,
      element?.serviceDetails?.reduce(
        (acc, cur) =>
          acc +
          (parseInt(
            cur?.data?.services?.reduce(
              (acc1, cur1) => acc1 + (parseInt(cur1?.price) || 0),
              0
            )
          ) || 0),
        0
      ),
      element.paymentMode
    );
  });
}

//---------GET DATA------------------//

// window.onload=getAllAppointmentsRealTime;
