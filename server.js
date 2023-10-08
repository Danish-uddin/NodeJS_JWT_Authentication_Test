const express = require('express')
const app = express()

const jwt = require('jsonwebtoken');
//const exjwt = require('express-jwt');
const { expressjwt: exjwt } = require('express-jwt');

const bodyParser = require('body-parser');
const path = require('path');



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization');
    next();
});

const port = 3000

const secretKey = 'My super secret key';
const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256']
});


let users = [
   {
        id: 1,
        username: 'user1',
        password: '123'
   },
   {
        id: 2,
        username: 'user2',
        password: '456'
   }
];

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
  })


app.get('/api/dashboard', jwtMW, (req, res) => {
    console.log(req);
    res.json({
        success: true,
        myContent: 'Secret content that only logged in people can see.'
    });
});

app.get('/api/prices', jwtMW , (req,res) => {
    res.json({
        success: true,
        myContent:'This is the price $3.99'
    });
});

app.use(function (err, req, res, next) {
    //console.log(err.name === 'UnauthorizedError');
    //console.log(err);
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            officialError: err,
            err: 'Username or password is incorrect 2'
        });
    }
    else {
        next(err);
    }
});    

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    //console.log('This is me', username, password);
    //res.json({ data: 'it works' });

    for (let user of users) {
        if (username == user.username && password == user.password) {
            let token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '7d'});
            res.json({
                success: true,
                err: null,
                token
            });
            break;
        }
        else {
            res.status(401).json({
                success: false,
                token: null,
                err: 'Username or password is incorrect'
            });
        }
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })