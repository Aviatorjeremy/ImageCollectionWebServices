var express = require('express');
var fs=require('fs');
var http = require('http')
var cp=require('child_process');
var app = express();
http.createServer(app);
// Using the .html extension instead of
// having to name the views as *.ejs
app.engine('.html', require('ejs').__express);
 
// Set the folder where the pages are kept
app.set('views', __dirname + '/views');
 
// This avoids having to provide the 
// extension to res.render()
app.set('view engine', 'html');

app.configure(function(){
  app.use(express.logger('dev'));
	app.use(express.bodyParser());
  app.use(app.router);
  app.use(express.errorHandler());

});



app.get('/', function(req, res) {
    var h=req.header('user-agent');
    fs.readFile('metadata.json', 'utf8', function(err,data){
    var obj = JSON.parse(data);
    var md = obj.album;
    // fs.readdir('image/',function(err,files){
    //   var album_array=files;
    if(h.substring(0,4)=="curl")
    {
      res.json(md);
    }else{
    res.render('index',{
      status:200,
      pageTitle:'Album@soton',
      // album_array:album_array,
      md:md
      });
     }

    // });
  });
    // res.render('imageupload',{
    //   name:'Image Upload'
    // });
});

app.get('/js/:js_file',function(req,res){
  var js_file = req.params.js_file;
  fs.readFile('js/'+js_file,function(err,data){
    res.writeHead(200,{'content-type':'text/javascript'});
     res.write(data);
     res.end();
  });
})

app.get('/css/:css_file',function(req,res){
  var css_file = req.params.css_file;
  console.log(css_file);
  fs.readFile('css/'+css_file,function(err,data){
    res.writeHead(200,{'content-type':'text/css'});
     res.write(data);
     res.end();
  });
})

app.get('/upload',function(req,res){
  var folder=req.query.folder;
   res.render('imageupload',{
        album : folder,
      });
})

app.post('/upload',function(req,res){
	console.log("*********This is image upload**********");
  var folder=req.query.folder;
  var imgName=req.files.image1.name;
  var h=req.header('user-agent');
  var description=req.body.photo_intro;
  var c;

  //filter special char
  var Letters = "(!@#$%^&*;':)";
  for(var i=0;i<imgName.length;i++)
  {
    c=imgName.charAt(i);
    if (Letters.indexOf(c)>0) {
      imgName = imgName.substring(0, imgName.indexOf(c)) + imgName.substring(imgName.indexOf(c)+1, imgName.length);
      i=0;
    }

  }

  if(imgName!=''){

  fs.readFile('image/'+folder+'/'+'metadata.json','utf8',function(err,data){
    var fobj=JSON.parse(data);
    var photo_num= fobj[folder].length;
    
    fobj[folder][photo_num]={
        "img_name":imgName,
        "description":description,
        "comments":[]
        };

    var fmetadata=JSON.stringify(fobj);

    fs.writeFile('image/'+folder+'/'+'metadata.json',fmetadata,function(err){
    if(err) throw err;
  
   fs.readFile('image/'+folder+'/'+'metadata.json','utf8',function(err,data){
    var fobj=JSON.parse(data);
    var photo_num= fobj[folder].length;
    
    if(photo_num==1){
      fs.readFile('metadata.json','utf8',function(err,data){
      var obj=JSON.parse(data);
      var album_length= obj.album.length;
      for(var i=0;i<album_length;i++)
      {
        if (obj.album[i].album_name==folder) {
          var imgName=req.files.image1.name;
          obj.album[i].cover_img=imgName;
        };
      }
      var backdata=JSON.stringify(obj);
      fs.writeFile('metadata.json',backdata,function(err){
        if(err) throw err;
      });
    });
      var imgName=req.files.image1.name;

    }else{

      var imgName=req.files.image1.name;
    }
  	console.log("image name:"+imgName);
  	var target_path='image/'+folder+'/'+imgName;
  	var tmp_path=req.files.image1.path;

    fs.readFile(tmp_path,function (err,data){
      fs.writeFile(target_path,data,function(err){
        if(h.substring(0,4)=="curl")
      {
        res.json(fobj);
      }else{
        res.redirect('/album?folder='+folder);
      }
      });
      fs.unlink(tmp_path,function (err){
        if(err) throw err;
      });
      });
    });
    });
  });
  }else{
    res.redirect('/');
  }
})


