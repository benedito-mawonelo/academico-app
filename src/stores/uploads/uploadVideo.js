// uploads/uploadVideo.js
// Responsável por fazer upload do ficheiro (por enquanto ainda usa Firebase Storage)
// e devolver a URL pública que será gravada em `videoaulas.url`.
// A parte importante é que a URL gravada aponta para o bucket AWS, usando a base do .env.

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storageRef } from '../firebase'

const AWS_VIDEO_BASE_URL = import.meta.env.VITE_AWS_VIDEO_BASE_URL || ''

function toAwsUrl(firebaseUrl, path, fileName) {
  // Se VITE_AWS_VIDEO_BASE_URL estiver configurado, montamos a URL AWS;
  // senão, voltamos a usar a URL original (Firebase) para não quebrar nada.
  if (!AWS_VIDEO_BASE_URL) {
    return firebaseUrl
  }

  // Normaliza path e nome do ficheiro para montar um caminho previsível no bucket
  const cleanPath = String(path || '').replace(/^\/+|\/+$/g, '')
  const cleanName = String(fileName || '').replace(/^\/+/, '')
  const awsPath = cleanPath ? `${cleanPath}/${cleanName}` : cleanName

  return `${AWS_VIDEO_BASE_URL}/${awsPath}`
}

export async function uploadVideo(file, path) {
  // Ainda faz upload para o Firebase Storage (pode ser trocado futuramente por upload direto para AWS)
  const fileRef = ref(storageRef, `${path}/${file.name}`)
  await uploadBytes(fileRef, file)
  const firebaseUrl = await getDownloadURL(fileRef)

  // O valor que será gravado em videoaulas.url passa a ser a URL do bucket AWS
  return toAwsUrl(firebaseUrl, path, file.name)
}
