let tape = localStorage.getItem('tape');
let env = JSON.parse(localStorage.getItem('env'));
let delay = parseInt(localStorage.getItem('delay'));
let is_tutorial = parseInt(localStorage.getItem('is_tutorial'));
let difficulty = parseInt(localStorage.getItem('difficulty'));
console.log(`环境：${env}`);
console.log(`谱子：${tape}`);
console.log(`延迟：${delay}`);
tape = JSON.parse(tape);

import { key2note, velocity_levels, velocity_adj, init_constants, beat } from './constants.js'
init_constants();
import { keyup_animation, keydown_animation } from './keyboard.js'

const colors = {
    fill: {
        red: "#f99",
        green: "#afa",
        blue: "#9cf",
    },
    shadow: {
        red: "#f55",
        green: "#8f9",
        blue: "#6af",
    },
}

function remove_element(ele) {
    if (ele == undefined) return;
    const par = ele.parentNode;
    par.removeChild(ele);
}

const all_note = "ASDFGHJZXCVBNMQWERTYU";
let note2col = [];
let key2col = [];
let position = [];
let available_key = "";

const drop_time = 1200;
const trigger_time = drop_time * 0.80 + delay;
const start_pos = 0, end_pos = 85, trigger_pos = (trigger_time / drop_time) * (end_pos - start_pos) + start_pos;
const trigger_duration = trigger_pos - start_pos, all_duration = end_pos - start_pos;
let is_playing = 0;

for (let i = 1; i <= 7; i++) {
    const pos = (i - 4) * 10 + 50;
    position[i] = pos;
    const buttom = document.getElementById("btm" + i);
    buttom.style.left = "50%";
    const line = document.getElementById('line' + i);
    line.style.left = "50%";
    const point = document.getElementById('ptn' + i);
    point.style.left = "50%";
    const column= document.getElementById('column' + i);
    column.style.left = pos + "%";
    const trigger_ptn = document.getElementById('ptn' + i);
    trigger_ptn.style.top = trigger_pos + "%";
}
const trigger_line = document.getElementById('trigger-line');
const screen = document.getElementById('screen');
const info_window = document.getElementById('info-window');
const result_window = document.getElementById('result-window');
const title_element = document.getElementById('song-name');
const song_info_element = document.getElementById('song-info');
title_element.innerHTML = tape.name;
const level2name = ['简单','较简单','普通','较困难','困难'];
let song_info = "";
if (is_tutorial == 1) {
    song_info = `${level2name[difficulty]} | bpm ${env.bpm} | 演示模式`;
} else {
    song_info = `${level2name[difficulty]} | bpm ${env.bpm}`;
}

song_info_element.innerHTML = song_info;
trigger_line.style.top = trigger_pos + "%";
const playing_song_name = document.getElementById('playing-song-name');
playing_song_name.style.opacity = 0;
playing_song_name.innerHTML = tape.name;

if (difficulty >= 2) {
    available_key = "SDF JKL";
    for (let i = 1; i <= 7; i++) {
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

    remove_element(document.getElementById("column4"));
} else {
    available_key = " DF JK "
    let merge = [0, 2, 3, 3, 5, 5, 6, 6];
    for (let i = 1; i <= 7; i++) {
        note2col[all_note.charCodeAt(i - 1)] = merge[i];
        note2col[all_note.charCodeAt(i - 1 + 7)] = merge[i];
        note2col[all_note.charCodeAt(i - 1 + 14)] = merge[i];
        if (available_key[i - 1] != " ") {
            key2col[available_key.charCodeAt(i - 1)] = i;
        }
    }
    remove_element(document.getElementById("column1"));
    remove_element(document.getElementById("column4"));
    remove_element(document.getElementById("column7"));
    trigger_line.style.width = "40%";
}


import { context, drum, piano, stroke } from "./player.js";

const frame_rate = 120;

let bgm = {
    notes: [],
    mute: 0,
};

const triggers = [], lines = [];

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
        forward: forward,
        backward: backward,
    };
}

const clock = create_clock();

let stage = {
    lines: new Set(),
    triggers: [],
};

for (let i = 1; i <= 7; i++) {
    stage.triggers[i] = new Set();
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
const perfect_time = 50, miss_time = 100, catch_time = 350;
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
    combo: 0, max_combo: 0,
    miss: 0, hit: 0, perfect: 0,
    fast: 0, slow: 0,
    created: 0,
    init: function () {
        this.diff_sum = 0,
        this.sum = this.combo = this.max_combo = 0, 
        this.created = 0,
        this.fast = this.slow = 0;
        this.miss = this.hit = this.perfect = 0;
    }
};

