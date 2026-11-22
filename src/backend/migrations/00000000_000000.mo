import Map "mo:core/Map";
import Set "mo:core/Set";
import AccessControl "mo:caffeineai-authorization/access-control";
import UserApproval "mo:caffeineai-user-approval/approval";

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

  public type OldActor = {};
  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    approvalState : UserApproval.UserApprovalState;
    tasks : Map.Map<Nat, Task>;
    taskCounter : { var nextId : Nat };
    seededUsers : Set.Set<Principal>;
  };

  public func migration(_ : OldActor) : NewActor {
    let accessControlState = AccessControl.initState();
    {
      accessControlState;
      approvalState = UserApproval.initState(accessControlState);
      tasks = Map.empty();
      taskCounter = { var nextId = 0 };
      seededUsers = Set.empty();
    };
  };
};