//*******************************************
// get create album page(html format)
//*******************************************
app.get('/create',function(req,res){
  res.render('albumCreate',{
    pageTitle:'Album Create',

  });
})


//*******************************************
// post new album name and description
//*******************************************
app.post('/create',function(req,res){
  var folderName=req.body.album_name;
  var description=req.body.album_intro;
  var h=req.header('user-agent');
  console.log('*********create a album********');
  var c;
  var flag;

  //filter special char
  var Letters = "(!@#$%^&*;':)";
  for(var i=0;i<folderName.length;i++)
  {
    c=folderName.charAt(i);
    if (Letters.indexOf(c)>0) {
      folderName = folderName.substring(0, folderName.indexOf(c)) + folderName.substring(folderName.indexOf(c)+1, folderName.length);
      i=0;
    }
  }
  if(folderName!=''){
  
  fs.mkdir(__dirname+'/image/'+folderName,function(err){
    var text = '{"'+folderName+'":[]}';
    
    fs.writeFile('image/'+folderName+'/'+'metadata.json',text,function(err){
        console.log(err);
    });

    fs.readFile('metadata.json','utf8',function(err,data){
      var obj=JSON.parse(data);
      var album_length= obj.album.length;
      obj.album[album_length]={
        "album_name":folderName,
        "cover_img":"null",
        "description":description
        };

      if(h.substring(0,4)=="curl")
      {
          res.json(obj);
          flag=0;
      }else{
          flag=1;
      }
      var backdata=JSON.stringify(obj);
      fs.writeFile('metadata.json',backdata,function(err){
        console.log(flag);
      if(flag==1){
       if (err)
        {
         res.redirect('/');
        }else{
        if(h.substring(0,4)=="curl")
        {
          res.json(obj);
        }else{
          res.render('imageupload',{
            album : folderName,
          });
        }
       }
      }
     });
    });
  });
  }else{
    if(h.substring(0,4)=="curl")
      {
          res.send('You should input a album name!',400);
      }else{
          res.redirect('/');
      }
  }
})




// require edit page
app.get('/edit',function(req,res){
  var oldName=req.query.folder;
  res.render('edit',{
    pageTitle:'Album edit',
    oldName:oldName

  });
})


// edit album metadata(name and description)
app.post('/edit',function(req,res){
  var folderName=req.body.album_name;
  var description=req.body.album_intro;
  var oldName=req.query.folder;
  var h=req.header('user-agent');
  console.log(oldName);
  console.log(folderName);
  var c;

  //filter special char
  var Letters = "(!@#$%^&*;':)";
  for(var i=0;i<folderName.length;i++)
  {
    c=folderName.charAt(i);
    console.log(c);
    if (Letters.indexOf(c)>0) {
      folderName = folderName.substring(0, folderName.indexOf(c)) + folderName.substring(folderName.indexOf(c)+1, folderName.length);
      i=0;
    }

  }
  if(folderName!=''){
    fs.readFile('image/'+oldName+'/'+'metadata.json',function(err,data){
    var text1 = '{"'+folderName+'":[';
    var text2 = ']}';
    var text3 = '';
    var obj=JSON.parse(data);
    
    var length=obj[oldName].length;
    for(var i=0;i<length;i++){
      text3=text3+JSON.stringify(obj[oldName][i]);
      if(i<length-1){
        text3=text3+',';
      }
    }
    text1=text1+text3+text2;
    
    fs.writeFile('image/'+oldName+'/'+'metadata.json',text1,function(err){
    fs.rename('image/'+oldName,'image/'+folderName,function(err){
      console.log(err);
      fs.readFile('metadata.json','utf8',function(err,data){
            var obj=JSON.parse(data);
            var album_length= obj.album.length;
            for(var i=0;i<album_length;i++){
              if(obj.album[i].album_name==oldName){
                obj.album[i].album_name=folderName;
                obj.album[i].description=description;
              }
            }
            var backdata=JSON.stringify(obj);
            fs.writeFile('metadata.json',backdata,function(err){
               res.redirect('/');
            });
          

      });
    });
   });
  }); 
  }else{
    folderName=oldName;
    fs.readFile('image/'+oldName+'/'+'metadata.json',function(err,data){
    var text1 = '{"'+folderName+'":[';
    var text2 = ']}';
    var text3 = '';
    var obj=JSON.parse(data);
    
    var length=obj[oldName].length;
    for(var i=0;i<length;i++){
      text3=text3+JSON.stringify(obj[oldName][i]);
      if(i<length-1){
        text3=text3+',';
      }
    }
    text1=text1+text3+text2;
    
    fs.writeFile('image/'+oldName+'/'+'metadata.json',text1,function(err){
    fs.rename('image/'+oldName,'image/'+folderName,function(err){
      console.log(err);
      fs.readFile('metadata.json','utf8',function(err,data){
            var obj=JSON.parse(data);
            var album_length= obj.album.length;
            for(var i=0;i<album_length;i++){
              if(obj.album[i].album_name==oldName){
                obj.album[i].album_name=folderName;
                obj.album[i].description=description;
              }
            }
            var backdata=JSON.stringify(obj);
            fs.writeFile('metadata.json',backdata,function(err){
               res.redirect('/');
            });
      });
    });
   });
  });
  }
})


