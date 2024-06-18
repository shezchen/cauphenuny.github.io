export const key = 'ZXCVBNMASDFGHJQWERTYU';
export const note_name = ["C", "C<sup>♯</sup>/D<sup>♭</sup>", "D", "D<sup>♯</sup>/E<sup>♭</sup>", "E", "F", "F<sup>♯</sup>/G<sup>♭</sup>", 
                          "G", "G<sup>♯</sup>/A<sup>♭</sup>", "A", "A<sup>♯</sup>/B<sup>♭</sup>", "B"];
export const sharp_name = ["C", "C<sup>♯</sup>", "D", "D<sup>♯</sup>", "E", "F", "F<sup>♯</sup>", "G", "G<sup>♯</sup>", "A", "A<sup>♯</sup>", "B"];
export const flat_name  = ["C", "D<sup>♭</sup>", "D", "E<sup>♭</sup>", "E", "F", "G<sup>♭</sup>", "G", "A<sup>♭</sup>", "A", "B<sup>♭</sup>", "B"];
export const vocal_name = ["do", "", "re", "", "mi", "fa", "", "sol", "", "la", "", "si"];
export const major_scale = "CDEFGAB";
export const sharp_note = [5, 0, 7, 2, 9, 4, 11];
export const sharp_scale_name = ["C", "G", "D", "A", "E", "B", "F<sup>♯</sup>"];
export const flat_note = [11, 4, 9, 2, 7, 0, 5];
export const flat_scale_name = ["C", "F", "B<sup>♭</sup>", "E<sup>♭</sup>", "A<sup>♭</sup>", "D<sup>♭</sup>", "G<sup>♭</sup>"];
export const diff = [2, 2, 1, 2, 2, 2, 1];
export const velocity_levels = [32, 48, 56, 64, 68, 72, 80, 88, 96, 108];
export const velocity_adj = [];
export const key2note = new Map();
export const C1 = 48, C2 = 60, C3 = 72;
export function init_constants() {
    for (var i = 0; i <= 120; i++) {
        velocity_adj[i] = Math.round(-Math.max(Math.min((C3 - i) / 2, 20), -10));
    }
    for (var i = 0, note = C1; i < key.length; i++) {
        key2note.set(key.charCodeAt(i), note);
        note += diff[i % 7];
        //str += "<span id=hover" + key[i] + "><img id=\"key" + key[i] + "\" class=\"kb-img\" src=\"./keyboard/" + key[i] + ".png\" alt=\"key" + key[i] + "\"></span>\n"
    }
}
