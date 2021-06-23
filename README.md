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



KIV:

```
python ./tools/export.py --cfg_path ./config/nanodet-m.yml --model_path ../models/nanodetmodel.pth --out_path ../nanodet_m.onnx
cd ..
python -m onnxsim nanodet_m.onnx nanodet_m-simplified.onnx
onnx-tf convert --infile nanodet_m-simplified.onnx --outdir models/saved-m
tensorflowjs_converter --input_format tf_saved_model --output_format tfjs_graph_model --strip_debug_ops=False --weight_shard_size_bytes 8388608 models/saved-m models/graph-m
```
