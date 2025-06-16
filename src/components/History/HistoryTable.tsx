import { EXERCISES } from '../../data/exercises.js';
import { formatDateWithDay } from '../../utils/dateUtils.js';
import './HistoryTable.css';

type ExerciseEntry = {
  weight: string;
  reps: string;
  failure: boolean;
  comments: string;
};

type DayData = {
  [exerciseId: string]: ExerciseEntry;
};

type HistoryEntry = {
  date: string;
  data: DayData;
};

type HistoryTableProps = {
  history: HistoryEntry[];
  exerciseIds: string[];
  onEdit: (date: string, data: DayData) => void;
};

export const HistoryTable = ({ history, exerciseIds, onEdit }: HistoryTableProps) => {
  if (history.length === 0) return null;

  return (
    <div className="history">
      <h3>Previous Entries</h3>
      <table>
        <thead className="history-thead">
          <tr>
            <th>Date</th>
            {exerciseIds.map((exerciseId) => (
              <th key={exerciseId}>
                {EXERCISES[exerciseId].name}
              </th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h) => (
            <tr key={h.date}>
              <td data-label="Date">{formatDateWithDay(h.date)}</td>
              {exerciseIds.map((exerciseId) => (
                <td
                  key={exerciseId}
                  data-label={EXERCISES[exerciseId].name}
                >
                  {h.data[exerciseId]?.weight || ""}kg,{" "}
                  {h.data[exerciseId]?.reps || ""} reps,{" "}
                  {h.data[exerciseId]?.failure ? "Fail" : ""}{" "}
                  {h.data[exerciseId]?.comments || ""}
                </td>
              ))}
              <td data-label="Edit">
                <button
                  type="button"
                  onClick={() => onEdit(h.date, h.data)}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 