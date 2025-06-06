import { useState } from 'react';
import styles from '../styles/register.module.css'; // import corect CSS Module
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', {
        username,
        password
      });

      if (response.status === 200) {
        localStorage.setItem('username', username);
        navigate('/seeFiles');
      }
      setUsername('');
      setPassword('');
    } catch (error) {
      if (error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert('Error login!');
      }
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.divLogin}>
        <h2>Login Page</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              Username:
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>
          </div>

          <div>
            <label>
              Password:
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
          </div>

          <button type="submit">Login</button>
        </form>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          Don't have an account? <Link to="/register">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
