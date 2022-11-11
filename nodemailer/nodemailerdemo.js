const nodeMailer = require('nodemailer')
exports.transporter = nodeMailer.createTransport({
    service: 'hotmail',
    auth:{
        //user(email) the one who sends messages
        user: "Controlla Notion Node js",
        //password for such user(email)
        pass: "Controlla Notion Node js"
    }
});


