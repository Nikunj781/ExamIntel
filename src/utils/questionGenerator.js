// ── Static conceptual questions (MCQ with fixed options) ──────
const conceptualQuestions = {
  Physics: [
    { text: "Newton's second law of motion states that the net force on a body is:", options: ["Equal to the rate of change of momentum", "Equal to mass times velocity", "Inversely proportional to mass", "Independent of acceleration"], correct: 0 },
    { text: "Which of the following quantities is a vector?", options: ["Speed", "Distance", "Momentum", "Energy"], correct: 2 },
    { text: "The work done by a force on a body is zero when:", options: ["Force and displacement are in the same direction", "Force and displacement are perpendicular", "The body moves with constant speed", "Force is greater than weight"], correct: 1 },
    { text: "The escape velocity from Earth's surface is approximately:", options: ["8 km/s", "11.2 km/s", "7.9 km/s", "3 km/s"], correct: 1 },
    { text: "In a simple pendulum, the time period depends on:", options: ["Mass of bob", "Length and gravity", "Amplitude", "Material of string"], correct: 1 },
    { text: "When a body moves in a circular path at constant speed, the work done by centripetal force is:", options: ["Maximum", "Minimum", "Zero", "Negative"], correct: 2 },
    { text: "Ohm's law is valid for:", options: ["Semiconductors", "Metallic conductors at constant temperature", "Electrolytes", "Vacuum tubes"], correct: 1 },
    { text: "The SI unit of magnetic flux is:", options: ["Tesla", "Weber", "Henry", "Ampere-meter"], correct: 1 },
    { text: "Total internal reflection occurs when light travels from:", options: ["Rarer to denser medium beyond critical angle", "Denser to rarer medium beyond critical angle", "Air to glass", "Vacuum to water"], correct: 1 },
    { text: "Which law states that induced EMF opposes the change causing it?", options: ["Faraday's law", "Lenz's law", "Biot-Savart law", "Kirchhoff's law"], correct: 1 },
    { text: "The de Broglie wavelength of a particle is:", options: ["h/mv", "mv/h", "h·mv", "m/hv"], correct: 0 },
    { text: "A photon of energy E has momentum:", options: ["E/c", "Ec", "E/c²", "hc"], correct: 0 },
    { text: "In Young's double slit experiment, fringe width is:", options: ["Proportional to slit separation", "Inversely proportional to slit separation", "Independent of wavelength", "Proportional to distance between slits and screen only"], correct: 1 },
    { text: "The half-life of a radioactive substance is the time taken for:", options: ["Complete decay", "Half the atoms to decay", "75% atoms to decay", "One atom to decay"], correct: 1 },
    { text: "In a transformer, which law is the principle of operation?", options: ["Lenz's law", "Faraday's law of electromagnetic induction", "Biot-Savart law", "Coulomb's law"], correct: 1 },
    { text: "The dimensional formula of power is:", options: ["ML²T⁻³", "ML²T⁻²", "MLT⁻²", "ML³T⁻³"], correct: 0 },
    { text: "A ball thrown vertically upward reaches its highest point when:", options: ["Velocity becomes zero", "Acceleration becomes zero", "Kinetic energy is maximum", "Both velocity and acceleration are zero"], correct: 0 },
    { text: "The efficiency of a Carnot engine between 600K and 300K is:", options: ["25%", "50%", "75%", "100%"], correct: 1 },
    { text: "Which quantity remains conserved in elastic collision?", options: ["Kinetic energy only", "Momentum only", "Both kinetic energy and momentum", "Velocity"], correct: 2 },
    { text: "The angle of minimum deviation in a prism depends on:", options: ["Refractive index and prism angle", "Only prism angle", "Only incident light intensity", "Color of light only"], correct: 0 },
  ],
  Chemistry: [
    { text: "Which type of hybridisation is exhibited by carbon in methane?", options: ["sp", "sp²", "sp³", "sp³d"], correct: 2 },
    { text: "According to VSEPR theory, the shape of water molecule is:", options: ["Linear", "Bent/V-shaped", "Trigonal planar", "Tetrahedral"], correct: 1 },
    { text: "The pH of pure water at 25°C is:", options: ["0", "7", "14", "1"], correct: 1 },
    { text: "Gibbs free energy change for a spontaneous reaction at constant T and P is:", options: ["Positive", "Zero", "Negative", "Equal to ΔH"], correct: 2 },
    { text: "Which of the following is a Lewis acid?", options: ["NH₃", "BF₃", "H₂O", "OH⁻"], correct: 1 },
    { text: "Rate law for a first order reaction is:", options: ["r = k[A]²", "r = k[A]", "r = k", "r = k[A][B]"], correct: 1 },
    { text: "The half-life of a first order reaction is:", options: ["Proportional to initial concentration", "0.693/k", "k/0.693", "Inversely proportional to k²"], correct: 1 },
    { text: "Which of the following is NOT a colligative property?", options: ["Osmotic pressure", "Boiling point elevation", "Optical rotation", "Freezing point depression"], correct: 2 },
    { text: "The number of electrons in a 3d subshell can be at most:", options: ["6", "10", "2", "14"], correct: 1 },
    { text: "According to Hund's rule, electrons in degenerate orbitals are:", options: ["Paired first", "Filled singly before pairing", "Randomly placed", "Filled in alphabetical order"], correct: 1 },
    { text: "The IUPAC name of CH₃-CH(OH)-CH₃ is:", options: ["Propan-1-ol", "Propan-2-ol", "2-methylpropanol", "Isopropyl ether"], correct: 1 },
    { text: "Electrochemical series is used to determine:", options: ["Rate of reaction", "Oxidising and reducing ability of metals", "Viscosity of solutions", "pH of solutions"], correct: 1 },
    { text: "Which catalyst is used in the Haber process?", options: ["Platinum", "Iron (with K₂O and Al₂O₃)", "Vanadium pentoxide", "Nickel"], correct: 1 },
    { text: "Nucleophilic substitution reaction (SN2) is favoured by:", options: ["Tertiary carbon", "Primary carbon with strong nucleophile", "Secondary carbon with weak nucleophile", "Aromatic carbon"], correct: 1 },
    { text: "Which of these is a thermosetting polymer?", options: ["Polythene", "Bakelite", "Nylon-6,6", "PVC"], correct: 1 },
    { text: "The enthalpy change when 1 mole of a substance is completely burned is called:", options: ["Enthalpy of formation", "Enthalpy of combustion", "Enthalpy of neutralisation", "Bond enthalpy"], correct: 1 },
    { text: "Which gas law states PV = constant at constant temperature?", options: ["Charles's law", "Boyle's law", "Avogadro's law", "Gay-Lussac's law"], correct: 1 },
    { text: "Crystal field splitting in an octahedral field gives:", options: ["Three lower (t₂g) and two higher (eg) orbitals", "Two lower and three higher orbitals", "All five degenerate orbitals", "Four lower and one higher orbital"], correct: 0 },
    { text: "Which of the following has the highest lattice energy?", options: ["NaF", "NaCl", "NaBr", "NaI"], correct: 0 },
    { text: "The Nernst equation relates cell EMF to:", options: ["Only temperature", "Concentration of ions and temperature", "Only pressure", "Only standard EMF"], correct: 1 },
  ],
  Mathematics: [
    { text: "The derivative of sin⁻¹(x) with respect to x is:", options: ["1/√(1-x²)", "-1/√(1-x²)", "1/√(1+x²)", "1/(1+x²)"], correct: 0 },
    { text: "∫eˣ dx equals:", options: ["xeˣ + C", "eˣ + C", "eˣ/x + C", "x + C"], correct: 1 },
    { text: "The sum of an infinite GP with first term a and common ratio r (|r|<1) is:", options: ["a/(1-r)", "a/(1+r)", "a·r/(1-r)", "ar/(r-1)"], correct: 0 },
    { text: "The number of ways to arrange n distinct objects in a circle is:", options: ["n!", "(n-1)!", "n!/2", "2(n-1)!"], correct: 1 },
    { text: "If a matrix A is of order 3×3 with det(A) = 5, then det(2A) is:", options: ["10", "40", "80", "20"], correct: 1 },
    { text: "The eccentricity of a circle is:", options: ["1", "0", "∞", "Depends on radius"], correct: 1 },
    { text: "The angle between two lines with slopes m₁ and m₂ satisfies tan θ =:", options: ["(m₁+m₂)/(1-m₁m₂)", "|(m₁-m₂)/(1+m₁m₂)|", "(m₁m₂)/(m₁-m₂)", "m₁-m₂"], correct: 1 },
    { text: "Bayes' theorem is used to find:", options: ["Joint probability", "Posterior probability", "Marginal probability", "Complementary probability"], correct: 1 },
    { text: "The focus of the parabola y² = 4ax is:", options: ["(0, a)", "(a, 0)", "(-a, 0)", "(0, -a)"], correct: 1 },
    { text: "The value of lim(x→0) sin(x)/x is:", options: ["0", "∞", "1", "Undefined"], correct: 2 },
    { text: "The dot product of two perpendicular vectors is:", options: ["1", "-1", "0", "Depends on magnitude"], correct: 2 },
    { text: "The number of terms in the expansion of (a+b)ⁿ is:", options: ["n", "n-1", "n+1", "2n"], correct: 2 },
    { text: "The condition for two lines to be parallel is:", options: ["m₁ = m₂", "m₁·m₂ = -1", "m₁ + m₂ = 0", "m₁/m₂ = 0"], correct: 0 },
    { text: "The mean of a binomial distribution B(n, p) is:", options: ["np(1-p)", "np", "n/p", "p/n"], correct: 1 },
    { text: "If f(x) = x² - 4, then f'(x) = 0 at:", options: ["x = 0", "x = 2", "x = -2", "x = ±2"], correct: 0 },
    { text: "The general solution of dy/dx = y is:", options: ["y = Ceˣ", "y = C + eˣ", "y = Ce⁻ˣ", "y = x + C"], correct: 0 },
    { text: "The vector product (cross product) of two parallel vectors is:", options: ["A unit vector", "Zero vector", "A scalar", "Undefined"], correct: 1 },
    { text: "The graph of y = |x| has:", options: ["A minimum at x = 0", "A maximum at x = 0", "No turning point", "Two minima"], correct: 0 },
    { text: "∫₀¹ x² dx equals:", options: ["1/3", "1/2", "1", "2/3"], correct: 0 },
    { text: "The principal value of sin⁻¹(1) is:", options: ["π", "π/4", "π/2", "π/6"], correct: 2 },
  ],
  Biology: [
    { text: "The powerhouse of the cell is the:", options: ["Nucleus", "Ribosome", "Mitochondria", "Endoplasmic Reticulum"], correct: 2 },
    { text: "DNA replication is:", options: ["Conservative", "Semi-conservative", "Dispersive", "Both conservative and dispersive"], correct: 1 },
    { text: "The site of photosynthesis in plants is:", options: ["Mitochondria", "Chloroplast", "Nucleus", "Ribosome"], correct: 1 },
    { text: "In Mendel's monohybrid cross, the F2 phenotypic ratio is:", options: ["1:2:1", "3:1", "9:3:3:1", "1:1"], correct: 1 },
    { text: "Which of the following is NOT a function of the kidney?", options: ["Filtration of blood", "Reabsorption of glucose", "Production of insulin", "Osmoregulation"], correct: 2 },
    { text: "The process by which plants lose water through leaves is:", options: ["Osmosis", "Transpiration", "Guttation", "Imbibition"], correct: 1 },
    { text: "Which blood group is called the universal donor?", options: ["AB", "B", "A", "O"], correct: 3 },
    { text: "The functional unit of kidney is:", options: ["Neuron", "Nephron", "Alveolus", "Villus"], correct: 1 },
    { text: "Which part of the brain controls body temperature?", options: ["Cerebellum", "Medulla oblongata", "Hypothalamus", "Cerebrum"], correct: 2 },
    { text: "Glycolysis occurs in the:", options: ["Mitochondria", "Chloroplast", "Cytoplasm", "Nucleus"], correct: 2 },
    { text: "The genetic material of HIV is:", options: ["DNA", "RNA", "Protein", "Lipid"], correct: 1 },
    { text: "Which enzyme is responsible for DNA replication?", options: ["RNA polymerase", "DNA polymerase", "Ligase", "Restriction endonuclease"], correct: 1 },
    { text: "In the Hardy-Weinberg equilibrium, allele frequencies remain constant when:", options: ["Mutation occurs", "Natural selection acts", "Random mating with no evolutionary forces", "Immigration occurs"], correct: 2 },
    { text: "Oxygen is released during photosynthesis from:", options: ["CO₂", "Glucose", "Water", "NADPH"], correct: 2 },
    { text: "Which type of immunity does vaccination provide?", options: ["Natural active immunity", "Artificial active immunity", "Passive immunity", "Innate immunity"], correct: 1 },
    { text: "The Calvin cycle fixes:", options: ["O₂", "H₂O", "CO₂", "N₂"], correct: 2 },
    { text: "The number of chromosomes in a human gamete is:", options: ["46", "23", "48", "44"], correct: 1 },
    { text: "Which hormone is produced by the islets of Langerhans?", options: ["Thyroxine", "Insulin and glucagon", "Adrenaline", "Cortisol"], correct: 1 },
    { text: "Peristalsis is a function of:", options: ["Cardiac muscle", "Skeletal muscle", "Smooth muscle", "All muscle types"], correct: 2 },
    { text: "The primary succession begins on:", options: ["Bare rock or new land", "Previously occupied land", "Aquatic habitat only", "Forest floor"], correct: 0 },
  ]
}

