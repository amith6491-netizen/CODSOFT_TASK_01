/**
 * Official Curriculum & Degree Courses Master Configuration
 * Includes Undergraduate (UG) & Postgraduate (PG) Programs and Year-wise Subjects.
 */

export interface YearCurriculum {
  year: number;
  className: string;
  subjects: string[];
}

export interface DegreeProgram {
  level: "UG" | "PG";
  code: string;
  name: string;
  fullTitle: string;
  years: YearCurriculum[];
}

export const DEGREE_PROGRAMS: DegreeProgram[] = [
  // =========================================================================
  // UNDERGRADUATE (UG) DEGREE COURSES
  // =========================================================================
  {
    level: "UG",
    code: "BTECH_CSE",
    name: "B.Tech CSE",
    fullTitle: "Bachelor of Technology in Computer Science & Engineering",
    years: [
      {
        year: 1,
        className: "UG - B.Tech CSE (Year 1)",
        subjects: [
          "Engineering Mathematics I",
          "Engineering Physics",
          "Engineering Chemistry",
          "Programming in C / Python",
          "Basic Electrical Engineering",
          "Engineering Graphics",
          "Communication Skills",
          "Environmental Science",
        ],
      },
      {
        year: 2,
        className: "UG - B.Tech CSE (Year 2)",
        subjects: [
          "Data Structures",
          "Object-Oriented Programming",
          "Discrete Mathematics",
          "Computer Organization & Architecture",
          "Database Management Systems",
          "Operating Systems",
          "Probability & Statistics",
        ],
      },
      {
        year: 3,
        className: "UG - B.Tech CSE (Year 3)",
        subjects: [
          "Computer Networks",
          "Design & Analysis of Algorithms",
          "Software Engineering",
          "Theory of Computation",
          "Web Technologies",
          "Artificial Intelligence",
          "Machine Learning",
        ],
      },
      {
        year: 4,
        className: "UG - B.Tech CSE (Year 4)",
        subjects: [
          "Cloud Computing",
          "Cyber Security",
          "Distributed Systems",
          "Big Data Analytics",
          "Internet of Things",
          "Project / Major Project",
          "Internship",
        ],
      },
    ],
  },
  {
    level: "UG",
    code: "BTECH_ECE",
    name: "B.Tech ECE",
    fullTitle: "Bachelor of Technology in Electronics & Communication Engineering",
    years: [
      {
        year: 1,
        className: "UG - B.Tech ECE (Year 1)",
        subjects: [
          "Engineering Mathematics",
          "Engineering Physics",
          "Engineering Chemistry",
          "Programming Fundamentals",
          "Basic Electrical Engineering",
          "Engineering Graphics",
          "Communication Skills",
        ],
      },
      {
        year: 2,
        className: "UG - B.Tech ECE (Year 2)",
        subjects: [
          "Electronic Devices & Circuits",
          "Digital Electronics",
          "Signals & Systems",
          "Network Theory",
          "Analog Electronics",
          "Microprocessors & Microcontrollers",
          "Electromagnetic Theory",
        ],
      },
      {
        year: 3,
        className: "UG - B.Tech ECE (Year 3)",
        subjects: [
          "Digital Signal Processing",
          "Communication Systems",
          "Control Systems",
          "VLSI Design",
          "Embedded Systems",
          "Antenna & Wave Propagation",
          "Computer Architecture",
        ],
      },
      {
        year: 4,
        className: "UG - B.Tech ECE (Year 4)",
        subjects: [
          "Wireless Communication",
          "Optical Communication",
          "IoT",
          "Microwave Engineering",
          "Robotics",
          "Project / Major Project",
          "Internship",
        ],
      },
    ],
  },
  {
    level: "UG",
    code: "BCA",
    name: "BCA",
    fullTitle: "Bachelor of Computer Applications",
    years: [
      {
        year: 1,
        className: "UG - BCA (Year 1)",
        subjects: [
          "Computer Fundamentals",
          "Programming in C",
          "Mathematics",
          "Digital Computer Fundamentals",
          "Database Fundamentals",
          "Communication Skills",
          "Web Technologies",
        ],
      },
      {
        year: 2,
        className: "UG - BCA (Year 2)",
        subjects: [
          "Data Structures",
          "Object-Oriented Programming",
          "DBMS",
          "Operating Systems",
          "Computer Networks",
          "Software Engineering",
          "Java Programming",
        ],
      },
      {
        year: 3,
        className: "UG - BCA (Year 3)",
        subjects: [
          "Web Development",
          "Python Programming",
          "Cloud Computing",
          "Cyber Security",
          "Data Analytics",
          "Mobile Application Development",
          "Project",
        ],
      },
    ],
  },
  {
    level: "UG",
    code: "BSC_CS",
    name: "B.Sc Computer Science",
    fullTitle: "Bachelor of Science in Computer Science",
    years: [
      {
        year: 1,
        className: "UG - B.Sc Computer Science (Year 1)",
        subjects: [
          "Programming in C",
          "Computer Fundamentals",
          "Mathematics",
          "Digital Logic",
          "Data Structures",
          "Communication Skills",
          "Computer Organization",
        ],
      },
    ],
  },
  {
    level: "UG",
    code: "BCOM",
    name: "B.Com",
    fullTitle: "Bachelor of Commerce",
    years: [
      {
        year: 1,
        className: "UG - B.Com (Year 1)",
        subjects: [
          "Financial Accounting",
          "Business Economics",
          "Business Organization & Management",
          "Business Communication",
          "Business Mathematics",
          "Principles of Marketing",
          "Environmental Studies",
        ],
      },
    ],
  },
  {
    level: "UG",
    code: "BBA",
    name: "BBA",
    fullTitle: "Bachelor of Business Administration",
    years: [
      {
        year: 1,
        className: "UG - BBA (Year 1)",
        subjects: [
          "Principles of Management",
          "Business Economics",
          "Financial Accounting",
          "Business Communication",
          "Business Mathematics",
          "Organizational Behaviour",
          "Marketing Management",
        ],
      },
    ],
  },

  // =========================================================================
  // POSTGRADUATE (PG) DEGREE COURSES
  // =========================================================================
  {
    level: "PG",
    code: "MCA",
    name: "MCA",
    fullTitle: "Master of Computer Applications",
    years: [
      {
        year: 1,
        className: "PG - MCA (Year 1)",
        subjects: [
          "Advanced Programming",
          "Data Structures & Algorithms",
          "Advanced Database Management Systems",
          "Operating Systems",
          "Computer Networks",
          "Software Engineering",
          "Web Technologies",
          "Artificial Intelligence",
        ],
      },
      {
        year: 2,
        className: "PG - MCA (Year 2)",
        subjects: [
          "Machine Learning",
          "Cloud Computing",
          "Cyber Security",
          "Big Data Analytics",
          "Mobile Application Development",
          "Distributed Computing",
          "Project / Dissertation",
        ],
      },
    ],
  },
  {
    level: "PG",
    code: "MBA",
    name: "MBA",
    fullTitle: "Master of Business Administration",
    years: [
      {
        year: 1,
        className: "PG - MBA (Year 1)",
        subjects: [
          "Principles of Management",
          "Organizational Behaviour",
          "Managerial Economics",
          "Financial Management",
          "Marketing Management",
          "Human Resource Management",
          "Business Statistics",
          "Operations Management",
          "Business Research Methods",
        ],
      },
      {
        year: 2,
        className: "PG - MBA (Year 2)",
        subjects: [
          "Strategic Management",
          "Entrepreneurship",
          "Business Analytics",
          "Project Management",
          "International Business",
          "Digital Marketing",
          "Electives / Specialization",
          "Project / Internship",
        ],
      },
    ],
  },
  {
    level: "PG",
    code: "MTECH_CSE",
    name: "M.Tech CSE",
    fullTitle: "Master of Technology in Computer Science & Engineering",
    years: [
      {
        year: 1,
        className: "PG - M.Tech CSE (Year 1)",
        subjects: [
          "Advanced Data Structures",
          "Advanced Algorithms",
          "Advanced Operating Systems",
          "Advanced Computer Networks",
          "Advanced Database Systems",
          "Distributed Systems",
          "Machine Learning",
          "Research Methodology",
        ],
      },
      {
        year: 2,
        className: "PG - M.Tech CSE (Year 2)",
        subjects: [
          "Artificial Intelligence",
          "Cloud Computing",
          "Cyber Security",
          "Big Data Analytics",
          "Advanced Topics in Computing",
          "Seminar",
          "Thesis / Dissertation",
          "Project",
        ],
      },
    ],
  },
  {
    level: "PG",
    code: "MSC_DS",
    name: "M.Sc Data Science",
    fullTitle: "Master of Science in Data Science",
    years: [
      {
        year: 1,
        className: "PG - M.Sc Data Science (Year 1)",
        subjects: [
          "Probability & Statistics",
          "Python for Data Science",
          "Data Structures & Algorithms",
          "Database Management Systems",
          "Data Visualization",
          "Machine Learning",
          "Statistical Computing",
          "Big Data Analytics",
          "Artificial Intelligence",
          "Data Mining",
        ],
      },
    ],
  },
];

