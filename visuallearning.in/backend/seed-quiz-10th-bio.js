const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const SUBJECT_ID = "cmmn2eyzb004fuukskj4ivpo0";

// Existing chapters
const chapters = [
  { id: "cmmormedo00ahuu7wawme5cpx", name: "Life Processes", order: 1 },
  { id: "cmmormfeu00b1uu7wysbvzo94", name: "Control and Coordination", order: 2 },
  { id: "cmmormgf700bluu7wldckn1xt", name: "How do Organisms Reproduce", order: 3 },
  { id: "cmmormh7y00c1uu7wc1rpjkwc", name: "Heredity", order: 4 },
  { id: "cmmormnhv00fduu7wyab0pqdb", name: "Our Environment", order: 5 },
];

// Missing CBSE chapters to potentially create
const missingChapters = [
  { name: "Heredity and Evolution", order: 4 },
  { name: "Management of Natural Resources", order: 6 },
];

// ===================== QUESTIONS DATA =====================

const lifeProcessesQuestions = [
  {
    questionText: "Which of the following is the site of complete digestion of food in humans?",
    optionA: "Stomach",
    optionB: "Small intestine",
    optionC: "Large intestine",
    optionD: "Mouth",
    correctOption: "B",
    solution: "The small intestine is where complete digestion of carbohydrates, proteins and fats takes place with the help of pancreatic juice, bile and intestinal juice."
  },
  {
    questionText: "The autotrophic mode of nutrition requires which of the following?",
    optionA: "Carbon dioxide and water",
    optionB: "Chlorophyll",
    optionC: "Sunlight",
    optionD: "All of the above",
    correctOption: "D",
    solution: "Autotrophic nutrition (photosynthesis) requires carbon dioxide, water, chlorophyll and sunlight to synthesise food."
  },
  {
    questionText: "Which pigment absorbs solar energy during photosynthesis?",
    optionA: "Haemoglobin",
    optionB: "Chlorophyll",
    optionC: "Melanin",
    optionD: "Xanthophyll",
    correctOption: "B",
    solution: "Chlorophyll is the green pigment present in leaves that absorbs solar energy needed for photosynthesis."
  },
  {
    questionText: "The breakdown of pyruvate into ethanol and CO₂ takes place in:",
    optionA: "Mitochondria",
    optionB: "Cytoplasm",
    optionC: "Nucleus",
    optionD: "Chloroplast",
    correctOption: "B",
    solution: "Anaerobic respiration (fermentation) in yeast converts pyruvate to ethanol and CO₂ in the cytoplasm."
  },
  {
    questionText: "Which blood vessel carries blood from the heart to the lungs?",
    optionA: "Pulmonary vein",
    optionB: "Aorta",
    optionC: "Pulmonary artery",
    optionD: "Vena cava",
    correctOption: "C",
    solution: "The pulmonary artery carries deoxygenated blood from the right ventricle of the heart to the lungs for oxygenation."
  },
  {
    questionText: "The correct pathway of urine formation in nephron is:",
    optionA: "Glomerulus → Bowman's capsule → tubule → collecting duct",
    optionB: "Bowman's capsule → glomerulus → tubule → collecting duct",
    optionC: "Tubule → glomerulus → Bowman's capsule → collecting duct",
    optionD: "Collecting duct → tubule → Bowman's capsule → glomerulus",
    correctOption: "A",
    solution: "Blood is filtered at the glomerulus into Bowman's capsule, then reabsorption occurs along the tubule, and urine collects in the collecting duct."
  },
  {
    questionText: "In single circulation, blood passes through the heart:",
    optionA: "Twice in one complete cycle",
    optionB: "Once in one complete cycle",
    optionC: "Three times in one complete cycle",
    optionD: "Does not pass through the heart",
    correctOption: "B",
    solution: "In single circulation (e.g., in fish), blood passes through the heart only once during one complete cycle of the body."
  },
  {
    questionText: "The enzyme pepsin is secreted by which organ?",
    optionA: "Pancreas",
    optionB: "Liver",
    optionC: "Stomach",
    optionD: "Small intestine",
    correctOption: "C",
    solution: "Pepsin is a protein-digesting enzyme secreted by the gastric glands in the stomach wall."
  },
  {
    questionText: "Which of the following is NOT a function of the liver?",
    optionA: "Production of bile",
    optionB: "Storage of glycogen",
    optionC: "Secretion of insulin",
    optionD: "Detoxification of blood",
    correctOption: "C",
    solution: "Insulin is secreted by the beta cells of the Islets of Langerhans in the pancreas, not by the liver."
  },
  {
    questionText: "Stomata open and close due to the action of:",
    optionA: "Epidermal cells",
    optionB: "Guard cells",
    optionC: "Mesophyll cells",
    optionD: "Companion cells",
    correctOption: "B",
    solution: "Guard cells swell when they absorb water (becoming turgid) to open stomata and lose water (becoming flaccid) to close them."
  },
  {
    questionText: "The process of transpiration in plants helps in:",
    optionA: "Absorption of CO₂ from atmosphere",
    optionB: "Upward movement of water and minerals",
    optionC: "Digestion of starch",
    optionD: "Translocation of food",
    correctOption: "B",
    solution: "Transpiration creates a suction pull that helps in the upward movement of water and dissolved minerals from roots to leaves."
  },
  {
    questionText: "Double circulation is found in:",
    optionA: "Fish",
    optionB: "Humans",
    optionC: "Frog (partial)",
    optionD: "Both B and C",
    correctOption: "D",
    solution: "Humans have complete double circulation (4-chambered heart) and frogs have incomplete double circulation (3-chambered heart). Blood passes through the heart twice per cycle in both."
  },
  {
    questionText: "Which component of blood helps in clotting?",
    optionA: "Red blood cells",
    optionB: "White blood cells",
    optionC: "Platelets",
    optionD: "Plasma",
    correctOption: "C",
    solution: "Platelets (thrombocytes) release clotting factors at the site of injury, initiating the blood clotting process."
  },
  {
    questionText: "The oxygen-carrying pigment in human blood is:",
    optionA: "Chlorophyll",
    optionB: "Haemocyanin",
    optionC: "Haemoglobin",
    optionD: "Myoglobin",
    correctOption: "C",
    solution: "Haemoglobin is an iron-containing pigment in red blood cells that binds with oxygen to form oxyhaemoglobin for transport."
  },
  {
    questionText: "Which of the following is the correct equation for aerobic respiration?",
    optionA: "C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂ + Energy",
    optionB: "C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + Energy",
    optionC: "C₆H₁₂O₆ → 2C₃H₆O₃ + Energy",
    optionD: "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂",
    correctOption: "B",
    solution: "Aerobic respiration uses oxygen to completely break down glucose into CO₂ and water, releasing maximum energy (ATP)."
  },
  {
    questionText: "Bile juice is stored in the:",
    optionA: "Liver",
    optionB: "Pancreas",
    optionC: "Gall bladder",
    optionD: "Stomach",
    correctOption: "C",
    solution: "Bile is produced by the liver but stored and concentrated in the gall bladder before being released into the small intestine."
  },
  {
    questionText: "The functional unit of the kidney is called:",
    optionA: "Neuron",
    optionB: "Nephron",
    optionC: "Alveolus",
    optionD: "Villus",
    correctOption: "B",
    solution: "Nephron is the structural and functional unit of the kidney. Each kidney contains about one million nephrons."
  },
  {
    questionText: "Which organisms use holozoic mode of nutrition?",
    optionA: "Amoeba",
    optionB: "Mushroom",
    optionC: "Green plants",
    optionD: "Cuscuta",
    correctOption: "A",
    solution: "Holozoic nutrition involves ingestion of solid food, digestion and absorption. Amoeba uses this mode by engulfing food with pseudopodia."
  },
  {
    questionText: "In plants, phloem transports:",
    optionA: "Water and minerals",
    optionB: "Prepared food (sucrose)",
    optionC: "Oxygen",
    optionD: "Carbon dioxide",
    correctOption: "B",
    solution: "Phloem translocates prepared food (mainly sucrose) from leaves to other parts of the plant. Xylem transports water and minerals."
  },
  {
    questionText: "Which gas is released during photosynthesis?",
    optionA: "Carbon dioxide",
    optionB: "Nitrogen",
    optionC: "Oxygen",
    optionD: "Hydrogen",
    correctOption: "C",
    solution: "During photosynthesis, water molecules are split (photolysis) and oxygen is released as a by-product."
  },
  {
    questionText: "The inner lining of the small intestine has finger-like projections called:",
    optionA: "Alveoli",
    optionB: "Villi",
    optionC: "Cilia",
    optionD: "Nephrons",
    correctOption: "B",
    solution: "Villi increase the surface area of the small intestine for efficient absorption of digested food into the blood."
  },
  {
    questionText: "Arteries carry blood:",
    optionA: "Always oxygenated blood",
    optionB: "Always deoxygenated blood",
    optionC: "Away from the heart",
    optionD: "Towards the heart",
    correctOption: "C",
    solution: "Arteries carry blood away from the heart. Pulmonary artery carries deoxygenated blood, so 'away from heart' is the correct definition."
  },
  {
    questionText: "Lactic acid is produced during:",
    optionA: "Aerobic respiration in muscles",
    optionB: "Anaerobic respiration in muscles",
    optionC: "Fermentation in yeast",
    optionD: "Photosynthesis",
    correctOption: "B",
    solution: "During heavy exercise, when oxygen supply is insufficient, pyruvate is converted to lactic acid in muscle cells (anaerobic respiration)."
  },
  {
    questionText: "The role of HCl in the stomach is to:",
    optionA: "Digest fats",
    optionB: "Make the medium acidic for pepsin action and kill bacteria",
    optionC: "Digest starch",
    optionD: "Absorb nutrients",
    correctOption: "B",
    solution: "HCl creates an acidic medium (pH ~2) which activates pepsinogen to pepsin and kills ingested bacteria."
  },
  {
    questionText: "Which part of the plant is responsible for absorption of water?",
    optionA: "Root hair",
    optionB: "Stem",
    optionC: "Leaf",
    optionD: "Flower",
    correctOption: "A",
    solution: "Root hairs increase the surface area for absorption of water and minerals from the soil by osmosis and active transport."
  }
];

