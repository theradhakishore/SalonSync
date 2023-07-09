import { app } from "./firebase.js";

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

const renderAdvance = async (date) => {
  console.log("renderAdvance");
  const dbRef = collection(db, "appointments");

  const q = query(dbRef, where("appointmentDate", "==", date));

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

  const DOMAdvance = document.getElementById("dailyDebit-advance");
  DOMAdvance.innerHTML = "";

  appointments?.forEach((appointment) => {
    const node = `
    <tr>
      <td>${appointment?.customerName}</td>
      <td>Rs ${appointment?.advanceAmount || 0}</td>
    </tr>`;
    DOMAdvance.insertAdjacentHTML("beforeend", node);
  });

  let totalAdvanceDebit = document.getElementById("totalAdvanceDebit");
  totalAdvanceDebit.innerHTML =
    "Rs " +
    (appointments?.reduce(
      (acc, cur) => acc + (parseInt(cur?.advanceAmount) || 0),
      0
    ) || 0);
};

const addAdvance = () => {
  // inputAppointmentID, inputAdvanceAmount, createAppointmentButton, createAppointmentAdvanceForm
  const addButton = document.getElementById("createAdvanceButton");

  addButton.addEventListener("click", () => {
    const id = document.getElementById("inputAppointmentID").value;
    const inputAdvanceAmount =
      document.getElementById("inputAdvanceAmount").value;

    const updateBillRef = doc(db, "appointments", id);

    updateDoc(updateBillRef, {
      advanceAmount: inputAdvanceAmount,
    })
      .then(() => {
        document.getElementById("createAppointmentAdvanceForm").reset();
        $("#createAdvanceModal").modal("hide");
        document.getElementById("appointmentToast").innerHTML =
          "Advance amount added";
        $("#success").toast("show");
      })
      .catch(() => {
        document.getElementById("createAppointmentAdvanceForm").reset();
        $("#createAdvanceModal").modal("hide");
        document.getElementById("appointmentToast").innerHTML =
          "Error in updating advance amount";
        $("#success").toast("show");
      })
      .finally(() => {
        let datefield = document.getElementById("filterDate");

        datefield.value = moment().format("yyyy-MM-DD");
        console.log(moment().format("yyyy-MM-DD"));

        let selectedDate = new Date(datefield.value);
        selectedDate = moment(selectedDate).format("DD-MM-yyyy");
        renderAdvance(selectedDate);
      });
  });
};
$("#createAdvanceModal").on("hidden.bs.modal", () => {
  document.getElementById("createAppointmentAdvanceForm").reset();
});
addAdvance();

const renderTotal = (employees) => {
  const totalEmployeeDebit = document.getElementById("totalEmployeeDebit");
  const keys = Object.keys(employees || {});
  const total = keys?.reduce(
    (acc, cur) => acc + (employees?.[cur]?.displayData?.workAmount || 0),
    0
  );
  const totalTax = keys?.reduce(
    (acc, cur) => acc + (employees?.[cur]?.displayData?.tax || 0),
    0
  );
  totalEmployeeDebit.innerHTML = "Rs " + (total || 0);

  let totalTaxesDebit = document.getElementById("totalTaxesDebit");
  totalTaxesDebit.innerHTML = "Rs " + (totalTax || 0);
};

const renderEmployees = (employees) => {
  const DOMEmployee = document.getElementById("employeeDetails");
  DOMEmployee.innerHTML = "";
  const keys = Object.keys(employees || {});

  keys?.forEach((key) => {
    const employee = employees?.[key];
    const node = `<tr>
    <td>
    ${employee?.data?.firstName || ""} ${employee?.data?.lastName || ""}
    </td>
    <td>
      Rs ${employee?.displayData?.workAmount || 0}
    </td>
    <td>
      Rs ${employee?.displayData?.tax || 0}
    </td>
    <td>
      Rs ${employee?.displayData?.amountExcTax || 0}
    </td>
  </tr>`;
    DOMEmployee.insertAdjacentHTML("beforeend", node);
  });
};

const formatEmployees = (appointments, employees) => {
  const formattedEmployees = employees?.reduce(
    (acc, cur) => ({ ...acc, [cur?.id]: cur }),
    {}
  );

  appointments?.forEach((appointment) => {
    appointment?.serviceDetails?.forEach((services) => {
      const workAmount = services?.data?.services?.reduce(
        (acc, cur) => acc + (parseInt(cur?.price) || 0),
        0
      );
      const tax = (workAmount * 18) / 100;
      const amountExcTax = workAmount - tax;
      formattedEmployees[services?.id].displayData = {
        workAmount: workAmount,
        tax: tax,
        amountExcTax: amountExcTax,
      };
    });
  });

  return formattedEmployees;
};

const getEmployees = async () => {
  const dbRef = collection(db, "employeeData");
  const q = query(dbRef);
  const employeeData = await getDocs(q);
  const employees = [];
  employeeData.forEach((doc) => {
    employees.push({ id: doc.id, data: doc.data() });
  });
  return employees;
};

async function getAllEmployeeWorks(date) {
  const dbRef = collection(db, "appointments");

  const q = query(
    dbRef,
    where("appointmentDate", "==", date),
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
  //   console.log(await getEmployees());
  const employees = await getEmployees();

  const formattedEmployees = formatEmployees(appointments, employees);

  renderEmployees(formattedEmployees);
  renderTotal(formattedEmployees);
  renderAdvance(date);
  //   console.log(formattedEmployees);
  // onSnapshot(q,(querySnapshot)=>{
  //     var appointments=[];

  //     querySnapshot.forEach(doc=>{
  //         appointments.push(doc.data());
  //     });
  //     // addAllNewAppointmentsToList(appointments);

  // })

  // const subDbRef=collection(dbRef,'1674797491066','servicesProvided');
  // const q1=query(subDbRef)

  // const ss=await getDocs(q1)
  // ss.forEach((doc)=>{
  //     let subappointments=[];

  //     // subquerySnapshot.forEach(doc=>{
  //         subappointments.push({id:doc.id,data:doc.data()});
  //     // });
  //     console.log(subappointments)
  // });
}

function setDate() {
  let datefield = document.getElementById("filterDate");

  datefield.value = moment().format("yyyy-MM-DD");
  console.log(moment().format("yyyy-MM-DD"));

  let selectedDate = new Date(datefield.value);
  selectedDate = moment(selectedDate).format("DD-MM-yyyy");
  console.log(selectedDate);

  getAllEmployeeWorks(selectedDate);

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
    getAllEmployeeWorks(selectedDate);
  });
}

setDate();
