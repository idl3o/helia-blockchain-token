/**
 * This example demonstrates how to use the philosophical navigation system
 * to explore relationships between different concepts in the Helia Blockchain Token.
 */

const utils = require('./src/utils');

// Get information about a philosophical concept
function explorePhilosophicalConcept(conceptName) {
  try {
    console.log(`\n=== Exploring concept: ${conceptName.toUpperCase()} ===`);
    
    const concept = utils.getPhilosophicalConcept(conceptName);
    
    console.log(`Conceptual basis: ${concept.conceptualBasis}`);
    console.log(`Applied to: ${concept.appliedTo}`);
    
    console.log(`\nRelated concepts:`);
    concept.relatedConcepts.forEach(related => {
      console.log(`- ${related}`);
    });
    
    return concept;
  } catch (error) {
    console.error(`Error exploring concept: ${error.message}`);
    return null;
  }
}

// Navigate through related concepts
function navigateConceptualPath(startConcept, steps = 3) {
  console.log(`\n=== Starting conceptual journey from: ${startConcept.toUpperCase()} ===`);
  
  let currentConcept = startConcept;
  
  for (let i = 0; i < steps; i++) {
    const concept = explorePhilosophicalConcept(currentConcept);
    if (!concept || !concept.relatedConcepts || concept.relatedConcepts.length === 0) {
      console.log(`\nReached end of conceptual path.`);
      break;
    }
    
    // Choose the first related concept for the next step
    currentConcept = concept.relatedConcepts[0];
    
    if (i < steps - 1) {
      console.log(`\nNavigating to: ${currentConcept.toUpperCase()}`);
    }
  }
  
  console.log(`\n=== Journey complete ===`);
}

// Create a visual representation of concept relationships
function visualizeConceptRelationships() {
  console.log(`\n=== Philosophical Concept Relationships ===`);
  
  const relationships = utils.philosophicalRelationships;
  
  // Create simple ASCII visualization
  Object.keys(relationships).forEach(concept => {
    const info = relationships[concept];
    
    console.log(`\n[${concept.toUpperCase()}] - ${info.conceptualBasis}`);
    console.log(`│`);
    
    info.relatedConcepts.forEach((related, index, array) => {
      const isLast = index === array.length - 1;
      console.log(`${isLast ? '└' : '├'}── [${related.toUpperCase()}]`);
    });
  });
}

// Run the demonstrations
console.log("HELIA BLOCKCHAIN TOKEN - PHILOSOPHICAL NAVIGATION DEMO");
console.log("=====================================================");

// Start by exploring Planck's concept
explorePhilosophicalConcept('planck');

// Take a conceptual journey starting from Gödel
navigateConceptualPath('godel');

// Visualize all relationships
visualizeConceptRelationships();

console.log("\nTo explore the code implementation, see the corresponding files in src/utils/");
console.log("For more detailed documentation, refer to the docs/ directory.");
