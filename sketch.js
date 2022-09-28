$('#error').hide()

let w, h, minDimension
let earth, earthRotation
let space
let currentScale = 1
let factNumber = 1
let translateVertical, translateHorizontal

let showPlanets = true
let clearCanvas = false

let distances = []
let planets = []
let miniPlanets = []
let planetFacts = []
let sunFacts = []
let jupiterRadius = 69911 //KM
let sunRadius = 695700 //KM
let currentPlanet
let earthDimensions
let currentDimensions

class planet {
  constructor(
    name,
    colors,
    rotation,
    diameter,
    startingX,
    endingX,
    speed,
    minis,
    numberOfMinis,
  ) {
    this.name = name
    this.r = colors[0]
    this.g = colors[1]
    this.b = colors[2]
    this.x1 = startingX
    this.maxX = startingX
    this.x2 = endingX
    this.y1 = 0
    this.diameter = diameter
    this.rotation = rotation
    this.speed = speed
    this.minis = minis
    this.numberOfMinis = numberOfMinis
    this.reduction = 1

    if (this.name === "Earth") {
      earthDimensions = this
    }
  }

  checkClicked() {
    let totalDistance = dist(mouseX - w / 2, mouseY - h / 2,
      0, 0)
    if (totalDistance < this.x1 + this.diameter / 2 && totalDistance > this.x1 - this.diameter / 2) {
      hidePlanets()
      if (this.name === "Sun") {
        currentDimensions = this
        currentPlanet = sunFacts

        if (factNumber === 1) {
            populateSunFact1()
        } else if (factNumber === 2) {
            populateSunFact2()
        } else {
            populateDistanceFact()
        }
      } else {
        for (var i = 0; i < planetFacts.length; i++) {
          if (planetFacts[i].name === this.name) {
            currentPlanet = planetFacts[i]
          }
        }
      }
    }
  }

  makeMiniPlanets() {
    return new Promise((resolve, reject) => {
      for (var i = 0; i < this.numberOfMinis; i++) {
        let minX = this.x1 - this.diameter / 8
        let maxX = this.x1 + this.diameter / 4
        let size = random(this.diameter / 6 * 0.6, this.diameter / 6 * 2.5)
        let rotation = random(2 * PI)
        let speed = getSpeed()
        this.minis.push({
          "x": random(minX, maxX),
          "y": this.y1,
          "size": size,
          "rotation": rotation,
          "speed": speed
        })

        if (i === this.numberOfMinis - 1) {
          resolve(true)
        }
      }
    })
  }

  displayPlanet() {
    push()
    fill(this.r, this.g, this.b)
    rotate(this.rotation)
    circle(this.x1, this.y1, this.diameter)
    pop()
  }

  planetLoad() {
    if (this.x1 > this.x2) {
      this.x1 -= this.reduction
      this.reduction = this.reduction * 1.04
    } else {
      this.x1 = this.x2
    }

    for (var i = 0; i < this.minis.length; i++) {
      this.minis[i].x = this.x1
    }
  }

  displayRing() {
    push()
    noFill()
    stroke(this.r, this.g, this.b, 45)
    strokeWeight(this.diameter)
    circle(0, 0, 2 * this.x1);
    pop()
  }

  rotatePlanet() {
    this.rotation += this.speed
  }

  displayMinis() {
    for (var i = 0; i < this.minis.length; i++) {
      let currentMini = this.minis[i]
      push()
      noStroke()
      fill(this.r, this.g, this.b, 100)
      rotate(currentMini.rotation)
      circle(currentMini.x, currentMini.y, currentMini.size)
      pop()
      currentMini.rotation += currentMini.speed
    }
  }

  planetHide() {
    if (this.x1 < this.maxX) {
      this.x1 += this.x1 * 0.01
      for (var i = 0; i < this.minis.length; i++) {
        this.minis[i].x = this.x1
      }
    } else {
      clearCanvas = true
    }
  }
}

function getSpeed() {
  return Math.random() / 100
}

function returnVolume(radius) {
  return 4 * PI * radius * radius * radius / 3
}

function gatherBasicPlanetInfo() {
  getPlanetData(planets)
    .then((response) => {
      planetFacts = response
      getSunData()
    })
}

function setup() {
  createCanvas(windowWidth, windowHeight)
  translateVertical = windowHeight / 2
  translateHorizontal = windowWidth / 2
  w = windowWidth
  h = windowHeight
  minDimension = Math.min(w, h) / 1.25
  background(0)
  noStroke()
  setPlanets(true)
}

