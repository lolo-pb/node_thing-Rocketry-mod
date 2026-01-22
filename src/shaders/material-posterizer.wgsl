const luma = vec3f(0.2126, 0.7152, 0.0722);

const A = 17.74/255;
const B = 104.05/255;
const C = 190.36/255;


fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let l = dot(input, luma);

    if( l <= A ){

    } else if( l<= B ){

    } else if( l<= C ){

    }
    

    output[index] = l;
    return;
}
