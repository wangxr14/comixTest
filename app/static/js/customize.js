//Some default parameters
var canvasWidth = 300;
var canvasHight = 400;
var borderDist = 15;

var defaultLimit = 20
// 3 parameters controlling the different levels of elements
// gest: (neg)-2,-1,0,1,2(pos)
var defaultGest = 1;
var defaultDist = 2;
var defaultShad = 0;

var labelMessage = "ONE DAY, YOUR FRIEND HAS SOMETHING TO TELL YOU...";

var fontSize = 15;

// List of all the message pieces in the format of {mark:"A",content:"content"}
var msgTotalList = [];

function load(){
	var gestA = parseInt(document.getElementById("gestAreaA").value);
	var gestB = parseInt(document.getElementById("gestAreaB").value);
	var dist = parseFloat(document.getElementById("distArea").value);
	var shad = parseFloat(document.getElementById("shadArea").value);
	// Get message from text area
	msgTotalList = [];
	document.getElementById("textPart").innerHTML = '';
	var msgContent = document.getElementById("messageArea").value;
	var msgObject = eval('[' + msgContent + ']');
	for (i in msgObject)
	{
	    msgObject[i].content.toUpperCase();
	    msgTotalList.push(msgObject[i]);
	}
	document.getElementById("textPart").innerHTML = msgObject[msgObject.length-2].content+"<br>";
	
	render_rough(gestA,gestB,dist,shad);
	comicPosition()
}

function getMsgSplitList(msg, lengthLimit){
	var msgList = [];
	var msgSplit = msg.split(" ")
	var count = 0;
	var lineNum = 0;
	var tmpMsg = '';
	while(msgSplit[count]){
		//console.log(msgSplit[count])
		if(tmpMsg.length + msgSplit[count].length <= lengthLimit){
			tmpMsg += msgSplit[count]+' ';
		}
		else{
			msgList.push(tmpMsg);
			tmpMsg = msgSplit[count]+' ';
		}
		count+=1;
	}
	if(tmpMsg != ''){
		msgList.push(tmpMsg);
	}
	return msgList;
}		

function setBackgroundShading(rough,shad){
	var canvas = document.getElementById("comicCanvas");
	// Calculate the color
	// Input is from 0 to 3
	var colorNum = "";
	if(shad>3){
		colorNum = "3";
	}
	else if(shad<0){
		colorNum = "0";
	}
	else{
		colorNum = Math.floor(((3 - parseFloat(shad))*255/3)).toString();
	}	
	//canvas.style.backgroundColor = "rgb("+colorNum+","+colorNum+","+colorNum+")";
	var bg = rough.rectangle(0, 0, canvasWidth, canvasHight);
	bg.fillStyle="solid";
	bg.fill="rgb("+colorNum+","+colorNum+","+colorNum+")";
	bg.strokeWidth = 0;
	bg.stroke = "rgb("+colorNum+","+colorNum+","+colorNum+")";
	bg.roughness = 0;
}

function setInfoLabel(rough,x,y,message,labelFontSize = 15,limit=28){
	// Calculate label height and width	
	// todo: a little problem in the limit setting
	msgList = getMsgSplitList(message, limit);
	labelHeight = labelFontSize * msgList.length +5;
	var r1 = rough.rectangle(x, y, limit*labelFontSize/2, labelHeight,3);
	r1.roughness = 1.0;
	r1.stroke = "white";
	r1.strokeWidth = 5;
	var r2 = rough.rectangle(x, y, limit*labelFontSize/2, labelHeight,3);
	r2.roughness = 1.0;
	r2.fillStyle="solid";
	r2.fill="white";
	r2.stroke = "black";
	r2.strokeWidth = 2;

	var tmpX = x+3;
	var tmpY = y + labelFontSize;
	for (var i =0; i < msgList.length; i++){
		var tmpMsg = msgList[i];
		var msgText = rough.createText(tmpMsg,tmpX,tmpY,"15px HumorSansRegular","black");
		tmpY += labelFontSize;
	}
	tmpY -= labelFontSize;
}

function drawBubbleCurve(rough, x0, y0,len0, x1, y1, len1){
	var curve=rough.curve([[x0+len0*fontSize/2/2,y0],
						[x0+len0*fontSize/2/2+(Math.random()-0.5)*len0*fontSize/2/2,y0+(y1-y0)/3],
						[x1+len1*fontSize/2/2+(Math.random()-0.5)*len1,y0+(y1-y0)*2/3],
						[x1+len1*fontSize/2/2,y1]]);
		curve.stroke = "black";
		curve.roughness = 0.5;
}

