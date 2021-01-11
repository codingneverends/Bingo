
/*Firebase will invoke functions whenever the value in database changes. This js code will works fine but 
it is not the correct way to invoke firebase functionalities. I made another one tictactoebycne.web.app which
is implemented in correct manner. This will works fine , this code has more calls- it can be avoided.*/

var AmiHost=false;
var Waiting=false;
var TotalPlayers=0;
var ROOMNAME;
var Status="out";
var CurPlayers=0;
var MyID;
var MyTurn=false;
var Bingostrikes=document.getElementsByClassName("str");
PLAYERNAME="Player";
function init(){
    Join(true,true);
    setupeles();
    ROOMNAME="";
    for(let i=0;i<Bingostrikes.length;i++){
        Bingostrikes[i].style.opacity=0;
    }
    iniplayername.init();
}
function Join(x,y=false)
{
    var jbtn=document.getElementById("jroom");
    var cbtn=document.getElementById("croom");
    var content=document.getElementById("content");
    if(y){
        jbtn.classList.add("act");
        content.innerHTML=`
        <input type="text" id="RoomName" placeholder="RoomName" onkeyup="checkRoom(true)">
        <div class="btflex"><button onclick="JoinGame()">Join</button></div>`;
        return;
    }
    if(x){
        jbtn.classList.add("act");
        cbtn.classList.remove("act");
        content.innerHTML=`
        <input type="text" id="RoomName" placeholder="RoomName" onkeyup="checkRoom(true)">
        <div class="btflex"><button onclick="JoinGame()">Join</button></div>`;
    }
    else{
        jbtn.classList.remove("act");
        cbtn.classList.add("act");
        content.innerHTML=`
        <input type="text" id="RoomName" placeholder="RoomName" onkeyup="checkRoom()">
        <div class="btflex"><div class="next">Next</div><button onclick="Create('RoomName')">Next</button></div>`;
    }
}
function setpls()
{
    var content=document.getElementById("content");
    content.innerHTML=`
    <div class="nofm">Number of players</div>
    <div class="btflex">
        <button class="noofp" onclick="setnoofplayers(2)">2</button>
        <button class="noofp" onclick="setnoofplayers(3)">3</button>
        <button class="noofp" onclick="setnoofplayers(4)">4</button>
        <button class="noofp" onclick="setnoofplayers(5)">5</button>
    </div>
    <div class="btflex"><div class="next">Next</div><button onclick="Create('Number')">Next</button></div>`;
    setnoofplayers(2);
}
function setnoofplayers(x)
{
    var noofps=document.getElementsByClassName("noofp");
    if(noofplayers>1)
    {
        noofps[noofplayers-2].classList.remove("act");
    }
    noofps[x-2].classList.add("act");
    noofplayers=x;
}
var name="",noofplayers=0;
function Create(x){
    var content=document.getElementById("content");
    if(x=="RoomName")
    {
        name=document.getElementById("RoomName").value;
        if(name.length<3 || name.length==undefined || name.length==null)
        {
            document.getElementById("RoomName").style.borderColor="red";
            return;
        }
        content.innerHTML=`
        <div class="nofm">Number of players</div>
        <div class="btflex">
            <button class="noofp" onclick="setnoofplayers(2)">2</button>
            <button class="noofp" onclick="setnoofplayers(3)">3</button>
            <button class="noofp" onclick="setnoofplayers(4)">4</button>
            <button class="noofp" onclick="setnoofplayers(5)">5</button>
        </div>
        <div class="btflex"><div class="next">Next</div><button onclick="Create('Number')">Next</button></div>`;
    setnoofplayers(2);
    }
    if(x=="Number"){
        if(noofplayers<2){
            return;
        }
        content.innerHTML=`
                            <div class="nofm">Press 'Create' to continue..</div>
                            <div class="btflex"><button onclick='CreateRoom()'>Create</button></div>`;
        TotalPlayers=noofplayers;
    }
}
async function CreateRoom(){
    console.log(name,noofplayers);
    var timestamp=new Date;
    timestamp=timestamp.getTime();
    var playername=document.getElementById("playername").innerHTML;
    PLAYERNAME=playername;
    firebase.database().ref('Bingo/'+name).set({
        RoomName:name,
        NoOfPlayers:noofplayers,
        timestamp:timestamp,
        status:"waiting",
        cuplayers:1,
        curplayer:playername
    });
    for(var i=0;i<noofplayers;i++){
        var player="Player"+(i+1);
        if(i!=0)playername="Player"+(i+1);
        var initialised=false;
        if(i==0)initialised=true;
        firebase.database().ref('Bingo/'+name+"/Players/"+player).set({
            id:i+1,
            player:playername,
            initialised:initialised,
            myturn:initialised,
            ready:false,
            juststriked:-1,
            win:false,
            count:25,
            position:"Nil"
        });
    }
    sendmsg("Game","Chat enabled",-1);
    AmiHost=true;
    Waiting=true;
    document.getElementById("waiting").style.zIndex=11;
    console.log("tet");
    ROOMNAME=name;
    MyID=1;
    Status="waiting";
}
setInterval(()=>{
    var temphtml="";
    if(Status!="out"){
        fetchmsgs();
        firebase.database().ref('Bingo/'+ROOMNAME).on('value',(snapshot)=>{
            Status=snapshot.val().status;
            temphtml=snapshot.val().curplayer;
            if(MyTurn){
                temphtml="<div class='cg'>Your Turn</div>";
            }
            else
            {
                temphtml=snapshot.val().curplayer+"'s turn";
            }
            if(Status=="desiciding" || status=="gameover" || status=="GameOver")
            {
                temphtml="Waiting...";
            }
            document.getElementById("turn").innerHTML=temphtml;
        });
    }
    if(AmiHost && Waiting){
        firebase.database().ref('Bingo/'+ROOMNAME+"/Players/"+"Player"+TotalPlayers).on('value',(sanapshot)=>{
            if(sanapshot.val().initialised==true){
                firebase.database().ref('Bingo/'+ROOMNAME).update({
                    status:"desiciding"
                });
            }
        });
    }
    if(Waiting){
        firebase.database().ref('Bingo/'+ROOMNAME).on('value',(sanapshot)=>{
            if(sanapshot.val().status=="desiciding"){
                Waiting=false;
                Status="desiciding";
            }
            CurPlayers=sanapshot.val().cuplayers;
            var x=CurPlayers+"/"+TotalPlayers;
            document.getElementById("waitingq").innerHTML=x;
            if(CurPlayers==TotalPlayers){
                document.getElementById("waiting").style.zIndex=-100;
                document.getElementById("game").style.zIndex=11;
            }
        });
    }
    if(AmiHost && Status=="desiciding"){
        var ready=true;
        firebase.database().ref('Bingo/'+ROOMNAME+"/Players/").on('value',(sanapshot)=>{
            sanapshot.forEach((childsnap) => {
                if(childsnap.val().ready==false){
                    ready=false;            
                }
            });
            if(ready){
                firebase.database().ref('Bingo/'+ROOMNAME).update({
                    status:"started"
                });
            }
        })
    }
    if(Status=="started"){
        getmyturn();
        isGameover();
    }
    if(Status=="gameover"){
        SetMyPos();
        CheckPoses();
    }
    if(Status=="GameOver"){
        SetMyPos();
        console.log("Game Over");
        if(RankAr.length!=TotalPlayers){
            RankAr=[];
            getNameandRank();
        }
        else
        {
            console.log(RankAr);
            Status="Notingame";
            Notingame=true;
        }
    }
    if(Status=="Notingame"){
        console.log("set");
        if(Notingame){
            finalsetup();
            Notingame=false;
        }
    }
},100);
var Notingame=false;
var fset=false;
function finalsetup(){
    if(fset){
        return;
    }
    var fscreen=document.getElementById("fscreen");
    fscreen.style.zIndex=20;
/*
   ` <div class="box">
      <div class="flexbb">
        <div class="box"><div class="result">Player</div></div>
        <div class="box"></div><div class="result">Rank</div></div>
      </div>
    </div>`
*/
    var temphtml=`<div class="box">
                    <div class="gameover">GameOver</div>
                        <div class="flexbb">
                            <div class="box">`;
      var players="<div class='result m'>Player</div>";
      var Ranks="<div class='result m'>Rank</div>";
    if(RankAr.length!=0){
        for(let i=0;i<RankAr.length;i++)
        {            
            if(RankAr[i].id==MyID)RankAr[i].name="You";
            players+=`<div class="result">${RankAr[i].name}</div>`;
            Ranks+=`<div class="result">${RankAr[i].Rank}</div>`;
        }
    }
    temphtml+=players+`</div><div class="box">`+Ranks+`</div></div><button onclick="reinit()" class="fbtn">OK</button></div>`;
    fscreen.innerHTML=temphtml;
    fset=true;
}
function reinit(){
    location.reload();
}
async function getmyturn(){
    firebase.database().ref('Bingo/'+ROOMNAME+"/Players/"+"Player"+MyID).on('value',(snapshot)=>{
        MyTurn=snapshot.val().myturn;
    });
}
setInterval(()=>{
    if(Status=="started")
    firebase.database().ref('Bingo/'+ROOMNAME+"/Players/").on('value',(sanapshot)=>{
        sanapshot.forEach((childsnap) => {
            var x=childsnap.val().juststriked;
            if(x!=-1)
            cmdStrike(x);
        });
    })
},500)
function Name(hide){
    if(hide){
        var newname=document.getElementById("playernameenter").value;
        iniplayername.set(newname);
        document.getElementById("EditName").style.zIndex="-100";
    }
    else{
        document.getElementById("EditName").style.zIndex="11";
    }

}
async function JoinGame(){
    var RoomName=document.getElementById("RoomName").value;
    var id=-1;
    if(document.getElementById("RoomName").style.borderColor=="rgb(0, 255, 0)"){
        console.log("Join");
        firebase.database().ref('Bingo/'+RoomName+"/Players/").on('value',(sanapshot)=>{
            sanapshot.forEach((childsnap) => {
                if(childsnap.val().initialised==false && id==-1){
                    console.log("Joining");
                    id=childsnap.val().player[childsnap.val().player.length-1];
                    console.log(id);
                }
            });
        });
    }
    if(id!=-1){
        MyID=id;
        var playername=document.getElementById("playername").innerHTML;
        firebase.database().ref('Bingo/'+RoomName+"/Players/"+"Player"+id).update({
            initialised:true,
            player:playername
        });
        PLAYERNAME=playername;
        var curplayers;
        firebase.database().ref('Bingo/'+RoomName+"/").on('value',(sanapshot)=>{
            TotalPlayers=sanapshot.val().NoOfPlayers;
            ROOMNAME=RoomName;
            Waiting=true;
            Status="waiting";
            document.getElementById("waiting").style.zIndex=11;
            curplayers=sanapshot.val().cuplayers;
        });
        firebase.database().ref("Bingo/"+ROOMNAME+"/").update({
            cuplayers:curplayers+1
        });
    }
}
async function checkRoom(join=false){
    if(Status!="out"){return;}
    name=document.getElementById("RoomName").value;
    if(document.getElementById("RoomName")==null)return;
    var ret=false;
    document.getElementById("RoomName").style.borderColor="white";
    if(name.length<4){
        document.getElementById("RoomName").style.borderColor="red";
    }
    if(join){document.getElementById("RoomName").style.borderColor="red";}
    firebase.database().ref('Bingo/').on('value',(sanapshot)=>{
        sanapshot.forEach((childsnap) => {
            if(childsnap.val().RoomName==name){
                if(document.getElementById("RoomName")==null)return;
                document.getElementById("RoomName").style.borderColor="red";
                if(join && childsnap.val().status=="waiting"){document.getElementById("RoomName").style.borderColor="#0f0";}
                ret=true;            
            }
        });
        if(!ret){
            if(document.getElementById("RoomName")==null)return;
            document.getElementById("RoomName").style.borderColor="#0f0";
            if(join){document.getElementById("RoomName").style.borderColor="red";}
        }
    })
}


