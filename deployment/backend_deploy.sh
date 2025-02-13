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

# Step 1: Check if the directory exists
if [ ! -d "/opt/DIO_backend" ]; then
    echo "Directory /opt/DIO_backend does not exist. Deployment failed."
    exit 1
fi

# Step 2: Check if service "dio.service" is running
if systemctl is-active --quiet dio.service; then
    echo "Stopping dio.service..."
    systemctl stop dio.service || handle_error $LINENO
fi

# Step 3: Remove all contents from the directory except .env file
find /opt/DIO_backend -mindepth 1 ! -name '.env' -delete || handle_error $LINENO

# Step 4: Copy everything from ../backend except .env file
rsync -av --exclude='.env' --temp-dir=/tmp ../backend/ /opt/DIO_backend/ || handle_error $LINENO

# Step 5: Start dio.service
echo "Starting dio.service..."
systemctl start dio.service || handle_error $LINENO

echo "Backend deployment completed successfully."
