
//need : radius{pixeles}, range[0.1;1.0]?
// el input tiene que ser number asi toma el luminance

fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let R = i32(floor(radius));

    //these could be ints, but i couldnt be fucked to deal with types
    var sum = 0.0;
    var circle_count = 0.0;

    var out = 0.0;

    for (var dy = -R; dy <= R; dy = dy + 1) {
        for (var dx = -R; dx <= R; dx = dx + 1) {
            let x = clamp(i32(id.x) + dx, 0, i32(u.width) - 1);
            let y = clamp(i32(id.y) + dy, 0, i32(u.height) - 1);

            let dist_sq = f32(dx * dx + dy * dy);
            let inner = (radius - range) * (radius - range);
            let outer = (radius + range) * (radius + range);

            if (dist_sq >= inner && dist_sq <= outer) {// Inside the circle range
                let sample_index = u32(x) + u32(y) * u.width;
                let sample = raw_input[sample_index];

                if(sample.r == 1.0 && sample.g == 1.0 && sample.b == 1.0){// se fija en un circulo si hay borde // aka si algun circulo pasa por ahi
                    sum += 1.0;
                } 
                circle_count += 1.0;
            }
        }
    }

    let circleness = sum/circle_count;

    out = circleness;

    output[index] = out;
    return;
}
