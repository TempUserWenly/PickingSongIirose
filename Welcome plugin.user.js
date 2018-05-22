// ==UserScript==
// @name         Welcome plugin
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       You
// @match        https://iirose.com/messages.html
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    function inputString(str){

        var inputBox = document.getElementById("moveinput");
        var originText = inputBox.value;
        var submit = document.getElementsByClassName("moveinputSendBtn")[0];
        inputBox.value = str;
        submit.click();
        inputBox.value = originText;
    }
    console.log("start");
    var str = "🍀 欢迎新人🍃\n🔥这是一个欢快的多功能聊天室\n🔥app：https://iirose.com/app.html\n🔥点歌：@歌名（点歌在输入框输入发送）\n（我是NPC尽情探索未知的功能）";
    setInterval(function(){
        inputString(str);
    },60000);
    // Your code here...
})();
