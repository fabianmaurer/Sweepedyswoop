



let can=$('#main');
let ctx=can[0].getContext('2d');

let canP=document.createElement('canvas');
let ctxP=canP.getContext('2d');

let canL=document.createElement('canvas');
let ctxL=canL.getContext('2d');

let canS=document.createElement('canvas');
let ctxS=canS.getContext('2d');
$(canP).css('filter','blur(5px)')

ctxL.strokeStyle='#fff';
ctxP.fillStyle='#fff';
ctxP.strokeStyle='#fff';
ctxS.strokeStyle='#00BFFF';



let w=$(window).width();
let h=$(window).height();

$(window).resize(resize)
resize();
function resize(){
    $('#main').attr('width',w);
    $('#main').attr('height',h);
    $(canP).attr('width',w);
    $(canP).attr('height',h);
    $(canL).attr('width',w);
    $(canL).attr('height',h);
    $(canS).attr('width',w);
    $(canS).attr('height',h);
}


let points=[];
let hull=[];
let is=[];
let tx=0;
let ty=0;
let animProgress=0;
let polygonAnimation=false;
let stars=[];
let randomness=0;
let initialVelocityFactor = 1;

const colorGradient=[[0.2,0.2,0.8],[1,0,0],[1,1,1]];

let forceCutoff = 0.00003;
let speed = 4000;

let different=[]

const animationFrames=40;

let removed=[];
let displaySet=[];
let oldPoints=[];

let particles=[];

let particleSim=false;

let center={};

let hullDimensions={};

let sweepPos=0;

let sweepIndex=0;

let lastSweepPoint=null;

$('#main').click(function(e){
    if(!sweeping){
        
    let x=e.clientX;
    let y=e.clientY;
    addPoint(x,y)
    }
})

let sweeping=false;

$('#sweep').click(function(e){
    if(!sweeping){
        sweeping=true;
        $('#sweep').addClass('active')
        sweep();
    }
    
})

function addPoint(x,y){
    for(let p of points){
        if(p.x==x) x++;
    }
    if(points.length==0) points.push({x:x,y:y});
    else for(let i=0;i<points.length;i++){
        if(points[i].x>x){
            points.splice(i,0,{x:x,y:y})
            break;
        }
        if(i==points.length-1){
            points.push({x:x,y:y});
            break;
        }
    }
    let r1=Math.random()*0.5+1.5;
    let r2=Math.random()*0.5+0.5;
    if(stars.length==0) stars.push({x:x,y:y,r:1.5,rChange:0.015,maxR:r1,minR:r2,m:(r1*r1+r2*r2)/5})
    else for(let i=0;i<stars.length;i++){
        if(stars[i].x>x){
            stars.splice(i,0,{x:x,y:y,r:1.5,rChange:0.015,maxR:r1,minR:r2,m:(r1*r1+r2*r2)/5})
            break;
        }
        if(i==stars.length-1){
            stars.push({x:x,y:y,r:1.5,rChange:0.015,maxR:r1,minR:r2,m:(r1*r1+r2*r2)/5});
            break;
        }
    }
    // if(points.length==3){
    //     hull=giftWrapping();
    //     drawPolygon(hull);
    //     center=getCenter(hull);
    //     getHullDimensions();
    // }else if(points.length>3){
    //     let old=JSON.parse(JSON.stringify(hull));
    //     hull=giftWrapping();
    //     getHullDimensions();
    //     if(drawPolygonChange(hull,old)){
    //         addParticle(stars[stars.length-1]);
    //     };
    // }
}

function getHullDimensions(){
    let minx=Number.MAX_SAFE_INTEGER,miny=Number.MAX_SAFE_INTEGER,maxx=0,maxy=0;
    for(let p of hull){
        if(p.x<minx) minx=p.x;
        if(p.y<miny) miny=p.y;
        if(p.x>maxx) maxx=p.x;
        if(p.y>maxy) maxy=p.y;
    }
    hullDimensions={
        minx:minx-10,
        miny:miny-10,
        w:maxx-minx+20,
        h:maxy-miny+20
    }
}

function getCenter(polygon){
    x=0;
    y=0;
    for(let p of polygon){
        x+=p.x/polygon.length;
        y+=p.y/polygon.length;
    }
    return {x:x,y:y}
}

function getPerpendicularPoint(x1,y1,x2,y2,x3,y3){
    let k = ((y2-y1) * (x3-x1) - (x2-x1) * (y3-y1)) / ((y2-y1)*(y2-y1) + (x2-x1)*(x2-x1))
    x4 = x3 - k * (y2-y1)
    y4 = y3 + k * (x2-x1)
    return {x:x4,y:y4}
}


