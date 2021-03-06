// ==UserScript==
// @name         Picking Songs in iirose
// @namespace    http://tampermonkey.net/
// @version      1.13
// @description  Very neat, very fast, hidden functions!!
// @author       You
// @match        https://iirose.com/messages.html
// @match        https://www.xiami.com/radio/play/*
// @match        https://www.xiami.com/collect/*
// @grant       GM.setValue
// @grant       GM.getValue
// ==/UserScript==


(function() {
    'use strict';

    //get url of current page
    var url = window.location.href;
    GM.setValue("song", -5);//default to be -5 means null
    var autoPicking = true;
    //save a shuffled song list and current pointer
    var shuffledSongList = [];
    var shufflePointer = 0;

    //for xiami radio page
    if (url.search("xiami.com/radio")>=0){
        var timerXiami = setInterval(function(){

            if(document.getElementsByClassName("artist_info fl")[0]!=undefined){
                clearInterval(timerXiami);

                xiami();
            }
        }, 1000);
    }
    //for iirose
    else if (url.search("iirose.com")>=0){
        iirose();
    }
    else if (url.search("xiami.com/collect")>=0){
        xiamiCollection();
    }
    else {
        console.log("Failed to match the website!");
    }

    //a quick shuffle algorithm
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    //simple sleep function
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    //xiami Collection starts
    function xiamiCollection(){
        //generate a button

        console.log("51");

        var parentDiv = document.getElementById("element_r");
        var newNode = document.createElement ('div');
        newNode.innerHTML='<form style="font-size:16px">'
            +'<br><br>给蔷薇花园点歌！<br><br>'
            +'从：<input type="number" name="startNum" max="50" style="border: 2px solid red;font-size: 16px;"> <br><br>到：<input type="number" name="endNum" style="border: 2px solid red;font-size: 16px;"><br><br>'
            +'点：<input type="number" name="pickNum" min="1" max="10" style="border: 2px solid red;font-size: 16px;"> 首<br><br>'
            +'<input type="checkbox" name="random" value="random" style="border: 2px solid red;font-size: 16px;">   随机播放<br><br>'
            +'<input id="pick!" type="button" style="background-color: #4CAF50;font-size: 16px;text-align:center;" value="  点歌！ "> <br><br>'
            +'<input id="pickFive!" type="button" style="background-color: #4CAF50;font-size: 16px;text-align:center;" value="  点五首歌！ "> </form>';
        parentDiv.appendChild (newNode);
        document.getElementById("pick!").addEventListener("click", pickCollection);
        document.getElementById("pickFive!").addEventListener("click", pickCollectionFive);
        /*
            <form>
            从：
            <input type="number" name="startNum" min="1" max="5">
            到：
            <input type="number" name="endNum" min="1" max="5">
            <br>
            点
            <input type="number" name="pickNum" min="1" max="5">
            首
            <br>
            <input type="checkbox" name="random" value="random"> 随机播放<br>
            <input type="submit">
            </form>
            */

    }
    //
    async function pickCollection(){
        //for xiami collection
        console.log("84");
        var songList = getSongList();
        console.log("song size is "+songList.length);
        var pickList = [];
        var startP = document.getElementsByName("startNum")[0].value;
        var endP = document.getElementsByName("endNum")[0].value;
        var range = document.getElementsByName("pickNum")[0].value;
        var random = document.getElementsByName("random")[0].checked;
        console.log("new89"+startP+endP+range+random);
        if (isNaN(startP)){ startP=0;
                          }
        if (isNaN(endP)){ endP=50;
                        }
        if (isNaN(range)){ range=5;
                         }
        startP = parseInt(startP);endP = parseInt(endP);range = parseInt(range);
        if (range>endP-startP){startP=1;endP=50;
                              }
        pickList = songList.slice(startP, endP);

        if (random){
            shuffleArray(pickList);
        }

        var song;
        var count = 1;
        await sleep(2000);
        for (song of pickList){
            if (count>range){break;}
            song.replace( /\s\s+/g, ' ' );
            GM.setValue("song", song);
            console.log("sended "+song);
            count += 1;
            await sleep(2000);
        }

    }

    async function pickCollectionFive(){
        //for xiami collection
        if (shuffledSongList.length==0){
            shuffledSongList = getSongList();
            shuffleArray(shuffledSongList);
        }

        console.log("song size is "+shuffledSongList.length);
        var pickList = [];
        var range = 5;
        console.log("ShufflePointer (before):"+shufflePointer);
        if (shufflePointer+range+1>shuffledSongList.length){
            pickList=shuffledSongList.slice(shufflePointer).concat(shuffledSongList.slice(0, shufflePointer+range-shuffledSongList.length));
            shufflePointer=shufflePointer+range-shuffledSongList.length;
        }
        else {
            pickList = shuffledSongList.slice(shufflePointer, shufflePointer+range);
            shufflePointer=shufflePointer+range;
        }
        console.log("ShufflePointer (after):"+shufflePointer);

        var song;
        var count = 1;
        await sleep(2000);
        for (song of pickList){
            song.replace( /\s\s+/g, ' ' );
            GM.setValue("song", song);
            console.log("sended "+song);

            await sleep(2000);
        }


    }
    function getSongList(){
        var list = document.getElementsByClassName("song_name");
        var listSize = list.length;
        var tempNode;
        var songList = [];
        for (tempNode of list){
            var songNameList=tempNode.innerText.split("-—")[0].split(" "); // like ["Return", "Of", "The", "Mack", "(...", ""]
            var tempSoneNameNode;
            var songName="";
            for (tempSoneNameNode of songNameList){
                if (tempSoneNameNode.search(/\.\.\./)>=0){
                    //console.log("99"+tempSoneNameNode);
                    break;
                }
                tempSoneNameNode=tempSoneNameNode.replace('(','').replace(')','');
                songName += tempSoneNameNode;
                songName += ' ';
            }
            var artisitList=tempNode.innerText.split("-—")[1].split(";");//like [" Dale Castell", "Tamia"]
            var lastWord = artisitList[artisitList.length-1].split(' ').slice(-1)[0];
            if (lastWord=='MV'){
                //console.log('before: '+artisitList);
                artisitList[artisitList.length-1]=artisitList[artisitList.length-1].split(' ').slice(0,-1).join(' ');
                //console.log('after: '+artisitList);
            }
            var artisitName=artisitList.join(' ');
            songList.push(songName+'|'+artisitName);
            //console.log(songName+'|'+artisitName);
        }
        return songList;
    }




    //play with xiami
    function xiami(){
        //send first message to iirose
        xiamiSendMessage();

        //an api that can be used to monitor changes in the webpage
        var mutationObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                //console.log(mutation);

                //send message whenever it observers a change
                xiamiSendMessage();

            });
        });

        //it focuses on the title of the page
        mutationObserver.observe(document.querySelector('title'), {
            attributes: true,
            characterData: true,
            childList: true,
            subtree: true,
            attributeOldValue: true,
            characterDataOldValue: true
        });


    }

    //collect and send info to iirose
    function xiamiSendMessage(){

        //this timer waits for the page to load every 0.1s
        var timerXiamiMessage = setInterval(function () {

            //if the artist info is loaded we assume the page finished loading cuz that's what we need.
            if(document.getElementsByClassName("artist_info fl")[0]!=null){
                clearInterval(timerXiamiMessage);

                //get song name and artist name
                var songName = document.title.split("——")[0];
                var artistName = document.getElementsByClassName("artist_info fl")[0].getElementsByTagName("strong")[0].innerHTML;
                var message = songName+"|"+artistName;

                //set the "song" value with the above info
                GM.setValue("song", message);
                console.log("sended "+message);
            }
        }, 100);




    }

    //play with iirose


    async function iirose(){
        //this timer checks if the window has loaded. Do checking every 3 seconds.
        if (autoPicking){
            var timer = setInterval(function () {
                if(document.getElementById("moveinput")!=null){
                    clearInterval(timer);

                    //current song info
                    var tempSong=-5;

                    //this timer checks if there is a new message from xiami
                    var pickTimer = setInterval(async function () {

                        //get value from xiami. If not changed, do nothing and wait
                        var realSong = await GM.getValue("song", -5);
                        if(realSong!=tempSong){

                            //changed! pick the real song here
                            console.log("successfully recieve message "+realSong);
                            await pickingSong(realSong);

                            //update tempSong
                            tempSong = realSong;
                        }

                        //console.log("one more loop in iirose");
                    }, 300);
                }

            }, 3000);
        }
        //add entryIirose() to console
        /*var scriptText='function entryIirose(str){ if(str.length>14){console.log("智障吗，搞那么长？");str="艰苦奋斗严肃活泼";} var rainbow=["C30002", "C30040", "C3007D", "C300BB", "8D00C3", "4F00C3", "1200C3", "002AC3", "0068C3", "00A5C3", "00C3A2", "00C365", "00C327", "15C300", "52C300", "90C300", "C3B800", "C37A00", "C33D00", "C30000", "C30022", "C30060", "C3009D", "AA00C3", "6D00C3", "2F00C3", "000DC3", "004AC3", "0088C3", "00C3C0", "00C382", "00C345", "00C307", "35C300", "72C300", "B0C300", "C39800", "C35A00", "C31D00", "C3001F"];var offset=Math.floor(Math.random()*rainbow.length);var text=str.split("");for(var i=0;i<text.length;i++){if(offset+i<rainbow.length){console.log(\'%c \'+rainbow[offset+i],\'color: #\'+rainbow[offset+i]);socket.send(\'{"m": "\'+text[i]+\'", "mc": "\'+rainbow[offset+i]+\'"}\')} else{socket.send(\'{"m": "\'+text[i]+\'", "mc": "\'+rainbow[offset+i-rainbow.length]+\'"}\');console.log(\'%c \'+rainbow[offset+i], \'color: #\'+rainbow[offset+i]);}}}';
        addScript(scriptText);

        //whether show rainbow effect
        if(entryEffect){
            entryIirose(null);
        }
        if (autoSpamming){
            setInterval(function(){
                entryIirose("自动刷屏123456789");
            },300000);
        }
*/
        return;
    }

    //pick a song with the sring
    function pickingSong(songInfo){
        var str = songInfo.replace("|"," ");
        inputString("@"+str);

        //this timer checks whether the search results have loaded
        var timer2 = setInterval(function () {

            //if find nothing OR have found some songs, end the timer
            if((document.getElementsByClassName("emptyShow")[0]!=null)||(document.getElementsByClassName("demandHolderPlayBtn")[0]!=null)){

                //if find something
                if(document.getElementsByClassName("emptyShow")[0]==null){
                    var songList = document.getElementsByClassName("demandHolderPlayBtn");
                    //console.log(songList[0]);


                    if(songList[0].getElementsByClassName("mainColor")[0].getElementsByClassName("buttonText")[0]!=null){
                        clearInterval(timer2);
                        //if successfully pick a song
                        var flag = 0;

                        //loop until one button can be clicked
                        for (var i = 0; i < songList.length; i++) {

                            var node = null;
                            for (var j = 0; j < songList[i].childNodes.length; j++) {
                                if (songList[i].childNodes[j].className == "mainColor") {
                                    node = songList[i].childNodes[j];
                                    break;
                                }
                            }

                            //check if clickable
                            if (node.hasAttribute("onclick")){
                                node.click();
                                console.log("pick "+i);
                                flag=1;
                                break;
                            }
                            console.log("cannot pick "+i);
                        }

                        //no button was clicked. Go back
                        if (flag==0){
                            //click return
                            console.log("failed");
                            document.getElementsByClassName("footerItemBgShape_pointer")[0].onclick.apply();
                            inputString("点歌失败，因为没有 "+str+" 的版权。");
                        }
                    }
                }
                //if find nothing
                else {

                    //这里有bug!!
                    clearInterval(timer2);
                    document.getElementsByClassName("footerItemBgShape_pointer")[0].onclick.apply();
                    var strList=songInfo.split("|");
                    if (strList.length>1){
                        inputString("点歌失败，因为搜索不到 "+str+"。尝试模糊搜索 "+strList[0]);
                        setTimeout(function(){pickingSong(strList[0]);}, 1000)
                    }
                    else{
                        inputString("模糊搜索也失败了。");
                        location.reload();
                    }

                }





            }
            //
        }, 800);

        //var newSize = songlist.length;//for future use




    }
    //some tools

    //this method types and submit a string in the typearea
    function inputString(str){
        var inputBox = document.getElementById("moveinput");
        var originText = inputBox.value;
        var submit = document.getElementsByClassName("moveinputSendBtn")[0];
        inputBox.value = str;
        submit.click();
        inputBox.value = originText;
    }

    //this method add a script to html so that u can use the script in console
    function addScript(scriptText){
        var scriptElem = document.createElement('script');
        scriptElem.innerHTML = scriptText;
        document.body.appendChild(scriptElem);
    }

    //show a rainbow when enter a room. Very annoying!
    //expired
    async function entryIirose(str){
        if(str !=null){GM.setValue("entry",str);}
        str = await GM.getValue("entry", "我踩着七彩祥云来了~")
        if(str.length>13){
            console.log("智障吗，搞那么长？");
            str="本人专属跑马灯入场";
            GM.setValue("entry",str);
        }
        var rainbow = ["C30002", "C30040", "C3007D", "C300BB", "8D00C3", "4F00C3", "1200C3", "002AC3", "0068C3", "00A5C3", "00C3A2", "00C365", "00C327", "15C300", "52C300", "90C300", "C3B800", "C37A00", "C33D00", "C30000", "C30022", "C30060", "C3009D", "AA00C3", "6D00C3", "2F00C3", "000DC3", "004AC3", "0088C3", "00C3C0", "00C382", "00C345", "00C307", "35C300", "72C300", "B0C300", "C39800", "C35A00", "C31D00", "C3001F"];
        // var rainbow = ["00ABE5", "0063E5", "001CE6", "2C00E7", "7400E8", "BE00E9", "EA00CC", "EA0083", "EB003A", "EC0F00", "ED5900", "EEA400", "EEEF00", "A4EF00", "5AF000", "0EF100", "00F23C", "00F389", "00F4D5", "00C7F5","007DF5", "0033F5", "1600F5", "6000F5", "AA00F5", "F400F5", "F500AB", "F50060", "F50016", "F53300", "F57D00", "F5C700", "D8F500", "8DF500", "43F500", "00F506", "00F550", "00F59A", "00F5E4", "00BBF5"];
        var offset = Math.floor(Math.random() * rainbow.length);
        var text = str.split("");

        for (var i=0;i<text.length;i++){
            if(offset+i<rainbow.length){
                console.log('%c '+rainbow[offset+i], 'color: #'+rainbow[offset+i]);
                socket.send('{"m": "'+text[i]+'", "mc": "'+rainbow[offset+i]+'"}');
            }
            else {
                console.log('%c '+rainbow[offset+i], 'color: #'+rainbow[offset+i]);
                socket.send('{"m": "'+text[i]+'", "mc": "'+rainbow[offset+i-rainbow.length]+'"}');
            }

        }
    }

    // Your code here...
})();
