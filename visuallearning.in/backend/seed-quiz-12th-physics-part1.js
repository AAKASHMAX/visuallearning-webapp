const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const chapters = [
  {
    id: "cmmos57db001luuz8welu430o",
    name: "Electrostatic Potential and Capacitance",
    questions: [
      {
        questionText: "The work done in moving a charge of 2 C between two points in an electric field is 12 J. The potential difference between the points is:",
        optionA: "6 V",
        optionB: "24 V",
        optionC: "3 V",
        optionD: "14 V",
        correctOption: "A",
        solution: "V = W/q = 12/2 = 6 V."
      },
      {
        questionText: "The electric potential at a point on the equatorial line of an electric dipole is:",
        optionA: "Positive",
        optionB: "Negative",
        optionC: "Zero",
        optionD: "Depends on the distance",
        correctOption: "C",
        solution: "On the equatorial line of a dipole, the potentials due to +q and -q cancel each other, giving net potential zero."
      },
      {
        questionText: "A parallel plate capacitor has a capacitance of 10 \u00B5F. If the distance between the plates is doubled, the new capacitance is:",
        optionA: "20 \u00B5F",
        optionB: "5 \u00B5F",
        optionC: "10 \u00B5F",
        optionD: "40 \u00B5F",
        correctOption: "B",
        solution: "C = \u03B5\u2080A/d. If d is doubled, C becomes half, i.e., 10/2 = 5 \u00B5F."
      },
      {
        questionText: "Two capacitors of 3 \u00B5F and 6 \u00B5F are connected in series. The equivalent capacitance is:",
        optionA: "9 \u00B5F",
        optionB: "2 \u00B5F",
        optionC: "4.5 \u00B5F",
        optionD: "1 \u00B5F",
        correctOption: "B",
        solution: "1/C = 1/3 + 1/6 = 3/6 = 1/2, so C = 2 \u00B5F."
      },
      {
        questionText: "The energy stored in a capacitor of capacitance C charged to a voltage V is:",
        optionA: "CV",
        optionB: "CV\u00B2",
        optionC: "\u00BDC\u00B2V",
        optionD: "\u00BDCV\u00B2",
        correctOption: "D",
        solution: "Energy stored in a capacitor U = \u00BDCV\u00B2."
      },
      {
        questionText: "Equipotential surfaces due to a point charge are:",
        optionA: "Planes perpendicular to the charge",
        optionB: "Concentric spheres centered on the charge",
        optionC: "Cylinders around the charge",
        optionD: "Parallel planes",
        correctOption: "B",
        solution: "For a point charge, V = kq/r = constant implies r = constant, which represents concentric spheres."
      },
      {
        questionText: "If a dielectric of dielectric constant K is introduced between the plates of a charged isolated capacitor, the energy stored:",
        optionA: "Increases K times",
        optionB: "Decreases K times",
        optionC: "Remains the same",
        optionD: "Becomes zero",
        correctOption: "B",
        solution: "For an isolated capacitor, Q is constant. U = Q\u00B2/(2C). With dielectric, C becomes KC, so U decreases by factor K."
      },
      {
        questionText: "The electric potential at the centre of a uniformly charged conducting sphere of radius R and charge Q is:",
        optionA: "Zero",
        optionB: "kQ/R",
        optionC: "kQ/R\u00B2",
        optionD: "kQR",
        correctOption: "B",
        solution: "The potential inside and on the surface of a conducting sphere is constant and equal to kQ/R."
      },
      {
        questionText: "The capacitance of a spherical conductor of radius R is:",
        optionA: "4\u03C0\u03B5\u2080R\u00B2",
        optionB: "4\u03C0\u03B5\u2080R",
        optionC: "4\u03C0\u03B5\u2080/R",
        optionD: "\u03B5\u2080R",
        correctOption: "B",
        solution: "The capacitance of an isolated spherical conductor is C = 4\u03C0\u03B5\u2080R."
      },
      {
        questionText: "The electrostatic potential energy of a system of two point charges q\u2081 and q\u2082 separated by distance r is:",
        optionA: "kq\u2081q\u2082/r\u00B2",
        optionB: "kq\u2081q\u2082r",
        optionC: "kq\u2081q\u2082/r",
        optionD: "k(q\u2081+q\u2082)/r",
        correctOption: "C",
        solution: "Electrostatic potential energy U = kq\u2081q\u2082/r."
      },
      {
        questionText: "A capacitor is charged to 200 V. It has a capacitance of 500 \u00B5F. The energy stored is:",
        optionA: "10 J",
        optionB: "20 J",
        optionC: "5 J",
        optionD: "50 J",
        correctOption: "A",
        solution: "U = \u00BDCV\u00B2 = \u00BD \u00D7 500 \u00D7 10\u207B\u2076 \u00D7 (200)\u00B2 = \u00BD \u00D7 500 \u00D7 10\u207B\u2076 \u00D7 40000 = 10 J."
      },
      {
        questionText: "The angle between the electric field and the equipotential surface is always:",
        optionA: "0\u00B0",
        optionB: "45\u00B0",
        optionC: "90\u00B0",
        optionD: "180\u00B0",
        correctOption: "C",
        solution: "Electric field lines are always perpendicular to equipotential surfaces."
      },
      {
        questionText: "The potential at a point due to a charge of 4 \u00D7 10\u207B\u2077 C located 9 cm away is (k = 9 \u00D7 10\u2079 Nm\u00B2/C\u00B2):",
        optionA: "4 \u00D7 10\u2074 V",
        optionB: "4 \u00D7 10\u2073 V",
        optionC: "36 \u00D7 10\u2073 V",
        optionD: "4 V",
        correctOption: "A",
        solution: "V = kq/r = 9\u00D710\u2079 \u00D7 4\u00D710\u207B\u2077 / 0.09 = 36\u00D710\u00B2 / 0.09 = 4 \u00D7 10\u2074 V."
      },
      {
        questionText: "Three capacitors of capacitances 2 \u00B5F, 3 \u00B5F and 6 \u00B5F are connected in parallel. The equivalent capacitance is:",
        optionA: "1 \u00B5F",
        optionB: "11 \u00B5F",
        optionC: "0.5 \u00B5F",
        optionD: "6 \u00B5F",
        correctOption: "B",
        solution: "In parallel, C_eq = C\u2081 + C\u2082 + C\u2083 = 2 + 3 + 6 = 11 \u00B5F."
      },
      {
        questionText: "If the potential at a point is zero, then the electric field at that point is:",
        optionA: "Necessarily zero",
        optionB: "Not necessarily zero",
        optionC: "Always directed upward",
        optionD: "Infinite",
        correctOption: "B",
        solution: "E = -dV/dr. Even if V = 0 at a point, its gradient may not be zero. Example: midpoint of a dipole."
      },
      {
        questionText: "A Van de Graaff generator produces a potential difference of:",
        optionA: "A few hundred volts",
        optionB: "A few thousand volts",
        optionC: "Several million volts",
        optionD: "A few volts",
        correctOption: "C",
        solution: "A Van de Graaff generator can build up potential differences of several million volts."
      },
      {
        questionText: "The dielectric constant of a metal is:",
        optionA: "0",
        optionB: "1",
        optionC: "Infinity",
        optionD: "-1",
        correctOption: "C",
        solution: "A metal is a perfect conductor. The electric field inside it is zero, implying infinite dielectric constant."
      },
      {
        questionText: "On inserting a dielectric slab of dielectric constant K in a parallel plate capacitor connected to a battery, the charge on the plates:",
        optionA: "Decreases K times",
        optionB: "Increases K times",
        optionC: "Remains the same",
        optionD: "Becomes zero",
        correctOption: "B",
        solution: "With battery connected, V is constant. C becomes KC. Since Q = CV, Q increases K times."
      },
      {
        questionText: "The potential difference between two points in an electric field is independent of:",
        optionA: "The path followed between the two points",
        optionB: "The magnitude of the charges creating the field",
        optionC: "The distance between the points",
        optionD: "The permittivity of the medium",
        correctOption: "A",
        solution: "Electrostatic force is conservative, so the potential difference is path-independent."
      },
      {
        questionText: "A capacitor of 6 \u00B5F is charged to 100 V and then connected to an uncharged capacitor of 14 \u00B5F. The final voltage across the combination is:",
        optionA: "100 V",
        optionB: "50 V",
        optionC: "30 V",
        optionD: "60 V",
        correctOption: "C",
        solution: "Charge is conserved: Q = 6\u00D710\u207B\u2076 \u00D7 100 = 600 \u00B5C. V = Q/(C\u2081+C\u2082) = 600/20 = 30 V."
      },
      {
        questionText: "An electron is moved from a point at potential 100 V to a point at potential 50 V. The work done by the electric field is:",
        optionA: "-50 eV",
        optionB: "50 eV",
        optionC: "-8 \u00D7 10\u207B\u00B9\u2078 J",
        optionD: "8 \u00D7 10\u207B\u00B9\u2078 J",
        correctOption: "C",
        solution: "W = q(V_i - V_f) = (-1.6\u00D710\u207B\u00B9\u2079)(100-50) = -8\u00D710\u207B\u00B9\u2078 J."
      },
      {
        questionText: "The capacitance of a parallel plate capacitor with air between the plates is 8 pF. What will be the capacitance if the distance between the plates is halved and the space is filled with a dielectric of K = 6?",
        optionA: "96 pF",
        optionB: "48 pF",
        optionC: "24 pF",
        optionD: "16 pF",
        correctOption: "A",
        solution: "C = K\u03B5\u2080A/d. Halving d doubles C and dielectric multiplies by K. C' = 8 \u00D7 2 \u00D7 6 = 96 pF."
      },
      {
        questionText: "The work done in carrying a charge q once around a circle of radius r with a charge Q at the centre is:",
        optionA: "kQq/r",
        optionB: "kQq/r\u00B2",
        optionC: "kQq \u00D7 2\u03C0r",
        optionD: "Zero",
        correctOption: "D",
        solution: "The start and end points are the same, and the electrostatic force is conservative, so W = 0."
      },
      {
        questionText: "In a region where the electric field is uniform, the equipotential surfaces are:",
        optionA: "Concentric spheres",
        optionB: "Concentric cylinders",
        optionC: "Parallel planes perpendicular to the field",
        optionD: "Irregular surfaces",
        correctOption: "C",
        solution: "For a uniform electric field, equipotential surfaces are parallel planes perpendicular to the field direction."
      },
      {
        questionText: "A capacitor of capacitance C is charged to voltage V and disconnected. If the separation between the plates is doubled, the new voltage is:",
        optionA: "V/2",
        optionB: "V",
        optionC: "2V",
        optionD: "4V",
        correctOption: "C",
        solution: "Charge Q is constant. C' = C/2 (since d is doubled). V' = Q/C' = Q/(C/2) = 2Q/C = 2V."
      }
    ]
  },
  {
    id: "cmmos599p002huuz88adwg9ab",
    name: "Current Electricity",
    questions: [
      {
        questionText: "The SI unit of electric current is:",
        optionA: "Volt",
        optionB: "Ohm",
        optionC: "Ampere",
        optionD: "Coulomb",
        correctOption: "C",
        solution: "The SI unit of electric current is Ampere (A), defined as 1 coulomb per second."
      },
      {
        questionText: "A wire of resistance 12 \u03A9 is bent in the form of a circle. The effective resistance between two diametrically opposite points is:",
        optionA: "12 \u03A9",
        optionB: "6 \u03A9",
        optionC: "3 \u03A9",
        optionD: "24 \u03A9",
        correctOption: "C",
        solution: "Each semicircle has resistance 6 \u03A9. Two 6 \u03A9 resistors in parallel: R = 6\u00D76/(6+6) = 3 \u03A9."
      },
      {
        questionText: "The drift velocity of electrons in a conductor is of the order of:",
        optionA: "10\u2076 m/s",
        optionB: "10\u207B\u2074 m/s",
        optionC: "3 \u00D7 10\u2078 m/s",
        optionD: "10\u00B2 m/s",
        correctOption: "B",
        solution: "Drift velocity is typically very small, of the order of 10\u207B\u2074 m/s or about 1 mm/s."
      },
      {
        questionText: "Kirchhoff's junction rule is based on the conservation of:",
        optionA: "Energy",
        optionB: "Momentum",
        optionC: "Charge",
        optionD: "Mass",
        correctOption: "C",
        solution: "Kirchhoff's junction (current) rule states that the algebraic sum of currents at a junction is zero, based on conservation of charge."
      },
      {
        questionText: "The temperature coefficient of resistance is negative for:",
        optionA: "Copper",
        optionB: "Aluminium",
        optionC: "Silicon",
        optionD: "Silver",
        correctOption: "C",
        solution: "Semiconductors like silicon have a negative temperature coefficient of resistance; their resistance decreases with temperature."
      },
      {
        questionText: "A cell of emf 2 V and internal resistance 0.5 \u03A9 is connected to a 3.5 \u03A9 resistor. The current in the circuit is:",
        optionA: "0.25 A",
        optionB: "0.5 A",
        optionC: "1 A",
        optionD: "2 A",
        correctOption: "B",
        solution: "I = emf/(R + r) = 2/(3.5 + 0.5) = 2/4 = 0.5 A."
      },
      {
        questionText: "The resistivity of a conductor depends on:",
        optionA: "Length of the conductor",
        optionB: "Area of cross-section",
        optionC: "Nature of the material and temperature",
        optionD: "Shape of the conductor",
        correctOption: "C",
        solution: "Resistivity is an intrinsic property that depends on the material and its temperature, not on dimensions."
      },
      {
        questionText: "A potentiometer is preferred over a voltmeter for measuring emf because:",
        optionA: "It is cheaper",
        optionB: "It draws no current from the cell at balance",
        optionC: "It is more portable",
        optionD: "It gives a digital reading",
        correctOption: "B",
        solution: "At the balance point, no current flows through the cell, so there is no drop across internal resistance and true emf is measured."
      },
      {
        questionText: "The colour code of a 470 \u03A9 resistor with 5% tolerance is:",
        optionA: "Yellow, Violet, Brown, Gold",
        optionB: "Yellow, Violet, Red, Gold",
        optionC: "Red, Violet, Brown, Gold",
        optionD: "Yellow, Green, Brown, Gold",
        correctOption: "A",
        solution: "4 = Yellow, 7 = Violet, multiplier 10\u00B9 = Brown, 5% = Gold. So Yellow, Violet, Brown, Gold."
      },
      {
        questionText: "Two cells of emf 1.5 V and 2 V with internal resistances 1 \u03A9 and 2 \u03A9 respectively are connected in parallel. The equivalent emf is:",
        optionA: "1.5 V",
        optionB: "2 V",
        optionC: "5/3 V",
        optionD: "3.5 V",
        correctOption: "C",
        solution: "E_eq = (E\u2081/r\u2081 + E\u2082/r\u2082)/(1/r\u2081 + 1/r\u2082) = (1.5/1 + 2/2)/(1/1 + 1/2) = (1.5+1)/(1.5) = 5/3 V."
      },
      {
        questionText: "In a Wheatstone bridge, if P = 100 \u03A9, Q = 200 \u03A9 and R = 40 \u03A9, the value of S for the bridge to be balanced is:",
        optionA: "20 \u03A9",
        optionB: "80 \u03A9",
        optionC: "100 \u03A9",
        optionD: "200 \u03A9",
        correctOption: "B",
        solution: "For a balanced Wheatstone bridge, P/Q = R/S. So S = QR/P = 200\u00D740/100 = 80 \u03A9."
      },
      {
        questionText: "The maximum current that can be drawn from a cell of emf E and internal resistance r is:",
        optionA: "E/r",
        optionB: "Er",
        optionC: "E/2r",
        optionD: "2E/r",
        correctOption: "A",
        solution: "Maximum current occurs when external resistance is zero (short circuit): I_max = E/r."
      },
      {
        questionText: "A copper wire is stretched to double its length. Its new resistance becomes:",
        optionA: "Half",
        optionB: "Double",
        optionC: "Four times",
        optionD: "Same",
        correctOption: "C",
        solution: "Volume is constant. If length doubles, area halves. R = \u03C1L/A. New R = \u03C1(2L)/(A/2) = 4\u03C1L/A = 4R."
      },
      {
        questionText: "Which of the following materials has the highest resistivity?",
        optionA: "Copper",
        optionB: "Silver",
        optionC: "Nichrome",
        optionD: "Aluminium",
        correctOption: "C",
        solution: "Nichrome (an alloy) has much higher resistivity (~1.5 \u00D7 10\u207B\u2076 \u03A9m) compared to pure metals like copper or silver."
      },
      {
        questionText: "The power dissipated in a resistance R carrying current I is:",
        optionA: "IR",
        optionB: "IR\u00B2",
        optionC: "I\u00B2R",
        optionD: "I\u00B2/R",
        correctOption: "C",
        solution: "Power P = I\u00B2R."
      },
      {
        questionText: "Kirchhoff's loop rule is based on the conservation of:",
        optionA: "Charge",
        optionB: "Energy",
        optionC: "Momentum",
        optionD: "Mass",
        correctOption: "B",
        solution: "Kirchhoff's loop (voltage) rule states that the sum of potential differences around a closed loop is zero, based on conservation of energy."
      },
      {
        questionText: "The internal resistance of an ideal ammeter is:",
        optionA: "Infinite",
        optionB: "Very high",
        optionC: "Zero",
        optionD: "Equal to the external resistance",
        correctOption: "C",
        solution: "An ideal ammeter has zero internal resistance so it does not affect the current being measured."
      },
      {
        questionText: "Five resistors of 10 \u03A9 each are connected in parallel. The equivalent resistance is:",
        optionA: "50 \u03A9",
        optionB: "10 \u03A9",
        optionC: "5 \u03A9",
        optionD: "2 \u03A9",
        correctOption: "D",
        solution: "For n equal resistors in parallel: R_eq = R/n = 10/5 = 2 \u03A9."
      },
      {
        questionText: "A meter bridge uses the principle of:",
        optionA: "Ampere's law",
        optionB: "Faraday's law",
        optionC: "Wheatstone bridge",
        optionD: "Potentiometer",
        correctOption: "C",
        solution: "A meter bridge works on the principle of a balanced Wheatstone bridge."
      },
      {
        questionText: "The mobility of charge carriers in a conductor is defined as:",
        optionA: "Drift velocity per unit electric field",
        optionB: "Current per unit area",
        optionC: "Charge per unit time",
        optionD: "Conductivity per unit length",
        correctOption: "A",
        solution: "Mobility \u00B5 = v_d/E, the drift velocity per unit electric field."
      },
      {
        questionText: "The terminal voltage of a cell is less than its emf when it is:",
        optionA: "In open circuit",
        optionB: "Being charged",
        optionC: "Supplying current (discharging)",
        optionD: "Disconnected",
        correctOption: "C",
        solution: "During discharging, V = E - Ir, so terminal voltage is less than emf due to the internal resistance drop."
      },
      {
        questionText: "Two bulbs rated 25 W and 100 W at 220 V are connected in series to a 220 V supply. Which bulb glows brighter?",
        optionA: "25 W bulb",
        optionB: "100 W bulb",
        optionC: "Both glow equally",
        optionD: "Neither glows",
        correctOption: "A",
        solution: "In series, the same current flows. The 25 W bulb has higher resistance (R = V\u00B2/P), so more power (P = I\u00B2R) is dissipated in it."
      },
      {
        questionText: "The current density in a conductor is related to drift velocity v_d by:",
        optionA: "J = nev_d",
        optionB: "J = ne/v_d",
        optionC: "J = v_d/ne",
        optionD: "J = n\u00B2ev_d",
        correctOption: "A",
        solution: "Current density J = nev_d, where n is number density of free electrons, e is charge, v_d is drift velocity."
      },
      {
        questionText: "The sensitivity of a potentiometer can be increased by:",
        optionA: "Increasing the emf of the driver cell",
        optionB: "Decreasing the length of the potentiometer wire",
        optionC: "Increasing the length of the potentiometer wire",
        optionD: "Using a thicker wire",
        correctOption: "C",
        solution: "Increasing wire length decreases the potential gradient (V/L), making the potentiometer more sensitive to small potential differences."
      },
      {
        questionText: "The relaxation time of free electrons in a conductor decreases with:",
        optionA: "Decrease in temperature",
        optionB: "Increase in temperature",
        optionC: "Decrease in length",
        optionD: "Increase in cross-sectional area",
        correctOption: "B",
        solution: "Higher temperature increases lattice vibrations, causing more frequent collisions and thus a shorter relaxation time."
      }
    ]
  },
  {
    id: "cmmos5dme003xuuz8vu2ie0zj",
    name: "Moving Charges and Magnetism",
    questions: [
      {
        questionText: "A charged particle moving parallel to a magnetic field experiences:",
        optionA: "Maximum force",
        optionB: "Minimum but non-zero force",
        optionC: "Zero force",
        optionD: "Force perpendicular to both v and B",
        correctOption: "C",
        solution: "F = qvB sin\u03B8. When v is parallel to B, \u03B8 = 0, so sin\u03B8 = 0 and F = 0."
      },
      {
        questionText: "The magnetic field at the centre of a circular loop of radius R carrying current I is:",
        optionA: "\u00B5\u2080I/R",
        optionB: "\u00B5\u2080I/2R",
        optionC: "\u00B5\u2080I/4\u03C0R",
        optionD: "\u00B5\u2080I\u00B2/2R",
        correctOption: "B",
        solution: "The magnetic field at the centre of a circular loop is B = \u00B5\u2080I/2R."
      },
      {
        questionText: "An electron enters a uniform magnetic field perpendicular to it. The path of the electron is:",
        optionA: "Straight line",
        optionB: "Parabola",
        optionC: "Circle",
        optionD: "Ellipse",
        correctOption: "C",
        solution: "When a charged particle enters perpendicular to a uniform magnetic field, the force provides centripetal acceleration, resulting in circular motion."
      },
      {
        questionText: "The force per unit length between two long parallel wires carrying currents I\u2081 and I\u2082 separated by distance d is:",
        optionA: "\u00B5\u2080I\u2081I\u2082/2\u03C0d",
        optionB: "\u00B5\u2080I\u2081I\u2082/4\u03C0d",
        optionC: "\u00B5\u2080I\u2081I\u2082/d\u00B2",
        optionD: "\u00B5\u2080I\u2081I\u2082d/2\u03C0",
        correctOption: "A",
        solution: "F/L = \u00B5\u2080I\u2081I\u2082/(2\u03C0d). This is used to define the ampere."
      },
      {
        questionText: "A solenoid of N turns, length L, carrying current I has a magnetic field inside it equal to:",
        optionA: "\u00B5\u2080NI",
        optionB: "\u00B5\u2080NI/L",
        optionC: "\u00B5\u2080NI/2L",
        optionD: "\u00B5\u2080I/2L",
        correctOption: "B",
        solution: "B = \u00B5\u2080nI = \u00B5\u2080(N/L)I = \u00B5\u2080NI/L."
      },
      {
        questionText: "The magnetic moment of a current loop of area A carrying current I is:",
        optionA: "IA\u00B2",
        optionB: "I/A",
        optionC: "IA",
        optionD: "I\u00B2A",
        correctOption: "C",
        solution: "Magnetic moment m = NIA. For a single loop, N = 1, so m = IA."
      },
      {
        questionText: "Ampere's circuital law states that:",
        optionA: "The line integral of B around a closed loop equals \u00B5\u2080 times the enclosed current",
        optionB: "The flux of B through a closed surface is zero",
        optionC: "Magnetic monopoles exist",
        optionD: "The force between two charges is inversely proportional to the square of the distance",
        correctOption: "A",
        solution: "Ampere's law: \u222EB\u00B7dl = \u00B5\u2080I_enclosed."
      },
      {
        questionText: "Two parallel wires carrying currents in the same direction:",
        optionA: "Repel each other",
        optionB: "Attract each other",
        optionC: "Do not exert any force",
        optionD: "First attract then repel",
        correctOption: "B",
        solution: "Parallel currents in the same direction attract each other, as can be shown using the right-hand rule and force on a current-carrying conductor."
      },
      {
        questionText: "The radius of the circular orbit of a charged particle of mass m, charge q, moving with velocity v perpendicular to magnetic field B is:",
        optionA: "mv/qB",
        optionB: "qB/mv",
        optionC: "mvB/q",
        optionD: "qv/mB",
        correctOption: "A",
        solution: "Equating centripetal force to magnetic force: mv\u00B2/r = qvB, so r = mv/(qB)."
      },
      {
        questionText: "A galvanometer can be converted into a voltmeter by connecting:",
        optionA: "A low resistance in parallel",
        optionB: "A high resistance in series",
        optionC: "A low resistance in series",
        optionD: "A high resistance in parallel",
        correctOption: "B",
        solution: "A high resistance in series limits the current through the galvanometer and allows it to measure large potential differences."
      },
      {
        questionText: "The Biot-Savart law gives the magnetic field due to:",
        optionA: "A stationary charge",
        optionB: "A small current element",
        optionC: "A magnetic monopole",
        optionD: "A changing electric field",
        correctOption: "B",
        solution: "Biot-Savart law gives the magnetic field dB due to a small current element Idl at a point in space."
      },
      {
        questionText: "A current-carrying rectangular loop placed in a uniform magnetic field experiences:",
        optionA: "A net force",
        optionB: "A net torque",
        optionC: "Both net force and torque",
        optionD: "Neither force nor torque",
        correctOption: "B",
        solution: "In a uniform field, forces on opposite sides cancel (zero net force) but create a couple, producing a net torque \u03C4 = NBIA sin\u03B8."
      },
      {
        questionText: "The time period of a charged particle moving in a circle in a magnetic field depends on:",
        optionA: "Speed of the particle",
        optionB: "Radius of the circle",
        optionC: "Charge to mass ratio only",
        optionD: "Both speed and magnetic field",
        correctOption: "C",
        solution: "T = 2\u03C0m/(qB). The time period depends only on m/q ratio and B, not on speed or radius."
      },
      {
        questionText: "The magnetic field due to a straight infinite current-carrying wire at distance r is:",
        optionA: "\u00B5\u2080I/2\u03C0r",
        optionB: "\u00B5\u2080I/4\u03C0r",
        optionC: "\u00B5\u2080I/r",
        optionD: "\u00B5\u2080I/4\u03C0r\u00B2",
        correctOption: "A",
        solution: "By Ampere's law or Biot-Savart law, B = \u00B5\u2080I/(2\u03C0r) for an infinite straight conductor."
      },
      {
        questionText: "A galvanometer is converted into an ammeter by connecting:",
        optionA: "A high resistance in series",
        optionB: "A high resistance in parallel",
        optionC: "A low resistance (shunt) in parallel",
        optionD: "A low resistance in series",
        correctOption: "C",
        solution: "A low-resistance shunt in parallel allows most current to bypass the galvanometer while keeping the total current measurable."
      },
      {
        questionText: "The torque on a magnetic dipole of moment M in a uniform magnetic field B is:",
        optionA: "M \u00D7 B",
        optionB: "M \u00B7 B",
        optionC: "M + B",
        optionD: "M / B",
        correctOption: "A",
        solution: "\u03C4 = M \u00D7 B. The torque is the cross product of the magnetic moment and the magnetic field."
      },
      {
        questionText: "A proton and an alpha particle enter a magnetic field with the same velocity. The ratio of the radii of their circular paths (r_p/r_\u03B1) is:",
        optionA: "1:2",
        optionB: "1:1",
        optionC: "2:1",
        optionD: "1:4",
        correctOption: "A",
        solution: "r = mv/(qB). r_p/r_\u03B1 = (m_p/q_p)/(m_\u03B1/q_\u03B1) = (m_p \u00D7 q_\u03B1)/(m_\u03B1 \u00D7 q_p) = (1\u00D72)/(4\u00D71) = 1/2. So r_p:r_\u03B1 = 1:2."
      },
      {
        questionText: "The magnetic field inside a toroid of N turns, mean radius R, carrying current I is:",
        optionA: "\u00B5\u2080NI/(2\u03C0R)",
        optionB: "\u00B5\u2080NI/R",
        optionC: "\u00B5\u2080NI/(4\u03C0R)",
        optionD: "Zero",
        correctOption: "A",
        solution: "Using Ampere's law: B \u00D7 2\u03C0R = \u00B5\u2080NI, so B = \u00B5\u2080NI/(2\u03C0R)."
      },
      {
        questionText: "If a charged particle enters a magnetic field at an angle (not 0\u00B0 or 90\u00B0), the path is:",
        optionA: "Circle",
        optionB: "Straight line",
        optionC: "Helix",
        optionD: "Parabola",
        correctOption: "C",
        solution: "The component perpendicular to B causes circular motion while the parallel component causes linear motion, resulting in a helix."
      },
      {
        questionText: "The magnetic field at a point on the axis of a circular coil at a large distance x from the centre varies as:",
        optionA: "1/x",
        optionB: "1/x\u00B2",
        optionC: "1/x\u00B3",
        optionD: "1/x\u2074",
        correctOption: "C",
        solution: "At large distance, B = \u00B5\u2080IR\u00B2/(2(R\u00B2+x\u00B2)^(3/2)) \u2248 \u00B5\u2080IR\u00B2/(2x\u00B3), so B varies as 1/x\u00B3."
      },
      {
        questionText: "The sensitivity of a moving coil galvanometer can be increased by:",
        optionA: "Increasing the spring constant",
        optionB: "Decreasing the number of turns",
        optionC: "Using a stronger magnetic field",
        optionD: "Decreasing the area of the coil",
        correctOption: "C",
        solution: "Sensitivity \u03B8/I = NBA/k. Using a stronger B increases sensitivity."
      },
      {
        questionText: "A cyclotron is used to accelerate:",
        optionA: "Electrons",
        optionB: "Neutrons",
        optionC: "Protons and heavy ions",
        optionD: "Photons",
        correctOption: "C",
        solution: "A cyclotron accelerates charged heavy particles like protons, deuterons, and alpha particles. It cannot efficiently accelerate electrons due to relativistic effects."
      },
      {
        questionText: "The force on a charge q moving with velocity v in a magnetic field B is given by:",
        optionA: "F = qv\u00B7B",
        optionB: "F = q(v \u00D7 B)",
        optionC: "F = qvB",
        optionD: "F = qB/v",
        correctOption: "B",
        solution: "The Lorentz magnetic force is F = q(v \u00D7 B), a cross product of velocity and magnetic field."
      },
      {
        questionText: "The net magnetic flux through any closed surface is:",
        optionA: "\u00B5\u2080I",
        optionB: "Positive",
        optionC: "Negative",
        optionD: "Zero",
        correctOption: "D",
        solution: "Gauss's law for magnetism states that the net magnetic flux through a closed surface is always zero, as magnetic monopoles do not exist."
      },
      {
        questionText: "In a moving coil galvanometer, a radial magnetic field is used so that:",
        optionA: "The deflection is proportional to the square of the current",
        optionB: "The deflection is proportional to the current",
        optionC: "The coil can rotate freely",
        optionD: "The magnetic field is maximum",
        correctOption: "B",
        solution: "Radial field ensures the plane of the coil is always parallel to B, making torque = NBIA and deflection linearly proportional to current."
      }
    ]
  },
  {
    id: "cmmos5fvm0059uuz8y4fgi4k9",
    name: "Magnetism and Matter",
    questions: [
      {
        questionText: "The angle between the geographic and magnetic meridian at a place is called:",
        optionA: "Angle of dip",
        optionB: "Angle of declination",
        optionC: "Magnetic inclination",
        optionD: "Magnetic latitude",
        correctOption: "B",
        solution: "The angle of declination is the angle between the geographic meridian and the magnetic meridian at a place."
      },
      {
        questionText: "At the magnetic poles of the Earth, the angle of dip is:",
        optionA: "0\u00B0",
        optionB: "45\u00B0",
        optionC: "90\u00B0",
        optionD: "60\u00B0",
        correctOption: "C",
        solution: "At the magnetic poles, the Earth's magnetic field is vertical, so the angle of dip is 90\u00B0."
      },
      {
        questionText: "Diamagnetic substances are:",
        optionA: "Weakly attracted by a magnet",
        optionB: "Strongly attracted by a magnet",
        optionC: "Weakly repelled by a magnet",
        optionD: "Not affected by a magnet",
        correctOption: "C",
        solution: "Diamagnetic substances have a small negative susceptibility and are weakly repelled by a magnetic field."
      },
      {
        questionText: "The susceptibility of a ferromagnetic material is:",
        optionA: "Small and negative",
        optionB: "Small and positive",
        optionC: "Very large and positive",
        optionD: "Zero",
        correctOption: "C",
        solution: "Ferromagnetic materials have very large positive susceptibility, often of the order of thousands."
      },
      {
        questionText: "The magnetic susceptibility of a paramagnetic substance varies with temperature T as:",
        optionA: "\u03C7 \u221D T",
        optionB: "\u03C7 \u221D 1/T",
        optionC: "\u03C7 \u221D T\u00B2",
        optionD: "\u03C7 is independent of T",
        correctOption: "B",
        solution: "By Curie's law, \u03C7 = C/T, so susceptibility is inversely proportional to absolute temperature."
      },
      {
        questionText: "Which of the following is a diamagnetic substance?",
        optionA: "Iron",
        optionB: "Aluminium",
        optionC: "Bismuth",
        optionD: "Chromium",
        correctOption: "C",
        solution: "Bismuth is a classic example of a diamagnetic material. It is repelled by magnetic fields."
      },
      {
        questionText: "The SI unit of magnetic permeability is:",
        optionA: "Henry/metre",
        optionB: "Tesla",
        optionC: "Weber",
        optionD: "Ampere/metre",
        correctOption: "A",
        solution: "Magnetic permeability \u00B5 has SI unit of henry per metre (H/m) or equivalently T\u00B7m/A."
      },
      {
        questionText: "Hysteresis loss in a ferromagnetic material depends on:",
        optionA: "The coercivity of the material",
        optionB: "The area of the hysteresis loop",
        optionC: "The saturation magnetization only",
        optionD: "The applied frequency only",
        correctOption: "B",
        solution: "The energy dissipated per cycle of magnetization equals the area of the hysteresis loop."
      },
      {
        questionText: "The temperature above which a ferromagnetic substance becomes paramagnetic is called:",
        optionA: "Neel temperature",
        optionB: "Curie temperature",
        optionC: "Boyle temperature",
        optionD: "Critical temperature",
        correctOption: "B",
        solution: "The Curie temperature is the temperature above which a ferromagnetic material loses its ferromagnetism and becomes paramagnetic."
      },
      {
        questionText: "The horizontal component of Earth's magnetic field at the equator is:",
        optionA: "Zero",
        optionB: "Maximum",
        optionC: "Equal to the vertical component",
        optionD: "Half of the total field",
        correctOption: "B",
        solution: "At the equator, the dip angle is 0\u00B0, so B_H = B cos(0\u00B0) = B. The horizontal component equals the total field and is maximum."
      },
      {
        questionText: "The relation between magnetic susceptibility (\u03C7) and relative permeability (\u00B5_r) is:",
        optionA: "\u00B5_r = 1 + \u03C7",
        optionB: "\u00B5_r = 1 - \u03C7",
        optionC: "\u00B5_r = \u03C7",
        optionD: "\u00B5_r = \u03C7\u00B2",
        correctOption: "A",
        solution: "\u00B5_r = 1 + \u03C7. This follows from B = \u00B5\u2080(H + M) = \u00B5\u2080(1 + \u03C7)H."
      },
      {
        questionText: "An iron bar magnet is heated to a temperature above its Curie temperature. It will:",
        optionA: "Become a stronger magnet",
        optionB: "Lose its magnetism",
        optionC: "Become an electromagnet",
        optionD: "Reverse its polarity",
        correctOption: "B",
        solution: "Above the Curie temperature, domain alignment is destroyed by thermal agitation and the material becomes paramagnetic."
      },
      {
        questionText: "The magnetic field lines inside a bar magnet go from:",
        optionA: "North to South pole",
        optionB: "South to North pole",
        optionC: "Are absent inside the magnet",
        optionD: "Are randomly oriented",
        correctOption: "B",
        solution: "Inside a bar magnet, field lines run from the south pole to the north pole, forming continuous closed loops."
      },
      {
        questionText: "Soft iron is used for making electromagnets because it has:",
        optionA: "High coercivity and high retentivity",
        optionB: "Low coercivity and high retentivity",
        optionC: "Low coercivity and low retentivity",
        optionD: "High coercivity and low retentivity",
        correctOption: "C",
        solution: "Soft iron has low coercivity (easily magnetized and demagnetized) and low retentivity, ideal for electromagnets."
      },
      {
        questionText: "The intensity of magnetisation (M) is defined as:",
        optionA: "Magnetic moment per unit volume",
        optionB: "Magnetic moment per unit area",
        optionC: "Magnetic flux per unit area",
        optionD: "Magnetic field per unit length",
        correctOption: "A",
        solution: "Magnetisation M = magnetic moment / volume. It represents the net magnetic moment per unit volume."
      },
      {
        questionText: "Which of the following is used for making permanent magnets?",
        optionA: "Soft iron",
        optionB: "Steel (Alnico)",
        optionC: "Copper",
        optionD: "Aluminium",
        correctOption: "B",
        solution: "Steel and special alloys like Alnico have high coercivity and retentivity, making them suitable for permanent magnets."
      },
      {
        questionText: "A magnetic needle suspended freely in a uniform magnetic field aligns itself:",
        optionA: "Perpendicular to the field",
        optionB: "Along the field direction",
        optionC: "At 45\u00B0 to the field",
        optionD: "In any random direction",
        correctOption: "B",
        solution: "A magnetic needle (dipole) aligns along the external magnetic field to minimize potential energy."
      },
      {
        questionText: "The vertical component of Earth's magnetic field at a place where angle of dip is 60\u00B0 and horizontal component is 0.3 G is:",
        optionA: "0.3 G",
        optionB: "0.3\u221A3 G",
        optionC: "0.6 G",
        optionD: "0.15 G",
        correctOption: "B",
        solution: "tan(60\u00B0) = B_V/B_H, so B_V = B_H \u00D7 tan(60\u00B0) = 0.3 \u00D7 \u221A3 = 0.3\u221A3 G."
      },
      {
        questionText: "Magnetic field lines:",
        optionA: "Can cross each other",
        optionB: "Always form closed loops",
        optionC: "Start from south pole and end at north pole",
        optionD: "Are parallel inside a bar magnet",
        correctOption: "B",
        solution: "Magnetic field lines always form closed loops since there are no magnetic monopoles. They emerge from N, enter S, and continue inside from S to N."
      },
      {
        questionText: "The net magnetic dipole moment of an atom of a diamagnetic material is:",
        optionA: "Very large",
        optionB: "Non-zero but small",
        optionC: "Zero",
        optionD: "Infinite",
        correctOption: "C",
        solution: "In diamagnetic materials, the net magnetic moment of each atom is zero because orbital and spin moments cancel out."
      },
      {
        questionText: "The relative permeability of a diamagnetic substance is:",
        optionA: "Greater than 1",
        optionB: "Equal to 1",
        optionC: "Slightly less than 1",
        optionD: "Much greater than 1",
        correctOption: "C",
        solution: "\u00B5_r = 1 + \u03C7. For diamagnetic substances \u03C7 is small and negative, so \u00B5_r is slightly less than 1."
      },
      {
        questionText: "The phenomenon of magnetic hysteresis is exhibited by:",
        optionA: "Diamagnetic materials",
        optionB: "Paramagnetic materials",
        optionC: "Ferromagnetic materials",
        optionD: "All materials",
        correctOption: "C",
        solution: "Hysteresis (lagging of B behind H) is a characteristic property of ferromagnetic materials due to domain structure."
      },
      {
        questionText: "If a dip needle is taken to the magnetic equator, it will orient:",
        optionA: "Vertically",
        optionB: "Horizontally",
        optionC: "At 45\u00B0",
        optionD: "At 60\u00B0",
        correctOption: "B",
        solution: "At the magnetic equator, the angle of dip is 0\u00B0 and the field is entirely horizontal, so the dip needle is horizontal."
      },
      {
        questionText: "Gauss's law in magnetism states that:",
        optionA: "Magnetic monopoles exist",
        optionB: "Net magnetic flux through any closed surface is zero",
        optionC: "Magnetic field is always uniform",
        optionD: "Magnetic flux is always positive",
        correctOption: "B",
        solution: "Gauss's law for magnetism: \u222EB\u00B7dA = 0. The net magnetic flux through any closed surface is zero, implying no magnetic monopoles."
      },
      {
        questionText: "The potential energy of a magnetic dipole of moment M in a uniform field B at angle \u03B8 is:",
        optionA: "MB sin\u03B8",
        optionB: "-MB cos\u03B8",
        optionC: "MB cos\u03B8",
        optionD: "-MB sin\u03B8",
        correctOption: "B",
        solution: "U = -M\u00B7B = -MB cos\u03B8. It is minimum when \u03B8 = 0 (stable equilibrium)."
      }
    ]
  },
  {
    id: "cmmos5hun006duuz8b33g4om5",
    name: "Electromagnetic Induction",
    questions: [
      {
        questionText: "Faraday's law of electromagnetic induction states that the induced emf is equal to:",
        optionA: "The rate of change of electric field",
        optionB: "The negative rate of change of magnetic flux",
        optionC: "The magnetic flux through the coil",
        optionD: "The current in the coil",
        correctOption: "B",
        solution: "Faraday's law: emf = -d\u03A6_B/dt. The induced emf equals the negative rate of change of magnetic flux."
      },
      {
        questionText: "Lenz's law is a consequence of the law of conservation of:",
        optionA: "Charge",
        optionB: "Momentum",
        optionC: "Energy",
        optionD: "Mass",
        correctOption: "C",
        solution: "Lenz's law states that induced current opposes the cause producing it, which is a consequence of energy conservation."
      },
      {
        questionText: "The self-inductance of a solenoid of N turns, length l and cross-sectional area A is:",
        optionA: "\u00B5\u2080N\u00B2A/l",
        optionB: "\u00B5\u2080NA/l",
        optionC: "\u00B5\u2080N\u00B2l/A",
        optionD: "\u00B5\u2080NA\u00B2/l",
        correctOption: "A",
        solution: "L = \u00B5\u2080n\u00B2Al = \u00B5\u2080(N/l)\u00B2Al = \u00B5\u2080N\u00B2A/l."
      },
      {
        questionText: "The SI unit of magnetic flux is:",
        optionA: "Tesla",
        optionB: "Henry",
        optionC: "Weber",
        optionD: "Gauss",
        correctOption: "C",
        solution: "Magnetic flux \u03A6 = B\u00B7A, and its SI unit is Weber (Wb) = T\u00B7m\u00B2."
      },
      {
        questionText: "An emf is induced in a coil when:",
        optionA: "A constant magnetic flux passes through it",
        optionB: "The magnetic flux through it changes",
        optionC: "The coil is in a uniform magnetic field",
        optionD: "The coil carries a steady current",
        correctOption: "B",
        solution: "By Faraday's law, emf is induced only when there is a change in magnetic flux through the coil."
      },
      {
        questionText: "The phenomenon of electromagnetic induction was discovered by:",
        optionA: "Ampere",
        optionB: "Faraday",
        optionC: "Maxwell",
        optionD: "Oersted",
        correctOption: "B",
        solution: "Michael Faraday discovered electromagnetic induction in 1831."
      },
      {
        questionText: "The energy stored in an inductor of inductance L carrying current I is:",
        optionA: "LI",
        optionB: "LI\u00B2",
        optionC: "\u00BDLI\u00B2",
        optionD: "\u00BDL\u00B2I",
        correctOption: "C",
        solution: "Energy stored in an inductor U = \u00BDLI\u00B2."
      },
      {
        questionText: "A conducting rod of length L moves with velocity v perpendicular to a magnetic field B. The induced emf is:",
        optionA: "BL/v",
        optionB: "BLv",
        optionC: "Bv/L",
        optionD: "BL\u00B2v",
        correctOption: "B",
        solution: "The motional emf = BLv when the rod, velocity and magnetic field are mutually perpendicular."
      },
      {
        questionText: "Eddy currents are used in:",
        optionA: "Induction furnaces",
        optionB: "Batteries",
        optionC: "Resistors",
        optionD: "Capacitors",
        correctOption: "A",
        solution: "Eddy currents produce heating in conductors, which is used in induction furnaces to melt metals."
      },
      {
        questionText: "The coefficient of mutual inductance between two coils depends on:",
        optionA: "Current in the coils only",
        optionB: "Relative orientation and distance between the coils",
        optionC: "The resistance of the coils",
        optionD: "The voltage applied",
        correctOption: "B",
        solution: "Mutual inductance depends on geometry: the number of turns, area, relative orientation, and distance between the coils."
      },
      {
        questionText: "The dimension of magnetic flux is:",
        optionA: "[ML\u00B2T\u207B\u00B2A\u207B\u00B9]",
        optionB: "[MLT\u207B\u00B2A\u207B\u00B9]",
        optionC: "[ML\u00B2T\u207B\u00B3A\u207B\u00B9]",
        optionD: "[ML\u00B2T\u207B\u00B2A\u207B\u00B2]",
        correctOption: "A",
        solution: "\u03A6 = BA = (F/qv) \u00D7 A. Working through the dimensions: [ML\u00B2T\u207B\u00B2A\u207B\u00B9]."
      },
      {
        questionText: "In a transformer, if the number of turns in the primary coil is 100 and in the secondary coil is 200, and the input voltage is 220 V, the output voltage is:",
        optionA: "110 V",
        optionB: "220 V",
        optionC: "440 V",
        optionD: "880 V",
        correctOption: "C",
        solution: "V_s/V_p = N_s/N_p. V_s = 220 \u00D7 200/100 = 440 V."
      },
      {
        questionText: "Eddy currents can be minimised by:",
        optionA: "Using a solid metallic core",
        optionB: "Using laminated cores",
        optionC: "Increasing the thickness of the core",
        optionD: "Using a superconducting core",
        correctOption: "B",
        solution: "Laminated cores (thin insulated sheets) break the eddy current loops, reducing their magnitude and associated energy losses."
      },
      {
        questionText: "The direction of induced current in a loop can be found using:",
        optionA: "Ampere's rule",
        optionB: "Biot-Savart law",
        optionC: "Lenz's law",
        optionD: "Coulomb's law",
        correctOption: "C",
        solution: "Lenz's law gives the direction of induced current: it opposes the change in flux that causes it."
      },
      {
        questionText: "An AC generator works on the principle of:",
        optionA: "Self-induction",
        optionB: "Mutual induction",
        optionC: "Electromagnetic induction",
        optionD: "Electrostatic induction",
        correctOption: "C",
        solution: "An AC generator converts mechanical energy to electrical energy using the principle of electromagnetic induction."
      },
      {
        questionText: "The self-inductance of a coil is 5 mH. If the current changes from 4 A to 2 A in 0.01 s, the induced emf is:",
        optionA: "0.5 V",
        optionB: "1 V",
        optionC: "2 V",
        optionD: "10 V",
        correctOption: "B",
        solution: "emf = -L(dI/dt) = -5\u00D710\u207B\u00B3 \u00D7 (2-4)/0.01 = -5\u00D710\u207B\u00B3 \u00D7 (-200) = 1 V."
      },
      {
        questionText: "The mutual inductance of two coils is 1.5 H. If the current in the first coil changes at 5 A/s, the induced emf in the second coil is:",
        optionA: "0.3 V",
        optionB: "3 V",
        optionC: "7.5 V",
        optionD: "0.75 V",
        correctOption: "C",
        solution: "emf = -M(dI/dt) = 1.5 \u00D7 5 = 7.5 V."
      },
      {
        questionText: "A magnet is dropped through a long copper tube. Its acceleration will be:",
        optionA: "Equal to g",
        optionB: "Greater than g",
        optionC: "Less than g",
        optionD: "Zero throughout",
        correctOption: "C",
        solution: "Eddy currents induced in the copper tube oppose the motion of the magnet (Lenz's law), reducing its acceleration below g."
      },
      {
        questionText: "The coefficient of coupling between two coils of self-inductance L\u2081 and L\u2082 and mutual inductance M is:",
        optionA: "k = M/(L\u2081L\u2082)",
        optionB: "k = M/\u221A(L\u2081L\u2082)",
        optionC: "k = \u221A(ML\u2081L\u2082)",
        optionD: "k = M\u00B2/(L\u2081L\u2082)",
        correctOption: "B",
        solution: "The coupling coefficient k = M/\u221A(L\u2081L\u2082), where 0 \u2264 k \u2264 1."
      },
      {
        questionText: "The back emf in a motor is maximum when:",
        optionA: "The motor starts",
        optionB: "The motor is running at full speed",
        optionC: "The motor is overloaded",
        optionD: "The motor is switched off",
        correctOption: "B",
        solution: "Back emf is proportional to speed of rotation. At full speed, the back emf is maximum and the current is minimum."
      },
      {
        questionText: "A circular coil of 200 turns and radius 10 cm is placed in a uniform magnetic field of 0.5 T. If the field is reduced to zero in 0.1 s, the average induced emf is:",
        optionA: "\u03C0 V",
        optionB: "10\u03C0 V",
        optionC: "\u03C0/10 V",
        optionD: "31.4 V",
        correctOption: "A",
        solution: "emf = N\u0394\u03A6/\u0394t = 200 \u00D7 (0.5 \u00D7 \u03C0 \u00D7 0.01)/ 0.1 = 200 \u00D7 0.005\u03C0/0.1 = \u03C0 V."
      },
      {
        questionText: "The inductance of a coil is independent of:",
        optionA: "Number of turns",
        optionB: "Area of cross-section",
        optionC: "Current flowing through it",
        optionD: "Permeability of the core",
        correctOption: "C",
        solution: "Self-inductance L = \u00B5\u2080N\u00B2A/l depends on geometry and core material, not on the current flowing through the coil."
      },
      {
        questionText: "When a coil carrying current is suddenly opened (circuit broken), a spark is produced because:",
        optionA: "Current becomes zero",
        optionB: "The self-induced emf is very high due to rapid change in current",
        optionC: "Resistance increases",
        optionD: "The magnetic field collapses slowly",
        correctOption: "B",
        solution: "Rapid change in current (dI/dt is very large) produces a very large self-induced emf (emf = -LdI/dt), causing a spark."
      },
      {
        questionText: "In a step-down transformer:",
        optionA: "N_s > N_p and V_s > V_p",
        optionB: "N_s < N_p and V_s < V_p",
        optionC: "N_s > N_p and V_s < V_p",
        optionD: "N_s = N_p and V_s = V_p",
        correctOption: "B",
        solution: "A step-down transformer has fewer turns in the secondary (N_s < N_p) and produces a lower output voltage (V_s < V_p)."
      },
      {
        questionText: "The emf generated by an AC generator is given by:",
        optionA: "e = NBA sin\u03C9t",
        optionB: "e = NBA\u03C9 sin\u03C9t",
        optionC: "e = NBA\u03C9 cos\u03C9t",
        optionD: "e = NBA\u03C9\u00B2 sin\u03C9t",
        correctOption: "B",
        solution: "\u03A6 = NBAcos(\u03C9t), so emf = -d\u03A6/dt = NBA\u03C9 sin(\u03C9t). The peak emf e\u2080 = NBA\u03C9."
      }
    ]
  },
  {
    id: "cmmos5jl7007duuz85b3uyx5b",
    name: "Alternating Current",
    questions: [
      {
        questionText: "The rms value of an alternating current I = I\u2080 sin\u03C9t is:",
        optionA: "I\u2080",
        optionB: "I\u2080/2",
        optionC: "I\u2080/\u221A2",
        optionD: "\u221A2 I\u2080",
        correctOption: "C",
        solution: "The rms (root mean square) value of a sinusoidal AC is I_rms = I\u2080/\u221A2."
      },
      {
        questionText: "In a pure capacitive AC circuit, the current:",
        optionA: "Lags behind voltage by 90\u00B0",
        optionB: "Leads voltage by 90\u00B0",
        optionC: "Is in phase with voltage",
        optionD: "Leads voltage by 45\u00B0",
        correctOption: "B",
        solution: "In a purely capacitive circuit, current leads the voltage by \u03C0/2 (90\u00B0)."
      },
      {
        questionText: "The impedance of a series LCR circuit at resonance is:",
        optionA: "\u221A(R\u00B2 + (X_L - X_C)\u00B2)",
        optionB: "R",
        optionC: "X_L + X_C",
        optionD: "Zero",
        correctOption: "B",
        solution: "At resonance, X_L = X_C, so impedance Z = \u221A(R\u00B2 + 0) = R. The impedance is purely resistive."
      },
      {
        questionText: "The resonant frequency of a series LCR circuit is:",
        optionA: "1/(2\u03C0LC)",
        optionB: "1/(2\u03C0\u221A(LC))",
        optionC: "2\u03C0\u221A(LC)",
        optionD: "\u221A(LC)/(2\u03C0)",
        correctOption: "B",
        solution: "At resonance, \u03C9_L = 1/(\u03C9C), giving \u03C9 = 1/\u221A(LC) and f = 1/(2\u03C0\u221A(LC))."
      },
      {
        questionText: "The power factor of a series LCR circuit at resonance is:",
        optionA: "0",
        optionB: "0.5",
        optionC: "1/\u221A2",
        optionD: "1",
        correctOption: "D",
        solution: "At resonance, \u03C6 = 0, so power factor cos\u03C6 = 1. Maximum power is transferred."
      },
      {
        questionText: "The average power dissipated in a pure inductive circuit is:",
        optionA: "V_rms \u00D7 I_rms",
        optionB: "V_rms \u00D7 I_rms / 2",
        optionC: "Zero",
        optionD: "V_rms\u00B2/X_L",
        correctOption: "C",
        solution: "In a pure inductive circuit, \u03C6 = 90\u00B0, so P = V_rms I_rms cos(90\u00B0) = 0. No power is dissipated."
      },
      {
        questionText: "A transformer works on the principle of:",
        optionA: "Self-induction",
        optionB: "Mutual induction",
        optionC: "Electromagnetic radiation",
        optionD: "Electrostatic induction",
        correctOption: "B",
        solution: "A transformer uses mutual induction between two coils wound on a common core to step up or step down AC voltage."
      },
      {
        questionText: "In an AC circuit with only a resistor, the voltage and current are:",
        optionA: "90\u00B0 out of phase",
        optionB: "180\u00B0 out of phase",
        optionC: "In phase",
        optionD: "45\u00B0 out of phase",
        correctOption: "C",
        solution: "In a purely resistive AC circuit, voltage and current are in phase with each other (\u03C6 = 0)."
      },
      {
        questionText: "The quality factor (Q) of a series LCR circuit is:",
        optionA: "R/(\u03C9L)",
        optionB: "\u03C9L/R",
        optionC: "R\u03C9L",
        optionD: "1/(R\u03C9L)",
        correctOption: "B",
        solution: "Q = \u03C9\u2080L/R = 1/(R) \u00D7 \u221A(L/C). A higher Q means sharper resonance."
      },
      {
        questionText: "The inductive reactance of a coil of inductance L at angular frequency \u03C9 is:",
        optionA: "1/(\u03C9L)",
        optionB: "\u03C9L",
        optionC: "\u03C9/L",
        optionD: "L/\u03C9",
        correctOption: "B",
        solution: "Inductive reactance X_L = \u03C9L = 2\u03C0fL."
      },
      {
        questionText: "The capacitive reactance of a capacitor of capacitance C at angular frequency \u03C9 is:",
        optionA: "\u03C9C",
        optionB: "1/(\u03C9C)",
        optionC: "\u03C9/C",
        optionD: "C/\u03C9",
        correctOption: "B",
        solution: "Capacitive reactance X_C = 1/(\u03C9C) = 1/(2\u03C0fC)."
      },
      {
        questionText: "In a series LCR circuit, if X_L > X_C, the circuit is:",
        optionA: "Capacitive",
        optionB: "Inductive",
        optionC: "Resistive",
        optionD: "At resonance",
        correctOption: "B",
        solution: "When X_L > X_C, the net reactance is inductive and the current lags behind voltage."
      },
      {
        questionText: "The wattless component of current in an AC circuit is:",
        optionA: "I cos\u03C6",
        optionB: "I sin\u03C6",
        optionC: "I tan\u03C6",
        optionD: "I/cos\u03C6",
        correctOption: "B",
        solution: "The wattless (reactive) component is I sin\u03C6. It does not contribute to average power dissipation."
      },
      {
        questionText: "The average value of AC voltage V = V\u2080 sin\u03C9t over a complete cycle is:",
        optionA: "V\u2080",
        optionB: "V\u2080/\u221A2",
        optionC: "2V\u2080/\u03C0",
        optionD: "Zero",
        correctOption: "D",
        solution: "The average value of sin\u03C9t over a complete cycle is zero, so the average voltage is zero."
      },
      {
        questionText: "An LC oscillator has L = 0.1 H and C = 10 \u00B5F. The frequency of oscillation is approximately:",
        optionA: "159 Hz",
        optionB: "1590 Hz",
        optionC: "15.9 Hz",
        optionD: "1.59 Hz",
        correctOption: "A",
        solution: "f = 1/(2\u03C0\u221A(LC)) = 1/(2\u03C0\u221A(0.1 \u00D7 10\u207B\u2075)) = 1/(2\u03C0 \u00D7 10\u207B\u00B3) \u2248 159 Hz."
      },
      {
        questionText: "A choke coil is used in AC circuits to:",
        optionA: "Increase current",
        optionB: "Reduce current without power loss",
        optionC: "Increase power factor",
        optionD: "Convert AC to DC",
        correctOption: "B",
        solution: "A choke coil (inductor with low R) reduces AC current through inductive reactance without significant power dissipation."
      },
      {
        questionText: "In an ideal transformer, the ratio of output power to input power is:",
        optionA: "Greater than 1",
        optionB: "Less than 1",
        optionC: "Equal to 1",
        optionD: "Depends on frequency",
        correctOption: "C",
        solution: "An ideal transformer has no energy losses, so output power equals input power. The ratio is 1."
      },
      {
        questionText: "The average power in an AC circuit is given by:",
        optionA: "V_rms \u00D7 I_rms",
        optionB: "V_rms \u00D7 I_rms \u00D7 cos\u03C6",
        optionC: "V_rms \u00D7 I_rms \u00D7 sin\u03C6",
        optionD: "V\u2080 \u00D7 I\u2080",
        correctOption: "B",
        solution: "Average power P = V_rms \u00D7 I_rms \u00D7 cos\u03C6, where cos\u03C6 is the power factor."
      },
      {
        questionText: "The frequency of AC mains in India is:",
        optionA: "60 Hz",
        optionB: "100 Hz",
        optionC: "50 Hz",
        optionD: "25 Hz",
        correctOption: "C",
        solution: "The standard frequency of AC mains supply in India is 50 Hz."
      },
      {
        questionText: "In a pure inductive circuit, current:",
        optionA: "Leads voltage by 90\u00B0",
        optionB: "Lags behind voltage by 90\u00B0",
        optionC: "Is in phase with voltage",
        optionD: "Lags by 45\u00B0",
        correctOption: "B",
        solution: "In a purely inductive circuit, current lags behind voltage by \u03C0/2 (90\u00B0)."
      },
      {
        questionText: "The bandwidth of a series LCR circuit is:",
        optionA: "\u03C9\u2080/Q",
        optionB: "Q/\u03C9\u2080",
        optionC: "R/L",
        optionD: "Both A and C",
        correctOption: "D",
        solution: "Bandwidth \u0394\u03C9 = R/L = \u03C9\u2080/Q. Both expressions are equivalent."
      },
      {
        questionText: "An AC source of 220 V is connected to a 110 \u03A9 resistor. The peak current is:",
        optionA: "2 A",
        optionB: "2\u221A2 A",
        optionC: "1 A",
        optionD: "\u221A2 A",
        correctOption: "B",
        solution: "I_rms = V_rms/R = 220/110 = 2 A. I\u2080 = I_rms \u00D7 \u221A2 = 2\u221A2 A."
      },
      {
        questionText: "The power consumed in a series LCR circuit at resonance is:",
        optionA: "Zero",
        optionB: "V\u00B2_rms/R",
        optionC: "V\u00B2_rms/(R + X_L)",
        optionD: "V\u00B2_rms/(X_L - X_C)",
        correctOption: "B",
        solution: "At resonance, Z = R, so P = V\u00B2_rms/R. Power factor is 1 and power is maximum."
      },
      {
        questionText: "An inductor and a capacitor are connected in series to an AC source. If X_L = X_C, the impedance of the circuit is:",
        optionA: "Zero",
        optionB: "X_L + X_C",
        optionC: "X_L - X_C = 0",
        optionD: "Infinite",
        correctOption: "A",
        solution: "In a series LC circuit without resistance, if X_L = X_C, impedance Z = |X_L - X_C| = 0 (ideal case). This is resonance."
      }
    ]
  },
  {
    id: "cmmos5lkb008huuz891vc7loa",
    name: "Electromagnetic Waves",
    questions: [
      {
        questionText: "Electromagnetic waves are produced by:",
        optionA: "Stationary charges",
        optionB: "Charges moving with constant velocity",
        optionC: "Accelerating charges",
        optionD: "Charges at rest or in uniform motion",
        correctOption: "C",
        solution: "Only accelerating (or oscillating) charges radiate electromagnetic waves."
      },
      {
        questionText: "The speed of electromagnetic waves in vacuum is:",
        optionA: "1/\u221A(\u00B5\u2080\u03B5\u2080)",
        optionB: "\u221A(\u00B5\u2080\u03B5\u2080)",
        optionC: "\u00B5\u2080\u03B5\u2080",
        optionD: "1/(\u00B5\u2080\u03B5\u2080)",
        correctOption: "A",
        solution: "c = 1/\u221A(\u00B5\u2080\u03B5\u2080) \u2248 3 \u00D7 10\u2078 m/s."
      },
      {
        questionText: "Which of the following electromagnetic waves has the longest wavelength?",
        optionA: "X-rays",
        optionB: "Microwaves",
        optionC: "Radio waves",
        optionD: "Infrared rays",
        correctOption: "C",
        solution: "Radio waves have the longest wavelength (and lowest frequency) in the electromagnetic spectrum."
      },
      {
        questionText: "Maxwell's displacement current is associated with:",
        optionA: "A changing magnetic field",
        optionB: "A changing electric field",
        optionC: "A steady electric field",
        optionD: "A steady magnetic field",
        correctOption: "B",
        solution: "Displacement current I_d = \u03B5\u2080(d\u03A6_E/dt) is associated with a time-varying electric field."
      },
      {
        questionText: "In an electromagnetic wave, the electric and magnetic fields are:",
        optionA: "Parallel to each other",
        optionB: "Anti-parallel",
        optionC: "Perpendicular to each other and to the direction of propagation",
        optionD: "At 45\u00B0 to each other",
        correctOption: "C",
        solution: "EM waves are transverse. E and B are perpendicular to each other and both perpendicular to the direction of wave propagation."
      },
      {
        questionText: "The electromagnetic spectrum in order of increasing frequency is:",
        optionA: "Radio, Microwave, Infrared, Visible, UV, X-ray, Gamma",
        optionB: "Gamma, X-ray, UV, Visible, Infrared, Microwave, Radio",
        optionC: "Radio, Infrared, Microwave, Visible, UV, X-ray, Gamma",
        optionD: "Visible, UV, Infrared, Radio, Microwave, X-ray, Gamma",
        correctOption: "A",
        solution: "The correct order of increasing frequency: Radio < Microwave < Infrared < Visible < UV < X-ray < Gamma rays."
      },
      {
        questionText: "The ratio of amplitudes of electric and magnetic fields in an electromagnetic wave in vacuum is equal to:",
        optionA: "\u00B5\u2080",
        optionB: "\u03B5\u2080",
        optionC: "c (speed of light)",
        optionD: "1/c",
        correctOption: "C",
        solution: "E\u2080/B\u2080 = c. The ratio of E and B amplitudes in an EM wave equals the speed of light."
      },
      {
        questionText: "Which electromagnetic wave is used in RADAR?",
        optionA: "Visible light",
        optionB: "Infrared",
        optionC: "Microwaves",
        optionD: "X-rays",
        correctOption: "C",
        solution: "RADAR (Radio Detection and Ranging) uses microwaves to detect objects and measure their distance and speed."
      },
      {
        questionText: "The energy of an electromagnetic wave is:",
        optionA: "Equally divided between electric and magnetic fields",
        optionB: "Entirely in the electric field",
        optionC: "Entirely in the magnetic field",
        optionD: "More in the electric field than the magnetic field",
        correctOption: "A",
        solution: "In an EM wave, the energy is equally shared between the electric field (u_E = \u00BD\u03B5\u2080E\u00B2) and magnetic field (u_B = B\u00B2/2\u00B5\u2080)."
      },
      {
        questionText: "Ozone layer absorbs which type of radiation from the sun?",
        optionA: "Infrared",
        optionB: "Visible",
        optionC: "Ultraviolet",
        optionD: "Radio waves",
        correctOption: "C",
        solution: "The ozone layer absorbs harmful ultraviolet (UV) radiation from the sun, protecting life on Earth."
      },
      {
        questionText: "Greenhouse effect is caused by:",
        optionA: "UV radiation",
        optionB: "X-rays",
        optionC: "Visible light",
        optionD: "Infrared radiation",
        correctOption: "D",
        solution: "Greenhouse gases trap infrared radiation emitted by the Earth's surface, causing the greenhouse effect."
      },
      {
        questionText: "X-rays are produced by:",
        optionA: "Nuclear transitions",
        optionB: "Deceleration of high-energy electrons hitting a metal target",
        optionC: "Electronic transitions in the outer shell",
        optionD: "Molecular vibrations",
        correctOption: "B",
        solution: "X-rays are produced when high-energy electrons decelerate on striking a heavy metal target (Bremsstrahlung)."
      },
      {
        questionText: "The frequency range of visible light is approximately:",
        optionA: "4 \u00D7 10\u00B9\u2074 to 8 \u00D7 10\u00B9\u2074 Hz",
        optionB: "4 \u00D7 10\u00B9\u00B2 to 8 \u00D7 10\u00B9\u00B2 Hz",
        optionC: "4 \u00D7 10\u2078 to 8 \u00D7 10\u2078 Hz",
        optionD: "4 \u00D7 10\u00B9\u2076 to 8 \u00D7 10\u00B9\u2076 Hz",
        correctOption: "A",
        solution: "Visible light has frequencies from about 4 \u00D7 10\u00B9\u2074 Hz (red) to 8 \u00D7 10\u00B9\u2074 Hz (violet)."
      },
      {
        questionText: "Electromagnetic waves carry:",
        optionA: "Energy only",
        optionB: "Momentum only",
        optionC: "Both energy and momentum",
        optionD: "Neither energy nor momentum",
        correctOption: "C",
        solution: "EM waves carry both energy and momentum. The momentum p = U/c, where U is energy."
      },
      {
        questionText: "Maxwell added which term to Ampere's circuital law?",
        optionA: "Conduction current",
        optionB: "Displacement current",
        optionC: "Eddy current",
        optionD: "Convection current",
        correctOption: "B",
        solution: "Maxwell added the displacement current term \u03B5\u2080(d\u03A6_E/dt) to Ampere's law to make it consistent with charge conservation."
      },
      {
        questionText: "The wavelength range of visible light is approximately:",
        optionA: "400 nm to 700 nm",
        optionB: "100 nm to 400 nm",
        optionC: "700 nm to 1000 nm",
        optionD: "1 nm to 100 nm",
        correctOption: "A",
        solution: "Visible light spans wavelengths from about 400 nm (violet) to 700 nm (red)."
      },
      {
        questionText: "Which of the following electromagnetic waves is used in night vision equipment?",
        optionA: "X-rays",
        optionB: "UV rays",
        optionC: "Infrared rays",
        optionD: "Microwaves",
        correctOption: "C",
        solution: "Infrared radiation (heat radiation) emitted by warm objects is detected by night vision devices."
      },
      {
        questionText: "Gamma rays are produced by:",
        optionA: "Electronic transitions in atoms",
        optionB: "Molecular vibrations",
        optionC: "Nuclear transitions (radioactive decay)",
        optionD: "Deceleration of electrons",
        correctOption: "C",
        solution: "Gamma rays originate from nuclear transitions during radioactive decay and have the highest energy in the EM spectrum."
      },
      {
        questionText: "The intensity of an electromagnetic wave is proportional to:",
        optionA: "E\u2080",
        optionB: "E\u2080\u00B2",
        optionC: "B\u2080",
        optionD: "1/E\u2080\u00B2",
        correctOption: "B",
        solution: "Intensity I = \u00BD\u03B5\u2080cE\u2080\u00B2. It is proportional to the square of the amplitude of the electric field."
      },
      {
        questionText: "Electromagnetic waves do NOT require:",
        optionA: "Electric field",
        optionB: "Magnetic field",
        optionC: "A material medium for propagation",
        optionD: "Energy",
        correctOption: "C",
        solution: "EM waves are self-sustaining oscillations of E and B fields and can propagate through vacuum without any material medium."
      },
      {
        questionText: "Which of the following is NOT an electromagnetic wave?",
        optionA: "Light",
        optionB: "Radio waves",
        optionC: "Sound waves",
        optionD: "X-rays",
        correctOption: "C",
        solution: "Sound waves are mechanical (longitudinal) waves requiring a medium. They are not electromagnetic waves."
      },
      {
        questionText: "The displacement current through a parallel plate capacitor of capacitance C is:",
        optionA: "C dV/dt",
        optionB: "V/C",
        optionC: "CV",
        optionD: "C\u00B2 dV/dt",
        correctOption: "A",
        solution: "I_d = \u03B5\u2080(d\u03A6_E/dt) = dQ/dt = C(dV/dt), which equals the conduction current in the external circuit."
      },
      {
        questionText: "The property of electromagnetic waves used in polaroid sunglasses is:",
        optionA: "Reflection",
        optionB: "Refraction",
        optionC: "Polarization",
        optionD: "Diffraction",
        correctOption: "C",
        solution: "Polaroid sunglasses use the polarization property of EM waves to reduce glare by filtering specific polarization directions."
      },
      {
        questionText: "Hertz experimentally confirmed the existence of electromagnetic waves using:",
        optionA: "A prism and screen",
        optionB: "An LC oscillator and detector loop",
        optionC: "A galvanometer and magnet",
        optionD: "A capacitor and battery",
        correctOption: "B",
        solution: "Heinrich Hertz used an LC oscillator as transmitter and a detector loop to produce and detect electromagnetic waves in 1887."
      },
      {
        questionText: "If the electric field of an EM wave is along the y-axis and propagation is along the x-axis, the magnetic field is along:",
        optionA: "x-axis",
        optionB: "y-axis",
        optionC: "z-axis",
        optionD: "-x-axis",
        correctOption: "C",
        solution: "E \u00D7 B gives the direction of propagation. If E is along y and propagation along x, then B must be along z (using right-hand rule)."
      }
    ]
  }
];

async function main() {
  console.log("Starting seed for Class 12 Physics Part 1 (7 chapters, 25 questions each)...\n");

  let totalInserted = 0;

  for (const chapter of chapters) {
    console.log(`Processing: ${chapter.name} (${chapter.id})`);

    // Delete existing questions for this chapter
    const deleted = await prisma.question.deleteMany({
      where: { chapterId: chapter.id }
    });
    console.log(`  Deleted ${deleted.count} existing questions.`);

    // Insert new questions
    const data = chapter.questions.map((q) => ({
      chapterId: chapter.id,
      questionText: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctOption: q.correctOption,
      solution: q.solution
    }));

    const result = await prisma.question.createMany({ data });
    console.log(`  Inserted ${result.count} questions.`);
    totalInserted += result.count;
  }

  console.log(`\nDone! Total questions inserted: ${totalInserted}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
