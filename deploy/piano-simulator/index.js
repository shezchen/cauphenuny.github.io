import {
    keys, all_keys, note_name, sharp_name, flat_name,
    sharp_note, sharp_scale_name, flat_note, flat_scale_name,
    diff, velocity_levels, velocity_adj, key2note, C1, C2, C3,
    init_constants,
} from './constants.js'
import { set_offset, env_verify, environment } from './player.js';
import { play, note_down, note_up, note_stop, piano, stop, drum } from './player.js'
import { keyup_animation, keydown_animation, mouseenter, mouseleave } from './keyboard.js'

let loading = 1;
let env = {};

function refresh() {
    document.getElementById("bpm").value = env.bpm;
    document.getElementById("vel").textContent = "力度：" + velocity_levels[env.velocity];
    const selectElement = document.getElementById('offset_option');
    selectElement.selectedIndex = env.offset_mode;
    if (env.offset_mode == 0) {
        document.getElementById("key_offset").value = env.global_offset;
        document.getElementById("key_name").innerHTML = `(1=${note_name[(env.global_offset + 120) % 12]})`;
    } else { 
        let cnt = env.shift_cnt;
        document.getElementById("key_offset").value = cnt;
        if (cnt >= 0) {
            if (cnt > 6) cnt = 6;
            document.getElementById("key_name").innerHTML = sharp_scale_name[cnt] + "大调 <img alt=\"调号\" class=\"keysgn-img\"" + 
                                                                                              "align=\"center\" " + 
                                                                                              "src=\"./keysignature/" + cnt + ".png\"" + 
                                                                                         ">";
        } else {
            if (cnt < -6) cnt = -6;
            document.getElementById("key_name").innerHTML = flat_scale_name[-cnt] + "大调 <img alt=\"调号\" class=\"keysgn-img\"" + 
                                                                                              "align=\"center\" " + 
                                                                                              "src=\"./keysignature/" + cnt + ".png\"" + 
                                                                                         ">";
        }
    }
    document.getElementById("time_sign1").value = env.time1;
    document.getElementById("time_sign2").value = env.time2;
}
function init_option() {
    env.offset_mode = 0;
    env.velocity = 4;
    env.global_offset = 0;
    set_offset(env, 0, 0);
}

