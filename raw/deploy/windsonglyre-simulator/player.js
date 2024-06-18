const key = 'ZXCVBNMASDFGHJQWERTYU';
const note_name = ["C", "C<sup>♯</sup>/D<sup>♭</sup>", "D", "D<sup>♯</sup>/E<sup>♭</sup>", "E", "F", "F<sup>♯</sup>/G<sup>♭</sup>", 
                   "G", "G<sup>♯</sup>/A<sup>♭</sup>", "A", "A<sup>♯</sup>/B<sup>♭</sup>", "B"];
const sharp_name = ["C", "C<sup>♯</sup>", "D", "D<sup>♯</sup>", "E", "F", "F<sup>♯</sup>", "G", "G<sup>♯</sup>", "A", "A<sup>♯</sup>", "B"];
const flat_name  = ["C", "D<sup>♭</sup>", "D", "E<sup>♭</sup>", "E", "F", "G<sup>♭</sup>", "G", "A<sup>♭</sup>", "A", "B<sup>♭</sup>", "B"];
const vocal_name = ["do", "", "re", "", "mi", "fa", "", "sol", "", "la", "", "si"];
const major_scale = "CDEFGAB";
const sharp_note = [5, 0, 7, 2, 9, 4, 11];
const sharp_scale_name = ["C", "G", "D", "A", "E", "B", "F<sup>♯</sup>"];
const flat_note = [11, 4, 9, 2, 7, 0, 5];
const flat_scale_name = ["C", "F", "B<sup>♭</sup>", "E<sup>♭</sup>", "A<sup>♭</sup>", "D<sup>♭</sup>", "G<sup>♭</sup>"];
const diff = [2, 2, 1, 2, 2, 2, 1];
const velocity_levels = [32, 48, 56, 64, 68, 72, 80, 88, 96, 108];
const velocity_adj = [];
const key2note = new Map();
const C1 = 48, C2 = 60, C3 = 72;
export { note_name, sharp_name, flat_name, vocal_name };
var env = {
    velocity: 4,
    global_offset: 0,
    bpm: 90,
    time1: 4, time2: 4,
    fixed_offset: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
};
// var vel, global_offset, bpm, time1, time2;
export { env };
function refresh() {
    document.getElementById("bpm").value = env.bpm;
    document.getElementById("vel").textContent = "力度：" + velocity_levels[env.velocity];
    const selectElement = document.getElementById('offset_option');
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    if (selectedOption.value == "flex") {
        document.getElementById("key_name").innerHTML = "(1=" + note_name[(env.global_offset + 120) % 12] + ")";
    } else { 
        var cnt = parseInt(document.getElementById("key_offset").value);
        if (cnt >= 0) {
            if (cnt > 6) cnt = 6;
            document.getElementById("key_name").innerHTML = sharp_scale_name[cnt] + "大调 <img alt=\"调号\" class=\"keysgn-img\"" + 
                                                                                              "align=\"center\" " + 
                                                                                              "src=\"./keysignature/" + cnt + ".png\"" + 
                                                                                         ">";
        } else if (cnt < 0) {
            if (cnt < -6) cnt = -6;
            document.getElementById("key_name").innerHTML = flat_scale_name[-cnt] + "大调 <img alt=\"调号\" class=\"keysgn-img\"" + 
                                                                                              "align=\"center\" " + 
                                                                                              "src=\"./keysignature/" + cnt + ".png\"" + 
                                                                                         ">";
        } else {
        }
    }
    document.getElementById("time_sign1").value = env.time1;
    document.getElementById("time_sign2").value = env.time2;
}
function init() {
    env.velocity = 4;
    env.global_offset = 0;
    env.bpm = 90;
    env.time1 = 4, env.time2 = 4;
    document.getElementById('offset_option').selectedIndex = 0;
    env.fixed_offset.fill(0);
    document.getElementById("key_offset").value = "0";
    document.getElementById("input").value = "";
    document.getElementById("input2").value = "";
    refresh();
}
import { SplendidGrandPiano } from "https://unpkg.com/smplr/dist/index.mjs";
const context = new AudioContext();
const piano = new SplendidGrandPiano(context);
document.getElementById("submit").onclick = () => {
    env.bpm = parseInt(document.getElementById("bpm").value);
    const selectElement = document.getElementById('offset_option');
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    if (selectedOption.value == "flex") {
        env.global_offset = parseInt(document.getElementById("key_offset").value);
        env.fixed_offset.fill(0);
    } else {
        env.global_offset = 0;
        env.fixed_offset.fill(0);
        var cnt = parseInt(document.getElementById("key_offset").value);
        //console.log(cnt);
        if (cnt > 0) {
            for (var i = 0; i < cnt; i++) {
                env.fixed_offset[sharp_note[i]] = 1;
            }
        } else if (cnt < 0) {
            for (var i = 0; i < (-cnt); i++) {
                env.fixed_offset[flat_note[i]] = -1;
            }
        }
        //console.log(env.fixed_offset);
    }
    env.time1 = parseInt(document.getElementById("time_sign1").value);
    env.time2 = parseInt(document.getElementById("time_sign2").value);
    refresh();
}
function keyup_animation(key) {
    const img = document.getElementById("key" + String.fromCharCode(key));
    img.style.filter = 'brightness(1) drop-shadow(5px 5px 5px rgba(0,0,0,0.45))';
    img.style.transform = 'scale(1)';
}
function keydown_animation(key) {
    //console.log("a_d ", key);
    //console.log(key);
    const img = document.getElementById("key" + String.fromCharCode(key));
    img.style.filter = 'brightness(0.65)';
    img.style.transform = 'scale(0.9)';
}

