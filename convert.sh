#! /bin/sh

echo "converting into onnx ..."
python3 ./nanodet/tools/export_onnx.py --cfg_path ./nanodet/config/nanodet-m.yml --model_path ./models/nanodetmodel.pth

echo "simplifying onnx ..."
python3 -m onnxsim nanodet.onnx nanodet_simple.onnx

echo "generating NCNN format..."
cd ./ncnn/build/tools/onnx/ && ./onnx2ncnn.exe ../../../../nanodet_simple.onnx ../../../../assets/nanodet-m.param ../../../../assets/nanodet-m.bin

cd ../../../..
