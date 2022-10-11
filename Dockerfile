FROM node:16

# Setting working directory
WORKDIR /usr/src/app

# Installing dependencies
COPY package*.json ./
RUN npm install


# Setting any environment variables that Next needs
ARG COMMITS_TOKEN
ARG NODE_ENV
# TODO Pretty sure NODE_ENV is required for the config website url to set the right endpoint now that we have staging

# Copying source files
COPY . .


# Building app
RUN npm run build
EXPOSE 3000 

# Running the app
CMD [ "npm", "start" ]