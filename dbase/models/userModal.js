const{Model} = require('objection');
const Password = require('objection-password')();

class UserModal extends Password(Model){
    static get tableName(){
        return 'user';
    }
}

module.exports = UserModal;