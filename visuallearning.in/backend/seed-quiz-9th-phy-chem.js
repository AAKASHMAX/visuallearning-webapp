const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ─── Chapter Definitions ───
const chapters = [
  // ── Class 9 Physics ──
  {
    id: "cmmorm2xa0049uu7w3phtrp8a",
    name: "Motion",
    subjectId: "cmmn2eif70007uuksm0txp3wn",
    questions: [
      { questionText: "An object travels 16 m in 4 s and then another 16 m in 2 s. What is the average speed of the object?", optionA: "4 m/s", optionB: "5.33 m/s", optionC: "8 m/s", optionD: "2.67 m/s", correctOption: "B", solution: "Total distance = 16+16 = 32 m, total time = 4+2 = 6 s. Average speed = 32/6 ≈ 5.33 m/s." },
      { questionText: "Which of the following is a vector quantity?", optionA: "Speed", optionB: "Distance", optionC: "Displacement", optionD: "Time", correctOption: "C", solution: "Displacement has both magnitude and direction, making it a vector quantity." },
      { questionText: "The slope of a distance-time graph gives:", optionA: "Acceleration", optionB: "Displacement", optionC: "Speed", optionD: "Force", correctOption: "C", solution: "The slope (Δdistance/Δtime) of a distance-time graph represents speed." },
      { questionText: "A body is said to be in uniform motion if it:", optionA: "Covers equal distances in equal intervals of time", optionB: "Covers unequal distances in equal intervals of time", optionC: "Moves in a circular path", optionD: "Has changing speed", correctOption: "A", solution: "Uniform motion means covering equal distances in equal time intervals." },
      { questionText: "The SI unit of acceleration is:", optionA: "m/s", optionB: "m/s²", optionC: "km/h", optionD: "m²/s", correctOption: "B", solution: "Acceleration = change in velocity / time, so its unit is m/s²." },
      { questionText: "An object moving with initial velocity u, uniform acceleration a, covers a distance s in time t. Which equation is correct?", optionA: "s = ut + ½at²", optionB: "s = ut - ½at²", optionC: "s = ut + at²", optionD: "s = u + at", correctOption: "A", solution: "The second equation of motion is s = ut + ½at²." },
      { questionText: "If a car starts from rest and attains a velocity of 20 m/s in 10 s, what is its acceleration?", optionA: "1 m/s²", optionB: "2 m/s²", optionC: "0.5 m/s²", optionD: "4 m/s²", correctOption: "B", solution: "a = (v-u)/t = (20-0)/10 = 2 m/s²." },
      { questionText: "The area under a velocity-time graph represents:", optionA: "Speed", optionB: "Acceleration", optionC: "Distance covered", optionD: "Force", correctOption: "C", solution: "Area under v-t graph = ∫v dt = distance (or displacement) covered." },
      { questionText: "A body moving along a circular path with constant speed has:", optionA: "Constant velocity", optionB: "Constant acceleration", optionC: "Changing velocity", optionD: "Zero acceleration", correctOption: "C", solution: "Direction changes continuously in circular motion, so velocity (a vector) changes even though speed is constant." },
      { questionText: "Which of the following can be zero when a particle is in motion?", optionA: "Speed", optionB: "Distance", optionC: "Displacement", optionD: "Both A and B", correctOption: "C", solution: "Displacement can be zero if the object returns to its starting point, even though distance travelled is non-zero." },
      { questionText: "Odometer of a vehicle measures:", optionA: "Speed", optionB: "Acceleration", optionC: "Distance", optionD: "Displacement", correctOption: "C", solution: "An odometer records the total distance travelled by the vehicle." },
      { questionText: "If the displacement-time graph of a body is a straight line parallel to the time axis, the body is:", optionA: "In uniform motion", optionB: "At rest", optionC: "In non-uniform motion", optionD: "Accelerating", correctOption: "B", solution: "A horizontal line on a displacement-time graph means displacement is not changing — the body is at rest." },
      { questionText: "A train starting from rest attains a velocity of 72 km/h in 5 minutes. Its acceleration is:", optionA: "0.067 m/s²", optionB: "0.1 m/s²", optionC: "1 m/s²", optionD: "0.5 m/s²", correctOption: "A", solution: "72 km/h = 20 m/s, t = 300 s. a = 20/300 ≈ 0.067 m/s²." },
      { questionText: "Negative acceleration is also called:", optionA: "Uniform acceleration", optionB: "Retardation", optionC: "Speed", optionD: "Displacement", correctOption: "B", solution: "When acceleration is in the direction opposite to velocity, it is called retardation or deceleration." },
      { questionText: "Which equation of motion relates velocity and displacement without involving time?", optionA: "v = u + at", optionB: "s = ut + ½at²", optionC: "v² = u² + 2as", optionD: "s = vt", correctOption: "C", solution: "The third equation of motion v² = u² + 2as does not contain time." },
      { questionText: "An object is dropped from a height. Its velocity after 3 s is (g = 10 m/s²):", optionA: "10 m/s", optionB: "20 m/s", optionC: "30 m/s", optionD: "15 m/s", correctOption: "C", solution: "v = u + gt = 0 + 10×3 = 30 m/s." },
      { questionText: "When a body moves in a straight line with constant velocity, its acceleration is:", optionA: "Positive", optionB: "Negative", optionC: "Zero", optionD: "Variable", correctOption: "C", solution: "Constant velocity means no change in velocity, so acceleration is zero." },
      { questionText: "A stone is thrown vertically upwards. At the highest point its velocity and acceleration are:", optionA: "Both zero", optionB: "Velocity zero, acceleration 9.8 m/s² downward", optionC: "Both 9.8 m/s²", optionD: "Velocity 9.8 m/s, acceleration zero", correctOption: "B", solution: "At the highest point velocity is momentarily zero but gravitational acceleration (9.8 m/s² downward) still acts." },
      { questionText: "A bus decreases its speed from 80 km/h to 50 km/h in 5 s. The acceleration of the bus is approximately:", optionA: "−1.67 m/s²", optionB: "−6 m/s²", optionC: "1.67 m/s²", optionD: "6 m/s²", correctOption: "A", solution: "80 km/h ≈ 22.22 m/s, 50 km/h ≈ 13.89 m/s. a = (13.89-22.22)/5 ≈ −1.67 m/s²." },
      { questionText: "Distance is a _______ quantity.", optionA: "Vector", optionB: "Scalar", optionC: "Neither", optionD: "Tensor", correctOption: "B", solution: "Distance has only magnitude, so it is a scalar quantity." },
      { questionText: "A car travels first 30 km at 60 km/h and next 30 km at 40 km/h. Its average speed is:", optionA: "50 km/h", optionB: "48 km/h", optionC: "45 km/h", optionD: "52 km/h", correctOption: "B", solution: "Time₁ = 30/60 = 0.5 h, Time₂ = 30/40 = 0.75 h. Avg speed = 60/1.25 = 48 km/h." },
      { questionText: "The rate of change of displacement is:", optionA: "Speed", optionB: "Velocity", optionC: "Acceleration", optionD: "Distance", correctOption: "B", solution: "Velocity is defined as the rate of change of displacement." },
      { questionText: "An object moves 10 m north and then 10 m south. Its displacement is:", optionA: "20 m", optionB: "0 m", optionC: "10 m north", optionD: "10 m south", correctOption: "B", solution: "The object returns to its starting point, so net displacement is zero." },
      { questionText: "In which type of motion does the speed of an object change with time?", optionA: "Uniform motion", optionB: "Non-uniform motion", optionC: "Motion at rest", optionD: "Circular motion at constant speed", correctOption: "B", solution: "In non-uniform motion, speed changes with time." },
      { questionText: "A freely falling body has a velocity of 49 m/s. It has fallen through a height of (g = 9.8 m/s²):", optionA: "122.5 m", optionB: "245 m", optionC: "98 m", optionD: "49 m", correctOption: "A", solution: "Using v² = 2gh, h = v²/(2g) = 49²/(2×9.8) = 2401/19.6 = 122.5 m." },
    ],
  },
  {
    id: "cmmorm47x004tuu7wtjqyjh9n",
    name: "Force And Laws Of Motion",
    subjectId: "cmmn2eif70007uuksm0txp3wn",
    questions: [
      { questionText: "Newton's first law of motion is also known as the law of:", optionA: "Acceleration", optionB: "Action and Reaction", optionC: "Inertia", optionD: "Gravitation", correctOption: "C", solution: "Newton's first law states that a body continues in its state of rest or uniform motion unless acted on by an external force — this is the law of inertia." },
      { questionText: "The SI unit of force is:", optionA: "Dyne", optionB: "Newton", optionC: "Joule", optionD: "Pascal", correctOption: "B", solution: "The SI unit of force is the Newton (N), where 1 N = 1 kg·m/s²." },
      { questionText: "Which of Newton's laws explains why a passenger lurches forward when a bus suddenly stops?", optionA: "First law", optionB: "Second law", optionC: "Third law", optionD: "Law of gravitation", correctOption: "A", solution: "Inertia of motion (Newton's first law) causes the passenger to continue moving forward." },
      { questionText: "According to Newton's second law, F = ma. If the mass of an object is doubled and force remains the same, the acceleration:", optionA: "Doubles", optionB: "Remains the same", optionC: "Becomes half", optionD: "Becomes zero", correctOption: "C", solution: "a = F/m. If m is doubled, a becomes F/(2m) = half the original." },
      { questionText: "Action and reaction forces:", optionA: "Act on the same body", optionB: "Act on different bodies", optionC: "Cancel each other", optionD: "Are always unequal", correctOption: "B", solution: "Newton's third law: action and reaction are equal in magnitude, opposite in direction, and act on different bodies." },
      { questionText: "Momentum is defined as:", optionA: "Mass × Acceleration", optionB: "Mass × Velocity", optionC: "Force × Time", optionD: "Force × Distance", correctOption: "B", solution: "Momentum (p) = mass (m) × velocity (v)." },
      { questionText: "The SI unit of momentum is:", optionA: "kg·m/s²", optionB: "kg·m/s", optionC: "N·m", optionD: "kg·m²/s", correctOption: "B", solution: "Momentum = mass × velocity, so its unit is kg·m/s." },
      { questionText: "A force of 10 N acts on a body of mass 2 kg. The acceleration produced is:", optionA: "20 m/s²", optionB: "5 m/s²", optionC: "0.2 m/s²", optionD: "10 m/s²", correctOption: "B", solution: "a = F/m = 10/2 = 5 m/s²." },
      { questionText: "An object of mass 1 kg travelling at 10 m/s comes to rest in 2 s. The force applied is:", optionA: "5 N", optionB: "−5 N", optionC: "10 N", optionD: "−10 N", correctOption: "B", solution: "a = (0−10)/2 = −5 m/s². F = 1 × (−5) = −5 N (negative indicates opposing direction)." },
      { questionText: "Inertia of a body depends on its:", optionA: "Velocity", optionB: "Acceleration", optionC: "Mass", optionD: "Shape", correctOption: "C", solution: "Greater the mass, greater the inertia. Mass is the measure of inertia." },
      { questionText: "A goalkeeper catches a cricket ball to reduce its momentum to zero. This is an example of:", optionA: "Newton's first law", optionB: "Newton's second law", optionC: "Newton's third law", optionD: "Conservation of energy", correctOption: "B", solution: "Force = rate of change of momentum (Newton's second law). The goalkeeper applies force to change ball's momentum." },
      { questionText: "Conservation of momentum applies when:", optionA: "Internal forces act", optionB: "External forces act", optionC: "No external force acts on the system", optionD: "Friction is present", correctOption: "C", solution: "In the absence of external forces, total momentum of a system remains constant." },
      { questionText: "When a gun is fired, the gun recoils. This is explained by:", optionA: "Newton's first law", optionB: "Newton's second law", optionC: "Newton's third law", optionD: "Law of inertia", correctOption: "C", solution: "The bullet exerts a forward force; the gun experiences an equal and opposite reaction force (recoil)." },
      { questionText: "A 5 kg object has a momentum of 25 kg·m/s. Its velocity is:", optionA: "5 m/s", optionB: "125 m/s", optionC: "0.2 m/s", optionD: "25 m/s", correctOption: "A", solution: "v = p/m = 25/5 = 5 m/s." },
      { questionText: "Which of the following has the most inertia?", optionA: "A pin", optionB: "A pen", optionC: "A book", optionD: "A table", correctOption: "D", solution: "A table has the most mass, hence the most inertia." },
      { questionText: "The impulse experienced by a body is equal to:", optionA: "Change in kinetic energy", optionB: "Change in momentum", optionC: "Force × distance", optionD: "Mass × acceleration", correctOption: "B", solution: "Impulse = Force × time = Change in momentum." },
      { questionText: "A body of mass 10 kg is at rest. A force of 20 N is applied for 5 s. The velocity gained is:", optionA: "10 m/s", optionB: "100 m/s", optionC: "2 m/s", optionD: "4 m/s", correctOption: "A", solution: "a = F/m = 20/10 = 2 m/s². v = u + at = 0 + 2×5 = 10 m/s." },
      { questionText: "An astronaut in outer space has to use a jet pack to move because:", optionA: "There is no gravity", optionB: "There is no friction or support to push against", optionC: "The astronaut has no mass", optionD: "Newton's laws do not apply in space", correctOption: "B", solution: "In space there is no surface to push against. The jet pack ejects gas backward (action), propelling the astronaut forward (reaction) — Newton's third law." },
      { questionText: "A body of mass 2 kg is moving with velocity 5 m/s. A force is applied to stop it in 1 s. The force is:", optionA: "10 N", optionB: "−10 N", optionC: "5 N", optionD: "−5 N", correctOption: "B", solution: "Change in momentum = 2×(0−5) = −10 kg·m/s. Force = −10/1 = −10 N." },
      { questionText: "Friction is a:", optionA: "Non-contact force", optionB: "Contact force", optionC: "Gravitational force", optionD: "Nuclear force", correctOption: "B", solution: "Friction acts between surfaces in contact, making it a contact force." },
      { questionText: "Two objects of masses 100 g and 200 g are moving in the same direction with velocities of 2 m/s and 1 m/s respectively. They collide and move together. Their combined velocity is:", optionA: "4/3 m/s", optionB: "1 m/s", optionC: "2 m/s", optionD: "3 m/s", correctOption: "A", solution: "By conservation of momentum: 0.1×2 + 0.2×1 = 0.3×v → v = 0.4/0.3 = 4/3 m/s." },
      { questionText: "Newton's second law of motion gives the measure of:", optionA: "Inertia", optionB: "Momentum", optionC: "Force", optionD: "Acceleration", correctOption: "C", solution: "Newton's second law (F = ma) provides a quantitative definition of force." },
      { questionText: "If the net force on an object is zero, the object:", optionA: "Must be at rest", optionB: "Must be accelerating", optionC: "Is either at rest or moving with constant velocity", optionD: "Must be moving", correctOption: "C", solution: "Zero net force means zero acceleration — the object maintains its current state of rest or uniform motion (Newton's first law)." },
      { questionText: "A rocket works on the principle of:", optionA: "Conservation of energy", optionB: "Newton's third law of motion", optionC: "Newton's first law of motion", optionD: "Bernoulli's theorem", correctOption: "B", solution: "Hot gases are expelled backward (action); the rocket moves forward (reaction)." },
      { questionText: "One newton force is the force that produces an acceleration of 1 m/s² in a body of mass:", optionA: "1 g", optionB: "10 kg", optionC: "1 kg", optionD: "100 g", correctOption: "C", solution: "By definition, 1 N = 1 kg × 1 m/s²." },
    ],
  },
  {
    id: "cmmorm5j40059uu7wnc8ps18z",
    name: "Gravitation",
    subjectId: "cmmn2eif70007uuksm0txp3wn",
    questions: [
      { questionText: "The universal gravitational constant G has the value:", optionA: "6.674 × 10⁻¹¹ N m² kg⁻²", optionB: "9.8 m/s²", optionC: "6.674 × 10⁻⁸ N m² kg⁻²", optionD: "6.674 × 10¹¹ N m² kg⁻²", correctOption: "A", solution: "G = 6.674 × 10⁻¹¹ N m² kg⁻² is the universal gravitational constant." },
      { questionText: "The gravitational force between two objects is proportional to:", optionA: "Sum of their masses", optionB: "Product of their masses", optionC: "Difference of their masses", optionD: "Ratio of their masses", correctOption: "B", solution: "F = G(m₁m₂)/r². Force is proportional to the product of masses." },
      { questionText: "If the distance between two objects is doubled, the gravitational force becomes:", optionA: "Half", optionB: "Double", optionC: "One-fourth", optionD: "Four times", correctOption: "C", solution: "F ∝ 1/r². If r is doubled, F becomes 1/4 of the original." },
      { questionText: "The value of acceleration due to gravity (g) on the surface of Earth is approximately:", optionA: "6.67 m/s²", optionB: "9.8 m/s²", optionC: "10.8 m/s²", optionD: "8.9 m/s²", correctOption: "B", solution: "g ≈ 9.8 m/s² on Earth's surface." },
      { questionText: "Weight of a body on the moon is about:", optionA: "Same as on Earth", optionB: "1/2 of weight on Earth", optionC: "1/6 of weight on Earth", optionD: "6 times weight on Earth", correctOption: "C", solution: "The moon's gravity is about 1/6 of Earth's, so weight is 1/6." },
      { questionText: "Mass of a body:", optionA: "Changes with location", optionB: "Is zero in space", optionC: "Remains constant everywhere", optionD: "Depends on gravity", correctOption: "C", solution: "Mass is an intrinsic property and does not change with location." },
      { questionText: "The SI unit of weight is:", optionA: "Kilogram", optionB: "Newton", optionC: "Gram", optionD: "Joule", correctOption: "B", solution: "Weight = mg, a force, so its SI unit is Newton." },
      { questionText: "An object weighs 60 N on Earth. Its weight on the moon is approximately:", optionA: "60 N", optionB: "10 N", optionC: "30 N", optionD: "360 N", correctOption: "B", solution: "Weight on moon ≈ 60/6 = 10 N." },
      { questionText: "Gravitational force is always:", optionA: "Repulsive", optionB: "Attractive", optionC: "Both attractive and repulsive", optionD: "Zero", correctOption: "B", solution: "Gravitational force is always attractive between any two masses." },
      { questionText: "An object is thrown upwards. At the highest point, its acceleration is:", optionA: "Zero", optionB: "9.8 m/s² upward", optionC: "9.8 m/s² downward", optionD: "Variable", correctOption: "C", solution: "Acceleration due to gravity always acts downward at 9.8 m/s², even at the highest point." },
      { questionText: "The force of gravity on a body of mass 5 kg is (g = 10 m/s²):", optionA: "0.5 N", optionB: "2 N", optionC: "50 N", optionD: "500 N", correctOption: "C", solution: "Weight = mg = 5 × 10 = 50 N." },
      { questionText: "Archimedes' principle states that when a body is immersed in a fluid:", optionA: "It gains weight", optionB: "It experiences an upward force equal to the weight of fluid displaced", optionC: "Its density decreases", optionD: "Gravity does not act on it", correctOption: "B", solution: "Archimedes' principle: buoyant force = weight of fluid displaced." },
      { questionText: "An object floats in water when:", optionA: "Its density is greater than water", optionB: "Its density is equal to or less than water", optionC: "Its weight is zero", optionD: "Gravitational force is absent", correctOption: "B", solution: "An object floats when its density is less than or equal to the fluid density." },
      { questionText: "Relative density of a substance is:", optionA: "Always greater than 1", optionB: "The ratio of its density to the density of water", optionC: "Measured in kg/m³", optionD: "Same as weight", correctOption: "B", solution: "Relative density = density of substance / density of water. It has no unit." },
      { questionText: "Pressure exerted by a liquid at a depth h is given by:", optionA: "P = ρg/h", optionB: "P = ρgh", optionC: "P = mgh", optionD: "P = mg/h", correctOption: "B", solution: "Pressure = ρgh, where ρ is density, g is acceleration due to gravity, h is depth." },
      { questionText: "A body has mass 10 kg. Its weight on a planet where g = 5 m/s² is:", optionA: "10 N", optionB: "50 N", optionC: "2 N", optionD: "100 N", correctOption: "B", solution: "Weight = mg = 10 × 5 = 50 N." },
      { questionText: "Who discovered the universal law of gravitation?", optionA: "Galileo", optionB: "Einstein", optionC: "Newton", optionD: "Kepler", correctOption: "C", solution: "Sir Isaac Newton formulated the universal law of gravitation." },
      { questionText: "The value of g:", optionA: "Is same everywhere on Earth", optionB: "Is maximum at the poles", optionC: "Is maximum at the equator", optionD: "Does not change with altitude", correctOption: "B", solution: "Earth is slightly flattened at poles, so g is maximum at poles and minimum at equator." },
      { questionText: "A stone and a feather are dropped simultaneously in vacuum. Which reaches the ground first?", optionA: "Stone", optionB: "Feather", optionC: "Both at the same time", optionD: "Cannot be determined", correctOption: "C", solution: "In vacuum there is no air resistance. All objects fall with the same acceleration g regardless of mass." },
      { questionText: "The buoyant force depends on:", optionA: "Mass of the object", optionB: "Volume of the object submerged", optionC: "Shape of the object", optionD: "Colour of the object", correctOption: "B", solution: "Buoyant force = weight of fluid displaced, which depends on the volume of the object submerged." },
      { questionText: "If the mass of Earth were doubled and its radius remained the same, g would:", optionA: "Remain the same", optionB: "Be halved", optionC: "Be doubled", optionD: "Become four times", correctOption: "C", solution: "g = GM/R². If M doubles and R stays the same, g doubles." },
      { questionText: "The relative density of iron is 7.8. This means iron is:", optionA: "7.8 times lighter than water", optionB: "7.8 times denser than water", optionC: "7.8 kg/m³", optionD: "7.8 N heavier", correctOption: "B", solution: "Relative density 7.8 means iron is 7.8 times as dense as water." },
      { questionText: "Thrust is defined as:", optionA: "Force per unit area", optionB: "Force acting perpendicular to a surface", optionC: "Mass per unit volume", optionD: "Weight per unit area", correctOption: "B", solution: "Thrust is the force acting perpendicular to a surface. Pressure = Thrust/Area." },
      { questionText: "Why do nails have pointed tips?", optionA: "To increase the area of contact", optionB: "To decrease pressure", optionC: "To decrease the area so that pressure is increased", optionD: "For better grip", correctOption: "C", solution: "Pressure = Force/Area. A pointed tip has very small area, increasing pressure so the nail penetrates easily." },
      { questionText: "The weight of an object at the centre of the Earth is:", optionA: "Maximum", optionB: "Same as on surface", optionC: "Infinity", optionD: "Zero", correctOption: "D", solution: "At the centre of the Earth, g = 0, so weight = mg = 0." },
    ],
  },
  {
    id: "cmmorm6h8005xuu7wuglqvri0",
    name: "Work And Energy",
    subjectId: "cmmn2eif70007uuksm0txp3wn",
    questions: [
      { questionText: "Work is done when:", optionA: "Force is applied but no displacement occurs", optionB: "Force is applied and displacement occurs in the direction of force", optionC: "A body is at rest", optionD: "Force is perpendicular to displacement", correctOption: "B", solution: "Work = Force × displacement × cos θ. Work is done only when displacement has a component along the force." },
      { questionText: "The SI unit of work is:", optionA: "Newton", optionB: "Watt", optionC: "Joule", optionD: "Pascal", correctOption: "C", solution: "Work = Force × displacement. Its SI unit is Joule (J) = N·m." },
      { questionText: "1 kWh is equal to:", optionA: "3.6 × 10⁶ J", optionB: "3.6 × 10³ J", optionC: "1000 J", optionD: "360 J", correctOption: "A", solution: "1 kWh = 1000 W × 3600 s = 3.6 × 10⁶ J." },
      { questionText: "Kinetic energy of a body of mass m moving with velocity v is:", optionA: "mv", optionB: "mv²", optionC: "½mv²", optionD: "½mv", correctOption: "C", solution: "Kinetic energy = ½mv²." },
      { questionText: "An object of mass 2 kg is moving with a velocity of 3 m/s. Its kinetic energy is:", optionA: "6 J", optionB: "9 J", optionC: "18 J", optionD: "3 J", correctOption: "B", solution: "KE = ½mv² = ½ × 2 × 9 = 9 J." },
      { questionText: "Potential energy of a body at height h above the ground is:", optionA: "½mgh", optionB: "mgh", optionC: "mg/h", optionD: "mgh²", correctOption: "B", solution: "Gravitational potential energy = mgh." },
      { questionText: "Power is defined as:", optionA: "Work × Time", optionB: "Force × Velocity", optionC: "Work / Time", optionD: "Energy × Time", correctOption: "C", solution: "Power = Work done / Time taken. Its SI unit is Watt." },
      { questionText: "The SI unit of power is:", optionA: "Joule", optionB: "Newton", optionC: "Watt", optionD: "Horse power", correctOption: "C", solution: "SI unit of power is Watt (W) = J/s." },
      { questionText: "When the velocity of a body is doubled, its kinetic energy:", optionA: "Doubles", optionB: "Becomes half", optionC: "Becomes four times", optionD: "Remains the same", correctOption: "C", solution: "KE = ½mv². If v is doubled, KE = ½m(2v)² = 4 × ½mv²." },
      { questionText: "A ball of mass 0.5 kg is at a height of 10 m. Its potential energy is (g = 10 m/s²):", optionA: "5 J", optionB: "50 J", optionC: "0.5 J", optionD: "100 J", correctOption: "B", solution: "PE = mgh = 0.5 × 10 × 10 = 50 J." },
      { questionText: "Law of conservation of energy states that:", optionA: "Energy can be created", optionB: "Energy can be destroyed", optionC: "Energy can neither be created nor destroyed, only transformed", optionD: "Energy always increases", correctOption: "C", solution: "Energy is conserved: it can only change forms, never be created or destroyed." },
      { questionText: "When a body falls freely, its potential energy:", optionA: "Increases", optionB: "Remains same", optionC: "Converts into kinetic energy", optionD: "Becomes zero instantly", correctOption: "C", solution: "As a body falls, height decreases (PE decreases) and speed increases (KE increases). PE converts to KE." },
      { questionText: "A person carries a 10 kg bag on his head and walks 50 m on a level road. Work done against gravity is:", optionA: "500 J", optionB: "5000 J", optionC: "0 J", optionD: "50 J", correctOption: "C", solution: "The displacement is horizontal, perpendicular to the gravitational force (vertical). Work = F × d × cos 90° = 0." },
      { questionText: "If the kinetic energy of a body is 50 J and its mass is 1 kg, its velocity is:", optionA: "50 m/s", optionB: "10 m/s", optionC: "5 m/s", optionD: "25 m/s", correctOption: "B", solution: "KE = ½mv² → 50 = ½ × 1 × v² → v² = 100 → v = 10 m/s." },
      { questionText: "A machine does 1000 J of work in 5 s. Its power is:", optionA: "5000 W", optionB: "200 W", optionC: "500 W", optionD: "100 W", correctOption: "B", solution: "Power = Work/Time = 1000/5 = 200 W." },
      { questionText: "Commercial unit of energy is:", optionA: "Joule", optionB: "Watt", optionC: "kWh", optionD: "Horse power", correctOption: "C", solution: "The commercial unit of energy is the kilowatt-hour (kWh)." },
      { questionText: "An arrow shot from a bow has kinetic energy. The source of this energy is:", optionA: "Gravitational PE of the arrow", optionB: "Elastic PE stored in the bow", optionC: "Chemical energy", optionD: "Nuclear energy", correctOption: "B", solution: "The stretched bow stores elastic potential energy, which converts to kinetic energy of the arrow." },
      { questionText: "A force of 50 N moves a body through 10 m in the direction of force. Work done is:", optionA: "5 J", optionB: "500 J", optionC: "60 J", optionD: "0.2 J", correctOption: "B", solution: "W = F × d = 50 × 10 = 500 J." },
      { questionText: "The energy possessed by a body due to its position is called:", optionA: "Kinetic energy", optionB: "Potential energy", optionC: "Heat energy", optionD: "Light energy", correctOption: "B", solution: "Energy due to position or configuration is potential energy." },
      { questionText: "1 horse power is approximately:", optionA: "476 W", optionB: "746 W", optionC: "1000 W", optionD: "500 W", correctOption: "B", solution: "1 HP ≈ 746 W." },
      { questionText: "If the mass of a body is halved and its speed is doubled, the kinetic energy:", optionA: "Remains the same", optionB: "Doubles", optionC: "Halves", optionD: "Becomes four times", correctOption: "B", solution: "KE = ½mv². New KE = ½(m/2)(2v)² = ½(m/2)(4v²) = mv² = 2 × (½mv²). It doubles." },
      { questionText: "Work done by gravity on a satellite moving in a circular orbit is:", optionA: "Positive", optionB: "Negative", optionC: "Zero", optionD: "Infinite", correctOption: "C", solution: "In circular orbit, gravitational force is perpendicular to the satellite's velocity, so work done = 0." },
      { questionText: "Energy transformation in a hydroelectric power plant is:", optionA: "Kinetic → Electrical", optionB: "Potential → Kinetic → Electrical", optionC: "Chemical → Electrical", optionD: "Nuclear → Electrical", correctOption: "B", solution: "Water stored at height has PE → falls (KE) → drives turbine → generates electricity." },
      { questionText: "A body of mass 5 kg is lifted through 4 m. Work done against gravity is (g = 10 m/s²):", optionA: "20 J", optionB: "50 J", optionC: "200 J", optionD: "100 J", correctOption: "C", solution: "W = mgh = 5 × 10 × 4 = 200 J." },
      { questionText: "An object at rest can have:", optionA: "Kinetic energy", optionB: "Speed", optionC: "Momentum", optionD: "Potential energy", correctOption: "D", solution: "An object at rest has zero KE and zero momentum, but can have potential energy due to its position." },
    ],
  },
  {
    id: "cmmorm7rl006luu7w3ktp9mzl",
    name: "Sound",
    subjectId: "cmmn2eif70007uuksm0txp3wn",
    questions: [
      { questionText: "Sound is produced by:", optionA: "Vibrating objects", optionB: "Stationary objects", optionC: "Only solid objects", optionD: "Only wind", correctOption: "A", solution: "Sound is produced by vibrations of objects." },
      { questionText: "Sound cannot travel through:", optionA: "Solids", optionB: "Liquids", optionC: "Gases", optionD: "Vacuum", correctOption: "D", solution: "Sound requires a material medium to propagate and cannot travel through vacuum." },
      { questionText: "The speed of sound is maximum in:", optionA: "Air", optionB: "Water", optionC: "Steel", optionD: "Vacuum", correctOption: "C", solution: "Sound travels fastest through solids (like steel) because particles are closest together." },
      { questionText: "The frequency of sound is measured in:", optionA: "Metre", optionB: "Hertz", optionC: "Decibel", optionD: "Watt", correctOption: "B", solution: "Frequency is measured in Hertz (Hz), i.e., cycles per second." },
      { questionText: "The audible range of frequency for humans is:", optionA: "20 Hz to 20,000 Hz", optionB: "Less than 20 Hz", optionC: "Greater than 20,000 Hz", optionD: "1 Hz to 100 Hz", correctOption: "A", solution: "Humans can hear sounds in the frequency range 20 Hz to 20,000 Hz." },
      { questionText: "Sounds with frequency above 20,000 Hz are called:", optionA: "Infrasonic", optionB: "Audible", optionC: "Ultrasonic", optionD: "Supersonic", correctOption: "C", solution: "Sounds with frequency > 20,000 Hz are ultrasonic." },
      { questionText: "The loudness of sound depends on:", optionA: "Frequency", optionB: "Amplitude", optionC: "Wavelength", optionD: "Time period", correctOption: "B", solution: "Loudness is proportional to the square of amplitude of vibration." },
      { questionText: "The pitch of a sound depends on:", optionA: "Amplitude", optionB: "Frequency", optionC: "Speed", optionD: "Medium", correctOption: "B", solution: "Higher frequency = higher pitch." },
      { questionText: "Echo is produced due to:", optionA: "Refraction of sound", optionB: "Reflection of sound", optionC: "Diffraction of sound", optionD: "Absorption of sound", correctOption: "B", solution: "An echo is heard when sound reflects off a distant surface back to the listener." },
      { questionText: "The minimum distance for an echo to be heard is approximately:", optionA: "10 m", optionB: "17 m", optionC: "34 m", optionD: "50 m", correctOption: "B", solution: "For an echo, minimum distance = speed × time / 2 = 344 × 0.1/2 ≈ 17.2 m." },
      { questionText: "Speed of sound in air at 20°C is approximately:", optionA: "332 m/s", optionB: "344 m/s", optionC: "1500 m/s", optionD: "5000 m/s", correctOption: "B", solution: "Speed of sound in air at 20°C ≈ 344 m/s." },
      { questionText: "Ultrasound is used in:", optionA: "SONAR", optionB: "Measuring temperature", optionC: "Weighing objects", optionD: "Generating electricity", correctOption: "A", solution: "SONAR uses ultrasonic waves to detect objects underwater." },
      { questionText: "SONAR stands for:", optionA: "Sound Navigation And Ranging", optionB: "Sound Notation And Ranging", optionC: "Sonic Navigation And Reflection", optionD: "Sound Navigation And Reflection", correctOption: "A", solution: "SONAR = Sound Navigation And Ranging." },
      { questionText: "Sound waves are:", optionA: "Transverse waves", optionB: "Electromagnetic waves", optionC: "Longitudinal waves", optionD: "Standing waves", correctOption: "C", solution: "Sound waves in air are longitudinal — particles vibrate parallel to the direction of propagation." },
      { questionText: "The time period of a wave is the reciprocal of:", optionA: "Wavelength", optionB: "Amplitude", optionC: "Frequency", optionD: "Speed", correctOption: "C", solution: "Time period T = 1/frequency." },
      { questionText: "If the frequency of a wave is 200 Hz and speed is 400 m/s, its wavelength is:", optionA: "2 m", optionB: "0.5 m", optionC: "200 m", optionD: "800 m", correctOption: "A", solution: "λ = v/f = 400/200 = 2 m." },
      { questionText: "The unit of loudness of sound is:", optionA: "Hertz", optionB: "Decibel", optionC: "Newton", optionD: "Pascal", correctOption: "B", solution: "Loudness is measured in decibels (dB)." },
      { questionText: "The normal conversation level is about:", optionA: "10 dB", optionB: "30 dB", optionC: "60 dB", optionD: "120 dB", correctOption: "C", solution: "Normal conversation is about 60 dB." },
      { questionText: "Which of the following can produce infrasonic sounds?", optionA: "Dog", optionB: "Bat", optionC: "Rhinoceros", optionD: "Dolphin", correctOption: "C", solution: "Large animals like rhinoceros and elephants can produce infrasonic sounds (< 20 Hz)." },
      { questionText: "Multiple reflections of sound are used in:", optionA: "Megaphone", optionB: "Telescope", optionC: "Microscope", optionD: "Periscope", correctOption: "A", solution: "Megaphones, horns, and stethoscopes work on multiple reflections of sound." },
      { questionText: "Reverberation is:", optionA: "Absorption of sound", optionB: "Persistence of sound due to repeated reflections", optionC: "Production of sound", optionD: "Speed of sound", correctOption: "B", solution: "Reverberation is the persistence of sound in a room due to multiple reflections." },
      { questionText: "The quality (timbre) of sound depends on:", optionA: "Amplitude", optionB: "Frequency", optionC: "Waveform (harmonics)", optionD: "Speed", correctOption: "C", solution: "Timbre depends on the waveform, i.e., the combination of fundamental and overtones/harmonics." },
      { questionText: "A sound wave has a frequency of 500 Hz. Its time period is:", optionA: "0.002 s", optionB: "0.02 s", optionC: "500 s", optionD: "0.5 s", correctOption: "A", solution: "T = 1/f = 1/500 = 0.002 s." },
      { questionText: "Bats detect obstacles using:", optionA: "Infrasound", optionB: "Ultrasound", optionC: "Audible sound", optionD: "Light", correctOption: "B", solution: "Bats emit ultrasonic waves and listen for echoes to navigate and detect prey." },
      { questionText: "The wavelength of a sound wave is the distance between two consecutive:", optionA: "Compressions and rarefactions", optionB: "Compressions or two rarefactions", optionC: "Particles", optionD: "None of the above", correctOption: "B", solution: "Wavelength is the distance between two consecutive compressions (or two consecutive rarefactions)." },
    ],
  },

  // ── Class 9 Chemistry ──
  {
    id: "cmmorlow70001uu7wjuqpna90",
    name: "Matter In Our Surroundings",
    subjectId: "cmmn2eljr000xuukshk6fl2yr",
    questions: [
      { questionText: "Which of the following is not a state of matter?", optionA: "Solid", optionB: "Liquid", optionC: "Gas", optionD: "Energy", correctOption: "D", solution: "Energy is not a state of matter. The three common states are solid, liquid, and gas." },
      { questionText: "The process of conversion of solid directly to gas is called:", optionA: "Evaporation", optionB: "Condensation", optionC: "Sublimation", optionD: "Melting", correctOption: "C", solution: "Sublimation is the direct conversion of a solid into gas without passing through the liquid state." },
      { questionText: "Which of these substances sublimes?", optionA: "Ice", optionB: "Salt", optionC: "Camphor", optionD: "Sugar", correctOption: "C", solution: "Camphor, naphthalene, and dry ice are common examples of substances that sublime." },
      { questionText: "The boiling point of water is:", optionA: "0°C", optionB: "100°C", optionC: "273 K", optionD: "373°C", correctOption: "B", solution: "Water boils at 100°C (373 K) at standard atmospheric pressure." },
      { questionText: "Which state of matter has definite shape and definite volume?", optionA: "Solid", optionB: "Liquid", optionC: "Gas", optionD: "Plasma", correctOption: "A", solution: "Solids have fixed shape and fixed volume due to tightly packed particles." },
      { questionText: "Particles in a gas:", optionA: "Are tightly packed", optionB: "Have strong intermolecular forces", optionC: "Move freely and have negligible attraction", optionD: "Vibrate at fixed positions", correctOption: "C", solution: "Gas particles have maximum kinetic energy, move freely, and have negligible intermolecular attractions." },
      { questionText: "The temperature at which a solid melts to become a liquid is called:", optionA: "Boiling point", optionB: "Melting point", optionC: "Sublimation point", optionD: "Condensation point", correctOption: "B", solution: "Melting point is the temperature at which a solid changes to liquid at atmospheric pressure." },
      { questionText: "Evaporation causes:", optionA: "Warming", optionB: "Cooling", optionC: "No temperature change", optionD: "Melting", correctOption: "B", solution: "Evaporation is an endothermic process — it absorbs heat from the surroundings, causing cooling." },
      { questionText: "Rate of evaporation increases with:", optionA: "Decrease in surface area", optionB: "Decrease in temperature", optionC: "Increase in humidity", optionD: "Increase in wind speed", correctOption: "D", solution: "Wind carries away vapour molecules from the surface, increasing the rate of evaporation." },
      { questionText: "Latent heat of fusion is the heat required to:", optionA: "Raise the temperature of a solid", optionB: "Change a solid to liquid at its melting point", optionC: "Change a liquid to gas", optionD: "Cool a gas", correctOption: "B", solution: "Latent heat of fusion is the heat absorbed by a solid at its melting point to change into liquid without temperature change." },
      { questionText: "0°C is equal to:", optionA: "273 K", optionB: "0 K", optionC: "373 K", optionD: "100 K", correctOption: "A", solution: "T(K) = T(°C) + 273. So 0°C = 273 K." },
      { questionText: "The latent heat of vaporisation of water is:", optionA: "80 cal/g", optionB: "540 cal/g", optionC: "100 cal/g", optionD: "273 cal/g", correctOption: "B", solution: "The latent heat of vaporisation of water is 540 cal/g (or 2260 kJ/kg)." },
      { questionText: "Which has the highest kinetic energy of particles?", optionA: "Ice", optionB: "Water", optionC: "Steam", optionD: "All same", correctOption: "C", solution: "Gas particles (steam) have the highest kinetic energy among all three states." },
      { questionText: "Diffusion is fastest in:", optionA: "Solids", optionB: "Liquids", optionC: "Gases", optionD: "Same in all", correctOption: "C", solution: "Gas particles move most freely, so diffusion is fastest in gases." },
      { questionText: "The phenomenon of change of a liquid into gas at any temperature below its boiling point is called:", optionA: "Boiling", optionB: "Condensation", optionC: "Evaporation", optionD: "Sublimation", correctOption: "C", solution: "Evaporation occurs at any temperature from the surface of a liquid, unlike boiling which occurs throughout at a specific temperature." },
      { questionText: "Dry ice is:", optionA: "Solid water", optionB: "Solid CO₂", optionC: "Solid nitrogen", optionD: "Liquid CO₂", correctOption: "B", solution: "Dry ice is solid carbon dioxide. It sublimes directly to CO₂ gas." },
      { questionText: "When perfume is sprayed in one corner, it can be smelled across the room because of:", optionA: "Condensation", optionB: "Osmosis", optionC: "Diffusion", optionD: "Sublimation", correctOption: "C", solution: "Gas particles of perfume mix with air and spread by diffusion." },
      { questionText: "Compressibility is maximum in:", optionA: "Solids", optionB: "Liquids", optionC: "Gases", optionD: "Same for all", correctOption: "C", solution: "Gases have large inter-particle spaces, making them highly compressible." },
      { questionText: "On converting 25°C to Kelvin, we get:", optionA: "248 K", optionB: "298 K", optionC: "25 K", optionD: "373 K", correctOption: "B", solution: "T(K) = 25 + 273 = 298 K." },
      { questionText: "The melting point of ice is:", optionA: "373 K", optionB: "0 K", optionC: "273 K", optionD: "100 K", correctOption: "C", solution: "Ice melts at 0°C = 273 K." },
      { questionText: "Which of these factors does NOT affect evaporation?", optionA: "Surface area", optionB: "Temperature", optionC: "Mass of the container", optionD: "Humidity", correctOption: "C", solution: "Mass of the container has no effect on evaporation. Temperature, surface area, humidity, and wind speed do." },
      { questionText: "During boiling, the temperature of a liquid:", optionA: "Increases", optionB: "Decreases", optionC: "Remains constant", optionD: "Fluctuates", correctOption: "C", solution: "During boiling, temperature remains constant as heat is used to change state (latent heat)." },
      { questionText: "Plasma is found in:", optionA: "Rivers", optionB: "Stars", optionC: "Ice caps", optionD: "Underground", correctOption: "B", solution: "Stars contain plasma, which is an ionised state of matter at extremely high temperatures." },
      { questionText: "Interparticle forces are strongest in:", optionA: "Gases", optionB: "Liquids", optionC: "Solids", optionD: "Plasma", correctOption: "C", solution: "Solids have the strongest interparticle forces, keeping particles in fixed positions." },
      { questionText: "The process of gas converting to liquid is called:", optionA: "Evaporation", optionB: "Sublimation", optionC: "Condensation", optionD: "Freezing", correctOption: "C", solution: "Condensation (or liquefaction) is the process where gas changes to liquid." },
    ],
  },
  {
    id: "cmmorlrok000puu7wnqr07wxj",
    name: "Is Matter Around Us Pure",
    subjectId: "cmmn2eljr000xuukshk6fl2yr",
    questions: [
      { questionText: "A substance that contains only one type of particle is called:", optionA: "Mixture", optionB: "Pure substance", optionC: "Solution", optionD: "Colloid", correctOption: "B", solution: "A pure substance consists of only one type of particle — either an element or a compound." },
      { questionText: "Air is an example of:", optionA: "Element", optionB: "Compound", optionC: "Homogeneous mixture", optionD: "Heterogeneous mixture", correctOption: "C", solution: "Air is a homogeneous mixture of gases (N₂, O₂, CO₂, etc.) with uniform composition." },
      { questionText: "A solution of sugar in water is a:", optionA: "Heterogeneous mixture", optionB: "Suspension", optionC: "Homogeneous mixture", optionD: "Colloid", correctOption: "C", solution: "Sugar dissolves completely in water forming a uniform, homogeneous mixture (solution)." },
      { questionText: "The solvent in a sugar solution is:", optionA: "Sugar", optionB: "Water", optionC: "Both", optionD: "Neither", correctOption: "B", solution: "The solvent is the component present in larger quantity. In sugar solution, water is the solvent." },
      { questionText: "Tincture of iodine is a solution of:", optionA: "Iodine in water", optionB: "Iodine in alcohol", optionC: "Iodine in oil", optionD: "Alcohol in iodine", correctOption: "B", solution: "Tincture of iodine is a solution of iodine dissolved in alcohol." },
      { questionText: "A colloid can be distinguished from a solution by:", optionA: "Colour", optionB: "Tyndall effect", optionC: "Taste", optionD: "Smell", correctOption: "B", solution: "Colloidal particles scatter light (Tyndall effect), whereas true solutions do not." },
      { questionText: "The particle size in a true solution is:", optionA: "Greater than 100 nm", optionB: "Between 1 nm and 100 nm", optionC: "Less than 1 nm", optionD: "Exactly 50 nm", correctOption: "C", solution: "True solution particles are < 1 nm. Colloids: 1–100 nm. Suspensions: > 100 nm." },
      { questionText: "Milk is an example of:", optionA: "Solution", optionB: "Suspension", optionC: "Colloid", optionD: "Element", correctOption: "C", solution: "Milk is a colloid — fat globules are dispersed in water." },
      { questionText: "Which separation technique is used to separate cream from milk?", optionA: "Filtration", optionB: "Evaporation", optionC: "Centrifugation", optionD: "Distillation", correctOption: "C", solution: "Centrifugation separates lighter cream from heavier milk by spinning." },
      { questionText: "Distillation is used to separate:", optionA: "Two miscible liquids with different boiling points", optionB: "Two immiscible liquids", optionC: "A solid from a liquid", optionD: "Gases from liquids", correctOption: "A", solution: "Distillation separates miscible liquids based on differences in their boiling points." },
      { questionText: "Chromatography is used to separate:", optionA: "Insoluble solids from liquids", optionB: "Components of dyes", optionC: "Immiscible liquids", optionD: "Gases", correctOption: "B", solution: "Chromatography separates mixtures based on different rates of movement of components through a medium." },
      { questionText: "An element is a substance that:", optionA: "Contains two or more types of atoms", optionB: "Can be broken into simpler substances", optionC: "Contains only one type of atom", optionD: "Is always a gas", correctOption: "C", solution: "An element consists of only one type of atom and cannot be broken into simpler substances by chemical means." },
      { questionText: "Water (H₂O) is a:", optionA: "Element", optionB: "Mixture", optionC: "Compound", optionD: "Colloid", correctOption: "C", solution: "Water is a compound formed by chemical combination of hydrogen and oxygen in a fixed ratio." },
      { questionText: "Which of the following is a compound?", optionA: "Air", optionB: "Gold", optionC: "Sodium chloride", optionD: "Milk", correctOption: "C", solution: "Sodium chloride (NaCl) is a compound made of Na and Cl in a fixed ratio." },
      { questionText: "Brass is:", optionA: "A compound", optionB: "An element", optionC: "An alloy (mixture)", optionD: "A colloid", correctOption: "C", solution: "Brass is an alloy (homogeneous mixture) of copper and zinc." },
      { questionText: "A saturated solution is one that:", optionA: "Has no solute", optionB: "Can dissolve more solute at the given temperature", optionC: "Cannot dissolve more solute at the given temperature", optionD: "Has no solvent", correctOption: "C", solution: "A saturated solution holds the maximum amount of solute at a given temperature." },
      { questionText: "The process of separating an insoluble solid from a liquid is:", optionA: "Evaporation", optionB: "Distillation", optionC: "Filtration", optionD: "Sublimation", correctOption: "C", solution: "Filtration separates insoluble solids from liquids using a filter paper." },
      { questionText: "To obtain salt from sea water, the most suitable method is:", optionA: "Filtration", optionB: "Distillation", optionC: "Evaporation", optionD: "Sublimation", correctOption: "C", solution: "Evaporation of sea water leaves behind salt crystals." },
      { questionText: "Separating funnel is used to separate:", optionA: "Miscible liquids", optionB: "Immiscible liquids", optionC: "Solid from liquid", optionD: "Gas from liquid", correctOption: "B", solution: "A separating funnel separates immiscible liquids (e.g., oil and water) based on density difference." },
      { questionText: "Which of the following is a heterogeneous mixture?", optionA: "Salt solution", optionB: "Sugar solution", optionC: "Soil", optionD: "Air", correctOption: "C", solution: "Soil has non-uniform composition with visible different components — it is heterogeneous." },
      { questionText: "The concentration of a solution can be expressed as:", optionA: "Mass by mass percentage", optionB: "Volume by volume percentage", optionC: "Mass by volume percentage", optionD: "All of the above", correctOption: "D", solution: "Concentration can be expressed in all three ways depending on the type of solution." },
      { questionText: "Iron filings can be separated from sand using:", optionA: "Filtration", optionB: "Magnet", optionC: "Evaporation", optionD: "Distillation", correctOption: "B", solution: "Iron is magnetic and can be separated from non-magnetic sand using a magnet." },
      { questionText: "A mixture of salt and ammonium chloride can be separated by:", optionA: "Filtration", optionB: "Sublimation", optionC: "Distillation", optionD: "Magnetic separation", correctOption: "B", solution: "Ammonium chloride sublimes on heating, separating it from salt." },
      { questionText: "In a solution, the component present in smaller quantity is the:", optionA: "Solvent", optionB: "Solute", optionC: "Mixture", optionD: "Residue", correctOption: "B", solution: "The solute is the component dissolved in the solvent and is usually present in smaller quantity." },
      { questionText: "Which of these is NOT a physical change?", optionA: "Melting of ice", optionB: "Dissolving sugar in water", optionC: "Rusting of iron", optionD: "Evaporation of water", correctOption: "C", solution: "Rusting of iron is a chemical change (iron reacts with oxygen and moisture). The others are physical changes." },
    ],
  },
  {
    id: "cmmorlvyy001duu7wrxwomuuo",
    name: "Atoms And Molecules",
    subjectId: "cmmn2eljr000xuukshk6fl2yr",
    questions: [
      { questionText: "The law of conservation of mass was given by:", optionA: "Dalton", optionB: "Lavoisier", optionC: "Proust", optionD: "Avogadro", correctOption: "B", solution: "Antoine Lavoisier established the law of conservation of mass in 1789." },
      { questionText: "The law of constant proportions was given by:", optionA: "Dalton", optionB: "Lavoisier", optionC: "Proust", optionD: "Avogadro", correctOption: "C", solution: "Joseph Proust proposed the law of constant (definite) proportions." },
      { questionText: "According to Dalton's atomic theory, atoms:", optionA: "Can be divided", optionB: "Are indivisible", optionC: "Are only found in gases", optionD: "Have different masses for the same element", correctOption: "B", solution: "Dalton proposed that atoms are indivisible particles (though we now know about subatomic particles)." },
      { questionText: "The chemical symbol for sodium is:", optionA: "So", optionB: "S", optionC: "Na", optionD: "Sd", correctOption: "C", solution: "Na comes from the Latin name 'Natrium'." },
      { questionText: "The atomic mass unit (u) is defined as:", optionA: "1/12 the mass of a carbon-12 atom", optionB: "Mass of a hydrogen atom", optionC: "Mass of an oxygen atom", optionD: "1/16 the mass of oxygen", correctOption: "A", solution: "1 u = 1/12 the mass of a carbon-12 atom." },
      { questionText: "The molecular formula of water is:", optionA: "HO", optionB: "H₂O", optionC: "H₂O₂", optionD: "OH₂", correctOption: "B", solution: "Water has 2 hydrogen atoms and 1 oxygen atom: H₂O." },
      { questionText: "Avogadro's number is:", optionA: "6.022 × 10²³", optionB: "6.022 × 10⁻²³", optionC: "6.022 × 10²⁰", optionD: "3.01 × 10²³", correctOption: "A", solution: "Avogadro's number (Nₐ) = 6.022 × 10²³ particles per mole." },
      { questionText: "One mole of any substance contains:", optionA: "6.022 × 10²³ particles", optionB: "6.022 × 10²⁰ particles", optionC: "1 particle", optionD: "12 particles", correctOption: "A", solution: "One mole = 6.022 × 10²³ entities (atoms, molecules, ions, etc.)." },
      { questionText: "The molar mass of CO₂ is:", optionA: "28 g/mol", optionB: "32 g/mol", optionC: "44 g/mol", optionD: "16 g/mol", correctOption: "C", solution: "CO₂: C(12) + 2×O(16) = 12 + 32 = 44 g/mol." },
      { questionText: "The valency of carbon is:", optionA: "1", optionB: "2", optionC: "3", optionD: "4", correctOption: "D", solution: "Carbon has 4 electrons in its outermost shell and needs 4 more to complete its octet, so valency = 4." },
      { questionText: "The chemical formula of calcium oxide is:", optionA: "CaO₂", optionB: "Ca₂O", optionC: "CaO", optionD: "Ca₂O₃", correctOption: "C", solution: "Calcium (Ca²⁺) and oxide (O²⁻) combine in a 1:1 ratio: CaO." },
      { questionText: "The atomicity of ozone (O₃) is:", optionA: "1", optionB: "2", optionC: "3", optionD: "4", correctOption: "C", solution: "Atomicity is the number of atoms in a molecule. O₃ has 3 oxygen atoms, so atomicity = 3." },
      { questionText: "What is the molar mass of NaCl?", optionA: "40 g/mol", optionB: "58.5 g/mol", optionC: "23 g/mol", optionD: "35.5 g/mol", correctOption: "B", solution: "NaCl: Na(23) + Cl(35.5) = 58.5 g/mol." },
      { questionText: "The molecular formula of sulphuric acid is:", optionA: "H₂S", optionB: "H₂SO₃", optionC: "H₂SO₄", optionD: "HSO₄", correctOption: "C", solution: "Sulphuric acid is H₂SO₄: 2 hydrogen, 1 sulphur, and 4 oxygen atoms." },
      { questionText: "An ion with a positive charge is called:", optionA: "Anion", optionB: "Cation", optionC: "Molecule", optionD: "Atom", correctOption: "B", solution: "A cation is a positively charged ion formed by losing electrons." },
      { questionText: "The formula of aluminium oxide is:", optionA: "AlO", optionB: "Al₃O₂", optionC: "Al₂O₃", optionD: "AlO₃", correctOption: "C", solution: "Al³⁺ and O²⁻: cross-multiplying valencies gives Al₂O₃." },
      { questionText: "Which of the following represents 2 molecules of water?", optionA: "H₂O₂", optionB: "2H₂O", optionC: "H₄O₂", optionD: "(H₂O)₂", correctOption: "B", solution: "The coefficient 2 before H₂O indicates 2 molecules: 2H₂O." },
      { questionText: "The mass of 1 mole of oxygen atoms is:", optionA: "32 g", optionB: "16 g", optionC: "8 g", optionD: "48 g", correctOption: "B", solution: "Atomic mass of oxygen = 16 u. So 1 mole of oxygen atoms = 16 g." },
      { questionText: "The formula of magnesium chloride is:", optionA: "MgCl", optionB: "MgCl₂", optionC: "Mg₂Cl", optionD: "Mg₂Cl₃", correctOption: "B", solution: "Mg²⁺ combines with 2 Cl⁻ ions: MgCl₂." },
      { questionText: "The number of atoms in 1 mole of hydrogen gas (H₂) is:", optionA: "6.022 × 10²³", optionB: "12.044 × 10²³", optionC: "3.011 × 10²³", optionD: "1 × 10²³", correctOption: "B", solution: "1 mole of H₂ = 6.022 × 10²³ molecules. Each molecule has 2 atoms. Total atoms = 2 × 6.022 × 10²³ = 12.044 × 10²³." },
      { questionText: "The relative atomic mass of an element is the ratio of its atomic mass to:", optionA: "1/12 of mass of C-12 atom", optionB: "Mass of hydrogen atom", optionC: "Mass of electron", optionD: "1 gram", correctOption: "A", solution: "Relative atomic mass = mass of atom / (1/12 of mass of C-12 atom)." },
      { questionText: "Polyatomic ions are:", optionA: "Single atoms with charge", optionB: "Groups of atoms carrying a charge", optionC: "Neutral molecules", optionD: "Only positive ions", correctOption: "B", solution: "Polyatomic ions are groups of atoms that carry a net charge (e.g., SO₄²⁻, NH₄⁺)." },
      { questionText: "The chemical formula of ammonium sulphate is:", optionA: "NH₄SO₄", optionB: "(NH₄)₂SO₄", optionC: "NH₄(SO₄)₂", optionD: "N₂H₈SO₄", correctOption: "B", solution: "NH₄⁺ (valency 1) and SO₄²⁻ (valency 2): 2 ammonium ions for 1 sulphate gives (NH₄)₂SO₄." },
      { questionText: "The molar mass of methane (CH₄) is:", optionA: "12 g/mol", optionB: "14 g/mol", optionC: "16 g/mol", optionD: "20 g/mol", correctOption: "C", solution: "CH₄: C(12) + 4×H(1) = 16 g/mol." },
      { questionText: "How many moles of water are in 36 g of water?", optionA: "1 mole", optionB: "2 moles", optionC: "0.5 moles", optionD: "18 moles", correctOption: "B", solution: "Molar mass of H₂O = 18 g/mol. Moles = 36/18 = 2 moles." },
    ],
  },
  {
    id: "cmmorlxvh0021uu7w9bwad2w2",
    name: "Structure Of The Atom",
    subjectId: "cmmn2eljr000xuukshk6fl2yr",
    questions: [
      { questionText: "Who discovered the electron?", optionA: "Rutherford", optionB: "Bohr", optionC: "J.J. Thomson", optionD: "Goldstein", correctOption: "C", solution: "J.J. Thomson discovered the electron in 1897 through cathode ray experiments." },
      { questionText: "The charge on an electron is:", optionA: "+1.6 × 10⁻¹⁹ C", optionB: "-1.6 × 10⁻¹⁹ C", optionC: "Zero", optionD: "-1.6 × 10⁻²⁰ C", correctOption: "B", solution: "An electron carries a negative charge of -1.6 × 10⁻¹⁹ coulombs." },
      { questionText: "The nucleus of an atom contains:", optionA: "Electrons and protons", optionB: "Protons and neutrons", optionC: "Electrons and neutrons", optionD: "Only protons", correctOption: "B", solution: "The nucleus contains protons (positive) and neutrons (neutral). Electrons orbit outside." },
      { questionText: "Rutherford's alpha-particle scattering experiment led to the discovery of:", optionA: "Electron", optionB: "Proton", optionC: "Nucleus", optionD: "Neutron", correctOption: "C", solution: "Rutherford's gold foil experiment showed that most of the atom is empty space with a dense, positive nucleus." },
      { questionText: "In Thomson's model of the atom, the atom is described as:", optionA: "A solar system", optionB: "A plum pudding with electrons embedded in positive charge", optionC: "A nucleus with orbiting electrons", optionD: "A neutral particle", correctOption: "B", solution: "Thomson's plum pudding model: electrons embedded in a sphere of positive charge." },
      { questionText: "The atomic number of an element is equal to:", optionA: "Number of neutrons", optionB: "Number of protons", optionC: "Mass number", optionD: "Number of protons + neutrons", correctOption: "B", solution: "Atomic number (Z) = number of protons in the nucleus." },
      { questionText: "Mass number is equal to:", optionA: "Number of protons only", optionB: "Number of electrons", optionC: "Number of protons + number of neutrons", optionD: "Number of neutrons only", correctOption: "C", solution: "Mass number (A) = protons + neutrons." },
      { questionText: "Isotopes are atoms of the same element that have:", optionA: "Same mass number but different atomic number", optionB: "Same atomic number but different mass number", optionC: "Different atomic numbers", optionD: "Same number of neutrons", correctOption: "B", solution: "Isotopes have the same number of protons (same Z) but different numbers of neutrons (different A)." },
      { questionText: "The maximum number of electrons in the first shell (K) is:", optionA: "2", optionB: "8", optionC: "18", optionD: "32", correctOption: "A", solution: "Maximum electrons in shell n = 2n². For K shell (n=1): 2×1² = 2." },
      { questionText: "The maximum number of electrons in the second shell (L) is:", optionA: "2", optionB: "8", optionC: "18", optionD: "32", correctOption: "B", solution: "For L shell (n=2): 2×2² = 8." },
      { questionText: "The maximum number of electrons in the third shell (M) is:", optionA: "2", optionB: "8", optionC: "18", optionD: "32", correctOption: "C", solution: "For M shell (n=3): 2×3² = 18." },
      { questionText: "An atom with 11 protons, 11 electrons, and 12 neutrons has atomic number and mass number:", optionA: "Z=11, A=23", optionB: "Z=12, A=23", optionC: "Z=11, A=22", optionD: "Z=23, A=11", correctOption: "A", solution: "Z = protons = 11. A = protons + neutrons = 11 + 12 = 23. This is sodium." },
      { questionText: "Valence electrons are the electrons present in the:", optionA: "Inner shell", optionB: "Nucleus", optionC: "Outermost shell", optionD: "Second shell always", correctOption: "C", solution: "Valence electrons are in the outermost (valence) shell and determine chemical properties." },
      { questionText: "The electronic configuration of chlorine (Z=17) is:", optionA: "2, 8, 7", optionB: "2, 8, 8", optionC: "2, 7, 8", optionD: "8, 8, 1", correctOption: "A", solution: "17 electrons: K=2, L=8, M=7. Configuration: 2, 8, 7." },
      { questionText: "Which of the following are isobars?", optionA: "¹²C and ¹⁴C", optionB: "⁴⁰Ca and ⁴⁰Ar", optionC: "¹H and ²H", optionD: "¹⁶O and ¹⁷O", correctOption: "B", solution: "Isobars have the same mass number (A=40) but different atomic numbers. Ca-40 and Ar-40 are isobars." },
      { questionText: "Neutron was discovered by:", optionA: "Thomson", optionB: "Rutherford", optionC: "Chadwick", optionD: "Bohr", correctOption: "C", solution: "James Chadwick discovered the neutron in 1932." },
      { questionText: "In Bohr's model of atom, electrons:", optionA: "Move randomly", optionB: "Are embedded in positive charge", optionC: "Revolve in fixed orbits around the nucleus", optionD: "Are inside the nucleus", correctOption: "C", solution: "Bohr proposed that electrons revolve in discrete orbits (energy levels) around the nucleus." },
      { questionText: "The electronic configuration of magnesium (Z=12) is:", optionA: "2, 10", optionB: "2, 8, 2", optionC: "2, 4, 6", optionD: "8, 4", correctOption: "B", solution: "12 electrons: K=2, L=8, M=2. Configuration: 2, 8, 2." },
      { questionText: "Canal rays (positive rays) were discovered by:", optionA: "Thomson", optionB: "Goldstein", optionC: "Rutherford", optionD: "Chadwick", correctOption: "B", solution: "Eugen Goldstein discovered canal rays (anode rays) in 1886." },
      { questionText: "An atom is electrically neutral because:", optionA: "It has equal number of protons and neutrons", optionB: "It has equal number of protons and electrons", optionC: "Neutrons have no charge", optionD: "Electrons have no mass", correctOption: "B", solution: "Equal numbers of protons (+ve) and electrons (-ve) make the atom electrically neutral." },
      { questionText: "The valency of an element with electronic configuration 2, 8, 3 is:", optionA: "2", optionB: "3", optionC: "5", optionD: "8", correctOption: "B", solution: "Valency = number of outermost electrons (if ≤ 4). Here, outermost electrons = 3, so valency = 3." },
      { questionText: "Which of the following is an isotope of hydrogen?", optionA: "Helium", optionB: "Deuterium", optionC: "Carbon-12", optionD: "Neon", correctOption: "B", solution: "Deuterium (²H) is an isotope of hydrogen with 1 proton and 1 neutron." },
      { questionText: "The electronic configuration of argon (Z=18) is:", optionA: "2, 8, 8", optionB: "2, 8, 7, 1", optionC: "2, 10, 6", optionD: "8, 8, 2", correctOption: "A", solution: "18 electrons: K=2, L=8, M=8. Configuration: 2, 8, 8. Argon is a noble gas." },
      { questionText: "An atom with 8 protons and 8 neutrons is:", optionA: "Carbon", optionB: "Nitrogen", optionC: "Oxygen", optionD: "Fluorine", correctOption: "C", solution: "Z = 8 protons = Oxygen. Mass number = 8+8 = 16 (O-16)." },
      { questionText: "The number of electrons in Na⁺ ion is:", optionA: "11", optionB: "12", optionC: "10", optionD: "23", correctOption: "C", solution: "Sodium (Z=11) has 11 electrons. Na⁺ has lost 1 electron, so it has 10 electrons." },
    ],
  },
];

