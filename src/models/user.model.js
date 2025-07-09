import { Schema } from "mongoose";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt, { hash } from "bcrypt"

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unquie: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unquie: true,
        lowercase: true,
        trim: true,
    },
    fullname: {
        type: String,
        required: true,
        index: true,
        trim: true,
    },
    avtar: {
        type: String, // cloudanry url we are going to use
        required: true
    },
    coverImage: {
        type: String,
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "video"
        }
    ],
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    refreshToken: {
        type: String
    }
}, {
    timestamps: true
})

UserSchema.pre('save',async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,12);
    next();
})

UserSchema.methods.isCorrectPassword = async function name(password) {
    return await bcrypt.compare(password,this.password)
}
UserSchema.methods.genrateAccessToken = async function name() {
    jwt.sign(
        {
            _id: this.id, // this.id is form database currently we are assiging payload
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

UserSchema.methods.genrateRefreshToken = async function name() {
    jwt.sign(
        {
            _id: this.id, // this.id is form database currently we are assiging payload

        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY
        }
    )
}


export const user = mongoose.model("user", UserSchema)