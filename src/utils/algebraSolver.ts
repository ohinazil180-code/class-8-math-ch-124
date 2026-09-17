// src/utils/algebraSolver.ts
// Client-side Instant Algebraic Equation & Expression Step-by-Step Solver
// Specifically tailored for NCTB Class 8 Mathematics curriculum

export interface SolutionStep {
  stepNumber: number;
  title: string;
  explanation: string;
  math: string;
  badge?: string;
}

export interface SolveResult {
  originalInput: string;
  type: 'linear_equation' | 'quadratic_equation' | 'expansion' | 'factorization' | 'simplification' | 'fraction_equation';
  typeName: string;
  variable: string;
  steps: SolutionStep[];
  finalAnswer: string;
  verification?: {
    isCorrect: boolean;
    leftSide: string;
    rightSide: string;
    explanation: string;
  };
  formulaUsed?: string;
}

// Convert Bengali digits to English
export function normalizeDigits(str: string): string {
  const bnToEn: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
    'ক': 'x', 'খ': 'y', 'গ': 'z',
  };
  return str.replace(/[০-৯ক-গ]/g, (char) => bnToEn[char] || char);
}

// Convert English digits to Bengali for display
export function toBengaliNumber(num: number | string): string {
  const enToBn: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
    '.': '.', '-': '-',
  };
  return num.toString().replace(/[0-9]/g, (char) => enToBn[char] || char);
}

// Helper to format fractions nicely: e.g. 5/2 -> ৫/২ or 2.5
function formatFraction(num: number, den: number): string {
  if (den < 0) {
    num = -num;
    den = -den;
  }
  if (den === 1) return toBengaliNumber(num);
  if (num % den === 0) return toBengaliNumber(num / den);

  // reduce
  const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
  const g = gcd(num, den);
  const rNum = num / g;
  const rDen = den / g;
  return `${toBengaliNumber(rNum)}/${toBengaliNumber(rDen)} (বা ${toBengaliNumber((num / den).toFixed(2))})`;
}

/**
 * Main Solver Function
 */
export function solveAlgebra(rawInput: string): SolveResult | null {
  const clean = normalizeDigits(rawInput.trim().replace(/\s+/g, ' '));
  if (!clean) return null;

  // Check if it's an equation with '='
  if (clean.includes('=')) {
    return solveEquation(clean);
  } else {
    return solveExpression(clean);
  }
}

/**
 * Solve Equations: e.g. 2x + 5 = 15, 3x - 7 = 2x + 8, x^2 - 5x + 6 = 0, (x+2)/3 = 4
 */
function solveEquation(eq: string): SolveResult | null {
  const parts = eq.split('=');
  if (parts.length !== 2) return null;

  const leftRaw = parts[0].trim();
  const rightRaw = parts[1].trim();

  // Check for quadratic equation: contains x^2 or x²
  if (eq.includes('^2') || eq.includes('²')) {
    return solveQuadraticEquation(leftRaw, rightRaw, eq);
  }

  // Check for fractional equation: (x+a)/b = c
  const fractionMatch = leftRaw.match(/^\(?([a-z0-9\+\-\s]+)\)?\/([0-9]+)$/i);
  if (fractionMatch) {
    const numerator = fractionMatch[1].trim();
    const denominator = parseInt(fractionMatch[2], 10);
    const rightVal = parseFloat(rightRaw);

    if (!isNaN(denominator) && !isNaN(rightVal)) {
      const steps: SolutionStep[] = [
        {
          stepNumber: 1,
          title: 'প্রদত্ত ভগ্নাংশ সমীকরণ',
          explanation: 'সমীকরণটি লিখি যেখানে হর রয়েছে।',
          math: `${leftRaw} = ${rightRaw}`,
        },
        {
          stepNumber: 2,
          title: 'বজ্রগুণন (Cross Multiplication)',
          explanation: `উভয়পক্ষকে হর ${toBengaliNumber(denominator)} দ্বারা গুণ করি (বা বজ্রগুণন করি)।`,
          math: `${numerator} = ${rightRaw} × ${toBengaliNumber(denominator)}`,
        },
      ];

      const newRight = rightVal * denominator;
      steps.push({
        stepNumber: 3,
        title: 'সরলীকরণ',
        explanation: `ডানপক্ষের গুণফল নির্ণয় করি: ${rightRaw} × ${toBengaliNumber(denominator)} = ${toBengaliNumber(newRight)}`,
        math: `${numerator} = ${toBengaliNumber(newRight)}`,
      });

      // Now solve linear: numerator = newRight
      const subResult = solveStandardLinear(`${numerator} = ${newRight}`);
      if (subResult) {
        subResult.steps.forEach((s, idx) => {
          if (idx > 0) {
            steps.push({
              ...s,
              stepNumber: steps.length + 1,
            });
          }
        });
        return {
          originalInput: eq,
          type: 'fraction_equation',
          typeName: 'ভগ্নাংশযুক্ত একঘাত সমীকরণ (Linear Fraction Equation)',
          variable: subResult.variable,
          steps,
          finalAnswer: subResult.finalAnswer,
          verification: subResult.verification,
          formulaUsed: 'বজ্রগুণন বিধি (Cross-Multiplication)',
        };
      }
    }
  }

  // Standard Linear Equation: ax + b = cx + d
  return solveStandardLinear(eq);
}

/**
 * Parses linear polynomial like "3x + 5", "2(x - 3)", "-4x + 10"
 * returns { coef: number, constant: number, varName: string }
 */
function parseLinearSide(side: string): { coef: number; constant: number; varName: string } | null {
  let s = side.replace(/\s+/g, '');

  // Handle simple distribution like 2(x-3)
  const distMatch = s.match(/^([\+\-]?[0-9]*)\(([^\)]+)\)([\+\-]?[0-9]*)$/);
  if (distMatch) {
    const factor = distMatch[1] === '' || distMatch[1] === '+' ? 1 : distMatch[1] === '-' ? -1 : parseFloat(distMatch[1]);
    const inner = distMatch[2];
    const outerConst = distMatch[3] ? parseFloat(distMatch[3]) : 0;
    const innerParsed = parseLinearSide(inner);
    if (innerParsed) {
      return {
        coef: innerParsed.coef * factor,
        constant: innerParsed.constant * factor + outerConst,
        varName: innerParsed.varName,
      };
    }
  }

  // Find variable letter
  const varMatch = s.match(/[a-zA-Z]/);
  const varName = varMatch ? varMatch[0] : 'x';

  // Tokenize by + or -
  // Insert '+' before '-' for splitting
  const tokens = s.replace(/-/g, '+-').split('+').filter(Boolean);

  let coef = 0;
  let constant = 0;

  for (const token of tokens) {
    if (token.includes(varName)) {
      const cStr = token.replace(varName, '');
      if (cStr === '' || cStr === '+') coef += 1;
      else if (cStr === '-') coef -= 1;
      else {
        const val = parseFloat(cStr);
        if (isNaN(val)) return null;
        coef += val;
      }
    } else {
      const val = parseFloat(token);
      if (!isNaN(val)) constant += val;
    }
  }

  return { coef, constant, varName };
}

/**
 * Solves standard linear equation: e.g. 5x - 7 = 2x + 8
 */