// for(let i=0;i<Math.min(arr1.length,arr2.length);i++){
//     if(arr1[i].x!=arr2[i].x) return i;
// }
// if(arr1.length!=arr2.length) return Math.min(arr1.length,arr2.length);
// else return null;


function findExtra(arr1,arr2){
    let res=[];
    for(let [i,p] of arr2.entries()){
        let found=false
        for(let p2 of arr1){
            if(p2.x==p.x){
                found=true;
                break;
            }
        }
        if(!found) res.push(i)
    }
    return res[0];
}

function findExtras(arr1,arr2){
    let res=[];
    for(let [i,p] of arr2.entries()){
        let found=false
        for(let p2 of arr1){
            if(p2.x==p.x){
                found=true;
                break;
            }
        }
        if(!found) res.push(i)
    }
    return res;
}

function sweep(){
    let old=JSON.parse(JSON.stringify(hull));
    hull=[]
    sweepPos=0;
    sweepIndex=0;
    sweepLoop()
}

function sweepDone(){
    $('#sweep').html('The line has been swopen!')
}

function sweepLoop(){
    let steps=4;
    for(let i=0;i<steps;i++){
        sweepPos++;
        if(sweepIndex<points.length){
            if(checkForCollision()){
                addSweepPoint(points[sweepIndex])
                center=getCenter(hull);
                sweepIndex++;
            }
        }
    }
    

    
    drawSweepline();
    
    if(particleSim){
        calculateMovement();
        move();
    }
    drawPoints(stars);
        ctx.drawImage(canL,0,0,w,h);
        ctx.drawImage(canP,0,0,w,h);
        ctx.drawImage(canS,0,0,w,h);
    if(sweepPos<w) requestAnimationFrame(sweepLoop)
    else sweepDone()
}

function drawSweepline(){
    ctxS.clearRect(0,0,w,h)

    ctxS.strokeStyle="#00BFFF"
    ctxS.lineWidth=2;
    ctxS.beginPath();
    ctxS.moveTo(sweepPos,0)
    ctxS.lineTo(sweepPos,h)
    ctxS.stroke();
    ctxS.closePath();
}

function checkForCollision(){
    return points[sweepIndex].x<sweepPos
}

function addSweepPoint(p){
    finishAnimation();
    let old=JSON.parse(JSON.stringify(hull))
    if(hull.length==0){
        hull.push(p)
        lastSweepPoint=0

    }else if(hull.length==1){
        hull.push(p)
        lastSweepPoint=1
        drawPolygon(hull)
    }else if(hull.length==2){
        if(getOrientation(hull[0].x,hull[0].y,hull[1].x,hull[1].y,p.x,p.y)){
            // 132
            hull.splice(1,0,p)
            lastSweepPoint=1
        }else{
            // 123
            hull.push(p)
            lastSweepPoint=2
        }
        if(drawPolygonChange(hull,old)){
            addParticle(stars[stars.length-1]);
        };
    }else{
        // first direction
        let res1=getRemovablePoints(p,lastSweepPoint,true)
        let res2=getRemovablePoints(p,lastSweepPoint,false)
        rangeMax=res1[res1.length-1]!=null?res1[res1.length-1]:lastSweepPoint;
        rangeMin=res2[res2.length-1]!=null?res2[res2.length-1]:lastSweepPoint;
        if(rangeMax-rangeMin>1){
            // points get removed/replaced
            hull.splice(rangeMin+1,rangeMax-rangeMin-1,p)
            lastSweepPoint=rangeMin+1;
        }else{
            // bonus point for hull
            if(res1.length==0){
                hull.splice(lastSweepPoint,0,p)
            }else if(res2.length==0){
                hull.splice(lastSweepPoint+1,0,p)
                lastSweepPoint++;
            }else{
                console.log('OH NEIIIIIN')
            }
        }
        
        if(drawPolygonChange(hull,old)){
            addParticle(stars[stars.length-1]);
        };
        
    }
    
}

function getRemovablePoints(p1,p2I,direction){
    
    let p2=hull[lastSweepPoint]
    let res=[]
    if(direction){
        for(let i=p2I+1;i<p2I+hull.length;i++){
            let p3=hull[i%hull.length]
            if(getOrientation(p1.x,p1.y,p2.x,p2.y,p3.x,p3.y)){
                p2=p3;
                res.push(i)   
            }else{
                return res;
            }
        }
    }else{
        for(let i=p2I-1;i>=-1;i--){
            let p3=hull[i.mod(hull.length)]
            if(!getOrientation(p1.x,p1.y,p2.x,p2.y,p3.x,p3.y)){
                p2=p3;
                res.push(i)
            }else{
                return res;
            }
        }
    }
    return res;
    
}

Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
};

function giftWrapping(){
    return wrap();
}

