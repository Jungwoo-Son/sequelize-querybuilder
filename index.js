class QueryBuilder {
    constructor(Repo) {
        this.repo = Repo;
        this.base_function = undefined;
        this.scopes = [];
        this.args = undefined;
    }

    findAll() {
        this.scopes = [];
        this.args = arguments;
        this.base_function = 'findAll';
        return this;
    }
    findOne() {
        this.scopes = [];
        this.args = arguments;
        this.base_function = 'findOne';
        return this;
    }
    findByPk() {
        this.scopes = [];
        this.args = arguments;
        this.base_function = 'findByPk';
        return this;
    }
    create() {
        this.scopes = [];
        this.args = arguments;
        this.base_function = 'create';
        return this;
    }
    upsert() {
        this.scopes = [];
        this.args = arguments;
        this.base_function = 'upsert';
        return this;
    }
    update() {
        this.scopes = [];
        this.args = arguments;
        this.base_function = 'update';
        return this;
    }
    delete() {
        this.scopes = [];
        this.args = arguments;
        this.base_function = 'destroy';
        return this;
    }
    count() {
        this.scopes = [];
        this.args = arguments;
        this.base_function = 'count';
        return this;
    }

    async excute(transaction) {
        const args = Array.from(this.args);
        let flag = false;
        for(const arg of args) {
            if(arg.where) {
                arg.transaction = transaction;
                flag = true;
            }
        }
        if(flag == false) {
            args.push({ transaction });
        }
        return await this.repo.scope(this.scopes.map(scope => {return {method: scope}}))[this.base_function](...args);
    }
}

class QueryBuilderMaker {
    static make(Scopes) {
        const scope_names = Reflect.ownKeys(Scopes.prototype)
            .filter(key => typeof Scopes.prototype[key] === 'function' && key !== 'constructor');

        class NewQueryBuilder extends QueryBuilder{
            constructor() {
                super(Scopes.repo);
            }
        }
        scope_names.forEach(name => {
            Scopes.repo.addScope(name, Scopes.prototype[name]);

            NewQueryBuilder.prototype[name] = function() {
                this.scopes.push([name, ...arguments]);
                return this;
            }
        });
        return NewQueryBuilder;
    }
}


module.exports = QueryBuilderMaker;