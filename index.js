module.exports = physical

var aabb = require('aabb-3d')
  , THREE = require('three')

function physical(avatar, collidables, dimensions, terminal) {
  return new Physical(avatar, collidables, dimensions, terminal)
}

function Physical(avatar, collidables, dimensions, terminal) {
  this.avatar = avatar
  this.terminal = terminal || new THREE.Vector3(30, 5.6, 30)
  this.dimensions = dimensions= dimensions || new THREE.Vector3(1, 1, 1)
  this._aabb = aabb([0, 0, 0], [dimensions.x, dimensions.y, dimensions.z])
  this.resting = {x: false, y: false, z: false}
  this.collidables = collidables

  this.forces = new THREE.Vector3(0, 0, 0)
  this.acceleration = new THREE.Vector3(0, 0, 0)
  this.velocity = new THREE.Vector3(0, 0, 0)
}

var cons = Physical
  , proto = cons.prototype
  , axes = ['x', 'y', 'z']
  , abs = Math.abs

// make these *once*, so we're not generating
// garbage for every object in the game.
var WORLD_DESIRED = new THREE.Vector3(0, 0, 0)
  , DESIRED = new THREE.Vector3(0, 0, 0)
  , INVQUAT = new THREE.Quaternion(0, 0, 0, 0)
  , START = new THREE.Vector3(0, 0, 0)
  , END = new THREE.Vector3(0, 0, 0)

proto.tick = function(dt) {
  var forces = this.forces
    , acceleration = this.acceleration
    , velocity = this.velocity
    , terminal = this.terminal
    , desired = DESIRED
    , world_desired = WORLD_DESIRED
    , bbox
    , pcs

  desired.x =
  desired.y =
  desired.z = 
  world_desired.x =
  world_desired.y =
  world_desired.z = 0

  if(!this.resting.x) {
    acceleration.x /= 8
    acceleration.x += forces.x * dt

    velocity.x += acceleration.x * dt
    if(abs(velocity.x) < terminal.x) {
      desired.x = (velocity.x * dt) 
    } else if(velocity.x !== 0) {
      desired.x = (velocity.x / abs(velocity.x)) * terminal.x
    }
  } else {
    acceleration.x = velocity.x = 0
  }
  if(!this.resting.y) {
    acceleration.y /= 8
    acceleration.y += forces.y * dt

    velocity.y += acceleration.y * dt
    if(abs(velocity.y) < terminal.y) {
      desired.y = (velocity.y * dt) 
    } else if(velocity.y !== 0) {
      desired.y = (velocity.y / abs(velocity.y)) * terminal.y
    }
  } else {
    acceleration.y = velocity.y = 0
  }
  if(!this.resting.z) {
    acceleration.z /= 8
    acceleration.z += forces.z * dt

    velocity.z += acceleration.z * dt
    if(abs(velocity.z) < terminal.z) {
      desired.z = (velocity.z * dt) 
    } else if(velocity.z !== 0) {
      desired.z = (velocity.z / abs(velocity.z)) * terminal.z
    }
  } else {
    acceleration.z = velocity.z = 0
  }

  START.copy(this.avatar.position)
  this.avatar.translateX(desired.x)
  this.avatar.translateY(desired.y)
  this.avatar.translateZ(desired.z)
  END.copy(this.avatar.position)
  this.avatar.position.copy(START)
  world_desired.x = END.x - START.x
  world_desired.y = END.y - START.y
  world_desired.z = END.z - START.z

  // run collisions
  this.resting.x = 
  this.resting.y =
  this.resting.z = false

  bbox = this.aabb()
  pcs = this.collidables(bbox, world_desired)

  for(var i = 0, len = pcs.length; i < len; ++i) {
    if(pcs[i] !== this) {
      pcs[i].collide(this, bbox, world_desired, this.resting)
    }
  }

  // apply translation 
  this.avatar.position.x += world_desired.x
  this.avatar.position.y += world_desired.y
  this.avatar.position.z += world_desired.z
}

proto.subjectTo = function(force) {
  this.forces.x += force.x
  this.forces.y += force.y
  this.forces.z += force.z
  return this
}

proto.aabb = function() {
  return this._aabb.translate([
      this.avatar.position.x - this._aabb.base[0]
    , this.avatar.position.y - this._aabb.base[1]
    , this.avatar.position.z - this._aabb.base[2]
  ])
}

// no object -> object collisions for now, thanks
proto.collide = function(other, bbox, world_vec, resting) {
  return
}

proto.atRestX = function() {
  return this.resting.x
}

proto.atRestY = function() {
  return this.resting.y
}

proto.atRestZ = function() {
  return this.resting.z
}
