export function keyup_animation(key) {
    //console.log("keyup_ani ", key);
    const img = document.getElementById(key);
    img.style.filter = 'brightness(1) drop-shadow(3px 3px 4px rgba(0,0,0,0.4))';
    img.style.transform = 'scale(1)';
}
export function keydown_animation(key) {
    //console.log("keydown_ani ", key);
    //console.log(key);
    const img = document.getElementById(key);
    img.style.filter = 'brightness(0.65)';
    img.style.transform = 'scale(0.9)';
}
export function mouseenter(element) {
    element.style.filter = 'brightness(0.9)';
}
export function mouseleave(element) {
    element.style.filter = 'brightness(1)';
}