/**
 * Returns subjects for a given class name (e.g. "UG - B.Tech CSE (Year 1)")
 * Performs case-insensitive matching and fuzzy normalization.
 */
export function getSubjectsForClassName(className: string): string[] {
  if (!className) return [];
  const normalized = className.trim().toLowerCase();

  for (const prog of DEGREE_PROGRAMS) {
    for (const yr of prog.years) {
      if (yr.className.toLowerCase() === normalized) {
        return yr.subjects;
      }
    }
  }

  // Fallback fuzzy search: check if both program name and year are present
  for (const prog of DEGREE_PROGRAMS) {
    const progMatch = normalized.includes(prog.name.toLowerCase());
    if (progMatch) {
      for (const yr of prog.years) {
        if (
          normalized.includes(`year ${yr.year}`) ||
          normalized.includes(`yr ${yr.year}`) ||
          normalized.includes(`(year ${yr.year})`)
        ) {
          return yr.subjects;
        }
      }
      return prog.years[0]?.subjects || [];
    }
  }

  // Fallbacks for related degree variants
  if (normalized.includes("m.sc computer science") || normalized.includes("msc computer science")) {
    return [
      "Advanced Data Structures",
      "Advanced Algorithms",
      "Advanced Operating Systems",
      "Advanced Database Systems",
      "Advanced Computer Networks",
      "Machine Learning",
    ];
  }
  if (normalized.includes("b.sc data science") || normalized.includes("bsc data science")) {
    return [
      "Probability & Statistics",
      "Python for Data Science",
      "Data Structures & Algorithms",
      "Database Management Systems",
      "Data Visualization",
      "Mathematics",
    ];
  }

  return [];
}

/**
 * Returns all distinct classes configured in the official curriculum
 */
export function getAllCurriculumClasses(): { name: string; gradeYear: number; level: "UG" | "PG" }[] {
  const result: { name: string; gradeYear: number; level: "UG" | "PG" }[] = [];
  for (const prog of DEGREE_PROGRAMS) {
    for (const yr of prog.years) {
      result.push({
        name: yr.className,
        gradeYear: yr.year,
        level: prog.level,
      });
    }
  }
  return result;
}