const controlCoordinationQuestions = [
  {
    questionText: "Which part of the brain controls involuntary actions like blood pressure and salivation?",
    optionA: "Cerebrum",
    optionB: "Cerebellum",
    optionC: "Medulla oblongata",
    optionD: "Hypothalamus",
    correctOption: "C",
    solution: "The medulla oblongata (hindbrain) controls involuntary actions such as blood pressure, heart rate, breathing and salivation."
  },
  {
    questionText: "A reflex arc consists of the correct order:",
    optionA: "Receptor → sensory neuron → spinal cord → motor neuron → effector",
    optionB: "Effector → motor neuron → spinal cord → sensory neuron → receptor",
    optionC: "Receptor → motor neuron → spinal cord → sensory neuron → effector",
    optionD: "Spinal cord → receptor → sensory neuron → motor neuron → effector",
    correctOption: "A",
    solution: "In a reflex arc, the stimulus is detected by a receptor, signal travels via sensory neuron to the spinal cord, then via motor neuron to the effector (muscle/gland)."
  },
  {
    questionText: "Which hormone is responsible for the 'fight or flight' response?",
    optionA: "Insulin",
    optionB: "Thyroxine",
    optionC: "Adrenaline",
    optionD: "Growth hormone",
    correctOption: "C",
    solution: "Adrenaline (epinephrine) is secreted by adrenal glands during stress. It increases heart rate, blood pressure and glucose supply to muscles."
  },
  {
    questionText: "The gap between two neurons is called:",
    optionA: "Dendrite",
    optionB: "Synapse",
    optionC: "Axon",
    optionD: "Impulse",
    correctOption: "B",
    solution: "A synapse is the small gap between the axon terminal of one neuron and the dendrite of the next neuron where chemical transmission occurs."
  },
  {
    questionText: "Iodine is necessary for the synthesis of which hormone?",
    optionA: "Insulin",
    optionB: "Adrenaline",
    optionC: "Thyroxine",
    optionD: "Testosterone",
    correctOption: "C",
    solution: "Thyroxine is produced by the thyroid gland and requires iodine for its synthesis. Deficiency of iodine causes goitre."
  },
  {
    questionText: "Which plant hormone promotes cell elongation and growth?",
    optionA: "Abscisic acid",
    optionB: "Auxin",
    optionC: "Ethylene",
    optionD: "Cytokinin",
    correctOption: "B",
    solution: "Auxin promotes cell elongation, phototropism and geotropism. It is synthesised at the shoot tip."
  },
  {
    questionText: "The movement of a plant part towards light is called:",
    optionA: "Geotropism",
    optionB: "Chemotropism",
    optionC: "Phototropism",
    optionD: "Hydrotropism",
    correctOption: "C",
    solution: "Phototropism is the directional growth of plant parts in response to light. Shoots show positive phototropism (grow towards light)."
  },
  {
    questionText: "Which part of the brain is responsible for thinking and memory?",
    optionA: "Cerebellum",
    optionB: "Medulla",
    optionC: "Cerebrum",
    optionD: "Pons",
    correctOption: "C",
    solution: "The cerebrum is the largest part of the brain and is responsible for thinking, memory, reasoning, consciousness and voluntary actions."
  },
  {
    questionText: "Insulin is produced by which organ?",
    optionA: "Liver",
    optionB: "Adrenal gland",
    optionC: "Pituitary gland",
    optionD: "Pancreas",
    correctOption: "D",
    solution: "Insulin is produced by the beta cells of the Islets of Langerhans in the pancreas. It regulates blood sugar levels."
  },
  {
    questionText: "Which type of movement in plants is not directional?",
    optionA: "Phototropism",
    optionB: "Nastic movement",
    optionC: "Geotropism",
    optionD: "Chemotropism",
    correctOption: "B",
    solution: "Nastic movements are non-directional movements in response to stimuli, e.g., folding of leaves in Mimosa pudica (touch-me-not)."
  },
  {
    questionText: "Dwarfism is caused by the deficiency of:",
    optionA: "Thyroxine",
    optionB: "Growth hormone",
    optionC: "Insulin",
    optionD: "Adrenaline",
    correctOption: "B",
    solution: "Growth hormone is secreted by the pituitary gland. Its deficiency in childhood causes dwarfism, while excess causes gigantism."
  },
  {
    questionText: "Which of the following is an example of chemotropism?",
    optionA: "Growth of roots towards water",
    optionB: "Growth of pollen tube towards ovule",
    optionC: "Growth of shoot towards light",
    optionD: "Folding of Mimosa leaves",
    correctOption: "B",
    solution: "Chemotropism is growth in response to a chemical stimulus. The pollen tube grows towards the ovule in response to chemical signals."
  },
  {
    questionText: "The cerebellum is responsible for:",
    optionA: "Thinking and intelligence",
    optionB: "Precision and coordination of voluntary movements",
    optionC: "Controlling heart rate",
    optionD: "Producing hormones",
    correctOption: "B",
    solution: "The cerebellum coordinates muscular activities and maintains posture and balance of the body."
  },
  {
    questionText: "Which hormone controls the metabolic rate in the body?",
    optionA: "Insulin",
    optionB: "Adrenaline",
    optionC: "Thyroxine",
    optionD: "Estrogen",
    correctOption: "C",
    solution: "Thyroxine, secreted by the thyroid gland, regulates the basal metabolic rate, including carbohydrate, protein and fat metabolism."
  },
  {
    questionText: "Roots show positive geotropism because:",
    optionA: "They grow towards light",
    optionB: "They grow towards gravity",
    optionC: "They grow towards water",
    optionD: "They grow towards chemicals",
    correctOption: "B",
    solution: "Positive geotropism means growth in the direction of gravity. Roots grow downward (towards gravity) to anchor the plant and absorb water."
  },
  {
    questionText: "The nervous system uses which type of signals for transmission?",
    optionA: "Chemical signals only",
    optionB: "Electrical impulses",
    optionC: "Hormonal signals",
    optionD: "Mechanical signals",
    correctOption: "B",
    solution: "The nervous system transmits information as electrical impulses along nerve fibres. At synapses, chemical neurotransmitters are used."
  },
  {
    questionText: "Diabetes is caused by the deficiency of:",
    optionA: "Thyroxine",
    optionB: "Adrenaline",
    optionC: "Insulin",
    optionD: "Growth hormone",
    correctOption: "C",
    solution: "Diabetes mellitus occurs when the pancreas produces insufficient insulin or cells don't respond to it, leading to high blood sugar."
  },
  {
    questionText: "Abscisic acid is known as:",
    optionA: "Growth promoter",
    optionB: "Stress hormone",
    optionC: "Ripening hormone",
    optionD: "Division hormone",
    correctOption: "B",
    solution: "Abscisic acid (ABA) is called the stress hormone as it inhibits growth and promotes wilting/closure of stomata during water stress."
  },
  {
    questionText: "Which gland is called the 'master gland'?",
    optionA: "Thyroid",
    optionB: "Adrenal",
    optionC: "Pituitary",
    optionD: "Pancreas",
    correctOption: "C",
    solution: "The pituitary gland is called the master gland because it secretes hormones that control the functioning of other endocrine glands."
  },
  {
    questionText: "A neuron consists of all EXCEPT:",
    optionA: "Cell body",
    optionB: "Dendrite",
    optionC: "Axon",
    optionD: "Nephron",
    correctOption: "D",
    solution: "A neuron has a cell body (cyton), dendrites (receive impulses) and an axon (transmits impulses). Nephron is the functional unit of kidney."
  },
  {
    questionText: "The hormone responsible for secondary sexual characters in males is:",
    optionA: "Estrogen",
    optionB: "Progesterone",
    optionC: "Testosterone",
    optionD: "Thyroxine",
    correctOption: "C",
    solution: "Testosterone is the male sex hormone secreted by testes. It is responsible for male secondary sexual characters like facial hair, deep voice."
  },
  {
    questionText: "Ethylene is a plant hormone that promotes:",
    optionA: "Cell division",
    optionB: "Fruit ripening",
    optionC: "Stem elongation",
    optionD: "Root growth",
    correctOption: "B",
    solution: "Ethylene is a gaseous plant hormone that promotes ripening of fruits and senescence (ageing) of plant parts."
  },
  {
    questionText: "Which of the following is a tropic movement?",
    optionA: "Folding of Mimosa leaves on touching",
    optionB: "Opening of flowers in morning",
    optionC: "Growth of roots towards water",
    optionD: "Closing of stomata",
    correctOption: "C",
    solution: "Tropic movements are directional growth responses. Growth of roots towards water (hydrotropism) is a tropic movement. Mimosa folding is nastic."
  },
  {
    questionText: "Spinal cord is protected by:",
    optionA: "Cranium",
    optionB: "Vertebral column",
    optionC: "Rib cage",
    optionD: "Sternum",
    correctOption: "B",
    solution: "The spinal cord is enclosed and protected by the vertebral column (backbone). The brain is protected by the cranium."
  },
  {
    questionText: "Gibberellins help in:",
    optionA: "Inhibiting growth",
    optionB: "Promoting stem elongation and seed germination",
    optionC: "Wilting of leaves",
    optionD: "Closing of stomata",
    correctOption: "B",
    solution: "Gibberellins are plant growth hormones that promote stem elongation, seed germination and breaking of dormancy."
  }
];

