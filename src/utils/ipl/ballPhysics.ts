
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface BallPhysicsConfig {
  gravity: number;
  airResistance: number;
  magnusStrength: number;
  groundFriction: number;
  bounceRetention: number;
  rollingFriction: number;
}

export interface BallState {
  position: Vector3;
  velocity: Vector3;
  spin: Vector3;
  radius: number;
  isGrounded: boolean;
  isStopped: boolean;
  bounceCount: number;
  elapsedTime: number;
}

export interface BallEnvironment {
  wind: Vector3;
  pitchBounce: number;
  pitchFriction: number;
  outfieldFriction: number;
}

export interface BallLaunchInput {
  position: Vector3;
  speed: number;
  horizontalAngle: number;
  verticalAngle: number;
  spin: Vector3;
  radius?: number;
}

export interface BallStepResult {
  state: BallState;
  collision: "none" | "pitch" | "outfield" | "stopped";
}

export const DEFAULT_BALL_PHYSICS: BallPhysicsConfig = {
  gravity: 9.81,
  airResistance: 0.012,
  magnusStrength: 0.0008,
  groundFriction: 0.82,
  bounceRetention: 0.48,
  rollingFriction: 0.985,
};

export const DEFAULT_BALL_ENVIRONMENT: BallEnvironment = {
  wind: { x: 0, y: 0, z: 0 },
  pitchBounce: 0.85,
  pitchFriction: 0.72,
  outfieldFriction: 0.94,
};

const STOP_SPEED = 0.12;
const MIN_BALL_RADIUS = 0.01;
const MAX_BALL_RADIUS = 0.2;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function validateVector(vector: Vector3, label: string): void {
  if (
    !Number.isFinite(vector.x) ||
    !Number.isFinite(vector.y) ||
    !Number.isFinite(vector.z)
  ) {
    throw new Error(`${label} must contain finite coordinates.`);
  }
}

function validateConfig(config: BallPhysicsConfig): void {
  const values = Object.values(config);

  if (values.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new Error("Ball physics configuration contains invalid values.");
  }
}

function validateEnvironment(environment: BallEnvironment): void {
  validateVector(environment.wind, "Wind");

  const values = [
    environment.pitchBounce,
    environment.pitchFriction,
    environment.outfieldFriction,
  ];

  if (
    values.some(
      (value) =>
        !Number.isFinite(value) || value < 0 || value > 1,
    )
  ) {
    throw new Error("Environment coefficients must be between 0 and 1.");
  }
}

export function createBallState(
  input: BallLaunchInput,
): BallState {
  validateVector(input.position, "Launch position");
  validateVector(input.spin, "Ball spin");

  if (
    !Number.isFinite(input.speed) ||
    input.speed < 0 ||
    !Number.isFinite(input.horizontalAngle) ||
    !Number.isFinite(input.verticalAngle)
  ) {
    throw new Error("Invalid ball launch values.");
  }

  const horizontal = (input.horizontalAngle * Math.PI) / 180;
  const vertical = (input.verticalAngle * Math.PI) / 180;

  const horizontalSpeed = input.speed * Math.cos(vertical);

  const radius = input.radius ?? 0.036;

  if (
    !Number.isFinite(radius) ||
    radius < MIN_BALL_RADIUS ||
    radius > MAX_BALL_RADIUS
  ) {
    throw new Error("Ball radius is outside the supported range.");
  }

  return {
    position: { ...input.position },
    velocity: {
      x: horizontalSpeed * Math.sin(horizontal),
      y: input.speed * Math.sin(vertical),
      z: horizontalSpeed * Math.cos(horizontal),
    },
    spin: { ...input.spin },
    radius,
    isGrounded: false,
    isStopped: input.speed === 0,
    bounceCount: 0,
    elapsedTime: 0,
  };
}

function getMagnitude(vector: Vector3): number {
  return Math.sqrt(
    vector.x * vector.x +
      vector.y * vector.y +
      vector.z * vector.z,
  );
}

function getMagnusAcceleration(
  velocity: Vector3,
  spin: Vector3,
  strength: number,
): Vector3 {
  return {
    x: strength * (spin.y * velocity.z - spin.z * velocity.y),
    y: strength * (spin.z * velocity.x - spin.x * velocity.z),
    z: strength * (spin.x * velocity.y - spin.y * velocity.x),
  };
}

