const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const SUBJECT_ID = "cmmn2eo5x001luuksnjfr6zaf";

const chapters = [
  {
    id: "cmmorlzu8002puu7w5u4idq61",
    name: "The Fundamental Unit Of Life",
    questions: [
      { questionText: "Who discovered the cell?", optionA: "Robert Hooke", optionB: "Robert Brown", optionC: "Leeuwenhoek", optionD: "Virchow", correctOption: "A", solution: "Robert Hooke discovered the cell in 1665 by observing thin slices of cork under a microscope." },
      { questionText: "Which organelle is known as the 'powerhouse of the cell'?", optionA: "Golgi apparatus", optionB: "Mitochondria", optionC: "Endoplasmic reticulum", optionD: "Nucleus", correctOption: "B", solution: "Mitochondria produce ATP through cellular respiration, providing energy for the cell." },
      { questionText: "The plasma membrane is:", optionA: "Fully permeable", optionB: "Impermeable", optionC: "Selectively permeable", optionD: "Non-permeable", correctOption: "C", solution: "The plasma membrane is selectively permeable, allowing only certain molecules to pass through." },
      { questionText: "Which organelle is known as the 'suicide bags' of the cell?", optionA: "Ribosomes", optionB: "Lysosomes", optionC: "Golgi bodies", optionD: "Vacuoles", correctOption: "B", solution: "Lysosomes contain hydrolytic enzymes that can digest the cell itself when the cell is damaged, hence called suicide bags." },
      { questionText: "Prokaryotic cells lack:", optionA: "Cell wall", optionB: "Plasma membrane", optionC: "Nuclear membrane", optionD: "Ribosomes", correctOption: "C", solution: "Prokaryotic cells do not have a well-defined nuclear membrane; their genetic material is not enclosed in a nucleus." },
      { questionText: "Which of the following is not a function of the endoplasmic reticulum?", optionA: "Protein synthesis", optionB: "Lipid synthesis", optionC: "Detoxification", optionD: "Photosynthesis", correctOption: "D", solution: "Photosynthesis occurs in chloroplasts, not in the endoplasmic reticulum." },
      { questionText: "The cell theory was given by:", optionA: "Watson and Crick", optionB: "Schleiden and Schwann", optionC: "Mendel and Darwin", optionD: "Hooke and Brown", correctOption: "B", solution: "Schleiden (1838) and Schwann (1839) proposed that all living organisms are composed of cells." },
      { questionText: "Chromosomes are made up of:", optionA: "DNA only", optionB: "Protein only", optionC: "DNA and protein", optionD: "RNA only", correctOption: "C", solution: "Chromosomes are composed of DNA wrapped around histone proteins." },
      { questionText: "Which organelle is responsible for protein synthesis?", optionA: "Mitochondria", optionB: "Ribosomes", optionC: "Golgi apparatus", optionD: "Lysosomes", correctOption: "B", solution: "Ribosomes are the sites of protein synthesis in both prokaryotic and eukaryotic cells." },
      { questionText: "Osmosis is the movement of:", optionA: "Solute from lower to higher concentration", optionB: "Solvent from higher to lower concentration of solvent", optionC: "Solute from higher to lower concentration", optionD: "Solvent from lower to higher concentration of solvent", correctOption: "B", solution: "Osmosis is the movement of solvent (water) molecules from a region of higher solvent concentration to lower solvent concentration through a semi-permeable membrane." },
      { questionText: "Which of the following has a cell wall?", optionA: "Animal cell", optionB: "Red blood cell", optionC: "Plant cell", optionD: "Nerve cell", correctOption: "C", solution: "Plant cells have a rigid cell wall made of cellulose outside the cell membrane, which animal cells lack." },
      { questionText: "The nucleus was first discovered by:", optionA: "Robert Hooke", optionB: "Robert Brown", optionC: "Purkinje", optionD: "Leeuwenhoek", correctOption: "B", solution: "Robert Brown discovered the nucleus in 1831 while studying orchid cells." },
      { questionText: "Which part of the cell contains genes?", optionA: "Cytoplasm", optionB: "Cell membrane", optionC: "Chromosomes", optionD: "Ribosomes", correctOption: "C", solution: "Genes are segments of DNA located on chromosomes in the nucleus." },
      { questionText: "In a hypotonic solution, a cell will:", optionA: "Shrink", optionB: "Swell up", optionC: "Remain same", optionD: "Die immediately", correctOption: "B", solution: "In a hypotonic solution, water moves into the cell by osmosis, causing the cell to swell." },
      { questionText: "The jelly-like substance present inside the cell is called:", optionA: "Protoplasm", optionB: "Cytoplasm", optionC: "Nucleoplasm", optionD: "Cell sap", correctOption: "B", solution: "Cytoplasm is the jelly-like substance between the cell membrane and the nucleus." },
      { questionText: "Plastids are found in:", optionA: "Animal cells only", optionB: "Plant cells only", optionC: "Both animal and plant cells", optionD: "Bacteria only", correctOption: "B", solution: "Plastids (chloroplasts, chromoplasts, leucoplasts) are found only in plant cells." },
      { questionText: "Which of the following organelles does NOT have a membrane?", optionA: "Nucleus", optionB: "Mitochondria", optionC: "Ribosome", optionD: "Golgi apparatus", correctOption: "C", solution: "Ribosomes are non-membrane-bound organelles composed of RNA and proteins." },
      { questionText: "The functional unit of life is:", optionA: "Tissue", optionB: "Organ", optionC: "Cell", optionD: "Organism", correctOption: "C", solution: "The cell is the basic structural and functional unit of all living organisms." },
      { questionText: "Which cell organelle packages and dispatches proteins?", optionA: "Endoplasmic reticulum", optionB: "Golgi apparatus", optionC: "Mitochondria", optionD: "Lysosomes", correctOption: "B", solution: "The Golgi apparatus modifies, packages, and dispatches proteins and lipids to their destinations." },
      { questionText: "Plasmolysis occurs when a cell is placed in:", optionA: "Hypotonic solution", optionB: "Isotonic solution", optionC: "Hypertonic solution", optionD: "Distilled water", correctOption: "C", solution: "In a hypertonic solution, water moves out of the cell, causing the cell membrane to shrink away from the cell wall (plasmolysis)." },
      { questionText: "Which type of endoplasmic reticulum has ribosomes on its surface?", optionA: "Smooth ER", optionB: "Rough ER", optionC: "Both", optionD: "Neither", correctOption: "B", solution: "Rough endoplasmic reticulum (RER) has ribosomes attached to its surface, giving it a rough appearance." },
      { questionText: "The largest cell organelle in a plant cell is:", optionA: "Nucleus", optionB: "Chloroplast", optionC: "Central vacuole", optionD: "Mitochondria", correctOption: "C", solution: "The central vacuole in plant cells can occupy up to 90% of the cell volume and is the largest organelle." },
      { questionText: "ATP stands for:", optionA: "Adenosine triphosphate", optionB: "Adenine triphosphate", optionC: "Amino triphosphate", optionD: "Adenosine tetraphosphate", correctOption: "A", solution: "ATP stands for Adenosine Triphosphate, which is the energy currency of the cell." },
      { questionText: "Which of these is a unicellular organism?", optionA: "Mushroom", optionB: "Amoeba", optionC: "Fern", optionD: "Human", correctOption: "B", solution: "Amoeba is a unicellular organism that performs all life functions within a single cell." },
      { questionText: "The cell organelle involved in the formation of lysosomes is:", optionA: "Endoplasmic reticulum", optionB: "Golgi apparatus", optionC: "Ribosome", optionD: "Nucleus", correctOption: "B", solution: "Lysosomes are formed by the Golgi apparatus by packaging hydrolytic enzymes into vesicles." },
    ],
  },
  {
    id: "cmmorm0y50039uu7wfq6pg53b",
    name: "Tissues",
    questions: [
      { questionText: "A group of cells similar in structure and function is called:", optionA: "Organ", optionB: "Tissue", optionC: "Organism", optionD: "System", correctOption: "B", solution: "A tissue is a group of cells that are similar in structure and work together to perform a particular function." },
      { questionText: "Which tissue provides support to plants and makes them hard and stiff?", optionA: "Parenchyma", optionB: "Collenchyma", optionC: "Sclerenchyma", optionD: "Meristematic tissue", correctOption: "C", solution: "Sclerenchyma cells have thick, lignified walls making them hard and rigid, providing support to the plant." },
      { questionText: "Meristematic tissue is found at:", optionA: "The base of leaves", optionB: "Growing tips of stems and roots", optionC: "The bark of trees", optionD: "Inside the xylem", correctOption: "B", solution: "Meristematic tissue is found at the growing tips (apical meristems) of stems and roots where active cell division occurs." },
      { questionText: "Which type of connective tissue connects bones to bones?", optionA: "Tendon", optionB: "Ligament", optionC: "Cartilage", optionD: "Areolar tissue", correctOption: "B", solution: "Ligaments are tough, elastic connective tissues that connect bone to bone at joints." },
      { questionText: "The tissue that transports water in plants is:", optionA: "Phloem", optionB: "Xylem", optionC: "Parenchyma", optionD: "Collenchyma", correctOption: "B", solution: "Xylem is a complex permanent tissue that transports water and minerals from roots to other parts of the plant." },
      { questionText: "Epithelial tissue that lines the blood vessels is:", optionA: "Columnar epithelium", optionB: "Cuboidal epithelium", optionC: "Squamous epithelium", optionD: "Ciliated epithelium", correctOption: "C", solution: "Squamous epithelium consists of flat, thin cells that line blood vessels and alveoli for easy diffusion." },
      { questionText: "Husk of a coconut is made up of:", optionA: "Parenchyma", optionB: "Collenchyma", optionC: "Sclerenchyma", optionD: "Meristematic tissue", correctOption: "C", solution: "The husk of coconut is made of sclerenchyma tissue, which is dead, has thick lignified walls, and is very hard." },
      { questionText: "Which of the following is NOT a type of muscle tissue?", optionA: "Striated muscle", optionB: "Smooth muscle", optionC: "Cardiac muscle", optionD: "Skeletal epithelial muscle", correctOption: "D", solution: "There are only three types of muscle tissue: striated (skeletal), smooth (unstriated), and cardiac. Skeletal epithelial muscle does not exist." },
      { questionText: "Phloem is responsible for:", optionA: "Transport of water", optionB: "Transport of minerals", optionC: "Transport of food", optionD: "Providing support", correctOption: "C", solution: "Phloem transports prepared food (sugars) from leaves to other parts of the plant through translocation." },
      { questionText: "Cork cells are impervious to water because of:", optionA: "Cellulose", optionB: "Suberin", optionC: "Lignin", optionD: "Pectin", correctOption: "B", solution: "Cork cells have suberin in their walls, a waxy substance that makes them impervious to water and gases." },
      { questionText: "Neurons are the structural and functional unit of:", optionA: "Muscular tissue", optionB: "Epithelial tissue", optionC: "Nervous tissue", optionD: "Connective tissue", correctOption: "C", solution: "Neurons (nerve cells) are the structural and functional units of nervous tissue, responsible for transmitting nerve impulses." },
      { questionText: "The intercalated discs are found in:", optionA: "Skeletal muscle", optionB: "Smooth muscle", optionC: "Cardiac muscle", optionD: "All muscles", correctOption: "C", solution: "Intercalated discs are specialized junctions found between cardiac muscle cells that allow synchronized contraction." },
      { questionText: "Which plant tissue has cells with irregularly thickened corners?", optionA: "Parenchyma", optionB: "Collenchyma", optionC: "Sclerenchyma", optionD: "Xylem", correctOption: "B", solution: "Collenchyma cells have irregular thickenings at the corners due to pectin deposition, providing flexibility to young plant parts." },
      { questionText: "Aerenchyma is a type of:", optionA: "Collenchyma", optionB: "Sclerenchyma", optionC: "Parenchyma", optionD: "Meristematic tissue", correctOption: "C", solution: "Aerenchyma is a specialized parenchyma tissue with large air cavities, found in aquatic plants to provide buoyancy." },
      { questionText: "Blood is a type of:", optionA: "Epithelial tissue", optionB: "Connective tissue", optionC: "Muscular tissue", optionD: "Nervous tissue", correctOption: "B", solution: "Blood is a fluid connective tissue with a liquid matrix called plasma, containing RBCs, WBCs, and platelets." },
      { questionText: "The gap between two nerve cells is called:", optionA: "Dendrite", optionB: "Synapse", optionC: "Axon", optionD: "Cell body", correctOption: "B", solution: "A synapse is the small gap between the axon terminal of one neuron and the dendrite of the next neuron." },
      { questionText: "Which tissue allows the bending of stems without breaking?", optionA: "Parenchyma", optionB: "Collenchyma", optionC: "Sclerenchyma", optionD: "Xylem", correctOption: "B", solution: "Collenchyma provides flexibility and mechanical support to young growing stems, allowing them to bend without breaking." },
      { questionText: "Tendons connect:", optionA: "Bone to bone", optionB: "Muscle to bone", optionC: "Muscle to muscle", optionD: "Bone to cartilage", correctOption: "B", solution: "Tendons are tough, fibrous connective tissue that connect muscles to bones." },
      { questionText: "Striated muscles are also called:", optionA: "Involuntary muscles", optionB: "Smooth muscles", optionC: "Voluntary muscles", optionD: "Cardiac muscles", correctOption: "C", solution: "Striated (skeletal) muscles are called voluntary muscles because they are under conscious control." },
      { questionText: "The permanent tissue that stores food is:", optionA: "Sclerenchyma", optionB: "Collenchyma", optionC: "Parenchyma", optionD: "Xylem", correctOption: "C", solution: "Parenchyma tissue can store food, water, and nutrients. It is the most common simple permanent tissue." },
      { questionText: "Which component of phloem is living?", optionA: "Sieve tubes", optionB: "Tracheids", optionC: "Vessels", optionD: "Sclerenchyma fibres", correctOption: "A", solution: "Sieve tubes are living components of phloem that transport food. Tracheids and vessels belong to xylem." },
      { questionText: "Cardiac muscles are:", optionA: "Voluntary and striated", optionB: "Involuntary and striated", optionC: "Voluntary and unstriated", optionD: "Involuntary and unstriated", correctOption: "B", solution: "Cardiac muscles show striations (striated) but work involuntarily, continuously pumping the heart." },
      { questionText: "Lateral meristem is responsible for:", optionA: "Increase in length", optionB: "Increase in girth", optionC: "Formation of leaves", optionD: "Formation of flowers", correctOption: "B", solution: "Lateral meristem (cambium) is responsible for the increase in girth (thickness) of stems and roots through secondary growth." },
      { questionText: "Which tissue protects the body surface?", optionA: "Muscular tissue", optionB: "Connective tissue", optionC: "Epithelial tissue", optionD: "Nervous tissue", correctOption: "C", solution: "Epithelial tissue covers the body surface and lines body cavities, providing protection." },
      { questionText: "The dead element of phloem is:", optionA: "Companion cells", optionB: "Sieve tubes", optionC: "Phloem fibres", optionD: "Phloem parenchyma", correctOption: "C", solution: "Phloem fibres (bast fibres) are the only dead elements in phloem. All other phloem components are living." },
    ],
  },
  {
    id: "cmmorm1zu003puu7wcw6zsogg",
    name: "Diversity in Living Organisms",
    questions: [
      { questionText: "Who is known as the 'Father of Taxonomy'?", optionA: "Charles Darwin", optionB: "Carolus Linnaeus", optionC: "Robert Hooke", optionD: "Gregor Mendel", correctOption: "B", solution: "Carolus Linnaeus developed the binomial nomenclature system and is known as the Father of Taxonomy." },
      { questionText: "The five-kingdom classification was proposed by:", optionA: "Carolus Linnaeus", optionB: "Ernst Haeckel", optionC: "R.H. Whittaker", optionD: "Carl Woese", correctOption: "C", solution: "R.H. Whittaker proposed the five-kingdom classification (Monera, Protista, Fungi, Plantae, Animalia) in 1969." },
      { questionText: "Which kingdom includes organisms that are prokaryotic?", optionA: "Protista", optionB: "Fungi", optionC: "Monera", optionD: "Plantae", correctOption: "C", solution: "Kingdom Monera includes all prokaryotic organisms like bacteria and cyanobacteria that lack a defined nucleus." },
      { questionText: "Mushrooms belong to the kingdom:", optionA: "Plantae", optionB: "Animalia", optionC: "Protista", optionD: "Fungi", correctOption: "D", solution: "Mushrooms are fungi. They are heterotrophic, have cell walls made of chitin, and reproduce by spores." },
      { questionText: "Which of the following is NOT a characteristic of Phylum Chordata?", optionA: "Presence of notochord", optionB: "Dorsal nerve cord", optionC: "Jointed legs", optionD: "Pharyngeal gill slits", correctOption: "C", solution: "Jointed legs are a feature of Phylum Arthropoda. Chordates are characterized by notochord, dorsal nerve cord, and pharyngeal gill slits." },
      { questionText: "The binomial nomenclature consists of:", optionA: "Family and genus name", optionB: "Genus and species name", optionC: "Order and family name", optionD: "Class and order name", correctOption: "B", solution: "Binomial nomenclature uses two names: the genus name (capitalized) and the species name (lowercase), e.g., Homo sapiens." },
      { questionText: "Which division of plants produces seeds but no fruits?", optionA: "Thallophyta", optionB: "Bryophyta", optionC: "Gymnospermae", optionD: "Angiospermae", correctOption: "C", solution: "Gymnosperms (meaning 'naked seeds') produce seeds that are not enclosed in fruits, e.g., pine and cycas." },
      { questionText: "Animals that have a true body cavity (coelom) are called:", optionA: "Acoelomates", optionB: "Pseudocoelomates", optionC: "Coelomates", optionD: "Diploblastic", correctOption: "C", solution: "Coelomates are animals that have a true body cavity (coelom) lined by mesoderm, e.g., annelids, arthropods, vertebrates." },
      { questionText: "Bryophytes are called 'amphibians of the plant kingdom' because:", optionA: "They live only in water", optionB: "They live only on land", optionC: "They need water for reproduction", optionD: "They can fly", correctOption: "C", solution: "Bryophytes live on land but need water for the transport of male gametes for fertilization, hence called amphibians of the plant kingdom." },
      { questionText: "Which organism belongs to Phylum Porifera?", optionA: "Jellyfish", optionB: "Sponge", optionC: "Earthworm", optionD: "Starfish", correctOption: "B", solution: "Sponges belong to Phylum Porifera. They are the simplest multicellular animals with pores all over their body." },
      { questionText: "Bilateral symmetry is found in:", optionA: "Sponge", optionB: "Hydra", optionC: "Butterfly", optionD: "Starfish", correctOption: "C", solution: "Bilateral symmetry means the body can be divided into two equal halves along one plane. Butterflies have bilateral symmetry." },
      { questionText: "Which class of vertebrates is truly viviparous?", optionA: "Pisces", optionB: "Amphibia", optionC: "Reptilia", optionD: "Mammalia", correctOption: "D", solution: "Mammals are truly viviparous (give birth to live young) and nurse their young with milk from mammary glands." },
      { questionText: "The basic unit of classification is:", optionA: "Genus", optionB: "Species", optionC: "Family", optionD: "Order", correctOption: "B", solution: "Species is the basic unit of classification. A species is a group of organisms that can interbreed and produce fertile offspring." },
      { questionText: "Which phylum includes animals with jointed legs?", optionA: "Annelida", optionB: "Arthropoda", optionC: "Mollusca", optionD: "Echinodermata", correctOption: "B", solution: "Phylum Arthropoda (meaning 'jointed feet') includes insects, spiders, crabs, etc., all having jointed legs." },
      { questionText: "Lichens are an association between:", optionA: "Algae and fungi", optionB: "Bacteria and fungi", optionC: "Algae and bacteria", optionD: "Two types of fungi", correctOption: "A", solution: "Lichens are a symbiotic association between algae (or cyanobacteria) and fungi." },
      { questionText: "Which of the following is a warm-blooded animal?", optionA: "Fish", optionB: "Frog", optionC: "Lizard", optionD: "Pigeon", correctOption: "D", solution: "Pigeons (birds) are warm-blooded (endothermic). They maintain a constant body temperature regardless of the environment." },
      { questionText: "Thallophyta includes:", optionA: "Mosses", optionB: "Ferns", optionC: "Algae", optionD: "Conifers", correctOption: "C", solution: "Thallophyta includes algae like Spirogyra, Ulothrix, and Chara. They have a simple thallus body without true roots, stems, or leaves." },
      { questionText: "Earthworms belong to the phylum:", optionA: "Nematoda", optionB: "Annelida", optionC: "Arthropoda", optionD: "Mollusca", correctOption: "B", solution: "Earthworms belong to Phylum Annelida, characterized by segmented bodies (metameric segmentation)." },
      { questionText: "Which group of plants has vascular tissue but does not produce seeds?", optionA: "Bryophyta", optionB: "Pteridophyta", optionC: "Gymnospermae", optionD: "Angiospermae", correctOption: "B", solution: "Pteridophytes (ferns) have vascular tissue (xylem and phloem) but reproduce by spores, not seeds." },
      { questionText: "Nematocysts are found in:", optionA: "Porifera", optionB: "Coelenterata", optionC: "Annelida", optionD: "Echinodermata", correctOption: "B", solution: "Nematocysts (stinging cells) are characteristic of Phylum Coelenterata (Cnidaria), found in Hydra, jellyfish, and corals." },
      { questionText: "The correct hierarchy of classification from lowest to highest is:", optionA: "Kingdom, Phylum, Class, Order, Family, Genus, Species", optionB: "Species, Genus, Family, Order, Class, Phylum, Kingdom", optionC: "Species, Family, Genus, Order, Class, Phylum, Kingdom", optionD: "Genus, Species, Family, Order, Class, Phylum, Kingdom", correctOption: "B", solution: "The correct hierarchy from lowest to highest: Species → Genus → Family → Order → Class → Phylum → Kingdom." },
      { questionText: "Which of the following lays eggs outside water?", optionA: "Fish", optionB: "Frog", optionC: "Reptile", optionD: "Amphibian", correctOption: "C", solution: "Reptiles lay eggs with tough coverings on land. They do not need water for reproduction unlike amphibians." },
      { questionText: "Angiosperms differ from gymnosperms in having:", optionA: "Roots", optionB: "Seeds enclosed in fruits", optionC: "Vascular tissue", optionD: "Leaves", correctOption: "B", solution: "Angiosperms have seeds enclosed within fruits (ovary wall), while gymnosperms have naked seeds." },
      { questionText: "Which of these is an example of a flatworm?", optionA: "Ascaris", optionB: "Planaria", optionC: "Earthworm", optionD: "Leech", correctOption: "B", solution: "Planaria is a flatworm belonging to Phylum Platyhelminthes. Ascaris is a roundworm, earthworm and leech are annelids." },
      { questionText: "The organisms in Kingdom Protista are mostly:", optionA: "Multicellular prokaryotes", optionB: "Unicellular eukaryotes", optionC: "Multicellular eukaryotes", optionD: "Unicellular prokaryotes", correctOption: "B", solution: "Kingdom Protista includes unicellular eukaryotic organisms like Amoeba, Paramecium, and Euglena." },
    ],
  },
  {
    id: "cmmorm8ov0075uu7w0cnls44z",
    name: "Why Do We Fall Ill",
    questions: [
      { questionText: "Health is defined by WHO as a state of:", optionA: "Absence of disease", optionB: "Complete physical, mental and social well-being", optionC: "Being free from infections", optionD: "Having a strong immune system", correctOption: "B", solution: "WHO defines health as a state of complete physical, mental, and social well-being, not merely the absence of disease or infirmity." },
      { questionText: "Which of the following is a viral disease?", optionA: "Typhoid", optionB: "Malaria", optionC: "AIDS", optionD: "Cholera", correctOption: "C", solution: "AIDS is caused by HIV (Human Immunodeficiency Virus). Typhoid and cholera are bacterial, malaria is protozoan." },
      { questionText: "The pathogen of malaria is:", optionA: "Virus", optionB: "Bacteria", optionC: "Protozoa", optionD: "Fungus", correctOption: "C", solution: "Malaria is caused by Plasmodium, a protozoan parasite, transmitted by the female Anopheles mosquito." },
      { questionText: "Antibiotics work against:", optionA: "Viruses", optionB: "Bacteria", optionC: "All diseases", optionD: "Genetic disorders", correctOption: "B", solution: "Antibiotics are effective against bacteria. They block bacterial biochemical pathways but cannot work against viruses." },
      { questionText: "Which of the following is a communicable disease?", optionA: "Diabetes", optionB: "Cancer", optionC: "Tuberculosis", optionD: "Hypertension", correctOption: "C", solution: "Tuberculosis is a communicable (infectious) disease caused by Mycobacterium tuberculosis, spread through air droplets." },
      { questionText: "DPT vaccine protects against:", optionA: "Dengue, Polio, Tetanus", optionB: "Diphtheria, Pertussis, Tetanus", optionC: "Diphtheria, Polio, Typhoid", optionD: "Dengue, Pertussis, Typhoid", correctOption: "B", solution: "DPT vaccine provides immunization against Diphtheria, Pertussis (whooping cough), and Tetanus." },
      { questionText: "Peptic ulcers are caused by:", optionA: "Virus", optionB: "Helicobacter pylori", optionC: "Plasmodium", optionD: "Fungus", correctOption: "B", solution: "Peptic ulcers are caused by the bacterium Helicobacter pylori, as discovered by Marshall and Warren." },
      { questionText: "Which mosquito spreads dengue?", optionA: "Anopheles", optionB: "Aedes", optionC: "Culex", optionD: "Mansonia", correctOption: "B", solution: "Dengue is spread by the Aedes aegypti mosquito, which is a daytime biter." },
      { questionText: "An acute disease:", optionA: "Lasts for a long time", optionB: "Lasts for a short duration", optionC: "Is always fatal", optionD: "Cannot be treated", correctOption: "B", solution: "Acute diseases last for a short period, e.g., cold, flu. Chronic diseases last for a long time, e.g., diabetes." },
      { questionText: "The first barrier of defence in the human body is:", optionA: "White blood cells", optionB: "Skin and mucous membranes", optionC: "Antibodies", optionD: "Fever response", correctOption: "B", solution: "Skin and mucous membranes form the first line of defence, preventing entry of microorganisms into the body." },
      { questionText: "Which of these is a fungal disease?", optionA: "Malaria", optionB: "Ringworm", optionC: "Typhoid", optionD: "Cholera", correctOption: "B", solution: "Ringworm is a common fungal skin infection caused by fungi like Trichophyton, Microsporum, etc." },
      { questionText: "Immunization provides:", optionA: "Active immunity", optionB: "Passive immunity", optionC: "No immunity", optionD: "Temporary weakness", correctOption: "A", solution: "Immunization (vaccination) introduces weakened/killed pathogens that stimulate the immune system to produce antibodies, providing active immunity." },
      { questionText: "Which organ is mainly affected by jaundice?", optionA: "Kidney", optionB: "Liver", optionC: "Lungs", optionD: "Heart", correctOption: "B", solution: "Jaundice mainly affects the liver, causing yellowing of skin and eyes due to excess bilirubin." },
      { questionText: "Rabies is caused by:", optionA: "Bacteria", optionB: "Virus", optionC: "Protozoa", optionD: "Fungus", correctOption: "B", solution: "Rabies is caused by a virus (Lyssavirus) and is transmitted through the bite of an infected animal, usually a dog." },
      { questionText: "Which of the following is NOT a means of spreading infectious diseases?", optionA: "Air", optionB: "Water", optionC: "Genes", optionD: "Sexual contact", correctOption: "C", solution: "Genes are not a means of spreading infectious diseases. Infectious diseases spread through air, water, food, vectors, and contact." },
      { questionText: "Penicillin was discovered by:", optionA: "Louis Pasteur", optionB: "Alexander Fleming", optionC: "Edward Jenner", optionD: "Robert Koch", correctOption: "B", solution: "Alexander Fleming discovered penicillin in 1928, the first true antibiotic, from the mould Penicillium notatum." },
      { questionText: "Which disease is spread by contaminated water?", optionA: "Malaria", optionB: "Tuberculosis", optionC: "Cholera", optionD: "Measles", correctOption: "C", solution: "Cholera is a waterborne disease caused by Vibrio cholerae bacteria, spread through contaminated water and food." },
      { questionText: "Inflammation is a sign of:", optionA: "Normal body function", optionB: "Active immune response", optionC: "Organ failure", optionD: "Malnutrition", correctOption: "B", solution: "Inflammation (redness, swelling, heat, pain) is a sign that the immune system is actively fighting infection by recruiting immune cells." },
      { questionText: "Which of the following diseases can be prevented by vaccination?", optionA: "Diabetes", optionB: "Hypertension", optionC: "Tetanus", optionD: "Cancer", correctOption: "C", solution: "Tetanus can be prevented by vaccination (tetanus toxoid vaccine). Diabetes and hypertension are non-infectious and not vaccine-preventable." },
      { questionText: "HIV attacks which type of cells?", optionA: "Red blood cells", optionB: "Platelets", optionC: "Immune cells (T-lymphocytes)", optionD: "Nerve cells", correctOption: "C", solution: "HIV specifically attacks T-helper lymphocytes (CD4 cells), weakening the immune system and leading to AIDS." },
      { questionText: "A chronic disease is one that:", optionA: "Appears suddenly and is severe", optionB: "Lasts for a long period of time", optionC: "Is always infectious", optionD: "Cannot be cured", correctOption: "B", solution: "A chronic disease lasts for a long time, often for life, e.g., diabetes, arthritis, tuberculosis." },
      { questionText: "Which of these is a protozoan disease?", optionA: "Influenza", optionB: "Kala-azar", optionC: "Ringworm", optionD: "Typhoid", correctOption: "B", solution: "Kala-azar (visceral leishmaniasis) is caused by the protozoan Leishmania, transmitted by sandfly bites." },
      { questionText: "Edward Jenner is associated with:", optionA: "Penicillin", optionB: "Germ theory", optionC: "Smallpox vaccine", optionD: "DNA structure", correctOption: "C", solution: "Edward Jenner developed the first smallpox vaccine in 1796 using cowpox material, pioneering the concept of vaccination." },
      { questionText: "Public health measures to prevent disease include:", optionA: "Taking antibiotics daily", optionB: "Proper sanitation and clean drinking water", optionC: "Ignoring symptoms", optionD: "Using painkillers", correctOption: "B", solution: "Proper sanitation, clean drinking water, and waste management are key public health measures to prevent the spread of diseases." },
      { questionText: "Which of the following is caused by a worm?", optionA: "Ringworm", optionB: "Elephantiasis", optionC: "Measles", optionD: "Influenza", correctOption: "B", solution: "Elephantiasis is caused by the filarial worm Wuchereria bancrofti. Despite its name, ringworm is a fungal infection." },
    ],
  },
  {
    id: "cmmorm96c007huu7w6qpwzj25",
    name: "Natural Resources",
    questions: [
      { questionText: "The major component of air is:", optionA: "Oxygen", optionB: "Carbon dioxide", optionC: "Nitrogen", optionD: "Argon", correctOption: "C", solution: "Nitrogen makes up about 78% of the atmosphere, making it the most abundant gas in air." },
      { questionText: "The ozone layer protects us from:", optionA: "Infrared radiation", optionB: "Ultraviolet radiation", optionC: "Visible light", optionD: "Radio waves", correctOption: "B", solution: "The ozone (O₃) layer in the stratosphere absorbs harmful ultraviolet (UV) radiation from the sun." },
      { questionText: "Which of the following is a greenhouse gas?", optionA: "Nitrogen", optionB: "Oxygen", optionC: "Carbon dioxide", optionD: "Hydrogen", correctOption: "C", solution: "Carbon dioxide is a major greenhouse gas that traps heat in the atmosphere, contributing to global warming." },
      { questionText: "The water cycle is driven by:", optionA: "Gravity alone", optionB: "Solar energy", optionC: "Wind energy", optionD: "Lunar energy", correctOption: "B", solution: "The water cycle is primarily driven by solar energy, which causes evaporation from water bodies." },
      { questionText: "Lichens are good indicators of:", optionA: "Water pollution", optionB: "Soil pollution", optionC: "Air pollution", optionD: "Noise pollution", correctOption: "C", solution: "Lichens are sensitive to SO₂ in the air and do not grow in polluted areas, making them good bioindicators of air quality." },
      { questionText: "Which of the following causes acid rain?", optionA: "Carbon monoxide", optionB: "Sulphur dioxide and nitrogen oxides", optionC: "Oxygen", optionD: "Water vapour", correctOption: "B", solution: "Acid rain is caused by SO₂ and NOₓ reacting with water vapour in the atmosphere to form sulphuric and nitric acid." },
      { questionText: "Nitrogen fixation is carried out by:", optionA: "All plants", optionB: "Animals", optionC: "Certain bacteria like Rhizobium", optionD: "Fungi only", correctOption: "C", solution: "Nitrogen fixation is done by bacteria like Rhizobium (in root nodules of legumes) and free-living bacteria like Azotobacter." },
      { questionText: "The percentage of oxygen in the atmosphere is approximately:", optionA: "78%", optionB: "21%", optionC: "1%", optionD: "0.03%", correctOption: "B", solution: "Oxygen constitutes approximately 21% of the Earth's atmosphere." },
      { questionText: "Humus is formed by:", optionA: "Weathering of rocks", optionB: "Decomposition of organic matter", optionC: "Volcanic eruptions", optionD: "Condensation of water", correctOption: "B", solution: "Humus is the dark organic component of soil formed by decomposition of dead plant and animal matter by microorganisms." },
      { questionText: "Which process adds oxygen to the atmosphere?", optionA: "Respiration", optionB: "Combustion", optionC: "Photosynthesis", optionD: "Nitrogen fixation", correctOption: "C", solution: "Photosynthesis by green plants releases oxygen as a byproduct: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂." },
      { questionText: "Soil is formed by:", optionA: "Decomposition only", optionB: "Weathering of rocks", optionC: "Water only", optionD: "Wind only", correctOption: "B", solution: "Soil is formed by the weathering of rocks through physical, chemical, and biological processes over long periods." },
      { questionText: "The carbon cycle involves:", optionA: "Only respiration", optionB: "Only photosynthesis", optionC: "Photosynthesis, respiration, combustion, and decomposition", optionD: "Only combustion", correctOption: "C", solution: "The carbon cycle involves multiple processes: photosynthesis fixes CO₂, while respiration, combustion, and decomposition release CO₂." },
      { questionText: "Smog is a combination of:", optionA: "Smoke and fog", optionB: "Snow and fog", optionC: "Smoke and dust", optionD: "Steam and gas", correctOption: "A", solution: "Smog is a type of air pollution formed by the combination of smoke and fog, often containing harmful pollutants." },
      { questionText: "Which of the following is NOT a cause of water pollution?", optionA: "Industrial waste", optionB: "Sewage", optionC: "Rain water harvesting", optionD: "Pesticide runoff", correctOption: "C", solution: "Rain water harvesting is a conservation method, not a cause of water pollution. Industrial waste, sewage, and pesticides pollute water." },
      { questionText: "The topmost layer of soil is called:", optionA: "Subsoil", optionB: "Bedrock", optionC: "Topsoil", optionD: "Parent rock", correctOption: "C", solution: "Topsoil (A horizon) is the uppermost layer of soil, rich in humus and minerals, supporting plant growth." },
      { questionText: "CFC stands for:", optionA: "Carbon Fluoride Compound", optionB: "Chlorofluorocarbon", optionC: "Carbon Fuel Cycle", optionD: "Chemical Fuel Compound", correctOption: "B", solution: "CFC stands for Chlorofluorocarbon, a synthetic chemical that depletes the ozone layer." },
      { questionText: "Nitrogen is returned to the soil by:", optionA: "Plants absorbing sunlight", optionB: "Denitrifying bacteria", optionC: "Photosynthesis", optionD: "Evaporation", correctOption: "B", solution: "Denitrifying bacteria convert nitrates back to nitrogen gas, returning it to the atmosphere as part of the nitrogen cycle." },
      { questionText: "The process of conversion of water vapour to liquid is:", optionA: "Evaporation", optionB: "Condensation", optionC: "Precipitation", optionD: "Transpiration", correctOption: "B", solution: "Condensation is the process where water vapour cools and changes to liquid water, forming clouds." },
      { questionText: "Which gas is released during the burning of fossil fuels?", optionA: "Nitrogen", optionB: "Oxygen", optionC: "Carbon dioxide", optionD: "Hydrogen", correctOption: "C", solution: "Burning fossil fuels releases carbon dioxide (CO₂) into the atmosphere, contributing to the greenhouse effect." },
      { questionText: "Biogeochemical cycles are also known as:", optionA: "Energy cycles", optionB: "Nutrient cycles", optionC: "Water cycles", optionD: "Food cycles", correctOption: "B", solution: "Biogeochemical cycles are called nutrient cycles as they involve the movement of nutrients through biotic and abiotic components." },
      { questionText: "Global warming is caused by:", optionA: "Decrease in CO₂ levels", optionB: "Increase in greenhouse gases", optionC: "Decrease in temperature", optionD: "Increase in oxygen", correctOption: "B", solution: "Global warming is caused by an increase in greenhouse gases (CO₂, CH₄, etc.) that trap heat in the atmosphere." },
      { questionText: "Transpiration is the loss of water from:", optionA: "Roots", optionB: "Stems", optionC: "Leaves", optionD: "Flowers", correctOption: "C", solution: "Transpiration is the loss of water as vapour from the stomata of leaves. It helps in the upward movement of water." },
      { questionText: "Which of the following is a renewable resource?", optionA: "Coal", optionB: "Petroleum", optionC: "Solar energy", optionD: "Natural gas", correctOption: "C", solution: "Solar energy is a renewable resource as it is inexhaustible and constantly replenished, unlike fossil fuels." },
      { questionText: "The biological process that enriches soil nitrogen is:", optionA: "Denitrification", optionB: "Nitrogen fixation", optionC: "Nitrification", optionD: "Ammonification", correctOption: "B", solution: "Nitrogen fixation converts atmospheric N₂ into ammonia/nitrates usable by plants, enriching soil nitrogen content." },
      { questionText: "Wind is caused by:", optionA: "Rotation of the earth only", optionB: "Uneven heating of the atmosphere", optionC: "Moon's gravitational pull", optionD: "Ocean currents", correctOption: "B", solution: "Wind is caused by uneven heating of the atmosphere by the sun, creating differences in air pressure that cause air to move." },
    ],
  },
];

