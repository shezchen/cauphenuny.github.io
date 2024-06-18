import {
    key, note_name, sharp_name, flat_name,
    sharp_note, sharp_scale_name, flat_note, flat_scale_name,
    diff, velocity_levels, velocity_adj, key2note, C1, C2, C3,
    init_constants,
} from './constants.js'

var env = {
    velocity: 4,
    global_offset: 0,
    bpm: 90,
    time1: 4, time2: 4,
    fixed_offset: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
};
// var vel, global_offset, bpm, time1, time2;
export { env };
import { keyup_animation, keydown_animation, mouseenter, mouseleave } from './keyboard.js'
import { DrumMachine, SplendidGrandPiano } from "https://unpkg.com/smplr/dist/index.mjs";
export const context = new AudioContext();
export const piano = new SplendidGrandPiano(context);
export const drum = new DrumMachine(context);
drum.output.setVolume(50);

var timers = [];
export function stroke(note, velc) {
    console.log(`stroke ${note},${velc} /${velocity_adj[note]}`);
    piano.start({ note: note + env.global_offset + env.fixed_offset[note % 12], 
                  velocity: velocity_levels[velc] + velocity_adj[note], 
    });
}

export function notedown(key, note, velc) {
    //console.log(`notedown ${key},${note},${velc}`);
    stroke(note, velc, context.currentTime);
    keydown_animation(key);
}
export function noteup(key) {
    keyup_animation(key);
}
export function notepress(key, note, velc) {
    //console.log(`notepress ${key},${note},${velc}`);
    notedown(key, note, velc);
    setTimeout(function() {noteup(key);}, 100);
}

function arrange_press(key, code, velc, delay) {
    //console.log("a_p ", key);
    timers.push(
        setTimeout(function() {notepress(key, code, velc);}, delay - 10)
    );
}

window.onload = function() {
    //var str = "";
    init_constants();
    //console.log(str);
    const key_buttons = document.getElementsByClassName("kb-img");
    for (var i = 0; i < key_buttons.length; i++) {
        key_buttons[i].draggable = false; // 不可拖动
    }
}

function sleep(milliseconds) {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}
export function stop() {
    for (var i = 0; i < timers.length; i++) {
        clearTimeout(timers[i]);
    }
    timers.length = 0;
    piano.stop();
}
export function play(tape, cur_env = env) {
    stop();
    console.log("------- start playing -------");
    console.log(`tape: \n ${tape} \n`);
    var interval = 60 * 4 / cur_env.bpm / cur_env.time2;
    var velc = cur_env.velocity;
    var stack = [];
    stack.push(1);
    var cnt = 0;
    var sum = 0;
    var now = context.currentTime;
    var getTop = arr => arr[arr.length - 1];
    var tmpoffset = 0, octoffset = 0;
    for (var i = 0; i < tape.length; i++) {
        var key = tape.charCodeAt(i);
        //console.log(i, tape[i], key);
        switch (tape[i]) {
            case '(':
                //console.log("chord start", tape[i + 1]);
                stack.push(0);
                break;
            case ')':
                stack.pop();
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
            case '/':
                if (cur_env.time1 != cnt) {
                    console.log("warning: rhythm not correct: expect " + cur_env.time1 + ", read " + cnt + " .");
                } else {
                    console.log("success.");
                }
                cnt = 0;
                break;
            case '^':
                if (octoffset == 0) octoffset = 1;
                else                octoffset = 0;
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
                arrange_press(key, key2note.get(key) + tmpoffset + octoffset * 12, velc, sum * interval * 1000);
                tmpoffset = 0;
                cnt += getTop(stack);
                sum += getTop(stack);
                //cnt++, sum++;
        }
    }
}
