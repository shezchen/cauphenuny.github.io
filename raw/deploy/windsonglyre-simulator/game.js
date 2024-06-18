document.getElementById("difficulty").innerHTML = "难度：" + localStorage.getItem('difficulty');
document.getElementById("sheet").innerHTML = "谱子：" + localStorage.getItem('sheet');

import { keyup_animation, keydown_animation } from './keyboard.js'

import { key2note, init_constants } from './constants.js'

const position_diff = 10, mid = 4;

for (var i = 1; i <= 7; i++) {
    var pos = (i - mid) * position_diff + 50;
    const buttom = document.getElementById("btm" + i);
    buttom.style.left = pos + "%";
    buttom.style.transform = "translate(-50%, -50%)";
}

document.addEventListener("keydown", function(event) {
    var key = event.key;
    var code = key.charCodeAt();
    console.log(`${key} ${code} down`);
    if (event.repeat) {
        return;
    }
    if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
    }
    if (code >= 97 && code <= 122) {
        code -= 32; // 小写转大写
    }
    if (key2note.has(code)) {
        dm.start({ note: "hihat-close" });
        keydown_animation(code);
    }
});

document.addEventListener("keyup", function(event) {
    var key = event.key;
    var code = key.charCodeAt();
    console.log(`${key} ${code} up`);
    if (code >= 97 && code <= 122) {
        code -= 32; // 小写转大写
    }
    if (key2note.has(code)) {
        keyup_animation(code);
    }
});

import { DrumMachine } from "https://unpkg.com/smplr/dist/index.mjs";

const context = new AudioContext();
const dm = new DrumMachine(context);

dm.load.then(() => {
    console.log("loaded.");
    //dm.start({ note: "hihat-close" });
    //const now = context.currentTime;
    //dm.getVariations("hihat-open").forEach((variation, index) => {
    //  dm.start({ note: variation, time: now + index + 1 });
    //});
    init_constants();
    const hovers = document.getElementsByClassName("hvinfo");
    for (var i = 0; i < hovers.length; i++) {
        hovers[i].style.display = "none";
    }
});

