import { AptitudeQuestion } from './types';

export const mockQuestionsData: AptitudeQuestion[] = [
  // Quantitative Aptitude (8 questions)
  {
    id: 'qa-1',
    category: 'Quantitative Aptitude',
    question: 'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?',
    options: ['65 seconds', '89 seconds', '100 seconds', '150 seconds'],
    correctIndex: 1,
    explanation: 'Speed = Distance / Time = 240 / 24 = 10 m/s. Total distance to pass platform = 240 + 650 = 890 m. Time = 890 / 10 = 89 seconds.'
  },
  {
    id: 'qa-2',
    category: 'Quantitative Aptitude',
    question: 'If the price of petrol increases by 25%, by how much percentage must a motorist reduce petrol consumption so that the expenditure remains unchanged?',
    options: ['20%', '25%', '16.67%', '15%'],
    correctIndex: 0,
    explanation: 'Reduction % = [r / (100 + r)] * 100 = [25 / 125] * 100 = 20%.'
  },
  {
    id: 'qa-3',
    category: 'Quantitative Aptitude',
    question: 'A and B together can complete a work in 12 days. B alone can do it in 30 days. In how many days can A alone complete the work?',
    options: ['18 days', '20 days', '22 days', '25 days'],
    correctIndex: 1,
    explanation: '1/A + 1/30 = 1/12 => 1/A = 1/12 - 1/30 = (5 - 2)/60 = 3/60 = 1/20. So A alone takes 20 days.'
  },
  {
    id: 'qa-4',
    category: 'Quantitative Aptitude',
    question: 'What is the compound interest on $10,000 in 2 years at 10% per annum, compounded annually?',
    options: ['$2,000', '$2,100', '$2,200', '$2,050'],
    correctIndex: 1,
    explanation: 'Amount = 10000 * (1 + 0.10)^2 = 10000 * 1.21 = $12,100. CI = $12,100 - $10,000 = $2,100.'
  },
  {
    id: 'qa-5',
    category: 'Quantitative Aptitude',
    question: 'In a class of 60 students, 40% are girls. How many boys are there in the class?',
    options: ['24', '30', '36', '42'],
    correctIndex: 2,
    explanation: 'Number of girls = 40% of 60 = 24. Number of boys = 60 - 24 = 36.'
  },
  {
    id: 'qa-6',
    category: 'Quantitative Aptitude',
    question: 'Find the greatest common divisor (GCD) of 54, 72, and 126.',
    options: ['9', '18', '24', '12'],
    correctIndex: 1,
    explanation: '54 = 2 * 3^3, 72 = 2^3 * 3^2, 126 = 2 * 3^2 * 7. GCD = 2 * 3^2 = 18.'
  },
  {
    id: 'qa-7',
    category: 'Quantitative Aptitude',
    question: 'Two pipes A and B can fill a cistern in 20 and 30 minutes respectively. If both pipes are opened together, the time taken to fill the cistern is:',
    options: ['10 minutes', '12 minutes', '15 minutes', '25 minutes'],
    correctIndex: 1,
    explanation: 'Part filled in 1 min = 1/20 + 1/30 = (3 + 2)/60 = 5/60 = 1/12. Hence 12 minutes.'
  },
  {
    id: 'qa-8',
    category: 'Quantitative Aptitude',
    question: 'A shopkeeper sells an article for $480 at a profit of 20%. What was its cost price?',
    options: ['$380', '$400', '$420', '$440'],
    correctIndex: 1,
    explanation: 'CP = SP / (1 + Profit%) = 480 / 1.20 = $400.'
  },

  // Logical Reasoning (7 questions)
  {
    id: 'lr-1',
    category: 'Logical Reasoning',
    question: 'Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?',
    options: ['(1/3)', '(1/8)', '(2/8)', '(1/16)'],
    correctIndex: 1,
    explanation: 'This is an alternating division series: each number is half of the previous number. (1/4) / 2 = 1/8.'
  },
  {
    id: 'lr-2',
    category: 'Logical Reasoning',
    question: 'Pointing to a photograph of a boy, Suresh said, "He is the son of the only son of my mother." How is Suresh related to that boy?',
    options: ['Brother', 'Uncle', 'Cousin', 'Father'],
    correctIndex: 3,
    explanation: 'The only son of Suresh\'s mother is Suresh himself. So the boy is Suresh\'s son, making Suresh his father.'
  },
  {
    id: 'lr-3',
    category: 'Logical Reasoning',
    question: 'Statements: All mangoes are golden in color. No golden-colored things are cheap. Conclusions: 1) All mangoes are cheap. 2) Golden-colored mangoes are not cheap.',
    options: ['Only conclusion 1 follows', 'Only conclusion 2 follows', 'Either 1 or 2 follows', 'Neither 1 nor 2 follows'],
    correctIndex: 1,
    explanation: 'Since all mangoes are golden and no golden-colored things are cheap, mangoes are not cheap. Therefore conclusion 2 strictly follows.'
  },
  {
    id: 'lr-4',
    category: 'Logical Reasoning',
    question: 'In a certain code language, "COMPUTER" is written as "RFUVQNPC". How is "MEDICINE" written in that code?',
    options: ['MFEDJJOE', 'EOJDEJFM', 'MFEJDJOE', 'EOJDJEFM'],
    correctIndex: 3,
    explanation: 'The reverse letters: first letter goes to end, last letter goes to front, and middle letters are shifted by +1.'
  },
  {
    id: 'lr-5',
    category: 'Logical Reasoning',
    question: 'If South-East becomes North, North-East becomes West and so on, what will West become?',
    options: ['North-East', 'South-East', 'South-West', 'North-West'],
    correctIndex: 1,
    explanation: 'The directions are rotated 135 degrees counter-clockwise. Rotating West 135 degrees counter-clockwise gives South-East.'
  },
  {
    id: 'lr-6',
    category: 'Logical Reasoning',
    question: 'Four of the following five are alike in a certain way and so form a group. Which is the one that does not belong to that group? (Zinc, Iron, Mercury, Copper, Aluminum)',
    options: ['Iron', 'Mercury', 'Zinc', 'Copper'],
    correctIndex: 1,
    explanation: 'Mercury is a liquid metal at room temperature, while all others are solid.'
  },
  {
    id: 'lr-7',
    category: 'Logical Reasoning',
    question: 'Find the missing number in the sequence: 4, 9, 25, 49, 121, 169, ?',
    options: ['225', '256', '289', '361'],
    correctIndex: 2,
    explanation: 'These are squares of prime numbers: 2^2, 3^2, 5^2, 7^2, 11^2, 13^2, 17^2 = 289.'
  },

  // Verbal Ability (6 questions) -> Total 21 questions (> 20 required!)
  {
    id: 'va-1',
    category: 'Verbal Ability',
    question: 'Select the synonym for the word "EPHEMERAL":',
    options: ['Transient', 'Enduring', 'Celestial', 'Opulent'],
    correctIndex: 0,
    explanation: 'Ephemeral means lasting for a very short time; transient is its direct synonym.'
  },
  {
    id: 'va-2',
    category: 'Verbal Ability',
    question: 'Choose the antonym for the word "METICULOUS":',
    options: ['Diligent', 'Careless', 'Painstaking', 'Scrupulous'],
    correctIndex: 1,
    explanation: 'Meticulous means showing great attention to detail; careless is its direct opposite.'
  },
  {
    id: 'va-3',
    category: 'Verbal Ability',
    question: 'Fill in the blank: Neither the teacher nor the students ______ happy with the sudden examination schedule.',
    options: ['was', 'were', 'is', 'has been'],
    correctIndex: 1,
    explanation: 'When using "neither... nor", the verb agrees with the subject closer to it ("the students", plural), so "were" is correct.'
  },
  {
    id: 'va-4',
    category: 'Verbal Ability',
    question: 'Choose the correct idiom meaning: "To burn the midnight oil"',
    options: ['To waste precious time', 'To work or study late into the night', 'To be careless with fire', 'To wake up at dawn'],
    correctIndex: 1,
    explanation: '"To burn the midnight oil" means to study or work hard late into the night.'
  },
  {
    id: 'va-5',
    category: 'Verbal Ability',
    question: 'Identify the grammatically correct sentence:',
    options: [
      'Each of the candidates have submitted their resume.',
      'Each of the candidates has submitted their resume.',
      'Each of the candidates has submitted his or her resume.',
      'Each of the candidate has submitted their resume.'
    ],
    correctIndex: 2,
    explanation: '"Each" is singular and takes a singular verb "has" and singular pronoun "his or her".'
  },
  {
    id: 'va-6',
    category: 'Verbal Ability',
    question: 'Select the correctly spelled word:',
    options: ['Accomodation', 'Accommodation', 'Acommodation', 'Accomadation'],
    correctIndex: 1,
    explanation: 'The correct spelling is "Accommodation" with double \'c\' and double \'m\'.'
  }
];

