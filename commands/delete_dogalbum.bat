@echo off 
curl -X DELETE "http://127.0.0.1:8888/delete?folder=dog"
curl "http://127.0.0.1:8888"
pause