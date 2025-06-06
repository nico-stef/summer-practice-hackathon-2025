import { useState } from 'react';
import styles from '../styles/register.module.css';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function SignUp() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/register', {
                username,
                password,
                name
            });

            alert('Successful register!');
            setUsername('');
            setPassword('');
            setName('');
        } catch (error) {
            if (error.response.data && error.response.data.message) {
                alert(error.response.data.message);
            } else {
                alert('Error register!');
            }
        }
    };

    return (
        <div className={styles.loginWrapper}>
            <div className={styles.divLogin}>
                <h2>Register Page</h2>
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

                    <div>
                        <label>
                            Tell us your name:
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </label>
                    </div>

                    <button type="submit">Register</button>
                </form>
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    Already have an account? <Link to="/login">Login</Link>
                </div>
            </div>
        </div>
    );
}
