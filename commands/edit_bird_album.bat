@echo off
curl -X PUT -F "album_name=NewBird" -F "album_intro= bird folder after edit!" "http://127.0.0.1:8888/edit?folder=bird"
pause