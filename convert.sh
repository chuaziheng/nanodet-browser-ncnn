#! /bin/sh

echo "converting into onnx ..."
python3 ./nanodet/tools/export_onnx.py --cfg_path ./nanodet/config/nanodet-m.yml --model_path ./models/custom5_model_320.pth --out_path ./onnx_models/custom5_320.onnx

echo "simplifying onnx ..."
python3 -m onnxsim ./onnx_models/custom5_320.onnx ./onnx_models/custom5_320-simple.onnx

echo "generating NCNN format..."
cd ./ncnn/build/tools/onnx/ && ./onnx2ncnn.exe ../../../../onnx_models/custom5_320-simple.onnx ../../../../assets/nanodet-m.param ../../../../assets/nanodet-m.bin

cd ../../../..

