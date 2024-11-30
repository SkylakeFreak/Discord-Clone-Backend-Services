const express = require('express');
const mongoose = require('mongoose');
const cors=require('cors');
const jwt=require('jsonwebtoken');
const SocketRef = require('./SocketRef');
const app = express();
const port = 3002;
const secretKey = '123abc'; 
app.use(cors());
const io=require('socket.io')(3003,{
    cors:{
        origin:['http://localhost:3000','http://localhost:3000/service1','http://localhost:3000/service2','http://localhost:3000/service3',"http://localhost:3000/service4"]

    }
})


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

app.get('/api',async(req,res)=>{
    return res.status(401).json({message:"Invalid user"});
})

app.post('/login', express.json(), async (req, res) => {
    try {
        const { email,password } = req.body;
        const user=await User.findOne({email});
        // console.log(email,password);
    
        if(user){
            // console.log("user found")
            const current_user=user.name
                // console.log(current_user);
                SocketRef.setcurrentname(current_user);

            if (user.password==password){
                // console.log("User authenticated");
            
                const token=jwt.sign({id:user.id,name:user.name,displayname:user.displayname},secretKey,{expiresIn:"700000s"});
                res.status(200).json({token});

            }
        }
        
        else{
            // console.log("user not found");
            return res.status(401).json({message:"Invalid user"});


        }

    } catch (error) {
        res.status(500).send({ error: 'An error occurred while receiving data' });
    }
});

app.post('/signup', express.json(), async (req, res) => {
    try {
        const { name,password,email,displayname,date,month,year } = req.body;
        const user=await User.findOne({$or:[{name},{email}]});
        // console.log(date.length);
        if ((date).length==0||(month).length==0||(year).length==0){
            res.status(500).send({ error: 'An error occurred while receiving data' });
        }
        else{
            if(user){
                // console.log(user,"user");
                // console.log('User already exists');
                res.status(500).send({ message:"sucess" })
                
            }
            else{
                const newuser=new User({name,password,email,displayname,date,month,year})
                await newuser.save();
                const newuser2=new RequestUser({ofname:name})
                await newuser2.save()
                // console.log('User created');
                res.status(200).send({ message:"done" })
            }

        }
        
        
        
    } catch (error) {
        // console.log(error);
        res.status(500).send({ error: 'An error occurred while receiving data' });
    }
});


app.get('/protected', verifyToken, (req, res) => {
    jwt.verify(req.token, secretKey, (err, authData) => {
      if (err) {
        res.sendStatus(200);
      } else {
        // console.log("Access granted via jwt")
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


//-------------------------------------------------------------------------
const friendrequestschema = new mongoose.Schema({
        ofname: String,
        toname:Array,
        addedfriends:Array,
        });
const RequestUser=mongoose.model('RequestUser',friendrequestschema);

mongoose.connect('mongodb+srv://utkarshbarde2:Sqfr1i8ru74g3Qbb@cluster0.zhtp5bf.mongodb.net/')


            


const service1=io.of('/service1');
service1.on('connection',(socket)=>{
    socket.on("savefriends",(currentuser,friendtoadd)=>{
        console.log("save friends request received")
        async function addcheckofname(){
            console.log("insidefunction")
            const user=await RequestUser.findOne({ofname:friendtoadd})
      
    
            if (user){
                console.log("user existsa")
                console.log(user.toname.includes(currentuser))
                if (user.toname.includes(currentuser)===true || friendtoadd===currentuser || user.addedfriends.includes(currentuser)==true){
                    console.log("cant override")
                }
                else{
                    console.log("updating")
                      await RequestUser.updateOne({
                    ofname:friendtoadd},
                    {$push:{toname:currentuser}},
                )
                }
              
            }
            else{
            }
    
        }
        addcheckofname(currentuser,friendtoadd)})  

    })

   
const service2=io.of('/service2');
service2.on('connection',(socket)=>{
    socket.on("requestfriend",(currentuser)=>{
        // console.log(currentuser)
        async function addcheckofname1(){
            const user=await RequestUser.findOne({ofname:currentuser})
    
            if (user){
                // console.log("userpresent",user.ofname)
                socket.emit("requestfri",user.toname,user.addedfriends)
                // console.log(user.ofname,user.toname,"addedfriends")
            }
            else{
                // console.log(currentuser)
                // console.log("no user")
            }
    
        }
        addcheckofname1(currentuser)}) 

    })

    const service3=io.of('/service3');
service3.on('connection',(socket)=>{
    socket.on("permaservice",(currentuser,permavalue)=>{
        async function addfri(){
            // console.log(currentuser,permavalue,"permavalue")
            const user=await RequestUser.findOne({ofname:currentuser})
    
            if (user){
                if (permavalue===""){
                    // console.log("emptysendedvalue")
                    
                }
                else{

                    const check11=await RequestUser.findOne({ofname:currentuser})
                    // console.log(permavalue,check11.addedfriends,"lastcheckpoint")

                    if (check11.addedfriends.includes(permavalue)){
                        // console.log("Multiple hits")
                    }
                    else{

                        
                        await RequestUser.updateOne(
                            { ofname: currentuser },
                            { $push: { addedfriends: permavalue } }
                        );
                        await RequestUser.updateOne(
                            { ofname: permavalue },
                            { $push: { addedfriends: currentuser } }
                        );
                        
                        await RequestUser.updateOne(
                            { ofname: currentuser },
                            { $pull: { toname: permavalue } }
                        );
                        
                            // console.log("addedfriends")
                            

                    }
                    
                    

                }
                
               
                
            }
            else{
                // console.log(currentuser)
                // console.log("no perma user")
            }
    
        }
        addfri(currentuser,permavalue)}) 

    })



//-------------------------------------------------------------------------

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});