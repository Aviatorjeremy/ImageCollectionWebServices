Installation:
    1.The development environment is Windows 7+Node.js(v0.8.14)+express(v3.0.0)+EJS.     
    2.Set up server by using command-line to run server.js.
    3.Client is curl (also you can see a GUI client using browsers)
    4.Curl commands stored in ' commands ' folder
    5.The items below marked with '*' mean they may need to change the default values (such as image path). 

Test:  
    1.'curl' can be used to test this system.All the test commands are in .bat format and stored in commands folder.
         (1)delete_bird_defaultjpg_comment.bat---Delete the comments on defualt.jpg in the bird album and return the delete information.

         (2)delete_dogalbum.bat---Delete the dog album. 

        *(3)edit_bird_album.bat---Before using edit_bird_album.bat to change the information of the bird album,please edit it with notepad to customize the album name and the introduction.By default,the album name is 'NewBird' and the introduction is 'bird folder after edit'.

        *(4)edit_cat_jellyfish_comment.bat---Before using edit_cat_jellyfish_comment.bat to change the comments on jellyfish.jpg in the cat album,please edit it with notepad to customize the comments.By default,the comment is 'This is the new comments after edit'.

         (5)get_cat_album.bat---open the cat album.

         (6)get_cat_Koala.bat---open Koala.jpg in the cat album.

        *(7)uploadeimage.bat---Before using the uploadimage.bat to upload an image,please edit it with notepad to change the path of image that you want to upload and the album into which you want to upload an image.

         (8)Note that if there are some problems during the test,please replace metadata.json and image folder with the content of config folder (i.e.metadata.json and image folder stored in config folder), and then restart server.js.


 
    2.GUI is also available at http://127.0.0.1:8888 using Google Chrome.

Format used to represent the metadata and hypermedia links(for example):
    {"bird":[{"img_name":"Penguins.jpg","description":"is this bird?","comments":[]}]}


The architectural overview of the system:
     ImageCollection------

                |------metadata.json //for all the albums and comments of albums

                |------server.js

                |------views  //HTML File Folder

                |------CSS    //CSS File Folder
  
                |------js     //javascript File Folder

                |------image------

                |        |-bird

                |          |-----metadata   //comments were combined with metadata in physical storage, but logically separated.

                |          |-----penguins.jpg

                |        |-dog

                |          |-----metadata   //comments were combined with metadata in physical storage, but logically separated.

                |          |-----desert.jpg


