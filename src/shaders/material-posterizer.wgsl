const luma = vec3f(0.2126, 0.7152, 0.0722);

const A = 0.01;//2.55/255;
const B = 0.17;//104.05/255;
//const C = 190.36/255;


fn main(@builtin(global_invocation_id) id: vec3<u32>) {

    let in = input * sensitivity;

    let l = dot(in, luma);
    var out = vec3f(0.0);

    if( l >= A && l < B ){
        //resina
        out = vec3f(0.0, 1.0, 0.0);
    } else if( l >= B ){
        //fibra
        out = vec3f(1.0, 1.0, 0.0);
    }else {
        //negro

    }
    

    output[index] = out;
    return;
}
