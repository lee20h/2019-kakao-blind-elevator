const axios = require("axios");

const URL = `http://localhost:8000`;

class Elevator {
  constructor(id) {
    (this.id = id),
      (this.floor = 1),
      (this.passengers = []),
      (this.status = `STOPPED`),
      (this.calls = []),
      (this.src = 0),
      (this.dest = 0),
      (this.isStarted = false);
  }

  addCall(call) {
    if (this.src === 0 && this.dest === 0) {
      this.src = call.start;
      this.dest = call.end;
    }
    this.calls.push(call);
  }

  async updateAction() {
    if (!this.isStarted && this.src !== this.dest) {
      if (this.floor < this.src) {
        this.status = `UPWARD`;
        this.floor += 1;
        return `UP`;
      } else if (this.floor > this.src) {
        this.status = `DOWNWARD`;
        this.floor -= 1;
        return `DOWN`;
      } else {
        this.status = `STOPPED`;
        this.isStarted = true;
        return `STOP`;
      }
    }

    let enter = [];
    let exit = [];

    for (let call of this.calls) {
      if (call.start === this.floor) {
        if (enter.length + this.passengers.length < 8) {
          enter.push(call);
        }
      }
    }

    for (let call of this.passengers) {
      if (call.end === this.floor) {
        exit.push(call);
      }
    }
    if (
      // 승객이 원하는 층 도착
      (this.status === `UPWARD` || this.status === `DOWNWARD`) &&
      (enter.length > 0 || exit.length > 0)
    ) {
      this.status = `STOPPED`;
      return `STOP`;
    } else if (
      this.status === `STOPPED` &&
      (enter.length > 0 || exit.length > 0)
    ) {
      // 문 오픈
      this.status = `OPENED`;
      return `OPEN`;
    } else if (this.status === `OPENED` && enter.length > 0) {
      // 탈 사람이 있다면
      let callId = [];
      this.passengers.push(...enter);

      for (let enterCall of enter) {
        const idx = this.calls.findIndex(function (item) {
          return item.id === enterCall.id;
        });
        if (idx > -1) {
          if (this.calls.length === 1) {
            this.calls = [];
          } else {
            this.calls.splice(idx, 1);
          }
        }
      }

      callId.push("enter");
      for (let enterCall of enter) {
        callId.push(enterCall.id);
      }
      return callId;
    } else if (this.status == `OPENED` && exit.length > 0) {
      // 내릴 사람이 있다면
      let callId = [];
      for (let exitId of exit) {
        const idx = this.passengers.findIndex(function (item) {
          return item.id === exitId.id;
        });
        if (idx > -1) {
          if (this.passengers.length === 1) {
            this.passengers = [];
          } else {
            this.passengers.splice(idx, 1);
          }
        }
      }
      for (let exitCall of exit) {
        const idx = this.calls.findIndex(function (item) {
          return item.id === exitCall.id;
        });
        if (idx > -1) {
          if (this.calls.length === 1) {
            this.calls = [];
          } else {
            this.calls.splice(idx, 1);
          }
        }
      }
      callId.push("exit");
      for (let exitCall of exit) {
        callId.push(exitCall.id);
      }
      return callId;
    } else if (
      this.status === `OPENED` &&
      !(enter.length > 0 || exit.length > 0)
    ) {
      // 닫을 차례
      this.status = `STOPPED`;
      if (this.floor === this.dest) {
        this.src = this.dest = 0;
        this.isStarted = false;
      }
      return `CLOSE`;
    } else if (this.src === this.dest) {
      // 완료
      return `STOP`;
    } else {
      // 엘리베이터 이동 중
      if (this.src < this.dest) {
        this.status = `UPWARD`;
        this.floor += 1;
        return `UP`;
      } else {
        this.status = `DOWNWARD`;
        this.floor -= 1;
        return `DOWN`;
      }
    }
  }
}

async function startApi(problem) {
  return await axios.post(`${URL}/start/tester/${problem}/4`);
}

async function onCalls(token) {
  return await axios({
    url: `${URL}/oncalls`,
    method: `GET`,
    headers: { "X-Auth-Token": token },
  });
}

async function action(token, command) {
  return await axios({
    url: `${URL}/action`,
    method: `POST`,
    headers: { "X-Auth-Token": token, "Content-Type": "application/json" },
    data: { commands: command },
  });
}

async function sleep() {
  const _sleep = (delay) =>
    new Promise((resolve) => setTimeout(resolve, delay));
  await _sleep(25);
}

async function solve() {
  const setting = await startApi(2);
  let token = setting.data.token;
  let elevators = [];
  let progress = [];
  for (let i = 0; i < 4; i++) {
    let elevator = new Elevator(i);
    elevators.push(elevator);
  }
  while (true) {
    await sleep();
    const result = await onCalls(token);
    if (result.data.is_end) {
      console.log(`완료!!`);
      break;
    }
    let commands = [];
    let notProgress = [];
    notProgress = result.data.calls.filter(function (item) {
      let flag = true;
      for (let already of progress) {
        if (already.id === item.id) flag = false;
      }
      return flag;
    });
    for (let elevator of elevators) {
      let jobs = elevator.passengers.length + elevator.calls.length;
      if (jobs < 8 && notProgress.length > 0) {
        if (elevator.src === elevator.dest) {
          elevator.addCall(notProgress[0]);
          progress.push(notProgress[0]);
          notProgress.shift();
        } else if (elevator.isStarted && elevator.src < elevator.dest) {
          let ascendCall = [];
          for (let call of notProgress) {
            if (
              elevator.floor < call.start &&
              call.start < call.end &&
              call.end < elevator.dest
            ) {
              ascendCall.push(call);
            }
          }
          for (let call of ascendCall) {
            if (jobs < 8) {
              elevator.addCall(call);
              progress.push(call);
              const idx = notProgress.findIndex(function (item) {
                return item.id === call.id;
              });
              if (idx > -1) {
                if (notProgress.length === 1) {
                  notProgress = [];
                } else {
                  notProgress.splice(idx, 1);
                }
              }
              jobs++;
            } else {
              break;
            }
          }
        } else if (elevator.isStarted && elevator.src > elevator.dest) {
          let descendCall = [];
          for (let call of notProgress) {
            if (
              elevator.floor > call.start &&
              call.start > call.end &&
              call.end > elevator.dest
            ) {
              descendCall.push(call);
            }
          }
          for (let call of descendCall) {
            if (jobs < 8) {
              elevator.addCall(call);
              progress.push(call);
              const idx = notProgress.findIndex(function (item) {
                return item.id === call.id;
              });
              if (idx > -1) {
                if (notProgress.length === 1) {
                  notProgress = [];
                } else {
                  notProgress.splice(idx, 1);
                }
              }
              jobs++;
            } else {
              break;
            }
          }
        }
      }

      const elevator_action = await elevator.updateAction();
      if (typeof elevator_action === "object") {
        let callId = [];
        if (elevator_action.length > 2) {
          for (let i = 1; i < elevator_action.length; i++) {
            callId.push(elevator_action[i]);
          }
        } else {
          callId.push(elevator_action[1]);
        }
        if (elevator_action[0] === "enter") {
          commands.push({
            elevator_id: elevator.id,
            command: "ENTER",
            call_ids: callId,
          });
        } else if (elevator_action[0] === "exit") {
          commands.push({
            elevator_id: elevator.id,
            command: "EXIT",
            call_ids: callId,
          });
        }
      } else {
        commands.push({ elevator_id: elevator.id, command: elevator_action });
      }
    }
    try {
      await action(token, commands);
    } catch (error) {
      console.log(error);
      return;
    }
  }
}

solve();
