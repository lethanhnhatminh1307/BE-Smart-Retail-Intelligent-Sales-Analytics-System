const multer  = require('multer');

function uploadFile() {
  const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, './src/public/images')
      },
      filename: function (req, file, cb) {  
        let namefile = Date.now()+ Math.floor(Math.random()*1000)
        // console.log(file);
        if(file.mimetype.includes('video')){
          namefile = namefile+'.mp4'
        }else namefile = namefile+'.jpg'
        cb(null, namefile )
      }
    })
  const upload = multer({ storage: storage })
  return upload
}

module.exports = uploadFile