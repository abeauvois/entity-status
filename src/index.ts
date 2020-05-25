import { keys, isEmpty, is, complement, either, isNil } from "rambda";
import { Id, Value, Entities, Statuses, Targets, TargetedEntities } from "./types";

const isNotEmpty = complement(either(isNil, isEmpty));

class Status<S extends Id, E extends Id> {
  all: Statuses<S, E, TargetedEntities<E>>;
  constructor(all: Statuses<S, E, TargetedEntities<E>> = {}) {
    this.all = {};
  }
  //TODO: private ...
  mergeEntityTypes(statusType: S): Targets<Value> {
    const inStatus = this.get(statusType); // ex: {[TABLE]: {t1: ...}, [PROJECT]: {p1: ...}}
    const types = keys(inStatus) as E[]; // ex: [TABLE, PROJECT]
    const allEntityTypesIds = types.reduce((acc: Targets<Value>, type: E) => {
      const targets = inStatus && (inStatus[type] as object);
      return { ...acc, ...targets };
    }, {});
    return allEntityTypesIds; // {t1: true, p1: true, ...}
  }

  isAlready(key: Id, statusType: S, entityType?: E): boolean {
    if (entityType) {
      const statuses = this.get(statusType);
      const inStatus = statuses && statuses[entityType];
      return isNotEmpty(inStatus) ? keys(inStatus).includes(key as string) : false;
    } else {
      const allEntityTypesIds = this.mergeEntityTypes(statusType);
      return isNotEmpty(allEntityTypesIds) ? keys(allEntityTypesIds).includes(key) : false;
    }
  }

  hasMultiple(statusType: S, entityType: E): boolean {
    if (entityType) {
      const statuses = this.get(statusType);
      const inStatus = statuses && statuses[entityType];
      return isNotEmpty(inStatus) ? keys(inStatus).length > 1 : false;
    } else {
      const allEntityTypesIds = this.mergeEntityTypes(statusType);
      return isNotEmpty(allEntityTypesIds) ? keys(allEntityTypesIds).length > 1 : false;
    }
  }
  //TODO: public ...
  reset(statusType: S, entityType?: E): void {
    if (!statusType && !entityType) {
      this.all = {};
    }
    if (!entityType) {
      this.all[statusType] = {};
    } else {
      const entities = this.all[statusType] as TargetedEntities<E>;
      if (!entities) {
        this.all[statusType] = {};
      } else {
        const all = this.all; // {SELECTED: {TABLE: {}, COLUMN: {t1:true}}}
        this.all = {
          ...all,
          [statusType]: { ...all[statusType], [entityType]: {} }
        }; // {SELECTED: {TABLE: {}, COLUMN: {}}}
      }
    }
  }

  setTargets(statusType: S, entityType: E, targets: Targets<Value>): void {
    this.all = { ...this.all, [statusType]: { [entityType]: targets } };
  }

  mergeValues(statusType: S, entityType: E, targets: Targets<Value>, key: Id): void {
    const entities = this.all[statusType];
    if (!entities) {
      return;
    }
    const newEntities: TargetedEntities<E> = {
      ...entities,
      [entityType]: { ...entities[entityType], [key]: targets[key] }
    };
    this.all[statusType] = { ...entities, ...newEntities };
  }

  get(statusType: S): Entities<E, Value> | undefined {
    return this.all[statusType];
  }

  getAll(): Statuses<S, E, TargetedEntities<E>> {
    return this.all;
  }

  getFor(entityType: E) {
    const statusTypes = keys(this.all);
    const allByType = statusTypes.reduce((acc, statusType) => {
      const entities = this.all[statusType];
      const targets = entities && entities[entityType];
      if (targets) {
        if (!acc[entityType]) {
          acc[entityType] = {};
        }
        //acc[entityType][statusType] = targets => generates ts error => S can't index Entities
        acc[entityType] = {
          ...acc[entityType],
          [statusType]: { ...targets }
        };
      }
      return acc;
    }, {} as Entities<E, Statuses<S, E, Targets<Value>>>);
    return allByType[entityType];
  }

  set(statusType: S, entityType: E, targets: Targets<Value>, replaceAll = false) {
    if (!this.all[statusType]) {
      this.all[statusType] = {};
    }

    if (replaceAll) {
      if (statusType && entityType) {
        //this.all[statusType][entityType] = targets
        this.setTargets(statusType, entityType, targets);
      }
    } else {
      if (!statusType && !entityType) {
      }
      if (statusType && entityType) {
        const entities = { [entityType]: targets } as TargetedEntities<E>;
        if (!entities) {
          this.reset(statusType, entityType);
        }
      }

      // Only update targets, not the entire Status
      keys(targets).forEach(key => {
        const entities = this.all[statusType];
        // In case targets[key] = true (or truthy like > 0, string, ...)
        if (targets[key]) {
          if (!entities) {
            this.all = { ...this.all, [statusType]: {} };
          } else {
            if (!entities[entityType]) {
              const newEntities = { [entityType]: {} } as TargetedEntities<E>;
              this.all[statusType] = {
                ...this.all[statusType],
                ...newEntities
              };
            }
            this.mergeValues(statusType, entityType, targets, String(key));
          }
        } else {
          // In case targets[key] = false (or falsy like {t1: false})
          // And key is already a key of this.all[statusType][entityType]
          // delete this key
          if (!entities) {
            return;
          }
          if (keys(entities[entityType]).includes(key as string)) {
            const targets = entities[entityType] as Targets<Value>;
            if (targets) delete targets[key];
          }
          // Special case of 0 (zero = falsy but we keep it as a valid value. ex: Progress status)
          if (targets[key] === 0) {
            const targets = entities[entityType] as Targets<Value>;
            if (targets) targets[key] = 0;
          }
        }
      });
    }
  }

  setMany(statuses: S[], entityType: E, targets: string[] | Targets<Value>) {
    function reduce<S extends Id, E extends Id, U>(
      targets: any[],
      value: U,
      initValue?: Statuses<S, E, TargetedEntities<E>> | TargetedEntities<E> | Targets<Value>,
      replaceAll?: boolean
    ): Statuses<S, E, TargetedEntities<E>> | TargetedEntities<E> | Targets<Value> {
      return targets.reduce((acc, id) => {
        if (!acc[id]) {
          acc[id] = value;
        }
        return acc;
      }, initValue || ({} as Statuses<S, E, TargetedEntities<E>> | TargetedEntities<E> | Targets<Value>));
    }

    let newTargets: Targets<Value>;
    if (is(Array, targets)) {
      newTargets = reduce(targets as any[], true) as Targets<Value>;
    } else {
      newTargets = targets as Targets<Value>;
    }
    const entity = { [entityType]: newTargets };
    reduce(statuses, entity, this.all);

    return this;
  }
}

export default Status;
