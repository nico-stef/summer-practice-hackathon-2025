import styles from '../styles/addFile.module.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export default function AddFile() {
    const storedUsername = localStorage.getItem('username');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [groups, setGroups] = useState('');

    // const groups = [
    //     { id: '1', name: 'Project Alpha' },
    //     { id: '2', name: 'Project Beta' },
    //     { id: '3', name: 'Project Gamma' }
    // ];

    useEffect(() => {
        const fetchGroups = async () => {
            if (!storedUsername) {
                setError('No username found.');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');
            try {
                const response = await axios.get(`http://localhost:5000/getGroups/${storedUsername}`);
                setGroups(response.data);
            } catch (err) {
                setError('Failed to load files.');
            } finally {
                setLoading(false);
            }
        };

        fetchGroups();
    }, [storedUsername]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!file) {
            setUploadStatus('Please select a file before upload.');
            return;
        }
        if (!selectedGroup) {
            setUploadStatus('Please select the project you want to upload in.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('groupId', selectedGroup);

        if (storedUsername) {
            formData.append('username', storedUsername);
        }

        try {
            const response = await axios.post('http://localhost:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setUploadStatus('Successful added file!');
        } catch (error) {
            setUploadStatus('Error at adding file.');
            console.error(error);
        }
    };

    useEffect(() => {
        console.log(groups)
    }, [groups]);

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

            <div className={styles.homeWrapper}>
                <div className={styles.divAddFile}>
                    <h2 className={styles.uploadTitle}>Upload a file here:</h2>

                    <form onSubmit={handleUpload} className={styles.uploadForm}>
                        <label className={styles.uploadLabel}>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className={styles.fileInput}
                            />
                        </label>

                        <label className={styles.uploadLabel} htmlFor="groupSelect">
                            Select project:
                            <select
                                id="groupSelect"
                                value={selectedGroup}
                                onChange={(e) => setSelectedGroup(e.target.value)}
                                className={styles.groupDropdown}
                            >
                                <option value="">-- Choose a project --</option>
                                {groups && groups.map((group) => (
                                    <option key={group.group_id} value={group.group_id}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <button type="submit" className={styles.uploadButton}>Upload</button>
                    </form>

                    {uploadStatus && (
                        <p className={uploadStatus.includes('Error') ? styles.errorText : styles.successText}>
                            {uploadStatus}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
