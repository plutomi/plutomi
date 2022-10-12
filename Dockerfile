FROM node:16

# Setting working directory
WORKDIR /usr/src/app

# Installing dependencies
COPY package.json ./
RUN npm install


# Setting any environment variables that Next needs
ARG COMMITS_TOKEN
ARG NEXT_PUBLIC_WEBSITE_URL

# Copying source files
COPY . .


# Building app
RUN npm run build
EXPOSE 3000 

# Running the app
CMD [ "npm", "start" ]