FROM node:20
WORKDIR /app
COPY package.json /app
RUN npm install --include=dev
COPY . /app
RUN npm run build
CMD ["npm", "start"]
