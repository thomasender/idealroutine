import { useState, useEffect } from "react";
import { firestore } from "./firebase.js";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { AuthForm } from "./components/Auth/AuthForm.js";
import { HistoryTable } from "./components/History/HistoryTable.js";
import { PageHeader } from "./components/Header/PageHeader.js";
import { LastSessionInfo } from "./components/LastSession/LastSessionInfo.js";
import { RoutineTabs } from "./components/Routine/RoutineTabs.js";
import { RoutineForm } from "./components/Routine/RoutineForm.js";
import { EXERCISES } from "./data/exercises.js";
import { getTodayDate, formatDateWithDay } from "./utils/dateUtils.js";
import { DayData, ExerciseEntry, HistoryEntry, migrateData } from "./utils/exerciseUtils.js";
import { useUser } from "./hooks/useUser.js";
import "./App.css";

const routine = [
  {
    day: "Day 1",
    exerciseIds: ["ex-1", "ex-2", "ex-3", "ex-4", "ex-5"],
  },
  {
    day: "Day 2",
    exerciseIds: ["ex-6", "ex-7", "ex-8", "ex-5", "ex-9", "ex-10"],
  },
  {
    day: "Day 3",
    exerciseIds: ["ex-11", "ex-12", "ex-13", "ex-14", "ex-15", "ex-5"],
  },
  {
    day: "Day 4",
    exerciseIds: ["ex-16", "ex-17", "ex-8", "ex-5"],
  },
];

type ExerciseId = keyof typeof EXERCISES;

function App() {
  const { isAuthenticated, user } = useUser();
  const [selectedDay, setSelectedDay] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [lastEntry, setLastEntry] = useState<DayData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastSessionInfo, setLastSessionInfo] = useState<{
    day: string;
    date: string;
  } | null>(null);

  // Load history and last entry for selected day
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        setHistory([]);
        setLastEntry(null);
        return;
      }
      setLoading(true);
      const dayKey = routine[selectedDay].day;
      const entriesRef = collection(firestore, "progress", user.uid, dayKey);
      const q = query(entriesRef, orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      const entries: HistoryEntry[] = [];
      querySnapshot.forEach((docSnap) => {
        const oldData = docSnap.data();
        const migratedData = migrateData(oldData);
        entries.push({ date: docSnap.id, data: migratedData });
      });
      setHistory(entries);
      setLastEntry(entries[0]?.data || null);
      setLoading(false);
      // Find last session after loading history
      await findLastSession();
    };
    fetchHistory();
  }, [user, selectedDay]);

  // Add this new function to find the last session
  const findLastSession = async () => {
    if (!user) return;

    let mostRecentDate = "";
    let mostRecentDay = "";

    for (const day of routine) {
      const entriesRef = collection(firestore, "progress", user.uid, day.day);
      const q = query(entriesRef, orderBy("date", "desc"), limit(1));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const date = doc.id;

        if (!mostRecentDate || date > mostRecentDate) {
          mostRecentDate = date;
          mostRecentDay = day.day;
        }
      }
    }

    if (mostRecentDate) {
      setLastSessionInfo({
        day: mostRecentDay,
        date: mostRecentDate,
      });
    }
  };

  const handleEdit = (date: string, data: DayData) => {
    // Pass the edit data to the RoutineForm component
    setLastEntry(data);
  };

  const handleSave = async () => {
    // Refresh history after save
    const dayKey = routine[selectedDay].day;
    const entriesRef = collection(firestore, "progress", user!.uid, dayKey);
    const q = query(entriesRef, orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    const entries: HistoryEntry[] = [];
    querySnapshot.forEach((docSnap) => {
      const oldData = docSnap.data();
      const migratedData = migrateData(oldData);
      entries.push({ date: docSnap.id, data: migratedData });
    });
    setHistory(entries);
    setLastEntry(entries[0]?.data || null);
    // Update last session info after saving
    await findLastSession();
  };

  return (
    <div className="App">
      {isAuthenticated ? (
        <div>
          <PageHeader />

          {lastSessionInfo && (
            <LastSessionInfo
              day={lastSessionInfo.day}
              date={lastSessionInfo.date}
            />
          )}

          <RoutineTabs
            routine={routine}
            selectedDay={selectedDay}
            onDaySelect={setSelectedDay}
          />

          <h2>{routine[selectedDay].day}</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <RoutineForm
              userId={user!.uid}
              dayKey={routine[selectedDay].day}
              exerciseIds={routine[selectedDay].exerciseIds}
              lastEntry={lastEntry}
              onSave={handleSave}
            />
          )}
          <HistoryTable 
            history={history}
            exerciseIds={routine[selectedDay].exerciseIds}
            onEdit={handleEdit}
          />
        </div>
      ) : (
        <AuthForm />
      )}
    </div>
  );
}

export default App;
