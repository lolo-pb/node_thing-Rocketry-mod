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
    let R = clamp(i32(round(radius)), 1, 20);
    var result = class_color(input);

    if (is_green(input)) {
        var keep_green = true;
        for (var dy = -R; dy <= R; dy += 1) {
            for (var dx = -R; dx <= R; dx += 1) {
                let x = clamp(i32(id.x) + dx, 0, i32(u.width) - 1);
                let y = clamp(i32(id.y) + dy, 0, i32(u.height) - 1);
                let sample_index = u32(x) + u32(y) * u.width;
                keep_green = keep_green && is_green(raw_input[sample_index]);
            }
        }
        result = select(
            vec3f(0.0, 0.0, 1.0),
            vec3f(0.0, 1.0, 0.0),
            keep_green
        );
        removed_green[index] = select(1.0, 0.0, keep_green);
    } else {
        removed_green[index] = 0.0;
    }

    eroded[index] = result;
    opening_radius[index] = f32(R);
}
