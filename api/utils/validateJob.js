function validateJob(job)
{
    const{code, language, testCases}=job
    if(!code|| typeof code!=='string')
        return{ valid: false, error: 'Missing or invalid "code" field (must be a string).'}

    if(!language || typeof language !== 'string')
        return { valid: false, error:' Missing language type'}

    if (!Array.isArray(testCases) || testCases.length === 0) 
        return {   valid: false, error:' Missing language type'}
     

     for (const [index, testCase] of testCases.entries()) {
    if (
      typeof testCase.input !== 'string' ||
      typeof testCase.expectedOutput !== 'string'
    ) {
      return {
        valid: false,
        error: `Invalid testCase at index ${index}. Must have "input" and "expectedOutput" as strings.`,
      };
    }
  }

  return { valid: true };
}
    




module.exports=validateJob;