async function main() {
  console.log("=== Seeding Class 9 Physics & Chemistry Quiz Questions ===\n");

  // Check for any missing chapters
  const allChapterIds = chapters.map((c) => c.id);
  const existingChapters = await prisma.chapter.findMany({
    where: { id: { in: allChapterIds } },
    select: { id: true, name: true },
  });
  const existingIds = new Set(existingChapters.map((c) => c.id));

  for (const ch of chapters) {
    if (!existingIds.has(ch.id)) {
      console.log(`Chapter "${ch.name}" (${ch.id}) not found. Creating...`);
      // Get max order for the subject
      const maxOrder = await prisma.chapter.aggregate({
        where: { subjectId: ch.subjectId },
        _max: { order: true },
      });
      await prisma.chapter.create({
        data: {
          id: ch.id,
          subjectId: ch.subjectId,
          name: ch.name,
          order: (maxOrder._max.order || 0) + 1,
        },
      });
      console.log(`  Created chapter "${ch.name}".`);
    }
  }

  let totalInserted = 0;

  for (const ch of chapters) {
    console.log(`\nProcessing: ${ch.name} (${ch.id})`);

    // Delete existing questions for this chapter
    const deleted = await prisma.question.deleteMany({
      where: { chapterId: ch.id },
    });
    console.log(`  Deleted ${deleted.count} existing questions.`);

    // Insert new questions
    const data = ch.questions.map((q) => ({
      chapterId: ch.id,
      questionText: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctOption: q.correctOption,
      solution: q.solution,
    }));

    const result = await prisma.question.createMany({ data });
    console.log(`  Inserted ${result.count} questions.`);
    totalInserted += result.count;
  }

  console.log(`\n=== DONE! Total questions inserted: ${totalInserted} ===`);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
