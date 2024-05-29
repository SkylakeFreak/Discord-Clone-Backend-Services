const express = require('express');
const mongoose = require('mongoose');
const cors=require('cors');
const jwt=require('jsonwebtoken');
const SocketRef = require('./SocketRef');
const app = express();
const port = 3002;
const secretKey = '123abc'; 
app.use(cors());

//start message server
const io=require('socket.io')(3003,{
    cors:{
        origin:['http://localhost:3000','http://localhost:3000/service1','http://localhost:3000/service2']
    }
})

// requestuser schema
// const friendrequestschema = new mongoose.Schema({
//     ofname: String,
//     toname:Array,
//     addedfriends:Array,
//     });
//     const RequestUser=mongoose.model('RequestUser',friendrequestschema);
// io.on('connection',socket=>{
//     SocketRef.setio(socket);
//     socket.on('sendfriendrequest',(toname,ofname)=>{
//         const empty=[]
        
//         console.log(ofname,toname)
//         mongoose.connect('mongodb+srv://utkarshbarde2:Sqfr1i8ru74g3Qbb@cluster0.zhtp5bf.mongodb.net/')
        
            
//             async function findUser(ofname,empty) {
//                 console.log(ofname,toname,"sdds")
//                 try {
//                     const user = await RequestUser.findOne({
//                              ofname: ofname    
//                     });
//                     if(user){
//                         console.log("user found")
//                         await RequestUser.updateOne(
//                             { ofname: ofname },
//                             { $push: { toname: toname } } // 
//                         );                        
//                     }
//                     else{
//                         const newuser=new RequestUser({ofname,toname,empty})
//                         await newuser.save();
                        
                        
//                         console.log('User Not exists,ADDED NEW');
//                 } }catch (error) {
//                     console.error('Error finding user:', error);
//                 }
//             }
//             findUser(ofname,empty);
//             async function findUser12(ofname,empty) {
//                 console.log(ofname,toname,"sdds")
//                 try {
//                     const user = await RequestUser.findOne({
//                              ofname: ofname    
//                     }); 
//                     if(user){
//                         console.log("user found")
//                         await RequestUser.updateOne(
//                             { ofname: ofname },
//                             { $push: { toname: toname } } // 
//                         );                        
//                     }
//                     else{
//                         const newuser=new RequestUser({ofname,empty})
//                         await newuser.save();
                        
                        
//                         console.log('User Not exists,ADDED NEW');
//                 } }catch (error) {
//                     console.error('Error finding user:', error);
//                 }
//             }
//             findUser12(toname,empty);
            

        

//         // socket.broadcast.emit('receivefriendrequest',"sendfromserver")    
//         // console.log("emitted");
//     })
    
    
// })
//end message server

//start of send current user to client

//end of current user send to client code

mongoose.connect('mongodb+srv://utkarshbarde2:Sqfr1i8ru74g3Qbb@cluster0.zhtp5bf.mongodb.net/')

const userSchema = new mongoose.Schema({
    name: String,
    password:String,
    email:String,
    displayname:String,
    date:String,
    month:String,
    year:String,
    });

const User=mongoose.model('User',userSchema);

app.post('/login', express.json(), async (req, res) => {
    try {
        const { email,password } = req.body;
        const user=await User.findOne({email});
        console.log(email,password);
    
        if(user){
            console.log("user found")
            const current_user=user.name
                console.log(current_user);
                SocketRef.setcurrentname(current_user);

            if (user.password==password){
                console.log("User authenticated");
            
                const token=jwt.sign({id:user.id,name:user.name,displayname:user.displayname},secretKey,{expiresIn:"700000s"});
                res.status(200).json({token});

            }
        }
        
        else{
            console.log("user not found");
            return res.status(401).json({message:"Invalid user"});


        }

    } catch (error) {
        res.status(500).send({ error: 'An error occurred while receiving data' });
    }
});


// SocketRef.emit('servertoclientfriends',arrayoffriends)




