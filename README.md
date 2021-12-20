##  [Browser] Nanodet Real-time inferencing (NCNN) Dockerized

Demo Link: https://chuaziheng.github.io/nanodet-wasm-ncnn/

Proof-of-Concept object detection project: Detects 5 classes ```['human face', 'human hand'. 'computer mouse', 'bottle', 'mobile phone'] ```

Simple web interface used to deploy Nanodet lightweight object detection model in NCNN framework, powered by WebAssembly backend.

Functionalities include:
1. Real-time webcam inferencing
2. Drag and drop image inferencing


## Set up (custom class inferencing)

<i>Work In Progress: To streamline the configuration pipeline.</i>

1. ```models/``` place model in this folder (mounted ```models/``` local directory to docker) default name: ```nanodetmodel.pth``` (ensure it corresponds with name in install.sh)
2. ``` nanodet.cpp``` : change class name
3. ``` nanodet/config/nanodet-m.yml``` change ```class_names``` at bottom of file and ```num_class``` *line 20*
4. ``` nanodet.h```: change NMS and score threshold

## Run 

1. Build docker image
```
docker build -t ncnn-browser .
```
2. Run docker container and mount local directory ``` /models```
```
docker run -dit -p 8080:8080 --name ncnn-browser --mount type=bind,source="$(pwd)"/models,target=/usr/src/app/models  --rm ncnn-browser
```


Adapted from: https://github.com/nihui/ncnn-webassembly-nanodet