const reproductionQuestions = [
  {
    questionText: "Which of the following is an example of asexual reproduction?",
    optionA: "Pollination in flowers",
    optionB: "Budding in Hydra",
    optionC: "Fertilisation in humans",
    optionD: "Seed formation",
    correctOption: "B",
    solution: "Budding in Hydra is asexual reproduction where a small bud develops on the parent body, grows and detaches to form a new organism."
  },
  {
    questionText: "The male reproductive part of a flower is called:",
    optionA: "Pistil",
    optionB: "Stamen",
    optionC: "Ovary",
    optionD: "Stigma",
    correctOption: "B",
    solution: "The stamen is the male reproductive organ consisting of anther (produces pollen) and filament. The pistil is the female part."
  },
  {
    questionText: "DNA copying is essential during reproduction because it:",
    optionA: "Produces variation",
    optionB: "Maintains body design and creates variation for evolution",
    optionC: "Prevents mutation",
    optionD: "Increases size of organism",
    correctOption: "B",
    solution: "DNA copying ensures that the body design features are maintained. Minor variations during copying are useful for evolution and survival."
  },
  {
    questionText: "Binary fission is observed in:",
    optionA: "Amoeba",
    optionB: "Hydra",
    optionC: "Yeast",
    optionD: "Planaria",
    correctOption: "A",
    solution: "Amoeba reproduces by binary fission where the parent cell divides into two equal daughter cells."
  },
  {
    questionText: "In human females, fertilisation occurs in the:",
    optionA: "Uterus",
    optionB: "Ovary",
    optionC: "Fallopian tube (oviduct)",
    optionD: "Vagina",
    correctOption: "C",
    solution: "Fertilisation occurs in the fallopian tube (oviduct) when a sperm fuses with the ovum. The fertilised egg then moves to the uterus for implantation."
  },
  {
    questionText: "Vegetative propagation by leaves is seen in:",
    optionA: "Rose",
    optionB: "Bryophyllum",
    optionC: "Potato",
    optionD: "Ginger",
    correctOption: "B",
    solution: "Bryophyllum reproduces vegetatively through its leaves. Buds (notches) on the leaf margins develop into new plants."
  },
  {
    questionText: "The function of testes in male reproductive system is to produce:",
    optionA: "Eggs and estrogen",
    optionB: "Sperms and testosterone",
    optionC: "Sperms only",
    optionD: "Testosterone only",
    correctOption: "B",
    solution: "Testes produce sperms (male gametes) and secrete testosterone (male sex hormone) responsible for secondary sexual characters."
  },
  {
    questionText: "Which contraceptive method creates a barrier to prevent fertilisation?",
    optionA: "Oral pills",
    optionB: "Copper-T",
    optionC: "Condom",
    optionD: "Surgical method",
    correctOption: "C",
    solution: "Condoms are barrier methods that prevent the sperm from reaching the egg. They also protect against sexually transmitted diseases."
  },
  {
    questionText: "Regeneration is the mode of reproduction seen in:",
    optionA: "Hydra",
    optionB: "Planaria",
    optionC: "Amoeba",
    optionD: "Yeast",
    correctOption: "B",
    solution: "Planaria can reproduce by regeneration. If cut into pieces, each piece can grow into a complete organism due to specialised cells."
  },
  {
    questionText: "The part of the flower that develops into a fruit is:",
    optionA: "Stigma",
    optionB: "Anther",
    optionC: "Ovary",
    optionD: "Petal",
    correctOption: "C",
    solution: "After fertilisation, the ovary develops into a fruit and the ovules develop into seeds."
  },
  {
    questionText: "Which of the following is a sexually transmitted disease?",
    optionA: "Typhoid",
    optionB: "AIDS",
    optionC: "Malaria",
    optionD: "Cholera",
    correctOption: "B",
    solution: "AIDS (Acquired Immuno Deficiency Syndrome) is caused by HIV and is transmitted through sexual contact, infected blood or from mother to child."
  },
  {
    questionText: "Spore formation is a method of reproduction seen in:",
    optionA: "Yeast",
    optionB: "Rhizopus (bread mould)",
    optionC: "Hydra",
    optionD: "Amoeba",
    correctOption: "B",
    solution: "Rhizopus (bread mould) reproduces by spore formation. Spores are tiny reproductive bodies enclosed in sporangia that germinate under favourable conditions."
  },
  {
    questionText: "The menstrual cycle in human females has an average duration of:",
    optionA: "14 days",
    optionB: "21 days",
    optionC: "28 days",
    optionD: "35 days",
    correctOption: "C",
    solution: "The menstrual cycle averages about 28 days. It involves preparation of the uterine lining for pregnancy and its shedding if fertilisation doesn't occur."
  },
  {
    questionText: "Which method of reproduction involves fragmentation?",
    optionA: "Spirogyra",
    optionB: "Rose",
    optionC: "Hydra",
    optionD: "Yeast",
    correctOption: "A",
    solution: "Spirogyra (a filamentous alga) reproduces by fragmentation — the filament breaks into fragments, and each fragment grows into a new organism."
  },
  {
    questionText: "Pollen grains are produced in the:",
    optionA: "Stigma",
    optionB: "Ovary",
    optionC: "Anther",
    optionD: "Style",
    correctOption: "C",
    solution: "Pollen grains (containing male gametes) are produced in the anther, which is the upper part of the stamen."
  },
  {
    questionText: "The placenta provides which of the following to the developing embryo?",
    optionA: "Nutrition only",
    optionB: "Oxygen only",
    optionC: "Nutrition and oxygen, and removes waste",
    optionD: "Protection only",
    correctOption: "C",
    solution: "The placenta is a disc-shaped structure that provides nutrients and oxygen from the mother's blood to the embryo and removes waste products."
  },
  {
    questionText: "Grafting is a method of:",
    optionA: "Sexual reproduction",
    optionB: "Vegetative propagation",
    optionC: "Spore formation",
    optionD: "Regeneration",
    correctOption: "B",
    solution: "Grafting is an artificial method of vegetative propagation where a stem cutting (scion) is joined to the rootstock of another plant."
  },
  {
    questionText: "Which organism reproduces by budding?",
    optionA: "Amoeba",
    optionB: "Planaria",
    optionC: "Yeast",
    optionD: "Spirogyra",
    correctOption: "C",
    solution: "Yeast reproduces by budding. A small bud forms on the parent cell, grows and eventually detaches to form a new individual."
  },
  {
    questionText: "Unisexual flowers have:",
    optionA: "Both stamen and pistil",
    optionB: "Either stamen or pistil",
    optionC: "Neither stamen nor pistil",
    optionD: "Only petals",
    correctOption: "B",
    solution: "Unisexual flowers contain either male (stamen) or female (pistil) reproductive organs, not both. E.g., papaya, watermelon."
  },
  {
    questionText: "The sex of a child is determined by:",
    optionA: "The mother's chromosomes",
    optionB: "The father's chromosomes",
    optionC: "Environmental factors",
    optionD: "Nutrition of mother",
    correctOption: "B",
    solution: "The father determines the sex of the child. If sperm with X chromosome fertilises the egg, the child is female (XX). If Y chromosome, it is male (XY)."
  },
  {
    questionText: "Which part of the flower protects it when it is in bud form?",
    optionA: "Petals",
    optionB: "Sepals",
    optionC: "Stamen",
    optionD: "Pistil",
    correctOption: "B",
    solution: "Sepals are the green, leaf-like structures that form the outermost whorl of a flower and protect the flower bud."
  },
  {
    questionText: "Copper-T is placed in the:",
    optionA: "Fallopian tube",
    optionB: "Uterus",
    optionC: "Ovary",
    optionD: "Vagina",
    correctOption: "B",
    solution: "Copper-T (IUD) is inserted into the uterus by a doctor. It prevents implantation of the fertilised egg in the uterine wall."
  },
  {
    questionText: "Multiple fission is seen in:",
    optionA: "Hydra",
    optionB: "Yeast",
    optionC: "Plasmodium",
    optionD: "Planaria",
    correctOption: "C",
    solution: "Plasmodium (malarial parasite) reproduces by multiple fission where the parent cell divides into many daughter cells simultaneously."
  },
  {
    questionText: "Self-pollination involves transfer of pollen from:",
    optionA: "Anther to stigma of a different flower",
    optionB: "Anther to stigma of the same flower or same plant",
    optionC: "Stigma to anther",
    optionD: "Ovary to anther",
    correctOption: "B",
    solution: "Self-pollination is the transfer of pollen grains from the anther to the stigma of the same flower or another flower on the same plant."
  },
  {
    questionText: "The zygote divides repeatedly to form a ball of cells called:",
    optionA: "Foetus",
    optionB: "Embryo",
    optionC: "Placenta",
    optionD: "Blastocyst",
    correctOption: "B",
    solution: "The zygote undergoes cell division (cleavage) to form an embryo, which gets embedded in the uterine wall and further develops into a foetus."
  }
];

