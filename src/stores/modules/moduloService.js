// services/moduloService.js
import { db } from '../firebase'
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'

const colRef = collection(db, 'modulos')

export async function criarModulo(data) {
  return await addDoc(colRef, data)
}

export async function listarModulos() {
  const snapshot = await getDocs(colRef)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function atualizarModulo(id, data) {
  return await updateDoc(doc(colRef, id), data)
}

export async function deletarModulo(id) {
  return await deleteDoc(doc(colRef, id))
}
