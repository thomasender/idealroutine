import { useState } from 'react';
import { EXERCISES } from '../../data/exercises.js';
import { useExerciseTracking } from '../../hooks/useExerciseTracking.js';
import { DayData } from '../../utils/exerciseUtils.js';
import './RoutineForm.css';

type RoutineFormProps = {
  userId: string;
  dayKey: string;
  exerciseIds: string[];
  lastEntry: DayData | null;
  onSave: () => void;
};

export const RoutineForm = ({ userId, dayKey, exerciseIds, lastEntry, onSave }: RoutineFormProps) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const {
    formData,
    loading,
    saveMsg,
    editingDate,
    lastEntry: hookLastEntry,
    handleInputChange,
    handleCancelEdit,
    handleSave,
  } = useExerciseTracking({
    userId,
    dayKey,
    exerciseIds,
    lastEntry,
    onSave,
  });

  const handleNextExercise = () => {
    if (currentExerciseIndex < exerciseIds.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex((prev) => prev - 1);
    }
  };

  const currentExerciseId = exerciseIds[currentExerciseIndex];
  const isFirstExercise = currentExerciseIndex === 0;
  const isLastExercise = currentExerciseIndex === exerciseIds.length - 1;

  const exercise = EXERCISES[currentExerciseId];
  const entry = formData[currentExerciseId] || {
    weight: "",
    reps: "",
    failure: false,
    comments: "",
  };
  const last = hookLastEntry?.[currentExerciseId];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
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
          Exercise {currentExerciseIndex + 1} of {exerciseIds.length}
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

      <div className="exercise-entry">
        <div className="exercise-header">
          <h3 className="exercise-title">{exercise.name}</h3>
          <div className="rep-goal">
            Rep Goal: {exercise.repGoal}
          </div>
        </div>
        <div className="exercise-fields">
          <label>
            Weight (kg/lb):
            <input
              type="number"
              min="0"
              step="0.5"
              value={entry.weight}
              onChange={(e) =>
                handleInputChange(
                  currentExerciseId,
                  "weight",
                  e.target.value,
                )
              }
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
              onChange={(e) =>
                handleInputChange(
                  currentExerciseId,
                  "reps",
                  e.target.value,
                )
              }
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
              onChange={(e) =>
                handleInputChange(
                  currentExerciseId,
                  "failure",
                  e.target.checked,
                )
              }
            />
            {last && (
              <span className="last-info">
                Last: {last.failure ? "Yes" : "No"}
              </span>
            )}
          </label>
          <label>
            Comments:
            <input
              type="text"
              value={entry.comments}
              onChange={(e) =>
                handleInputChange(
                  currentExerciseId,
                  "comments",
                  e.target.value,
                )
              }
            />
            {last && last.comments && (
              <span className="last-info">
                Last: {last.comments}
              </span>
            )}
          </label>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {editingDate ? "Update Entry" : "Save Progress"}
        </button>
        {editingDate && (
          <button type="button" onClick={handleCancelEdit}>
            Cancel Edit
          </button>
        )}
        {saveMsg && <span className="save-msg">{saveMsg}</span>}
      </div>
    </form>
  );
}; 