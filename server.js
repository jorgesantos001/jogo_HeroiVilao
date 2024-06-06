const express = require('express');
const path = require('path');
const sql = require('mssql');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());

app.post('/atualizarVida', async (req, res) => {
    const { vidaHeroi, vidaVilao } = req.body;

    console.log(`Recebido: vidaHeroi = ${vidaHeroi}, vidaVilao = ${vidaVilao}`);

    try {
        await sql.connect(config);
        const request = new sql.Request();
        const query = `
            MERGE INTO Personagens AS target
            USING (VALUES ('heroi', ${vidaHeroi}), ('vilao', ${vidaVilao})) AS source (Nome, Vida)
            ON target.Nome = source.Nome
            WHEN MATCHED THEN
                UPDATE SET Vida = source.Vida
            WHEN NOT MATCHED THEN
                INSERT (Nome, Vida) VALUES (source.Nome, source.Vida);
        `;
        console.log('Executando query:', query);

        await request.query(query);
        res.status(200).send('Vida do herói e do vilão atualizada com sucesso.');
    } catch (err) {
        console.error('Erro ao atualizar vida:', err);
        res.status(500).send('Erro ao atualizar a vida do herói e do vilão.');
    }
});

app.get('/characters', async (req, res) => {
    try {
        await sql.connect(config);
        const request = new sql.Request();
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

app.listen(PORT, () => {
    console.log(`Servidor Express rodando na porta ${PORT}`);
});
