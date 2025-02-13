#!/bin/bash

# Function to handle errors
handle_error() {
    echo "Error occurred in script at line: $1"
    exit 1
}

# Trap any error and call the handle_error function
trap 'handle_error $LINENO' ERR

# Check if the script is run as root (sudo)
if [ "$(id -u)" -ne 0 ]; then
    echo "This script must be run as root (use sudo)."
    exit 1
fi

# Step 1: cd to ../frontend
cd ../frontend || handle_error $LINENO

# Step 2: Run npm run build:prod
npm run build:prod || handle_error $LINENO

# Step 3: Copy everything in ./dist to /var/www/html/dio.gccis.rit.edu
rsync -av ./dist/ /var/www/html/dio.gccis.rit.edu/ || handle_error $LINENO

echo "Frontend deployment completed successfully."