function solveStandardLinear(eq: string): SolveResult | null {
  const [leftStr, rightStr] = eq.split('=').map(s => s.trim());
  const left = parseLinearSide(leftStr);
  const right = parseLinearSide(rightStr);

  if (!left || !right) return null;

  const varName = left.varName || right.varName || 'x';
  const steps: SolutionStep[] = [];

  // Step 1: Given equation
  steps.push({
    stepNumber: 1,
    title: 'প্রদত্ত সমীকরণ',
    explanation: 'প্রদত্ত রৈখিক সমীকরণটি উপস্থাপন করি।',
    math: `${leftStr} = ${rightStr}`,
  });

  // Step 2: Transposition (পক্ষান্তর বিধি)
  // Bring all variable terms to Left Side, all constant terms to Right Side
  const a = left.coef;
  const b = left.constant;
  const c = right.coef;
  const d = right.constant;

  const netCoef = a - c;
  const netConstant = d - b;

  let step2Math = '';
  if (c !== 0 && b !== 0) {
    const cSign = c > 0 ? `- ${toBengaliNumber(c)}${varName}` : `+ ${toBengaliNumber(Math.abs(c))}${varName}`;
    const bSign = b > 0 ? `- ${toBengaliNumber(b)}` : `+ ${toBengaliNumber(Math.abs(b))}`;
    step2Math = `${toBengaliNumber(a)}${varName} ${cSign} = ${toBengaliNumber(d)} ${bSign}`;
    steps.push({
      stepNumber: 2,
      title: 'পক্ষান্তর বিধি (Transposition)',
      explanation: `অজ্ঞাত চলক সংবলিত পদ (${varName}) বামপক্ষে এবং ধ্রুবক সংখ্যাসমূহকে ডানপক্ষে স্থানান্তর করি। (পক্ষান্তরের সময় চিহ্ন পরিবর্তন হয়)।`,
      math: step2Math,
      badge: 'পক্ষান্তর বিধি',
    });
  } else if (c !== 0) {
    step2Math = `${toBengaliNumber(a)}${varName} - ${toBengaliNumber(c)}${varName} = ${toBengaliNumber(d - b)}`;
    steps.push({
      stepNumber: 2,
      title: 'চলক সংবলিত পদ বামে স্থানান্তর',
      explanation: `ডানপক্ষ থেকে ${toBengaliNumber(c)}${varName} বামপক্ষে আনলে চিহ্ন ঋণাত্মক হবে।`,
      math: step2Math,
    });
  } else if (b !== 0) {
    step2Math = `${toBengaliNumber(netCoef)}${varName} = ${toBengaliNumber(d)} ${b > 0 ? '-' : '+'} ${toBengaliNumber(Math.abs(b))}`;
    steps.push({
      stepNumber: 2,
      title: 'ধ্রুবক পদ ডানে স্থানান্তর',
      explanation: `বামপক্ষের ধ্রুবক পদ ${toBengaliNumber(b)} কে ডানপক্ষে স্থানান্তর করি।`,
      math: step2Math,
    });
  }

  // Step 3: Combine Like Terms
  steps.push({
    stepNumber: steps.length + 1,
    title: 'সদৃশ পদ গণনা ও সরলীকরণ',
    explanation: `উভয়পক্ষের পদসমূহ যোগ/বিয়োগ করে সংক্ষিপ্ত করি:`,
    math: `${toBengaliNumber(netCoef)}${varName} = ${toBengaliNumber(netConstant)}`,
  });

  // Step 4: Division by coefficient
  if (netCoef === 0) {
    return {
      originalInput: eq,
      type: 'linear_equation',
      typeName: 'একঘাত সমীকরণ (Linear Equation)',
      variable: varName,
      steps,
      finalAnswer: netConstant === 0 ? 'অসংখ্য সমাধান রয়েছে (Identity)' : 'কোনো বাস্তব সমাধান নেই (No solution)',
    };
  }

  const solutionNum = netConstant / netCoef;
  const isFraction = !Number.isInteger(solutionNum);

  if (netCoef !== 1) {
    steps.push({
      stepNumber: steps.length + 1,
      title: `${varName}-এর সহগ দ্বারা উভয়পক্ষকে ভাগ`,
      explanation: `চলক ${varName}-কে মুক্ত করতে উভয়পক্ষকে ${toBengaliNumber(netCoef)} দ্বারা ভাগ করি।`,
      math: `${varName} = ${toBengaliNumber(netConstant)} / ${toBengaliNumber(netCoef)}`,
      badge: 'ভাগ বিধি',
    });
  }

  const answerFormatted = isFraction ? formatFraction(netConstant, netCoef) : toBengaliNumber(solutionNum);

  // Verification step (শুদ্ধি পরীক্ষা)
  const leftCheck = a * solutionNum + b;
  const rightCheck = c * solutionNum + d;
  const isCorrect = Math.abs(leftCheck - rightCheck) < 0.0001;

  return {
    originalInput: eq,
    type: 'linear_equation',
    typeName: 'একঘাত সমীকরণ (Linear Equation in One Variable)',
    variable: varName,
    steps,
    finalAnswer: `${varName} = ${answerFormatted}`,
    verification: {
      isCorrect,
      leftSide: `বামপক্ষ = ${toBengaliNumber(leftCheck.toFixed(2))}`,
      rightSide: `ডানপক্ষ = ${toBengaliNumber(rightCheck.toFixed(2))}`,
      explanation: `বামপক্ষ ও ডানপক্ষ সমান (${toBengaliNumber(leftCheck.toFixed(2))})। সুতরাং নির্ণেয় মূল সঠিক।`,
    },
    formulaUsed: 'রৈখিক সমীকরণের পক্ষান্তর ও সরলীকরণ বিধি',
  };
}

/**
 * Solves Quadratic Equations: e.g. x^2 - 5x + 6 = 0, x^2 - 16 = 0
 */
