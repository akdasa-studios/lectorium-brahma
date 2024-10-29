FROM node:22.10.0-bookworm

WORKDIR /akd-stidios/lectorium/apps/brahma
COPY package.json package-lock.json ./
RUN npm install

COPY . .
