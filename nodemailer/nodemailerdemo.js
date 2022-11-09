const nodeMailer = require('nodemailer')
exports.transporter = nodeMailer.createTransport({
    service: 'hotmail',
    auth:{
        //user(email) the one who sends messages
        user: "fs_user_node_aubay@hotmail.com",
        //password for such user(email)
        pass: "nodemailerPassword123"
    }
});


