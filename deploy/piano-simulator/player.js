import {
    keys, note_name, sharp_name, flat_name,
    sharp_note, sharp_scale_name, flat_note, flat_scale_name,
    diff, velocity_levels, velocity_adj, key2note, C1, C2, C3,
    init_constants,
} from './constants.js'

export class environment {
    constructor(options) {
        this.velocity = 4;
        this.offset_mode = 0;
        this.global_offset = 0;
        this.bpm = 90;
        this.time1 = 4, this.time2 = 4;
        this.shift_cnt = 0;
        this.note_shift = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (const key in options) {
            this[key] = options[key];
        }
        if (this.offset_mode == 1) {
            set_offset(this, 1, this.shift_cnt);
        }
    }
};

export function set_offset(env, mode = 0, offset = 0) {
    env.offset_mode = mode;
    if (mode == 0) {
        env.note_shift.fill(0);
        env.shift_cnt = 0;
        env.global_offset = offset;
        console.log(`set offset to ${offset}`);
    } else {
        env.global_offset = 0;
        env.shift_cnt = offset;
        env.note_shift.fill(0);
        if (offset > 0) {
            if (offset > 6) offset = 6;
            for (let i = 0; i < offset; i++) {
                env.note_shift[sharp_note[i]] = 1;
            }
        } else if (offset < 0) {
            if (offset < -6) offset = -6;
            for (let i = 0; i < (-offset); i++) {
                env.note_shift[flat_note[i]] = -1;
            }
        }
        console.log(`set offsets to [${env.note_shift}]`);
    }
}

export function env_verify(env) {
    const std = new environment;
    for (const key in std) {
        if (!(key in env)) {
            return false;
        }
    }
    return true;
}

// let vel, global_offset, bpm, time1, time2;
import { keyup_animation, keydown_animation, mouseenter, mouseleave } from './keyboard.js'
import { DrumMachine, SplendidGrandPiano } from "./library/smplr@0.15.1.mjs";
export const context = new AudioContext();
export const piano = new SplendidGrandPiano(context);
export const drum = new DrumMachine(context);
piano.output.setVolume(120);
drum.output.setVolume(50);

let timers = [];
export function stroke(note, velc) {
    //console.log(`stroke ${note},${velc} /${velocity_adj[note]}`);
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
    for (let i = 0; i < timers.length; i++) {
        clearTimeout(timers[i]);
    }
    timers.length = 0;
    piano.stop();
}
export function play(tape, env) {
    console.log("------- start playing -------");
    console.log(`tape: \n ${tape} \n`);
    let interval = 60 * 4 * 1000 / env.bpm / env.time2;
    let velc = env.velocity;
    let beat_stack = [1];
    let cnt = 0;
    let sum = 0;
    let now = context.currentTime;
    let start_offset = 100;
    let getTop = arr => arr[arr.length - 1];
    let tmpoffset = 0, octoffset = 0;
    let in_arpeggio = [0];
    function step() {
        cnt += getTop(beat_stack);
        sum += getTop(beat_stack);
        in_arpeggio[in_arpeggio.length - 1] += getTop(beat_stack);
    }
    for (let i = 0; i < tape.length; i++) {
        let key = tape.charCodeAt(i);
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
                if (Math.abs(env.time1 - cnt) > 1e-8) {
                    console.log("warning: rhythm not correct: expect " + env.time1 + ", read " + cnt + " .");
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
                set_offset(env, mode, num);
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
                        note + tmpoffset + octoffset * 12 + env.global_offset + env.note_shift[note % 12], 
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
