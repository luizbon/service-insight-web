#!/bin/bash

# Build the Docker image
docker build -t serviceinsight-web:latest .

# Tag the Docker image (optional, replace <your-repo> with your repository name)
docker tag serviceinsight-web:latest luizbon/serviceinsight-web:latest

# Push the Docker image to a repository (optional, uncomment if needed)
docker push luizbon/serviceinsight-web:latest

# Stop and remove the existing container if it exists
docker rm -f serviceinsight-web || true

# Run the Docker container
docker run -d -p 80:80 --name serviceinsight-web serviceinsight-web:latest
