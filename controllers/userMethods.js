const User = require('./../dbase/models/userModal')
const setupDb = require('./../dbase/db-setup')
const jwt = require("jsonwebtoken");
const Boom = require('@hapi/boom')
const NodeMailer = require('../nodemailer/nodemailerdemo');
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");

setupDb();

exports.getUser = async (request, h) => {
    try {
        const id = request.params.id;
        const user = await User.query().select('id','name','email','isAdmin','created_at','updated_at').findById(id);
        return user;
    } catch (err) {
        return Boom.badImplementation(err.message);
    }
}

exports.getAllUsers = async (request) => {
    // Future adjustments -> insert isAdmin field to our user table
    // Only admins can make this call -> *DONE
    const secretKey = request.server.settings.app.config.JWT.SECRET_KEY;
    const token = request.headers.authorization;
    // decodifico il token per prelevare il campo isAdmin
    const verified = jwt.verify(token,secretKey);
    if (!(verified.isAdmin)) {
        const message = 'Only an admin can make this call !';
        return Boom.badRequest(message);
    } else {
        try {
            const users = await User.query().select('id','name','email','isAdmin','created_at','updated_at');
            return users;
        } catch (err) {
            return Boom.badImplementation(err.message);
        }
    }
}

exports.saveUser = async (request, h) => {
    const name = request.payload.name;
    const email = request.payload.email;
    try {
        //Checking if a user with the name given already exists
        const isUser = await User.query().first().where('name', name);
        const isEmail = await User.query().first().where('email', email);
        if (isUser == undefined && isEmail == undefined) {
            try {
                const password = request.payload.password;
                const transporter = NodeMailer.transporter;
                const templateStr = fs.readFileSync(path.resolve(__dirname, 'index.hbs')).toString('utf8')
                var template = Handlebars.compile(templateStr)
                let options = {
                    from: "fs_user_node_aubay@hotmail.com",
                    to: email,
                    subject: "This is a verification email !",
                    html: template({message: "hello\n" + email})
                }
                transporter.sendMail(options, function (err, info) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    console.log("Sent_: " + info.response);
                })
                await User.query().insert({
                    name: name,
                    password: password,
                    email: email,
                    isAdmin: false
                });
                //returning a user object
                const returnUser = await User.query().select('id','name','email','isAdmin','created_at','updated_at').where('name', name);
                return returnUser;
            } catch (err) {
                return Boom.badImplementation(err.message);
            }
        } else {
            const message = 'This name,email is already taken, Pick another name'
            return Boom.badRequest(message);
        }
    } catch (err) {
        return Boom.badImplementation(err.message);
    }
}

exports.login = async (request,user,h) => {
    //da aggiungere che il nome deve essere univoco
    try {
        const name = request.payload.name;
        const password = request.payload.password;
        user = await User.query().first().where('name', name);
        const userId = user.id;
        const email = user.email;
        //isAdmin is a boolean field
        const isAdmin = user.isAdmin;
        const passwordValid = await user.verifyPassword(password)
        const secretKey = request.server.settings.app.config.JWT.SECRET_KEY;
        const jwtAlg = request.server.settings.app.config.JWT.ALG;
        const jwtExpiration = request.server.settings.app.config.JWT.EXPIRATION;
        if (!passwordValid) {
            const message = 'Either name or password is incorrect,' +
                ' please check your credentials !';
            return Boom.badRequest(message);
        } else {
            let tokenData = {
                name: name,
                id: userId,
                email: email,
                isAdmin: isAdmin,
                user_created: user.created_at
            }
            let token = jwt.sign(
                tokenData,
                secretKey,
                {
                    algorithm: jwtAlg,
                    expiresIn: jwtExpiration
                }
            );
            let obj2 = {
                userId: userId,
                userName: name,
                email: email,
                isAdmin: isAdmin,
                creationDate: user.created_at,
                updatedDate: user.updated_at,
                jwtToken: token,
                jwtExpiration: jwtExpiration / (60 * 60) + ' hours'
            }
            return obj2;
        }
    } catch (err) {
        const message = "There's no such name in out database," +
            ' please check your credentials !';
        return Boom.badRequest(message);
    }
}

exports.userDetails = async (request, token, h) => {
    token = request.headers.authorization;
    const secretKey = request.server.settings.app.config.JWT.SECRET_KEY;
    //decodifico il token per prelevare l'id con la quale fare la query
    const verified = jwt.verify(token, secretKey);
    const id = verified.id;
    try {
        const user = await User.query().findById(id);
        return user;
    } catch (err) {
        return Boom.badImplementation(err.message);
    }
}

