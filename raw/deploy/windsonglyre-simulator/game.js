let tape = localStorage.getItem('tape');
let env = JSON.parse(localStorage.getItem('env'));
let delay = parseInt(localStorage.getItem('delay'));
console.log(`环境：${env}`);
console.log(`谱子：${tape}`);
console.log(`延迟：${delay}`);
tape = JSON.parse(tape);

import { key2note, velocity_levels, velocity_adj, init_constants, beat } from './constants.js'
init_constants();
import { keyup_animation, keydown_animation } from './keyboard.js'

const position_diff = 10, mid = 4, column_cnt = 7;
const available_key = "SDF JKL";
const all_note = "ASDFGHJZXCVBNMQWERTYU";
let note2col = [];
let key2col = [];
let position = [];

for (let i = 1; i <= 7; i++) {
    const pos = (i - mid) * position_diff + 50;
    position[i] = pos;
    const buttom = document.getElementById("btm" + i);
    buttom.style.left = "50%";
    const line = document.getElementById('line' + i);
    line.style.left = "50%";
    const point = document.getElementById('ptn' + i);
    point.style.left = "50%";
    const column= document.getElementById('column' + i);
    column.style.left = pos + "%";
    note2col[all_note.charCodeAt(i - 1)] = i;
    note2col[all_note.charCodeAt(i - 1 + 7)] = i;
    note2col[all_note.charCodeAt(i - 1 + 14)] = i;
    if (available_key[i - 1] != " ") {
        key2col[available_key.charCodeAt(i - 1)] = i;
    }
}
note2col["R".charCodeAt()] = 5;
note2col["F".charCodeAt()] = 5;
note2col["V".charCodeAt()] = 3;

const col4 = document.getElementById("column4");
col4.parentNode.removeChild(col4);

const trigger_line = document.getElementById('trigger-line');
trigger_line.style.height = "2px";

import { context, drum, piano, stroke } from "./player.js";

const frame_rate = 120;

let bgm = {
    notes: [],
    mute: 0,
};

let triggers = [], lines = [];

const drop_time = 1200, start_pos = 0, trigger_pos = 70, end_pos = 85;
const trigger_duration = trigger_pos - start_pos, all_duration = end_pos - start_pos;
const trigger_time = Math.round(drop_time / (all_duration) * (trigger_duration));

