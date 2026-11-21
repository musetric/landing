# Third-party Notices of the site

The build of the site writes `notices.txt`, which the site serves at https://musetric.com/notices.txt. It joins this file with:

- the license and the notice files of every npm package whose code, styles or fonts Vite bundles into the pages and the workers of the site, Fraunces and Inter among them, as `scripts/noticesPlugin.ts` finds them in the build;
- `thirdPartyNotices.md` of `@musetric/dsp`, the notices of the Musetric project: the works whose code `@musetric/ai` and `@musetric/dsp` adapt, the models, the Opus decoder `symphonia-opus` with the fork it is built from, and the MIT License of ONNX Runtime Web, whose npm packages ship no license file;
- `notices/crates.md` of `@musetric/dsp`, the licenses of the Rust crates compiled into its WebAssembly modules, among them Symphonia under the Mozilla Public License 2.0, with where the source of each crate is published.

The demo loads the WebAssembly module of ONNX Runtime Web from jsDelivr, at the version of `onnxruntime-web` the site bundles. The third-party notices of the libraries compiled into that module are in https://github.com/musetric/musetric/blob/main/packages/app/notices/onnxruntime.txt.
