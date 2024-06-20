let tape = localStorage.getItem('tape');
//document.getElementById("difficulty").innerHTML = "难度：" + localStorage.getItem('difficulty');
document.getElementById("environment").innerHTML = "环境：" + localStorage.getItem('env');
let env = JSON.parse(localStorage.getItem('env'));
document.getElementById("sheet").innerHTML = "谱子：" + tape;
tape = JSON.parse(tape);

import { key2note, velocity_levels, velocity_adj, init_constants, beat } from './constants.js'
init_constants();
import { keyup_animation, keydown_animation } from './keyboard.js'

const position_diff = 10, mid = 4, column_cnt = 7;
const available_key = "ASD GHJ";
const other_key = "ZXCVBNMQWERTYU";
var note2col = [];
var position = [];

for (var i = 1; i <= 7; i++) {
    var pos = (i - mid) * position_diff + 50;
    position[i] = pos;
    const buttom = document.getElementById("btm" + i);
    buttom.style.left = "50%";
    const line = document.getElementById('line' + i);
    line.style.left = "50%";
    const point = document.getElementById('ptn' + i);
    point.style.left = "50%";
    const column= document.getElementById('column' + i);
    column.style.left = pos + "%";
    note2col[available_key.charCodeAt(i - 1)] = i;
    note2col[other_key.charCodeAt(i - 1)] = i;
    note2col[other_key.charCodeAt(i - 1 + 7)] = i;
}
note2col["R".charCodeAt()] = 5;
note2col["F".charCodeAt()] = 5;
note2col["V".charCodeAt()] = 5;

const key2col = note2col;
const col4 = document.getElementById("column4");
col4.parentNode.removeChild(col4);

const trigger_line = document.getElementById('trigger-line');
trigger_line.style.height = "2px";

import { context, drum, piano, stroke } from "./player.js";

const frame_rate = 60;

var bgm_notes = [], triggers = [], lines = [];

const drop_time = 1200, start_pos = 0, trigger_pos = 70, end_pos = 85;
const trigger_duration = trigger_pos - start_pos, all_duration = end_pos - start_pos;
const trigger_time = Math.round(drop_time / (all_duration) * (trigger_duration));

function create_clock() {
    var start_time, pause_time;
    function start() {
        start_time = new Date().getTime();
        pause_time = 0;
    }
    function get() {
        if (pause_time != 0) return pause_time - start_time;
        return new Date().getTime() - start_time;
    }
    function pause() {
        pause_time = new Date().getTime();
    }
    function resume() {
        start_time += new Date().getTime() - pause_time;
        pause_time = 0;
    }
    function is_paused() {
        return pause_time != 0;
    }
    return {
        start: start,
        get: get,
        pause: pause,
        resume: resume,
        is_paused: is_paused,
    };
}

const clock = create_clock();

let onstage_lines = new Set();
let onstage_triggers = [];
for (var i = 1; i <= column_cnt; i++) {
    onstage_triggers[i] = new Set();
}

function remove_element(ele) {
    if (ele == undefined) return;
    const par = ele.parentNode;
    par.removeChild(ele);
}

function draw_trigger(id) {
    const trigger = triggers[id];
    const col = trigger.column;
    const trigger_element = document.createElement('div');
    trigger_element.classList.add(`trigger-${trigger.type}`);
    //trigger_element.classList.add(`trigger-1`);
    trigger_element.setAttribute('id', `ingame-trigger-${id}`);
    //console.log(`draw trigger on ${col}`);
    const column = document.getElementById('column' + col);
    column.appendChild(trigger_element);
}

function remove_trigger(id) {
    remove_element(document.getElementById(`ingame-trigger-${id}`));
}

function draw_line(id) {
    const L = lines[id].left, R = lines[id].right;
    const line = document.createElement('div');
    line.classList.add('hori-line');
    //console.log(`draw line on ${L} ${R} ${position[L]}%, ${position[R]}%`);
    line.setAttribute('id', `ingame-line-${id}`);
    line.style.left = position[L] + "%";
    line.style.width = (position[R] - position[L]) + "%";
    const stage = document.getElementById('stage');
    stage.appendChild(line);
}

function remove_line(id) {
    remove_element(document.getElementById(`ingame-line-${id}`));
}

const status_elements = document.getElementsByClassName('status');

for (var i = 0; i < status_elements.length; i++) {
    status_elements[i].innerHTML = "<img class=\"stat-img\"src=./scores/perfect.png></img>";
}

const id2note = ["hihat-close", "hihat-open"];

function hit(col) {
    console.log(`hit ${col}`);
    const time = clock.get();
    var id = -1;
    onstage_triggers[col].forEach((candidate_id) => {
        const tri = triggers[candidate_id];
        if (tri.used == 0 && 
            (id == -1 || Math.abs(time - triggers[id].time) > Math.abs(time - triggers[candidate_id].time))) {
            id = candidate_id;
        }
    });
    if (id == -1) return;
    const diff = Math.abs(time - triggers[id].time);
    console.log(`diff: ${diff} id: ${id}`);
    if (diff <= 200) {
        triggers[id].used = 1;
        const ele = document.getElementById(`ingame-trigger-${id}`);
        ele.style.opacity = 0;
        if (diff > 100) {
            ele.style.backgroundColor = "#f99";
        } else {
            drum.start({ note: id2note[triggers[id].type] });
            if (diff <= 50) {
                ele.style.backgroundColor = "#afa";
            } else {
                ele.style.backgroundColor = "#99f";
            }
        }
    }
}

