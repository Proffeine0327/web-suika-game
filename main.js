import { FRUITS } from "./fruits.js";

var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    World   = Matter.World,
    Body    = Matter.Body,
    Events = Matter.Events

// 엔진 선언
const engine = Engine.create();

// 레더 선언
const render = Render.create({
    engine,
    element: document.body,
    options: {
        wireframes: false,
        background: '#F7F4C8',
        width: 620,
        height: 850,
    },
});

const world = engine.world;

const leftWall = Bodies.rectangle(15, 395, 30, 790, {
    // 고정시켜주는 
    isStatic: true,
    render: {
        fillStyle: '#E6B143'
    }
});

const rightWall = Bodies.rectangle(605, 395, 30, 790, {
    // 고정시켜주는 
    isStatic: true,
    render: {
        fillStyle: '#E6B143'
    }
});

const ground = Bodies.rectangle(310, 820, 620, 60, {
    // 고정시켜주는 
    isStatic: true,
    render: {
        fillStyle: '#E6B143'
    }
});

const topLine = Bodies.rectangle(310, 150, 620, 2, {
    // 고정시켜주는 
    isStatic: true,
    isSensor: true,
    render: {
        fillStyle: '#E6B143'
    }
});

World.add(world, [leftWall, rightWall, ground, topLine]);

Render.run(render);
Runner.run(engine);

let currentBody = null;
let currentFruit = null;
let posX = 0;

function addFruit() {
    const index = Math.floor(Math.random() * 5);
    createFruit(index, {x: posX, y: 50}, true);
}

function createFruit(index, position, isPrepareDrop) {
    console.log(index);
    const fruit = FRUITS[index];

    const body = Bodies.circle(position.x, position.y, fruit.radius, {
        index: index,
        isSleeping : isPrepareDrop,
        isSensor: isPrepareDrop,
        render: {
            sprite: { texture: `${fruit.name}.png` },
        },
        //튀어오르는 강도
        restitution : 0,
    });

    if(isPrepareDrop) {
        console.log("setBody");
        currentBody = body;
        currentFruit = fruit;
    }

    World.add(world, body);
}

Events.on(engine, "collisionStart", (event) => {
    event.pairs.forEach((collision) => {
        if(collision.bodyA.index == collision.bodyB.index){
            const index = collision.bodyA.index;
            if(index == FRUITS.length - 1) return;
            World.remove(world, [collision.bodyA, collision.bodyB]);
            createFruit(index + 1, {x: collision.collision.supports[0].x, y: collision.collision.supports[0].y}, false);
        }
    });
});

addFruit();

//40~600
document.onmousemove = handleMouseMove;
function handleMouseMove(event){
    posX = clamp(event.clientX, 30 + currentFruit.radius, 590 - currentFruit.radius);

    if(currentBody != null){
        Body.setPosition(currentBody, {
            x: posX,
            y: currentBody.position.y
        })
    }
}

document.onmousedown = handleMouseDown;
function handleMouseDown(event){
    if(event.button == 0) {
        if(currentBody != null){
            currentBody.isSensor = false;
            currentBody.isSleeping = false;
            currentBody = null;
            setTimeout(() => {
                addFruit();
            }, 500);
        }
    }
}

function clamp(num, min, max){
    if(num < min)
        num = min;
    if(num > max)
        num = max;
    return num;
}