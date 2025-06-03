import { useState, useEffect } from 'react'
import { auth, firestore } from './firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User, onAuthStateChanged } from 'firebase/auth'
import { collection, doc, getDocs, setDoc, query, orderBy, limit } from 'firebase/firestore'
import './App.css'

// Define all available exercises with unique IDs
const exercises = {
  'ex-1': { id: 'ex-1', name: 'Peck Deck', oldNames: ['peck deck'], repGoal: '6 - 10' },
  'ex-2': { id: 'ex-2', name: 'Incline Press', oldNames: ['incline press'], repGoal: '1 - 3' },
  'ex-3': { id: 'ex-3', name: 'Close Grip Pull Down', oldNames: ['close grip pull down'], repGoal: '6 - 10' },
  'ex-4': { id: 'ex-4', name: 'Deadlift', oldNames: ['deadlift'], repGoal: '5 - 8' },
  'ex-5': { id: 'ex-5', name: 'Ab Crunch', oldNames: ['Ab crunch', 'ab crunch'], repGoal: '5 - 8' },
  'ex-6': { id: 'ex-6', name: 'Leg Extensions', oldNames: ['leg extensions'], repGoal: '8 - 15' },
  'ex-7': { id: 'ex-7', name: 'Leg Press', oldNames: ['leg press'], repGoal: '8 - 15' },
  'ex-8': { id: 'ex-8', name: 'Calf Raises', oldNames: ['calf raises'], repGoal: '12 - 20' },
  'ex-9': { id: 'ex-9', name: 'Abductor', oldNames: ['Abductor'], repGoal: '8 - 15' },
  'ex-10': { id: 'ex-10', name: 'Adductor', oldNames: ['Adductor'], repGoal: '8 - 15' },
  'ex-11': { id: 'ex-11', name: 'Lateral Raise', oldNames: ['Lateral raise'], repGoal: '6 - 10' },
  'ex-12': { id: 'ex-12', name: 'Bend Over Raise', oldNames: ['bend over raise'], repGoal: '6 - 10' },
  'ex-13': { id: 'ex-13', name: 'Barbell Curl', oldNames: ['barbell curl'], repGoal: '6 - 10' },
  'ex-14': { id: 'ex-14', name: 'Triceps Extensions', oldNames: ['triceps extensions'], repGoal: '6 - 10' },
  'ex-15': { id: 'ex-15', name: 'Dips', oldNames: ['dips'], repGoal: '3 - 5' },
  'ex-16': { id: 'ex-16', name: 'Leg Extensions Static Hold', oldNames: ['leg extensions static hold'], repGoal: 'hold' },
  'ex-17': { id: 'ex-17', name: 'Squats', oldNames: ['squats'], repGoal: '8 - 15' },
} as const

type Exercise = {
  id: string
  name: string
  oldNames: string[]
  repGoal: string
}

const routine = [
  {
    day: 'Day 1',
    exerciseIds: ['ex-1', 'ex-2', 'ex-3', 'ex-4', 'ex-5'],
  },
  {
    day: 'Day 2',
    exerciseIds: ['ex-6', 'ex-7', 'ex-8', 'ex-5', 'ex-9', 'ex-10'],
  },
  {
    day: 'Day 3',
    exerciseIds: ['ex-11', 'ex-12', 'ex-13', 'ex-14', 'ex-15', 'ex-5'],
  },
  {
    day: 'Day 4',
    exerciseIds: ['ex-16', 'ex-17', 'ex-8', 'ex-5'],
  },
]

type ExerciseEntry = {
  weight: string
  reps: string
  failure: boolean
  comments: string
}

type DayData = {
  [exerciseId: string]: ExerciseEntry
}

type HistoryEntry = {
  date: string
  data: DayData
}

function getTodayDate() {
  const d = new Date()
  return d.toISOString().slice(0, 10) // YYYY-MM-DD
}

function formatDateWithDay(dateStr: string) {
  const date = new Date(dateStr)
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const day = days[date.getDay()]
  return `${dateStr} (${day})`
}

// Helper function to find exercise ID from old name
function findExerciseId(oldName: string): string | undefined {
  const normalizedName = oldName.toLowerCase()
  for (const [id, exercise] of Object.entries(exercises)) {
    if (exercise.oldNames.some(name => name.toLowerCase() === normalizedName)) {
      return id
    }
  }
  return undefined
}

