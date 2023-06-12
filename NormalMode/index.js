http://127.0.0.1:5500/HackerMode/index.htmlconst canvas = document.getElementById("gamecanvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

let gamestart = 0
let player_width = 60
let player_height = 60
let homebase_width = canvas.width*0.8
let homebase_height = canvas.height*0.15
let score = 0;
// let highScore = localStorage.getItem("high-score") || 0;

class Player{
    constructor(){
        this.width = player_width
        this.height = player_height
        this.max = 15
        this.attackerpool = []
        this.base = new Base();
        this.health = new HealthBar(10,10,150,20,this.base.health)
        this.spawn_attacker()   //attackers are spawned
        this.position = {
            x : canvas.width/2 - this.width/2  ,
            y : canvas.height/2 - this.height/2
        }
        this.velocity = {
            x: 0,
            y: 0
        }      
        const img = new Image()
        img.src = './Pictures/tank.png'
        this.image = img

        const bg_img = new Image()
        bg_img.src = './Pictures/background.jpg'
        this.bg_img = bg_img
        

        this.rotation = 0
    }

    spawn_attacker(){
        for(let i =0 ; i < this.max ; i++){
            this.attackerpool.push(new Attackers(this))
        }
    }

    draw(){
        ctx.clearRect(0,0, canvas.width, canvas.height)
        //Setting background
        ctx.drawImage(this.bg_img,0,0, canvas.width,canvas.height)

        //Drawing the player        
        // ctx.fillStyle = "red"
        // ctx.fillRect(this.position.x, this.position.y, this.width,this.height)
        ctx.save()
        ctx.translate(player.position.x + player.width/2, player.position.y + player.height/2)
        ctx.rotate(player.rotation)
        ctx.translate(-player.position.x - player.width/2, -player.position.y - player.height/2)
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
        ctx.restore()
        
        //drawing the attackers
        this.attackerpool.forEach(attacker => {
            attacker.draw(ctx)
            attacker.update()
        });
        //drawing the base
        this.base.draw()
        //drawing the healthbar
        Health.update(this.base.health)
        //Updating score
        ctx.fillStyle='white'
        ctx.font = "25px serif";
        ctx.fillText(`SCORE: ${score}`, this.health.x+35   , this.health.y + this.health.height + 80)
        //Checking if any wave is finished
        if(this.attackerpool.length ===0){
            this.spawn_attacker()
        }
        //Cheking if health is done
        if(player.base.health <=0){
            game_over.showModal()
            cancelAnimationFrame(animation)
            setTimeout(()=>{
                location.reload();
            },1400)
        }
    }
    update(){
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        this.velocity.x =0
        this.velocity.y =0
        this.draw()
    }
}


class Attackers {
    constructor(game){
        this.game = game
        this.x = Math.random() * canvas.width * 0.75;
        this.x += 0.25/2*canvas.width
        this.y = Math.random() * canvas.height *0.1;
        this.speed = 1.3
        this.radius = 20
        this.extra = 25
        const img = new Image()
        img.src = './Pictures/enemy.png'
        this.image = img
    }

    draw(ctx){
        ctx.strokeStyle = 'transparent'
        ctx.beginPath()
        ctx.arc(this.x , this.y, this.radius, 0, Math.PI * 2, true)
        ctx.stroke();
        ctx.drawImage(this.image, this.x-this.radius -this.extra, this.y-this.radius-this.extra+2, 2*(this.radius+this.extra),2*(this.radius+this.extra))
    }

    update(){
        this.y += this.speed
    }
}

class projectile{
    constructor({position, velocity, rotation}){
        this.position = position
        this.velocity = velocity
        this.rotation = rotation;
        this.radius = 3
        const img = new Image()
        img.src = './Pictures/bullet.png'
        this.image = img
    }

