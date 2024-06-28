let tape = localStorage.getItem('tape');
let env = JSON.parse(localStorage.getItem('env'));
let delay = parseInt(localStorage.getItem('delay'));
let drop_time = parseInt(localStorage.getItem('drop_time'));
let volume = parseInt(localStorage.getItem('volume'));
let is_tutorial = parseInt(localStorage.getItem('is_tutorial'));
let difficulty = parseInt(localStorage.getItem('difficulty'));
console.log("环境：", env);
console.log(`谱子：${tape}`);
console.log(`延迟：${delay}`);
console.log(`速度：${drop_time}`);
tape = JSON.parse(tape);

import { key2note, velocity_levels, velocity_adj, init_constants, beat } from './constants.js'
init_constants();
import { set_offset } from './player.js'
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

const trigger_time = drop_time * 0.85 + delay;
const start_pos = 0, end_pos = 90, trigger_pos = (trigger_time / drop_time) * (end_pos - start_pos) + start_pos;
const trigger_duration = trigger_pos - start_pos, all_duration = end_pos - start_pos;
let is_playing = 0;

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
    song_info = `${level2name[difficulty]} | bpm: ${env.bpm} | 演示模式`;
} else {
    song_info = `${level2name[difficulty]} | bpm: ${env.bpm}`;
}
for (let i = 1; i <= 7; i++) {
    const pos = (i - 4) * 10 + 50;
    position[i] = pos;
    const buttom = document.getElementById("btm" + i);
    buttom.style.left = "50%";
    const line = document.getElementById('line' + i);
    line.style.left = "50%";
    line.style.bottom = (100 - trigger_pos) + "%";
    const point = document.getElementById('ptn' + i);
    point.style.left = "50%";
    const column= document.getElementById('column' + i);
    column.style.left = pos + "%";
    const trigger_ptn = document.getElementById('ptn' + i);
    trigger_ptn.style.top = trigger_pos + "%";
}

song_info_element.innerHTML = song_info;
trigger_line.style.top = trigger_pos + "%";
const playing_song_name = document.getElementById('playing-song-name');
playing_song_name.style.opacity = 0;
playing_song_name.innerHTML = `${tape.name}<br><span style='font-size: medium'>难度：${song_info}</span>`;

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

drum.output.setVolume(volume);

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
        if (pause_time != 0) {
            start_time += new Date().getTime() - pause_time;
            pause_time = 0;
        }
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

function brighten(element, list) {
    let style = "";
    for (let i = 0; i < list.length; i++) {
        let radius = list[i][0], color = list[i][1];
        style += `drop-shadow(0px 0px ${radius / 2}px ${color})`
               + `drop-shadow(0px 0px ${radius}px ${color})`;
    }
    element.style.filter = style;
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
    { score: 147, name: "SS", sat: 50, hue: 0},
    { score: 120, name: "S" , sat: 50, hue: 0},
    { score:  97, name: "A+", sat: 50, hue: 10},
    { score:  93, name: "A" , sat: 50, hue: 10},
    { score:  87, name: "A-", sat: 50, hue: 10},
    { score:  83, name: "B+", sat: 50, hue: 25},
    { score:  78, name: "B" , sat: 50, hue: 25},
    { score:  70, name: "B-", sat: 50, hue: 25},
    { score:  60, name: "C" , sat: 50, hue: 40},
    { score:   0, name: "D" , sat: 0,  hue: 0},
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
    const expect = (score.hit + score.miss) * 5;
    const get = score.sum * (score.miss == 0 ? 1.5 : 1);
    const normalized = get / expect * 100;
    return normalized;
}

function get_rank() {
    const normalized = get_normalized_score();
    //console.log(`normalized score: ${normalized}`);
    for (let i = 0; i < levels.length; i++) {
        if (normalized >= levels[i].score) {
            return levels[i];
        }
    }
    return levels[0];
}

let keyframes = [
    { combo: 1e10, hue: 0,   sat: 50, radius: 20}, //inf

    { combo: 300,  hue: 0,   sat: 50, radius: 15},
    { combo: 150,  hue: 0,   sat: 50, radius: 5},
    { combo: 80,   hue: 60,  sat: 50, radius: 5},
    { combo: 30,   hue: 220, sat: 50, radius: 5},
    { combo: 0,    hue: 220, sat: 0 , radius: 0},
];

