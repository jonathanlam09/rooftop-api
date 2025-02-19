const BaseModel = require('./BaseModel');

module.exports = class ConsumerContactForm extends BaseModel {
    static TABLENAME = 'consumer_contact_form';

    static {
        var Sequelize = this.Sequelize;

        this.init({
            // Model attributes are defined here
            id: {
                type: Sequelize.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            fullname: {
                type: Sequelize.TEXT,
            },
            email: {
                type: Sequelize.STRING(255),
            },
            contact: {
                type: Sequelize.STRING(255),
            },
            active: {
                type: Sequelize.TINYINT(1)
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });

        this.beforeValidate((model, options) => {
            if (model.isNewRecord) {
                model.created_at = this.sequelize.literal('NOW()');
            }
        });

        this.beforeUpdate((model, options) => {
            
        });
    }
}
