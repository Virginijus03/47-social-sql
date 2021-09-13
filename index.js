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

    //1 Registruotu vartotoju sarasas, isrikiuotas nuo naujausio link 
    //seniausio. Reikia nurodyti varda, post'u kieki, komentaru kieki ir like'u kieki
    sql = 'SELECT `users`.`id`, `firstname`, \
           COUNT(DISTINCT `posts`.`id`) as posts, COUNT(DISTINCT `comments`.`id`) as comments, COUNT(DISTINCT `posts_likes`.`id`) as likes\
                     FROM `users`\
                LEFT JOIN `posts`\
                     ON `posts`.`user_id` = `users`.`id`\
                LEFT JOIN `comments`\
                     ON `comments`.`user_id` = `users`.`id`\
                LEFT JOIN `posts_likes`\
                     ON `posts_likes`.`user_id` = `users`.`id`\
             GROUP BY `users`.`id`\
             ORDER BY `register_date` DESC';
    [rows] = await connection.execute(sql);
    console.log(`Users: `);
    let i = 0;
    for (let item of rows) {
        console.log(`${++i}. ${upperName(item.firstname)}: posts (${item.posts}), comments (${item.comments}), likes (${item.likes});`);
    }
    console.log('          ');

    //2 Isspausdinti, koki turini turetu matyti Ona (antrasis vartotojas). Irasus pateikti nuo naujausio.
    sql = 'SELECT `users`.`firstname`, `posts`.`text`, `posts`.`date` \
                     FROM `posts` \
                LEFT JOIN `users` \
                     ON `users`.`id` = `posts`.`user_id` \
                LEFT JOIN `friends` \
                     ON `friends`.`friend_id` = `posts`.`user_id` \
             WHERE `friends`.`user_id` = 2\
             ORDER BY `date` DESC';
    [rows] = await connection.execute(sql);
    console.log(`Ona's feed:`);
    for (let { firstname, text, date } of rows) {
        console.log(`--${upperName(firstname)} wrote a post "${text}"(${date})`);
    }
    console.log('          ');

    //4 Isspausdinti, koki turini turetu matyti Ona (antrasis vartotojas). Irasus pateikti nuo naujausio.
    sql = 'SELECT `follow_date`,\
                ( \
                     SELECT `users`.`firstname` \
                     FROM `users` \
                    WHERE `users`.`id` = `friends`.`friend_id` \
                ) as you, \
                 ( \
                     SELECT `users`.`firstname` \
                     FROM `users` \
                    WHERE `users`.`id` = `friends`.`user_id` \
                ) as me \
            FROM `friends`';

    [rows] = await connection.execute(sql);
    let index = 0;
    for (const item of rows) {
        const d = new Date(item.follow_date);
        const dformat = [d.getFullYear(), d.getMonth() + 1, d.getDate()].join('-') + ' ' +
            [d.getHours(), d.getMinutes(), d.getSeconds()].join(':');
        console.log(`${++index}. ${upperName(item.me)} is following ${upperName(item.you)} (since ${dformat});`);
    }
    console.log('          ');

    //5Koks yra like'u naudojamumas. Isrikiuoti nuo labiausiai naudojamo_
    sql = 'SELECT `like_options`.`id`, `like_options`.`text`,\
                    `posts_likes`.`like_option_id`, \
                COUNT(`posts_likes`.`like_option_id`) as panaudota\
            FROM `like_options`\
            LEFT JOIN `posts_likes`\
                     ON `posts_likes`.`like_option_id` = `like_options`.`id`\
            GROUP BY `like_options`.`id`\
            ORDER BY `panaudota` DESC';
    [rows] = await connection.execute(sql);
    console.log(`Like options statistics:`);
    count = 0;
    for (let { text, panaudota } of rows) {

        console.log(`${++count}. ${text} - ${panaudota} time;`);
    }
    console.log('          ');

    //6 Isspausdinti visus komentarus, kuriuose yra nurodytas paieskos tekstas.
    //Jei nieko nerasta, tai parodyti atitinkama pranesima.
    //Visa tai turi buti funkcijos pavidale, 
    //kuri gauna vieninteli parametra - paieskos fraze.
    sql = 'SELECT * ``.``, ``'
    [rows] = await connection.execute(sql);
    console.log(`Comments with search term "nice":`);

}

app.init();

module.exports = app;