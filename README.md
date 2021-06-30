##  [Browser] Nanodet Real-time inferencing (NCNN) Dockerized

Adapted from: https://github.com/nihui/ncnn-webassembly-nanodet


## Set up (custom class inferencing)

1. ```models/``` place model in this folder (mounted ```models/``` local directory to docker) default name: ```nanodetmodel.pth``` (ensure it corresponds with name in install.sh)
2. ``` nanodet.cpp``` : change class name
3. ``` nanodet/config/nanodet-m.yml``` change ```class_names``` at bottom of file and ```num_class``` *line 20*
4. ``` nanodet.h```: change NMS and score threshold
5. Build docker image
```
docker build -t ncnn-browser .
```
6. Run docker container and mount local directory ``` /models```
```
docker run -dit -p 8080:8080 --name ncnn-browser --mount type=bind,source="$(pwd)"/models,target=/usr/src/app/models  --rm ncnn-browser
```



## PyTorch to Tensorflow-JS

<!-- ```
python ./tools/export_onnx.py --cfg_path ./config/nanodet-m.yml --model_path ./models/nanodet_m.ckpt --out_path ./onnx_models/nanodet_m_ckpt.onnx

python -m onnxsim ./onnx_models/nanodet_m_ckpt.onnx ./onnx_models/nanodet_m_ckpt-simplified.onnx

onnx-tf convert --infile ./onnx_models/nanodet_m_ckpt-simplified.onnx --outdir models/saved-m-ckpt

tensorflowjs_converter --input_format tf_saved_model --output_format tfjs_graph_model --strip_debug_ops=False --weight_shard_size_bytes 8388608 models/saved-m-ckpt models/graph-m-ckpt
``` -->
```
python ./nanodet/tools/export_onnx.py --cfg_path ./nanodet/config/nanodet-m-416.yml --model_path ./models/hands_416.pth --out_path ./onnx_models/hands_416.onnx

python -m onnxsim ./onnx_models/hands_416.onnx ./onnx_models/hands_416-simplified.onnx

onnx-tf convert --infile ./onnx_models/hands_416-simplified.onnx --outdir models/hands_416

tensorflowjs_converter --input_format tf_saved_model --output_format tfjs_graph_model --strip_debug_ops=False --weight_shard_size_bytes 8388608 models/hands_416 models/graph_hands_416
```
<!-- ```
python ./tools/export_onnx.py --cfg_path ./config/nanodet-m.yml --model_path ./models/nanodetmodel.pth --out_path ./onnx_models/nanodet_custom.onnx

python -m onnxsim ./onnx_models/nanodet_custom.onnx ./onnx_models/nanodet_custom-simplified.onnx

onnx-tf convert --infile ./onnx_models/nanodet_custom-simplified.onnx --outdir models/saved-custom

tensorflowjs_converter --input_format tf_saved_model --output_format tfjs_graph_model --strip_debug_ops=False --weight_shard_size_bytes 8388608 models/saved-custom models/graph-custom
``` -->

<!-- 416 custom -->
<!-- ```
python ./tools/export_onnx.py --cfg_path ./config/nanodet-m-416.yml --model_path ./models/nanodet_m_416.ckpt --out_path ./onnx_models/nanodet_custom_416.onnx

python -m onnxsim ./onnx_models/nanodet_custom_416.onnx ./onnx_models/nanodet_custom_416-simplified.onnx

onnx-tf convert --infile ./onnx_models/nanodet_custom_416-simplified.onnx --outdir models/saved-custom-416

tensorflowjs_converter --input_format tf_saved_model --output_format tfjs_graph_model --strip_debug_ops=False --weight_shard_size_bytes 8388608 models/saved-custom-416 models/graph-416
``` -->
