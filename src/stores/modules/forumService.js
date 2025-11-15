import { defineStore } from 'pinia'
import { db, firebaseAuth } from '../../boot/firebase'
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'

const liveClassesRef = collection(db, 'live_classes')
const participationsRef = collection(db, 'class_participations')
const notificationsRef = collection(db, 'notifications')
const usersRef = collection(db, 'users_academico')

export const useForumStore = defineStore('forum', {
  state: () => ({
    liveClasses: [],
    scheduledClasses: [],
    recordedClasses: [],
    currentClass: null,
    participants: [],
    loading: false
  }),

  getters: {
    ongoingClasses: (state) => {
      return state.liveClasses.filter(c => c.status === 'live')
    },
    upcomingClasses: (state) => {
      return state.scheduledClasses.filter(c => c.status === 'scheduled')
    }
  },

  actions: {
    // Criar uma nova aula ao vivo
    async createLiveClass(classData) {
      this.loading = true
      try {
        const user = firebaseAuth.currentUser
        if (!user) throw new Error('Usuário não autenticado')

        const newClass = {
          ...classData,
          instructorId: user.uid,
          instructorName: classData.instructorName || user.displayName || 'Professor',
          status: 'scheduled', // scheduled | live | ended | recorded
          createdAt: serverTimestamp(),
          scheduledFor: classData.scheduledFor || new Date(),
          participants: [],
          liveUrl: classData.liveUrl || null,
          recordingUrl: null,
          expiresAt: null // Será definido quando a gravação for criada
        }

        const docRef = await addDoc(liveClassesRef, newClass)

        // Criar notificações para estudantes sobre a nova aula agendada
        try {
          const usersSnap = await getDocs(usersRef)
          const batchPromises = []
          usersSnap.forEach(uDoc => {
            // Por enquanto, enviar notificação para todos os utilizadores da colecção users_academico.
            // IMPORTANTE: para aparecer em /notificacoes, o id do documento deve ser igual ao uid do Firebase.
            const targetUserId = uDoc.id

            batchPromises.push(addDoc(notificationsRef, {
              userId: targetUserId,
              type: 'live_class_scheduled',
              title: 'Nova aula ao vivo agendada',
              message: `${newClass.title || 'Aula'} de ${newClass.subject || ''} foi agendada para ${newClass.scheduledFor.toLocaleString('pt-PT')}.`,
              icon: 'sensors',
              color: 'primary',
              classId: docRef.id,
              read: false,
              createdAt: serverTimestamp(),
              linkPath: '/forum/live',
              // front-end pode montar rota final, ex.: /forum/live/:classId
              linkQuery: { classId: docRef.id }
            }))
          })
          await Promise.all(batchPromises)
        } catch (notifyErr) {
          console.warn('Falha ao criar notificações para aula agendada:', notifyErr)
        }

        return { id: docRef.id, ...newClass }
      } catch (error) {
        console.error('Erro ao criar aula:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Listar todas as aulas (agendadas, ao vivo e gravadas)
    async loadAllClasses() {
      this.loading = true
      try {
        const snapshot = await getDocs(query(liveClassesRef, orderBy('scheduledFor', 'desc')))
        const classes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          scheduledFor: doc.data().scheduledFor?.toDate?.() || new Date(doc.data().scheduledFor),
          startedAt: doc.data().startedAt?.toDate?.() || (doc.data().startedAt ? new Date(doc.data().startedAt) : null),
          expiresAt: doc.data().expiresAt?.toDate?.() || (doc.data().expiresAt ? new Date(doc.data().expiresAt) : null)
        }))

        // Atualizações automáticas de status (scheduled -> live, live -> recorded)
        await this.autoUpdateStatuses(classes)

        // Separar por status (após possíveis atualizações)
        this.liveClasses = classes.filter(c => c.status === 'live')
        this.scheduledClasses = classes.filter(c => c.status === 'scheduled')
        this.recordedClasses = classes.filter(c => c.status === 'recorded')

        // Verificar e limpar gravações expiradas
        await this.cleanExpiredRecordings()

        return classes
      } catch (error) {
        console.error('Erro ao carregar aulas:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Atualizações automáticas de status conforme tempo/ duração
    async autoUpdateStatuses(classes) {
      try {
        const now = new Date()
        for (const c of classes) {
          // scheduled -> live (quando a hora chega)
          if (c.status === 'scheduled' && c.scheduledFor && c.scheduledFor <= now) {
            try {
await updateDoc(doc(liveClassesRef, c.id), {
                status: 'live',
                startedAt: serverTimestamp()
              })
              c.status = 'live'
              c.startedAt = now
            } catch (e) {
              console.warn('Falha ao auto-iniciar aula', c.id, e)
            }
          }

          // live -> recorded (após duração)
          if (c.status === 'live') {
            const start = c.startedAt || c.scheduledFor || now
            const durationMin = Number(c.duration) || 60
            const endAt = new Date(start.getTime() + durationMin * 60000)
            if (endAt <= now) {
              try {
                const expirationDays = 30
                const expiresAt = new Date()
                expiresAt.setDate(expiresAt.getDate() + expirationDays)
                await updateDoc(doc(liveClassesRef, c.id), {
                  status: 'recorded',
                  endedAt: serverTimestamp(),
                  recordingUrl: c.recordingUrl || null,
                  expiresAt: Timestamp.fromDate(expiresAt)
                })
                c.status = 'recorded'
                c.expiresAt = expiresAt
              } catch (e) {
                console.warn('Falha ao auto-finalizar aula', c.id, e)
              }
            }
          }
        }
      } catch (error) {
        console.error('Erro no autoUpdateStatuses:', error)
      }
    },

    // Iniciar uma aula ao vivo
    async startLiveClass(classId) {
      try {
        const classRef = doc(liveClassesRef, classId)
        await updateDoc(classRef, {
          status: 'live',
          startedAt: serverTimestamp()
        })

        // Atualizar localmente
        const classIndex = this.scheduledClasses.findIndex(c => c.id === classId)
        if (classIndex !== -1) {
          const classData = this.scheduledClasses[classIndex]
          classData.status = 'live'
          this.liveClasses.push(classData)
          this.scheduledClasses.splice(classIndex, 1)
        }

        return true
      } catch (error) {
        console.error('Erro ao iniciar aula:', error)
        throw error
      }
    },

    // Finalizar aula e criar gravação
    async endLiveClass(classId, recordingUrl = null) {
      try {
        const expirationDays = 30 // Gravação expira em 30 dias
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + expirationDays)

        const classRef = doc(liveClassesRef, classId)
        await updateDoc(classRef, {
          status: 'recorded',
          endedAt: serverTimestamp(),
          recordingUrl: recordingUrl,
          expiresAt: Timestamp.fromDate(expiresAt)
        })

        // Atualizar localmente
        const classIndex = this.liveClasses.findIndex(c => c.id === classId)
        if (classIndex !== -1) {
          const classData = this.liveClasses[classIndex]
          classData.status = 'recorded'
          classData.recordingUrl = recordingUrl
          classData.expiresAt = expiresAt
          this.recordedClasses.push(classData)
          this.liveClasses.splice(classIndex, 1)
        }

        return true
      } catch (error) {
        console.error('Erro ao finalizar aula:', error)
        throw error
      }
    },

    // Participar de uma aula ao vivo
    async joinClass(classId) {
      try {
        const user = firebaseAuth.currentUser
        if (!user) throw new Error('Usuário não autenticado')

        // Registrar participação
        const participation = {
          classId,
          userId: user.uid,
          userName: user.displayName || 'Estudante',
          joinedAt: serverTimestamp(),
          leftAt: null,
          watched: false
        }

        await addDoc(participationsRef, participation)

        // Atualizar contador de participantes na aula
        const classRef = doc(liveClassesRef, classId)
        const classDoc = await getDoc(classRef)
        const currentParticipants = classDoc.data().participants || []
        
        if (!currentParticipants.includes(user.uid)) {
          await updateDoc(classRef, {
            participants: [...currentParticipants, user.uid]
          })
        }

        return true
      } catch (error) {
        console.error('Erro ao participar da aula:', error)
        throw error
      }
    },

    // Marcar que o usuário saiu da aula
    async leaveClass(classId) {
      try {
        const user = firebaseAuth.currentUser
        if (!user) return

        const q = query(
          participationsRef,
          where('classId', '==', classId),
          where('userId', '==', user.uid),
          where('leftAt', '==', null)
        )

        const snapshot = await getDocs(q)
        if (!snapshot.empty) {
          const participationDoc = snapshot.docs[0]
          await updateDoc(participationDoc.ref, {
            leftAt: serverTimestamp()
          })
        }

        return true
      } catch (error) {
        console.error('Erro ao sair da aula:', error)
        throw error
      }
    },

    // Buscar gravação de uma aula
    async getRecording(classId) {
      try {
        const classRef = doc(liveClassesRef, classId)
        const classDoc = await getDoc(classRef)
        
        if (!classDoc.exists()) {
          throw new Error('Aula não encontrada')
        }

        const classData = classDoc.data()
        
        // Verificar se a gravação ainda está disponível
        if (classData.expiresAt && classData.expiresAt.toDate() < new Date()) {
          throw new Error('Esta gravação expirou e não está mais disponível')
        }

        return {
          id: classDoc.id,
          ...classData
        }
      } catch (error) {
        console.error('Erro ao buscar gravação:', error)
        throw error
      }
    },

    // Limpar gravações expiradas
    async cleanExpiredRecordings() {
      try {
        const now = new Date()
        const expiredClasses = this.recordedClasses.filter(c => 
          c.expiresAt && new Date(c.expiresAt) < now
        )

        for (const expiredClass of expiredClasses) {
          await deleteDoc(doc(liveClassesRef, expiredClass.id))
          console.log(`Gravação expirada removida: ${expiredClass.title}`)
        }

        // Remover da lista local
        this.recordedClasses = this.recordedClasses.filter(c => 
          !c.expiresAt || new Date(c.expiresAt) >= now
        )

        return expiredClasses.length
      } catch (error) {
        console.error('Erro ao limpar gravações expiradas:', error)
        return 0
      }
    },

    // Buscar participantes de uma aula
    async loadParticipants(classId) {
      try {
        const q = query(participationsRef, where('classId', '==', classId))
        const snapshot = await getDocs(q)
        
        this.participants = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        return this.participants
      } catch (error) {
        console.error('Erro ao carregar participantes:', error)
        throw error
      }
    },

    // Verificar se o usuário já assistiu a gravação
    async markAsWatched(classId) {
      try {
        const user = firebaseAuth.currentUser
        if (!user) return

        const q = query(
          participationsRef,
          where('classId', '==', classId),
          where('userId', '==', user.uid)
        )

        const snapshot = await getDocs(q)
        
        if (!snapshot.empty) {
          const participationDoc = snapshot.docs[0]
          await updateDoc(participationDoc.ref, {
            watched: true,
            watchedAt: serverTimestamp()
          })
        } else {
          // Criar nova participação se não existir
          await addDoc(participationsRef, {
            classId,
            userId: user.uid,
            userName: user.displayName || 'Estudante',
            joinedAt: serverTimestamp(),
            watched: true,
            watchedAt: serverTimestamp()
          })
        }

        return true
      } catch (error) {
        console.error('Erro ao marcar como assistido:', error)
        throw error
      }
    }
  }
})
