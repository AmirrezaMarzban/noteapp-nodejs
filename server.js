const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const Note = require('./models/Note')
const User = require('./models/User')
const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
const mongoose = require('mongoose')
const port = 8000

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1:27017/noteapp', (err) => {
    if (!err)
        console.log('DB connection successful')
    else
        console.log('error')
})

// Endpoints to server the html
app.get('/', (req, res) => {
    res.sendFile('pages/index.html', { root: __dirname })
})

app.get('/logout', (req, res) => {
     res.redirect('/')
})

app.get('/about', (req, res) => {
    res.end("about page")
})

app.get('/login', (req, res) => {
    res.sendFile('pages/login.html', { root: __dirname })
})

app.get('/signup', (req, res) => {
    res.sendFile('pages/signup.html', { root: __dirname })
})

//EndPoints for APIs
app.post('/getnotes', verifyToken, async (req, res) => {
    let notes = await Note.find({ email: req.tokenPayload?.email })
    res.status(200).json({ success: true, notes: notes })
})

app.post('/login', async (req, res) => {
    let user = await User.findOne({ email: req.body.email })

    if (!user)
        res.status(200).json({ success: false, message: "no User found" })
    else {
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (validPassword) {
            jwt.sign({ email: user.email }, 'mysecret', { expiresIn: '1h' }, (err, token) => {
                if (!err)
                    res.status(200).json({ success: true, token })
                else
                    console.log(err);
            })
        } else
        res.status(200).json({ success: false, message: "no User found" })
    }
})

app.post('/signup', async (req, res) => {
    const salt = await bcrypt.genSalt(2)
    const hashPassword = await bcrypt.hash(req.body.password, salt)
    let user = await User.create({
        email: req.body.email,
        password: hashPassword
    })
    res.status(200).json({ success: true, user: user })
})

app.post('/addnote', verifyToken, async (req, res) => {
    let n = {
        email: req.tokenPayload?.email,
        title: req.body.title,
        desc: req.body.desc
    }
    let note = await Note.create(n)
    res.status(200).json({ success: true, note })
})

app.post('/deletenote', verifyToken, (req, res) => {
    // Delete
})

app.post('/editnote', verifyToken, (req, res) => {
    // Edit
})

function verifyToken(req, res, next) {
    const token = req.body.token
    if (token != null) {
        jwt.verify(token, 'mysecret', (err, authData) => {
            if (err) {
                res.status(403).json({ message: "Login again" })
            }
            else
                req.tokenPayload = authData
        });
        next()
    } else {
        // Forbidden
        res.status(403).json({ message: "Login again" })
    }
}

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})