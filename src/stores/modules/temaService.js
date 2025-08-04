// services/temaService.js
import { db } from '../firebase'
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'

const colRef = collection(db, 'temas')

export async function criarTema(data) {
  return await addDoc(colRef, data)
}

export async function listarTemas() {
  const snapshot = await getDocs(colRef)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function atualizarTema(id, data) {
  return await updateDoc(doc(colRef, id), data)
}

export async function deletarTema(id) {
  return await deleteDoc(doc(colRef, id))
}
