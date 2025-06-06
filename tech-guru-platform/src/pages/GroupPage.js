import { useState } from 'react';
import styles from '../styles/seeFiles.module.css';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function GroupPage() {
    const { groupId, groupName } = useParams();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const storedUsername = localStorage.getItem('username');
    const navigate = useNavigate();
    const [newMemberUsername, setNewMemberUsername] = useState('');
    const [addMemberError, setAddMemberError] = useState('');
    const [addMemberSuccess, setAddMemberSuccess] = useState('');

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
                const response = await axios.get(`http://localhost:5000/getFiles/${groupId}`);
                setFiles(response.data);
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

    const handleAddMember = async () => {
        if (newMemberUsername) {
            setAddMemberError('Please enter a username.');
            setAddMemberSuccess('');
            return;
        }
        setAddMemberError('');
        try {
            await axios.post(`http://localhost:5000/addMember/${groupId}`, {
                groupId,
                username: newMemberUsername
            });
            setAddMemberSuccess(`User "${newMemberUsername.trim()}" added successfully!`);
            setNewMemberUsername('');
        } catch (err) {
            setAddMemberError('Failed to add member.');
            setAddMemberSuccess('');
        }
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
                    <h2 className={styles.seeFilesTitle}>The files in the project "{groupName}"</h2>

                    <ul className={styles.filesList}>
                        {files.map((file, index) => (
                            <li key={index} className={styles.fileItem}>
                                <Link to={`/file/${file.id}`} className={styles.fileLink}>
                                    <strong>{file.filename}</strong> — uploaded at {new Date(file.uploaded_at).toLocaleString()} — type: {file.extension}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div style={{ marginTop: '2rem' }}>
                        <h3>Add a member to this project</h3>
                        <input
                            type="text"
                            placeholder="Enter username"
                            value={newMemberUsername}
                            onChange={(e) => setNewMemberUsername(e.target.value)}
                            className={styles.inputField}
                        />
                        <button onClick={handleAddMember} className={styles.uploadButton} style={{ marginLeft: '10px' }}>
                            Add Member
                        </button>
                        {addMemberError && <p style={{ color: 'red' }}>{addMemberError}</p>}
                        {addMemberSuccess && <p style={{ color: 'green' }}>{addMemberSuccess}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
