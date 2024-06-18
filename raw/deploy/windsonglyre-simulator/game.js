let tape = localStorage.getItem('tape');
//document.getElementById("difficulty").innerHTML = "难度：" + localStorage.getItem('difficulty');
//document.getElementById("environment").innerHTML = "环境：" + localStorage.getItem('env');
let env = JSON.parse(localStorage.getItem('env'));
//document.getElementById("sheet").innerHTML = "谱子：" + tape;
tape = JSON.parse(tape);

import { key2note, velocity_levels, velocity_adj, init_constants } from './constants.js'
init_constants();
import { keyup_animation, keydown_animation } from './keyboard.js'

const position_diff = 10, mid = 4;
const available_key = "ASDFGHJ";
const all_key = "ZXCVBNMQWERTYU";
var key2col = [];
var position = [];

for (var i = 1; i <= 7; i++) {
    var pos = (i - mid) * position_diff + 50;
    position[i] = pos;
    const buttom = document.getElementById("btm" + i);
    buttom.style.left = pos + "%";
    const line = document.getElementById('line' + i);
    line.style.left = pos + "%";
    const point = document.getElementById('ptn' + i);
    point.style.left = pos + "%";
    const column= document.getElementById('column' + i);
    column.style.left = pos + "%";
    key2col[available_key.charCodeAt(i - 1)] = i;
    key2col[all_key.charCodeAt(i - 1)] = i;
    key2col[all_key.charCodeAt(i - 1 + 7)] = i;
}
const trigger_line = document.getElementById('trigger-line');
trigger_line.style.height = "2px";

import { context, drum, piano, stroke } from "./player.js";

const drop_time = 1200;
const trigger_time = Math.round(drop_time / 8 * 7);

function remove_element(ele) {
    const par = ele.parentNode;
    par.removeChild(ele);
}

function draw_note(col) {
    const note = document.createElement('div');
    note.classList.add('note');
    console.log(`add note on ${col}`);
    const column= document.getElementById('column' + col);
    column.appendChild(note);
    setTimeout(() => {remove_element(note);}, drop_time);
}

function draw_line(minid, maxid) {
    const line = document.createElement('div');
    line.classList.add('hori-line');
    console.log(`add line on ${minid} ${maxid} ${position[minid]}%, ${position[maxid]}%`);
    line.style.left = position[minid] + "%";
    line.style.width = (position[maxid] - position[minid]) + "%";
    const stage = document.getElementById('stage');
    stage.appendChild(line);
    setTimeout(() => {remove_element(line);}, drop_time);
}

document.addEventListener("keydown", function(event) {
    var key = event.key.toUpperCase();
    var code = key.charCodeAt();
    console.log(`${key} ${code} down`);
    if (event.repeat) {
        return;
    }
    if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
    }
    var index = available_key.indexOf(key);
    if (index != -1) {
        drum.start({ note: "hihat-close" });
        keydown_animation(code);
        //draw_note(index + 1);
    }
});

document.addEventListener("keyup", function(event) {
    var key = event.key.toUpperCase();
    var code = key.charCodeAt();
    console.log(`${key} ${code} up`);
    var index = available_key.indexOf(key);
    if (index != -1) {
        keyup_animation(code);
    }
});

function sleep(milliseconds) {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}


function arrange_line(minid, maxid, delay) {
    setTimeout(() => {draw_line(minid, maxid)}, delay - trigger_time);
}

function piano_stroke(code, velc) {
    console.log(`stroke ${code} ${velc}`);
    piano.start({note: code, velocity: velc});
}

function arrange_note(key, code, velc, delay) {
    console.log(`arrange_note ${key}, ${code}, ${velc}, ${delay}`);
    //setTimeout(function() { drum.start({note: "hihat-close"}); }, delay);
    setTimeout(piano_stroke, delay, 
               code + env.global_offset + env.fixed_offset[code % 12], 
               velocity_levels[velc] + velocity_adj[code]
    );
    setTimeout(() => { draw_note(key2col[key]); }, delay - trigger_time);
}

window.onload = function() {
};
function play(tape) {
    stop();
    console.log("------- start playing -------");
    console.log(`tape: \n ${tape} \n`);
    var interval = 60 * 4 / env.bpm / env.time2;
    var velc = env.velocity;
    var stack = [];
    stack.push(1);
    var cnt = 0;
    var sum = 0;
    var now = context.currentTime;
    var getTop = arr => arr[arr.length - 1];
    var tmpoffset = 0, octoffset = 0;
    var startoffset = drop_time;
    var maxid, minid;
    for (var i = 0; i < tape.length; i++) {
        var key = tape.charCodeAt(i);
        //console.log(i, tape[i], key);
        switch (tape[i]) {
            case '(':
                //console.log("chord start", tape[i + 1]);
                stack.push(0);
                maxid = 0, minid = 10;
                break;
            case ')':
                stack.pop();
                arrange_line(minid, maxid, sum * interval * 1000 + startoffset);
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
                if (cur_step == 0) {
                    maxid = Math.max(maxid, key2col[key]);
                    minid = Math.min(minid, key2col[key]);
                }
                arrange_note(key, key2note.get(key) + tmpoffset + octoffset * 12, velc, sum * interval * 1000 + startoffset);
                tmpoffset = 0;
                cnt += cur_step;
                sum += cur_step;
                //cnt++, sum++;
        }
    }
}

document.getElementById('gamestart').onclick = () => {
    play(tape.main);
};
