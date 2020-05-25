type Id = string;
type Value = Object | boolean;
type Targets<T> = { [key: string]: T };

type Entities<T extends Id, V> = { [id in T]?: V };

type Statuses<S extends Id, E extends Id, V> = { [statusKey in S]?: { [entityKey in E]?: V } };

type TargetedEntities<E extends Id> = Entities<E, Targets<Value>>;

export { Id, Value, Targets, Entities, Statuses, TargetedEntities };