const heredityQuestions = [
  {
    questionText: "The study of heredity and variation is called:",
    optionA: "Ecology",
    optionB: "Genetics",
    optionC: "Evolution",
    optionD: "Taxonomy",
    correctOption: "B",
    solution: "Genetics is the branch of biology that deals with the study of heredity (transmission of traits) and variation."
  },
  {
    questionText: "Mendel's experiments were based on which plant?",
    optionA: "Rose",
    optionB: "Mango",
    optionC: "Garden pea (Pisum sativum)",
    optionD: "Wheat",
    correctOption: "C",
    solution: "Gregor Mendel conducted his experiments on garden pea (Pisum sativum) because of its short generation time, many contrasting traits and ease of cross-pollination."
  },
  {
    questionText: "A cross between two pea plants with genotypes Tt × Tt will give the phenotypic ratio of:",
    optionA: "1:1",
    optionB: "1:2:1",
    optionC: "3:1",
    optionD: "2:1",
    correctOption: "C",
    solution: "A monohybrid cross Tt × Tt gives genotypic ratio 1TT:2Tt:1tt. Since T is dominant, phenotypic ratio is 3 tall : 1 short (3:1)."
  },
  {
    questionText: "Genes are located on:",
    optionA: "Cell membrane",
    optionB: "Chromosomes",
    optionC: "Cytoplasm",
    optionD: "Mitochondria",
    correctOption: "B",
    solution: "Genes are segments of DNA located on chromosomes. They carry hereditary information from parents to offspring."
  },
  {
    questionText: "In humans, the number of chromosomes is:",
    optionA: "44",
    optionB: "46",
    optionC: "48",
    optionD: "23",
    correctOption: "B",
    solution: "Humans have 46 chromosomes (23 pairs) — 22 pairs of autosomes and 1 pair of sex chromosomes."
  },
  {
    questionText: "Which of the following is a dominant trait in Mendel's pea plant experiments?",
    optionA: "Dwarf plant",
    optionB: "Green seed colour",
    optionC: "Round seed shape",
    optionD: "White flower colour",
    correctOption: "C",
    solution: "Round seed shape is dominant over wrinkled. Other dominant traits include tall plant, violet flowers, yellow seed colour and green pod colour."
  },
  {
    questionText: "Sex chromosomes in human males are:",
    optionA: "XX",
    optionB: "XY",
    optionC: "YY",
    optionD: "XO",
    correctOption: "B",
    solution: "Human males have XY sex chromosomes and females have XX. The Y chromosome determines maleness."
  },
  {
    questionText: "An organism with two identical alleles for a trait is called:",
    optionA: "Heterozygous",
    optionB: "Homozygous",
    optionC: "Hybrid",
    optionD: "Mutant",
    correctOption: "B",
    solution: "Homozygous means having two identical alleles for a gene (e.g., TT or tt). Heterozygous means having two different alleles (e.g., Tt)."
  },
  {
    questionText: "The F2 generation phenotypic ratio in a dihybrid cross is:",
    optionA: "3:1",
    optionB: "1:2:1",
    optionC: "9:3:3:1",
    optionD: "1:1:1:1",
    correctOption: "C",
    solution: "In a dihybrid cross (two traits), the F2 generation shows a 9:3:3:1 phenotypic ratio, demonstrating independent assortment of genes."
  },
  {
    questionText: "Which of the following is an acquired trait?",
    optionA: "Eye colour",
    optionB: "Blood group",
    optionC: "Muscular body of a wrestler",
    optionD: "Skin colour",
    correctOption: "C",
    solution: "Acquired traits develop during an individual's lifetime due to environmental factors and are not inherited. A wrestler's muscular body is an acquired trait."
  },
  {
    questionText: "Variation is important for a species because it:",
    optionA: "Makes organisms look different",
    optionB: "Increases survival in changing environment",
    optionC: "Has no significance",
    optionD: "Reduces population",
    correctOption: "B",
    solution: "Variation helps species survive environmental changes. Individuals with favourable variations have a better chance of survival (natural selection)."
  },
  {
    questionText: "The trait that appears in F1 generation is called:",
    optionA: "Recessive trait",
    optionB: "Dominant trait",
    optionC: "Acquired trait",
    optionD: "Co-dominant trait",
    correctOption: "B",
    solution: "The dominant trait is expressed in the F1 (first filial) generation when two pure breeding parents with contrasting traits are crossed."
  },
  {
    questionText: "According to Mendel's law of segregation:",
    optionA: "Genes blend during inheritance",
    optionB: "Each gene pair separates during gamete formation",
    optionC: "Only dominant traits are inherited",
    optionD: "Traits skip every generation",
    correctOption: "B",
    solution: "The law of segregation states that during gamete formation, the two alleles of a gene separate so that each gamete carries only one allele."
  },
  {
    questionText: "Which of the following contributes to evolution?",
    optionA: "Only genetic drift",
    optionB: "Only natural selection",
    optionC: "Variation, natural selection and genetic drift",
    optionD: "Only acquired traits",
    correctOption: "C",
    solution: "Evolution is driven by variation (from mutation and sexual reproduction), natural selection (survival of the fittest) and genetic drift (random changes in gene frequency)."
  },
  {
    questionText: "Analogous organs indicate:",
    optionA: "Common ancestry",
    optionB: "Convergent evolution",
    optionC: "Same origin",
    optionD: "No evolutionary significance",
    correctOption: "B",
    solution: "Analogous organs have different origin but similar function (e.g., wings of bat and bird vs insect). They show convergent evolution, not common ancestry."
  },
  {
    questionText: "Homologous organs are evidence of:",
    optionA: "Convergent evolution",
    optionB: "Common ancestor (divergent evolution)",
    optionC: "No evolution",
    optionD: "Artificial selection",
    correctOption: "B",
    solution: "Homologous organs have similar origin and structure but may differ in function (e.g., forelimbs of whale, bat, human). They indicate common ancestry."
  },
  {
    questionText: "The theory of evolution by natural selection was proposed by:",
    optionA: "Mendel",
    optionB: "Lamarck",
    optionC: "Darwin",
    optionD: "Watson",
    correctOption: "C",
    solution: "Charles Darwin proposed the theory of evolution by natural selection. Organisms with favourable variations survive and reproduce (survival of the fittest)."
  },
  {
    questionText: "Fossils provide evidence for:",
    optionA: "Mendel's laws",
    optionB: "Evolution",
    optionC: "Reproduction",
    optionD: "Nutrition",
    correctOption: "B",
    solution: "Fossils are preserved remains of ancient organisms. They provide direct evidence of evolution by showing how organisms have changed over millions of years."
  },
  {
    questionText: "Speciation occurs due to:",
    optionA: "Gene flow between populations",
    optionB: "Geographical isolation and genetic drift",
    optionC: "Identical DNA copying",
    optionD: "Asexual reproduction",
    correctOption: "B",
    solution: "Speciation occurs when populations become geographically isolated, accumulate genetic differences through drift and natural selection, and can no longer interbreed."
  },
  {
    questionText: "Which of the following is a vestigial organ in humans?",
    optionA: "Heart",
    optionB: "Appendix",
    optionC: "Lungs",
    optionD: "Kidney",
    correctOption: "B",
    solution: "The appendix is a vestigial organ in humans — it has no significant function now but was functional in our ancestors for digesting cellulose."
  },
  {
    questionText: "The genotype of a tall heterozygous pea plant is:",
    optionA: "TT",
    optionB: "Tt",
    optionC: "tt",
    optionD: "tT",
    correctOption: "B",
    solution: "A heterozygous tall plant has genotype Tt — one dominant allele (T) and one recessive allele (t). It appears tall because T is dominant."
  },
  {
    questionText: "What percentage of offspring will be dwarf in a cross Tt × Tt?",
    optionA: "100%",
    optionB: "75%",
    optionC: "50%",
    optionD: "25%",
    correctOption: "D",
    solution: "Tt × Tt gives TT:Tt:Tt:tt = 1:2:1. Only tt (25%) will be dwarf since tallness (T) is dominant."
  },
  {
    questionText: "The human evolution started from:",
    optionA: "Europe",
    optionB: "Asia",
    optionC: "Africa",
    optionD: "Australia",
    correctOption: "C",
    solution: "Evidence (fossils and DNA studies) indicates that modern humans (Homo sapiens) evolved in Africa and then migrated to other continents."
  },
  {
    questionText: "Which of the following can lead to genetic variation?",
    optionA: "Vegetative propagation",
    optionB: "Sexual reproduction",
    optionC: "Binary fission",
    optionD: "Fragmentation",
    correctOption: "B",
    solution: "Sexual reproduction involves fusion of gametes from two parents, leading to new combinations of genes and hence genetic variation."
  },
  {
    questionText: "Mendel is known as the:",
    optionA: "Father of Evolution",
    optionB: "Father of Genetics",
    optionC: "Father of Botany",
    optionD: "Father of Zoology",
    correctOption: "B",
    solution: "Gregor Johann Mendel is known as the 'Father of Genetics' for his pioneering work on inheritance patterns using garden pea plants."
  }
];

