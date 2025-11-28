import { useState } from 'react';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { useAuthStore } from './store/authStore';

function App() {
  const token = useAuthStore((state) => state.token);
  const [currentPage, setCurrentPage] = useState<'login' | 'register' | 'dashboard'>('login');

  if (token) {
    return <Dashboard />;
  }

  return (
    <div className="auth-container">
      {currentPage === 'login' ? (
        <Login onSwitchToRegister={() => setCurrentPage('register')} />
      ) : (
        <Register onSwitchToLogin={() => setCurrentPage('login')} />
      )}
    </div>
  );
}

export default App;
