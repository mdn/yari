# watify

Compile WAT to WASM with WASM 🙇

---

## Running

```bash
# optional: install wasm-pack if not already installed
cargo install wasm-pack

# build
wasm-pack build --release --target web

#serve
python3 -m http.server
```

Go to [localhost:8000](http://localhost:8000/) and look at he console output.
