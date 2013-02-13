@echo off
curl -X PUT -F "rv_comment=This is the new comments after edit!" "http://127.0.0.1:8888/comment_edit/0?folder=cat&path=Jellyfish.jpg"
pause