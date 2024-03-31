import express from "express";

import {SignUp, login, updateUser, deleteUser, getUsers, verifyOTP} from '../controllers/authController.js'

// router object
const router = express.Router()

router.post('/SignUp', SignUp);
router.post('/login', login);
router.put('/UpdateUser', updateUser);
router.delete('/DeleteUser', deleteUser);
router.post('/VerifyOTP', verifyOTP);
router.get('/getUsers', getUsers);


export default router;