const { Sequelize, Model, DataTypes  } = require('sequelize');

const sequelize = new Sequelize('snippet_test', 'root', 'EKA5LjsulQIXGhCEV2Hi', {
    define: {
        freezeTableName: true,
        timestamps: false,

    },
    host: 'snippet.ctacnk0lszte.ap-northeast-2.rds.amazonaws.com',
    dialect: 'mysql',
    logging: false,
});


async function loadDatabase() {
    try {
        await sequelize.authenticate();    
    } catch (error) {
        throw error;
    }
}


class UserRepo extends Model { }
UserRepo.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    }
}, {
    sequelize,
    tableName: 'user'
});

class CodeSequelizeRepo extends Model { }
CodeSequelizeRepo.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING(256),
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT(65535),
        allowNull: false
    },
    language: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT(65535),
        allowNull:true
    },
    author_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    created_datetime: {
        type: DataTypes.DATE,
    }
    }, 
    {
    sequelize,
    tableName: 'code'
});


class QueryModel {
    constructor(Repo) {
        this.repo = Repo;
        this.base_function = undefined;
        this.scopes = [];
    }

    findAll() {
        this.base_function = 'findAll';
        return this;
    }
    findPk() {
        this.base_function = 'findPk';
    }
    create() {
        this.base_function = 'create';
    }
    update() {
        this.base_function = 'update';
    }
    delete() {
        this.base_function = 'delete';
    }

    async excute() {
        return await this.repo.scope(this.scopes.map(scope => {return {method: scope}}))[this.base_function](...arguments);
    }
}

class QueryModelDecorator {
    static makeQueryModelObject(CustomQueryModel) {
        const scope_names = Reflect.ownKeys(CustomQueryModel.prototype)
            .filter(key => typeof CustomQueryModel.prototype[key] === 'function' && key !== 'constructor');

        class NewQueryModel extends QueryModel{
            constructor() {
                super(CustomQueryModel.repo);
            }
        }
        scope_names.forEach(name => {
            CustomQueryModel.repo.addScope(name, CustomQueryModel.prototype[name]);

            NewQueryModel.prototype[name] = function() {
                this.scopes.push([name, ...arguments]);
                return this;
            }
        });
        return NewQueryModel;
    }
}

class CodeQueryModel {
    static repo = CodeSequelizeRepo;
    filterId(id) {
        return {
            where: {
                id
            }
        };
    }


}

CodeQueryModel = QueryModelDecorator.makeQueryModelObject(CodeQueryModel);

(async () => {
    const query = new CodeQueryModel();
                        new UserQueryModel();
    const codes = await query.findAll().selectName().filterId(2).excute();
    console.log(codes);
    await sequelize.close();
    
})();

