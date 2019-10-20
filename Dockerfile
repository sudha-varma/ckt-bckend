# Use latest node version 8.x
FROM node:8.11.4

# Install pm2
RUN npm install -g pm2

# create app directory in container
RUN mkdir -p /app

# set /app directory as default working directory
WORKDIR /app

# copy /bin /app/bin in container
# package.json scripts has dependencies on it
# COPY ./bin /app/bin

# only copy package.json initially so that `RUN npm install` layer is recreated only
# if there are changes in package.json
COPY package.json /app/
# --no-package-lock: Don’t generate a package-lock.json lockfile
RUN npm install --ignore-scripts --unsafe-perm
RUN npm install sharp@0.20.8

# copy all file from current dir to /app in container
COPY . /app/



# expose port 4040
EXPOSE 4040

# cmd to start service
# CMD [ "yarn", "start" ]
CMD npm run postinstall && pm2 start server.js --no-daemon -i 0 --name cricketTech.api
# CMD ["pm2","start","server.js","--no-daemon","-i","0","--name","cricketTech.api"]
