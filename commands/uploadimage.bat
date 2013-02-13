@echo off
curl -F image1=@"D:/Desert.jpg" -F "photo_intro= this is a desert picture!" "http://127.0.0.1:8888/upload?folder=cat"
pause