// Chapter to create: Improvement in Food Resources
const MISSING_CHAPTER = {
  name: "Improvement in Food Resources",
  subjectId: SUBJECT_ID,
  order: 6,
  questions: [
    { questionText: "The practice of growing two or more crops simultaneously on the same field is called:", optionA: "Mixed cropping", optionB: "Inter-cropping", optionC: "Crop rotation", optionD: "Shifting cultivation", correctOption: "A", solution: "Mixed cropping is growing two or more crops simultaneously on the same piece of land to minimize risk of crop failure." },
    { questionText: "Kharif crops are grown in:", optionA: "October to March", optionB: "June to October", optionC: "March to June", optionD: "January to April", correctOption: "B", solution: "Kharif crops are grown during the rainy season from June to October, e.g., paddy, maize, soybean." },
    { questionText: "Which of the following is a Rabi crop?", optionA: "Paddy", optionB: "Maize", optionC: "Wheat", optionD: "Soybean", correctOption: "C", solution: "Wheat is a Rabi crop grown in the winter season from October to March." },
    { questionText: "The nutrients required by plants in large quantities are called:", optionA: "Micronutrients", optionB: "Macronutrients", optionC: "Trace elements", optionD: "Supplements", correctOption: "B", solution: "Macronutrients (N, P, K, Ca, Mg, S) are required in large quantities for plant growth and development." },
    { questionText: "Vermicompost is prepared using:", optionA: "Bacteria", optionB: "Fungi", optionC: "Earthworms", optionD: "Insects", correctOption: "C", solution: "Vermicompost is organic manure prepared using earthworms that decompose organic matter into nutrient-rich compost." },
    { questionText: "Which of these is a nitrogenous fertilizer?", optionA: "Urea", optionB: "Super phosphate", optionC: "Muriate of potash", optionD: "Gypsum", correctOption: "A", solution: "Urea (46% nitrogen) is the most widely used nitrogenous fertilizer." },
    { questionText: "Green manure is obtained from:", optionA: "Mixing green plants with soil", optionB: "Decomposed animal dung", optionC: "Chemical fertilizers", optionD: "Green-coloured chemicals", correctOption: "A", solution: "Green manure involves growing and ploughing leguminous plants (like sun hemp) into the soil to enrich it with nitrogen." },
    { questionText: "Which method of irrigation conserves water most effectively?", optionA: "Flood irrigation", optionB: "Furrow irrigation", optionC: "Drip irrigation", optionD: "Canal irrigation", correctOption: "C", solution: "Drip irrigation delivers water drop by drop directly to the roots, minimizing water wastage and conserving water." },
    { questionText: "Hybridization refers to:", optionA: "Growing hybrid varieties", optionB: "Crossing between genetically different plants", optionC: "Using chemical fertilizers", optionD: "Grafting", correctOption: "B", solution: "Hybridization is the crossing of genetically dissimilar plants to combine desirable traits and produce improved varieties." },
    { questionText: "Which of the following is a micronutrient for plants?", optionA: "Nitrogen", optionB: "Phosphorus", optionC: "Iron", optionD: "Potassium", correctOption: "C", solution: "Iron is a micronutrient required in small quantities. N, P, and K are macronutrients." },
    { questionText: "The process of crossing between different varieties is called:", optionA: "Intervarietal hybridization", optionB: "Interspecific hybridization", optionC: "Intergeneric hybridization", optionD: "Mutation breeding", correctOption: "A", solution: "Intervarietal hybridization involves crossing two different varieties of the same species to get desired characters." },
    { questionText: "Organic farming avoids the use of:", optionA: "Compost", optionB: "Chemical fertilizers and pesticides", optionC: "Crop rotation", optionD: "Green manure", correctOption: "B", solution: "Organic farming avoids chemical fertilizers, pesticides, and GMOs, relying on natural methods like composting and biological pest control." },
    { questionText: "Composite fish culture involves:", optionA: "Growing one species of fish", optionB: "Growing 5-6 species of fish together", optionC: "Growing fish with crops", optionD: "Breeding fish in the sea", correctOption: "B", solution: "Composite fish culture (polyculture) involves growing 5-6 different species of fish together in the same pond to utilize all ecological niches." },
    { questionText: "Which of the following is an exotic breed of cattle?", optionA: "Red Sindhi", optionB: "Sahiwal", optionC: "Jersey", optionD: "Gir", correctOption: "C", solution: "Jersey is an exotic (foreign) breed of cattle known for high milk yield. Red Sindhi, Sahiwal, and Gir are Indian breeds." },
    { questionText: "Apiculture is:", optionA: "Rearing of fish", optionB: "Rearing of silkworms", optionC: "Rearing of honeybees", optionD: "Rearing of poultry", correctOption: "C", solution: "Apiculture is the rearing and management of honeybees for the production of honey and beeswax." },
    { questionText: "The Italian bee variety used for honey production is:", optionA: "Apis dorsata", optionB: "Apis florea", optionC: "Apis mellifera", optionD: "Apis cerana indica", correctOption: "C", solution: "Apis mellifera (Italian bee) is widely used in commercial honey production because of its high honey yield and gentle nature." },
    { questionText: "Weeds are:", optionA: "Useful plants growing in crop fields", optionB: "Unwanted plants growing with crop plants", optionC: "Decorative plants", optionD: "Medicinal plants", correctOption: "B", solution: "Weeds are unwanted plants that grow along with crop plants and compete for nutrients, water, light, and space." },
    { questionText: "Storage losses in grains are caused by:", optionA: "Sunlight", optionB: "Biotic factors like insects and rodents", optionC: "Rainfall only", optionD: "Wind", correctOption: "B", solution: "Biotic factors like insects, rodents, fungi, mites, and bacteria cause major storage losses in food grains." },
    { questionText: "Which of the following is a fresh water fish?", optionA: "Pomfret", optionB: "Rohu", optionC: "Hilsa", optionD: "Tuna", correctOption: "B", solution: "Rohu (Labeo rohita) is a freshwater fish commonly cultured in ponds in India. Pomfret and tuna are marine fish." },
    { questionText: "The practice of growing different crops in pre-planned succession is:", optionA: "Mixed cropping", optionB: "Inter-cropping", optionC: "Crop rotation", optionD: "Mixed farming", correctOption: "C", solution: "Crop rotation is growing different crops in a pre-planned succession on the same field to maintain soil fertility and reduce pests." },
    { questionText: "Broilers in poultry farming are:", optionA: "Egg-laying hens", optionB: "Chickens raised for meat", optionC: "Breeding roosters", optionD: "Decorative birds", correctOption: "B", solution: "Broilers are poultry birds raised specifically for meat production. They are fed protein-rich and vitamin-rich feed for fast growth." },
    { questionText: "Which nutrient is essential for the growth of meristematic tissue?", optionA: "Potassium", optionB: "Nitrogen", optionC: "Phosphorus", optionD: "Calcium", correctOption: "B", solution: "Nitrogen is essential for the growth of meristematic tissue and for overall vegetative growth of plants." },
    { questionText: "Cattle feed includes:", optionA: "Only roughage", optionB: "Only concentrates", optionC: "Roughage and concentrates", optionD: "Only water", correctOption: "C", solution: "Cattle feed includes roughage (fibre-rich) like hay and fodder, and concentrates (nutrient-rich) like grains and oil cakes." },
    { questionText: "The Indian breed of bee is:", optionA: "Apis mellifera", optionB: "Apis cerana indica", optionC: "Apis dorsata", optionD: "Apis florea", correctOption: "B", solution: "Apis cerana indica is the Indian variety of honeybee commonly domesticated for honey production in India." },
    { questionText: "Inter-cropping is different from mixed cropping because:", optionA: "Seeds are mixed before sowing", optionB: "Crops are grown in definite row patterns", optionC: "Only one crop is grown", optionD: "No fertilizers are used", correctOption: "B", solution: "In inter-cropping, two or more crops are grown simultaneously in definite row patterns, unlike mixed cropping where seeds are mixed." },
  ],
};