function getRandomXPos() {
    return Math.random() * w / 2 + (w / 4)
}

function getRandomYPos() {
    return Math.random() * h / 2 + (h / 4)
}

function drawPolygonChange(points,oldPoints){
    
    different=JSON.parse(JSON.stringify(points))
    removed=[];
    if(points>oldPoints){
        let i=findExtra(oldPoints,points);
        let target={x:points[i].x,y:points[i].y};
        
        let index1=i-1<0?i+oldPoints.length-1:i-1;
        let index2=i>=oldPoints.length?i-oldPoints.length:i;
        if(i==0 && oldPoints[1].x==points[1].x){
            index1=0
            index2=1
        }
        let start=getPerpendicularPoint(oldPoints[index1].x,oldPoints[index1].y,oldPoints[index2].x,oldPoints[index2].y,points[i].x,points[i].y);
        points[i]=start;
        polygonAnimationLoop(points,[i],target.x,target.y,0);
    }else if(oldPoints>points){
        let is=findExtras(JSON.parse(JSON.stringify(points)),JSON.parse(JSON.stringify(oldPoints)));
        for(let i of is){
            removed.push({x:oldPoints[i].x,y:oldPoints[i].y});
        }
        let target={x:points[is[0]].x,y:points[is[0]].y};
        polygonAnimationLoop(oldPoints,is,target.x,target.y,0);
    }else{
        let i=findExtra(points,oldPoints);
        let j=findExtra(oldPoints,points);
        if(i==null){
            // stars.pop();
            return true;
        }
        removed.push({x:oldPoints[i].x,y:oldPoints[i].y});
        let target={x:points[j].x,y:points[j].y};
        let start={x:oldPoints[i].x,y:oldPoints[i].y}
        points[j]=start;
        let dx=target.x-start.x;
        let dy=target.y-start.y;
        polygonAnimationLoop(points,[j],target.x,target.y,0);
    }
    for(let r of removed){
        addParticle(getStar(r.x))
    }
}

function getStar(x){
    for(let s of stars){
        if(x==s.x) return s;
    }
}

function calculateMovement() {
    let dx = 0;
    let dy = 0;
    let dsq = 0;
    let f = 0;
    let ax = 0;
    let ay = 0;
    for (let i = 0; i < particles.length; i++) {
        particles[i].f=0;
    }
    let a=0;
    for (let i = 0; i < particles.length - 1; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            
            dx = particles[i].x - particles[j].x;
            dy = particles[i].y - particles[j].y;
            dsq = Math.pow(dx, 2) + Math.pow(dy, 2);
            f = (Math.pow(particles[i].r*particles[j].r,2)/10) / dsq;
            if (f > forceCutoff) f = forceCutoff;
            d = Math.sqrt(dsq);
            ax = speed * f * dx / d;
            ay = speed * f * dy / d;
            particles[i].vx -= ax;
            particles[i].vy -= ay;
            particles[j].vx += ax;
            particles[j].vy += ay;
            
            particles[i].f+=f;
            particles[j].f+=f;
        }
    }
}

function isPointInPolygon(poly, pt){
    for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
        && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
        && (c = !c);
    return c;
}

function move() {
    if(particles.length<2) return;
    for (let i = 0; i < particles.length; i++) {
        particles[i].lastx = particles[i].x;
        particles[i].lasty = particles[i].y;
        particles[i].x += particles[i].vx;
        particles[i].y += particles[i].vy;
        
        if(!isPointInPolygon(hull,particles[i])){
            let x=center.x-100+Math.random()*200;
            let y=center.y-100+Math.random()*200;
            particles[i].x = x;
            particles[i].y = y;
            particles[i].lastx=x;
            particles[i].lasty=y;
            particles[i].lastax = 0;
            particles[i].lastay = 0;
            particles[i].vx = (randomness * (Math.random() - 0.5)) * initialVelocityFactor;
            particles[i].vy = (randomness * (Math.random() - 0.5)) * initialVelocityFactor;
        }

    }
}

function removeStar(x){
    for(let [i,s] of stars.entries()){
        if(x==s.x){
            addParticle(s);
            return;
        }
    }
}

function addParticle(p){
    speed=Math.min(6000,10000/particles.length);
    p.vx=0;
    p.vy=0;
    particles.push(p);
    if(particles.length==1){
        p.x+=p.x>center.x?-1:1;
        p.y+=p.y>center.y?-1:1;
        
        
        particleSim=true;
    }
}

displayLoop();

function finishAnimation(){
    if(polygonAnimation){
        let j=0;
        oldPoints[j].x=tx
        oldPoints[j].y=ty

        for(let i of is){
            displaySet[i].x=oldPoints[j].x
            displaySet[i].y=oldPoints[j].y
            j++;
        }
        ctxL.clearRect(0,0,w,h);
        drawPolygon(displaySet);
        animProgress=animationFrames
        polygonAnimation=false;
    }
}