// ── Numeric calculation templates ─────────────────────────────
export const questionTemplates = {
  Physics: [
    {
      text: "A particle of mass {m} kg moves in a circle of radius {r} m at speed {v} m/s. The centripetal force is:",
      options: ["{ans} N", "{ans/2} N", "{ans*2} N", "{ans*4} N"],
      calc: (v) => +((v.m * v.v * v.v) / v.r).toFixed(2),
      vars: { m: [1, 2, 5], r: [2, 4, 10], v: [5, 10, 20] }
    },
    {
      text: "A block slides down a frictionless incline of angle {angle}°. Its acceleration is (g = 10 m/s²):",
      options: ["{ans} m/s²", "{ans+2} m/s²", "{ans-1} m/s²", "10 m/s²"],
      calc: (v) => +(10 * Math.sin(v.angle * Math.PI / 180)).toFixed(2),
      vars: { angle: [30, 45, 60] }
    },
    {
      text: "Two charges {q1} µC and {q2} µC are {d} cm apart. Electrostatic force is (k=9×10⁹):",
      options: ["{ans} N", "{ans/10} N", "{ans*10} N", "{ans*100} N"],
      calc: (v) => +((9e9 * v.q1 * 1e-6 * v.q2 * 1e-6) / ((v.d/100)**2)).toFixed(2),
      vars: { q1: [2, 4, 6], q2: [3, 5, 8], d: [10, 20, 30] }
    },
    {
      text: "A body of mass {m} kg is lifted to height {h} m. Potential energy gained is (g=10):",
      options: ["{ans} J", "{ans*2} J", "{ans/2} J", "{ans+100} J"],
      calc: (v) => v.m * 10 * v.h,
      vars: { m: [2, 5, 10], h: [3, 5, 10] }
    },
    {
      text: "A resistor of resistance {r} Ω carries current {i} A. Power dissipated is:",
      options: ["{ans} W", "{ans*2} W", "{ans/2} W", "{ans+5} W"],
      calc: (v) => v.i * v.i * v.r,
      vars: { r: [2, 4, 10], i: [1, 2, 3, 5] }
    },
    {
      text: "A spring of constant k = {k} N/m is compressed by {x} cm. Elastic PE stored is:",
      options: ["{ans} J", "{ans*2} J", "{ans/4} J", "{ans/2} J"],
      calc: (v) => +(0.5 * v.k * (v.x/100)**2).toFixed(4),
      vars: { k: [100, 200, 500], x: [5, 10, 20] }
    },
    {
      text: "A projectile is launched at {angle}° with initial speed {u} m/s. Max height is (g=10):",
      options: ["{ans} m", "{ans*2} m", "{ans/2} m", "{ans+5} m"],
      calc: (v) => +((v.u * Math.sin(v.angle * Math.PI/180))**2 / 20).toFixed(2),
      vars: { angle: [30, 45, 60], u: [20, 30, 40] }
    },
    {
      text: "A body of mass {m} kg moving at {v} m/s has kinetic energy:",
      options: ["{ans} J", "{ans*2} J", "{ans/2} J", "{ans+50} J"],
      calc: (v) => +(0.5 * v.m * v.v**2).toFixed(1),
      vars: { m: [2, 4, 10], v: [3, 5, 10] }
    }
  ],
  Chemistry: [
    {
      text: "What is the pH of a {m} M strong acid HCl solution?",
      options: ["{ans}", "{ans+1}", "{ans-1}", "7.0"],
      calc: (v) => +(-Math.log10(v.m)).toFixed(2),
      vars: { m: [0.1, 0.01, 0.001] }
    },
    {
      text: "In N₂ + 3H₂ ⇌ 2NH₃, if [N₂]={n2}M, [H₂]={h2}M, [NH₃]={nh3}M, then Kc is:",
      options: ["{ans}", "{ans*2}", "{ans/2}", "1.0"],
      calc: (v) => +((v.nh3**2) / (v.n2 * v.h2**3)).toFixed(3),
      vars: { n2: [0.5, 1.0], h2: [1.0, 2.0], nh3: [0.2, 0.5] }
    },
    {
      text: "The molar mass of CaCO₃ is (Ca=40, C=12, O=16):",
      options: ["100 g/mol", "88 g/mol", "112 g/mol", "80 g/mol"],
      calc: () => 100,
      vars: { x: [1] }
    },
    {
      text: "How many moles are in {g} g of H₂O (M=18)?",
      options: ["{ans} mol", "{ans*2} mol", "{ans/2} mol", "{ans+1} mol"],
      calc: (v) => +(v.g / 18).toFixed(2),
      vars: { g: [18, 36, 90, 180] }
    },
    {
      text: "A 2 M solution of NaCl has molality {m} mol/kg in water. Boiling point elevation (Kb=0.52) is:",
      options: ["{ans} °C", "{ans*2} °C", "{ans/2} °C", "0.52 °C"],
      calc: (v) => +(0.52 * 2 * v.m).toFixed(2),
      vars: { m: [1, 2, 3] }
    }
  ],
  Mathematics: [
    {
      text: "Find the derivative of f(x) = {a}x³ + {b}x² - {c}x at x = {x}.",
      options: ["{ans}", "{ans+10}", "{ans-5}", "{ans*2}"],
      calc: (v) => 3*v.a*v.x**2 + 2*v.b*v.x - v.c,
      vars: { a: [2, 3, 4], b: [1, 5, -2], c: [3, 7, 10], x: [1, 2, -1] }
    },
    {
      text: "Evaluate ∫₀^{b} {a}x dx.",
      options: ["{ans}", "{ans*2}", "{ans/2}", "0"],
      calc: (v) => (v.a / 2) * v.b**2,
      vars: { a: [2, 4, 6], b: [2, 3, 5] }
    },
    {
      text: "The {n}th term of AP with first term {a} and common difference {d} is:",
      options: ["{ans}", "{ans+d}", "{ans-d}", "{ans*2}"],
      calc: (v) => v.a + (v.n - 1) * v.d,
      vars: { a: [1, 2, 5], d: [2, 3, 5], n: [5, 10, 15] }
    },
    {
      text: "Sum of first {n} terms of GP with first term {a} and ratio {r}:",
      options: ["{ans}", "{ans*2}", "{ans-1}", "{ans+5}"],
      calc: (v) => +(v.a * (v.r**v.n - 1) / (v.r - 1)).toFixed(2),
      vars: { a: [1, 2], r: [2, 3], n: [3, 4, 5] }
    },
    {
      text: "The distance between points ({x1},{y1}) and ({x2},{y2}) is:",
      options: ["{ans}", "{ans*2}", "{ans+1}", "{ans-1}"],
      calc: (v) => +(Math.sqrt((v.x2-v.x1)**2 + (v.y2-v.y1)**2)).toFixed(2),
      vars: { x1: [0, 1, 2], y1: [0, 1], x2: [3, 4, 6], y2: [4, 5] }
    }
  ],
  Biology: [
    {
      text: "If a parent with genotype Aa is crossed with Aa, what fraction of offspring will be homozygous dominant (AA)?",
      options: ["1/4", "1/2", "3/4", "0"],
      calc: () => "1/4",
      vars: { x: [1] }
    }
  ]
}

