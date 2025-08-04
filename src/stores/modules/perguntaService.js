// services/perguntaService.js
import { db } from '../firebase'
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'

const colRef = collection(db, 'perguntas')

export async function criarPergunta(data) {
  return await addDoc(colRef, data)
}

export async function listarPerguntas() {
  const snapshot = await getDocs(colRef)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function atualizarPergunta(id, data) {
  return await updateDoc(doc(colRef, id), data)
}

export async function deletarPergunta(id) {
  return await deleteDoc(doc(colRef, id))
}
