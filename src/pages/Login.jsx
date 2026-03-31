import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, Lock, ShieldCheck, UserPlus, ArrowLeft, CheckCircle } from 'lucide-react';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const { login, register, error, setError } = useAuth();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    await login(formData.username, formData.password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Password konfirmasi tidak cocok.');
      return;
    }
    const res = await register(formData.name, formData.username, formData.password);
    if (res) {
      setSuccess(true);
      setFormData({ name: '', username: '', password: '', confirmPassword: '' });
      setTimeout(() => {
        setSuccess(false);
        setIsRegister(false);
      }, 5000);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setSuccess(false);
  };

  return (
    <div className="login-container">
      <div className="login-card glass">
        <div className="login-header">
          <div className="logo-badge">
            <ShieldCheck size={32} color="var(--primary)" />
          </div>
          <h1>SITU HANURA</h1>
          <p>{isRegister ? 'Daftar Akun Baru' : 'Sistem Informasi Terpadu'}</p>
        </div>

        {success ? (
          <div className="success-view">
            <CheckCircle size={48} color="#10b981" />
            <h3>Pendaftaran Berhasil!</h3>
            <p>Akun Anda telah terdaftar. Mohon hubungi Admin untuk pemberian Role (akses aplikasi).</p>
            <button className="btn btn-primary" onClick={toggleMode}>
              Kembali ke Login
            </button>
          </div>
        ) : (
          <form onSubmit={isRegister ? handleRegister : handleLogin} className="login-form">
            {error && <div className="error-alert">{error}</div>}
            
            {isRegister && (
              <div className="input-group">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="name"
                  placeholder="Nama Lengkap"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            <div className="input-group">
              <User size={18} className="input-icon" />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="input-group">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            {isRegister && (
              <div className="input-group">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Konfirmasi Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary login-btn">
              {isRegister ? (
                <>Daftar Akun <UserPlus size={18} style={{ marginLeft: '8px' }} /></>
              ) : (
                <>Masuk <LogIn size={18} style={{ marginLeft: '8px' }} /></>
              )}
            </button>

            <button type="button" className="mode-toggle-btn" onClick={toggleMode}>
              {isRegister ? (
                <><ArrowLeft size={16} /> Sudah punya akun? Login</>
              ) : (
                <>Belum punya akun? Daftar Akun</>
              )}
            </button>
          </form>
        )}

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
          max-width: 420px;
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

        .success-view {
          text-align: center;
          padding: 1rem 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          animation: scaleUp 0.3s ease-out;
        }

        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        .success-view h3 { font-size: 1.25rem; font-weight: 700; color: #10b981; }
        .success-view p { font-size: 0.9rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1rem; }

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
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mode-toggle-btn {
          background: none;
          border: none;
          color: var(--primary);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          opacity: 0.8;
          transition: opacity 0.2s;
        }

        .mode-toggle-btn:hover {
          opacity: 1;
          text-decoration: underline;
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
