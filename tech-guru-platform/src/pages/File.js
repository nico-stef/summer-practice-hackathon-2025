import { useState } from 'react';
import styles from '../styles/seeFiles.module.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CodeEditor from '../components/CodeEditor';


export default function File() {
    const storedUsername = localStorage.getItem('username');
    const navigate = useNavigate();
    const { id } = useParams();
    const [file, setFile] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [code, setCode] = useState('');
    const [newComment, setNewComment] = useState('');
    const [comment, setComment] = useState([]);
    const [addCommentError, setAddCommentError] = useState('');

    const fetchComments = async () => {
            if (!id) {
                setError('No file id found.');
                return;
            }

            try {
                const response = await axios.get(`http://localhost:5000/getComments/${id}`);
                setComments(response.data);

            } catch (err) {
                setError('Failed to load files.');
            } finally {
                setLoading(false);
            }
        };

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
                const response = await axios.get(`http://localhost:5000/getFile/${id}`);
                setFile(response.data.files[0]);

            } catch (err) {
                setError('Failed to load files.');
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
        fetchComments();
    }, [storedUsername]);

    const handleSave = async () => {
        try {
            await axios.put(`http://localhost:5000/updateFile/${id}`, {
                content: code,
            });
            alert('File updated successfully!');
        } catch (error) {
            alert('Failed to update file.');
        }
    };


    useEffect(() => {
        if (file.content) {
            setCode(file.content);
        }
    }, [file]);

    const handleCodeChange = (newCode) => {
        setCode(newCode);
    };

    const handleLogout = () => {
        localStorage.removeItem('username');
        navigate('/login');
    };

    const handleAddComment = async () => {
        try {
            const response = await axios.post(`http://localhost:5000/addComment/${id}`, {
                comment: newComment,
                username: localStorage.getItem("username")
            });
            setComment('');
            if(response.status == 200){
                fetchComments();
            }
        } catch (err) {
            setAddCommentError('Failed to add member.');
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
                    <h2 className={styles.seeFilesTitle}>Selected file:</h2>

                    {loading && <p className={styles.loadingText}>Loading files...</p>}
                    {error && <p className={styles.errorText}>{error}</p>}

                    <div>
                        <h2>{file.filename}</h2>
                        <CodeEditor initialCode={code} onCodeChange={handleCodeChange} />
                    </div>
                    <button onClick={handleSave} className={styles.uploadButton}>Save changes</button>

                </div>

                <div className={styles.commentSection}>
                    <h3>Comments</h3>
                    <ul>
                        {comments.map((comment) => (
                            <li key={comment.id} className={styles.fileItem}>
                                <strong>{comment.nume}:</strong><br />
                                <strong>Created at:</strong> {new Date(comment.created_at).toLocaleString()}<br />
                                {comment.comment}<br />
                            </li>
                        ))}
                    </ul>
                    <div className={styles.commentForm}>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Leave a comment..."
                            className={styles.inputField}
                            rows={4}
                        />
                        <button onClick={handleAddComment} className={styles.uploadButton} style={{ marginTop: '1rem' }}>
                            Submit Comment
                        </button>
                    </div>

                </div>

            </div>


        </div>
    );
}
