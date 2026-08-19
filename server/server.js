const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

const users = [];

//Register
app.post('/api/register', async (req, res) => {
    try {
        const {username, password} = req.body;

        if(!username || !password) {
            return res.status(400).json({
                message: "Username and Password are required"
            });
        }

        const existingUser = users.find((user) => user.username === username);

        if(existingUser) {
            return res.status(409).json({
                message: "User already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = {
            id: users.length + 1,
            username,
            password: hashedPassword

        }

        console.log("Login username:", username);
        console.log("Users:", users);
        console.log("Found user:", user);

        users.push(user)

        res.status(201).json({
            message: "User registered successfully"
        })
    } catch(err) {
        res.status(500).json({
            message: "Server error"
        });
    }
});

//login
app.post('/api/login', async (req, res) => {
    try {
        const {username, password} = req.body;

        const user = users.find((user) => user.username === username);

        if(!user) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if(!passwordMatch) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        //create jwt
        const token = jwt.sign({
            id: user.id,
            username: user.username
        }, 
        JWT_SECRET, 
        {
            expiresIn: '1h'
        })

        res.json({
            message: "Login successful",
            token
        })

    } catch(err) {
        res.status(500).json({
            message: "Server error"
        })
    }

});



//jwt middleware

function authenticateToken(req, res, next) {

const authHeader = req.headers.authorization;


if (!authHeader) {
    return res.status(401).json({
        message: "Access token required"
    });
}

const token = authHeader.split(" ")[1];

if (!token) {
    return res.status(401).json({
        message: "Invalid authorization header"
    });
}

try {

    const decoded = jwt.verify(
        token,
        JWT_SECRET
    );

    req.user = decoded;

    next();

} catch (error) {

    return res.status(403).json({
        message: "Invalid or expired token"
    });
}
}


//protected route
app.get("/api/profile", authenticateToken, (req, res) => {

    res.json({
        message: "You accessed a protected route!",
        user: req.user
    });

});

//server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});