function applyAirPhysics(
  state: BallState,
  config: BallPhysicsConfig,
  environment: BallEnvironment,
  deltaTime: number,
): Vector3 {
  const relativeVelocity = {
    x: state.velocity.x - environment.wind.x,
    y: state.velocity.y - environment.wind.y,
    z: state.velocity.z - environment.wind.z,
  };

  const speed = getMagnitude(relativeVelocity);

  const drag = {
    x: -config.airResistance * speed * relativeVelocity.x,
    y: -config.airResistance * speed * relativeVelocity.y,
    z: -config.airResistance * speed * relativeVelocity.z,
  };

  const magnus = getMagnusAcceleration(
    state.velocity,
    state.spin,
    config.magnusStrength,
  );

  return {
    x: (drag.x + magnus.x) * deltaTime,
    y: (-config.gravity + drag.y + magnus.y) * deltaTime,
    z: (drag.z + magnus.z) * deltaTime,
  };
}

export function stepBallPhysics(
  state: BallState,
  deltaTime: number,
  config: BallPhysicsConfig = DEFAULT_BALL_PHYSICS,
  environment: BallEnvironment = DEFAULT_BALL_ENVIRONMENT,
): BallStepResult {
  validateVector(state.position, "Ball position");
  validateVector(state.velocity, "Ball velocity");
  validateVector(state.spin, "Ball spin");
  validateConfig(config);
  validateEnvironment(environment);

  if (!Number.isFinite(deltaTime) || deltaTime <= 0 || deltaTime > 0.1) {
    throw new Error("Delta time must be greater than 0 and at most 0.1 seconds.");
  }

  if (state.isStopped) {
    return { state: { ...state }, collision: "stopped" };
  }

  const acceleration = applyAirPhysics(
    state,
    config,
    environment,
    deltaTime,
  );

  const velocity: Vector3 = {
    x: state.velocity.x + acceleration.x,
    y: state.velocity.y + acceleration.y,
    z: state.velocity.z + acceleration.z,
  };

  const position: Vector3 = {
    x: state.position.x + velocity.x * deltaTime,
    y: state.position.y + velocity.y * deltaTime,
    z: state.position.z + velocity.z * deltaTime,
  };

  let nextState: BallState = {
    ...state,
    position,
    velocity,
    isGrounded: false,
    elapsedTime: state.elapsedTime + deltaTime,
  };

  if (position.y <= state.radius) {
    const isFirstBounce = state.bounceCount === 0;

    position.y = state.radius;

    if (isFirstBounce) {
      velocity.y = Math.abs(velocity.y) *
        config.bounceRetention *
        environment.pitchBounce;

      velocity.x *= environment.pitchFriction;
      velocity.z *= environment.pitchFriction;

      nextState = {
        ...nextState,
        isGrounded: false,
        bounceCount: state.bounceCount + 1,
      };
    } else {
      velocity.y = 0;
      velocity.x *= config.groundFriction * environment.outfieldFriction;
      velocity.z *= config.groundFriction * environment.outfieldFriction;

      nextState = {
        ...nextState,
        isGrounded: true,
        bounceCount: state.bounceCount + 1,
      };
    }

    nextState.position = position;
    nextState.velocity = velocity;
  }

  const speedAfterStep = getMagnitude(nextState.velocity);

  if (
    nextState.isGrounded &&
    speedAfterStep < STOP_SPEED
  ) {
    nextState.velocity = { x: 0, y: 0, z: 0 };
    nextState.isStopped = true;

    return { state: nextState, collision: "stopped" };
  }

  return {
    state: nextState,
    collision: nextState.bounceCount > state.bounceCount
      ? state.bounceCount === 0
        ? "pitch"
        : "outfield"
      : "none",
  };
}

export function simulateBallFlight(
  initialState: BallState,
  duration: number,
  deltaTime = 1 / 120,
  config: BallPhysicsConfig = DEFAULT_BALL_PHYSICS,
  environment: BallEnvironment = DEFAULT_BALL_ENVIRONMENT,
): BallState[] {
  if (!Number.isFinite(duration) || duration < 0 || duration > 30) {
    throw new Error("Simulation duration must be between 0 and 30 seconds.");
  }

  if (
    !Number.isFinite(deltaTime) ||
    deltaTime <= 0 ||
    deltaTime > 0.1
  ) {
    throw new Error("Invalid simulation time step.");
  }

  const states: BallState[] = [{ ...initialState }];
  let current = initialState;
  let simulatedTime = 0;

  while (simulatedTime < duration && !current.isStopped) {
    const step = Math.min(deltaTime, duration - simulatedTime);

    current = stepBallPhysics(
      current,
      step,
      config,
      environment,
    ).state;

    states.push(current);
    simulatedTime += step;
  }

  return states;
}

export function getBallSpeed(state: BallState): number {
  return Number(getMagnitude(state.velocity).toFixed(2));
}

export function getBallHeight(state: BallState): number {
  return Number(Math.max(0, state.position.y).toFixed(2));
}
