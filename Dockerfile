FROM node:20-bullseye

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    build-essential \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY server/requirements.txt /app/server/requirements.txt
RUN python3 -m pip install --no-cache-dir -r /app/server/requirements.txt

COPY server/package*.json /app/server/
RUN npm --prefix /app/server ci --omit=dev

COPY server /app/server
COPY src/models /app/src/models

ENV NODE_ENV=production
ENV PYTHON_EXECUTABLE=python3

WORKDIR /app/server
EXPOSE 5000

CMD ["node", "index.js"]
