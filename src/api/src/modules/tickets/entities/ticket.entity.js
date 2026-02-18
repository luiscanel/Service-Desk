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
exports.Ticket = exports.TicketPriority = exports.TicketStatus = void 0;
var typeorm_1 = require("typeorm");
var TicketStatus;
(function (TicketStatus) {
    TicketStatus["NEW"] = "new";
    TicketStatus["ASSIGNED"] = "assigned";
    TicketStatus["IN_PROGRESS"] = "in_progress";
    TicketStatus["PENDING"] = "pending";
    TicketStatus["RESOLVED"] = "resolved";
    TicketStatus["CLOSED"] = "closed";
})(TicketStatus || (exports.TicketStatus = TicketStatus = {}));
var TicketPriority;
(function (TicketPriority) {
    TicketPriority["LOW"] = "low";
    TicketPriority["MEDIUM"] = "medium";
    TicketPriority["HIGH"] = "high";
    TicketPriority["CRITICAL"] = "critical";
})(TicketPriority || (exports.TicketPriority = TicketPriority = {}));
var Ticket = exports.Ticket = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('tickets')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _id_decorators;
    var _id_initializers = [];
    var _ticketNumber_decorators;
    var _ticketNumber_initializers = [];
    var _title_decorators;
    var _title_initializers = [];
    var _description_decorators;
    var _description_initializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _priority_decorators;
    var _priority_initializers = [];
    var _category_decorators;
    var _category_initializers = [];
    var _assignedToId_decorators;
    var _assignedToId_initializers = [];
    var _requesterId_decorators;
    var _requesterId_initializers = [];
    var _resolvedAt_decorators;
    var _resolvedAt_initializers = [];
    var _closedAt_decorators;
    var _closedAt_initializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var Ticket = _classThis = /** @class */ (function () {
        function Ticket_1() {
            this.id = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _id_initializers, void 0));
            this.ticketNumber = __runInitializers(this, _ticketNumber_initializers, void 0);
            this.title = __runInitializers(this, _title_initializers, void 0);
            this.description = __runInitializers(this, _description_initializers, void 0);
            this.status = __runInitializers(this, _status_initializers, void 0);
            this.priority = __runInitializers(this, _priority_initializers, void 0);
            this.category = __runInitializers(this, _category_initializers, void 0);
            this.assignedToId = __runInitializers(this, _assignedToId_initializers, void 0);
            this.requesterId = __runInitializers(this, _requesterId_initializers, void 0);
            this.resolvedAt = __runInitializers(this, _resolvedAt_initializers, void 0);
            this.closedAt = __runInitializers(this, _closedAt_initializers, void 0);
            this.createdAt = __runInitializers(this, _createdAt_initializers, void 0);
            this.updatedAt = __runInitializers(this, _updatedAt_initializers, void 0);
        }
        return Ticket_1;
    }());
    __setFunctionName(_classThis, "Ticket");
    (function () {
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _ticketNumber_decorators = [(0, typeorm_1.Column)()];
        _title_decorators = [(0, typeorm_1.Column)()];
        _description_decorators = [(0, typeorm_1.Column)('text')];
        _status_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: TicketStatus, default: TicketStatus.NEW })];
        _priority_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: TicketPriority, default: TicketPriority.MEDIUM })];
        _category_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _assignedToId_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _requesterId_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _resolvedAt_decorators = [(0, typeorm_1.Column)({ type: 'timestamp', nullable: true })];
        _closedAt_decorators = [(0, typeorm_1.Column)({ type: 'timestamp', nullable: true })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } } }, _id_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _ticketNumber_decorators, { kind: "field", name: "ticketNumber", static: false, private: false, access: { has: function (obj) { return "ticketNumber" in obj; }, get: function (obj) { return obj.ticketNumber; }, set: function (obj, value) { obj.ticketNumber = value; } } }, _ticketNumber_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _title_decorators, { kind: "field", name: "title", static: false, private: false, access: { has: function (obj) { return "title" in obj; }, get: function (obj) { return obj.title; }, set: function (obj, value) { obj.title = value; } } }, _title_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: function (obj) { return "description" in obj; }, get: function (obj) { return obj.description; }, set: function (obj, value) { obj.description = value; } } }, _description_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } } }, _status_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _priority_decorators, { kind: "field", name: "priority", static: false, private: false, access: { has: function (obj) { return "priority" in obj; }, get: function (obj) { return obj.priority; }, set: function (obj, value) { obj.priority = value; } } }, _priority_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _category_decorators, { kind: "field", name: "category", static: false, private: false, access: { has: function (obj) { return "category" in obj; }, get: function (obj) { return obj.category; }, set: function (obj, value) { obj.category = value; } } }, _category_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _assignedToId_decorators, { kind: "field", name: "assignedToId", static: false, private: false, access: { has: function (obj) { return "assignedToId" in obj; }, get: function (obj) { return obj.assignedToId; }, set: function (obj, value) { obj.assignedToId = value; } } }, _assignedToId_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _requesterId_decorators, { kind: "field", name: "requesterId", static: false, private: false, access: { has: function (obj) { return "requesterId" in obj; }, get: function (obj) { return obj.requesterId; }, set: function (obj, value) { obj.requesterId = value; } } }, _requesterId_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _resolvedAt_decorators, { kind: "field", name: "resolvedAt", static: false, private: false, access: { has: function (obj) { return "resolvedAt" in obj; }, get: function (obj) { return obj.resolvedAt; }, set: function (obj, value) { obj.resolvedAt = value; } } }, _resolvedAt_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _closedAt_decorators, { kind: "field", name: "closedAt", static: false, private: false, access: { has: function (obj) { return "closedAt" in obj; }, get: function (obj) { return obj.closedAt; }, set: function (obj, value) { obj.closedAt = value; } } }, _closedAt_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } } }, _createdAt_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } } }, _updatedAt_initializers, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name }, null, _classExtraInitializers);
        Ticket = _classThis = _classDescriptor.value;
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Ticket = _classThis;
}();
