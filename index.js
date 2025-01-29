const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");
const express = require("express");
const app = express();
const port = 8080;
const methodOverride = require("method-override");

app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const connection = mysql.createConnection({
    host: `localhost`,
    user: `root`,
    database: `practice_app`,
    password: `apnatanuj`
});

const createRandomUser = () => {
    return [
        faker.string.uuid(),
        faker.internet.username(), // before version 9.1.0, use userName()
        faker.internet.email(),
        faker.internet.password(),
    ];
}

// let q = `INSERT INTO user (id , user, username ,password) VALUES ?`;
// let users = [];

// for(let i=1; i<=100; i++){
//     users.push(createRandomUser());
// };

// try{
//     connection.query(q, [users], (err, result) => {
//         if(err) throw err;
//         console.log(result);
//     });
// }catch(err){
//     console.log(err);
// }

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

app.get("/", (req, res) => {
    let q = `SELECT count(*) FROM user`;

    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let count = result[0]['count(*)'];

            res.render("count.ejs", { count });
        });
    } catch (err) {
        console.log(err);
    }
});

app.get("/user", (req, res) => {
    let q = `SELECT * FROM user`;

    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let users = result;
            res.render("home.ejs", { users, });
        });
    } catch (err) {
        console.log(err);
        res.send("Error in DB");
    }
});

app.get("/user/:id/edit", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id = '${id}'`;

    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];

            res.render("edit.ejs", { user });
        });
    } catch (err) {
        console.log(err);
        res.send("Error in DB");
    }
});

app.patch("/user/:id", (req, res) => {
    let { id } = req.params;
    let { user: newUser, password: newPassword } = req.body;
    console.log("pass:", newPassword);

    let q = `SELECT * FROM user WHERE id = '${id}'`;

    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];

            if (newPassword != user.password) {
                res.send("Wrong password");
            } else {
                let q2 = `UPDATE user SET user = '${newUser}' WHERE id = '${id}'`;

                connection.query(q2, (err, result) => {
                    if (err) throw err;
                    console.log(result);

                    res.redirect("/user");
                });
            }
        });
    } catch (err) {
        console.log(err);
    }
});

app.get("/user/new", (req, res) => {
    res.render("new.ejs");
});

app.post("/user/new", (req, res) => {
    let { id, user, username, password } = req.body;
    let q = `INSERT INTO user (id, user, username, password) VALUES (?,?,?,?)`;
    let newUser = [id, user, username, password];

    try {
        connection.query(q, newUser, (err, result) => {
            if (err) throw err;
            console.log(result);

            res.redirect("/user");
        });
    } catch (err) {
        console.log(err);
        res.send("Some error in DB");
    }
});

app.get("/user/:id", (req, res) => {
    let { id } = req.params;
    res.render("delete.ejs", { id });
});

app.delete("/user/:id", (req, res) => {
    let { id } = req.params;
    let { password } = req.body;

    let q = `SELECT * FROM user WHERE id = '${id}'`;

    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];

            if (password != user.password) {
                res.send("Wrong password");
            } else {
                let q2 = `DELETE FROM user WHERE password = '${user.password}'`;

                connection.query(q2, (err, result) => {
                    if (err) throw err;
                    console.log(result);

                    res.redirect("/user");
                });
            }
        })
    } catch (err) {
        console.log(err);
        res.send("Error In DB");
    }
});

app.get("/user/:id/show", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id = '${id}'`;

    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];

            res.render("show.ejs", { user });
        });
    } catch (err) {
        console.log(err);
        res.send("Error in DB");
    }
});