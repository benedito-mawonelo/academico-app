// services/cadeiraService.js
import { db } from '../firebase'
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'

const colRef = collection(db, 'cadeiras')

export async function criarCadeira(data) {
  return await addDoc(colRef, data)
}

export async function listarCadeiras() {
  const snapshot = await getDocs(colRef)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function atualizarCadeira(id, data) {
  return await updateDoc(doc(colRef, id), data)
}

export async function deletarCadeira(id) {
  return await deleteDoc(doc(colRef, id))
}
