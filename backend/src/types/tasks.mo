import Common "common";

module {
  public type Priority = { #high; #medium; #low };

  // date: calendar day as "YYYY-MM-DD" text, compared by the frontend with local today.
  // owner: kept for compatibility (creator principal); it never restricts access.
  public type Task = {
    id : Common.TaskId;
    owner : Common.UserId;
    title : Text;
    priority : Priority;
    date : ?Text;
    note : ?Text;
    completed : Bool;
    createdAt : Common.Timestamp;
    completedAt : ?Common.Timestamp;
  };

  public type TaskInput = {
    title : Text;
    priority : Priority;
    date : ?Text;
    note : ?Text;
  };

  public type TaskError = {
    #notFound;
    #invalidInput : Text;
  };

  public type TaskCounter = { var nextId : Nat };

  // Whether the shared store has ever been seeded with sample tasks.
  public type SampleState = { var seeded : Bool };
};