async function main() {
  console.log("=== Seeding Class 9 Biology Quiz Questions ===\n");

  // Step 1: Check if "Improvement in Food Resources" chapter exists
  console.log("Checking for missing chapter: Improvement in Food Resources...");
  let foodChapter = await prisma.chapter.findFirst({
    where: {
      subjectId: SUBJECT_ID,
      name: { contains: "Improvement in Food", mode: "insensitive" },
    },
  });

  if (!foodChapter) {
    console.log("Chapter not found. Creating 'Improvement in Food Resources'...");
    foodChapter = await prisma.chapter.create({
      data: {
        subjectId: MISSING_CHAPTER.subjectId,
        name: MISSING_CHAPTER.name,
        order: MISSING_CHAPTER.order,
      },
    });
    console.log(`Created chapter: ${foodChapter.name} (id: ${foodChapter.id})\n`);
  } else {
    console.log(`Chapter already exists: ${foodChapter.name} (id: ${foodChapter.id})\n`);
  }

  // Add the missing chapter to the list
  chapters.push({
    id: foodChapter.id,
    name: foodChapter.name,
    questions: MISSING_CHAPTER.questions,
  });

  // Step 2: Seed questions for each chapter
  for (const chapter of chapters) {
    console.log(`--- ${chapter.name} ---`);

    // Delete existing questions
    const deleted = await prisma.question.deleteMany({
      where: { chapterId: chapter.id },
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
      solution: q.solution,
    }));

    const result = await prisma.question.createMany({ data });
    console.log(`  Inserted ${result.count} questions.\n`);
  }

  // Step 3: Verify
  console.log("=== Verification ===");
  for (const chapter of chapters) {
    const count = await prisma.question.count({ where: { chapterId: chapter.id } });
    console.log(`  ${chapter.name}: ${count} questions`);
  }

  console.log("\nDone! All chapters seeded successfully.");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
