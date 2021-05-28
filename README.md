##  [Browser] Nanodet Real-time inferencing (NCNN)

Adapted from: https://github.com/nihui/ncnn-webassembly-nanodet


## PyTorch to NCNN

1. Convert pytorch (.pth) to .onnx (Using insert/nanodet/repo)
```
python tools/export_onnx.py --cfg_path ${CONFIG_PATH} --model_path ${PYTORCH_MODEL_PATH}
```

2. Simplify onnx file https://github.com/daquexian/onnx-simplifier
```
pip install onnx-simplifier

python -m onnxsim {INPUT_ONNX_MODEL} {OUTPUT_ONNX_MODEL}
```

3. Convert .onnx into NCNN model format (.bin and .param) https://convertmodel.com/

4. Place .bin and .param files into ``` /assets ```. Take note: remove the ```zone-identifier``` files
https://github.com/nihui/ncnn-webassembly-nanodet

5. [For first time] Install Emscripten (skip to step 8 if already installed)
```
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install 2.0.8
./emsdk activate 2.0.8

source emsdk/emsdk_env.sh
```

6. [For first time] Download and extract ncnn webassembly package
```
wget https://github.com/nihui/ncnn/releases/download/20210519/ncnn-20210519-webassembly.zip
unzip ncnn-20210519-webassembly.zip
```
7. Set env variables (somehow i need to do it everytime)
```source emsdk/emsdk_env.sh```

8. Create new build directory and build (currently ncnn model will be compiled)
```
mkdir build_name
cd build_name

cmake -DCMAKE_TOOLCHAIN_FILE=$EMSDK/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake -DWASM_FEATURE=basic ..
make -j4
cmake -DCMAKE_TOOLCHAIN_FILE=$EMSDK/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake -DWASM_FEATURE=simd ..
make -j4
cmake -DCMAKE_TOOLCHAIN_FILE=$EMSDK/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake -DWASM_FEATURE=threads ..
make -j4
cmake -DCMAKE_TOOLCHAIN_FILE=$EMSDK/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake -DWASM_FEATURE=simd-threads ..
make -j4
```
9. Bring the following files out to same level as index.html (different files depending on simd)
```
nanodet-threads.data
nanodet-threads.js
nanodet-threads.wasm
nanodet-threads.worker.js
```
10. Deploy
```
http-server
```

## Possible issues

Debug:

1. ```Cannot read property 'getSupportedConstraints' of undefined ```
Check url, 172.xxx is apparently an unsecure connection. Use 127.xxx instead.