document.addEventListener("keydown", function(event) {
    var key = event.key.toUpperCase();
    var code = key.charCodeAt();
    if (event.repeat) {
        return;
    }
    console.log(`${key} ${code} down`);
    if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
    }
    if (key == " " || key == "ESCAPE") {
        if (clock.is_paused()) {
            clock.resume();
        } else {
            clock.pause();
        }
        return;
    }
    var index = available_key.indexOf(key);
    if (index != -1) {
        index++;
        hit(index);
        //const stat_ele = document.getElementById("status" + index);
        //const point_ele = document.getElementById("ptn" + index);
        //stat_ele.style.opacity = 1;
        //setTimeout(function() {
        //    stat_ele.style.opacity = 0;
        //}, 100);
        //point_ele.style.boxShadow = "0 0 40px 10px #0f0, 0 0 20px 0px #0f0 inset";
        keydown_animation(code);
        //draw_note(index + 1);
    }
});

document.addEventListener("keyup", function(event) {
    var key = event.key.toUpperCase();
    var code = key.charCodeAt();
    console.log(`${key} ${code} up`);
    if (key == " ") return;
    var index = available_key.indexOf(key);
    if (index != -1) {
        index++;
        var op = 1;
        const stat_ele = document.getElementById("status" + index);
        const point_ele = document.getElementById("ptn" + index);
        point_ele.style.boxShadow = "";
        keyup_animation(code);
    }
});

function play() {
    console.log(`------- start playing (bgm_count:${bgm_notes.length}) -------`);
    const events = [];
    for (var i = 0; i < lines.length; i++) {
        events.push({
            time: lines[i].time - trigger_time,
            name: "add line",
            index: i,
        });
        events.push({
            time: lines[i].time,
            name: "delete line",
            index: i,
        });
    }
    for (var i = 0; i < triggers.length; i++) {
        const tri = triggers[i];
        events.push({
            time: tri.time - trigger_time,
            name: "add trigger",
            index: i,
        });
        events.push({
            time: tri.time - trigger_time + drop_time,
            name: "delete trigger",
            index: i,
        });
    }
    console.log(`event count: ${events.length}`);
    events.sort((a, b) => a.time - b.time);
    console.log(`event count: ${events.length}`);
    for (var i = 0; i < events.length; i++) console.log(events[i]);
    var event_pos = 0, bgm_pos = 0;
    var frame_time = 1000 / frame_rate;
    var interval_id;
    function frame() {
        if (clock.is_paused()) return;
        //console.log(`frame on ${clock.get()}`);
        while (events.length - event_pos > 0) {
            const eve = events[event_pos];
            if (clock.get() > eve.time) {
                //console.log(eve.name);
                switch (eve.name) {
                    case "add line":
                        draw_line(eve.index);
                        onstage_lines.add(eve.index);
                    break;

                    case "delete line":
                        remove_line(eve.index);
                        onstage_lines.delete(eve.index);
                    break;

                    case "add trigger":
                        const column = triggers[eve.index].column;
                        //console.log(`add trigger at ${column}`);
                        draw_trigger(eve.index);
                        onstage_triggers[column].add(eve.index);
                    break;

                    case "delete trigger":
                        remove_trigger(eve.index);
                        onstage_triggers[triggers[eve.index].column].delete(eve.index);
                    break;
                }
                event_pos++;
            } else {
                break;
            }
        }
        if (event_pos >= events.length) {
            clearInterval(interval_id);
        }
        while (bgm_notes.length - bgm_pos > 0) {
            const note = bgm_notes[bgm_pos];
            if (clock.get() > note.time) {
                if (note.instrument == 'piano') {
                    //console.log(note.options);
                    piano.start(note.options);
                } else {
                    drum.start(note.options);
                }
                bgm_pos++;
            } else {
                break;
            }
        }
        onstage_lines.forEach((id) => {
            var element = document.getElementById(`ingame-line-${id}`);
            var time = clock.get() - (lines[id].time - trigger_time);
            var pos = (time / drop_time) * (end_pos - start_pos) + start_pos;
            element.style.top = pos + "%";
        });
        for (var i = 1, id; i <= column_cnt; i++) {
            onstage_triggers[i].forEach((id) => {
                var element = document.getElementById(`ingame-trigger-${id}`);
                var time = clock.get() - (triggers[id].time - trigger_time);
                var pos = (time / drop_time) * (end_pos - start_pos) + start_pos;
                if (time > trigger_time + 150) {
                    element.style.backgroundColor = "#f99";
                    element.style.opacity = 0;
                    triggers[id].used = 1;
                    console.log("miss");
                }
                if (triggers[id].used == 0) {
                    element.style.top = pos + "%";
                }
                //console.log(`set #${id} to ${pos}%`);
            });
        }
    }
    clock.start();
    interval_id = setInterval(frame, frame_time);
}

