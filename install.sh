#! /bin/sh
echo "running setup.py ..."
cd nanodet && python3 setup.py develop
cd ..

echo "installing ncnn..."
git clone https://github.com/Tencent/ncnn.git
cd ncnn
mkdir -p build
cd build
cmake -DCMAKE_BUILD_TYPE=Release  -DNCNN_SYSTEM_GLSLANG=ON -DNCNN_BUILD_EXAMPLES=ON ..  # -DNCNN_VULKAN=ON
make -j$(nproc)
cd ../..

echo "emptying assets folder"
rm -rf ./assets/
mkdir assets
mkdir onnx_models

echo "converting into onnx ..."
python3 ./nanodet/tools/export_onnx.py --cfg_path ./nanodet/config/nanodet-m-416.yml --model_path ./models/custom5_model_416.pth --out_path ./onnx_models/custom5-416.onnx

echo "simplifying onnx ..."
python3 -m onnxsim ./onnx_models/custom5-416.onnx ./onnx_models/custom5-416-simple.onnx

echo "generating NCNN format..."
cd ./ncnn/build/tools/onnx/ && ./onnx2ncnn ../../../../onnx_models/custom5-416-simple.onnx ../../../../assets/nanodet-m-416.param ../../../../assets/nanodet-m-416.bin

cd ../../../..


echo "installing emsdk..."
cd emsdk
./emsdk install 2.0.8
./emsdk activate 2.0.8
. "/usr/src/app/emsdk/emsdk_env.sh"
cd ..

echo "getting wasm files..."
wget https://github.com/nihui/ncnn/releases/download/20210519/ncnn-20210519-webassembly.zip
unzip ncnn-20210519-webassembly.zip

echo "building wasm..."
. "/usr/src/app/emsdk/emsdk_env.sh"
mkdir build
cd build
cmake -DCMAKE_TOOLCHAIN_FILE=$EMSDK/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake -DWASM_FEATURE=basic ..
make -j4
cmake -DCMAKE_TOOLCHAIN_FILE=$EMSDK/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake -DWASM_FEATURE=simd ..
make -j4
cmake -DCMAKE_TOOLCHAIN_FILE=$EMSDK/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake -DWASM_FEATURE=threads ..
make -j4
cmake -DCMAKE_TOOLCHAIN_FILE=$EMSDK/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake -DWASM_FEATURE=simd-threads ..
make -j4

echo "copy files up to parent directory"
cp ./*.data ../
# cp ./nanodet-simd-threads.data ../nanodet-simd-threads.data
# find ./nanodet-simd-threads.data -maxdepth 1 -exec mv {} .. \;
echo "running http-server"
cd ..
http-server
# while :
# do
# #   echo "Press <CTRL+C> to exit."
#   sleep 1
# done
