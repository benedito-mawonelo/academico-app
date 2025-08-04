import { defineStore } from 'pinia'
import { firebaseAuth, db } from 'boot/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth' // certifique-se de importar



export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null
  }),

  actions: {
    async login(email, password) {
      try {
        const result = await signInWithEmailAndPassword(firebaseAuth, email, password)
        this.user = result.user

        const uid = this.user.uid

        // Verifica se já existe documento em /users_academico
        const profileRef = doc(db, 'users_academico', uid)
        const profileSnap = await getDoc(profileRef)

        const firstAccess = !profileSnap.exists()

        // Se não existe, tentar buscar dados antigos em /users e copiar
        if (firstAccess) {
          const userDocRef = doc(db, 'users', uid)
          const userSnap = await getDoc(userDocRef)

          if (userSnap.exists()) {
            const userData = userSnap.data()
            await setDoc(profileRef, userData, { merge: true })
          } else {
            console.warn('Usuário autenticado, mas sem dados em /users.')
          }
        }

        return firstAccess // importante: retorna true se for primeiro acesso

      } catch (error) {
        console.error('Erro ao fazer login:', error)
        throw error
      }
    },


    async findUserByUserNameAndTelefone(payload) {
      const { telefone } = payload

      try {
        const usersRef = collection(db, 'users_academico')
        const q = query(usersRef, where('telefone', '==', telefone))
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) return null

        // Retorna o primeiro usuário encontrado
        const userDoc = querySnapshot.docs[0]
        return { id: userDoc.id, ...userDoc.data() }

      } catch (error) {
        console.error('Erro no findUserByUserNameAndTelefone:', error)
        throw error
      }
    },

    async findUserByTelefone(payload) {
      const { telefone } = payload

      try {
        const usersRef = collection(db, 'users_academico')
        const q = query(usersRef, where('telefone', '==', telefone))
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) return null

        const userDoc = querySnapshot.docs[0]
        return { id: userDoc.id, ...userDoc.data() }
      } catch (error) {
        console.error('Erro no findUserByTelefone:', error)
        throw error
      }
    },

     async registerUser(payload) {
      const { email, password, ...userData } = payload

      try {
        // 1. Criar no Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
        const user = userCredential.user
        this.user = user

        // 2. Criar no Firestore
        const uid = user.uid
        const userRef = doc(db, 'users_academico', uid)
        await setDoc(userRef, {
          ...userData,
          email,
          // email_fake: userData.email_fake || '',
          uid,
          password: password,
          createdAt: new Date().toISOString()
        })

        // 3. Retornar o uid
        return { id: uid }

      } catch (error) {
        console.error('Erro ao registrar usuário:', error)
        throw error
      }
    }


  }
})
