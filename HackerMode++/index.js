const canvas = document.getElementById("gamecanvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;


let player_width = 60
let player_height = 60
let homebase_width = canvas.width*0.1
let homebase_height = canvas.height*0.15
let playershoot_audio = new Audio("Audio/Player_shoot.mp3");
playershoot_audio.volume = 0.5
let attacker_audio = new Audio("Audio/attacker_shoot.mp3");
attacker_audio.volume = 0.15
let collision_audio = new Audio("Audio/bomb.mp3");
collision_audio.volume = 0.02
let laser_audio = new Audio("Audio/laser.mp3")
let missile_audio = new Audio("Audio/missile.mp3")
let timerId
let missile_exists = 0
let missile
let boss
let boss_exists = 0
let gamestart = 0
let highScore = localStorage.getItem("high-score") || 0;
let score = 0

class Player{
    constructor(){
        this.width = player_width
        this.height = player_height
        this.max = 4
        this.attackerpool = []
        this.player_health = 100;
        this.base = new Base();
        
        this.health = new HealthBar(10,10,150,20,this.base.health)
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
        this.spawn_attacker()   //attackers are spawned
    }

    spawn_attacker(){
        let c = undefined
        
        for(let i =0 ; i < this.max ; i++){ 
            c = undefined
            while(c == undefined){
                c = Math.round(Math.random() * 3) 
            }             
            let x=undefined
            let y =undefined     
            switch (c){
                case 0: //Spawns at left side of screen
                    while(x == undefined || y == undefined){
                        x = Math.random() * canvas.width * 0.2
                        y = Math.random() * canvas.height * 0.8
                    }                    
                    break 
                case 1: //Spawns at top of screen
                    while(x == undefined || y == undefined){
                        x = Math.random() * canvas.width
                        y = Math.random() * canvas.height *0.2
                    }
                    break
                case 2: //Spawns at right side of screen
                    while(x == undefined || y == undefined){
                        x = Math.random() * canvas.width*0.2 + 0.8*canvas.width
                        y = Math.random() * canvas.height * 0.8 
                    }
                    break
            }  
            if(x == undefined || y == undefined){
                i--
                continue
            }
            //Setting direction for attackers
            let p_x = this.base.x + this.base.width /2
            let p_y = this.base.y + this.base.height /2
            let mod = Math.sqrt( (x -p_x)**2  + (y-p_y)**2)
            const scaling_x = (x-p_x)/mod
            const scaling_y = (y-p_y)/mod
            let speed = 2
            this.attackerpool.push(new Attackers(this,x,y,-speed * scaling_x,-speed * scaling_y))
        }

        //Deciding if boss should spawn or not
        let g = Math.random() * 20
        g = 8
        if(g > 7 && g < 13 && boss_exists ==0){
            let b_x = Math.random() * canvas.width
            let b_y = Math.random() * canvas.height * 0.2
            let p_x = this.base.x + this.base.width /2
            let p_y = this.base.y + this.base.height /2
            let mod = Math.sqrt( (b_x -p_x)**2  + (b_y-p_y)**2)
            const scaling_x = (b_x-p_x)/mod
            const scaling_y = (b_y-p_y)/mod
            let speed = 1
            boss = new boss_attacker(this,b_x, b_y, -speed*scaling_x, -speed* scaling_y)
            boss_exists =1
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

        //Drawing boss
        if(boss_exists){
            boss.update()
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
    constructor(game,x,y,speed_x, speed_y){
        this.game = game
        this.x = x
        this.y = y
        this.speed_x = speed_x
        this.speed_y = speed_y
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
        this.x += this.speed_x
        this.y += this.speed_y
    }
}

class boss_attacker{
    constructor(game,x,y,speed_x, speed_y){
        this.health = 100
        this.progress = this.health/100
        this.game = game
        this.x = x
        this.y = y
        this.speed_x = speed_x
        this.speed_y = speed_y
        this.radius = 45
        this.extra = 55
        const img = new Image()
        img.src = './Pictures/enemy.png'
        this.image = img
    }
    draw(ctx){
        ctx.strokeStyle = 'transperant'
        ctx.beginPath()
        ctx.arc(this.x , this.y, this.radius, 0, Math.PI * 2, true)
        ctx.stroke();
        ctx.drawImage(this.image, this.x-this.radius -this.extra, this.y-this.radius-this.extra+10, 2*(this.radius+this.extra),2*(this.radius+this.extra))
        

        //Drawing its healthbar
        
        ctx.fillStyle = 'black'
        ctx.fillRect(this.x -this.radius -3, this.y+this.radius +3, 2*this.radius +6, 18)
        ctx.clearRect(this.x - this.raidus, this.y + this.radius + 5, 2*this.radius, 14)
        ctx.fillStyle = 'green'
        this.progress = this.health/100
        ctx.fillRect(this.x - this.radius, this.y + this.radius + 5, (2*this.radius)*this.progress , 14)
        
    }
    update(){
        this.draw(ctx)
        this.x += this.speed_x
        this.y += this.speed_y
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
        this.x= canvas.width*0.45
        this.y = canvas.height*0.8
        this.width = homebase_width;
        this.height = homebase_height ;
        this.health = 100;
        this.defense_radius = 3*(this.width/2)
        this.can_shoot = 1
        this.cool_time = 2
        this.cooldown_time = this.cool_time
        this.progress = this.cooldown_time/ this.cool_time
    }

    draw(){
        ctx.fillStyle = 'yellow'
        ctx.fillRect(this.x, this.y, this.width, this.height)
        ctx.fillStyle = 'green'
        ctx.fillRect(this.x , this.y +this.height +2, this.progress * this.width , 5)
    }

    shoot(attacker_x, attacker_y){
        ctx.beginPath()
        ctx.strokeStyle = 'red'
        ctx.lineWidth = 10
        ctx.moveTo(this.x + this.width/2,this.y + this.height/2)
        ctx.lineTo(attacker_x,attacker_y)
        ctx.stroke()
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


class attacker_missile{
    constructor(x,y,rotation){
        this.x = x 
        this.y = y
        this.velocity_x=0
        this.velocity_y=-1
        this.width = 40
        this.height = 40
        this.rotation = rotation
        const img = new Image()
        img.src = './Pictures/homing_missile.png'
        this.image = img
    }

    draw(){
        ctx.save()
        ctx.translate(this.x + this.width/2, this.y +this.height/2)
        ctx.rotate(this.rotation)
        ctx.translate(-this.x -this.width/2, -this.y -this.height/2)
        ctx.drawImage(this.image, this.x, this.y, this.width,this.height)
        ctx.restore()
    }

    update(p_x, p_y){
        let m_x = this.x
        let m_y = this.y
        let mod = Math.sqrt((m_x -p_x)**2 + (m_y - p_y)**2)
        const scaling_x = (m_x - p_x)/mod
        const scaling_y = (m_y - p_y)/mod
        this.velocity_x = -1 *scaling_x
        this.velocity_y = -1 *scaling_y
        this.x += this.velocity_x
        this.y += this.velocity_y
        let rot = Math.acos((m_y -p_y)/mod)
        if(p_x > m_x >  0){
            this.rotation = rot
        }else{
            this.rotation = -rot
        } 
        this.draw()
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
    
    ctx.fillStyle = 'red'
    //Displaying score

    ctx.font = "24px serif";
    ctx.fillText(`SCORE : ${score}`, 10, 55);

    //Displaying high score
    ctx.font = "24px serif";
    ctx.fillText(`HIGHSCORE : ${highScore}`, 10, 80);

    //Checking if any wave is finished
    if(player.attackerpool.length ===0){
        player.spawn_attacker()        
    }
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
                score++
                highScore = score >highScore? score:highScore;
                localStorage.setItem("high-score" , highScore); 
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
    let r = Math.random() * 3000
    let index = Math.round(Math.random() * player.attackerpool.length)
    if( r > 85 && r < 115 && player.attackerpool.length >1){        
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
        attacker_audio.currentTime =0
        attacker_audio.play()
    }


    //Checking if attacker shoots homing missile
    if(r >500 && r <505 && player.attackerpool.length >1 && missile_exists == 0){
        missile_exists = 1
        let index = Math.round(Math.random() * player.attackerpool.length)
        missile = new attacker_missile(player.attackerpool[1].x, player.attackerpool[1].y, 0)
    }
    if(missile_exists){
        missile.update(player.position.x + player.width/2, player.position.y + player.height/2)
        let p_x = player.position.x
        let p_y = player.position.y
        let  = missile
        for(let i =0 ; i < player_projectiles.length ; i++){
            let p_x =player_projectiles[i].position.x
            let p_y = player_projectiles[i].position.y
            let m_x = missile.x
            let m_y = missile.y
            if( (p_x > m_x && p_x  < m_x + missile.width) && (p_y > m_y  &&  p_y < m_y + missile.height)){
                missile.y =0
                missile.width = 0
                missile.height =0
                missile_exists =0
                player_projectiles.splice(i,1)
            }
        }


        if(missile.x > p_x && missile.x < p_x + player.width && missile.y > p_y && missile.y < p_y + player.height){
            missile_audio.currentTime = 0
            missile_audio.play()
            player.player_health -= 30
            missile.x =0
            missile.y =0
            missile.width = 0
            missile.height =0
            missile_exists =0
        }
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
        // console.log(player.base.health)
        if(Math.round(player.attackerpool[i].y + player.attackerpool[i].radius) >= Math.round(player.base.y)){
            if(Math.round(player.attackerpool[i].x+player.attackerpool[i].radius) > Math.round(player.base.x)
            && Math.round(player.attackerpool[i].x -player.attackerpool[i].radius)  < Math.round(player.base.x + player.base.width)){
                player.base.health -= 5
                player.attackerpool.splice(i,1)
            }
        }
    }

    //Base shoots back
    // player.base.shoot(player.position.x + player.width/2, player.position.y + player.height/2)
    for(let i = 0; i < player.attackerpool.length; i++){
        let a = player.attackerpool[i]
        let b = player.base
        if( ((a.x + a.radius)-(b.x + b.width/2))**2 + ((a.y +a.radius)-(b.x + b.height/2))**2 <  b.defense_radius**2 ){
            if(b.can_shoot == 1){
                b.shoot(a.x , a.y)
                laser_audio.play()
                b.can_shoot=0
                b.cooldown_time =0
                timerId = setInterval(countDown,50)
                player.attackerpool.splice(i,1)
            }
            
        }
    }
    //Checking if bullet hits boss
    
    for(let i =0 ; i < player_projectiles.length && boss_exists ; i++){
        let p_x =player_projectiles[i].position.x
        let p_y = player_projectiles[i].position.y

        if((p_y - boss.y)**2 + (p_x - boss.x)**2 - (boss.radius)**2 < 0){

            boss.health -=5
            if(boss.health <= 0){
                boss_exists =0
                score +=20
            }
            player_projectiles.splice(i,1)
            collision_audio.currentTime =0
            collision_audio.play()
        }
    }

    //Checking if boss hits home base
    if (boss.y + boss.radius > player.base.y  && boss_exists){
        boss_exists =0
        player.base.health -= 30
    }

}





function countDown(){
    player.base.cooldown_time+= 0.05; 
    player.base.progress = player.base.cooldown_time/ player.base.cool_time
    if(player.base.cooldown_time >=  player.base.cool_time){
        clearInterval(timerId);
        player.base.cooldown_time =player.base.cool_time
        player.base.can_shoot = 1
    }
}

addEventListener('keydown', ({key}) => {
    switch(key){
        case 'w':
            if( player.position.y > 50)
                player.velocity.y = -10
            break
        case 's':
            if(player.position.y + player.height< player.base.y)
                player.velocity.y = 10            
            break
        case 'a':
            if(player.position.x > 70)
                player.velocity.x = -10          
            break
        case 'd':
            if(player.position.x + player.width + 70 < canvas.width)
                player.velocity.x = 10         
            break            
        }
})

addEventListener("click", function (e) {
    if(gamestart ==0){
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



