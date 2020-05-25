import Status from "../Status";
import { MyEntities, MyStatuses } from "../config";

const { Selected, Focused } = MyStatuses;
const { Table, Project } = MyEntities;

describe("Status", () => {
  let status;
  beforeEach(() => {
    status = new Status({}, MyStatuses, MyEntities);
  });

  it("R1: should throw an error for missing params", () => {
    const received = () => new Status();
    expect(received).toThrow();
  });

  it("R2: should set ids of type Table to Focused", () => {
    const targets = { t1: true, t2: true };

    status.set(Selected, Table, targets);

    const received = status.all[Selected];
    const expected = { [Table]: targets };

    expect(received).toEqual(expected);
  });

  it("R3: should cumulate several sets by default", () => {
    status.set(Selected, Table, { t1: true });
    status.set(Selected, Table, { t3: true });

    const received = status.all;
    const received2 = status.getAll();

    const expected = {
      [Selected]: { [Table]: { t1: true, t3: true } }
    };
    expect(received).toEqual(expected);
    expect(received2).toEqual(expected);
  });

  it("R4: should get ids of type Table by Status", () => {
    const idsTableFocused = { t1: true, t2: true };
    const idsTableSelected = { t1: true };

    status.set(Focused, Table, idsTableFocused);
    status.set(Selected, Table, idsTableSelected);
    status.set(Selected, Table, { t3: true });

    const received = status.getFor(Table);

    const expected = {
      [Focused]: { t1: true, t2: true },
      [Selected]: { t1: true, t3: true }
    };
    expect(received).toEqual(expected);
  });

  it("R5: should set several status at once to an object of ids", () => {
    const idsTable = { t1: true };

    status.setMany([Focused, Selected], Table, idsTable);

    const received = status.getFor(Table);
    const expected = { [Focused]: { t1: true }, [Selected]: { t1: true } };
    expect(received).toEqual(expected);
  });

  it("R6: should set several status at once to an array of ids", () => {
    const idsSelectedTable = { t1: true };
    const idsSelectedProject = { p1: true };

    status.set(Selected, Table, idsSelectedTable);
    status.set(Selected, Project, idsSelectedProject);

    status.setMany([Focused, Selected], Table, { t2: true });

    const received = status.all;
    const expected = {
      [Focused]: { [Table]: { t2: true } },
      [Selected]: { [Table]: { t1: true }, [Project]: { p1: true } }
    };
    expect(received).toEqual(expected);
  });

  it("R7: should set a status to several ids", () => {
    const idsSelectedTable = { t1: true, t2: true };
    const idsFocusedTable = { t1: true };

    status.set(Selected, Table, idsSelectedTable);
    status.set(Focused, Table, idsFocusedTable);
    status.set(Selected, Table, { t3: true });

    const received = status.all;
    const expected = {
      [Focused]: { [Table]: { t1: true } },
      [Selected]: { [Table]: { t1: true, t2: true, t3: true } }
    };
    expect(received).toEqual(expected);

    // Test the flag replaceAll = true
    status.set(Selected, Table, { t3: true }, true);

    expect(status.all).toEqual({
      [Focused]: { [Table]: { t1: true } },
      [Selected]: { [Table]: { t3: true } }
    });
  });

  it("R8: should reset status for a given type (like Table)", () => {
    const idsSelectedTable = { t1: true, t2: true };
    const idsSelectedProject = { p1: true, p2: true };
    const idsFocusedTable = { t1: true };

    status.set(Selected, Table, idsSelectedTable);
    status.set(Focused, Table, idsFocusedTable);
    status.set(Selected, Project, idsSelectedProject);

    const received = status.all;
    const expected = {
      [Selected]: { [Table]: idsSelectedTable, [Project]: idsSelectedProject },
      [Focused]: { [Table]: { t1: true } }
    };
    expect(received).toEqual(expected);

    status.reset(Selected, Table);

    expect(status.all[Focused]).toEqual({ [Table]: { t1: true } });
    expect(status.all[Selected][Table]).toEqual({});
  });

  it("R9: should reset status for a given status (like Selected)", () => {
    const idsSelectedTable = { t1: true, t2: true };
    const idsFocusedTable = { t1: true };

    status.set(Selected, Table, idsSelectedTable);
    status.set(Focused, Table, idsFocusedTable);

    const received = status.all;
    const expected = {
      [Selected]: { [Table]: { t1: true, t2: true } },
      [Focused]: { [Table]: { t1: true } }
    };
    expect(received).toEqual(expected);

    status.reset(Selected);

    expect(status.all[Selected]).toEqual({});
    expect(status.all[Focused]).toEqual({ [Table]: { t1: true } });
  });

  it("R10: isAlready should be TRUE if a given entity key of a TYPE is already in a status (like Selected)", () => {
    const idsSelectedTable = { t1: true, t2: true };
    const idsFocusedTable = { t1: true };

    status.set(Selected, Table, idsSelectedTable);
    status.set(Focused, Table, idsFocusedTable);

    expect(status.isAlready("t1", Selected, Table)).toEqual(true);
    expect(status.isAlready("t2", Selected, Table)).toEqual(true);
    expect(status.isAlready("t3", Selected, Table)).toEqual(false);

    status.reset(Selected, Table);

    expect(status.isAlready("t1", Selected, Table)).toEqual(false);
    expect(status.isAlready("t1", Focused, Table)).toEqual(true);
  });

  it("R10bis: isAlready should be TRUE if a given entity is already in a status whatever its TYPE (like Table)", () => {
    const idsSelectedTable = { t1: true, t2: true };
    const idsFocusedTable = { t1: true };

    status.set(Selected, Table, idsSelectedTable);
    status.set(Focused, Table, idsFocusedTable);

    expect(status.isAlready("t1", Selected)).toEqual(true);
    expect(status.isAlready("t1", Focused)).toEqual(true);

    status.reset(Selected, Table);

    expect(status.isAlready("t1", Selected)).toEqual(false);
  });

  it("R11: should be TRUE if more than 1 entity are in a given status (like Selected)", () => {
    const idsSelectedTable = { t1: true, t2: true };
    const idsFocusedTable = { t1: true };

    status.set(Selected, Table, idsSelectedTable);
    status.set(Focused, Table, idsFocusedTable);

    expect(status.hasMultiple(Selected, Table)).toEqual(true);
    expect(status.hasMultiple(Focused, Table)).toEqual(false);
  });

  it("R12: should manage the status of different entity types", () => {
    const idsSelectedTable = { t1: true, t2: true };
    const idsSelectedProject = { p1: true };

    status.set(Selected, Table, idsSelectedTable);
    status.set(Selected, Project, idsSelectedProject);

    expect(status.all).toEqual({
      [Selected]: { [Project]: { p1: true }, [Table]: { t1: true, t2: true } }
    });
  });

  it("R13: should delete falsy ids", () => {
    const idsSelectedTable = { t1: true, t2: false };
    const idsSelectedProject = { p1: true };

    status.set(Selected, Table, idsSelectedTable);
    status.set(Selected, Project, idsSelectedProject);

    expect(status.all).toEqual({
      [Selected]: { [Project]: { p1: true }, [Table]: { t1: true } }
    });
  });
  /*   


 */

  /*   it("should work with overmind", () => {
    store.actions.resetStatus({ space: PREPARE });
    const prepareStatus = store.state[PREPARE].status;
    // reset the state as it can interfere with Overmind Dev Tools or App running...
    store.actions.setStatus({
      space: PREPARE,
      statusType: Focused,
      replaceAll: true,
      ids: undefined
    });
    const idsTableFocused = { t1: true, t2: true };

    store.actions.setStatus({
      space: PREPARE,
      statusType: Focused,
      entityType: Table,
      ids: idsTableFocused
    });

    expect(prepareStatus.all[Focused]).toEqual({
      [Table]: { t1: true, t2: true }
    });
  }); */
});
