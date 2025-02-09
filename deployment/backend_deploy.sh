#1 check the directory exists or not /opt/DIO_backend
    #1a if not exists, fail deploy and exit status 1
#2 if exists, check if PID file exists
    #2a check if .env file exists
        #2aa if env file not exists, fail deploy and exit status 1
    #2b if exists, kill the process using PID in PID file
#3 remove all contents from directory except .env
#4 copy everything from ../backend
#5 cd /opt/DIO_backend
#6 run sudo node server.js
#7 find the PID and save to PID file