const fs = require('fs');
const jwt = require('jsonwebtoken');
const path = require('path');
const Config = require("../config/configuration_local");
const User = require('./../dbase/models/userModal')
const setupDb = require('./../dbase/db-setup')

setupDb();

exports.list = async (request, h) => {
    try {
        const config = request.server.settings.app.config
        const path = config.server.dir_path;

        const map1 = new Map();

        const readdir = fs.readdirSync(path);
        readdir.forEach(file => {
            const ext = file
                .split('.').filter(Boolean).slice(1).join('.');
            if (ext === '') {
                map1.set(file, 'Directory');
            } else {
                //Here I need to call the other route (api/info)
                const {birthtime, mtime, ctime} = fs.statSync(path + '\\' + file);
                const map2 = new Map();
                map2.set('Extension', ext);
                map2.set('Created on', birthtime);
                map2.set('File data last modified ', mtime);
                map2.set('File status last modified', ctime);
                const obj = Object.fromEntries(map2);
                map1.set(file, obj);
            }
        });
        const obj = Object.fromEntries(map1);
        return obj;
    } catch (err) {
        throw err;
    }
}

exports.info = async (request, h) => {

    try {
        const config = request.server.settings.app.config
        //Suppongo che si inserisca come parametro (Nome_file + ext)
        const fileRelative = request.payload.path;
        const dirPath = config.server.dir_path;
        const fileNewPath = dirPath + '\\' + fileRelative;
        if (!(fs.existsSync(fileNewPath))) {
            return 'File Not Found !';
        }
        const map1 = new Map();
        const {birthtime, mtime, ctime} = fs.statSync(fileNewPath);
        const ext = fileNewPath
            .split('.').filter(Boolean).slice(1).join('.');
        map1.set('Name', path.basename(fileNewPath));
        map1.set('Extension', ext);
        map1.set('Created on', birthtime);
        map1.set('File data last modified', mtime);
        map1.set('File status last modified', ctime);
        const obj = Object.fromEntries(map1);
        return obj;

    } catch (err) {
        throw err;
    }
}

exports.rename = async (request, h) => {
    //if the original file doesn't exists return an error
    //else if another file with the new name exists
    //return a msg saying 'A file with that name already exists !'
    //else rename the file with the new name 
    //suppongo che entrambe i parametri sono path relativi
    //per poter controllare se esiste o meno un altro file con
    //il nuovo nome passato non posso assumere che sia della stessa
    //estensione del file originale
    try {
        const config = request.server.settings.app.config
        const dirPath = config.server.dir_path;
        const newFileRelative = request.payload.new;
        const originaleFileRelative = request.payload.path;
        const filePath = dirPath + '\\' + originaleFileRelative;
        const newPath = dirPath + '\\' + newFileRelative;

        const ext = filePath
            .split('.').filter(Boolean).slice(1).join('.');
        if (!(fs.existsSync(filePath))) {
            return 'Original File Not Found ! \nKO';
        } else if (fs.existsSync(newPath)) {
            return 'A file with that name already exists ! \nKO';
        }
        fs.renameSync(filePath, newPath);

        return 'File renamed successfully ! \nOK';

    } catch (err) {
        throw err;
    }
}

exports.delete = async (request, h) => {
    //if the original file doesn't exists return an error
    //else remove the file

    try {
        const config = request.server.settings.app.config
        const dirPath = config.server.dir_path;
        const fileRelative = request.payload.path;
        const filePath = dirPath + '\\' + fileRelative;
        if (!(fs.existsSync(filePath))) {
            return 'Original File Not Found ! \nKO';
        }
        fs.unlinkSync(filePath);
        return 'File Deleted Successfully !\nOK'

    } catch (err) {
        throw err;
    }
}

exports.download = async (request, h) => {
    //if the original file doesn't exists return an error msg
    //else download the file
    try {
        const config = request.server.settings.app.config
        const dirPath = config.server.dir_path;
        const fileRelative = request.payload.path;
        const filePath = dirPath + '\\' + fileRelative;
        if (!(fs.existsSync(filePath))) {
            return 'Original File Not Found ! \nKO';
        }
        const {Readable} = require('stream');
        let stream = fs.createReadStream(filePath);
        let streamData = new Readable().wrap(stream);
        return h.response(streamData);

    } catch (err) {
        throw err;
    }
}

exports.upload = async (request, h) => {
    try {
        const config = request.server.settings.app.config
        var data = request.payload;
        var user_path = config.server.dir_path + '\\upload';
        if (data.file) {
            const name = data.file.hapi.filename;
            if (!fs.existsSync(user_path)) {
                try {
                    fs.mkdirSync(user_path, {recursive: true});
                } catch (e) {
                    request.logger.error({function: 'Upload', message: e.message, stack: e.stack})
                }
            }
            user_path += path.sep + name;
            var file = fs.createWriteStream(user_path);
            data.file.pipe(file);
            return 'File uploaded successfully !';
        } else {
            return Boom.badRequest('no payload');
        }
    } catch (err) {
        throw err;
    }
}


exports.upload2 = async (request, h) => {
    try {
        const config = request.server.settings.app.config
        var data = request.payload;
        var user_path = config.server.dir_path + '\\upload';
        if (data.file) {
            const name = data.file.hapi.filename;
            if (!fs.existsSync(user_path)) {
                try {
                    fs.mkdirSync(user_path, {recursive: true});
                } catch (e) {
                    request.logger.error({function: 'Upload', message: e.message, stack: e.stack})
                }
            }
            user_path += path.sep + name;
            var file = fs.createWriteStream(user_path);
            data.file.pipe(file);
            return 'File uploaded successfully !';
        } else {
            return Boom.badRequest('no payload');
        }
    } catch (err) {
        throw err;
    }
}

exports.generateRandom =(length = 32, alphanumeric = true) => {
    let data = '',
        keys = '';
    if (alphanumeric) {
        keys = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    } else {
        keys = '0123456789';
    }
    for (let i = 0; i < length; i++) {
        data += keys.charAt(Math.floor(Math.random() * keys.length));
    }
    return data;
};
exports.getEpochTime= () =>{
    return Math.floor(new Date() / 1000);
}

exports.sign = async (request, tokenSso, config) => {
    let tokenData={

    }
    let token = jwt.sign(
        tokenData,
        Config.JWT.SECRET_KEY,
        { algorithm: Config.JWT.ALG }

    );
    return token;
}

exports.getUser = async (request, h) => {
    try {
        // const id = request.payload.id;
        const user = await User.query().findById(3);
        return user;
    } catch (err) {
        throw err;
    }
}

