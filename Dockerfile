FROM ubuntu:20.04
WORKDIR /usr/src/app
ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3.7 \
    python3-pip

# Nanodet dependencies

RUN apt-get -y install python3-dev
RUN apt install -y git
RUN pip3 install torch torchvision torchaudio opencv-python pytorch-lightning pyaml Cython
RUN pip3 install termcolor tensorboard matplotlib tqdm
RUN apt-get -y install xz-utils gcc
RUN pip3 install --user "git+https://github.com/philferriere/cocoapi.git#egg=pycocotools&subdirectory=PythonAPI"

RUN apt-get -y install  protobuf-compiler libprotobuf-dev
RUN apt-get -y install  cmake
RUN apt install wget unzip

# For NCNN model conversion
RUN pip3 install setuptools
RUN pip3 install onnx-simplifier
RUN apt-get -y install  ffmpeg libsm6 libxext6
RUN apt -y install build-essential libopencv-dev

# Install npm dependencies
RUN apt -y install nodejs
RUN apt-get -y install npm
RUN npm install -g http-server

# Clone repos
RUN git clone https://github.com/nihui/ncnn-webassembly-nanodet .
RUN git clone https://github.com/emscripten-core/emsdk.git

COPY nanodet/ /usr/src/app/nanodet/
COPY nanodet.cpp /usr/src/app/nanodet.cpp
COPY nanodet.h /usr/src/app/nanodet.h
COPY nanodetncnn.cpp /usr/src/app/nanodetncnn.cpp

# Dev Debugging purposes
RUN apt-get -y install vim

# ENTRYPOINT ["sh", "./install.sh"]
COPY install.sh/ install.sh
CMD [ "./install.sh" ]