async function iamready(){
    firebase.database().ref('Bingo/'+ROOMNAME+"/Players/"+"Player"+MyID).update({
        ready:true
    });
}


var eles=new Array(25);
function setupeles()
{
    for(var i=0;i<25;i++){
        eles[i]=document.getElementById("ele"+i);
        eles[i]=new element(eles[i],i);
    }
}
class element{
    constructor(ele,i){
        this.ele=ele;
        this.value=i+1;
        this.setnodevalueas(this.value);
        this.striked=false;
    }
    setnodevalueas(x){
        this.value=x;
        this.ele.innerHTML=`
            <div class="absele" onclick="Strike(${x})">${x}</div>
        `;
        if(this.striked){
          this.ele.innerHTML+=`<div class="strike"></div>`;  
        }
    }
    strike(){
        this.striked=true;
        this.setnodevalueas(this.value);
    }
}
function Strike(x){
    if(MyTurn){
        if(getbyvalue(x).striked)return;
        firebase.database().ref('Bingo/'+ROOMNAME+"/Players/"+"Player"+MyID).update({
            juststriked:x
        });
        UpdateTurn();
    }
    else return;
}
function  cmdStrike(x){
    if(checkBingo()==5){return;}
    if(getbyvalue(x).striked)return;
    getbyvalue(x).strike();
    var win=checkBingo();
    if(win==5){
        iwon();
    }
}
function getbyvalue(x){
    for(var i=0;i<25;i++){
        if(eles[i].value==x){
            return eles[i];
        }
    }
    return -1;
}
function Shuffle(){
    if(Status=="started"){
        return;
    }
    for(var i=0;i<25;i++){
        var index=Math.floor(Math.random()*25);
        var tempval=eles[index].value;
        var tempival=eles[i].value;
        eles[index].setnodevalueas(tempival);
        eles[i].setnodevalueas(tempval);
    }
}
function checkBingo()
{
    var ret=0;
    var temp=0;
    for(var i=0;i<25;i++){
        if(eles[i].striked){
            temp++;
        }
        if(temp==5){
            ret++;
        }
        if(i%5==4){
            temp=0;
        }
    }
    for(var i=0;i<5;i++){
        temp=0;
        for(var j=0;j<5;j++){
            if(eles[5*j+i].striked){
                temp++;
            }
        }
        if(temp==5){
            ret++;
        }
    }
    temp=0;
    for(var i=0;i<5;i++){
        if(eles[i*5+i].striked){
            temp++;
        }
        if(temp==5){
            ret++;
        }
    }
    temp=0;
    for(var i=0;i<5;i++){
        if(eles[i*5+4-i].striked){
            temp++;
        }
        if(temp==5){
            ret++;
        }
    }
    for(let i=0;i<ret;i++){
        Bingostrikes[i].style.opacity=1;
    }
    return ret;
}