function render_rough(gestA=defaultGest,gestB=defaultGest,dist=defaultDist, shad=defaultShad){
	// comicjs
	var rough = new RoughCanvas(document.getElementById('comicCanvas'), canvasWidth, canvasHight);
	
	// Set the shading of the canvas
	setBackgroundShading(rough,shad);
	
	// Draw the border
	
	var r1 = rough.rectangle(borderDist, borderDist, canvasWidth-borderDist*2, canvasHight-borderDist*2);
	r1.stroke = "white";
	r1.strokeWidth = 5;
	r1.roughness = 0;
	var r2 = rough.rectangle(borderDist, borderDist, canvasWidth-borderDist*2, canvasHight-borderDist*2);
	r2.roughness = 1.0;
	r2.stroke = "black";
	r2.strokeWidth = 2;
	
	// Draw the info label
	setInfoLabel(rough,10,10,labelMessage);
	
	// Draw the horizon
	var line1 = rough.line(18, 350, 275,330);
	line1.stroke = "white";
	line1.strokeWidth = 3;
	line1.roughness = 1;
	var line2 = rough.line(15, 350, 280,330);
	line2.stroke = "black";
	line2.strokeWidth = 2;
	line2.roughness = 1;
	
	// Draw the character
	// todo:how to determine the position?
	var posAX=canvasWidth/2-30-dist*20, 
		posAY=260,
		posBX=canvasWidth/2+30+dist*20,
		posBY=260;
	if(gestA == -2){
		posAY+=25
	}
	if(gestB == -2){
		posBY+=25
	}
	if(gestA == 2){
		posAY+=10
	}
	if(gestB == 2){
		posBY+=10
	}
	drawCharacter(rough,posAX,posAY,gestA,-1,"white",6);
	drawCharacter(rough,posBX,posBY,gestB,1,"white",6);
	
	drawCharacter(rough,posAX,posAY,gestA,-1,"black",2.5,0.5);
	drawCharacter(rough,posBX,posBY,gestB,1,"black",2.5,0.5);
	
	// Add message bubble
	// And draw the lines between bubbles
	// todo:put the message in one list
	var bubbleA = []
	var bubbleB = []
	var bbX = 0;
	var bbY = 50;
	var lastMark = '';
	for(var i = 0;i<msgTotalList.length;i++){
		if(lastMark == '' || lastMark == msgTotalList[i].mark){
			bbY += 20;
		}
		else{
			bbY += 0;
		}
		if(msgTotalList[i].mark=="A"){				
			bbX = posAX-30;
			var tmpBubble = drawBubble(rough,bbX,bbY,msgTotalList[i].content,
			"black","15px HumorSansRegular",(posBX-bbX)*1.8/fontSize);
			bubbleA.push(tmpBubble);
			bbY = tmpBubble.y2;
		}
		else if(msgTotalList[i].mark=="B"){
			bbX = posBX-50;
			var tmpBubble = drawBubble(rough,bbX,bbY,msgTotalList[i].content,
			"black","15px HumorSansRegular",(canvasWidth-borderDist-bbX)*1.8/fontSize);
			bubbleB.push(tmpBubble);
			bbY = tmpBubble.y2;
		}	
		lastMark = msgTotalList[i].mark; 
	}
	
	bubbleA.push({x1:posAX-10,y1:posAY-10,len1:2});
	for (var i = 0;i<bubbleA.length-1;i++){
		drawBubbleCurve(rough, bubbleA[i].x2,bubbleA[i].y2+5, bubbleA[i].len2, bubbleA[i+1].x1,bubbleA[i+1].y1-12,bubbleA[i+1].len1);
	}

	bubbleB.push({x1:posBX,y1:posBY-10,len1:2});
	for (var i = 0;i<bubbleB.length-1;i++){
		drawBubbleCurve(rough,bubbleB[i].x2,bubbleB[i].y2+5,bubbleB[i].len2,bubbleB[i+1].x1,bubbleB[i+1].y1-12,bubbleB[i+1].len1);
	}
	
	
}

