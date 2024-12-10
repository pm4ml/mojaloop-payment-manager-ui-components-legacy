FROM node:11-alpine

# Create working directory
RUN mkdir -p /usr/local/code
WORKDIR /usr/local/code

# Copy package.json and yarn.lock to install dependencies
COPY package.json /usr/local/code/
COPY yarn.lock /usr/local/code/

# Install dependencies
RUN yarn install

# Copy source code
COPY . /usr/local/code/

# Expose ports if necessary
EXPOSE 9090
EXPOSE 8081

# Run Jest tests with JUnit reporter
CMD ["yarn", "run", "test", "--ci"]