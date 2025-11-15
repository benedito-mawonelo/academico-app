import { defineStore } from 'pinia'
import { db, firebaseAuth } from '../../boot/firebase'
import { collection, getDocs, query, where, limit, doc, setDoc, getDoc } from 'firebase/firestore'

export const useTestStore = defineStore('test', {
  state: () => ({
    tests: [],
    loading: false,
  }),

  actions: {
    async loadTests() {
      this.loading = true
      this.tests = []
      try {
        console.log('Iniciando carregamento de temas...')
        const temasRef = collection(db, 'temas')
        console.log('Referência da coleção temas:', temasRef.path)
        const temasSnapshot = await getDocs(temasRef)
        console.log('Temas snapshot recebido, número de documentos:', temasSnapshot.docs.length)
        const tests = []

        for (const temaDoc of temasSnapshot.docs) {
          const temaData = temaDoc.data()
          console.log('Dados do tema:', temaDoc.id, temaData)
          const progressData = await this.loadUserProgress(temaDoc.id)
          tests.push({
            id: temaDoc.id,
            title: temaData.nome || `Teste ${temaDoc.id}`,
            progress: progressData.progress || 0,
            completed: progressData.completed || false,
            duration: temaData.duration || 30,
            moduloId: temaData.moduloId || null,
            questions: [],
          })
        }
        this.tests = tests
        console.log('Testes carregados:', this.tests)
      } catch (error) {
        console.error('Erro ao carregar testes:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async loadTestsByCadeira(cadeiraId) {
      this.loading = true
      this.tests = []
      try {
        // 1) Buscar módulos dessa cadeira
        const modulosSnap = await getDocs(query(collection(db, 'modulos'), where('cadeiraId', '==', cadeiraId)))
        const moduloIds = modulosSnap.docs.map(d => d.id)

        if (moduloIds.length === 0) {
          this.tests = []
          return
        }

        // 2) Buscar temas por moduloId em batches de até 10 (limite do 'in')
        const chunk = (arr, size) => arr.reduce((acc, _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]), [])
        const batches = chunk(moduloIds, 10)
        const temas = []
        for (const ids of batches) {
          const temasSnap = await getDocs(query(collection(db, 'temas'), where('moduloId', 'in', ids)))
          temas.push(...temasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
        }

        // 3) Montar tests por tema
        this.tests = await Promise.all(
          temas.map(async (tema) => {
            const progressData = await this.loadUserProgress(tema.id)
            return {
              id: tema.id,
              title: tema.nome || `Teste ${tema.id}`,
              progress: progressData.progress || 0,
              completed: progressData.completed || false,
              duration: tema.duration || 30,
              moduloId: tema.moduloId || null,
              questions: [],
            }
          })
        )
      } catch (error) {
        console.error('Erro ao carregar testes por cadeira:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async loadTestQuestions(testId) {
      this.loading = true
      console.log(`Iniciando carregamento de perguntas para o testId: ${testId}`)
      try {
        const questionsRef = query(
          collection(db, 'perguntas'),
          where('temaId', '==', testId),
          limit(20)
        )
        console.log('Consulta de perguntas criada:', questionsRef)
        const questionsSnapshot = await getDocs(questionsRef)
        console.log('Snapshot de perguntas recebido, número de documentos:', questionsSnapshot.docs.length)
        const questions = questionsSnapshot.docs.map(doc => {
          const questionData = {
            id: doc.id,
            ...doc.data(),
          }
          console.log('Pergunta carregada:', questionData)
          return questionData
        })

        const test = this.tests.find(t => t.id === testId)
        if (test) {
          console.log(`Teste encontrado para testId ${testId}:`, test)
          test.questions = questions
          console.log(`Perguntas atribuídas ao teste ${testId}:`, test.questions)
        } else {
          console.warn(`Teste com testId ${testId} não encontrado na lista de testes`)
        }
      } catch (error) {
        console.error('Erro ao carregar perguntas:', error)
        throw error
      } finally {
        this.loading = false
        console.log('Carregamento de perguntas concluído, loading:', this.loading)
      }
    },

    async loadUserProgress(testId) {
      const user = firebaseAuth.currentUser
      if (!user) {
        console.warn('Nenhum usuário autenticado para carregar progresso')
        return { progress: 0, completed: false, answeredQuestions: [] }
      }
      try {
        console.log(`Carregando progresso do usuário ${user.uid} para testId ${testId}`)
        const progressDocRef = doc(db, 'progresso_usuario', `${user.uid}_${testId}`)
        const progressDoc = await getDoc(progressDocRef)
        if (progressDoc.exists()) {
          const data = progressDoc.data()
          console.log('Progresso encontrado:', data)
          return {
            progress: data.answeredQuestions.length / (this.tests.find(t => t.id === testId)?.questions.length || 20),
            completed: data.completed || false,
            answeredQuestions: data.answeredQuestions || [],
            score: data.score || 0,
          }
        } else {
          console.log('Nenhum progresso encontrado para este teste')
          return { progress: 0, completed: false, answeredQuestions: [] }
        }
      } catch (error) {
        console.error('Erro ao carregar progresso do usuário:', error)
        return { progress: 0, completed: false, answeredQuestions: [] }
      }
    },

    async saveUserProgress(testId, answeredQuestionId, isComplete = false, score = 0) {
      const user = firebaseAuth.currentUser
      if (!user) {
        console.warn('Nenhum usuário autenticado para salvar progresso')
        return
      }
      try {
        console.log(`Salvando progresso para usuário ${user.uid}, testId ${testId}, pergunta ${answeredQuestionId}`)
        const progressDocRef = doc(db, 'progresso_usuario', `${user.uid}_${testId}`)
        const progressDoc = await getDoc(progressDocRef)
        let answeredQuestions = []
        if (progressDoc.exists()) {
          answeredQuestions = progressDoc.data().answeredQuestions || []
        }
        if (answeredQuestionId && !answeredQuestions.includes(answeredQuestionId)) {
          answeredQuestions.push(answeredQuestionId)
        }
        const test = this.tests.find(t => t.id === testId)
        const progress = test ? answeredQuestions.length / test.questions.length : 0
        await setDoc(progressDocRef, {
          userId: user.uid,
          testId,
          answeredQuestions,
          completed: isComplete,
          score: isComplete ? score : progressDoc.exists() ? progressDoc.data().score || 0 : 0,
          lastUpdated: new Date(),
        }, { merge: true })
        console.log('Progresso salvo:', { answeredQuestions, completed: isComplete, progress, score })
        if (test) {
          test.progress = progress
          test.completed = isComplete
        }
      } catch (error) {
        console.error('Erro ao salvar progresso do usuário:', error)
        throw error
      }
    },

    async resetUserProgress(testId) {
      const user = firebaseAuth.currentUser
      if (!user) {
        console.warn('Nenhum usuário autenticado para resetar progresso')
        return
      }
      try {
        const progressDocRef = doc(db, 'progresso_usuario', `${user.uid}_${testId}`)
        await setDoc(progressDocRef, {
          userId: user.uid,
          testId,
          answeredQuestions: [],
          completed: false,
          score: 0,
          lastUpdated: new Date(),
        }, { merge: true })
        const test = this.tests.find(t => t.id === testId)
        if (test) {
          test.progress = 0
          test.completed = false
        }
      } catch (error) {
        console.error('Erro ao resetar progresso do usuário:', error)
        throw error
      }
    },
  },
})