const id2note = ["hihat-close", "hihat-open"];

function get_normalized_score() {
    const expect = (score.miss + score.hit) * 5;
    const get = score.sum * (score.miss == 0 ? 1.5 : 1);
    const normalized = get / expect * 100;
    return normalized;
}

function get_rank() {
    const normalized = get_normalized_score();
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
    //score_element.innerHTML = `score: ${score.sum}, combo: ${score.combo}, rank: ${get_rank()}`
    score_element.innerHTML = `${score.sum}&nbsp;`
    const diff_element = document.getElementById('avg-diff');
    diff_element.innerHTML = `avg: ${(score.diff_sum / score.hit).toFixed(2)}ms`;
}

function draw_status(col, name) {
    const status_element = document.createElement('div');
    const column = document.getElementById('column' + col);
    status_element.classList.add('status');
    status_element.innerHTML = `<img class="stat-img" src=./scores/${name}.png></img>`;
    column.appendChild(status_element);
    return status_element;
}

function hit(col) {
    if (is_tutorial == 1 || clock.is_paused()) return;
    const time = clock.get();
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
            ele.style.backgroundColor = colors.fill.red;
            ele.style.boxShadow = `0 0 40px 10px ${colors.shadow.red}, 0 0 20px 0px ${colors.shadow.red} inset`;
            score.combo = 0;
            score.miss++;
            console.log(`bad at ${col}, diff: ${diff}`);
            const status_ele = draw_status(col, "bad");
            setTimeout(() => {remove_element(status_ele)}, 1000);
        } else {
            score.diff_sum += diff;
            drum.start({ note: id2note[triggers[id].type] });
            score.combo++;
            score.max_combo = Math.max(score.max_combo, score.combo);
            score.hit++;
            if (diff > 0) {
                score.slow++;
            } else {
                score.fast++;
            }
            if (absdiff <= perfect_time) {
                console.log(`perfect at ${col}, diff: ${diff}`);
                ele.style.backgroundColor = colors.fill.green;
                ele.style.boxShadow = `0 0 40px 10px ${colors.shadow.green}, 0 0 20px 0px ${colors.shadow.green} inset`;
                score.sum += 5;
                const status_ele = draw_status(col, "perfect");
                setTimeout(() => {remove_element(status_ele)}, 1000);
                score.perfect++;
            } else {
                console.log(`good at ${col}, diff: ${diff}`);
                ele.style.backgroundColor = colors.fill.blue;
                ele.style.boxShadow = `0 0 40px 10px ${colors.shadow.blue}, 0 0 20px 0px ${colors.shadow.blue} inset`;
                score.sum += 3;
                const status_ele = draw_status(col, "good");
                setTimeout(() => {remove_element(status_ele)}, 1000);
            }
        }
        reflesh();
    }
}

function is_paused() {
    return clock.is_paused();
}

function pause() {
    clock.pause();
    playing_song_name.style.opacity = 0;
    screen.style.filter = "brightness(0.3)";
    info_window.style.opacity = "1";
}

function result() {
    playing_song_name.style.opacity = 0;
    screen.style.filter = "brightness(0.3)";
    result_window.innerHTML = ``;
    result_window.style.opacity = 1;
    result_window.innerHTML = 
`
<div id="result-window-level" style="padding: 3em; text-align: center;"> 
    <img src=./scores/${get_rank()}.png class="result-level-img">
</div>
<div id="result-window-info" style="padding: 3em"> 
    <p>
    <span class="title">${tape.name}</span>
    </p>
    <p>
    <span class="bright" style="font-size: x-large">${song_info}</span>
    </p>
    <p class="bright">
    Normalized Score: ${get_normalized_score().toFixed(2)}<br>
    Note Count: ${score.hit + score.miss}<br>
    Perfect / Good / Miss: ${score.perfect} / ${score.hit - score.perfect} / ${score.miss}<br>
    Max Combo: ${score.max_combo}<br>
    </p>
</div>
`;
}

function resume() {
    playing_song_name.style.opacity = 1;
    screen.style.filter = "brightness(1)";
    clock.resume();
    info_window.style.opacity = "0";
}

const events = [];