export const subjectQuestionsBank: Record<string, { topic: string; questions: string[] }[]> = {
  'CS301': [
    {
      topic: 'Binary Search Trees & AVL Trees',
      questions: [
        'Explain the rotation mechanisms (LL, RR, LR, RL) in AVL tree self-balancing with illustrative diagrams.',
        'Compare the average and worst-case time complexities of insertion and deletion in BST vs Red-Black Trees.',
        'Write an algorithm to find the Lowest Common Ancestor (LCA) in a Binary Search Tree.'
      ]
    },
    {
      topic: 'Graph Algorithms & Shortest Path',
      questions: [
        'Illustrate Dijkstra\'s Single Source Shortest Path Algorithm on a directed weighted graph. State why it fails for negative edge weights.',
        'Differentiate between Prim\'s and Kruskal\'s Minimum Spanning Tree algorithms with their time complexities.',
        'Explain Breadth First Search (BFS) and Depth First Search (DFS) with recursive and iterative implementations.'
      ]
    },
    {
      topic: 'Dynamic Programming',
      questions: [
        'Formulate the optimal substructure and overlapping subproblems for the 0/1 Knapsack Problem and provide the dynamic programming table.',
        'Explain Matrix Chain Multiplication and show how memoization prevents exponential recursive calls.'
      ]
    }
  ],
  'CS302': [
    {
      topic: 'Normalization & Functional Dependencies',
      questions: [
        'State Armstrong\'s Axioms and prove how extraneous attributes can be eliminated from functional dependencies.',
        'Explain 1NF, 2NF, 3NF and BCNF with a real-world student-enrollment relation example showing anomaly elimination.',
        'What is Lossless Join Decomposition and Dependency Preservation? How are they verified?'
      ]
    },
    {
      topic: 'Transaction Processing & Concurrency',
      questions: [
        'Explain the ACID properties of database transactions and describe how WAL (Write-Ahead Logging) ensures Durability.',
        'Detail Two-Phase Locking (2PL) protocol, Strict 2PL, and Rigorous 2PL with their conflict serializability guarantees.',
        'How does deadlock detection work in DBMS? Explain the Wait-For Graph (WFG) method.'
      ]
    }
  ],
  'CS303': [
    {
      topic: 'Process Scheduling & Synchronization',
      questions: [
        'Solve Peterson\'s algorithm for mutual exclusion between two cooperating processes. Prove how it satisfies all three critical-section requirements.',
        'Explain CPU Scheduling algorithms (Round Robin, SRTF, Priority) and calculate average waiting time for given burst times.',
        'What are Semaphores? Distinguish between binary and counting semaphores with the Producer-Consumer problem.'
      ]
    },
    {
      topic: 'Deadlocks & Memory Management',
      questions: [
        'State the four necessary conditions for deadlock. Demonstrate Banker\'s Algorithm for deadlock avoidance with safe state analysis.',
        'Explain Paging vs Segmentation. How does the Translation Lookaside Buffer (TLB) accelerate virtual address translation?'
      ]
    }
  ]
};

