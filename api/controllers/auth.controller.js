import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';

export const signup = async (req, res, next) => {
    const { username, email, password } = req.body;
    
    try{
        const hashedPassword = bcryptjs.hashSync(password, 10);
        const newUser = new User ({ username, email, password: hashedPassword });

        await newUser.save()
        res.status(201).json("User created successfully");
    } catch(error) {
        next(error);
    }   
}

export const signin = async(req, res, next) => {
    const { email, password } = req.body;

    try {
        // email validation
        const validUser = await User.findOne({ email });
        if (!validUser) return next(errorHandler(404, "User Not Found!"));

        // password validation
        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if (!validPassword) return next(errorHandler(401, "Wrong Credentials!"));

        // creating cookie
        const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
        const { password: pass, ...rest} = validUser._doc;
        res
            .cookie('access_token', token, {httpOnly: true, expires: new Date(Date.now() + 24 * 60 * 60 * 1000)})
            .status(200)
            .json(rest);
    } catch (error) {
        next(error);
    }
}

export const google = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET);
            // seperate the password so it will not be sent as response
            const { password: pass, ...rest } = user._doc;
            res
                // save the cookie with the name access token and pass this token that we created, and we set the httpOnly to make it more secure
                .cookie('access_token', token, { httpOnly: true})
                .status(200)
                .json(rest);
        } else {
            // generate a password that is random and numbers from 1-9 and letters a-z and get the last 8 digits
            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
            const newUser = new User({ username: req.body.name.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-4), email: req.body.email, password: hashedPassword, avatar: req.body.photo });

            await newUser.save();
            const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
            const { password: pass, ...rest } = newUser._doc;
            res
                .cookie('access_token', token, { httpOnly: true})
                .status(200)
                .json(rest);
        }
    } catch (error) {
        next(error)
    }
}

export const signOut = async (req, res, next) => {
    try {
        res.clearCookie('access_token');
        res.status(200).json('User has been logged out!');
    } catch (error) {
        next(error)
    }
}