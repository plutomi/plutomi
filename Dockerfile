# Warning: IDK what I'm doing with Docker
FROM node:16

# Setting working directory. All the paths will be relative to WORKDIR
WORKDIR /usr/app

# Installing dependencies
COPY package.json .

RUN npm install

# Copying source files
COPY . .

# Express port
EXPOSE 4000
# Run the Express app
CMD [ "npm", "server" ]