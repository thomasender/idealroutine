import './RoutineTabs.css';

type RoutineDay = {
  day: string;
  exerciseIds: string[];
};

type RoutineTabsProps = {
  routine: RoutineDay[];
  selectedDay: number;
  onDaySelect: (index: number) => void;
};

export const RoutineTabs = ({ routine, selectedDay, onDaySelect }: RoutineTabsProps) => {
  return (
    <div className="routine-tabs">
      {routine.map((day, idx) => (
        <button
          key={day.day}
          className={selectedDay === idx ? "active" : ""}
          onClick={() => onDaySelect(idx)}
        >
          {day.day}
        </button>
      ))}
    </div>
  );
}; 