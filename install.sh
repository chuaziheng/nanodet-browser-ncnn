#! /bin/sh
echo "running setup.py ..."
cd nanodet && python3 setup.py develop
cd ..

echo "cloning emsdk..."
cd emsdk
./emsdk install 2.0.8
./emsdk activate 2.0.8
. "/usr/src/app/emsdk/emsdk_env.sh"


echo "Installing wasm files..."
cd ..
wget https://github.com/nihui/ncnn/releases/download/20210519/ncnn-20210519-webassembly.zip
unzip ncnn-20210519-webassembly.zip

echo "building wasm..."
mkdir build
cd build
. "/usr/src/app/emsdk/emsdk_env.sh"
cmake -DCMAKE_TOOLCHAIN_FILE=$EMSDK/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake -DWASM_FEATURE=basic ..
make -j4
cmake -DCMAKE_TOOLCHAIN_FILE=$EMSDK/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake -DWASM_FEATURE=simd ..
make -j4
cmake -DCMAKE_TOOLCHAIN_FILE=$EMSDK/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake -DWASM_FEATURE=threads ..
make -j4
cmake -DCMAKE_TOOLCHAIN_FILE=$EMSDK/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake -DWASM_FEATURE=simd-threads ..
make -j4

echo "moving files up to parent directory"
find . -maxdepth 1 -exec mv {} .. \;
echo "running http-server"
cd ..
http-server
echo $(ls)
while :
do
#   echo "Press <CTRL+C> to exit."
  sleep 1
done