const environmentQuestions = [
  {
    questionText: "Which of the following is a biodegradable substance?",
    optionA: "Plastic bags",
    optionB: "Glass bottles",
    optionC: "Vegetable peels",
    optionD: "Aluminium cans",
    correctOption: "C",
    solution: "Vegetable peels are biodegradable as they can be broken down by microorganisms. Plastic, glass and aluminium are non-biodegradable."
  },
  {
    questionText: "The first trophic level in a food chain is always occupied by:",
    optionA: "Herbivores",
    optionB: "Carnivores",
    optionC: "Producers (green plants)",
    optionD: "Decomposers",
    correctOption: "C",
    solution: "Producers (autotrophs/green plants) always occupy the first trophic level as they convert solar energy into food energy through photosynthesis."
  },
  {
    questionText: "What percentage of energy is transferred from one trophic level to the next?",
    optionA: "50%",
    optionB: "20%",
    optionC: "10%",
    optionD: "1%",
    correctOption: "C",
    solution: "According to the 10% law (Lindeman), only 10% of energy at one trophic level is transferred to the next. The rest is lost as heat in respiration."
  },
  {
    questionText: "Ozone layer depletion is primarily caused by:",
    optionA: "Carbon dioxide",
    optionB: "Chlorofluorocarbons (CFCs)",
    optionC: "Sulphur dioxide",
    optionD: "Carbon monoxide",
    correctOption: "B",
    solution: "CFCs (used in refrigerators and aerosols) break down ozone (O₃) in the stratosphere into oxygen (O₂), depleting the ozone layer."
  },
  {
    questionText: "Biomagnification refers to:",
    optionA: "Increase in biodiversity",
    optionB: "Progressive accumulation of non-biodegradable substances in food chain",
    optionC: "Growth of organisms",
    optionD: "Increase in population",
    correctOption: "B",
    solution: "Biomagnification is the progressive increase in concentration of non-biodegradable toxins (like DDT, heavy metals) at each trophic level in a food chain."
  },
  {
    questionText: "Which of the following is an example of a food chain?",
    optionA: "Grass → Deer → Lion",
    optionB: "Lion → Deer → Grass",
    optionC: "Deer → Grass → Lion",
    optionD: "Grass → Lion → Deer",
    correctOption: "A",
    solution: "A food chain shows the flow of energy from producer (grass) to primary consumer (deer/herbivore) to secondary consumer (lion/carnivore)."
  },
  {
    questionText: "The accumulation of DDT is maximum in:",
    optionA: "Primary producers",
    optionB: "Primary consumers",
    optionC: "Top carnivores",
    optionD: "Decomposers",
    correctOption: "C",
    solution: "Due to biomagnification, non-biodegradable pesticides like DDT accumulate at the highest concentration in top carnivores at the end of the food chain."
  },
  {
    questionText: "Which gas is responsible for the greenhouse effect?",
    optionA: "Oxygen",
    optionB: "Nitrogen",
    optionC: "Carbon dioxide",
    optionD: "Hydrogen",
    correctOption: "C",
    solution: "Carbon dioxide and other greenhouse gases (methane, CFCs) trap heat radiation from the earth, causing the greenhouse effect and global warming."
  },
  {
    questionText: "Decomposers include:",
    optionA: "Green plants",
    optionB: "Herbivores",
    optionC: "Bacteria and fungi",
    optionD: "Carnivores",
    correctOption: "C",
    solution: "Decomposers (bacteria and fungi) break down dead organic matter into simple inorganic substances, recycling nutrients back into the ecosystem."
  },
  {
    questionText: "An ecosystem includes:",
    optionA: "Only living organisms",
    optionB: "Only non-living factors",
    optionC: "Both biotic and abiotic components",
    optionD: "Only plants",
    correctOption: "C",
    solution: "An ecosystem is a functional unit consisting of biotic components (living organisms) and abiotic components (soil, water, air, temperature, light)."
  },
  {
    questionText: "The ozone layer is found in the:",
    optionA: "Troposphere",
    optionB: "Stratosphere",
    optionC: "Mesosphere",
    optionD: "Thermosphere",
    correctOption: "B",
    solution: "The ozone layer is found in the stratosphere (15-60 km above Earth's surface) and protects life by absorbing harmful UV radiation."
  },
  {
    questionText: "Which of the following is NOT a natural ecosystem?",
    optionA: "Forest",
    optionB: "Pond",
    optionC: "Aquarium",
    optionD: "Desert",
    correctOption: "C",
    solution: "An aquarium is an artificial (man-made) ecosystem. Forests, ponds and deserts are natural ecosystems."
  },
  {
    questionText: "In a food chain, tertiary consumers are:",
    optionA: "Herbivores",
    optionB: "Primary carnivores",
    optionC: "Top carnivores",
    optionD: "Producers",
    correctOption: "C",
    solution: "Tertiary consumers are top carnivores that feed on secondary consumers. E.g., in Grass→Grasshopper→Frog→Snake→Eagle, eagle is the tertiary consumer."
  },
  {
    questionText: "Which human activity leads to maximum environmental damage?",
    optionA: "Planting trees",
    optionB: "Burning fossil fuels",
    optionC: "Recycling waste",
    optionD: "Using solar energy",
    correctOption: "B",
    solution: "Burning fossil fuels releases CO₂, SO₂ and other pollutants causing air pollution, greenhouse effect, acid rain and climate change."
  },
  {
    questionText: "A food web is formed by:",
    optionA: "Single food chain",
    optionB: "Interconnected food chains",
    optionC: "Only producers",
    optionD: "Only consumers",
    correctOption: "B",
    solution: "A food web is a complex network of interconnected food chains in an ecosystem. Organisms may be part of multiple food chains."
  },
  {
    questionText: "UNEP stands for:",
    optionA: "United Nations Environment Programme",
    optionB: "United Nations Education Plan",
    optionC: "Universal Nature and Energy Programme",
    optionD: "United Nations Ecology Programme",
    correctOption: "A",
    solution: "UNEP (United Nations Environment Programme) was established to address environmental issues globally. It initiated the ozone protection efforts."
  },
  {
    questionText: "UV radiation from the sun can cause:",
    optionA: "Better vision",
    optionB: "Skin cancer and cataracts",
    optionC: "Stronger bones",
    optionD: "Faster plant growth",
    correctOption: "B",
    solution: "Harmful UV radiation can cause skin cancer, cataracts, damage to immune system and harm to crops and aquatic organisms."
  },
  {
    questionText: "Which trophic level has the maximum energy?",
    optionA: "Primary consumers",
    optionB: "Secondary consumers",
    optionC: "Producers",
    optionD: "Top carnivores",
    correctOption: "C",
    solution: "Producers have the maximum energy as they directly capture solar energy. Energy decreases at each successive trophic level (10% law)."
  },
  {
    questionText: "Disposable plastic plates are harmful because they are:",
    optionA: "Biodegradable",
    optionB: "Non-biodegradable and persist in environment",
    optionC: "Made from natural substances",
    optionD: "Easily recycled",
    correctOption: "B",
    solution: "Plastic is non-biodegradable — it does not decompose naturally and persists in the environment for hundreds of years, causing pollution."
  },
  {
    questionText: "The number of trophic levels in a food chain is generally limited to:",
    optionA: "2-3",
    optionB: "3-4",
    optionC: "6-7",
    optionD: "10-12",
    correctOption: "B",
    solution: "Food chains generally have 3-4 trophic levels because only 10% energy passes to the next level. Very little energy remains after 3-4 transfers."
  },
  {
    questionText: "Organisms that can make their own food are called:",
    optionA: "Heterotrophs",
    optionB: "Autotrophs",
    optionC: "Saprotrophs",
    optionD: "Parasites",
    correctOption: "B",
    solution: "Autotrophs (self-feeders) synthesise their own food using light energy (photosynthesis) or chemical energy (chemosynthesis). Green plants are autotrophs."
  },
  {
    questionText: "The full form of CFC is:",
    optionA: "Chloro Fluoro Carbon",
    optionB: "Carbon Fluoro Chloride",
    optionC: "Chlorofluorocarbon",
    optionD: "Both A and C",
    correctOption: "D",
    solution: "CFC stands for Chlorofluorocarbon. These synthetic compounds contain chlorine, fluorine and carbon atoms and are responsible for ozone depletion."
  },
  {
    questionText: "Which of the following is an abiotic component of an ecosystem?",
    optionA: "Plants",
    optionB: "Animals",
    optionC: "Temperature",
    optionD: "Bacteria",
    correctOption: "C",
    solution: "Abiotic components are non-living factors like temperature, water, sunlight, soil, air. Plants, animals and bacteria are biotic (living) components."
  },
  {
    questionText: "The pyramid of energy in an ecosystem is always:",
    optionA: "Inverted",
    optionB: "Upright",
    optionC: "Spindle-shaped",
    optionD: "Flat",
    correctOption: "B",
    solution: "The pyramid of energy is always upright because energy decreases progressively from producers to top consumers due to energy loss at each trophic level."
  },
  {
    questionText: "Biodegradable wastes can be converted to useful substances by:",
    optionA: "Incineration",
    optionB: "Composting",
    optionC: "Land filling only",
    optionD: "Burning",
    correctOption: "B",
    solution: "Composting converts biodegradable waste (kitchen waste, leaves) into compost (organic fertilizer) through microbial decomposition."
  }
];

