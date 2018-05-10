/*
     * Author : Abhi Nandan
     * Date : 10-05-2018
     * 
     * Purpose : Evaluating flight path for rectangular area by workspace sampling
     * 
     * Length of 1 degree of Longitude = cosine (latitude) * length of degree (miles) at equator
     * 1° Longitude = cos (33.1519) * 69.172 mi = 57.912 miles
     * 10 meter along latitude (X axis) : 0.0000898 degree
     * 
     * Degrees of Latitude vary from polar flattening, but only by 0.7 miles (1.13 km).
     * length of 1° of latitude = 1° * 69.172 miles = 69.172 miles 
     * 10 meter along longitude (Y axis) : 0.0000904 degree
     * 
     * source: https://www.colorado.edu/geography/gcraft/warmup/aquifer/html/distance.html
     * 
     * Formulae to evaluate width & length of FOV : 
     *                 W = 2*h*tan(a/2)
     *                 L = 2*h*tan(b/2)
     * where h : flight altitude
     *       a : vartical degree of camera
     *       b : horizontal degree of camera
     * 
     *       ------------------------------------ (Top Right coordinate)
     *       |                                  |
     *       |                                  |
     *       |                                  |
     *       |                                  |
     *       ------------------------------------
     *(Bottom Left coordinate)
     *
     * Navigation path as evaluated
     *       ---------------------------------------- (Top Right coordinate)
     *       |___16___|___15____|___14____|____13___|
     *       |___9____|___10____|___11____|___12____|
     *       |___8____|____7____|____6____|____5____|
     *       |___1____|___2_____|____3____|____4____|
     *       ----------------------------------------
     *(Bottom Left coordinate)
    */

var http = require('http');
http.createServer(function(req,res){

    //var coordinates = "{\"LeftBottom\": {\"X\":0,\"Y\":0},\"RightTop\":{\"X\":80,\"Y\":50}}";
    var coordinates = "{\"LeftBottom\": {\"X\":6.54853888889,\"Y\":46.5196583333},\"RightTop\":{\"X\":6.55609166667,\"Y\":46.5243833333}}";
    var obj = JSON.parse(coordinates);

    //calculating width & length of FOV
    var verticalDegree = 0.523599; //30°
    var horizontalDegree = 1.0472; //60°
    var flightHeight = 30.48; //100 feet in metre

    console.log("vertical degree of camera : "+ verticalDegree + "\n");
    console.log("horizontal degree of camera : "+ horizontalDegree + "\n");
    console.log("Flight altitude : "+ flightHeight + "\n");

    console.log("tan(a/2) : " + Math.tan(verticalDegree/2) + "\n");

    //FOV width and length in metres
    var fovWidth = (2*flightHeight*Math.tan(verticalDegree/2));
    var fovLength = (2*flightHeight*Math.tan(horizontalDegree/2));

    //convert to degree
    var fovWidthDegree = ((0.0000904)*fovWidth)/10; //calculated from the formulae above -> along latitude
    var fovLengthDegree = ((0.0000898)*fovLength)/10; //calculated from the formulae above -> along longitude

    console.log("FOV Width : "+ fovWidth + "\n");
    console.log("FOV Length : "+ fovLength + "\n");

    console.log("FOV Width in Degree : "+ fovWidthDegree + "\n");
    console.log("FOV Length in Degree : "+ fovLengthDegree + "\n");

    /*var gridLength = 2;
    var gridWidth = 1;*/
    
    var strOut = evaluatePath(parseFloat(obj.LeftBottom.X),parseFloat(obj.LeftBottom.Y),parseFloat(obj.RightTop.X),parseFloat(obj.RightTop.Y), fovLengthDegree,fovWidthDegree);

    res.writeHead(200, '{Content-Type : text/html}');
        res.write("Navigation as: " + strOut);
        res.end();
}).listen(8080);

function evaluatePath(leftBottomX, leftBottomY, rightTopX, rightTopY, lengthGrid, widthGrid){
    console.log(leftBottomX +  ", " + rightTopX);
    var consoleOut = "";

    //initiate current coordinate - start from left bottom
    var currentX = leftBottomX;
    var currentY = leftBottomY;

    //set direction ---> 1 when forward, -1 when backward
    var direction = 1;

    //loop till the top grid
    while(currentY<rightTopY){
        //when in forward direction
        if(direction>0){
            for(var axisX = leftBottomX; axisX<rightTopX;axisX+=lengthGrid){
                //calculate mid point of diagonal
                var pointX = (2*axisX + lengthGrid)/2;
                var pointY = (2*currentY + widthGrid)/2;
                consoleOut+="("+pointX+", "+pointY+"), ";
                //console.log("("+pointX+", "+pointY+")\n");
            }
        }else{
            //when in backward direction
            for(var axisX = rightTopX; axisX>leftBottomX;axisX-=lengthGrid){
                var pointX = (2*axisX - lengthGrid)/2;
                var pointY = (2*currentY + widthGrid)/2;
                consoleOut+="("+pointX+", "+pointY+"), ";
                //console.log("("+pointX+", "+pointY+")\n");
            }
        }
        //change direction
        direction*=-1;
        //go to next column
        currentY+=widthGrid;
    }
    return consoleOut;
}