function create_clock() {
    let start_time, pause_time;
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
    function forward(milliseconds) {
        start_time -= milliseconds;
    }
    function backward(milliseconds) {
        start_time += milliseconds;
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

let stage = {
    lines: new Set(),
    triggers: [],
};

for (let i = 1; i <= column_cnt; i++) {
    stage.triggers[i] = new Set();
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
const perfect_time = 50, miss_time = 100, catch_time = 250;
const levels = [
    { score: 147, name: "SS"},
    { score: 120, name: "S" },
    { score:  97, name: "A+" },
    { score:  93, name: "A" },
    { score:  87, name: "A-" },
    { score:  83, name: "B+" },
    { score:  78, name: "B" },
    { score:  70, name: "B-" },
    { score:  60, name: "C" },
    { score:   0, name: "D" },
];

let score = {
    sum: 0,
    diff_sum: 0,
    combo: 0,
    miss: 0, hit: 0,
    fast: 0, slow: 0,
    created: 0,
    init: function () {
        this.diff_sum = 0,
        this.sum = this.combo = 0, 
        this.created = 0,
        this.fast = this.slow = 0;
        this.miss = this.hit = 0;
    }
};

const id2note = ["hihat-close", "hihat-open"];

function get_rank() {
    const expect = (score.miss + score.hit) * 5;
    const get = score.sum * (score.miss == 0 ? 1.5 : 1);
    const normalized = get / expect * 100;
    let name = "D";
    console.log(`normalized score: ${normalized}`);
    for (let i = 0; i < levels.length; i++) {
        if (normalized >= levels[i].score) {
            name = levels[i].name;
            break;
        }
    }
    return name;
}

function reflesh() {
    const score_element = document.getElementById('score');
    score_element.innerHTML = `${tape.name}&nbsp;|&nbsp;score: ${score.sum}, combo: ${score.combo}, rank: ${get_rank()}`
    const diff_element = document.getElementById('avg-diff');
    diff_element.innerHTML = `avg diff: ${(score.diff_sum / score.hit).toFixed(2)}ms`;
}

function draw_status(col, name, color = "#fff") {
    const status_element = document.createElement('div');
    const column = document.getElementById('column' + col);
    status_element.classList.add('status');
    status_element.innerHTML = `<img class="stat-img" src=./scores/${name}.png></img>`;
    column.appendChild(status_element);
    return status_element;
}

function hit(col) {
    const time = clock.get() - delay;
    let id = -1;
    stage.triggers[col].forEach((candidate_id) => {
        const tri = triggers[candidate_id];
        if (tri.hitted == 0 && 
            (id == -1 || Math.abs(time - triggers[id].time) > Math.abs(time - triggers[candidate_id].time))) {
            id = candidate_id;
        }
    });
    if (id == -1) return;
    const diff = time - triggers[id].time;
    const absdiff = Math.abs(diff);
    if (absdiff <= catch_time) {
        triggers[id].hitted = 1;
        const ele = document.getElementById(`ingame-trigger-${id}`);
        ele.style.opacity = 0;
        if (absdiff > miss_time) {
            ele.style.backgroundColor = "#f99";
            ele.style.boxShadow = "0 0 40px 10px #f55, 0 0 20px 0px #f55 inset";
            score.combo = 0;
            score.miss++;
            console.log(`bad at ${col}, diff: ${diff}`);
            const status_ele = draw_status(col, "bad", "#f55");
            setTimeout(() => {remove_element(status_ele)}, 1000);
        } else {
            score.diff_sum += diff;
            drum.start({ note: id2note[triggers[id].type] });
            score.combo++;
            score.hit++;
            if (diff > 0) {
                score.slow++;
            } else {
                score.fast++;
            }
            if (absdiff <= perfect_time) {
                console.log(`perfect at ${col}, diff: ${diff}`);
                ele.style.backgroundColor = "#afa";
                ele.style.boxShadow = "0 0 40px 10px #8f9, 0 0 20px 0px #8f9 inset";
                score.sum += 5;
                const status_ele = draw_status(col, "perfect", "#8f9");
                setTimeout(() => {remove_element(status_ele)}, 1000);
            } else {
                console.log(`good at ${col}, diff: ${diff}`);
                ele.style.backgroundColor = "#9cf";
                ele.style.boxShadow = "0 0 40px 10px #6af, 0 0 20px 0px #6af inset";
                score.sum += 3;
                const status_ele = draw_status(col, "good", "#6af");
                setTimeout(() => {remove_element(status_ele)}, 1000);
            }
        }
        reflesh();
    }
}

document.addEventListener("keydown", function(event) {
    let key = event.key.toUpperCase();
    let code = key.charCodeAt();
    if (event.repeat) {
        return;
    }
    //console.log(`${key} ${code} down`);
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
    let index = available_key.indexOf(key);
    if (index != -1) {
        hit(key2col[code]);
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
    const key = event.key.toUpperCase();
    const code = key.charCodeAt();
    //console.log(`${key} ${code} up`);
    if (key == " ") return;
    let index = available_key.indexOf(key);
    if (index != -1) {
        index++;
        const stat_ele = document.getElementById("status" + index);
        const point_ele = document.getElementById("ptn" + index);
        point_ele.style.boxShadow = "";
        keyup_animation(code);
    }
});

function play() {
    score.init();
    console.log(`------- start playing (bgm_count:${bgm.notes.length}) -------`);
    const events = [];
    for (let i = 0; i < lines.length; i++) {
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
    for (let i = 0; i < triggers.length; i++) {
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
    for (let i = 0; i < events.length; i++) console.log(events[i]);
    let event_pos = 0, bgm_pos = 0;
    let frame_time = 1000 / frame_rate;
    let interval_id;
    function frame() {
        if (clock.is_paused()) return;
        //console.log(`frame ${clock.get()} start`);
        while (events.length - event_pos > 0) {
            const eve = events[event_pos];
            if (clock.get() > eve.time) {
                //console.log(eve.name);
                switch (eve.name) {
                    case "add line":
                        draw_line(eve.index);
                        stage.lines.add(eve.index);
                    break;

                    case "delete line":
                        remove_line(eve.index);
                        stage.lines.delete(eve.index);
                    break;

                    case "add trigger":
                        const column = triggers[eve.index].column;
                        //console.log(`add trigger at ${column}`);
                        draw_trigger(eve.index);
                        stage.triggers[column].add(eve.index);
                        score.created++;
                    break;

                    case "delete trigger":
                        remove_trigger(eve.index);
                        stage.triggers[triggers[eve.index].column].delete(eve.index);
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
        while (bgm.notes.length - bgm_pos > 0) {
            const note = bgm.notes[bgm_pos];
            if (clock.get() > note.time) {
                if (bgm.mute == 0) {
                    if (note.instrument == 'piano') {
                        //console.log(note.options);
                        piano.start(note.options);
                    } else {
                        drum.start(note.options);
                    }
                }
                bgm_pos++;
            } else {
                break;
            }
        }
        stage.lines.forEach((id) => {
            const element = document.getElementById(`ingame-line-${id}`);
            const time = clock.get() - (lines[id].time - trigger_time);
            const pos = (time / drop_time) * (end_pos - start_pos) + start_pos;
            element.style.top = pos + "%";
        });
        for (let i = 1, id; i <= column_cnt; i++) {
            stage.triggers[i].forEach((id) => {
                if (triggers[id].hitted == 0) {
                    const element = document.getElementById(`ingame-trigger-${id}`);
                    const time = clock.get() - (triggers[id].time - trigger_time);
                    const pos = (time / drop_time) * (end_pos - start_pos) + start_pos;
                    element.style.top = pos + "%";
                    if (time > trigger_time + miss_time) {
                        element.style.backgroundColor = "#f99";
                        element.style.opacity = 0;
                        element.style.boxShadow = "0 0 40px 10px #f55, 0 0 20px 0px #f55 inset";
                        triggers[id].hitted = 1;
                        console.log(`miss at ${i}`);
                        const status_ele = draw_status(i, "miss", "#f55");
                        setTimeout(() => {remove_element(status_ele)}, 1000);
                        score.combo = 0;
                        score.miss++;
                        reflesh();
                    }
                //console.log(`set #${id} to ${pos}%`);
                }
            });
        }
        //console.log(`frame ${clock.get()} done`);
    }
    clock.start();
    interval_id = setInterval(frame, frame_time);
}

function code_wrap(code) {
    let new_code = code + env.global_offset + env.fixed_offset[code % 12];
    return new_code;
}

function parse(tape) {
    console.log("------- start parsing -------");
    console.log(`tape: \n ${tape} \n`);
    lines = [], triggers = [];
    let interval = 60 * 4 * 1000 / env.bpm / env.time2;
    let velc = env.velocity;
    let stack = []; stack.push(1);
    let cnt = 0;
    let sum = 0;
    let getTop = arr => arr[arr.length - 1];
    let tmpoffset = 0, octoffset = 0;
    let startoffset = Math.max(500, drop_time - interval * env.time1);
    for (let i = 0, drum_note, beat_type; i < env.time1; i++) {
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
        bgm.notes.push({
            instrument: "drum",
            options: {
                note: drum_note,
            },
            time: startoffset + interval * i,
        });
    }
    sum = env.time1;
    let chord_note_cnt = [0, 0, 0, 0, 0, 0, 0, 0];
    console.log(tape);
    for (let i = 0; i < tape.length; i++) {
        let key = tape.charCodeAt(i);
        console.log(i, tape[i], key);
        switch (tape[i]) {
            case '(':
                //console.log("chord start", tape[i + 1]);
                chord_note_cnt.fill(0);
                stack.push(0);
                break;
            case ')':
                stack.pop();
                let minid = 10, maxid = 0;
                for (let j = 1; j <= column_cnt; j++) {
                    if (chord_note_cnt[j] >= 1) {
                        minid = Math.min(minid, j);
                        maxid = Math.max(maxid, j);
                        if (chord_note_cnt[j] > 1) {
                            triggers.push({
                                column: j,
                                time: sum * interval + startoffset,
                                type: 1,
                                hitted: 0,
                            });
                            //bgm.notes.push({
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
                                hitted: 0,
                            });
                            //bgm.notes.push({
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
                let cur_step = getTop(stack);
                let note_code = code_wrap(key2note.get(key) + tmpoffset + octoffset * 12);
                bgm.notes.push({
                    instrument: "piano",
                    options: {
                        note: note_code,
                        velocity: velocity_levels[velc] + velocity_adj[note_code],
                    },
                    time: sum * interval + startoffset,
                });
                if (cur_step == 0) {
                    chord_note_cnt[note2col[key]]++;
                } else {
                    triggers.push({
                        column: note2col[key],
                        time: sum * interval + startoffset,
                        type: 0,
                        hitted: 0
                    });
                    //bgm.notes.push({
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
    bgm.notes.sort((a, b) => a.time - b.time);
    console.log(`------- parsed ${triggers.length} / ${lines.length} -------`);
}

const gamestart_button = document.getElementById('gamestart');
gamestart_button.onclick = () => {
    gamestart_button.parentNode.removeChild(gamestart_button);
    parse(tape.main);
    new Promise((resolve, reject) => { play() });
};

window.onload = function() {
};

