import {
    key, note_name, sharp_name, flat_name,
    sharp_note, sharp_scale_name, flat_note, flat_scale_name,
    diff, velocity_levels, velocity_adj, key2note, C1, C2, C3,
    init_constants,
} from './constants.js'
import { env, play, notepress, notedown, noteup, piano, stop } from './player.js'
import { keyup_animation, keydown_animation, mouseenter, mouseleave } from './keyboard.js'


function refresh() {
    document.getElementById("bpm").value = env.bpm;
    document.getElementById("vel").textContent = "力度：" + velocity_levels[env.velocity];
    const selectElement = document.getElementById('offset_option');
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    if (selectedOption.value == "flex") {
        document.getElementById("key_name").innerHTML = "(1=" + note_name[(env.global_offset + 120) % 12] + ")";
        document.getElementById("key_offset").value = env.global_offset;
    } else { 
        document.getElementById("key_offset").value = env.fix_offset_cnt;
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
    env.fix_offset_cnt = 0;
    document.getElementById("input").value = "";
    document.getElementById("input2").value = "";
    refresh();
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
function after_load() {
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
            mouseenter(this.parentNode);
        });
        key_buttons[i].addEventListener('mouseleave', function() {
            mouseleave(this.parentNode);
        });
    }
    document.addEventListener("keydown", function(event) {
        if (event.repeat) {
            return;
        }
        if (event.ctrlKey || event.altKey || event.metaKey) {
            return;
        }
        var key = event.key.toUpperCase();
        if (key.length > 1) return;
        var code = key.charCodeAt();
        console.log(`${key} ${code} down`);
        if (key2note.has(code)) {
            notedown(code, key2note.get(code), env.velocity);
        }
        if (key == '-') {
            if (env.velocity > 0) env.velocity--; 
            refresh();
        }
        if (key == '=' || key == '+') {
            if (env.velocity < 9) env.velocity++;
            refresh();
        }
    });
    document.addEventListener("keyup", function(event) {
        var key = event.key.toUpperCase();
        var code = key.charCodeAt();
        console.log(`${key} ${code} up`);
        if (key2note.has(code)) {
            noteup(code);
        }
    });
}
piano.load.then(() => {
    after_load();
});

function fetch_input() {
    let inputs = {
        main: extract(document.getElementById("input").value),
        sub: decompress(extract(document.getElementById("input2").value)),
    };
    return inputs;
}
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
        env.fix_offset_cnt = cnt;
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
    env.fix_offset_cnt = 0;
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
    env.fix_offset_cnt = 0;
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
  var input = fetch_input();
  console.log(input);
  localStorage.setItem('tape', JSON.stringify(input));
  localStorage.setItem('env', JSON.stringify(env));
  localStorage.setItem('delay', document.getElementById("delay").value);
  localStorage.setItem('difficulty', document.getElementById("difficulty-select").selectedIndex);
  window.location.href = './game.html'
}

window.onload = function() {
    //var str = "";
    init_constants();
    //console.log(str);
    const key_buttons = document.getElementsByClassName("kb-img");
    for (var i = 0; i < key_buttons.length; i++) {
        key_buttons[i].draggable = false; // 不可拖动
    }
    document.getElementById("difficulty-select").selectedIndex = 2;
}

