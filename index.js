module.exports = physical

var aabb = require('aabb-3d')
  , THREE = require('three')

function physical(avatar, collidables, dimensions, terminal) {
  return new Physical(avatar, collidables, dimensions, terminal)
}

function Physical(avatar, collidables, dimensions, terminal) {
  this.avatar = avatar
  this.terminal = terminal || new THREE.Vector3(30, 56, 30)
  this.dimensions = dimensions= dimensions || new THREE.Vector3(1, 1, 1)
  this._aabb = aabb([0, 0, 0], [dimensions.x, dimensions.y, dimensions.z])
  this.resting = {x: false, y: false, z: false}
  this.collidables = collidables

  this.forces = new THREE.Vector3(0, 1, 0)
  this.acceleration = new THREE.Vector3(0, 0, 0)
  this.velocity = new THREE.Vector3(0, 0, 0)
}

var cons = Physical
  , proto = cons.prototype
  , axes = ['x', 'y', 'z']
  , abs = Math.abs

proto.tick = function(dt) {
  var forces = this.forces
    , acceleration = this.acceleration
    , velocity = this.velocity
    , terminal = this.terminal
    , desired = new THREE.Vector3(0, 0, 0)
    , world_desired = new THREE.Vector3(0, 0, 0)
    , bbox
    , pcs

  if(!this.resting.x) {
    acceleration.x /= 1.75
    acceleration.x += forces.x * dt

    velocity.x += acceleration.x * dt
    if(abs(velocity.x) < terminal.x) {
      desired.x = (velocity.x * dt) 
    }
  }
  if(!this.resting.y) {
    acceleration.y /= 1.75
    acceleration.y += forces.y * dt

    velocity.y += acceleration.y * dt
    if(abs(velocity.y) < terminal.y) {
      desired.y = (velocity.y * dt) 
    }
  }
  if(!this.resting.z) {
    acceleration.z /= 1.75
    acceleration.z += forces.z * dt

    velocity.z += acceleration.z * dt
    if(abs(velocity.z) < terminal.z) {
      desired.z = (velocity.z * dt) 
    }
  }

  this.avatar.quaternion.multiplyVector3(desired, world_desired)

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
  this.avatar.quaternion.clone().inverse().multiplyVector3(world_desired, desired)

  this.avatar.translateX(desired.x)
  this.avatar.translateY(desired.y)
  this.avatar.translateZ(desired.z)
}

proto.subjectTo = function(force) {
  this.forces.addVector(this.forces, force)
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
