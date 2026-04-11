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
    id: "blog",
    title: "Blog",
    url: "/blog"
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
    link: "https://takeuforward.org/profile/shra012",
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
  { name: "Pandas", icon: pandas },
  { name: "NumPy", icon: numpy },
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
    title: "Master's Student, Applied Data Intelligence",
    company_name: "San Jose State University",
    icon: spartan,
    iconBg: "#1A237E",
    date: "January 2025 - December 2026",
    points: [
      "Coursework: Machine Learning, Deep Learning, Generative AI, Agentic AI, Big Data Algorithms, Distributed Systems, Data Warehousing, and Data Analysis.",
      "Served as an ISA for Data 220 Mathematics for Data Analytics, Data 228 Big Data, Data 226 Data Warehousing and Pipelines, and CMPE 172 Enterprise Software Systems.",
      "Applying these foundations to projects and research in LLMs, retrieval-augmented generation, semantic search, and autonomous agent workflows."
    ],
  },
  {
    title: "Lead Full Stack Developer",
    company_name: "The Bank of New York Mellon",
    icon: bny,
    iconBg: "#FFFFFF",
    date: "September 2022 - January 2025",
    points: [
      "Created micro-frontends and middleware with React, GraphQL, Next.js, and Express.js to automate cloud provisioning, aggregate infrastructure metrics, and trigger Bash, Ansible, and Terraform workflows.",
      "Architected microservices with Spring Boot, Spring Data, and Spring Cloud (Eureka, Config Server, Consul) and automated CI/CD plus infrastructure provisioning using Ansible and HashiCorp tools like Packer and Terraform.",
      "Contributed to R&D design of a multi-agent autonomous operations system and developed XGBoost, Autoencoder, and LSTM models using PyTorch and scikit-learn for capacity forecasting and anomaly detection, reducing false alerts by 35%."
    ],
  },
  {
    title: "Senior Software Engineer",
    company_name: "Elsevier",
    icon: elsevier,
    iconBg: "#FFFFFF",
    date: "July 2020 - September 2022",
    points: [
      "Ingested 12TB of scholarly content from S3 using PySpark with Groovy, Kafka, and Kafka Connect into Elasticsearch, enabling sub-500 ms semantic search across 10M documents per day for Scopus and Mendeley researchers.",
      "Integrated monitoring and testing frameworks to harden a star schema in AWS Redshift, improving data quality and reliability while reducing operational overhead.",
      "Created a reviewer-recommender system that ranks peer reviewers with weighted scoring, built with FastAPI, MongoDB, and PostgreSQL, and deployed via Jenkins pipelines."
    ],
  },
  {
    title: "Senior Software Engineer",
    company_name: "Accenture",
    icon: accenture,
    iconBg: "#FFFFFF",
    date: "August 2019 - July 2020",
    points: [
      "Produced 15+ microservices and 5+ micro-frontends for network monitoring using Scala, Shell Scripts, React, and Kafka, with end-to-end CI/CD via Concourse.",
      "Built graph-based services on DataStax Enterprise Graph and Cassandra to process millions of events per day, integrating Prometheus, Grafana, and Alerta for real-time telemetry.",
      "Delivered resilient observability and automation workflows that improved availability and reduced MTTR."
    ],
  },
  {
    title: "Associate",
    company_name: "Cognizant",
    icon: cts,
    iconBg: "#383E56",
    date: "March 2018 - August 2019",
    points: [
      "Delivered an insurance suite with Guidewire InsuranceNow and built UI modules with jQuery and Angular for policy lifecycle workflows.",
      "Led migration from Maven to Gradle and created a metrics framework to guide feature investments and surface enhancement opportunities.",
      "Supported backend and interface work across transactional insurance flows and internal delivery tooling."
    ],
  },
  {
    title: "Systems Engineer",
    company_name: "Tata Consultancy Services",
    icon: tcs,
    iconBg: "#FFFFFF",
    date: "May 2015 - March 2018",
    points: [
      "Migrated a large retail platform from SOAP to REST APIs, cutting 99th-percentile latency to under 200 ms and doubling throughput through optimized Oracle PL/SQL queries and distributed caching.",
      "Improved batch and event processing speed by adding multithreading and distributed microservices with Spring Batch Integration, reducing job completion times.",
      "Worked across legacy modernization and enterprise integration layers with a focus on reliability and throughput."
    ],
  }
  ,
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
    live_demo_link: "https://devpost.com/software/claimguardians",
  }
];

export { services, experiences, projects };
