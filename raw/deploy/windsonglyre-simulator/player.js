const key = 'ZXCVBNMASDFGHJQWERTYU';
const note_name = ["C", "C<sup>♯</sup>/D<sup>♭</sup>", "D", "D<sup>♯</sup>/E<sup>♭</sup>", "E", "F", "F<sup>♯</sup>/G<sup>♭</sup>", "G", "G<sup>♯</sup>/A<sup>♭</sup>", "A", "A<sup>♯</sup>/B<sup>♭</sup>", "B"];
const sharp_name = ["C", "C<sup>♯</sup>", "D", "D<sup>♯</sup>", "E", "F", "F<sup>♯</sup>", "G", "G<sup>♯</sup>", "A", "A<sup>♯</sup>", "B"];
const flat_name  = ["C", "D<sup>♭</sup>", "D", "E<sup>♭</sup>", "E", "F", "G<sup>♭</sup>", "G", "A<sup>♭</sup>", "A", "B<sup>♭</sup>", "B"];
const vocal_name = ["do", "", "re", "", "mi", "fa", "", "sol", "", "la", "", "si"];
const major_scale = "CDEFGAB";
const sharp = [5, 0, 7, 2, 9, 4, 11];
const sharp_scale_name = ["C", "G", "D", "A", "E", "B", "F<sup>♯</sup>"];
const flat = [11, 4, 9, 2, 7, 0, 5];
const flat_scale_name = ["F", "B<sup>♭</sup>", "E<sup>♭</sup>", "A<sup>♭</sup>", "D<sup>♭</sup>", "G<sup>♭</sup>"];
const diff = [2, 2, 1, 2, 2, 2, 1];
const velocites = [32, 48, 56, 64, 68, 72, 80, 88, 96, 108];
const key2note = new Map();
const C1 = 48, C2 = 60, C3 = 72;
var fixed_offset = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
for (var i = 0, note = C1; i < key.length; i++) {
    key2note.set(key.charCodeAt(i), note);
    note += diff[i % 7];
}
var vel, global_offset, bpm, time1, time2;
export { vel, global_offset, bpm, time1, time2 };
export function refresh() {
    document.getElementById("bpm").value = bpm;
    document.getElementById("vel").textContent = "力度：" + velocites[vel];
    const selectElement = document.getElementById('offset_option');
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    if (selectedOption.value == "flex") {
        document.getElementById("key_name").innerHTML = "(1=" + note_name[(global_offset + 120) % 12] + ")";
    } else { 
        var cnt = parseInt(document.getElementById("key_offset").value);
        if (cnt > 0) {
            if (cnt > 6) cnt = 6;
            var str = "fa";
            for (var i = 1; i < cnt; i++) {
                str += ", " + vocal_name[sharp[i]];
            }
            console.log(str);
            document.getElementById("key_name").innerHTML = sharp_scale_name[cnt] + "大调（升 " + str + "）";
        } else if (cnt < 0) {
            if (cnt < -6) cnt = -6;
            var str = "si";
            for (var i = 1; i < (-cnt); i++) {
                str += ", " + vocal_name[flat[i]];
            }
            console.log(str);
            document.getElementById("key_name").innerHTML = flat_scale_name[-cnt] + "大调（降 " + str + "）";
        } else {
            document.getElementById("key_name").innerHTML = "C大调";
        }
    }
    document.getElementById("time_sign1").value = time1;
    document.getElementById("time_sign2").value = time2;
}
export function init() {
    vel = 4;
    global_offset = 0;
    bpm = 90;
    time1 = 4, time2 = 4;
    document.getElementById('offset_option').selectedIndex = 0;
    document.getElementById("key_offset").value = "0";
    document.getElementById("input").value = "";
    refresh();
}
import { Soundfont2Sampler } from "https://unpkg.com/smplr/dist/index.mjs";
import { SplendidGrandPiano } from "https://unpkg.com/smplr/dist/index.mjs";
const context = new AudioContext();
const piano = new SplendidGrandPiano(context);
piano.load.then(() => {
    document.getElementById("status").style = "color: green;";
    document.getElementById("status").innerHTML = "准备就绪";
    init();
    refresh();
});
document.getElementById("submit").onclick = () => {
    bpm = parseInt(document.getElementById("bpm").value);
    const selectElement = document.getElementById('offset_option');
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    if (selectedOption.value == "flex") {
        global_offset = parseInt(document.getElementById("key_offset").value);
        fixed_offset.fill(0);
    } else {
        global_offset = 0;
        fixed_offset.fill(0);
        var cnt = parseInt(document.getElementById("key_offset").value);
        console.log(cnt);
        if (cnt > 0) {
            for (var i = 0; i < cnt; i++) {
                fixed_offset[sharp[i]] = 1;
            }
        } else if (cnt < 0) {
            for (var i = 0; i < (-cnt); i++) {
                fixed_offset[flat[i]] = -1;
            }
        }
        console.log(fixed_offset);
    }
    time1 = parseInt(document.getElementById("time_sign1").value);
    time2 = parseInt(document.getElementById("time_sign2").value);
    console.log(bpm, global_offset, time1, time2);
    refresh();
}
function stroke(code, tim, velc) {
    piano.start({ note: code + global_offset + fixed_offset[code % 12], 
                  velocity: Math.round(velocites[velc] - (C3 - code) / 2), 
                  time: tim });
}
document.addEventListener("keydown", function(event) {
    var code = event.keyCode;
    console.log(code, key2note.get(code));
    if (key2note.has(code)) {
        stroke(key2note.get(code), context.currentTime, vel);
    }
    if (code == 189) {
        if (vel > 0) vel--; 
        refresh();
    }
    if (code == 187) {
        if (vel < 9) vel++;
        refresh();
    }
});
function sleep(milliseconds) {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}
export function play(music) {
    piano.stop();
    var interval = 60 * 4 / bpm / time2;
    var velc = vel;
    var stack = [];
    stack.push(1);
    var cnt = 0;
    var sum = 0;
    var now = context.currentTime;
    var getTop = arr => arr[arr.length - 1];
    var tmpoffset = 0, octoffset = 0;
    for (var i = 0; i < music.length; i++) {
        var key = music.charCodeAt(i);
        //console.log(i, music[i], key);
        switch (music[i]) {
            case '(':
                //console.log("chord start", music[i + 1]);
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
                //console.log(cnt);
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
                if (key2note.has(key)) {
                    stroke(key2note.get(key) + tmpoffset + octoffset * 12, now + sum * interval, velc);
                    tmpoffset = 0;
                    cnt += getTop(stack);
                    sum += getTop(stack);
                    //cnt++, sum++;
                }
                break;
        }
    }
}
document.getElementById("stop").onclick = () => {
    console.log("stop");
    piano.stop();
}
document.getElementById("tutorial").onclick = () => {
    init();
    document.getElementById("input").value = tutorial;
    refresh();
};
document.getElementById("bwv846").onclick = () => {
    bpm = 70;
    time1 = 4;
    time2 = 4;
    document.getElementById('offset_option').selectedIndex = 0;
    global_offset = 0;
    document.getElementById("input").value = bwv846;
    refresh();
    //console.log(sampler.instrumentNames);
    //context.resume();
};
document.getElementById("haruhikage").onclick = () => {
    bpm = 90;
    time1 = 6;
    time2 = 8;
    document.getElementById('offset_option').selectedIndex = 0;
    global_offset = -1;
    document.getElementById("input").value = haruhikage;
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
    play(document.getElementById("input").value);
};