function drawCharacter(rough,x,y,gest=defaultGest,ori = -1,lineColor="black",lineStroke=2,roughness=0){

	// Points for the head
	var headPointX, headPointY, headRadius;
	// bodyPointA is also the start point of the arms, bodyPointC is the start point of the legs
	var bodyPointAX,bodyPointAY, bodyPointBX,bodyPointBY, bodyPointCX,bodyPointCY;
	// Arms
	var leftArmPointAX,leftArmPointAY, leftArmPointBX,leftArmPointBY;
	var rightArmPointAX,rightArmPointAY, rightArmPointBX,rightArmPointBY;
	// Legs
	var leftLegPointAX,leftLegPointAY, leftLegPointBX,leftLegPointBY;
	var rightLegPointAX,rightLegPointAY, rightLegPointBX,rightLegPointBY;
	
	// Regular
	headRadius=16;
	switch(gest){
		case -2:
			//head
			headPointX=x; headPointY=y;
			//body
			bodyPointAX=headPointX+ori*16;bodyPointAY=headPointY+headRadius-8; 
			bodyPointBX=bodyPointAX+ori*10;bodyPointBY=bodyPointAY+15;
			bodyPointCX=bodyPointAX+ori*10;bodyPointCY=bodyPointAY+40;
			// Arms
			leftArmPointAX=bodyPointAX+ori*3;leftArmPointAY=bodyPointAY+24;
			leftArmPointBX=leftArmPointAX-ori*13;leftArmPointBY=leftArmPointAY+18;
			rightArmPointAX=bodyPointAX+ori*(-10);rightArmPointAY=bodyPointAY+20;
			rightArmPointBX=rightArmPointAX+ori*(-20);rightArmPointBY=rightArmPointAY-20;
			// Legs
			leftLegPointAX=bodyPointCX-ori*16;leftLegPointAY=bodyPointCY+20;
			leftLegPointBX=leftLegPointAX+ori*30;leftLegPointBY=leftLegPointAY+5;
			rightLegPointAX=bodyPointCX-ori*8;rightLegPointAY=bodyPointCY+16;
			rightLegPointBX=rightLegPointAX+ori*28;rightLegPointBY=rightLegPointAY+3;
			break;
		case -1:
			headPointX=x; headPointY=y; 
			//body
			bodyPointAX=headPointX+ori*12;bodyPointAY=headPointY+headRadius-4; 
			bodyPointBX=bodyPointAX+ori*8;bodyPointBY=bodyPointAY+18;
			bodyPointCX=bodyPointAX+ori*8;bodyPointCY=bodyPointAY+35;
			// Arms
			leftArmPointAX=bodyPointAX-ori*8;leftArmPointAY=bodyPointAY+18;
			leftArmPointBX=leftArmPointAX-ori*3;leftArmPointBY=leftArmPointAY+26;
			rightArmPointAX=bodyPointAX+ori*(-2);rightArmPointAY=bodyPointAY+20;
			rightArmPointBX=rightArmPointAX+ori*(-2);rightArmPointBY=rightArmPointAY+26;
			// Legs
			leftLegPointAX=bodyPointCX+ori*5;leftLegPointAY=bodyPointCY+20;
			leftLegPointBX=leftLegPointAX+ori*3;leftLegPointBY=leftLegPointAY+30;
			rightLegPointAX=bodyPointCX-ori*8;rightLegPointAY=bodyPointCY+16;
			rightLegPointBX=rightLegPointAX-ori*3;rightLegPointBY=rightLegPointAY+30;
			break;
		case 0:
			headPointX=x; headPointY=y; 
			//body
			bodyPointAX=headPointX;bodyPointAY=headPointY+headRadius; 
			bodyPointBX=bodyPointAX+ori*2;bodyPointBY=bodyPointAY+18;
			bodyPointCX=bodyPointAX+ori*2;bodyPointCY=bodyPointAY+35;
			// Arms
			leftArmPointAX=bodyPointAX-ori*5;leftArmPointAY=bodyPointAY+18;
			leftArmPointBX=leftArmPointAX-ori*18;leftArmPointBY=leftArmPointAY+10;
			rightArmPointAX=bodyPointAX+ori*10;rightArmPointAY=bodyPointAY+20;
			rightArmPointBX=rightArmPointAX+ori*3;rightArmPointBY=rightArmPointAY+22;
			// Legs
			leftLegPointAX=bodyPointCX+ori*5;leftLegPointAY=bodyPointCY+25;
			leftLegPointBX=leftLegPointAX+ori*3;leftLegPointBY=leftLegPointAY+25;
			rightLegPointAX=bodyPointCX-ori*8;rightLegPointAY=bodyPointCY+20;
			rightLegPointBX=rightLegPointAX-ori*2;rightLegPointBY=rightLegPointAY+30;
			break;
		case 1:
			headPointX=x; headPointY=y; 
			//body
			bodyPointAX=headPointX-ori*8;bodyPointAY=headPointY+headRadius-2;
			bodyPointBX=bodyPointAX-ori*3;bodyPointBY=bodyPointAY+18;
			bodyPointCX=bodyPointAX-ori*3;bodyPointCY=bodyPointAY+40;
			// Arms
			leftArmPointAX=bodyPointAX-ori*20;leftArmPointAY=bodyPointAY-5;
			leftArmPointBX=leftArmPointAX-ori*3;leftArmPointBY=leftArmPointAY-25;
			rightArmPointAX=bodyPointAX+ori*18;rightArmPointAY=bodyPointAY+18;
			rightArmPointBX=rightArmPointAX+ori*7;rightArmPointBY=rightArmPointAY+25;
			// Legs
			leftLegPointAX=bodyPointCX+ori*12;leftLegPointAY=bodyPointCY+17;
			leftLegPointBX=leftLegPointAX+ori*6;leftLegPointBY=leftLegPointAY+28;
			rightLegPointAX=bodyPointCX-ori*12;rightLegPointAY=bodyPointCY+15;
			rightLegPointBX=rightLegPointAX-ori*6;rightLegPointBY=rightLegPointAY+28;
			break;
		case 2:
		    headPointX=x; headPointY=y; 
			//body
			bodyPointAX=headPointX-ori*8;bodyPointAY=headPointY+headRadius-2;
			bodyPointBX=bodyPointAX-ori*6;bodyPointBY=bodyPointAY+20;
			bodyPointCX=bodyPointAX-ori*3;bodyPointCY=bodyPointAY+40;
			// Arms
			leftArmPointAX=bodyPointAX-ori*20;leftArmPointAY=bodyPointAY-5;
			leftArmPointBX=leftArmPointAX-ori*3;leftArmPointBY=leftArmPointAY-25;
			rightArmPointAX=bodyPointAX+ori*22;rightArmPointAY=bodyPointAY+8;
			rightArmPointBX=rightArmPointAX+ori*27;rightArmPointBY=rightArmPointAY-15;
			// Legs
			leftLegPointAX=bodyPointCX+ori*8;leftLegPointAY=bodyPointCY+25;
			leftLegPointBX=leftLegPointAX+ori*25;leftLegPointBY=leftLegPointAY+6;
			rightLegPointAX=bodyPointCX-ori*22;rightLegPointAY=bodyPointCY+10;
			rightLegPointBX=rightLegPointAX-ori*3;rightLegPointBY=rightLegPointAY+23;
			break;
		default:
			headPointX=x; headPointY=y; 
			//body
			bodyPointAX=headPointX;bodyPointAY=headPointY+headRadius; 
			bodyPointBX=bodyPointAX+ori*3;bodyPointBY=bodyPointAY+18;
			bodyPointCX=bodyPointAX+ori*3;bodyPointCY=bodyPointAY+40;
			// Arms
			leftArmPointAX=bodyPointAX-ori*3;leftArmPointAY=bodyPointAY+18;
			leftArmPointBX=leftArmPointAX-ori*3;leftArmPointBY=leftArmPointAY+25;
			rightArmPointAX=bodyPointAX+ori*7;rightArmPointAY=bodyPointAY+20;
			rightArmPointBX=rightArmPointAX+ori*7;rightArmPointBY=rightArmPointAY+25;
			// Legs
			leftLegPointAX=bodyPointCX+ori*5;leftLegPointAY=bodyPointCY+20;
			leftLegPointBX=leftLegPointAX+ori*3;leftLegPointBY=leftLegPointAY+20;
			rightLegPointAX=bodyPointCX-ori*5;rightLegPointAY=bodyPointCY+20;
			rightLegPointBX=rightLegPointAX-ori*3;rightLegPointBY=rightLegPointAY+20;
			break;
	}

	
	var head = rough.circle(headPointX, headPointY, headRadius);
	head.stroke = lineColor;
	head.strokeWidth = lineStroke;
	head.roughness = roughness;
	// Body
	var body=rough.curve([[bodyPointAX, bodyPointAY],[bodyPointBX,bodyPointBY], [bodyPointCX,bodyPointCY]]);
	body.stroke = lineColor;
	body.strokeWidth = lineStroke;
	body.roughness = roughness;
	// Arms
	var a1=rough.line(bodyPointAX, bodyPointAY,leftArmPointAX,leftArmPointAY);
	a1.stroke = lineColor;
	a1.strokeWidth = lineStroke;
	a1.roughness = roughness;
	var a2=rough.line(leftArmPointAX,leftArmPointAY,leftArmPointBX,leftArmPointBY);
	a2.stroke = lineColor;
	a2.strokeWidth = lineStroke;
	a2.roughness = roughness;
	var a3=rough.line(bodyPointAX, bodyPointAY,rightArmPointAX,rightArmPointAY);
	a3.stroke = lineColor;
	a3.strokeWidth = lineStroke;
	a3.roughness = roughness;
	var a4=rough.line(rightArmPointAX,rightArmPointAY,rightArmPointBX,rightArmPointBY);
	a4.stroke = lineColor;
	a4.strokeWidth = lineStroke;
	a4.roughness = roughness;
	// Legs
	var l1=rough.line(bodyPointCX, bodyPointCY,leftLegPointAX,leftLegPointAY);
	l1.stroke = lineColor;
	l1.strokeWidth = lineStroke;
	l1.roughness = roughness;
	var l2=rough.line(leftLegPointAX,leftLegPointAY,leftLegPointBX,leftLegPointBY);
	l2.stroke = lineColor;
	l2.strokeWidth = lineStroke;
	l2.roughness = roughness;
	var l3=rough.line(bodyPointCX, bodyPointCY,rightLegPointAX,rightLegPointAY);
	l3.stroke = lineColor;
	l3.strokeWidth = lineStroke;
	l3.roughness = roughness;
	var l4=rough.line(rightLegPointAX,rightLegPointAY,rightLegPointBX,rightLegPointBY);
	l4.stroke = lineColor;
	l4.strokeWidth = lineStroke;
	l4.roughness = roughness;
	

}