var timers = [];
function stroke(note, time, velc) {
    //console.log(`stroke ${note},${time},${velc} /${velocity_adj[note]}`);
    piano.start({ note: note + env.global_offset + env.fixed_offset[note % 12], 
                  velocity: Math.round(velocity_levels[velc] + velocity_adj[note]), 
                  time: time });
}

function notedown(key, note, velc) {
    //console.log(`notedown ${key},${note},${velc}`);
    stroke(note, context.currentTime, velc);
    keydown_animation(key);
}
function noteup(key) {
    keyup_animation(key);
}
function notepress(key, note, velc) {
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
    for (var i = 0, note = C1; i < key.length; i++) {
        key2note.set(key.charCodeAt(i), note);
        note += diff[i % 7];
        //str += "<span id=hover" + key[i] + "><img id=\"key" + key[i] + "\" class=\"kb-img\" src=\"./keyboard/" + key[i] + ".png\" alt=\"key" + key[i] + "\"></span>\n"
    }
    for (var i = 0; i <= 120; i++) {
        velocity_adj[i] = -Math.max(Math.min((C3 - i) / 2, 20), -10);
    }
    //console.log(str);
    const key_buttons = document.getElementsByClassName("kb-img");
    for (var i = 0; i < key_buttons.length; i++) {
        key_buttons[i].draggable = false; // 不可拖动
    }
}

piano.load.then(() => {
    document.getElementById("status").style = "color: green;";
    document.getElementById("status").innerHTML = "准备就绪";
    const hovers = document.getElementsByClassName("hvinfo");
    for (var i = 0; i < hovers.length; i++) {
        hovers[i].style.display = "none";
    }
    init();
    refresh();

    const key_buttons = document.getElementsByClassName("kb-img");
    for (var i = 0; i < key_buttons.length; i++) {
        key_buttons[i].addEventListener('mousedown', function() {
            var key_code = this.id.charCodeAt("key".length);
            notepress(key_code, key2note.get(key_code), env.velocity);
        });
        key_buttons[i].addEventListener('mouseenter', function() {
            this.parentNode.style.filter = 'brightness(0.9)';
        });
        key_buttons[i].addEventListener('mouseleave', function() {
            this.parentNode.style.filter = 'brightness(1)';
        });
    }
    document.addEventListener("keydown", function(event) {
        if (event.repeat) {
            return;
        }
        var key = event.keyCode;
        //console.log(key, key2note.get(key));
        if (key2note.has(key)) {
            notedown(key, key2note.get(key), env.velocity);
        }
        if (key == 189) {
            if (env.velocity > 0) env.velocity--; 
            refresh();
        }
        if (key == 187) {
            if (env.velocity < 9) env.velocity++;
            refresh();
        }
    });
    document.addEventListener("keyup", function(event) {
        var key = event.keyCode;
        //console.log(key, key2note.get(key));
        if (key2note.has(key)) {
            noteup(key);
        }
    });
});

function sleep(milliseconds) {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}
function stop() {
    for (var i = 0; i < timers.length; i++) {
        clearTimeout(timers[i]);
    }
    timers.length = 0;
    piano.stop();
}
function extract(tape) {
    console.log("------- start extracting -------");
    console.log(`origin: \n ${tape} \n`);
    var ext = "";
    for (var i = 0; i < tape.length; i++) {
        switch (tape[i]) {
            case '#':
                while (i < tape.length && tape[i] != '\n' && tape[i] != '\r') {
                    i++;
                }
                break;
            case '(': case ')':
            case '[': case ']':
            case '{': case '}':
            case '<': case '>':
            case '-': case '+':
            case '^': case '%':
            case '.': case '/':
                ext += tape[i];
                break;
            default: 
                if (key2note.has(tape.charCodeAt(i))) {
                    ext += tape[i];
                }
                break;
        }
    }
    return ext;
}
function decompress(sheet) {
    //TODO
    return sheet;
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
function fetch_input() {
    let inputs = {
        main: extract(document.getElementById("input").value),
        sub: decompress(extract(document.getElementById("input2").value)),
    };
    return inputs;
}
document.getElementById("stop").onclick = () => {
    console.log("stop");
    stop();
}
document.getElementById("tutorial").onclick = () => {
    init();
    document.getElementById("input").value = tutorial;
    refresh();
};
document.getElementById("tutorial2").onclick = () => {
    init();
    document.getElementById("input2").value = tutorial2;
    refresh();
};
document.getElementById("bwv846").onclick = () => {
    env.bpm = 70;
    env.time1 = 4;
    env.time2 = 4;
    document.getElementById('offset_option').selectedIndex = 0;
    env.fixed_offset.fill(0);
    env.global_offset = 0;
    document.getElementById("input").value = bwv846;
    document.getElementById("input2").value = "";
    refresh();
    //console.log(sampler.instrumentNames);
    //context.resume();
};
document.getElementById("haruhikage").onclick = () => {
    env.bpm = 90;
    env.time1 = 6;
    env.time2 = 8;
    document.getElementById('offset_option').selectedIndex = 0;
    env.fixed_offset.fill(0);
    env.global_offset = -1;
    document.getElementById("input").value = haruhikage;
    document.getElementById("input2").value = "";
    refresh();
    //play(haruhikage);
    //console.log(sampler.instrumentNames);
    //context.resume(); // enable audio context after a user interaction
};
document.getElementById("reset").onclick = () => {
    init();
};
document.getElementById("start").onclick = () => {
    console.log("click");
    //getAttribute();
    var input = fetch_input();
    play(input.main);
}
document.getElementById("gamestart").onclick = () => {
  alert('还没写呢');
  localStorage.setItem('input', fetch_input());
  localStorage.setItem('env', env);
  localStorage.setItem('difficulty', document.getElementById("difficulty-select").selectedIndex);
  window.location.href = './game.html'
}
