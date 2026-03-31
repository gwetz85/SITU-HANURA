import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, Lock, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, error } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(username, password);
  };

  return (
    <div className="login-container">
      <div className="login-card glass">
        <div className="login-header">
          <div className="logo-badge">
            <ShieldCheck size={32} color="var(--primary)" />
          </div>
          <h1>SITU HANURA</h1>
          <p>Sistem Informasi Terpadu</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-alert">{error}</div>}
          
          <div className="input-group">
            <User size={18} className="input-icon" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary login-btn">
            Masuk <LogIn size={18} style={{ marginLeft: '8px' }} />
          </button>
        </form>

        <div className="login-footer">
          <p>&copy; 2026 DPC HANURA - Kota Tanjungpinang</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 20px;
        }

        .login-card {
          width: 100%;
          max-width: 400px;
          padding: 2.5rem;
          border-radius: var(--radius-lg);
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: fadeInUp 0.6s ease-out;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo-badge {
          width: 64px;
          height: 64px;
          background: rgba(37, 99, 235, 0.1);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          border: 1px solid rgba(37, 99, 235, 0.2);
        }

        .login-header h1 {
          font-size: 1.8rem;
          font-weight: 800;
          letter-spacing: -0.025em;
          margin-bottom: 0.25rem;
        }

        .login-header p {
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .error-alert {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          padding: 0.8rem;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          text-align: center;
        }

        .input-group {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .input-group input {
          width: 100%;
          padding: 0.8rem 0.8rem 0.8rem 42px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-md);
          color: white;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .input-group input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
        }

        .login-btn {
          width: 100%;
          padding: 0.9rem;
          font-size: 1rem;
          margin-top: 0.5rem;
        }

        .login-footer {
          margin-top: 2rem;
          text-align: center;
          font-size: 0.75rem;
          color: #64748b;
        }
      ` }} />
    </div>
  );
};

export default Login;