async function UpdateTurn(forced=false){
    var tempup=[];
    firebase.database().ref('Bingo/'+ROOMNAME+"/Players/").on('value',(sanapshot)=>{
        tempup=[];
        sanapshot.forEach((childsnap) => {
                tempup.push(childsnap.val());
        });
    });
    var index;
    for(var i=0;i<2*tempup.length;i++){
        j=i%tempup.length;
        if(tempup[j].id==MyID){
            index=j;
            break;
        }
    }
    for(var i=index+1;i<2*tempup.length;i++){
        j=i%tempup.length;
        if(tempup[j].win==false){
            index=j;
            break;
        }
    }
    firebase.database().ref('Bingo/'+ROOMNAME+"/Players/"+"Player"+MyID).update({
        myturn:false
    });
    for(let i=1;i<=TotalPlayers;i++)
    {
        if(!forced){
            break;
        }
        firebase.database().ref('Bingo/'+ROOMNAME+"/Players/"+"Player"+i).update({
            myturn:false
        });
    }
    firebase.database().ref('Bingo/'+ROOMNAME+"/Players/"+"Player"+tempup[index].id).update({
        myturn:true
    });
    firebase.database().ref('Bingo/'+ROOMNAME).update({
        curplayer:tempup[index].player
    });
}
async function iwon()
{
    var count=0;
    let tempposition="Nil";
    for(let i=0;i<25;i++){
        if(eles[i].striked){
            count++;
        }
    }
    firebase.database().ref('Bingo/'+ROOMNAME+"/Players/"+"Player"+MyID).update({
        myturn:false,
        position:tempposition,
        win:true,
        count:count
    });
    console.log(count);
    UpdateTurn(true);
}
async function isGameover()
{
    if(!AmiHost)return;
    var count=0;
    for(let i=1;i<=TotalPlayers;i++)
    {
        firebase.database().ref('Bingo/'+ROOMNAME+"/Players/"+"Player"+i).on('value',(snapshot)=>{
            if(snapshot.val().win)count++;
        });
    }
    if(count>TotalPlayers-2){
        firebase.database().ref('Bingo/'+ROOMNAME).update({
            status:"gameover"
        });
    }
}
async function SetMyPos(){
    let tempposition="Last";
    firebase.database().ref('Bingo/'+ROOMNAME+"/Players/"+"Player"+MyID).on('value',(snapshot)=>{
        if(snapshot.val().win==false){
            firebase.database().ref('Bingo/'+ROOMNAME+"/Players/"+"Player"+MyID).update({
                win:true,
                position:tempposition,
                count:25
            });
            return;
        }
    });
    var tempup=[];
    let mycount;
    firebase.database().ref('Bingo/'+ROOMNAME+"/Players/").on('value',(sanapshot)=>{
        tempup=[];
        sanapshot.forEach((childsnap) => {
                tempup.push(childsnap.val().count);
                if(childsnap.val().id==MyID){
                    mycount=childsnap.val().count;
                }
        });
    });
    let j=0,pre=-1;
    tempup.sort((a,b)=>{if(a>b){return 1} else return -1});
    for(let i=0;i<tempup.length && mycount!=pre;i++){
        if(tempup[i]!=pre){
            j++;
            pre=tempup[i];
        }
    }
    tempposition=getposition(j);
    if(mycount==25){
        tempposition="Last";
    }
    firebase.database().ref('Bingo/'+ROOMNAME+"/Players/"+"Player"+MyID).update({
        win:true,
        position:tempposition
    });
    console.log(tempposition);
}
function getposition(x){
    switch(x){
        case 1:return "First";
        case 2:return "Second";
        case 3:return "Third";
        case 4:return "Forth";
        case 5:return "Fivth";
        case 6:return "Sixth";
    }
}
async function  CheckPoses(){
    if(!AmiHost)return;
    firebase.database().ref('Bingo/'+ROOMNAME+"/Players/").on('value',(sanapshot)=>{
        sanapshot.forEach((childsnap) => {
            console.log(childsnap.val().position);
            if(childsnap.val().position=="Nil"){
                console.log("ERROR");
                return;
            }
        });
    });
    console.log("All set");
    firebase.database().ref('Bingo/'+ROOMNAME).update({
        status:"GameOver"
    });
}
var RankAr=[];
async function getNameandRank(){
    SetMyPos();
    var GONameandRank=[];
    firebase.database().ref('Bingo/'+ROOMNAME+"/Players/").on('value',(sanapshot)=>{
        sanapshot.forEach((childsnap) => {
            if(childsnap.val().position=="Nil"){
                return;
            }
            GONameandRank.push(childsnap.val());
        });
    });
    GONameandRank.sort((a,b)=>{if(a.count>b.count){return 1} else return -1});
    RankAr=[];
    for(let i=0;i<GONameandRank.length;i++){
        if(GONameandRank[i].position=="Nil")return;
        console.log(GONameandRank[i].position);
        RankAr.push({"name":GONameandRank[i].player,"Rank":GONameandRank[i].position,"id":GONameandRank[i].id});
    }
};