//************************************
//edit album (name and description)
//************************************
app.put('/edit',function(req,res){
  var folderName=req.body.album_name;
  var description=req.body.album_intro;
  var oldName=req.query.folder;
  var h=req.header('user-agent');
  var c;

  //filter special char
  var Letters = "(!@#$%^&*;':)";
  for(var i=0;i<folderName.length;i++)
  {
    c=folderName.charAt(i);
    if (Letters.indexOf(c)>0) {
      folderName = folderName.substring(0, folderName.indexOf(c)) + folderName.substring(folderName.indexOf(c)+1, folderName.length);
      i=0;
    }

  }
  if(folderName!=''){
    fs.readFile('image/'+oldName+'/'+'metadata.json',function(err,data){
    var text1 = '{"'+folderName+'":[';
    var text2 = ']}';
    var text3 = '';
    var obj=JSON.parse(data);
    
    var length=obj[oldName].length;
    for(var i=0;i<length;i++){
      text3=text3+JSON.stringify(obj[oldName][i]);
      if(i<length-1){
        text3=text3+',';
      }
    }
    text1=text1+text3+text2;
    
    fs.writeFile('image/'+oldName+'/'+'metadata.json',text1,function(err){
    fs.rename('image/'+oldName,'image/'+folderName,function(err){
      console.log(err);
      fs.readFile('metadata.json','utf8',function(err,data){
            var obj=JSON.parse(data);
            var album_length= obj.album.length;
            for(var i=0;i<album_length;i++){
              if(obj.album[i].album_name==oldName){
                obj.album[i].album_name=folderName;
                obj.album[i].description=description;
              }
            }
            var backdata=JSON.stringify(obj);
            fs.writeFile('metadata.json',backdata,function(err){
              if(h.substring(0,4)=="curl")
               {
                 res.json(obj);
               }else{
                res.redirect('/');
               }
            });
      });
    });
   });
  }); 
  }else{
    folderName=oldName;
    fs.readFile('image/'+oldName+'/'+'metadata.json',function(err,data){
    var text1 = '{"'+folderName+'":[';
    var text2 = ']}';
    var text3 = '';
    var obj=JSON.parse(data);
    
    var length=obj[oldName].length;
    for(var i=0;i<length;i++){
      text3=text3+JSON.stringify(obj[oldName][i]);
      if(i<length-1){
        text3=text3+',';
      }
    }
    text1=text1+text3+text2;
    
    fs.writeFile('image/'+oldName+'/'+'metadata.json',text1,function(err){
    fs.rename('image/'+oldName,'image/'+folderName,function(err){
      console.log(err);
      fs.readFile('metadata.json','utf8',function(err,data){
            var obj=JSON.parse(data);
            var album_length= obj.album.length;
            for(var i=0;i<album_length;i++){
              if(obj.album[i].album_name==oldName){
                obj.album[i].album_name=folderName;
                obj.album[i].description=description;
              }
            }
            var backdata=JSON.stringify(obj);
            fs.writeFile('metadata.json',backdata,function(err){
               if(h.substring(0,4)=="curl")
               {
                 res.json(obj);
               }else{
                 res.redirect('/');
               }
            });
      });
    });
   });
  });
  }
})

//*********************************
// get album
//*********************************
app.get('/album',function(req,res){
    var h=req.header('user-agent');
    var folder=req.query.folder;
    fs.readFile('image/'+folder+'/'+'metadata.json','utf8',function(err,data){
       var obj=JSON.parse(data);
       var messages=obj[folder];
       if(h.substring(0,4)=="curl")
         {
           res.json(messages);
         }else{
           res.render('album', {
             pageTitle: 'ImageCollection',
             messages: messages,
             folder:folder
           });
        }
    });
})