// ── Generator function ─────────────────────────────────────────
export function generateRealisticQuestions(examId, subject, chapter, count) {
  const numericTemplates = questionTemplates[subject] || []
  const conceptPool      = conceptualQuestions[subject] || []

  // Shuffle pools
  const shuffledConcepts = [...conceptPool].sort(() => Math.random() - 0.5)
  const shuffledNumeric  = [...numericTemplates].sort(() => Math.random() - 0.5)

  return Array.from({ length: count }).map((_, i) => {
    const id = `${examId}_${subject}_${chapter.replace(/\s+/g,'_')}_${crypto.randomUUID().split('-')[0]}`

    // Alternate: numeric question every 3rd question
    const useNumeric = shuffledNumeric.length > 0 && i % 3 === 0
    const conceptQ   = shuffledConcepts[i % shuffledConcepts.length]

    if (useNumeric) {
      const t = shuffledNumeric[i % shuffledNumeric.length]

      let selectedVars = {}
      Object.keys(t.vars).forEach(k => {
        const arr = t.vars[k]
        selectedVars[k] = arr[Math.floor(Math.random() * arr.length)]
      })

      let correctAns = t.calc(selectedVars)
      if (typeof correctAns === 'number' && !Number.isInteger(correctAns)) {
        correctAns = +correctAns.toFixed(2)
      }

      let text = t.text
      Object.keys(selectedVars).forEach(k => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), selectedVars[k])
      })

      let options = t.options.map(opt => {
        try {
          const exprMatch = opt.match(/\{ans([^}]*)\}/)
          if (exprMatch) {
            const op = exprMatch[1]
            const numAns = Number(correctAns)
            let result = numAns
            if (op.startsWith('*')) result = numAns * Number(op.slice(1))
            else if (op.startsWith('/')) result = numAns / Number(op.slice(1))
            else if (op.startsWith('+')) result = numAns + Number(op.slice(1))
            else if (op.startsWith('-')) result = numAns - Number(op.slice(1))
            return opt.replace(`{ans${op}}`, Number.isInteger(result) ? result : +result.toFixed(2))
          }
          return opt.replace('{ans}', correctAns)
        } catch { return opt.replace('{ans}', correctAns) }
      })

      // Also substitute any remaining vars in options
      options = options.map(opt => {
        let o = opt
        Object.keys(selectedVars).forEach(k => {
          o = o.replace(new RegExp(`\\{${k}\\}`, 'g'), selectedVars[k])
        })
        return o
      })

      options = [...new Set(options)]
      while (options.length < 4) options.push(`${options[0]} (alt)`)

      const correctText = options[0]
      const shuffled    = options.sort(() => Math.random() - 0.5)

      return { id, subject, chapter, text, options: shuffled, correctOption: shuffled.indexOf(correctText) }
    }

    // Conceptual question
    if (conceptQ) {
      return {
        id, subject, chapter,
        text: conceptQ.text,
        options: [...conceptQ.options],
        correctOption: conceptQ.correct
      }
    }

    // Absolute fallback
    return {
      id, subject, chapter,
      text: `[${subject} – ${chapter}] Question ${i+1}: Which of the following best describes the core principle of this topic?`,
      options: ["The relationship is directly proportional", "The relationship is inversely proportional", "There is no relationship", "It depends on external conditions"],
      correctOption: 0
    }
  })
}
