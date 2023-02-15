FROM python:3.9.10

WORKDIR .
COPY . .

RUN python3.9 -m venv ./venv
RUN venv/bin/pip3 install -r requirements.txt
WORKDIR /src
