#! /bin/sh

# python3 test.py

# python /test.py
python3 nanodet/setup.py develop

python3 tools/export_onnx.py --cfg_path config/nanodet-m.yml --model_path models/nanodetmodel.pth

# python3 -m onnxsim nanodet.onnx nanodet_simple.onnx
