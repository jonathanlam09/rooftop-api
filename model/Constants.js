const BaseModel = require('./BaseModel');

module.exports = class Constants extends BaseModel {
    static TABLENAME = 'constants';

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
            name: {
                type: Sequelize.STRING(255),
            },
            constant: {
                type: Sequelize.STRING(255),
            },
            value: {
                type: Sequelize.STRING(255),
            },
            unit: {
                type: Sequelize.STRING(255),
            },
            unit_count: {
                type: Sequelize.INTEGER.UNSIGNED
            },
            date: {
                type: Sequelize.DATE
            },
            active: {
                type: Sequelize.TINYINT(1)
            },
            created_by: {
                type: Sequelize.INTEGER.UNSIGNED
            },
            modified_by: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: true
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            modified_at: {
                type: Sequelize.DATE,
                allowNull: true
            }
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
