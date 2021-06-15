FROM ubuntu:20.04
WORKDIR /usr/src/app
ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3.7 \
    python3-pip

# nanodet dependencies
# RUN apt-get install -y python3-dev


RUN apt-get -y install python3-dev
RUN apt install -y git
RUN pip3 install torch torchvision torchaudio opencv-python pytorch-lightning pyaml Cython
RUN pip3 install termcolor tensorboard matplotlib tqdm
RUN apt-get -y install xz-utils gcc
RUN pip3 install --user "git+https://github.com/philferriere/cocoapi.git#egg=pycocotools&subdirectory=PythonAPI"

RUN apt-get -y install  protobuf-compiler libprotobuf-dev
RUN apt-get -y install  cmake
RUN apt install wget unzip
# # # for NCNN model conversion
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

# RUN cd emsdk
# RUN ./emsdk install 2.0.8
# RUN ./emsdk activate 2.0.8
# RUN  "/usr/src/app/emsdk/emsdk_env.sh"

# COPY install.sh/ install.sh
# COPY convert.sh/ convert.sh
COPY nanodet/ /usr/src/app/nanodet/
# COPY ncnn/ /usr/src/app/ncnn

# COPY . .
# # CMD [ "python3", "test.py" ]
# CMD [ "./convert.sh" ]

# ENTRYPOINT ["sh", "./install.sh"]
COPY install.sh/ install.sh
CMD [ "./install.sh" ]



