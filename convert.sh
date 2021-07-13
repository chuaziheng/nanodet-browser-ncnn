#! /bin/sh
# echo "converting into onnx ..."
# python3 ./nanodet/tools/export_onnx.py --cfg_path ./nanodet/config/nanodet-m-416.yml --model_path ./models/custom5_model_416.pth --out_path ./onnx_models/custom5-416.onnx

# echo "simplifying onnx ..."
# python3 -m onnxsim ./onnx_models/custom5-416.onnx ./onnx_models/custom5-416-simple.onnx

# echo "generating NCNN format..."
# cd ./ncnn/build/tools/onnx/ && ./onnx2ncnn ../../../../onnx_models/custom5-416-simple.onnx ../../../../assets/nanodet-m-416.param ../../../../assets/nanodet-m-416.bin

# cd ../../../..

echo "converting into onnx ..."
python3 ./nanodet/tools/export_onnx.py --cfg_path ./nanodet/config/nanodet-m.yml --model_path ./models/custom5_model_320.pth --out_path ./onnx_models/custom5_320.onnx

echo "simplifying onnx ..."
python3 -m onnxsim ./onnx_models/custom5_320.onnx ./onnx_models/custom5_320-simple.onnx

echo "generating NCNN format..."
cd ./ncnn/build/tools/onnx/ && ./onnx2ncnn.exe ../../../../onnx_models/custom5_320-simple.onnx ../../../../assets/nanodet-m.param ../../../../assets/nanodet-m.bin

cd ../../../..
# echo "converting into onnx ..."
# python3 ./nanodet/tools/export_onnx.py --cfg_path ./nanodet/config/nanodet-m.yml --model_path ./models/nanodetmodel.pth

# echo "simplifying onnx ..."
# python3 -m onnxsim nanodet.onnx nanodet_simple.onnx

# echo "generating NCNN format..."
# cd ./ncnn/build/tools/onnx/ && ./onnx2ncnn.exe ../../../../nanodet_simple.onnx ../../../../assets/nanodet-m.param ../../../../assets/nanodet-m.bin

# cd ../../../..