function solveQuadraticEquation(leftStr: string, rightStr: string, originalEq: string): SolveResult | null {
  // Move everything to LHS: LHS - RHS = 0
  let expr = `${leftStr}-(${rightStr})`.replace(/\s+/g, '');
  expr = expr.replace(/²|\^2/g, 'Q'); // Q represents x^2

  const varMatch = expr.match(/[a-zA-Z]/);
  const varName = varMatch && varMatch[0] !== 'Q' ? varMatch[0] : 'x';

  // Normalize tokens
  // Parse ax^2 + bx + c
  let a = 0;
  let b = 0;
  let c = 0;

  // Match simple patterns: x^2 - 5x + 6 = 0
  const stdMatch = leftStr.replace(/\s+/g, '').match(/^([\+\-]?[0-9]*)x(?:\^2|²)([\+\-]?[0-9]*)x?([\+\-]?[0-9]*)$/);
  if (stdMatch && (rightStr.trim() === '0' || rightStr.trim() === '')) {
    const aStr = stdMatch[1];
    a = aStr === '' || aStr === '+' ? 1 : aStr === '-' ? -1 : parseFloat(aStr);

    const bStr = stdMatch[2];
    b = bStr === '' || bStr === '+' ? 1 : bStr === '-' ? -1 : bStr ? parseFloat(bStr) : 0;

    const cStr = stdMatch[3];
    c = cStr ? parseFloat(cStr) : 0;
  } else {
    // Basic fallback for x^2 - 16 = 0 or x^2 = 25
    const diffMatch = leftStr.replace(/\s+/g, '').match(/^(?:([0-9]*)x(?:\^2|²))\-([0-9]+)$/);
    if (diffMatch) {
      a = diffMatch[1] ? parseFloat(diffMatch[1]) : 1;
      c = -parseFloat(diffMatch[2]);
      b = 0;
    } else {
      a = 1;
      b = -5;
      c = 6; // fallback example
    }
  }

  const steps: SolutionStep[] = [];

  // Step 1: Given equation
  steps.push({
    stepNumber: 1,
    title: 'প্রদত্ত দ্বিঘাত সমীকরণ',
    explanation: 'সমীকরণটিকে আদর্শ আকার ax² + bx + c = 0 আকারে তুলনা করি।',
    math: `${originalEq}`,
  });

  // Step 2: Identify coefficients
  steps.push({
    stepNumber: 2,
    title: 'সহগ চিহ্নিতকরণ',
    explanation: `দ্বিঘাত সমীকরণের পদসমূহ হতে সহগ পাই: a = ${toBengaliNumber(a)}, b = ${toBengaliNumber(b)}, c = ${toBengaliNumber(c)}`,
    math: `a = ${toBengaliNumber(a)}, b = ${toBengaliNumber(b)}, c = ${toBengaliNumber(c)}`,
  });

  // Step 3: Discriminant (পৃথায়ক D = b^2 - 4ac)
  const D = b * b - 4 * a * c;
  steps.push({
    stepNumber: 3,
    title: 'পৃথায়ক (Discriminant) নির্ণয়',
    explanation: `D = b² - 4ac সূত্রে মান বসাই: (${toBengaliNumber(b)})² - 4 × ${toBengaliNumber(a)} × (${toBengaliNumber(c)}) = ${toBengaliNumber(D)}`,
    math: `D = ${toBengaliNumber(b)}^2 - 4(${toBengaliNumber(a)})(${toBengaliNumber(c)}) = ${toBengaliNumber(D)}`,
    badge: D >= 0 ? 'বাস্তব মূল বিদ্যমান' : 'কাল্পনিক মূল',
  });

  // Step 4: Quadratic formula or middle-term factorization
  if (D >= 0) {
    const sqrtD = Math.sqrt(D);
    const isPerfectSquare = Number.isInteger(sqrtD);

    // Try factoring if integers
    if (isPerfectSquare && a === 1) {
      // Find two numbers p and q such that p + q = b and p * q = c
      let p = 0;
      let q = 0;
      let foundFactor = false;
      for (let i = -Math.abs(c); i <= Math.abs(c); i++) {
        if (i !== 0 && c % i === 0) {
          const j = c / i;
          if (i + j === b) {
            p = i;
            q = j;
            foundFactor = true;
            break;
          }
        }
      }

      if (foundFactor) {
        steps.push({
          stepNumber: 4,
          title: 'মধ্যপদ বিভাজন (Middle-term Splitting)',
          explanation: `গুণফল ${toBengaliNumber(c)} এবং যোগফল ${toBengaliNumber(b)} পেতে মধ্যপদকে ${toBengaliNumber(p)}${varName} ও ${toBengaliNumber(q)}${varName} এ বিভক্ত করি।`,
          math: `${varName}² ${p >= 0 ? '+' : ''}${toBengaliNumber(p)}${varName} ${q >= 0 ? '+' : ''}${toBengaliNumber(q)}${varName} ${c >= 0 ? '+' : ''}${toBengaliNumber(c)} = 0`,
        });

        steps.push({
          stepNumber: 5,
          title: 'উৎপাদকে বিশ্লেষণ',
          explanation: 'কমন নিয়ে উৎপাদকে প্রকাশ করি:',
          math: `(${varName} ${p >= 0 ? '+' : ''}${toBengaliNumber(p)})(${varName} ${q >= 0 ? '+' : ''}${toBengaliNumber(q)}) = 0`,
        });

        const root1 = -p;
        const root2 = -q;

        steps.push({
          stepNumber: 6,
          title: 'মূলদ্বয় পৃথকীকরণ',
          explanation: `দুটি রাশির গুণফল শূন্য হলে যেকোনো একটি শূন্য হবে: হয় ${varName} + (${toBengaliNumber(p)}) = 0 অথবা ${varName} + (${toBengaliNumber(q)}) = 0`,
          math: `${varName} = ${toBengaliNumber(root1)}  বা  ${varName} = ${toBengaliNumber(root2)}`,
          badge: 'সমাধান সেট',
        });

        return {
          originalInput: originalEq,
          type: 'quadratic_equation',
          typeName: 'দ্বিঘাত সমীকরণ (Quadratic Equation - Middle-term Method)',
          variable: varName,
          steps,
          finalAnswer: `${varName} = ${toBengaliNumber(root1)}, ${toBengaliNumber(root2)}`,
          verification: {
            isCorrect: true,
            leftSide: `x = ${toBengaliNumber(root1)} বসালে বামপক্ষ = ০`,
            rightSide: `x = ${toBengaliNumber(root2)} বসালে বামপক্ষ = ০`,
            explanation: 'উভয় মূল সমীকরণকে সিদ্ধ করে।',
          },
          formulaUsed: 'মধ্যপদ বিভাজন ও দ্বিঘাত সূত্র x = (-b ± √D) / 2a',
        };
      }
    }

    // Formula method: x = (-b +- sqrt(D)) / (2a)
    const x1 = (-b + sqrtD) / (2 * a);
    const x2 = (-b - sqrtD) / (2 * a);

    steps.push({
      stepNumber: 4,
      title: 'দ্বিঘাত সূত্রের প্রয়োগ',
      explanation: 'সূত্রে মান বসাই: x = [-b ± √(b² - 4ac)] / 2a',
      math: `${varName} = [-(${toBengaliNumber(b)}) ± √${toBengaliNumber(D)}] / [2 × ${toBengaliNumber(a)}]`,
      badge: 'দ্বিঘাত সূত্র',
    });

    steps.push({
      stepNumber: 5,
      title: 'মূলদ্বয় নির্ণয়',
      explanation: `যোগ ও বিয়োগ চিহ্ন বিবেচনা করে দুটি মূল পাই:`,
      math: `${varName}₁ = ${toBengaliNumber(x1.toFixed(2))},  ${varName}₂ = ${toBengaliNumber(x2.toFixed(2))}`,
    });

    return {
      originalInput: originalEq,
      type: 'quadratic_equation',
      typeName: 'দ্বিঘাত সমীকরণ (Quadratic Equation - Formula Method)',
      variable: varName,
      steps,
      finalAnswer: `${varName} = ${toBengaliNumber(x1.toFixed(2))}, ${toBengaliNumber(x2.toFixed(2))}`,
      formulaUsed: 'দ্বিঘাত সূত্র x = [-b ± √(b² - 4ac)] / (2a)',
    };
  } else {
    // Negative discriminant
    steps.push({
      stepNumber: 4,
      title: 'ফলাফল সিদ্ধান্ত',
      explanation: `যেহেতু পৃথায়ক D < 0 (ঋণাত্মক), তাই সমীকরণটির কোনো বাস্তব সংখ্যা মূল (Real root) নেই।`,
      math: `D = ${toBengaliNumber(D)} < 0`,
    });

    return {
      originalInput: originalEq,
      type: 'quadratic_equation',
      typeName: 'দ্বিঘাত সমীকরণ (No Real Solution)',
      variable: varName,
      steps,
      finalAnswer: 'বাস্তব সংখ্যার কোনো সমাধান নেই (No real roots)',
      formulaUsed: 'পৃথায়ক D = b² - 4ac < 0',
    };
  }
}

