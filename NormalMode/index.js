const canvas = document.getElementById("gamecanvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;


let player_width = 40
let player_height = 40


class Player{
    constructor(){
        this.width = player_width
        this.height = player_height
        this.max = 5
        this.attackerpool = []
        this.spawn_attacker()
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
        ctx.clearRect(0,0, canvas.width, canvas.height)
        ctx.fillStyle = "red"
        ctx.fillRect(this.position.x, this.position.y, this.width,this.height)
        this.attackerpool.forEach(attacker => {
            attacker.draw(ctx)
            attacker.update()
        });

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
        this.speed = 1
    }

    draw(ctx){
        ctx.strokeStyle = 'white'
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







const player = new Player()
const projectiles = []



function gameloop(){
    requestAnimationFrame(gameloop)
    player.update() 

    projectiles.forEach((projectile,index) => {
        if(projectile.position.y + projectile.radius <= 0){
            projectiles.splice(index,1)
        }else{
            projectile.update()
        }
    })
}
gameloop()


addEventListener('keydown', ({key}) => {
    switch(key){
        case 'w':
            player.velocity.y = -5
            break
        case 's':
            player.velocity.y = 5
            break
        case 'a':
            player.velocity.x = -5
            break
        case 'd':
            player.velocity.x = 5
            break
        case ' ':
            projectiles.push(new projectile({
                position:{
                    x:player.position.x  + player.width /2,
                    y:player.position.y
                },
                velocity:{
                    x:0,
                    y:-5
                }
            }))
            break
        }
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