    draw(){
        ctx.save()
        ctx.translate(this.position.x + this.radius, this.position.y + this.radius)
        ctx.rotate(this.rotation)
        ctx.translate(-this.position.x - this.radius, -this.position.y - this.radius)
        ctx.drawImage(this.image, this.position.x-7, this.position.y-7, 13,13)
        ctx.restore()
        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI *2)
        ctx.fillStyle = 'transparent'
        ctx.fill()
        ctx.closePath()
    }

    update(){
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Base{
    constructor(){
        this.x= canvas.width*0.1
        this.y = canvas.height*0.8
        this.width = homebase_width;
        this.height = homebase_height ;
        this.health = 100;
    }

    draw(){
        ctx.fillStyle = 'yellow'
        ctx.fillRect(this.x, this.y, this.width, this.height)
    }

}


class HealthBar{
    constructor(x,y,width,height, health){
        this.x = x
        this.y = y;
        this.width = width
        this.progress = this.width * health/100
        this.height = height
    
    }

    draw(){
        ctx.fillStyle = 'black'
        ctx.fillRect(this.x -3, this.y-3, this.width + 6, this.height + 6)
        ctx.clearRect(this.x, this.y, this.width, this.height)
        ctx.fillStyle = 'green'
        if(this.progress  < 0.4* this.width){
            ctx.fillStyle ='red'
        }
        ctx.fillRect(this.x, this.y, this.progress, this.height)
    }
    update(health){
        this.progress = this.width * health/100
        this.draw()
    }
}


const player = new Player()   //Every class is spawned in player class
const Health = new HealthBar(10,10,150,20,100)
const projectiles = []     


let animation;
function gameloop(){
    animation = requestAnimationFrame(gameloop)
    player.update()   //player is drawn
    //Checking if projectile hits Attackers
    for(let i =0 ; i < projectiles.length ; i++){
        let p_x =projectiles[i].position.x
        let p_y = projectiles[i].position.y
        for(let j =0; j < player.attackerpool.length ; j++){
            let a_x = player.attackerpool[j].x
            let a_y = player.attackerpool[j].y
            if( (p_x - a_x)**2 + (p_y - a_y)**2 - player.attackerpool[j].radius**2 < 0){
                projectiles.splice(i,1)
                player.attackerpool.splice(j,1)
                score++
            }
        }
    }
    
    //Deleting the projectiles which go out of screen, so as to preserve memory
    projectiles.forEach((projectile,index) => {                
        if(projectile.position.y + projectile.radius <= 0){
            projectiles.splice(index,1)
        }else if(projectile.position.x + projectile.radius <=0){
            projectiles.splice(index,1)
        }else if(projectile.position.x - projectile.radius >=canvas.width){
            projectiles.splice(index,1)
        }else if(projectile.position.y - projectile.radius >=canvas.height){
            projectiles.splice(index,1)
        }
        else{
            projectile.update()
        }
    })

    //If attackers hit home base
    for(let i = 0; i < player.attackerpool.length;i++){
        //  console.log(Math.round(player.attackerpool[i].y + player.attackerpool[i].radius),Math.round(player.base.y))
        if(Math.round(player.attackerpool[i].y + player.attackerpool[i].radius) >= Math.round(player.base.y)){
            player.base.health -= 5
            player.attackerpool.splice(i,1)
        }
    }
}



addEventListener('keydown', ({key}) => {
    switch(key){
        // case 'w':
        //     player.velocity.y = -10
        //     break
        // case 's':
        //     player.velocity.y = 10
        //     break
        case 'a':
            player.velocity.x = -10
            break
        case 'd':
            player.velocity.x = 10
            break
        case ' ':
            player.base.health -= 10
        }
})

addEventListener("click", function (e) {
    if(gamestart == 0){
        gamestart =1
        start_modal.close()
        gameloop()
    }
    let m_x = e.clientX
    let m_y = e.clientY
    let p_x = player.position.x
    let p_y = player.position.y
    let mod = Math.sqrt( ( m_x -p_x)**2  + (m_y-p_y)**2)
    const scaling_x = (m_x-p_x)/mod
    const scaling_y = (m_y-p_y)/mod
    let rot = Math.acos((p_y-m_y)/mod)
    if(m_x - p_x > 0){
        rot = rot
    }else{
        rot = -rot
    } 
    
    projectiles.push(new projectile({
        position:{
            x:player.position.x  + player.width /2,
            y:player.position.y + player_height/2
        },
        velocity:{
            x:7 * scaling_x,
            y:7* scaling_y
        },
        rotation : rot
    }))
})


addEventListener("mousemove" , (e) => {
    // console.log(e.clientX, e.clientY)
    let m_x = e.clientX
    let m_y = e.clientY
    let p_x = player.position.x
    let p_y = player.position.y
    let mod = Math.sqrt( ( m_x -p_x)**2  + (m_y-p_y)**2)
    let rot = Math.acos((p_y-m_y)/mod)
    
    if(m_x - p_x > 0){
        player.rotation = rot
    }else{
        player.rotation = -rot
    }    
})


start_modal.showModal()






