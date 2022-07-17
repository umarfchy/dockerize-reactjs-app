# Containerize Reactjs Application

Here we will employ a multi-stage build process to containerize react app. The stages are as follows 
### Multi-stage build pipeline

- STAGE 1: Building assets using Node image
- STAGE 2: Using nginx to serve the built assets


Let's begin with stage 1. We'll start with a node base image `node:14` and alias it as builder. I'll explain later why the aliasing was done.  
```dockerfile
FROM node:14 AS builder
```

Afterward, we'll set up the working directory. We'll use `/app` as the working directory but you can name it something else as well. 
```dockerfile
WORKDIR /app
```

Now, we'll copy the `package.json` and `yarn.lock` (or `package-lock.json`) to the working directory (`/app`) and install all the node modules using `yarn install` (or `npm install`). This will create a `node_modules` with all the dependency files. 
```dockerfile
COPY package.json .
COPY yarn.lock .
RUN yarn install
```
Once the node modules are installed, the contents of the current directory (`.`) will be copied over to the image's working directory (`/app`). Notice that the current environment may contain a `node_modules` folder and copying all contents will override the existing `node_modules` folder inside the docker image's working directory. So, this folder needs to be ignored. This can be done by creating a `.dockerignore` file in the root directory of the application and adding the line `node_modules`. Once the copying is complete, the `yarn build` (or `npm run build`) will be executed to build all the assets in the `/build` directory.
```dockerfile
COPY . .
RUN yarn build
```

NOTE: it is possible to achieve the same result by copying over all the contents from the current directory to the docker image's `/app` directory and executing `yarn build && yarn install` directly. However, copying the `package.json` & `yarn.lock` and installing the node modules before starting the building process has an added advantage. It essentially allows the docker to cache the downloaded files. This allows a faster build time in the subsequent build of the application. 
```dockerfile
COPY . .
RUN yarn install && yarn build 
```


Now, let's begin stage 2 of the deployment process. Deploying a nodejs application with nginx can allow for various performance gains. Nginx can be used to implement reverse proxy, cache static files, load balancing etc. We start from `nginx:alpine` base image and change the image's working directory to `/usr/share/nginx/html`. `nginx` uses this directory to serve the content therefore we need to put the built files the were generated previously on stage 1. Before doing so we need to clean our current directory. 
```dockerfile
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
```
Now, we'll copy all contents of `/build` directory of the image environment in stage 1. To do so, we need to somehow reference that building stage. Using `--from=builder` we can reference that stage and copy all the content to stage two's working directory i.e. `/usr/share/nginx/html`. Finally, we set the entry point to start serving the application.
```dockerfile
COPY --from=builder /app/build .
ENTRYPOINT ["nginx", "-g", "daemon off;"]
```