//************************************
//get photo
//************************************
app.get('/photo',function(req,res){
  var folder=req.query.folder;
  var path = req.query.path;
  var u_ip=req.ip;
  var h=req.header('user-agent');
  if(h.substring(0,4)=="curl")
  {
    fs.readFile('image/'+folder+'/'+'metadata.json','utf8',function(err,data){
    var fobj=JSON.parse(data);
    var photo_num= fobj[folder].length;
    
    for(var i=0;i<photo_num;i++)
      {
        if(fobj[folder][i].img_name==path){
          var mt=fobj[folder][i];
          var comments=fobj[folder][i].comments;
          var description=fobj[folder][i].description;
          if(photo_num>1){
            if(i<photo_num-1)
               var next_photo=fobj[folder][i+1].img_name;
            else
               var next_photo=fobj[folder][0].img_name;

          }else{
            var next_photo=path;
          }
          break;
        }
      }
    res.json(mt);
    });
  }else{
  
  fs.readFile('image/'+folder+'/'+'metadata.json','utf8',function(err,data){

    var fobj=JSON.parse(data);
    console.log(fobj);
    var photo_num= fobj[folder].length;
    
    for(var i=0;i<photo_num;i++)
      {
        if(fobj[folder][i].img_name==path){
          var mt=fobj[folder][i];
          var comments=fobj[folder][i].comments;
          var description=fobj[folder][i].description;
          if(photo_num>1){
            if(i<photo_num-1)
               var next_photo=fobj[folder][i+1].img_name;
            else
               var next_photo=fobj[folder][0].img_name;

          }else{
            var next_photo=path;
          }
          break;
        }
      }
      
      res.render('photo',{
        pageTitle:'Single photo',
        folder:folder,
        path:path,
        next_photo:next_photo,
        description:description,
        comments:comments,
        u_ip:u_ip
      });
   });
  }
})


//*************************************
// upload photo comments
//*************************************
app.post('/photo',function(req,res){
  var folder=req.query.folder;
  var path = req.query.path;
  var h=req.header('user-agent');
  var ip=req.ip;
  var date = new Date();
  var day = date.toLocaleDateString();
  var time = date.toLocaleTimeString();
  var dt=day+'/'+time;
  var flag;

  fs.readFile('image/'+folder+'/'+'metadata.json','utf8',function(err,data){
    var fobj=JSON.parse(data);
    var photo_num= fobj[folder].length;
    // console.log(comments);
    for(var i=0;i<photo_num;i++)
      {
        if (fobj[folder][i].img_name==path) {
            var clength = fobj[folder][i].comments.length;
            fobj[folder][i].comments[clength]={
              "User":ip,
              "said":req.body.rv_comment,
              "comments_time":dt
            };
            if(h.substring(0,4)=="curl")
            {
             res.json(fobj[folder][i].comments[clength]);
             flag=0;
            }else{
              flag=1;
            }
            break;
        };
      }
      var backdata=JSON.stringify(fobj);
      fs.writeFile('image/'+folder+'/'+'metadata.json',backdata,function(err){
        if(flag==1)
        {
          res.redirect('/photo?folder='+folder+'&path='+path);
        }
        
      });
  });
})


//************************************************
// delete comment
//************************************************
app.get('/comment_delete/:id',function(req,res){
      var id = req.params.id;
      var folder=req.query.folder;
      var path = req.query.path;
      fs.readFile('image/'+folder+'/'+'metadata.json','utf8',function(err,data){
        var fobj=JSON.parse(data);
        var photo_num= fobj[folder].length;
          
       for(var i=0;i<photo_num;i++)
        {
        if(fobj[folder][i].img_name==path){
          fobj[folder][i].comments.splice(id,1);
          break;
        }
       }
      var backdata=JSON.stringify(fobj);
      fs.writeFile('image/'+folder+'/'+'metadata.json',backdata,function(err){
        console.log(err);
        res.redirect('/photo?folder='+folder+'&path='+path);
      });
});
});


