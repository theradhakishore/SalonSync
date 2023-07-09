import { db, productCollectionName } from './firebase.js'
import { collection, addDoc, doc, getDoc, getDocs, query } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js'

async function addNewProduct(product) {
    const newProduct = await addDoc(collection(db, productCollectionName), product)
    console.log(newProduct)
    /*
    addNewProduct({
        name: 'Loreal Hair Shampoo',
        price: 200
    })
    */
}

async function getAllProducts() {
    const productSnapshot = await getDocs(query(collection(db, productCollectionName)))
    const productsList = []
    productSnapshot.forEach(product => productsList.push(Object.assign({ id: product.id }, product.data())))
    return productsList //Array.from(productsList).map(product => Object.assign({ id: product.id }, product.data()))
}

async function getProductById(id) {
    const productSnapshot = await getDoc(doc(db, productCollectionName, id))
    // console.log(productSnapshot)
    return productSnapshot.data()
    // getProductById('7UbZFdokR3ULULptydY0')
}

export { addNewProduct, getAllProducts, getProductById }