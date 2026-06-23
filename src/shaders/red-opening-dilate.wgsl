fn is_red(color: vec3f) -> bool {
    return color.r > 0.5 && color.g < 0.5 && color.b < 0.5;
}

fn is_black(color: vec3f) -> bool {
    return color.r < 0.5 && color.g < 0.5 && color.b < 0.5;
}

fn main(@builtin(global_invocation_id) id: vec3u) {
    if (!is_black(eroded)) {
        output[index] = eroded;
        return;
    }

    let R = clamp(i32(round(opening_radius)), 1, 20);
    var touches_red = false;

    for (var dy = -R; dy <= R; dy += 1) {
        for (var dx = -R; dx <= R; dx += 1) {
            let x = clamp(i32(id.x) + dx, 0, i32(u.width) - 1);
            let y = clamp(i32(id.y) + dy, 0, i32(u.height) - 1);
            let sample_index = u32(x) + u32(y) * u.width;
            touches_red = touches_red || is_red(raw_eroded[sample_index]);
        }
    }

    output[index] = select(vec3f(0.0), vec3f(1.0, 0.0, 0.0), touches_red);
}
