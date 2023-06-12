const canvas = document.getElementById("gamecanvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;


let player_width = 60
let player_height = 60
let homebase_width = canvas.width*0.8
let homebase_height = canvas.height*0.15
let powerup_exist = 0
let gamestart =0
let power_x, power_y
let playershoot_audio = new Audio("Audio/Player_shoot.mp3");
playershoot_audio.volume = 0.5
let attacker_audio = new Audio("Audio/attacker_shoot.mp3");
attacker_audio.volume = 0.3
let collision_audio = new Audio("Audio/bomb.mp3");
collision_audio.volume = 0.05

class Player{
    constructor(){
        this.width = player_width
        this.height = player_height
        this.max = 5
        this.attackerpool = []
        this.player_health = 100;
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
        //Drawing player health
        player_Health.update(this.player_health)
        //drawing the healthbar
        Health.update(this.base.health)
        //Checking if any wave is finished
        if(this.attackerpool.length ===0){
            this.spawn_attacker()
        }
        //Cheking if health is done
        if(player.base.health <= 0){
            game_over.showModal()
            cancelAnimationFrame(animation)
            setTimeout(()=>{
                location.reload();
            },1400)
        }
        if(player.player_health <= 0){
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
        this.extra = 23
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

class player_projectile{
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
        ctx.fillRect(this.x, this.y, this.progress, this.height)
    }
    update(health){
        this.progress = this.width * health/100
        this.draw()
    }
}

class player_HealthBar{
    constructor(x,y,width,height, health){
        this.x = x
        this.y = y;
        this.width = width
        this.progress = this.width * health/100
        this.height = height
    
    }

    draw(){
        ctx.fillStyle = 'black'
        ctx.fillRect(this.x -3, this.y+player.height+3, this.width + 6, this.height + 6)
        ctx.clearRect(this.x, this.y+player.height+6, this.width, this.height)
        ctx.fillStyle = 'green'
        ctx.fillRect(this.x, this.y+player.height+6, this.progress, this.height)
    }
    update(health){
        this.x = player.position.x
        this.y = player.position.y
        this.progress = this.width * health/100
        this.draw()
    }
}


class attacker_projectile{
    constructor({position, velocity, rotation}){
        this.position = position
        this.velocity = velocity
        this.rotation = rotation;
        this.radius = 3
        const img = new Image()
        img.src = './Pictures/enemy_bullet.png'
        this.image = img
    }
    draw(){
        ctx.save()
        // ctx.translate(this.position.x + this.radius, this.position.y + this.radius)
        // ctx.rotate(this.rotation)
        // ctx.translate(-this.position.x - this.radius, -this.position.y - this.radius)
        // ctx.drawImage(this.image, this.position.x-7, this.position.y-7, 13,13)
        ctx.restore()
        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI *2)
        ctx.fillStyle = 'red'
        ctx.fill()
        ctx.closePath()
    }

    update(){
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

const player = new Player()   //Every class is spawned in player class
const Health = new HealthBar(10,10,150,20,100)
const player_Health = new player_HealthBar(player.position.x, player.position.y,player.width,10,player.player_health)
const player_projectiles = [] 
const attacker_projectiles = []    


let animation;
function gameloop(){
    animation = requestAnimationFrame(gameloop)
    player.update()   //player is drawn
    
    //Checking if projectile hits Attackers
    for(let i =0 ; i < player_projectiles.length ; i++){
        let p_x =player_projectiles[i].position.x
        let p_y = player_projectiles[i].position.y
        for(let j =0; j < player.attackerpool.length ; j++){
            let a_x = player.attackerpool[j].x
            let a_y = player.attackerpool[j].y
            if( (p_x - a_x)**2 + (p_y - a_y)**2 - player.attackerpool[j].radius**2 < 0){
                player_projectiles.splice(i,1)
                player.attackerpool.splice(j,1)
                collision_audio.currentTime =0
                collision_audio.play()
            }
        }
    }
    
    //Deleting the projectiles which go out of screen, so as to preserve memory
    player_projectiles.forEach((player_projectile,index) => {                
        if(player_projectile.position.y + player_projectile.radius <= 0){
            player_projectiles.splice(index,1)
        }else if(player_projectile.position.x + player_projectile.radius <=0){
            player_projectiles.splice(index,1)
        }else if(player_projectile.position.x - player_projectile.radius >=canvas.width){
            player_projectiles.splice(index,1)
        }else if(player_projectile.position.y - player_projectile.radius >=canvas.height){
            player_projectiles.splice(index,1)
        }
        else{
            player_projectile.update()
        }
    })

    //Checking attacker's projectiles
    attacker_projectiles.forEach((attacker_projectile,index) => {                
        if(attacker_projectile.position.y + attacker_projectile.radius <= 0){
            attacker_projectiles.splice(index,1)
        }else if(attacker_projectile.position.x + attacker_projectile.radius <=0){
            attacker_projectiles.splice(index,1)
        }else if(attacker_projectile.position.x - attacker_projectile.radius >=canvas.width){
            attacker_projectiles.splice(index,1)
        }else if(attacker_projectile.position.y - attacker_projectile.radius >=canvas.height){
            attacker_projectiles.splice(index,1)
        }
        else{
            attacker_projectile.update()
        }
    })


    //Checking if attacker shoots or not
    let r = Math.random() * 300
    let index = Math.round(Math.random() * player.attackerpool.length)
    if( r > 8 && r < 12 && player.attackerpool.length != index){        
        let b_x = player.attackerpool[index].x
        let b_y = player.attackerpool[index].y
        let p_x = player.position.x + player.width/2
        let p_y = player.position.y + player.height/2
        let mod = Math.sqrt( ( b_x -p_x)**2  + (b_y-p_y)**2)
        const scaling_x = (b_x-p_x)/mod
        const scaling_y = (b_y-p_y)/mod
        attacker_projectiles.push(new attacker_projectile({
            position:{
                x:player.attackerpool[index].x ,
                y:player.attackerpool[index].y
            },
            velocity:{
                x:-3 * scaling_x,
                y:-3 * scaling_y
            },
            rotation : 0
        }))
        collision_audio.currentTime = 0
        attacker_audio.play()
    }

    //Checking if attacker's projectile hits player
    for(let i =0 ; i < attacker_projectiles.length ; i++){
        let p_x = player.position.x
        let p_y = player.position.y
        let a = attacker_projectiles[i]
        if( a.position.x > p_x && a.position.x < p_x + player.width && a.position.y > p_y && a.position.y < p_y + player.height){
            attacker_projectiles.splice(i,1)
            player.player_health -=10
            collision_audio.currentTime =0
            collision_audio.play()
        }
    }

    //If attackers hit home base
    for(let i = 0; i < player.attackerpool.length;i++){
        //  console.log(Math.round(player.attackerpool[i].y + player.attackerpool[i].radius),Math.round(player.base.y))
        if(Math.round(player.attackerpool[i].y + player.attackerpool[i].radius) >= Math.round(player.base.y)){
            player.base.health -= 5
            player.attackerpool.splice(i,1)
        }
    }

    //Check if powerup is spawned or not
    if(powerup_exist == 0){
        d = Math.random() * 1000
    }    
    if(d > 8 && d < 11 && powerup_exist == 0){
        d = Math.round(Math.random() * 2)
        spawn_powerup(Math.round(d))
    }
    
    if(powerup_exist ==1){
        spawn_powerup(Math.round(d))
    }
    for(let i =0 ; i < player_projectiles.length ; i++){
        let p_x =player_projectiles[i].position.x
        let p_y = player_projectiles[i].position.y
        if(p_x > power_x && p_x < power_x +45){
            if(p_y > power_y && p_y < power_y + 45){
                
                if(d==0){
                    player.base.health += 30
                    player.player_health +=30
                    if(player.base.health > 100){
                        player.base.health = 100
                    }
                    if(player.player_health > 100)
                        player.player_health = 100
                }
                else if(d==1){
                    let remove = Math.round(Math.random() * player.attackerpool.length)
                    while(remove){
                        player.attackerpool.pop()
                        remove--
                    } 
                }
                powerup_exist =0
            }
        }
    }

    
}



function spawn_powerup(d){
    const img = new Image()
    if(powerup_exist == 0){
        power_x = Math.random() * canvas.width* 0.8  + 0.1*canvas.width
        power_y = Math.random() * canvas.height* 0.7
    }
    if(d ==0 ){ // health
        img.src = './Pictures/Heart.png'
    }else if(d==1){
        img.src = './Pictures/kill.png'
    }else{
        powerup_exist =0
        return
    }
    ctx.drawImage(img, power_x, power_y, 45, 45)
    powerup_exist =1
    
}

addEventListener('keydown', ({key}) => {
    switch(key){
        case 'w':
            player.velocity.y = -10
            break
        case 's':
            player.velocity.y = 10
            break
        case 'a':
            player.velocity.x = -10
            break
        case 'd':
            player.velocity.x = 10
            break            
        }
})

addEventListener("click", function (e) {
    if(gamestart == 0){
        gamestart = 1
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
    
    player_projectiles.push(new player_projectile({
        position:{
            x:player.position.x  + player.width /2,
            y:player.position.y + player_height/2
        },
        velocity:{
            x:5 * scaling_x,
            y:5* scaling_y
        },
        rotation : rot
    }))
    playershoot_audio.currentTime = 0
    playershoot_audio.play()
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


