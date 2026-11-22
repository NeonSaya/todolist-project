import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinUserApproval "mo:caffeineai-user-approval/MixinUserApproval";
import UserApproval "mo:caffeineai-user-approval/approval";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import NatValue "mo:caffeineai-oql/NatValue";
import IntValue "mo:caffeineai-oql/IntValue";
import TextValue "mo:caffeineai-oql/TextValue";
import BoolValue "mo:caffeineai-oql/BoolValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import Common "types/common";
import TaskTypes "types/tasks";
import TasksApi "mixins/tasks-api";
import ApiDocMixin "mixins/api-doc";

actor {
  // Compatibility infrastructure only: the applied migration 00000000_000000 imports both
  // packages, so they stay installed and their contract lints require these includes.
  // No task endpoint consults them; the app has no sign-in or approval gate.
  let accessControlState : AccessControl.AccessControlState;
  include MixinAuthorization(accessControlState, null);
  let approvalState : UserApproval.UserApprovalState;
  include MixinUserApproval(accessControlState, approvalState);

  let tasks : Map.Map<Common.TaskId, TaskTypes.Task>;
  let taskCounter : TaskTypes.TaskCounter;
  let sampleState : TaskTypes.SampleState;
  include TasksApi(tasks, taskCounter, sampleState);

  include ApiDocMixin();

  include Expose({
    entities = [
      tasks.toEntityManual("task", "Task", "id")
        .sample({
          id = 0;
          owner = Principal.anonymous();
          title = "";
          priority = #medium;
          date = ?"";
          note = ?"";
          completed = false;
          createdAt = 0;
          completedAt = ?0;
        })
        .payload("id", func t = t.id)
        .payload("owner", func t = t.owner)
        .payload("title", func t = t.title)
        .payload(
          "priority",
          func t = switch (t.priority) {
            case (#high) { "high" };
            case (#medium) { "medium" };
            case (#low) { "low" };
          },
        )
        .payload("date", func t = t.date)
        .payload("note", func t = t.note)
        .payload("completed", func t = t.completed)
        .payload("createdAt", func t = t.createdAt)
        .payload("completedAt", func t = t.completedAt)
        .public_()
        .build(),
    ];
  });
};