function refresh() {
    const score_element = document.getElementById('score');
    //score_element.innerHTML = `score: ${score.sum}, combo: ${score.combo}, rank: ${get_rank()}`
    let rank = get_rank();
    score_element.innerHTML = `${score.sum}&nbsp; <img class="playing-level-img" src=./scores/${rank.name}.png></img> `;
    brighten(score_element, [[2, `hsla(${rank.hue}, ${rank.sat}%, 85%, 90%)`]]);
    const diff_element = document.getElementById('avg-diff');
    diff_element.innerHTML = `avg: ${(score.diff_sum / score.hit).toFixed(2)}ms`;
    const combo_element = document.getElementById('combo-title');
    const combo_num_element = document.getElementById('combo-num');
    combo_num_element.innerHTML = score.combo;
    let color = "", shadow_color = "", border_color = "", radius = 0;
    let len = keyframes.length
    for (let i = 1; i < len; i++) {
        if (score.combo >= keyframes[i].combo) {
            let proportion = (score.combo - keyframes[i].combo) / (keyframes[i - 1].combo - keyframes[i].combo);
            let hue = keyframes[i].hue + proportion * (keyframes[i - 1].hue - keyframes[i].hue);
            let sat = keyframes[i].sat + proportion * (keyframes[i - 1].sat - keyframes[i].sat);
            radius = keyframes[i].radius + proportion * (keyframes[i - 1].radius - keyframes[i].radius);
            color = `hsl(${hue}, ${sat}%, 90%)`;
            shadow_color = `hsl(${hue}, ${sat}%, 80%)`;
            border_color = `hsl(${hue}, ${sat}%, 50%)`;
            break;
        }
    }
    combo_element.style.color = color;
    combo_num_element.style.color = color;
    brighten(combo_num_element, [[2, border_color], [radius, shadow_color]]);
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
    const rank = get_rank();
    result_window.innerHTML = 
`
<div id="result-level" style="padding: 3em; text-align: center;"> 
    <img src=./scores/${rank.name}.png id="result-level-img">
    <p id="level-info" class="bright"></p>
</div>
<div id="result-window-info" style="padding: 2em"> 
    <p>
    <span class="title" style="font-size: 2.5em">${tape.name}</span>
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
    brighten(document.getElementById('result-level-img'), [[16, `hsla(${rank.hue}, ${rank.sat}%, 70%, 0.8)`]]);
    if (rank.score < 80) {
        document.getElementById('level-info').innerHTML = "分数太低？<br>降低bpm或降低难度再试一次吧";
    }
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
    refresh();
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
        score.created++;
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
    let interval_id, refresh_id;
    const progress_line = document.getElementById("progress-line");
    function frame() {
        if (clock.is_paused()) return;
        const start_time = clock.get();
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
            clearInterval(refresh_id);
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
                        refresh();
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
                        refresh();
                    }
                //console.log(`set #${id} to ${pos}%`);
                }
            });
        }
        const duration = clock.get() - start_time;
        if (duration >= 5) {
            console.log(`warning: spent ${duration}ms`);
        }
    }
    clock.start();
    interval_id = setInterval(frame, frame_time);
    refresh_id = setInterval(refresh, frame_time * 24);
}

function code_wrap(code, env) {
    let new_code = code + env.global_offset + env.note_shift[code % 12];
    return new_code;
}

function parse(tape, check = [], cur_env) {
    console.log("------- start parsing -------");
    console.log(`tape: \n ${tape} \n`);
    let interval = 60 * 4 * 1000 / cur_env.bpm / cur_env.time2;
    let velc = cur_env.velocity;
    let stack = [1], in_arpeggio = [0];
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
    function step() {
        cnt += getTop(stack);
        sum += getTop(stack);
        in_arpeggio[in_arpeggio.length - 1] += getTop(stack);
    }
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
                    step();
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
                step();
                //console.log("chord end");
                break;
            case '[':
                stack.push(getTop(stack) / 2);
                break;
            case ']':
                stack.pop();
                break;
            case '{':
                stack.push(getTop(stack) / 3);
                in_arpeggio.push(0);
                break;
            case '}':
                cnt -= getTop(in_arpeggio);
                sum -= getTop(in_arpeggio);
                //console.log(`roll back ${getTop(in_arpeggio)}`)
                stack.pop();
                in_arpeggio.pop();
                step();
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

            case '@':
                i++;
                let mode = 0, str = "";
                switch (tape[i]) {
                    case '[':
                        mode = 0;
                        while (tape[++i] != ']') str += tape[i];
                        break;
                    case '{':
                        mode = 1;
                        while (tape[++i] != '}') str += tape[i];
                        break;
                }
                let num = parseInt(str);
                set_offset(env, mode, num)
                break;

            default:
                let cur_step = getTop(stack);
                let note_code = code_wrap(key2note[key], cur_env) + tmpoffset + octoffset * 12;
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
                    step();
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
        if (Math.abs(tmp - count) > 1e-8) return false;
        if (beat[env.time1] != undefined) {
            return beat[env.time1][tmp % env.time1] > 0;
        } else {
            return tmp % env.time1 == 0;
        }
    }
    function int_beat(count) {
        return Math.abs(Math.round(count) - count) <= 1e-8;
    }
    function semi_beat(count) {
        count *= 2;
        console.log(count);
        if (Math.abs(Math.round(count) - count) <= 1e-8) return true;
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

{
    let id = Math.floor(Math.random() * 6);
    document.getElementById('screen').style.backgroundImage = `url('./background/${id}-blur.jpg')`;
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