function displayLoop(){
    ctx.clearRect(0,0,w,h);
    if(polygonAnimation){
        let j=0;
        for(let i of is){
            displaySet[i].x=oldPoints[j].x+(tx-displaySet[i].x)*smooth(animProgress)/animationFrames;
            displaySet[i].y=oldPoints[j].y+(ty-displaySet[i].y)*smooth(animProgress)/animationFrames;
            j++;
        }
        ctxL.clearRect(0,0,w,h);
        drawPolygon(displaySet);
        animProgress+=1;
        if(animProgress<=animationFrames){
            j=0;
            for(let i of is){
                displaySet[i]=oldPoints[j];
                j++;
            }
        }else{
            polygonAnimation=false;
        }
    }
    if(particleSim){
        calculateMovement();
        move();
    }
    drawPoints(stars);
    if(hullDimensions.minx==null){
        ctx.drawImage(canL,0,0,w,h);
        ctx.drawImage(canP,0,0,w,h);
        ctx.drawImage(canS,0,0,w,h);
    }else{
        ctx.drawImage(canL,hullDimensions.minx,hullDimensions.miny,hullDimensions.w,hullDimensions.h,hullDimensions.minx,hullDimensions.miny,hullDimensions.w,hullDimensions.h);
        ctx.drawImage(canP,hullDimensions.minx,hullDimensions.miny,hullDimensions.w,hullDimensions.h,hullDimensions.minx,hullDimensions.miny,hullDimensions.w,hullDimensions.h);
        ctx.drawImage(canS,hullDimensions.minx,hullDimensions.miny,hullDimensions.w,hullDimensions.h,hullDimensions.minx,hullDimensions.miny,hullDimensions.w,hullDimensions.h);
    }
    
    requestAnimationFrame(displayLoop);
}

function polygonAnimationLoop(points,_is,_tx,_ty,progress){

    displaySet=points;
    oldPoints=[]
    for(let i of _is){
        oldPoints.push({x:displaySet[i].x,y:displaySet[i].y});
    }
    is=_is;
    tx=_tx;
    ty=_ty;
    animProgress=progress;
    polygonAnimation=true;
}

function smooth(n){
    return (animationFrames*(1-Math.pow(1-n/animationFrames,1)));
}

function drawPoints(points){
    
   ctxP.clearRect(0,0,w,h)
//    ctxP.shadowBlur=10;
//    ctxP.shadowColor='white';
    let l=0;
    
    for(let p of points){
        if(p.vx!=null||p.vy!=null){
            let v=p.f*speed*11
            if(v<1) v=1
            ctxP.fillStyle=getColorFromGradient(1-1/v)
            // ctxP.shadowColor=getColorFromGradient(1-1/v);
            ctxP.shadowBlur=0;
        }else{
            ctxP.fillStyle='white'
               ctxP.shadowBlur=10;
   ctxP.shadowColor='white';
        }
        
        ctxP.beginPath();
        if (p.r > p.maxR || p.r < p.minR){
            p.rChange = - p.rChange;
        }
        p.r += p.rChange;
        
        ctxP.moveTo(p.x,p.y);
        ctxP.arc(p.x,p.y,p.r*2,0,2*Math.PI);
        ctxP.fill();
    ctxP.closePath();
    }
    
    
}

function drawPolygon(points){
    ctxL.strokeStyle='rgba(255,255,255,0.1)'
    ctxL.lineWidth=6
    ctxL.beginPath();
    ctxL.moveTo(points[points.length-1].x,points[points.length-1].y);
    for(let p of points){
        ctxL.lineTo(p.x,p.y);
    }
    ctxL.stroke();
    ctxL.closePath();
}

function getOrientation(x1,y1,x2,y2,x,y){
    return ((x-x1)*(y2-y1)-(y-y1)*(x2-x1))<0;
}

//colorGradient=[[0,0,0],[0,0,1],[0,1,1],[0,1,0],[1,1,0],[1,0,0]];

/**
 * 
 * @param {Number} v [0,1)
 */
function getColorFromGradient(v){
    let l=colorGradient.length;
    let pos=v*(l-1);
    let box=Math.min(l-1,Math.floor(pos));
    let d=pos%1;
    let from=colorGradient[box]
    let to=colorGradient[box+1]
    let r=Math.min(255,Math.floor((from[0]+(to[0]-from[0])*d)*256))
    let g=Math.min(255,Math.floor((from[1]+(to[1]-from[1])*d)*256))
    let b=Math.min(255,Math.floor((from[2]+(to[2]-from[2])*d)*256))
    return 'rgb('+r+','+g+','+b+')'
}