// Helper function to migrate old data format to new format
function migrateData(oldData: any): DayData {
  const newData: DayData = {}
  for (const [oldName, entry] of Object.entries(oldData)) {
    if (typeof entry === 'object' && entry !== null) {
      const exerciseId = findExerciseId(oldName as string)
      if (exerciseId) {
        newData[exerciseId] = entry as ExerciseEntry
      }
    }
  }
  return newData
}

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState<User | null>(auth.currentUser)
  const [error, setError] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [selectedDay, setSelectedDay] = useState(0)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [formData, setFormData] = useState<DayData>({})
  const [loading, setLoading] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [lastEntry, setLastEntry] = useState<DayData | null>(null)
  const [editingDate, setEditingDate] = useState<string | null>(null)
  const [openExercises, setOpenExercises] = useState<{ [exerciseId: string]: boolean }>({})

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      setUser(firebaseUser)
    })
    return () => unsubscribe()
  }, [])

  // Load history and last entry for selected day
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        setHistory([])
        setLastEntry(null)
        setFormData({})
        return
      }
      setLoading(true)
      const dayKey = routine[selectedDay].day
      const entriesRef = collection(firestore, 'progress', user.uid, dayKey)
      const q = query(entriesRef, orderBy('date', 'desc'))
      const querySnapshot = await getDocs(q)
      const entries: HistoryEntry[] = []
      querySnapshot.forEach((docSnap) => {
        const oldData = docSnap.data()
        const migratedData = migrateData(oldData)
        entries.push({ date: docSnap.id, data: migratedData })
      })
      setHistory(entries)
      setLastEntry(entries[0]?.data || null)
      setFormData({}) // always start with empty form
      setLoading(false)
    }
    fetchHistory()
  }, [user, selectedDay])

  useEffect(() => {
    // When day changes, open only the first exercise by default
    const first = routine[selectedDay].exerciseIds[0]
    setOpenExercises({ [first]: true })
  }, [selectedDay])

  useEffect(() => {
    // When day changes, reset the exercise index to 0
    setCurrentExerciseIndex(0)
  }, [selectedDay])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
  }

  const handleInputChange = (exerciseId: string, field: keyof ExerciseEntry, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [field]: value,
      },
    }))
  }

  const handleEdit = (date: string, data: DayData) => {
    setEditingDate(date)
    setFormData(data)
  }

  const handleCancelEdit = () => {
    setEditingDate(null)
    setFormData({})
  }

  const handleSave = async () => {
    if (!user) return
    setLoading(true)
    setSaveMsg('')
    const dayKey = routine[selectedDay].day
    const dateToSave = editingDate || getTodayDate()
    // Fill missing exercises with empty values
    const entry: DayData = {}
    for (const ex of routine[selectedDay].exerciseIds) {
      entry[ex] = formData[ex] || { weight: '', reps: '', failure: false, comments: '' }
    }
    await setDoc(doc(firestore, 'progress', user.uid, dayKey, dateToSave), { ...entry, date: dateToSave })
    setLoading(false)
    setSaveMsg(editingDate ? 'Updated!' : 'Saved!')
    setTimeout(() => setSaveMsg(''), 2000)
    // Refresh history
    const entriesRef = collection(firestore, 'progress', user.uid, dayKey)
    const q = query(entriesRef, orderBy('date', 'desc'))
    const querySnapshot = await getDocs(q)
    const entries: HistoryEntry[] = []
    querySnapshot.forEach((docSnap) => {
      entries.push({ date: docSnap.id, data: docSnap.data() as DayData })
    })
    setHistory(entries)
    setLastEntry(entries[0]?.data || null)
    setFormData({})
    setEditingDate(null)
  }

  const handleNextExercise = () => {
    if (currentExerciseIndex < routine[selectedDay].exerciseIds.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1)
    }
  }

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1)
    }
  }

  const currentExerciseId = routine[selectedDay].exerciseIds[currentExerciseIndex]
  const isFirstExercise = currentExerciseIndex === 0
  const isLastExercise = currentExerciseIndex === routine[selectedDay].exerciseIds.length - 1

  return (
    <div className="App">
      <h1>Mentzer Tracker</h1>
      {user ? (
        <div>
          <p>Welcome, {user.email}!</p>
          <button onClick={handleLogout}>Logout</button>
          <div className="routine-tabs">
            {routine.map((day, idx) => (
              <button
                key={day.day}
                className={selectedDay === idx ? 'active' : ''}
                onClick={() => setSelectedDay(idx)}
              >
                {day.day}
              </button>
            ))}
          </div>
          <h2>{routine[selectedDay].day}</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSave()
              }}
              className="routine-form"
            >
              <div className="exercise-navigation">
                <button
                  type="button"
                  onClick={handlePreviousExercise}
                  disabled={isFirstExercise}
                  className="nav-button"
                  aria-label="Previous Exercise"
                >
                  ←
                </button>
                <span className="exercise-counter">
                  Exercise {currentExerciseIndex + 1} of {routine[selectedDay].exerciseIds.length}
                </span>
                <button
                  type="button"
                  onClick={handleNextExercise}
                  disabled={isLastExercise}
                  className="nav-button"
                  aria-label="Next Exercise"
                >
                  →
                </button>
              </div>

              {(() => {
                const exercise = exercises[currentExerciseId]
                const entry = formData[currentExerciseId] || { weight: '', reps: '', failure: false, comments: '' }
                const last = lastEntry?.[currentExerciseId]
                return (
                  <div className="exercise-entry">
                    <div className="exercise-header">
                      <h3 className="exercise-title">{exercise.name}</h3>
                      <div className="rep-goal">Rep Goal: {exercise.repGoal}</div>
                    </div>
                    <div className="exercise-fields">
                      <label>
                        Weight (kg/lb):
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={entry.weight}
                          onChange={(e) => handleInputChange(currentExerciseId, 'weight', e.target.value)}
                        />
                        {last && last.weight && (
                          <span className="last-info">Last: {last.weight}</span>
                        )}
                      </label>
                      <label>
                        Reps:
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={entry.reps}
                          onChange={(e) => handleInputChange(currentExerciseId, 'reps', e.target.value)}
                        />
                        {last && last.reps && (
                          <span className="last-info">Last: {last.reps}</span>
                        )}
                      </label>
                      <label>
                        Failure:
                        <input
                          type="checkbox"
                          checked={entry.failure}
                          onChange={(e) => handleInputChange(currentExerciseId, 'failure', e.target.checked)}
                        />
                        {last && (
                          <span className="last-info">Last: {last.failure ? 'Yes' : 'No'}</span>
                        )}
                      </label>
                      <label>
                        Comments:
                        <input
                          type="text"
                          value={entry.comments}
                          onChange={(e) => handleInputChange(currentExerciseId, 'comments', e.target.value)}
                        />
                        {last && last.comments && (
                          <span className="last-info">Last: {last.comments}</span>
                        )}
                      </label>
                    </div>
                  </div>
                )
              })()}

              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {editingDate ? 'Update Entry' : 'Save Progress'}
                </button>
                {editingDate && (
                  <button type="button" onClick={handleCancelEdit}>
                    Cancel Edit
                  </button>
                )}
                {saveMsg && <span className="save-msg">{saveMsg}</span>}
              </div>
            </form>
          )}
          {history.length > 0 && (
            <div className="history">
              <h3>Previous Entries</h3>
              <table>
                <thead className="history-thead">
                  <tr>
                    <th>Date</th>
                    {routine[selectedDay].exerciseIds.map(exerciseId => (
                      <th key={exerciseId}>{exercises[exerciseId].name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.date}>
                      <td data-label="Date">{formatDateWithDay(h.date)}</td>
                      {routine[selectedDay].exerciseIds.map(exerciseId => (
                        <td key={exerciseId} data-label={exercises[exerciseId].name}>
                          {h.data[exerciseId]?.weight || ''}kg, {h.data[exerciseId]?.reps || ''} reps, {h.data[exerciseId]?.failure ? 'Fail' : ''} {h.data[exerciseId]?.comments || ''}
                        </td>
                      ))}
                      <td data-label="Edit">
                        <button type="button" onClick={() => handleEdit(h.date, h.data)}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
          <button type="button" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
          </button>
          {error && <p className="error">{error}</p>}
        </form>
      )}
    </div>
  )
}

export default App
