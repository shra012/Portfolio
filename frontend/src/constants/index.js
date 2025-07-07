import {
  mobile,
  backend,
  creator,
  web,
  airflow,
  ansible,
  bigquery,
  chromadb,
  docker,
  elasticsearch,
  expressjs,
  fastapi,
  flask,
  github,
  insomnia,
  javascript,
  jenkins,
  jupyter,
  kubernetes,
  java,
  kafka,
  kong,
  matplotlib,
  mongodb,
  nextjs,
  nodejs,
  numpy,
  openai,
  pandas,
  pinecone,
  pytorch,
  python,
  reactjs,
  redshift,
  scikitlearn,
  spark,
  springboot,
  sql,
  terraform,
  tailwind,
  spartan,
  sastra,
  bny,
  elsevier,
  tcs,
  cts,
  accenture,
  ClaimsGuard,
} from "../assets";

export const navLinks = [
  {
    id: "about",
    title: "About",
  },
  {
    id: "work",
    title: "Work",
  },
  {
    id: "contact",
    title: "Contact",
  },
];

const services = [
  {
    title: "Web Developer",
    icon: web,
    link: "https://github.com/shra012",
  },
  {
    title: "Data Structures & Algorithms",
    icon: mobile,
    link: "https://takeuforward.org/plus/profile/shra012",
  },
  {
    title: "Backend Developer",
    icon: backend,
    link: "https://github.com/shra012",
  },
  {
    title: "LinkedIn",
    icon: creator,
    link: "https://www.linkedin.com/in/shravan-kumar12",
  },
];

export const technologies = [
  // Data Science & AI
  { name: "Java", icon: java },
  { name: "Spring Boot", icon: springboot },
  { name: "Python", icon: python },
  { name: "Pandas", icon: numpy },
  { name: "NumPy", icon: pandas },
  { name: "Matplotlib", icon: matplotlib },
  { name: "Jupyter", icon: jupyter },
  { name: "Scikit-learn", icon: scikitlearn },
  { name: "PyTorch", icon: pytorch },
  { name: "OpenAI", icon: openai },
  { name: "Pinecone", icon: pinecone },
  { name: "ChromaDB", icon: chromadb },

  // Frontend
  { name: "JavaScript", icon: javascript },
  { name: "React", icon: reactjs },
  { name: "Tailwind CSS", icon: tailwind },

  // Tools & Platforms
  { name: "Airflow", icon: airflow },
  { name: "Kafka", icon: kafka },
  { name: "Spark", icon: spark },
  { name: "Kong", icon: kong },
  { name: "Ansible", icon: ansible },
  { name: "Terraform", icon: terraform },
  { name: "Docker", icon: docker },
  { name: "Kubernetes", icon: kubernetes },
  { name: "Jenkins", icon: jenkins },
  { name: "GitHub", icon: github },
  { name: "Insomnia", icon: insomnia },

  // Backend & Databases
  { name: "Node.js", icon: nodejs },
  { name: "FastAPI", icon: fastapi },
  { name: "Flask", icon: flask },
  { name: "Express.js", icon: expressjs },
  { name: "MongoDB", icon: mongodb },
  { name: "MySQL", icon: sql },
  { name: "Elasticsearch", icon: elasticsearch },
  { name: "Redshift", icon: redshift },
  { name: "BigQuery", icon: bigquery },
];