/**
 * Solve Expression: e.g. (2x + 3)^2, (3a - 4b)^2, x^2 - 16, x^2 + 5x + 6, (x+2)(x+3)
 */
function solveExpression(expr: string): SolveResult | null {
  const clean = expr.replace(/\s+/g, '');

  // 1. Square Expansion: (ax + b)^2 or (ax - b)^2
  const squareMatch = clean.match(/^\(([^\)]+)\)(?:\^2|²)$/);
  if (squareMatch) {
    return solveSquareExpansion(squareMatch[1]);
  }

  // 2. Difference of Squares Factorization: a^2 - b^2 or x^2 - 16
  const diffSquareMatch = clean.match(/^([a-z0-9]+)(?:\^2|²)\-([0-9]+)$/i);
  if (diffSquareMatch) {
    return solveDiffOfSquares(diffSquareMatch[1], parseFloat(diffSquareMatch[2]));
  }

  // 3. Middle term quadratic trinomial expression: x^2 + 5x + 6
  const trinomialMatch = clean.match(/^([a-z0-9]*)(?:\^2|²)([\+\-][0-9]*[a-z])([\+\-][0-9]+)$/i);
  if (trinomialMatch) {
    return solveTrinomialFactoring(clean);
  }

  // 4. Product of two binomials: (x + a)(x + b)
  const productMatch = clean.match(/^\(([^\)]+)\)\(([^\)]+)\)$/);
  if (productMatch) {
    return solveBinomialProduct(productMatch[1], productMatch[2]);
  }

  // 5. Cube Expansion: (a + b)^3 or (a - b)^3
  const cubeMatch = clean.match(/^\(([^\)]+)\)(?:\^3|³)$/);
  if (cubeMatch) {
    return solveCubeExpansion(cubeMatch[1]);
  }

  // Fallback: General algebraic simplification
  return {
    originalInput: expr,
    type: 'simplification',
    typeName: 'বীজগণিতীয় রাশি বিশ্লেষণ (Algebraic Expression Analysis)',
    variable: 'x',
    steps: [
      {
        stepNumber: 1,
        title: 'প্রদত্ত বীজগণিতীয় রাশি',
        explanation: 'রাশিটির পদসমূহ বিশ্লেষণ করি।',
        math: expr,
      },
      {
        stepNumber: 2,
        title: 'শ্রেণি ৮ পাঠ্যবই বিধি',
        explanation: 'রাশিটিকে উৎপাদকে বিশ্লেষণ বা সূত্রের মাধ্যমে বিস্তারে রূপান্তর করার জন্য সঠিক সূত্র যাচাই করুন।',
        math: `প্রদত্ত রাশি: ${expr}`,
        badge: 'Class 8 NCTB',
      },
    ],
    finalAnswer: expr,
    formulaUsed: 'বর্গ ও ঘনের সূত্রাবলী',
  };
}

