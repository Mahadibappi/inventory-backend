const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')


const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "please enter your name"]
        },
        email: {
            type: String,
            required: [true, "please a valid email"],
            unique: true,
            trim: true,
            match: [
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                "Please enter a valid email"
            ],
        },
        password: {
            type: String,
            required: [true, "Please enter a password"],
            minLength: [6, "password must be 6 characters"],

        },
        photo: {
            type: String,
            required: [true, "please enter a photo"],
            default: "https://i.ibb.co/4pDNDk1/avatar.png",
        },
        phone: {
            type: String,
            default: "+088"
        },
        bio: {
            type: String,
            maxLength: [250, "bio should not be more than 250 characters"],
            default: "bio",
        },
    },
    {

        timestamps: true,
    }

);
// password encryption before save
userSchema.pre('save', async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next()
})

const User = mongoose.model("User", userSchema);
module.exports = User;