app.post('/signup', express.json(), async (req, res) => {
    try {
        const { name,password,email,displayname,date,month,year } = req.body;
        const user=await User.findOne({$or:[{name},{email}]});
        console.log(date.length);
        if ((date).length==0||(month).length==0||(year).length==0){
            res.status(500).send({ error: 'An error occurred while receiving data' });
        }
        else{
            if(user){
                console.log(user,"user");
                console.log('User already exists');
                res.status(500).send({ message:"sucess" })
                
            }
            else{
                const newuser=new User({name,password,email,displayname,date,month,year})
                await newuser.save();
                //  const token=jwt.sign({id:newuser.id,name:newuser.name,displayname:newuser.displayname},secretKey,{expiresIn:"700000s"});
                // res.status(200).json({token});
                
                console.log('User created');
                res.status(200).send({ message:"done" })
            }

        }
        
        
        
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'An error occurred while receiving data' });
    }
});


app.get('/protected', verifyToken, (req, res) => {
    jwt.verify(req.token, secretKey, (err, authData) => {
      if (err) {
        res.sendStatus(200);
      } else {

        console.log("Access granted via jwt")
        res.json({ message: 'Access granted', authData });
      }
    });
  });

  function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
  
    if (typeof bearerHeader !== 'undefined') {
      const bearerToken = bearerHeader.split(' ')[1];
      const decoded=jwt.decode(bearerToken,{complete:true});
      const currentuser=decoded.payload.displayname
      req.token = bearerToken;
      next();
    } else {
      res.sendStatus(400);
    }
  }
//   function check(){
//     const service1 = io.of('/service1');
//     service1.on('connection', (socket) => {
//         socket.on('fetchfriends', (currentuser) => {
//             SocketRef.setcurrentuser(currentuser);
//             console.log('Service 1 message received: ' + currentuser);
//             async function searchdedicated1(ofname1) {
//                 try {
                    
//                     const user = await RequestUser.findOne({
//                              ofname: ofname1    
//                     });
//                     if(user){
//                         console.log(user.toname)
//                         socket.emit('sendfriends', user.toname,user.addedfriends);
//                     }
//                     else{                        
//                         console.log('User Not exists,ADDED NEW');
//                 } }catch (error) {
//                     console.error('Error finding user:', error);
//                 }
//             }
//             searchdedicated1(currentuser);
//         });
//     });
//   }
//   check();

  

// function perma(){
//     const service2=io.of('/service2');
//     service2.on('connection',(socket)=>{
//         socket.on('permaservice',(currentuserfinal)=>{
//             console.log(currentuserfinal);
//             if (currentuserfinal===""){
//                 console.log("firstload");
//             }
//             else{
//                 async function uploaduser(currentuserfinal){
//                     console.log('receivedd',currentuserfinal)
//                     const currentuser1=SocketRef.getcurrentuser();
//                     console.log("currentuser1",currentuser1)
//                     try{
//                         const user2=await RequestUser.findOne({
//                             ofname:currentuser1
//                         });
                        
//                         if (user2){
//                             const check=await RequestUser.findOne({
//                                 addedfriends:currentuserfinal

//                             })
//                             if (check){
//                                 console.log("user alreadt exists")
//                             }
//                             else{
//                                 await RequestUser.updateOne({
//                                     ofname:currentuser1},
//                                     {$push:{addedfriends:currentuserfinal}},
                                  
//                                 )
//                                 await RequestUser.updateOne({
//                                     ofname:currentuserfinal},
//                                     {$push:{addedfriends:currentuser1}},
                                  
//                                 )
//                                 await RequestUser.updateOne({
//                                     ofname:currentuser1},
//                                     {$pull:{
//                                         toname:currentuserfinal
//                                     }
//                                 })

//                             }
                            
//                         }
//                         else{
//                             console.log("user not ousd")
//                         }
//                     }
//                     catch{
//                         console.log(error);
//                     }

                   
//                 }
//                 uploaduser(currentuserfinal);
               


//             }
            
//         })
//     })
// } 
// perma();
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

