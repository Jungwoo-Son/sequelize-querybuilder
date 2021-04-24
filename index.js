class QueryBuilder {
    constructor(Repo) {
        this.repo = Repo;
        this.base_function = undefined;
        this.scopes = [];
    }

    findAll() {
        this.base_function = 'findAll';
        return this;
    }
    findOne() {
        this.base_function = 'findOne';
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