function draw() {
  clear()
  translate(translateHorizontal, translateVertical)
  scale(currentScale)
  if (clearCanvas) {
  	if (factNumber === 1) {
    	populateSunFact1()
     } else if (factNumber === 2) {
     	populateSunFact2()
     } else {
      populateDistanceFact()
     }
  } else {
    if (showPlanets) {
      createPlanets()
    } else {
      destroyPlanets()
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  w = windowWidth
  h = windowHeight
  minDimension = Math.min(w, h) / 1.25

  translateHorizontal = w / 2
  translateVertical = h / 2

  if (showPlanets) {
    setPlanets(true)
  }
  
  if (currentPlanet.name === "Sun") {
    if (factNumber === 1) {
      populateSunFact1()
    } else {
      populateSunFact2()
    }
  }
}

function setPlanets(showStatus) {
  distances = []
  planets = []

  earth = minDimension / 31
  space = minDimension / 55
  earthRotation = 2 * PI / 365

  distances.push(earth * 2 + earth * 0.2 + space)
  distances.push(distances[0] + earth * 0.2 + earth * 0.95 / 2 + space)
  distances.push(distances[1] + earth * 0.95 / 2 + earth / 2 + space)
  distances.push(distances[2] + earth / 2 + earth / 4 + space)
  distances.push(distances[3] + earth / 4 + earth + space)
  distances.push(distances[4] + earth + earth * 1.9 / 2 + space)
  distances.push(distances[5] + earth * 1.9 / 2 + earth * 0.8 / 2 + space / 2)
  distances.push(distances[6] + earth * 0.8 / 2 + earth * 0.8 / 2)

  buildPlanets()
    .then((response) => {
      $("#zoomIn").show()
      $("#zoomOut").show()
      $("#moveButtons").show()
      gatherBasicPlanetInfo()
      showPlanets = showStatus
    })
}

function hidePlanets() {
  showPlanets = false
  translateVertical = h / 2
  translateHorizontal = w / 2
  $("#zoomIn").hide()
  $("#zoomOut").hide()
  $("#moveButtons").hide()
}

function buildPlanets() {
  return new Promise((resolve, reject) => {
    planets.push(
      new planet(
        "Sun",
        [255, 198, 45],
        0,
        earth * 4,
        0,
        0,
        0,
        [],
        0
      ),
      new planet(
        "Mercury",
        [229, 206, 155],
        0,
        earth * 0.4,
        distances[0] + w / 5,
        distances[0],
        earthRotation * 365 / 88,
        [],
        20
      ),
      new planet(
        "Venus",
        [255, 184, 166],
        0,
        earth * 0.95,
        distances[1] + w / 5,
        distances[1],
        earthRotation * 365 / 225,
        [],
        40
      ),
      new planet(
        "Earth",
        [116, 191, 210],
        0,
        earth,
        distances[2] + w / 5,
        distances[2],
        earthRotation,
        [],
        60
      ),
      new planet(
        "Mars",
        [255, 125, 74],
        0,
        earth / 2,
        distances[3] + w / 5,
        distances[3],
        earthRotation * 365 / 687,
        [],
        80
      ),
      new planet(
        "Jupiter",
        [255, 169, 158],
        0,
        earth * 2,
        distances[4] + w / 5,
        distances[4],
        earthRotation / 12,
        [],
        100
      ),
      new planet(
        "Saturn",
        [250, 212, 131],
        0,
        earth * 1.9,
        distances[5] + w / 5,
        distances[5],
        earthRotation / 29,
        [],
        120
      ),
      new planet(
        "Uranus",
        [146, 232, 243],
        0,
        earth * 0.4,
        distances[6] + w / 5,
        distances[6],
        earthRotation / 84,
        [],
        140
      ),
      new planet(
        "Neptune",
        [132, 187, 217],
        0,
        earth * 0.4,
        distances[7] + w / 5,
        distances[7],
        earthRotation / 165,
        [],
        160
      )
    )

    for (var i = 1; i < planets.length; i++) {
      planets[i].makeMiniPlanets()
      if (i === planets.length - 1) {
        resolve(true)
      }
    }
  })
}

function createPlanets() {
  for (var i = 0; i < planets.length; i++) {
    planets[i].displayPlanet()
    if (i > 0) {
      planets[i].planetLoad()
      planets[i].displayRing()
      planets[i].rotatePlanet()
      planets[i].displayMinis()
    }
  }
}

function destroyPlanets() {
  for (var i = 0; i < planets.length; i++) {
    planets[i].displayPlanet()
    if (i > 0) {
      planets[i].planetHide()
      planets[i].displayRing()
      planets[i].rotatePlanet()
      planets[i].displayMinis()
    }
  }
}

function startZoomIn() {
  zoomIn(currentScale * 1.25)
}

function startZoomOut() {
  zoomOut(currentScale / 1.25)
}

function startMoveUp() {
  moveUp(translateVertical * 1.1)
}

function startMoveDown() {
  moveDown(translateVertical / 1.1)
}

function startMoveLeft() {
  moveLeft(translateHorizontal * 1.05)
}

function startMoveRight() {
  moveRight(translateHorizontal / 1.05)
}

function reCenter() {
  translateVertical = windowHeight / 2
  translateHorizontal = windowWidth / 2
}

function zoomIn(nextScale) {
  if (currentScale < nextScale) {
    currentScale = currentScale * 1.02
    setTimeout(() => {
      zoomIn(nextScale)
    }, 25)
  } else {
    currentScale = nextScale
  }
}

function zoomOut(nextScale) {
  if (currentScale > nextScale) {
    currentScale = currentScale / 1.02
    setTimeout(() => {
      zoomOut(nextScale)
    }, 25)
  } else {
    currentScale = nextScale
  }
}

function moveUp(nextMove) {
  if (translateVertical < nextMove) {
    translateVertical = translateVertical * 1.01
    setTimeout(() => {
      moveUp(nextMove)
    }, 25)
  } else {
    translateVertical = nextMove
  }
}

function moveDown(nextMove) {
  if (translateVertical > nextMove) {
    translateVertical = translateVertical / 1.01
    setTimeout(() => {
      moveDown(nextMove)
    }, 25)
  } else {
    translateVertical = nextMove
  }
}

function moveLeft(nextMove) {
  if (translateHorizontal < nextMove) {
    translateHorizontal = translateHorizontal * 1.005
    setTimeout(() => {
      moveLeft(nextMove)
    }, 25)
  } else {
    translateHorizontal = nextMove
  }
}

function moveRight(nextMove) {
  if (translateHorizontal > nextMove) {
    translateHorizontal = translateHorizontal / 1.005
    setTimeout(() => {
      moveRight(nextMove)
    }, 25)
  } else {
    translateHorizontal = nextMove
  }
}

function mousePressed() {
  for (var i = 0; i < planets.length; i++) {
    planets[i].checkClicked()
  }
}

function getSunData() {
  return new Promise((resolve, reject) => {
    let url = "https://api.api-ninjas.com/v1/stars?name="
    retrieveData(url, "Sun")
      .then((response) => {
        sunFacts = response

      })
  })
}

function getPlanetData(array) {
  return new Promise((resolve, reject) => {
    let url = "https://api.api-ninjas.com/v1/planets?name="
    let promises = []
    for (var i = 1; i < array.length; i++) {
      promises.push(retrieveData(url, array[i].name))
      if (i === array.length - 1) {
        Promise.all(promises)
          .then((facts) => {
            resolve(facts)
          })
          .catch((err) => {
            resolve(err)
          })
      }
    }
  })
}

function retrieveData(url, name) {
  let fullURL = url + name
  return new Promise((resolve, reject) => {
    fetch(url + name, {
        method: 'GET',
        headers: {
          'X-Api-Key': 'wFaDIKjGR6wMRkiiN1Wngw==G3YW3kgHxOfI1LYl'
        },
        contentType: 'application/json',
      })
      .then((response) => {
        if (response.ok) {
          response.json()
            .then((data) => {
              resolve(data[0])
            })
        } else {
          $('#error').show()
          reject("Error")
        }
      })
  })
}

function populateSunFact1() {
  if (currentPlanet.name === "Sun") {
    let sizeFactor = planetFacts[2].radius * jupiterRadius / sunRadius
    push()
    translate(w / 4, 0)
    fill(currentDimensions.r, currentDimensions.g, currentDimensions.b)
    circle(0, 0, h * 0.85)
    pop()

    push()
    translate(w / 4, 0)
    strokeWeight(1)
    stroke(255)
    fill(earthDimensions.r, earthDimensions.g, earthDimensions.b)
    circle(0, 0, h * 0.85 * sizeFactor)
    pop()
  }
}

let sunCircle = 0.85

function populateSunFact2() {
  if (currentPlanet.name === "Sun") {
    push()
    translate(w/2, h/2)
    fill(currentDimensions.r, currentDimensions.g, currentDimensions.b)
    circle(0, 0, w * 0.85)
    pop()

    push()
    translate(w/2, h/2)
    fill(currentDimensions.r, currentDimensions.g, currentDimensions.b, 1000 * (1-sunCircle))
    circle(0, 0, w * sunCircle)
    pop()

    if (sunCircle < 1) {
      sunCircle+=0.001
    } else {
      sunCircle = 0.85
    }
  }
}

let shipLocation = 0

function populateDistanceFact () {
  let earthSize = w/32
  let shipSize = w/128

  push()
  translate(w/32 + w/64, 0)
  fill(earthDimensions.r, earthDimensions.g, earthDimensions.b)
  circle(0, 0, earthSize)
  pop()

  if (currentPlanet.name === "Sun") {
    let sunSize = earthSize * 4
    
    push()
    translate(w/2 - w/32 - sunSize/2, 0)
    fill(currentDimensions.r, currentDimensions.g, currentDimensions.b)
    circle(0, 0, sunSize)
    pop()

    push()
    translate(w/16, 0)
    fill(247, 55, 24, 100)
    circle(shipLocation - shipSize * 0.75, 0, shipSize/1.5)
    fill(192, 192, 192)
    circle(shipLocation, 0, shipSize)
    pop()
    
    if (shipLocation < w/2 - w/32 - sunSize - sunSize/2) {
      shipLocation+=0.5
    } else {
      shipLocation=0
    }

  } else {

  }
}
