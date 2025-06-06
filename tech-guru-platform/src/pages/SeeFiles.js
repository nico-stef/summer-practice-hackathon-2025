import { useState } from 'react';
import styles from '../styles/seeFiles.module.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function SeeFiles() {
    const storedUsername = localStorage.getItem('username');
    const navigate = useNavigate();

    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFiles = async () => {
            if (!storedUsername) {
                setError('No username found.');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');
            try {
                const response = await axios.get(`http://localhost:5000/getMyFiles/${storedUsername}`);
                setFiles(response.data.files);
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
                    <h2 className={styles.seeFilesTitle}>These are the files you ever uploaded</h2>

                    {loading && <p className={styles.loadingText}>Loading files...</p>}
                    {error && <p className={styles.errorText}>{error}</p>}

                    {/* daca nu avem niciun fisier incarcat */}
                    {!loading && !error && files.length === 0 && <p className={styles.noFilesText}>No files found.</p>}

                    <ul className={styles.filesList}>
                        {files.map((file, index) => (
                            <li key={index} className={styles.fileItem}>
                                <Link to={`/file/${file.id}`} className={styles.fileLink}>
                                    <strong>{file.filename}</strong> — uploaded at {new Date(file.uploaded_at).toLocaleString()} — type: {file.extension}
                                </Link>
                            </li>
                        ))}
                    </ul>

                </div>
            </div>


        </div>
    );
}