export const paperAnalysisData = [
  {
    subject: 'Data Structures & Algorithms (CS301)',
    frequencyScore: 'Very High',
    topRepeatedTopics: [
      { topic: 'AVL Tree Rotations & Balance Factor', appearanceCount: '5 / 5 past exams', weight: '22%' },
      { topic: 'Dijkstra Algorithm vs Bellman-Ford', appearanceCount: '4 / 5 past exams', weight: '18%' },
      { topic: '0/1 Knapsack & Dynamic Programming', appearanceCount: '4 / 5 past exams', weight: '16%' },
      { topic: 'B-Tree insertion & deletion steps', appearanceCount: '3 / 5 past exams', weight: '14%' },
      { topic: 'QuickSort Partitioning & Master Theorem', appearanceCount: '3 / 5 past exams', weight: '12%' }
    ],
    examTip: 'Questions from Unit 3 (Trees) and Unit 4 (Graphs) carry 45% of the aggregate marks in both Mid-Term and Final exams.'
  },
  {
    subject: 'Database Management Systems (CS302)',
    frequencyScore: 'High',
    topRepeatedTopics: [
      { topic: 'BCNF vs 3NF Decomposition Anomalies', appearanceCount: '5 / 5 past exams', weight: '25%' },
      { topic: 'Strict Two-Phase Locking & Serializability', appearanceCount: '4 / 5 past exams', weight: '20%' },
      { topic: 'B+ Tree Indexing vs Hash Indexing', appearanceCount: '4 / 5 past exams', weight: '18%' },
      { topic: 'SQL Complex Joins, Group By, Subqueries', appearanceCount: '5 / 5 past exams', weight: '15%' },
      { topic: 'ER to Relational Schema Conversion', appearanceCount: '3 / 5 past exams', weight: '12%' }
    ],
    examTip: 'Normalization numerical problems have appeared consistently in Part B of every examination paper since 2021.'
  },
  {
    subject: 'Operating Systems (CS303)',
    frequencyScore: 'Very High',
    topRepeatedTopics: [
      { topic: 'Banker\'s Algorithm Safe State Matrices', appearanceCount: '5 / 5 past exams', weight: '24%' },
      { topic: 'Page Replacement Algorithms (LRU, Optimal)', appearanceCount: '5 / 5 past exams', weight: '20%' },
      { topic: 'Dining Philosophers / Reader-Writer Problem', appearanceCount: '4 / 5 past exams', weight: '18%' },
      { topic: 'Round Robin & Multilevel Queue Scheduling', appearanceCount: '3 / 5 past exams', weight: '15%' },
      { topic: 'Virtual Memory Paging & TLB Hit Ratio', appearanceCount: '3 / 5 past exams', weight: '13%' }
    ],
    examTip: 'Practice the Resource Allocation Graph and Banker\'s safety numericals to score guaranteed full marks.'
  }
];
