// uploads/uploadImage.js
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storageRef } from '../firebase'

export async function uploadImage(file, path) {
  const fileRef = ref(storageRef, `${path}/${file.name}`)
  await uploadBytes(fileRef, file)
  return await getDownloadURL(fileRef)
}