function drawBubble(rough,x,y,message,msgFontColor="black",msgFont = "15px",limit = 15){
	var x1,y1,x2,y2;
	// Set message
	// todo: a little problem in the limit setting
	var msgList = getMsgSplitList(message, limit);	

	var tmpX = x;
	var tmpY = y + fontSize;
	x1 = tmpX;
	y1 = tmpY;
	for (var i =0; i < msgList.length; i++){
		rough.createText(msgList[i],tmpX+2,tmpY,msgFont,"white");
		rough.createText(msgList[i],tmpX-2,tmpY,msgFont,"white");
		rough.createText(msgList[i],tmpX,tmpY+2,msgFont,"white");
		rough.createText(msgList[i],tmpX,tmpY-2,msgFont,"white");
		rough.createText(msgList[i],tmpX+2,tmpY+2,msgFont,"white");
		rough.createText(msgList[i],tmpX+2,tmpY-2,msgFont,"white");
		rough.createText(msgList[i],tmpX-2,tmpY+2,msgFont,"white");
		rough.createText(msgList[i],tmpX-2,tmpY-2,msgFont,"white");
		var msgText = rough.createText(msgList[i],tmpX,tmpY,msgFont,msgFontColor);
		tmpY += fontSize;
	}
	tmpY -= fontSize;
	return {x1:x1,y1:y1,len1:msgList[0].length,x2:tmpX,y2:tmpY,len2:msgList[msgList.length-1].length};
}

function switchTextComic(){
	var elem = document.getElementById("middlePart");
	elem.parentNode.insertBefore(elem,elem.parentNode.firstElementChild);
	elem.parentNode.insertBefore(elem.parentNode.lastElementChild,elem.parentNode.firstElementChild);
}

function comicPosition(){
	if(Math.random() >= 0.5)
	{
		switchTextComic()
	}
}

function saveCanvas(){
	var canvas = document.getElementById("comicCanvas");
    document.getElementById("theimage").src = canvas.toDataURL();
    //Canvas2Image.saveAsJPEG(canvas);
	var dataString = canvas.toDataURL("image/png");
	var link = document.createElement("a");
	link.download = 'image';
	link.href = dataString;
	link.click();
}
