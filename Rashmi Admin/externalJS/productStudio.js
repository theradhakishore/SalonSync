// https://developer.snapappointments.com/bootstrap-select
// form id createProductStudio
// productStudio-select-names
// productStudio-select-employee
const productStudioNames = "productStudio-select-names";
const productStudioEmployee = "productStudio-select-employee";
const createProductStudioItem = "createProductStudioItem";
const createProductStudioModal = "createProductStudioModal";
const createProductStudio = "createProductStudio";
const productStudioTable = "productStudioTable";

import { app } from "./firebase.js";

import {
  getFirestore,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  onSnapshot,
  collection,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const db = getFirestore();

let firestoreProducts = null;
let firebaseEmployees = null;
const getProducts = async () => {
  if (firestoreProducts) {
    return firestoreProducts;
  } else {
    const dbRef = collection(db, "rashmiProducts");
    const q = query(dbRef);
    const productData = await getDocs(q);
    const products = [];
    productData.forEach((doc) => {
      products.push({ id: doc.id, data: doc.data() });
    });
    firestoreProducts = products;
    return products;
  }
};

const renderProducts = async () => {
  const productSelect = document.getElementById(productStudioNames);
  productSelect.innerHTML = "";
  const products = await getProducts();

  products?.forEach((product) => {
    const node = ` <option value=${product?.id}>${product?.data?.productName}</option>`;
    productSelect.insertAdjacentHTML("beforeend", node);
  });

  $(`#${productStudioNames}`).selectpicker("refresh");
};

const getEmployees = async () => {
  if (firebaseEmployees) {
    return firebaseEmployees;
  } else {
    const dbRef = collection(db, "employeeData");
    const q = query(dbRef);
    const employeeData = await getDocs(q);
    const employees = [];
    employeeData.forEach((doc) => {
      employees.push({ id: doc.id, data: doc.data() });
    });
    firebaseEmployees = employees;
    return employees;
  }
};

const renderEmployees = async () => {
  const employeeSelect = document.getElementById(productStudioEmployee);
  employeeSelect.innerHTML = "";
  const employees = await getEmployees();

  employees?.forEach((emp) => {
    const node = ` <option value=${emp?.id}>${emp?.data?.email}</option>`;
    employeeSelect.insertAdjacentHTML("beforeend", node);
  });

  $(`#${productStudioEmployee}`).selectpicker("refresh");
};

const updateProductStudio = async (employee, products) => {
  let datefield = document.getElementById("filterDate");

  datefield.value = moment().format("yyyy-MM-DD");
  // console.log(moment().format("yyyy-MM-DD"));

  let selectedDate = new Date(datefield.value);
  selectedDate = moment(selectedDate).format("DD-MM-yyyy");
  // console.log(selectedDate);

  const innerDbRef = collection(
    db,
    "dailyDebit",
    selectedDate,
    "productStudioDebit"
    // employee
  );

  await addDoc(innerDbRef, {
    employeeID: employee,
    products: products,
  })
    .then(() => {
      $(`#${productStudioNames}`).selectpicker("val", []);
      $(`#${productStudioEmployee}`).selectpicker("val", []);
      $(`#${createProductStudioModal}`).modal("hide");
      document.getElementById("appointmentToast").innerHTML =
        "Product Studio Reciept Created Successfully";
      $("#success").toast("show");
    })
    .catch((error) => {
      alert(error);
    });

  console.log("out");

  // -- important -- no deletion -- for future use
  // const q = query(innerDbRef);
  // let documentEmp = await getDoc(q);
  // // let document = await firebase
  // //   .firestore()
  // //   .collection("dailyDebit")
  // //   .doc("13-01-2023")
  // //   .get();
  // console.log(documentEmp);
  // console.log(documentEmp.exists());

  // if (documentEmp && documentEmp.exists()) {
  //   console.log("exists");
  //   console.log(documentEmp.data()?.products);
  //   console.log(typeof documentEmp.data()?.products);
  //   const totalProducts = [...documentEmp.data()?.products, ...products];
  //   await setDoc(innerDbRef, {
  //     emloyeeID: employee,
  //     products: totalProducts,
  //   }).then(() => {
  //     console.log("setting done updated");
  //   });
  // } else {
  //   console.log("setting");
  //   await setDoc(innerDbRef, {
  //     emloyeeID: employee,
  //     products: products,
  //   }).then(() => {
  //     console.log("setting done");
  //   });
  // }
};

const getProductStudio = async () => {
  let datefield = document.getElementById("filterDate");

  datefield.value = moment().format("yyyy-MM-DD");
  // console.log(moment().format("yyyy-MM-DD"));

  let selectedDate = new Date(datefield.value);
  selectedDate = moment(selectedDate).format("DD-MM-yyyy");
  // console.log(selectedDate);

  const innerDbRef = collection(
    db,
    "dailyDebit",
    selectedDate,
    "productStudioDebit"
    // employee
  );

  const productStudioData = await getDocs(innerDbRef);
  let productStudio = [];
  productStudioData.forEach((doc) => {
    productStudio.push({ id: doc.id, ...doc.data() });
  });

  productStudio = productStudio?.reduce(
    (acc, cur) => ({
      ...acc,
      [cur?.employeeID]: {
        employeeID: cur?.employeeID,
        products: [
          ...(acc?.[cur?.employeeID]?.products || []),
          ...cur?.products,
        ],
      },
    }),
    {}
  );

  const products = (await getProducts())?.reduce(
    (acc, cur) => ({ ...acc, [cur?.id]: cur }),
    {}
  );

  const productStudioPriced = Object.keys(productStudio || {}).map((i) => ({
    ...productStudio?.[i],
    total: productStudio?.[i]?.products?.reduce(
      (acc, cur) => acc + parseFloat(products?.[cur]?.data?.price || 0),
      0
    ),
  }));

  console.log(productStudioPriced);
  return productStudioPriced;
};

const renderProductStudio = async () => {
  console.log("in");
  const productStudio = await getProductStudio();
  /*
<tr>
  <td>Herman Beck</td>
  <td>Rs 1500</td>
</tr>
  */
  const domTable = document.getElementById(productStudioTable);
  domTable.innerHTML = "";

  for (let i = 0; i < productStudio?.length; i++) {
    const employee = (await getEmployees())?.find(
      (f) => f?.id === productStudio[i]?.employeeID
    );
    const node = `
      <tr>
        <td>${employee?.data?.firstName || ""} ${
      employee?.data?.lastName || ""
    }</td>
        <td>Rs ${productStudio[i]?.total}</td>
      </tr>`;
    domTable.insertAdjacentHTML("beforeend", node);
  }

  let totalProductStudioDebit = document.getElementById(
    "totalProductStudioDebit"
  );
  totalProductStudioDebit.innerHTML =
    "Rs " +
    (productStudio?.reduce(
      (acc, cur) => acc + (parseInt(cur?.total) || 0),
      0
    ) || 0);
};

// updateProductStudio();
document
  .getElementById(createProductStudioItem)
  .addEventListener("click", () => {
    const productOptions =
      document.getElementById(productStudioNames).selectedOptions;
    const products = Array.from(productOptions).map(({ value }) => value);
    console.log(products);

    const employeeOptions = document.getElementById(
      productStudioEmployee
    ).selectedOptions;
    const employees = Array.from(employeeOptions).map(({ value }) => value);
    console.log(employees);

    updateProductStudio(employees[0], products).finally(() => {
      console.log("out in");
      setTimeout(() => {
        console.log("out inn");
        renderProductStudio();
      }, 3000);
    });
  });

// inits
renderProducts();
renderEmployees();
renderProductStudio();
$(`#${createProductStudioModal}`).on("hidden.bs.modal", () => {
  $(`#${productStudioNames}`).selectpicker("val", []);
  $(`#${productStudioEmployee}`).selectpicker("val", []);
});
