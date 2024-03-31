import express from 'express'
import dotenv from 'dotenv';
import ConnectDB from './config/db.js';
import authRoutes from './routes/auth.js'

dotenv.config();

ConnectDB();

const PORT = process.env.PORT;

const app = express();

app.use(express.json())


// Test route, checking our application working fine
app.get('/', (req, res) => {
    return res.send({
        message: 'Authentication API !!!!'
    })
})

app.use('/api/v1/auth', authRoutes)

// Listining our application on PORT from env file
app.listen(PORT, () => {
    console.log('App running on ' + PORT);
})