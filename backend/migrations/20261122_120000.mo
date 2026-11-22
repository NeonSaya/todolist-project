import Map "mo:core/Map";
import Set "mo:core/Set";

module {
  type Priority = { #high; #medium; #low };

  type Task = {
    id : Nat;
    owner : Principal;
    title : Text;
    priority : Priority;
    date : ?Text;
    note : ?Text;
    completed : Bool;
    createdAt : Int;
    completedAt : ?Int;
  };

  // Subset form: accessControlState, approvalState and taskCounter carry through unchanged.
  public type OldActor = {
    tasks : Map.Map<Nat, Task>;
    seededUsers : Set.Set<Principal>;
  };
  public type NewActor = {
    tasks : Map.Map<Nat, Task>;
    sampleState : { var seeded : Bool };
  };

  // Drops per-user seededUsers; all existing tasks join the shared list.
  public func migration(old : OldActor) : NewActor {
    {
      tasks = old.tasks;
      sampleState = { var seeded = old.tasks.size() > 0 or old.seededUsers.size() > 0 };
    };
  };
};
