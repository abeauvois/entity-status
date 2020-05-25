"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var rambda_1 = require("rambda");
var isNotEmpty = rambda_1.complement(rambda_1.either(rambda_1.isNil, rambda_1.isEmpty));
var Status = /** @class */ (function () {
    function Status(all) {
        if (all === void 0) { all = {}; }
        this.all = {};
    }
    //TODO: private ...
    Status.prototype.mergeEntityTypes = function (statusType) {
        var inStatus = this.get(statusType); // ex: {[TABLE]: {t1: ...}, [PROJECT]: {p1: ...}}
        var types = rambda_1.keys(inStatus); // ex: [TABLE, PROJECT]
        var allEntityTypesIds = types.reduce(function (acc, type) {
            var targets = inStatus && inStatus[type];
            return __assign(__assign({}, acc), targets);
        }, {});
        return allEntityTypesIds; // {t1: true, p1: true, ...}
    };
    Status.prototype.isAlready = function (key, statusType, entityType) {
        if (entityType) {
            var statuses = this.get(statusType);
            var inStatus = statuses && statuses[entityType];
            return isNotEmpty(inStatus) ? rambda_1.keys(inStatus).includes(key) : false;
        }
        else {
            var allEntityTypesIds = this.mergeEntityTypes(statusType);
            return isNotEmpty(allEntityTypesIds) ? rambda_1.keys(allEntityTypesIds).includes(key) : false;
        }
    };
    Status.prototype.hasMultiple = function (statusType, entityType) {
        if (entityType) {
            var statuses = this.get(statusType);
            var inStatus = statuses && statuses[entityType];
            return isNotEmpty(inStatus) ? rambda_1.keys(inStatus).length > 1 : false;
        }
        else {
            var allEntityTypesIds = this.mergeEntityTypes(statusType);
            return isNotEmpty(allEntityTypesIds) ? rambda_1.keys(allEntityTypesIds).length > 1 : false;
        }
    };
    //TODO: public ...
    Status.prototype.reset = function (statusType, entityType) {
        var _a, _b;
        if (!statusType && !entityType) {
            this.all = {};
        }
        if (!entityType) {
            this.all[statusType] = {};
        }
        else {
            var entities = this.all[statusType];
            if (!entities) {
                this.all[statusType] = {};
            }
            else {
                var all = this.all; // {SELECTED: {TABLE: {}, COLUMN: {t1:true}}}
                this.all = __assign(__assign({}, all), (_a = {}, _a[statusType] = __assign(__assign({}, all[statusType]), (_b = {}, _b[entityType] = {}, _b)), _a)); // {SELECTED: {TABLE: {}, COLUMN: {}}}
            }
        }
    };
    Status.prototype.setTargets = function (statusType, entityType, targets) {
        var _a, _b;
        this.all = __assign(__assign({}, this.all), (_a = {}, _a[statusType] = (_b = {}, _b[entityType] = targets, _b), _a));
    };
    Status.prototype.mergeValues = function (statusType, entityType, targets, key) {
        var _a, _b;
        var entities = this.all[statusType];
        if (!entities) {
            return;
        }
        var newEntities = __assign(__assign({}, entities), (_a = {}, _a[entityType] = __assign(__assign({}, entities[entityType]), (_b = {}, _b[key] = targets[key], _b)), _a));
        this.all[statusType] = __assign(__assign({}, entities), newEntities);
    };
    Status.prototype.get = function (statusType) {
        return this.all[statusType];
    };
    Status.prototype.getAll = function () {
        return this.all;
    };
    Status.prototype.getFor = function (entityType) {
        var _this = this;
        var statusTypes = rambda_1.keys(this.all);
        var allByType = statusTypes.reduce(function (acc, statusType) {
            var _a;
            var entities = _this.all[statusType];
            var targets = entities && entities[entityType];
            if (targets) {
                if (!acc[entityType]) {
                    acc[entityType] = {};
                }
                //acc[entityType][statusType] = targets => generates ts error => S can't index Entities
                acc[entityType] = __assign(__assign({}, acc[entityType]), (_a = {}, _a[statusType] = __assign({}, targets), _a));
            }
            return acc;
        }, {});
        return allByType[entityType];
    };
    Status.prototype.set = function (statusType, entityType, targets, replaceAll) {
        var _a;
        var _this = this;
        if (replaceAll === void 0) { replaceAll = false; }
        if (!this.all[statusType]) {
            this.all[statusType] = {};
        }
        if (replaceAll) {
            if (statusType && entityType) {
                //this.all[statusType][entityType] = targets
                this.setTargets(statusType, entityType, targets);
            }
        }
        else {
            if (!statusType && !entityType) {
            }
            if (statusType && entityType) {
                var entities = (_a = {}, _a[entityType] = targets, _a);
                if (!entities) {
                    this.reset(statusType, entityType);
                }
            }
            // Only update targets, not the entire Status
            rambda_1.keys(targets).forEach(function (key) {
                var _a, _b;
                var entities = _this.all[statusType];
                // In case targets[key] = true (or truthy like > 0, string, ...)
                if (targets[key]) {
                    if (!entities) {
                        _this.all = __assign(__assign({}, _this.all), (_a = {}, _a[statusType] = {}, _a));
                    }
                    else {
                        if (!entities[entityType]) {
                            var newEntities = (_b = {}, _b[entityType] = {}, _b);
                            _this.all[statusType] = __assign(__assign({}, _this.all[statusType]), newEntities);
                        }
                        _this.mergeValues(statusType, entityType, targets, String(key));
                    }
                }
                else {
                    // In case targets[key] = false (or falsy like {t1: false})
                    // And key is already a key of this.all[statusType][entityType]
                    // delete this key
                    if (!entities) {
                        return;
                    }
                    // @ts-ignore
                    if (rambda_1.keys(entities[entityType]).includes(String(key))) {
                        var targets_1 = entities[entityType];
                        if (targets_1)
                            delete targets_1[key];
                    }
                    // Special case of 0 (zero = falsy but we keep it as a valid value. ex: Progress status)
                    if (targets[key] === 0) {
                        var targets_2 = entities[entityType];
                        if (targets_2)
                            targets_2[key] = 0;
                    }
                }
            });
        }
    };
    Status.prototype.setMany = function (statuses, entityType, targets) {
        var _a;
        function reduce(targets, value, initValue, replaceAll) {
            return targets.reduce(function (acc, id) {
                if (!acc[id]) {
                    acc[id] = value;
                }
                return acc;
            }, initValue || {});
        }
        var newTargets;
        if (rambda_1.is(Array, targets)) {
            newTargets = reduce(targets, true);
        }
        else {
            newTargets = targets;
        }
        var entity = (_a = {}, _a[entityType] = newTargets, _a);
        reduce(statuses, entity, this.all);
        return this;
    };
    return Status;
}());
exports["default"] = Status;
