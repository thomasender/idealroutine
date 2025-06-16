import { useUser } from '../../hooks/useUser.js';
import './PageHeader.css';

export const PageHeader = () => {
  const { email, logout, isLoading } = useUser();

  return (
    <div className="page-header">
      <h1>Mentzer Tracker</h1>
      <div className="user-info">
        <p>Welcome, {email}!</p>
        <button 
          onClick={logout} 
          className="logout-button"
          disabled={isLoading}
        >
          {isLoading ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </div>
  );
}; 