"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = void 0;
var typeorm_1 = require("typeorm");
var Agent = exports.Agent = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('agents')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _id_decorators;
    var _id_initializers = [];
    var _userId_decorators;
    var _userId_initializers = [];
    var _level_decorators;
    var _level_initializers = [];
    var _isAvailable_decorators;
    var _isAvailable_initializers = [];
    var _skills_decorators;
    var _skills_initializers = [];
    var _ticketCapacity_decorators;
    var _ticketCapacity_initializers = [];
    var _currentTickets_decorators;
    var _currentTickets_initializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var Agent = _classThis = /** @class */ (function () {
        function Agent_1() {
            this.id = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _id_initializers, void 0));
            this.userId = __runInitializers(this, _userId_initializers, void 0);
            this.level = __runInitializers(this, _level_initializers, void 0);
            this.isAvailable = __runInitializers(this, _isAvailable_initializers, void 0);
            this.skills = __runInitializers(this, _skills_initializers, void 0);
            this.ticketCapacity = __runInitializers(this, _ticketCapacity_initializers, void 0);
            this.currentTickets = __runInitializers(this, _currentTickets_initializers, void 0);
            this.createdAt = __runInitializers(this, _createdAt_initializers, void 0);
            this.updatedAt = __runInitializers(this, _updatedAt_initializers, void 0);
        }
        return Agent_1;
    }());
    __setFunctionName(_classThis, "Agent");
    (function () {
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _userId_decorators = [(0, typeorm_1.Column)()];
        _level_decorators = [(0, typeorm_1.Column)({ default: 1 })];
        _isAvailable_decorators = [(0, typeorm_1.Column)({ default: true })];
        _skills_decorators = [(0, typeorm_1.Column)('simple-array', { nullable: true })];
        _ticketCapacity_decorators = [(0, typeorm_1.Column)({ default: 5 })];
        _currentTickets_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } } }, _id_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _userId_decorators, { kind: "field", name: "userId", static: false, private: false, access: { has: function (obj) { return "userId" in obj; }, get: function (obj) { return obj.userId; }, set: function (obj, value) { obj.userId = value; } } }, _userId_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _level_decorators, { kind: "field", name: "level", static: false, private: false, access: { has: function (obj) { return "level" in obj; }, get: function (obj) { return obj.level; }, set: function (obj, value) { obj.level = value; } } }, _level_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _isAvailable_decorators, { kind: "field", name: "isAvailable", static: false, private: false, access: { has: function (obj) { return "isAvailable" in obj; }, get: function (obj) { return obj.isAvailable; }, set: function (obj, value) { obj.isAvailable = value; } } }, _isAvailable_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _skills_decorators, { kind: "field", name: "skills", static: false, private: false, access: { has: function (obj) { return "skills" in obj; }, get: function (obj) { return obj.skills; }, set: function (obj, value) { obj.skills = value; } } }, _skills_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _ticketCapacity_decorators, { kind: "field", name: "ticketCapacity", static: false, private: false, access: { has: function (obj) { return "ticketCapacity" in obj; }, get: function (obj) { return obj.ticketCapacity; }, set: function (obj, value) { obj.ticketCapacity = value; } } }, _ticketCapacity_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _currentTickets_decorators, { kind: "field", name: "currentTickets", static: false, private: false, access: { has: function (obj) { return "currentTickets" in obj; }, get: function (obj) { return obj.currentTickets; }, set: function (obj, value) { obj.currentTickets = value; } } }, _currentTickets_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } } }, _createdAt_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } } }, _updatedAt_initializers, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name }, null, _classExtraInitializers);
        Agent = _classThis = _classDescriptor.value;
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Agent = _classThis;
}();
updatedAt: Date;