const experiences = [
  {
    title: "Master’s Student, Applied Data Intelligence",
    company_name: "San Jose State University",
    icon: spartan,
    iconBg: "#1A237E",
    date: "January 2025 - December 2026",
    points: [
      "Pursuing advanced education in applied data analytics and machine learning with focus on intelligent system design.",
      "Special interest in statistical modeling, ML pipelines, and engineering systems that solve real-world problems."
    ],
  },
  {
    title: "Lead Full Stack Developer",
    company_name: "Bank of New York Mellon",
    icon: bny,
    iconBg: "#FFFFFF",
    date: "September 2022 - January 2025",
    points: [
      "Led development of automated client-facing portals for ticketing, workflow orchestration, and operations reporting—cutting manual support effort by 40%.",
      "Built scalable full-stack systems with ReactJS, Flask, Spring Boot, and Express, handling 10K+ monthly interactions.",
      "Engineered an automated infrastructure deployment framework with Ansible, Terraform, and Bash, reducing release cycles by 60%.",
      "Designed a real-time infrastructure metrics warehouse with live observability, reducing root cause analysis time by 50%.",
      "Containerized legacy services using Docker, increasing uptime by 45% and deployment reliability."
    ],
  },
  {
    title: "Senior Software Engineer",
    company_name: "Elsevier",
    icon: elsevier,
    iconBg: "#FFFFFF",
    date: "July 2020 - September 2022",
    points: [
      "Built high-volume data pipelines to Elasticsearch from Kafka, SQS, Kinesis, and APIs, ingesting 10M+ documents daily.",
      "Developed a semantic search API with entity recognition and relevance tuning—cutting 'no result' queries by 45%.",
      "Created a reviewer recommendation system based on profile and topic similarity, streamlining editorial workflows.",
      "Owned CI/CD workflows using Jenkins and Terraform for EKS, reducing deployment time by 60%."
    ],
  },
  {
    title: "Senior Software Engineer",
    company_name: "Accenture",
    icon: accenture,
    iconBg: "#FFFFFF",
    date: "August 2019 - July 2020",
    points: [
      "Designed and built microservices using Spring Boot, Spring Cloud Gateway, Eureka, Kafka, and Vault.",
      "Built end-to-end Spring-Python integration by migrating core systems to Flask and Cassandra for performance gain.",
      "Delivered full-stack React and Spring Boot solutions to monitor network interruptions, with robust telemetry and CI/CD automation."
    ],
  },
  {
    title: "Associate (Product Specialist)",
    company_name: "Cognizant",
    icon: cts,
    iconBg: "#383E56",
    date: "March 2018 - August 2019",
    points: [
      "Developed insurance workflows using Guidewire InsuranceNow for policy lifecycle transactions across LoBs.",
      "Built frontend features with Angular/jQuery and backend services with a custom servlet-based engine similar to Spring MVC.",
      "Implemented session handling, validation, caching, and REST interfaces in-house."
    ],
  },
  {
    title: "System Engineer",
    company_name: "Tata Consultancy Services",
    icon: tcs,
    iconBg: "#FFFFFF",
    date: "May 2015 - March 2018",
    points: [
      "Rebuilt legacy SOAP-based APIs as modern RESTful services backed by Oracle and Elasticsearch.",
      "Enhanced data access by integrating Terracotta-based caching and optimizing Spring Batch jobs for distributed processing.",
      "Orchestrated event-driven execution using Spring Integration and Quartz Scheduler."
    ],
  },
  {
    title: "Bachelor of Technology, Mechanical Engineering",
    company_name: "SASTRA University",
    icon: sastra,
    iconBg: "#FFFFFF",
    date: "June 2011 - April 2015",
    points: [
      "Built strong engineering fundamentals and developed deep interest in programming during the final semester.",
      "Worked at the university café and gained early experience in responsibility and team collaboration."
    ],
  }
];

const projects = [
  {
    name: "ClaimsGuard.ai",
    description:
      "ClaimsGuard.ai is a React-based web application designed to streamline the process of validating medical claim codes. The application allows users to input claim data in JSON format, parse and validate the claims, and receive instant feedback on the validation results.",
    tags: [
      {
        name: "react",
        color: "blue-text-gradient",
      },
      {
        name: "python",
        color: "green-text-gradient",
      },
      {
        name: "pinecone",
        color: "orange-text-gradient",
      },
      {
        name: "chromadb",
        color: "pink-text-gradient",
      },
      {
        name: "openai",
        color: "black-text-gradient"
      }
    ],
    image: ClaimsGuard,
    source_code_link: "https://github.com/shra012/Commure-Hackathon",
    live_demo_link: "devpost.com/software/claimguardians",
  }
];

export { services, experiences, projects };