const managementNaturalResourcesQuestions = [
  {
    questionText: "The three R's to save the environment are:",
    optionA: "Reuse, Redistribute, Recycle",
    optionB: "Reduce, Reuse, Recycle",
    optionC: "Reduce, Rebuild, Recycle",
    optionD: "Reclaim, Reduce, Reuse",
    correctOption: "B",
    solution: "The three R's — Reduce (use less), Reuse (use again), Recycle (convert waste into new products) — help conserve natural resources and reduce pollution."
  },
  {
    questionText: "Chipko movement was started to conserve:",
    optionA: "Water bodies",
    optionB: "Soil",
    optionC: "Trees/Forests",
    optionD: "Wildlife",
    correctOption: "C",
    solution: "The Chipko movement (1970s, Garhwal Himalayas) was a forest conservation movement where people hugged trees to prevent them from being felled."
  },
  {
    questionText: "Ganga Action Plan was launched in the year:",
    optionA: "1975",
    optionB: "1985",
    optionC: "1995",
    optionD: "2005",
    correctOption: "B",
    solution: "The Ganga Action Plan was launched in 1985 to reduce the pollution levels in the river Ganga through sewage treatment and industrial waste management."
  },
  {
    questionText: "Which of the following is a fossil fuel?",
    optionA: "Wood",
    optionB: "Coal",
    optionC: "Biogas",
    optionD: "Hydrogen",
    correctOption: "B",
    solution: "Coal, petroleum and natural gas are fossil fuels formed over millions of years from dead organisms. They are non-renewable resources."
  },
  {
    questionText: "Rainwater harvesting is done to:",
    optionA: "Prevent floods only",
    optionB: "Recharge groundwater",
    optionC: "Generate electricity",
    optionD: "Purify water",
    correctOption: "B",
    solution: "Rainwater harvesting involves collecting and storing rainwater to recharge groundwater, reduce surface runoff and ensure water availability."
  },
  {
    questionText: "Coliform bacteria in water indicates contamination with:",
    optionA: "Industrial chemicals",
    optionB: "Human faecal matter",
    optionC: "Pesticides",
    optionD: "Heavy metals",
    correctOption: "B",
    solution: "Coliform bacteria (like E. coli) are found in human intestines. Their presence in water indicates contamination with sewage/faecal matter."
  },
  {
    questionText: "Which of the following is a non-renewable resource?",
    optionA: "Solar energy",
    optionB: "Wind energy",
    optionC: "Petroleum",
    optionD: "Biomass",
    correctOption: "C",
    solution: "Petroleum is a non-renewable resource formed over millions of years and cannot be replenished quickly. Solar, wind and biomass are renewable."
  },
  {
    questionText: "Sustainable development means:",
    optionA: "Stopping all development",
    optionB: "Development without caring about future",
    optionC: "Meeting present needs without compromising future generations",
    optionD: "Rapid industrialisation",
    correctOption: "C",
    solution: "Sustainable development is development that meets the needs of the present without compromising the ability of future generations to meet their own needs."
  },
  {
    questionText: "The pH of acid rain is less than:",
    optionA: "7.0",
    optionB: "5.6",
    optionC: "6.5",
    optionD: "4.0",
    correctOption: "B",
    solution: "Normal rain has pH around 5.6 due to dissolved CO₂. Acid rain has pH less than 5.6 due to dissolved pollutants like SO₂ and NO₂."
  },
  {
    questionText: "Which of the following is an example of reuse?",
    optionA: "Making new paper from old paper",
    optionB: "Using plastic bags again for shopping",
    optionC: "Melting aluminium cans to make new ones",
    optionD: "Converting waste to biogas",
    correctOption: "B",
    solution: "Reuse means using an item again without any processing. Using plastic bags again is reuse. Making new paper from old is recycling."
  },
  {
    questionText: "Khadin system of water harvesting is used in:",
    optionA: "Kerala",
    optionB: "Rajasthan",
    optionC: "Tamil Nadu",
    optionD: "Meghalaya",
    correctOption: "B",
    solution: "Khadin is a traditional rainwater harvesting system used in Rajasthan (arid region) to collect and conserve rainwater for agriculture."
  },
  {
    questionText: "Forests are called 'biodiversity hot spots' because they:",
    optionA: "Have high temperature",
    optionB: "Harbour a large variety of species",
    optionC: "Have many trees",
    optionD: "Receive heavy rainfall",
    correctOption: "B",
    solution: "Forests are biodiversity hotspots because they contain a rich variety of plant and animal species, many of which may be endemic."
  },
  {
    questionText: "Stakeholders of forests include all EXCEPT:",
    optionA: "People living in and around forests",
    optionB: "Forest Department of government",
    optionC: "Wildlife and nature enthusiasts",
    optionD: "Deep sea fishermen",
    correctOption: "D",
    solution: "Stakeholders of forests include local communities, Forest Department, industrialists and nature/wildlife enthusiasts. Deep sea fishermen are not forest stakeholders."
  },
  {
    questionText: "Coal and petroleum are formed from:",
    optionA: "Volcanic activity",
    optionB: "Remains of ancient organisms under heat and pressure",
    optionC: "Soil erosion",
    optionD: "Chemical reactions in atmosphere",
    correctOption: "B",
    solution: "Fossil fuels formed from remains of organisms buried millions of years ago, subjected to high temperature and pressure under the earth's crust."
  },
  {
    questionText: "Which act was introduced for conservation of forests in India?",
    optionA: "Wildlife Protection Act",
    optionB: "Forest Conservation Act",
    optionC: "Water Act",
    optionD: "Air Act",
    correctOption: "B",
    solution: "The Forest Conservation Act was enacted to prevent deforestation and ensure conservation and sustainable use of forest resources in India."
  },
  {
    questionText: "Amrita Devi Bishnoi sacrificed her life to protect:",
    optionA: "Water resources",
    optionB: "Khejri trees",
    optionC: "Wildlife",
    optionD: "Soil",
    correctOption: "B",
    solution: "In 1731, Amrita Devi Bishnoi sacrificed her life along with 363 others to protect Khejri trees in Khejrali village, Rajasthan."
  },
  {
    questionText: "Dams are built for all the following purposes EXCEPT:",
    optionA: "Irrigation",
    optionB: "Electricity generation",
    optionC: "Increasing pollution",
    optionD: "Water supply",
    correctOption: "C",
    solution: "Dams are built for water storage, irrigation, hydroelectricity generation and flood control. They may cause environmental issues but are not built to increase pollution."
  },
  {
    questionText: "The main cause of depletion of wildlife is:",
    optionA: "Afforestation",
    optionB: "Conservation efforts",
    optionC: "Habitat destruction and poaching",
    optionD: "Rainwater harvesting",
    correctOption: "C",
    solution: "Habitat destruction (deforestation, urbanisation), poaching and pollution are the main causes of decline in wildlife populations."
  },
  {
    questionText: "Which of the following is a greenhouse gas?",
    optionA: "Oxygen",
    optionB: "Nitrogen",
    optionC: "Methane",
    optionD: "Argon",
    correctOption: "C",
    solution: "Methane (CH₄) is a potent greenhouse gas. Other greenhouse gases include CO₂, water vapour, nitrous oxide and CFCs."
  },
  {
    questionText: "Kulhs are traditional water harvesting structures found in:",
    optionA: "Rajasthan",
    optionB: "Himachal Pradesh",
    optionC: "Karnataka",
    optionD: "Maharashtra",
    correctOption: "B",
    solution: "Kulhs are traditional water channels used in Himachal Pradesh to divert water from streams for irrigation in hill areas."
  },
  {
    questionText: "The quality of water in a river can be measured by checking:",
    optionA: "Temperature only",
    optionB: "Colour only",
    optionC: "pH and coliform count",
    optionD: "Taste",
    correctOption: "C",
    solution: "Water quality is measured by pH, dissolved oxygen, coliform count, BOD (Biochemical Oxygen Demand) and levels of dissolved contaminants."
  },
  {
    questionText: "Conservation of biodiversity is important because:",
    optionA: "It has economic value only",
    optionB: "It maintains ecological balance and provides resources",
    optionC: "It has no significance",
    optionD: "It only benefits scientists",
    correctOption: "B",
    solution: "Biodiversity conservation maintains ecological balance, provides food, medicines, raw materials and ensures ecosystem stability for future generations."
  },
  {
    questionText: "Which of the following water harvesting methods involves building an earthen embankment?",
    optionA: "Rooftop collection",
    optionB: "Percolation pit",
    optionC: "Check dam",
    optionD: "Kulh",
    correctOption: "C",
    solution: "Check dams are small earthen embankments built across rivers/streams to slow water flow, reduce soil erosion and promote groundwater recharge."
  },
  {
    questionText: "The major programme started in 1985 to clean the river Ganga is called:",
    optionA: "Swachh Bharat",
    optionB: "Ganga Action Plan",
    optionC: "Clean India Movement",
    optionD: "Narmada Bachao Andolan",
    correctOption: "B",
    solution: "Ganga Action Plan (GAP) was launched in 1985 to reduce pollution by intercepting, diverting and treating sewage flowing into the river."
  },
  {
    questionText: "An equitable distribution of resources means:",
    optionA: "Resources are used only by the rich",
    optionB: "Resources are shared fairly among all people",
    optionC: "Resources are wasted freely",
    optionD: "Only government uses resources",
    correctOption: "B",
    solution: "Equitable distribution means fair sharing of resources so that all people, including future generations, have access to them for their needs."
  }
];

