// services/videoAulaService.js
import { db } from '../firebase'
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'

const colRef = collection(db, 'videoaulas')

export async function criarVideoAula(data) {
  return await addDoc(colRef, data)
}

export async function listarVideoAulas() {
  const snapshot = await getDocs(colRef)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function atualizarVideoAula(id, data) {
  return await updateDoc(doc(colRef, id), data)
}

export async function deletarVideoAula(id) {
  return await deleteDoc(doc(colRef, id))
}
