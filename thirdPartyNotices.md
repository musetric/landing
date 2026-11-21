# Third-party Notices

This standalone landing project depends on third-party libraries used under their respective licenses.

For the complete and authoritative list of third-party notices used across the Musetric ecosystem, see:

https://github.com/musetric/musetric/blob/main/thirdPartyNotices.md

The Musetric monorepo (https://github.com/musetric/musetric) is the canonical source for license and attribution information.

## Fonts

The site serves two fonts of its own, bundled from `@fontsource-variable`:

- Fraunces, by the Fraunces Project Authors, under the SIL Open Font License 1.1.
- Inter, by the Inter Project Authors, under the SIL Open Font License 1.1.

## Libraries of the demo

The demo on the home page, which takes a song apart in the browser, bundles three libraries:

- `@musetric/ai`, with the code of `@musetric/fft` and `@musetric/utils`, by the Musetric developers, under the MIT License: https://github.com/musetric/musetric.
- ONNX Runtime Web, by Microsoft, under the MIT License: https://github.com/microsoft/onnxruntime. Its WebAssembly module is loaded from jsDelivr at the same version.
- `@musetric/dsp`, by the Musetric developers, under the MIT License: https://github.com/musetric/musetric. Its WebAssembly module `songs` is compiled from Rust crates, among them Symphonia, by Philip Deljanov and contributors, under the Mozilla Public License 2.0, compiled unmodified, whose source is at https://github.com/pdeljanov/Symphonia, and libopus, under the BSD 3-Clause License, whose notice is in https://github.com/musetric/musetric/blob/main/thirdPartyNotices.md.
