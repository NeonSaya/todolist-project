import Map "mo:core/Map";
import Result "mo:core/Result";
import Time "mo:core/Time";
import Common "../types/common";
import Types "../types/tasks";
import TasksLib "../lib/tasks";

// One shared task list: every caller, including anonymous, can use all endpoints.
mixin (
  tasks : Map.Map<Common.TaskId, Types.Task>,
  taskCounter : Types.TaskCounter,
  sampleState : Types.SampleState,
) {
  public query func listTasks() : async [Types.Task] {
    TasksLib.listAll(tasks);
  };

  public shared ({ caller }) func createTask(title : Text, priority : Types.Priority, date : ?Text, note : ?Text) : async Result.Result<Types.Task, Types.TaskError> {
    TasksLib.create(tasks, taskCounter, caller, { title; priority; date; note }, Time.now());
  };

  public shared ({ caller }) func createTasks(inputs : [Types.TaskInput]) : async Result.Result<[Types.Task], Types.TaskError> {
    TasksLib.createMany(tasks, taskCounter, caller, inputs, Time.now());
  };

  public shared func updateTask(id : Common.TaskId, title : Text, priority : Types.Priority, date : ?Text, note : ?Text) : async Result.Result<Types.Task, Types.TaskError> {
    TasksLib.update(tasks, id, { title; priority; date; note });
  };

  public shared func setTaskCompleted(id : Common.TaskId, completed : Bool) : async Result.Result<Types.Task, Types.TaskError> {
    TasksLib.setCompleted(tasks, id, completed, Time.now());
  };

  public shared func deleteTask(id : Common.TaskId) : async Bool {
    TasksLib.remove(tasks, id);
  };

  public shared ({ caller }) func ensureSampleTasks(today : Text) : async [Types.Task] {
    TasksLib.ensureSamples(tasks, taskCounter, sampleState, caller, today, Time.now());
  };
};