// ===================== MAIN SEED FUNCTION =====================

async function main() {
  try {
    console.log("=== Seeding Class 10 Biology Quiz Questions ===\n");

    // Step 1: Check for missing chapters
    console.log("Checking for missing CBSE chapters...");
    const existingChapters = await prisma.chapter.findMany({
      where: { subjectId: SUBJECT_ID },
      select: { id: true, name: true, order: true }
    });
    console.log(`Found ${existingChapters.length} existing chapters:`, existingChapters.map(c => c.name));

    const existingNames = existingChapters.map(c => c.name.toLowerCase());

    // Check "Heredity and Evolution" - the existing one is just "Heredity"
    const hasHeredityEvolution = existingNames.some(n => n.includes("heredity and evolution"));
    const hasManagement = existingNames.some(n => n.includes("management of natural resources"));

    // If "Heredity and Evolution" doesn't exist as a separate chapter, rename existing "Heredity" or note it
    if (!hasHeredityEvolution) {
      console.log('Note: "Heredity and Evolution" full name not found. Using existing "Heredity" chapter (cmmormh7y00c1uu7wc1rpjkwc).');
    }

    let managementChapterId = null;
    if (!hasManagement) {
      console.log('Creating missing chapter: "Management of Natural Resources"...');
      const newChapter = await prisma.chapter.create({
        data: {
          subjectId: SUBJECT_ID,
          name: "Management of Natural Resources",
          order: 6
        }
      });
      managementChapterId = newChapter.id;
      console.log(`Created chapter with ID: ${managementChapterId}`);
    } else {
      const mgmt = existingChapters.find(c => c.name.toLowerCase().includes("management of natural resources"));
      managementChapterId = mgmt.id;
      console.log(`"Management of Natural Resources" already exists with ID: ${managementChapterId}`);
    }

    // Build the final chapter-question mapping
    const chapterQuestionMap = [
      { id: "cmmormedo00ahuu7wawme5cpx", name: "Life Processes", questions: lifeProcessesQuestions },
      { id: "cmmormfeu00b1uu7wysbvzo94", name: "Control and Coordination", questions: controlCoordinationQuestions },
      { id: "cmmormgf700bluu7wldckn1xt", name: "How do Organisms Reproduce", questions: reproductionQuestions },
      { id: "cmmormh7y00c1uu7wc1rpjkwc", name: "Heredity", questions: heredityQuestions },
      { id: "cmmormnhv00fduu7wyab0pqdb", name: "Our Environment", questions: environmentQuestions },
      { id: managementChapterId, name: "Management of Natural Resources", questions: managementNaturalResourcesQuestions },
    ];

    // Step 2: Seed questions for each chapter
    for (const chapter of chapterQuestionMap) {
      console.log(`\n--- ${chapter.name} (${chapter.id}) ---`);

      // Delete existing questions
      const deleted = await prisma.question.deleteMany({
        where: { chapterId: chapter.id }
      });
      console.log(`  Deleted ${deleted.count} existing questions`);

      // Insert new questions
      const data = chapter.questions.map(q => ({
        chapterId: chapter.id,
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctOption: q.correctOption,
        solution: q.solution,
      }));

      const result = await prisma.question.createMany({ data });
      console.log(`  Inserted ${result.count} questions`);

      // Verify distribution
      const dist = { A: 0, B: 0, C: 0, D: 0 };
      chapter.questions.forEach(q => dist[q.correctOption]++);
      console.log(`  Answer distribution: A=${dist.A}, B=${dist.B}, C=${dist.C}, D=${dist.D}`);
    }

    console.log("\n=== Seeding complete! ===");
    const totalQuestions = chapterQuestionMap.reduce((sum, ch) => sum + ch.questions.length, 0);
    console.log(`Total questions seeded: ${totalQuestions} across ${chapterQuestionMap.length} chapters`);

  } catch (error) {
    console.error("Error seeding questions:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
