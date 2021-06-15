#! /bin/sh
# echo "installing ncnn..."
# git clone https://github.com/Tencent/ncnn.git
# cd ncnn
# mkdir -p build
# cd build
# cmake -DCMAKE_BUILD_TYPE=Release  -DNCNN_SYSTEM_GLSLANG=ON -DNCNN_BUILD_EXAMPLES=ON ..  # -DNCNN_VULKAN=ON
# make -j$(nproc)
# cd ../..


# echo "running setup.py ..."
# cd nanodet && python3 setup.py develop

# echo "converting into onnx ..."
# cd ..
# # python3 ./nanodet/tools/test1.py
# # ls
# python3 ./nanodet/tools/export_onnx.py --cfg_path ./nanodet/config/nanodet-m.yml --model_path ./models/nanodetmodel.pth

# echo "simplifying onnx ..."
# python3 -m onnxsim nanodet.onnx nanodet_simple.onnx

# # echo "generating NCNN format..."
# cd ./ncnn/build/tools/onnx/ && ./onnx2ncnn ../../../../nanodet_simple.onnx ../../../../assets/nanodet-m.param ../../../../assets/nanodet-m.bin

# echo "cloning emsdk..."
# cd emsdk
# ./emsdk install 2.0.8
# ./emsdk activate 2.0.8
# . "/usr/src/app/emsdk/emsdk_env.sh"


while :
do
#   echo "Press <CTRL+C> to exit."
  sleep 1
done
