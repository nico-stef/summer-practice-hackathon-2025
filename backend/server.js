// server.js
const express = require("express");
const cors = require("cors");
const connection = require('./database');
const usefulFunctions = require("./queryFunctions");
const queryAsync = usefulFunctions.queryAsync;
const bcrypt = require('bcrypt');


const app = express();
app.use(cors());
app.use(express.json());

app.get("/projects", (req, res) => {
    res.json(projects);
});

app.post("/register", async (req, res) => {
    const { username, password, name } = req.body;
    const saltRounds = 10;
    var hashedPassword = '';

    if (!username || !password || !name) {
        return res.status(400).json({ error: 'Toate campurile sunt obligatorii!' });
    };

    //check if user with the same username already exists
    const query1 = `SELECT * FROM users WHERE username = ?;`;
    const data1 = [username];

    const result = await usefulFunctions.queryAsync(query1, data1);
    if (result.length > 0)
        return res.status(500).json({ message: 'User with this username already exists' }); //code 500- issue on server side

    //continue with generating hashed password
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        hashedPassword = await bcrypt.hash(password, salt);
    } catch (e) {
        console.log("Eroare la hashing parola: ", e);
        return res.status(500).send('Eroare la criptarea parolei');  // return aici
    }

    try {
        const data = [username, hashedPassword, name];
        const query = `INSERT INTO users (username, password, nume) VALUES(?, ?, ?);`;

        await queryAsync(query, data);
        return res.status(200).json({ message: 'Înregistrare realizată cu succes!' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'A apărut o eroare la înregistrare.' });
    }

});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    let hashedPassword = '';

    if (!username || !password) {
        return res.status(400).json({ error: 'Campurile sunt goale!' }); //400 code- client error
    };

    const query = `SELECT * FROM users WHERE username = ?;`;
    const data = [username];

    const result = await queryAsync(query, data);
    if (result.length === 0)
        return res.status(500).json({ message: 'User does not exist' });

    hashedPassword = result[0].password;//result returneaza un array de obiecte asa ca luam primul obiect(si singurul)

    const equalPasswords = await bcrypt.compare(password, hashedPassword);

    if (!equalPasswords) {
        return res.status(401).json({ message: 'Incorrect password' });
    }

    return res.status(200).json({
        message: 'Login successful!',
        username: username
    });
});

//incarcare fisiere
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs/promises');

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const { username, groupId } = req.body;
        if (!username) {
            return res.status(400).json({ error: 'Username missing' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const userQuery = 'SELECT idusers FROM users WHERE username = ?;';
        const userResult = await queryAsync(userQuery, [username]);

        if (userResult.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userId = userResult[0].idusers;

        const content = await fs.readFile(req.file.path, 'utf8');
        if (!content) {
            return res.status(400).json({ message: 'Empty file uploaded' });
        }

        const filename = req.file.originalname;

        // extragem extensia
        const extension = filename.includes('.') ? filename.split('.').pop().toLowerCase() : ''; //pop ia ultimul element din array

        const insertQuery = `INSERT INTO files (filename, content, userId, extension, id_group) VALUES (?, ?, ?, ?, ?);`;
        await queryAsync(insertQuery, [filename, content, userId, extension, groupId]);

        await fs.unlink(req.file.path);

        return res.status(200).json({ message: 'File uploaded', filename, extension });
    } catch (err) {
        console.error('Upload failed:', err);
        return res.status(500).json({ error: 'Upload failed' });
    }
});

app.get('/getMyFiles/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const userQuery = 'SELECT idusers FROM users WHERE username = ?';
        const userResult = await queryAsync(userQuery, [username]);
        if (userResult.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userId = userResult[0].idusers;
        const filesQuery = 'SELECT id, filename, uploaded_at, extension FROM files WHERE userId = ? ORDER BY uploaded_at DESC';
        const files = await queryAsync(filesQuery, [userId]);
        res.json({ files });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/getFile/:idFile', async (req, res) => {
    const { idFile } = req.params;
    try {

        const filesQuery = 'SELECT * FROM files WHERE id = ?';
        const files = await queryAsync(filesQuery, [idFile]);
        res.json({ files });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/getGroups/:username', async (req, res) => {
    const { username } = req.params;
    try {

        const userQuery = 'SELECT idusers FROM users WHERE username = ?';
        const userResult = await queryAsync(userQuery, [username]);
        if (userResult.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userId = userResult[0].idusers;

        const filesQuery = 'SELECT * FROM project_group pg LEFT JOIN group_members gm ON pg.id = gm.group_id WHERE gm.user_id = ?';
        const response = await queryAsync(filesQuery, [userId]);
        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/getFiles/:idGroup', async (req, res) => {
    const { idGroup } = req.params;
    try {
        console.log(idGroup)
        const filesQuery = 'SELECT id, filename, uploaded_at, extension FROM files WHERE id_group = ?';
        const response = await queryAsync(filesQuery, [idGroup]);
        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/updateFile/:id', async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    if (typeof content !== 'string') {
        return res.status(400).json({ message: 'Invalid content' });
    }

    try {
        const updateQuery = 'UPDATE files SET content = ? WHERE id = ?';
        const result = await queryAsync(updateQuery, [content, id]);

        if (result.length === 0) {
            return res.status(404).json({ message: 'File not found' });
        }

        res.json({ message: 'File updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/addMember/:idGroup', async (req, res) => {
    const { idGroup } = req.params;
    const { username } = req.body;
    try {
        //cautam iduser pt username-ul trimis
        const userQuery = 'SELECT idusers FROM users WHERE username = ?';
        const userResult = await queryAsync(userQuery, [username]);
        if (userResult.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userId = userResult[0].idusers;

        const filesQuery = 'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)';
        const response = await queryAsync(filesQuery, [idGroup, userId]);
        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/addComment/:idFile', async (req, res) => {
    const { idFile } = req.params;
    const { username, comment } = req.body;
    try {
        //cautam iduser pt username-ul trimis
        const userQuery = 'SELECT idusers FROM users WHERE username = ?';
        const userResult = await queryAsync(userQuery, [username]);
        if (userResult.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userId = userResult[0].idusers;

        const insertCommentQuery = 'INSERT INTO comments (file_id, user_id, comment) VALUES (?, ?, ?)';
        const response = await queryAsync(insertCommentQuery, [idFile, userId, comment]);
        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/getComments/:idFile', async (req, res) => {
    const { idFile } = req.params;
    try {

        const query = 'SELECT c.comment, c.created_at, u.nume FROM comments c JOIN users u ON u.idusers = c.user_id WHERE file_id = ?';
        const response = await queryAsync(query, [idFile]);
        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.listen(5000, () => console.log("Serverul rulează pe portul 5000"));
