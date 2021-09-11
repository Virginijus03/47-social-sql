const mysql = require('mysql2/promise');

const app = {}

app.init = async () => {
    // prisijungti prie duomenu bazes
    const connection = await mysql.createConnection({   //[rows = [], felds = []]
        host: 'localhost',
        user: 'root',
        database: 'social',
    });

    let sql = '';
    let rows = [];

    function upperName(str) {
        return str[0].toUpperCase() + str.slice(1);
    }

    console.log('       ');

    sql = 'SELECT * FROM `friends`';
    [rows] = await connection.execute(sql);
    console.log(rows);

}

app.init();

module.exports = app;