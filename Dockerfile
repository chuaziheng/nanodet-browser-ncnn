FROM ubuntu:20.04
WORKDIR /usr/src/app
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3.7 \
    python3-pip

# torch
RUN pip3 install torch torchvision torchaudio

# RUN pip install onnx-simplifier

RUN apt-get install -y protobuf-compiler libprotobuf-dev
RUN apt-get install -y  cmake
RUN apt install wget unzip
# # for NCNN model conversion
RUN pip3 install setuptools
RUN pip3 install onnx-simplifier

COPY convert.sh/ convert.sh
COPY . .
CMD [ "python3", "test.py" ]

# CMD ["/convert.sh"]