exports.deleteUser = async (request, h) => {
    //create another tuple in our user table with isAdmin field
    //to be able to check if the user is_admin before eliminating any user
    //only a normal user(NOT ADMIN) can delete him/her self
    const requestedId = request.params.id;
    const secretKey = request.server.settings.app.config.JWT.SECRET_KEY;
    const token = request.headers.authorization;
    const verified = jwt.verify(token,secretKey);
    const tokenId = verified.id;
    const userName = verified.name;
    const time = new Date().getTime(); // get your number
    const date = new Date(time); // create Date object

    if (tokenId != requestedId) {
        const message = "You can't modify another user's credentials !," +
            " Please write down your own id";
        return Boom.badRequest(message);
    } else {
        try {
            const userDeleted = await User.query().deleteById(requestedId);
            if (userDeleted != 0) {
                let obj = {
                    userId: requestedId,
                    username: userName,
                    status: 'Deleted',
                    deletionDate: date.toString(),
                }
                return obj;
            } else {
                const errorMessage = 'No such user was found !';
                return Boom.badRequest(errorMessage);
            }
        } catch (err) {
            return Boom.badImplementation(err.message);
        }
    }
}

exports.updateUserName = async (request, h) => {
    //require the id and a new name of the user who wants to change it
    //check if its the same user who's trying to change his name
    //So you have to log in to generate the token that works for you
    const newName = request.payload.name;
    const id = request.params.id;
    const secretKey = request.server.settings.app.config.JWT.SECRET_KEY;
    const token = request.headers.authorization;
    const verified = jwt.verify(token,secretKey);
    const tokenId = verified.id;
    const user = await User.query().findById(id);
    const dbaseName = user.name;
    const isUser = await User.query().first().where('name', newName);
    const time = new Date().getTime(); // get your number
    const date = new Date(time); // create Date object
    if (isUser == undefined) {
        if (tokenId != id) {
            const message = "You can't modify another user's credentials !," +
                " Please write down your own id";
            return Boom.badRequest(message);
        } else {
            try {
                const userUpdated = await User.query().findById(id).patch({
                    name: newName
                });
                if (userUpdated != 0 && dbaseName != newName) {
                    let obj = {
                        userId: id,
                        userOldName: dbaseName,
                        userNewName: newName,
                        status: 'Updated',
                        updatedDate: date.toString(),
                    }
                    return obj;
                } else {
                    const errorMessage = 'Changes cannot be made!'
                    return Boom.badRequest(errorMessage);
                }
            } catch (err) {
                return Boom.badImplementation(err.message);

            }
        }
    } else {
        const errorMessage = 'Name already exists, Choose another !'
        return Boom.badRequest(errorMessage);
    }
}

exports.updateUserPassword = async (request, h) => {
    //require the id and a new password of the user who wants to change it
    //check if its the same user who's trying to change his password
    //check if the old password and the new one don't coincide
    //So you have to log in to generate the token that works for you
    const newPassword = request.payload.password;
    const id = request.params.id;
    const user = await User.query().findById(id);
    const secretKey = request.server.settings.app.config.JWT.SECRET_KEY;
    //Check if the new password is equal to old one
    const samePassword = await user.verifyPassword(newPassword)
    const token = request.headers.authorization;
    const verified = jwt.verify(token,secretKey);
    const tokenId = verified.id;
    const userName = verified.name;
    const time = new Date().getTime(); // get your number
    const date = new Date(time); // create Date object

    if (tokenId != id) {
        const message = "You can't modify another user's credentials !," +
            " Please write down your own id";
        return Boom.badRequest(message);
    } else {
        if (samePassword != true) {
            try {
                await User.query().findById(id).patch({
                    password: newPassword
                });
                let obj = {
                    userId: id,
                    userName: userName,
                    status: 'Updated',
                    updatedDate: date.toString(),
                }
                return obj;
            } catch (err) {
                return Boom.badImplementation(err.message);

            }
        } else {
            const errorMessage = 'You already have this password !' +
                ' Nothing were changed'
            return Boom.badRequest(errorMessage);
        }
    }
}

exports.getView = async (request, h) => {
    try {
        const templateStr = fs.readFileSync(path.resolve(__dirname, 'loginV3.hbs')).toString('utf8')
        var template = Handlebars.compile(templateStr);
        return template()
    } catch (err) {
        return Boom.badImplementation(err.message);
    }
}