extern crate rustc_version;
use rustc_version::{version};

#[no_mangle]
pub extern fn get_native_version(a : i32) -> i32 {
    return 1;
}
#[no_mangle]
pub extern fn get_rustc_version(a : i32) -> std::string::String {
    return version().unwrap().to_string();
}

pub struct Transistor{
    pub ID : i32,
    pub collector_ID : i32,
    pub base_ID : i32,
    pub emitter_ID : i32,
    pub state : bool
}

#[no_mangle]
pub extern fn init_simulation(n : i32) {
    let transistors : [Transistor; 128];
}
