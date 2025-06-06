import { useState, useEffect } from 'react';
import styles from '../styles/seeFiles.module.css';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function File() {
  const storedUsername = localStorage.getItem('username');
  const navigate = useNavigate();
  const { id } = useParams();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  

  useEffect(() => {
    const fetchFiles = async () => {
      if (!storedUsername) {
        setError('No username found.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/getGroups/${storedUsername}`);
        setGroups(response.data);
      } catch (err) {
        setError('Failed to load files.');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [storedUsername]);

  const handleLogout = () => {
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div>
      <header className={styles.menu}>
        <Link to="/add" className={styles.menuButton}>Add File</Link>
        <Link to="/seeFiles" className={styles.menuButton}>See Your Files</Link>
        <Link to="/groups" className={styles.menuButton}>Projects</Link>
        <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
      </header>

      <div className={styles.seeFilesWrapper}>
        <div className={styles.seeFilesContainer}>
          {!loading && groups.length === 0 && <p>No groups found.</p>}

          <ul>
            {groups.map((group) => (
              <li key={group.id} className={styles.fileItem}>
                <Link to={`/group/${group.id}/${encodeURIComponent(group.name)}`} className={styles.fileLink}>
                  <strong>{group.name}</strong><br />
                  Joined at: {new Date(group.joined_at).toLocaleString()}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
