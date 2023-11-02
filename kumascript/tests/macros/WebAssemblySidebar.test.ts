import { assert, itMacro, describeMacro } from "./utils.js";

const expected = `\
<section id="Quick_links" data-macro="WebAssemblySidebar">

<ol>
  <li class="section"><a href="/en-US/docs/WebAssembly">WebAssembly home page</a>
  <li class="toggle">
    <details open>
      <summary>Tutorials</summary>
      <ol>
        <li><a href="/en-US/docs/WebAssembly/Concepts">WebAssembly concepts</a></li>
        <li><a href="/en-US/docs/WebAssembly/C_to_wasm">Compiling from C/C++ to WebAssembly</a></li>
        <li><a href="/en-US/docs/WebAssembly/Rust_to_wasm">Compiling from Rust to WebAssembly</a></li>
        <li><a href="/en-US/docs/WebAssembly/Using_the_JavaScript_API">Using the WebAssembly JavaScript API</a></li>
        <li><a href="/en-US/docs/WebAssembly/Understanding_the_text_format">Understanding WebAssembly text format</a></li>
        <li><a href="/en-US/docs/WebAssembly/Text_format_to_wasm">Converting WebAssembly text format to wasm</a></li>
        <li><a href="/en-US/docs/WebAssembly/Loading_and_running">Loading and running WebAssembly code</a></li>
        <li><a href="/en-US/docs/WebAssembly/Exported_functions">Exported WebAssembly functions</a></li>
      </ol>
    </details>
  </li>
  <li class="toggle">
    <details open>
      <summary>JavaScript interface</summary>
      <ol>
        <li><a href="/en-US/docs/WebAssembly/JavaScript_interface"><code>WebAssembly</code></a></li>
        <li><a href="/en-US/docs/WebAssembly/JavaScript_interface/Module"><code>WebAssembly.Module</code></a></li>
        <li><a href="/en-US/docs/WebAssembly/JavaScript_interface/Global"><code>WebAssembly.Global</code></a></li>
        <li><a href="/en-US/docs/WebAssembly/JavaScript_interface/Instance"><code>WebAssembly.Instance</code></a></li>
        <li><a href="/en-US/docs/WebAssembly/JavaScript_interface/Memory"><code>WebAssembly.Memory</code></a></li>
        <li><a href="/en-US/docs/WebAssembly/JavaScript_interface/Table"><code>WebAssembly.Table</code></a></li>
        <li><a href="/en-US/docs/WebAssembly/JavaScript_interface/Tag"><code>WebAssembly.Tag</code></a></li>
        <li><a href="/en-US/docs/WebAssembly/JavaScript_interface/Exception"><code>WebAssembly.Exception</code></a></li>
        <li><a href="/en-US/docs/WebAssembly/JavaScript_interface/CompileError"><code>WebAssembly.CompileError</code></a></li>
        <li><a href="/en-US/docs/WebAssembly/JavaScript_interface/LinkError"><code>WebAssembly.LinkError</code></a></li>
        <li><a href="/en-US/docs/WebAssembly/JavaScript_interface/RuntimeError"><code>WebAssembly.RuntimeError</code></a></li>
      </ol>
    </details>
  </li>
</ol>

</section>`;

describeMacro("WebAssemblySidebar", function () {
  itMacro("Generates WebAssembly Sidebar", function (macro) {
    return assert.eventually.equal(macro.call(), expected);
  });
});
