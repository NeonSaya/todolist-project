import Map "mo:core/Map";
import Result "mo:core/Result";
import Nat "mo:core/Nat";
import Nat32 "mo:core/Nat32";
import Int "mo:core/Int";
import Char "mo:core/Char";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Common "../types/common";
import Types "../types/tasks";

module {
  // ---- civil-date helpers (days since 1970-01-01) ----

  func isLeap(y : Int) : Bool {
    y % 4 == 0 and (y % 100 != 0 or y % 400 == 0);
  };

  func daysInMonth(y : Int, m : Int) : Int {
    if (m == 2) { if (isLeap(y)) 29 else 28 } else if (m == 4 or m == 6 or m == 9 or m == 11) {
      30;
    } else { 31 };
  };

  func daysFromCivil(y : Int, m : Int, d : Int) : Int {
    let yy = if (m <= 2) y - 1 else y;
    let era = yy / 400;
    let yoe = yy - era * 400;
    let mp = if (m > 2) m - 3 else m + 9;
    let doy = (153 * mp + 2) / 5 + d - 1;
    let doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;
    era * 146097 + doe - 719468;
  };

  func civilFromDays(days : Int) : (Int, Int, Int) {
    let z = days + 719468;
    let era = z / 146097;
    let doe = z - era * 146097;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if (mp < 10) mp + 3 else mp - 9;
    let y = yoe + era * 400 + (if (m <= 2) 1 else 0);
    (y, m, d);
  };

  func pad(n : Int, width : Nat) : Text {
    var s = n.toText();
    while (s.size() < width) { s := "0" # s };
    s;
  };

  func formatDay(days : Int) : Text {
    let (y, m, d) = civilFromDays(days);
    pad(y, 4) # "-" # pad(m, 2) # "-" # pad(d, 2);
  };

  // Parses a strict "YYYY-MM-DD" calendar date into days since epoch.
  func parseDay(s : Text) : ?Int {
    if (s.size() != 10) return null;
    var y : Int = 0;
    var m : Int = 0;
    var d : Int = 0;
    var i = 0;
    for (c in s.chars()) {
      if (i == 4 or i == 7) {
        if (c != '-') return null;
      } else {
        if (not c.isDigit()) return null;
        let code : Int = c.toNat32().toNat();
        let digit = code - 48;
        if (i < 4) { y := y * 10 + digit } else if (i < 7) {
          m := m * 10 + digit;
        } else { d := d * 10 + digit };
      };
      i += 1;
    };
    if (y < 1 or m < 1 or m > 12 or d < 1 or d > daysInMonth(y, m)) return null;
    ?daysFromCivil(y, m, d);
  };

  // ---- validation ----

  func validate(input : Types.TaskInput) : Result.Result<Types.TaskInput, Text> {
    let title = input.title.trim(#predicate(func c = c.isWhitespace()));
    if (title.size() == 0) return #err("标题不能为空");
    switch (input.date) {
      case (?date) {
        if (parseDay(date) == null) return #err("日期「" # date # "」无效，应为 YYYY-MM-DD 格式");
      };
      case null {};
    };
    #ok({ input with title });
  };

  func insert(
    tasks : Map.Map<Common.TaskId, Types.Task>,
    counter : Types.TaskCounter,
    owner : Common.UserId,
    input : Types.TaskInput,
    now : Common.Timestamp,
  ) : Types.Task {
    let id = counter.nextId;
    counter.nextId += 1;
    let task : Types.Task = {
      id;
      owner;
      title = input.title;
      priority = input.priority;
      date = input.date;
      note = input.note;
      completed = false;
      createdAt = now;
      completedAt = null;
    };
    tasks.add(id, task);
    task;
  };

  // ---- public API ----

  public func listAll(tasks : Map.Map<Common.TaskId, Types.Task>) : [Types.Task] {
    tasks.values().toArray();
  };

  public func create(
    tasks : Map.Map<Common.TaskId, Types.Task>,
    counter : Types.TaskCounter,
    owner : Common.UserId,
    input : Types.TaskInput,
    now : Common.Timestamp,
  ) : Result.Result<Types.Task, Types.TaskError> {
    switch (validate(input)) {
      case (#err(msg)) { #err(#invalidInput(msg)) };
      case (#ok(clean)) { #ok(insert(tasks, counter, owner, clean, now)) };
    };
  };

  // Validates every input first; rejects the whole batch with #invalidInput if any is invalid.
  public func createMany(
    tasks : Map.Map<Common.TaskId, Types.Task>,
    counter : Types.TaskCounter,
    owner : Common.UserId,
    inputs : [Types.TaskInput],
    now : Common.Timestamp,
  ) : Result.Result<[Types.Task], Types.TaskError> {
    let cleaned = List.empty<Types.TaskInput>();
    var index = 0;
    for (input in inputs.values()) {
      index += 1;
      switch (validate(input)) {
        case (#err(msg)) { return #err(#invalidInput("第 " # index.toText() # " 项：" # msg)) };
        case (#ok(clean)) { cleaned.add(clean) };
      };
    };
    #ok(cleaned.map<Types.TaskInput, Types.Task>(func(clean) = insert(tasks, counter, owner, clean, now)).toArray());
  };

  public func update(
    tasks : Map.Map<Common.TaskId, Types.Task>,
    id : Common.TaskId,
    input : Types.TaskInput,
  ) : Result.Result<Types.Task, Types.TaskError> {
    let ?existing = tasks.get(id) else return #err(#notFound);
    switch (validate(input)) {
      case (#err(msg)) { #err(#invalidInput(msg)) };
      case (#ok(clean)) {
        let updated = {
          existing with
          title = clean.title;
          priority = clean.priority;
          date = clean.date;
          note = clean.note;
        };
        tasks.add(id, updated);
        #ok(updated);
      };
    };
  };

  public func setCompleted(
    tasks : Map.Map<Common.TaskId, Types.Task>,
    id : Common.TaskId,
    completed : Bool,
    now : Common.Timestamp,
  ) : Result.Result<Types.Task, Types.TaskError> {
    let ?existing = tasks.get(id) else return #err(#notFound);
    let completedAt = if (not completed) { null } else if (existing.completed) {
      existing.completedAt;
    } else { ?now };
    let updated = { existing with completed; completedAt };
    tasks.add(id, updated);
    #ok(updated);
  };

  public func remove(
    tasks : Map.Map<Common.TaskId, Types.Task>,
    id : Common.TaskId,
  ) : Bool {
    if (not tasks.containsKey(id)) return false;
    tasks.remove(id);
    true;
  };

  // Seeds Chinese sample tasks relative to `today` ("YYYY-MM-DD") only when the store is empty and never seeded.
  public func ensureSamples(
    tasks : Map.Map<Common.TaskId, Types.Task>,
    counter : Types.TaskCounter,
    sampleState : Types.SampleState,
    owner : Common.UserId,
    today : Text,
    now : Common.Timestamp,
  ) : [Types.Task] {
    if (sampleState.seeded or tasks.size() > 0) return listAll(tasks);
    let ?base = parseDay(today) else return listAll(tasks);
    let samples : [(Text, Types.Priority, Int, ?Text, Bool)] = [
      ("整理本周的工作计划", #high, 0, ?"先列出三件最重要的事", false),
      ("回复客户的邮件", #medium, 0, null, false),
      ("去超市采购日用品", #low, 0, ?"牛奶、鸡蛋、纸巾", false),
      ("晨跑 30 分钟", #low, 0, null, true),
      ("缴纳本月水电费", #high, -1, ?"已经逾期，尽快处理", false),
      ("预约牙医复诊", #medium, 1, null, false),
      ("准备周五的项目汇报", #high, 3, ?"整理数据并做好演示文稿", false),
      ("给家人打个电话", #low, 5, null, false),
    ];
    for ((title, priority, offset, note, done) in samples.values()) {
      let task = insert(tasks, counter, owner, { title; priority; date = ?formatDay(base + offset); note }, now);
      if (done) {
        tasks.add(task.id, { task with completed = true; completedAt = ?now });
      };
    };
    sampleState.seeded := true;
    listAll(tasks);
  };
};