function play() {
    score.init();
    console.log(`------- start playing (bgm_count:${bgm.notes.length}) -------`);
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
    //for (let i = 0; i < events.length; i++) console.log(events[i]);
    let event_pos = 0, bgm_pos = 0;
    let frame_time = 1000 / frame_rate;
    let interval_id;
    const progress_line = document.getElementById("progress-line");
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
            if (is_playing == 1) {
                is_playing = 0;
                result();
            }
        }
        const progress = event_pos / events.length;
        progress_line.style.right = (1 - progress) * 100 + "%";
        if (score.miss != 0) {
            progress_line.style.backgroundColor = '#fff';
            progress_line.style.boxShadow = `0 0 15px 3px #fff`;
        } else {
            if (score.perfect == score.hit) {
                progress_line.style.backgroundColor = colors.fill.green;
                progress_line.style.boxShadow = `0 0 15px 3px ${colors.fill.green}`;
            } else {
                progress_line.style.backgroundColor = colors.fill.blue;
                progress_line.style.boxShadow = `0 0 15px 3px ${colors.fill.blue}`;
            }
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
        for (let i = 1, id; i <= 7; i++) {
            stage.triggers[i].forEach((id) => {
                if (triggers[id].hitted == 0) {
                    const element = document.getElementById(`ingame-trigger-${id}`);
                    const time = clock.get() - (triggers[id].time - trigger_time);
                    const pos = (time / drop_time) * (end_pos - start_pos) + start_pos;
                    element.style.top = pos + "%";
                    if (is_tutorial == 1 && time >= trigger_time) {
                        element.style.opacity = 0;
                        element.style.backgroundColor = colors.fill.green;
                        element.style.boxShadow = `0 0 40px 10px ${colors.shadow.green}, 0 0 20px 0px ${colors.shadow.green} inset`;
                        triggers[id].hitted = 1;
                        console.log(`fake_perfect at ${i}`);
                        const status_ele = draw_status(i, "perfect");
                        setTimeout(() => {remove_element(status_ele)}, 1000);
                        score.combo++;
                        score.max_combo = Math.max(score.max_combo, score.combo);
                        score.hit++;
                        score.perfect++;
                        score.sum += 5;
                        reflesh();
                    }
                    if (time > trigger_time + miss_time) {
                        element.style.opacity = 0;
                        element.style.backgroundColor = colors.fill.red;
                        element.style.boxShadow = `0 0 40px 10px ${colors.shadow.red}, 0 0 20px 0px ${colors.shadow.red} inset`;
                        triggers[id].hitted = 1;
                        console.log(`miss at ${i}`);
                        const status_ele = draw_status(i, "miss");
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

function code_wrap(code, env) {
    let new_code = code + env.global_offset + env.fixed_offset[code % 12];
    return new_code;
}

function parse(tape, check = [], cur_env) {
    console.log("------- start parsing -------");
    console.log(`tape: \n ${tape} \n`);
    let interval = 60 * 4 * 1000 / cur_env.bpm / cur_env.time2;
    let velc = cur_env.velocity;
    let stack = []; stack.push(1);
    let cnt = 0;
    let sum = 0;
    let getTop = arr => arr[arr.length - 1];
    let tmpoffset = 0, octoffset = 0;
    let startoffset = Math.max(500, drop_time - interval * cur_env.time1);
    for (let i = 0, drum_note, beat_type; i < cur_env.time1; i++) {
        if (beat[cur_env.time1] != undefined) {
            beat_type = beat[cur_env.time1][i];
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
    sum = cur_env.time1;
    let chord_note_cnt = [0, 0, 0, 0, 0, 0, 0, 0];
    console.log(tape);
    let priority = [5, 3, 6, 2, 7, 1]; // 和弦中加入音的优先级
    let limit = [1, 2, 2, 2, 6];
    for (let i = 0; i < tape.length; i++) {
        let key = tape.charCodeAt(i);
        //console.log(i, tape[i], key);
        switch (tape[i]) {
            case '(':
                //console.log("chord start", tape[i + 1]);
                chord_note_cnt.fill(0);
                stack.push(0);
                break;
            case ')':
                stack.pop();
                let minid = 10, maxid = 0;
                if (check.length == 0 || check[difficulty](cnt) == false) {
                    cnt += getTop(stack);
                    sum += getTop(stack);
                    continue;
                }
                let chord_cnt = 0;
                for (let k = 0; k < priority.length && chord_cnt < limit[difficulty]; k++) {
                    let j = priority[k];
                    if (chord_note_cnt[j] > 1) {
                        minid = Math.min(minid, j);
                        maxid = Math.max(maxid, j);
                        chord_cnt++;
                        triggers.push({
                            column: j,
                            time: sum * interval + startoffset + delay,
                            type: 1,
                            hitted: 0,
                        });
                        if (is_tutorial == 1) {
                            bgm.notes.push({
                                instrument: "drum",
                                time: sum * interval + startoffset,
                                options: {
                                    note: "hihat-open",
                                }
                            });
                        }
                        //console.log("add1");
                    }
                }
                for (let k = 0; k < priority.length && chord_cnt < limit[difficulty]; k++) {
                    let j = priority[k];
                    if (chord_note_cnt[j] == 1) {
                        minid = Math.min(minid, j);
                        maxid = Math.max(maxid, j);
                        chord_cnt++;
                        triggers.push({
                            column: j,
                            time: sum * interval + startoffset + delay,
                            type: 0,
                            hitted: 0,
                        });
                        if (is_tutorial == 1) {
                            bgm.notes.push({
                                instrument: "drum",
                                time: sum * interval + startoffset,
                                options: {
                                    note: "hihat-close",
                                }
                            });
                        }
                        //console.log("add0");
                    }
                }
                if (minid < maxid) {
                    lines.push({
                        left: minid,
                        right: maxid,
                        time: sum * interval + startoffset + delay,
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
                cnt = 0;
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
                let note_code = code_wrap(key2note[key] + tmpoffset + octoffset * 12, cur_env);
                bgm.notes.push({
                    instrument: "piano",
                    options: {
                        note: note_code,
                        velocity: velocity_levels[velc] + velocity_adj[note_code],
                    },
                    time: sum * interval + startoffset,
                });
                tmpoffset = 0;
                if (cur_step == 0) {
                    chord_note_cnt[note2col[key]]++;
                } else {
                    if (check.length != 0 && check[difficulty](cnt)) {
                        triggers.push({
                            column: note2col[key],
                            time: sum * interval + startoffset + delay,
                            type: 0,
                            hitted: 0
                        });
                        if (is_tutorial == 1) {
                            bgm.notes.push({
                                instrument: "drum",
                                time: sum * interval + startoffset,
                                options: {
                                    note: "hihat-close",
                                }
                            });
                        }
                    }
                    cnt += cur_step;
                    sum += cur_step;
                }
                break;
        }
    }
    bgm.notes.sort((a, b) => a.time - b.time);
    console.log(`------- parsed ${triggers.length} / ${lines.length} -------`);
}

function gameinit() {
    lines.length = 0, triggers.length = 0, events.length = 0;
    result_window.style.opacity = 0;
    bgm.mute = 0;
    bgm = {
        notes: [],
        mute: 0,
    };
    clock.start();
}

function gamestart() {
    gameinit();
    function strong_beat(count) {
        const tmp = Math.round(count);
        if (Math.abs(tmp - count) > 1e-10) return false;
        if (beat[env.time1] != undefined) {
            return beat[env.time1][tmp % env.time1] > 0;
        } else {
            return tmp % env.time1 == 0;
        }
    }
    function int_beat(count) {
        return Math.abs(Math.round(count) - count) <= 1e-10;
    }
    function semi_beat(count) {
        count *= 2;
        console.log(count);
        if (Math.abs(Math.round(count) - count) <= 1e-10) return true;
        else {
            //console.log("check failed");
            return 0;
        }
    }
    function all_beat(count) {
        return true;
    }
    let check = [strong_beat, int_beat, int_beat, semi_beat, all_beat];
    parse(tape.main, check, env);
    var env2 = { ...env };
    env2.global_offset -= 12;
    parse(tape.sub, [], env2);
    is_playing = 1;
    new Promise((resolve, reject) => { play() });
}

function gamestop() {
    is_playing = 0;
    if (events.length) {
        bgm.mute = 1;
        clock.forward(events[events.length - 1].time);
    }
    resume();
}

function restart() {
    gamestop();
    setTimeout(() => {gamestart()}, 500);
}

function back_to_home() {
    gamestop();
    window.history.back();
}

window.onload = function() {
    gamestart();
    pause();
};

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
    if (key == " ") {
        if (is_playing == 0) return;
        if (is_paused()) {
            resume();
        } else {
            pause();
        }
        return;
    }
    if (key == "ESCAPE") {
        if (is_playing != 0 && is_paused() == 0) {
            pause();
        }
        restart();
    }
    if (key == "BACKSPACE") {
        back_to_home();
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
        keydown_animation(key);
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
        keyup_animation(key);
    }
});

