const key = 'ZXCVBNMASDFGHJQWERTYU'; // 键位
const note_name = ["C", "C<sup>♯</sup>/D<sup>♭</sup>", "D", "D<sup>♯</sup>/E<sup>♭</sup>", "E", "F", "F<sup>♯</sup>/G<sup>♭</sup>", "G", "G<sup>♯</sup>/A<sup>♭</sup>", "A", "A<sup>♯</sup>/B<sup>♭</sup>", "B"];
const diff = [2, 2, 1, 2, 2, 2, 1]; // 自然大调音阶
const velocites = [32, 48, 56, 64, 68, 72, 80, 88, 96, 108]; // 力度分级
const key2note = new Map();
const C1 = 48, C2 = 60, C3 = 72;
for (var i = 0, note = C1; i < key.length; i++) {
    key2note.set(key.charCodeAt(i), note);
    note += diff[i % 7];
}
import { Soundfont2Sampler } from "https://unpkg.com/smplr/dist/index.mjs";
import { SplendidGrandPiano } from "https://unpkg.com/smplr/dist/index.mjs";
const context = new AudioContext();
const piano = new SplendidGrandPiano(context);
var vel, offset, bpm, time1, time2;
export { vel, offset, bpm, time1, time2 };
export function refresh() {
    document.getElementById("bpm").value = bpm;
    document.getElementById("vel").textContent = "力度：" + velocites[vel];
    document.getElementById("key_offset").value = offset;
    document.getElementById("key_name").innerHTML = " (" + note_name[(offset + 120) % 12] + ")";
    document.getElementById("time_sign1").value = time1;
    document.getElementById("time_sign2").value = time2;
}
export function init() {
    vel = 4;
    offset = 0;
    bpm = 90;
    time1 = 4, time2 = 4;
    document.getElementById("input").value = "";
    refresh();
}
piano.load.then(() => {
    document.getElementById("status").style = "color: green;";
    document.getElementById("status").innerHTML = "准备就绪";
    init();
    refresh();
});
document.getElementById("submit").onclick = () => {
    bpm = parseInt(document.getElementById("bpm").value);
    offset = parseInt(document.getElementById("key_offset").value);
    time1 = parseInt(document.getElementById("time_sign1").value);
    time2 = parseInt(document.getElementById("time_sign2").value);
    console.log(bpm, offset, time1, time2);
    refresh();
}
function stroke(code, tim, velc) {
    piano.start({ note: code + offset, velocity: Math.round(velocites[velc] - (C3 - code) / 2), time: tim }); // 使高音强，低音弱
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
    offset = 0;
    document.getElementById("input").value = bwv846;
    refresh();
    //console.log(sampler.instrumentNames);
    //context.resume(); // enable audio context after a user interaction
};
document.getElementById("haruhikage").onclick = () => {
    bpm = 90;
    time1 = 6;
    time2 = 8;
    offset = -1;
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
