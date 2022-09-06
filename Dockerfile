FROM node:16

# Setting working directory
WORKDIR /usr/src/app

ARG COMMITS_TOKEN

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