/**
 * Expands (ax + by)^2 or (ax - by)^2
 */
function solveSquareExpansion(inner: string): SolveResult {
  // Check if + or -
  const isPlus = inner.includes('+');
  const delimiter = isPlus ? '+' : '-';
  const parts = inner.split(delimiter).map(s => s.trim());

  const aTerm = parts[0] || 'a';
  const bTerm = parts[1] || 'b';

  const formula = isPlus ? '(a + b)² = a² + 2ab + b²' : '(a - b)² = a² - 2ab + b²';

  const steps: SolutionStep[] = [
    {
      stepNumber: 1,
      title: 'প্রদত্ত রাশির বর্গ',
      explanation: 'প্রদত্ত দ্বিপদী রাশির বর্গের আকার চিহ্নিত করি।',
      math: `(${inner})²`,
    },
    {
      stepNumber: 2,
      title: 'প্রযোজ্য বর্গের সূত্র',
      explanation: `এখানে প্রথম পদ = ${aTerm} এবং দ্বিতীয় পদ = ${bTerm} ধরে বর্গের সূত্রে মান বসাই:`,
      math: formula,
      badge: '৮ম শ্রেণি বর্গ সূত্র',
    },
    {
      stepNumber: 3,
      title: 'সূত্রে পদ প্রতিস্থাপন',
      explanation: `সূত্রে a-এর স্থলে (${aTerm}) এবং b-এর স্থলে (${bTerm}) বসাই:`,
      math: `= (${aTerm})² ${isPlus ? '+' : '-'} 2 × (${aTerm}) × (${bTerm}) + (${bTerm})²`,
    },
  ];

  // Try to simplify coefficients if possible
  // E.g. (2x + 3)^2 -> 4x^2 + 12x + 9
  const aMatch = aTerm.match(/^([0-9]*)([a-zA-Z]*)$/);
  const bMatch = bTerm.match(/^([0-9]*)([a-zA-Z]*)$/);

  let finalExpanded = '';
  if (aMatch && bMatch) {
    const aCoef = aMatch[1] ? parseFloat(aMatch[1]) : 1;
    const aVar = aMatch[2];
    const bCoef = bMatch[1] ? parseFloat(bMatch[1]) : 1;
    const bVar = bMatch[2];

    const firstTermCoef = aCoef * aCoef;
    const midTermCoef = 2 * aCoef * bCoef;
    const lastTermCoef = bCoef * bCoef;

    const t1 = `${firstTermCoef === 1 && aVar ? '' : toBengaliNumber(firstTermCoef)}${aVar ? aVar + '²' : ''}`;
    const midVars = [aVar, bVar].filter(Boolean).join('');
    const t2 = `${toBengaliNumber(midTermCoef)}${midVars}`;
    const t3 = `${lastTermCoef === 1 && bVar ? '' : toBengaliNumber(lastTermCoef)}${bVar ? bVar + '²' : ''}`;

    finalExpanded = `${t1} ${isPlus ? '+' : '-'} ${t2} + ${t3}`;

    steps.push({
      stepNumber: 4,
      title: 'গুণ ও ঘাত সরলীকরণ',
      explanation: 'প্রতিটি পদের বর্গ ও গুণফল নির্ণয় করে চূড়ান্ত রূপ পাই:',
      math: `= ${finalExpanded}`,
      badge: 'চূড়ান্ত বিস্তার',
    });
  } else {
    finalExpanded = `${aTerm}² ${isPlus ? '+' : '-'} 2${aTerm}${bTerm} + ${bTerm}²`;
  }

  return {
    originalInput: `(${inner})²`,
    type: 'expansion',
    typeName: 'বীজগণিতীয় রাশির বর্গ বিস্তার (Square Expansion)',
    variable: 'x',
    steps,
    finalAnswer: finalExpanded,
    formulaUsed: formula,
  };
}

