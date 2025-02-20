FROM amazonlinux:2

ARG PYTHON_VERSION=3.12.0
# python3.12.0 にすると import error
ARG PYTHON_PACKAGES_DIR=/layer/python/lib/python3.12/site-packages

RUN yum update -y && yum install -y tar gzip make gcc openssl11 openssl11-devel bzip2-devel libffi-devel \
  && curl https://www.python.org/ftp/python/${PYTHON_VERSION}/Python-${PYTHON_VERSION}.tgz | tar xz \
  && cd Python-${PYTHON_VERSION} && ./configure && make && make install \
  && cd - && rm -rf Python-${PYTHON_VERSION}

COPY requirements.txt /

RUN yum install -y zip \
  && mkdir -p ${PYTHON_PACKAGES_DIR} \
  && pip3 install --upgrade pip \
  && pip3 install -t ${PYTHON_PACKAGES_DIR} -r /requirements.txt \
  # Support layer size limit
  && find ${PYTHON_PACKAGES_DIR} -name "*.pyc" -delete \
  && find ${PYTHON_PACKAGES_DIR} -name "*.pyo" -delete \
  && find ${PYTHON_PACKAGES_DIR} -name "*.tests" -type d -exec rm -rf {} + \
  && find ${PYTHON_PACKAGES_DIR} -name "*.dist-info" -type d -exec rm -rf {} + \
  && find ${PYTHON_PACKAGES_DIR} -name "__pycache__" -type d -exec rm -rf {} +

WORKDIR /layer
RUN zip -r /layer.zip . \
  && mkdir -p /output 

CMD ["cp", "/layer.zip", "/output/layer_content.zip"]
