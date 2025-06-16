import { formatDateWithDay } from '../../utils/dateUtils.js';
import './LastSessionInfo.css';

type LastSessionInfoProps = {
  day: string;
  date: string;
};

export const LastSessionInfo = ({ day, date }: LastSessionInfoProps) => {
  return (
    <div className="last-session-info">
      Last session: {day} ({formatDateWithDay(date)})
    </div>
  );
}; 