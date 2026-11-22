mixin () {
  public query func getApiDoc() : async Text {
    "# 拾序 Shared Task List API\n" #
    "\n" #
    "拾序 is a to-do planner (Chinese UI) backed by ONE shared task list. There are no accounts, no sign-in and no approval: anyone who opens the app, and any API caller, sees and edits the same tasks. Each task has a title, priority, optional calendar date and optional note, and can be marked completed. The frontend groups tasks into today / upcoming / overdue views by comparing `date` with the user's local today.\n" #
    "\n" #
    "## Authentication and identity\n" #
    "\n" #
    "- No task method requires a signed caller. Anonymous callers may call every task method, including all mutations. No method checks roles or approval.\n" #
    "- The caller principal is recorded only in `Task.owner` (the creator) for information; it never restricts reading, editing, completing or deleting.\n" #
    "- If the app's frontend pins an Internet Identity derivation origin, it is published at `/.well-known/ii-derivation-origin` when available; an agent holding the user's Internet Identity authorization can derive the per-app principal against that origin (for example `icp identity link web <name> --app <host>`). Such a delegation acts with the user's full authority in this app until it expires. It is not needed: an anonymous identity has the same access.\n" #
    "- Legacy role/approval methods from earlier versions (`_initialize_access_control`, `getCallerUserRole`, `isCallerAdmin`, `requestApproval`, `getCallerApprovalStatus`, `isCallerApproved`, `listApprovals`, `setApproval`, …) remain in the interface for compatibility only. They gate nothing; ignore them.\n" #
    "\n" #
    "## Types\n" #
    "\n" #
    "`Task = { id : Nat; owner : Principal; title : Text; priority : {#high; #medium; #low}; date : ?Text; note : ?Text; completed : Bool; createdAt : Int; completedAt : ?Int }`\n" #
    "\n" #
    "`TaskInput = { title : Text; priority : Priority; date : ?Text; note : ?Text }`\n" #
    "\n" #
    "`TaskError = #notFound | #invalidInput(Text)` - the `Text` is a Chinese human-readable message.\n" #
    "\n" #
    "## Methods\n" #
    "\n" #
    "- `listTasks() : query -> [Task]` - every task in the shared list, ascending `id` (creation) order.\n" #
    "- `createTask(title, priority, date, note) -> Result<Task, TaskError>` - `title` is trimmed and must be non-empty, else `#err(#invalidInput(\"标题不能为空\"))`. `date`, when present, must be a real calendar day `YYYY-MM-DD`, else `#invalidInput`. Not idempotent: each call creates a new task with a new id; after an uncertain failure, list first instead of blindly retrying.\n" #
    "- `createTasks(inputs : [TaskInput]) -> Result<[Task], TaskError>` - bulk create (used for AI-parsed pasted text). All inputs are validated first with the same rules; if any is invalid the whole batch is rejected and nothing is created, with a message like `第 2 项：标题不能为空`. Otherwise all are inserted and returned in input order with consecutive ids. Not idempotent. An empty array returns `#ok([])`.\n" #
    "- `updateTask(id, title, priority, date, note) -> Result<Task, TaskError>` - replaces title, priority, date and note (pass `null` to clear date/note); same validation as create; `#notFound` for an unknown id. Safe to retry.\n" #
    "- `setTaskCompleted(id, completed) -> Result<Task, TaskError>` - completing sets `completedAt` to the current time (kept unchanged if already completed); uncompleting clears it to `null`. Safe to retry.\n" #
    "- `deleteTask(id) -> Bool` - permanently deletes for everyone; returns `false` when the id does not exist. A retry after success returns `false`.\n" #
    "- `ensureSampleTasks(today : Text) -> [Task]` - `today` is the caller's local date `YYYY-MM-DD`. Seeds 8 Chinese sample tasks dated relative to today (several today with mixed priorities, one completed, one overdue yesterday, some upcoming) only once for the whole store, and only when the store is empty and has never been seeded; then returns the full list. Otherwise it changes nothing and returns the current list. An unparsable `today` seeds nothing and does not consume the one-time seeding. Safe to call on every app open.\n" #
    "\n" #
    "## Units and encoding\n" #
    "\n" #
    "- `createdAt` and `completedAt` are nanoseconds since the Unix epoch (`Int`).\n" #
    "- `date` is a plain calendar day `YYYY-MM-DD` with no timezone; overdue/today logic is the client's job.\n" #
    "- Ids are `Nat`, unique, increasing, never reused.\n" #
    "\n" #
    "## Lifecycle, polling and gotchas\n" #
    "\n" #
    "- No background jobs, reminders or recurrence; state changes only through these calls. Other people may edit the shared list concurrently, so re-read `listTasks` after mutations; light polling (e.g. every 30s or more) is enough to see others' changes.\n" #
    "- Because the list is shared and unauthenticated, any caller can modify or delete any task.\n" #
    "\n" #
    "## Data queries (OQL)\n" #
    "\n" #
    "`schema()` and `execute()` expose a public `task` entity containing all shared tasks, readable by anyone. `priority` appears as text `high`/`medium`/`low`."
  };
};
