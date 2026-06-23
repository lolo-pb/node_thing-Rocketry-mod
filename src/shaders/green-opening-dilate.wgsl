fn class_color(color: vec3f) -> vec3f {
    if (color.r > color.g && color.r > color.b) {
        return vec3f(1.0, 0.0, 0.0);
    }
    if (color.b > color.r && color.b > color.g) {
        return vec3f(0.0, 0.0, 1.0);
    }
    return vec3f(0.0, 1.0, 0.0);
}

fn is_green(color: vec3f) -> bool {
    return class_color(color).g > 0.5;
}

fn main(@builtin(global_invocation_id) id: vec3u) {
    if (removed_green < 0.5) {
        output[index] = class_color(eroded);
        return;
    }

    let R = clamp(i32(round(opening_radius)), 1, 20);
    var touches_green = false;

    for (var dy = -R; dy <= R; dy += 1) {
        for (var dx = -R; dx <= R; dx += 1) {
            let x = clamp(i32(id.x) + dx, 0, i32(u.width) - 1);
            let y = clamp(i32(id.y) + dy, 0, i32(u.height) - 1);
            let sample_index = u32(x) + u32(y) * u.width;
            touches_green = touches_green || is_green(raw_eroded[sample_index]);
        }
    }

    output[index] = select(
        vec3f(0.0, 0.0, 1.0),
        vec3f(0.0, 1.0, 0.0),
        touches_green
    );
}
