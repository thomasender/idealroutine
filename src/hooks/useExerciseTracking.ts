import { useState } from 'react';
import { firestore } from '../firebase.js';
import { doc, setDoc } from 'firebase/firestore';
import { DayData } from '../utils/exerciseUtils.js';
import { getTodayDate } from '../utils/dateUtils.js';

type UseExerciseTrackingProps = {
  userId: string;
  dayKey: string;
  exerciseIds: string[];
  lastEntry: DayData | null;
  onSave: () => void;
};

export const useExerciseTracking = ({
  userId,
  dayKey,
  exerciseIds,
  lastEntry,
  onSave,
}: UseExerciseTrackingProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [editingDate, setEditingDate] = useState<string | null>(null);

  const handleInputChange = (
    exerciseId: string,
    field: string,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [field]: value,
      },
    }));
  };

  const handleCancelEdit = () => {
    setEditingDate(null);
    setFormData({});
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveMsg('');

    try {
      const dayData: DayData = {};
      exerciseIds.forEach((exerciseId) => {
        dayData[exerciseId] = formData[exerciseId] || {
          weight: "",
          reps: "",
          failure: false,
          comments: "",
        };
      });

      const dateToSave = editingDate || getTodayDate();
      const docRef = doc(firestore, "progress", userId, dayKey, dateToSave);
      await setDoc(docRef, {
        ...dayData,
        date: dateToSave,
      });

      setSaveMsg('Progress saved successfully!');
      onSave();
      setEditingDate(null);
      setFormData({});
    } catch (error) {
      console.error('Error saving progress:', error);
      setSaveMsg('Error saving progress. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    saveMsg,
    editingDate,
    lastEntry,
    handleInputChange,
    handleCancelEdit,
    handleSave,
  };
}; 