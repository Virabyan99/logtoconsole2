const detectSyntaxErrors = (code: string) => {
    const stack: { char: string; index: number }[] = [];
    const pairs: Record<string, string> = {
      "(": ")",
      "{": "}",
      "[": "]",
      '"': '"',
      "'": "'",
      "`": "`",
    };
    const errors: { index: number; message: string }[] = [];
  
    for (let i = 0; i < code.length; i++) {
      const char = code[i];
  
      if (pairs[char]) {
        stack.push({ char, index: i });
      } else if (Object.values(pairs).includes(char)) {
        if (stack.length === 0 || pairs[stack[stack.length - 1].char] !== char) {
          errors.push({ index: i, message: `Unmatched ${char}` });
        } else {
          stack.pop();
        }
      }
    }
  
    stack.forEach((error) =>
      errors.push({ index: error.index, message: `Unmatched ${error.char}` })
    );
  
    return errors;
  };
  
  export default detectSyntaxErrors;
  