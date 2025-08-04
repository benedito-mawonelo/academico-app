// import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
// import { storageRef } from 'boot/firebase'

// export async function uploadImagemPergunta(file, perguntaId) {
//   const fileRef = ref(storageRef, `perguntas/${perguntaId}-${file.name}`)
//   const snapshot = await uploadBytes(fileRef, file)
//   return await getDownloadURL(snapshot.ref)
// }

// export async function deletarImagem(url) {
//   const fileRef = ref(storageRef, url)
//   return deleteObject(fileRef)
// }