//************************************************
// delete comment
//************************************************
app.delete('/comment_delete/:id',function(req,res){
      var id = req.params.id;
      var folder=req.query.folder;
      var path = req.query.path;
      var h = req.header('user-agent');
      var flag;
      fs.readFile('image/'+folder+'/'+'metadata.json','utf8',function(err,data){
        var fobj=JSON.parse(data);
        var photo_num= fobj[folder].length;
          
       for(var i=0;i<photo_num;i++)
        {
        if(fobj[folder][i].img_name==path){
          if(h.substring(0,4)=="curl")
            {
             res.json(fobj[folder][i].comments[id]);
             flag=0;
            }else{
              flag=1;
            }
          fobj[folder][i].comments.splice(id,1);
          break;
        }
       }
      var backdata=JSON.stringify(fobj);
      fs.writeFile('image/'+folder+'/'+'metadata.json',backdata,function(err){
        if(flag==1)
        {
          res.redirect('/photo?folder='+folder+'&path='+path);
        }
      });
  });
});

//*********************************************
// edit comment
//*********************************************
app.post('/comment_edit/:id',function(req,res){
  var id=req.params.id;
  var ip=req.ip;
  var folder=req.query.folder;
  var path = req.query.path;
  var date = new Date();
  var day = date.toLocaleDateString();
  var time = date.toLocaleTimeString();
  var dt=day+'/'+time;
  console.log(id);
  fs.readFile('image/'+folder+'/'+'metadata.json','utf8',function(err,data){
        var fobj=JSON.parse(data);
        var photo_num= fobj[folder].length;
          
       for(var i=0;i<photo_num;i++)
        {
        if(fobj[folder][i].img_name==path){

          fobj[folder][i].comments[id]={
              "User":ip,
              "said":req.body.rv_comment,
              "comments_time":dt
          };
          break;
        }
       }
      var backdata=JSON.stringify(fobj);
      fs.writeFile('image/'+folder+'/'+'metadata.json',backdata,function(err){
        console.log(err);
        res.redirect('/photo?folder='+folder+'&path='+path);
      });
    });
});



//*********************************************
// edit comment
//*********************************************
app.put('/comment_edit/:id',function(req,res){
  var id=req.params.id;
  var ip=req.ip;
  var h=req.header('user-agent');
  var folder=req.query.folder;
  var path = req.query.path;
  var date = new Date();
  var day = date.toLocaleDateString();
  var time = date.toLocaleTimeString();
  var dt=day+'/'+time;
  var flag;
  console.log(id);
  fs.readFile('image/'+folder+'/'+'metadata.json','utf8',function(err,data){
        var fobj=JSON.parse(data);
        var photo_num= fobj[folder].length;
          
       for(var i=0;i<photo_num;i++)
        {
        if(fobj[folder][i].img_name==path){

          fobj[folder][i].comments[id]={
              "User":ip,
              "said":req.body.rv_comment,
              "comments_time":dt
          };
          break;
        }
       }
        if(h.substring(0,4)=="curl")
          {
            res.json(fobj);
            flag=0;
          }else{
            flag=1;
          }
      var backdata=JSON.stringify(fobj);
      fs.writeFile('image/'+folder+'/'+'metadata.json',backdata,function(err){
        if(flag==1)
          {
            res.redirect('/photo?folder='+folder+'&path='+path);
          }
        
      });
    });
});

//*************************************
//serve for image request
//*************************************
app.get('/image',function(req,res){
  var folder=req.query.folder;
  var path = req.query.path;
  console.log('provide_image:'+path);
  fs.readFile(__dirname +'/image/'+folder+'/'+path,function(err,data){
     res.writeHead(200,{'content-type':'image/jpg'});
     res.write(data);
     res.end();
  });
 

});