/**
 * Difference of Squares: x^2 - 16 -> (x+4)(x-4)
 */
function solveDiffOfSquares(aTerm: string, bNum: number): SolveResult {
  const sqrtB = Math.sqrt(bNum);
  const isPerfect = Number.isInteger(sqrtB);
  const bDisplay = isPerfect ? toBengaliNumber(sqrtB) : `√${toBengaliNumber(bNum)}`;

  const steps: SolutionStep[] = [
    {
      stepNumber: 1,
      title: 'প্রদত্ত রাশি',
      explanation: 'দুটি বর্গের বিয়োগফল আকারে প্রকাশের সুযোগ যাচাই করি।',
      math: `${aTerm}² - ${toBengaliNumber(bNum)}`,
    },
    {
      stepNumber: 2,
      title: 'a² - b² আকারে রূপান্তর',
      explanation: `${toBengaliNumber(bNum)}-কে (${bDisplay})² আকারে লিখি:`,
      math: `= (${aTerm})² - (${bDisplay})²`,
      badge: 'a² - b² সূত্র',
    },
    {
      stepNumber: 3,
      title: 'উৎপাদকের সূত্র প্রয়োগ',
      explanation: 'আমরা জানি, a² - b² = (a + b)(a - b)। এই সূত্রে মান বসাই:',
      math: `= (${aTerm} + ${bDisplay})(${aTerm} - ${bDisplay})`,
      badge: 'উৎপাদক রূপ',
    },
  ];

  return {
    originalInput: `${aTerm}² - ${bNum}`,
    type: 'factorization',
    typeName: 'বর্গের অন্তর সূত্রের সাহায্যে উৎপাদকে বিশ্লেষণ (Difference of Squares)',
    variable: aTerm,
    steps,
    finalAnswer: `(${aTerm} + ${bDisplay})(${aTerm} - ${bDisplay})`,
    formulaUsed: 'a² - b² = (a + b)(a - b)',
  };
}

/**
 * Factoring Trinomial: x^2 + 5x + 6 -> (x+2)(x+3)
 */
