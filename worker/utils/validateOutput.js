function validateOutput(actualOutput, expectedOutput) {
  return actualOutput.trim() === expectedOutput.trim();
}

module.exports = validateOutput;
