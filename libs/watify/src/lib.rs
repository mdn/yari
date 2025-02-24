use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn watify(text: &str) -> Result<Vec<u8>, JsValue> {
    wat::parse_str(text).map_err(|e| e.to_string().into())
}
