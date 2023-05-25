const canvas = document.getElementById("gamecanvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;


let player_width = 40
let player_height = 40
let homebase_width = 100
let homebase_height = 30


class Player{
    constructor(){
        this.width = player_width
        this.height = player_height
        this.max = 5
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
        
    }

    spawn_attacker(){
        for(let i =0 ; i < this.max ; i++){
            this.attackerpool.push(new Attackers(this))
        }
    }

    draw(){
        //Drawing the player
        ctx.clearRect(0,0, canvas.width, canvas.height)
        ctx.fillStyle = "red"
        ctx.fillRect(this.position.x, this.position.y, this.width,this.height)
        //drawing the attackers
        this.attackerpool.forEach(attacker => {
            attacker.draw(ctx)
            attacker.update()
        });
        //drawing the base
        this.base.draw()
        //drawing the healthbar
        Health.update(this.base.health)

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
        this.speed = 0.5
    }

    draw(ctx){
        ctx.strokeStyle = 'blue'
        ctx.beginPath()
        ctx.arc(this.x , this.y, 20, 0, Math.PI * 2, true)
        ctx.stroke();
    }

    update(){
        this.y += this.speed
    }
}

class projectile{
    constructor({position, velocity}){
        this.position = position
        this.velocity = velocity
        
        this.radius = 3
    }

    draw(){
        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI *2)
        ctx.fillStyle = 'orange'
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
        this.width = homebase_width;
        this.height = homebase_height ;
        this.health = 100;
    }

    draw(){
        ctx.fillStyle = 'yellow'
        ctx.fillRect(canvas.width*0.25, canvas.height*0.8, canvas.width*0.5, canvas.height*0.15)
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




const player = new Player()   //Every class is spawned in player class
const Health = new HealthBar(10,10,150,20,100)
const projectiles = []     



function gameloop(){
    requestAnimationFrame(gameloop)
    player.update()   //player is drawn


    // for(let i =0 ; i < projectiles.length ; i++){
    //     for(let j =0; j < attackerpool.length ; j++){
    //         if( i.x === )
    //     }
    // }
    
    //Deleting the projectiles which go out of screen, so as to preserve memory
    projectiles.forEach((projectile,index) => {                
        if(projectile.position.y + projectile.radius <= 0){
            projectiles.splice(index,1)
        }else{
            projectile.update()
        }
    })
}
gameloop()   //Runs the game


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
        case ' ':
            player.base.health -= 10
            console.log(player.base.health)
        }
})

addEventListener("click", function (e) {
        let slope = ((player.position.y + player_height/2) - e.clientY )/ (e.clientX - (player.position.x + player_width/2))
        projectiles.push(new projectile({
            position:{
                x:player.position.x  + player.width /2,
                y:player.position.y + player_height/2
            },
            velocity:{
                // x:5 * Math.cos( Math.atan(slope)),
                // y:-5 * Math.sin( Math.atan(slope)),
                x:0,
                y:-5
            }
        }))
})







// addEventListener("keydown", function(e) {
//     if(e.code == 'KeyD') player.velocity.x = 5
//     if(e.code == 'KeyA') player.velocity.x = -5
//     if(e.code == 'KeyS') player.velocity.y = 5
//     if(e.code == 'KeyW') player.velocity.y = -5
// })

// addEventListener("keyup", function(e) {
//     if(e.code == 'KeyD') player.velocity.x = 0
//     if(e.code == 'KeyA') player.velocity.x = 0
//     if(e.code == 'KeyS') player.velocity.y = 0
//     if(e.code == 'KeyW') player.velocity.y = 0
// })