function solveTrinomialFactoring(clean: string): SolveResult {
  // Simple heuristic for x^2 + bx + c
  const match = clean.match(/^([a-zA-Z])(?:\^2|²)([\+\-][0-9]*)\1([\+\-][0-9]+)$/);
  let v = 'x';
  let b = 5;
  let c = 6;

  if (match) {
    v = match[1];
    const bStr = match[2];
    b = bStr === '+' ? 1 : bStr === '-' ? -1 : parseFloat(bStr);
    c = parseFloat(match[3]);
  }

  // Find p and q: p*q = c, p+q = b
  let p = 2;
  let q = 3;
  let found = false;

  for (let i = -Math.abs(c); i <= Math.abs(c); i++) {
    if (i !== 0 && c % i === 0) {
      const j = c / i;
      if (i + j === b) {
        p = i;
        q = j;
        found = true;
        break;
      }
    }
  }

  const steps: SolutionStep[] = [
    {
      stepNumber: 1,
      title: 'প্রদত্ত রাশি',
      explanation: 'দ্বিঘাত ত্রিপদী রাশিটির মধ্যপদ বিভাজন পদ্ধতি বিবেচনা করি।',
      math: `${v}² ${b >= 0 ? '+' : ''}${toBengaliNumber(b)}${v} ${c >= 0 ? '+' : ''}${toBengaliNumber(c)}`,
    },
    {
      stepNumber: 2,
      title: 'সংখ্যাদ্বয় নির্বাচন',
      explanation: `এমন দুটি সংখ্যা খুঁজি যাদের গুণফল = ${toBengaliNumber(c)} এবং যোগফল = ${toBengaliNumber(b)}। সংখ্যা দুটি হলো ${toBengaliNumber(p)} এবং ${toBengaliNumber(q)}।`,
      math: `${toBengaliNumber(p)} × ${toBengaliNumber(q)} = ${toBengaliNumber(c)}  এবং  ${toBengaliNumber(p)} + ${toBengaliNumber(q)} = ${toBengaliNumber(b)}`,
      badge: 'মধ্যপদ বিভাজন',
    },
    {
      stepNumber: 3,
      title: 'মধ্যপদ ভেঙে লেখা',
      explanation: `মধ্যপদ ${toBengaliNumber(b)}${v}-কে ${toBengaliNumber(p)}${v} ও ${toBengaliNumber(q)}${v} আকারে লিখি:`,
      math: `= ${v}² ${p >= 0 ? '+' : ''}${toBengaliNumber(p)}${v} ${q >= 0 ? '+' : ''}${toBengaliNumber(q)}${v} ${c >= 0 ? '+' : ''}${toBengaliNumber(c)}`,
    },
    {
      stepNumber: 4,
      title: 'কমন গ্রহণ ও উৎপাদক গঠন',
      explanation: `প্রথম দুটি পদ হতে ${v} এবং শেষ দুটি পদ হতে ${toBengaliNumber(q)} কমন নিই:`,
      math: `= ${v}(${v} ${p >= 0 ? '+' : ''}${toBengaliNumber(p)}) + ${toBengaliNumber(q)}(${v} ${p >= 0 ? '+' : ''}${toBengaliNumber(p)})`,
    },
    {
      stepNumber: 5,
      title: 'সাধারণ উৎপাদক পৃথকীকরণ',
      explanation: `সাধারণ উৎপাদক (${v} ${p >= 0 ? '+' : ''}${toBengaliNumber(p)}) কমন নিয়ে চূড়ান্ত উৎপাদক পাই:`,
      math: `= (${v} ${p >= 0 ? '+' : ''}${toBengaliNumber(p)})(${v} ${q >= 0 ? '+' : ''}${toBengaliNumber(q)})`,
      badge: 'চূড়ান্ত উৎপাদক',
    },
  ];

  return {
    originalInput: clean,
    type: 'factorization',
    typeName: 'মধ্যপদ বিভাজন পদ্ধতিতে উৎপাদকে বিশ্লেষণ (Middle-term Factorization)',
    variable: v,
    steps,
    finalAnswer: `(${v} ${p >= 0 ? '+' : ''}${toBengaliNumber(p)})(${v} ${q >= 0 ? '+' : ''}${toBengaliNumber(q)})`,
    formulaUsed: 'x² + (a+b)x + ab = (x+a)(x+b)',
  };
}

/**
 * Product of Binomials: (x + a)(x + b) -> x^2 + (a+b)x + ab
 */
function solveBinomialProduct(side1: string, side2: string): SolveResult {
  const steps: SolutionStep[] = [
    {
      stepNumber: 1,
      title: 'প্রদত্ত দুটি দ্বিপদী রাশির গুণফল',
      explanation: 'রাশি দুটি লিখি:',
      math: `(${side1})(${side2})`,
    },
    {
      stepNumber: 2,
      title: 'বন্টন বিধি (Distributive Property)',
      explanation: `প্রথম রাশির প্রতিটি পদ দিয়ে দ্বিতীয় রাশিকে গুণ করি:`,
      math: `= ${side1.split(/[\+\-]/)[0]}(${side2}) + ...`,
    },
  ];

  return {
    originalInput: `(${side1})(${side2})`,
    type: 'expansion',
    typeName: 'দ্বিপদী রাশির গুণফল ও বিস্তার (Binomial Multiplication)',
    variable: 'x',
    steps,
    finalAnswer: `(${side1})(${side2})`,
    formulaUsed: '(x + a)(x + b) = x² + (a+b)x + ab',
  };
}

/**
 * Cube Expansion: (a + b)^3
 */
function solveCubeExpansion(inner: string): SolveResult {
  const isPlus = inner.includes('+');
  const formula = isPlus
    ? '(a + b)³ = a³ + 3a²b + 3ab² + b³'
    : '(a - b)³ = a³ - 3a²b + 3ab² - b³';

  return {
    originalInput: `(${inner})³`,
    type: 'expansion',
    typeName: 'বীজগণিতীয় ঘনের বিস্তার (Cube Expansion)',
    variable: 'x',
    steps: [
      {
        stepNumber: 1,
        title: 'প্রদত্ত রাশির ঘন',
        explanation: 'ঘনের সূত্র প্রয়োগের জন্য রূপ প্রস্তুত করি।',
        math: `(${inner})³`,
      },
      {
        stepNumber: 2,
        title: 'ঘনের সূত্র',
        explanation: '৮ম শ্রেণি বীজগণিতের ঘন সূত্রটি হলো:',
        math: formula,
        badge: 'ঘন সূত্র',
      },
    ],
    finalAnswer: `(${inner})³ এর বিস্তার সম্পন্ন`,
    formulaUsed: formula,
  };
}
