# for AI engine
FROM tensorflow/tensorflow:1.15.2-py3
RUN echo "Acquire::Check-Valid-Until \"false\";\nAcquire::Check-Date \"false\";" | cat > /etc/apt/apt.conf.d/10no--check-valid-until
RUN apt-get update 
RUN apt-get install -y libsm6 libxext6 libxrender-dev git
RUN pip install --upgrade pip && \
    pip install --no-cache-dir opencv-contrib-python==4.2.0.32 pandas==0.25.1 gputil==1.4.0 dicttoxml==1.7.4 && \
    pip install --no-cache-dir watchdog==0.10.2 xmltodict==0.12.0 matplotlib==3.1.3 numpy==1.18.1 pillow==7.0.0 scipy==1.4.1 keras==2.2.4 h5py==2.10.0 requests
    
# for wrapper
RUN pip install --no-cache-dir botocore boto3 requests-toolbelt==0.9.1 imageio==2.5.0 imageio-ffmpeg==0.4.3

# for job API
RUN pip install --no-cache-dir flask==1.1.1 werkzeug==0.16.0 datetime pyjwt==1.7.1 python-dotenv pipenv

# python packages for frcnn
RUN pip install datetime pyyaml==5.1 tensorboard==1.15.0 tqdm

# pycocotools
RUN pip install cython
RUN pip install --user "git+https://github.com/philferriere/cocoapi.git#egg=pycocotools&subdirectory=PythonAPI"

# torch
# RUN pip3 install torch==1.8.1+cpu torchvision==0.9.1+cpu torchaudio==0.8.1 -f https://download.pytorch.org/whl/torch_stable.html
RUN pip install torch===1.7.0+cu101 torchvision===0.8.1+cu101 torchaudio===0.7.0 -f https://download.pytorch.org/whl/torch_stable.html

# for NCNN model conversion
RUN pip install onnx-simplifier
RUN apt install protobuf-compiler libprotobuf-dev
RUN apt-get install cmake
RUN apt install wget unzip

WORKDIR /usr/src/app