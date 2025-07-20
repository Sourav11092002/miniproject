const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const userModel = require("./model/user");
const userpost = require("./model/post");
const cookieparser = require("cookie-parser");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieparser());
const bcrypt = require("bcrypt");
const e = require("express");
app.set("view engine", "ejs");


app.get("/", (req, res) => {
    res.render("index");
})
app.get("/profile", isLoggedIn, (req, res) => {
    console.log(req.user);
    res.render("login");
})
app.get("/login", (req, res) => {
    res.render("login");
})
app.post("/register", async (req, res) => {
    let { name, username, email, password, age } = req.body;
    const find = await userModel.findOne({ email });
    if (find) res.send("user exsist");
    else {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, async (err, hash) => {
                //console.log(hash);
                password = hash;
                const created = await userModel.create({ name, username, email, password, age });
            })
        })
        let token = jwt.sign({ email: email }, "secret");
        res.cookie("token", token);

        res.send("registered");
    }

})
app.post("/login", async (req, res) => {
    let { email, password } = req.body;
    const find = await userModel.findOne({ email });
    // console.log(find);
    if (!find) return res.send("something  wrong");
    else {
        bcrypt.compare(password, find.password, (err, result) => {
            if (result) {
                let token = jwt.sign({ email: email }, "secret");
                res.cookie("token", token);
                res.send("login Successfull");
            }
            else {
                res.redirect("/login");
            }
        });
    }

})
function isLoggedIn(req, res, next) {
    const token = req.cookies.token;

    if (!token || token === " ") {
        return res.status(401).send("You must be logged in");
    }

    else {
        const data = jwt.verify(token, "secret");
        req.user = data;
        next(); // move this inside the try block
    }
}

app.get("/logout", (req, res) => {
    res.cookie("token", " ");
    res.redirect("/login");
})
app.get("/cookie", (req, res) => {
    console.log(req.cookies);
    res.send("done");
})
app.listen(3000, (err) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log("server started");
    }
})