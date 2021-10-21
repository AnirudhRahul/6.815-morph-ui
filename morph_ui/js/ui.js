function drawArrow(ctx, color, fromx, fromy, tox, toy){
    //variables to be used when creating the arrow
    const w = 3;
    const headlen = 6;

    var angle = Math.atan2(toy-fromy,tox-fromx);
    
    //starting path of the arrow from the start square to the end square and drawing the stroke
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.strokeStyle = color;
    ctx.lineWidth = w;
    ctx.stroke();
    
    // starting a new path from the head of the arrow to one of the sides of the point
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));
    
    //path from the side point of the arrow, to the other side point
    ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/7),toy-headlen*Math.sin(angle+Math.PI/7));
    
    //path from the side point back to the tip of the arrow, and then again to the opposite side point
    ctx.lineTo(tox, toy);
    ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

    //draws the paths created above
    ctx.strokeStyle = color;
    ctx.lineWidth = w;
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.fill();

}


var selectedColor = "#fff"

function initColorPicker(){
    for(element of document.getElementsByClassName("color-box")){
        element.addEventListener("click", function(){
            if(!this.classList.contains("color-selected")){
                for(selected of document.getElementsByClassName("color-selected"))
                    selected.classList.remove('color-selected')
                this.classList.add('color-selected');
                selectedColor = window.getComputedStyle(this).backgroundColor;
            }
        });
    }
}

function writeCppSegment(s, Px,Py,Qx,Qy, segNum) {
    s = s + ".push_back(Segment(Vec2f("+Px+", "+Py+"), Vec2f("+Qx+
    ", "+Qy+")));";
    return $("<span>", {class: "code-seg"}).text(s);
    // return s;
}

var imagewidth  = 0;
var imageheight = 0;
const image1 = new Image();
image1.onload = function() {
    imagewidth  = image1.width;
    imageheight = image1.height;
    leftCanvas.width = this.width;
    leftCanvas.height = this.height;
    leftCtx.drawImage(image1,0,0);
    
};
image1.src = path1;

const image2 = new Image();
image2.onload = function() {
    rightCanvas.width = this.width;
    rightCanvas.height = this.height;
    rightCtx.drawImage(image2,0,0);
}
image2.src = path2;

initColorPicker();

const leftCanvas = document.getElementById("left-canvas");
const leftCtx = leftCanvas.getContext("2d");
const leftStack = [image1]
const leftTable = document.getElementById("left-table")

const rightCanvas = document.getElementById("right-canvas");
const rightCtx = rightCanvas.getContext("2d");
const rightStack = [image2]

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

function drawStack(ctx, width, height, stack){
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(stack[0],0,0);
    for(let i=1;i<stack.length;i++){
        const line = stack[i]
        ctx.beginPath();
        ctx.fillStyle = line.color;
        ctx.arc(line.start.x, line.start.y, RADIUS, 0, 2*Math.PI);
        ctx.fill();

        if(line.end){
            drawArrow(ctx, line.color, line.start.x, line.start.y, line.end.x, line.end.y)
        }
    }
}
const RADIUS = 4

leftCanvas.addEventListener("mousemove", function(e){
    const stack = leftStack
    const ctx = this.getContext("2d");
    drawStack(ctx, this.width, this.height, leftStack)

    const rect = this.getBoundingClientRect();
    const pos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    ctx.fillStyle = selectedColor;

    if(stack.length==1 || stack[stack.length-1].end){
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, RADIUS, 0, 2*Math.PI);
        ctx.fill();
    }
    else{
        const last = stack[stack.length-1];
        drawArrow(ctx, last.color, last.start.x, last.start.y, pos.x, pos.y)
    }

})

leftCanvas.addEventListener("click", function(e){
    const stack = leftStack
    const rect = this.getBoundingClientRect();
    const pos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    //check if the last line input is complete
    if(stack.length==1 || stack[stack.length-1].end){
        stack.push({
            start:{
                x: pos.x,
                y: pos.y
            },
            color: selectedColor 
        })
    }
    else{
        stack[stack.length-1].end = {
            x: pos.x,
            y: pos.y
        }
        const last = stack[stack.length-1];
        addLineLog(leftTable, 'segsBefore', last.start.x, last.start.y, last.end.x, last.end.y)
    }
})

leftCanvas.addEventListener("mouseout", function(){
    const stack = leftStack
    if(!(stack.length==1 || stack[stack.length-1].end)){
        stack.splice(-1)
    }
    const ctx = this.getContext("2d");
    drawStack(ctx, this.width, this.height, leftStack)
});


function addLineLog(div, prefix, startX, startY, endX, endY){
    const p = document.createElement('p')
    p.innerText = `${prefix}.push_back(Segment(Vec2f(${startX}, ${startY}), Vec2f(${endX}, ${endY})));`
    p.innerHTML = `
        <span class="no-select remove">&#10006;</span>
    ` + p.innerHTML;
    div.appendChild(p)
}