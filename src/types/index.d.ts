declare module "Status" {
  type Id = string | number;
  type Value = Object | boolean;
  type Targets<T> = { [key: string]: T };

  type Entities<T extends string | symbol | number, V> = { [id in T]?: V };
  type Statuses<
    S extends string | symbol | number,
    E extends string | symbol | number,
    V
  > = { [statusKey in S]?: { [entityKey in E]?: V } };

  type TEntities<E extends string | symbol | number> = Entities<
    E,
    Targets<Value>
  >;

  /*   type States = {
    statuses: {
      entities: 
    }
  } */

  /*   interface Entities<T extends string | symbol | number,V> { 
    [key: string]: V
  }
  type Statuses<T extends string | symbol | number,V> = { [id in T]?: V}
*/
  // type Key<K> = K extends string | symbol | number

  /*   type Entities<T extends string | symbol | number> = Partial<
    EnumDictionary<T, Targets<Value>>
  >;
  type Statuses<
    S extends string | symbol | number,
    E extends string | symbol | number
  > = Partial<EnumDictionary<S, Entities<E>>>;
 */
  //type PickKey<T, K extends keyof T> = Extract<keyof T, K>;
  //type Propertys<T, K> = Partial<Record<K, Targets<T>>>;
  //interface Entities<T> extends Propertys<T, typeof EntityTypes> {}
  //interface Entities<U,V> extends Partial<Record<EntityTypes, Targets<V>>> {}
}
