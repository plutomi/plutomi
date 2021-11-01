# Warning: IDK what I'm doing with Docker
# TODO add the settings from the Nextjs website, the below works for now
# https://nextjs.org/docs/deployment#docker-image

FROM node:16
# Setting working directory. All the path will be relative to WORKDIR
WORKDIR /usr/src/app
# Installing dependencies
COPY package*.json ./
RUN npm install
# Copying source files
COPY . .
# Building app
RUN npm run build
EXPOSE 3000
# Running the app
CMD [ "npm", "start" ]