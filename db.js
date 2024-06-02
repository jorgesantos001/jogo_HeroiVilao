const sql = require('mssql');

const config = {
    user: 'jorgefatec',
    password: 'jogoheroivilao1@',
    server: 'jorgefatec.database.windows.net',
    database: 'jorgefatec',
    options: {
        encrypt: true, 
        enableArithAbort: true
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to MSSQL');
        return pool;
    })
    .catch(err => console.log('Database Connection Failed! Bad Config: ', err));

module.exports = {
    sql, poolPromise
};