//****************************************
//delete method
//****************************************
app.get('/delete',function(req,res){
	console.log("8888");
  var folder=req.query.folder;
  var path = req.query.path;
  if(path==null)
  {
  cp.exec("rmdir /s /q" + " image\\"+folder,function(err){
    console.log(err);
    fs.readFile('metadata.json','utf8',function(err,data){
      var obj=JSON.parse(data);
      var album_length= obj.album.length;
      for(var i=0;i<album_length;i++)
      {
        if (obj.album[i].album_name==folder) {
          obj.album.splice(i,1);
          break;
        };
      }
      var backdata=JSON.stringify(obj);
      fs.writeFile('metadata.json',backdata,function(err){
        if(err){
        res.send(' Internal Server Error',500);
        console.log(err);
        }
      });
    });
  res.redirect('/');
  });
  }
  else
  {
    fs.readdir('image/'+folder,function(err,files){
    
      fs.readFile('metadata.json','utf8',function(err,data){
      var obj=JSON.parse(data);
      var album_length= obj.album.length;
      if(files.length==2){
        for(var i=0;i<album_length;i++)
        {
          if (obj.album[i].album_name==folder) {
            obj.album[i].cover_img='null';
            break;
          };
        }
      }
      var backdata=JSON.stringify(obj);
      fs.writeFile('metadata.json',backdata,function(err){
        if(err){
        res.send(' Internal Server Error',500);
        console.log(err);
        }
      });
    
      fs.readFile('image/'+folder+'/'+'metadata.json','utf8',function(err,data){
        if(err){
          res.send('See Other ',303);

        }else{
        var fobj=JSON.parse(data);
        var photo_num= fobj[folder].length;
        for(var i=0;i<photo_num;i++)
        {
          if(fobj[folder][i].img_name==path){
            fobj[folder].splice(i,1);
            break;
          }
        }
      var fmetadata=JSON.stringify(fobj);
      fs.writeFile('image/'+folder+'/'+'metadata.json',fmetadata,function(err){
        if(err){
        res.send(' Internal Server Error',500);
        console.log(err);
        }
      });
      }
     });
    });
    
  });

    fs.unlink('image/'+folder+'/'+path,function(err){
      if(err){
      res.send(' Internal Server Error',500);
      console.log(err);
    }else{
      res.redirect('/album?folder='+folder);
    }
    });
  }
});

//***************************************
//delete method
//***************************************
app.delete('/delete',function(req,res){
  var folder=req.query.folder;
  var path = req.query.path;
  if(path==null)
  {
  cp.exec("rmdir /s /q" + " image\\"+folder,function(err){
    console.log(err);
    fs.readFile('metadata.json','utf8',function(err,data){
      var obj=JSON.parse(data);
      var album_length= obj.album.length;
      for(var i=0;i<album_length;i++)
      {
        if (obj.album[i].album_name==folder) {
          obj.album.splice(i,1);
          break;
        };
      }
      var backdata=JSON.stringify(obj);
      fs.writeFile('metadata.json',backdata,function(err){
        console.log(err);
      });
    });
    res.send('successfully delete folder-->'+folder,200);
  // res.redirect('/');
  });
  }
  else
  {
    fs.readdir('image/'+folder,function(err,files){
    
      fs.readFile('metadata.json','utf8',function(err,data){
        if(err){
          res.send('See Other ',303);

        }else{
      var obj=JSON.parse(data);
      var album_length= obj.album.length;
      if(files.length==2){
        for(var i=0;i<album_length;i++)
        {
          if (obj.album[i].album_name==folder) {
            obj.album[i].cover_img='null';
            break;
          };
        }
      }
      var backdata=JSON.stringify(obj);
      fs.writeFile('metadata.json',backdata,function(err){
        console.log(err);
        res.send(' Internal Server Error',500)
      });
     }
    
      fs.readFile('image/'+folder+'/'+'metadata.json','utf8',function(err,data){
        var fobj=JSON.parse(data);
        var photo_num= fobj[folder].length;
        for(var i=0;i<photo_num;i++)
        {
          if(fobj[folder][i].img_name==path){
            fobj[folder].splice(i,1);
            break;
          }
        }
      var fmetadata=JSON.stringify(fobj);
      fs.writeFile('image/'+folder+'/'+'metadata.json',fmetadata,function(err){
      console.log(err);
      res.send(' Internal Server Error',500)
     
     });
     });
   }); 
  });


    fs.unlink('image/'+folder+'/'+path,function(err){
      if(err){
      res.send(' Internal Server Error',500);
      console.log(err);
    }else{
      res.redirect('/album?folder='+folder);
    }

    });
  }
});

//******************************************
// 404 not found
//******************************************
app.get('*', function(req, res){
  var h=req.header('user-agent');
  if(h.substring(0,4)=="curl")
  {
    res.send(" 404 not found",404);
  }else{
    // res.status(404).sendfile('image/default/404.jpg');
    res.set('content-type','text/html')
    res.send('<img src="/image?folder=default&path=404.jpg"/>', 404);
  }
});


app.listen(8888);
console.log('Listening on port 8888...');