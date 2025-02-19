const crypto = require('crypto')
const path = require('path');
const algorithm = 'aes-256-cbc'
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

class Helper {
    static dir = {
        root: path.join(__dirname, '..')
    };

    static encrypt = (text) => {
        let cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }

    static decrypt = (text) => {
        let textParts = text.split(':');
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }

    static sha256 = (text) => {
        const hash = crypto.createHash('sha256');
        var hashValue = hash.update(text, 'utf-8').digest('hex');
        return hashValue;
    }

    static validator = (data) => {
        var ret = {
            status: false,
            message: null
        };
        const keys = Object.keys(data.body);
        for(var i=0;i<keys.length;i++){
            const val = data.body[keys[i]];
            if(data.exclude){
                if(!data.exclude.includes(keys[i])){
                    if(val == ''){
                        ret.var = keys[i][0].toUpperCase() + keys[i].slice(1) + ' cannot be empty!';
                        return ret;
                    }
                }
            }
        }
        ret.status = true;
        return ret;
    }
}

module.exports = Helper