let input_loaded = 0;
function extract(tape) {
    console.log("------- start extracting -------");
    console.log(`origin: \n ${tape} \n`);
    let ext = "";
    for (let i = 0; i < tape.length; i++) {
        switch (tape[i]) {
            case '#':
                while (i < tape.length && tape[i] != '\n' && tape[i] != '\r') {
                    i++;
                }
                break;
            default: 
                if (all_keys.indexOf(tape[i]) != -1) {
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
function wrap_note(original) {
    return original + env.global_offset + env.note_shift[original % 12];
}
function after_load() {
    loading = 0;
    const status_element = document.getElementById("status");
    //status_element.parentNode.removeChild(status_element);
    status_element.style.color = "green";
    status_element.innerHTML = "准备就绪";
    const hovers = document.getElementsByClassName("disable-when-loaded");
    for (let i = 0; i < hovers.length; i++) {
        hovers[i].style.display = "none";
    }
    const pedal = document.getElementById('pedal-hover');
    pedal.innerHTML = "按Shift或CapsLock";
    pedal.style.top = "100%";
    pedal.style.height = "3em";
    if (localStorage.getItem('raw_main') != undefined) {
        load_inputs();
    } else {
        load_preset(presets.init);
    }
    refresh();

    let lasting = [], pedal_lock = 0;
    let terminate = note_stop;
    const key_buttons = document.getElementsByClassName("kb-img");
    for (let i = 0; i < key_buttons.length; i++) {
        key_buttons[i].addEventListener('mousedown', function() {
            let name = this.id, code = name.charCodeAt();
            note_down(name, wrap_note(key2note[code]), env.velocity);
        });
        key_buttons[i].addEventListener('mouseenter', function() {
            mouseenter(this.parentNode);
        });
        key_buttons[i].addEventListener('mouseleave', function(event) {
            mouseleave(this.parentNode);
            let name = this.id, note = wrap_note(key2note[name.charCodeAt()]);
            note_up(name);
            terminate(note);
        });
    }
    const pedal_button = document.getElementById('Pedal');
    pedal_button.addEventListener('mouseenter', function() {
        mouseenter(this.parentNode);
    });
    pedal_button.addEventListener('mouseleave', function() {
        mouseleave(this.parentNode);
    });
    function note_restore(note) {
        console.log(`restore ${note}`);
        lasting.push(note);
    }
    function pedal_down() {
        keydown_animation("Pedal");
        terminate = note_restore;
    }
    function pedal_up() {
        console.log("pedal up");
        for (let i = 0; i < lasting.length; i++) {
            note_stop(lasting[i]);
        }
        lasting.length = 0;
        terminate = note_stop;
        keyup_animation("Pedal");
    }
    document.addEventListener("keydown", function(event) {
        if (event.ctrlKey || event.altKey || event.metaKey) {
            return;
        }
        let key = event.key.toUpperCase();
        let code = key.charCodeAt();
        console.log(`${key} ${code} down caps:${pedal_lock}`);
        switch (key) {
            case '-':
                if (env.velocity > 0) env.velocity--; 
                refresh();
            break;

            case '=':
            case '+':
                if (env.velocity < 9) env.velocity++;
                refresh();
            break;

            case 'CAPSLOCK':
                pedal_lock ^= 1;
                if (pedal_lock) {
                    pedal_down();
                } else {
                    pedal_up();
                }
                break;
            case 'SHIFT':
                if (pedal_lock) {
                    pedal_up();
                } else {
                    pedal_down();
                }
                break;

            default:
                if (keys.indexOf(key) != -1) {
                    if (event.repeat) {
                        return;
                    }
                    note_down(
                        key,
                        wrap_note(key2note[code]),
                        env.velocity
                    );
                }
            break;
        }
    });
    document.getElementById('Pedal').addEventListener('mousedown', function() {
        pedal_lock ^= 1;
        if (pedal_lock) {
            pedal_down();
        } else {
            pedal_up();
        }
    });
    document.getElementById('Pedal').addEventListener('mouseenter', function() {
        if (pedal_lock) {
            pedal_up();
        }
    });
    document.getElementById('Pedal').addEventListener('mouseleave', function() {
        if (pedal_lock) {
            pedal_down();
        }
    });
    document.addEventListener("keyup", function(event) {
        let key = event.key.toUpperCase();
        let code = key.charCodeAt();
        console.log(`${key} ${code} up caps:${pedal_lock}`);
        switch (key) {
            case 'SHIFT':
                if (pedal_lock) {
                    pedal_down();
                } else {
                    pedal_up();
                }
                break;
            default:
                if (keys.indexOf(key) != -1) {
                    note_up(key);
                    terminate(wrap_note(key2note[code]));
                }
                break;
        }
    });
}
piano.load.then(() => {
    after_load();
});

function save_environment() {
    console.log(env);
    console.log(`saved: ${JSON.stringify(env)}`);
    localStorage.setItem('env', JSON.stringify(env));
}

function save_inputs() {
    const main = document.getElementById("input");
    const sub = document.getElementById("input2");
    const name = document.getElementById("song-name");
    localStorage.setItem('raw_main', main.value);
    localStorage.setItem('raw_sub', sub.value);
    localStorage.setItem('name', name.value);
}

function load_inputs() {
    input_loaded = 1;
    console.log("loaded previous input");
    const main = document.getElementById("input");
    const sub = document.getElementById("input2");
    const name = document.getElementById("song-name");
    main.value = localStorage.getItem('raw_main');
    sub.value = localStorage.getItem('raw_sub');
    name.value = localStorage.getItem('name');
}

function fetch_inputs() {
    let main_input = document.getElementById("input").value;
    let name = document.getElementById("song-name").value;
    let inputs = {
        name: name,
        main: extract(main_input),
        sub: decompress(extract(document.getElementById("input2").value)),
    };
    return inputs;
}
function read_option() {
    env.bpm = parseInt(document.getElementById("bpm").value);
    const selectElement = document.getElementById('offset_option');
    const offset = document.getElementById("key_offset");
    set_offset(env, selectElement.selectedIndex, parseInt(offset.value));
    env.time1 = parseInt(document.getElementById("time_sign1").value);
    env.time2 = parseInt(document.getElementById("time_sign2").value);
    refresh();
}
document.getElementById("submit").onclick = () => {
    read_option();
}
document.getElementById("stop").onclick = () => {
    console.log("stop");
    stop();
}
import * as presets from './songs.js'
function load_preset(preset) {
    //console.log(preset.env);
    env = { ...preset.env };
    document.getElementById("song-name").value = preset.name;
    document.getElementById("input").value = preset.main;
    document.getElementById("input2").value = preset.sub;
}

let preset_elements = document.getElementsByClassName('preset');
for (let i = 0; i < preset_elements.length; i++) {
    preset_elements[i].onclick = () => {
        if (loading) return;
        load_preset(presets[preset_elements[i].id]);
        refresh();
    }
}

document.getElementById("start").onclick = () => {
    if (loading) return;
    console.log("click");
    //getAttribute();
    read_option();
    save_inputs();
    let input = fetch_inputs();
    save_environment();
    stop();
    let env2 = { ...env };
    env2.global_offset -= 12;
    play(input.main, env), play(input.sub, env2);
}
function gamestart() {
    if (loading) return;
    stop();
    read_option();
    save_inputs();
    let input = fetch_inputs();
    console.log(input);
    save_environment();
    localStorage.setItem('tape', JSON.stringify(input));
    localStorage.setItem('difficulty', document.getElementById("difficulty-select").selectedIndex);
    localStorage.setItem('delay', document.getElementById("delay-slider").value);
    const raw = document.getElementById("drop-slider").value;
    localStorage.setItem('drop_time', 1500 / raw);
    const volume = document.getElementById('volume-slider').value;
    localStorage.setItem('volume', volume);
    window.location.href = './game.html'
}
document.getElementById("gamestart").onclick = () => {
    localStorage.setItem('is_tutorial', "0");
    gamestart();
}
document.getElementById("gamestart2").onclick = () => {
    localStorage.setItem('is_tutorial', "0");
    gamestart();
}
document.getElementById("gametutorial").onclick = () => {
    localStorage.setItem('is_tutorial', "1");
    gamestart();
}
document.getElementById("gametutorial2").onclick = () => {
    localStorage.setItem('is_tutorial', "1");
    gamestart();
}
document.getElementById("vel-add").onclick = () => {
    if (env.velocity < 9) env.velocity++;
    refresh();
}
document.getElementById("vel-minus").onclick = () => {
    if (env.velocity > 0) env.velocity--;
    refresh();
}
document.getElementById("reset-environment").onclick = () => {
    init_option();
    refresh();
}

//let str = "";
init_constants();
//console.log(str);
const key_buttons = document.getElementsByClassName("kb-img");
for (let i = 0; i < key_buttons.length; i++) {
    key_buttons[i].draggable = false; // 不可拖动
}
const prev_env = JSON.parse(localStorage.getItem('env'));
if (localStorage.getItem('env') != undefined && env_verify(prev_env)) {
    env = prev_env;
    document.getElementById("difficulty-select").selectedIndex = parseInt(localStorage.getItem('difficulty'));
    console.log("loaded previous environment");
} else {
    env = new environment();
    console.log("created environment");
    document.getElementById("difficulty-select").selectedIndex = 3;
}
refresh();

