const express = require('express');
const path = require('path');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = 3000;

const config = {
    user: 'jorgefatec',
    password: 'jogoheroivilao1@',
    server: 'jorgefatec.database.windows.net',
    database: 'jorgefatec',
    options: {
        encrypt: true
    }
};

app.use(express.json());

app.use(express.static(path.join(__dirname)));

app.post('/atualizarVida', async (req, res) => {
    const { vidaHeroi, vidaVilao } = req.body;

    try {
        await sql.connect(config);
        const request = new sql.Request();
        await request.query(`
            MERGE INTO Personagens AS target
            USING (VALUES ('heroi', ${vidaHeroi}), ('vilao', ${vidaVilao})) AS source (Nome, Vida)
            ON target.Nome = source.Nome
            WHEN MATCHED THEN
                UPDATE SET Vida = source.Vida
            WHEN NOT MATCHED THEN
                INSERT (Nome, Vida) VALUES (source.Nome, source.Vida);
        `);
        res.status(200).send('Vida do herói e do vilão atualizada com sucesso.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao atualizar a vida do herói e do vilão.');
    }
});

app.get('/characters', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const request = pool.request();

        const heroResult = await request.query("SELECT * FROM Personagens WHERE Nome = 'heroi'");
        const heroi = heroResult.recordset[0];

        const villainResult = await request.query("SELECT * FROM Personagens WHERE Nome = 'vilao'");
        const vilao = villainResult.recordset[0];

        res.json({ heroi, vilao });
    } catch (error) {
        console.error('Erro ao buscar dados do herói e do vilão:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do herói e do vilão.' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/checkUser', async (req, res) => {
    const { email } = req.query;
    try {
        await sql.connect(config);
        const request = new sql.Request();
        const result = await request.input('Email', sql.NVarChar, email)
                                    .query('SELECT * FROM dbo.Usuarios WHERE Email = @Email');
        
        if (result.recordset.length > 0) {
            res.status(200).send({ exists: true, user: result.recordset[0] });
        } else {
            res.status(404).send({ exists: false, message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error checking user' });
    }
});

app.post('/register', async (req, res) => {
    const { nome, email, senha } = req.body;
    try {
        await sql.connect(config);
        const request = new sql.Request();

        const hashedPassword = await bcrypt.hash(senha, 10);

        await request.input('Nome', sql.NVarChar, nome)
                     .input('Email', sql.NVarChar, email)
                     .input('Senha', sql.NVarChar, hashedPassword)
                     .query('INSERT INTO dbo.Usuarios (Nome, Email, Senha) VALUES (@Nome, @Email, @Senha)');

        res.status(201).send({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error registering user' });
    }
});

app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        await sql.connect(config);
        const request = new sql.Request();

        const result = await request.input('Email', sql.NVarChar, email)
                                    .query('SELECT * FROM Usuarios WHERE Email = @Email');

        if (result.recordset.length === 0) {
            return res.status(400).send({ message: 'User not found' });
        }

        const user = result.recordset[0];
        const isMatch = await bcrypt.compare(senha, user.Senha);

        if (!isMatch) {
            return res.status(400).send({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.Id, email: user.Email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.send({ token });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error logging in' });
    }
});

app.get('/acoes', async (req, res) => {
    try {
        await sql.connect(config);
        const request = new sql.Request();
        const result = await request.query('SELECT * FROM Acoes ORDER BY dataHora DESC');
        res.json(result.recordset);
    } catch (error) {
        console.error('Erro ao buscar ações:', error);
        res.status(500).json({ error: 'Erro ao buscar ações.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor Express rodando na porta ${PORT}`);
});
