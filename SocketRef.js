let io;
module.exports={
    getio:()=>io,
    setio:(socketIoInstance)=>{
        io=socketIoInstance
    },
    getcurrentname:()=>current,
    setcurrentname:(newcurrent)=>{
        current=newcurrent
    },
    getcurrentuser:()=>temp,
    setcurrentuser:(newuser)=>{
        temp=newuser
    }

};