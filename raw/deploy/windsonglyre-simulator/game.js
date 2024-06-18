let tape = localStorage.getItem('tape');
document.getElementById("difficulty").innerHTML = "难度：" + localStorage.getItem('difficulty');
document.getElementById("sheet").innerHTML = "谱子：" + tape;
tape = JSON.parse(tape);
let env = JSON.parse(localStorage.getItem('env'));

import { keyup_animation, keydown_animation } from './keyboard.js'

const position_diff = 10, mid = 4;
const available_key = "ASDFGHJ";

for (var i = 1; i <= 7; i++) {
    var pos = (i - mid) * position_diff + 50;
    const buttom = document.getElementById("btm" + i);
    buttom.style.left = pos + "%";
    const line = document.getElementById('line' + i);
    line.style.left = pos + "%";
    const point = document.getElementById('ptn' + i);
    point.style.left = pos + "%";
    const column= document.getElementById('column' + i);
    column.style.left = pos + "%";
}
const trigger_line = document.getElementById('trigger-line');
trigger_line.style.height = "2px";

import { context, drum } from "./player.js";

function remove_note(note) {
    const column = note.parentNode;
    column.removeChild(note);
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
        const note = document.createElement('div');
        note.classList.add('note');
        const column= document.getElementById('column' + (index + 1));
        column.appendChild(note);
        setTimeout(() => {remove_note(note);}, 10000);
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

import { key } from './constants.js'

function sleep(milliseconds) {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}

window.onload = function() {
};
