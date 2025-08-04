// services/uploadService.js
import { storageRef } from 'boot/firebase'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid'

export async function uploadFile(file, path) {
  try {
    // Gera um nome único para o arquivo
    const fileExtension = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExtension}`
    // Use the imported storageRef directly with the ref function
    const fileRef = ref(storageRef, `${path}/${fileName}`)

    await uploadBytes(fileRef, file)
    const downloadURL = await getDownloadURL(fileRef)

    return downloadURL
  } catch (error) {
    console.error('Erro no upload:', error)
    throw error
  }
}

export async function deleteFile(url) {
  try {
    const fileRef = ref(storageRef, url)
    await deleteObject(fileRef)
    return true
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error)
    return false
  }
}
