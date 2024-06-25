import {
    keys, note_name, sharp_name, flat_name,
    sharp_note, sharp_scale_name, flat_note, flat_scale_name,
    diff, velocity_levels, velocity_adj, key2note, C1, C2, C3,
    init_constants,
} from './constants.js'

let env = {
    velocity: 4,
    global_offset: 0,
    offset_option: 0,
    fix_offset_cnt: 0,
    bpm: 90,
    time1: 4, time2: 4,
    fixed_offset: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};
export function set_offset(env, mode = 0, cnt = 0) {
    env.offset_option = mode;
    if (mode == 0) {
        env.fixed_offset.fill(0);
        env.fix_offset_cnt = 0;
        env.global_offset = cnt;
        console.log(`set offset to ${cnt}`);
    } else {
        env.fixed_offset.fill(0);
        env.global_offset = 0;
        if (cnt > 0) {
            if (cnt > 6) cnt = 6;
            for (var i = 0; i < cnt; i++) {
                env.fixed_offset[sharp_note[i]] = 1;
            }
        } else if (cnt < 0) {
            if (cnt < -6) cnt = -6;
            for (var i = 0; i < (-cnt); i++) {
                env.fixed_offset[flat_note[i]] = -1;
            }
        }
        env.fix_offset_cnt = cnt;
        console.log(`set offsets to [${env.fixed_offset}]`);
    }
}
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
    piano.start({ note: note, 
                  velocity: velocity_levels[velc] + velocity_adj[note], 
    });
}

export function note_down(key, note, velc) {
    //console.log(`notedown ${key},${note},${velc}`);
    stroke(note, velc, context.currentTime);
    keydown_animation(key);
}
export function note_up(key) {
    keyup_animation(key);
}
export function note_stop(key) {
    piano.stop(key);
}
export function note_press(key, note, velc) {
    //console.log(`notepress ${key},${note},${velc}`);
    note_down(key, note, velc);
    setTimeout(function() {note_up(key);}, 100);
}

function arrange_press(key, code, velc, delay) {
    //console.log("a_p ", key);
    timers.push(
        setTimeout(function() {note_press(key, code, velc);}, delay - 10)
    );
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
    console.log("------- start playing -------");
    console.log(`tape: \n ${tape} \n`);
    var interval = 60 * 4 * 1000 / cur_env.bpm / cur_env.time2;
    var velc = cur_env.velocity;
    var beat_stack = [1];
    var cnt = 0;
    var sum = 0;
    var now = context.currentTime;
    var start_offset = 100;
    var getTop = arr => arr[arr.length - 1];
    var tmpoffset = 0, octoffset = 0;
    var in_arpeggio = [0];
    function step() {
        cnt += getTop(beat_stack);
        sum += getTop(beat_stack);
        in_arpeggio[in_arpeggio.length - 1] += getTop(beat_stack);
    }
    for (var i = 0; i < tape.length; i++) {
        var key = tape.charCodeAt(i);
        //console.log(i, tape[i], key);
        switch (tape[i]) {
            case '(':
                //console.log("chord start", tape[i + 1]);
                beat_stack.push(0);
                break;
            case ')':
                beat_stack.pop();
                //console.log("chord end");
                step();
                break;
            case '[':
                beat_stack.push(getTop(beat_stack) / 2);
                break;
            case ']':
                beat_stack.pop();
                break;
            case '{':
                beat_stack.push(getTop(beat_stack) / 3);
                in_arpeggio.push(0);
                break;
            case '}':
                cnt -= getTop(in_arpeggio);
                sum -= getTop(in_arpeggio);
                //console.log(`roll back ${getTop(in_arpeggio)}`)
                beat_stack.pop();
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
                set_offset(cur_env, mode, num);
                break;

            case '.':
                //console.log("interval", interval, sum);
                step();
                break;

            default:
                if (key2note[key] != undefined) {
                    const note = key2note[key];
                    arrange_press(
                        tape[i],
                        note + tmpoffset + octoffset * 12 + cur_env.global_offset + cur_env.fixed_offset[note % 12], 
                        velc, 
                        sum * interval + start_offset,
                    );
                    tmpoffset = 0;
                    step();
                    //console.log(`current ${getTop(in_arpeggio)}`);
                    //cnt++, sum++;
                }
        }
    }
}
