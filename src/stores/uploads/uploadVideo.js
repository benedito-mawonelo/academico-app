// uploads/uploadVideo.js
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storageRef } from '../firebase'

export async function uploadVideo(file, path) {
  const fileRef = ref(storageRef, `${path}/${file.name}`)
  await uploadBytes(fileRef, file)
  return await getDownloadURL(fileRef)
}
