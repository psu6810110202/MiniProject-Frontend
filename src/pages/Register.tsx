import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'; // ใช้ CSS ร่วมกับ Login

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน (Passwords do not match)');
      return;
    }

    setLoading(true);

    try {
      // ยิง API ไปที่ Backend
      const response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: formData.username, 
          password: formData.password,
          email: formData.email 
        }),
      });

      if (!response.ok) {
        throw new Error('Registration Failed');
      }

      alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
      navigate('/login');

    } catch (err) {
      setError('เกิดข้อผิดพลาด หรือชื่อผู้ใช้นี้ถูกใช้ไปแล้ว');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Create Account</h1>
        <p className="login-subtitle">Join FandomShip today</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input name="username" type="text" className="form-input" required onChange={handleChange} />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email</label>
            <input name="email" type="email" className="form-input" required onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input name="password" type="password" className="form-input" required onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input name="confirmPassword" type="password" className="form-input" required onChange={handleChange} />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="toggle-link">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;