//Meassaging system

function sendmessage(){
    var msg=document.getElementById("msg").value;
    if(!msg.length){
        console.log("error");
    }
    if(msg.length>2){
        sendmsg(PLAYERNAME,msg,MyID);
    }
    document.getElementById("msg").value="";
}

async function sendmsg(name,msg,id){
    var tep=new Date;
    id=Number(id);
    firebase.database().ref('Bingo/'+ROOMNAME+'/Msg/'+tep.getTime()).set({
        name:name,
        msg:msg,
        id:id
    });
}
var initialmsglength=-1;
var curmsgs=[];
async function fetchmsgs(){
    curmsgs=[];
    firebase.database().ref('Bingo/'+ROOMNAME+'/Msg').on('value',(snapshot)=>{
        snapshot.forEach((childsnap) => {
            curmsgs.push(childsnap.val());
        });
    });
    if(curmsgs.length!=initialmsglength){
        makehtmlosmsgs(curmsgs);
        initialmsglength=curmsgs.length;
    }
}
function makehtmlosmsgs(msgar){
    let temphtml="";
    for(let i=0;i<msgar.length;i++)
    {
        if(Number(MyID)==Number(msgar[i].id))
        {
            temphtml+=
                `<div class="cname m">You</div>
                <div class="msg m">${msgar[i].msg}</div>`;
        }
        else
        {
        temphtml+=
            `<div class="cname">${msgar[i].name}</div>
            <div class="msg">${msgar[i].msg}</div>`;
        }
    }
    document.getElementById("chats").innerHTML=temphtml;
    var chats=document.getElementById("chats");
    chats.scrollTop=chats.scrollHeight;
}


var iniplayername={
    init()
    {
        this.key='https://bingobycne.web.app-bingoplayer';
        this.name=localStorage[this.key] || "player";
        this.set(this.name);
    },
    set(name)
    {
        this.name=name;
        localStorage[this.key] = name;
        document.getElementById("playername").innerHTML=this.name;
        document.getElementById("playernameenter").value=this.name;
        PLAYERNAME=this.name;
    },
    get()
    {
        return this.name;
    }
}

