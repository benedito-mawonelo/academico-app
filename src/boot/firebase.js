// firebase.js (Firebase v9+ modular)
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, collection } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'
import { getStorage, ref } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyBKoneDDs61zMl51CZEmmybkMF2ZgMBPaY",
  authDomain: "mawonelo-dev.firebaseapp.com",
  databaseURL: "https://mawonelo-dev-default-rtdb.firebaseio.com",
  projectId: "mawonelo-dev",
  storageBucket: "mawonelo-dev.appspot.com",
  messagingSenderId: "694049412339",
  appId: "1:694049412339:web:44bfa613043cab92fc9386",
  measurementId: "G-KSNC5949WR"
};

const app = initializeApp(firebaseConfig)

export {app}
export const firebaseAuth = getAuth(app)
export const db = getFirestore(app)
export const firebaseDb = getDatabase(app)
export const storageRef = getStorage(app)

// Coleções Firestore
export const dbUsers = collection(db, "users_academico")
export const dbQuestions = collection(db, "questions")
export const dbUseMoreOurAppNotifications = collection(db, "useMoreOurAppNotifications")
export const dbGetMoreQuestionsNotifications = collection(db, "getMoreQuestionsNotifications")
export const dbTransgressions = collection(db, "transgressions")
export const dbVersions = collection(db, "versions")
export const dbSettings = collection(db, "settings")
export const dbUserReports = collection(db, "userReports")
export const dbPlayHistory = collection(db, "playHistory")

// Referência de imagens de usuários
export const imagesUsers = ref(storageRef, 'usersImages')
