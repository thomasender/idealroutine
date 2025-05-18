import { useState, useEffect } from 'react'
import { auth, firestore } from './firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User, onAuthStateChanged } from 'firebase/auth'
import { collection, doc, getDocs, setDoc, query, orderBy, limit } from 'firebase/firestore'
import './App.css'

const routine = [
  {
    day: 'Day 1',
    exercises: [
      'peck deck',
      'incline press',
      'close grip pull down',
      'deadlift',
      'Ab crunch',
    ],
  },
  {
    day: 'Day 2',
    exercises: [
      'leg extensions',
      'leg press',
      'calf raises',
      'Ab crunch',
      'Abductor',
      'Adductor',
    ],
  },
  {
    day: 'Day 3',
    exercises: [
      'Lateral raise',
      'bend over raise',
      'barbell curl',
      'triceps extensions',
      'dips',
      'Ab crunch',
    ],
  },
  {
    day: 'Day 4',
    exercises: [
      'leg extensions static hold',
      'squats',
      'calf raises',
      'Ab crunch',
    ],
  },
]

type ExerciseEntry = {
  weight: string
  reps: string
  failure: boolean
  comments: string
}

type DayData = {
  [exercise: string]: ExerciseEntry
}

type RoutineData = {
  [day: string]: DayData
}

type HistoryEntry = {
  date: string
  data: DayData
}

function getTodayDate() {
  const d = new Date()
  return d.toISOString().slice(0, 10) // YYYY-MM-DD
}

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState<User | null>(auth.currentUser)
  const [error, setError] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [selectedDay, setSelectedDay] = useState(0)
  const [formData, setFormData] = useState<DayData>({})
  const [loading, setLoading] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [lastEntry, setLastEntry] = useState<DayData | null>(null)
  const [editingDate, setEditingDate] = useState<string | null>(null)
  const [openExercises, setOpenExercises] = useState<{ [exercise: string]: boolean }>({})

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
        entries.push({ date: docSnap.id, data: docSnap.data() as DayData })
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
    const first = routine[selectedDay].exercises[0]
    setOpenExercises({ [first]: true })
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

  const handleInputChange = (exercise: string, field: keyof ExerciseEntry, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [exercise]: {
        ...prev[exercise],
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
    for (const ex of routine[selectedDay].exercises) {
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
              {routine[selectedDay].exercises.map((exercise, idx) => {
                const entry = formData[exercise] || { weight: '', reps: '', failure: false, comments: '' }
                const last = lastEntry?.[exercise]
                const isOpen = openExercises[exercise] || false
                return (
                  <div key={exercise} className="exercise-entry" style={{ position: 'relative' }}>
                    <h3 className="exercise-title" style={{ margin: 0, minWidth: '100%', textAlign: 'center' }}>{exercise}</h3>
                    <button
                      type="button"
                      className="collapse-toggle"
                      aria-label={isOpen ? `Collapse ${exercise}` : `Expand ${exercise}`}
                      onClick={() => setOpenExercises((prev) => ({ ...prev, [exercise]: !isOpen }))}
                      style={{
                        width: 'fit-content',
                        position: 'absolute',
                        right: '1rem',
                        top: '0.5rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'inherit',
                        padding: '0.25em 0.5em',
                        fontSize: '1.2em',
                        lineHeight: 1,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ display: 'inline-block', transition: 'transform 0.2s', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                        ▶
                      </span>
                    </button>
                    {isOpen && (
                      <div className="exercise-fields">
                        <label>
                          Weight (kg/lb):
                          <input
                            type="text"
                            value={entry.weight}
                            onChange={(e) => handleInputChange(exercise, 'weight', e.target.value)}
                          />
                          {last && last.weight && (
                            <span className="last-info">Last: {last.weight}</span>
                          )}
                        </label>
                        <label>
                          Reps:
                          <input
                            type="number"
                            value={entry.reps}
                            onChange={(e) => handleInputChange(exercise, 'reps', e.target.value)}
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
                            onChange={(e) => handleInputChange(exercise, 'failure', e.target.checked)}
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
                            onChange={(e) => handleInputChange(exercise, 'comments', e.target.value)}
                          />
                          {last && last.comments && (
                            <span className="last-info">Last: {last.comments}</span>
                          )}
                        </label>
                      </div>
                    )}
                  </div>
                )
              })}
              <button type="submit" disabled={loading}>{editingDate ? 'Update Entry' : 'Save Progress'}</button>
              {editingDate && <button type="button" onClick={handleCancelEdit}>Cancel Edit</button>}
              {saveMsg && <span className="save-msg">{saveMsg}</span>}
            </form>
          )}
          {history.length > 0 && (
            <div className="history">
              <h3>Previous Entries</h3>
              <table>
                <thead className="history-thead">
                  <tr>
                    <th>Date</th>
                    {routine[selectedDay].exercises.map(ex => (
                      <th key={ex}>{ex}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.date}>
                      <td data-label="Date">{h.date}</td>
                      {routine[selectedDay].exercises.map(ex => (
                        <td key={ex} data-label={ex}>
                          {h.data[ex]?.weight || ''}kg, {h.data[ex]?.reps || ''} reps, {h.data[ex]?.failure ? 'Fail' : ''} {h.data[ex]?.comments || ''}
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
