let tape = localStorage.getItem('tape');
document.getElementById("difficulty").innerHTML = "难度：" + localStorage.getItem('difficulty');
document.getElementById("sheet").innerHTML = "谱子：" + tape;
tape = JSON.parse(tape);
let env = JSON.parse(localStorage.getItem('env'));

import { keyup_animation, keydown_animation } from './keyboard.js'

import { key2note, init_constants } from './constants.js'

const position_diff = 10, mid = 4;

for (var i = 1; i <= 7; i++) {
    var pos = (i - mid) * position_diff + 50;
    const buttom = document.getElementById("btm" + i);
    buttom.style.left = pos + "%";
    const line = document.getElementById('line' + i);
    line.style.left = pos + "%";
    line.style.top = "0";
    const point = document.getElementById('ptn' + i);
    point.style.left = pos + "%";
}
const trigger_line = document.getElementById('trigger-line');
trigger_line.style.height = "2px";

import { context, drum } from "./player.js";

init_constants();

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
    if (key2note.has(code)) {
        drum.start({ note: "hihat-close" });
        keydown_animation(code);
    }
});

document.addEventListener("keyup", function(event) {
    var key = event.key.toUpperCase();
    var code = key.charCodeAt();
    console.log(`${key} ${code} up`);
    if (key2note.has(code)) {
        keyup_animation(code);
    }
});