function code_wrap(code) {
    var new_code = code + env.global_offset + env.fixed_offset[code % 12];
    return new_code;
}

function parse(tape) {
    console.log("------- start parsing -------");
    console.log(`tape: \n ${tape} \n`);
    lines = [], triggers = [];
    var interval = 60 * 4 * 1000 / env.bpm / env.time2;
    var velc = env.velocity;
    var stack = []; stack.push(1);
    var cnt = 0;
    var sum = 0;
    var getTop = arr => arr[arr.length - 1];
    var tmpoffset = 0, octoffset = 0;
    var startoffset = Math.max(500, drop_time - interval * env.time1);
    for (var i = 0, drum_note, beat_type; i < env.time1; i++) {
        if (beat[env.time1] != undefined) {
            beat_type = beat[env.time1][i];
        } else {
            beat_type = (i == 0) ? 2 : 0;
        }
        switch (beat_type) {
            case 2:
                drum_note = "conga-hi";
                break;
            case 1:
                drum_note = "conga-mid";
                break;
            default:
                drum_note = "conga-low";
            break;
        }
        bgm_notes.push({
            instrument: "drum",
            options: {
                note: drum_note,
            },
            time: startoffset + interval * i,
        });
    }
    sum = env.time1;
    var chord_note_cnt = [0, 0, 0, 0, 0, 0, 0, 0];
    console.log(tape);
    for (var i = 0; i < tape.length; i++) {
        var key = tape.charCodeAt(i);
        console.log(i, tape[i], key);
        switch (tape[i]) {
            case '(':
                //console.log("chord start", tape[i + 1]);
                chord_note_cnt.fill(0);
                stack.push(0);
                break;
            case ')':
                stack.pop();
                var minid = 10, maxid = 0;
                for (var j = 1; j <= column_cnt; j++) {
                    if (chord_note_cnt[j] >= 1) {
                        minid = Math.min(minid, j);
                        maxid = Math.max(maxid, j);
                        if (chord_note_cnt[j] > 1) {
                            triggers.push({
                                column: j,
                                time: sum * interval + startoffset,
                                type: 1,
                                used: 0,
                            });
                            //bgm_notes.push({
                            //    instrument: "drum",
                            //    time: sum * interval + startoffset,
                            //    options: {
                            //        note: "hihat-open",
                            //    }
                            //});
                        } else {
                            triggers.push({
                                column: j,
                                time: sum * interval + startoffset,
                                type: 0,
                                used: 0,
                            });
                            //bgm_notes.push({
                            //    instrument: "drum",
                            //    time: sum * interval + startoffset,
                            //    options: {
                            //        note: "hihat-close",
                            //    }
                            //});
                        }
                    }
                }
                if (minid < maxid) {
                    lines.push({
                        left: minid,
                        right: maxid,
                        time: sum * interval + startoffset,
                    });
                }
                cnt += getTop(stack);
                sum += getTop(stack);
                //console.log("chord end");
                break;
            case '[':
                stack.push(getTop(stack) / 2);
                break;
            case ']':
                stack.pop();
                break;
            case '{':
                stack.push(getTop(stack) * 2 / 3);
                break;
            case '}':
                stack.pop();
                break;
            case '>':
                if (velc > 0) velc--;
                break;
            case '<':
                if (velc < 9) velc++;
                break;
            case '-':
                tmpoffset--;
                break;
            case '+':
                tmpoffset++;
                break;
            case '^':
                if (octoffset == 0) octoffset = 1;
                else                octoffset = 0;
                break;
            case '/':
                break;
            case '%':
                if (octoffset == 0) octoffset = -1;
                else                octoffset = 0;
                break;

            case '.':
                //console.log("interval", interval, sum);
                cnt += getTop(stack);
                sum += getTop(stack);
                break;

            default:
                var cur_step = getTop(stack);
                var note_code = code_wrap(key2note.get(key) + tmpoffset + octoffset * 12);
                bgm_notes.push({
                    instrument: "piano",
                    options: {
                        note: note_code,
                        velocity: velocity_levels[velc] + velocity_adj[note_code],
                    },
                    time: sum * interval + startoffset,
                });
                if (cur_step == 0) {
                    chord_note_cnt[key2col[key]]++;
                } else {
                    triggers.push({
                        column: key2col[key],
                        time: sum * interval + startoffset,
                        type: 0,
                        used: 0
                    });
                    //bgm_notes.push({
                    //    instrument: "drum",
                    //    time: sum * interval + startoffset,
                    //    options: {
                    //        note: "hihat-close",
                    //    }
                    //});
                    cnt += cur_step;
                    sum += cur_step;
                }
                tmpoffset = 0;
                break;
        }
    }
    bgm_notes.sort((a, b) => a.time - b.time);
    console.log(`------- parsed ${triggers.length} / ${lines.length} -------`);
}

document.getElementById('gamestart').onclick = () => {
    parse(tape.main);
    new Promise((resolve, reject) => { play() });
};

window.onload = function() {
};

