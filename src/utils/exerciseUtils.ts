import { EXERCISES } from '../data/exercises.js';

export type ExerciseEntry = {
  weight: string;
  reps: string;
  failure: boolean;
  comments: string;
};

export type DayData = {
  [exerciseId: string]: ExerciseEntry;
};

export type HistoryEntry = {
  date: string;
  data: DayData;
};

// Helper function to find exercise ID from old name
export function findExerciseId(oldName: string): string | undefined {
  const normalizedName = oldName.toLowerCase();
  for (const [id, exercise] of Object.entries(EXERCISES)) {
    if (
      exercise.oldNames.some((name) => name.toLowerCase() === normalizedName)
    ) {
      return id;
    }
  }
  return undefined;
}

// Helper function to migrate old data format to new format
export function migrateData(oldData: any): DayData {
  // If the data is already in the new format, return it as is
  if (oldData && typeof oldData === 'object') {
    // Check if it's already in the new format by looking for known exercise IDs
    const hasNewFormat = Object.keys(oldData).some(key => EXERCISES[key]);
    if (hasNewFormat) {
      return oldData as DayData;
    }

    // Otherwise, try to migrate from old format
    const newData: DayData = {};
    for (const [oldName, entry] of Object.entries(oldData)) {
      if (typeof entry === "object" && entry !== null) {
        const exerciseId = findExerciseId(oldName as string);
        if (exerciseId) {
          newData[exerciseId] = entry as ExerciseEntry;
        }
      }
    }
    return newData;
  }
  return {};
} 