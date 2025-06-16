import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import './AuthForm.css';

export const AuthForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const { login, signup, error, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await login(email, password);
    } else {
      await signup(email, password);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>{isLogin ? "Login" : "Sign Up"}</h2>
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
      <button type="submit" disabled={loading}>
        {loading ? "Loading..." : (isLogin ? "Login" : "Sign Up")}
      </button>
      <button 
        type="button" 
        onClick={() => setIsLogin(!isLogin)}
        disabled={loading}
      >
        {isLogin
          ? "Need an account? Sign Up"
          : "Already have an account? Login"}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}; 