var Line = function(points){
    var len = points.length;
    this.get = function(t){
        var rate = len*t;
        var idx = Math.floor(rate);
        var r = rate - idx;
        //ok, now interpolate between idx and idx + 1
        //linear interpolation for now because bicubic is annoying
        return points[idx]*(1-r)+points[idx+1]*r;
    }
};

var complexMul = function(c1,c2){
    return [c1[0]*c2[0]-c1[1]*c2[1], c1[0]*c2[1]+c1[1]*c2[0]];
};

var complexToExponential = function(c){//converts complex numbers into exponential form
    var magn = Math.sqrt(c[0]*c[0]+c[1]*c[1]);
    var angle = Math.atan2(c[0],c[1]);
    return [magn,angle];
};

var complexEqual = function(c1,c2){
    if(c1[0] === c2[0] && c1[1] === c2[1]){
        return true;
    }
    return false;
};


var generateFourier = function(points,degree){
    //now interpolate the points
    var line = new Line(points);
    var ds = -degree;
    var de = degree;
    //steps is the steps for the number of numerical integration
    var steps = 1000;
    var cs = [];
    
    for(var n = ds; n < de+1; n++){//positive and negative, nicely symmetrical
        var csum = [0,0];//complex sum of the steps
        for(var j = 0; j < steps; j++){
            var t = j/steps;
            var coeffAngle = -2*n*t*Math.pi;//not gonna derive pi this time lol
            var coefficient = [Math.cos(coeffAngle),Math.sin(coeffAngle)];
            var lt = line.get(t);
            //then now multiply lt with coefficent, and then add to the summation
            var muled = complexMul(coefficient,lt);
            //then now incrementing the csum
            csum[0] += muled[0];
            csum[1] += muled[1];
        }
        var cn = [csum[0]/steps,csum[0]/steps];
        cs[n-ds] = complexToExponential(cn);
    }
    return cs;
};



var canvas = document.getElementById("canvas");
var width = 500;
var height = 500;
canvas.width = width;
canvas.height = height;
var ctx = canvas.getContext("2d");


var drawPoints = function(points){
    ctx.clearRect(0,0,width,height);
    ctx.beginPath();
    for(var i = 0; i < points.length; i++){
        ctx.lineTo(points[0],points[1]);
    }
    
}


var main = function(){
    var points = [];
    
    var down = false;
    var initiateDrawing = function(){
        
    }
    
    
    var handleMouseMove = function(e){
        //register the mouse movement and draw stuff on the screen
        if(!down)return false;
        points.push([e.clientX+window.scrollX-this.offsetLeft,e.clientY+window.scrollY+this.offsetTop]);
        drawPoints(points);
    };
    
    var handleMouseDown = function(e){
        down = true;
        points.push([e.clientX+window.scrollX-this.offsetLeft,e.clientY+window.scrollY+this.offsetTop]);
        var current = points.pop();
        var last = points.pop();
        if(complexEqual(current,last)){
            points.push(last);
        }else{
            points.push(last);
            points.push(current);
        }
    };
    
    var handleMouseUp = function(e){
        if(!down)return false;
        down = false;
        canvas.removeEventListener("mousemove",handleMouseMove);
        canvas.removeEventListener("mousedown",handleMouseDown);
        document.body.removeEventListener("mouseup",handleMouseDown);
        //now things are ready
        var degree = 10;
        var sequence = generateFourier(points,degree);//approximate to the 10th degree
        
        var animate = function(){
            
        }
        
    };
    
    canvas.addEventListener("mousemove",handleMouseMove);
    canvas.addEventListener("mousedown",handleMouseDown);
    document.body.addEventListener("mouseup",handleMouseUp);
    
}

main();
